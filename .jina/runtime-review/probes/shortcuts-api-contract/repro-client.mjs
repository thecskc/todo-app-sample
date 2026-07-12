// Replays exactly what public/app.js:19-25 does against the live server.
const res = await fetch("http://127.0.0.1:3123/api/shortcuts");
const shortcuts = await res.json();
console.log("typeof shortcuts:", typeof shortcuts, "isArray:", Array.isArray(shortcuts));
console.log("shortcuts value:", JSON.stringify(shortcuts));
try {
  const html = shortcuts
    .map((s) => `<li><kbd>${s.key}</kbd> ${s.label}</li>`)
    .join("");
  console.log("map succeeded, html length:", html.length);
} catch (err) {
  console.log("map threw:", err.constructor.name, "-", err.message);
}
