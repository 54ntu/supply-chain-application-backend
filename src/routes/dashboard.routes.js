const express = require("express");
const { DashboardController } = require("../controller/dashboard.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const dashboardRouter = express.Router();

dashboardRouter
  .route("/stock")
  .get(UserMiddleware.isUserLoggedIn, DashboardController.getStockSummary);

dashboardRouter
  .route("/orders")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    DashboardController.getOrderShipentSummary
  );
dashboardRouter
  .route("/salessummary")
  .get(UserMiddleware.isUserLoggedIn, DashboardController.getTotalSalesSummary);

module.exports = {
  dashboardRouter,
};
