# JoanX Design System — Developer Handoff Spec

The interactive version of this document lives **inside the app**: run `npm run dev`, open
http://localhost:5173/ and click **Design system** in the topbar. Every token and component
there is live (click swatches to copy hex, toggle component states, replay animations).
This file is the written counterpart for reviews, tickets and offline reading.

JoanX is **two apps in one prototype** sharing a single token system:

| App | Accent | Source |
|---|---|---|
| **Child app** (game) | Ocean blue `#447aaf` + per-buddy accent | `THEME` in `src/core/primitives.jsx` |
| **Parent app** (guardian dashboard) | Logo magenta `#E00477` | `BRAND` in `src/parent/shared.jsx` |

---

## 1 · Architecture of the system

Tokens cascade in three CSS layers (loaded in this order by `src/main.jsx`), then JS mirrors
the useful subset so components can style inline:

1. **`src/styles/color-system.css`** — the base system: 10 color ramps
   (`--color-base-{palette}-{step}`) plus semantic tokens for badges, chips, fields, avatars,
   toggles, tooltips, data-viz…
2. **`src/styles/tripme-tokens.css`** — role aliases (`--primary`, `--fg1`, `--border`…),
   spacing, radius, shadows, and the type scale (`.t-*` classes).
3. **`src/styles/joanx.css`** — font imports (Pretendard, Fredoka, Jua) and motion classes (`.jx-*`).
4. **`src/core/primitives.jsx`** — the `THEME` object + shared components
   (`Icon, Button, Badge, Input, Bar, Toggle, StatusBar, SectionHead`).

### Import cheat-sheet

```jsx
import { THEME, Icon, Button, Badge, Input, Bar, Toggle, SectionHead, StatusBar,
         RARITY, mixHue, screenBgFor } from '../core/primitives.jsx';             // both apps
import { BRAND, brandBtn, ParentHead, ChoiceGroup, RULE_TAG_COLORS } from '../parent/shared.jsx';  // parent app only
import { ScreenHeader, StatCard, DexProgress, RarityPill, PointsChip, Confetti,
         screenBgActive } from '../child/shared.jsx';                             // child app only
import { TabBar, CHILD_TABS, PARENT_TABS } from '../core/nav.jsx';
import { Mascot, MascotChip, STYLE_BUDDIES, shade } from '../core/characters.jsx';
import { L, setLang, getLang } from '../core/i18n.jsx';
```

Screens are one file per screen (`src/child/ChildHome.jsx`, `src/parent/ParentReports.jsx`, …),
re-exported through `src/child/index.jsx` / `src/parent/index.jsx`; shared pieces live in each
app's `shared.jsx`.

---

## 2 · Color

### Child app — `THEME` (core roles)

| Token | Hex | Ramp | Use |
|---|---|---|---|
| `primary` | `#447aaf` | ocean-50 | CTAs, links, active states |
| `primaryDark` | `#2b5782` | ocean-60 | pressed, dark text on tint |
| `primaryLight` | `#ecf3fe` | ocean-10 | tint backgrounds, secondary buttons |
| `success` / `successLight` | `#4b814f` / `#ebf4eb` | evergreen 50/10 | safe / positive |
| `danger` / `dangerLight` | `#d14532` / `#fff1ee` | rust 50/10 | destructive, alerts, SOS |
| `warning` / `warningLight` | `#b16120` / `#f9f1ed` | ember 50/10 | caution |
| `gold` / `goldLight` | `#d19900` / `#fff2d1` | data-yellow 50/10 | points / XP (game layer) |
| `heart` | `#e86f5f` | rust-40 | likes |

### Ink & surfaces (sand ramp)

| Token | Hex | Use |
|---|---|---|
| `fg1` | `#2b2926` | primary ink (sand-80) |
| `fg2` | `#585450` | secondary text (sand-60) |
| `fg3` | `#b0adab` | captions, placeholders (sand-40) |
| `border` | `#ebebea` | hairlines (sand-20) |
| `surface2` | `#f8f7f7` | chips, wells (sand-10) |
| `bg` / `surface` | `#ffffff` | screens, cards (sand-0) |

`THEME.screenBg` — the static screen-background wash: warm peach → pink → lavender pooled
at the top, fading into sand-10 by ~400px. **Both apps now derive the wash from whatever
accent is in play instead**: `screenBgFor(color)` + `mixHue` live in `core/primitives.jsx` —
the child app tints by the active buddy (`screenBgActive()` in `child/shared.jsx` reads it
for you), the parent onboarding by `BRAND.primary`. `THEME.screenBg` remains the fallback
when no color is given.

### Parent app — `BRAND`

| Token | Hex | Use |
|---|---|---|
| `primary` | `#E00477` | brand magenta — parent CTAs, accents |
| `primaryDark` | `#B00360` | pressed / deep accent |
| `primaryLight` | `#FCE4F0` | soft tint — badges, chips |
| `ink` | `#3D3D3D` | softened black — active/focus (inputs, radios) |
| `shadowPrimary` | `0 8px 18px rgba(224,4,119,.30)` | glow under CTAs |

Parent CTAs reuse the `Button` primitive with the `brandBtn` style override
(`{ background: BRAND.primary, boxShadow: '0 8px 20px rgba(224,4,119,.32)' }`).

### Base ramps

10 palettes × steps 0–90 as `--color-base-{palette}-{step}`:
**sand** (neutral), **ocean**, **rust**, **evergreen**, **ember**, **iris**, **sakura**,
**tropic**, **pebble**, **moss**.

> **Removed:** the **sunbeam** (yellow) palette is gone. The semantic button tokens
> (`--color-interactives-button-{primary|brand|growth}-*`) that used it now point at
> **ocean** fills with **white** icon/label, and `THEME.cta / ctaPressed / ctaInk` were
> deleted from the JS palette — use `THEME.primary` for CTAs.

Step conventions: `10` tint background · `20` badge bg / hairline · `40–50` accent/fill ·
`60` pressed · `70+` label text on tints.

Semantic groups built on the ramps (see `design/colors.html` for the full gallery):
`--color-interactives-badge-{palette}-{default|label|dot}`,
`--color-interactives-chip-*`, `--color-interactives-avatar-*`, field/toggle/slider tokens,
and `--color-cards-border-default`.

### Rarity (game layer) — `RARITY`

| Key | fg | bg |
|---|---|---|
| common | `#b0adab` | `#f8f7f7` |
| rare | `#447aaf` | `#ecf3fe` |
| special | `#7f63c5` | `#f5f1fd` |

---

## 3 · Typography

**Stack:** `"Pretendard", -apple-system, "SF Pro Text", "Apple SD Gothic Neo", "Noto Sans KR",
"Segoe UI", Roboto, sans-serif` — Pretendard is the de-facto Korean UI font and renders Latin cleanly.

**Game display font:** `.game-font` → `'Fredoka', 'Jua', var(--font-sans)` — kid-app headers
only; the parent app always stays on Pretendard. (The "calm" play mode strips it via `.jx-nofun`.)

| Class | Size/weight/line | Tracking | Use |
|---|---|---|---|
| `.t-display` | 28 / 800 / 1.15 | −0.5px | hero numbers, onboarding |
| `.t-h1` | 24 / 700 / 1.25 | −0.3px | screen titles |
| `.t-h2` | 20 / 700 / 1.3 | 0 | section titles |
| `.t-h3` | 17 / 600 / 1.35 | 0 | card titles |
| `.t-h4` | 15 / 600 / 1.4 | 0 | emphasized body |
| `.t-body` | 15 / 400 / 1.45 | 0 | body |
| `.t-body-sm` | 13 / 400 / 1.4 | 0 | secondary (fg2) |
| `.t-label` | 12 / 500 | 0.1px | form labels (fg2) |
| `.t-label-sm` | 11 / 500 | 0.1px | tiny meta (fg3) |
| `.t-caption` | 10 / 400 | 0 | captions (fg3) |

Bare `h1–h4, p, small` are also mapped to the scale.

---

## 4 · Spacing, radius, elevation

**Spacing** — 4-px grid: `--space-xs 4 · sm 8 · md 16 · lg 24 · xl 32 · xxl 40`.
Screen gutters ≈ 18px, card padding 16px, list gaps 10–12px.

**Radius** — `--r-xs 6 · sm 8 · md 12 · lg 16 · xl 20 · xxl 28 · xxxl 36 · full 9999`.
Cards **20**, inputs **16**, buttons 12/14/20 by size, pills/toggles/avatars **full**.
iPhone frame: bezel 56 / screen 46.

**Shadows** — all tinted warm sand-80 `#2b2926`, never pure black:

| Token | Value | Use |
|---|---|---|
| `shadowCard` | `0 0 0 1px var(--color-cards-border-default), 0 1px 2px …` | **the** card style: hairline ring + whisper |
| `shadowSoft` | `0 6px 18px rgba(46,43,41,.09)` | borderless floating elements |
| `shadowButton` | `0 4px 12px rgba(46,43,41,.16)` | raised buttons |
| `shadowLg` / `shadowXl` | 8/20 · 12/28 | popovers / modals |
| `shadowPrimary` | `0 8px 18px rgba(68,122,175,.34)` | ocean glow under CTAs |
| `shadowDanger` | `0 8px 18px rgba(209,69,50,.34)` | rust glow (SOS) |

> Cards are defined by the crisp hairline + tiny shadow — **not** a big floaty blur.

---

## 5 · Components (`src/core/primitives.jsx` unless noted)

### Icon
lucide-react behind a kebab-case string API. Unknown names render an empty spacer (never crash).
`name` · `size=20` · `color=#2b2926` · `stroke=1.8` (2.2–2.5 for emphasis/active) · `fill='none'`.

### Button
7 variants × 3 sizes; built-in press feedback `scale(0.97)`; `disabled` = opacity .45 + no handler.

| Variant | Fill | Label |
|---|---|---|
| `primary` | ocean + `shadowPrimary` | white |
| `secondary` | ocean-10 | ocean-60 |
| `outline` | transparent + 1.5px border | fg1 |
| `ghost` | transparent | ocean |
| `danger` | rust + `shadowDanger` | white |
| `play` | ocean (battle CTA) | white |
| `gold` | XP gold + gold glow | white |

Sizes: `sm` 9×16/13/r12 · `md` 13×22/15/r14 (default) · `lg` 17×28/17/r20.
Props: `variant, size, icon, disabled, fullWidth, onClick, style`.
Parent app: `<Button variant="primary" style={brandBtn}>` for the magenta CTA.

**Shadow convention (current):** the **child app renders CTAs flat** — pass
`style={{ boxShadow: 'none' }}` on filled buttons (see `CharacterDetail`, `Onboarding`'s
`pBrandBtn`). The primitive still ships its glow as the default, and the **parent app keeps
it** via `brandBtn` / `BRAND.shadowPrimary`.

### Badge
`variant`: `default` (sand) · `primary` (ocean) · `success` (evergreen) · `danger` (rust) ·
`warning` (ember) · `special` (iris) · `gold` (XP). Uses system badge tokens (step-20 bg,
step-70 label) — contrast is guaranteed. Pill radius, 11/800, pair with a 12px `Icon`.

### Input
Focus ring animates `border → accent`; error = rust border + 12px message below.
Props: `label, value, onChange, placeholder, type, icon, error, trailing, accent=THEME.primary`.
Parent app passes `accent={BRAND.ink}`.

### Bar (progress / XP)
`value, max=100, color=THEME.primary, track=THEME.border, height=10, glow`.
Width animates `.6s cubic-bezier(.4,0,.2,1)`.

### Toggle
44×26 pill, 20px knob, `.2s` transitions. `on, onChange`.

### Card (recipe)
```jsx
<div style={{ background: THEME.surface, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard }}>
```

### SectionHead
19/800 title + optional ocean action link with chevron. `title, action, onAction`.

### StatusBar
Fake iOS status bar (9:41 + signal/wifi/battery). `dark` inverts to white.

### ChoiceGroup (`src/parent/shared.jsx`)
Korean-style horizontal radio row: 18px circle radios, accent dot when selected.
`label, value, setter, opts: [value, label][], accent=BRAND.ink`. Labels run through `L()`.

### TabBar (`src/core/nav.jsx`)
86px tall, `rgba(255,255,255,.94)` + 12px blur, top radius 24, top hairline.
- Child: `CHILD_TABS` (home / collect / **center battle button** 62px raised / safety / profile),
  active tint = `accent` (the buddy color). The center button pokes 15px above the bar and draws
  a hairline on the protruding arc only (clipped ring), so the bar's top border appears to
  continue around the notch.
- Parent: `PARENT_TABS` (reports / children / settings), ocean tint.
Tab shape: `{ id, root, icon, label, center?, alt?, disabled? }` — `alt` lists screens that keep the tab lit.

### Child-app shared kit (`src/child/shared.jsx`)

| Component | Props | Notes |
|---|---|---|
| `ScreenHeader` | `title, onBack, right` | sub-screen top bar under the status bar (top 50): 38px round white back button (`shadowCard`), centered 16/800 title, right slot |
| `StatCard` | `icon, color, bg, value, label, big` | stat tile (Home + Profile) — 34px icon well, game-font value |
| `DexProgress` | `have, total, label, icon='sparkles', accent=THEME.gold` | collection completion header; ≤14 entries → one segment per entry, more → continuous `Bar`; faded emblem watermark |
| `RarityPill` | `rarity: 'common'\|'rare'\|'special'` | tiny uppercase pill (dex screens); label runs through `L()` |
| `PointsChip` | `pts` | white pill + gold star; Profile / Decorate headers |
| `Confetti` | `n=14` | celebration burst; absolutely fills a `position:relative; overflow:hidden` parent |
| `screenBgActive()` | — | buddy-tinted screen wash for the active buddy (see §2); `screenBgFor`/`mixHue` themselves live in `core/primitives.jsx` |

### Parent-app shared kit (`src/parent/shared.jsx`)

| Export | Props | Notes |
|---|---|---|
| `ParentHead` | `title, sub, right, onBack` | parent screen header — 12.5px eyebrow `sub`, 24/800 title, optional 34px round back button, `right` slot |
| `RULE_TAG_COLORS` | `Strict \| Balanced \| Relaxed → { c, bg }` | schedule-tag badge palette on system badge tokens (rust / ember / evergreen) |
| `BRAND`, `brandBtn`, `ChoiceGroup` | — | see §2 (color) and §5 (components) |

Other helpers: `shade(hex, amt)` (characters.jsx) lighten/darken used by mascot art;
`getLang()` (i18n.jsx) returns `'en' | 'ko'` for locale-conditional strings.

---

## 6 · Mascots (`src/core/characters.jsx`)

`<Mascot species color size mood stage float />` is a **dispatcher** on the global
`window.JX_CHAR_STYLE` (set once from Tweaks, read at render): `comic` → flat SVG files,
`cute` → 3D PNG renders (plus legacy lines: classic/kr/toon/toy/soft as parametric SVG).

Each style ships its own roster `STYLE_BUDDIES[style] = [[species, name, color], …]` so art,
label and accent always travel together:

| Style | Buddies |
|---|---|
| `comic` | fox·**Hammy** `#4b814f` · cat·Mochi `#e1874a` · bird·Pip `#4f93c4` · owl·Sunny `#e0554a` |
| `cute` | fox·Dino · cat·Axolotl · bird·Giraffe · owl·Pig (colors in `CUTE_COLOR`) |

⚠️ The `fox` species id is legacy — it renders **Hammy the hamster**.
Mascot poses should feel lively/interactive, never stiff & symmetric.

`<MascotChip species color size=48 bg />` — rounded-16 list avatar.
Art files: `/assets/characters/comic/{species}.svg` · `/assets/characters/cute/{species}.png`.

---

## 7 · Motion (`src/styles/joanx.css`)

Springy cubic-beziers (`.34,1.56,.64,1`) for playful entrances; plain ease for loops.
The "calm" play mode adds `.jx-still` (kills float) + `.jx-nofun` (system font) — the
reduced-motion path.

| Class | What | Duration |
|---|---|---|
| `.jx-float` | idle bob (mascots) | 3.2s ∞ |
| `.jx-pulse` | attention ring (SOS/alerts) | 1.6s ∞ |
| `.jx-twinkle` | sparkle loop (stagger via `animation-delay`) | 1.9s ∞ |
| `.jx-skeleton` | loading shimmer | 1.3s ∞ |
| `.jx-pop` | enter with overshoot | .42s |
| `.jx-rise` | slide-up on mount | .4s |
| `.jx-overlay-up` | sheet entrance | .42s |
| `.jx-fade` | soft fade-in | .3s |
| `.jx-gift-pop` / `.jx-burst` / `.jx-drop-in` | reward reveal set | .6/.9/.5s |
| `.jx-press` | hover brightness + active `scale(.9)` | utility |
| `.jx-scan` | QR viewfinder sweep | 2.4s ∞ |

Component-level: Button press `scale(.97)`, Bar width `.6s`, Toggle `.2s`.

---

## 8 · Localization (`src/core/i18n.jsx`)

- English strings are the keys; the dictionary maps EN → KO. Missing keys fall back to EN.
- The shell calls `setLang(lang)` every render (Tweaks → Language); components just call `L('Reports')`.
- Prototype boots in **Korean** (`ko`).
- Never hardcode Korean in components — add the EN key + KO value to the dictionary and use `L()`.

---

## 9 · Assets (`public/` → served at site root, reference as `/assets/…`)

```
/assets/brand/logo-wordmark.svg
/assets/backgrounds/page-bg.jpg          (prototype page background)
/assets/onboarding/intro.png · add-child.png
/assets/characters/comic/{fox|cat|bird|owl|croc|default}.svg
/assets/characters/cute/{fox|cat|bird|owl|croc|default}.png
```

---

## 10 · Related references

- **In-app interactive doc** — topbar → *Design system* (this spec, live)
- **In-app spec checklist** — topbar → *Spec checklist* (feature-coverage audit; written copy `SPEC-CHECKLIST.md`)
- `design/overview.html` — every screen on one pan/zoom canvas
- `design/colors.html` — full color-token gallery
- `design/components.html` — semantic-token component gallery
- `ARCHITECTURE.md` — folder map & app structure · `DOCUMENTATION.md` — functional spec
