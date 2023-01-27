const express = require("express");

const router = express.Router();

router.get("/users", (req, res, next) => {
  res.render("users", { title: "Users " });
});

module.exports = router;
