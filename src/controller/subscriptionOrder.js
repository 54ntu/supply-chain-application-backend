const { Subscription } = require("../models/subscription.models");
const { paymentMethods, subscriptionType } = require("../global");
const { ApiResponse } = require("../services/ApiResponse");
const { default: axios } = require("axios");
const { envConfig } = require("../config/config");
const Stripe = require("stripe");
const stripe = new Stripe(envConfig.stripe_secret);
class SubscriptionOrderController {
  static async createSubscriptionOrder(req, res) {
    console.log("hitt vayo hoiii");
    //get the data from the req.body
    //get the distributor id from the req.user._id
    try {
      const { subscriptionType, amount, billingAddress, paymentMethod, tax } =
        req.body;

      const distributorId = req.user._id;

      // console.log(distributorId);
      if (!distributorId) {
        return res.status(400).json({
          success: false,
          message: "distributor id is required",
        });
      }

      let total_amount = amount + tax;
      console.log(total_amount);
      const createSubscriptOrder = await Subscription.create({
        distributorId: distributorId,
        subscriptionType,
        amount: total_amount,
        billingAddress,
        paymentMethod,
      });

      // console.log(createSubscriptOrder);

      if (paymentMethod == paymentMethods.KHALTI) {
        const data = {
          return_url: "http://localhost:5173",
          website_url: "http://localhost:5173",
          amount: total_amount * 100,
          purchase_order_id: createSubscriptOrder._id,
          purchase_order_name: "subscription" + createSubscriptOrder._id,
          // customer_info: billingAddress,
        };

        //this will give us the payment url and pidx
        const response = await axios.post(
          "https://dev.khalti.com/api/v2/epayment/initiate/",
          data,
          {
            headers: {
              Authorization: "key f1b854113d2c424f820427cadb100265",
            },
          }
        );

        // console.log(response);

        const khaltiresponse = response.data;
        createSubscriptOrder.pidx = khaltiresponse.pidx;
        await createSubscriptOrder.save();

        return res.status(200).json({
          success: true,
          data: {
            payment_url: khaltiresponse.payment_url,
            pidx: khaltiresponse.pidx,
          },
          message: "subscription created successfully",
        });
      } else if (paymentMethod == paymentMethods.STRIPE) {
        const lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: subscriptionType,
              },
              unit_amount: total_amount * 100,
            },
            quantity: 1,
          },
        ];

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          customer_email: req.user.email,
          metadata: {
            subscriptionId: createSubscriptOrder._id.toString(),
          },
          success_url: "http://localhost:5173/success",
          cancel_url: "http://localhost:5173/cancel",
        });

        createSubscriptOrder.sessionId = session.id;
        await createSubscriptOrder.save();

        return res.status(200).json({
          success: true,
          sessionId: session.id,
          url: session.url,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async verifypayment(req, res) {
    //get the pidx from the req.body
    const { pidx } = req.body;
    // console.log(typeof pidx);

    //get the session_id from req.query
    const { session_id } = req.query;

    try {
      let khaltiresponse = {};
      let session = {};
      let durationMonths = 0;

      if (pidx) {
        //send the post request to the khalti payment verification url
        try {
          const response = await axios.post(
            "https://dev.khalti.com/api/v2/epayment/lookup/",
            { pidx: pidx },
            {
              headers: {
                Authorization: "key f1b854113d2c424f820427cadb100265",
              },
            }
          );
          // console.log(response);
          khaltiresponse = response.data;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "error verifying payment with khalti",
            error: error.message,
          });
        }
      } else if (session_id) {
        try {
          //handle stripe verify-payment
          session = await stripe.checkout.sessions.retrieve(session_id);
          // console.log(`session : ${session}`);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "error verifying payment with stripe",
            error: error.message,
          });
        }
      }

      //update the isSubscribed field in subscription to true and also update the endate of the subscription if the khaltriresponse payment status is completed
      if (
        khaltiresponse?.status == "Completed" ||
        session?.payment_status === "paid"
      ) {
        const findsubscriptionByPidx = await Subscription.findOne({
          $or: [{ pidx: pidx }, { sessionId: session_id }],
        });
        // console.log(findsubscriptionByPidx);

        if (!findsubscriptionByPidx) {
          return res.status(500).json({
            success: false,
            message: `subscription order of pidx ${pidx}  or sessionId ${session_id} not found`,
          });
        }

        switch (findsubscriptionByPidx.subscriptionType) {
          case subscriptionType.MONTHLY:
            durationMonths = 1;
            break;

          case subscriptionType.QUARTERLY:
            durationMonths = 3;
            break;

          case subscriptionType.ANNUAL:
            durationMonths = 12;
            break;
          default:
            throw new Error("invalid subscriptiontype");
        }

        let enddate = new Date(findsubscriptionByPidx.startDate);
        enddate.setMonth(enddate.getMonth() + durationMonths);

        findsubscriptionByPidx.isSubscribed = true;
        findsubscriptionByPidx.endDate = enddate;
        await findsubscriptionByPidx.save();

        return res.status(200).json({
          success: true,
          findsubscriptionByPidx,
        });
      } else {
        return res.status(400).json({
          message: "payment is pending first pay the amount",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCurrentPlan(req, res) {
    //logged in hunuparyo distributor or salesperson
    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          success: false,
          message: "user id is required",
        });
      }

      //fetch the data from the subscription model comparing distributor id and isSubscribed status
      const currentPlan = await Subscription.findOne({
        distributorId: distributorid,
        isSubscribed: true,
      });

      if (!currentPlan) {
        return res.status(404).json({
          success: false,
          message: "current plan data fetched successfully",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            currentPlan,
            "current plan data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }
}

module.exports = {
  SubscriptionOrderController,
};
