const express = require("express");

const app = express();

// funnel requests through two middleware functions

app.use((req, res, next) => {
  console.log("In middleware function #1!");
  next();
});

app.use((req, res, next) => {
  console.log("In middleware function #2!");
  next();
});

app.listen(3000);
