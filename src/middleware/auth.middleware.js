const jwt = require("jsonwebtoken");
const { envConfig } = require("../config/config");

class UserMiddleware {
  static async isUserLoggedIn(req, res, next) {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "").trim(); //timmed exra space

      if (!token) {
        return res.status(400).json({
          message: "please login first!!",
        });
      }

      try {
        //decode the token
        const decodedToken = jwt.verify(token, envConfig.accessTokenSecret);
        req.user = decodedToken;
        next();
      } catch (error) {
        return res.status(401).json({
          message: "invalid or expired token",
        });
      }
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
        message: "only distributor can perform this operation",
      });
    }
  }
}

module.exports = {
  UserMiddleware,
};
