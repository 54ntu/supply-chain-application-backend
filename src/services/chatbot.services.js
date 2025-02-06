class ChatbotService {
  constructor() {
    this.intents = {
      inventoryCheck: {
        keywords: ["inventory", "stock", "items", "product", "quantity"],
        response: (message) => {
          return "Can you please provide the product name or category for the inventory check?";
        },
      },
      orderStatus: {
        keywords: ["order", "status", "track", "shipped", "delivery"],
        response: (message) => {
          return "Please provide the order number or customer name to track the order.";
        },
      },
      shipmentTracking: {
        keywords: ["shipment", "track", "shipment number", "tracking number"],
        response: (message) => {
          return "Please provide the shipment number or tracking ID to track the shipment.";
        },
      },
      procurement: {
        keywords: ["procurement", "purchase", "buy", "suppliers"],
        response: (message) => {
          return "Do you need help with a new procurement request or managing an existing one?";
        },
      },
      deliveryStatus: {
        keywords: ["delivery", "status", "arrived", "delivered", "shipment"],
        response: (message) => {
          return "Please provide the delivery ID or address for delivery status updates.";
        },
      },
      orderCancellation: {
        keywords: ["cancel", "cancel order", "refund", "return"],
        response: (message) => {
          return "Please provide the order ID or customer email to proceed with the cancellation.";
        },
      },
      stockReplenishment: {
        keywords: ["replenish", "restock", "order stock", "supply"],
        response: (message) => {
          return "Would you like to place a stock replenishment order? Please provide the product name or category.";
        },
      },
      productAvailability: {
        keywords: ["available", "stock", "product availability", "in stock"],
        response: (message) => {
          return "Can you specify the product name or SKU number to check the availability?";
        },
      },
      purchaseOrderStatus: {
        keywords: ["purchase order", "PO", "order status", "order tracking"],
        response: (message) => {
          return "Please provide the purchase order number to track the status.";
        },
      },
      warehouseManagement: {
        keywords: ["warehouse", "storage", "inventory storage", "location"],
        response: (message) => {
          return "Do you need assistance with managing warehouse stock levels or locations?";
        },
      },
      supplierInquiry: {
        keywords: ["supplier", "vendor", "supplies", "source"],
        response: (message) => {
          return "Please provide the supplier name or product to inquire about available suppliers.";
        },
      },
      returnPolicy: {
        keywords: ["return", "refund", "policy", "returns"],
        response: (message) => {
          return "Our return policy allows returns within 30 days for most products. Do you need help with a return?";
        },
      },
      general: {
        keywords: [],
        response: () => {
          return "I can help with supply chain inquiries like inventory checks, order status, shipment tracking, etc. How can I assist you today?";
        },
      },
    };
  }

  // Function to process incoming messages
  processMessage(message) {
    console.log("process message tira hoii");
    console.log(typeof message);
    const normalizedMessage = message.toLowerCase();
    const matchedIntent = this.matchIntent(normalizedMessage);

    // If a matching intent is found, return the associated response
    if (matchedIntent) {
      return matchedIntent.response(message);
    }

    // If no intent matches, return a fallback response
    return "I am sorry, I couldn't understand your request. Could you clarify your question?";
  }

  // Function to match the message to the most relevant intent
  matchIntent(message) {
    console.log(`matchintent : ${message}`);
    for (let intentKey in this.intents) {
      console.log(`intentKey : ${intentKey}`);
      const intent = this.intents[intentKey];
      const keywordMatches = intent.keywords.filter((keyword) =>
        message.includes(keyword)
      );

      if (keywordMatches.length > 0) {
        return intent;
      }
    }
    return null; // No intent matched
  }

  // Future expandability: Add new intents dynamically
  static addIntent(intentName, keywords, responseFunction) {
    this.intents[intentName] = {
      keywords: keywords,
      response: responseFunction,
    };
  }
}

module.exports = new ChatbotService();
