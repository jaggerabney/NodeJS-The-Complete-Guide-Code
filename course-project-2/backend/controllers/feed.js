// Node.js imports
const fs = require("fs");
const path = require("path");

// Third-party imports
const { validationResult } = require("express-validator");

// Project imports
const io = require("../socket");
const Post = require("../models/post");
const User = require("../models/user");
const { clearImage } = require("../util/image");
const {
  throwCustomError,
  hasNoValidationErrors,
  addStatusCodeTo,
} = require("../util/error");
const user = require("../models/user");

exports.getPosts = async function (req, res, next) {
  // Variables for pagination
  const currentPage = req.query.page || 1;
  const paginationThreshold = 2;

  try {
    // Fetches all posts (as well as their number) from the db
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      // These functions are for pagination:
      // skip excludes documents and limit restricts how many are returned
      .skip((currentPage - 1) * paginationThreshold)
      .limit(paginationThreshold);

    // Returns the posts and their number to the frontend
    return res.status(200).json({
      message: "All posts fetched!",
      posts,
      totalItems,
    });
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};

exports.getPost = async function (req, res, next) {
  // Gets the postId from the "post" query parameter
  const { postId } = req.params;

  try {
    // Finds the post by ID
    const post = await Post.findById(postId).populate("creator");

    // Checks that the post is defined
    if (!post) {
      throwCustomError("Post not found!", 404);
    }

    // Returns the post, along with a success message
    return res.status(200).json({ message: "Post fetched!", post });
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};

exports.getStatus = async function (req, res, next) {
  try {
    // Find user by ID passed through request header
    const user = await User.findById(req.userId);

    // Check if user is not found - if not, throw an error
    if (!user) {
      throwCustomError("User not found!", 500);
    }

    // If a user *is* found, return a success message and the status to the frontend
    return res.status(200).json({
      message: "Status fetched!",
      status: user.status,
    });
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};

exports.createPost = async function (req, res, next) {
  // Checks if there were any errors during validation in the previous middlewares.
  // hasNoValidationErrors either returns true if there are no errors, or throws an error
  // if there are any; thus, there's no need for an else block.
  if (hasNoValidationErrors(validationResult(req))) {
    // Verify that an image was provided
    if (!req.file) {
      throwCustomError("No image provided!", 422);
    }

    try {
      // Get the post title, content, image URL, and creators
      const { title, content } = req.body;
      const imageUrl = req.file.path;
      const creator = await User.findById(req.userId);

      // Create an instance of the Post model defined in models/post.js
      const post = new Post({
        title,
        imageUrl,
        content,
        creator: creator._id,
      });

      // Saves the recently-created post to the db
      await post.save();

      // Adds the newly-saved post to the creator's posts, then saves
      // the change to the db
      creator.posts.push(post);
      await creator.save();

      // Syncs all connected clients' posts
      io.get().emit("posts", {
        action: "create",
        post: {
          ...post._doc,
          creator: { _id: req.userId, name: creator.name },
        },
      });

      // Returns a success message, the created post object, and info
      // about the post's creator to the frontend
      return res.status(201).json({
        message: "Post created successfully!",
        post,
        creator: {
          _id: creator._id,
          name: creator.name,
        },
      });
    } catch (error) {
      next(addStatusCodeTo(error));
    }
  }
};

exports.updatePost = async function (req, res, next) {
  // Checks if there were any errors during validation in the previous middlewares.
  // hasNoValidationErrors either returns true if there are no errors, or throws an error
  // if there are any; thus, there's no need for an else block.
  if (hasNoValidationErrors(validationResult(req))) {
    // Gets...
    // - postId from the "post" query parameter
    // - title & content from the request body
    // - imageUrl from either the appended "req.file" variable (if "req.file" exists),
    //   or the request body (if "req.file" doens't)
    const { postId } = req.params;
    const { title, content } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.image;

    // Checks that imageUrl is defined, just in case
    if (!imageUrl) {
      throwCustomError("No file picked!", 422);
    }

    try {
      // Gets the post to be edited from its ID
      const post = await Post.findById(postId).populate("creator");

      // Checks that the post is defined
      if (!post) {
        throwCustomError("Couldn't find post!", 404);
      }

      // Checks that the post belongs to the user;
      // if it doesn't, an error is thrown
      if (post.creator._id.toString() !== req.userId) {
        throwCustomError("Not authorized!", 403);
      }

      // Checks if the new imageUrl is different from the old one;
      // if so, the image associated with the old image URL is deleted
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      // Assigns the posts new title, imageUrl, and content
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;

      // Saves the post to the db
      await post.save();

      // Syncs all connected clients' posts
      io.get().emit("posts", { action: "update", post });

      // Returns the post and a success message to the frontend
      return res.status(200).json({ message: "Post updated!", post });
    } catch (error) {
      next(addStatusCodeTo(error));
    }
  }
};

exports.updateStatus = async function (req, res, next) {
  // Checks if there were any errors during validation in the previous middlewares.
  // hasNoValidationErrors either returns true if there are no errors, or throws an error
  // if there are any; thus, there's no need for an else block.
  if (hasNoValidationErrors(validationResult(req))) {
    // Gets the new status from the request body
    const newStatus = req.body.status;

    try {
      // Finds the user by the ID sent through the request header
      const user = await User.findById(req.userId);

      // Checks that the user is defined
      if (!user) {
        throwCustomError("User not found!", 404);
      }

      // Sets the new status and saves the user
      user.status = newStatus;

      await user.save();

      // Returns the new status and a success message to the frontend
      return res
        .status(200)
        .json({ message: "Status updated!", status: user.status });
    } catch (error) {
      next(addStatusCodeTo(error));
    }
  }
};

exports.deletePost = async function (req, res, next) {
  // Gets the postId from the "post" query parameter
  const { postId } = req.params;

  try {
    // Gets the target post by its ID, and the user by the ID
    // passed through the request header
    const post = await Post.findById(postId);
    const user = await User.findById(req.userId);

    // Checks that the post is defined
    if (!post) {
      throwCustomError("Couldn't find post!", 404);
    }

    // Checks that the post belongs to the current user
    if (post.creator.toString() !== req.userId) {
      throwCustomError("Not authorized!", 403);
    }

    // Deletes the post's image, and deletes the post from the db and the user's posts
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);
    user.posts.pull(postId);

    // Saves the changes made to the user to the db
    await user.save();

    // Syncs all connected clients' posts
    io.get().emit("posts", { action: "delete", postId });

    // Returns a success message to the frontend
    return res.status(200).json({ message: "Deleted post!" });
  } catch (error) {
    next(addStatusCodeTo(error));
  }
};
