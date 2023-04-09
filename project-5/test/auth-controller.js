const expect = require("chai").expect;
const sinon = require("sinon");

const AuthController = require("../controllers/auth");
const User = require("../models/user");

describe("Auth controller - login", function () {
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
});
