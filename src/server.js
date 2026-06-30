import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  clearCompleted,
  isOverdue,
  normalizePriority,
  summarizeTodos,
} from "./store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const STATUSES = ["all", "active", "completed", "overdue"];
const PRIORITIES = ["all", "low", "normal", "high"];
const SORTS = ["created", "due", "priority"];
const PRIORITY_WEIGHT = { high: 0, normal: 1, low: 2 };

app.use(express.json());
app.use(express.static(join(__dirname, "..", "public")));

function hasValidDateShape(value) {
  if (value === undefined || value === null || value === "") return true;
  return !Number.isNaN(Date.parse(value));
}

function readTodoPayload(body) {
  return {
    title: (body?.title ?? "").trim(),
    priority: normalizePriority(body?.priority),
    dueDate: body?.dueDate || null,
    notes: body?.notes ?? "",
  };
}

function filterByStatus(todos, status) {
  if (status === "active") return todos.filter((t) => !t.done);
  if (status === "completed") return todos.filter((t) => t.done);
  if (status === "overdue") return todos.filter((t) => isOverdue(t));
  return todos;
}

function filterByPriority(todos, priority) {
  if (!priority || priority === "all") return todos;
  return todos.filter((t) => normalizePriority(t.priority) === priority);
}

function filterByQuery(todos, query) {
  if (!query) return todos;
  const needle = query.trim().toLowerCase();
  return todos.filter((todo) => {
    return todo.title.toLowerCase().includes(needle) || todo.notes.toLowerCase().includes(needle);
  });
}

function sortTodos(todos, sort) {
  if (sort === "due") {
    return todos.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }
  if (sort === "priority") {
    return todos.sort((a, b) => {
      return PRIORITY_WEIGHT[normalizePriority(a.priority)] - PRIORITY_WEIGHT[normalizePriority(b.priority)];
    });
  }
  return todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", todos: listTodos().length });
});

app.get("/api/todos", (req, res) => {
  const status = req.query.status ?? "all";
  const priority = req.query.priority ?? "all";
  const sort = req.query.sort ?? "created";
  const query = req.query.q ?? "";

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "status must be all, active, completed, or overdue" });
  }
  if (!PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: "priority must be all, low, normal, or high" });
  }
  if (!SORTS.includes(sort)) {
    return res.status(400).json({ error: "sort must be created, due, or priority" });
  }

  let todos = listTodos();
  todos = filterByStatus(todos, status);
  todos = filterByPriority(todos, priority);
  todos = filterByQuery(todos, query);
  res.json(sortTodos(todos, sort));
});

app.get("/api/todos/:id", (req, res) => {
  const todo = getTodo(Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "not found" });
  res.json(todo);
});

app.get("/api/todos/summary", (req, res) => {
  res.json(summarizeTodos());
});

app.post("/api/todos", (req, res) => {
  const fields = readTodoPayload(req.body);
  if (!fields.title) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!hasValidDateShape(fields.dueDate)) {
    return res.status(400).json({ error: "dueDate must be a valid date" });
  }
  res.status(201).json(createTodo(fields));
});

app.patch("/api/todos/:id", (req, res) => {
  if (!hasValidDateShape(req.body?.dueDate)) {
    return res.status(400).json({ error: "dueDate must be a valid date" });
  }
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
