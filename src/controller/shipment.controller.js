const { isValidObjectId, default: mongoose } = require("mongoose");
const { Shipment } = require("../models/shipment.models");
const { ApiResponse } = require("../services/ApiResponse");
const { shipmentMethods, orderStatus } = require("../global");
const { percentageChange } = require("../services/calculatePercentage");
const { Order } = require("../models/order.models");
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
      const shipmentDetails = await Shipment.find({ distributorId });

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
          new ApiResponse(200, shipmentDetails[0], "data fetched successfully")
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

  // static async getShipmentPerformance(req, res) {
  //   console.log("shipment performance tira hoi");
  //   try {
  //     const currentYear = new Date().getFullYear();
  //     const previousYear = currentYear - 1;

  //     // Define date ranges
  //     const currentYearStart = new Date(currentYear, 0, 1);
  //     const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
  //     const previousYearStart = new Date(previousYear, 0, 1);
  //     const previousYearEnd = new Date(previousYear, 11, 31, 23, 59, 59);

  //     const totalShipmentsCurrentYear = await Shipment.countDocuments({
  //       createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
  //     });

  //     const totalShipmentsPreviousYear = await Shipment.countDocuments({
  //       createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
  //     });

  //     // Fetch successful (on-time) deliveries
  //     const onTimeDeliveriesCurrentYear = await Shipment.countDocuments({
  //       status: orderStatus.DELIVERED,
  //       deliveredDate: { $lte: "$estimatedDelivery" },
  //       createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
  //     });

  //     const onTimeDeliveriesPreviousYear = await Shipment.countDocuments({
  //       status: orderStatus.DELIVERED,
  //       deliveredDate: { $lte: "$estimatedDelivery" },
  //       createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
  //     });

  //     //calculate success rate
  //     const successRateCurrentYear = totalShipmentsCurrentYear
  //       ? (onTimeDeliveriesCurrentYear / totalShipmentsCurrentYear) * 100
  //       : 0;

  //     const successRatePriviousYear = totalShipmentsPreviousYear
  //       ? (onTimeDeliveriesPreviousYear / totalShipmentsPreviousYear) * 100
  //       : 0;

  //     //fetch delayed deliveries
  //     const lateDeliveriesCurrentYear = await Shipment.countDocuments({
  //       status: orderStatus.DELIVERED,
  //       deliveredDate: { $gt: "$estimatedDelivery" },
  //       createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
  //     });

  //     const lateDeliveriesPreviousYear = await Shipment.countDocuments({
  //       status: orderStatus.DELIVERED,
  //       deliveredDate: { $gt: "$estimatedDelivery" },
  //       createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
  //     });

  //     //calculate delay rate
  //     const delayRateCurrentYear = totalShipmentsCurrentYear
  //       ? (lateDeliveriesCurrentYear / totalShipmentsCurrentYear) * 100
  //       : 0;

  //     const delayRatePreviousYear = totalShipmentsPreviousYear
  //       ? (lateDeliveriesPreviousYear / totalShipmentsPreviousYear) * 100
  //       : 0;

  //     //return calculated data
  //     return {
  //       totalShipments: {
  //         currentYear: totalShipmentsCurrentYear,
  //         previouseYear: totalShipmentsPreviousYear,
  //         changes: percentageChange(
  //           totalShipmentsCurrentYear,
  //           totalShipmentsPreviousYear
  //         ),
  //       },

  //       successRate: {
  //         currentYear: successRateCurrentYear + "%",
  //         previousYear: successRatePriviousYear + "%",
  //         change:
  //           percentageChange(successRateCurrentYear, successRatePriviousYear) +
  //           "%",
  //       },

  //       delayRate: {
  //         currentYear: delayRateCurrentYear + "%",
  //         previousYear: delayRatePreviousYear + "%",
  //         change:
  //           percentageChange(delayRateCurrentYear, delayRatePreviousYear) + "%",
  //       },

  //       //efficiency on basis of shipment on time
  //       efficiency: {
  //         currentYear: successRateCurrentYear + "%",
  //         previousYear: successRatePriviousYear + "%",
  //         change:
  //           percentageChange(successRateCurrentYear, successRatePriviousYear) +
  //           "%",
  //       },
  //     };
  //   } catch (error) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "something went wrong",
  //     });
  //   }
  // }

  static async updateshipmentStatus(req, res) {
    //get the distributor id from the req.user
    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          success: false,
          message: "distributor id is required",
        });
      }

      //get the shipment id from the req.params
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "invalid shipment id ",
        });
      }

      //get the status from the req.body
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "status must be required",
        });
      }

      //find the shipment data and update the status
      const shipment = await Shipment.findOne({
        _id: new mongoose.Types.ObjectId(id),
        distributorId: new mongoose.Types.ObjectId(distributorid),
      });

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "shipment data not found",
        });
      }

      // console.log(shipment);
      shipment.status = status;
      await shipment.save();

      //update the order status too
      if (status === orderStatus.DELIVERED) {
        await Order.findByIdAndUpdate(shipment.orderId, {
          order_status: orderStatus.DELIVERED,
        });
      }

      return res.status(200).json({
        success: true,
        message: "shipment and order status updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = {
  ShipmentController,
};
