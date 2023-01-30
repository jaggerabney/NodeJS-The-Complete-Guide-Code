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

// then actually handle routes and return HTML

app.use("/users", (req, res, next) => {
  res.send(
    '<h1>Users Page</h1><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul><a href="/">Go to Home page</a>'
  );
});

app.use("/", (req, res, next) => {
  res.send('<h1>Home Page</h1><a href="/users">Go to Users page</a>');
});

app.listen(3000);
