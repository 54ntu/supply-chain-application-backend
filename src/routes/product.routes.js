const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/multer.middleware");
const { ProductController } = require("../controller/product.controller");
const productRouter = express.Router();

productRouter
  .route("/")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    upload.single("productimage"),
    ProductController.addProduct
  )
  .get(UserMiddleware.isUserLoggedIn, ProductController.viewAllProduct);

productRouter
  .route("/:id")
  .get(ProductController.viewProductById)
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ProductController.updateProduct
  )
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ProductController.deleteProduct
  );

module.exports = productRouter;
