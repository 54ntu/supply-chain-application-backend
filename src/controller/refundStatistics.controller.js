const { refundRequest } = require("../global");
const { Refund } = require("../models/returnRefund.models");
const { ApiResponse } = require("../services/ApiResponse");

class RefundStatistics {
  static async getRefundStats(req, res) {
    // console.log("moh yeta puge hoi");

    try {
      const stats = await Refund.aggregate([
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

        // lookup for orderitems so that we can calculate the total returned items
        {
          $lookup: {
            from: "orderitems",
            localField: "orderDetails._id",
            foreignField: "orderId",
            as: "orderItemsDetails",
          },
        },

        {
          $addFields: {
            totalReturnItems: {
              $reduce: {
                input: "$orderItemsDetails",
                initialValue: 0,
                in: { $add: ["$$value", { $ifNull: ["$$this.quantity", 0] }] },
              },
            },
          },
        },

        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            approvedRequests: {
              $sum: {
                $cond: [{ $eq: ["$status", refundRequest.APPROVED] }, 1, 0],
              },
            },
            pendingRequests: {
              $sum: {
                $cond: [{ $eq: ["$status", refundRequest.PENDING] }, 1, 0],
              },
            },
            totalApprovedRefundAmount: {
              $sum: {
                $cond: [
                  { $eq: ["$status", refundRequest.APPROVED] },
                  { $ifNull: ["$orderDetails.total_amount", 0] },
                  0,
                ],
              },
            },

            totalReturnItems: {
              $sum: {
                $cond: [
                  { $eq: ["$status", refundRequest.APPROVED] },
                  "$totalReturnItems",
                  0,
                ],
              },
            },
          },
        },
      ]);

      if (stats.length === 0) {
        return res.status(404).json({
          message: "refund stats not found",
        });
      }

      return res
        .status(200)
        .json(new ApiResponse(200, stats[0], "stats fetched successfully"));
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong",
      });
    }
  }
}

module.exports = {
  RefundStatistics,
};
