# JoanX — Prototype

Interactive hi-fi prototype for **JoanX**, a walk-safety app for kids — a **Vite + React** app.

- **`index.html`** — the clickable prototype (Child app + Parent app, with a live Tweaks panel).
- **`design/overview.html`** — a flat canvas showing every screen side-by-side.
- **`design/colors.html` · `design/components.html`** — design-system galleries.
- **`src/`** — the source (theme tokens, mascot system, screens, i18n).

See **`ARCHITECTURE.md`** for the full map.

## Marketing website

A store-listing-style landing page for JoanX — product pitch, real prototype screenshots, the
staged safety moment, and the data-sharing rules.

- **Live:** https://claude.ai/artifact/T6YMx1xDMzeqbqMWkUJQYy
- **Source:** [`website/index.html`](website/index.html) (standalone, no build step — open the file)
- **Brief:** [`website/BRIEF.md`](website/BRIEF.md) — audience, content inventory, honesty rules,
  and the design direction it was built to

Screenshots in `website/media/shots/` are captured from this prototype; re-capture them after a
UI change rather than editing them by hand.

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
