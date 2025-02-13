const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { CustomerController } = require("../controller/customer.controller");
const salesCustomerRouter = express.Router();
salesCustomerRouter
  .route("/customerdetails")
  .get(
    UserMiddleware.isUserLoggedIn,
    CustomerController.getCustomerDetailsForSalesPerson
  );

salesCustomerRouter
  .route("/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    CustomerController.getCustomerDetailsById
  );

module.exports = {
  salesCustomerRouter,
};
