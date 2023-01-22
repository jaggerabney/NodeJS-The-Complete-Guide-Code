function requestHandler(req, res) {
  const { url } = req;

  if (url === "/") {
    res.write(
      '<html><head><title>Greetings!</title></head><body><h1>Greetings, user!</h1><input type="text" action="/create-user" method="POST"><button type="submit">Send</button><br><br><a href="/users">Go to Users page</a></body></html>'
    );

    return res.end();
  }

  if (url === "/users") {
    res.write(
      '<html><head><title>Users</title></head><body><h1>Users</h1><ul><li>User 1</li><li>User 2</li><li>User 3</li></ul><br><a href="/">Go to Home page<a></body></html>'
    );

    return res.end();
  }
}

module.exports = {
  handler: requestHandler,
};
