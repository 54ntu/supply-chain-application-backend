const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { RefundController } = require("../controller/refund.controller");
const refundRouter = express.Router();

refundRouter
  .route("/:id")
  .post(UserMiddleware.isUserLoggedIn, RefundController.createRefundRequest)
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    RefundController.findRefundRequestDataById
  );

refundRouter
  .route("/")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    RefundController.getRefundRequestData
  );

module.exports = {
  refundRouter,
};
