# JoanX — Prototype

Interactive hi-fi prototype for **JoanX**, a walk-safety app for kids — a **Vite + React** app.

- **`index.html`** — the clickable prototype (Child app + Parent app, with a live Tweaks panel).
- **`design/overview.html`** — a flat canvas showing every screen side-by-side.
- **`design/colors.html` · `design/components.html`** — design-system galleries.
- **`src/`** — the source (theme tokens, mascot system, screens, i18n).

See **`ARCHITECTURE.md`** for the full map.

## Run locally

```bash
npm install
npm run dev        # → http://localhost:5173/
```

Other scripts: `npm run build` (production build → `dist/`), `npm run preview` (serve the build).

## Deploy to Vercel
Vercel auto-detects **Vite**:

- **Framework Preset:** Vite
- **Build Command:** `npm run build` (default)
- **Output Directory:** `dist` (default)
- **Install Command:** `npm install` (default)

`vercel.json` is included for clean URLs and sane caching.
