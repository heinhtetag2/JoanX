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

## Store listing assets

Everything a store listing needs, in English and Korean, built from real prototype captures:
eight listing frames per device size, both app icons, and the feature graphic.

- **Open:** "Store assets" in the prototype's top bar, or [`/website/store.html`](website/store.html).
  Pick a size and a language, then **Download all** for a zip of that tab.
- **Sizes:** phone 1080×1920 · App Store 6.9" 1320×2868 · tablet 1200×1920 (serves Play's 7"
  and 10" categories) · app icon 512×512 (32-bit, alpha) · feature graphic 1024×500.
  Screenshots and the feature graphic are 24-bit PNG with no alpha, as both stores require.
- **Source:** [`website/store.html`](website/store.html); exported PNGs in `public/store/`.
- **Rebuild** (with `npm run dev` running):

```bash
node scripts/capture-store-screens.mjs   # the app screens shown inside the phones
node scripts/export-store-shots.mjs      # the frames, icons and feature graphic
```

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
