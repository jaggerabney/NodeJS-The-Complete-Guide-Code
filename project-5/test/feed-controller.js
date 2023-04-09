const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
require("dotenv").config();

const FeedController = require("../controllers/feed");
const User = require("../models/user");

console.log("Test DB key: " + process.env.TEST_DB_CONNECTION_STRING);

describe("Feed controller", function () {
  before(function (done) {
    mongoose
      .connect(process.env.TEST_DB_CONNECTION_STRING)
      .then(() => {
        const user = new User({
          email: "test@test.com",
          password: "testtesttest",
          name: "Test",
          posts: [],
          _id: "5c0f66b979af55031b34728a",
        });

        return user.save();
      })
      .then(() => done());
  });

  it("should add a created post to the posts of the creator", function (done) {
    const req = {
      body: {
        title: "Test post",
        content: "Please work!",
      },
      file: {
        path: "abc",
      },
      userId: "5c0f66b979af55031b34728a",
    };

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    };

    FeedController.createPost(req, res, () => {}).then((user) => {
      expect(user).to.have.property("posts");
      expect(user.posts).to.have.length(1);

      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => mongoose.disconnect())
      .then(() => done());
  });
});
