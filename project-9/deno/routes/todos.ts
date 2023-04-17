import { Router } from "https://deno.land/x/oak/mod.ts";

import { ObjectId } from "https://deno.land/x/mongo@v0.31.2/mod.ts";

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
  const todoId = context.params.todoId!;
  const data = await context.request.body().value;

  await getDb()
    .collection("todos")
    .updateOne({ _id: new ObjectId(todoId) }, { $set: { text: data.text } });

  const todos = await getDb().collection("todos").find();
  const formattedTodos = todos.map((todo) => {
    return { id: todo._id.$oid, text: todo.text };
  });

  context.response.body = {
    message: "Updated todo!",
    formattedTodos
  };
});

router.delete("/todos/:todoId", async (context) => {
  const todoId = context.params.todoId!;

  await getDb()
    .collection("todos")
    .deleteOne({ _id: new ObjectId(todoId) });

  const todos = await getDb().collection("todos").find();
  const formattedTodos = todos.map((todo) => {
    return { id: todo._id.$oid, text: todo.text };
  });

  context.response.body = {
    message: "Deleted todo!",
    formattedTodos
  };
});

export default router;
