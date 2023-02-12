exports.getLoginPage = function (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
  });
};
