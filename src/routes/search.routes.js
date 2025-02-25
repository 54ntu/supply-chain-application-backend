const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ProductController } = require("../controller/product.controller");
const { OrderController } = require("../controller/order.controller");
const { RefundController } = require("../controller/refund.controller");
const searchRouter = express.Router();

searchRouter
  .route("/searchproduct")
  .get(UserMiddleware.isUserLoggedIn, ProductController.searchProduct);

searchRouter
  .route("/searchOrders")
  .get(UserMiddleware.isUserLoggedIn, OrderController.searchOrders);

searchRouter
  .route("/searchReturn")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    RefundController.searchReturnRefunds
  );

module.exports = {
  searchRouter,
};
