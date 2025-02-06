const mongoose = require("mongoose");
const { subscriptionType, paymentMethod } = require("../global");

const subscriptionSchema = new mongoose.Schema(
  {
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
      },
      {
        zipcode: {
          type: String,
          required: true,
        },
      },
    ],

    paymentMethod: {
      type: String,
      enum: [paymentMethod.KHALTI, paymentMethod.CARD],
      required: true,
    },

    endDate: {
      type: Date,
    },

    isSubscribed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);
module.exports = {
  Subscription,
};
