const express = require("express");
const { check, body } = require("express-validator");

const feedController = require("../controllers/feed");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/posts", isAuth, feedController.getPosts);
router.get("/post/:postId", isAuth, feedController.getPost);
router.get("/status", isAuth, feedController.getStatus);
router.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);
router.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);
router.delete("/post/:postId", isAuth, feedController.deletePost);

module.exports = router;
