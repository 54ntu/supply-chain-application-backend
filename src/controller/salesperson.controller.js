const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authController");
const { ApiResponse } = require("../services/ApiResponse");
const { default: mongoose } = require("mongoose");

class SalesPerson {
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
    const { firstname, lastname, phone, email, password, role } = req.body;
    if (!firstname || !lastname || !phone || !email || !password || !role) {
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
    const isUserexist = await User.findOne({ email: email });
    if (isUserexist) {
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

    const salesPerson = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedpassword,
      role,
      isverified: true,
      distributorId: distributorid,
    });

    //check the salesperson created or not then remove the password as well
    const isSalespersonCreated = await User.findById(salesPerson._id).select(
      "-password"
    );

    if (!isSalespersonCreated) {
      return res.status(500).json({
        message: "error addding salesperson",
      });
    }

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
    console.log(distributorid);
    if (!distributorid) {
      return res.status(401).json({
        message: "distributor id is not available",
      });
    }

    try {
      const salespersons = await User.aggregate([
        {
          $match: {
            distributorId: new mongoose.Types.ObjectId(distributorid),
          },
        },

        {
          $lookup: {
            from: "users",
            localField: "distributorId",
            foreignField: "_id",
            as: "distributor",
          },
        },

        {
          $unwind: "$distributor",
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
              $concat: ["$distributor.firstname", " ", "$distributor.lastname"],
            },
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

  static async deleteSalespersons(req, res) {
    //get the user role from the middleware first
    //get the salespersons id from the req.params
    //check whether user role is distributor or not
    //check whether the id provided is belongs to the salespersons
    //if everything is ok then delete the salespersons
  }
}

module.exports = {
  SalesPerson,
};
