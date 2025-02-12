const { Product } = require("../models/product.models");
const { generateFKU } = require("../services/generateFKU");
const { generateSKU } = require("../services/generateSKU");
const { Variant } = require("../models/variants.models");
const { ApiResponse } = require("../services/ApiResponse");
const { isValidObjectId, default: mongoose } = require("mongoose");
const { uploadOnCloudinary } = require("../services/cloudinary");
const { envConfig } = require("../config/config");
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

      const productImageLocalFilePath = req.file?.path;
      // console.log(productImageLocalFilePath);

      if (!productImageLocalFilePath) {
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
        quantity,
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
        !width
      ) {
        return res
          .status(400)
          .json({ message: "All fields are requireddfdsfdsfadsfasf" });
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

        //if product doesnot already exist then upload image into the cloudinary
        const productImage = await uploadOnCloudinary(
          productImageLocalFilePath
        );

        if (!productImage) {
          return res.status(500).json({
            success: false,
            message: "product image url is required",
          });
        }

        //create a new product
        existingProduct = new Product({
          distributorId: distributorid,
          category,
          product_name,
          product_description,
          product_weight,
          product_price,
          FKU,
          length,
          breadth,
          width,
          restock_threshold,
          total_stock: 0, // total_stock will be updated after adding variants
          min_price: 0, //will be calculated automatically once the variants added
          max_price: 0, //will be calculated automatically once the variants added
        });

        if (productImage.url) existingProduct.product_image = productImage.url;
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

            //add variants id into the product table
            existingProduct.variants = newVariant._id;
            await existingProduct.save();
          }
        }
      }

      // console.log(`total_stock  : ${quantity} and type is ${typeof quantity}`);

      //update the total stock of the product
      if (totalStock > 0) {
        existingProduct.total_stock += totalStock;
      } else {
        existingProduct.total_stock += parseInt(quantity);
      }

      //calculate min and max prices among all variants
      if (variantArray.length > 0) {
        const prices = variantArray.map((v) => v.variant_price);
        const minPrice = Math.min(...prices);
        const maxprice = Math.max(...prices);
        existingProduct.min_price = minPrice;
        existingProduct.max_price = maxprice;
        existingProduct.product_price = minPrice;
      } else {
        //if no variants are added, then just show the base product price
        existingProduct.min_price = product_price;
        existingProduct.max_price = product_price;
        existingProduct.product_price = product_price;
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
    const distributorid = req.user._id;

    // console.log(envConfig.base_url);
    try {
      const products = await Product.aggregate([
        {
          $match: {
            distributorId: new mongoose.Types.ObjectId(distributorid),
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "categoryDetail",
          },
        },
        {
          $unwind: "$categoryDetail",
        },
        // //for variants data
        {
          $lookup: {
            from: "variants",
            localField: "variants",
            foreignField: "_id",
            as: "variantDetails",
          },
        },
        {
          $unwind: {
            path: "$variantDetails",
            preserveNullAndEmptyArrays: true, //keep documents even when "variantdetails" is empty
          },
        },
        {
          $project: {
            FKU: 1,
            product_name: 1,
            product_image: 1,
            categoryName: "$categoryDetail.category_name",
            price: "$variantDetails.variant_price",
            total_stock: 1,
          },
        },
      ]);

      if (!products || products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "product data not found for the given distributor",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, products, "product details fetched successfully")
        );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "something went wrong",
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

      // console.log(typeof id);

      const product = await Product.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "variants", // kun table baat data fetch garne i.e. variants
            localField: "_id", //field in the product table
            foreignField: "product_id", //field in the variants for the same field
            as: "variants",
          },
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
            min_price: 1,
            max_price: 1,
            product_image: 1,
            length: 1,
            breadth: 1,
            width: 1,
            restock_threshold: 1,
            total_stock: 1,
            variants: 1,
            product_image: 1,
          },
        },
      ]);

      if (product.length === 0) {
        return res.status(404).json({ message: "product not found" });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            product,
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

      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      const isProductExist = await Product.findById({
        _id: id,
      });

      if (!isProductExist) {
        return res.status(404).json({
          error: `product with the id ${id} not found`,
        });
      }

      if (isProductExist.distributorId.toString() != distributorid) {
        return res.status(403).json({
          error: "you are not authorized to delete this product",
        });
      }

      //if valid user and product is found then delete that
      const deletedproduct = await isProductExist.deleteOne({ _id: id });
      if (deletedproduct.acknowledged == false) {
        return res.status(500).json({
          error: "product deletion failed.😒😒😒😒",
        });
      }

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
      console.log("moh yeta update product tira xu hoiii");
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res
          .status(400)
          .json({ message: "please provide valid product id" });
      }

      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({ message: "Distributor id is required" });
      }

      //get the product image from the req.file
      const productImageLocalPath = req.file?.path;

      //get the data from the req.body
      const {
        category,
        product_name,
        product_description,
        product_weight,
        product_price,
        quantity,
        length,
        breadth,
        width,
        restock_threshold,
        variants, //variants will be the array of attributes of the product
      } = req.body;

      const isProductExist = await Product.findById({
        _id: id,
      });

      if (!isProductExist) {
        return res
          .status(404)
          .json({ message: "product with the given id not found" });
      }

      // console.log(isProductExist);
      //if product found then check whether authorized user or not
      if (isProductExist.distributorId.toString() != distributorid) {
        return res.status(403).json({
          error: "this product does not belongs to you😡😡😡😡🤬🤬",
        });
      }

      //upload updated product image into the cloudinary
      const productimage = await uploadOnCloudinary(productImageLocalPath);

      // console.log(typeof quantity);
      // console.log(typeof product_price);
      // console.log(productimage.url);

      //update the product data
      if (category) isProductExist.category = category;
      if (product_name) isProductExist.product_name = product_name;
      if (product_description)
        isProductExist.product_description = product_description;
      if (product_weight) isProductExist.product_weight = product_weight;
      // if (productimage.url) isProductExist.product_image = productimage.url;
      if (length) isProductExist.length = length;
      if (breadth) isProductExist.breadth = breadth;
      if (width) isProductExist.width = width;
      if (restock_threshold)
        isProductExist.restock_threshold = restock_threshold;
      // if (variants) product.variants = variants;

      let totalStock = 0;
      let variantArray = [];
      //handle variant wise updation as well

      if (variants && Array.isArray(variants)) {
        for (const variant of variants) {
          //find the existing variant
          console.log(variant.attributes.size);
          const existingVariant = await Variant.findOne({
            product_id: isProductExist._id,
          });

          // console.log(`existingvariant data : ${existingVariant}`);
          if (existingVariant) {
            if (variant.attributes)
              existingVariant.attributes = variant.attributes;
            if (variant.variant_price)
              existingVariant.variant_price = variant.variant_price;
            if (variant.stock) existingVariant.stock += variant.stock;

            await existingVariant.save();
            // console.log(`existingVariant stock `, typeof existingVariant.stock);
            totalStock += existingVariant.stock;

            variantArray.push(existingVariant);
          } else {
            const SKU = generateSKU(isProductExist.FKU, variant.attributes);

            //create new variant
            const newVariant = new Variant({
              product_id: isProductExist._id,
              SKU,
              attributes: variant.attributes,
              variant_price: variant.variant_price,
              stock: variant.stock,
            });

            await newVariant.save();

            totalStock += Number(variant.stock);
            variantArray.push(newVariant);
          }
        }
      }

      //update the total stock of the product based on the variant
      if (totalStock > 0) {
        isProductExist.total_stock += Number(totalStock);
      } else {
        isProductExist.total_stock += Number(quantity);
      }

      // //update the price based on the variant or normal product price
      if (variantArray.length > 0) {
        const prices = variantArray.map((v) => v.variant_price);
        const minPrice = Math.min(...prices);
        const maxprice = Math.max(...prices);
        isProductExist.min_price = minPrice;
        isProductExist.max_price = maxprice;
        isProductExist.product_price = minPrice;
      } else {
        //if no variants are added, then just show the base product price
        isProductExist.min_price = product_price;
        isProductExist.max_price = product_price;
        isProductExist.product_price = product_price;
      }

      await isProductExist.save();

      return res.status(200).json({
        message: "product updated successfully",
        isProductExist,
      });
    } catch (error) {
      return res.status(500).json({
        message: "error updating product",
        error: error.message,
      });
    }
  }
}

module.exports = {
  ProductController,
};
