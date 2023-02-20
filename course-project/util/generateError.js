function generateError(message, code) {
  const error = new Error(message);
  error.httpStatusCode = code;

  return error;
}

module.exports = generateError;
