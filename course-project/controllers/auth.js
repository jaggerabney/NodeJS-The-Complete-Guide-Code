exports.getLoginPage = function (req, res, next) {
  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postLoginPage = function (req, res, next) {
  req.session.isLoggedIn = true;

  res.redirect("/");
};
