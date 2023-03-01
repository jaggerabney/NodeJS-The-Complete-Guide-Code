const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("No Authorization header!");
    error.statusCode = 401;

    throw error;
  }

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, process.env.JWT_KEY);
  } catch (error) {
    error.statusCode = 500;

    throw error;
  }

  if (!decodedToken) {
    const error = new Error("Authentication failed!");
    error.statusCode = 401;

    throw error;
  }

  req.userId = decodedToken.userId;

  next();
};
