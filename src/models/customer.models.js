const mongoose = require("mongoose");
const { shippingMethod } = require("../global");

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
    },

    customerId: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    storeName: {
      type: String,
    },
    preferredShippingMethod: {
      type: String,
      enum: [shippingMethod.EXPRESSSHIPPING, shippingMethod.FREESHIPPING],
    },

    customerpic: {
      type: String,
    },
    address: {
      type: String,
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
