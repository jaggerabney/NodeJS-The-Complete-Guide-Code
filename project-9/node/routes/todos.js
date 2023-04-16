const express = require("express");

const router = express.Router();

let todos = [];

router.get("/todos", (req, res, next) => {
  res.status(200).json({ message: "Fetched todos!", todos });
});

router.post("/todos", (req, res, next) => {
  const newTodo = { id: new Date().toISOString(), text: req.body.text };

  todos.push(newTodo);

  res.status(201).json({ message: "Created todo!", todo: newTodo });
});

router.put("/todos/:todoId", (req, res, next) => {
  const todoId = req.params.todoId;
  const targetIndex = todos.findIndex((todo) => todo.id === todoId);

  todos[targetIndex].text = req.body.text;

  res.status(200).json({ message: "Updated todo!", todos });
});

router.delete("/todos/:todoId", (req, res, next) => {
  const todoId = req.params.todoId;

  todos = todos.filter((todo) => todo.id !== todoId);

  res.status(200).json({ message: "Deleted todo!", todos });
});

module.exports = router;
