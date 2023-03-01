const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const {
  throwCustomError,
  throwError,
  hasNoValidationErrors,
} = require("../util/error");

exports.signup = function (req, res, next) {
  if (hasNoValidationErrors(validationResult(req))) {
    const { email, name, password } = req.body;

    bcrypt
      .hash(password, 12)
      .then((hashedPassword) => {
        const user = new User({
          email,
          name,
          password: hashedPassword,
        });

        return user.save();
      })
      .then((result) => {
        return res
          .status(201)
          .json({ message: "User created!", userId: result._id });
      })
      .catch((error) => {
        throwError(error);
      });
  }
};

exports.login = function (req, res, next) {
  const { email, password } = req.body;
  let loadedUser;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        throwCustomError("Invalid email or password!", 401);
      }

      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((passwordsMatch) => {
      if (!passwordsMatch) {
        throwCustomError("Invalid email or password!", 401);
      }

      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((error) => {
      throwError(error);
    });
};
