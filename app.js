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
const { shipmentRouter } = require("./src/routes/shipment.routes");
const { inventoryRouter } = require("./src/routes/inventory.route");
const {
  performanceRouter,
} = require("./src/routes/shipmentPerformance.routes");
const { dashboardRouter } = require("./src/routes/dashboard.routes");
const { statsRouter } = require("./src/routes/refundstatistics.route");
const { chatbotRouter } = require("./src/routes/chatbot.routes");
const { subscriptionplanRouter } = require("./src/routes/subscription.routes");
const {
  subscriptionOrderRouter,
} = require("./src/routes/subscriptionOrder.routes");
const { OrderController } = require("./src/controller/order.controller");
const { CustomerController } = require("./src/controller/customer.controller");
const { UserMiddleware } = require("./src/middleware/auth.middleware");
const { distributorOrderRouter } = require("./src/routes/getorder.route");
const {
  salesCustomerRouter,
} = require("./src/routes/customer-salesperson-side.route");
const { ProductController } = require("./src/controller/product.controller");
const app = express();

const corsOptions = {
  origin: [
    "https://scala-supply-chain-management.netlify.app",
    "http://localhost:5173",
  ], // Allowed domains
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies and authentication
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("./src/public")); // this middleware helps to handle the image file
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("hello");
});

//route for distributor
app.use("/api/v1/distributor", distributorRouter);

// route for salesperson
app.use("/api/v1/sales", salesPersonRouter);

//route for category
app.use("/api/v1/category", categoryRouter);

//route for product controller
app.use("/api/v1/product", productRouter);
app.get(
  "/api/v1/productSalesperson",
  UserMiddleware.isUserLoggedIn,
  ProductController.viewAllProductSalesPersonSide
);

//routes for customer controller
app.use("/api/v1/customer", customerRouter);

//routes for customer controller salesperson side
app.use("/api/v1/sales-customer", salesCustomerRouter);

//routes for customer summary
app.get(
  "/api/v1/customer-summary",
  UserMiddleware.isUserLoggedIn,
  UserMiddleware.isDistributor,
  CustomerController.getcustomerSummary
);

//routes for settings controller
app.use("/api/v1/setting", settingRouter);

//route for notification controller
app.use("/api/v1/notification", notificationRouter);

//route for order controller
app.use("/api/v1/order", orderRouter);

//get order for distributor
app.use("/api/v1/order-dist", distributorOrderRouter);

//route for order stats
app.get("/api/v1/order-stats", OrderController.getOrderSummary);

//router for address controller
app.use("/api/v1/address", addressRouter);

//router for refund controller
app.use("/api/v1/refund", refundRouter);

//router for refund stats controller
app.use("/api/v1/stats", statsRouter);

//shipment router
app.use("/api/v1/shipment", shipmentRouter);
app.use("/api/v1/performance", performanceRouter);

//inventory router
app.use("/api/v1/inventory", inventoryRouter);

//dashboard router
app.use("/api/v1/dashboard", dashboardRouter);

//chatbot router
app.use("/api/v1/chatbot", chatbotRouter);

//subscription plam router
app.use("/api/v1/subscriptionplan", subscriptionplanRouter);

//subscription order router
app.use("/api/v1/orderSubs", subscriptionOrderRouter);

module.exports = {
  app,
};
