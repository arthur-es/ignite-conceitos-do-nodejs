const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if (!username) {
    return response.status(400).json({ error: "Username has to be informed." });
  }

  const userFound = users.find((user) => user.username === username);

  if (!userFound) {
    return response.status(404).json({ error: "Username not found." });
  }

  request.username = username;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userFound = users.find((user) => user.username === username);

  if (userFound) {
    return response.status(400).json({
      error: "Username already taken.",
    });
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
    created_at: new Date(),
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = users.find((user) => user.username === request.username);

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { todos } = users.find((user) => user.username === request.username);

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { id } = request.params;

  const { todos } = users.find((user) => user.username === request.username);

  let todoFound = todos.find((todo) => todo.id === id);

  if (!todoFound) {
    return response.status(404).json({
      error: "TODO not found.",
    });
  }

  todoFound.title = title;
  todoFound.deadline = new Date(deadline);

  return response.status(200).json(todoFound);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { todos } = users.find((user) => user.username === request.username);

  let todoFound = todos.find((todo) => todo.id === id);

  if (!todoFound) {
    return response.status(404).json({
      error: "TODO not found.",
    });
  }

  todoFound.done = true;

  return response.status(200).json(todoFound);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const { todos } = users.find((user) => user.username === request.username);

  const todoIndex = todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({
      error: "TODO not found.",
    });
  }

  todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
