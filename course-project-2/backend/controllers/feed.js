const { validationResult } = require("express-validator/check");

const Post = require("../models/post");

exports.getPosts = function (req, res, next) {
  res.status(200).json({
    posts: [
      {
        _id: new Date().getTime(),
        title: "First post",
        content: "This is the first post!",
        imageUrl: "images/cat.jpg",
        creator: {
          name: "Jagger",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = function (req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed!");
    error.statusCode = 422;

    throw error;
  }

  const { title, content } = req.body;

  const post = new Post({
    title,
    imageUrl: "images/cat.jpg",
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
