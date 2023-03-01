const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");
const {
  throwCustomError,
  throwError,
  hasNoValidationErrors,
} = require("../util/error");

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
      return res.status(200).json({
        message: "All posts fetched!",
        posts,
        totalItems,
      });
    })
    .catch((error) => {
      throwError(error);
    });
};

exports.getPost = function (req, res, next) {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        throwCustomError("Post not found!", 404);
      }

      return res.status(200).json({ message: "Post fetched!", post });
    })
    .catch((error) => {
      throwError(error);
    });
};

exports.getStatus = function (req, res, next) {
  // Find user by ID passed through request header
  User.findById(req.userId)
    .then((user) => {
      // Check if user is not found - if not, throw an error
      if (!user) {
        throwCustomError("User not found!", 500);
      }

      // If a user is found, return the status
      return res.status(200).json({
        message: "Status fetched!",
        status: user.status,
      });
    })
    .catch((error) => {
      throwError(error);
    });
};

exports.createPost = function (req, res, next) {
  if (hasNoValidationErrors(validationResult(req))) {
    if (!req.file) {
      throwCustomError("No image provided!", 422);
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
        creator = user;

        user.posts.push(post);

        return user.save();
      })
      .then(() => {
        return res.status(201).json({
          message: "Post created successfully!",
          post,
          creator: {
            _id: creator._id,
            name: creator.name,
          },
        });
      })
      .catch((error) => {
        throwError(error);
      });
  }
};

exports.updatePost = function (req, res, next) {
  if (hasNoValidationErrors(validationResult(req))) {
    const { postId } = req.params;
    const { title, content } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.image;

    if (!imageUrl) {
      throwCustomError("No file picked!", 422);
    }

    Post.findById(postId)
      .then((post) => {
        if (!post) {
          throwCustomError("Couldn't find post!", 404);
        }

        if (post.creator.toString() !== req.userId) {
          throwCustomError("Not authorized!", 403);
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
        throwError(error);
      });
  }
};

exports.updateStatus = function (req, res, next) {
  if (hasNoValidationErrors(validationResult(req))) {
    const newStatus = req.body.status;

    // Find user by ID sent through request header
    User.findById(req.userId)
      .then((user) => {
        // Check if user is valid
        if (!user) {
          throwCustomError("User not found!", 404);
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
        throwError(error);
      });
  }
};

exports.deletePost = function (req, res, next) {
  const { postId } = req.params;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        throwCustomError("Couldn't find post!", 404);
      }

      if (post.creator.toString() !== req.userId) {
        throwCustomError("Not authorized!", 403);
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
      throwError(error);
    });
};

function clearImage(filePath) {
  filePath = path.join(__dirname, "..", filePath);

  fs.unlink(filePath, (error) => console.log(error));
}
