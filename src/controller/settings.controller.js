const { SalesPerson } = require("../models/salesPerson.models");
const { User } = require("../models/user.models");
const {
  comparedPassword,
  hashPassword,
} = require("../services/authController");
class SettingsController {
  static async changePassword(req, res) {
    //get the distributor id or salerperson id from the req.user
    //get the data from the req.body
    //validate fields
    //compare the password and confirm password
    //find the distributor using his/her id
    //if exist then compare the current password field
    //hash the password and
    //update the current password with new password
    //if success return success response
    try {
      const id = req.user._id;
      if (!id) {
        return res.status(400).json({
          error: "id is required",
        });
      }

      const { currentPassword, new_password, confirm_password } = req.body;
      if (!currentPassword || !new_password || !confirm_password) {
        return res.status(400).json({
          error: "please provide all fields",
        });
      }

      if (new_password != confirm_password) {
        return res.status(400).json({
          error: "new_password and confirm password doesnot match..!",
        });
      }

      //helper function
      const updatePassword = async (user) => {
        if (!user) return null;

        //compare the current password and databse saved password
        const isPasswordMatched = await comparedPassword(
          currentPassword,
          user.password
        );
        if (!isPasswordMatched) {
          return res.status(400).json({
            error: "password doesnot match",
          });
        }

        //hash the password
        const hashedpassword = await hashPassword(new_password);
        if (!hashedpassword) {
          return res.status(500).json({
            error: "error hashing the password",
          });
        }

        user.password = hashedpassword;
        await user.save();
        return res.status(200).json({
          message: "password changes successfully",
        });
      };

      //check distributor is there or not
      let user = await User.findById(id);
      if (!user) {
        user = await SalesPerson.findById(id);
      }

      if (!user) {
        return res.status(404).json({
          error: "user not found",
        });
      }

      return await updatePassword(user);
    } catch (error) {
      return res.status(500).json({
        error: "something went wrong",
      });
    }
  }
}

module.exports = {
  SettingsController,
};
