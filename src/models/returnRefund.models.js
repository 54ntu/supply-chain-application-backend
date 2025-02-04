const mongoose = require("mongoose");
const { refundRequest } = require("../global");

const refundSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    salesperonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesPerson",
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        refundRequest.APPROVED,
        refundRequest.PENDING,
        refundRequest.REJECTED,
      ],
      default: refundRequest.PENDING,
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);
module.exports = {
  Refund,
};
