const { isValidObjectId } = require("mongoose");
const { Order } = require("../models/order.models");
const { Refund } = require("../models/returnRefund.models");
const { refundRequest } = require("../global");
const { ApiResponse } = require("../services/ApiResponse");

class RefundController {
  static async createRefundRequest(req, res) {
    //get the order id from the req.params
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "order id is invalid",
      });
    }

    //get the salespersonid from the req.user
    const salespersonId = req.user._id;
    if (!salespersonId) {
      return res.status(400).json({
        success: false,
        message: "id is invalid",
      });
    }

    //get the data from the request.body
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "reason is required",
      });
    }

    //since salesperson is going to create this refund request on behalf of the customer so that we have to check
    //whether the order is created by that salesperson or not
    const order = await Order.findOne({
      _id: id,
      salesPerson: salespersonId,
    });
    // console.log(order);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "matching order with orderid and salesperson id not found",
      });
    }

    //create refund request
    const refundRequest = await Refund.create({
      orderId: order,
      salespersonId,
      reason,
      status: refundRequest.PENDING,
    });

    if (!refundRequest) {
      return res.status(500).json({
        success: false,
        message: "refund request creation failed",
      });
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, refundRequest, "request created successfully")
      );
  }
}

module.exports = {
  RefundController,
};
