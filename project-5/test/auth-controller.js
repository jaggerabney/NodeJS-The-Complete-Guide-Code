const expect = require("chai").expect;
const sinon = require("sinon");
const mongoose = require("mongoose");
require("dotenv").config();

const AuthController = require("../controllers/auth");
const User = require("../models/user");

console.log("Test DB key: " + process.env.TEST_DB_CONNECTION_STRING);

describe("Auth controller", function () {
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

  it("should throw a 500 error code if accessing the database fails", function (done) {
    // Stubs the findOne method so that it throws an error
    sinon.stub(User, "findOne");
    User.findOne.throws();

    // Creates a dummy req object for the login function to receive.
    // This is done so that it doesn't throw an error before trying to access the DB
    const req = {
      body: {
        email: "test@test.com",
        password: "testtesttest",
      },
    };

    // Invokes the login function with the created dummy req object.
    // The result object must pass two checks:
    // 1. One to check if it's an Error object
    // 2. One to check if it has a statusCode of 500
    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.be.an("error");
      expect(result).to.have.a.property("statusCode", 500);

      done();
    });

    // Restores the stubbed login function
    User.findOne.restore();
  });

  it("should send a response with a valid status for an existing user", function (done) {
    const req = {
      userId: "5c0f66b979af55031b34728a",
    };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;

        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };

    AuthController.getUserStatus(req, res, () => {})
      .then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal("I am new!");

        done();
      })
      .catch((error) => console.log(error));
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => mongoose.disconnect())
      .then(() => done());
  });
});
