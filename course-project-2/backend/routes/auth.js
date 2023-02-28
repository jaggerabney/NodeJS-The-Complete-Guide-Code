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
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Password must be at least five characters long.")
      .trim()
      .isLength({
        min: 5,
      }),
    body("name", "Name must not be empty!").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
