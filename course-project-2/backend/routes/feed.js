// Third-party imports
const express = require("express");
const { body } = require("express-validator");

// Project imports
const feedController = require("../controllers/feed");
const isAuth = require("../middleware/isAuth");

// Creates router
const router = express.Router();

// GET Routes

// All of the below routes use the isAuth middleware before the controller
// middleware to verify that the user is currently logged in

// GET -> /posts
router.get("/posts", isAuth, feedController.getPosts);
// GET -> /posts/[postId]
router.get("/post/:postId", isAuth, feedController.getPost);
// GET -> /status
router.get("/status", isAuth, feedController.getStatus);
// POST -> /post

// POST/PUT/DELETE Routes

// Like the GET routes, all of these routes are protected by the isAuth middleware

// POST -> /post
router.post(
  "/post",
  isAuth,
  // Checks if the title and content are at least five characters long
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);
// PUT -> /post/[postId]
router.put(
  "/post/:postId",
  isAuth,
  // Checks that the title and content are at least five characters long
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);
// PUT -> /status
router.put(
  "/status",
  isAuth,
  // Checks that the status is not empty
  body("status").trim().not().isEmpty(),
  feedController.updateStatus
);
// DELETE -> /post/[postId]
router.delete("/post/:postId", isAuth, feedController.deletePost);

// Exports the router object for use in App.js
module.exports = router;
