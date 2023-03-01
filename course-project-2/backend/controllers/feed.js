const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = function (req, res, next) {
  const currentPage = req.query.page || 1;
  const paginationThreshold = 2;
  let totalItems = 0;

  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;

      return Post.find()
        .skip((currentPage - 1) * paginationThreshold)
        .limit(paginationThreshold);
    })
    .then((posts) => {
      res.status(200).json({
        message: "All posts fetched!",
        posts,
        totalItems,
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

exports.getStatus = function (req, res, next) {
  // Check for validation errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  }

  // Find user by ID passed through request header
  User.findById(req.userId)
    .then((user) => {
      // Check if user is not found - if not, throw an error
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 500;

        throw error;
      }

      // If a user is found, return the status
      res.status(200).json({
        message: "Status fetched!",
        status: user.status,
      });
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
  let creator;

  const post = new Post({
    title,
    imageUrl,
    content,
    creator: req.userId,
  });

  post
    .save()
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      console.log(user);

      creator = user;

      user.posts.push(post);

      return user.save();
    })
    .then(() => {
      res.status(201).json({
        message: "Post created successfully!",
        post,
        creator: {
          _id: creator._id,
          name: creator.name,
        },
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

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;

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

exports.updateStatus = function (req, res, next) {
  // Check for errors
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  }

  console.log(req.body);

  const newStatus = req.body.status;

  console.log(newStatus);

  // Find user by ID sent through request header
  User.findById(req.userId)
    .then((user) => {
      // Check if user is valid
      if (!user) {
        const error = new Error("User not found!");
        error.statusCode = 500;

        throw error;
      }

      // Set the new status and save the user
      user.status = newStatus;

      return user.save();
    })
    .then((result) => {
      // Return the result of user.save()
      return res
        .status(200)
        .json({ message: "Status updated!", status: result });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }

      next(error);
    });
};

exports.deletePost = function (req, res, next) {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Couldn't find post!");
        error.statusCode = 404;

        throw error;
      }

      if (post.creator.toString() !== req.userId) {
        const error = new Error("Not authorized!");
        error.statusCode = 403;

        throw error;
      }

      clearImage(post.imageUrl);

      return Post.findByIdAndRemove(postId);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      user.posts.pull(postId);
      user.save();

      return res.status(200).json({ message: "Deleted post!" });
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
