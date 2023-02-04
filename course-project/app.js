// Imports
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");
const sequelize = require("./util/database");
const _404Controller = require("./controllers/404");

const User = require("./models/user");
const Product = require("./models/product");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");

// Dummy user

const DUMMY_USER = {
  id: "86756630-f018-4d96-9cf7-616f23790b4a",
  name: "Jagger",
  email: "test@test.com",
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

app.use((req, res, next) => {
  User.findByPk(DUMMY_USER.id)
    .then((user) => {
      req.user = user;
      console.log(req.user);
      next();
    })
    .catch((error) => console.log(error));
});

// Adds routes and 404 page
app.use("/admin", adminRoute);
app.use(shopRoute);

app.use(_404Controller.get404page);

// SQL Relations
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User, { foreignKey: "id" });
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

// Pulls info from db and launches server
sequelize
  .sync()
  .then(() => {
    return User.findAll({
      where: {
        name: DUMMY_USER.name,
        email: DUMMY_USER.email,
      },
    });
  })
  .then((users) => {
    if (users.length === 0) {
      return User.create(DUMMY_USER);
    }

    return users[0];
  })
  .then(() => app.listen(3000))
  .catch((error) => console.log(error));
