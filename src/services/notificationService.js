const { Notification } = require("../models/notification.models");
const createNotification = async (data) => {
  // console.log(data);
  await Notification.create({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
  });
};

module.exports = {
  createNotification,
};
