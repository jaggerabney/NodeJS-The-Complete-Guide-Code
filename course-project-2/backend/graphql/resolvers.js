const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const Post = require("../models/post");

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

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
};
