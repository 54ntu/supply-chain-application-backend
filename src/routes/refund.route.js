const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { RefundController } = require("../controller/refund.controller");
const refundRouter = express.Router();

refundRouter
  .route("/:id")
  .post(UserMiddleware.isUserLoggedIn, RefundController.createRefundRequest);

  
module.exports = {
  refundRouter,
};
