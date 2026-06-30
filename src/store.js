// In-memory todo store. Swap this module out for a real database later.
let nextId = 1;
const todos = [];

const priorityRank = {
  high: 0,
  normal: 1,
  low: 2,
};

export function listTodos(filters = {}) {
  let results = todos;

  if (filters.status === "active") {
    results = results.filter((t) => !t.done);
  }
  if (filters.status === "completed") {
    results = results.filter((t) => t.done);
  }
  if (filters.status === "archived") {
    results = results.filter((t) => t.archived);
  }
  if (filters.priority) {
    results = results.filter((t) => t.priority === filters.priority);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    results = results.filter((t) => t.title.toLowerCase().includes(q));
  }
  if (filters.dueBefore) {
    results = results.filter((t) => t.dueDate && t.dueDate <= filters.dueBefore);
  }

  const sort = filters.sort ?? "created";
  if (sort === "priority") {
    results.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
  }
  if (sort === "due") {
    results.sort((a, b) => String(a.dueDate || "9999-99-99").localeCompare(String(b.dueDate || "9999-99-99")));
  }

  return results;
}

export function getTodo(id) {
  return todos.find((t) => t.id === id);
}

export function createTodo(title, fields = {}) {
  const todo = {
    id: nextId++,
    title,
    done: false,
    priority: fields.priority ?? "normal",
    dueDate: fields.dueDate ?? "",
    notes: fields.notes ?? "",
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  if (typeof fields.title === "string") todo.title = fields.title;
  if (typeof fields.done === "boolean") todo.done = fields.done;
  if (typeof fields.priority === "string") todo.priority = fields.priority;
  if (typeof fields.dueDate === "string") todo.dueDate = fields.dueDate;
  if (typeof fields.notes === "string") todo.notes = fields.notes;
  if (typeof fields.archived === "boolean") todo.archived = fields.archived;
  todo.updatedAt = new Date().toISOString();
  return todo;
}

export function bulkUpdateTodos(ids, fields) {
  let updated = 0;
  for (const id of ids) {
    const todo = updateTodo(Number(id), fields);
    if (todo) updated++;
  }
  return updated;
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
    archived: 0,
    overdue: 0,
    priority: { high: 0, normal: 0, low: 0 },
  };
  const today = new Date().toISOString().slice(0, 10);

  for (const todo of todos) {
    if (todo.done) summary.completed++;
    else summary.active++;
    if (todo.archived) summary.archived++;
    if (todo.dueDate && todo.dueDate < today && !todo.done) summary.overdue++;
    summary.priority[todo.priority] = (summary.priority[todo.priority] ?? 0) + 1;
  }

  return summary;
}
