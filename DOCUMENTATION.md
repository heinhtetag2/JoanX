# JoanX — Product & Engineering Documentation

> **JoanX** is a mobile app that keeps kids safe while they walk and use their phone.
> When a child is walking *and* looking at their screen, JoanX steps in — gently in **Smart mode**
> (a friendly character nudge + a rewarding game loop) or firmly in **Lite mode** (a full-screen pause).
> Parents get a calm, trustworthy dashboard that shows the habit improving over time.
>
> This repository is the **high-fidelity, clickable design prototype** of JoanX, built on the
> **TripMe Design System**. It is the spec engineers build the production app against — every
> screen, state, interaction, and data shape is represented.

**Repository:** https://github.com/heinhtetag2/JoanX · **Status:** Prototype (design spec) · **Default branch:** `main`

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [What's in this repo](#2-whats-in-this-repo)
3. [How to run, host & deploy](#3-how-to-run-host--deploy)
4. [Phase 1 — Architecture](#phase-1--architecture)
   - [4.1 Feature & screen map](#41-feature--screen-map)
   - [4.2 Reusable components](#42-reusable-components)
   - [4.3 Application architecture](#43-application-architecture)
   - [4.4 Folder structure](#44-folder-structure)
   - [4.5 Navigation structure](#45-navigation-structure)
   - [4.6 State management](#46-state-management)
   - [4.7 API structure](#47-api-structure)
   - [4.8 Data models & TypeScript interfaces](#48-data-models--typescript-interfaces)
   - [4.9 Design system usage](#49-design-system-usage)
5. [Phase 2 — Development plan (per screen)](#phase-2--development-plan-per-screen)
6. [Phase 3 — Implementation notes](#phase-3--implementation-notes)
7. [The character / mascot system](#7-the-character--mascot-system)
8. [Internationalization (EN / 한국어)](#8-internationalization-en--한국어)
9. [Tweaks panel](#9-tweaks-panel)
10. [Open questions & next steps](#10-open-questions--next-steps)

---

## 1. Product overview

| | |
|---|---|
| **Name** | JoanX |
| **Category** | Child safety / digital wellbeing / gamified habit-building |
| **Primary user** | Children (≈ 7–12) |
| **Secondary user** | Parents / guardians |
| **Core problem** | Kids walk while staring at their phones, which is dangerous near roads & crossings |
| **Core mechanic** | Detect *walking + screen use*, intervene at the right moment, reward safe behavior |
| **Platforms** | Android first, iOS later (prototype is mocked in an iOS frame) |
| **Design system** | TripMe (soft sky-blue `#5B9EE1`, rounded, shadow-soft, Lucide icons) |
| **Languages** | English + Korean (한국어), toggleable |

### The two modes

> **Scope note (2026.06.18 revision):** **Lite mode is excluded from the current delivery scope**
> (functional spec F-01, with F-10 full-screen block and F-21 time-based policy). **Smart mode is the
> in-scope mode** and is the app's default. Lite-mode surfaces remain in the prototype for reference
> only and are not part of this revision.

- **Smart mode** *(in scope)* — for older kids who can self-correct. A friendly animal buddy gives a
  *gentle* warning ("Eyes up!"), the child taps to acknowledge, and stopping quickly earns points & XP
  that grow and evolve their character. Positive-reinforcement, never nagging.
- **Lite mode** *(excluded this revision)* — for younger kids. A calm full-screen pause covers the
  phone while walking and lifts the moment they stop. Calls & texts always remain available.

### The reward loop (Smart mode)

```
Walk safely → earn points + XP → character levels up & evolves (3 stages)
→ collect more characters → customize, battle, and unlock rooms → build a daily streak
```

---

## 2. What's in this repo

| Path | What it is |
|---|---|
| **`index.html`** | The clickable prototype. Child app + Parent app, switchable, with a live Tweaks panel. |
| **`design/overview.html`** | A flat pan/zoom canvas showing **every** screen side-by-side for review. |
| **`src/`** | All source modules (see [folder structure](#44-folder-structure)). |
| **`design/`** | Design-reference pages (overview, colors, components galleries). |
| **`screenshots/`** | Reference captures of key screens & states. |
| **`uploads/`** | Misc. pasted/imported assets. |
| **`vercel.json`** | Hosting config (clean URLs + caching). |
| **`README.md`** | Quick-start + deploy steps. |
| **`DOCUMENTATION.md`** | This file. |

> The app is built with **Vite + React 18** (JSX compiled ahead of time; icons via `lucide-react`).
> Run it with `npm install && npm run dev`; ship it with `npm run build`. See `ARCHITECTURE.md`.

---

## 3. How to run, host & deploy

### Run locally
Vite + React:

```bash
npm install
npm run dev       # → http://localhost:5173/
npm run build     # production build → dist/
npm run preview   # serve the build locally
```

### Deploy to Vercel
1. Push the project to a GitHub repo (already at the URL above).
2. In Vercel: **Add New → Project → import the repo**.
3. Vercel auto-detects **Vite** (Build = `npm run build`, Output = `dist`). Defaults are correct.
4. **Deploy.** Every `git push` auto-redeploys.

---

# Phase 1 — Architecture

## 4.1 Feature & screen map

### Child app

| # | Screen | Component | Purpose |
|---|--------|-----------|---------|
| 1 | Onboarding | `Onboarding` | Intro → pick mode → grant permissions |
| 2 | Home | `ChildHome` | Buddy hero, safety status, points/streak, daily goal, wins |
| 3 | Safety status | `SafetyStatus` | Live protection state, sensors, nearby danger zones |
| 4 | Warning overlay | `WarningOverlay` | The Smart-mode intervention (3 style variants) |
| 5 | Reward toast | `RewardToast` | "Nice save!" celebration after acknowledging a warning |
| 6 | Lite block | `LiteBlock` | Full-screen pause for younger kids |
| 7 | Collection House | `Collection` | Rooms + shelves of collected buddies |
| 8 | Character detail | `CharacterDetail` | Evolve, recolor, items, traits, set as buddy |
| 9 | Battle | `Battle` | Auto-match buddy battles (select → match → result) |
| 10 | Rewards | `Rewards` | Streak calendar, daily claim, achievements |
| 11 | Shop | `Shop` | Spend coins on items/characters |
| 12 | Notifications | `Notifications` | Activity feed (the badge count on Home) |
| 13 | Profile & settings | `Profile` | Language, sound, haptics, notifications, mode, help, about |

### Parent app

| # | Screen | Component | Purpose |
|---|--------|-----------|---------|
| 1 | Reports dashboard | `ParentReports` | Improvement trend, acceptance, reaction breakdown, insight |
| 2 | Rules & settings | `ParentSettings` | Mode, app blocks, schedules, warning sensitivity, prefs |
| 3 | Children & devices | `ParentChildren` | Per-child status, battery, mode, privacy note |

## 4.2 Reusable components

The **design-system layer** lives in **`src/core/primitives.jsx`** and imported by feature modules. These are
the only source of colors, type, spacing, and shared UI:

**Exported from `primitives.jsx`:** `THEME`, `RARITY`, `Icon`, `Button`, `Badge`, `Card`, `Input`,
`Bar`, `Toggle`, `StatusBar`, `SectionHead`.

| Component | Role |
|---|---|
| `Icon` | Lucide icon wrapper (size / color / stroke / fill) |
| `Button` | `primary · secondary · outline · danger · ghost · play · gold` × `sm · md · lg` |
| `Badge` | `default · primary · success · danger · warning · gold · special` |
| `Card` | White, 20px radius, soft shadow |
| `Input` | Labeled field with icon, focus & error states |
| `Bar` | Progress / XP bar (with optional glow) |
| `Toggle` | iOS-style switch |
| `StatusBar` | iOS status bar (time, signal, wifi, battery) |
| `SectionHead` | Section title + optional "see all" action |

**Defined alongside their feature modules** (ES module exports):

| Component | Home module | Role |
|---|---|---|
| `Mascot` / `MascotChip` | `characters.jsx` | The parametric character (see §7) |
| `TabBar` | `nav.jsx` | Bottom tab bar with the raised center **Battle** button; Safety is a standard tab |
| `ScreenHeader` | screen modules | Pushed-screen nav bar (back ‹ · centered title · right action) |
| `Confetti` / `RewardToast` | `SafetyMoments.jsx` | Celebration effects |

## 4.3 Application architecture

```
┌──────────────────────────────────────────────────────┐
│  App shell (App.jsx)                                   │
│  • role: child | parent      • onboarded?              │
│  • screen router + nav stack  • mode: smart | lite     │
│  • overlay state (warning / lite block)                │
│  • tweaks state                                        │
└───────────────┬───────────────────────┬───────────────┘
                │                        │
        ┌───────▼───────┐        ┌───────▼────────┐
        │  Child app    │        │  Parent app    │
        │  CHILD_TABS   │        │  PARENT_TABS   │
        └───────────────┘        └────────────────┘
```

- **Presentational components** receive a `ctx` object (navigation + mode + tweaks + actions).
- **Mock data** (`data.jsx`) stands in for API responses — swap for real endpoints in production.
- **Design-system primitives** are the only source of colors, type, spacing, and components.

## 4.4 Folder structure

```
/
├── index.html                          # Prototype entry (loads all app/*.jsx)
├── design/overview.html                       # Flat screen-overview canvas
├── vercel.json                         # Static hosting config
├── README.md
├── DOCUMENTATION.md                    # This file
├── screenshots/                        # Reference captures
├── uploads/                            # Misc imported assets
└── app/
    ├── tripme-tokens.css   # TripMe design tokens (colors, type, spacing, radii, shadows)
    ├── joanx.css           # App styles + keyframe animations + Fredoka import
    ├── primitives.jsx      # THEME, RARITY + reusable UI components
    ├── characters.jsx      # Mascot system (fox/cat/bird, stages, moods)
    ├── data.jsx            # Mock data (PLAYER, CHARACTERS, ROOMS, metrics…)
    ├── i18n.jsx            # L() helper + EN/KO strings
    ├── nav.jsx             # Tab definitions + TabBar
    ├── ChildScreens.jsx    # Onboarding, Home, Safety, Notifications, Profile
    ├── SafetyMoments.jsx   # Warning overlay (3 variants) + Lite block + reward
    ├── GameScreens.jsx     # Collection House + Character detail
    ├── GameScreens2.jsx    # Battle + Rewards + Shop
    ├── ParentScreens.jsx   # Reports + Settings + Children
    ├── App.jsx             # Shell: iOS frame, router, tweaks panel
    ├── Overview.jsx        # Builds the flat overview canvas
    └── design-canvas.jsx   # Canvas component for design/overview.html
```

### Suggested **production** structure (React Native / Expo, mirroring TripMe)
```
src/
├── app/                    # expo-router routes
│   ├── (child)/            # home, safety, collection, battle, rewards, shop…
│   ├── (parent)/           # reports, rules, children
│   └── (auth)/             # onboarding, pairing
├── components/
│   ├── ui/                 # design-system primitives (Button, Card, Bar…)
│   ├── mascot/             # Mascot, evolution, accessories
│   └── safety/             # WarningOverlay, LiteBlock, RewardToast
├── features/               # collection, battle, rewards, reports (logic + hooks)
├── stores/                 # zustand stores (see §4.6)
├── api/                    # query/mutation hooks (see §4.7)
├── constants/theme.ts      # design tokens (TripMe source of truth)
├── i18n/                   # locale strings
└── types/                  # shared TS interfaces (see §4.8)
```

## 4.5 Navigation structure

- **Child tab bar** (`CHILD_TABS`): `Home · Collect · [Battle ⚔ raised center] · Safety · Rewards`
- **Parent tab bar** (`PARENT_TABS`): `Reports · Children · Rules`

Notes:
- The **raised center button** is **Battle** (TripMe's signature raised-center motif); **Safety** is a standard labelled tab.
- **Tab roots** (Home, Collection, Battle, Rewards, Safety) are top-level destinations.
- **Pushed screens** (Character detail, Notifications, Shop, Profile…) get a `ScreenHeader` with a
  back chevron top-left; **back always lands somewhere sensible** (pops the stack, or falls back to
  Home if the stack is empty).
- Overlays (warning, lite block) render **above** the tab bar and current screen.

```
nav(screen, params)   → push current onto stack, go to screen
back()                → pop stack (or fall back to Home)
tabTo(root)           → clear stack, switch tab
```

## 4.6 State management

The prototype uses **local React state** in `App.jsx`. For production, the recommendation (matching
TripMe's stack) is **zustand** stores + **@tanstack/react-query** for server state:

| Store | Holds |
|---|---|
| `useAuthStore` | session, paired child/parent identity |
| `useModeStore` | `mode: 'smart' \| 'lite'`, sensitivity, schedules |
| `usePlayerStore` | points, coins, streak, level, active character |
| `useSafetyStore` | live protection status, sensor health, nearby danger zones |
| `useUIStore` | active overlay, language, sound/haptics prefs |

Server state (characters, achievements, reports, children) goes through react-query with optimistic
updates for actions like *claim reward*, *evolve*, and *set buddy*.

## 4.7 API structure

REST-style endpoints the screens imply (request/response shapes use the [interfaces below](#48-data-models--typescript-interfaces)):

| Method & path | Purpose |
|---|---|
| `POST /auth/pair` | Pair a child device to a parent account |
| `GET /me/player` | Player profile (points, coins, streak, level, active char) |
| `GET /characters` | Owned + collectible characters |
| `PATCH /characters/:id` | Evolve / recolor / equip items |
| `POST /player/active-character` | Set active buddy |
| `GET /rooms` | Collection-house rooms & placements |
| `GET /achievements` | Achievement progress |
| `POST /rewards/daily/claim` | Claim daily reward → returns points/coins delta |
| `POST /battles` | Start an auto-matched battle → returns result |
| `GET /safety/status` | Live protection state + sensor health |
| `GET /safety/zones?lat&lng` | Nearby danger zones |
| `POST /events/reaction` | Log a warning reaction (immediate/delayed/ignored) |
| `GET /parent/children` | Children + device status |
| `GET /parent/reports?childId&range` | Metrics + trend + reaction breakdown |
| `PATCH /parent/rules/:childId` | Mode, blocks, schedules, sensitivity |
| `GET /shop/items` / `POST /shop/purchase` | Shop catalog & buying |
| `GET /notifications` | Activity feed |

**Realtime:** safety status, warnings, and child↔parent updates should use a socket / push channel
(the warning intervention is time-critical). Warnings are also written to `POST /events/reaction`
so the parent report can compute acceptance & response time.

## 4.8 Data models & TypeScript interfaces

These mirror `src/core/data.jsx`. Use them as the contract between client and API.

```ts
// ---- Player ----
interface Player {
  name: string;
  age: number;
  points: number;            // "Safe points"
  coins: number;
  streak: number;            // consecutive safe days
  level: number;
  xp: number;
  xpMax: number;
  safeMinutesToday: number;
  safeWalkGoal: number;
  activeCharId: string;
}

// ---- Characters ----
type Species = 'fox' | 'cat' | 'bird';
type Rarity  = 'common' | 'rare' | 'special';
type Stage   = 1 | 2 | 3;   // baby → scarf → guardian (cape + shield)

interface CharacterTraits { guard: number; speed: number; heart: number; } // 0–100

interface Character {
  id: string;
  species: Species;
  name: string;
  color: string;             // hex; user-customizable
  stage: Stage;
  rarity: Rarity;
  level: number;
  xp: number;
  xpMax: number;
  owned: boolean;
  locked?: string;           // unlock requirement text when !owned
  room: string | null;       // room id this buddy is placed in
  traits: CharacterTraits;
}

// ---- Collection ----
interface Room {
  id: string;
  name: string;
  unlocked: boolean;
  slots: number;
  theme: string;             // tint hex
  req?: string;              // unlock requirement when locked
}

// ---- Achievements ----
interface Achievement {
  id: string;
  icon: string;              // lucide name
  name: string;
  desc: string;
  done: boolean;
  progress?: number;
  total?: number;
  reward: number;            // points
}

// ---- Safety & events ----
type Mode = 'smart' | 'lite';
type ReactionType = 'immediate' | 'delayed' | 'ignored';

interface DangerZone { id: string; lat: number; lng: number; severity: 'low'|'medium'|'high'; label: string; }

interface ReactionEvent {
  id: string;
  childId: string;
  at: string;                // ISO timestamp
  type: ReactionType;
  responseSeconds: number;
  near?: string;             // place label
}

// ---- Parent ----
interface ParentMetrics {
  riskReduction: number;     // % fewer risk events vs first week
  acceptance: number;        // % of warnings accepted (stopped)
  safeWalkMin: number;       // total safe-walking minutes this week
  avgResponse: number;       // avg seconds to stop
}

interface ReactionDay { day: string; immediate: number; delayed: number; ignored: number; }

interface Child {
  id: string;
  name: string;
  age: number;
  mode: Mode;
  device: string;
  battery: number;
  online: boolean;
  lastSeen: string;
  avatar: Species;
  color: string;
}

// ---- Rules ----
interface AppCategory { id: string; name: string; icon: string; blocked: boolean; locked?: boolean; }
interface Permission  { id: string; icon: string; name: string; why: string; required: boolean; }
interface Schedule    { id: string; title: string; when: string; level: 'strict'|'balanced'|'relaxed'; }
```

> **Sample data reference** (from `data.jsx`): the active player is **Mina, 11** (1,240 pts, streak 5,
> level 7); her active buddy is **`c3` — Pip the pink bird** (`#F49CBA`, stage 1). Parent metrics show
> **41%** risk reduction, **88%** acceptance, **312** safe-walk minutes, **2.4s** avg response.

## 4.9 Design system usage

JoanX is built **entirely on the TripMe design system** with a small, additive "game layer":

- **Inherited from TripMe** — primary sky-blue `#5B9EE1` (+ `primaryLight`, `primaryDark`), status
  colors, the text ramp (`#1E1E2D → #7D848D → #B8B8C7`), category accents, 4-based spacing, the radii
  system (cards 20, inputs 16, sheets 36), the single grey-blue shadow + colored-glow CTA pattern,
  Lucide icons, and the raised-center tab-bar motif.
- **Added for the game (still TripMe-derived)** — `gold` (XP/points), rarity tints
  (`common` / `rare` / `special`), a warm `joy` accent, and a rounded display font (**Fredoka**) used
  **only** for kid-facing game headings (`.game-font`). Parent screens stay in the system font for a
  trustworthy register.
- **Token source:** `src/styles/tripme-tokens.css` (≈ **64** `--*` custom properties) + the `THEME` object in
  `primitives.jsx`. No colors are invented outside this system.

---

# Phase 2 — Development plan (per screen)

Format per screen: **purpose · user goals · business rules · components · API · validation ·
loading · empty · error · edge cases**.

### Onboarding (`Onboarding`)
- **Purpose:** Get the child set up: explain the value, pick a mode, grant permissions.
- **User goals:** Understand what the app does; start fast.
- **Business rules:** Mode is normally set by the parent (changeable later in the parent app);
  required permissions = Motion, Notifications, Screen Time; Location is optional (Smart only).
- **Components:** progress dots, `Mascot`, mode cards, permission rows w/ `Toggle`, `Button`.
- **API:** `POST /auth/pair`, `PATCH /parent/rules` (mode).
- **Validation:** at least the required permissions acknowledged before finishing.
- **Loading:** spinner on "Finish setup" while pairing.
- **Empty:** n/a.
- **Error:** pairing failed → inline retry; permission denied → explain the feature turns off but app still works.
- **Edge cases:** permissions denied at OS level; re-onboarding an already-paired device.

### Home (`ChildHome`)
- **Purpose:** The child's daily hub — buddy, safety state, progress, motivation.
- **User goals:** See my buddy, my points/streak, today's goal, jump into play.
- **Business rules:** Hero shows the **active** character at its real stage/level/color; banner
  reflects current mode (green = Smart protected, amber = Lite); daily goal drives a bonus.
- **Components:** header (coins, notif bell w/ badge), safety banner, character hero + XP `Bar`,
  `StatCard`×2, daily-goal card, quick tiles, wins list.
- **API:** `GET /me/player`, `GET /characters`, `GET /safety/status`, `GET /notifications` (count).
- **Loading:** skeletons on hero + stat cards.
- **Empty:** new user → "Start walking to earn your first points."
- **Error:** status unavailable → banner shows "Reconnecting…".
- **Edge cases:** no active character set; offline; very large numbers (format with separators).

### Safety status (`SafetyStatus`)
- **Purpose:** Reassure the child that protection is active; show what's watched.
- **User goals:** Confirm I'm protected; preview what a warning looks like.
- **Business rules:** Smart shows danger zones + GPS-while-walking; Lite shows no-GPS; only warns
  when walking *toward* a risk, never for passing by.
- **Components:** pulsing status ring, mode/sensor cards, faux danger-zone map.
- **API:** `GET /safety/status`, `GET /safety/zones`.
- **Loading:** ring placeholder. **Empty:** no nearby zones → "All clear nearby."
- **Error:** sensors unavailable → amber "Check permissions" card.
- **Edge cases:** GPS off in Smart; motion permission revoked.

### Warning overlay (`WarningOverlay`) — *the core moment*
- **Purpose:** Intervene gently when walking + screen use is detected.
- **User goals:** Notice quickly, look up, get rewarded.
- **Business rules:** One gentle buzz; auto-dismiss (no nagging); fast stop = bonus; logs a
  `ReactionEvent`. Three style variants: **Sheet** (default), **Spotlight**, **Banner**.
- **Components:** dimmed backdrop, `Mascot` (alert mood), message, acknowledge `Button`, cooldown `Bar`, `RewardToast`.
- **API:** `POST /events/reaction`.
- **Loading:** none (must be instant).
- **Edge cases:** child ignores → escalate per sensitivity; repeated triggers throttled; reduced-motion users.

### Lite block (`LiteBlock`)
- **Purpose:** Hard pause for younger kids while walking.
- **Business rules:** Calls & texts always allowed; unlocks on stopping; no points/game.
- **Components:** full-screen blue scene, `Mascot`, shield, countdown `Bar`.
- **Edge cases:** emergency access; long walks; iOS cannot truly "block" (see §10).

### Collection House (`Collection`)
- **Purpose:** Show collected buddies arranged in unlockable rooms.
- **Business rules:** Rooms unlock by milestones; locked characters show requirement; tapping an
  owned buddy → detail.
- **Components:** `ScreenHeader` (back ‹ · title · gem count), room shelves, "all buddies" grid.
- **API:** `GET /rooms`, `GET /characters`.
- **Empty:** new player → only starter buddy. **Error:** load fail → retry.
- **Edge cases:** all rooms full; recently-unlocked highlight.

### Character detail (`CharacterDetail`)
- **Purpose:** Inspect, evolve, recolor, equip, and set the active buddy.
- **Business rules:** Evolve enabled only at ≥ 60% XP and stage < 3; evolving raises **stage and
  level**; "Set as my buddy" persists stage/level/color and makes it active on Home.
- **Components:** hero, evolve `Button`, traits `Bar`s, color swatches, item grid, set-buddy `Button`, evolve celebration.
- **API:** `PATCH /characters/:id`, `POST /player/active-character`.
- **Validation:** can't evolve past stage 3 / below XP threshold (button disabled + reason).
- **Edge cases:** locked items; max stage; offline edit → queue + optimistic UI.

### Battle (`Battle`)
- **Purpose:** Light competitive loop using character traits.
- **Business rules:** Daily battle limit; matched within ±3 levels; **battles pause while walking**;
  win/lose both award points (trying still rewarded).
- **Components:** fighter card, buddy selector, matching screen, versus, result + confetti.
- **API:** `POST /battles`.
- **Loading:** "Finding opponent…". **Edge:** no battles left; opponent timeout; walking mid-battle.

### Rewards (`Rewards`)
- **Purpose:** Reinforce the streak and surface goals.
- **Business rules:** Daily reward claimable once/day; streak milestones unlock special characters;
  achievements grant points.
- **Components:** streak calendar, daily-claim card (→ celebration, then "Claimed" state), achievement list w/ progress.
- **API:** `GET /achievements`, `POST /rewards/daily/claim`.
- **Edge cases:** already claimed; streak broken; timezone rollover.

### Shop (`Shop`)
- **Purpose:** Spend coins on items / characters.
- **Business rules:** Price gating; insufficient coins disables buy; owned items hidden/marked.
- **API:** `GET /shop/items`, `POST /shop/purchase`.
- **Error:** purchase fails → refund coins + toast. **Edge:** price changes; sold-out.

### Notifications (`Notifications`)
- **Purpose:** Activity feed (the Home bell badge).
- **Empty:** "You're all caught up." **Edge:** mark-all-read; deep-link into a screen.

### Profile & settings (`Profile`)
- **Purpose:** Child-side preferences.
- **Business rules:** Protection mode is **parent-managed** (read-only here); language toggles EN/KO.
- **Components:** profile header, preference rows (`Toggle`), account rows, sign-out.

### Parent — Reports (`ParentReports`)
- **Purpose:** Show the habit improving — trends, not surveillance counts.
- **Business rules:** Lead metric = risk-reduction %; show acceptance, safe minutes, avg response;
  reaction breakdown stacked by day; plain-language insight.
- **API:** `GET /parent/reports?childId&range`.
- **Loading:** chart skeletons. **Empty:** < 1 week data → "Gathering this week's data."
- **Edge cases:** multiple children (child switcher); no events yet.

### Parent — Rules & settings (`ParentSettings`)
- **Purpose:** Configure protection per child.
- **Business rules:** Mode switch (Smart/Lite) changes the rest of the form; Lite → app-block list;
  Smart → warning sensitivity; schedules with strictness; phone/texts always allowed.
- **API:** `PATCH /parent/rules/:childId`.
- **Validation:** at least one safe window; can't block calls/texts.
- **Edge cases:** schedule overlaps; geofence (home Wi-Fi) relaxed rule.

### Parent — Children & devices (`ParentChildren`)
- **Purpose:** Manage paired children & device health.
- **Components:** per-child card (status dot, mode badge, battery, last-seen), add-child, privacy note.
- **API:** `GET /parent/children`, `POST /auth/pair`.
- **Empty:** no children → "Add your first child." **Edge:** offline device; low-battery warning.

---

# Phase 3 — Implementation notes

- **Stack target:** React + TypeScript + Tailwind (web) **or** Expo / React Native + the TripMe
  `theme.ts` tokens (mobile, matching the existing TripMe codebase). The prototype is framework-light
  (React + inline styles from the `THEME` object) precisely so it maps cleanly to either.
- **Mobile-first & responsive:** the prototype renders inside a 390×844 iOS frame and **auto-scales**
  to fit any viewport (the shell computes a `scale` transform). Layouts use flex/grid with `gap`.
- **Accessibility:** semantic buttons, `aria-label` on icon-only controls (e.g. back button), 44px+
  hit targets, color contrast from the TripMe ramp, and all entrance animations gated so reduced-motion
  / print / PDF show the resting state (never a pre-animation blank).
- **Error / loading / empty states:** every data-backed screen has them documented above; the
  prototype demonstrates the happy path + key celebratory and blocked states.
- **Clean architecture:** presentational components + a `ctx` action object; swap `data.jsx` for the
  API layer (§4.7) without touching screens.
- **Animations:** defined as keyframes in `joanx.css` (`float`, `pop`, `rise`, `overlay-up`, `fade`,
  `pulse`, `ring`, `confetti`) — subtle and functional, per TripMe's motion guidance.
- **Production build note:** now built with Vite (a native mobile port would use Expo/React Native). JSX is pre-compiled,
  tree-shake, and bundle the mascot SVGs.

---

## 7. The character / mascot system

Defined in **`src/core/characters.jsx`** — a single parametric `<Mascot>` component, drawn as inline SVG
so it scales crisply and recolors freely.

- **Species:** `fox` (**Foxy**, base `#FF8C66`), `cat` (**Mochi**, base `#9AA7D6`), `bird` (**Pip**,
  base `#5CC9A7`) — distinct ears, tails, and face features (snout / whiskers / beak).
- **Evolution stages:** `1` baby (bigger head ratio, sparkle flecks) → `2` adds a safety **scarf** →
  `3` adds a **guardian cape + gold shield badge** (and gold flecks). Evolving also raises the
  character's level. Body scale grows ~0.82 → 1.0 → 1.06 across stages.
- **Moods:** `happy` (default), `alert` (wider eyes, used in warnings), `sleepy` (closed eyes).
- **Color:** any hex; shading is derived automatically (`shade()` makes a darker outline + lighter belly).
- **Rarity:** `common · rare · special`, each with its own tint used on badges.
- **`MascotChip`** is the compact avatar variant for lists and the parent app.

The default buddy is **Pip the (pink) bird** (`c3`, recolored `#F49CBA`). Everything is
live-tweakable (see §9).

---

## 8. Internationalization (EN / 한국어)

Defined in **`src/core/i18n.jsx`**:

- `L('English string')` returns the Korean translation when the language is `ko`, else the original.
- Language is toggled from the Tweaks panel and from the child **Profile** screen.
- Korean follows TripMe's polite register (존댓말). Add new strings to the `KO` map keyed by their
  English source — untranslated keys fall back to English automatically.

---

## 9. Tweaks panel

The prototype includes a live **Tweaks** panel (gear icon, top of the page) for design review:

| Tweak | Options |
|---|---|
| Language | English · 한국어 |
| Mode | Smart · Lite |
| Preview safety moment | Trigger a warning / block on demand |
| Warning style | Sheet · Spotlight · Banner |
| Buddy species | Fox · Cat · Bird |
| Buddy color | 6 swatches |
| Evolution stage | 1 · 2 · 3 |
| Playfulness | Calm · Playful · Max |
| Flow | Replay onboarding |

It also hosts the **Child app / Parent app** switcher so reviewers can see both products in one place.

---

## 10. Open questions & next steps

Decisions still needed from stakeholders before production design locks:

1. **iOS feasibility of Lite "block."** iOS cannot truly block apps the way Android can; the iOS Lite
   experience would be a *warning-only* variant. Confirm scope.
2. **Danger-zone data source.** Where do crossings / busy-road zones come from (map provider, manual,
   community)?
3. **Reward economy.** Exact XP per safe-minute, point values, coin pricing, streak → character rules.
4. **Character art.** How many characters at launch; final art (the prototype's SVG buddies are
   placeholders that establish style, evolution, and recolor behavior).
5. **Realtime transport.** Push vs. socket for the time-critical warning + parent updates.
6. **Privacy/compliance.** Child-data handling (COPPA / GDPR-K), location retention, parental consent flows.

### Suggested next build steps
- Add the documented **loading / empty / error** states visually to each screen.
- Mock the **iOS warning-only Lite** variant.
- Add **child↔parent pairing** flow screens.
- Wire `data.jsx` to a real mock API server to demo async states.
