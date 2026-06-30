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
| GET    | `/api/todos`      | —                          | List todos with optional filters |
| GET    | `/api/todos/summary` | —                       | Summary totals by status and priority |
| GET    | `/api/todos/:id`  | —                          | Get a single todo  |
| POST   | `/api/todos`      | `{ "title": "...", "priority?", "dueDate?", "notes?" }` | Create a todo |
| PATCH  | `/api/todos/:id`  | `{ "title?", "done?", "priority?", "dueDate?", "notes?" }` | Update a todo |
| DELETE | `/api/todos/:id`  | —                          | Delete a todo      |
| DELETE | `/api/todos/completed` | —                     | Delete all done todos (`{ removed }`) |

### Todo fields

- `priority`: `low`, `normal`, or `high` (`normal` by default)
- `dueDate`: optional date string in `YYYY-MM-DD` form
- `notes`: optional detail text displayed under the todo title
- `completedAt`: timestamp set when a todo is marked done

### List filters

`GET /api/todos` accepts the following query parameters:

- `status`: `all`, `active`, `completed`, or `overdue`
- `priority`: `all`, `low`, `normal`, or `high`
- `sort`: `created`, `due`, or `priority`
- `q`: text search over titles and notes

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
