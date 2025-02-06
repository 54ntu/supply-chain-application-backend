const express = require("express");
const {
  SubscriptionPlanController,
} = require("../controller/subscriptionPlan.controller");

const subscriptionplanRouter = express.Router();

subscriptionplanRouter
  .route("/")
  .post(SubscriptionPlanController.addSubscriptionPlan)
  .get(SubscriptionPlanController.getSubscriptionPlan);

subscriptionplanRouter
  .route("/:id")
  .delete(SubscriptionPlanController.deleteSubscriptionPlan);

module.exports = {
  subscriptionplanRouter,
};
