const { Product } = require("../models/product.models");
const { Order } = require("../models/order.models");
const { orderStatus } = require("../global/index");
const { ApiResponse } = require("../services/ApiResponse");
class DashboardController {
  static async getStockSummary(req, res) {
    try {
      const totalStock = await Product.aggregate([
        {
          $group: {
            _id: null,
            total_stock: { $sum: "$total_stock" },
          },
        },
      ]);

      //   console.log(totalStock);

      const lowStock = await Product.find({
        $expr: { $lt: ["total_stock", "restock_threshold"] },
      });
      // console.log(lowStock);

      const lowstockproducts = await Product.aggregate([
        {
          $match: { $expr: { $lt: ["total_stock", "restock_threshold"] } },
        },
      ]);

      // //   console.log(lowstockproducts);

      // //out of stock products

      const outOfStock = await Product.aggregate([
        {
          $match: { total_stock: 0 },
        },
        {
          $group: {
            _id: null,
            totalOutOfStock: { $sum: 1 },
          },
        },
      ]);

      // console.log(outOfStock);

      return res.status(200).json({
        success: true,
        data: {
          totalStock: totalStock[0].total_stock || 0,
          lowStock: lowStock,
          lowstockproducts: lowstockproducts,
          outOfStock: outOfStock,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }

  static async getOrderShipentSummary(req, res) {
    try {
      const totalShipments = await Order.countDocuments({
        order_status: orderStatus.SHIPPED,
      });

      // console.log(totalShipments);

      const totalOrder = await Order.countDocuments({});
      // console.log(totalOrder);

      const totalDelivered = await Order.countDocuments({
        order_status: orderStatus.DELIVERED,
      });

      // console.log(totalOrder);

      const totalRevenue = await Order.aggregate([
        {
          $match: { order_status: orderStatus.DELIVERED },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$total_amount" },
          },
        },
      ]);
      // console.log(totalRevenue);
      // Check if the aggregation result is empty
      const total_revenue =
        totalRevenue.length > 0 ? totalRevenue[0].revenue : 0;

      return res.status(200).json({
        success: true,
        data: {
          totalShipments: totalShipments,
          totalDelivered: totalDelivered,
          totalRevenue: total_revenue,
          totalOrder: totalOrder,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getTotalSalesSummary(req, res) {
    try {
      const monthlysalesperformance = await Order.aggregate([
        {
          $match: { order_status: orderStatus.DELIVERED },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" }, //extract year only from the createdAt date time field
              month: { $dateToString: { format: "%B", date: "$createdAt" } },
            },
            totalRevenue: { $sum: "$total_amount" },
            totalOrders: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.month": 1 }, //sort by date
        },
      ]);

      console.log(monthlysalesperformance);
      const formattedSales = {};
      monthlysalesperformance.forEach(({ _id, totalRevenue, totalOrders }) => {
        const { year, month } = _id;
        // console.log(year, month);
        if (!formattedSales[year]) {
          formattedSales[year] = {};
        }
        formattedSales[year][month] = { totalRevenue, totalOrders };
      });
      // console.log(formattedSales);

      //compare with previous year
      const growthData = [];

      //object.keys will return an array of object keys i.e. formattedSales
      //and forEach loop through the array return by the object.keys()
      Object.keys(formattedSales).forEach((year) => {
        // console.log(typeof year);
        const previousYear = (parseInt(year) - 1).toString();
        Object.keys(formattedSales[year]).forEach((month) => {
          const current = formattedSales[year][month];
          // console.log(current);
          const previous = formattedSales[previousYear]?.[month] || {
            totalRevenue: 0,
            totalOrders: 0,
          };
          // console.log(previous);

          //if previous totalRevenue is there then calculate the revenue growth
          //if not then just return current.totalRevenue if greater then 0 then return 100
          const revenueGrowth = previous.totalRevenue
            ? ((current.totalRevenue - previous.totalRevenue) /
                previous.totalRevenue) *
              100
            : current.totalRevenue > 0
            ? 100
            : 0;

          const orderGrowth = previous.totalOrders
            ? ((current.totalOrders - previous.totalOrders) /
                previous.totalOrders) *
              100
            : current.totalOrders > 0
            ? 100
            : 0;

          growthData.push({
            year,
            month,
            totalRevenue: current.totalRevenue,
            totalOrders: current.totalOrders,
            revenueGrowth: revenueGrowth.toFixed(2) + "%", //tofixed will set the numbers after decimal point
            orderGrowth: orderGrowth.toFixed(2) + "%",
          });
        });
      });

      // console.log(growthData);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            growthData[0],
            "sales performance data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "internal server error",
      });
    }
  }
}

module.exports = {
  DashboardController,
};
