import { Application } from "https://deno.land/x/oak/mod.ts";

import todoRoutes from "./routes/todos.ts";
import { connect } from "./helpers/db_client.ts";

await connect();

const app = new Application();

// anti-CORS middleware
app.use(async (context, next) => {
  context.response.headers.set("Access-Control-Allow-Origin", "*");
  context.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE"
  );
  context.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  await next();
});

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());

await app.listen({ port: 8000 });
