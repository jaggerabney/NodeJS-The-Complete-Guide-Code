// const fs = require("fs");
import fs from "fs";

const resHandler = (req, res, next) => {
  fs.readFile("my-page.html", "utf8", (err, data) => {
    res.send(data);
  });
};

export default resHandler;
