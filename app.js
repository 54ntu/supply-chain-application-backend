const express = require("express");
const cors = require("cors");
const { distributorRouter } = require("./src/routes/distributor.routes");
const { salesPersonRouter } = require("./src/routes/salesperson.routes");
const { categoryRouter } = require("./src/routes/category.routes");
const productRouter = require("./src/routes/product.routes");
const { customerRouter } = require("./src/routes/customer.routes");
const { settingRouter } = require("./src/routes/settings.routes");
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

//routes for customer controller
app.use("/api/v1/customer", customerRouter);

//routes for settings controller
app.use("/api/v1/setting", settingRouter);

module.exports = {
  app,
};
