const express = require("express");
const { UserMiddleware } = require("../middleware/auth.middleware");
const { getInvetorySummary } = require("../controller/inventory.controller");
const inventoryRouter = express.Router();

inventoryRouter
  .route("/")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    getInvetorySummary
  );

module.exports = {
  inventoryRouter,
};
