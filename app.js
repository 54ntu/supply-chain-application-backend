const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { distributorRouter } = require("./src/routes/distributor.routes");
const { salesPersonRouter } = require("./src/routes/salesperson.routes");
const { categoryRouter } = require("./src/routes/category.routes");
const productRouter = require("./src/routes/product.routes");
const { customerRouter } = require("./src/routes/customer.routes");
const { settingRouter } = require("./src/routes/settings.routes");
const { orderRouter } = require("./src/routes/order.routes");
const { notificationRouter } = require("./src/routes/notification.routes");
const { addressRouter } = require("./src/routes/address.routes");
const { refundRouter } = require("./src/routes/refund.route");
const { statsRouter } = require("./src/routes/refundStats.routes");
const { shipmentRouter } = require("./src/routes/shipment.routes");
const { inventoryRouter } = require("./src/routes/inventory.route");
const app = express();

const corsOptions = {
  origin: ["*"], // Allowed domains
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies and authentication
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // this middleware helps to handle the image file
app.use(cookieParser());

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

//route for notification controller
app.use("/api/v1/notification", notificationRouter);

//route for order controller
app.use("/api/v1/order", orderRouter);

//router for address controller
app.use("/api/v1/address", addressRouter);

//router for refund controller
app.use("/api/v1/refund", refundRouter);

//router for refund stats controller
app.use("/api/v1/stats", statsRouter);

//shipment router
app.use("/api/v1/shipment", shipmentRouter);

//inventory router
app.use("/api/v1/inventory", inventoryRouter);

module.exports = {
  app,
};
