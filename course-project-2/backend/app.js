// Node.js imports
const path = require("path");

// Third-party imports
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Project imports
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { clearImage } = require("./util/image");

// Creates app
const app = express();

// Initializes storage object to be used in multer middleware
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, `${uuidv4()}-${file.originalname}`);
  },
});

// Initializes fileFilter object to be used in multer middleware
const fileFilter = (req, file, callback) => {
  const validFileExtensions = ["image/png", "image/jpg", "image/jpeg"];

  callback(null, validFileExtensions.includes(file.mimetype));
};

// Adds body-parser/multer middlewares and exposes the "images" folder
app.use(bodyParser.json());
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

// Anti-CORS middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(auth);

app.use("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated!");
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  return res
    .status(201)
    .json({ message: "File stored! ", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    formatError(error) {
      if (!error.originalError) {
        return error;
      }

      const data = error.originalError.data;
      const message = error.message || "An error occurred!";
      const code = error.originalError.code || 500;

      return { message, status: code, data };
    },
  })
);

// Adds error-handling middleware
app.use((error, req, res, next) => {
  console.log(error);

  const { message, statusCode, data } = error;

  if (!statusCode) {
    statusCode = 500;
  }

  res.status(statusCode).json({ message, data });
});

// Connects to db and starts the app on port 8080
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(8080);
  })
  .catch((error) => console.log(error));
