const express = require("express");
const bcrypt = require("bcryptjs");
const { check, body, validationResult } = require("express-validator/check");

const authController = require("../controllers/auth");

const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.get("/reset", authController.getResetPage);
router.get("/reset/:token", authController.getNewPasswordPage);
router.post(
  "/login",
  check("email", "Entered email is not a valid email").isEmail(),
  body("password", "Invalid email or password.").custom((value, { req }) => {
    return User.findOne({ email: req.body.email })
      .then((user) => {
        if (user) {
          return bcrypt.compare(value, user.password).then((doMatch) => {
            if (!doMatch) {
              return Promise.reject();
            }
          });
        } else {
          return Promise.reject();
        }
      })
      .catch(() => Promise.reject());
  }),
  authController.postLoginPage
);
router.post("/logout", authController.postLogoutPage);
router.post(
  "/signup",
  check("email", "Entered email is not a valid email.").isEmail(),
  check("email", "Email already exists.").custom((value, { req }) => {
    return User.findOne({ email: value }).then((user) => {
      if (user) {
        console.log(user);

        return Promise.reject();
      }
    });
  }),
  body("password", "Passwords must be at least five characters long.").isLength(
    { min: 5 }
  ),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords do not match!");
    }

    return true;
  }),
  authController.postSignupPage
);
router.post("/reset", authController.postResetPage);
router.post("/new-password", authController.postNewPasswordPage);

module.exports = router;
