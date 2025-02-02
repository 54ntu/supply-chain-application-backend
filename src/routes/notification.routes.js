const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  NotificationController,
} = require("../controller/notification.controller");
const notificationRouter = express.Router();

notificationRouter
  .route("/")
  .get(UserMiddleware.isUserLoggedIn, NotificationController.getNotification);

notificationRouter
  .route("/")
  .put(
    UserMiddleware.isUserLoggedIn,
    NotificationController.updateNotification
  );

module.exports = {
  notificationRouter,
};
