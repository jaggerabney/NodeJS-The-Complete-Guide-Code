// Third-party imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBstore = require("connect-mongodb-session")(session);
require("dotenv").config();

// Project imports
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const _404Controller = require("./controllers/404");
const User = require("./models/user");

// Creates app
const app = express();
const store = new mongoDBstore({
  uri: process.env.DB_CONNECTION_STRING,
  collection: "sessions",
});

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

// Adds body-parser to app and exposes "public" folder
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

// Adds routes and 404 page
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(_404Controller.get404page);

// Connects to DB
mongoose
  .connect(process.env.DB_CONNECTION_STRING)
  .then(() => {
    app.listen(3000);
  })
  .catch((error) => console.log(error));
