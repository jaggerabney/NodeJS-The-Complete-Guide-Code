exports.get404page = function (req, res, next) {
  res.status(404).render("404", {
    title: "404 - Page not found",
    path: "",
    isAuthenticated: req.isLoggedIn,
  });
};
