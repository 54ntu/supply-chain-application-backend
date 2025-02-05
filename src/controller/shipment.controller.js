const { isValidObjectId, default: mongoose } = require("mongoose");
const { Shipment } = require("../models/shipment.models");
const { ApiResponse } = require("../services/ApiResponse");
class ShipmentController {
  static async getShipmentdata(req, res) {
    //get the distributor id from req.user

    try {
      const distributorId = req.user._id;
      if (!distributorId) {
        return res.status(400).json({
          success: false,
          message: "distributorid is required",
        });
      }

      //fetch the shipment details
      const shipmentDetails = await Shipment.aggr({
        distributorId: distributorId,
      });

      // return res.json(shipmentDetails);
      if (shipmentDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: "shipment details not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, shipmentDetails, "data fetched successfully")
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }

  static async getShipmentDataById(req, res) {
    //get the shipment id from the req.params
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "invalid shipment id",
      });
    }

    const shippingdetail = await Shipment.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDetails",
        },
      },
      {
        $unwind: "$orderDetails",
      },

      //lookup for customer details
      {
        $lookup: {
          from: "customers",
          localField: "orderDetails.customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $unwind: "$customerDetails",
      },

      //for shipping address
      {
        $lookup: {
          from: "shippingdetails",
          localField: "shippingAddress",
          foreignField: "_id",
          as: "shippingaddress",
        },
      },
      {
        $unwind: "$shippingaddress",
      },

      {
        $project: {
          orderId: 1,
          customerName: "$customerDetails.customerName",
          phone: "$customerDetails.phone",
          email: "$customerDetails.email",
          address: {
            $concat: [
              { $ifNull: ["$shippingaddress.city", ""] },
              " ",
              { $ifNull: ["$shippingaddress.Area", ""] },
            ],
          },

          trackingNumber: 1,
          shippingMethod: 1,
          status: 1,
        },
      },
    ]);

    if (!shippingdetail) {
      return res.status(404).json({
        success: false,
        message: "shippment info not found ",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          shippingdetail,
          "shipment details fecthed successfully"
        )
      );
  }
}

module.exports = {
  ShipmentController,
};
