const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { envConfig } = require("../config/config");

cloudinary.config({
  cloud_name: "dnyy2andg",
  api_key: "178397524964291",
  api_secret: "SI8MfiXYtmY-WJP7TEoLxgytLt4",
});

const uploadOnCloudinary = async (localfilepath) => {
  try {
    if (!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: "auto",
    });

    //   console.log(response);
    fs.unlinkSync(localfilepath);
    return response;
  } catch (error) {
    console.log("error while uploading data into the cloudinary : ", error);
    console.log("localfilepath we are getting is : ", localfilepath);
    fs.unlinkSync(localfilepath); //when something went wrong or due to some error, we will be unable to upload the data into the cloudinary....at that time we just remove that file from the
    return null; // local storage using file system (fs)
  }
};

module.exports = {
  uploadOnCloudinary,
};
