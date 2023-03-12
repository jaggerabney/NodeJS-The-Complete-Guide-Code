const bcrypt = require("bcryptjs");
const sendGrid = require("@sendgrid/mail");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const User = require("../models/user");
const generateError = require("../util/generateError");

sendGrid.setApiKey(process.env.SENDGRID_API_KEY);

exports.getLoginPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  return res.render("auth/login", {
    title: "Login",
    path: "/login",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignupPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  return res.render("auth/signup", {
    path: "/signup",
    title: "Signup",
    errorMessage: message,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLoginPage = function (req, res, next) {
  const { email, password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      title: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email })
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;

      return req.session.save((error) => {
        if (error) {
          return next(generateError("Couldn't save session!", 500));
        }

        res.redirect("/");
      });
    })
    .catch(() => next(generateError("Couldn't log in!", 500)));
};

exports.postSignupPage = function (req, res, next) {
  const { email, password, confirmPassword } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      title: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  User.findOne({ email })
    .then(() => {
      const signupEmail = {
        to: email,
        from: process.env.EMAIL_USERNAME,
        subject: "Signup successful!",
        text: "Thanks for signing up!",
      };

      return sendGrid.send(signupEmail).then(() => {
        return bcrypt
          .hash(password, Number(process.env.SALT_VALUE))
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
    })
    .catch(() => next(generateError("Couldn't create account!", 500)));
};

exports.postLogoutPage = function (req, res, next) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.getResetPage = function (req, res, next) {
  let message = req.flash("error");

  message = message.length > 0 ? message[0] : null;

  return res.render("auth/reset", {
    path: "/reset",
    title: "Reset Password",
    errorMessage: message,
    oldInput: {
      email: "",
    },
    validationErrors: [],
  });
};

exports.postResetPage = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      path: "/reset",
      title: "Reset Password",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: req.body.email },
      validationErrors: errors.array(),
    });
  }

  crypto.randomBytes(32, (error, buffer) => {
    if (error) {
      return next(
        generateError("Couldn't generate password reset token!", 500)
      );
    }

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email }).then((user) => {
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;

      return user
        .save()
        .then(() => {
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

          return sendGrid.send(resetEmail).then(() => res.redirect("/"));
        })
        .catch(() =>
          next(generateError("Couldn't send password reset email!", 500))
        );
    });
  });
};

exports.getNewPasswordPage = function (req, res, next) {
  const token = req.params.token;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");

      message = message.length > 0 ? message[0] : null;

      return res.render("auth/new-password", {
        path: "/new-password",
        title: "Create New Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(() =>
      next(
        generateError(
          "Couldn't find user associated with the given password reset token!",
          500
        )
      )
    );
};

exports.postNewPasswordPage = function (req, res, next) {
  const { newPassword, confirmNewPassword, userId, passwordToken } = req.body;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  }).then((user) => {
    if (newPassword !== confirmNewPassword) {
      req.flash("error", "Passwords do not match!");

      return res.redirect("/login");
    }

    return bcrypt
      .hash(newPassword, Number(process.env.SALT_VALUE))
      .then((hashedPassword) => {
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = undefined;

        return user.save().then(() => {
          const confirmMessage = {
            to: user.email,
            from: process.env.EMAIL_USERNAME,
            subject: "Password changed!",
            html: `
            <p>Your password was successfully changed on ${new Date().toString()}.
          `,
          };

          return sendGrid
            .send(confirmMessage)
            .then(() => res.redirect("/login"));
        });
      })
      .catch(() =>
        next(generateError("Couldn't send password reset email!", 500))
      );
  });
};
