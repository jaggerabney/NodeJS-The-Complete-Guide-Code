const bcrypt = require("bcryptjs");
const sendGrid = require("@sendgrid/mail");
const crypto = require("crypto");
require("dotenv").config();

const User = require("../models/user");

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

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
        return bcrypt
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
        return bcrypt.compare(password, confirmPassword).then((doMatch) => {
          if (doMatch) {
            const signupEmail = {
              to: email,
              from: process.env.EMAIL_USERNAME,
              subject: "Signup successful!",
              text: "Thanks for signing up!",
            };

            return sendGrid.send(signupEmail).then(() => {
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
                .then(() => res.redirect("/login"));
            });
          } else {
            req.flash("error", "Passwords do not match.");

            return res.redirect("/signup");
          }
        });
      }
    })
    .catch((error) => console.log(error));
};

exports.postLogoutPage = function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getResetPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  res.render("auth/reset", {
    path: "/reset",
    title: "Reset Password",
    errorMessage: message,
  });
};

exports.postResetPage = function (req, res, next) {
  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      console.log(error);

      return res.redirect("/reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        req.flash("error", "No account found!");

        return res.redirect("/reset");
      }

      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;

      return user
        .save()
        .then((result) => {
          const resetEmail = {
            to: req.body.email,
            from: process.env.EMAIL_USERNAME,
            subject: "Password reset",
            html: `
              <p>A password reset request was made at ${new Date().toString()}.</p>
              <p>If this request was made by you, please click <a href="http://localhost:3000/reset/${token}">here</a>.</p>
              <p>If this request was <em>not</em> made by you, please reset your password immediately.</p>
            `,
          };

          sendGrid.send(resetEmail).then(() => res.redirect("/"));
        })
        .catch((error) => console.log(error));
    });
  });
};
