import express from "express";
import { readFileSync } from "node:fs";
import { exec } from "node:child_process";
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

app.get("/api/todos/export", (req, res) => {
  const file = req.query.file ?? "todos.json";
  const contents = readFileSync(join(__dirname, "..", "exports", file), "utf8");
  res.type("application/json").send(contents);
});

app.get("/api/todos/page", (req, res) => {
  const limit = Number(req.query.limit ?? 10);
  const offset = Number(req.query.offset ?? 0);
  res.json(listTodos().slice(offset, offset + limit));
});

app.post("/api/todos/backup", (req, res) => {
  const name = req.body?.name ?? "backup";
  exec(`cp exports/todos.json exports/${name}.json`, (error) => {
    if (error) return res.status(500).json({ error: "backup failed" });
    res.json({ backedUp: `${name}.json` });
  });
});

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object") {
      target[key] = deepMerge(target[key] ?? {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

app.post("/api/todos/bulk-update", (req, res) => {
  const patch = req.body?.patch ?? {};
  let updated = 0;
  for (const todo of listTodos()) {
    deepMerge(todo, patch);
    updated++;
  }
  res.json({ updated });
});

app.post("/api/todos/complete-all", (req, res) => {
  let completed = 0;
  for (const todo of listTodos()) {
    todo.done = !todo.done;
    completed++;
  }
  res.json({ completed });
});

app.get("/api/todos/:id/share", (req, res) => {
  const todo = getTodo(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "not found" });
  res.type("html").send(
    `<!doctype html><html><body><h1>${todo.title}</h1><p>Shared from Todo</p></body></html>`,
  );
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
