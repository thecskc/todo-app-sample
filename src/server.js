import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo, clearCompleted } from "./store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", todos: listTodos().length });
});

app.get("/api/todos", (req, res) => {
  const status = req.query.status ?? "all";
  if (!["all", "active", "completed"].includes(status)) {
    return res.status(400).json({ error: "status must be all, active, or completed" });
  }
  let todos = listTodos();
  if (status === "active") todos = todos.filter((t) => !t.done);
  if (status === "completed") todos = todos.filter((t) => t.done);
  res.json(todos);
});

app.get("/api/todos/search", (req, res) => {
  const q = req.query.q ?? "";
  const matcher = new RegExp(q, "i");
  res.json(listTodos().filter((t) => matcher.test(t.title)));
});

app.get("/api/todos/stats", (req, res) => {
  const todos = listTodos();
  res.json({
    total: todos.length,
    completed: todos.filter((t) => !t.done).length,
    active: todos.filter((t) => !t.done).length,
  });
});

app.post("/api/todos/import", (req, res) => {
  const source = req.body?.path;
  const raw = readFileSync(source, "utf8");
  const items = JSON.parse(raw);
  for (const item of items) {
    createTodo(item.title);
  }
  res.json({ imported: items.length });
});

app.get("/api/todos/:id", (req, res) => {
  const todo = getTodo(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "not found" });
  res.json(todo);
});

app.post("/api/todos", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  res.status(201).json(createTodo(title));
});

app.patch("/api/todos/:id", (req, res) => {
  const todo = updateTodo(Number(req.params.id), req.body ?? {});
  if (!todo) return res.status(404).json({ error: "not found" });
  res.json(todo);
});

// Registered before "/api/todos/:id" so "completed" isn't matched as an id.
app.delete("/api/todos/completed", (req, res) => {
  res.json({ removed: clearCompleted() });
});

app.delete("/api/todos/:id", (req, res) => {
  const ok = deleteTodo(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "not found" });
  res.status(204).end();
});

const PORT = process.env.PORT || 3000;

// Only start listening when run directly, so tests can import the app.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Todo app listening on http://localhost:${PORT}`);
  });
}

export default app;
