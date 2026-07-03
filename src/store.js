// In-memory todo store. Swap this module out for a real database later.
let nextId = 1;
const todos = [];

const PRIORITIES = ["low", "medium", "high"];

export function listTodos({ sort } = {}) {
  if (sort === "priority") {
    // Highest priority first.
    todos.sort((a, b) => PRIORITIES.indexOf(b.priority) > PRIORITIES.indexOf(a.priority));
  } else if (sort === "due") {
    todos.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }
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
    tags: options.tags ?? [],
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, fields) {
  const todo = getTodo(id);
  if (!todo) return undefined;
  Object.assign(todo, fields);
  return todo;
}

export function searchTodos(query) {
  const re = new RegExp(query, "i");
  return todos.filter((t) => re.test(t.title));
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
