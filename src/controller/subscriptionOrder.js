const { Subscription } = require("../models/subscription.models");
const { paymentMethods, subscriptionType } = require("../global");
const { default: axios } = require("axios");
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

      console.log(createSubscriptOrder);

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
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }

  static async verifypayment(req, res) {
    //get the pidx from the req.body
    const { pidx } = req.body;
    // console.log(typeof pidx);

    try {
      //send the post request to the khalti payment verification url
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
      const khaltiresponse = response.data;
      let durationMonths = 0;

      //update the isSubscribed field in subscription to true and also update the endate of the subscription if the khaltriresponse payment status is completed
      if (khaltiresponse.status == "Completed") {
        const findsubscriptionByPidx = await Subscription.findOne({
          pidx: pidx,
        });
        // console.log(findsubscriptionByPidx);

        if (!findsubscriptionByPidx) {
          return res.status(500).json({
            success: false,
            message: `subscription order of pidx ${pidx} not found`,
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
        message: "something went wrong",
      });
    }
  }

  static async getCurrentPlan(req, res) {
    //logged in hunuparyo distributor or salesperson
    const distributorid = req.user._id;
    if (!distributorid) {
      return res.status(400).json({
        success: false,
        message: "user id is required",
      });
    }

    //fetch the data from the subscription model comparing distributor id and isSubscribed status
    const currentPlan = await Subscription.findOne({ distributorId });
  }
}

module.exports = {
  SubscriptionOrderController,
};
