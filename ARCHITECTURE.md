# JoanX — Project Architecture

A quick map of the codebase for anyone picking it up. JoanX is **two apps in one prototype**:

- **Child app** — a friendly game (a "buddy" that grows as the child walks phone-free safely).
- **Parent app** — a calm guardian dashboard (onboarding, add-child, reports, rules).

You switch between them with the **Child app / Parent app** toggle at the top, and tune everything live from the **Tweaks** panel (gear icon).

---

## How it runs (important)

This is a **no-build, browser-native prototype**. There is no webpack/vite/npm step.

- `index.html` loads React, ReactDOM, and **Babel Standalone** from a CDN, then loads each `.jsx` file with `<script type="text/babel">`.
- Babel transpiles JSX **in the browser** at load time.
- Files **do not `import` each other**. Each file attaches its exports to `window` (e.g. `Object.assign(window, { ParentReports, ... })`), and later files read those globals. Shared values like `THEME`, `L()`, `PLAYER`, `CHARACTERS` are globals defined in `app/core/`.

Two consequences a dev must know:

1. **Load order matters.** `app/core/*` must load before the screens, and `app/shell/App.jsx` loads **last**. The order is defined by the `<script>` tags in `index.html`.
2. **Renaming/moving a file** means updating the loaders (see "Where paths live" below). It does **not** require touching imports, because there are none.

### Run it locally
```bash
python3 devserver.py        # serves on http://localhost:8000 with live-reload
# open http://localhost:8000/index.html      → the app
# open http://localhost:8000/Overview.html   → all screens on one design canvas
```

### Ship a single file
```bash
python3 build_standalone.py  # inlines all css/jsx into "JoanX Prototype (standalone).html"
```

---

## Folder map

```
app/
├── core/        Shared foundation — used by BOTH apps
│   ├── primitives.jsx   Design system: THEME palette + Icon, Button, Input, Bar, Toggle, Badge…
│   ├── characters.jsx   <Mascot> — the parametric buddy/villain art (inline SVG, per art style)
│   ├── data.jsx         Mock data: PLAYER, CHARACTERS, VILLAINS, shop, etc. (the "API contract")
│   ├── i18n.jsx         Translations + the L() helper (EN ⇄ KO)
│   └── nav.jsx          Shared bottom tab bar (CHILD_TABS, PARENT_TABS, <TabBar>)
│
├── child/       The CHILD app (the game)
│   ├── ChildScreens.jsx        Child onboarding + misc child screens
│   ├── HomeVariants.jsx        Home layout options
│   ├── HomeVariantsSimple.jsx  Home layout options (simpler set; the XP goal-ring lives here)
│   ├── SafetyMoments.jsx       "Safe while walking" moments / overlays
│   ├── GameScreens.jsx         Core game screens
│   ├── GameScreens2.jsx        Battle flow + villain encounter
│   ├── GameExtras.jsx          Encyclopedias (character + villain dex), friends
│   └── CharacterVariants.jsx   Character detail-screen layout options
│
├── parent/      The PARENT app (the guardian dashboard)
│   └── ParentScreens.jsx       Onboarding/auth, add-child wizard, reports, rules, settings.
│                               NOTE: defines the pink BRAND palette + ChoiceGroup here.
│
├── shell/       App frame
│   └── App.jsx          iOS frame, role switcher, router, and the Tweaks panel. Loads LAST.
│
├── overview/    Design tooling (NOT part of the shipped apps)
│   ├── Overview.jsx        Renders every screen on one scrollable canvas
│   └── design-canvas.jsx   The pan/zoom canvas used by Overview.html
│
├── styles/      Global CSS
│   ├── color-system.css    Interactive-role color tokens
│   ├── tripme-tokens.css   ~64 --* design tokens (source of THEME)
│   └── joanx.css           Animations + app-specific styling
│
└── assets/      Images (only what the app actually uses)
    ├── brand/           logo-wordmark.svg
    ├── backgrounds/     page-bg.jpg  (the app's page background, via index.html)
    └── onboarding/      intro.png (parent intro slides) · add-child.png (add-child intro)
```

### Two color palettes (by design)
- **Child app** → `THEME` (ocean/green + per-buddy accent colors), from `app/core/primitives.jsx`.
- **Parent app** → `BRAND` (JoanX logo **magenta** `#E00477`, with a softened `ink` for active/focus states), defined at the top of `app/parent/ParentScreens.jsx`.

---

## Where paths live (update these if you move a file)

| File | What it references |
|------|--------------------|
| `index.html`     | The app's `<script>`/`<link>` load list (**order-sensitive**) |
| `Overview.html`  | The design-canvas load list |
| `components.html`, `colors.html` | Load `app/styles/*.css` (+ primitives) for the token galleries |
| `devserver.py`   | `WATCH_GLOBS` (recursive: `app/**/*.jsx`) for live-reload |
| `build_standalone.py` | Regex inliner — resolves any `src="app/…"` path automatically |

---

## Adding a screen (typical flow)
1. Write the component in the right folder (`app/child/…` or `app/parent/…`).
2. `Object.assign(window, { YourScreen })` at the bottom of the file.
3. Add a `<script type="text/babel" src="app/…/YourFile.jsx?v=2">` in `index.html`, **after** `core/` and **before** `shell/App.jsx`.
4. Route to it from `app/shell/App.jsx` (and add a tab in `app/core/nav.jsx` if needed).

See `DOCUMENTATION.md` for the full functional spec and data contracts.
