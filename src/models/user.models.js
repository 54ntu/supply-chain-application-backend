const mongoose = require("mongoose");
const { UserRole } = require("../global/index");

const userSchema = new mongoose.Schema(
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
      enum: [UserRole.Distributor, UserRole.SalesPerson],
    },
    otp: {
      type: String,
    },
    isverified: {
      type: Boolean,
      default: false,
    },
    companyName: {
      type: String,
    },
    regNo: {
      type: String,
    },
    location: {
      type: String,
    },
    verificationDoc: {
      type: String,
    },
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the Distributor who added the salesperson
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = {
  User,
};
