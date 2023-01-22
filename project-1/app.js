const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded());

app.use("/add-product", (req, res, next) => {
  res.send(
    '<h1>Add Product Page</h1><form action="/product" method="POST"><input type="text" name="title"><button type="submit">Send</button></form>'
  );
});

app.post("/product", (req, res, next) => {
  console.log(req.body);
  res.redirect("/");
});

app.use("/", (req, res, next) => {
  res.send("<h1>Hello from Express!</h1>");
});

app.listen(3000);
