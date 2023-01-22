const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const { url, method } = req;

  if (url === "/") {
    res.write(
      '<html><head><title>Enter message</title></head><body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body></html>'
    );

    return res.end();
  }

  if (url === "/message" && method === "POST") {
    fs.writeFileSync("message.txt", "dummy text");

    res.writeHead(302, {
      Location: "/",
    });

    return res.end();
  }

  res.setHeader("Content-Type", "text/html");
  res.write(
    "<html><head><title>My First Page</title></head><body><h1>Hello from my Node.js server!</h1></body></html>"
  );
  res.end();
});

server.listen(3000);
