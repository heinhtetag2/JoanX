# JoanX — Spec coverage checklist

Audit of `JoanX_Functional_Spec_2026-06-18_EN.md` against the built screens.
Interactive version: the **Spec checklist** tab in the app shell (`?view=checklist`).
Source of truth for the tab: `src/docs/SpecChecklist.jsx` — update both together.

Status legend: ✅ Done · 🔧 Needs work · ❌ Not built · ⚙️ Engine/no UI · 🚫 Excluded (2026-06-18 revision)

## 1 · Detection · Core Engine

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-01 | Operating mode (Lite) | 🚫 | `LiteBlock.jsx` | Excluded, but already designed — keep parked |
| F-02 | Operating mode (Smart) | ✅ | `WarningOverlay` `ChildHome` `SafetyStatus` | The whole child app is the Smart loop |
| F-03 | Walk detection | ⚙️ | — | Engine; walking state surfaced on Home |
| F-04 | Risky-behavior event | ⚙️ | — | Engine trigger behind the warning overlay |
| F-05 | Danger-zone algorithm | 🚫 | — | Location family excluded |
| F-06 | GNSS correction | 🚫 | — | Location family excluded |
| F-30 | Walk-detection tuning period | ⚙️ | — | PoC process item |

## 2 · Intervention · UX

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-07 | Grace-period handling (10 s) | ⚙️ | — | Timing logic; optional pre-warning countdown design |
| F-08 | Staged intervention UX | 🔧 | `WarningOverlay` | 3 warning styles exist; the vibration → warning → character-message escalation isn't storyboarded |
| F-08.1 | Warning display condition (2 s hold after the buzz) | ✅ | `WarningOverlay` | `BUZZ_HOLD_MS = 2000`; stopping inside the window skips the warning and closes as a self-correction |
| F-08.2 | Dismiss ("Got it!") → 5 s cooldown → re-intervene | ✅ | `WarningOverlay` | `INTERVENTION.recheckSeconds` = 5 (server-configurable, pilot-tunable); silent for the same hazard, then re-assess → buzz → overlay only if the risk persists |
| F-08.3 | Progressive tone + event logging | ✅ | `WarningOverlay` | `INTERVENTION.tiers` gentle → firm → urgent; `logRiskEvent()` records immediate / delayed / ignored for F-13/F-14 and F-20. No screen block (F-10 out of MVP) |
| F-08.4 | Safe-state confirmation (anti-flicker) | ✅ | `WarningOverlay` | `INTERVENTION.safeConfirmSeconds` = 1 (pilot-tunable); escalation freezes on the first safe reading, overlay comes down only once safe holds |
| F-09 | Character message (1.5 s toast) | ✅ | `WarningOverlay` | `CharMessageToast` — bottom-center ~20% height, up for `messageSeconds`, min `messageGapSeconds` between messages, only while the risk is live |
| F-09.1 | Message rotation (anti-fatigue) | ✅ | `WarningOverlay` | `INTERVENTION.messages` pool per tone tier; no back-to-back repeat, each round starts at a different offset |
| F-09.2 | Configurable message timing | ✅ | — | `INTERVENTION.messageSeconds` / `.messageGapSeconds` — server-configurable, retunable from pilot results |
| F-10 | Full-screen block (Lite) | 🚫 | `LiteBlock.jsx` | Built ahead of scope — parked |
| F-11 | Overlay warning (Smart) | ✅ | `WarningOverlay` | Sheet / spotlight / banner variants |
| F-12 | User-response classification | ⚙️ | — | Surfaces in parent metrics (F-20) |

## 3 · Gamification · Rewards

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-13 | Points · XP growth | ✅ | `ChildHome` `Rewards` `CharacterDetail` | Criteria in `POINTS` (data.jsx), spec A-1.1; server-configurable |
| A-1.2 | Point → EXP conversion | ✅ | `Shop` `data.jsx` | 5 pt = 1 EXP via `EXCHANGE.pointsPerXp`; `setExchange(remote)` retunes the ratio, bad/missing fields fall back to `EXCHANGE_DEFAULTS` (a 0 ratio is rejected — it would make EXP free). Points stay the child's to allocate: EXP, eggs, outfits or decor. `convertPointsToXp()` refuses to overshoot the level cap (`xpToCap`), so no point is ever spent on EXP with nowhere to land |
| F-14 | Daily accident-free reward | ✅ | `Rewards` | +100 daily · +300 at 7d · Special Egg at 30d |
| F-15 | Character acquisition · rarity | ✅ | `Collection` `Shop` `Onboarding` | Egg flow: buy/starter egg → tap or shake → hatch → random char, duplicates→XP. Grades Common/Rare/Epic |
| F-15.1 | MVP roster 15 (8/5/2) + extensible | ✅ | `data.jsx` | `CHARACTERS` = 8 Common · 5 Rare · 2 Epic, each tagged `set: 'mvp'`; `RARITIES` is a list, so a new tier or a seasonal/event set is data, not a code change |
| F-15.2 | Epics hidden until unlocked | ✅ | `CharacterDex` `Collection` | `visibleCharacters()` gates every roster surface — hidden Epics have no slot, no silhouette, and are out of the totals; hatching one reveals it |
| F-16 | Character evolution (3 stages) | ✅ | `CharacterDetail` | Automatic — see A-3.3. There is no manual "Evolve" action any more |
| A-3.3 | Stage = f(Level) · presentation only | ✅ | `data.jsx` `CharacterVariants` `Battle` | Stage 1 Lv.1–3 · Stage 2 Lv.4–7 · Stage 3 Lv.8–10, from the `STAGES` table; `setStages(remote)` retunes the thresholds and re-derives every buddy on the spot. Stage is DERIVED from level (`stageForLevel`), never authored — `gainXp` re-derives it on every level-up, so a buddy that crosses Lv.4 in a battle transforms there and then. A stage grants **no stats**: `statsFor` has no stage term, so crossing a threshold is a costume change (art · animation · expression · dialogue, all from the same table), not a power spike. The four core stats (HP · Courage · Protection · Speed) grow from rarity + level only |
| A-3.1 | EXP curve | ✅ | `data.jsx` | Per-level table — Lv1→2 100 · 120 · 150 · 180 · 220 · 270 · 330 · 400 · Lv9→10 480. `XP_CURVE` is a settings object, not a formula: `setXpCurve(remote)` retunes the whole ladder and re-derives every bar; bad/missing fields fall back to `XP_CURVE_DEFAULTS`. `xpMax` derived, never authored |
| A-3.2 | Max level Lv.10 + core loop | ✅ | `data.jsx` `ChildHome` | `XP_CURVE.maxLevel` (server-settable); `xpForLevel()` returns null at cap; `c.maxed` flag; `growth` extends the curve if a future update raises the cap past the table; hatch new eggs to keep growing |
| F-17 | Character customization | ✅ | `Shop` `CharacterDetail` | No stat effects |
| F-18 | Collection House (≥3 rooms) | ✅ | `MyHouse` | 4 rooms, 2 condition-locked |
| F-19 | Battle system (PvE, 1/day) | ✅ | `Battle` | Score-based, no real-time controls. **Walking closes the battle screen** (`canChallenge` → `reason: 'walking'`, driven by `PLAYER.walking`): the gate sits above the layout switch, so every battle layout is covered by one rule, and it replaces the screen rather than disabling a button — a villain card with an ability and a win chance is exactly what a child would stand and read at a kerb. Toggle it from Tweaks → App states → **Walking** |
| A-2.3 | Egg hatching — free, no second currency | ✅ | `Shop` `data.jsx` | Buying an egg **grants the egg** (`buyEgg` → `PLAYER.eggs`); hatching it is a separate, free act (`hatchFromInventory`) that costs the egg and nothing else — no power, no energy, no additional currency. They used to be one step: buying deducted the points and threw you into the hatch overlay without the egg ever entering the bag, so a purchased egg was never owned and an abandoned hatch took the points **and** the egg. The reveal is now atomic — the egg is spent, the tier rolled from the egg's own odds (`rollRarity`, unchanged policy) and the character granted in one call — and the crack is latched, so a tap racing the shake gesture can't hatch twice |
| F-32 | Friend visit · likes · guestbook | ✅ | `Friends` `FriendHouse` `AddFriends` | No chat/real-time |

## 4 · Guardian (Parent)

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-33 | Guardian sign-in (phone + SMS) | ✅ | `ParentOnboarding` | Phone → 6-digit SMS code → profile (new accounts only). No password anywhere, so no reset flow |
| F-33.1 | Google (Android) / Apple (iOS) · email excluded | ✅ | `ParentOnboarding` `data.jsx` | `AUTH.methods` + `authMethods(platform)`; email is `enabled: false`, not absent — flip the flag to add it later |
| A-13 | Parent ↔ child link, visible from both sides | ✅ | `Profile` `ParentAddChild` `data.jsx` | One `LINK` record joins the two apps (`PLAYER.childId` → `CHILDREN`), replacing two half-models of the same pairing. The child's own settings now show **who** they are linked to, since when, and — via `PARENT_SEES` — exactly what that parent can and cannot see (walking time, warnings, points, blocked app types = shared; location, messages/guestbook, photos = private). Unlinking is deliberately parent-only: a child who could quietly disconnect would make the product a promise the parent cannot rely on |
| F-20 | Guardian report metrics | 🔧 | `ParentReports` | Reframe "Risky moments" count as a risky-behavior **reduction rate** |
| F-21 | Time-based policy settings | 🚫 | `ParentSchedule` | Built ahead of scope — parked |
| F-22 | Intervention-intensity settings | ✅ | `ParentSettings` | Sensitivity, notifications, game toggle |
| F-31 | AI parent report | ✅ | `ParentAIReport` | |

## 5 · Data · Processing

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-23 | Local event storage | ⚙️ | — | |
| F-24 | Event transmission API | ⚙️ | — | |
| F-25 | Dynamic Risk Score | ⚙️ | — | |
| F-26 | Staged permissions & fallback | 🔧 | `Onboarding` | Staged guide done; **denied/fallback state** not designed |

## 6 · Platform · System

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-27 | Android-only implementation | ⚙️ | — | |
| F-28 | Background restoration | ⚙️ | — | |
| F-29 | Logging · debugging | ⚙️ | — | |

## Appendix A · Game system checkpoints

| ID | Checkpoint | Status | Screens | Note |
|----|-----------|--------|---------|------|
| A-2 | Egg acquisition (points → egg → hatch) | ✅ | `Shop` `Onboarding` `EggHatch` | Shared motif in `EggHatch.jsx`; tap or shake to hatch; duplicates→XP |
| A-2.1 | Egg purchase · price + eligibility | ✅ | `Shop` | Common 500 · Rare 1,500 (Lv.5+) · Epic reward-only. Config in `EGGS` (data.jsx); server-configurable |
| A-4 | Character encyclopedia | ✅ | `CharacterDex` | Silhouettes + completion % |
| A-6 | House ≥3 rooms, free placement | ✅ | `MyHouse` | |
| A-7 | Room decoration | ✅ | `DecorateRoom` | |
| A-8 | 10 villains Lv1–10, 5/day | ✅ | `Battle` `VillainDex` | The approved IP roster: Temp · Haze · Rush · Noct · Glitch · Maze · Vex · Grim · **Vilord** (mid-boss) · **Nox** (final boss). Each row carries the five approved fields — name · personality · story · look · battle characteristics (`ability`) — so dex, battle and art brief read one source. Sequential unlock via `villainUnlocked()`; power rises monotonically 60 → 440. Beating the final boss pays `BATTLE_REWARDS.finalClear` (special reward) and opens the ending (`endingUnlocked()`). Scalable: `set` + `enabled` (a season is a server flag, not a release) and `role` (nothing keys off "the last row", so an appended seasonal villain can't steal the ending). Daily allowance `BATTLES_PER_DAY` |
| A-8.1 | Rewards: basic + first-clear · story · daily limit | ✅ | `Battle` `VillainDex` `data.jsx` | **Every** win pays the basic reward; a first win adds the first-clear bonus **on top**, and only a first win advances the story and opens the next villain. Modelled as `base + bonus` in `BATTLE_RULES`, so "a repeat pays less than a first clear" holds **by construction** — a bonus may be zeroed but never made negative, and `setBattleRules(remote)` refuses a payload that would invert it. The first-clear tier keys off `v.clears`, not `v.defeated`, so the bonus is paid once and never again. **Story progression** (`storyUnlocked` / `storyChapters`): every villain carried an authored `story` that no screen rendered — the dex now reveals a villain's identity when you reach it, and its story chapter when you **beat** it, with a chapter counter. The daily limit is `battlesPerDay()`, read through a function so a server retune actually reaches the screens (it was an exported const, which made "configurable" a promise the code could not keep) |
| A-8.2 | Recommended level & win probability | ✅ | `Battle` `BattleVariants` `data.jsx` | A villain's `lv` **is** its recommended level (Temp Lv.1 … Nox Lv.10) — one number, so the ladder and the recommendation cannot disagree. It is advice, never a gate: the only lock is the previous villain still standing, so an under-levelled buddy can be sent in and the screen says so (`underLevelled`) instead of refusing. The outcome is a **roll against stat-derived odds** (`winChance` → `rollBattle`), not a `power >= power` compare — so a weak buddy can still win and a maxed one can still lose, bounded by `BATTLE_ODDS.floor`/`.ceiling`. The odds shown before the fight are the odds rolled against, and both the villain fought and its numbers are frozen at roll time so a first clear (which advances the ladder) can't make the victory screen report the wrong villain. `setVillains(remote)` remaps level/power/role/enabled by id; `setBattleOdds(remote)` retunes the curve and refuses a hostile floor/ceiling |
| A-9 | Villain encyclopedia | ✅ | `VillainDex` | Road + list layouts. Each entry is a character sheet, not a stat block — the risk it personifies, its story and its ability — behind the same silhouette gate as the name, so reading it is the reward for reaching it |
| A-10 | Friend visit system | ✅ | `FriendHouse` | Likes + one-line guestbook, no chat |
| A-11 | Out-of-scope guard | ✅ | — | No PvP/chat/cash/gacha anywhere |

## Action list (what to build / fix next)

1. ~~**A-2 / F-15 — Egg & hatch flow**~~ — done: `EggHatch.jsx` (shared), `Shop.jsx` (buy → hatch → duplicate→XP toast), `Onboarding.jsx` (starter egg).
2. **🔧 F-08 — Stage escalation**: storyboard vibration → on-screen warning → character message in `WarningOverlay.jsx`.
3. ~~**🔧 F-09 — Timed character toast**~~ — done: `CharMessageToast` in `WarningOverlay.jsx` (1.5 s display, 3 s minimum gap, rotating message pools, both timings server-configurable).
4. **🔧 F-20 — Reports reframe**: risky-behavior *reduction rate* metric in `ParentReports.jsx`.
5. **🔧 F-26 — Permission fallback**: denied-permission state in `Onboarding.jsx` (warnings keep working without location).
6. **🚫 Parked screens**: `LiteBlock.jsx` (F-10), `ParentSchedule.jsx` + Time-rules block (F-21) — excluded this revision; don't expand.
