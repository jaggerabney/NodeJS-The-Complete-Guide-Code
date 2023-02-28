const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email", "Please enter a valid email!").isEmail(),
    body("email", "An account already exists with this email address.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject();
          }
        });
      })
      .normalizeEmail(),
    body("password", "Password must be at least five characters long.")
      .trim()
      .length({
        min: 5,
      }),
    body("name", "Name must not be empty!").trim().not().isEmpty(),
  ],
  authController.signup
);

module.exports = router;
