const { Product } = require("../models/product.models");
const { createNotification } = require("../services/notificationService");
const { Order } = require("../models/order.models");
const { OrderItem } = require("../models/orderItems.models");
const { ApiResponse } = require("../services/ApiResponse");
class OrderController {
  static async createOrder(req, res) {
    //get the salesperson id from req.user as salesperson neeed to be logged in to create order
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
        orderItems,
      } = req.body;
      if (!customerId || !orderItems) {
        return res.status(400).json({
          success: false,
          message: "customerId && orderItems are required",
        });
      }

      let total_amount = 0;

      //get each item of the orderItems
      for (let item of orderItems) {
        //first get the product from the Product collection

        const product = await Product.findById(item.productId);

        //check stock level
        if (product.total_stock < item.quantity) {
          await createNotification(
            salespersonId,
            "stock",
            "low stock",
            `not enough stock for ${product.product_name}. Only ${product.total_stock}left `
          );
        }

        //check for restock threshold
        if (product.total_stock - item.quantity < product.restock_threshold) {
          await createNotification(
            salespersonId,
            "stock",
            "Restock Reminder",
            `product ${product.product_name} ${product.FKU} has dropped below the threshold`
          );
        }

        //calculate the item total price
        total_amount = item.quantity * item.price - item.discount;
      }
      total_amount += shipping_charge + tax - discount;

      //create new order
      const newOrder = await Order.create({
        customer: customerId,
        discount,
        shipping_charge,
        tax,
        order_status,
        payment_status,
        total_amount,
      });

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

      //send the response
      return res.status(201).json(
        new ApiResponse(
          201,
          {
            ...newOrder,
            order_items: createdOrderItems,
          },
          "order created successfully"
        )
      );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }
}

module.exports = {
  OrderController,
};
