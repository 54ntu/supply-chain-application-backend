const { Product } = require("../models/product.models");
const { generateFKU } = require("../services/generateFKU");
const { generateSKU } = require("../services/generateSKU");
const { Variant } = require("../models/variants.models");
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

    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      const productImage = req.file?.filename;
      if (!productImage) {
        return res.status(400).json({
          message: "product image is not found..!!",
        });
      }

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

      //check if the product already exist or not(same category, name)
      const existingProduct = await Product.findOne({
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
          length,
          breadth,
          width,
          restock_threshold,
          total_stock: 0, // total_stock will be updated after adding variants
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
}

module.exports = {
  ProductController,
};
