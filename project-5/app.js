const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const mainRoute = require("./routes/main");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", "views");

app.use(mainRoute);

app.listen(3000);
