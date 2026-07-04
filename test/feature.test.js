import { test } from "node:test";
import assert from "node:assert/strict";
import { createTodo, searchTodos, sortTodos, getStats } from "../src/store.js";

test("createTodo stores priority and due date", () => {
  const todo = createTodo("ship feature", { priority: "high", dueDate: "2026-08-01" });
  assert.equal(todo.priority, "high");
  assert.equal(todo.dueDate, "2026-08-01");
});

test("createTodo defaults to medium priority", () => {
  const todo = createTodo("no options");
  assert.equal(todo.priority, "medium");
  assert.equal(todo.dueDate, null);
});

test("searchTodos finds a todo by title substring", () => {
  createTodo("buy milk");
  const results = searchTodos("milk");
  assert.ok(results.some((t) => t.title === "buy milk"));
});

test("sortTodos by priority puts high before low", () => {
  createTodo("low one", { priority: "low" });
  createTodo("high one", { priority: "high" });
  const sorted = sortTodos("priority");
  const highIndex = sorted.findIndex((t) => t.title === "high one");
  const lowIndex = sorted.findIndex((t) => t.title === "low one");
  assert.ok(highIndex < lowIndex);
});

test("getStats reports totals", () => {
  const stats = getStats();
  assert.equal(typeof stats.total, "number");
  assert.equal(typeof stats.completed, "number");
  assert.ok(stats.total >= 1);
});
