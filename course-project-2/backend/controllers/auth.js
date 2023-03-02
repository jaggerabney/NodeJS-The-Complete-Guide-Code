// Third party imports
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Project imports
const User = require("../models/user");
const {
  throwCustomError,
  addStatusCodeTo,
  hasNoValidationErrors,
} = require("../util/error");

exports.signup = async function (req, res, next) {
  // Checks if there were any errors during validation in the previous middlewares.
  // hasNoValidationErrors either returns true if there are no errors, or throws an error
  // if there are any; thus, there's no need for an else block.
  if (hasNoValidationErrors(validationResult(req))) {
    // Extracts the new user's email, name, and password from the request body
    const { email, name, password } = req.body;

    try {
      // Hashes the user's password for security purposes
      const hashedPassword = await bcrypt.hash(password, 12);

      // Creates a new instance of the User model, found in models/user.js
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });

      // Saves the newly-created user to the db
      await user.save();

      // Returns the newly-created user's ID and a success message to the frontend
      return res
        .status(201)
        .json({ message: "User created!", userId: user._id });
    } catch (error) {
      next(addStatusCodeTo(error));
    }
  }
};

exports.login = async function (req, res, next) {
  // Extracts the user's email and password from the request body
  const { email, password } = req.body;

  try {
    // Finds the user in the db by the given email
    const user = await User.findOne({ email });

    // Validates that the user is defined
    if (!user) {
      throwCustomError("Invalid email or password!", 401);
    }

    // Compares the given password to the password in the db and stores the result
    const passwordsMatch = await bcrypt.compare(password, user.password);

    // Throws an error if the passwords don't match
    if (!passwordsMatch) {
      throwCustomError("Invalid email or password!", 401);
    }

    // Otherwise, a JWT token that stores the user's email and ID is created
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    // This token, along with the user's ID, is then returned to the frontend
    return res.status(200).json({ token, userId: user._id.toString() });
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};
