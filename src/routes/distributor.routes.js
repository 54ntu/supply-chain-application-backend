const express = require("express");
const { UserController } = require("../controller/user.controller");
const { upload } = require("../middleware/multer.middleware");
const distributorRouter = express.Router();

distributorRouter
  .route("/signup")
  .post(upload.single("image"), UserController.singupDistributor);
distributorRouter.route("/verify-otp").post(UserController.verifyOtp);
distributorRouter.route("/signin").post(UserController.login);

module.exports = {
  distributorRouter,
};
