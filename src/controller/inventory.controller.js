const { Product } = require("../models/product.models");
const { OrderItem } = require("../models/orderItems.models");
const { orderStatus } = require("../global/index");
const { Variant } = require("../models/variants.models");

const getInvetorySummary = async (req, res) => {
  //calculate total inventory
  try {
    const totalUnitsOnHand = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$total_stock" }, //product total_stock = stock of variants of the each product
        },
      },
    ]);

    //calculate units on order
    //it is calculate on the basis of order which is on pending or processing states
    const unitsOnOrder = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "orderDetail",
        },
      },
      {
        $match: {
          "orderDetail.order_status": {
            $in: [orderStatus.PENDING, orderStatus.PROCESSING],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalOrdered: { $sum: "$quantity" },
        },
      },
    ]);

    //   console.log(unitsOnOrder);

    //fetch the total units to reorder(stock <restock_threshold)

    const unitToreorder = await Product.find({
      $expr: { $lt: ["$total_stock", "$restock_threshold"] },
    });
    //   console.log(unitToreorder);

    //total inventory amount
    const totalInventory = await Variant.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: {
            $sum: {
              $multiply: [
                { $toDouble: "$variant_price" }, //this will convert string  value to number
                { $toDouble: "$stock" },
              ],
            },
          },
        },
      },
    ]);
    //   console.log(totalInventory);

    return res.status(200).json({
      success: true,
      data: {
        totalUnitsOnHand: totalUnitsOnHand[0].totalStock || 0,
        unitsOnOrder: unitsOnOrder[0].totalOrdered || 0,
        unitToreorder: unitToreorder,
        totalInventory: totalInventory[0].totalAmount || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
};

module.exports = {
  getInvetorySummary,
};
