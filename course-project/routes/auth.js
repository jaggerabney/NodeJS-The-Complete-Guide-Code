const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.get("/signup", authController.getSignupPage);
router.post("/login", authController.postLoginPage);
router.post("/logout", authController.postLogoutPage);
router.post("/signup", authController.postSignupPage);

module.exports = router;
