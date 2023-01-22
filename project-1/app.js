const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded());

app.use("/", (req, res, next) => {
  // console.log("In middleware!");
  next();
});

app.use("/add-product", (req, res, next) => {
  res.send(
    '<h1>Add Product Page</h1><form action="/product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>'
  );
});

app.use("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Hello from Express!</h1>");
});

app.listen(3000);
