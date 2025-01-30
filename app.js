const express = require("express");
const cors = require("cors");
const { distributorRouter } = require("./src/routes/distributor.routes");
const { salesPersonRouter } = require("./src/routes/salesperson.routes");
const { categoryRouter } = require("./src/routes/category.routes");
const productRouter = require("./src/routes/product.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//route for distributor
app.use("/api/v1/distributor", distributorRouter);

// route for salesperson
app.use("/api/v1/sales", salesPersonRouter);

//route for category
app.use("/api/v1/category", categoryRouter);

//route for product controller
app.use("/api/v1/product", productRouter);

module.exports = {
  app,
};
