const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { SettingsController } = require("../controller/settings.controller");
const settingRouter = express.Router();

settingRouter
  .route("/change-password")
  .patch(UserMiddleware.isUserLoggedIn, SettingsController.changePassword);

settingRouter
  .route("/updateprofile")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SettingsController.updateProfile
  );
settingRouter
  .route("/notification-update")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SettingsController.udateNotificationSettings
  );
module.exports = {
  settingRouter,
};
