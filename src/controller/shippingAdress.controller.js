const { isValidObjectId } = require("mongoose");
const { ShippingDetail } = require("../models/address.models");
const { ApiResponse } = require("../services/ApiResponse");
class ShippingAddress {
  static async addShippingAddress(req, res) {
    //get the data from the req.body
    const {
      customerId,
      fullName,
      phone,
      province,
      city,
      Area,
      Address,
      landmark,
    } = req.body;

    if (
      !customerId ||
      !fullName ||
      !phone ||
      !province ||
      !city ||
      !Area ||
      !Address ||
      !landmark
    ) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    const address = await ShippingDetail.create({
      customerId,
      fullName,
      phone,
      province,
      city,
      Area,
      Address,
      landmark,
    });

    if (!address) {
      return res.status(500).json({
        success: false,
        message: "error while adding shipping address",
      });
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, address, "shipping address added successfully")
      );
  }

  static async getShippingDetails(req, res) {
    //get the customer id from the req.body
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customer id is required....!!",
      });
    }

    const shippingAddress = await ShippingDetail.find({ customerId });
    if (!shippingAddress) {
      return res.status(404).json({
        message: "please add new address",
      });
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          shippingAddress,
          "shipping address fetched successfully"
        )
      );
  }
  static async updateShippingAddress(req, res) {
    //get the data and customerid from the req.body
    //get the addres id from the req.params
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: "invalid id",
      });
    }
    const {
      customerId,
      fullName,
      phone,
      province,
      city,
      Area,
      Address,
      landmark,
    } = req.body;

    const udpatedAddress = await ShippingDetail.findByIdAndUpdate(
      { _id: id, customerId: customerId },
      {
        fullName,
        phone,
        province,
        city,
        Area,
        Address,
        landmark,
      }
    );

    if (!udpatedAddress) {
      return res.status(500).json({
        success: false,
        message: "error while updating shipping address",
      });
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          udpatedAddress,
          "shipping address updated successfully"
        )
      );
  }

  static async deleteShippingAddress(req, res) {
    try {
      const { id } = req.params;
      const customerId = req.body;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "please provide valid id",
        });
      }
      if (!customerId) {
        return res.status(400).json({
          message: "please provide valid customer id",
        });
      }

      const deletedResponse = await ShippingDetail.findByIdAndDelete({
        _id: id,
        customerId,
      });
      if (!deletedResponse) {
        return res.status(500).json({
          message: "address deleted successfully",
        });
      }
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong",
      });
    }
  }
}

module.exports = {
  ShippingAddress,
};
