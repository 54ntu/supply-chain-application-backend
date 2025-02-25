const { isValidObjectId } = require("mongoose");
const { Customer } = require("../models/customer.models");
const { SalesPerson } = require("../models/salesPerson.models");
const { ApiResponse } = require("../services/ApiResponse");
const { default: mongoose } = require("mongoose");
const { uploadOnCloudinary } = require("../services/cloudinary");
const { Order } = require("../models/order.models");

class CustomerController {
  static async addCustomer(req, res) {
    try {
      const userid = req.user._id;
      const userRole = req.user.role;
      console.log(userRole);
      if (!userid) {
        return res.status(400).json({
          message: "uesrid is not provided",
        });
      }

      const customerLocalFilePath = req.file?.path;
      if (!customerLocalFilePath) {
        return res.status(400).json({
          message: "customer pic is required.!",
        });
      }
      const {
        customerName,
        customerId,
        email,
        phone,
        storeName,
        address,
        preferredShippingMethod,
        salespersonId,
      } = req.body;

      if (
        !customerName ||
        !customerId ||
        !email ||
        !phone ||
        !storeName ||
        !address ||
        !preferredShippingMethod
      ) {
        return res.status(400).json({
          message: "all fields are required.!",
        });
      }

      //check email is valid or not
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      //validate phone number length
      if (phone.length !== 10) {
        return res
          .status(400)
          .json({ error: "Phone number must be exactly 10 digits." });
      }

      //check if salesperson exist or not
      let salespersonExist;

      if (userRole === "distributor") {
        salespersonExist = await SalesPerson.findById(salespersonId);
        if (!salespersonExist) {
          return res.status(404).json({
            message: "salesperson id is not valid",
          });
        }
      } else if (userRole === "salesperson") {
        salespersonExist = await SalesPerson.findById(userid);
      }

      //check whether the customer with the given email exist or not
      const isCustomerExist = await Customer.findOne({ email });
      if (isCustomerExist) {
        return res.status(400).json({
          message: `customer with given email ${email} already exist`,
        });
      }

      //uploard customer image into the cloudinary
      const customerImage = await uploadOnCloudinary(customerLocalFilePath);
      // console.log(customerImage);

      //create customer
      let customerData;

      if (userRole === "distributor") {
        customerData = await Customer.create({
          customerName,
          customerId,
          email,
          customerpic: customerImage.url,
          phone,
          preferredShippingMethod,
          storeName,
          isActive: true,
          address,
          salespersonId: salespersonId,
          distributorId: userid,
        });
      } else if (userRole === "salesperson") {
        customerData = await Customer.create({
          customerName,
          customerId,
          email,
          customerpic: customerImage.url,
          phone,
          preferredShippingMethod,
          storeName,
          isActive: true,
          address,
          salespersonId: userid,
          distributorId: salespersonExist.distributor,
        });
      }

      if (!customerData) {
        return res.status(500).json({
          message: "customer creation failed.!",
        });
      }
      return res
        .status(201)
        .json(
          new ApiResponse(201, customerData, "customer created successfully.!")
        );
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong.!",
      });
    }
  }

  //here logged in salesperson will get the customer details
  //which are assigned to them
  static async getCustomerDetailsForSalesPerson(req, res) {
    try {
      //get the salesperson id from req.user
      const salespersonid = req.user._id;
      console.log(req.user.role);
      if (!salespersonid) {
        return res.status(400).json({
          success: false,
          message: "salesperson id is required",
        });
      }

      //filter the customer table on the basis of salesperson id
      const customerDetails = await Customer.aggregate([
        {
          $match: {
            salespersonId: new mongoose.Types.ObjectId(salespersonid),
          },
        },
        // {
        //   $project: {
        //     customerName: 1,
        //     address: 1,
        //     email: 1,
        //     phone: 1,
        //     customerpic: 1,
        //   },
        // },
      ]);

      if (customerDetails.length === 0) {
        return res.status(404).json({
          success: false,
          message: "customer data not found",
        });
      }

      return res.status(200).json({
        success: true,
        customerDetails,
        message: "customer data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getCustomerDetailsById(req, res) {
    //get the customer id from req.params
    try {
      const { id } = req.params;
      //get the salesperson id from req.user
      const salespersonid = req.user._id;
      if (!salespersonid) {
        return res.status(400).json({
          success: false,
          message: "salesperson id is not found",
        });
      }

      const customerDetails = await Customer.aggregate([
        {
          $match: {
            $and: [
              { _id: new mongoose.Types.ObjectId(id) },
              { salespersonId: new mongoose.Types.ObjectId(salespersonid) },
            ],
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salespersonId",
            foreignField: "_id",
            as: "salespersondetails",
          },
        },
        {
          $unwind: "$salespersondetails",
        },
        {
          $project: {
            customerId: 1,
            phone: 1,
            email: 1,
            address: 1,
            storeName: 1,
            createdAt: 1,
            preferredShippingMethod: 1,
            salesRepresentative: {
              $concat: [
                { $ifNull: ["$salespersondetails.firstname", ""] },
                " ",
                { $ifNull: ["$salespersondetails.lastname", ""] },
              ],
            },
          },
        },
      ]);

      // console.log(customerDetails);
      if (customerDetails.length === 0) {
        return res.status(500).json({
          success: false,
          message: "something went wrong",
        });
      }

      //get the order for the given customer
      const orderDetails = await Order.aggregate([
        {
          $match: {
            customer: new mongoose.Types.ObjectId(id),
          },
        },
        //also join shipment collection as orderId is stored in the shipment collection
        {
          $lookup: {
            from: "shipments",
            localField: "_id",
            foreignField: "orderId",
            as: "shipmentDetails",
          },
        },
        {
          $unwind: "$shipmentDetails",
        },

        {
          $lookup: {
            from: "orderitems",
            localField: "_id",
            foreignField: "orderId",
            as: "orderItemsDetails",
          },
        },
        {
          $unwind: "$orderItemsDetails",
        },

        //join products with orderItems

        {
          $lookup: {
            from: "products",
            localField: "orderItemsDetails.productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },

        //join category with products
        {
          $lookup: {
            from: "categories",
            localField: "productDetails.category",
            foreignField: "_id",
            as: "categoryDetails",
          },
        },
        {
          $unwind: "$categoryDetails",
        },

        {
          $group: {
            _id: "$_id",
            orderId: { $first: "$order_number" }, // Assuming 'order_number' exists in Order schema
            orderDate: { $first: "$createdAt" },
            shippingStatus: { $first: "$shipmentDetails.status" },
            paymentStatus: { $first: "$payment_status" },
            total_amount: { $first: "$total_amount" },
            total_quantity: { $first: "$total_quantity" },
            items: {
              $push: {
                productName: "$productDetails.product_name",
                category: "$categoryDetails.category_name",
                unitCost: "$orderItemsDetails.price",
                quantity: "$orderItemsDetails.quantity",
              },
            },
          },
        },
      ]);

      return res.status(200).json({
        customerData: customerDetails[0],
        orderdata: orderDetails,
        message: "data fetched successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  //this one is for distributor side
  //as distributor is the person who is responsible for adding the customer
  static async getCustomer(req, res) {
    //get the distributor id from the req.user
    //validate the distributor id provided or not
    //find the customer details by comparing distributor id store in the customer table

    try {
      const distributorid = req.user._id;
      console.log(`distributorid : ${distributorid}`);
      if (!distributorid) {
        return res.status(400).json({
          error: "distributor id is required.😒😒😒😒😒",
        });
      }

      //find the customer details added by the logged in distributor based on the distributor id obtained from req.user

      const customers = await Customer.find({ distributorId: distributorid });
      if (customers.length === 0) {
        return res.status(404).json({
          message: `customers are not available for the logged in distributor ${distributorid}`,
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            customers,
            "customers data fetched successfully.😊😊😊😊"
          )
        );
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong",
      });
    }
  }

  static async getCustomerById(req, res) {
    //get the distributor id from the req.user
    //get the customer id from the req.params
    //validate both
    //find customer comparing both distributor id and customer id
    //if not then just give the error message
    //if found send the success message with data

    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          error: "distributor id is required.!",
        });
      }

      // get the customer id from the req.params
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return res.status(400).json({
          error: "invalid customer id please provide valid customer id",
        });
      }

      //fetch the customer data matched with the distributor id and customer id
      const customer = await Customer.aggregate([
        {
          $match: {
            distributorId: new mongoose.Types.ObjectId(distributorid),
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salespersonId",
            foreignField: "_id",
            as: "salespersondetails",
          },
        },

        {
          $unwind: "$salespersondetails",
        },
        {
          $project: {
            customerName: 1,
            storeName: 1,
            phone: 1,
            email: 1,
            address: 1,
            preferredShippingMethod: 1,
            createdAt: 1,
            updatedAt: 1,
            salespersonName: {
              $concat: [
                "$salespersondetails.firstname",
                " ",
                "$salespersondetails.lastname",
              ],
            },
          },
        },
      ]);

      //check if find or not
      if (!customer) {
        return res.status(404).json({
          error: "customer data not found for the following distributor",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            customer,
            `customer data for id  ${id} fetched successfully`
          )
        );
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong",
      });
    }
  }

  static async updateCustomer(req, res) {
    //get the distributor id from the req.user
    //get the customer id from the req.params
    //validate customer id and distributor id
    //get the data from the req.body
    //update the data
    //if success send the success message
    //if not return error message
    const distributorid = req.user._id;
    if (!distributorid) {
      return res.status(400).json({
        error: "distributor id is required.!",
      });
    }

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        error: "please provide customer id ",
      });
    }

    const {
      customerName,
      email,
      phone,
      storeName,
      address,
      preferredShippingMethod,
      salespersonId,
    } = req.body;

    //get the customer image from the req.file
    const customerImageLocalPath = req.file?.path;
    if (!customerImageLocalPath) {
      return res.status(400).json({
        message: "customer image is required",
      });
    }

    //upload customer image file path into the cloudinary
    const imageurl = await uploadOnCloudinary(customerImageLocalPath);
    if (!imageurl) {
      return res.status(500).json({
        message: "error occured while uploading the image into the cloudinary",
      });
    }

    //find the salesperson using given salesperson id
    const isSalesPersonExist = await SalesPerson.findById(salespersonId);
    if (!isSalesPersonExist) {
      return res.status(404).json({
        message: "salesperson with the given id is not found",
      });
    }

    //find the customer using distributor id and customer id
    const isCustomerExist = await Customer.findOne({
      distributorId: distributorid,
      _id: id,
    });

    if (!isCustomerExist) {
      return res.status(404).json({
        error: `customer with id ${id} created by distributor ${distributorid} not exist`,
      });
    }

    if (customerName) isCustomerExist.customerName = customerName;
    if (email) isCustomerExist.email = email;
    if (phone) isCustomerExist.phone = phone;
    if (storeName) isCustomerExist.storeName = storeName;
    if (address) isCustomerExist.address = address;
    if (imageurl) isCustomerExist.customerpic = imageurl.url;
    if (preferredShippingMethod)
      isCustomerExist.preferredShippingMethod = preferredShippingMethod;
    if (salespersonId) isCustomerExist.salespersonId = salespersonId;
    await isCustomerExist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          isCustomerExist,
          "customer data updated successfully"
        )
      );
  }

  static async getcustomerSummary(req, res) {
    // console.log("moh yeta customer tira xu hoi");
    const distributorid = req.user._id; //it is distributor id
    if (!distributorid) {
      return res.status(400).json({
        success: false,
        message: "valid userid is required",
      });
    }
    0;
    const customers = await Customer.aggregate([
      {
        $match: {
          distributorId: new mongoose.Types.ObjectId(distributorid),
        },
      },
      {
        $group: {
          _id: null,
          totalCustomer: { $sum: 1 },
          activeCutomer: {
            $sum: {
              $cond: [{ $eq: ["$isActive", true] }, 1, 0],
            },
          },
        },
      },
    ]);
    // console.log(customers);

    let totalCustomer = customers[0].totalCustomer;
    let activeCustomer = customers[0].activeCutomer;

    // console.log(totalCustomer);
    // console.log(activeCustomer);

    const activeCustomerPercentage = (activeCustomer / totalCustomer) * 100;
    // console.log(activeCustomerPercentage);

    return res.status(200).json({
      success: true,
      message: "customer summary fetched successfully",
      totalCustomer,
      activeCustomerPercentage,
    });
  }

  static async searchCustomers(req, res) {
    try {
      const { storeName, email, address } = req.query;
      const distributorId = req.user._id;
      if (!distributorId) {
        return res.status(400).json({
          success: false,
          message: "distributor id is required",
        });
      }

      let filter = { distributorId: distributorId };
      if (storeName) {
        filter.storeName = { $regex: storeName, $options: "i" };
      }

      if (email) {
        filter.email = { $regex: email, $options: "i" };
      }

      if (address) {
        filter.address = { $regex: address, $options: "i" };
      }

      const data = await Customer.find(filter);

      // console.log(data);

      if (!data || data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "matching customer data not found",
        });
      }

      return res.status(200).json({
        success: true,
        data,
        message: "matching customer data fetched successfully",
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
  CustomerController,
};
