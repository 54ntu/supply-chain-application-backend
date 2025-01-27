const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authController");
const { ApiResponse } = require("../services/ApiResponse");

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
}

module.exports = {
  SalesPerson,
};
