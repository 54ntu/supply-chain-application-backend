const express = require("express");
const { ShipmentController } = require("../controller/shipment.controller");
const { UserMiddleware } = require("../middleware/auth.middleware");
const shipmentRouter = express.Router();

shipmentRouter
  .route("/")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ShipmentController.getShipmentdata
  );

shipmentRouter
  .route("/:id")
  .get(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ShipmentController.getShipmentDataById
  )
  .patch(
    UserMiddleware.isUserLoggedIn,
    UserMiddleware.isDistributor,
    ShipmentController.updateshipmentStatus
  );

module.exports = {
  shipmentRouter,
};
