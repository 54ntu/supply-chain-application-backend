require("dotenv").config();
const { app } = require("./app");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const { envConfig } = require("./src/config/config");
const { connectdb } = require("./src/dbconfig/db");

let port = envConfig.port || 8000;


// const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*", //adjust this to match the frontend url
//     methods: ["GET", "POST", "PUT", "PATCH"],

//   },
// });

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
  connectdb();
});
