const mongoose = require("mongoose");
const { shipmentMethods, orderStatus } = require("../global");

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShippingDetail",
      required: true,
    },
    shippingMethod: {
      type: String,
    },
    trackingNumber: {
      type: String,
      unique: true,
    },
    status: {
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
    shippingcost: {
      type: Number,
      min: 0,
      default: 0,
    },
    dispatchedDat: { type: Date },
    estimatedDelivery: { type: Date },
    deliveredDate: { type: Date },
  },

  { timestamps: true }
);

const Shipment = mongoose.model("Shipment", shipmentSchema);
module.exports = {
  Shipment,
};
