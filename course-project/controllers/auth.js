const bcrypt = require("bcryptjs");

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
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user) {
        bcrypt
          .compare(password, user.password)
          .then((doMatch) => {
            if (doMatch) {
              req.session.isLoggedIn = true;
              req.session.user = user;

              return req.session.save((error) => {
                if (error) {
                  console.log(error);
                }

                res.redirect("/");
              });
            } else {
              res.redirect("/login");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        return res.redirect("/login");
      }
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
        return bcrypt
          .hash(password, 12)
          .then((hashedPassword) => {
            const user = new User({
              email,
              password: hashedPassword,
              cart: [],
            });

            return user.save();
          })
          .then(() => res.redirect("/login"))
          .catch((error) => console.log(error));
      }
    })
    .catch((error) => console.log(error));
};

exports.postLogoutPage = function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
