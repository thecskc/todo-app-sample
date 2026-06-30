# todo-app-sample

A small todo app used as a sandbox for testing changes and tooling.

The app now includes a lightweight planning dashboard for day-to-day task
triage. Todos can carry priority, due dates, and notes, and the UI supports
searching, filtering, bulk completion, archiving, and JSON export.

## Stack

- Node.js + [Express](https://expressjs.com/) REST API
- Vanilla HTML/CSS/JS frontend (no build step)
- In-memory store (`src/store.js`) — swap for a real database when needed

## Getting started

```bash
npm install
npm start        # http://localhost:3000
npm run dev      # auto-reload on file changes
npm test         # run unit tests
```

## API

| Method | Path                   | Body                                                   | Description        |
| ------ | ---------------------- | ------------------------------------------------------ | ------------------ |
| GET    | `/api/health`          | —                                                      | Health check (`{ status, todos, summary }`) |
| GET    | `/api/todos`           | —                                                      | List todos (optional `?status=all\|active\|completed\|archived`, `priority`, `q`, `sort`) |
| GET    | `/api/todos/stats`     | —                                                      | Dashboard counts by status and priority |
| GET    | `/api/todos/export`    | —                                                      | Export the current in-memory todo set |
| GET    | `/api/todos/:id`       | —                                                      | Get a single todo  |
| POST   | `/api/todos`           | `{ "title": "...", "priority?", "dueDate?", "notes?" }` | Create a todo      |
| POST   | `/api/todos/bulk`      | `{ "ids": [1, 2], "fields": { "done": true } }`       | Update several todos |
| PATCH  | `/api/todos/:id`       | `{ "title?", "done?", "priority?", "dueDate?", "notes?", "archived?" }` | Update a todo |
| DELETE | `/api/todos/:id`       | —                                                      | Delete a todo      |
| DELETE | `/api/todos/completed` | —                                                      | Delete all done todos (`{ removed }`) |
| DELETE | `/api/todos/archived`  | —                                                      | Delete all archived todos (`{ removed }`) |

## Layout

```
src/
  server.js   Express app and routes
  store.js    Todo persistence (in-memory)
public/
  index.html  UI
  app.js      Frontend logic
test/
  store.test.js
```
