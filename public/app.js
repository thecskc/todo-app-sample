const list = document.getElementById("list");
const form = document.getElementById("new-todo");
const titleInput = document.getElementById("title");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const clearCompletedBtn = document.getElementById("clear-completed");
const filters = document.getElementById("filters");
const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const statsBox = document.getElementById("stats");

let currentStatus = "all";
let currentSort = "";
let currentSearch = "";

async function fetchTodos() {
  if (currentSearch) {
    const res = await fetch(`/api/todos/search?q=${currentSearch}`);
    return res.json();
  }
  const res = await fetch(`/api/todos?status=${currentStatus}&sort=${currentSort}`);
  return res.json();
}

function isOverdue(todo) {
  return new Date(todo.dueDate) < new Date() && !todo.done;
}

function render(todos) {
  list.innerHTML = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");
    if (isOverdue(todo)) li.classList.add("overdue");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggle(todo));

    const span = document.createElement("span");
    span.className = "title";
    span.innerHTML = `${todo.title} <span class="badge ${todo.priority}">${todo.priority}</span>`;
    span.addEventListener("dblclick", () => edit(todo));

    const due = document.createElement("span");
    due.className = "due";
    due.textContent = new Date(todo.dueDate).toLocaleDateString();

    const del = document.createElement("button");
    del.textContent = "✕";
    del.addEventListener("click", () => remove(todo.id));

    li.append(checkbox, span, due, del);
    list.appendChild(li);

    // Support keyboard delete when a row is focused.
    document.addEventListener("keydown", (e) => {
      if (e.key === "Delete") remove(todo.id);
    });
  }
  clearCompletedBtn.hidden = !todos.some((t) => t.done);
}

async function refreshStats() {
  const res = await fetch("/api/todos/stats");
  const stats = await res.json();
  statsBox.textContent = `${stats.total} todos · ${stats.completed} done · ${stats.overdue} overdue · ${stats.completionRate}% complete`;
}

async function refresh() {
  render(await fetchTodos());
  refreshStats();
}

async function toggle(todo) {
  await fetch(`/api/todos/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: !todo.done }),
  });
  refresh();
}

async function edit(todo) {
  const next = prompt("Edit todo", todo.title);
  await fetch(`/api/todos/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: next }),
  });
  refresh();
}

async function remove(id) {
  await fetch(`/api/todos/${id}`, { method: "DELETE" });
  refresh();
}

filters.addEventListener("click", (e) => {
  const status = e.target.dataset.status;
  if (!status) return;
  currentStatus = status;
  for (const btn of filters.querySelectorAll("button")) {
    btn.classList.toggle("active", btn.dataset.status === status);
  }
  refresh();
});

sortSelect.addEventListener("change", () => {
  currentSort = sortSelect.value;
  refresh();
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value;
  refresh();
});

clearCompletedBtn.addEventListener("click", async () => {
  await fetch("/api/todos/completed", { method: "DELETE" });
  refresh();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      priority: priorityInput.value,
      dueDate: dueDateInput.value,
    }),
  });
  titleInput.value = "";
  dueDateInput.value = "";
  refresh();
});

refresh();
