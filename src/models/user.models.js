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
      default: UserRole.Distributor,
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

const User = mongoose.model("User", userSchema);
module.exports = {
  User,
};
