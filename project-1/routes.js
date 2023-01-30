function requestHandler(req, res) {
  const { url, method } = req;

  if (url === "/") {
    res.write(
      '<html><head><title>Greetings!</title></head><body><h1>Greetings, user!</h1><form action="/create-user" method="POST"><input type="text" name="username"><button type="submit">Send</button></form><a href="/users">Go to Users page</a></body></html>'
    );

    return res.end();
  }

  if (url === "/users") {
    res.write(
      '<html><head><title>Users</title></head><body><h1>Users</h1><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul><br><a href="/">Go to Home page<a></body></html>'
    );

    return res.end();
  }

  if (url === "/create-user" && method === "POST") {
    const body = [];

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    return req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split("=")[1];

      console.log(username);
      res.writeHead(302, {
        Location: "/",
      });

      return res.end();
    });
  }
}

module.exports = {
  handler: requestHandler,
};
