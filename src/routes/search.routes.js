const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ProductController } = require("../controller/product.controller");
const searchRouter = express.Router();

searchRouter
  .route("/searchproduct")
  .get(UserMiddleware.isUserLoggedIn, ProductController.searchProduct);

module.exports = {
  searchRouter,
};
