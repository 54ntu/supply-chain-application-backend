const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { OrderController } = require("../controller/order.controller");
const distributorOrderRouter = express.Router();

distributorOrderRouter
  .route("/order-distributor")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    OrderController.getOrderByDistributor
  );

module.exports = {
  distributorOrderRouter,
};
