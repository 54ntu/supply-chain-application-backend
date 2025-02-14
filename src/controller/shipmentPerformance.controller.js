const { Shipment } = require("../models/shipment.models");
const { percentageChange } = require("../services/calculatePercentage");
const { orderStatus } = require("../global/index");

const getShipmentPerformance = async (req, res) => {
  console.log("shipment performance tira hoi");
  try {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    // Define date ranges
    const currentYearStart = new Date(currentYear, 0, 1);
    const currentYearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
    const previousYearStart = new Date(previousYear, 0, 1);
    const previousYearEnd = new Date(previousYear, 11, 31, 23, 59, 59);

    const totalShipmentsCurrentYear = await Shipment.countDocuments({
      createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
    });

    const totalShipmentsPreviousYear = await Shipment.countDocuments({
      createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
    });

    // Fetch successful (on-time) deliveries
    const onTimeDeliveriesCurrentYear = await Shipment.countDocuments({
      status: orderStatus.DELIVERED,
      createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
      $expr: { $lte: ["$deliveredDate", "$estimatedDelivery"] },
    });

    const onTimeDeliveriesPreviousYear = await Shipment.countDocuments({
      status: orderStatus.DELIVERED,
      createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
      $expr: { $lte: ["$deliveredDate", "$estimatedDelivery"] },
    });

    //calculate success rate
    const successRateCurrentYear = totalShipmentsCurrentYear
      ? (onTimeDeliveriesCurrentYear / totalShipmentsCurrentYear) * 100
      : 0;

    const successRatePriviousYear = totalShipmentsPreviousYear
      ? (onTimeDeliveriesPreviousYear / totalShipmentsPreviousYear) * 100
      : 0;

    //fetch delayed deliveries
    const lateDeliveriesCurrentYear = await Shipment.countDocuments({
      status: orderStatus.DELIVERED,
      createdAt: { $gte: currentYearStart, $lte: currentYearEnd },
      $expr: { $gt: ["$deliveredDate", "$estimatedDelivery"] },
    });

    const lateDeliveriesPreviousYear = await Shipment.countDocuments({
      status: orderStatus.DELIVERED,
      createdAt: { $gte: previousYearStart, $lte: previousYearEnd },
      $expr: { $gt: ["$deliveredDate", "$estimatedDelivery"] },
    });

    //calculate delay rate
    const delayRateCurrentYear = totalShipmentsCurrentYear
      ? (lateDeliveriesCurrentYear / totalShipmentsCurrentYear) * 100
      : 0;

    const delayRatePreviousYear = totalShipmentsPreviousYear
      ? (lateDeliveriesPreviousYear / totalShipmentsPreviousYear) * 100
      : 0;

    //return calculated data
    return res.json({
      totalShipments: {
        currentYear: totalShipmentsCurrentYear,
        previouseYear: totalShipmentsPreviousYear,
        changes: percentageChange(
          totalShipmentsCurrentYear,
          totalShipmentsPreviousYear
        ),
      },

      successRate: {
        currentYear: successRateCurrentYear + "%",
        previousYear: successRatePriviousYear + "%",
        change:
          percentageChange(successRateCurrentYear, successRatePriviousYear) +
          "%",
      },

      delayRate: {
        currentYear: delayRateCurrentYear + "%",
        previousYear: delayRatePreviousYear + "%",
        change:
          percentageChange(delayRateCurrentYear, delayRatePreviousYear) + "%",
      },

      //efficiency on basis of shipment on time
      efficiency: {
        currentYear: successRateCurrentYear + "%",
        previousYear: successRatePriviousYear + "%",
        change:
          percentageChange(successRateCurrentYear, successRatePriviousYear) +
          "%",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getShipmentPerformance,
};
