const mongoose = require("mongoose");
const { shippingMethod } = require("../global");

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },

    customerId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    storeName: {
      type: String,
      required: true,
    },
    preferredShippingMethod: {
      type: String,
      enum: [shippingMethod.EXPRESSSHIPPING, shippingMethod.FREESHIPPING],
    },

    customerpic: {
      type: String,
      required: true,
    },
    distributorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    salespersonId: {
      type: mongoose.Types.ObjectId,
      ref: "SalesPerson",
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = {
  Customer,
};
