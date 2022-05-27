const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbRoute = require("./routes/login_signup_route.js");
//const dbRoute = require("./routes/login_signup_route");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/", dbRoute);
app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(process.env.PORT||8080, function () {
  console.log("Server running");
});
