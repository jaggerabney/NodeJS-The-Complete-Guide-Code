const express = require("express");
const { check, body, validationResult } = require("express-validator/check");

const authController = require("../controllers/auth");

const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.get("/reset", authController.getResetPage);
router.get("/reset/:token", authController.getNewPasswordPage);
router.post("/login", authController.postLoginPage);
router.post("/logout", authController.postLogoutPage);
router.post(
  "/signup",
  check("email", "Entered email is not a valid email.").isEmail(),
  check("email", "Email already exists.").custom((value, { req }) => {
    User.findOne({ email: value }).then((user) => {
      if (user) {
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
