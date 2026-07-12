// Reproduce the exact client parse path from public/app.js:19-25 against the live server.
const res = await fetch("http://localhost:3131/api/shortcuts");
const shortcuts = await res.json();
console.log("typeof shortcuts:", typeof shortcuts, "Array.isArray:", Array.isArray(shortcuts));
console.log("payload:", JSON.stringify(shortcuts));
try {
  const html = shortcuts
    .map((shortcut) => `<li><kbd>${shortcut.key}</kbd> ${shortcut.label}</li>`)
    .join("");
  console.log("SUCCESS html:", html);
} catch (err) {
  console.log("THREW:", err.constructor.name, "-", err.message);
}
