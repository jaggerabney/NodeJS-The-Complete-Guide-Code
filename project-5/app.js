const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const mainRoute = require("./routes/main");
const usersData = require("./routes/users");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", "views");

app.use(mainRoute);
app.use(usersData.route);

app.listen(3000);
