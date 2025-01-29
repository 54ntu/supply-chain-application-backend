const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { SalesPerson } = require("../controller/salesperson.controller");
const salesPersonRouter = express.Router();

salesPersonRouter
  .route("/add")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPerson.addSalesperson
  );

salesPersonRouter
  .route("/get")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPerson.getSalespersons
  );

module.exports = {
  salesPersonRouter,
};
