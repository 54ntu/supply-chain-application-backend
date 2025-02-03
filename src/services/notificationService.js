const { Notification } = require("../models/notification.models");
const createNotification = async (userId, userType, type, title, message) => {
  await Notification.create({
    userId,
    userType,
    type,
    title,
    message,
  });
};

module.exports = {
  createNotification,
};
