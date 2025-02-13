const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const {
  SalesPersonController,
} = require("../controller/salesperson.controller");
const salesPersonRouter = express.Router();

salesPersonRouter
  .route("/add")
  .post(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPersonController.addSalesperson
  );

salesPersonRouter
  .route("/get")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPersonController.getSalespersons
  );

salesPersonRouter
  .route("/delete/:id")
  .delete(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPersonController.deleteSalespersons
  );

salesPersonRouter
  .route("/get/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPersonController.getSalesPersonByid
  );

salesPersonRouter
  .route("/set-password")
  .patch(
    UserMiddleware.isUserLoggedIn,
    SalesPersonController.updateSalespersonPassword
  );

salesPersonRouter
  .route("/sales-summary")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    SalesPersonController.getSalesPersonSummary
  );

module.exports = {
  salesPersonRouter,
};
