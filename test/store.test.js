import { test } from "node:test";
import assert from "node:assert/strict";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
  bulkUpdateTodos,
  deleteTodo,
  clearCompleted,
  summarizeTodos,
} from "../src/store.js";

test("createTodo adds a todo with defaults", () => {
  const before = listTodos().length;
  const todo = createTodo("write tests");
  assert.equal(todo.title, "write tests");
  assert.equal(todo.done, false);
  assert.equal(todo.priority, "normal");
  assert.equal(listTodos().length, before + 1);
});

test("getTodo returns a todo by id, or undefined", () => {
  const todo = createTodo("find me");
  assert.equal(getTodo(todo.id).title, "find me");
  assert.equal(getTodo(-1), undefined);
});

test("updateTodo toggles done", () => {
  const todo = createTodo("toggle me");
  const updated = updateTodo(todo.id, { done: true });
  assert.equal(updated.done, true);
});

test("updateTodo stores planning metadata", () => {
  const todo = createTodo("plan me");
  const updated = updateTodo(todo.id, {
    priority: "high",
    dueDate: "2026-07-10",
    notes: "ship the dashboard",
  });

  assert.equal(updated.priority, "high");
  assert.equal(updated.dueDate, "2026-07-10");
  assert.equal(updated.notes, "ship the dashboard");
});

test("listTodos filters by search and priority", () => {
  createTodo("high launch item", { priority: "high" });
  createTodo("low cleanup item", { priority: "low" });

  const highLaunch = listTodos({ q: "launch", priority: "high" });
  assert.ok(highLaunch.every((t) => t.title.includes("launch")));
  assert.ok(highLaunch.every((t) => t.priority === "high"));
});

test("bulkUpdateTodos applies fields to matching ids", () => {
  const a = createTodo("bulk one");
  const b = createTodo("bulk two");

  const updated = bulkUpdateTodos([a.id, b.id], { done: true, archived: true });
  assert.equal(updated, 2);
  assert.equal(getTodo(a.id).done, true);
  assert.equal(getTodo(b.id).archived, true);
});

test("summarizeTodos returns dashboard counts", () => {
  const todo = createTodo("summarize me", { priority: "high" });
  updateTodo(todo.id, { done: false });

  const summary = summarizeTodos();
  assert.ok(summary.total >= 1);
  assert.ok(summary.active >= 1);
  assert.ok(summary.priority.high >= 1);
});

test("deleteTodo removes a todo", () => {
  const todo = createTodo("delete me");
  assert.equal(deleteTodo(todo.id), true);
  assert.equal(deleteTodo(todo.id), false);
});

test("clearCompleted removes only done todos and returns the count", () => {
  const a = createTodo("keep me");
  const b = createTodo("clear me");
  updateTodo(b.id, { done: true });
  const removed = clearCompleted();
  assert.ok(removed >= 1);
  assert.equal(getTodo(b.id), undefined);
  assert.ok(getTodo(a.id));
});
