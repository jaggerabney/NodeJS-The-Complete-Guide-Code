const User = require("../models/user");

exports.getLoginPage = function (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getSignupPage = function (req, res, next) {
  res.render("auth/signup", {
    path: "/signup",
    title: "Signup",
    isAuthenticated: false,
  });
};

exports.postLoginPage = function (req, res, next) {
  User.findById(DUMMY_USER._id)
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((error) => {
        if (error) {
          console.log(error);
        }

        res.redirect("/");
      });
    })
    .catch((error) => console.log(error));
};

exports.postSignupPage = function (req, res, next) {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then((result) => {
      if (result) {
        return res.redirect("/signup");
      } else {
        const user = new User({ email, password, cart: [] });

        return user.save();
      }
    })
    .then(res.redirect("/login"))
    .catch((error) => console.log(error));
};

exports.postLogoutPage = function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
