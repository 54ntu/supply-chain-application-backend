const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { OrderController } = require("../controller/order.controller");
const orderRouter = express.Router();

orderRouter
  .route("/")
  .post(UserMiddleware.isUserLoggedIn, OrderController.createOrder)
  .get(UserMiddleware.isUserLoggedIn, OrderController.getOrder);

orderRouter
  .route("/:id")
  .get(UserMiddleware.isUserLoggedIn, OrderController.getOrderByid);

module.exports = { orderRouter };
