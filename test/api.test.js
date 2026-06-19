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

test("GET /api/todos/page returns a bounded slice", async () => {
  await post("page one");
  await post("page two");
  const page = await (await fetch(`${baseUrl}/api/todos/page?limit=1&offset=0`)).json();
  assert.equal(page.length, 1);
});

test("POST /api/todos/complete-all marks todos complete", async () => {
  await post("finish me");
  await fetch(`${baseUrl}/api/todos/complete-all`, { method: "POST" });
  const completed = await (await fetch(`${baseUrl}/api/todos?status=completed`)).json();
  assert.ok(completed.some((t) => t.title === "finish me"));
});

test("GET /api/todos/:id/share renders a shareable page", async () => {
  await post("share me");
  const all = await (await fetch(`${baseUrl}/api/todos`)).json();
  const todo = all.find((t) => t.title === "share me");
  const res = await fetch(`${baseUrl}/api/todos/${todo.id}/share`);
  const html = await res.text();
  assert.match(html, /share me/);
});
