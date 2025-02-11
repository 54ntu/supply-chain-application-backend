const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { envConfig } = require("../config/config");

cloudinary.config({
  cloud_name: envConfig.cloud_name,
  api_key: envConfig.api_key,
  api_secret: envConfig.api_secret,
});

const uploadOnCloudinary = async (filepath) => {
  console.log(filepath);

  if (!filepath) return null;

  const response = await cloudinary.uploader.upload(filepath, {
    resource_type: "auto",
  });

  //   console.log(response);
  fs.unlinkSync(filepath);
  return response;
};

module.exports = {
  uploadOnCloudinary,
};
