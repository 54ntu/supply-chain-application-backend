const express = require("express");
const { chatRateLimiter } = require("../middleware/chatlimiter.middleware");
const { check } = require("express-validator");
const { ChatbotController } = require("../controller/chatbot.controller");
const chatbotRouter = express.Router();

chatbotRouter.route("/chat").post(
  chatRateLimiter,
  [
    check("message")
      .isString() //msg must be string
      .notEmpty() // it can't be empty
      .trim() //remove the white spaces
      .escape() //remove the unwanted harmful content
      .isLength({ max: 500 }), //max legth of the message
  ],
  ChatbotController.processMessage
);

    module.exports = {
  chatbotRouter,
};
