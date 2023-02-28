const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const feedRoutes = require("./routes/feed");

const app = express();

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);

  const { message, statusCode } = error;

  if (!statusCode) {
    statusCode = 500;
  }

  res.status(statusCode).json({ message });
});

mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(8080);
  })
  .catch((error) => console.log(error));
