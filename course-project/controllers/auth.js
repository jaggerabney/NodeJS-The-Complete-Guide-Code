exports.getLoginPage = function (req, res, next) {
  // forgive me, father, for this statement is a sin
  const isLoggedIn =
    req
      .get("Cookie")
      .split(";")
      .find((cookie) => cookie.split("=")[0].localeCompare("isLoggedIn"))
      .split("=")[1] === "true";

  console.log(isLoggedIn);

  res.render("auth/login", {
    title: "Login",
    path: "/login",
    isAuthenticated: isLoggedIn,
  });
};

exports.postLoginPage = function (req, res, next) {
  res.setHeader("Set-Cookie", "loggedIn=true");

  res.redirect("/");
};
