// Third-party imports
const express = require("express");
const { body } = require("express-validator");

// Project imports
const User = require("../models/user");
const authController = require("../controllers/auth");

// Creates router
const router = express.Router();

// Routes

// These routes are *not* protected by the isAuth middleware, as they
// are meant to be accessed by users that aren't logged in

// PUT -> /signup
router.put(
  "/signup",
  // Checks that:
  // - The email is valid
  // - The (normalized) email doesn't already belong to an account
  // - The password is at least five characters long
  // - The name is not empty
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
// POST -> /login
router.post("/login", authController.login);

// Exports the router object for use in App.js
module.exports = router;
