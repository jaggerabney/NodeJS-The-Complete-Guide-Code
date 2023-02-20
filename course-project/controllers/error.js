exports.get404page = function (req, res, next) {
  return res.status(404).render("errors/404", {
    title: "404 - Page not found",
    path: "",
  });
};

exports.get500page = function (req, res, next) {
  return res.status(500).render("errors/500", {
    title: "500 - Internal server error",
    path: "",
  });
};
