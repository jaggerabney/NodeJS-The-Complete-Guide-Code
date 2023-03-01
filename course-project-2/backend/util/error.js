exports.throwCustomError = function (message, status) {
  const error = new Error(message);
  error.statusCode = status;

  throw error;
};

exports.throwError = function (error) {
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  next(error);
};

exports.hasNoValidationErrors = function (errors) {
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  } else {
    return true;
  }
};
