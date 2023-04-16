const server = Deno.listen({ port: 3000 });
console.log("Server running at http://localhost:3000/.");

for await (const conn of server) {
  serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
  const httpConnection = Deno.serveHttp(conn);

  for await (const requestEvent of httpConnection) {
    const body = "Hello world!";

    requestEvent.respondWith(new Response(body, { status: 200 }));
  }
}
