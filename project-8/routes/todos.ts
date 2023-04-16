import { Router } from "express";

import { Todo } from "../models/todo";

// Dummy values
let todos: Todo[] = [];

const router = Router();

router.get("/", (req, res, next) => {
  res.status(200).json({ todos: todos });
});

router.post("/todo", (req, res, next) => {
  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: req.body.text,
  };

  todos.push(newTodo);

  res.status(201).json({ message: "Added todo!", todo: newTodo, todos });
});

router.put("/todo/:todoId", (req, res, next) => {
  const todoId = req.params.todoId;
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  if (todoIndex >= 0) {
    todos[todoIndex].text = req.body.text;

    res.status(200).json({ message: "Updated todo!", todos });
  } else {
    res.status(404).json({ message: "Couldn't find todo for the given ID!" });
  }
});

router.delete("/todo/:todoId", (req, res, next) => {
  todos = todos.filter((todo) => todo.id !== req.params.todoId);

  res.status(200).json({ message: "Deleted todo!", todos });
});

export default router;
