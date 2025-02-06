const jwt = require("jsonwebtoken");
const { envConfig } = require("../config/config");

class UserMiddleware {
  static async isUserLoggedIn(req, res, next) {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer", "");

      if (!token) {
        return res.status(400).json({
          message: "token not provided!!",
        });
      }

      //decode the token
      const decodedToken = jwt.verify(token, envConfig.accessTokenSecret);
      if (!decodedToken) {
        return res.status(400).json({
          message: "invalid token",
        });
      }

      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(500).json({
        error: "error occur on validating the token",
      });
    }
  }

  static async isDistributor(req, res, next) {
    // console.log(`in distributor ${req.user.role}`);
    if (!req.user) {
      return res.status(400).json({
        error: "user role is required..!!",
      });
    }

    if (req.user?.role == "distributor") {
      next();
    } else {
      return res.status(403).json({
        message: "you are not allowed to perform this task",
      });
    }
  }
}

module.exports = {
  UserMiddleware,
};
