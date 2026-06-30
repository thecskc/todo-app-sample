const list = document.getElementById("list");
const form = document.getElementById("new-todo");
const titleInput = document.getElementById("title");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const notesInput = document.getElementById("notes");
const clearCompletedBtn = document.getElementById("clear-completed");
const filters = document.getElementById("filters");
const summary = document.getElementById("summary");
const searchInput = document.getElementById("search");
const priorityFilter = document.getElementById("priority-filter");
const sortSelect = document.getElementById("sort");

let currentStatus = "all";
let currentPriority = "all";
let currentSort = "created";
let currentSearch = "";

async function fetchTodos() {
  const params = new URLSearchParams({
    status: currentStatus,
    priority: currentPriority,
    sort: currentSort,
    q: currentSearch,
  });
  const res = await fetch(`/api/todos?${params}`);
  return res.json();
}

async function fetchSummary() {
  const res = await fetch("/api/todos/summary");
  return res.json();
}

function renderSummary(stats) {
  summary.innerHTML = `
    <span><strong>${stats.total ?? 0}</strong>Total</span>
    <span><strong>${stats.active ?? 0}</strong>Active</span>
    <span><strong>${stats.completed ?? 0}</strong>Done</span>
    <span><strong>${stats.overdue ?? 0}</strong>Overdue</span>
  `;
}

function formatDueDate(todo) {
  if (!todo.dueDate) return "No due date";
  const due = new Date(`${todo.dueDate}T00:00:00`);
  return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

function isOverdue(todo) {
  if (!todo.dueDate || todo.done) return false;
  return new Date(todo.dueDate) < new Date();
}

function render(todos) {
  list.innerHTML = "";
  if (todos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No todos match the current filters.";
    list.appendChild(empty);
    clearCompletedBtn.hidden = true;
    return;
  }

  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");
    if (isOverdue(todo)) li.classList.add("overdue");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggle(todo));

    const body = document.createElement("div");
    body.className = "todo-body";

    const head = document.createElement("div");
    head.className = "todo-head";

    const title = document.createElement("span");
    title.className = "todo-title";
    title.textContent = todo.title;

    const badge = document.createElement("span");
    badge.className = `badge ${todo.priority ?? "normal"}`;
    badge.textContent = todo.priority ?? "normal";

    head.append(title, badge);

    const meta = document.createElement("div");
    meta.className = "todo-meta";
    const due = document.createElement("span");
    due.textContent = formatDueDate(todo);
    if (isOverdue(todo)) due.classList.add("overdue");
    meta.append(due);

    const created = document.createElement("span");
    created.textContent = `Created ${new Date(todo.createdAt).toLocaleDateString()}`;
    meta.append(created);

    body.append(head, meta);

    if (todo.notes) {
      const notes = document.createElement("p");
      notes.className = "todo-notes";
      notes.innerHTML = todo.notes;
      body.appendChild(notes);
    }

    const del = document.createElement("button");
    del.textContent = "✕";
    del.addEventListener("click", () => remove(todo.id));

    li.append(checkbox, body, del);
    list.appendChild(li);
  }
  clearCompletedBtn.hidden = !todos.some((t) => t.done);
}

async function refresh() {
  const [todos, stats] = await Promise.all([fetchTodos(), fetchSummary()]);
  render(todos);
  renderSummary(stats);
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

priorityFilter.addEventListener("change", () => {
  currentPriority = priorityFilter.value;
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
      notes: notesInput.value,
    }),
  });
  titleInput.value = "";
  dueDateInput.value = "";
  notesInput.value = "";
  priorityInput.value = "normal";
  refresh();
});

refresh();
