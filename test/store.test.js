import { test } from "node:test";
import assert from "node:assert/strict";
import { listTodos, getTodo, createTodo, updateTodo, deleteTodo } from "../src/store.js";

test("createTodo adds a todo with defaults", () => {
  const before = listTodos().length;
  const todo = createTodo("write tests");
  assert.equal(todo.title, "write tests");
  assert.equal(todo.done, false);
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

test("deleteTodo removes a todo", () => {
  const todo = createTodo("delete me");
  assert.equal(deleteTodo(todo.id), true);
  assert.equal(deleteTodo(todo.id), false);
});
