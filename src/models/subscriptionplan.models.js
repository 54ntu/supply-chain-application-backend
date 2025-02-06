const { default: mongoose } = require("mongoose");
const { subscriptionType, billingCycle } = require("../global");

const subscriptionPlanSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      subscriptionType.MONTHLY,
      subscriptionType.QUARTERLY,
      subscriptionType.ANNUAL,
    ],
    required: true,
  },
  price: {
    type: String,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: [billingCycle.QUARTERLY, billingCycle.MONTHLY, billingCycle.ANNUAL],
    required: true,
  },
  trialdays: {
    type: Number,
    default: 0,
  },
});

const SubscriptionPlan = mongoose.model(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
module.exports = {
  SubscriptionPlan,
};
