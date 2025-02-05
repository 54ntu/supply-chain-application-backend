const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  getShipmentPerformance,
} = require("../controller/shipmentPerformance.controller");
const performanceRouter = express.Router();

performanceRouter
  .route("/")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    getShipmentPerformance
  );

module.exports = {
  performanceRouter,
};
