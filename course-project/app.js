const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");

const _404Controller = require("./controllers/404");

const db = require("./util/database");

const app = express();

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

db.execute("SELECT * FROM products")
  .then((result) => console.log(result[0]))
  .catch((error) => {
    if (error) {
      console.log(error);
    }
  });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoute);
app.use(shopRoute);

app.use(_404Controller.get404page);

app.listen(3000);
