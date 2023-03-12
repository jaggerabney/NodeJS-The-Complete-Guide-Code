// Node imports
const fs = require("fs");
const path = require("path");
const https = require("https");

// Third-party imports
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

// Project imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

// Write stream for use with Morgan to write log files
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// Multer configuration options objects
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(null, `${new Date().getTime()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

// Creates app
const app = express();
const store = new mongoDBstore({
  uri: process.env.DB_CONNECTION_STRING,
  collection: "sessions",
});
const csurf = csrf();

// Configures template engine
// I included the code for all three template engines because why not

// pug
app.set("view engine", "pug");
app.set("views", "views/pug");

// handlebars
// const handlebars = require("express-handlebars");

// app.engine(
//   "handlebars",
//   handlebars({
//     layoutsDir: "views/handlebars/layouts",
//     defaultLayout: "main-layout",
//   })
// );
// app.set("view engine", "handlebars");
// app.set("views", "views/handlebars");

// ejs
// app.set("view engine", "ejs");
// app.set("views", "views/ejs");

// Configures and adds third-party middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage, fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csurf);
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

// Adds current user to req, if there is one
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  } else {
    User.findById(req.session.user._id)
      .then((user) => {
        if (!user) {
          return next();
        }

        req.user = user;

        next();
      })
      .catch((error) => {
        throw new Error(error);
      });
  }
});

// Adds routes and 404/500 page
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get("/500", errorController.get500page);
app.use(errorController.get404page);
app.use((error, req, res, next) => {
  console.log(error);

  return res.render("errors/500", {
    title: "500 - Internal server error",
    path: "",
  });
});

// Connects to DB and starts server
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);

    app.listen(process.env.PORT || 3000);
  })
  .catch((error) => console.log(error));
