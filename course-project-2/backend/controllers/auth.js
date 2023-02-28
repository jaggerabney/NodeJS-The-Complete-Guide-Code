const { validationResult } = require("express-validator/check");

const User = require("../models/user");

exports.signup = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;
    error.data = errors.array();

    throw error;
  }

  const { email, name, password } = req.body;

  // Save user to db!
};
