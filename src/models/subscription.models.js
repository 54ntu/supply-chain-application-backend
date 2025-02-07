const mongoose = require("mongoose");
const { subscriptionType, paymentMethods } = require("../global");

const subscriptionSchema = new mongoose.Schema({
  distributorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  subscriptionType: {
    type: String,
    enum: [
      subscriptionType.MONTHLY,
      subscriptionType.QUARTERLY,
      subscriptionType.ANNUAL,
    ],
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  billingAddress: [
    {
      country: { type: String, required: true },
      zipcode: {
        type: String,
        required: true,
      },
    },
  ],

  paymentMethod: {
    type: String,
    enum: [paymentMethods.KHALTI, paymentMethods.CARD],
    required: true,
  },

  startDate: {
    type: Date,
    default: Date.now,
  },

  endDate: {
    type: Date,
  },

  isSubscribed: {
    type: Boolean,
    default: false,
  },

  pidx: {
    type: String,
  },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = {
  Subscription,
};
