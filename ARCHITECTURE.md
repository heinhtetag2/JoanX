# JoanX — Project Architecture

A standard **Vite + React** app. JoanX is **two apps in one prototype**:

- **Child app** — a friendly game (a "buddy" that grows as the child walks phone-free safely).
- **Parent app** — a calm guardian dashboard (onboarding, add-child, reports, rules).

Switch between them with the **Child app / Parent app** toggle at the top; tune everything live from the **Tweaks** panel (gear icon).

---

## Run it

```bash
npm install        # first time
npm run dev        # dev server (HMR) → http://localhost:5173/
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

Requires Node 18+ (developed on Node 22). React 18, Vite 6, `lucide-react` for icons.

### Pages (Vite multi-page)
- `index.html`                 → **the app** (topbar → **Design system** opens the interactive token/component doc, **Spec checklist** the feature-coverage audit; deep-link `/?view=design` / `/?view=checklist`)
- `design/overview.html`       → every screen on one pan/zoom canvas (design review)
- `design/colors.html`         → color-token gallery
- `design/components.html`     → component gallery

The written design-system spec for developer handoff is `DESIGN-SYSTEM.md` (repo root); its interactive twin is `src/docs/DesignSystem.jsx`.

All four are entries in `vite.config.js`.

---

## Folder map

```
index.html              App entry (loads /src/main.jsx)
vite.config.js          Vite config + the 4 page entries
package.json

src/
├── main.jsx            Mounts <App/>, imports the global CSS
├── core/               Shared foundation — used by BOTH apps
│   ├── primitives.jsx   Design system: THEME palette + Icon (lucide-react), Button, Input, Bar, Toggle, Badge…
│   ├── characters.jsx   <Mascot> — the buddy/villain art (comic = inline art from /assets, cute = images)
│   ├── data.jsx         Mock data: PLAYER, CHARACTERS, VILLAINS… (the "API contract")
│   ├── i18n.jsx         Translations + the L() helper (EN ⇄ KO)
│   └── nav.jsx          Shared bottom tab bar (CHILD_TABS, PARENT_TABS, <TabBar>)
├── child/              The CHILD app (game): home layouts, battle, dex, friends, safety moments
├── parent/             The PARENT app: onboarding/auth, add-child, reports, rules (defines the pink BRAND + ChoiceGroup)
├── shell/App.jsx       iOS frame, role switcher, router, Tweaks panel
├── overview/           Design-canvas components used by design/overview.html
└── styles/             color-system.css · tripme-tokens.css (design tokens) · joanx.css (animations/app CSS)

public/
└── assets/
    ├── backgrounds/page-bg.jpg          app page background (index.html)
    ├── brand/logo-wordmark.svg
    ├── onboarding/intro.png · add-child.png
    └── characters/
        ├── comic/  fox.svg cat.svg croc.svg bird.svg owl.svg default.svg
        └── cute/   fox.png cat.png croc.png bird.png owl.png default.png

design/                 Design-reference pages (dev tooling, their own Vite entries)
```

`public/` is served at the site root, so code references assets by absolute URL: `/assets/…`.

### Modules
Standard ES modules — every file `import`s what it uses and `export`s what it provides.
No `window` globals for app code (one deliberate exception: `window.JX_CHAR_STYLE`, a runtime flag the Tweaks panel sets and `Mascot` reads to switch art styles).

### Two color palettes (by design)
- **Child app** → `THEME` (ocean/green + per-buddy accent), from `src/core/primitives.jsx`.
- **Parent app** → `BRAND` (JoanX logo **magenta** `#E00477`, with a softened `ink` for active/focus states), at the top of `src/parent/shared.jsx`.

---

## Adding a screen
1. Create the component in `src/child/…` or `src/parent/…` and `export` it.
2. `import` it where it's used (usually `src/shell/App.jsx`) and route to it.
3. Add a tab in `src/core/nav.jsx` if needed.

See `DOCUMENTATION.md` for the full functional spec and data contracts.
