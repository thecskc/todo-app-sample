// Replays the exact operations from public/app.js loadShortcuts() to prove
// the contract mismatch between server envelope { shortcuts: [...] } and the
// client's .map() invocation on the raw parsed body.
const res = await fetch("http://localhost:3131/api/shortcuts");
const shortcuts = await res.json(); // <-- named exactly as in app.js:21
console.log("typeof shortcuts:", typeof shortcuts);
console.log("Array.isArray:", Array.isArray(shortcuts));
console.log("body:", JSON.stringify(shortcuts));
try {
  const html = shortcuts
    .map((shortcut) => `<li><kbd>${shortcut.key}</kbd> ${shortcut.label}</li>`)
    .join("");
  console.log("SUCCESS html:", html);
} catch (err) {
  console.log("THROW name:", err.name);
  console.log("THROW message:", err.message);
}
