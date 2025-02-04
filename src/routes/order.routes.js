const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { OrderController } = require("../controller/order.controller");
const orderRouter = express.Router();

orderRouter
  .route("/")
  .post(UserMiddleware.isUserLoggedIn, OrderController.createOrder)
  .get(UserMiddleware.isUserLoggedIn, OrderController.getOrder);

module.exports = { orderRouter };
