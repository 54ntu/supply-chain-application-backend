const { validationResult } = require("express-validator");
const chatbotServices = require("../services/chatbot.services");

class ChatbotController {
  static async processMessage(req, res) {
    try {
      //validate the input
      const errors = validationResult(req);
      if (!errors.isEmpty) {
        return res.status(400).json({
          success: false,
          message: "invalid input",
          details: errors.array(),
        });
      }
      const { message } = req.body;
      // console.log(message);
      if (!message) {
        return res.status(400).json({
          success: false,
          message: "message is required",
        });
      }

      //if message is there then process the message
      const response = await chatbotServices.processMessage(message);

      return res.json({
        originalmessage: message,
        response: response,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
        details: error.message,
      });
    }
  }
}

module.exports = {
  ChatbotController,
};
