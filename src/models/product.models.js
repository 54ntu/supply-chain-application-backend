const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    distributorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    product_name: {
      type: String,
      required: true,
    },

    product_description: {
      type: String,
      required: true,
    },

    total_stock: {
      type: Number,
      default: 0,
    },
    FKU: {
      type: String,
      required: true,
      unique: true,
    },
    product_image: {
      type: String,
    },
    product_weight: {
      type: Number,
      required: true,
    },
    product_price: {
      type: Number,
      default: 0,
    },

    min_price: {
      type: Number,
      default: 0,
    },
    max_price: {
      type: Number,
      default: 0,
    },

    length: {
      type: Number,
      required: true,
    },
    breadth: {
      type: Number,
      required: true,
    },

    width: {
      type: Number,
      required: true,
    },
    restock_threshold: {
      type: Number,
      default: 10,
    },
    variants: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = {
  Product,
};
