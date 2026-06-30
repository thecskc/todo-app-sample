import { test } from "node:test";
import assert from "node:assert/strict";
import {
  listTodos,
  getTodo,
  createTodo,
  updateTodo,
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
  assert.equal(todo.dueDate, null);
  assert.equal(listTodos().length, before + 1);
});

test("createTodo accepts scheduling metadata", () => {
  const todo = createTodo({
    title: "schedule release",
    priority: "high",
    dueDate: "2026-07-10",
    notes: "Coordinate with support",
  });

  assert.equal(todo.priority, "high");
  assert.equal(todo.dueDate, "2026-07-10");
  assert.equal(todo.notes, "Coordinate with support");
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
  assert.ok(updated.completedAt);
});

test("updateTodo edits scheduling fields", () => {
  const todo = createTodo({ title: "reschedule me", priority: "low" });
  const updated = updateTodo(todo.id, {
    priority: "high",
    dueDate: "2026-08-01",
    notes: "Moved after planning",
  });

  assert.equal(updated.priority, "high");
  assert.equal(updated.dueDate, "2026-08-01");
  assert.equal(updated.notes, "Moved after planning");
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

test("summarizeTodos returns totals and priority counts", () => {
  createTodo({ title: "high summary", priority: "high" });
  createTodo({ title: "low summary", priority: "low" });
  const summary = summarizeTodos();

  assert.ok(summary.total >= 2);
  assert.ok(summary.byPriority.high >= 1);
  assert.ok(summary.byPriority.low >= 1);
});
