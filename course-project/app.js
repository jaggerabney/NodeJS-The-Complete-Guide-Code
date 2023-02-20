// Third-party imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();

// Project imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorController = require("./controllers/error");
const User = require("./models/user");

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

// Adds body-parser; exposes public folder; manages sessions, CSRF protection, and flashing
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
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

// Connects to DB and starts server
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => console.log(error));
