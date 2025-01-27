const mongoose = require("mongoose");
const { envConfig } = require("../config/config");

const connectdb = async () => {
  try {
    await mongoose.connect(`${envConfig.mongodburl}`);
    console.log("database connected successfully..");
  } catch (error) {
    console.log("database connectiion failed!!");
    process.exit(1); //this will kill the process
  }
};

module.exports = {
  connectdb,
};
