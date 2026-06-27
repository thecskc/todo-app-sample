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
  await fetch(`${baseUrl}/api/todos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
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

test("GET /api/todos/stats returns counts", async () => {
  const stats = await (await fetch(`${baseUrl}/api/todos/stats`)).json();
  assert.equal(typeof stats.total, "number");
  assert.ok(stats.active >= 0);
  assert.ok(stats.completed >= 0);
  assert.ok(stats.completionRate >= 0);
});

test("GET /api/todos/search finds matching todos", async () => {
  await post("buy milk");
  const found = await (await fetch(`${baseUrl}/api/todos/search?q=milk`)).json();
  assert.ok(found.some((t) => t.title === "buy milk"));
});

test("GET /api/todos/sorted?order=desc returns todos", async () => {
  const sorted = await (await fetch(`${baseUrl}/api/todos/sorted?order=desc`)).json();
  assert.ok(Array.isArray(sorted));
  assert.ok(sorted.length >= 1);
});

test("GET /api/todos/recent returns recent todos", async () => {
  const recent = await (await fetch(`${baseUrl}/api/todos/recent?days=7`)).json();
  assert.ok(Array.isArray(recent));
});
