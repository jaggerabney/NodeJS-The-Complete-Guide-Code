const express = require("express");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.post("/login", authController.postLoginPage);
router.post("/logout", authController.postLogoutPage);

module.exports = router;
