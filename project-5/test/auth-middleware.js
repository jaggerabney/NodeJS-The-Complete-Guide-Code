const expect = require("chai").expect;

const authMiddleware = require("../middleware/is-auth");

describe("Auth middleware", function () {
  it("should throw an error if no Auth header is present", function () {
    const req = {
      get: function (headerName) {
        return null;
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw(
      "Not authenticated."
    );
  });

  it("should throw an error if the Auth header value is only one word", function () {
    const req = {
      get: function (headerName) {
        return "xyz";
      },
    };

    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });
});
