const mongoose = require("mongoose");
const {
  orderStatus,
  paymentStatus,
  shipmentMethods,
} = require("../global/index");

const orderSchema = new mongoose.Schema(
  {
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesPerson",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shipping_charge: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingMethod: {
      type: String,
      enum: [
        shipmentMethods.EXPRESS,
        shipmentMethods.SAMEDAY,
        shipmentMethods.STANDARD,
      ],
      default: shipmentMethods.STANDARD,
    },
    tax: {
      type: Number,
      default: 0,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    total_quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    order_status: {
      type: String,
      enum: [
        orderStatus.CANCELLED,
        orderStatus.CONFIRMED,
        orderStatus.DELIVERED,
        orderStatus.PENDING,
        orderStatus.SHIPPED,
        orderStatus.INTRANSIT,
        orderStatus.PROCESSING,
      ],
      default: orderStatus.PENDING,
    },
    payment_status: {
      type: String,
      enum: [
        paymentStatus.CANCELLED,
        paymentStatus.COMPLETED,
        paymentStatus.PENDING,
        paymentStatus.REFUNDED,
      ],
      default: paymentStatus.PENDING,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingDetail",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = {
  Order,
};
