# JoanX — Product Design Documentation

**A behaviour-change safety product for children who walk while using a phone.**

| | |
|---|---|
| **Document** | Product & UX documentation — feature-level, decision-level, critique-level |
| **Version** | 1.0 · 26 July 2026 |
| **Author role** | Senior Product Designer / UX Strategist |
| **Covers** | Repository at `main` (`16c6e2f`), all `src/` screens, `src/core/data.jsx` (2,535 lines) |
| **Method** | Read from source, the client functional spec (2026-06-18), the existing doc set, and the git history. Nothing invented. Where the source cannot answer, the document says **⚠️ Needs clarification** and proposes an option. |
| **Companions** | [`JoanX_Functional_Spec_2026-06-18_EN.md`](JoanX_Functional_Spec_2026-06-18_EN.md) (the contract) · [`PROJECT_DOCUMENTATION.md`](PROJECT_DOCUMENTATION.md) (engineering reference, **partly stale — see §6.1**) · [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) · [`SPEC-CHECKLIST.md`](SPEC-CHECKLIST.md) · [`PROGRESS-BRIEF.md`](PROGRESS-BRIEF.md) |

---

## 0. About this document

### 0.1 Why it exists

The repository already holds a **functional spec** (what the client asked for), an **engineering reference** (how the code works), a **design-system spec** (how it looks) and a **coverage checklist** (what is built). What it does not hold is the layer a product team actually works from: **why each feature exists, who it is for, what problem it solves, why the flow is shaped this way, and where the design is still undecided or wrong.**

This document is that layer. It does not restate the other four — it interprets, connects and challenges them.

### 0.2 Source hierarchy

When sources disagree, resolve in this order:

1. **The code** (`src/core/data.jsx` and the screens) — this is what actually ships.
2. **`SPEC-CHECKLIST.md`** — kept closest to the code.
3. **The client functional spec** — the contract, but it predates several accepted changes.
4. **`PROJECT_DOCUMENTATION.md` / `DOCUMENTATION.md`** — accurate as of 14 July, now stale in ~12 places (§6.1).

### 0.3 Notation

| Marker | Meaning |
|---|---|
| **⚠️ Needs clarification** | The source cannot answer this. A recommendation follows; it is not a decision. |
| **🔴 / 🟠 / 🟡** | Risk severity: blocking / significant / worth fixing |
| **F-xx / A-x.x** | Requirement ID from the client functional spec |
| **"spec #4", "C7"** | Requirement IDs that exist **only in code comments** — see §6.2 |

---
---

# Part I — Product foundation

## 1. The problem

### 1.1 The behaviour

A child walks to school looking at a screen. They do not see the car, the kerb, the cyclist, the changing light. Korean media call it *스몸비* — "smombie", the smartphone zombie. It is the specific behaviour, not phone ownership, that carries the risk, and it happens in short bursts: a message answered mid-crossing, a video watched along a road.

### 1.2 Why the existing answers fail

Every product in this space is **restrictive**, and restriction fails against a child in a predictable way:

| Existing answer | How the child defeats it | What it costs |
|---|---|---|
| Block the phone while moving | Turns the app off, borrows a friend's phone, walks with it in a pocket and looks at it anyway | The parent believes they are protected when they are not |
| Lock the screen on a schedule | Learns the schedule | Blocks the phone at exactly the moments it might be needed |
| Track the child's location | Resents it; the relationship pays | Creates a surveillance record of a minor |
| Alert the parent on every event | Alert fatigue in a week | The parent stops reading, so the signal dies |

The failure mode is the same in each: **the child is the adversary of the product.** A safety app a child wants to defeat is worth nothing, because a child will win.

### 1.3 The thesis

> **Make looking up the thing that wins the game.**

JoanX never takes the phone. It buzzes once; if the behaviour continues, a card appears; if it continues again, the child's own character speaks. **Stopping is what pays.** The points buy a character the child is attached to, and that character is what they lose access to by not stopping.

This is not a marketing line — it is legible as *constraints in the code*, and every one of them is a decision that cost something:

| The thesis says | The product does | What it gives up |
|---|---|---|
| Never punish | The strongest intervention tier is a **firmer sentence**. No screen block anywhere (F-10 out of scope) | No hard-stop guarantee. The product depends on the game being genuinely wanted |
| Never spy | `PARENT_SEES` excludes location, messages and photos — **and the child is shown that list by name** | Loses the feature parents ask for most |
| Never make children a channel for each other | No chat. Reactions are five positive-only options. Typed guestbook notes are screened before they post | Less expressive social play |
| Never make a child pay to win | Guaranteed behaviour-based unlocks sit beside the egg gacha; a 30-day streak hands over an Epic outright | Lower monetisation pressure |
| Never turn a reward into an obligation | Evolution grants **no stats** — it is art | Loses an easy lever for making evolution feel powerful |
| Never reward the loop instead of the behaviour | The stop bonus is gated on four verified signals, cooled down 60s and capped at 300pt/day | Complexity, and a child can "do the right thing" and see no points |

---

## 2. Users

### 2.1 Who they are

| | **Child** (primary user) | **Guardian** (buyer + secondary user) | **Joan Company** (client / IP owner) |
|---|---|---|---|
| Age / profile | ~6–13. Seeded personas: Mina 11, Leo 8, Yuna 6 | Adult account holder; up to **2 guardians** per family | Korean client, owns the character IP |
| Owns an account? | **No.** The device pairs to the family | Yes — phone number + password | — |
| Primary need | A game they would choose to play | Evidence the behaviour is changing, without spying | An approvable spec and an original character line |
| What they fear | Being policed, being embarrassed, losing their phone | Their child stepping into a road; also, being the parent who nags | Shipping a children's product with a safety or privacy failure |
| Success looks like | "My buddy evolved" | "Acceptance went from 61% to 88%" | 38/38 in-scope requirements, approvable art |

### 2.2 Jobs to be done

**Child**
- *When I'm walking home and bored, I want something to do that doesn't get me in trouble, so I can enjoy the walk.*
- *When my parents install another app on my phone, I want to not feel watched, so I don't have to fight about it.*
- *When I do the right thing, I want it to count for something visible, so it feels worth doing again.*

**Guardian**
- *When my child walks to school alone, I want to know they're getting safer, so I can stop lying awake about it.*
- *When I get an alert, I want to know whether to act, so I don't learn to ignore alerts.*
- *When my partner and I both worry, I want us to see the same thing, so we're not managing it twice.*

### 2.3 Pain points → design response

| User | Pain before JoanX | Design response | Where |
|---|---|---|---|
| Child | Safety apps take my phone | The phone is never seized; the strongest tier is a sentence | `WarningOverlay.jsx`, F-08.3 |
| Child | Being nagged for the same thing | Message pools rotate per tone tier; no line repeats back-to-back | `INTERVENTION.messages`, F-09.1 |
| Child | I don't know what my parents can see | `Profile` renders the shared/private list by name, and names the guardians | `PARENT_SEES`, `guardianNames()`, A-13 |
| Child | Doing the right thing is invisible | The stop pays, the buddy grows, the badge appears | Safe-stop → points → EXP → stage |
| Guardian | Reports are incident counts I can't act on | The lead metric is a **reduction rate** vs the child's own baseline | `PARENT_METRICS.riskReduction`, F-20 |
| Guardian | I can't read a chart at 11pm | The AI report is **verdict-first**: conclusion + one hero number, then narrative, then one thing to try | `ParentAIReport.jsx`, F-31 |
| Guardian | My partner and I are managing this separately | The **family** owns the child, not the parent who set it up. Both see identical data by construction | `FAMILY`, `MAX_GUARDIANS = 2` |
| Guardian | I set it up once and never opened it again | Weekly narrative + activity feed + streak milestones give a reason to return | `ParentActivity`, `ParentWeeklyDetail` |

### 2.4 The buyer/user split — the central product tension

**The person who pays is not the person who must want it.** A guardian buys reduced risk; a child must want to keep the app. Almost every hard decision in JoanX is a resolution of this tension, and every one resolves *toward the child*:

- The parent cannot see location — **because the child would otherwise resent the app**, and a resented app is uninstalled.
- The parent cannot see the guestbook — same reason.
- The parent *can* unlink; the child cannot — because a child who could quietly disconnect makes the product a promise the parent cannot rely on.

That last one is the only place the resolution goes the other way, and it is correct: it is the minimum the guardian needs for the product to mean anything.

---

## 3. Vision, business goals and measurement

### 3.1 Product vision

> A child arrives at school having walked the whole way with their head up — and thinks they were playing a game.

### 3.2 Business model

**Partially determined.** `HowItWorks.jsx` renders a `PLANS` array and `TRIAL_DAYS = 7`; `ParentDetail.jsx` has a plan sub-page. The modelled direction is a **freemium subscription with a 7-day trial, sold to the guardian**.

**⚠️ Needs clarification — pricing, tiers and what is gated.** No price constants, no payment SDK, no receipt validation exists. More importantly, **no decision exists about what a free tier withholds.** This is a design question, not a billing one:
- *Recommendation:* never gate the intervention. Gate **reporting depth** (AI report, history beyond 7 days, multi-child, second guardian). Gating safety in a safety product is indefensible and will be read that way in a review.

Secondary revenue directions visible in the model: school/municipal licensing, the ten-villain IP line, anonymised road-safety data.

### 3.3 Goals and how they are measured

| Goal | Metric | Seeded baseline | Owner |
|---|---|---|---|
| A child looks up **quickly** | `avgResponse` | 2.4 s | Child app |
| A child looks up **repeatedly** | `acceptance` (warnings ending in a verified stop) | 88% | Child app |
| A child looks up **unprompted** | `riskReduction`, `phoneUseDrop` | 41%, 0.42 | The real outcome |
| The guardian has proof | 7-day reaction chart + AI narrative | — | Parent app |
| The child keeps playing | `streak`, session return | 5 days | Game loop |
| The guardian keeps paying | Report views / week; renewal | — | ⚠️ not instrumented |

**North star:** `phoneUseDrop` — phone use while walking versus *this child's own first week*.

**Why self-referential.** Ranking a child against other children punishes whoever started worst and flatters whoever started best. Measuring against their own baseline makes improvement the only thing that scores. This is a product ethic encoded as a data model, and it should be defended if anyone proposes leaderboards.

### 3.4 Design principles (derived from the decisions actually made)

1. **Motivation over restriction.** If a feature works by preventing, redesign it.
2. **The child is told the truth.** Anything the guardian sees, the child is shown.
3. **Rewards are earned, never tapped.** A button press is not a behaviour.
4. **Art is not power.** Cosmetic progress must never become required progress.
5. **Business policy is data.** Anything ops might retune is a settings object with a validating setter, not a constant.
6. **One number, one source.** Never store what can be derived (stage, xpMax, reaction totals, completion %).
7. **Safety outranks delight.** An impact event ends a celebration; a warning outranks a reward toast.
8. **No unmoderated channel between children, ever.**

---
---

# Part II — Experience architecture

## 4. The two-app model

```
                     ┌──────────────────────────┐
                     │   FAMILY (household)     │
                     │   owns children + data   │
                     └───────┬──────────┬───────┘
        guardian 1 ──────────┘          └────────── guardian 2 (co-parent)
        (owner: billing, invite, remove)            (settings, reports — equal data)
                              │
                        6-digit pairing
                              │
                     ┌────────▼─────────┐
                     │   CHILD DEVICE   │   no account of its own
                     │   Smart mode     │
                     └──────────────────┘
```

Two apps, one data model. The **child app is a game**; the **parent app is a dashboard**. They share `src/core/data.jsx`, which is why the two sides cannot describe the same child differently — and why `PARENT_SEES` is *data* rather than copy in two places.

## 5. Feature map and dependencies

```
                      ┌─── DETECTION (motion + usage) ───┐   [engine — not in this repo]
                      │                                   │
        ┌─────────────▼──────────────┐        ┌───────────▼────────────┐
        │  IMPACT / FALL (C7)        │        │  RISK EVENT (F-04)     │
        │  highest priority          │───────▶│  staged intervention   │
        │  ends everything else      │  outranks   (F-07…F-12)         │
        └─────────────┬──────────────┘        └───────────┬────────────┘
                      │                                    │
              parent urgent alert                  safe-stop verification
                                                           │
                                              ┌────────────▼─────────────┐
                                              │  POINTS  (the currency)  │
                                              └────┬──────────┬──────────┘
                     ┌─────────────────────────────┘          └────────────┐
              ┌──────▼──────┐   ┌──────────┐   ┌────────────┐      ┌───────▼──────┐
              │  EGGS/GACHA │──▶│  BUDDY   │──▶│  BATTLES   │─────▶│  RISK EVENT  │
              │  + unlocks  │   │  EXP/    │   │  villains  │ story│  LOG          │
              └──────┬──────┘   │  stages  │   │  + dex     │      └───────┬──────┘
                     │          └────┬─────┘   └─────┬──────┘              │
              ┌──────▼──────┐        │               │              ┌──────▼───────┐
              │ ITEMS/DECOR │────────┘               │              │ PARENT REPORT│
              │ house/rooms │                        │              │ + AI report  │
              └──────┬──────┘                        │              └──────────────┘
                     │                               │
              ┌──────▼───────────────────────────────▼──────┐
              │  SOCIAL — visit, react, guestbook (no chat) │
              └──────────────────────────────────────────────┘
              ┌──────────────────────────────────────────────┐
              │  BADGES / ACHIEVEMENTS — cross-cut everything │
              └──────────────────────────────────────────────┘
```

**Read this map for the dependencies that matter:**

- **Everything downstream of POINTS is dead until a walk session exists.** No sensor, no session timer, no day boundary. This is the single structural gap (§6.4, RISK-A).
- **The risk-event log is the only thing that feeds both sides.** Child rewards and the parent report must derive from one stream or the two apps will report different children. Today both are separately seeded.
- **Badges cut across every system** and have no evaluator — every `done` flag is hand-authored.

## 6. Information architecture (as built, July 2026)

### 6.1 Child app

| Tab | Root | Contains |
|---|---|---|
| **Home** | `home` | Buddy hero, safety status card, points/streak, daily goal, missions. 13 layout variants |
| **Collect** | `collection` | Owned buddies, character dex, **villain dex**, badges shelf, character detail |
| **⚔ (raised centre)** | `villaindex` | **The villain road** — pick an opponent on the map, then drop into Battle |
| **Friends** | `friends` | Friend list, friend house, add friends, guestbook |
| **Profile** | `profile` | My house / rooms / decorate, settings, notices, help, about, legal |

Pushed screens (`character`, `shop`, `streak`, `notifications`, `guestbook`, `decorate`, …) carry a `ScreenHeader` and a real back stack. Overlays (`WarningOverlay`, `ImpactOverlay`, `AchievementUnlock`) render above everything.

> **Changed since the last doc set:** *Safety* is no longer a tab — it is reachable from the protected-status card on every Home layout. The centre button now opens the **villain road**, not the battle screen. `PROJECT_DOCUMENTATION.md` §6.2 still describes the old model.

### 6.2 Parent app

| Tab | Root | Contains |
|---|---|---|
| **Reports** | `p_reports` | Weekly dashboard, child switcher → AI report, response detail, weekly detail |
| **Children** | `p_children` | Per-child cards → rules & settings, schedule (parked) |
| **⌖ (raised centre)** | `p_connect` | Global connect/scan flow |
| **Alerts** | `p_activity` | Safety-moment feed across all children |
| **Profile** | `p_profile` | Account, family/co-parent, invite, notices, legal, plan, help |

The parent app has **no back stack** — `nav()` swaps the screen. This is deliberate (a dashboard is a set of destinations, not a drill-down) but see §6.4, RISK-F.

### 6.3 The intervention hierarchy

This is the most important ordering rule in the product and it is currently expressed only in a code comment:

```
IMPACT / FALL  >  RISK EVENT  >  REWARD MOMENT  >  GENERAL STATUS
```

- An impact takeover **ends any warning in progress** and takes the whole screen on both apps.
- A warning **suppresses** the achievement-unlock and hatch celebrations.
- Nothing suppresses an impact.

**Recommendation:** promote this to a first-class documented rule with a table of every full-screen surface and its priority integer. Today a new overlay could be added without anyone knowing where it sits.

## 7. Key journeys

### 7.1 The child's first week

| When | What happens | Emotional beat |
|---|---|---|
| Day 1 | Intro slides → enter the guardian's 6-digit code (300s expiry) → permissions requested one at a time with reasons → **first egg, tap to hatch** → a buddy exists | "This is mine" |
| Every walk | Phone stays down; minutes accrue at 10pt each | Passive, ambient |
| First slip | One buzz. Looks up inside 2s → **no warning ever appears**, `immediate`, **+50** | "I got away with it" → actually: "looking up pays best" |
| Second slip | Buzz → card → *"Eyes up,"* → taps **I looked up** → verification → **+20** | Mild friction, no shame |
| Day 5 | 500pt buys a Common Egg; the buddy crosses Lv.4 and **evolves mid-battle** | Surprise reward |
| Day 7 | 7-day streak hands over a **Rare, free** | "I didn't have to buy it" |
| Day 7 (parent) | Acceptance 88%; the AI report opens with a verdict | "It's working" |

### 7.2 The guardian's first hour

Splash → 2 intro slides → **choice: log in or create account** → three consents, each openable in full → phone → SMS code → **set password** → profile (name, DOB, gender) → add-child wizard → pairing code/QR → child connects → configure rules → Reports.

**Design note:** consent comes *before* the phone number, not after. That order is a deliberate ethical choice (do not collect the identifier until consent is given) and it should survive any "reduce friction" pass.

### 7.3 The safety moment (the core interaction)

Documented in full in §8.1.

### 7.4 The co-parent joins

Owner → Profile → Family → Invite → link + QR + 6-digit code, expiring in 48h → the other parent installs, **verifies their own phone number**, joins the family → both see identical data, and every settings change is stamped with who made it in `FAMILY_LOG`.

**Why this shape.** The tempting shortcut — share one login — breaks three things at once: push reaches one device, no change can be attributed, and no alert can show who already responded. The second-best shortcut — re-pair the child's phone — is worse: pairing unlinks the previously-paired device, so adding Dad would silently knock Mum offline.

---
---

# Part III — Feature documentation

Each feature is documented against the same six-part template: **Overview · User perspective · UX reasoning · User flow · Product logic · Design requirements.**

---

## 8.1 Staged intervention — the safety core

**Spec:** F-04, F-07, F-08, F-08.1–F-08.5, F-09, F-09.1, F-09.2, F-11, F-12 · **Screen:** `src/child/WarningOverlay.jsx` (610 lines)

### 1 · Feature overview

**What it is.** When detection says *walking + phone use* has held for 10 seconds, a graduated intervention runs: one vibration → an on-screen warning card → the buddy speaking → cooldown → repeat, firmer. It never blocks the screen.

**Why it exists.** This is the product. Every other feature exists to make a child care about the outcome of this one.

**The user problem.** A child head-down does not perceive traffic, and does not experience themselves as being in danger. They need an interruption that is (a) impossible to miss, (b) not humiliating, and (c) not something they learn to swat away.

**The value.** For the child: a reason to look up that costs them nothing and pays them something. For the guardian: the acceptance rate and response time they are actually buying.

### 2 · User perspective

| | |
|---|---|
| **Who** | The child, mid-walk, phone in hand, attention elsewhere |
| **Goal** | Finish what they're doing on the phone |
| **Motivation to comply** | Not fear — the points, and the buddy that grows from them |
| **Pain before** | Blocking apps take the phone away with no warning and no negotiation |
| **Expected outcome** | Looks up within ~2 seconds, banks a bonus, resumes the walk |

### 3 · UX reasoning

**Why a grace period first (F-07).** Ten seconds before *anything* fires. A child who is already stopping should never be warned — a false warning is the fastest way to teach a child the app is stupid, and a stupid app gets ignored.

**Why the buzz precedes the card (F-08 / F-08.1).** A vibration is the cheapest possible interruption: it costs no screen, no attention lock, no embarrassment in front of friends. And the two-second hold after it means **the well-behaved child never sees a warning at all** — they feel a buzz, look up, and the event closes as a self-correction. The most common path through the safety feature is the path with no UI.

**Why escalation is tone, not force (F-08.3).** Three tiers — gentle → firm → urgent — and the strongest tier is a sentence: *"Stop walking or put the phone away now. This is going in your report."* Escalating to a screen block would win the individual moment and lose the product (§1.3).

**Why the face must match the words (F-08.5).** The buddy's expression tracks the tier. A cheerful mascot delivering an urgent warning teaches the child the warning is theatre. The rule in the spec is exact and worth keeping verbatim: *the face is never lighter than the words that accompany it.*

**Why messages rotate (F-09.1).** From the code's own comment: *"the same line twice running breeds fatigue and then resistance."* Repetition doesn't just bore — it converts a warning into wallpaper. Each tier holds a 4-line pool, no line repeats back-to-back, and each round starts at a different offset.

**Why the message holds for 4 seconds, not the spec's 1.5.** The spec was written for a bare toast. The message step became a card the child must read *and answer*, and at 1.5s a Korean line was gone before it could be finished. **This is a deliberate, documented deviation from F-09 and needs client sign-off (§6.3, D-7).**

**Cognitive load.** One decision at a time, one button, no reading required at the buzz stage. Total on-screen text at the warning step is a title and one sentence. The card occupies the bottom ~20% so the path ahead stays visible — this is a safety constraint disguised as a layout constraint, and no redesign should take the top of the screen.

**Accessibility.** 🔴 **The overlay announces nothing to a screen reader.** No `role`, no `aria-live`. In a safety feature this is not a backlog item; it is a defect. See §6.4, RISK-C.

**Usability risks.**
- The buzz stage in the prototype has a button; in the real product there is nothing to press. Reviewers may design against the wrong affordance.
- Three tiers × rotation × dismissal means the same child can see a lot of the same product surface in a bad week. There is **no fatigue model** — nothing tracks "this child has seen 40 warnings today and stopped reading them". ⚠️ Needs clarification (§6.3, D-4).

### 4 · User flow

```
[entry] detection: walking + phone use ≥ 10s
   │
   ├─ grace (10s) ─── child looks up ──▶ SELF-CORRECT, no UI ever shown ──▶ verify ──▶ +50
   │
   ▼ still risky
  buzz (single vibration)
   │
   ├─ stops within 2s (buzzHold) ──▶ no warning renders ──▶ verify ──▶ +50 ('immediate')
   │
   ▼ risk persists
  WARNING CARD (sheet | spotlight | banner)
   │
   ├─ "I looked up" ──▶ verification sequence ──▶ +20 ('delayed')
   │
   ▼ 5s no response
  BUDDY MESSAGE (rotating line, 4s hold, 4.5s min gap)
   │
   ├─ responds ──▶ verify ──▶ +20
   ├─ dismissed / ignored ──▶ cooldown 5s (silent) ──▶ re-assess
   │                             └─ still risky ──▶ round+1, tone firms ──▶ buzz…
   ▼ ignored through the ladder
  logRiskEvent({ outcome: 'ignored', rounds, tier })  ──▶ parent report
```

| State | Behaviour |
|---|---|
| **Success** | Reward toast naming what the stop was worth. Suppressed if an impact event fires |
| **Safe-state confirmation** | The overlay comes down only after the safe state holds `safeConfirmSeconds` (1s) — sensors flutter, and a single stray reading would strobe the overlay (F-08.4) |
| **Error** | None — there is no network call. A failure of detection presents as *no warning*, which is the dangerous silent failure |
| **Empty** | N/A |
| **Edge: dismissed but still using the phone** | Logged as `dismissed`, **pays nothing** — the acknowledgement is not the behaviour |
| **Edge: repeat triggers** | 5s cooldown suppresses everything for the same hazard |
| **Edge: reduced motion** | Entrance animations gated |

### 5 · Product logic

| Constant | Value | Meaning | Spec |
|---|--:|---|---|
| `graceSeconds` | 10 | Self-correct window | F-07 |
| `buzzHoldSeconds` | 2 | Risk must persist past the buzz for a warning | F-08.1 |
| `recheckSeconds` | 5 | Silent cooldown after dismiss/ignore | F-08.2 |
| `safeConfirmSeconds` | 1 | Anti-flicker hold | F-08.4 |
| `maxRounds` | 3 | Tone ladder length; strongest tier repeats | F-08.3 |
| `messageSeconds` | **4** | Buddy-message hold (spec says 1.5 — deviation) | F-09 |
| `messageGapSeconds` | **4.5** | Minimum gap (spec says 3 — deviation) | F-09.2 |

**Every one of these is server-configurable** and expected to be retuned from pilot results without an app release (F-30 reserves the tuning period).

**Output — the one number that travels:**
```js
logRiskEvent({ outcome: 'immediate' | 'delayed' | 'ignored' | 'dismissed', rounds, tier })
```
Those words are what the reward system reads *and* what the parent report is built from. One classification, from sensor to guardian, with no re-interpretation in between.

**Dependencies:** detection engine (F-03/F-04, not in this repo) · safe-stop verification (§8.2) · parent report (§8.13) · parent sensitivity setting (F-22 — **currently not wired**, §6.4 RISK-E).

### 6 · Design requirements

| | |
|---|---|
| **Components** | Dim backdrop (grows in, deepens per stage) · stage rail (buzz/warning/message) · `Mascot` at tier mood · title + body · single CTA · countdown bar · `CharMessageToast` · `RewardToast` |
| **Variants** | 3 warning styles (sheet / spotlight / banner) × 5 message layouts — a design-review inventory, not shipping product |
| **States** | grace · buzz · warn · message · cooldown · confirming · reward |
| **Motion** | Backdrop fades from transparent; character scales in first, then copy and CTA cascade behind it; nothing bounces at the urgent tier |
| **Feedback** | Single vibration (never repeated) · alert BGM while the intervention is live · success cue on a paid stop |
| **Copy** | Tier titles and bodies are **data**, retunable server-side. Korean uses the polite register |
| **Must not** | Occupy the top of the screen · repeat vibration · use more than one CTA · animate at the urgent tier |

---

## 8.2 Safe-stop verification and anti-farm — *the most interesting decision in the product*

**Spec:** F-12, A-1.1, "spec #4" (unversioned) · **Code:** `evaluateSafeStop()`, `SAFE_STOP`, `POINTS`

### 1 · Feature overview

**What it is.** The rule that decides whether a stop is real, and whether it pays. Four signals must all hold; a 60-second cooldown prevents repeats; a 300-point daily ceiling prevents grinding.

**Why it exists.** It closes a real bug and a real exploit. The bonus used to land the moment the child pressed the button — so a child could dismiss the warning, keep using the phone, and still bank points. **The product was paying for a tap, and calling it safety.**

**The value.** It makes the acceptance metric mean something. Without it, the number the guardian pays for measures button presses.

### 2 · User perspective

| | |
|---|---|
| **Who** | The child, at the moment of acknowledging a warning |
| **Goal** | Get the points and get back to what they were doing |
| **Motivation** | Points → EXP → buddy |
| **Pain before** | (Inverted) The *product's* pain: a child could learn the loop trigger → tap → points and farm it |
| **Expected outcome** | Puts the phone away, the verification completes, the toast names what the stop was worth |

### 3 · UX reasoning

**Why tiered, not flat.** `immediate` (stopped before a warning was needed) pays **50**; `delayed` (stopped after the warning) pays **20**. The child who never needed the intervention did the thing the intervention exists to produce, unprompted — so they earn the most. Paying the warning→stop loop as much as never needing a warning would teach the child to *earn a warning*.

> This is the single sharpest reward-design decision in the product, and it should lead any portfolio presentation of the economy.

**Why four signals, not one.** `warned` · `phoneStopped` · `screenOff` · `stillWalking`. A bare "Got it!" sets none of them and pays nothing. The behaviour, not the acknowledgement, is what is rewarded.

**Why the stop still counts when it doesn't pay.** A cooled-down or capped stop is still logged for the parent report. **Behaviour data and economy are decoupled** — a child who hits their daily cap and keeps stopping still shows up as a child who stops.

**Cognitive load / risk.** 🟠 The child can do everything right and see zero points, with no explanation. The verification is invisible and the reasons (`cooldown`, `capped`) are internal.
- *Recommendation:* the reward toast must have a designed state for each reason. *"You already banked your stop bonus — keep it up, this still counts for your report."* Silence here reads as a bug and undoes the motivation the whole feature exists to protect.

### 4 · User flow

```
[entry] child acknowledges, or detection reports the risk ended
   │
   ▼
 verification sequence (prototype: timed steps; production: real signals)
   warned ✓   phoneStopped ✓   screenOff ✓   stillWalking ✓
   │
   ├─ any missing ──▶ log 'dismissed'          ──▶ reason: incomplete   ──▶ 0 pt  [no designed state]
   ├─ < 60s since last paid stop ──▶ log farmed ──▶ reason: cooldown    ──▶ 0 pt  [no designed state]
   ├─ bonusPointsToday ≥ 300 ──▶ log capped     ──▶ reason: capped      ──▶ 0 pt  [no designed state]
   └─ all clear ──▶ points banked ──▶ reason: awarded ──▶ toast ✓
```

### 5 · Product logic

| Rule | Value | Why |
|---|--:|---|
| `selfCorrectBonus` (`immediate`) | 50 pt | Stopping before a warning is the target behaviour |
| `postWarningStopBonus` (`delayed`) | 20 pt | Real, but prompted |
| `SAFE_STOP.cooldownSeconds` | 60 | Blocks trigger→tap→trigger |
| `POINTS.dailyBonusCap` | 300 | Blocks day-long grinding |
| `perSafeMinute` | 10 pt | **Not capped** — rate-limited by the clock, unfarmable |
| `minSessionSeconds` | 60 | A session under a minute pays nothing |

**Business rule:** per-minute walking points are deliberately uncapped; only *bonus* points are ceilinged. Walking cannot be faked faster than time passes.

⚠️ **Needs clarification:** `bonusPointsToday` "resets daily server-side" — but no day boundary exists (§6.3, D-1).

### 6 · Design requirements

- Verification must be **visible but not blocking** — the child should see the check happening, not wait on it.
- Four distinct toast states: `awarded` (tiered copy for 50 vs 20), `incomplete`, `cooldown`, `capped`.
- Never fake a reward. The screen must not show points the ledger did not pay.
- Cap proximity should be legible somewhere calm (Rewards/Streak), never as a warning.

---

## 8.3 Impact / fall detection (C7) — *undocumented in every spec*

**Spec:** none in the repository — the ID `C7` appears only in code · **Screen:** `src/child/ImpactOverlay.jsx` (241 lines)

### 1 · Feature overview

**What it is.** The IMU reports a hard impact or free-fall. Because that reading is a first-pass estimate, the child gets a 20-second manual safety check before anything reaches the guardian. A "need help" tap — **or no answer at all** — escalates to an urgent parent notification. One component renders both sides.

**Why it exists.** Detection that can already tell walking from not-walking can also tell *fell over* from *walking*. The marginal cost is low and the ceiling is high: this is the feature that turns a habit-coaching product into a safety product a parent would pay for in a different price bracket.

**The value.** For the guardian, the thing they actually fear. For the business, the strongest differentiator in the roster.

### 2 · User perspective

| | |
|---|---|
| **Who** | The child immediately after a fall — possibly hurt, frightened, or fine and embarrassed; and the guardian receiving the alert |
| **Child goal** | Say "I'm fine" fast, or get help fast |
| **Guardian goal** | Know in one glance whether to run |
| **Pain before** | A child who falls has to decide to call, find the phone, and explain |
| **Expected outcome** | A false positive is dismissed in one tap. A real fall reaches the guardian within 20s without the child doing anything |

### 3 · UX reasoning

**Why silence escalates.** The design assumes the worst case is a child who *cannot* answer. Timeout-as-escalation is correct and must never be softened into "we'll ask again later".

**Why 20 seconds.** Long enough for a startled child to find the screen; short enough that a guardian isn't told late. Named once so the ring, the digit and the bar count the same clock.

**Why it takes the whole screen and outranks everything.** Nothing may compete with it. It ends a warning already in progress.

**Why the two sides live in one file.** The child check and the parent alert are one feature sharing copy, colour and the 20-second contract. Splitting them across `child/` and `parent/` is exactly how the two halves drift.

**Accessibility.** 🔴 A countdown with an unannounced escalation is the worst possible screen-reader gap in the product. It needs `aria-live="assertive"`, a spoken countdown at intervals, and a reachable primary action.

**Usability risks.**
- 🔴 **False positives are the whole ballgame.** A dropped phone, a schoolbag thrown, roughhousing. The manual check is the mitigation, but there is **no tuning threshold, no sensitivity setting and no false-positive tracking** anywhere in the product.
- 🔴 **The guardian receives an urgent alert and cannot see where the child is.** `PARENT_SEES` excludes location by design. This is a genuine, unresolved conflict between the privacy promise and the safety promise (§6.3, D-2).

### 4 · User flow

```
[entry] IMU: hard impact / free-fall
   │
   ▼  (ends any warning in progress; takes the full screen)
CHILD SAFETY CHECK — 20s countdown ring
   │
   ├─ "I'm OK"        ──▶ dismissed, no parent alert          ──▶ [state: designed]
   ├─ "I need help"   ──▶ immediate urgent parent alert       ──▶ [state: designed]
   └─ no answer (20s) ──▶ automatic urgent parent alert       ──▶ [state: designed]
                                │
                                ▼
                    PARENT URGENT ALERT (full-screen takeover)
                                │
                    ⚠️ then what? — see D-2
```

**Edge cases with no designed answer:**
- The phone is destroyed by the impact and never sends. ⚠️
- The child answers "I'm OK" but is not. ⚠️
- Two guardians receive the alert — who is responding? (`FAMILY_LOG` records acknowledgement but the alert itself has no "I've got this" state.) ⚠️
- The alert arrives while the guardian's phone is silenced. ⚠️

### 5 · Product logic

| Rule | Value |
|---|---|
| Countdown | 20 s, pilot-tunable |
| Priority | Highest — outranks risk events and reward moments |
| Escalation trigger | "Need help" **or** timeout |
| Data sent | ⚠️ Not specified |

### 6 · Design requirements

- Full-bleed takeover, high contrast, one primary action, one secondary.
- Depleting ring + digit + bar all driven by one clock; colour shifts to danger below 35%.
- Parent side: distinct urgent sound (never the standard alert), full-screen, single action.
- **Required additions:** a "responding" state visible to the other guardian; an explicit statement of what the alert contains; a false-positive feedback tap that feeds threshold tuning.

---

## 8.4 Points, streak and the economy

**Spec:** F-13, F-14, A-1.1, A-1.2 · **Screens:** `Rewards.jsx`, `StreakDetail.jsx`, `Shop.jsx`, every Home layout

### 1 · Feature overview

The single currency that converts safe behaviour into everything else. Ten points per completed phone-free walking minute; bonuses for stops, days and streaks; spendable on eggs, EXP and items.

**Why it exists.** It answers the child's only real question about a safety app: *"Why should I bother?"*

### 2 · User perspective

The child's goal is a specific thing — an egg, an outfit, the next level — and points are the distance to it. The pain before: doing the right thing produced nothing observable.

### 3 · UX reasoning

**Why one currency and not two.** No gems, no coins, no energy. A second currency exists to create a paywall, and there is no payment. One currency keeps every price directly comparable to an amount of walking.

**Why partial minutes pay nothing.** The only anti-abuse rule in the client spec: a session ending before 60 seconds awards zero. Otherwise three steps out of the door is income.

**Why the streak has its own screen.** The home card shows a count; `StreakDetail` shows what it is *building toward* — the week so far, live milestone progress, and the one rule that makes a streak a streak. A number with no destination is not motivating.

**Why milestones and heat-tiers are separate ladders.** Flame tiers (3/10/30/100/200 days) are **dedication markers**; the payouts (7d/14d/30d/100d) are **rewards**. Conflating them would make every visual tier owe a prize.

**Cognitive load.** 🟠 The child now has: points, EXP, level, stage, streak days, flame tier, streak milestones, daily missions, weekly missions, badges, dex completion %, battle clears and reaction counts. That is **twelve progress systems**. A 7-year-old (`Yuna`, seeded) cannot hold that.
- *Recommendation:* an age-banded surface. `PLAYER.prefs.simpleMode` already exists in the data model and is not surfaced anywhere — that is the hook.

### 4 · User flow

```
walk (≥60s) ──▶ whole minutes × 10pt ──▶ POINTS ──┬─▶ eggs (500 / 1,500 / reward-only)
                                                  ├─▶ EXP (5pt = 1 EXP, min 10 EXP)
                                                  └─▶ items · decor · wallpaper
safe stop ──▶ +50 / +20 (verified, cooled, capped)
day roll  ──▶ accident-free +100 · 7d +300 · 14d +700 · 30d Epic Egg · 100d Legendary
missed day ──▶ streak resets to 0
```

**Empty state:** "Start walking to earn your first points." **Error state:** none (no network). **Edge:** timezone rollover ⚠️ undefined (D-1).

### 5 · Product logic

| Rule | Value |
|---|--:|
| Per completed safe minute | 10 pt |
| Minimum session | 60 s |
| Self-correct stop / post-warning stop | 50 / 20 pt |
| Daily accident-free | 100 pt |
| Streak 7 / 14 / 30 / 100 | 300 pt / 700 pt / Epic Egg / Legendary Egg |
| Daily bonus ceiling | 300 pt |
| Point → EXP | 5 pt = 1 EXP, minimum 10 EXP |

**BR:** points leave the wallet only if the EXP lands (`convertPointsToXp` computes the verdict before debiting), and a purchase can never overshoot the level cap. No dead spend, ever.

**Full-game pace:** Lv.1 → Lv.10 = 2,250 EXP = 11,250 points = **1,125 phone-free minutes ≈ 19 hours of safe walking**, bought purely with points. This single number is the pacing dial for the entire product and it is one server setting away from changing.

### 6 · Design requirements

Points chip (persistent, gold) · streak flame ladder (one size, art changes, greyscale when locked) · milestone rows with live progress · claim card with a genuine claimed state · **a designed state for every non-payment reason**.

---

## 8.5 Buddy growth and evolution

**Spec:** F-16, A-3.1, A-3.2, A-3.3 · **Screens:** `CharacterDetail`, `CharacterVariants`, `Shop`

### 1 · Feature overview

A character that levels from EXP and visibly transforms at Lv.4 and Lv.8. Three stages: Hatchling → Growing → Guardian.

**Why it exists.** Attachment is the retention mechanism. A number going up is not attachment; a creature that changes because of what you did is.

### 2 · User perspective

The child's goal is to see the buddy change. The motivation is ownership. The pain before: progress in safety apps is a chart their parent reads.

### 3 · UX reasoning

**Why evolution is automatic, not a button.** A manual "Evolve" would let a Lv.8 buddy sit un-evolved because the child never opened the screen. The transformation now fires *wherever* the level-up happens — including mid-battle, which is the best place it can happen. `StageUpMoment` recovers the ceremony the button would have provided.

**Why a stage grants no stats — stated twice in the code.** If evolving made you stronger, not evolving would be a penalty, and a child who cannot evolve yet is being punished for it. Stats come from rarity and level; the stage is art, animation, expression and dialogue. `setStatGrowth()` actively **ignores** a `stageMult` key if a server ever sends one. This is a guard against a future well-meaning engineer.

**Why stage is derived, never stored.** A stored stage can contradict the level it came from. `stageForLevel(level)` is computed on every read; the Tweaks panel sets the *level*, never the stage, so an illegal Stage-3 Lv.5 buddy cannot be produced even in a demo.

**Why a table, not a formula.** The approved curve *bends* — the step grows from +20 to +80. A linear formula cannot express it. `growth: 1.2` extends the curve past the table so raising `maxLevel` later still yields a sane ladder.

### 4 · User flow

Earn EXP (battle win · duplicate hatch · point exchange) → `gainXp()` carries overflow across levels → level rises → stage re-derived → if it crossed a threshold, `StageUpMoment` plays right where it happened → at Lv.10 the buddy is **maxed**, registered in the collection, and earns no more EXP → hatch a new egg and grow a different one. *That is the core loop* (A-3.2).

**Edge cases handled:** overflow carried across multiple levels · EXP hitting the cap returned as `lost` so the UI can say so · a seed character above the cap clamped at boot.

### 5 · Product logic

| Level | 1→2 | 2→3 | 3→4 | 4→5 | 5→6 | 6→7 | 7→8 | 8→9 | 9→10 | Total |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| EXP | 100 | 120 | 150 | 180 | 220 | 270 | 330 | 400 | 480 | **2,250** |

Stages: 1 = Lv.1–3 · 2 = Lv.4–7 · 3 = Lv.8–10. Stats = `(base[rarity] + perLevel[rarity] × (level−1)) × affinity(trait)`. **No stage term.**

### 6 · Design requirements

Hero at real stage/level/colour · XP bar (pinned full at cap, never a division by null) · stat bars scaled per-stat, not shared · `StageUpMoment` playable from any host screen · stage gear drawn in (scarf at 2, cape + shield at 3) · maxed state that reads as *completion*, not as *stuck*.

---

## 8.6 Eggs, rarity and acquisition — *the ethical core*

**Spec:** F-15, F-15.1, F-15.2, A-2, A-2.1, A-2.3, A-4.1 · **Screens:** `Shop`, `EggHatch`, `Collection`, `CharacterDex`

### 1 · Feature overview

Fifteen characters (8 Common · 5 Rare · 2 Epic). Eggs are bought with points or granted by behaviour; hatching rolls a tier, then a character within it. Duplicates convert to EXP.

### 2 · UX reasoning — and the decision to defend hardest

**Guaranteed unlocks sit beside the gacha.** A 7-day streak, 100 safe km, a 30-day streak, a 50% drop in phone use — each hands over a character outright, including a named Epic.

> **A child who never spends a single point can still reach the rarest characters.** This is the ethical guard-rail on a gacha aimed at children. It is the feature to lead with in any review and the one to refuse to trade away.

**Why the tier is rolled before the character.** If you rolled a character directly, shipping a new Common would silently dilute everyone's chance of pulling a Rare. Tier-first makes the odds a stable contract, independent of roster size.

**Why unowned characters are weighted 3×.** A duplicate is not a punishment, but it should not be the default experience.

**Why buying and hatching are two acts.** They used to be one: buying deducted the points and threw the child into the hatch overlay without the egg ever entering the bag — so a purchased egg was never owned, and an abandoned hatch took the points **and** the egg. Now `buyEgg` grants the egg; `hatchFromInventory` spends it. The reveal is atomic and the crack is latched, so a tap racing the shake gesture cannot hatch twice.

**Why the two Epics are invisible until unlocked (F-15.2).** No dex slot, no silhouette, no "???" placeholder, and **excluded from every completion denominator** — because 13 visible slots against a total of 15 would itself reveal that two exist.

**Usability risk.** 🟡 The reverse of the above: a child can hit "100%" complete and later discover the collection was never complete. That reveal is either a delight or a betrayal depending entirely on framing, and the framing is not designed.

### 3 · Product logic

| Egg | Price | Gate | Odds C/R/E |
|---|--:|---|---|
| Common | 500 pt | — | 8 / 2 / 0 |
| Rare | 1,500 pt | Lv.5+ | 3 / 6 / 0 |
| Epic | **reward-only** | — | 0 / 4 / 6 |

**BR-4: only an Epic Egg can hatch an Epic**, and an Epic Egg cannot be bought. That single pair of facts is the entire mechanism keeping the rarest characters rare — and, because of the battle balance in §8.7, the mechanism gating the ending.

Duplicates → 30 / 60 / 120 EXP by rarity.

### 4 · Design requirements

Egg tiers visually distinct without colour alone · crack → reveal sequence with a latched state · duplicate result must feel like a gain, not a loss (lead with the EXP) · rarity reveal backdrop · **no sparkles, no watermarks** (house rule).

---

## 8.7 Villain battles, story and encyclopedia

**Spec:** F-19, A-8, A-8.1, A-8.2, A-8.3, A-8.4, A-9 · **Screens:** `VillainDex` (the road), `Battle`, `BattleVersus`

### 1 · Feature overview

Ten original villains, Lv.1–10, fought sequentially. Not monsters — **each personifies a real risk to a walking child**: temptation, carelessness, impulse, darkness, confusion, complexity, anxiety, fear, and the two bosses behind them.

| Lv | Villain | Role | Personifies |
|--:|---|---|---|
| 1–8 | Temp · Haze · Rush · Noct · Glitch · Maze · Vex · Grim | minion | Temptation · carelessness · impulse · being unseen · rules breaking · losing your way · pressure · freezing |
| 9 | **Vilord** | mid-boss | The hand behind the other eight |
| 10 | **Nox** | final boss | The source — the dark the others are made of |

### 2 · UX reasoning

**Why the villains *are* the risks.** It is the only place in the product where the safety message is taught rather than enforced. A child who has beaten "Rush — moving before looking" has a name for the thing they do at kerbs. The dex entry is a character sheet, not a stat block, and the story chapter is the reward for *beating* it — so reading is earned.

**Why outcome is a roll, not a comparison.** The odds come from an analytically-solved duel across four stats (Courage → damage, Protection → reduction, HP → rounds survived, Speed → initiative) plus a +30 safe-walk bonus, converted through a logistic curve, bounded at 5%/95%. **The odds shown before the fight are the odds rolled against.** A weak buddy can win; a maxed one can lose.

**Why recommendation, never a gate.** A villain's level *is* its recommended level — one number, so the ladder and the advice cannot disagree. An under-levelled buddy can still be sent in, and the screen says so instead of refusing. Refusing would make the recommendation a lock and the ladder a wall.

**Why boss status is a role, not a row position.** `finalVillain()` matches `role === 'finalBoss'`. An appended seasonal villain therefore cannot steal the ending, the special reward or the finale. The previous `boss = last index` implementation would have handed all three to a newcomer silently.

**Why battles close while walking.** `canChallenge` returns `reason: 'walking'` and **replaces the screen**, not just the button. A villain card with an ability and a win chance is exactly what a child would stand and read at a kerb. The gate sits above the layout switch, so all ~38 layout variants are covered by one rule.

### 3 · Product logic

| Outcome | Points | EXP | Extra |
|---|--:|--:|---|
| First clear | 120 | 60 | Egg + story chapter + unlocks the next villain |
| Boss clear | more | more | Its own special reward tier |
| Final clear (Nox) | 500 | 200 | Epic Egg + the ending |
| Repeat clear | 40 | 20 | Increments clears; egg only on an ops-enabled roll |
| Loss | 10 | 0 | Consolation |

Five challenges per day, consumed on resolve, win or lose. Sequential unlock. Rewards modelled as `base + bonus` so *"a repeat pays less than a first clear"* holds **by construction** — a bonus can be zeroed but never inverted, and `setBattleRules` refuses a payload that would invert it.

> ### 🔎 Finding: the ending is gated on real behaviour, not spending
> A fully-grown **Rare** falls short of Nox and no amount of levelling closes the gap — Lv.10 is the cap. Only an **Epic** clears it, and an Epic comes from a 30-day streak, a 50% drop in phone use, or an Epic Egg that cannot be bought.
>
> **A child cannot buy their way to the ending. They have to earn it by walking safely for a month.** That may be the best thing in the design — but it must be a *decision*, not an accident. Whoever tunes `BATTLE_ODDS` or `BATTLE_REWARDS` next needs to know that loosening Epic availability shortcuts a month of behaviour change.
>
> ⚠️ This finding was computed against the older `power + 30 ≥ villain.power` rule. The engine is now a probabilistic duel (A-8.3). **The balance analysis must be re-run against `winChance()` before it is quoted again** (§6.3, D-8).

### 4 · Design requirements

Villain road map with sticker markers (no discs) · silhouette gate on undiscovered entries · pre-fight card showing the real odds and the real math · versus arena · frozen villain + numbers at roll time (so a first clear that advances the ladder cannot make the victory screen report the wrong villain) · story chapter reveal with a chapter counter · walking-state screen replacement.

---

## 8.8 Collection house, rooms and decoration

**Spec:** F-18, A-6, A-7, A-5.1, F-32 · **Screens:** `MyHouse`, `RoomStage`, `DecorateRoom`, `Collection`

### 1 · Feature overview

A public profile/house of themed rooms (Green · Town · Dream) where buddies are placed and decor arranged, plus a full-bleed illustrated **scene** the featured buddy stands in front of.

### 2 · UX reasoning

**Why decor is themed per room.** A bird feeder belongs to the Green Room; a bus stop to the Town Room. `rooms: ['*']` fits everywhere, so adding a fourth theme inherits the universal items without editing a single row — a new theme is a one-line job.

**Why every decoration is buyable with points (BR-3).** A `null` price means "unobtainable by saving", which A-5.1 forbids. There is no row in `DECOR` or `HOUSE_BGS` without a price. This is the same anti-pay-to-win ethic as the guaranteed unlocks.

**Why one item table with three views (ADR-008).** Outfits, decor and backgrounds share one `ITEMS` table. A new acquisition route lights up hats, wallpaper and furniture at once, instead of three times.

**Why the house is the social surface.** A visit lands here. It is the only thing in the product a child *makes* rather than earns, which is why it carries the reactions and the guestbook.

### 3 · Product logic
4 rooms (2 condition-locked) · free placement · slots per room · scenes: forest (real art), beach and city (**placeholder art**, flagged in code).

### 4 · Design requirements
Hotspot editor · room switcher · buddy switcher · locked-room state showing the requirement · **no motion on static lists** (house rule) · scene falls back to a solid backdrop if the image is missing.

---

## 8.9 Social — friends, visits, reactions, guestbook

**Spec:** F-32, F-32.1, A-10, A-10.1 · **Screens:** `Friends`, `AddFriends`, `FriendHouse`, `Guestbook` · **Module:** `core/moderation.jsx`

### 1 · Feature overview

Visit-only social. See a friend's featured buddy, browse their rooms, leave **one** positive reaction, and sign the guestbook — with a tap-stamp or, now, **a short typed note screened before it posts**.

### 2 · UX reasoning

**Why every reaction is positive.** Five options — Nice · Love it · Amazing · So cool · Well done — expressing *degrees of encouragement and nothing else*. A thumbs-down, an angry face or a laughing face in a children's product with no chat is a bullying vector, not a feature.

**Why one reaction per visitor.** Switching moves the count; tapping again takes it back. A child cannot stack five reactions to inflate a friend — and cannot be seen to give someone fewer than someone else.

**Why the total is derived.** `reactionTotal()` sums the breakdown. A stored `likes` field would drift the first time a reaction was switched.

**Why nicknames are not unique.** Search results show each match's system friend code to disambiguate, and the seed data deliberately contains two children called Yuna to prove the case is handled.

**Why a request needs approval.** `FRIEND_POLICY = { requiresApproval: true, approver: 'recipient' }` — one knob to move to auto / mutual / parent approval later.

**Why nothing is capped.** Friends, requests, reactions and gifts are uncapped **by explicit written policy** (`FRIEND_LIMITS` = all `null`), so no later change silently adds a ceiling. Scale is handled at the render layer instead: the friends list windows a page at a time behind an `IntersectionObserver`.

### 3 · The guestbook decision — and its reversal

**The original decision (ADR-010):** six fixed stamps, no text input anywhere. *"A free text box between two children is an unmoderated message channel."* Enforced by the **absence of an input element**, not by a filter.

**What shipped:** stamps *and* a typed note, screened by `core/moderation.jsx` — profanity, abuse, sexual language, phone numbers, social handles, e-mails and links are turned away before a note can post. The ruleset is server-owned and hot-updatable (`setRuleset`), because new slurs and evasion spellings appear faster than app releases. The client filter is the fast first gate; the server must re-screen on write.

**This is a genuine and defensible reversal** — expressiveness is real value, and the stamps remain the always-safe one-tap path for a seven-year-old with no keyboard. But it must be assessed honestly:

| | Stamps-only | Stamps + screened text (shipped) |
|---|---|---|
| Grooming / contact-exchange vector | **None** | Mitigated by PII patterns; **not eliminated** |
| Bullying | Impossible | Possible via unlisted phrasing |
| Moderation surface | Zero | Ongoing operational cost, forever |
| Expressiveness | Low | Real |

**🔴 What is missing to make the reversal safe:**
1. **No report/block affordance.** A child who receives a note that slipped through has no way to report it, and no way to block the sender. This is table stakes for any child-to-child text channel and it does not exist.
2. **No guardian visibility, by design.** `PARENT_SEES` lists "your messages and guestbook" as **private**. So an abusive note that passes the filter is invisible to the only adult in the system. The privacy promise and the safety promise are now in direct conflict, and the conflict was created by adding free text. See §6.3, D-3.
3. **No rate limit** on notes per child per day.
4. **No record of rejected text** — correct for privacy, but it means repeat-offender detection is impossible.
5. **`ADR-010` in `src/docs/ProjectDocs.jsx` still states that no text input exists.** The in-app documentation actively contradicts the shipped product.

### 4 · User flow

```
Friends ──▶ friend card ──▶ FriendHouse
                              ├─ react (one of five; switch or take back)
                              ├─ browse rooms
                              └─ guestbook
                                   ├─ tap a stamp ──▶ posts immediately
                                   └─ type a note ──▶ moderate()
                                                       ├─ clean ──▶ posts
                                                       └─ blocked ──▶ child-facing reason
                                                            (3 collapsed categories,
                                                             never the matched word)
```

**Why the reason is collapsed to three categories.** Telling a child *which word* was caught teaches them the filter. Telling them nothing teaches them the app is broken.

### 5 · Design requirements
Reaction row with a selected state · guestbook composer with an 80-char limit · a blocked state that is corrective, not punitive · **required: report + block, and a rate limit.**

---

## 8.10 Badges and achievements

**Spec:** A-4 (adjacent); no dedicated requirement · **Screens:** `Badges`, `AchievementUnlock`, `Collection`

### 1 · Feature overview
Eight achievements rendered as collectible medallions on a trophy shelf, tiered Common/Rare/Epic using the same rarity vocabulary as buddies.

### 2 · UX reasoning

**Why a badge is an artifact, not a checklist row.** `ACHIEVEMENTS` in `data.jsx` stays the single source of truth; `Badges.jsx` is a presentation layer. A badge with no achievement behind it cannot exist — everything on the shelf was earned by doing something.

**Why the same rarity words as characters.** A Rare badge and a Rare buddy are the same idea; a second vocabulary would be a second thing to learn.

**Why finished art, with a drawn fallback.** Rows carry an `img` medallion; any future row without one falls back to a computed rosette + lucide icon. Adding an achievement never blocks on art.

### 3 · 🔴 The critical gap

**No evaluator exists.** Every `done` flag and every `progress` value is hand-seeded. The code says so explicitly. Consequences:

- "Own 8 characters — 6/8" does not recount. Hatching a buddy does not move it.
- Achievement ids already act as grant triggers (`g-ach-*`, `u-ach-*`, `i-ach-*`), so **three reward faucets are wired to a system that can never fire.**
- **"Zone Dodger" requires avoiding danger zones — a feature excluded from this revision.** It is permanently unachievable as written, and it gates an egg grant. It is still in the roster.

`PROGRESS-BRIEF.md` proposes the fix and it is the right one: an achievement declares **what it watches** (`when: { metric, reach }`), never how far along it is. Progress and completion are derived on read. That vocabulary is *already* what the grant matcher speaks — so an achievement becomes a grant rule whose reward happens to be a badge, inheriting the ledger that makes it impossible to pay twice.

### 4 · Design requirements
Medallion grid · locked/unlocked without relying on colour alone · progress bar on incomplete rows · `AchievementUnlock` overlay (suppressed by any safety event) · detail sheet.

---

## 8.11 Child onboarding, pairing and permissions

**Spec:** F-26, F-33 · **Screen:** `Onboarding.jsx` (610 lines)

### 1 · Feature overview
Intro → enter the guardian's 6-digit code (or scan QR, 300s expiry) → four permissions requested one at a time → first egg → Home. **The child device holds no account.**

### 2 · UX reasoning

**Why no child account.** Nothing to leak, nothing to forget, nothing to phish. Identity comes from the family the device pairs with.

**Why permissions are staged with reasons (F-26).** Each is requested on its own screen with a plain "Needed to…" line, a fuller explanation, and — if declined — an amber note naming *exactly what stops working*. A wall of system dialogs produces a child who taps Deny four times.

**Why denial never dead-ends.** Declining offers **limited protection** with the specific loss named. `PERM_GRANTS` records what was actually granted, so Home can say *which* protection is off rather than only "limited" — and the OS can revoke one later, long after onboarding.

**Why the first egg is inside onboarding.** The setup ends with the child owning something. That is the whole retention argument compressed into one screen.

### 3 · Product logic

| Permission | Why | If denied |
|---|---|---|
| Motion / activity | "Needed to tell whether you are walking." | Warnings won't trigger at all |
| Usage access | "…when the screen is on and which apps are in use." *(never reads messages)* | Warnings are limited |
| Display over other apps | "Needed to show a warning when it's dangerous." → opens the system sheet | Smart warnings limited; vibration and notifications still work |
| Notifications | "Needed to receive rewards and guidance." | No reward/guidance alerts |

Pairing code: 6 digits, 300s expiry, inline error + shake on failure.

**🟠 Risk:** 6 digits = 10⁶. Needs server-side attempt lockout and short expiry (RISK-H).

### 4 · Design requirements
One permission per screen · reason before request · amber decline note · limited-protection confirm · Home banner naming the missing permission · egg hatch as the closing beat · **no QR/checkmark pill on waiting screens** (house rule — waiting uses mascot + ripple).

---

## 8.12 Guardian authentication, consent and the family

**Spec:** F-33, F-33.1, A-13, A-13.1 · **Screens:** `ParentOnboarding`, `core/auth.jsx` (603 lines), `ParentFamily`, `ParentInvite`

### 1 · Feature overview

```
sign up → 3 consents → phone → SMS code → set password → profile
log in  → phone + password
forgot  → phone → code → new password
```
Plus Google (Android) and Apple (iOS). Email is `enabled: false` — **modelled as a disabled method, not an absent one**, so enabling it later is a flag plus a form, not a rework.

### 2 · UX reasoning

**Why the SMS code is not the key.** It answers exactly one question — *is this number really yours?* — so it is spent only where that question is asked: at sign-up and at a password reset. A returning guardian types a number and a password and is in. Nothing is texted. This is the difference between an app a parent opens weekly and one they avoid.

**Why consent comes before the phone number.** Do not collect the identifier until consent exists. Each of the three consents (personal information, terms, location) opens its full body on its own page without losing the guardian's place.

**Why the family owns the child, not the parent who set it up.** A second guardian can be added or removed **without ever touching the child's phone** — no re-scan, no re-pair, no chance of knocking the first parent offline. Both guardians see identical data *by construction* rather than by syncing, because reports, points and settings are family-scoped.

**Why both roles can change everything.** The only difference is authority over the family itself (invite, remove, billing). Two guardians shown different numbers would be a support nightmare and would break the promise `PARENT_SEES` makes to the child. **Conflicts are solved with visibility, not permissions:** every change is stamped with who made it in `FAMILY_LOG`. *A parent locked out of a safety setting is a worse failure than a parent who has to ask "why did you loosen this?"*

**Why "Co-parent", not "Guardian".** "Guardian" is already the name of the character's Stage 3 (수호자). Two things called the same word in one app is one thing too many.

**⚠️ Location consent exists although GPS is excluded from scope.** Collecting consent for a capability the build does not have is defensible if it is forward-looking, and indefensible if a reviewer reads it as over-collection. Needs a documented position (§6.3, D-5).

### 3 · Product logic
`MAX_GUARDIANS = 2`, enforced in `addGuardian` (never a silent third) · the owner cannot be removed, only transferred · invites are single-use, 48h, and joining still requires the invitee to verify **their own** phone, so a leaked link alone gets nobody in · `MAX_CHILDREN = 5`, enforced at the mutation, not just the UI.

**⚠️ Needs clarification:** `MAX_CHILDREN = 5` and `MAX_GUARDIANS = 2` are modelled independently, and `LINK` joins one parent to one child. The relationship between "family", "children" and "link" is under-specified for the 2-guardian × 3-children case (D-6).

**Prototype reality:** any complete code passes; `KNOWN_PHONES` decides new-vs-existing. No token, no session.

### 4 · Design requirements
Floating-label field family with bottom-sheet pickers (Korean/KakaoPay register) · 180s resend lock with countdown · `autoComplete="one-time-code"` · shake on a bad code · consent rows that open full documents · provider buttons drawn (must be swapped for official Google/Apple artwork before store submission) · family log with attribution.

---

## 8.13 Guardian reporting

**Spec:** F-20, F-31 · **Screens:** `ParentReports`, `ParentAIReport`, `ParentActivity`, `ParentResponseDetail`, `ParentWeeklyDetail`

### 1 · Feature overview
A weekly dashboard leading with **behaviour change** — acceptance %, safe-walk minutes, average response, streak, each with a delta — plus a 7-day stacked chart of immediate / delayed / ignored, an alert feed, and a natural-language AI report.

### 2 · UX reasoning

**Why a reduction rate, not an incident count.** "14 risky moments this week" tells a parent their child is dangerous. "41% fewer than your child's own baseline" tells them the product is working. The first number sells fear once; the second sells renewal every week.

**Why the AI report is verdict-first.** A busy parent lands on the plain-language conclusion and one hero number *first* — not a paragraph. Then the narrative, with the figures they care about emphasised inline. Then **one** thing to try this week, highlighted above the rest. The takeaway does the work at a glance; the detail rewards whoever keeps reading.

**Why the narrative is per-child and tone-adaptive.** It reads `CHILD_REPORTS` keyed by the selected child, so switching to a struggling child changes the narrative rather than re-skinning one hard-coded story.

**Why a real child photo, never the buddy, in the parent app.** The switcher shows the child's own photo, then a default child photo, and only a mascot if both are missing. In the guardian's app, the subject is the child.

**Why the child's name is not repeated beside the switcher.** It already headlines the page.

### 3 · Product logic

| Metric | Definition |
|---|---|
| `riskReduction` | % fewer risk events vs this child's own baseline |
| `acceptance` | % of warnings ending in a **verified** stop |
| `safeWalkMin` | Phone-free walking minutes |
| `avgResponse` | Seconds to look up |
| `phoneUseDrop` | vs the child's own first week |

**🔴 Today the child's numbers and the parent's numbers are independently hardcoded.** They are not two views of one event stream. The data model already says one stream must feed both, and every week that ships without it makes the retro-fit harder.

**No LLM call exists.** The F-31 "AI report" is assembled from the data. That is fine for a prototype and must be labelled honestly to stakeholders — see §6.3, D-9.

### 4 · Design requirements
KPI tiles with deltas · unified chart palette across every report surface · Korean weekday axis · child switcher · drill-downs (response detail, weekly detail) · **loading skeletons** and an **empty state** for <1 week of data ("Gathering this week's data") · alert feed with per-kind tone tiles and the child's face on every row.

---

## 8.14 Guardian controls

**Spec:** F-22, F-21 (excluded) · **Screens:** `ParentSettings`, `ParentChildren`, `ParentSchedule` (parked)

### 1 · Feature overview
Per-child: mode, warning sensitivity, notifications, game on/off, blocked app categories, a read-only view of which permissions the child granted, and remove-child.

### 2 · UX reasoning

**Why Phone & Texts can never be blocked (BR-15).** `locked: true`. A child must always be able to call for help. It is rendered, visibly unblockable, rather than hidden — the guardian should *see* the guarantee.

**Why permissions are read-only here.** The grant lives on the child's OS. Showing a toggle the parent cannot honour would be a lie. Instead: a count of declined permissions with an amber tone.

**Why the parent can turn the whole game off.** Some households will want the intervention without the economy. The switch respects that without the product arguing.

**Why app *categories*, not app names.** Category-level control is the minimum that works; app names would be a surveillance surface.

### 3 · 🔴 The dead control

**Warning sensitivity (Gentle / Balanced / Strict) writes `cfg.sens` and nothing reads it.** Nothing in `INTERVENTION`, the overlay, or the detection contract consumes it. F-22's headline control is currently a slider that moves a number nobody uses — and its helper copy makes three specific promises ("warns only in clear risk", "warns earlier and more often") that the product does not keep.

This is the highest-severity *functional* gap in the parent app, because it is a control a guardian will believe they used. **Recommendation:** define sensitivity as a named multiplier set over `graceSeconds` / `buzzHoldSeconds` / `recheckSeconds`, ship it as a server-settings row like every other balance value, and have the setting write to the child's config. Proposed:

| Sensitivity | grace | buzzHold | recheck |
|---|--:|--:|--:|
| Gentle | 15 s | 3 s | 10 s |
| Balanced (default) | 10 s | 2 s | 5 s |
| Strict | 6 s | 1.5 s | 3 s |

⚠️ Values are a starting proposal for the pilot, not a decision.

### 4 · Design requirements
Mode switch that reshapes the form · sensitivity slider with per-step explanation *that is true* · category rows with a visibly locked row · consent summary · destructive remove-child behind a confirm sheet that states what is deleted.

---

## 8.15 Cross-cutting: the sound layer

**No spec ID** · **Module:** `core/sound.jsx` (370 lines)

Zero-asset audio: every cue is synthesised with the Web Audio API at play time. Nothing to ship, load or 404, and each cue is tunable as data.

**Two rules the engine obeys, and they are product rules, not technical ones:**

1. **It is feedback, never a safety guarantee.** A per-app mute silences all of it. The real safety signals — the child's buzz, the parent's urgent alert — are never a sound and are never muted. Nothing here can stand in for them.
2. **Different palettes per app.** The child game gets celebratory cues and BGM (villain road, battle, overlays). The guardian app gets only quiet functional ones — taps, a distinct alert, a pairing confirmation. No fanfares, no coins, no BGM in the parent app.

**Related deliberate omission:** there is **no child-facing haptics or push toggle**. The safety intervention *is* a buzz, so a switch that could silence it — without the child or the parent knowing protection was muted — would break the core promise. `PLAYER.prefs.sound` covers game sound effects only.

---
---

# Part IV — Cross-cutting systems

## 9. Design language

Full token reference lives in [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md). The design *decisions* worth recording here:

**Brand green is the product; ocean blue is the action.** The app background and hero surfaces are always brand green and are never tinted by the active character's colour — a house rule arrived at by review. The per-buddy accent tints components, not the world.

**`screenBgFor()` carries a neon guard.** Deriving the screen wash from an accent (hex → HSL → hue rotation → three stops) turns a saturated magenta fluorescent under the naive additive path. Colours above `s > 0.80` take a pastelising branch instead. Hence the standing rule: **use `tint()` to lighten an accent, never `shade()`.**

**Cards are a hairline plus a whisper**, never a floaty blur.

### The "reads as AI design" rules

These are real constraints in this project, arrived at through review, and they are the most portable thing in the design system:

| Rule | Why |
|---|---|
| **No glow shadows** on child-app buttons or cards | Reads as generated |
| **No sparkles, faded icon watermarks, or dotted progress bars** | Same |
| **No motion on static lists** | Motion belongs on the thing being tapped, not on a list of eggs |
| **Waiting states use mascot + ripple** — never a QR or checkmark pill | Same |
| **Mascots must feel lively and asymmetric** | Stiff, symmetric poses read as clip-art |
| **No centered empty screens** | Use a hero plus bottom-anchored CTAs |

**Typography:** Fredoka + Jua for kid-facing game headings only; Pretendard everywhere else (the de-facto Korean UI font — stops Korean falling back to a system serif). The parent app never uses the game font.

**Mascots:** one `<Mascot>` dispatcher over seven art styles. The `fox` species id is **legacy — it renders Hammy the hamster.** The `toy` style points at a directory that does not exist and renders broken (RISK-I).

## 10. Voice and content

| Surface | Register |
|---|---|
| Child game | Warm, second person, short. Korean 반말-adjacent friendliness |
| Warning tiers | Escalating but never shaming. The urgent tier states consequence ("this is going in your report"), never insult |
| Moderation rejection | Corrective, not punitive; three collapsed categories, never the matched word |
| Parent app | Calm, evidence-led, Korean 존댓말 |
| AI report | Verdict first, one recommendation, no hedging |

**⚠️ There is no written content/voice guide.** 1,201 localisation keys exist with no tone documentation behind them. Proposed outline in §7.

## 11. Localisation

English strings are the keys; the dictionary maps EN → KO; missing keys fall back to EN. The prototype boots in **Korean**. Never hardcode Korean in a component.

**Design consequence, not a technical one:** Korean is ~30% longer in places and much shorter in others. The 1.5s → 4s message-hold change (§8.1) came directly from a Korean line being unreadable at the spec's timing. **Timing values are localisation-sensitive** and should be validated per locale in the pilot.

## 12. State design

| State | Today |
|---|---|
| Loading | `jx-skeleton` shimmer; a dedicated `Sk` component in `Collection` |
| Empty | Designed for guestbook, notifications, friends. **Demo-toggled elsewhere** |
| Error | Inline + `jx-shake` |
| Success | `Confetti` · `HatchCelebration` · `StageUpMoment` — all suppressed by a safety event |
| Offline | **Simulated only.** No service worker, no cache |
| Limited | Permission denied → named limited-protection banner |

**Gap:** loading/empty/error are documented per screen in `DOCUMENTATION.md` but only some are built. Every data-backed screen needs all four before a handoff is real.

## 13. Accessibility — honest audit

**Present**
- `prefers-reduced-motion` respected; a "calm" play mode strips float and the game font
- Real `<button>` elements throughout — no click handlers on `div`s
- Some `aria-label`s (back, dex, colour swatches, reaction buttons)
- `autoComplete="one-time-code"`; focus not suppressed
- `PLAYER.prefs.calmMode` / `simpleMode` exist in the model

**Missing**
- 🔴 **No `aria-live` / `role` on the warning overlay.** A screen-reader user is never told a warning appeared — **in a safety feature.**
- 🔴 **No `aria-live` on the impact countdown**, which escalates on silence.
- ❌ Most icon-only buttons unlabelled
- ❌ No custom visible focus ring
- ❌ No skip link, no automated a11y test, no verified WCAG contrast audit
- ❌ Colour is sometimes the only cue (rarity, badge tier)
- ❌ `calmMode` / `simpleMode` are **not surfaced in the UI** — the accessibility section is currently hidden pending a direction decision

**This is the single most under-invested area of the product**, and the two 🔴 items are defects rather than backlog. Proposed direction in §7.

## 14. Configuration model

Anything ops might retune is a **settings object with a launch default and a validating setter with per-field fallback**. A malformed payload degrades to the shipped economy rather than breaking the game.

| Table | Setter | Notable validation |
|---|---|---|
| `XP_CURVE` | `setXpCurve` | `maxLevel ≥ 2`, finite positive steps |
| `STAGES` | `setStages` | Re-sorts, then re-derives every buddy |
| `STAT_GROWTH` | `setStatGrowth` | **Ignores `stageMult` on purpose** (BR-1) |
| `EXCHANGE` | `setExchange` | Rejects `pointsPerXp: 0` — would divide by zero and hand out infinite levels |
| `BATTLE_RULES` | `setBattleRules` | Refuses a payload where a repeat would out-pay a first clear |
| `BATTLE_ODDS` | `setBattleOdds` | Refuses negative stat weights, a floor > 0.3, a ceiling < 0.6 |
| `VILLAINS` | `setVillains` | Remaps by id, not index |
| Moderation | `setRuleset` | Hot-swappable wordlist |
| `POINTS`, `INTERVENTION` | **none yet** | 🟠 Documented as remote-owned; **no setter exists** |

**Gap:** `POINTS` and `INTERVENTION` are the two tables the pilot will most want to retune (F-30 reserves a tuning period specifically for them) and they are the two without a setter.

---
---

# Part V — Critical review

## 15. Documentation health

### 15.1 Drift register — `PROJECT_DOCUMENTATION.md` v1.0 vs the code

The engineering reference is dated 14 July. Twelve days of work have invalidated parts of it. **A reader who trusts it today will be wrong about the safety economy, the social model and the navigation.**

| # | The doc says | The code does | Severity |
|--:|---|---|---|
| 1 | Guestbook is **stamps only**; "no free text anywhere"; ADR-010 | Typed notes ship, screened by `moderation.jsx`. **`ProjectDocs.jsx` renders the contradiction in-app** | 🔴 |
| 2 | Immediate-stop bonus = +20, awarded on acknowledgement | Tiered 50/20, gated on four verified signals, 60s cooldown, 300pt/day cap | 🔴 |
| 3 | No impact/fall feature | `ImpactOverlay` (C7) ships, outranking everything | 🔴 |
| 4 | Battle = `power + 30 ≥ villain.power`; the "only an Epic beats Nox" analysis | Probabilistic four-stat duel (A-8.3). **The published balance analysis is stale** | 🔴 |
| 5 | Parent auth = phone + SMS, no password | Password added; login/sign-up split; three consents | 🟠 |
| 6 | Child tabs Home·Collect·Battle·Friends·Profile with Battle at centre | Centre opens the **villain road**; Safety is not a tab | 🟠 |
| 7 | Parent tabs Reports·Children·Rules | Reports·Children·Connect·Alerts·Profile | 🟠 |
| 8 | One guardian per account | `FAMILY`, `MAX_GUARDIANS = 2`, roles, invite, change log | 🟠 |
| 9 | 6 achievements | 8, tiered, with medallion art; `a2` removed | 🟡 |
| 10 | `data.jsx` is 1,528 lines | 2,535 | 🟡 |
| 11 | No persistence at all | `jx.buddy` persists in `localStorage` | 🟡 |
| 12 | No sound | 370-line synthesised audio engine, both apps | 🟡 |

Also stale: rooms/themes/scenes, streak ladder and milestones, `Notices`/`LegalDocs`, `ParentFamily`/`ParentWeeklyDetail`/`ParentResponseDetail`/`ParentReportsVariants`, and the villain reward table (eggs, boss tiers).

**Recommendation:** version the engineering doc against a commit and add a release-runbook step that fails a merge if a `data.jsx` rule changes without a doc line. The runbook already asks for this at step 5 — it is not being followed.

### 15.2 Requirements traceability problems

| Problem | Detail | Impact |
|---|---|---|
| 🔴 **Duplicate ID `F-33`** | Used for *"Guardian account sign-in"* **and** *"No friend/interaction limits"* in `SPEC-CHECKLIST.md` | Traceability breaks; a coverage claim cannot be verified |
| 🔴 **Unversioned second spec round** | `A-8.2`, `A-8.3`, `A-8.4`, `A-13`, `A-13.1`, `A-4.1`, `A-5.1`, `A-10.1`, `F-32.1`, **"spec #4"**, **"spec #6"**, **"C7"** are implemented and cited in code but appear in **no document in this repository** | The contract of record is incomplete. Nobody can audit what was agreed |
| 🟠 **Accepted deviations undocumented** | Message timing (1.5→4s, 3→4.5s) deviates from F-09/F-09.2 with a good reason recorded only in a code comment | A client review will read it as a defect |
| 🟠 **Excluded features still referenced** | "Zone Dodger" depends on excluded danger zones and gates an egg grant; location consent is collected though GNSS is out of scope | Unachievable content ships |

**Recommendation:** issue a **Functional Spec Revision 2** consolidating the second round, retiring the duplicate ID, recording the accepted deviations, and removing content that depends on excluded features. This is a half-day of work that removes the largest single risk to the client relationship.

## 16. Open product decisions

Numbered so they can be assigned. **None of these are specified anywhere. Whatever a developer writes becomes the product decision by default.**

| # | Decision | Why it matters | Recommendation |
|---|---|---|---|
| **D-1** | **What governs a "day"?** | Streaks, the daily bonus, the 300pt cap, daily missions and the 5-battle allowance all need a boundary. The only statement anywhere is "battles reset at local midnight" — and device-local is trivially cheatable while every point mutation must be server-side | Server-side day boundary in the family's registered timezone. **Decide before persistence is built** — it shapes the schema, and changing it later means migrating every streak |
| **D-2** | **What does a guardian do with an impact alert?** | They are told the child may be hurt and cannot see where they are. The privacy promise and the safety promise are in direct conflict | A **break-glass** location share: location is transmitted *only* on an escalated impact, is shown once, expires, is logged, and **the child is told in `PARENT_SEES` that this exception exists.** Anything less is a promise the product cannot keep; anything more breaks the promise it made |
| **D-3** | **Can a guardian ever see the guestbook?** | Free text now exists and the guardian is blind to it. An abusive note that passes the filter reaches nobody who can act | Keep the guardian blind, and give the **child** the tools instead: report + block + a rate limit. Escalate to the guardian only on a report. Preserves the promise and closes the hole |
| **D-4** | **Is there a warning-fatigue model?** | Nothing tracks a child seeing 40 warnings in a day. The tone ladder resets per event | Define a daily interaction budget; beyond it, reduce to buzz-only and flag the pattern in the parent report as a *coaching* signal, not a violation |
| **D-5** | **Why is location consent collected when GPS is out of scope?** | Reads as over-collection to a reviewer | Either remove it from the MVP consent set, or state on the consent page that it enables a future feature and is currently unused |
| **D-6** | **How do family, children and link relate at scale?** | 2 guardians × 5 children with a single `LINK` record is under-modelled | Family owns children; each child has its own link; guardians inherit access from family membership. Make it explicit in the data dictionary |
| **D-7** | **Client sign-off on the message-timing deviation** | 4s / 4.5s vs the spec's 1.5s / 3s | Present the Korean-readability evidence and get it recorded in Revision 2 |
| **D-8** | **Re-run the battle balance analysis** | The published "only an Epic beats Nox" finding predates the probabilistic engine | Recompute against `winChance()` at every rarity × level and republish. If the ending is no longer behaviour-gated, that is a product change nobody decided to make |
| **D-9** | **Is F-31 an actual LLM feature?** | The screen is a composed narrative; no model call exists | Decide before it is demoed as "AI". If yes, specify the prompt contract, the data that leaves the device, the failure state, and the child-privacy position on sending behaviour data to a model |
| **D-10** | **Is there a daily point ceiling on walking?** | Bonus points are capped; walking points are not. A long walk out-earns every designed reward path | Probably correct as-is (time-bound), but state it as a decision |
| **D-11** | **Which response counts as "immediate"?** | The spec's own bands overlap: "within 10s" is immediate and "5–10s" is delayed. A stop at 7s satisfies both | Define disjoint bands. This gates the 50pt bonus *and* the guardian's acceptance metric |
| **D-12** | **What replaces "Zone Dodger"?** | Permanently unachievable; gates an egg grant | Replace with a motion-only achievement of equivalent difficulty |
| **D-13** | **What does the free tier withhold?** | Undecided, and it determines whether the product is ethical | Never the intervention. Gate reporting depth |
| **D-14** | **Age banding** | Twelve progress systems, seeded personas from 6 to 11 | Surface `simpleMode` as an age-set-at-pairing default, not a buried toggle |

## 17. UX and product risks

| ID | Risk | Severity | Why |
|---|---|---|---|
| **RISK-A** | **No walk session, no day boundary, no persistence** | 🔴 Blocking | Every downstream system — points, streaks, achievements, reports — has no input. A reload wipes everything. This is not a bug list, it is the gap between a prototype and a product |
| **RISK-B** | **Client-authoritative economy** | 🔴 Blocking | Hatch rolls, battle outcomes and point mutations are client-side. A client mutation could grant infinite points. Must move server-side before any public release |
| **RISK-C** | **The safety overlays are inaccessible** | 🔴 High | No `aria-live` on the warning; none on a 20-second countdown that escalates on silence |
| **RISK-D** | **Free text with no report, no block, no rate limit, no guardian visibility** | 🔴 High | A child-to-child text channel missing every standard safety control |
| **RISK-E** | **Warning sensitivity is a dead control** | 🔴 High | F-22's headline setting writes a value nothing reads, with helper copy that promises specific behaviour |
| **RISK-F** | **Child and parent numbers are independent** | 🟠 Architecture | Separately hardcoded. One event stream must feed rewards *and* the report, or they will drift in production |
| **RISK-G** | **No achievement evaluator** | 🟠 | Three reward faucets are wired to a system that cannot fire; displayed progress contradicts live state |
| **RISK-H** | **Pairing-code brute force** | 🟠 | 6 digits = 10⁶; needs lockout and short expiry, server-side |
| **RISK-I** | **Broken `toy` mascot asset path** | 🟡 | Renders broken if selected. Ship the assets or remove the style |
| **RISK-J** | **Bundle size** | 🟠 | >500 kB, mostly unchosen layout variants. Deleting them is the single biggest performance win, available the day directions are signed off |
| **RISK-K** | **No error boundary** | 🟡 | One exception blanks the app — including during a safety event |
| **RISK-L** | **Cognitive overload for the youngest users** | 🟠 | Twelve concurrent progress systems against a seeded 6-year-old persona |

## 18. Recommendations, prioritised

**Before anything else (product-defining, cheap)**
1. Answer **D-1** (day boundary) — it shapes the schema and cannot be changed later without migrating every streak.
2. Answer **D-2** (impact + location) — the product currently promises something it cannot deliver.
3. Ship **report + block + rate limit** on guestbook notes (D-3 / RISK-D). Free text without them should not ship.
4. Add `aria-live` and roles to the warning and impact overlays (RISK-C). One afternoon.

**Next (correctness)**
5. Wire warning sensitivity, or remove the control and its copy (RISK-E).
6. Rewrite achievements as `when` rules and call `claimRewards()` at the real moments (RISK-G) — the engine exists, idempotent, with zero call sites.
7. Re-run and republish the battle balance (D-8).
8. Feed the parent report from the same event stream as child rewards, even with mock events (RISK-F). Retro-fitting shared truth after two hardcoded tables ship is materially harder.

**Then (contract hygiene)**
9. Issue **Functional Spec Revision 2** (§15.2).
10. Re-version `PROJECT_DOCUMENTATION.md` and delete the contradicted ADR-010 from the in-app docs.
11. Add setters for `POINTS` and `INTERVENTION` — the two tables the pilot most needs to retune.

**Then (production readiness)**
12. Server-authoritative economy (RISK-B).
13. Unit tests over `data.jsx` — pure functions, one file, rule-dense, the cheapest high-value work in the repo.
14. TypeScript, starting with grant rules, verdicts and settings payloads.
15. Prune the variant galleries once directions are signed off (RISK-J).

---

## 19. Documentation this product should have and does not

Each of these is a real gap for a product at this stage, with a proposed outline.

| Document | Why it's needed | Proposed contents |
|---|---|---|
| **Functional Spec Revision 2** | The contract of record is incomplete (§15.2) | Consolidate the second round; retire duplicate `F-33`; record accepted deviations; remove excluded-feature dependencies |
| **Content & voice guide** | 1,201 localisation keys, zero tone documentation | Register per surface · the tone ladder as a writing rule · what the urgent tier may and may not say · moderation-rejection copy patterns · Korean register rules · number/date formatting |
| **Accessibility standard + audit plan** | Two 🔴 defects in safety surfaces | Target (WCAG 2.2 AA) · the announcement contract for every overlay · focus order per screen · the `calmMode`/`simpleMode` product direction · axe in CI |
| **Research plan and findings log** | Every UX claim here is reasoned, none is tested | Pilot protocol for F-30's tuning period · what "90% detection accuracy" is measured against · the four questions only field data can answer (timing, fatigue, false positives, comprehension by age) |
| **Service blueprint** | The product spans two apps, two people, a sensor and a backend that doesn't exist | Front-stage / back-stage / support for: the safety moment, the impact escalation, pairing, adding a co-parent, a moderation rejection |
| **Safety & ethics review** | A children's product with a gacha, a social channel and fall detection | Gacha ethics position · moderation escalation policy · impact false-positive policy · the location break-glass decision · what a child is told, and when |
| **Analytics & event taxonomy** | No instrumentation exists; the metrics in §3.3 cannot currently be measured | The event list in `PROJECT_DOCUMENTATION.md` Appendix K is a good start — add the impact and moderation events, and the privacy constraint (no location, no message content, no app names — categories only) |
| **Onboarding-to-retention funnel spec** | Nothing defines what "activated" means | Pair → permissions granted → first hatch → first verified stop → day-7 streak. Instrument each; each is a place the product leaks |
| **Localisation QA matrix** | Timings are locale-sensitive (§11) | Per-locale read-time validation for every timed surface |
| **Design QA / handoff checklist** | Variants are design inventory, not product | Per screen: all four states built · a11y announcement · reduced-motion · both locales · both play modes |

---
---

# Part VI — Case-study cut

> ### JoanX — a game that gets children to look up while they walk.

**Problem.** Children walk head-down into traffic. Every existing answer is punitive — block the phone, lock the screen, track the child — and children route around them, resent them, or uninstall them. A safety app a child defeats is worth nothing.

**Thesis.** Make looking up the thing that wins the game.

**Solution.** Two apps sharing one model. For the child, a game where safe walking is the only currency: points, EXP, eggs, a buddy that grows through three stages, and ten villains who *are* the risks — temptation, carelessness, impulse, darkness, fear. For the guardian, a dashboard that reports behaviour change — acceptance rate, response time, streaks — and deliberately **not** location.

**Role.** Product design and full front-end implementation: information architecture, design system, every screen in both apps, the reward economy and rule engine, localisation, and the living documentation.

**Three decisions worth defending in a portfolio review**

1. **The stop bonus is earned, not tapped.** The bonus used to land on a button press, so a child could dismiss the warning, keep scrolling, and bank points — the product was paying for a tap and calling it safety. It is now gated on four verified signals, cooled down 60 seconds and capped at 300 points a day, and it pays **more for stopping before a warning was ever needed** than for stopping after one. Paying the warning→stop loop as well as never needing a warning would teach a child to earn warnings.

2. **A child who never spends a point can still reach the rarest characters.** Guaranteed behaviour-based unlocks sit beside the egg gacha: a 30-day streak hands over an Epic outright. It is the ethical guard-rail on a gacha aimed at children, and it turned out to be load-bearing — because of the battle balance, the ending is reachable only with an Epic, which means *the ending is gated on a month of real behaviour change, not on spending.*

3. **The guardian is shown behaviour, not location — and the child is shown that list.** `PARENT_SEES` is data, not copy in two places, so the two apps cannot describe the same monitoring differently. It sells trust to the child as well as the parent, which is what keeps the app installed.

**Hard problems solved**
| Challenge | Solution |
|---|---|
| A reward engine that can't double-pay | One matcher, three ledgers, and `isOwed()` returning a **count**, not a boolean — so 80 km walked pays all three 25-km eggs, and a one-shot rule settles forever |
| Tuning the economy without app releases | Validating settings setters with **per-field** fallback to launch defaults; a malformed payload degrades to the shipped economy |
| A villain system that survives seasons | Boss status is a **role**, not a row position — an appended seasonal villain can never steal the ending |
| Client review speed | Dozens of live, switchable layout variants: direction chosen in the real app, not a deck |

**What I would do differently.** Not 35 layout variants of one screen — genuinely useful for client review, and most of the bundle. And I would have versioned the second requirements round the day it arrived instead of letting it live in code comments; the traceability debt in §15.2 is the most avoidable thing in this document.

---

## Appendix A — Glossary (delta from `PROJECT_DOCUMENTATION.md` §24)

| Term | Meaning |
|---|---|
| **Safe stop** | A stop that satisfies all four verification signals. Only a safe stop pays the bonus |
| **Self-correct** | Stopping in the grace or buzz window, before any warning renders. Pays the most (50 pt) |
| **Farmed / capped** | A real stop that does not pay — inside the 60s cooldown, or past the 300pt daily ceiling. Still logged for the report |
| **Impact event (C7)** | A detected fall. The highest-priority surface in the product; outranks everything |
| **Family** | The household that owns the children and the data. Up to 2 guardians; one owner |
| **Co-parent** | The second guardian. Equal data and settings authority; no invite, remove or billing rights |
| **Reaction** | One of five positive-only responses left on a visit. One per visitor, switchable |
| **Ruleset** | The server-owned, hot-swappable moderation wordlist (`setRuleset`) |
| **Heat tier** | A streak-length landmark (3/10/30/100/200 days). A dedication marker, **not** a reward tier |
| **Scene** | The full-bleed illustrated backdrop on the public profile, distinct from flat wallpaper |
| **Calm / simple mode** | Child prefs that strip decoration and reduce density. In the model; not yet surfaced |

## Appendix B — Screen inventory as built

**Child (36 files).** `Onboarding` · `AppIntro` · `ChildHome` + `HomeVariants` + `HomeVariantsSimple` · `SafetyStatus` · `WarningOverlay` · **`ImpactOverlay`** · `LiteBlock` (parked) · `Collection` + `CollectionVariants` · `CharacterDetail` + `CharacterVariants` · `CharacterDex` + `CharacterDexVariants` + `DexHeaders` · `VillainDex` · `Battle` + `BattleVariants` + **`BattleVersus`** · `Shop` · `EggHatch` · `Rewards` · **`StreakDetail`** · **`Badges`** · **`AchievementUnlock`** · `MyHouse` + **`RoomStage`** + `DecorateRoom` · `Friends` · `AddFriends` · `FriendHouse` · `Guestbook` · `Notifications` · **`Notices`** · `Profile` + **`ProfileVariants`** · `HelpSupport` · `AboutJoanX`

**Parent (16 files).** `ParentOnboarding` · `HowItWorks` · `ParentAddChild` · `ParentReports` + **`ParentReportsVariants`** · `ParentAIReport` · **`ParentWeeklyDetail`** · **`ParentResponseDetail`** · `ParentChildren` · `ParentActivity` · `ParentSettings` · `ParentSchedule` (parked) · `ParentAccount` · `ParentDetail` · **`ParentFamily`** · `ParentInvite`

**Core (8).** `data.jsx` (2,535) · `i18n.jsx` (1,155) · `characters.jsx` (964) · `auth.jsx` (603) · `primitives.jsx` (502) · **`sound.jsx`** (370) · **`moderation.jsx`** (148) · `nav.jsx` (73)

**Bold** = added since the last documentation pass and undocumented until now.

## Appendix C — Decision log additions

Decisions made since ADR-010 that have no ADR:

| Proposed | Decision | Status |
|---|---|---|
| **ADR-011** | Guestbook free text with server-owned moderation — supersedes ADR-010 | Shipped, **undocumented** |
| **ADR-012** | Safe-stop verification: reward the behaviour, never the acknowledgement | Shipped, undocumented |
| **ADR-013** | Tiered stop bonus — self-correction pays more than a prompted stop | Shipped, undocumented |
| **ADR-014** | The family owns the child, not the parent who set it up | Shipped, undocumented |
| **ADR-015** | Impact/fall detection as the top of the intervention hierarchy | Shipped, undocumented |
| **ADR-016** | Battle outcome is a probabilistic four-stat duel, not a power comparison | Shipped, undocumented |
| **ADR-017** | Zero-asset synthesised audio; safety signals are never sound | Shipped, undocumented |
| **ADR-018** | No child-facing haptics toggle — the intervention is a buzz | Shipped, undocumented |

---

*End of document. Every claim above is traceable to `src/`, the client functional spec, or the git history. Every gap is marked, and no gap has been filled with an assumption.*
