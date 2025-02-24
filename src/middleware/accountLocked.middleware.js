const { SalesPerson } = require("../models/salesPerson.models");
const { User } = require("../models/user.models");

const accountLocked = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "email is required..!",
    });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await SalesPerson.findOne({ email });
  }

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "user with given email doesnot exist",
    });
  }

  if (user.isLocked) {
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({
        message: "account is locked, try again later.",
      });
    } else {
      //unlock the account after the locked period expires
      (user.isLocked = false), (user.failedLoginAttempts = 0);
      user.lockUntil = null;
      await user.save();
    }
  }
  next();
};
module.exports = {
  accountLocked,
};
