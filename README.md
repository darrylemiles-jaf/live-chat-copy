# Live-Chat — Comprehensive Project Documentation

> **Version:** 1.0.0 · **Stack:** React 19 · Node.js / Express · MySQL · Socket.IO · Vite

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Installation & Setup Guide](#3-installation--setup-guide)
4. [Configuration Guide](#4-configuration-guide)
5. [Widget Documentation](#5-widget-documentation)
6. [API Documentation](#6-api-documentation)
7. [Development Guide](#7-development-guide)
8. [Testing](#8-testing)
9. [Deployment](#9-deployment)

---

## 1. Project Overview

### What the Project Does

Live-Chat is a full-stack, real-time customer support chat platform. It allows businesses to embed a floating chat widget on any website. Clients connect through that widget; support agents manage and respond to conversations through a purpose-built agent dashboard. The platform handles everything from the moment a customer types their first message to a post-chat satisfaction rating.

### Key Features

| Area | Features |
|------|----------|
| **Real-time** | Bi-directional messaging via Socket.IO, live typing indicators, read receipts, instant notifications |
| **Queuing & Assignment** | Auto-assign to the least-busy available agent on first message; manual assignment from the Queue dashboard |
| **Roles** | Three roles — `client`, `support`, `admin` — with separate views and permission boundaries |
| **Agent Dashboard** | Chat history, live conversations, queue management, per-agent and organisational statistics, notification centre, profile management |
| **Embeddable Widget** | Self-contained JS + CSS bundle hosted separately; integrates into any HTML page with two `<script>` / `<link>` tags |
| **File Attachments** | Upload images, video, audio, documents and archives via Cloudinary |
| **Ratings** | Post-chat star rating (1–5) with an optional comment; agent leaderboard driven by average rating |
| **Notifications** | Persistent, per-user notification records; unread count badge; bulk or individual mark-as-read |
| **Theming** | MUI-based design system with swappable colour palettes, dark/light mode, responsive layout |

### Target Users

- **Businesses / Product teams** — embed the widget on their website to offer live support.
- **Support agents** — use the agent dashboard portal to respond to clients in real time.
- **Admins** — oversee all conversations, view aggregate statistics, and manage the agent pool.

### Problem It Solves

Customer support is often disjointed: businesses use third-party chat tools that cannot be customised, expose data to external vendors, and have recurring subscription costs. Live-Chat is an open, self-hosted alternative that gives full control over the UI/UX, data, and integration logic.

---

## 2. Architecture Overview

### High-Level System Design

```
┌────────────────────────────────────────────────────────┐
│                        Clients                         │
│           (any website that embeds the widget)         │
│  ┌──────────────────────────────────────────────────┐  │
│  │          live-chat-widget.js  (IIFE bundle)      │  │
│  │          live-chat-widget.css                    │  │
│  └────────────────┬─────────────────────────────────┘  │
└───────────────────│────────────────────────────────────┘
                    │  HTTP REST + WebSocket
┌───────────────────▼────────────────────────────────────┐
│                  Node.js / Express API                  │
│              (server/server.js  ·  port 5000)           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  Routes  │ │Controllers│ │ Services │ │ Socket.IO│  │
│  └────┬─────┘ └────┬──────┘ └────┬─────┘ └────┬─────┘  │
│       └────────────┴─────────────┘             │        │
│                          │                     │        │
│                  ┌───────▼───────┐             │        │
│                  │     MySQL     │             │        │
│                  │  (mysql2 pool)│             │        │
│                  └───────────────┘             │        │
│                                                │        │
│   ┌────────────────────────────────────────────┘        │
│   │   WebSocket events (new_message, queue_update …)    │
└───│─────────────────────────────────────────────────────┘
    │
┌───▼───────────────────────────────────────────────────┐
│             Agent Dashboard (React SPA)                │
│             (frontend/   ·  port 5173 in dev)          │
└───────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend SPA | React 19, Vite 7, React Router 7 | Agent dashboard |
| UI Components | MUI v7, Ant Design Icons, Framer Motion | Design system |
| Rich Text | Tiptap | Message editor |
| HTTP Client | Axios, SWR | Data fetching |
| Real-time Client | socket.io-client v4 | Receive events |
| Widget Build | Vite IIFE build (`vite.config.widget.mjs`) | Single-file embeddable bundle |
| Backend | Node.js, Express 5 | REST API server |
| Real-time Server | Socket.IO v4 | Bi-directional events |
| Database | MySQL 8 via mysql2 (promise pool) | Persistent storage |
| Auth | JSON Web Token (jsonwebtoken) + bcryptjs | Stateless authentication |
| Validation | express-validator | Request validation |
| File Storage | Cloudinary + multer-storage-cloudinary | Attachment hosting |
| Dev tooling | nodemon, concurrently, ESLint, Prettier | Developer experience |

### Folder Structure Breakdown

```
live-chat/
├── package.json          ← root scripts (dev, start, server, client)
├── README.md
├── DOCUMENTATION.md      ← this file
│
├── frontend/             ← React SPA + widget source
│   ├── index.html
│   ├── vite.config.mjs           ← dashboard build config
│   ├── vite.config.widget.mjs    ← widget IIFE build config
│   ├── fake-dashboard.html       ← client-side widget demo page
│   ├── loginFake.html            ← agent login demo page
│   ├── dist-widget/              ← compiled widget artefacts
│   │   ├── live-chat-widget.js
│   │   └── live-chat-widget.css
│   └── src/
│       ├── App.jsx               ← root component, router setup
│       ├── config.js             ← central API/socket URL config
│       ├── index.jsx             ← SPA entry point
│       ├── widget.jsx            ← widget entry point
│       ├── api/                  ← axios wrapper modules per resource
│       ├── assets/               ← global CSS, images
│       ├── components/           ← reusable UI components
│       │   └── ChatWidget/       ← the embeddable widget component
│       ├── constants/            ← shared front-end constants
│       ├── contexts/             ← React context providers
│       ├── hooks/                ← custom React hooks
│       ├── layout/               ← top-bar, sidebar, root layout
│       ├── menu-items/           ← sidebar navigation config
│       ├── pages/                ← route-level page components
│       ├── routes/               ← React Router route definitions
│       ├── sections/             ← composite page sections
│       ├── services/             ← socketService, etc.
│       ├── themes/               ← MUI theme palettes and presets
│       └── utils/                ← helpers (auth, date, storage)
│
└── server/               ← Express API
    ├── server.js                 ← entry point
    ├── package.json
    ├── config/
    │   ├── db.js                 ← MySQL pool + auto-create DB
    │   └── cloudinary.js         ← multer-cloudinary config
    ├── constants/
    │   └── constants.js          ← project name, colour helpers
    ├── controllers/              ← HTTP request handlers
    ├── middlewares/
    │   ├── authMiddleware.js     ← JWT protect + authorize
    │   ├── errorMiddleware.js    ← 404 + global error handler
    │   └── validations/          ← express-validator rule sets
    ├── migrations/               ← schema migration helpers
    ├── routes/                   ← Express routers
    ├── services/                 ← business logic layer
    ├── socket/
    │   └── socketHandler.js      ← Socket.IO initialisation + emitters
    ├── tables/                   ← CREATE TABLE SQL definitions
    ├── utils/                    ← jwtUtils, expressValidator, validatePayload
    └── validators/               ← field-level validator rules
```

### Data Flow Explanation

**Sending a message (client → agent)**

1. Widget calls `POST /api/v1/messages` with `{ sender_id, message, concern? }`.
2. `messagesControllers` delegates to `messagesServices.createMessage()`.
3. Service inserts the row, then — if no `chat_id` exists — creates a new chat row (`status='queued'`), runs auto-assign logic, and broadcasts `emitChatAssigned` + `emitQueueUpdate` via Socket.IO.
4. The agent dashboard (subscribed to `user_<agentId>` and `chat_<chatId>` rooms) receives `chat_assigned` and `new_message` events and updates the UI instantly.
5. The API response carries `chat_id`, `is_queued`, and `queue_position` so the widget can update its state without a follow-up request.

**Receiving a message (agent → client)**

1. Agent posts a message from the dashboard via `POST /api/v1/messages`.
2. Service inserts the row and calls `emitNewMessage(chatId, message, agentId)`.
3. Socket.IO broadcasts to `chat_<chatId>` (widget room) and `user_<agentId>` (agent's personal room).
4. Widget's `new_message` listener appends the message and auto-marks it as read by emitting `mark_messages_read`.

---

## 3. Installation & Setup Guide

### Prerequisites

| Requirement | Minimum Version | Notes |
|-------------|----------------|-------|
| Node.js | 18.x LTS | Includes npm |
| MySQL | 8.0 | Database is created automatically on first run |
| npm | 9+ | Bundled with Node.js 18 |
| Cloudinary account | — | Optional; only required for file attachments |

### Environment Variables

Create a file named `.env` inside the `server/` directory:

```env
# ─── Runtime ───────────────────────────────────────────
NODE_ENV=development            # development | production
PORT=5000
API_VERSION=v1

# ─── JWT ───────────────────────────────────────────────
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d               # token lifetime

# ─── Database (development) ────────────────────────────
DB_HOST_LOCAL=localhost
DB_USER_LOCAL=root
DB_PASSWORD_LOCAL=your_db_password
DB_NAME_LOCAL=live_chat_dev

# ─── Database (production) ─────────────────────────────
DB_HOST=your_prod_host
DB_USER=your_prod_user
DB_PASSWORD=your_prod_password
DB_NAME=live_chat_prod

# ─── Cloudinary (attachments) ──────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> The `config/db.js` file automatically selects the `_LOCAL` variables when `NODE_ENV=development` and the non-suffixed variables in production.

### Dependency Installation

```bash
# 1. Install root-level tooling (concurrently)
npm install

# 2. Install frontend dependencies
cd frontend
npm install

# 3. Install backend dependencies
cd ../server
npm install
```

### Development Server Setup

**Run everything in one command from the project root:**

```bash
npm run dev
```

This runs `concurrently` to start:
- **Backend** — `nodemon server/server.js` on `http://localhost:5000`
- **Frontend** — Vite dev server on `http://localhost:5173`

**Or run each service individually:**

```bash
# Terminal 1 — backend
cd server
npm run server

# Terminal 2 — frontend
cd frontend
npm run start
```

### Build Process

**Dashboard SPA:**

```bash
cd frontend
npm run build
# Output → frontend/dist/
```

**Embeddable Widget:**

```bash
cd frontend
npm run build:widget
# Output → frontend/dist-widget/
#   live-chat-widget.js   (IIFE bundle, console logs stripped)
#   live-chat-widget.css
```

### Production Deployment Steps

1. **Build the frontend** (`npm run build`) and serve `dist/` from a static CDN or web server (nginx, Vercel, Netlify, etc.).
2. **Build the widget** (`npm run build:widget`) and host `dist-widget/live-chat-widget.js` and `dist-widget/live-chat-widget.css` on a public CDN.
3. Set `NODE_ENV=production` and all production `DB_*` / `CLOUDINARY_*` / `JWT_SECRET` environment variables on the server host.
4. Start the API: `node server/server.js` (or use a process manager — see [Deployment](#9-deployment)).
5. Point the widget's `window.LiveChatConfig.apiUrl` and `socketUrl` at the production API hostname.

---

## 4. Configuration Guide

### Frontend API Base URL

`frontend/src/config.js` is the single source of truth for base URLs in the React dashboard:

```js
// frontend/src/config.js
export const API_BASE_URL = 'http://localhost:5000/api/v1';
export const SOCKET_URL   = 'http://localhost:5000';
```

Update these values for staging/production deployments.

### Widget Runtime Configuration

Before including the widget scripts, set a global `window.LiveChatConfig` object:

```html
<script>
  window.LiveChatConfig = {
    apiUrl:    'https://api.example.com/api/v1',
    socketUrl: 'https://api.example.com'
  };
</script>
```

If `window.LiveChatConfig` is absent the widget falls back to hard-coded development URLs defined in `widget.jsx`.

### API Version

The API version prefix is controlled exclusively by `API_VERSION` in `server/.env`:

```env
API_VERSION=v1
```

All routes mount under `/api/v1/`. Changing this variable changes every route automatically.

### Database Configuration

`server/config/db.js` reads credentials from `.env` and:
1. Creates a temporary connection **without** selecting a database.
2. Runs `CREATE DATABASE IF NOT EXISTS` to ensure the schema exists.
3. Establishes a **connection pool** (`connectionLimit: 10`) for all subsequent queries.

Table schemas are applied from `server/tables/tables.js` on every API startup via `createTables()` using `CREATE TABLE IF NOT EXISTS`, making the schema self-healing.

### Authentication Setup

Authentication uses **JWT Bearer tokens**:

1. `POST /api/v1/users/login` returns a signed JWT.
2. All protected routes require the header: `Authorization: Bearer <token>`.
3. The `protect` middleware decodes the token with `verifyToken()` (from `server/utils/jwtUtils.js`), queries the `users` table to confirm the user exists, and attaches `req.user` for downstream handlers.
4. Passwords at rest are hashed with `bcryptjs`.

**Role-based access** is enforced with the `authorize(...roles)` middleware (also in `authMiddleware.js`).

---

## 5. Widget Documentation

### What the Widget Is

The widget is a self-contained, embeddable floating chat button and conversation panel built with React. It compiles into a single JavaScript file (`live-chat-widget.js`) and an accompanying stylesheet (`live-chat-widget.css`) that can be added to **any HTML page** without a build toolchain.

### Purpose of the Widget

It gives the **client-facing** side of the chat experience — registration, posting a concern, sending/receiving messages, reading queue position updates, and submitting a post-chat rating — in a zero-friction drop-in format. Businesses include two tags in their HTML and the widget handles the rest.

### How It Works Internally

```
widget.jsx (entry)
  └─ Creates a <div id="live-chat-widget-root"> appended to <body>
  └─ Mounts <ChatWidget apiUrl socketUrl> via ReactDOM.createRoot

ChatWidget.jsx (1 135 lines, all state in a single component)
  ├─ Registration screen  →  POST /users/login (or POST /users if new)
  │                           persists { id, name, email } to localStorage
  ├─ Concern selector     →  GET /concern-types (dynamic list merged
  │                           with static "General Inquiry / Technical Issue")
  ├─ Message handling     →  POST /messages  (creates chat on first send)
  │                           POST /messages/upload  (file attachment)
  ├─ Socket.IO client     →  connects after registration
  │   ├─ joins user_<id> personal room
  │   ├─ joins chat_<id> room after chat is created
  │   └─ listens for: new_message · user_typing · user_stop_typing
  │                   messages_seen · chat_status_update
  │                   queue_position_update
  ├─ Queue display        →  shows live position, updated via socket
  ├─ Rating screen        →  shown when chat status becomes 'ended'
  │                           POST /ratings
  └─ Toast notifications  →  4-second auto-dismiss feedback messages
```

### Props / Parameters

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiUrl` | `string` | `''` | Base URL of the REST API, e.g. `https://api.example.com/api/v1` |
| `socketUrl` | `string` | `''` | Root URL of the Socket.IO server, e.g. `https://api.example.com` |

Both props are passed in automatically by `widget.jsx` from `window.LiveChatConfig`.

### Component State Reference

| State variable | Type | Purpose |
|----------------|------|---------|
| `isOpen` | `boolean` | Controls widget panel open/close |
| `isRegistered` | `boolean` | True after the user completes the sign-in form |
| `userId` | `number\|null` | Resolved user ID from the API |
| `chatId` | `number\|null` | Active chat session ID |
| `messages` | `Message[]` | All messages in the current chat |
| `inputMessage` | `string` | Controlled input value |
| `isTyping` | `boolean` | Agent-is-typing indicator flag |
| `agentName` | `string` | Name of the connected agent |
| `queuePosition` | `number\|null` | Client's current queue position |
| `isChatEnded` | `boolean` | Triggers the rating screen |
| `ratingValue` | `number` | Star rating 1–5 |
| `ratingComment` | `string` | Optional text comment |
| `ratingSubmitted` | `boolean` | Prevents double submission |
| `concern` | `string` | Selected or typed concern |
| `isCustomConcern` | `boolean` | True when "Other" is selected |
| `concernOptions` | `ConcernType[]` | Dynamic list from `/concern-types` |
| `selectedFile` | `File\|null` | File pending upload |
| `lastSeenAt` | `string\|null` | ISO timestamp of last agent read receipt |
| `toast` | `{ show, message }` | Transient notification state |

### Socket.IO Events (Widget Side)

#### Events the Widget **emits**

| Event | Payload | When |
|-------|---------|------|
| `join` | `userId` | After socket connects and user is registered |
| `join_chat` | `chatId` | After a chat is created or the widget re-connects |
| `leave_chat` | `chatId` | On component unmount |
| `typing` | `{ chatId, userName, role }` | While the user types (debounced) |
| `stop_typing` | `{ chatId }` | When the user stops typing |
| `mark_messages_read` | `{ chatId, readerRole: 'client' }` | When a non-client message arrives |

#### Events the Widget **listens for**

| Event | Payload | Action |
|-------|---------|--------|
| `new_message` | `Message` | Appends message to the chat list |
| `user_typing` | `{ userName, role }` | Shows agent typing indicator |
| `user_stop_typing` | — | Hides typing indicator |
| `messages_seen` | `{ chatId, seenAt }` | Updates last-seen timestamp |
| `chat_status_update` | `{ chatId, status }` | Switches to ended/active state |
| `queue_position_update` | `{ position }` | Updates queue badge and inserts bot message |

### Styling Customisation

All widget styles are scoped inside `ChatWidget.css`. The widget DOM is injected as a direct child of `<body>` and does **not** use Shadow DOM, so host-page CSS can override any rule.

Key CSS selectors:

| Selector | Element |
|----------|---------|
| `.live-chat-widget` | Outer wrapper (bottom-right fixed) |
| `.chat-toggle-btn` | Floating action button |
| `.chat-panel` | The full conversation panel |
| `.chat-header` | Coloured header strip |
| `.chat-messages` | Scrollable message list |
| `.chat-message.client` | Client message bubble |
| `.chat-message.support` | Agent / bot message bubble |
| `.chat-input-area` | Bottom input row |
| `.star-rating` | Post-chat rating stars |

To customise the primary colour, override the header background:

```css
.chat-header {
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}
.chat-toggle-btn {
  background: linear-gradient(135deg, #your-color-1, #your-color-2) !important;
}
```

### Example Usage — Minimal Integration

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>My Website</title>

  <!-- Widget stylesheet -->
  <link rel="stylesheet" href="https://cdn.example.com/live-chat-widget.css" />
</head>
<body>

  <!-- Your page content -->

  <!-- 1. Configure the widget before the script loads -->
  <script>
    window.LiveChatConfig = {
      apiUrl:    'https://api.example.com/api/v1',
      socketUrl: 'https://api.example.com'
    };
  </script>

  <!-- 2. Load the widget bundle -->
  <script src="https://cdn.example.com/live-chat-widget.js"></script>

</body>
</html>
```

### Manual Initialisation

If you need to control when the widget mounts (e.g., after a user logs in):

```html
<script>
  window.LiveChatConfig = { apiUrl: '...', socketUrl: '...' };
</script>
<script src="live-chat-widget.js"></script>

<script>
  // Prevent auto-init — place this BEFORE the widget script
  // or call init explicitly later
  window.LiveChatWidget.init();
</script>
```

### Complete Integration Guide

1. **Build the widget** (`npm run build:widget` inside `frontend/`) or use the pre-built files from `dist-widget/`.
2. **Host both artefacts** (`live-chat-widget.js` and `live-chat-widget.css`) on a publicly accessible URL (CDN, S3 bucket, or your own server).
3. **Configure CORS** — ensure the Express API allows requests from the hosts that will embed the widget (the default config uses `origin: '*'`; tighten this for production).
4. **Concern types** — the widget automatically fetches your custom concern categories from `GET /api/v1/concern-types`. Populate the database table to customise the dropdown.
5. **Session persistence** — the widget stores `{ id, name, email }` in `localStorage` under the key `chat_widget_user`. On subsequent page loads the user is not asked to register again.

### Common Errors & Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Widget shows but won't connect | Wrong `apiUrl` or CORS misconfiguration | Verify `window.LiveChatConfig.apiUrl` and check browser Network / Console for CORS errors |
| `Failed to register` toast | API unreachable or `POST /users` returned an error | Check the API is running and the user table exists |
| Messages not delivering in real time | Socket.IO transports fail through a proxy | Add `transports: ['polling']` or configure your reverse proxy to support WebSocket upgrades |
| Typing indicator never disappears | `stop_typing` event not received | Confirm both the widget and the agent dashboard have joined the same `chat_<id>` room |
| File upload hangs | Cloudinary credentials not set | Set all three `CLOUDINARY_*` environment variables in `server/.env` |
| Queue position never updates | `queue_position_update` not emitted | Verify `emitQueuePositionUpdate` is called from `chatsAssignmentServices` after every re-queue |
| Rating screen never appears | `chat_status_update` with `status: 'ended'` not received | Confirm `emitChatStatusUpdate` is called from `endChat` service |

---

## 6. API Documentation

All endpoints are prefixed with `/api/v1` (variable via `API_VERSION` in `.env`).

Successful responses follow the shape:

```json
{
  "success": true,
  "count": 3,       // present on collection responses
  "data": { ... }   // or [ ... ]
}
```

Error responses:

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

### Authentication

Protected routes require a JWT `Bearer` token obtained from the login endpoint:

```
Authorization: Bearer <token>
```

Routes marked **🔒 Protected** below require this header.

---

### Users

#### `POST /api/v1/users/login`

Authenticate a user by email. Returns a JWT on success.

**Request body:**

```json
{ "email": "agent@example.com" }
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "email": "agent@example.com",
    "role": "support",
    "status": "available"
  },
  "token": "<jwt>"
}
```

**Response `404`:** User not found.

---

#### `GET /api/v1/users` 🔒

Return all users. Supports query-string filters (forwarded to the service layer).

**Response `200`:**

```json
{ "success": true, "count": 5, "data": [ { ...user }, ... ] }
```

---

#### `GET /api/v1/users/:id` 🔒

Return a single user by ID.

**Response `404`:** User not found.

---

#### `PATCH /api/v1/users/:id/status` 🔒

Update an agent's availability status.

**Request body:**

```json
{ "status": "available" }   // available | busy | away
```

**Response `200`:** Updated user object. Triggers `emitUserStatusChange` via Socket.IO.

---

### Chats

#### `GET /api/v1/chats?user_id=<id>`

Retrieve all chats for a user (with message history).

**Required query param:** `user_id`

**Response `200`:**

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 10,
      "client_id": 3,
      "agent_id": 1,
      "concern": "Technical Issue",
      "status": "active",
      "messages": [ { ...message }, ... ]
    }
  ]
}
```

---

#### `GET /api/v1/chats/stats`

Return aggregate chat statistics (counts, resolution times).

#### `GET /api/v1/chats/detailed-stats`

Return detailed per-agent statistics.

---

#### `POST /api/v1/chats/auto-assign`

Auto-assign a queued chat to the best available agent.

**Request body:**

```json
{ "chat_id": 10 }
```

**Response `200`:** Updated chat with assigned `agent_id`.

---

#### `POST /api/v1/chats/assign`

Manually assign a chat to a specific agent.

**Request body:**

```json
{ "chat_id": 10, "agent_id": 2 }
```

---

#### `POST /api/v1/chats/end`

Mark a chat as ended.

**Request body:**

```json
{ "chat_id": 10 }
```

Triggers `emitChatStatusUpdate(chatId, 'ended')`.

---

### Messages

#### `GET /api/v1/messages?chat_id=<id>`

Retrieve all messages for a chat.

**Response `200`:**

```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 55,
      "chat_id": 10,
      "sender_id": 3,
      "sender_role": "client",
      "message": "Hello, I need help.",
      "attachment_url": null,
      "attachment_type": null,
      "is_seen": 1,
      "created_at": "2026-03-03T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/v1/messages`

Send a text message. If no `chat_id` is provided, a new chat is created automatically.

**Request body:**

```json
{
  "sender_id": 3,
  "message": "Hello, I need help.",
  "chat_id": 10,       // optional — omit to start a new chat
  "concern": "Billing" // optional — used only when starting a new chat
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": { ...message },
  "chat_id": 10,
  "is_queued": false,
  "queue_position": null
}
```

---

#### `POST /api/v1/messages/upload`

Send a message with a file attachment. Uses `multipart/form-data`.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `attachment` | `File` | The file to upload (handled by multer → Cloudinary) |
| `sender_id` | `string` | Sender's user ID |
| `chat_id` | `string` | Chat ID |
| `message` | `string` | Optional text alongside the file |

Supported MIME types are automatically classified into `image`, `video`, `audio`, `document`, or `archive`.

---

### Queue

#### `GET /api/v1/queue`

List all chats currently in the queue (status = `queued`).

#### `GET /api/v1/queue/available-agents`

List all support users with status `available`.

---

### Notifications

#### `GET /api/v1/notifications?user_id=<id>&is_read=false&page=1&limit=20`

Retrieve notifications for a user with optional filters.

#### `GET /api/v1/notifications/unread-count?user_id=<id>`

**Response `200`:**

```json
{ "success": true, "count": 4 }
```

#### `PUT /api/v1/notifications/read-all/:userId`

Mark all notifications for a user as read.

#### `PUT /api/v1/notifications/read/:id`

Mark a single notification as read.

**Request body:**

```json
{ "user_id": 1 }
```

---

### Ratings

#### `POST /api/v1/ratings`

Submit a post-chat rating.

**Request body:**

```json
{
  "chat_id": 10,
  "client_id": 3,
  "agent_id": 1,
  "rating": 5,
  "comment": "Very helpful, thank you!"
}
```

Rating must be between 1 and 5. Each chat can have only one rating (unique constraint).

#### `GET /api/v1/ratings/chat/:chat_id`

Get the rating for a specific chat.

#### `GET /api/v1/ratings/agent/:agent_id`

Get all ratings and aggregate stats for an agent.

#### `GET /api/v1/ratings/leaderboard`

Return top agents ranked by average rating.

---

### Socket.IO Events (Server-Emitted)

| Event | Delivery | Payload |
|-------|---------|---------|
| `new_message` | `chat_<id>` room + `user_<agentId>` | Full message object |
| `chat_assigned` | `user_<agentId>` | Chat data |
| `chat_status_update` | `chat_<id>` room | `{ chatId, status }` |
| `queue_update` | All connected clients | `{ action, chatId, agentId? }` |
| `queue_position_update` | `user_<clientId>` | `{ position }` |
| `new_notification` | `user_<id>` | Notification object |
| `user_status_changed` | All connected clients | `{ userId, status, name, role }` |
| `stats_update` | All connected clients | `{ ts }` |
| `messages_seen` | `chat_<id>` room | `{ chatId, seenAt }` |
| `user_typing` | `chat_<id>` room (others) | `{ userName, role }` |
| `user_stop_typing` | `chat_<id>` room (others) | — |

### HTTP Error Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request — missing or invalid parameters |
| `401` | Unauthorized — missing or invalid JWT |
| `404` | Not Found — resource does not exist |
| `500` | Internal Server Error — unexpected exception |

---

## 7. Development Guide

### How to Add a New API Resource

1. **Define the table** — create `server/tables/myResourceTable.js` with a `CREATE TABLE IF NOT EXISTS` query. Import and add it to `server/tables/tables.js`.
2. **Write the service** — create `server/services/myResourceServices.js` with the business logic (SQL queries via the `pool`).
3. **Write the controller** — create `server/controllers/myResourceControllers.js` wrapping each service function with `express-async-handler`.
4. **Create the router** — create `server/routes/myResourceRoutes.js` using `express.Router()`. Apply `protect` to routes that need authentication.
5. **Mount the router** — import the router into `server/server.js` and mount it: `app.use(\`/api/${API_VERSION}/my-resource\`, myResourceRoutes)`.

### How to Add a New Frontend Page

1. Create the page component in `frontend/src/pages/MyPage/MyPage.jsx`.
2. Add its route to `frontend/src/routes/` (follow the existing `MainRoutes.jsx` pattern).
3. Add a menu entry in `frontend/src/menu-items/` if it needs a sidebar link.
4. If the page needs data, create or extend an API wrapper in `frontend/src/api/`.

### How to Create a New React Component

1. Create `frontend/src/components/MyComponent/MyComponent.jsx` (and optionally `MyComponent.css`).
2. Keep components stateless where possible; lift state to the nearest common ancestor.
3. Use MUI components exclusively for UI elements to stay consistent with the design system.
4. Export a default named export matching the filename.

### Coding Conventions

| Convention | Detail |
|-----------|--------|
| Module format | ES Modules (`import`/`export`) throughout |
| Backend async | Wrap all controller functions in `express-async-handler` |
| Validation | Use `express-validator` rule arrays in `middlewares/validations/` |
| Component exports | Default export from each component file |
| Naming | `camelCase` for variables/functions; `PascalCase` for components and classes |
| API responses | Always return `{ success: true/false, data, message? }` |
| Socket emissions | All emitters live in `socketHandler.js` and are exported individually |
| Environment | No hardcoded credentials — always use `process.env.*` |

### State Management Pattern

The project uses **local component state** (`useState`, `useReducer`) together with **React Context** for global cross-cutting concerns:

| Context | File | Provides |
|---------|------|---------|
| `ConfigContext` | `src/contexts/ConfigContext.jsx` | Theme/config preferences |
| `SnackbarContext` | `src/contexts/SnackbarContext.jsx` | Global snackbar notifications |

Server state is fetched with **SWR** for read-heavy views (dashboard statistics) and plain **Axios** calls for mutations (send message, end chat, etc.). There is intentionally no Redux or Zustand — the data graph is simple enough that prop drilling + context covers all cases without a global store.

### Adding a Socket.IO Event

**Server side** — add a new emitter function to `server/socket/socketHandler.js`:

```js
export const emitMyEvent = (targetId, payload) => {
  if (io) io.to(`user_${targetId}`).emit('my_event', payload);
};
```

Call it from a service after the relevant DB write.

**Client side** — add a listener inside the `useEffect` that initialises `socketRef.current`:

```js
socketRef.current.on('my_event', (payload) => {
  // update state
});
```

---

## 8. Testing

### Current Test Status

The project does not currently include an automated test suite (`npm test` echoes a placeholder). The following describes the recommended approach for adding tests.

### Recommended Testing Setup

**Backend — Jest + Supertest**

```bash
cd server
npm install --save-dev jest supertest @jest/globals
```

Add to `server/package.json`:

```json
{
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/.bin/jest"
  },
  "jest": {
    "transform": {},
    "extensionsToTreatAsEsm": [".js"]
  }
}
```

**Frontend — Vitest + React Testing Library**

```bash
cd frontend
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `frontend/vite.config.mjs`:

```js
test: {
  environment: 'jsdom',
  setupFiles: ['./src/setupTests.js']
}
```

### Test Structure

```
server/
  __tests__/
    unit/
      services/
        chatsServices.test.js
        messagesServices.test.js
        ratingsServices.test.js
      utils/
        jwtUtils.test.js
    integration/
      routes/
        users.test.js   ← uses Supertest against a test DB
        chats.test.js

frontend/
  src/
    components/
      ChatWidget/
        ChatWidget.test.jsx
    utils/
      *.test.js
```

### Example Unit Test — JWT utility

```js
// server/__tests__/unit/utils/jwtUtils.test.js
import { describe, it, expect } from '@jest/globals';
import { generateToken, verifyToken } from '../../../utils/jwtUtils.js';

describe('jwtUtils', () => {
  it('generates a token that can be verified', () => {
    const token = generateToken({ id: 1, role: 'support' });
    const decoded = verifyToken(token);
    expect(decoded.id).toBe(1);
    expect(decoded.role).toBe('support');
  });

  it('throws on a tampered token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
```

### Example Integration Test — Users route

```js
// server/__tests__/integration/routes/users.test.js
import request from 'supertest';
import app from '../../../server.js';

describe('POST /api/v1/users/login', () => {
  it('returns 200 and a token for a known user', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'agent@example.com' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('returns 404 for an unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/users/login')
      .send({ email: 'nobody@example.com' });

    expect(res.statusCode).toBe(404);
  });
});
```

### Example Component Test — ChatWidget registration

```jsx
// frontend/src/components/ChatWidget/ChatWidget.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import ChatWidget from './ChatWidget';

describe('ChatWidget', () => {
  it('renders the registration form on first open', () => {
    render(<ChatWidget apiUrl="http://localhost:5000/api/v1" socketUrl="http://localhost:5000" />);
    fireEvent.click(screen.getByRole('button', { name: /chat/i }));
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your email/i)).toBeInTheDocument();
  });
});
```

---

## 9. Deployment

### Environment Separation

| Environment | `NODE_ENV` | DB Variables | Notes |
|-------------|------------|-------------|-------|
| Development | `development` | `DB_*_LOCAL` | Runs on localhost; full debug logging |
| Staging | `production` | Staging `DB_*` | Mirror of prod; used for QA |
| Production | `production` | Production `DB_*` | Console logs stripped from widget bundle |

### Process Management (Production API)

Use **PM2** to keep the Node.js process alive:

```bash
npm install -g pm2
cd server
pm2 start server.js --name live-chat-api --env production
pm2 save
pm2 startup          # auto-start on system reboot
```

### Reverse Proxy (nginx)

```nginx
server {
  listen 443 ssl;
  server_name api.example.com;

  location / {
    proxy_pass         http://127.0.0.1:5000;
    proxy_http_version 1.1;

    # WebSocket support
    proxy_set_header   Upgrade    $http_upgrade;
    proxy_set_header   Connection "upgrade";

    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }
}
```

> The WebSocket `Upgrade` headers are **required** for Socket.IO to function correctly behind nginx.

### Static Hosting (SPA)

After running `npm run build` in `frontend/`, serve `dist/` from any static host:

- **Vercel / Netlify** — connect the repo and set the build command to `cd frontend && npm run build` with the publish directory set to `frontend/dist`.
- **nginx** — `root /var/www/live-chat/dist;` with `try_files $uri $uri/ /index.html;` for SPA routing.

### Widget CDN Hosting

```bash
cd frontend
npm run build:widget
# Upload dist-widget/ contents to S3, Cloudflare R2, or any CDN
```

Set a long-lived cache header (`Cache-Control: public, max-age=31536000`) and use content-addressed filenames (or cache-busting query strings) when updating the widget.

### Build Optimisation Notes

| Optimisation | Detail |
|-------------|--------|
| Widget minification | Terser is applied automatically via `vite.config.widget.mjs`; `drop_console: true` removes all `console.*` calls from the bundle |
| Code splitting | The SPA uses Vite's default chunk splitting; large dependencies (MUI, charts) land in separate vendor chunks |
| Tree shaking | ES Module imports enable dead-code elimination across the entire frontend |
| Image optimisation | Static images in `frontend/src/assets/images/` should be compressed before committing; use WebP where browser support allows |
| Database | Add indexes for columns used in WHERE / ORDER BY clauses; key indexes are already defined in the table schemas (e.g., `idx_messages_chat`, `idx_chats_status`) |

### CI/CD Recommendation

```yaml
# .github/workflows/deploy.yml (example)
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install & build frontend
        run: |
          cd frontend
          npm ci
          npm run build
          npm run build:widget

      - name: Deploy SPA to CDN
        run: # your upload command (aws s3 sync, netlify deploy, etc.)

      - name: Deploy widget to CDN
        run: # upload dist-widget/

      - name: Deploy API
        run: |
          # SSH to server and run:
          # git pull && cd server && npm ci && pm2 restart live-chat-api
```

---

*Documentation generated for Live-Chat v1.0.0 — March 2026.*
