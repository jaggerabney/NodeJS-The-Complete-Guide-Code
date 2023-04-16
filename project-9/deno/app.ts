import { Application } from "https://deno.land/x/oak/mod.ts";

import todoRoutes from "./routes/todos.ts";

const app = new Application();

app.use(todoRoutes.routes());
app.use(todoRoutes.allowedMethods());

await app.listen({ port: 3000 });
