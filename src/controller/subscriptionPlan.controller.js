const { isValidObjectId } = require("mongoose");
const { SubscriptionPlan } = require("../models/subscriptionplan.models");
const { ApiResponse } = require("../services/ApiResponse");

class SubscriptionPlanController {
  static async addSubscriptionPlan(req, res) {
    //get the data from the req.body
    try {
      const { type, price, billingCycle, trialdays, tax } = req.body;
      if (!type || !price || !billingCycle || !trialdays) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
        });
      }

      //check whether the type of plan is already exist or not
      const isPlanExist = await SubscriptionPlan.findOne({ type: type });
      //   console.log(isPlanExist);
      if (isPlanExist) {
        return res.status(400).json({
          success: false,
          message: `plan with type "${type}" already exist`,
        });
      }

      //if not exsit then good to go
      const subscriptionplancreated = await SubscriptionPlan.create({
        type,
        price,
        billingCycle,
        trialdays,
        tax,
      });

      // console.log(subscriptionplancreated);
      if (!subscriptionplancreated) {
        return res.status(500).json({
          success: false,
          message: "plan addition failed",
        });
      }

      return res.status(201).json({
        success: true,
        subscriptionplancreated,
        message: "subscription plan added successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }

  static async getSubscriptionPlan(req, res) {
    //direct fetch all the plan available

    try {
      const subscriptionplans = await SubscriptionPlan.find();
      if (subscriptionplans.length === 0) {
        return res.status(404).json({
          success: false,
          message: "plans does not exist",
        });
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            subscriptionplans,
            "plans data fetched successfully"
          )
        );
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "internal error occured",
      });
    }
  }

  static async deleteSubscriptionPlan(req, res) {
    try {
      const { id } = req.params;
      if (!isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "invalid id ",
        });
      }
      const deletedPlans = await SubscriptionPlan.findByIdAndDelete(id);
      //   console.log(deletedPlans);

      if (!deletedPlans) {
        return res.status(500).json({
          success: false,
          message: "deletion failed",
        });
      }

      return res.status(200).json({
        message: "plasn deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "internal error occured",
      });
    }
  }

  static async updateSubscriptionPlan(req, res) {
    //get the data from the req.body
    try {
      const { type, price, trialdays, tax } = req.body;
      if (!type || !price || !trialdays || !tax) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
        });
      }

      //check whether the type of plan is already exist or not
      let isPlanExist = await SubscriptionPlan.findOne({ type: type });

      //if not exist return the message
      if (!isPlanExist) {
        return res.status(400).json({
          success: false,
          message: `plan with type "${type}" doesnot exist`,
        });
      }

      //if exist then update the data

      isPlanExist.price = price;
      isPlanExist.trialdays = trialdays;
      isPlanExist.tax = tax;
      await isPlanExist.save();

      return res.status(200).json({
        success: true,
        isPlanExist,
        message: "subscription plan updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "something went wrong",
      });
    }
  }
}

module.exports = {
  SubscriptionPlanController,
};
