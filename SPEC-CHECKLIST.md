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
| F-09 | Character message (1.5 s toast) | 🔧 | `WarningOverlay` | Banner ≈ close; needs the timed bottom toast (~20% height, 1.5 s, 3 s interval) |
| F-10 | Full-screen block (Lite) | 🚫 | `LiteBlock.jsx` | Built ahead of scope — parked |
| F-11 | Overlay warning (Smart) | ✅ | `WarningOverlay` | Sheet / spotlight / banner variants |
| F-12 | User-response classification | ⚙️ | — | Surfaces in parent metrics (F-20) |

## 3 · Gamification · Rewards

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
| F-13 | Points · XP growth | ✅ | `ChildHome` `Rewards` `CharacterDetail` | Criteria in `POINTS` (data.jsx), spec A-1.1; server-configurable |
| F-14 | Daily accident-free reward | ✅ | `Rewards` | +100 daily · +300 at 7d · Special Egg at 30d |
| F-15 | Character acquisition · rarity | ✅ | `Collection` `Shop` `Onboarding` | Egg flow: buy/starter egg → tap or shake → hatch → random char, duplicates→XP. Grades Common/Rare/Epic |
| F-16 | Character evolution (3 stages) | ✅ | `CharacterDetail` | |
| A-3.1 | EXP curve | ✅ | `data.jsx` | `100 + (n−1)×50` — Lv1→2 100 … Lv5→6 300. `XP_CURVE`; server-configurable. `xpMax` derived, never authored |
| A-3.2 | Max level Lv.10 + core loop | ✅ | `data.jsx` `ChildHome` | `XP_CURVE.maxLevel`; `xpForLevel()` returns null at cap; `c.maxed` flag; hatch new eggs to keep growing |
| F-17 | Character customization | ✅ | `Shop` `CharacterDetail` | No stat effects |
| F-18 | Collection House (≥3 rooms) | ✅ | `MyHouse` | 4 rooms, 2 condition-locked |
| F-19 | Battle system (PvE, 1/day) | ✅ | `Battle` | Score-based, no real-time controls |
| F-32 | Friend visit · likes · guestbook | ✅ | `Friends` `FriendHouse` `AddFriends` | No chat/real-time |

## 4 · Guardian (Parent)

| ID | Feature | Status | Screens | Note |
|----|---------|--------|---------|------|
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
| A-8 | 10 villains Lv1–10, 5/day | ✅ | `Battle` `VillainDex` | Full roster Smombie Rookie → King Smombie; daily allowance `BATTLES_PER_DAY` |
| A-8.1 | Repeat challenges | ✅ | `Battle` | First clear unlocks the ladder + pays `BATTLE_REWARDS.firstClear`; rematches pay the lower `repeat`. `v.clears` tracks the record. Server-configurable |
| A-9 | Villain encyclopedia | ✅ | `VillainDex` | Road + list layouts |
| A-10 | Friend visit system | ✅ | `FriendHouse` | Likes + one-line guestbook, no chat |
| A-11 | Out-of-scope guard | ✅ | — | No PvP/chat/cash/gacha anywhere |

## Action list (what to build / fix next)

1. ~~**A-2 / F-15 — Egg & hatch flow**~~ — done: `EggHatch.jsx` (shared), `Shop.jsx` (buy → hatch → duplicate→XP toast), `Onboarding.jsx` (starter egg).
2. **🔧 F-08 — Stage escalation**: storyboard vibration → on-screen warning → character message in `WarningOverlay.jsx`.
3. **🔧 F-09 — Timed character toast**: bottom-center ~20% height, 1.5 s auto-dismiss variant.
4. **🔧 F-20 — Reports reframe**: risky-behavior *reduction rate* metric in `ParentReports.jsx`.
5. **🔧 F-26 — Permission fallback**: denied-permission state in `Onboarding.jsx` (warnings keep working without location).
6. **🚫 Parked screens**: `LiteBlock.jsx` (F-10), `ParentSchedule.jsx` + Time-rules block (F-21) — excluded this revision; don't expand.
