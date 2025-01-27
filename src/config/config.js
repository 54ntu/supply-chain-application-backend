const envConfig = {
  port: process.env.PORT,
  mongodburl: process.env.MONGODB_URL,

  //config for nodemailer
  node_email: process.env.EMAIL,
  node_password: process.env.EMAIL_PASSWORD,

  //config for access token
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  tokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,

  //node environment
  node_env: process.env.NODE_ENV,
};

module.exports = {
  envConfig,
};
