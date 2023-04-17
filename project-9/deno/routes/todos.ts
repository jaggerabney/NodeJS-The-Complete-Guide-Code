import { Router } from "https://deno.land/x/oak/mod.ts";

import { getDb } from "../helpers/db_client.ts";

const router = new Router();

interface Todo {
  id?: string;
  text: string;
}

router.get("/todos", async (context) => {
  const todos = await getDb().collection("todos").find().toArray();
  const formattedTodos = todos.map((todo) => {
    return { id: todo._id.toString(), text: todo.text };
  });

  context.response.body = {
    message: "Fetched todos!",
    todos: formattedTodos
  };
});

router.post("/todos", async (context) => {
  const data = await context.request.body().value;
  const newTodo: Todo = {
    text: data.text
  };

  await getDb().collection("todos").insertOne(newTodo);

  const todos = await getDb().collection("todos").find();
  const formattedTodos = todos.map((todo) => {
    return { id: todo._id.$oid, text: todo.text };
  });

  context.response.body = {
    message: "Created todo!",
    todos: formattedTodos
  };
});

router.put("/todos/:todoId", async (context) => {
  // const todoId = context.params.todoId;
  // const targetIndex = todos.findIndex((todo) => todo.id === todoId);
  // const data = await context.request.body().value;
  // todos[targetIndex].text = data.text;
  // context.response.body = {
  //   message: "Updated todo!",
  //   todos
  // };
});

router.delete("/todos/:todoId", (context) => {
  // const todoId = context.params.todoId;
  // todos = todos.filter((todo) => todo.id !== todoId);
  // context.response.body = {
  //   message: "Deleted todo!",
  //   todos
  // };
});

export default router;
