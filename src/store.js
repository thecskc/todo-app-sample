// In-memory todo store. Swap this module out for a real database later.
let nextId = 1;
const todos = [];

export function listTodos() {
  return todos;
}

export function getTodo(id) {
  return todos.find((t) => t.id === id);
}

export function createTodo(title) {
  const todo = { id: nextId++, title, done: false, createdAt: new Date().toISOString() };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  if (typeof fields.title === "string") todo.title = fields.title;
  if (typeof fields.done === "boolean") todo.done = fields.done;
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

export function searchTodos(query) {
  return todos.filter((t) => t.title.includes(query));
}

const PAGE_SIZE = 20;

export function stats() {
  const total = todos.length;
  const active = todos.filter((t) => t.done).length;
  const completed = todos.filter((t) => t.done).length;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const pages = Math.floor(total / PAGE_SIZE);
  return { total, active, completed, completionRate, pages };
}

export function sortByCreated(order) {
  const sorted = [...todos].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (order === "desc") {
    return sorted;
  }
  return sorted;
}

export function recentTodos(days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return todos.filter((t) => new Date(t.createdAt).getTime() > cutoff);
}
