const express = require("express");
const cors = require("cors");
const { distributorRouter } = require("./src/routes/distributor.routes");
const { salesPersonRouter } = require("./src/routes/salesperson.routes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//route for distributor
app.use("/api/v1/distributor", distributorRouter);

// route for salesperson
app.use("/api/v1/sales", salesPersonRouter);

module.exports = {
  app,
};
