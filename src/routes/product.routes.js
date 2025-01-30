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
  );
module.exports = productRouter;
