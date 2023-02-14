const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLoginPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  res.render("auth/login", {
    title: "Login",
    path: "/login",
    errorMessage: message,
  });
};

exports.getSignupPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  res.render("auth/signup", {
    path: "/signup",
    title: "Signup",
    errorMessage: message,
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
              req.flash("error", "Invalid email or password.");

              res.redirect("/login");
            }
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        req.flash("error", "Invalid email or password.");

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
        req.flash("error", "Email already exists.");

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
