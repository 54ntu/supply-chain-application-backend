const express = require("express");
const { UserController } = require("../controller/user.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { accountLocked } = require("../middleware/accountLocked.middleware");
const distributorRouter = express.Router();

distributorRouter
  .route("/signup")
  .post(upload.single("image"), UserController.singupDistributor);
distributorRouter.route("/verify-otp").post(UserController.verifyOtp);
distributorRouter.route("/signin").post(accountLocked, UserController.login);
distributorRouter
  .route("/logout")
  .post(UserMiddleware.isUserLoggedIn, UserController.logout);

distributorRouter
  .route("/forgot-password")
  .post(UserController.handleForgotPassword);

distributorRouter.route("/reset-link").post(UserController.verifyResetLink);
distributorRouter.route("/resetPassword").post(UserController.resetPassword);

module.exports = {
  distributorRouter,
};
