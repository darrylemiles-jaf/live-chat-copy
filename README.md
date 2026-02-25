# 🗣️ Live‑Chat

Full‑stack live‑chat application with a React/Vite/Material‑UI frontend and a Node.js/Express backend.  
Designed for customer‑support scenarios with agent queueing, real‑time updates, chat assignments and notifications.

---

## 🔍 Overview

- **Frontend** – React 19, Vite, Material‑UI (MUI).  
  Customisable theming, responsive interface with support/agent portals.
- **Backend** – Node.js + Express, MySQL (via `mysql2`), modular services/controllers, real‑time using Socket.IO.  
  Handles users, chats, messages, queueing, assignments, statistics and notifications.

The entire stack runs from one repository; you can start both client and server concurrently with the provided npm scripts.

---

## 🚀 Features

### 🎨 Frontend

- **Theming** – palettes and presets under `frontend/src/themes`; make branding changes easily.
- **Authentication** – login/logout, role‑based views (`client`, `support`, `admin`).
- **Agent portal pages**:
  - **Dashboard** – organisation & personal chat statistics (graphs, gauges).
  - **Chats** – threaded chat view with message history, attachments, and real‑time updates.
  - **Queue** – list of waiting client chats, priority/time‑based sorting, manual assignment dialog.
  - **Notifications** – in‑app panel with type filters, unread count, mark‑read actions.
  - **Profile** – view/update own details and status.
- **Client interface** – simple chat widget example (`frontend/fake-dashboard.html` and `loginFake.html`).
- **Real‑time** – uses `socketService` to listen for:
  - New messages
  - User status changes
  - Queue updates
  - Chat assignments and notifications
- **File attachments** – upload images/files via Cloudinary.
- **Responsive layout** – built with MUI components, custom cards, loaders, etc.
- **Utilities/hooks** – auth helpers, auto‑logout, config loader, local‑storage sync.
- **Linting & formatting** – ESLint (config in root), Prettier script, Vite for dev build.

### 🖥 Backend

- **REST API** with routes for:
  - `users` – CRUD, authentication, status updates.
  - `chats` – create, list, assign (auto/manual), end.
  - `messages` – send, retrieve, with optional Cloudinary file upload middleware.
  - `queue` – view waiting chats and available agents.
  - `chat‑stats` – organisation and per‑agent statistics.
  - `notifications` – CRUD, unread count, bulk/individual mark‑as‑read.
- **Socket.IO** integration (see `server/socket/socketHandler.js`):
  - Emits events for message delivery, assignment, queue change, user status.
  - Broadcasts to clients and agents for real‑time UX.
- **Database** – MySQL pool with auto‑create database logic.  
  Table definitions live in `server/tables/`; migrations support added fields.
- **Services** – encapsulate business logic (chats, messages, assignments, queue, stats, notifications).
- **Middleware** – auth (JWT), error handler, validation (express‑validator).
- **Cloudinary support** – file uploads are stored in Cloudinary via `multer-storage-cloudinary`.
- **Environment** – configuration via `.env` (DB credentials, JWT secret, Cloudinary keys, etc.).
- **User roles** – `client`, `support`, `admin`; support users have `status` (`available`, `busy`, `away`).
- **Queueing/Assignment**
  - Chats enter queue, auto‑assigned based on agent availability.
  - Manual assignment endpoint available.
  - Agents can fetch available queue items.
- **Notifications** – stored per‑user, types include `message`, `chat_assigned`, etc.
- **Chat statistics** – daily/weekly counts, response/resolution times, active/queued totals.

---

## 🧩 Project Structure (high‑level)

```
/frontend       – React application
  /src
    /api         – axios wrappers
    /components  – shared UI pieces
    /pages       – auth & portal views
    /sections    – larger UI sections (queue dialog, etc.)
    /services    – socket, etc.
    /themes
    /utils
/server         – Express API
  config/
  controllers/
  middlewares/
  routes/
  services/
  tables/
  socket/
  validators/
  constants/
  utils/
package.json    – root helper scripts
```

---

## 💡 Prerequisites

- **Node.js** ≥ 18 (includes npm)
- **MySQL** server (database will be created automatically if missing)
- Cloudinary account (optional — only for attachments)

---

## ⚙️ Quick Start

```bash
# install root helper (concurrently)
npm install

# run both server and client in development
npm run dev
```

Alternatively:

```bash
cd frontend
npm install
npm run start          # Vite dev server

cd ../server
npm install
npm run server         # nodemon backend
```

> The backend listens on port `5000` by default (`server.js`), the frontend defaults to `5173`.

### Environment variables (`server/.env`)

```env
NODE_ENV=development
PORT=5000
JWT_SECRET=your_secret
DB_HOST_LOCAL=localhost
DB_USER_LOCAL=root
DB_PASSWORD_LOCAL=password
DB_NAME_LOCAL=live_chat_dev
# (production variants omit *_LOCAL or are set differently)

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 🛠 Useful Scripts

### Frontend

| Command            | Description               |
| ------------------ | ------------------------- |
| `npm run start`    | start Vite dev server     |
| `npm run build`    | production build          |
| `npm run preview`  | preview production build  |
| `npm run lint`     | run ESLint                |
| `npm run lint:fix` | auto‑fix ESLint issues    |
| `npm run prettier` | format code with Prettier |

### Server

| Command          | Description             |
| ---------------- | ----------------------- |
| `npm run server` | start backend (nodemon) |

---

## 🎨 Theme & Colors (Frontend)

Theme configuration resides in `frontend/src/themes`:

- `palette.js` – base palettes (green, red, gold, orange, etc.)
- `theme/index.js` – presets for light/dark, custom overrides

Suggested brand colours:

- **Green (main):** `#008E86`
- **Yellow (warning):** `#FFB400`
- **Red (error):** `#B53654`
- **Orange (accent):** `#ED7464`

Customize by editing the palettes or adding new presets.

---

## 🤝 Contributing

Contributions are welcome. Please:

1. Open an issue or PR with a clear description.
2. Follow the existing code style.
3. Run linting and Prettier before committing.
4. Provide tests where applicable.

---

## 📄 License

MIT (or adjust to match the original template’s license).

---

Feel free to adjust this README further as the application evolves, but the above reflects the current capabilities and structure of the repo.
