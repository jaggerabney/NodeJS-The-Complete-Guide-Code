"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// Dummy values
let todos = [];
const router = (0, express_1.Router)();
router.get("/", (req, res, next) => {
    res.status(200).json({ todos: todos });
});
router.post("/todo", (req, res, next) => {
    const body = req.body;
    const newTodo = {
        id: new Date().toISOString(),
        text: body.text,
    };
    todos.push(newTodo);
    res.status(201).json({ message: "Added todo!", todo: newTodo, todos });
});
router.put("/todo/:todoId", (req, res, next) => {
    const params = req.params;
    const body = req.body;
    const todoId = params.todoId;
    const todoIndex = todos.findIndex((todo) => todo.id === todoId);
    if (todoIndex >= 0) {
        todos[todoIndex].text = body.text;
        res.status(200).json({ message: "Updated todo!", todos });
    }
    else {
        res.status(404).json({ message: "Couldn't find todo for the given ID!" });
    }
});
router.delete("/todo/:todoId", (req, res, next) => {
    const params = req.params;
    todos = todos.filter((todo) => todo.id !== params.todoId);
    res.status(200).json({ message: "Deleted todo!", todos });
});
exports.default = router;
