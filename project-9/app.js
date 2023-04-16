const http = require("http");

const server = http.createServer((req, res) => {
  res.end("Hello world!");
});

console.log("Server running at http://localhost:3000/.");

server.listen(3000);
