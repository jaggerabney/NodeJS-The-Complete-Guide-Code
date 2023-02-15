const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.get("/reset", authController.getResetPage);
router.post("/login", authController.postLoginPage);
router.post("/logout", authController.postLogoutPage);
router.post("/signup", authController.postSignupPage);
router.post("/reset", authController.postResetPage);

module.exports = router;
