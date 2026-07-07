# core — shared foundation

Used by **both** the child and parent apps. Loads first (before any screen).

- `primitives.jsx` — design system: `THEME` palette + `Icon`, `Button`, `Input`, `Bar`, `Toggle`, `Badge`…
- `characters.jsx` — `<Mascot>`, the parametric buddy/villain art (inline SVG)
- `data.jsx` — mock data (`PLAYER`, `CHARACTERS`, `VILLAINS`, shop…) — treat as the API contract
- `i18n.jsx` — translations + `L()` helper (EN ⇄ KO)
- `nav.jsx` — shared bottom tab bar (`CHILD_TABS`, `PARENT_TABS`, `<TabBar>`)

Everything is exposed on `window` (no imports). See `/ARCHITECTURE.md`.
