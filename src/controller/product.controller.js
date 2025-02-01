const { Product } = require("../models/product.models");
const { generateFKU } = require("../services/generateFKU");
const { generateSKU } = require("../services/generateSKU");
const { Variant } = require("../models/variants.models");
const { ApiResponse } = require("../services/ApiResponse");
const { isValidObjectId } = require("mongoose");
class ProductController {
  static async addProduct(req, res) {
    //get the distributor id from the req.user.id
    //get the product image from the req.file
    //get the product details from the req.body

    //validate all the required fields
    //check if the product already exist or not
    //if not exist then add the product
    //generate FKU for the product
    //create a new product
    //add variants of the product
    //generate sku for each variant
    //check if the variant sku already exist
    //then just update the variant stock
    //if sku not exist then just add the new variant
    //then update the total stock of the product in the inventory
    //return the response
    console.log("add product hit vayo");

    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      const productImage = req.file?.filename;
      // if (!productImage) {
      //   return res.status(400).json({
      //     message: "product image is not found..!!",
      //   });
      // }

      //get the data from the req.body
      const {
        category,
        product_name,
        product_description,
        product_weight,
        product_price,
        length,
        breadth,
        width,
        restock_threshold,
        variants, //variants will be the array of attributes of the product
      } = req.body;

      //validate all the required fields
      if (
        !category ||
        !product_name ||
        !product_description ||
        !product_weight ||
        !length ||
        !breadth ||
        !width ||
        !variants
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      //check if the product already exist or not(same category, name)
      let existingProduct = await Product.findOne({
        category,
        product_name: { $regex: new RegExp("^" + product_name + "$", "i") }, //case insensetive check
      });

      let totalStock = 0;
      let variantArray = [];

      if (!existingProduct) {
        //generate FKU for the product
        const FKU = generateFKU(category, product_name);

        //create a new product
        existingProduct = new Product({
          distributorId: distributorid,
          category,
          product_name,
          product_description,
          product_weight,
          product_price,
          product_image: productImage,
          FKU,
          length,
          breadth,
          width,
          restock_threshold,
          total_stock: 0, // total_stock will be updated after adding variants
          min_price: 0, //will be calculated automatically once the variants added
          max_price: 0, //will be calculated automatically once the variants added
        });

        await existingProduct.save();
      }

      //add or update variants
      if (variants && Array.isArray(variants)) {
        for (const variant of variants) {
          const { attributes, variant_price, stock } = variant;

          //generate  a new sku based on the product's FKU
          const SKU = generateSKU(existingProduct.FKU, attributes);

          //check if the variant sku already exist or not

          let existingVariant = await Variant.findOne({ SKU });
          if (existingVariant) {
            //if variant sku exist then just update the stock of the variant
            existingVariant.stock += stock || 0; // add new stock to existing stock
            await existingVariant.save();
            variantArray.push(existingVariant);
            totalStock += stock || 0;
          } else {
            //if variant doesnot exist, create a new variant

            const newVariant = new Variant({
              product_id: existingProduct._id,
              SKU,
              attributes,
              variant_price,
              stock: stock || 0, //default to 0 if not provided
            });

            await newVariant.save();
            variantArray.push(newVariant);
            totalStock += newVariant.stock; //add total stock
          }
        }
      }

      //update the total stock of the product
      existingProduct.total_stock += totalStock;

      //calculate min and max prices among all variants
      if (variantArray.length > 0) {
        const prices = variantArray.map((v) => v.variant_price);
        const minPrice = Math.min(...prices);
        const maxprice = Math.max(...prices);
        existingProduct.min_price = minPrice;
        existingProduct.max_price = maxprice;
      } else {
        //if no variants are added, then just show the base product price
        existingProduct.min_price = product_price || 0;
        existingProduct.max_price = product_price || 0;
      }

      await existingProduct.save();

      return res.status(201).json({
        message:
          totalStock > 0
            ? "Product stock updated with new or existing variants"
            : "product created successfully with variants",

        product: existingProduct,
        variant: variantArray,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error  adding product",
        error: error.message,
      });
    }
  }

  static async viewAllProduct(req, res) {
    //simply send the get request
    //return the response

    try {
      const products = await Product.find();
      if (products.length === 0) {
        return res.status(404).json({ message: "products not found" });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(200, products, "products data fetched successfully.")
        );
    } catch (error) {
      return res.status(500).json({
        message: "error fetching products data",
      });
    }
  }

  static async viewProductById(req, res) {
    //get the product id from the req.params
    //valida the product id
    //find product by id
    //return response

    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "please provide valid product id",
        });
      }

      const product = await Product.aggregate([
        {
          $match: {
            _id: id,
          },
        },
        {
          $lookup: {
            from: "variants",
            localField: "_id",
            foreignField: "product_id",
            as: "variants",
          },
        },
        {
          $unwind: "$variants",
        },
        {
          $project: {
            _id: 1,
            distributorId: 1,
            category: 1,
            product_name: 1,
            product_description: 1,
            product_weight: 1,
            product_price: 1,
            product_image: 1,
            length: 1,
            breadth: 1,
            width: 1,
            restock_threshold: 1,
            total_stock: 1,
            "variants._id": 1,
            "variants.SKU": 1,
            "variants.attributes": 1,
            "variants.variant_price": 1,
            "variants.stock": 1,
          },
        },
      ]);

      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            productm,
            "product data fetched successfully..!!!!"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: "error fetching product data",
      });
    }
  }

  static async deleteProduct(req, res) {
    //get the product id from the req.params
    //get the distributor id from the req.user
    //validate both data
    //find the product by id and distributor id and perform delete operation
    //return response

    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "please provide valid product id" });
      }

      const distributorId = req.user._id;
      if (!distributorId) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      await Product.findOneAndDelete({
        _id: id,
        distributorId,
      });

      return res.status(200).json({
        message: "product deleted successfully..!!",
      });
    } catch (error) {
      return res.status(500).json({
        message: "error deleting product",
      });
    }
  }

  static async updateProduct(req, res) {
    //get the product id from the req.params
    //get the distributor id from the req.user
    //validate both data
    //find the product by id and distributor id
    //update the product data
    //return response

    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "please provide valid product id" });
      }

      const distributorId = req.user._id;
      if (!distributorId) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      const product = await Product.findOne({
        _id: id,
        distributorId,
      });

      if (!product) {
        return res.status(404).json({ message: "product not found" });
      }

      //get the product image from the req.file
      const productImage = req.file?.filename;

      //get the data from the req.body
      const {
        category,
        product_name,
        product_description,
        product_weight,
        product_price,
        length,
        breadth,
        width,
        restock_threshold,
        variants, //variants will be the array of attributes of the product
      } = req.body;

      //validate all the required fields
      if (
        !category ||
        !product_name ||
        !product_description ||
        !product_weight ||
        !product_price ||
        !length ||
        !breadth ||
        !width ||
        !variants
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      //update the product data
      product.category = category;
      product.product_name = product_name;
      product.product_description = product_description;
      product.product_weight = product_weight;
      product.product_price = product_price;
      product.product_image = productImage;
      product.length = length;
      product.breadth = breadth;
      product.width = width;
      product.restock_threshold = restock_threshold;

      await product.save();

      //handle variants updation as well

      return res.status(200).json({
        message: "product updated successfully",
        product,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error updating product",
      });
    }
  }
}

module.exports = {
  ProductController,
};
