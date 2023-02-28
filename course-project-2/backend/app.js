const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const feedRoutes = require("./routes/feed");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, `${uuidv4()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, callback) => {
  const validFileExtensions = ["image/png", "image/jpg", "image/jpeg"];

  callback(null, validFileExtensions.includes(file.mimetype));
};

app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
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
