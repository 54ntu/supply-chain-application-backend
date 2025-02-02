const express = require("express");
const { UserController } = require("../controller/user.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const distributorRouter = express.Router();

distributorRouter
  .route("/signup")
  .post(upload.single("image"), UserController.singupDistributor);
distributorRouter.route("/verify-otp").post(UserController.verifyOtp);
distributorRouter.route("/signin").post(UserController.login);
distributorRouter
  .route("/logout")
  .post(UserMiddleware.isUserLoggedIn, UserController.logout);

module.exports = {
  distributorRouter,
};
