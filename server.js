require("dotenv").config();
const { app } = require("./app");
const { envConfig } = require("./src/config/config");
const { connectdb } = require("./src/dbconfig/db");

let port = envConfig.port || 8000;

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
  connectdb();
});
