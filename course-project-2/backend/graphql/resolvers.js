const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/user");

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
      throw new Error("Invalid input!");
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
};
