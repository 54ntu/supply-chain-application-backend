const { isValidObjectId } = require("mongoose");
const { Category } = require("../models/category.models");
const { ApiResponse } = require("../services/ApiResponse");
class CategoryController {
  static async addCategory(req, res) {
    //get the distributor id from the req.user.id
    //get the category data from the request body
    //validate all fields
    //if already exist then return error message
    //else add the category to the database and return success message

    const distributorid = req.user?._id;


    if (!distributorid) {
      return res.status(401).json({
        status: "error",
        message: "distributor id is not provided.....",
      });
    }
    const { category_name } = req.body;
    if (!category_name) {
      return res
        .status(400)
        .json({ status: "error", message: "Category name is required" });
    }

    //check whether the category already exists

    const categoryexist = await Category.findOne({
      $and: [
        {
          distributor_id: distributorid,
        },
        {
          category_name: { $regex: new RegExp("^" + category_name + "$", "i") },
        },
      ],
    });

    if (categoryexist) {
      return res
        .status(400)
        .json({ status: "error", message: "Category already exists" });
    }

    //create a new category
    const newCategory = await Category.create({
      distributor_id: distributorid,
      category_name,
    });

    // console.log(newCategory);
    if (!newCategory) {
      return res.status(500).json({
        status: "error",
        message: "Category addition failed...😒😒😒😒😒",
      });
    }

    //if ok then return success message
    return res
      .status(201)
      .json(new ApiResponse(201, newCategory, "Category added successfully"));
  }

  static async getCategory(req, res) {
    //get the category of the appropriate distributor
    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          message: "distributor id is required",
        });
      }

      const categories = await Category.find({ distributor_id: distributorid });
      // console.log(categories);

      if (categories.length === 0) {
        return res.status(404).json({
          message: "category detail not found for the following distributor",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            categories,
            "category detail fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong",
      });
    }
  }

  static async updateCategory(req, res) {
    //get the distributor id from req.user
    //get the category id from the req.params

    const distributorid = req.user._id;
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "invalid category id",
      });
    }

    //get category category_name from the req.body
    const { category_name } = req.body;

    //find the data on basis of both distributor id and category id
    const isCategoryExist = await Category.findOne({
      _id: id,
      distributor_id: distributorid,
    });

    // console.log(isCategoryExist);
    if (!isCategoryExist) {
      return res.status(404).json({
        message: "category with given id doesnot exist",
      });
    }

    //if category name is passing from the frontend then update it if not then just leave as it was
    if (category_name) isCategoryExist.category_name = category_name;
    await isCategoryExist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, isCategoryExist, "category updated successfully")
      );
  }

  static async deleteCategory(req, res) {
    //get the distributor id from the req.user.id
    //get the category id from the request params
    //validate all fields
    //if not exist then return error message
    //else delete the category from the database and return success message

    const distributorid = req.user?._id;
    if (!distributorid) {
      return res.status(401).json({
        status: "error",
        message: "distributor id is not provided.....",
      });
    }

    // console.log(req.params);
    const categoryid = req.params.id;
    // console.log(categoryid);
    if (!categoryid) {
      return res.status(400).json({
        status: "error",
        message: "Category id is required",
      });
    }

    //check whether the category already exists
    const isCategoryExist = await Category.findOne({ _id: categoryid });

    if (!isCategoryExist) {
      return res.status(400).json({
        status: "error",
        message: "Category does not exist",
      });
    }

    //check the valid distributor of the category
    if (
      isCategoryExist.distributor_id.toString() !== distributorid.toString()
    ) {
      return res
        .status(401)
        .json({ message: "You are not authorized to delete this category" });
    }

    //delete the category
    const deletedcategory = await Category.findByIdAndDelete(categoryid);
    // console.log(deletedcategory);

    if (!deletedcategory) {
      return res.status(500).json({
        status: "error",
        message: "Category deletion failed...😒😒😒😒😒",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedcategory, "Category deleted successfully")
      );
  }
}

module.exports = {
  CategoryController,
};
