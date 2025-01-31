const { Customer } = require("../models/customer.models");
const { ApiResponse } = require("../services/ApiResponse");

class CustomerController {
  static async addCustomer(req, res) {
    //get the distributor id from the req.user
    //get the salesperson id and other data from the req.body
    //get the customer image from req.file
    //validate data
    //check whether the customer email id is present already or not
    //if exist then send response
    //if not then create new customer
    //if created then return the response
    try {
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          message: "distributor id is not provided",
        });
      }

      const customerpic = req.file?.filename;
      if (!customerpic) {
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
        !preferredShippingMethod ||
        !customerpic ||
        !salespersonId
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

      //check whether the customer with the given email exist or not
      const isCustomerExist = await Customer.findOne({ email });
      if (isCustomerExist) {
        return res.status(400).json({
          message: `customer with given email ${email} already exist`,
        });
      }

      const customerdata = await Customer.create({
        customerName,
        customerId,
        email,
        customerpic,
        phone,
        preferredShippingMethod,
        storeName,
        address,
        salespersonId,
        distributorId: distributorid,
      });

      if (!customerdata) {
        return res.status(500).json({
          message: "customer creation failed.!",
        });
      }
      return res
        .status(201)
        .json(
          new ApiResponse(201, customerdata, "customer created successfully.!")
        );
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong.!",
      });
    }
  }

  static async getCustomer(req, res) {
    //get the distributor id from the req.user
    //validate the distributor id provided or not
    //find the customer details by comparing distributor id store in the customer table

    try {
      const distributorid = req.user._id;
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
}

module.exports = {
  CustomerController,
};
