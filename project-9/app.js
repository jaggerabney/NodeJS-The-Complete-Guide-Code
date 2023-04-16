const fs = require("fs").promises;

const text = "This is only a test!";

fs.writeFile("message_node.txt", text).then(() =>
  console.log("Wrote to message.txt!")
);
