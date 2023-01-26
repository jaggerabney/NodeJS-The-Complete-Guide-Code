const express = require("express");

const mainRoute = require("./routes/main");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(mainRoute);

app.listen(3000);
