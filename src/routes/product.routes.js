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
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ProductController.viewAllProduct
  );

productRouter
  .route("/:id")
  .get(ProductController.viewProductById)
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ProductController.deleteProduct
  );

productRouter
  .route("/:id")
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    upload.single("productImage"),
    ProductController.updateProduct
  );

// productRouter
//   .route("/searchproductall")
//   .get(UserMiddleware.isUserLoggedIn, ProductController.searchProduct);

module.exports = productRouter;
