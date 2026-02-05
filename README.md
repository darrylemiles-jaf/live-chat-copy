Live Chat

Lightweight React + MUI frontend for a live-chat application (based on Mantis Material React).

## Overview

This repository contains the frontend for a live-chat application using React, Vite, and Material UI. It includes a customizable theme system located under `frontend/src/themes` to adapt colors and palettes.

## Features

- React 19 + Vite
- Material UI theming and overrides
- Theme palettes and utilities in `frontend/src/themes`
- Example auth and dashboard pages

## Prerequisites

- Node.js (recommended v18+)
- npm (bundled with Node.js)

## Quick Start (frontend)

1. Install dependencies

```bash
cd frontend
npm install
```

2. Run development server

```bash
npm run start
```

3. Build for production

```bash
npm run build
npm run preview
```

## Useful Scripts

- `npm run start` — run dev server (Vite)
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint
- `npm run lint:fix` — fix lint issues
- `npm run prettier` — format source files

## Theme & Colors

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

## Contributing

Contributions are welcome. Please open issues or PRs with proposed changes. Follow existing code style and run linting/Prettier before submitting.

## License

Refer to the original template license or include a project license file as needed.
