const express = require("express");
const {
  RefundStatistics,
} = require("../controller/refundStatistics.controller");
const statsRouter = express.Router();

statsRouter.route("/").get(RefundStatistics.getRefundStats);

module.exports = {
  statsRouter,
};
