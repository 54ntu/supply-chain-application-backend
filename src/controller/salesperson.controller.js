const { User } = require("../models/user.models");
const { hashPassword } = require("../services/authController");
const { ApiResponse } = require("../services/ApiResponse");
const { default: mongoose, isValidObjectId } = require("mongoose");
const { SalesPerson } = require("../models/salesPerson.models");
const { NotificationSetting } = require("../models/notificationSetting.models");
const moment = require("moment");
const { Order } = require("../models/order.models");
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

  static async updateSalespersonPassword(req, res) {
    //get the id from the req.user
    try {
      const salespersonId = req.user._id;
      if (!salespersonId) {
        return res.status(400).json({
          success: false,
          message: "salesperson id is required",
        });
      }
      //get new password and confirm password from the req.body

      const { new_password, confirm_password } = req.body;
      if (!new_password || !confirm_password) {
        return res.status(400).json({
          success: false,
          message: "new_password and confirm password are required😑😑😑😑😑",
        });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({
          success: false,
          message: "password doesnot matched",
        });
      }

      if (new_password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "password must be 8 digits or longer",
        });
      }

      //hashed the new password
      const hashedPassword = await hashPassword(new_password);
      // console.log(hashedPassword);
      if (!hashedPassword) {
        return res.status(400).json({
          success: false,
          message: "password hashing failed",
        });
      }

      //update the password of the logged in salesperson
      const updatedPassword = await SalesPerson.findOneAndUpdate(
        { _id: salespersonId },
        {
          password: hashedPassword,
        },
        {
          new: true,
        }
      );

      // console.log(updatedPassword);
      if (!updatedPassword) {
        return res.status(500).json({
          success: false,
          message: "password updation failed😒😒😒😒😒...please try againa",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            "password updated successsfully😎😎😎😊😊😊😊..."
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "password updation failed",
        error: error.message,
      });
    }
  }

  static async getSalesPersonSummary(req, res) {
    try {
      //get the distributor id from the req.user
      const distributorid = req.user._id;
      if (!distributorid) {
        return res.status(400).json({
          success: false,
          message: "distributor id is required ...please login first",
        });
      }

      //get current and last week's date range
      const currentWeekStart = moment().startOf("week").toDate();
      const lastWeekStart = moment()
        .subtract(1, "weeks")
        .startOf("week")
        .toDate();
      const lastWeekEnd = moment().subtract(1, "weeks").endOf("week").toDate();

      // console.log(currentWeekStart);
      // console.log(lastWeekStart);
      // console.log(lastWeekEnd);

      //fetch total employees
      const TotalEmployees = await SalesPerson.countDocuments({
        distributor: new mongoose.Types.ObjectId(distributorid),
      });

      // console.log(TotalEmployees);

      const lastWeekTotalEmployees = await SalesPerson.countDocuments({
        distributor: new mongoose.Types.ObjectId(distributorid),
        createdAt: { $lte: lastWeekEnd },
      });

      // console.log(lastWeekTotalEmployees);

      //fetch sales activity current week(salespersons who placed at least one order this week)
      //here i am fetching the array of total orders created this week

      const activeSalespersons = await Order.aggregate([
        {
          $match: { createdAt: { $gte: currentWeekStart } },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salesPerson",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
        //match distributor id in the salesperson schema and logged in distributor id
        //as distributor must get the relavent salespersons data
        {
          $match: {
            "salespersonDetails.distributor": new mongoose.Types.ObjectId(
              distributorid
            ),
          },
        },

        //the given group will give the total orders created by each salesperson
        // {
        //   $group: {
        //     _id: "$salesPerson",
        //     totalOrders: { $sum: 1 },
        //   },
        // },

        {
          $project: {
            _id: 1,
            // totalOrders: 1,
          },
        },
      ]);
      // console.log(activeSalespersons.length);

      const totalSalesPerson = await SalesPerson.countDocuments({
        distributor: new mongoose.Types.ObjectId(distributorid),
      });

      // console.log(`total salesperson data is : ${totalSalesPerson}`);
      const salesActivity = (
        (activeSalespersons.length / totalSalesPerson) *
        100
      ).toFixed(2);

      // console.log(salesActivity);

      //fetch sales activity previous week
      const orderCreatedPreviousWeek = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salesPerson",
            foreignField: "_id",
            as: "salespersondetails",
          },
        },
        {
          $unwind: "$salespersondetails",
        },
        {
          $match: {
            "salespersondetails.distributor": new mongoose.Types.ObjectId(
              distributorid
            ),
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      // console.log(`orderCreatedPreviousWeek : ${orderCreatedPreviousWeek}`);

      const lastWeekSalesActivity = (
        (orderCreatedPreviousWeek.length / lastWeekTotalEmployees) *
        100
      ).toFixed(2);

      // console.log(`lastWeekSalesActivity : ${lastWeekSalesActivity}`);

      //for customer retention
      //we calculate customer retention by calculating the orders created on behalf of customer
      //customer id is stored in the order collection
      //so with the help of customer id we can easily fetch the data
      const currentCustomers = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentWeekStart },
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salesPerson",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
        {
          $match: {
            "salespersonDetails.distributor": new mongoose.Types.ObjectId(
              distributorid
            ),
          },
        },
        {
          $project: {
            customer: 1,
          },
        },
      ]);

      // console.log(currentCustomers);

      //last week customers
      const lastWeekCustomers = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd },
          },
        },
        {
          $lookup: {
            from: "salespeople",
            localField: "salesPerson",
            foreignField: "_id",
            as: "salespersonDetails",
          },
        },
        {
          $unwind: "$salespersonDetails",
        },
        {
          $match: {
            "salespersonDetails.distributor": new mongoose.Types.ObjectId(
              distributorid
            ),
          },
        },
        {
          $project: {
            customer: 1,
          },
        },
      ]);

      // console.log(`lastWeekCustomers : ${lastWeekCustomers}`);

      const retainedCustomers = currentCustomers.filter((customer) =>
        lastWeekCustomers.includes(customer)
      );

      // console.log(retainedCustomers);

      const customerRetention = lastWeekCustomers.length
        ? ((retainedCustomers.length / lastWeekCustomers.length) * 100).toFixed(
            2
          ) + "%"
        : "0.00%";

      //fetch store coverage (unique regions assigned to salespersons)
      const storeCoverage = await SalesPerson.aggregate([
        //this match query will help us to filter data on basis of distributor
        //because only the valid distributor who create salesperson can see those data
        {
          $match: { distributor: new mongoose.Types.ObjectId(distributorid) },
        },

        //group using assign_region also helps to filter on basis of unique value only
        //if repeated it counts as same or 1
        {
          $group: {
            _id: "$assign_region",
          },
        },
      ]);

      // console.log(storeCoverage);

      //last week store coverage
      const lastWeekStoreCoverage = await SalesPerson.aggregate([
        {
          $match: {
            $and: [
              { distributor: new mongoose.Types.ObjectId(distributorid) },
              { createdAt: { $gte: lastWeekStart, $lte: lastWeekEnd } },
            ],
          },
        },
        {
          $group: {
            _id: "assign_region",
          },
        },
      ]);

      // console.log(`lastWeekStoreCoverage : ${lastWeekStoreCoverage}`);

      //calculate percentage changes
      const employeeGrowth = lastWeekTotalEmployees
        ? (
            ((TotalEmployees - lastWeekTotalEmployees) /
              lastWeekTotalEmployees) *
            100
          ).toFixed(2) + "%"
        : "0.00 %";

      const retentionChange = lastWeekCustomers.length
        ? (
            ((customerRetention -
              (lastWeekCustomers.length / TotalEmployees) * 100) /
              (lastWeekCustomers.length / TotalEmployees)) *
            100
          ).toFixed(2) + "%"
        : "0.00%";

      const storeCoverageChange = lastWeekStoreCoverage.length
        ? (
            ((storeCoverage - lastWeekStoreCoverage) / lastWeekStoreCoverage) *
            100
          ).toFixed(2) + "%"
        : "0.00%";

      return res.status(200).json({
        totalEmployess: { value: TotalEmployees, change: employeeGrowth },
        salesActivity: {
          value: salesActivity,
          change: `${
            lastWeekSalesActivity.length
              ? (salesActivity.length - lastWeekSalesActivity.length).toFixed(2)
              : 0.0
          }%`,
        },
        customerRetention: {
          value: customerRetention,
          change: retentionChange,
        },
        storeCoverage: {
          value: storeCoverage.length,
          change: storeCoverageChange,
        },
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
  SalesPersonController,
};
