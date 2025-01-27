const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/public");
  },
  filename: function (req, file, cb) {
    const imageName = Date.now() + file.originalname;
    cb(null, imageName);
  },
});

const upload = multer({ storage: storage });
module.exports = {
  upload,
};
