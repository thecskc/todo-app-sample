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

async function post(title) {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, priority: "normal" }),
  });
  return res.json();
}

test("GET /api/todos?status filters by completion", async () => {
  await post("active one");
  const created = await post("done one");
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

test("POST /api/todos accepts planning metadata", async () => {
  const res = await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "plan launch",
      priority: "high",
      dueDate: "2026-07-15",
      notes: "Coordinate release notes",
    }),
  });

  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.priority, "high");
  assert.equal(body.dueDate, "2026-07-15");
  assert.equal(body.notes, "Coordinate release notes");
});

test("GET /api/todos supports priority and search filters", async () => {
  await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "ops handoff", priority: "high" }),
  });
  await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "weekly cleanup", priority: "low" }),
  });

  const res = await fetch(`${baseUrl}/api/todos?priority=high&q=handoff`);
  const body = await res.json();
  assert.ok(body.length >= 1);
  assert.ok(body.every((todo) => todo.priority === "high"));
  assert.ok(body.every((todo) => todo.title.includes("handoff")));
});

test("POST /api/todos/bulk updates selected todos", async () => {
  const first = await post("bulk api one");
  const second = await post("bulk api two");

  const res = await fetch(`${baseUrl}/api/todos/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids: [first.id, second.id], fields: { done: true, archived: true } }),
  });

  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.updated, 2);
});

test("GET /api/todos/stats returns dashboard data", async () => {
  const res = await fetch(`${baseUrl}/api/todos/stats`);
  const body = await res.json();

  assert.equal(res.status, 200);
  assert.ok(body.total >= 0);
  assert.ok(body.priority);
});
