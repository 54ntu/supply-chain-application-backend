const { Notification } = require("../models/notification.models");
const { NotificationSetting } = require("../models/notificationSetting.models");
const { sendmail } = require("../services/sendMail");
const { ApiResponse } = require("../services/ApiResponse");
const { default: mongoose } = require("mongoose");

class NotificationController {
  static async getNotification(req, res) {
    //get the userid and usertype i.e. role from the req.user
    //find the user notification settings
    //if nothing found in notification settings then just throw the error
    //then create an array and push all the allow settings into that array
    //fetch notification message based on allowed types i.e. notification settings of the user
    //return success message
    try {
      console.log("get notification maa xu hoiii");
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
      if (settings.order === true) notificationAllowed.push("order");
      if (settings.stock === true) notificationAllowed.push("stock");
      if (settings.restock_remainder === true)
        notificationAllowed.push("restock_remainder");

      if (!Array.isArray(notificationAllowed)) {
        return res.status(400).json({
          notificationAllowed,
          success: false,
        });
      }

      //fetch the notification messages from the notification collection based on the userid,usertype or role and notification settings
      const notifications = await Notification.find({
        type: { $in: notificationAllowed },
      }).sort({ createdAt: -1 });

      //check whether notifications data are found or not
      if (notifications.length === 0) {
        return res.status(404).json({
          success: false,
          message: `user with id ${userId} has following notification settings : order: ${settings.order} stock: ${settings.stock} restock_reminder:${settings.restock_remainder}`,
        });
      }

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
        message: error.message,
      });
    }
  }

  static async updateNotification(req, res) {
    //get the userid from the req.user
    //get the user type from the req.user.role
    //get the status data from the req.body

    try {
      const userId = req.user._id;
      const userType = req.user.role;

      if (!userId || !userType) {
        return res.status(400).json({
          success: false,
          message: "userid and usertype are required",
        });
      }

      const notificationToupdate = await Notification.aggregate([
        {
          $lookup: {
            from: "salespeople",
            localField: "userId",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
        {
          $match: {
            "salespersonDetails.distributor": new mongoose.Types.ObjectId(
              userId
            ),

            status: "unread",
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      // console.log(notificationToupdate);

      if (notificationToupdate.length > 0) {
        const notificationIds = notificationToupdate.map((n) => n._id);

        const updatedData = await Notification.updateMany(
          { _id: { $in: notificationIds } },
          { $set: { status: "read" } }
        );

        // console.log(updatedData);
        return res.status(200).json({
          success: true,
          message: "Notifications marked as read",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "unread notifications not found",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  NotificationController,
};
