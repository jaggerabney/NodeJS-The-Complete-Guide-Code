// NodeJS improts
import { Router } from "express";

// Project imports
import { Todo } from "../models/todo";

// Type declarations
type RequestBody = { text: string };
type RequestParams = { todoId: string };

// Dummy values
let todos: Todo[] = [];

const router = Router();

// GET route for "/", which just returns the todos array
router.get("/", (req, res, next) => {
  res.status(200).json({ todos: todos });
});

// POST route for "/todo", which adds the passed todo to
// the todos array
router.post("/todo", (req, res, next) => {
  // uses type casting for better auto-completion
  const body = req.body as RequestBody;

  // defines new todo
  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };

  // adds the new todo to the todos array
  todos.push(newTodo);

  // returns the new todo and todos array to the client
  res.status(201).json({ message: "Added todo!", todo: newTodo, todos });
});

// PUT route for "/todo/:todoId", which updates the todo belonging to the given ID
router.put("/todo/:todoId", (req, res, next) => {
  // uses type casting for better auto-completion
  const params = req.params as RequestParams;
  const body = req.body as RequestBody;

  // extracts todoId from params to find the index of the todo to update
  const todoId = params.todoId;
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);

  // if the todoIndex is greater than/equal to 0, then a valid todo was found;
  // otherwise, no todo was found for the given ID
  if (todoIndex >= 0) {
    // updates text
    todos[todoIndex].text = body.text;

    // returns todos to client
    res.status(200).json({ message: "Updated todo!", todos });
  } else {
    // returns error message to client
    res.status(404).json({ message: "Couldn't find todo for the given ID!" });
  }
});

// DELETE route for "/todo/:todoId", which deletes the todo belonging to the given ID
router.delete("/todo/:todoId", (req, res, next) => {
  // uses type casting for better auto-completion
  const params = req.params as RequestParams;

  // filters todos array such that the todo with the given ID is removed
  todos = todos.filter((todo) => todo.id !== params.todoId);

  // returns new todos array to client
  res.status(200).json({ message: "Deleted todo!", todos });
});

export default router;
