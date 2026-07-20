# JoanX — Functional Specification

**2026.06.18**

## Document Overview

This document is the functional specification for the feature requirements defined in the JoanX App system RFP. JoanX is a behavior-intervention mobile system designed to reduce the accident risk that arises when children use a smartphone while walking. It operates without any separate wearable, relying on the smartphone's built-in sensors, device state, and a limited set of inputs.

The features consolidate requirements that were previously scattered across the appendices (Appendix A·D), reorganizing them under a unified feature-ID scheme. The scope of application per operating mode (Lite / Smart) is also indicated.

> **■ Summary of changes in this revision (2026.06.18)**
>
> **Excluded (out of scope this round):** F-01 Operating mode (Lite) · F-05 Danger-zone warning algorithm · F-06 GNSS correction & filtering · F-10 Full-screen block · F-21 Time-based policy settings.
> → The Lite-mode family (F-01·F-10·F-21) and the location/danger-zone family (F-05·F-06) are excluded. Accordingly, Lite-only and GNSS-dependent behavior described in the body does not apply within this revision's scope.
>
> **Added (new):** F-30 Securing a walk-detection tuning period · F-31 AI parent report · F-32 Friend visit / likes / one-line guestbook.
>
> **Notation:** ~~strikethrough~~ + red shading = excluded feature  /  green shading + **[Added]** = new feature.

---

## 1. Detection · Core Engine

The core detection feature group that determines, from sensor input, whether the user is walking, whether the smartphone is in use, and whether the user is approaching a danger zone.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-01 | **[Excluded]** Operating mode (Lite) | Operates solely on smartphone-use-while-walking, walk detection, and device-use state. Targeted at younger children / kids'-phone users. | Excluded |
| F-02 | Operating mode (Smart) | Behavior awareness and prompting voluntary correction. Risk-score-based warnings combined with gamification. Activated only, and only in a limited way, while walking. | Smart |
| F-03 | Walk detection | Based on the smartphone's built-in accelerometer. Walking is confirmed at a cadence of 1.2–2.5 Hz, above a certain variance, sustained for 8 seconds or more. Ends after 10+ seconds of non-walking. | Common |
| F-04 | Risky-behavior event | Triggered when walking + smartphone use are maintained simultaneously for 10 seconds or more. | Common |
| F-05 | **[Excluded]** Danger-zone warning algorithm | A circular area with a 20 m radius. Judges, on a predictive basis, actual approach toward the center rather than mere entry. | Excluded |
| F-06 | **[Excluded]** GNSS correction & filtering | Collected every 5 seconds; decisions based on at least 3 consecutive samples. | Excluded |
| F-30 | **[Added]** Securing a walk-detection tuning period | To achieve walk/risk-event detection accuracy (target 90%+), a dedicated period for tuning sensor parameters with real users is reserved within the PoC. Per-device deviation correction and threshold re-adjustment results are reflected. | Common |

## 2. Intervention · UX

The feature group covering the warnings/blocks delivered to the user after a risky situation is detected, and the handling of user responses.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-07 | Grace-period handling | A 10-second grace period is granted after risk detection; intervention begins if the behavior continues afterward. | Common |
| F-08 | Staged intervention UX | Proceeds in the order: single vibration → on-screen warning → character message. Repeated vibration and long-duration UI occupation are prohibited. | Common |
| F-08.1 | Warning display condition | After the initial vibration, the on-screen warning is displayed only if the risky behavior continues for 2 more seconds. If phone use stops or walking ends within those 2 seconds, the warning overlay is not displayed and the event closes as a self-correction. | Common |
| F-08.2 | Dismiss & re-intervention | The child can dismiss the overlay at any time ("Got it!" / "알겠어!"), and it leaves the screen immediately. Dismissal starts a **5-second cooldown** during which no further warning is shown for the same hazardous situation. When the cooldown ends the system re-assesses the risk level, and only if the unsafe behavior is still occurring does it intervene again — another vibration followed by the warning overlay. Ignoring the character message counts the same as a dismissal. The cooldown duration is a setting, retunable from pilot-test results. | Common |
| F-08.3 | Progressive tone & logging | Each repeated intervention for the same risk event uses a firmer message than the last (gentle → firm → urgent; the strongest tier repeats thereafter). Every round is logged with its outcome — immediate stop / delayed stop / ignored — and the log feeds the reward system (F-13/F-14) and the parent report (F-20). Escalation is by message tone only: **forced screen blocking is out of MVP scope** (see F-10). | Common |
| F-08.4 | Safe-state confirmation | When detection determines the risky behavior has ended — phone use stopped, or walking finished — the overlay is dismissed immediately. To keep brief sensor fluctuations from flickering the overlay, it is removed only after the safe state has held stable for a short confirmation period; if the risk resumes inside that window, the intervention simply continues. The confirmation period is a setting, retunable from pilot-test results. | Common |
| F-08.5 | Warning level & character emotion | The character's facial expression and the warning copy both change dynamically with the current warning level, which rises one step per ignored round in step with the F-08.3 tone ladder (gentle → firm → urgent; the top level repeats thereafter). **Level 1 (gentle):** a single vibration plus a friendly, low-pressure message; the character keeps an alert but calm expression. **Level 2 (firm):** a stronger, more insistent message; the character shows a concerned expression. **Level 3 (urgent):** a strong message stating the behavior is unsafe and being recorded; the character shows its most serious expression (concerned/upset or tired). Expression and copy must track the level together — the face is never lighter than the words that accompany it. Mood values and per-level copy are data, retunable from pilot-test results without an app release. | Common |
| F-09 | Character message display | Bottom-center of the screen, about 20% of screen height, shown for 1.5 seconds. A minimum 3-second interval is kept before another message may be shown, and a message is redisplayed only if the risky behavior is still occurring. | Common |
| F-09.1 | Message rotation | Repeating the same message is minimized: the character rotates through a pool of messages per tone tier, never showing the same line twice in a row, and each intervention round starts at a different point in the pool. The goal is to reduce message fatigue and the resistance it breeds. | Common |
| F-09.2 | Configurable message timing | Display duration (1.5 s) and redisplay interval (3 s) are settings, not fixed constants, and are expected to be retuned from pilot-test results without an app release. | Common |
| F-10 | **[Excluded]** Full-screen block | Full-screen block on a risk state in Lite mode. | Excluded |
| F-11 | Overlay warning | Displays an overlay-style warning in Smart mode. | Smart |
| F-12 | User-response classification | Stop within 10s = immediate stop / 5–10s = delayed stop / sustained 15s+ = ignored. Each is recorded as a separate event. | Common |

## 3. Gamification · Rewards

A motivation structure to sustain safe behavior: the character growth, collection, and battle feature group.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-13 | Points · character growth | Converts safe behavior into points and then into experience (XP). 10 pt per completed minute of non-use while walking (sessions under 1 minute award nothing); +20 Immediate Stop Bonus. Values are server-configurable — see A-1.1. | Smart |
| F-14 | Daily accident-free reward | +100 for an accident-free day; +300 at 7 consecutive days; a Special Egg or event reward at 30 consecutive days. See A-1.1. | Smart |
| F-15 | Character acquisition · rarity | The starter character is granted as an egg, hatched by the user on first run. Common/Rare/Epic grades, acquired in connection with behavior patterns. Duplicates convert to XP, etc. | Smart |
| F-15.1 | MVP roster & extensibility | The MVP ships **15 characters: 8 Common, 5 Rare, 2 Epic**. The roster is data, not a fixed enum: characters carry a release `set`, and rarity tiers are themselves a list, so seasonal characters, event-exclusive characters, and new rarity tiers can be added server-side without a screen change. Nothing in the app assumes there are exactly 15 characters or exactly 3 tiers. | Smart |
| F-15.2 | Hidden Epic characters | The 2 Epic characters are hidden from the start and are not visible anywhere until unlocked — no encyclopedia slot, no silhouette, no "???" placeholder, and they are excluded from the collection totals, since a denominator of 15 against 13 visible slots would itself reveal that they exist. Unlocking one (event, special mission, achievement, or an Epic Egg) is the moment it first appears. | Smart |
| F-16 | Character evolution | An evolution structure of at least 3 stages, with appearance changes per stage. More safe behavior yields faster growth. | Smart |
| F-17 | Character customization | Customizing appearance, color, and decorative elements. Some elements are obtained through behavior rewards or events. | Smart |
| F-18 | Collection House | Composed of multiple Rooms, with characters arranged by attribute. Some Rooms unlock upon meeting conditions, expanding gradually. | Smart |
| F-19 | Battle system | Not user-versus-user; battles are against system characters. | Smart |
| F-32 | **[Added]** Friend visit · likes · one-line guestbook | Supports visiting a friend's Collection House, viewing their featured character/Rooms, leaving like stickers, and writing a one-line guestbook entry. Real-time chat/interaction is excluded. (Details: Appendix A-10) | Smart |

## 4. Guardian (Parent)

The feature group through which a guardian configures the usage environment and reviews the child's behavior change.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-33 | **[Added]** Guardian account sign-in | The parent/guardian account uses **phone number + SMS verification** as the primary authentication method. There is no password, so there is no password-reset flow: a returning parent re-verifies the same way a new one does. Verifying an unknown number creates the account; a known number signs straight in. | Common |
| F-33.1 | **[Added]** Social sign-in & email scope | To satisfy platform policy and reduce typing, the app also supports **Google Sign-In on Android** and **Sign in with Apple on iOS**; each is offered only on its own platform. **Email login is excluded from the MVP**, but it is modeled as a disabled sign-in method rather than an absent one, so a later business decision can enable it by turning the method on and adding its form — no rework of the sign-in flow. | Common |
| F-20 | Guardian report metrics | Provides behavior-change metrics rather than raw event counts: risky-behavior reduction rate, warning-acceptance rate, and safe-walking-time increase rate. | Common |
| F-21 | **[Excluded]** Time-based policy settings | Strong restrictions during commute hours; policy settings by time band. | Excluded |
| F-22 | Smart intervention-intensity settings | Adjust warning sensitivity, warning frequency, whether notifications are received, and the gamification activation level. | Smart |
| F-31 | **[Added]** AI parent report | AI analyzes accumulated behavior data to summarize and interpret the child's walking-safety patterns in natural language. It automatically generates and provides, as a report, the trend of risky-behavior change, improvement points, and recommended guardian actions. | Common |

## 5. Data · Processing

The data-flow feature group: event storage/transmission, Risk Score processing, permission management, etc.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-23 | Local event storage | Up to 100 events stored temporarily; deleted upon successful server transmission. Stored separately from user-identifying information. | Common |
| F-24 | Event transmission API | Uses `POST /event`. On transmission failure, retries up to 3 times at 5-second intervals. | Common |
| F-25 | Dynamic Risk Score processing | A time-based dynamic value. Increases immediately on risk; decreases by 5–10 per second on stopping. Default cooldown of 5 seconds after a warning. | Smart |
| F-26 | Staged permission requests & fallback | Sensor/location/notification permissions requested in stages. Even on denial, total inoperability is prevented (without location, only GNSS features are disabled while basic warnings remain). | Common |

## 6. Platform · System

The system-foundation feature group, covering implementation scope and state.

| ID | Feature | Description | Mode |
|----|---------|-------------|------|
| F-27 | Android-only implementation | Continuous detection based on a foreground service. Lite includes restriction of specific app launches, a warning overlay, and an immediate-intervention UI. Policy is retained on relaunch; calls and texts are exceptions. | Android |
| F-28 | Background state restoration | Detection/judgment is maintained even in the background. On OS termination, state is restored after restart (a forced app kill starts from the initial state). | Common |
| F-29 | Logging · debugging | Records logs of all state transitions and major events. Stored locally for at least 7 days. | Common |

---

## Appendix A. JoanX Character Collection & Game System

This appendix is the detailed implementation specification for F-13–F-19 of Chapter 3 (Gamification · Rewards) and the newly added F-32 (Friend visit). It carries the same force as the main specification.

### A-1. Purpose
This system does not provide a game in itself; its purpose is to provide a reward and collection system that fosters children's safe-walking habits over the long term. It does not provide real-time gameplay.

### A-1.1. Point & Reward Criteria (F-13 / F-14)
Users earn **10 points for every 1 minute of safe walking**. If a safe-walking session ends before reaching 1 minute, **no points are awarded for that session** — partial minutes do not accrue. Additionally, if the user voluntarily stops using their phone immediately after receiving a warning, they receive an **Immediate Stop Bonus**.

| Criterion | Reward |
|-----------|--------|
| 1 consecutive minute of safe walking | 10 points |
| Immediate Stop Bonus (stop phone use immediately after a warning) | +20 points |
| Daily Accident-Free Bonus | +100 points |
| 7 consecutive accident-free days | +300 points |
| 30 consecutive accident-free days | Special Egg reward or event reward |

- The point values and reward criteria are designed to be **configurable through server-side settings**, allowing them to be adjusted according to business policies without requiring an app update.
- The app ships with the values above as launch defaults, used as the offline fallback when remote settings are unavailable.

### A-2. Character Acquisition System
- Users earn points through safe behavior.
- Points can be used to obtain a Character Egg.
- Hatching an egg grants a random character.
- Rarity: Common / Rare / Epic.
- Duplicate acquisitions convert to XP.
- No cash-payment feature is included.

#### A-2.1. Egg Purchase (MVP)
Users can purchase Eggs using Points. The purchase cost varies depending on the Egg's rarity level.

| Egg | Cost | Eligibility |
|-----|------|-------------|
| Common Egg | 500 pt | — |
| Rare Egg | 1,500 pt | Available only for users above Lv.5 |
| Epic Egg | Cannot be purchased with Points | Only obtainable through Events, Special Missions, or Achievement Rewards |

- A higher-rarity egg does not guarantee a higher-rarity character; it shifts the drop odds.
- The Egg purchase costs and eligibility requirements are designed to be **adjustable through server settings**, allowing the business team to modify them according to operational policies.
- The app ships with the values above as launch defaults, used as the offline fallback when remote settings are unavailable.

### A-3. Character Growth & Evolution
- Characters have an XP-based growth structure.
- XP is earned through safe-behavior scores.
- Characters have an evolution structure of at least 3 stages: Stage 1 / Stage 2 / Stage 3.
- Appearance changes occur upon evolution.

#### A-3.1. EXP Curve (F-16)
The EXP required for character level progression starts low and gradually increases as the character's level goes higher. In the MVP the requirement follows this growth curve:

| Progression | EXP required |
|-------------|--------------|
| Lv.1 → Lv.2 | 100 EXP |
| Lv.2 → Lv.3 | 150 EXP |
| Lv.3 → Lv.4 | 200 EXP |
| Lv.4 → Lv.5 | 250 EXP |
| Lv.5 → Lv.6 | 300 EXP |

- Higher levels continue to require more EXP with the same gradual growth pattern: `EXP(n → n+1) = 100 + (n − 1) × 50`.
- The EXP values can be **adjusted through server settings** based on business needs and balancing requirements.
- The app ships with the values above as launch defaults, used as the offline fallback when remote settings are unavailable.

#### A-3.2. Maximum Level & Core Loop (F-16)
- In the MVP, a character's **maximum level is Lv.10**.
- Once a character reaches Lv.10 it completes its final growth stage and is **registered in the Collection**. It earns no further EXP.
- After that, users hatch new Eggs and continue growing different types of characters — this is the core gameplay loop.
- The maximum level and the number of growth stages are designed to be **expandable in future service updates** based on business needs, and are read from server settings alongside the EXP curve.

### A-4. Character Encyclopedia
- All acquired characters are automatically registered in the encyclopedia.
- The encyclopedia provides: character name, rarity, evolution stage, description text, and acquisition status.
- Unacquired characters are shown as silhouettes.
- An encyclopedia completion rate (%) is provided.

### A-5. Character Customization
- Customization items can be obtained using points.
- Examples: outfits, hats, glasses, accessories, skins.
- There is no effect on stats.

### A-6. Collection House
- Each user has their own Collection House.
- The Collection House is a character display space.
- It is composed of at least 3 Rooms.
- Acquired characters can be placed freely.

### A-7. Room Decoration
- Users can decorate Rooms using points.
- Examples: wallpaper, flooring, furniture, ornaments, background objects.

### A-8. Villain Battle System
- Implemented as PvE (Player versus Environment). Real-time PvP is not provided.
- Up to **5 challenges per day**. The remaining count is shown on the battle screen, and the result screen offers "Battle again" while challenges remain.
- The daily allowance resets at local midnight; unused challenges do not carry over.
- A challenge is consumed when the battle resolves — win or lose.
- When the allowance is exhausted, the challenge action is disabled until the next reset.
- Battle outcomes are calculated from accumulated safe-behavior scores and character growth state, not real-time controls.

| Level | Villain |
|-------|---------|
| Lv1 | Smombie Rookie |
| Lv2 | Smombie Walker |
| Lv3 | Distractor |
| Lv4 | Dark Walker |
| Lv5 | Crossroad Phantom |
| Lv6 | Alley Stalker |
| Lv7 | Screen Master |
| Lv8 | Attention Reaper |
| Lv9 | Doom Walker |
| Lv10 | King Smombie |

Users unlock and challenge villains sequentially.

#### A-8.1. Repeat Challenges
After defeating a villain for the first time, players can continue challenging the same villain repeatedly.

- The **first victory** unlocks story progression, new villains, and **first-clear rewards**.
- **Subsequent challenges** are designed for character progression, record improvement, and repeatable rewards.
- **Repeat challenge rewards are lower than the first-clear rewards.**
- Repeat challenges still consume one of the day's challenges (A-8).
- The reward policy is designed to be **configurable through server settings** based on business requirements.

| Outcome | Reward (launch default) |
|---------|-------------------------|
| First clear | 120 pt · 60 EXP · unlocks the next villain |
| Repeat clear | 40 pt · 20 EXP · increments the clear count |
| Loss | 10 pt |

### A-9. Villain Encyclopedia
- Discovered or defeated villains are registered in the encyclopedia.
- The encyclopedia provides: villain name, level, description text, and defeat status.
- Undiscovered villains are shown as silhouettes.
- An encyclopedia completion rate (%) is provided.

### A-10. Friend Visit System (F-32)
- Users can visit a friend's Collection House.
- Provided features: view the featured character, browse Rooms, leave like stickers, write a guestbook entry.
- A chat feature is not included.
- Real-time interaction features are not included.

### A-11. Out-of-Scope
Features not included in this contract's scope:
- Real-time PvP
- Guilds
- Real-time chat
- Item trading
- Item exchange
- Cash payment
- Probability-based (gacha) paid products
- Ranked matches
- Real-time multiplayer
- Metaverse-style worlds
- Voice chat
- Live streaming
