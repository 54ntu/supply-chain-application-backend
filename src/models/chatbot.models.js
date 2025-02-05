const { default: mongoose } = require("mongoose");

const chatbotSchema = new mongoose.Schema(
  {
    userMessage: {
      type: String,
      required: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    intentMatched: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    sessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const chatbotIntentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  keywords: [{ type: String, required: true }],
  response: {
    type: String,
    required: true,
  },
});

const ChatInteraction = mongoose.model("ChatInteraction", chatbotSchema);
const ChatbotIntent = mongoose.model("ChatbotIntent", chatbotIntentSchema);
module.exports = {
  ChatInteraction,
  ChatbotIntent,
};
