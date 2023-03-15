const expect = require("chai").expect;

describe("Intro tests", function () {
  it("should add numbers correctly", function () {
    const num1 = 2;
    const num2 = 3;

    expect(num1 + num2).to.equal(5);
  });

  it("shouldn't give a result of six", function () {
    const num1 = 2;
    const num2 = 3;

    expect(num1 + num2).not.to.equal(6);
  });
});
