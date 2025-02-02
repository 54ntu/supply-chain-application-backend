const mongoose = require("mongoose");
const { UserRole } = require("../global/index");

const notificationSettingSchema = new mongoose.Schema(
  {
    orderConfirmation: {
      type: Boolean,
      default: true,
    },
    orderDelayed: {
      type: Boolean,
      default: true,
    },
    orderDelivered: {
      type: Boolean,
      default: true,
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userType",
      required: true,
    },
    userType: {
      type: String,
      enum: [UserRole.Distributor, UserRole.SalesPerson],
      required: true,
    },
  },
  { timestamps: true }
);

const NotificationSetting = mongoose.model(
  "NotificationSetting",
  notificationSettingSchema
);
module.exports = {
  NotificationSetting,
};
