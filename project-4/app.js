const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const mainRoute = require("./routes/main");
const usersRoute = require("./routes/users");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(mainRoute);
app.use(usersRoute);

app.listen(3000);
