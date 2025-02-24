const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ProductController } = require("../controller/product.controller");
const { OrderController } = require("../controller/order.controller");
const searchRouter = express.Router();

searchRouter
  .route("/searchproduct")
  .get(UserMiddleware.isUserLoggedIn, ProductController.searchProduct);

searchRouter
  .route("/searchOrders")
  .get(UserMiddleware.isUserLoggedIn, OrderController.searchOrders);

module.exports = {
  searchRouter,
};
