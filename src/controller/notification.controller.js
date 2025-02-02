const { Notification } = require("../models/notification.models");
const { NotificationSetting } = require("../models/notificationSetting.models");
const { sendmail } = require("../services/sendMail");
const { ApiResponse } = require("../services/ApiResponse");

class NotificationController {
  static async getNotification(req, res) {
    //get the userid and usertype i.e. role from the req.user
    //find the user notification settings
    //if nothing found in notification settings then just throw the error
    //then create an array and push all the allow settings into that array
    //fetch notification message based on allowed types i.e. notification settings of the user
    //return success message
    try {
      const userId = req.user._id; //get user id from the middleware (req.user)
      const userType = req.user.role; //get user role from the middleware

      //fetch the notification settings based on the userId and userType
      const settings = await NotificationSetting.findOne({ userId, userType });

      //check if settings found or not
      if (!settings) {
        return res.status(404).json({
          success: false,
          message: "Notification settings not found",
        });
      }

      //if notifications settings are true then store that settings into the array
      let notificationAllowed = [];
      if (settings.order) notificationAllowed.push("order");
      if (settings.stock) notificationAllowed.push("stock");
      if (settings.restock_remainder)
        notificationAllowed.push("restock_remainder");

      //fetch the notification messages from the notification collection based on the userid,usertype or role and notification settings
      const notifications = await Notification.find({
        userId,
        userType,
        type: { $in: notificationAllowed },
      }).sort({ createdAt: -1 });

      //check if email notification is on
      if (settings.emailNotifications) {
        //fetch the email from req.user
        const userEmail = req.user.email;
        if (notifications.length > 0) {
          await sendmail({
            to: userEmail,
            text: "you have new notifications",
            subject: notifications,
          });
        }
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            notifications,
            "notifications fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "something went wrong",
      });
    }
  }

  static async updateNotification(req, res) {}
}

module.exports = {
  NotificationController,
};
