// In-memory todo store. Swap this module out for a real database later.
let nextId = 1;
const todos = [];
const PRIORITIES = ["low", "normal", "high"];

export function listTodos() {
  return todos;
}

export function getTodo(id) {
  return todos.find((t) => t.id === id);
}

export function normalizePriority(priority = "normal") {
  return PRIORITIES.includes(priority) ? priority : "normal";
}

export function normalizeDueDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function isOverdue(todo, now = new Date()) {
  if (!todo.dueDate || todo.done) return false;
  return new Date(todo.dueDate) < now;
}

export function createTodo(input) {
  const fields = typeof input === "string" ? { title: input } : input;
  const todo = {
    id: nextId++,
    title: fields.title,
    done: false,
    priority: normalizePriority(fields.priority),
    dueDate: normalizeDueDate(fields.dueDate),
    notes: (fields.notes ?? "").trim(),
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  if (typeof fields.title === "string") todo.title = fields.title;
  if (typeof fields.done === "boolean") {
    todo.done = fields.done;
    if (fields.done) todo.completedAt = new Date().toISOString();
  }
  if (typeof fields.priority === "string") todo.priority = normalizePriority(fields.priority);
  if (Object.hasOwn(fields, "dueDate")) todo.dueDate = normalizeDueDate(fields.dueDate);
  if (typeof fields.notes === "string") todo.notes = fields.notes.trim();
  return todo;
}

export function deleteTodo(id) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  return true;
}

export function clearCompleted() {
  let removed = 0;
  for (let i = todos.length - 1; i >= 0; i--) {
    if (todos[i].done) {
      todos.splice(i, 1);
      removed++;
    }
  }
  return removed;
}

export function summarizeTodos() {
  const summary = {
    total: todos.length,
    active: 0,
    completed: 0,
    overdue: 0,
    byPriority: { low: 0, normal: 0, high: 0 },
  };

  for (const todo of todos) {
    if (todo.done) summary.completed++;
    else summary.active++;
    if (isOverdue(todo)) summary.overdue++;
    summary.byPriority[normalizePriority(todo.priority)]++;
  }

  return summary;
}
