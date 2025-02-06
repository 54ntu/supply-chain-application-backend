const express = require("express");
const { DashboardController } = require("../controller/dashboard.controller");
const dashboardRouter = express.Router();

dashboardRouter.route("/stock").get(DashboardController.getStockSummary);

dashboardRouter
  .route("/orders")
  .get(DashboardController.getOrderShipentSummary);
dashboardRouter
  .route("/salessummary")
  .get(DashboardController.getTotalSalesSummary);

module.exports = {
  dashboardRouter,
};
