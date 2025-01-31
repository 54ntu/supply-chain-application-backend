const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { SettingsController } = require("../controller/settings.controller");
const settingRouter = express.Router();

settingRouter
  .route("/change-password")
  .post(UserMiddleware.isUserLoggedIn, SettingsController.changePassword);
module.exports = {
  settingRouter,
};
