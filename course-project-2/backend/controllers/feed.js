const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

exports.getPosts = function (req, res, next) {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "All posts fetched!",
        posts,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }

      next(error);
    });
};

exports.getPost = function (req, res, next) {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post not found!");
        error.statusCode = 404;

        throw error;
      }

      return res.status(200).json({ message: "Post fetched!", post });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }

      next(error);
    });
};

exports.createPost = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided!");
    error.statusCode = 422;

    throw error;
  }

  const { title, content } = req.body;
  const imageUrl = req.file.path;

  const post = new Post({
    title,
    imageUrl,
    content,
    creator: {
      name: "Jagger",
    },
  });

  post
    .save()
    .then((result) => {
      console.log(result);

      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }

      next(error);
    });
};

exports.updatePost = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  const imageUrl = req.file ? req.file.path : req.body.image;

  if (!imageUrl) {
    const error = new Error("No file picked!");
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Couldn't find post!");
        error.statusCode = 404;

        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      return post.save();
    })
    .then((result) => {
      return res.status(200).json({ message: "Post updated!", post: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }

      next(error);
    });
};

function clearImage(filePath) {
  filePath = path.join(__dirname, "..", filePath);

  fs.unlink(filePath, (error) => console.log(error));
}
