const mongoose = require("mongoose");
const { Province } = require("../global/index");

const shippingDetailSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    fullName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      enum: [
        Province.BAGMATI,
        Province.GANDAKI,
        Province.KARNALI,
        Province.KOSHI,
        Province.LUMBINI,
        Province.MADHESH,
        Province.SUDURPASHCHIM,
      ],
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    Area: {
      type: String,
      required: true,
    },
    Address: {
      type: String,
    },
    landmark: {
      type: String,
    },
  },
  { timestamps: true }
);

const ShippingDetail = mongoose.model("ShippingDetail", shippingDetailSchema);
module.exports = {
  ShippingDetail,
};
