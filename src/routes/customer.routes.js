const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { CustomerController } = require("../controller/customer.controller");
const customerRouter = express.Router();

customerRouter
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isUserLoggedIn,
    upload.single("customerImage"),
    CustomerController.addCustomer
  );

module.exports = {
  customerRouter,
};
