const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { CustomerController } = require("../controller/customer.controller");
const customerRouter = express.Router();

customerRouter
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    upload.single("customerImage"),
    CustomerController.addCustomer
  )
  .get(UserMiddleware.isUserLoggedIn, CustomerController.getCustomer);

customerRouter
  .route("/:id")
  .get(UserMiddleware.isUserLoggedIn, CustomerController.getCustomerById)
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    upload.single("customerImage"),
    CustomerController.updateCustomer
  );

module.exports = {
  customerRouter,
};
