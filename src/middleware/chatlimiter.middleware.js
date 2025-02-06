const { rateLimit } = require("express-rate-limit");
const chatRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, //time to remember the request 1 min
  max: 10, //limit 10 request per ip for windows
  message: "Too many request from this IP, please try again after a minute",
});

module.exports = {
  chatRateLimiter,
};
