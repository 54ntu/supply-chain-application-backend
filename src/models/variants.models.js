const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    SKU: {
      type: String,
      required: true,
      unique: true,
    },
    attributes: {
      color: { type: String },
      size: { type: String },
    },
    variant_price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    restock_threshold: {
      type: Number,
      default: 10,
    },
  },
  { timestatmps: true }
);

const Variant = mongoose.model("Variant", variantSchema);

module.exports = {
  Variant,
};
