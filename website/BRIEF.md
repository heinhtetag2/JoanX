# JoanX — Website Brief

**Deliverable:** one responsive marketing page, built in the store-listing idiom (Google Play
product page), published as a standalone artifact and linked from this repo.
**Written:** 16 September 2026 · from the repo at `main`, the functional spec (2026-06-18), and
`PRODUCT-DESIGN-DOC.md`.

---

## 1 · What the product actually is

JoanX is a **behaviour-intervention system for children who use a phone while walking** —
*스몸비*, the smartphone zombie. It runs on the child's own phone with no wearable, using the
built-in accelerometer and device state. Two apps, one data model: the **child app is a game**,
the **parent app is a calm weekly dashboard**.

The thesis, and the one sentence the whole site has to carry:

> **Make looking up the thing that wins the game.**

JoanX never takes the phone away. It buzzes once; if the behaviour continues a card appears; if
it continues again the child's own buddy speaks. **Stopping is what pays** — in points, in a
buddy that visibly grows, in villains that can then be beaten.

Everything else on the page exists to make that credible.

### The constraints that are the product

These are real constraints in the code, not positioning. They are the strongest material the
page has, because every competitor's page claims the opposite:

| The product does | Because |
|---|---|
| Never blocks the screen (the strongest tier is a firmer sentence) | A child defeats a blocker, and the parent believes they are protected when they are not |
| Never shares location, messages or photos with the parent | A child who feels watched uninstalls the app |
| Shows the child, by name, exactly what the parent can see | The same reason |
| Has no chat between children — visits, likes, screened one-line notes | No unmoderated channel between children, ever |
| Can never block Phone & Texts | A child must always be able to call for help |
| Hands over the rarest buddies for behaviour, not payment | It is a gacha aimed at children |
| Measures a child against **their own first week**, never other children | Ranking punishes whoever started worst |

---

## 2 · Audience and the page's job

**Primary reader:** a guardian of a 6–13-year-old, on a phone, deciding in about ninety seconds
whether this is worth installing on their child's phone. They arrive suspicious of two things —
that it will be another blocker their child defeats, and that it will spy.

**Secondary reader:** the client, partners and pilot schools, who need to see the product whole.

**The page's single job:** get that guardian from *"another parental-control app"* to
*"this is a game my child would keep, and it doesn't watch them"* — and then into the live
prototype.

**Primary action:** open the interactive prototype (`jaonx-prototype.vercel.app`).
**Secondary action:** understand the safety moment and the data-sharing rules well enough to
repeat them to a partner.

---

## 3 · Why a store-listing page

The guardian's decision already happens on a store listing, so the page borrows that grammar:
icon and title block, a metric strip, an action row, a horizontally scrolling screenshot rail,
*About this app*, and — the piece that matters most here — a **Data safety** table. Play's data
table is usually a liability; for JoanX it is the pitch, because the honest answer is
*location: never shared*.

What we do **not** borrow: star ratings, download counts and reviews. There are none, and
inventing them would be the one thing on this page that is not true.

---

## 4 · Content inventory (all of it sourced, nothing invented)

1. **Listing header** — name, developer (Joan Company), category (Parenting · Safety), the
   honest facts strip: ages 6–13 · no location tracking · no ads · 한국어 / English · prototype.
2. **Action row** — *Open the live prototype* (primary) · App Store / Google Play marked
   *not yet released* · 7-day free trial planned, **pricing not announced**.
3. **Screenshot rail** — ten real captures from the running prototype: child home, the warning
   moment, collection, villain road, child profile, parent weekly report, children list, groups,
   group detail, invite QR.
4. **About this app** — the thesis, the two-app model, what a week looks like.
5. **The safety moment** — the staged intervention with its real timings: 10s grace → one
   vibration → 2s hold → warning card → buddy message → 5s cooldown → firmer round, max 3.
   Response outcomes: immediate / delayed / ignored / dismissed.
6. **The game loop** — 10 pt per phone-free minute, +50 self-correct, +20 after a warning,
   streak payouts at 7/14/30/100 days; eggs at 500 / 1,500 pt / reward-only; Lv.1–10 across three
   stages; ≈19 hours of safe walking to max a buddy.
7. **The ten villains** — each personifies a real risk: Ping (notifications), Temo (temptation),
   Vortex (the scroll), Moody, Chrono, Hexa, Shatter, Twist, Puppet (mid-boss), Vilord (final).
8. **For the guardian** — weekly acceptance rate, safe-walk minutes, average response time,
   7-day response chart, verdict-first AI summary, alert feed, impact/fall escalation, and
   guardian **groups** (up to 5, QR invite, admin approval, one main guardian per child per group).
9. **Data safety** — the `PARENT_SEES` table verbatim in structure: shared vs never shared.
10. **What JoanX never does** — the three refusals, stated plainly.
11. **Footer** — prototype link, spec status, "prototype, not a shipping app" note.

### Honesty rules for this page

- No fabricated ratings, reviews, download counts or testimonials.
- No prices. `PLANS` in the code is labelled *not a decided price*; the page says the trial is
  7 days and pricing is not announced.
- Numbers shown inside screenshots are demo data from the prototype and are labelled as such.
- Detection accuracy is a stated target (90%+, with a tuning period reserved), never a claim.
- The page says plainly that this is a working prototype, not a released app.

---

## 5 · Design direction

**Inherit the product's own system rather than inventing one.** JoanX has a design system and,
more usefully, a set of house rules arrived at through review: no glow shadows, no sparkles or
faded watermarks, no motion on static lists, cards are a hairline plus a whisper. The site obeys
them, so it looks like the app's own world and not like a template.

- **Colour** — brand green `#4B814F` (the product), deep green `#2F5733`, ocean `#447AAF` (the
  in-game action colour), gold `#D19900` *reserved for points and XP only*, rust `#D14532` for
  the ignored/urgent state. Neutrals biased green, never pure grey. Both light and dark themes.
- **Type** — **Fredoka** for display (the app's own game face), **Noto Sans KR** for body (the
  product is Korean-first and the page carries Hangul), **IBM Plex Mono** for timings and spec
  IDs (F-07, F-08.1) — the product's own document conventions used as texture.
- **Layout** — a store listing's single column at phone width; at desktop the header splits into
  listing-left / hero-phone-right, and the sections below stay in one readable column with the
  screenshot rail and villain strip running past it as horizontal scrollers.
- **The one bold move** — the safety moment drawn as a **timing rail**: a real stopwatch strip
  with the actual seconds on it, because the timings *are* the design of this product and no
  other app's page could show this strip.

**Responsive:** phone-first; one column under 700px, two-column header and 3-up feature grids
above; the rails scroll horizontally at every width; nothing but the rails scrolls sideways.

---

## 6 · Success criteria

1. A guardian who reads only the header strip and the first screen knows it does not lock the
   phone and does not track location.
2. The safety moment is understandable without playing anything.
3. Every number on the page can be traced to the spec, the code, or is labelled demo data.
4. It reads as the same product as the prototype it links to.
5. It works at 375px.
