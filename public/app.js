const list = document.getElementById("list");
const form = document.getElementById("new-todo");
const titleInput = document.getElementById("title");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("due-date");
const notesInput = document.getElementById("notes");
const searchInput = document.getElementById("search");
const priorityFilter = document.getElementById("priority-filter");
const sortInput = document.getElementById("sort");
const stats = document.getElementById("stats");
const clearCompletedBtn = document.getElementById("clear-completed");
const completeSelectedBtn = document.getElementById("complete-selected");
const archiveSelectedBtn = document.getElementById("archive-selected");
const exportBtn = document.getElementById("export-todos");
const selectedCount = document.getElementById("selected-count");
const filters = document.getElementById("filters");

let currentStatus = "all";
const selectedIds = new Set();

async function fetchTodos() {
  const params = new URLSearchParams({
    status: currentStatus,
    sort: sortInput.value,
  });
  if (searchInput.value) params.set("q", searchInput.value);
  if (priorityFilter.value) params.set("priority", priorityFilter.value);

  const res = await fetch(`/api/todos?${params}`);
  return res.json();
}

async function fetchStats() {
  const res = await fetch("/api/todos/stats");
  return res.json();
}

function renderStats(summary) {
  stats.innerHTML = `
    <div class="stat"><strong>${summary.total}</strong><span>Total</span></div>
    <div class="stat"><strong>${summary.active}</strong><span>Active</span></div>
    <div class="stat"><strong>${summary.completed}</strong><span>Completed</span></div>
    <div class="stat"><strong>${summary.priority.high}</strong><span>High priority</span></div>
    <div class="stat"><strong>${summary.overdue}</strong><span>Overdue</span></div>
  `;
  clearCompletedBtn.hidden = summary.completed === 0;
}

function renderSelectedCount() {
  selectedCount.textContent = `${selectedIds.size} selected`;
  completeSelectedBtn.disabled = selectedIds.size === 0;
  archiveSelectedBtn.disabled = selectedIds.size === 0;
}

function render(todos, summary) {
  list.innerHTML = "";
  if (!todos.length) {
    list.innerHTML = '<li class="empty">No todos match the current view.</li>';
  }
  for (const todo of todos) {
    const li = document.createElement("li");
    if (todo.done) li.classList.add("done");
    if (todo.archived) li.classList.add("archived");
    li.dataset.id = todo.id;
    li.innerHTML = `
      <div class="todo-row">
        <input type="checkbox" data-selected ${selectedIds.has(todo.id) ? "checked" : ""} aria-label="Select ${todo.title}">
        <input type="checkbox" data-toggle ${todo.done ? "checked" : ""} aria-label="Complete ${todo.title}">
        <div>
          <div class="todo-title">${todo.title}</div>
          <div class="todo-meta">${todo.priority} priority${todo.dueDate ? ` · due ${todo.dueDate}` : ""}${todo.archived ? " · archived" : ""}</div>
          ${todo.notes ? `<div class="todo-notes">${todo.notes}</div>` : ""}
        </div>
        <button class="danger" type="button" data-delete>Delete</button>
      </div>
      <div class="todo-edit">
        <label>
          Title
          <input data-edit-title value="${todo.title}">
        </label>
        <label>
          Priority
          <select data-edit-priority>
            <option value="high" ${todo.priority === "high" ? "selected" : ""}>High</option>
            <option value="normal" ${todo.priority === "normal" ? "selected" : ""}>Normal</option>
            <option value="low" ${todo.priority === "low" ? "selected" : ""}>Low</option>
          </select>
        </label>
        <label>
          Due date
          <input type="date" data-edit-due value="${todo.dueDate || ""}">
        </label>
        <button type="button" data-save>Save</button>
      </div>
    `;
    list.appendChild(li);
  }
  renderStats(summary);
  renderSelectedCount();
}

async function refresh() {
  const [todos, summary] = await Promise.all([fetchTodos(), fetchStats()]);
  render(todos, summary);
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

async function save(li) {
  await fetch(`/api/todos/${li.dataset.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: li.querySelector("[data-edit-title]").value,
      priority: li.querySelector("[data-edit-priority]").value,
      dueDate: li.querySelector("[data-edit-due]").value,
    }),
  });
  refresh();
}

async function bulk(fields) {
  await fetch("/api/todos/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: Array.from(selectedIds), fields }),
  });
  selectedIds.clear();
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

list.addEventListener("change", (e) => {
  const li = e.target.closest("li");
  if (!li || !li.dataset.id) return;
  const id = Number(li.dataset.id);
  if (e.target.matches("[data-selected]")) {
    if (e.target.checked) selectedIds.add(id);
    else selectedIds.delete(id);
    renderSelectedCount();
  }
  if (e.target.matches("[data-toggle]")) {
    toggle({ id, done: !e.target.checked });
  }
});

list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li || !li.dataset.id) return;
  if (e.target.matches("[data-delete]")) remove(Number(li.dataset.id));
  if (e.target.matches("[data-save]")) save(li);
});

searchInput.addEventListener("input", refresh);
priorityFilter.addEventListener("change", refresh);
sortInput.addEventListener("change", refresh);

clearCompletedBtn.addEventListener("click", async () => {
  await fetch("/api/todos/completed", { method: "DELETE" });
  refresh();
});

completeSelectedBtn.addEventListener("click", () => bulk({ done: true }));
archiveSelectedBtn.addEventListener("click", () => bulk({ archived: true }));

exportBtn.addEventListener("click", async () => {
  const payload = await (await fetch("/api/todos/export")).json();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "todos.json";
  link.click();
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
  refresh();
});

refresh();
