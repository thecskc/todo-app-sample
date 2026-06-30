import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  bulkUpdateTodos,
  deleteTodo,
  clearCompleted,
  summarizeTodos,
} from "./store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", todos: listTodos().length, summary: summarizeTodos() });
});

app.get("/api/todos", (req, res) => {
  const status = req.query.status ?? "all";
  if (!["all", "active", "completed", "archived"].includes(status)) {
    return res.status(400).json({ error: "status must be all, active, completed, or archived" });
  }
  res.json(
    listTodos({
      status,
      priority: req.query.priority,
      q: req.query.q,
      dueBefore: req.query.dueBefore,
      sort: req.query.sort,
    }),
  );
});

app.get("/api/todos/stats", (req, res) => {
  res.json(summarizeTodos());
});

app.get("/api/todos/export", (req, res) => {
  res.json({ exportedAt: new Date().toISOString(), todos: listTodos({ sort: "created" }) });
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
  res.status(201).json(
    createTodo(title, {
      priority: req.body?.priority,
      dueDate: req.body?.dueDate,
      notes: req.body?.notes,
    }),
  );
});

app.post("/api/todos/bulk", (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  const updated = bulkUpdateTodos(ids, req.body?.fields ?? {});
  res.json({ updated });
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

app.delete("/api/todos/archived", (req, res) => {
  const archived = listTodos({ status: "archived" });
  for (const todo of archived) {
    deleteTodo(todo.id);
  }
  res.json({ removed: archived.length });
});

const PORT = process.env.PORT || 3000;

// Only start listening when run directly, so tests can import the app.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  app.listen(PORT, () => {
    console.log(`Todo app listening on http://localhost:${PORT}`);
  });
}

export default app;
