const express = require("express");
const { CategoryController } = require("../controller/category.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    CategoryController.addCategory
  );

categoryRouter
  .route("/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    CategoryController.deleteCategory
  );

module.exports = {
  categoryRouter,
};
