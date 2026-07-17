const list = document.getElementById("list");
const form = document.getElementById("new-todo");
const titleInput = document.getElementById("title");
const clearCompletedBtn = document.getElementById("clear-completed");
const clearActiveBtn = document.getElementById("clear-active");
const markAllBtn = document.getElementById("mark-all");
const filters = document.getElementById("filters");
const stats = document.getElementById("stats");

let currentStatus = "all";

async function fetchTodos() {
  const res = await fetch(`/api/todos?status=${currentStatus}`);
  return res.json();
}

async function fetchStats() {
  const res = await fetch("/api/todos/stats");
  return res.json();
}

function renderStats(summary) {
  stats.innerHTML = `
    <span>${summary.total} total</span>
    <span>${summary.byStatus.active} active</span>
    <span>${summary.byStatus.completed} completed</span>
  `;
}

function render(todos) {
  list.innerHTML = "";
  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggle(todo));

    const span = document.createElement("span");
    span.textContent = todo.title;

    const del = document.createElement("button");
    del.textContent = "✕";
    del.addEventListener("click", () => remove(todo.id));

    li.append(checkbox, span, del);
    list.appendChild(li);
  }
  clearCompletedBtn.hidden = !todos.some((t) => t.done);
  clearActiveBtn.hidden = !todos.some((t) => !t.done);
  markAllBtn.hidden = !todos.some((t) => !t.done);
}

async function refresh() {
  const [todos, summary] = await Promise.all([fetchTodos(), fetchStats()]);
  render(todos);
  renderStats(summary);
}

async function toggle(todo) {
  await fetch(`/api/todos/${todo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: !todo.done }),
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

clearCompletedBtn.addEventListener("click", async () => {
  await fetch("/api/todos/completed", { method: "DELETE" });
  refresh();
});

clearActiveBtn.addEventListener("click", async () => {
  await fetch("/api/todos/active", { method: "DELETE" });
  refresh();
});

markAllBtn.addEventListener("click", async () => {
  await fetch("/api/todos/completed", { method: "PATCH" });
  refresh();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleInput.value.trim();
  if (!title) return;
  await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  titleInput.value = "";
  refresh();
});

refresh();
