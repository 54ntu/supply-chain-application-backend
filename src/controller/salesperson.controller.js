const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authController");
const { ApiResponse } = require("../services/ApiResponse");
const { default: mongoose, isValidObjectId } = require("mongoose");
const { SalesPerson } = require("../models/salesPerson.models");
const { NotificationSetting } = require("../models/notificationSetting.models");
class SalesPersonController {
  static async addSalesperson(req, res) {
    //get the distributor id from the middleware
    //get the required data from the req.body
    //check all the required fields are provided or not
    //validate whether the salesperson with the given email address is available or not
    //if not then hash the password
    //create salesperson set isverified to true
    //if created then send the response
    const distributorid = req.user._id;

    // console.log(req.body);
    const {
      firstname,
      lastname,
      phone,
      email,
      password,
      role,
      address,
      assign_region,
      take_orders,
      collect_payments,
      track_shipment,
      view_inventory,
    } = req.body;
    if (
      !firstname ||
      !lastname ||
      !phone ||
      !email ||
      !password ||
      !address ||
      !assign_region
    ) {
      return res.status(400).json({
        message: "please provide all the required data",
      });
    }

    //check email is valid or not
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (phone.length !== 10) {
      return res
        .status(400)
        .json({ error: "Phone number must be exactly 10 digits." });
    }

    //check whether the sales person already registered or not
    const isSalesPersonExist = await SalesPerson.findOne({ email: email });
    if (isSalesPersonExist) {
      return res.status(400).json({
        message: "salesperson with given email is already exist",
      });
    }

    const hashedpassword = await hashPassword(password);

    if (!hashedpassword) {
      return res.status(500).json({
        message: "error hashing password",
      });
    }

    const salesPerson = await SalesPerson.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedpassword,
      role,
      address,
      assign_region,
      take_orders,
      collect_payments,
      track_shipment,
      view_inventory,
      isverified: true,

      distributor: distributorid,
    });

    //check the salesperson created or not then remove the password as well
    const isSalespersonCreated = await SalesPerson.findById(
      salesPerson._id
    ).select("-password");

    if (!isSalespersonCreated) {
      return res.status(500).json({
        message: "error addding salesperson",
      });
    }

    //create initial notification settings for the salesperson
    await NotificationSetting.create({
      userId: isSalespersonCreated._id,
      userType: isSalespersonCreated.role,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          isSalespersonCreated,
          "salesperson added successfully"
        )
      );
  }

  static async getSalespersons(req, res) {
    //get the distributor id   from the middleware because only distributor can see the salesperson details
    //get all the saleperson details associated with the distributor
    //if available then send the response
    //if not then return the error message

    const distributorid = req.user?._id;
    // console.log(typeof distributorid);
    if (!distributorid) {
      return res.status(401).json({
        message: "distributor id is not available",
      });
    }

    // console.log(salespersondata);
    try {
      const salespersons = await SalesPerson.aggregate([
        {
          $match: {
            distributor: new mongoose.Types.ObjectId(distributorid),
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "distributor",
            foreignField: "_id",
            as: "distributorDetails",
          },
        },

        {
          $unwind: "$distributorDetails",
        },

        {
          $project: {
            _id: 1,
            firstname: 1,
            lastname: 1,
            phone: 1,
            email: 1,
            role: 1,
            distributorName: {
              $concat: [
                "$distributorDetails.firstname",
                " ",
                "$distributorDetails.lastname",
              ],
            },
            distributorEmail: "$distributorDetails.email",
          },
        },
      ]);

      if (salespersons.length === 0) {
        return res.status(404).json({
          message: "no salespersons available.!!!",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            salespersons,
            "salespersons detaile fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: "error fetching salespersons",
      });
    }
  }

  static async getSalesPersonByid(req, res) {
    //get the salesperson id from the req.params
    //validate distributor id and salesperson id
    //find the salesperson id using salesperson id
    //fetch all the data
    //if found return the response

    try {
      const distributorid = req.user._id;
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          message: "invalid salesperson id",
        });
      }
      const isSalesPersonExist = await SalesPerson.findById(id);
      // console.log(isSalesPersonExist);
      if (!isSalesPersonExist) {
        return res.status(404).json({
          message: "salesperson with the given id is not found",
        });
      }

      //make sure that the distributor is the owner of that salesperson account
      if (isSalesPersonExist.distributor.toString() !== distributorid) {
        return res.status(401).json({
          message: `distributor with ${distributorid} does not have any salespersons`,
        });
      }
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            isSalesPersonExist,
            "salesperson detail info fetched successfully.!"
          )
        );
    } catch (error) {
      return res.status(500).json({
        message: "something went wrong..!",
      });
    }
  }

  static async deleteSalespersons(req, res) {
    //get the distributor id  from the middleware first
    //get the salespersons id from the req.params
    //check and delete the data using query
    //if everything is ok then delete the salespersons

    try {
      const distributorid = req.user?._id;
      // console.log(typeof distributorid);
      if (!distributorid) {
        return res.status(401).json({
          message: "distributor id is required",
        });
      }

      const salespersonid = req.params.id;
      // console.log(`salespersonid is : ${salespersonid}`);
      if (!isValidObjectId(salespersonid)) {
        return res.status(400).json({
          message: "invalid salesperson id ",
        });
      }

      //find the salesperson first
      const salesperson = await SalesPerson.findById(salespersonid);
      if (!salesperson) {
        return res.status(404).json({
          message: "salesperson not found",
        });
      }

      //make sure that the distributor is the owner of that salesperson account
      if (salesperson.distributor.toString() !== distributorid) {
        return res.status(401).json({
          message: "you are not authorized to delete this salesperson",
        });
      }

      //delete the salesperson
      const deletedSalespersonData = await SalesPerson.findByIdAndDelete(
        salespersonid
      );

      if (!deletedSalespersonData) {
        return res.status(500).json({
          message: "error deleting salesperson",
        });
      }
      return res.status(200).json({
        message: "salesperosn deleted successfully...",
      });
    } catch (error) {
      return res.status(500).json({
        error: "error deleting salesperson",
      });
    }
  }
}

module.exports = {
  SalesPersonController,
};
