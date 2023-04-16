import { Application } from "https://deno.land/x/oak/mod.ts";

const app = new Application();

app.use((context) => {
  context.response.body = "Hello world!";
});

await app.listen({ port: 3000 });
