const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const Post = require("../models/post");
const { clearImage } = require("../util/image");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const { email, name, password } = userInput;
    const errors = [];

    if (!validator.isEmail(email)) {
      errors.push({ message: "Invalid email!" });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Invalid password!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new Error("User already exists!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("User not found!");
      error.code = 401;

      throw error;
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      const error = new Error("Invalid password!");
      error.code = 401;

      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    return {
      token,
      userId: user._id.toString(),
    };
  },
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    const { title, content, imageUrl } = postInput;
    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Invalid title!" });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Invalid content!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    const creator = await User.findById(req.userId);

    if (!creator) {
      const error = new Error("Invalid user!");
      error.code = 401;

      throw error;
    }

    const post = new Post({
      title,
      content,
      imageUrl,
      creator,
    });

    const createdPost = await post.save();

    creator.posts.push(createdPost);
    await creator.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  getAllPosts: async function ({ page }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    if (!page) {
      page = 1;
    }

    const paginationThreshold = 2;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("creator")
      .skip((page - 1) * paginationThreshold)
      .limit(paginationThreshold);
    const total = await Post.find().countDocuments();

    if (!posts) {
      const error = new Error("No posts!");
      error.code = 401;

      throw error;
    }

    return {
      posts: posts.map((post) => {
        return {
          ...post._doc,
          __id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        };
      }),
      total,
    };
  },
  getPost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    if (!postId) {
      throw new Error("No postId provided!");
    }

    const post = await Post.findById(postId).populate("creator");

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  },
  updatePost: async function ({ postId, postInput }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    const post = await Post.findById(postId).populate("creator");

    if (!post) {
      const error = new Error("No post!");
      error.code = 401;

      throw error;
    }

    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;

      throw error;
    }

    const { title, content } = postInput;
    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: "Invalid title!" });
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      errors.push({ message: "Invalid content!" });
    }

    if (errors.length > 0) {
      const error = new Error("Invalid input!");
      error.data = errors;
      error.code = 422;

      throw error;
    }

    post.title = title;
    post.content = content;

    if (postInput.imageUrl !== "undefined") {
      post.imageUrl = postInput.imageUrl;
    }

    const updatedPost = await post.save();

    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString(),
    };
  },
  deletePost: async function ({ postId }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("No post!");
      error.code = 401;

      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.code = 403;

      throw error;
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    return true;
  },
  user: async function (args, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;

      throw error;
    }

    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
  updateStatus: async function ({ status }, req) {
    if (!req.isAuth) {
      const error = new Error("Not authenticated!");
      error.code = 401;

      throw error;
    }

    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error("No user found!");
      error.code = 404;

      throw error;
    }

    user.status = status;
    await user.save();

    return {
      ...user._doc,
      _id: user._id.toString(),
    };
  },
};
