const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { ShippingAddress } = require("../controller/shippingAdress.controller");
const addressRouter = express.Router();

addressRouter
  .route("/")
  .post(UserMiddleware.isUserLoggedIn, ShippingAddress.addShippingAddress)
  .get(UserMiddleware.isUserLoggedIn, ShippingAddress.getShippingDetails);

addressRouter
  .route("/:id")
  .patch(UserMiddleware.isUserLoggedIn, ShippingAddress.updateShippingAddress)
  .delete(UserMiddleware.isUserLoggedIn, ShippingAddress.deleteShippingAddress);

module.exports = { addressRouter };
