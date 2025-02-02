const { Notification } = require("../models/notification.models");
const createNotification = async (userId, type, title, message) => {
  await Notification.create({
    userId,
    type,
    title,
    message,
  });
};

module.exports = {
  createNotification,
};
