const { Subscription } = require("../models/subscription.models");
const { paymentMethods } = require("../global");
const { default: axios } = require("axios");
class SubscriptionOrderController {
  static async createSubscriptionOrder(req, res) {
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

      let total_amount = amount - tax;
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
          amount: amount * 100,
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
    console.log(typeof pidx);
  }
}

module.exports = {
  SubscriptionOrderController,
};
