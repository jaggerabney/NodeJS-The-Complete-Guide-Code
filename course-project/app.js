// Imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const adminRoute = require("./routes/admin");
// const shopRoute = require("./routes/shop");
// const _404Controller = require("./controllers/404");
const mongoConnect = require("./util/database").mongoConnect;

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
//   User.findByPk(DUMMY_USER.id)
//     .then((user) => {
//       req.user = user;

//       next();
//     })
//     .catch((error) => console.log(error));
// });

// Adds routes and 404 page
app.use("/admin", adminRoute);
// app.use(shopRoute);

// app.use(_404Controller.get404page);

// Connect to DB
mongoConnect(() => {
  app.listen(3000);
});
