const mongoose = require("mongoose");
const { UserRole } = require("../global");
const salesPersonSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: UserRole.SalesPerson,
    },
    address: {
      type: String,
      required: true,
    },
    assign_region: {
      type: String,
      required: true,
    },
    take_orders: {
      type: Boolean,
      default: false,
    },

    collect_payments: {
      type: Boolean,
      default: false,
    },

    track_shipment: {
      type: Boolean,
      default: false,
    },

    view_inventory: {
      type: Boolean,
      default: false,
    },
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const SalesPerson = mongoose.model("SalesPerson", salesPersonSchema);
module.exports = {
  SalesPerson,
};
