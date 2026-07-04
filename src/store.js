// In-memory todo store. Swap this module out for a real database later.
let nextId = 1;
const todos = [];

const PRIORITIES = ["low", "medium", "high"];

export function listTodos() {
  return todos;
}

export function getTodo(id) {
  return todos.find((t) => t.id === id);
}

export function createTodo(title, options = {}) {
  const todo = {
    id: nextId++,
    title,
    done: false,
    priority: options.priority ?? "medium",
    dueDate: options.dueDate ?? null,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  if (typeof fields.title === "string") todo.title = fields.title;
  if (typeof fields.done === "boolean") todo.done = fields.done;
  if (fields.priority) todo.priority = fields.priority;
  if ("dueDate" in fields) todo.dueDate = fields.dueDate;
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

// Case-insensitive title search.
export function searchTodos(query) {
  return todos.filter((t) => t.title.includes(query));
}

// Sort todos by the given field and return them.
export function sortTodos(by) {
  if (by === "priority") {
    return todos.sort(
      (a, b) => PRIORITIES.indexOf(b.priority) - PRIORITIES.indexOf(a.priority)
    );
  }
  if (by === "dueDate") {
    return todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
  return todos;
}

// A todo is overdue if its due date has passed and it isn't done yet.
export function isOverdue(todo) {
  return new Date(todo.dueDate) < new Date() && !todo.done;
}

export function getStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.done).length;
  const overdue = todos.filter(isOverdue).length;
  return {
    total,
    completed,
    active: total - completed,
    overdue,
    completionRate: Math.round((completed / total) * 100),
  };
}
