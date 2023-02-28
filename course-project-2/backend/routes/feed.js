const express = require("express");
const { check, body } = require("express-validator/check");

const feedController = require("../controllers/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);
router.get("/post/:postId", feedController.getPost);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

module.exports = router;
