// Imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

// const adminRoutes = require("./routes/admin");
// const shopRoutes = require("./routes/shop");
// const _404Controller = require("./controllers/404");
const User = require("./models/user");

const DUMMY_USER = {
  _id: "63e1993294866e1011e7496f",
  name: "Jagger",
  email: "test@test.com",
  cart: {
    items: [],
  },
};

// Creates app
const app = express();

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

// app.use((req, res, next) => {
//   User.findById(DUMMY_USER._id)
//     .then((user) => {
//       req.user = new User(user.name, user.email, user.cart, user._id);

//       next();
//     })
//     .catch((error) => console.log(error));
// });

// Adds routes and 404 page
// app.use("/admin", adminRoutes);
// app.use(shopRoutes);
// app.use(_404Controller.get404page);

// Connects to DB
mongoose.connect(process.env.DB_CONNECTION_STRING).then(() => {
  app.listen(3000);
});
