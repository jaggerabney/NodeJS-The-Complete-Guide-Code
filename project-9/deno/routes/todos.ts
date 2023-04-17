import { Router } from "https://deno.land/x/oak/mod.ts";

import { getDb } from "../helpers/db_client.ts";

const router = new Router();

interface Todo {
  id: string;
  text: string;
}

let todos: Todo[] = [];

router.get("/todos", (context) => {
  context.response.body = {
    message: "Fetched todos!",
    todos
  };
});

router.post("/todos", async (context) => {
  const data = await context.request.body().value;
  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: data.text
  };

  todos.push(newTodo);

  context.response.body = {
    message: "Created todo!",
    todos
  };
});

router.put("/todos/:todoId", async (context) => {
  const todoId = context.params.todoId;
  const targetIndex = todos.findIndex((todo) => todo.id === todoId);
  const data = await context.request.body().value;

  todos[targetIndex].text = data.text;

  context.response.body = {
    message: "Updated todo!",
    todos
  };
});

router.delete("/todos/:todoId", (context) => {
  const todoId = context.params.todoId;

  todos = todos.filter((todo) => todo.id !== todoId);

  context.response.body = {
    message: "Deleted todo!",
    todos
  };
});

export default router;
