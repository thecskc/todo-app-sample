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

export function applyFields(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  Object.assign(todo, fields);
  return todo;
}

export function pageTodos(offset, limit) {
  return todos.slice(offset, offset + limit);
}
