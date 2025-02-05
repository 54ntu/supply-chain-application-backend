const { Product } = require("../models/product.models");
const { createNotification } = require("../services/notificationService");
const { Order } = require("../models/order.models");
const { Variant } = require("../models/variants.models");
const { OrderItem } = require("../models/orderItems.models");
const { ApiResponse } = require("../services/ApiResponse");
const { isValidObjectId } = require("mongoose");
const { ShippingDetail } = require("../models/address.models");
const { default: mongoose } = require("mongoose");
const { orderStatus, shipmentMethods } = require("../global");
const { Shipment } = require("../models/shipment.models");
class OrderController {
  static async createOrder(req, res) {
    //get the salesperson id from req.user as salesperson neeed to be logged in to create order
    //and also the role from req.user.role
    //get the customer id from req.body
    //get all the data from teh req.body
    //validate all the details
    //calculate total amount
    //create new order
    //check the stock level whether the stock level is greater than the ordered quantity of the products
    //create OrderItems of the same order
    //also check whether the stock level drop below the restock threshold
    //if below restock threshold create notification

    try {
      const salespersonId = req.user._id;
      const role = req.user.role;
      if (!salespersonId) {
        return res.status(400).json({
          success: false,
          message: "salesperson id is required",
        });
      }

      const {
        customerId,
        discount,
        shipping_charge,
        tax,
        order_status,
        payment_status,
        shippingMethod,
        orderItems,
      } = req.body;
      if (!customerId || !orderItems) {
        return res.status(400).json({
          success: false,
          message: "customerId && orderItems are required",
        });
      }

      let total_amount = 0;
      let total_quantity = 0;
      let subtotal = 0;

      //get each item of the orderItems
      for (let item of orderItems) {
        //first get the product from the Product collection
        const product = await Product.findById(item.productId);
        // console.log(`product.variants :${product}`);

        //check stock level
        if (product.total_stock < item.quantity) {
          await createNotification({
            userId: salespersonId,
            userType: role,
            type: "stock",
            title: "low stock",
            message: `not enough stock for ${product.product_name}. Only ${product.total_stock}left `,
          });
        }

        //check for restock threshold
        if (product.total_stock - item.quantity < product.restock_threshold) {
          await createNotification({
            userId: salespersonId,
            userType: role,
            type: "stock",
            title: "Restock Reminder",
            message: `product ${product.product_name} ${product.FKU} has dropped below the threshold`,
          });
        }

        //calculate the item total price
        subtotal += item.quantity * item.price - item.discount;

        //calculate the total quantity
        total_quantity += item.quantity;
      }
      total_amount = subtotal + shipping_charge + tax - discount;
      // console.log(total_quantity);

      //get the shipping address of the related customer
      const shippingAddress = await ShippingDetail.findOne({ customerId });
      if (!shippingAddress) {
        return res.status(404).json({
          message: "shipping address not found for the given customer",
        });
      }

      //create new order
      const newOrder = await Order.create({
        salesPerson: salespersonId,
        customer: customerId,
        discount,
        shipping_charge,
        shippingMethod,
        tax,
        order_status,
        payment_status,
        total_quantity,
        subtotal,
        total_amount,
        shippingAddress: shippingAddress,
      });
      // console.log("new order samma puge hoi");

      if (!newOrder) {
        return res.status(500).json({
          success: false,
          message: "order creation failed.!😒😒😒😒",
        });
      }

      //create order Items
      const orderItemsData = orderItems.map((item) => ({
        orderId: newOrder._id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total_price: item.quantity * item.price - item.discount,
      }));

      const createdOrderItems = await OrderItem.insertMany(orderItemsData);
      if (createdOrderItems.length === 0) {
        return res.status(500).json({
          success: false,
          message: "orderItems creation failed",
        });
      }

      //code for reducing the stock level of the products based on the variants
      for (let item of orderItems) {
        console.log(`item : ${item.quantity}`);
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "product not found",
          });
        }

        //fetch variants data from the variant collect by comparing both variant id and product id stored in the variant collection
        const variants = await Variant.find({
          _id: { $in: product.variants },
          product_id: product._id,
        });
        // console.log(variants);

        //decrease the variant wise stock
        for (let variant of variants) {
          if (variant.stock >= item.quantity) {
            variant.stock -= item.quantity; //reduce the stock of the variant
            await variant.save();
          } else {
            await createNotification({
              userId: salespersonId,
              userType: role,
              type: "stock",
              title: "restock_alert",
              message: `variant of id ${variant._id} has dropped below threshold`,
            });
          }
        }
      }
      //send the response
      return res.status(201).json(
        new ApiResponse(
          201,
          {
            ...newOrder._doc,
            order_items: createdOrderItems,
          },
          "order created successfully"
        )
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: `something went wrong${error}`,
      });
    }
  }

  static async getOrder(req, res) {
    //get the salesperson id from the req.user
    const salespersonId = req.user._id;

    if (!salespersonId) {
      return res.status(400).json({
        message: "please provide salesperson id",
      });
    }

    const orders = await Order.aggregate([
      {
        $match: {
          salesPerson: new mongoose.Types.ObjectId(salespersonId),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      {
        $lookup: {
          from: "shippingdetails",
          localField: "shippingAddress",
          foreignField: "_id",
          as: "shippingDetails",
        },
      },

      {
        $unwind: "$shippingDetails",
      },
      {
        $project: {
          _id: 1,
          createdAt: 1,
          customer: { $arrayElemAt: ["$customerDetails.customerName", 0] },
          Destination: {
            $concat: [
              { $ifNull: ["$shippingDetails.province", ""] },
              ",",
              { $ifNull: ["$shippingDetails.city", ""] },
            ],
          },
          total_amount: 1,
          order_status: 1,
        },
      },
    ]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: `order is not available for the salesperon with id ${salespersonId}`,
      });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "order fetched successfully"));
  }

  static async getOrderByid(req, res) {
    //get the order id from the req.params
    const { id } = req.params;
    // console.log(typeof id);
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "invalid id",
      });
    }

    //fetch the order data from the database

    const orders = await Order.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customer",
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
          localField: "shippingAddress",
          foreignField: "_id",
          as: "shippingDetails",
        },
      },

      {
        $unwind: "$shippingDetails",
      },

      //get the orderItems
      {
        $lookup: {
          from: "orderitems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderitemsDetails",
        },
      },
      {
        $unwind: "$orderitemsDetails",
      },

      {
        $lookup: {
          from: "products",
          localField: "orderitemsDetails.productId",
          foreignField: "_id",
          as: "productdetails",
        },
      },

      {
        $unwind: "$productdetails",
      },

      //fetch the category as well
      {
        $lookup: {
          from: "categories",
          localField: "productdetails.category",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $unwind: "$categories",
      },

      {
        $group: {
          _id: "$_id",
          createdAt: { $first: "$createdAt" },
          customerDetails: { $first: "$customerDetails" },
          shippingDetails: { $first: "$shippingDetails" },
          total_amount: { $first: "$total_amount" },
          order_status: { $first: "$order_status" },
          orderItems: {
            $push: {
              quantity: "$orderitemsDetails.quantity",
              price: "$orderitemsDetails.price",
              discount: "$orderitemsDetails.discount",
              total_price: "$orderitemsDetails.total_price",
              productdetails: {
                product_name: "$productdetails.product_name",
                FKU: "$productdetails.FKU",
              },
              category: {
                category_name: "$categories.category_name",
              },
            },
          },
        },
      },
    ]);

    return res.json(orders);
  }

  static async updateOrder(req, res) {
    //get the orderid from the req.params
    //get the distributor id from the req.user
    try {
      const { id } = req.params;
      const distributorid = req.user._id;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "invalid order id ",
        });
      }

      if (!distributorid) {
        return res.status(400).json({
          success: false,
          message: "distributorid is required..",
        });
      }

      //get the data from the req.body
      const { order_status, payment_status, shippingMethod } = req.body;

      if (!order_status || !payment_status) {
        return res.status(400).json({
          success: false,
          message: "orderstatus && paymentstatus fields are required",
        });
      }

      //we are applying this aggregation because we donot have direct distributor id access
      //i want that only the legit distributor can perform this operation
      const order = await Order.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salesPerson",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
        {
          $match: {
            "salespersonDetails.distributor": new mongoose.Types.ObjectId(
              distributorid
            ),
          },
        },
      ]);

      //verify order
      if (!order || order.length === 0) {
        return res.status(404).json({
          message: "order data not found or unauthorized access",
        });
      }

      //find the order by orderid and update the status
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        {
          order_status,
          payment_status,
        },
        {
          new: true,
        }
      );

      // Generate tracking number
      const trackingNumber = `TRK-${Date.now()}-${Math.floor(
        Math.random() * 10000
      )}`;

      //add checks and logic for creating estimatedDelivery
      let estimatedDelivery = new Date();
      if (updatedOrder.shippingMethod === shipmentMethods.EXPRESS) {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 2); //2 days
      } else if (updatedOrder.shippingMethod === shipmentMethods.SAMEDAY) {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 12); //12 hours
      } else {
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); //5days
      }

      // console.log(updatedOrder);
      //check order status and if orderstatus is confirmed then create shipment
      if (updatedOrder.order_status == orderStatus.CONFIRMED) {
        const shipment = await Shipment.create({
          orderId: updatedOrder._id,
          distributorId: distributorid,
          shippingAddress: updatedOrder.shippingAddress,
          shippingMethod: updatedOrder.shippingMethod,
          trackingNumber: trackingNumber,
          shippingcost: updatedOrder.shipping_charge,
          estimatedDelivery: estimatedDelivery,
        });
      }

      return res.status(200).json({
        success: true,
        updatedOrder,
        message:
          "order with the given id is updated and shipment is created successfully.!",
      });
    } catch (error) {
      return res.status(500).json({
        message: "order updation failed",
      });
    }
  }
}

module.exports = {
  OrderController,
};
