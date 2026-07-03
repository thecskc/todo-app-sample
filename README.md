# todo-app-sample

A small todo app used as a sandbox for testing changes and tooling.

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

| Method | Path              | Body                       | Description        |
| ------ | ----------------- | -------------------------- | ------------------ |
| GET    | `/api/health`     | —                          | Health check (`{ status, todos }`) |
| GET    | `/api/todos`      | —                          | List todos (`?status=`, `?sort=priority\|due`, `?q=`, `?page=`, `?limit=`) |
| GET    | `/api/todos/search` | —                        | Search todos by title (`?q=`) |
| GET    | `/api/todos/:id`  | —                          | Get a single todo  |
| POST   | `/api/todos`      | `{ "title", "priority?", "dueDate?", "tags?" }` | Create a todo |
| PATCH  | `/api/todos/:id`  | `{ "title?", "done?", "priority?", "dueDate?", "tags?" }` | Update a todo |
| DELETE | `/api/todos/:id`  | —                          | Delete a todo      |
| DELETE | `/api/todos/completed` | —                     | Delete all done todos (`{ removed }`) |

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
