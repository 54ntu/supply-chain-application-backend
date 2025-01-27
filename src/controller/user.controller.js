const { User } = require("../models/user.models");
const jwt = require("jsonwebtoken");
const {
  hashPassword,
  comparedPassword,
} = require("../services/authController");
const { ApiResponse } = require("../services/ApiResponse");
const { UserRole } = require("../global");
const { generateOtp } = require("../services/generateOtp");
const { sendmail } = require("../services/sendMail");
const { envConfig } = require("../config/config");

class UserController {
  static async singupDistributor(req, res) {
    //get the data from req.body
    //validate all fields
    //check whether distributor already exist
    //if not exist then
    //hashed the password
    //everything is ok then create user and send that distributor id through response
    const {
      firstname,
      lastname,
      phone,
      email,
      password,
      companyName,
      regNo,
      location,
    } = req.body;
    const verificationdocfile = req.file?.filename;
    // console.log(verificationdocfile);
    if (
      !firstname ||
      !lastname ||
      !phone ||
      !email ||
      !password ||
      !companyName ||
      !regNo ||
      !location ||
      !verificationdocfile
    ) {
      return res.status(400).json({
        message: "please provide all fields😒😒😒😒",
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

    const isdistributorExist = await User.findOne({ email: email });
    console.log(isdistributorExist);
    if (isdistributorExist) {
      return res.status(400).json({
        message: "distributor with the given email already exist",
      });
    }

    const hashedpassword = await hashPassword(password);
    const distributor = await User.create({
      firstname,
      lastname,
      email,
      phone,
      password: hashedpassword,
      companyName,
      regNo,
      location,
      role: UserRole.Distributor,
    });

    //generate otp
    const otp = generateOtp();
    //send the otp through mail
    await sendmail({
      to: email,
      subject: "verification code",
      text: `please enter the given otp ${otp}`,
    });

    //save the otp into the User model so that it can be verified
    distributor.otp = otp;
    await distributor.save();

    //check whether the distributor is created or not using the distributor._id
    const isdistributorCreated = await User.findById(distributor._id).select(
      "-password -otp"
    );
    if (!isdistributorCreated) {
      return res.status(500).json({
        message: "distributor creation failed",
      });
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          isdistributorCreated._id,
          "distributor created successfully😊😊😊😊😊"
        )
      );
  }

  static async verifyOtp(req, res) {
    const { distributorid, otp } = req.body;

    if (!distributorid || !otp) {
      return res.status(400).json({
        message: "distributor id and otp are required..😒😒😒😒😒",
      });
    }

    //check the distributor by using its id
    const distributor = await User.findById({ _id: distributorid });
    if (!distributor) {
      return res.status(404).json({
        message: "distributor with the given id is not found...😒😒😒😒",
      });
    }

    //check if the otp is valid or not
    if (distributor.otp != otp) {
      return res.status(400).json({
        message: "invalid otp",
      });
    }

    // if the otp is valid then mark the user as verified
    distributor.isverified = true;

    //we can also delete the otp
    distributor.otp = null;

    //save the distributor document
    distributor.save();

    //send the response
    return res
      .status(200)
      .json(
        new ApiResponse(200, "distributor verified successfully.😎😎😎😎😎😎😎")
      );
  }

  static async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password must be required..😒😒😒😒😒",
      });
    }

    //if provided then check whether the email exists or not at first
    const isUserExist = await User.findOne({ email: email });
    if (!isUserExist) {
      return res.status(404).json({
        message: "user doesnot exist",
      });
    }

    //if user exist then compare the password
    const isPasswordMatched = await comparedPassword(
      password,
      isUserExist.password
    );

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "password doesnot matched..!!",
      });
    }

    //if the user exist and password matched then
    //generate access token
    const accessToken = await jwt.sign(
      {
        _id: isUserExist._id,
        role: isUserExist.role,
      },

      envConfig.accessTokenSecret,
      {
        expiresIn: envConfig.tokenExpiry,
      }
    );

    //before setting the accesstoken into the cookies we need to define options
    const options = {
      httpOnly: true,
      secure: envConfig.node_env === "production",
      sameSite: "strict",
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      message: "user logged in successfully",
    });
  }
}

module.exports = {
  UserController,
};
