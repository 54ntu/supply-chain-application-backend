const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  SubscriptionOrderController,
} = require("../controller/subscriptionOrder");
const subscriptionOrderRouter = express.Router();

subscriptionOrderRouter
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SubscriptionOrderController.createSubscriptionOrder
  );
subscriptionOrderRouter
  .route("/verify-pidx")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SubscriptionOrderController.verifypayment
  );

module.exports = {
  subscriptionOrderRouter,
};
