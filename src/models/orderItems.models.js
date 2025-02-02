const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true }
);

const OrderItem = mongoose.model("OrderItem", orderItemSchema);
module.exports = {
  OrderItem,
};
