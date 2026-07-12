// Demonstrates: an async handler passed to addEventListener returns a promise
// that the DOM/event target does NOT await, so a rejection becomes an
// unhandled promise rejection with no in-DOM signal to the user.
// The same pattern is used at public/app.js:92-95 for the Shortcuts button.

// Mimic addEventListener call semantics — call the handler, ignore return.
function fireEvent(handler) {
  const returnValue = handler();
  console.log("handler synchronous return:", returnValue);
  console.log("is promise:", returnValue && typeof returnValue.then === "function");
  // Note: no await — matches DOM behavior.
}

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION seen by process:", err.name, err.message);
});

const asyncHandler = async () => {
  // This is exactly what loadShortcuts would throw on the current build.
  const body = { shortcuts: [{ key: "N" }] };
  body.map((x) => x); // reproduces the same TypeError shape
};

fireEvent(asyncHandler);

// Give the microtask queue a beat so unhandledRejection fires.
await new Promise((r) => setTimeout(r, 50));
console.log("(no synchronous error observable at the call site)");
