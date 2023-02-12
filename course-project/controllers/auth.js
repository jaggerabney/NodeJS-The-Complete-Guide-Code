exports.getLoginPage = function (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isAuthenticated: req.isLoggedIn,
  });
};

exports.postLoginPage = function (req, res, next) {
  req.isLoggedIn = true;

  res.redirect("/");
};
