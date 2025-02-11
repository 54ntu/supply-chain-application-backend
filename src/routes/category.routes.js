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
  )
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    CategoryController.getCategory
  );

categoryRouter
  .route("/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    CategoryController.deleteCategory
  )
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    CategoryController.updateCategory
  );

module.exports = {
  categoryRouter,
};
