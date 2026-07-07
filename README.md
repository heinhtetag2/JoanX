# JoanX — Prototype

Interactive hi-fi prototype for **JoanX**, a walk-safety app for kids built on the TripMe design system.

- **`index.html`** — the clickable prototype (Child app + Parent app, with a live Tweaks panel).
- **`design/overview.html`** — a flat canvas showing every screen side-by-side.
- **`app/`** — the source (theme tokens, mascot system, screens, i18n).

## Run locally
It's a static site — no build step. Just serve the folder with any static server, e.g.:

```bash
npx serve .
# then open the printed URL (index.html)
```

(Opening `index.html` directly via `file://` also mostly works, but a local server avoids browser fetch restrictions on the `app/*.jsx` files.)

## Deploy to Vercel
This is a **static site with no framework/build**. When importing into Vercel:

- **Framework Preset:** Other
- **Build Command:** _(leave empty)_
- **Output Directory:** `.` (the repo root)
- **Install Command:** _(leave empty)_

`index.html` is the entry point. `vercel.json` is included for clean URLs and sane caching.
