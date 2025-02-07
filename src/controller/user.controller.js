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
const { SalesPerson } = require("../models/salesPerson.models");
const { Notification } = require("../models/notification.models");

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

    //create initial notification for the distributor
    await Notification.create({
      userId: isdistributorCreated._id,
      userType: isdistributorCreated.role,
    });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          isdistributorCreated.email,
          "distributor created successfully😊😊😊😊😊"
        )
      );
  }

  static async verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "email and otp are required..😒😒😒😒😒",
      });
    }

    //check the distributor by using its id
    const distributor = await User.findOne({ email: email });
    if (!distributor) {
      return res.status(404).json({
        message: "distributor with the given email is not found...😒😒😒😒",
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
    console.log("login controller hit vayo hoiii");
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "email and password must be required..😒😒😒😒😒",
      });
    }

    //if provided then first check in the distributor table
    let user = await User.findOne({ email: email });

    //if not found in distributor table(user for this application) then go for salesperson table
    if (!user) {
      user = await SalesPerson.findOne({ email: email });
    }

    //check whether the distributor or salesperson with the given email is available or not
    if (!user) {
      return res.status(404).json({
        message: "user with the given email doesnot exist..!!",
      });
    }

    //check whether the user is verified or not
    //as we are verifying user with otp
    if (!user.isverified) {
      return res.status(403).json({
        message: "please verified your account first",
      });
    }

    //if user exist then compare the password
    const isPasswordMatched = await comparedPassword(password, user.password);

    if (!isPasswordMatched) {
      return res.status(400).json({
        message: "password doesnot matched..!!",
      });
    }

    //if the user exist and password matched then
    //generate access token
    const accessToken = await jwt.sign(
      {
        _id: user._id,
        role: user.role,
        email: email,
      },

      envConfig.accessTokenSecret,
      {
        expiresIn: envConfig.tokenExpiry,
      }
    );

    //before setting the accesstoken into the cookies we need to define options
    const options = {
      // httpOnly: true,
      secure: envConfig.node_env === "production",
      sameSite: "strict",
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      message: "user logged in successfully",
    });
  }

  static async logout(req, res) {
    //set cookie options for secure and httpOnly cookies
    try {
      const options = {
        httpOnly: true,
        secure: envConfig.node_env === "production",
      };

      //clear access token cookies from the client's browser
      return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "user logged out successfully"));
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong while logging out!!",
      });
    }
  }

  static async handleForgotPassword(req, res) {
    try {
      const { email } = req.body;

      //check whether the email is provided or not
      if (!email) {
        return res.status(400).json({
          message: "email is required",
        });
      }

      //check email is valid or not
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      //check whether the user with the given email is available or not
      const isUserExist = await User.findOne({ email: email }).select(
        " -password"
      );

      if (!isUserExist) {
        return res.status(404).json({
          message: "user with given email doesnot exist.😒😒😒😒😒",
        });
      }

      //if user exist
      //generate otp
      const otp = generateOtp();
      await sendmail({
        to: email,
        subject: "reset password",
        text: `your otp is ${otp} `,
      });

      isUserExist.otp = otp;
      await isUserExist.save();
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            isUserExist.email,
            "reset pin is sent to your email..."
          )
        );
    } catch (error) {
      return res.status(500).json({
        error: "error occurred ...!!",
      });
    }
  }

  static async verifyResetLink(req, res) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          message: "please provide email and otp...!!",
        });
      }

      const isEmailExist = await User.findOne({ email: email });
      if (!isEmailExist) {
        return res.status(404).json({
          error: "email doesnot exist",
        });
      }

      //check the otp whether it is valid or not

      if (isEmailExist.otp != otp) {
        return res.status(400).json({
          error: "otp doesnot matched...!",
        });
      }

      isEmailExist.otp = null;
      await isEmailExist.save();

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            isEmailExist.email,
            "otp verified successfully.!"
          )
        );
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong",
      });
    }
  }

  static async restPassword(req, res) {
    try {
      const { email, password, confirmPassword } = req.body;
      if (!email || !passowrd || !confirmPassword) {
        return res.status(400).json({
          error: "all fields are required..!!",
        });
      }

      if (password != confirmPassword) {
        return res.status(400).json({
          error: "password and confirmpassword doesnot matched...!!",
        });
      }

      //check whether the email exist or not
      const isUserExist = await User.findOne({ email: email });
      if (!isUserExist) {
        return res.status(404).json({
          error: "email doesnot exist",
        });
      }

      const hashedpassword = await hashPassword(password);
      isUserExist.password = hashedpassword;
      await isUserExist.save();
      return res
        .status(200)
        .json(new ApiResponse(200, "password reset successfully"));
    } catch (error) {
      return res.status(500).json({
        error: "error while reseting password",
      });
    }
  }
}

module.exports = {
  UserController,
};
