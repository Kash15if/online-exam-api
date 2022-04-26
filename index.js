const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//importing db-connection query
const pool = require("./models/dbCon");
pool
  .connect()
  .then((row) => {
    console.log("db is connected :", row._connected);
  })
  .catch((err) => {
    throw err;
  });

//for cors error
const cors = require("cors");
const corsOptions = {
  origin: "*",

  credentials: true,

  methods: ["GET", "POST"],

  allowedHeaders: ["Content-Type", "Access-Control-Allow-Headers"],
};

app.use(cors({ origin: "*" }));

const AllGetROutes = require("./routes/gets");
const AllPostRoutes = require("./routes/posts");
const AuthRoutes = require("./routes/auth");
app.use("/get", AllGetROutes);
app.use("/post", AllPostRoutes);
app.use("/auth", AuthRoutes);

app.listen(5000);
