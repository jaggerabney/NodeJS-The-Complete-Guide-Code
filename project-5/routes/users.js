const express = require("express");

const router = express.Router();

const users = [];

router.get("/users", (req, res, next) => {
  res.render("users", { title: "Users ", users: users });
});

router.post("/users", (req, res, next) => {
  users.push({ username: req.body.username });
  res.redirect("/");
});

exports.route = router;
exports.users = users;
