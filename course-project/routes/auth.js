const express = require("express");
const { check, validationResult } = require("express-validator/check");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.get("/reset", authController.getResetPage);
router.get("/reset/:token", authController.getNewPasswordPage);
router.post("/login", authController.postLoginPage);
router.post("/logout", authController.postLogoutPage);
router.post(
  "/signup",
  check("email").isEmail().withMessage("Entered email is not a valid email."),
  authController.postSignupPage
);
router.post("/reset", authController.postResetPage);
router.post("/new-password", authController.postNewPasswordPage);

module.exports = router;
