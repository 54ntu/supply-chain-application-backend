const { isValidObjectId, default: mongoose } = require("mongoose");
const { Order } = require("../models/order.models");
const { Refund } = require("../models/returnRefund.models");
const { refundRequest } = require("../global");
const { ApiResponse } = require("../services/ApiResponse");
const { SalesPerson } = require("../models/salesPerson.models");

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
    const refund = await Refund.create({
      orderId: order,
      salespersonId,
      reason,
      status: refundRequest.PENDING,
    });

    if (!refund) {
      return res.status(500).json({
        success: false,
        message: "refund request creation failed",
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, refund, "request created successfully"));
  }

  static async getRefundRequestData(req, res) {
    //i think this api will be for the distributor and i want to fetch those request created by the
    //salesperson who belongs to logged in distributor

    //get the distributor id from the req.user._id
    const distributorId = req.user._id;
    if (!distributorId) {
      return res.status(400).json({
        success: false,
        message: "distributor id is required",
      });
    }

    //find the salesperson belongs to that distributor
    const salespersons = await SalesPerson.find({ distributor: distributorId });
    if (salespersons.length === 0) {
      return res.status(400).json({
        success: false,
        message: "salespersons data related to you(distributor) not found",
      });
    }

    //extract salespersons id
    const salespersonid = salespersons.map((salesperson) => salesperson._id);

    // console.log(salespersonId);
    //fetch the data from the Refund schema on the basis of salesperson id
    const refundRequests = await Refund.aggregate([
      {
        $match: { salespersonId: { $in: salespersonid } },
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

      //for salesrep
      {
        $lookup: {
          from: "salespeople",
          localField: "salespersonId",
          foreignField: "_id",
          as: "salespersonDetails",
        },
      },
      {
        $unwind: "$salespersonDetails",
      },
      {
        $project: {
          orderId: 1,
          createdAt: 1,
          customerId: "$orderDetails.customer",
          salesRepresentative: {
            $concat: [
              { $ifNull: ["$salespersonDetails.firstname", ""] },
              " ",
              { $ifNull: ["$salespersonDetails.lastname", ""] },
            ],
          },
          reason: 1,
          status: 1,
        },
      },
    ]);
    // console.log(refundRequests);

    if (refundRequests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "request not available",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, refundRequests, "request fetched successfully")
      );
  }

  static async findRefundRequestDataById(req, res) {
    //get the refundrequest id from the req.params
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "please provide valid request id ",
        });
      }

      //query to the model
      const refundDatas = await Refund.aggregate([
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
        //for orderItems
        {
          $lookup: {
            from: "orderitems",
            localField: "orderDetails._id",
            foreignField: "orderId",
            as: "orderItemsDetails",
          },
        },

        //lookup for product data
        {
          $lookup: {
            from: "products",
            localField: "orderItemsDetails.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },

        //embed product data inside the order items and select the required fields
        {
          $addFields: {
            orderItemsDetails: {
              $map: {
                input: "$orderItemsDetails",
                as: "orderItem",
                in: {
                  _id: "$$orderItem._id",
                  quantity: "$$orderItem.quantity",
                  price: "$$orderItem.price",
                  discount: "$$orderItem.discount",
                  total_price: "$$orderItem.total_price",
                  product: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: "$productDetails",
                          as: "product",
                          cond: {
                            $eq: ["$$product._id", "$$orderItem.productId"],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $unset: "productDetails",
        },

        {
          $lookup: {
            from: "salespeople",
            localField: "salespersonId",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
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
        {
          $lookup: {
            from: "shippingdetails",
            localField: "orderDetails.shippingAddress",
            foreignField: "_id",
            as: "shippingDetails",
          },
        },
        {
          $unwind: "$shippingDetails",
        },

        {
          $project: {
            orderId: 1,
            createdAt: 1,
            customerId: "$orderDetails.customer",
            salesRepresentative: {
              $concat: [
                { $ifNull: ["$salespersonDetails.firstname", ""] },
                " ",
                {
                  $ifNull: ["$salespersonDetails.lastname", ""],
                },
              ],
            },
            billingAddress: {
              $concat: [
                { $ifNull: ["$shippingDetails.landmark", ""] },
                " ",
                { $ifNull: ["$shippingDetails.Area", ""] },
                " ",
                { $ifNull: ["$shippingDetails.Address", ""] },
                " ",
                { $ifNull: ["$shippingDetails.province", ""] },
                " ",
                { $ifNull: ["$shippingDetails.city", ""] },
              ],
            },

            customerInfo: {
              customerName: "$customerDetails.customerName",
              phone: "$customerDetails.phone",
              email: "$customerDetails.email",
            },
            orderItems: {
              $map: {
                input: "$orderItemsDetails",
                as: "item",
                in: {
                  _id: "$$item._id",
                  quantity: "$$item.quantity",
                  price: "$$item.price",
                  discount: "$$item.discount",
                  total: "$$item.total_price",
                  product: {
                    _id: "$$item.product._id",
                    productName: "$$item.product.product_name",
                  },
                },
              },
            },

            paymentDetails: {
              subtotal: "$orderDetails.subtotal",
              shippingCharge: "$orderDetails.shipping_charge",
              discount: "$orderDetails.discount",
              tax: "$orderDetails.tax",
              total: "$orderDetails.total_amount",
            },
          },
        },
      ]);

      if (refundDatas.length === 0) {
        return res.status(404).json({
          success: false,
          message: "refund data not found",
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(200, refundDatas, "request fetched successfully")
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "error on fetching the return and refund request data",
      });
    }
  }
}

module.exports = {
  RefundController,
};
