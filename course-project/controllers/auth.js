const User = require("../models/user");

// Dummy user to imitate login
const DUMMY_USER = {
  _id: "63e3336da2577832141c64ed",
  name: "Jagger",
  email: "test@test.com",
  cart: {
    items: [],
  },
};

exports.getLoginPage = function (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLoginPage = function (req, res, next) {
  User.findById(DUMMY_USER._id)
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;

      res.redirect("/");
    })
    .catch((error) => console.log(error));
};
