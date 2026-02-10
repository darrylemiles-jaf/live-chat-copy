Live Chat

Full-stack live-chat application with a React + MUI frontend and a Node.js/Express backend (based on Mantis Material React).

## Overview

This repository contains both the frontend (React, Vite, Material UI) and the backend (Node.js, Express, SQLite) for a live-chat application. The frontend features a customizable theme system under `frontend/src/themes`. The backend provides REST APIs and manages users, chats, tickets, and messages.

## Features

### Frontend

- React 19 + Vite
- Material UI theming and overrides
- Theme palettes and utilities in `frontend/src/themes`
- Example auth and dashboard pages

### Server

- Node.js + Express backend
- SQLite database (via `server/config/db.js`)
- REST API for users, chats, tickets, and messages
- Modular structure: controllers, services, routes, middlewares

## Prerequisites

- Node.js (recommended v18+)
- npm (bundled with Node.js)

## Quick Start

### 1. Frontend

```bash
cd frontend
npm install
npm run start # start dev server
```

Other scripts:

- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint
- `npm run lint:fix` — fix lint issues
- `npm run prettier` — format source files

### 2. Server

```bash
cd server
npm install
npm run start # start backend server
```

The server runs on the port specified in `server.js` (default: 5000). It uses SQLite for storage (see `server/config/db.js`).

## Useful Scripts

### Frontend

- `npm run start` — run dev server (Vite)
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run lint:fix` — fix lint issues
- `npm run prettier` — format source files

### Server

- `npm run start` — start backend server

## Theme & Colors (Frontend)

Theme configuration lives in `frontend/src/themes`.

- Palette builder: `frontend/src/themes/palette.js`
- Theme presets: `frontend/src/themes/theme/index.js`

You can customize colors by editing the palettes in `palette.js` and the preset mappings in `theme/index.js`. Recent updates include custom green, red, gold (yellow), and orange palettes to match application branding.

Suggested color highlights used in the theme:

- Green (main): `#008E86`
- Green (bar): `#3B7080`
- Green (darker): `#064856`
- Buttons / accent green: `#12515D`
- Yellow (warning): `#FFB400`
- Red (error): `#B53654`
- Orange (accent): `#ED7464`

## Project Structure (high level)

- `frontend/` — React app source
  - `src/` — app source files
    - `themes/` — theme, palettes, overrides
    - `components/`, `pages/`, `layout/` — UI structure
- `server/` — Node.js backend
  - `config/` — database config
  - `controllers/` — request handlers
  - `middlewares/` — Express middlewares
  - `routes/` — API endpoints
  - `services/` — business logic
  - `tables/` — SQLite table definitions

## Contributing

Contributions are welcome. Please open issues or PRs with proposed changes. Follow existing code style and run linting/Prettier before submitting.

## License

Refer to the original template license or include a project license file as needed.
