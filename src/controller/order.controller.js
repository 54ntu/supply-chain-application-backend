const { Product } = require("../models/product.models");
const { createNotification } = require("../services/notificationService");
const { Order } = require("../models/order.models");
const { Variant } = require("../models/variants.models");
const { OrderItem } = require("../models/orderItems.models");
const { ApiResponse } = require("../services/ApiResponse");
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
        total_amount += item.quantity * item.price - item.discount;

        //calculate the total quantity
        total_quantity += item.quantity;
      }
      total_amount += shipping_charge + tax - discount;
      // console.log(total_quantity);

      //create new order
      const newOrder = await Order.create({
        salesPerson: salespersonId,
        customer: customerId,
        discount,
        shipping_charge,
        tax,
        order_status,
        payment_status,
        total_quantity,
        total_amount,
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
}

module.exports = {
  OrderController,
};
