import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/server.js";

let baseUrl;
let server;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => server.close());

async function post(title, fields = {}) {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, ...fields }),
  });
  assert.equal(res.status, 201);
  return res.json();
}

test("GET /api/todos?status filters by completion", async () => {
  await post("active one");
  await post("done one");
  // Mark the most recently created todo as done.
  const all = await (await fetch(`${baseUrl}/api/todos`)).json();
  const doneTodo = all.find((t) => t.title === "done one");
  await fetch(`${baseUrl}/api/todos/${doneTodo.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done: true }),
  });

  const active = await (await fetch(`${baseUrl}/api/todos?status=active`)).json();
  const completed = await (await fetch(`${baseUrl}/api/todos?status=completed`)).json();

  assert.ok(active.every((t) => !t.done));
  assert.ok(completed.every((t) => t.done));
  assert.ok(completed.some((t) => t.title === "done one"));
});

test("GET /api/todos rejects an invalid status", async () => {
  const res = await fetch(`${baseUrl}/api/todos?status=bogus`);
  assert.equal(res.status, 400);
});

test("POST /api/todos accepts scheduling metadata", async () => {
  const todo = await post("scheduled api todo", {
    priority: "high",
    dueDate: "2026-07-15",
    notes: "Add migration checklist",
  });

  assert.equal(todo.priority, "high");
  assert.equal(todo.dueDate, "2026-07-15");
  assert.equal(todo.notes, "Add migration checklist");
  assert.equal(todo.done, false);
});

test("GET /api/todos filters by priority and search text", async () => {
  await post("searchable launch item", {
    priority: "high",
    dueDate: "2026-07-01",
    notes: "Beta rollout",
  });
  await post("low priority housekeeping", { priority: "low", notes: "Archive old notes" });

  const high = await (await fetch(`${baseUrl}/api/todos?priority=high&q=launch&sort=due`)).json();

  assert.ok(high.length >= 1);
  assert.ok(high.every((todo) => todo.priority === "high"));
  assert.ok(high.some((todo) => todo.title === "searchable launch item"));
});

test("POST /api/todos rejects an invalid due date", async () => {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "bad date", dueDate: "tomorrow-ish" }),
  });

  assert.equal(res.status, 400);
});
