const jwt = require("jsonwebtoken");
require("dotenv").config();

const { throwCustomError, addStatusCodeTo } = require("../util/error");

module.exports = (req, res, next) => {
  // Gets auth info from Authorization request header
  const authHeader = req.get("Authorization");

  // Verifies that the auth header is defined
  if (!authHeader) {
    throwCustomError("No Authorization header!", 401);
  }

  try {
    // Tries to get and decode the auth token from the auth header
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);

    // Verifies that the decoded token is defined; if not, something went wrong,
    // so an error is thrown
    if (!decodedToken) {
      throwCustomError("Authorization failed!", 401);
    }

    // Assigns the userId field to the request so that future middlewares
    // can use the logged in user's ID
    req.userId = decodedToken.userId;

    // Passes the request to the next middleware
    next();
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};
