// JoanX — mock data for the prototype (stand-ins for API responses).

// ── Feature flags ─────────────────────────────────────────────────────
// `dangerZones` gates the location / danger-zone family (F-05 danger-zone
// algorithm, F-06 GNSS) — EXCLUDED in the 2026.06.18 revision. Off = the
// in-scope build (Smart mode, motion only, no GPS). Flip to true to bring
// the danger-zone + GNSS surfaces back for reference.
const FEATURES = { dangerZones: false };

// A-8: villain challenges are rate-limited per day. The counter resets daily;
// in the prototype it persists for the session only.
const BATTLES_PER_DAY = 5;

// A-8.1: the FIRST victory over a villain unlocks story progression, the next
// villain, and the first-clear reward. Re-challenging an already-beaten villain
// is allowed indefinitely, but pays a smaller repeat reward — it exists for
// character progression and record improvement, not for farming.
// Server-configurable: reward policy is a business decision.
const BATTLE_REWARDS = {
  firstClear: { points: 120, xp: 60 },
  repeat:     { points: 40,  xp: 20 },   // strictly lower than firstClear
  loss:       { points: 10,  xp: 0 },    // consolation for trying
};

const PLAYER = {
  name: 'Mina', age: 11, points: 1240,
  streak: 5, level: 7, xp: 320, xpMax: 400,   // xpMax = xpForLevel(7); see XP_CURVE
  safeMinutesToday: 47, safeWalkGoal: 60,
  activeCharId: 'c2',
  battlesToday: 0,                         // A-8: 0 … BATTLES_PER_DAY
  // public profile / house (F-32 / A-6·A-7)
  friendCode: 'JNX-MINA-27', likes: 18, houseBg: 'sky',
};

// ── Today's tasks (child home) — small daily missions that pay a bonus.
// `done` seeds which are already cleared; the rest can be tapped complete.
const TODAY_TASKS = [
  { id: 't1', icon: 'footprints',  title: 'Finish a phone-free walk',  reward: 100, done: true },
  { id: 't2', icon: 'shield-check', title: 'Reach your safe-walk goal', reward: 50,  done: false },
  { id: 't3', icon: 'heart-handshake', title: 'Say hi to your buddy',   reward: 20,  done: false },
];

// ── House backgrounds (A-6) — the backdrop of the child's profile ─────
const HOUSE_BGS = [
  { id: 'sky',    name: 'Sky',    grad: 'linear-gradient(180deg,#eaf3ff,#ffffff 82%)', owned: true },
  { id: 'sunset', name: 'Sunset', grad: 'linear-gradient(180deg,#ffe7d4,#ffffff 82%)', owned: true },
  { id: 'mint',   name: 'Mint',   grad: 'linear-gradient(180deg,#e2f6ec,#ffffff 82%)', owned: true },
  { id: 'grape',  name: 'Grape',  grad: 'linear-gradient(180deg,#efe6fd,#ffffff 82%)', owned: false, cost: 200 },
  { id: 'candy',  name: 'Candy',  grad: 'linear-gradient(180deg,#ffe4f0,#ffffff 82%)', owned: false, cost: 200 },
  { id: 'night',  name: 'Night',  grad: 'linear-gradient(180deg,#d9e1f5,#ffffff 82%)', owned: false, cost: 300 },
];

// ── Room decoration items (A-7) — placed inside a room ────────────────
const DECOR = [
  { id: 'plant',   name: 'Plant',   icon: 'sprout',       owned: true,  cost: 0 },
  { id: 'lamp',    name: 'Lamp',    icon: 'lamp',         owned: true,  cost: 0 },
  { id: 'rug',     name: 'Rug',     icon: 'square',       owned: false, cost: 80 },
  { id: 'shelf',   name: 'Bookshelf', icon: 'library',    owned: false, cost: 120 },
  { id: 'poster',  name: 'Poster',  icon: 'image',        owned: false, cost: 90 },
  { id: 'balloon', name: 'Balloons', icon: 'party-popper', owned: false, cost: 60 },
];

// messages friends have left on MY profile (F-32 guestbook, received side)
const MY_GUESTBOOK = [
  { by: 'Jisoo', avatar: 'cat',  color: '#e278a8', text: 'Love your Hammy!', liked: true },
  { by: 'Aria',  avatar: 'owl',  color: '#b9a3ef', text: 'Your room is so cozy 💜', liked: false },
  { by: 'Tom',   avatar: 'bird', color: '#67c7ce', text: 'Streak buddies! 🔥', liked: false },
];

// add-friends flow
const FRIEND_REQUESTS = [
  { id: 'rq1', name: 'Sora', avatar: 'owl', color: '#b9a3ef', mutual: 1 },
];
const FRIEND_SUGGESTIONS = [
  { id: 's1', name: 'Emma', avatar: 'cat',  color: '#f0a6c0', mutual: 2 },
  { id: 's2', name: 'Kai',  avatar: 'fox',  color: '#e1874a', mutual: 1 },
  { id: 's3', name: 'Yuna', avatar: 'bird', color: '#67c7ce', mutual: 3 },
];

// ── Point & reward criteria (F-13 / F-14 · spec A-1.1) ───────────────
// Server-configurable: these values are business policy, not app logic, and are
// expected to arrive from remote settings so they can be tuned without an app
// release. The literals below are the launch defaults / offline fallback.
const POINTS = {
  perSafeMinute: 10,           // 10 pt per completed minute of phone-free walking
  minSessionSeconds: 60,       // a session ending before 1 min awards nothing
  immediateStopBonus: 20,      // +20 for stopping phone use right after a warning
  dailyAccidentFreeBonus: 100, // +100 for an accident-free day
  streak7Days: 7,   streak7Bonus: 300,        // +300 at 7 accident-free days
  streak30Days: 30, streak30Reward: 'epic-egg', // 30 days → Special Egg / event reward
};

// F-13: "10 pt per minute of non-use while walking." (alias — prefer POINTS)
const SAFE_PT_PER_MIN = POINTS.perSafeMinute;

// ── Staged intervention (F-07 / F-08 · spec F-08.1–F-08.3) ───────────
// One risk event can run several intervention rounds:
//   grace → buzz → (risk persists holdMs) → warning overlay → character message
//   → dismissed or ignored → recheckMs cooldown → re-assess → buzz + warning again
// Server-configurable like POINTS: the cooldown and round cap are policy, and the
// tone ladder is copy, so both are expected from remote settings. Forced screen
// blocking is deliberately absent — it is out of MVP scope (F-10).
const INTERVENTION = {
  graceSeconds: 10,     // F-07 — self-correct window before any intervention
  buzzHoldSeconds: 2,   // F-08.1 — risk must persist this long past the buzz to warrant a warning
  // F-08.2 — cooldown after a dismiss/ignore: for this long, the same hazardous situation
  // produces no further warning of any kind. When it lapses the risk is re-assessed, and only
  // if the unsafe behavior is still going does the next round fire. Pilot-tunable.
  recheckSeconds: 5,
  // F-08.4 — the overlay comes down as soon as the risk ends (phone put away, or walking
  // stops), but sensors flutter: a single stray sample would otherwise flicker the overlay
  // off and back on. So the safe state must hold for this long before the overlay is removed.
  // Short enough to feel instant, long enough to outlast a blip. Pilot-tunable.
  safeConfirmSeconds: 1,
  maxRounds: 3,         // tone ladder length; further rounds repeat the strongest tier
  // F-09 — character message: on screen for messageSeconds, and at least
  // messageGapSeconds must pass before another one appears. Both are pilot-tunable, so
  // they live here rather than in the component — remote settings can retune them without
  // an app release once field data comes back.
  messageSeconds: 1.5,
  messageGapSeconds: 3,
  // F-08.3 — each ignored round comes back firmer. Tone only: never a screen block.
  tiers: [
    { key: 'gentle', title: 'Eyes up,',        body: "Let's put the phone away while we're walking." },
    { key: 'firm',   title: 'Still walking,',  body: 'Phone down until you stop — I mean it this time.' },
    { key: 'urgent', title: 'This is unsafe,', body: 'Stop walking or put the phone away now. This is going in your report.' },
  ],
  // F-09 — the same line twice running breeds fatigue and then resistance, so each tone
  // tier gets a pool the toast rotates through. Keep every pool at 3+ lines: the rotation
  // guarantees no back-to-back repeat only while there is something else to say.
  messages: {
    gentle: ['Eyes up!', 'Phone away for now', 'Look ahead!', 'Watch your step!'],
    firm:   ['Still on your phone?', 'Eyes on the path, please', 'Phone down while walking', 'Head up — I mean it'],
    urgent: ['Stop walking — now', 'This is unsafe', 'Put the phone away', 'Look up before you get hurt'],
  },
};

// The tone tier for an intervention round (1-based); the last tier repeats at the cap.
const interventionTier = (round) =>
  INTERVENTION.tiers[Math.min(Math.max(round, 1), INTERVENTION.tiers.length) - 1];

// F-09 — the rotation pool for a round's tone tier.
const interventionMessages = (round) => INTERVENTION.messages[interventionTier(round).key];

// F-12 / F-20 — every risk event is logged: the outcome classification feeds the
// reward system (immediate-stop bonus) and the parent report. In-memory for the
// prototype; the shipped app posts these to the server.
const RISK_EVENT_LOG = [];

// outcome: 'immediate' (stopped in the grace/buzz window) · 'delayed' (stopped after a
// warning) · 'ignored' (dismissed or ignored through every round and still walking).
const logRiskEvent = (event) => { RISK_EVENT_LOG.push(event); return event; };

// ── XP curve & level cap (F-16 · spec A-3.1 / A-3.2) ─────────────────
// EXP to reach the next level starts low and grows by a fixed step each level:
//   Lv1→2 100 · Lv2→3 150 · Lv3→4 200 · Lv4→5 250 · Lv5→6 300 …
// At maxLevel the character has completed its final growth stage, is registered
// in the Collection, and earns no further EXP.
// Server-configurable like POINTS/EGGS — balancing is business policy, so these
// are the launch defaults / offline fallback.
const XP_CURVE = { base: 100, step: 50, maxLevel: 10 };

const isMaxLevel = (level) => level >= XP_CURVE.maxLevel;

// EXP required to go from `level` to `level + 1`, or null at the cap (A-3.2).
const xpForLevel = (level) => isMaxLevel(level)
  ? null
  : XP_CURVE.base + Math.max(0, level - 1) * XP_CURVE.step;

// ── Outfits (A-5 · character customization) ──────────────────────────
// Bought on the buddy's own detail screen, not in the Points shop — an outfit
// belongs to a character, so it is chosen while looking at that character.
//   price     — point cost (0 = granted, no purchase)
//   minStage  — evolution stage required before it can be worn/bought
const OUTFITS = [
  { id: 'scarf',   icon: 'shirt',          name: 'Hero Scarf',     price: 0,   minStage: 2 },
  { id: 'cape',    icon: 'wind',           name: 'Guardian Cape',  price: 0,   minStage: 3 },
  { id: 'bow',     icon: 'gift',           name: 'Ribbon Bow',     price: 200, minStage: 1 },
  { id: 'glasses', icon: 'glasses',        name: 'Cool Shades',    price: 250, minStage: 1 },
  { id: 'cap',     icon: 'graduation-cap', name: 'Explorer Cap',   price: 280, minStage: 2 },
  { id: 'crown',   icon: 'crown',          name: 'Star Crown',     price: 300, minStage: 3 },
];

// ── Egg shop (A-2 · MVP) ─────────────────────────────────────────────
// Cost and eligibility per rarity. Like POINTS, these are business policy and
// are expected to come from server settings so ops can tune them without an
// app release; the values below are the launch defaults / offline fallback.
//   price    — point cost, or null when the egg cannot be bought with points
//   minLevel — player level required to purchase (0 = no gate)
//   sources  — how an unbuyable egg is obtained instead
//   odds     — relative weight per rarity tier of what hatches. A pricier egg does not
//              guarantee a rarer buddy, it shifts the odds. Only the Epic Egg can hatch an
//              Epic, which is what keeps the two hidden characters genuinely rare (F-15.2).
const EGGS = [
  { id: 'common', rarity: 'common', name: 'Common Egg', price: 500,  minLevel: 0,
    odds: { common: 8, rare: 2, epic: 0 } },
  { id: 'rare',   rarity: 'rare',   name: 'Rare Egg',   price: 1500, minLevel: 5,
    odds: { common: 3, rare: 6, epic: 0 } },
  { id: 'epic',   rarity: 'epic',   name: 'Epic Egg',   price: null, minLevel: 0,
    sources: ['Events', 'Special missions', 'Achievement rewards'],
    odds: { common: 0, rare: 4, epic: 6 } },
];

// ── Rarity tiers (A-4 / F-15) ────────────────────────────────────────
// The tier list is data, not a hard-coded union: a future tier (Legendary,
// seasonal-only…) is one more entry here plus its dex styling. Nothing below
// counts tiers or assumes there are exactly three.
//   dupXp              — XP a duplicate of this tier converts to
//   hiddenUntilUnlocked — the character is not shown anywhere until it is owned:
//                        no dex slot, no silhouette, no "???" placeholder (F-15.2)
const RARITIES = [
  { key: 'common', label: 'Common', badge: 'default', dupXp: 30 },
  { key: 'rare',   label: 'Rare',   badge: 'primary', dupXp: 60 },
  { key: 'epic',   label: 'Epic',   badge: 'epic',    dupXp: 120, hiddenUntilUnlocked: true },
];

const rarityOf = (key) => RARITIES.find(r => r.key === key) || RARITIES[0];

// ── Character roster (F-15 · MVP = 15 characters) ────────────────────
// 8 Common · 5 Rare · 2 Epic. `set` groups a release: everything shipping in the
// MVP is 'mvp', and a seasonal or event drop is a new set added here (and gated by
// the server) without touching any screen — the dex renders whatever the roster holds.
//   owned  — in the child's collection
//   locked — how an unowned character is obtained (dex hint; hidden tiers never show it)
const CHARACTERS = [
  // ── Common ×8 ──
  { id: 'c2',  species: 'cat',  name: 'Mochi',   color: '#e1874a', stage: 2, rarity: 'common', set: 'mvp', level: 4, xp: 140, owned: true,  room: 'r1', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c3',  species: 'bird', name: 'Pip',     color: '#447aaf', stage: 1, rarity: 'common', set: 'mvp', level: 2, xp: 60,  owned: true,  room: 'r1', traits: { guard: 40, speed: 72, heart: 50 } },
  { id: 'c10', species: 'cat',  name: 'Bloo',    color: '#a8c3eb', stage: 2, rarity: 'common', set: 'mvp', level: 4, xp: 140, owned: true,  room: 'r2', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c11', species: 'cat',  name: 'Cocoa',   color: '#a9744f', stage: 1, rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 45, speed: 70, heart: 62 } },
  { id: 'c12', species: 'bird', name: 'Sky',     color: '#5aa9e6', stage: 1, rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 38, speed: 78, heart: 55 } },
  { id: 'c13', species: 'croc', name: 'Snap',    color: '#5c9e6b', stage: 1, rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 72, speed: 44, heart: 58 } },
  { id: 'c14', species: 'owl',  name: 'Pebble',  color: '#8b8073', stage: 1, rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 60, speed: 50, heart: 66 } },
  { id: 'c15', species: 'fox',  name: 'Biscuit', color: '#d8a657', stage: 1, rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 52, speed: 64, heart: 70 } },
  // ── Rare ×5 ──
  { id: 'c1',  species: 'fox',  name: 'Hammy',   color: '#4b814f', stage: 2, rarity: 'rare',   set: 'mvp', level: 7, xp: 320, owned: true,  room: 'r1', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c6',  species: 'owl',  name: 'Sunny',   color: '#e0554a', stage: 2, rarity: 'rare',   set: 'mvp', level: 5, xp: 350, owned: true,  room: 'r2', traits: { guard: 60, speed: 85, heart: 64 } },   // XP-full → ready to evolve to Stage 3 (F-16)
  { id: 'c9',  species: 'fox',  name: 'Toffee',  color: '#d99c5a', stage: 2, rarity: 'rare',   set: 'mvp', level: 7, xp: 320, owned: true,  room: 'r2', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c16', species: 'owl',  name: 'Luna',    color: '#7c5cbf', stage: 1, rarity: 'rare',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Rare Egg', room: null, traits: { guard: 66, speed: 58, heart: 74 } },
  { id: 'c17', species: 'croc', name: 'Basil',   color: '#3f7f8c', stage: 1, rarity: 'rare',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Rare Egg', room: null, traits: { guard: 84, speed: 48, heart: 68 } },
  // ── Epic ×2 — hidden until unlocked (F-15.2): no dex slot, no silhouette, no name ──
  { id: 'c18', species: 'croc', name: 'Ember',   color: '#9867e4', stage: 1, rarity: 'epic',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Walk safely 30 days in a row', room: null, traits: { guard: 95, speed: 70, heart: 88 } },
  { id: 'c19', species: 'bird', name: 'Zephyr',  color: '#e0559a', stage: 1, rarity: 'epic',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Win a special event mission', room: null, traits: { guard: 80, speed: 96, heart: 82 } },
];

// F-15.2 — an Epic stays invisible until it is unlocked. Every "show me the roster"
// surface (dex, collection, totals) goes through this, so a hidden character leaks
// nowhere — not even as a locked slot or a completion denominator that hints at it.
const isRevealed = (c) => c.owned || !rarityOf(c.rarity).hiddenUntilUnlocked;
const visibleCharacters = () => CHARACTERS.filter(isRevealed);
const charactersOfRarity = (key) => CHARACTERS.filter(c => c.rarity === key);

// xpMax is derived, never authored — the curve is the single source of truth.
// At the cap there is no "next level", so the bar is pinned full rather than
// left dividing by null. `maxed` marks a character that finished its growth.
CHARACTERS.forEach(c => {
  c.level = Math.min(c.level, XP_CURVE.maxLevel);
  c.maxed = isMaxLevel(c.level);
  c.xpMax = c.maxed ? xpForLevel(XP_CURVE.maxLevel - 1) : xpForLevel(c.level);
  c.xp = c.maxed ? c.xpMax : Math.min(c.xp, c.xpMax);
});

const ROOMS = [
  { id: 'r1', name: 'Cozy Den',   unlocked: true,  slots: 3, theme: '#ecf3fe' },
  { id: 'r2', name: 'Sky Loft',   unlocked: true,  slots: 3, theme: '#ebf4f4' },
  { id: 'r3', name: 'Star Studio', unlocked: false, slots: 4, theme: '#f5f1fd', req: 'Collect 8 characters' },
  { id: 'r4', name: 'Garden',     unlocked: false, slots: 4, theme: '#f9f1ed', req: 'Reach a 30-day streak' },
];

const ACHIEVEMENTS = [
  { id: 'a1', icon: 'footprints', name: 'First Steps',    desc: 'Walk safely for 10 minutes',  done: true,  reward: 50 },
  { id: 'a2', icon: 'flame',      name: '5-Day Streak',   desc: 'Be safe 5 days in a row',      done: true,  reward: 120 },
  { id: 'a3', icon: 'timer',      name: 'Quick Reflex',   desc: 'Stop within 3s, 10 times',     done: true,  reward: 80 },
  { id: 'a4', icon: 'shield-check', name: 'Zone Dodger',  desc: 'Avoid 5 danger zones',         done: false, progress: 3, total: 5, reward: 150 },
  { id: 'a5', icon: 'gem',        name: 'Collector',      desc: 'Own 8 characters',             done: false, progress: 6, total: 8, reward: 200 },
  { id: 'a6', icon: 'sunrise',    name: 'Early Walker',   desc: 'Safe morning commute, 7 days', done: false, progress: 4, total: 7, reward: 130 },
];

// child reaction log (feeds parent report)
const REACTIONS_7D = [
  { day: 'Mon', immediate: 4, delayed: 2, ignored: 1 },
  { day: 'Tue', immediate: 5, delayed: 1, ignored: 1 },
  { day: 'Wed', immediate: 3, delayed: 2, ignored: 0 },
  { day: 'Thu', immediate: 6, delayed: 1, ignored: 0 },
  { day: 'Fri', immediate: 5, delayed: 1, ignored: 1 },
  { day: 'Sat', immediate: 7, delayed: 0, ignored: 0 },
  { day: 'Sun', immediate: 6, delayed: 1, ignored: 0 },
];

// risk events per day (trend going down = good)
const RISK_TREND = [9, 8, 7, 5, 6, 4, 3];

const PARENT_METRICS = {
  riskReduction: 41,        // % fewer risk events vs first week
  acceptance: 88,           // % of warnings the child accepted (stopped)
  safeWalkMin: 312,         // total safe-walking minutes this week
  avgResponse: 2.4,         // avg seconds to stop
};

// Per-child weekly report data — drives the whole Reports dashboard when the
// parent switches child in the header. Keyed by child id (see CHILDREN below).
// `delta` strings carry their own sign; the dashboard colors them by whether
// the direction is good for that metric (for avgResponse, lower is better).
const CHILD_REPORTS = {
  k1: { // Mina — steady improvement (smart mode)
    acceptance: 88, safeWalkMin: 312, avgResponse: 2.4, streak: 5,
    deltas: { acceptance: '+6%', walk: '+12%', resp: '-0.3s', streak: '+2' },
    reactions: [
      { day: 'Mon', immediate: 4, delayed: 2, ignored: 1 }, { day: 'Tue', immediate: 5, delayed: 1, ignored: 1 },
      { day: 'Wed', immediate: 3, delayed: 2, ignored: 0 }, { day: 'Thu', immediate: 6, delayed: 1, ignored: 0 },
      { day: 'Fri', immediate: 5, delayed: 1, ignored: 1 }, { day: 'Sat', immediate: 7, delayed: 0, ignored: 0 },
      { day: 'Sun', immediate: 6, delayed: 1, ignored: 0 },
    ],
    risk: [9, 8, 7, 5, 6, 4, 3],
  },
  k2: { // Leo — needs attention (lite mode, often offline)
    acceptance: 61, safeWalkMin: 174, avgResponse: 4.3, streak: 2,
    deltas: { acceptance: '-4%', walk: '+3%', resp: '+0.5s', streak: '-1' },
    reactions: [
      { day: 'Mon', immediate: 2, delayed: 3, ignored: 3 }, { day: 'Tue', immediate: 3, delayed: 2, ignored: 2 },
      { day: 'Wed', immediate: 2, delayed: 3, ignored: 2 }, { day: 'Thu', immediate: 4, delayed: 2, ignored: 1 },
      { day: 'Fri', immediate: 3, delayed: 2, ignored: 3 }, { day: 'Sat', immediate: 4, delayed: 1, ignored: 2 },
      { day: 'Sun', immediate: 3, delayed: 2, ignored: 2 },
    ],
    risk: [11, 12, 10, 13, 11, 12, 10],
  },
  k3: { // Yuna — doing great (smart mode, long streak)
    acceptance: 94, safeWalkMin: 268, avgResponse: 1.8, streak: 8,
    deltas: { acceptance: '+9%', walk: '+15%', resp: '-0.6s', streak: '+3' },
    reactions: [
      { day: 'Mon', immediate: 5, delayed: 1, ignored: 0 }, { day: 'Tue', immediate: 6, delayed: 0, ignored: 0 },
      { day: 'Wed', immediate: 4, delayed: 1, ignored: 0 }, { day: 'Thu', immediate: 7, delayed: 0, ignored: 0 },
      { day: 'Fri', immediate: 6, delayed: 1, ignored: 0 }, { day: 'Sat', immediate: 5, delayed: 0, ignored: 0 },
      { day: 'Sun', immediate: 7, delayed: 0, ignored: 0 },
    ],
    risk: [6, 5, 5, 4, 3, 3, 2],
  },
};

// Parent activity feed — recent safety moments across all children. `kind`
// drives the icon + tone in ParentActivity; `child` is a CHILDREN id. Split by
// `today` into the Today / Earlier sections. Newest first within each section.
const PARENT_ALERTS = [
  { id: 'n1', kind: 'warning',    child: 'k1', title: 'Distraction warning', sub: 'Near Oak Street crossing',   time: '8m',  today: true },
  { id: 'n2', kind: 'safe',       child: 'k3', title: 'Safe walk completed',  sub: '22 min phone-free',          time: '40m', today: true },
  { id: 'n3', kind: 'ignored',    child: 'k2', title: 'Warning ignored',      sub: 'Kept scrolling while walking', time: '1h', today: true },
  { id: 'n4', kind: 'device_off', child: 'k2', title: 'Device disconnected',  sub: 'Galaxy A14 went offline',    time: '2h',  today: true },
  { id: 'n4b', kind: 'limited',   child: 'k2', title: 'Protection limited',   sub: 'Display-over-apps was turned off', time: '3h', today: true },
  { id: 'n5', kind: 'streak',     child: 'k3', title: '8-day safe streak!',   sub: 'New personal best',          time: 'Yesterday', today: false },
  { id: 'n6', kind: 'safe',       child: 'k1', title: 'Safe morning commute', sub: 'School route, no warnings',  time: 'Yesterday', today: false },
  { id: 'n7', kind: 'device_on',  child: 'k1', title: 'Device reconnected',   sub: 'iPhone 13 back online',      time: '2d',  today: false },
];

const CHILDREN = [
  { id: 'k1', name: 'Mina', age: 11, mode: 'smart', device: 'iPhone 13', battery: 72, online: true,  lastSeen: 'now', avatar: 'fox',  color: '#e1874a', streak: 5,
    pendingDevice: { device: 'Galaxy S24', when: 'just now', where: 'Seoul, KR · new network' },
    cfg: {
      mode: 'smart',
      cats: { video: true, games: true, social: true, browser: false, camera: false, phone: false },
      sens: 2, notif: true, gam: true,
      rules: [
        { t: 'School commute', s: 'Mon–Fri · 7:30–8:30 AM', tag: 'Strict' },
        { t: 'After school',   s: 'Mon–Fri · 3:00–5:00 PM', tag: 'Balanced' },
        { t: 'At home',        s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' },
      ],
    } },
  { id: 'k2', name: 'Leo',  age: 8,  mode: 'lite',  device: 'Galaxy A14', battery: 45, online: false, lastSeen: '2h ago', avatar: 'bird', color: '#67c7ce', streak: 2,
    cfg: {
      mode: 'lite',
      cats: { video: true, games: true, social: true, browser: true, camera: false, phone: false },
      sens: 3, notif: true, gam: false,
      rules: [
        { t: 'School commute', s: 'Mon–Fri · 8:00–8:40 AM', tag: 'Strict' },
        { t: 'Playground',     s: 'Daily · 4:00–6:00 PM',   tag: 'Strict' },
        { t: 'At home',        s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' },
      ],
    } },
  { id: 'k3', name: 'Yuna', age: 6,  mode: 'smart', device: 'iPhone SE', battery: 88, online: true,  lastSeen: 'now', avatar: 'owl', color: '#b9a3ef', relation: 'daughter', sibling: 'youngest', streak: 8,
    cfg: {
      mode: 'smart',
      cats: { video: true, games: true, social: true, browser: false, camera: false, phone: false },
      sens: 2, notif: true, gam: true,
      rules: [
        { t: 'School commute', s: 'Mon–Fri · 8:10–8:40 AM', tag: 'Strict' },
        { t: 'At home',        s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' },
      ],
    } },
];

// ── Character encyclopedia (A-4): species blurbs for the dex ──────────
const SPECIES_INFO = {
  fox:  { label: 'Fox',  blurb: 'Clever and brave — always the first to look up and check the road.' },
  cat:  { label: 'Cat',  blurb: 'Quick on its feet. Loves a fast, safe dash across a quiet street.' },
  bird: { label: 'Bird', blurb: 'Eyes in the sky — spots busy crossings from far away.' },
  owl:  { label: 'Owl',  blurb: 'A calm, watchful night-walker who never rushes.' },
  croc: { label: 'Croc', blurb: 'Tough and steady. Nothing rattles this careful walker.' },
};

// ── Villain ladder (A-8) — PvE only, defeated sequentially. The first
//    undefeated villain is the current challenger; ones past it stay
//    "undiscovered" (silhouette) in the encyclopedia (A-9). ──────────
const VILLAINS = [
  { lv: 1,  name: 'Smombie Rookie',    species: 'cat',  color: '#8a94a6', power: 60,  defeated: true,  desc: 'A freshly-hatched screen zombie. Shuffles along, eyes glued to the glow.' },
  { lv: 2,  name: 'Smombie Walker',    species: 'fox',  color: '#7d8698', power: 95,  defeated: true,  desc: 'Walks and scrolls at once — bumps into lampposts, never looks up.' },
  { lv: 3,  name: 'Distractor',        species: 'bird', color: '#6f7a90', power: 130, defeated: true,  desc: 'Pings and buzzes to steal your attention at the worst moment.' },
  { lv: 4,  name: 'Dark Walker',       species: 'owl',  color: '#5f6b82', power: 165, defeated: false, desc: 'Crosses the road head-down in the dark. Your next challenge.' },
  { lv: 5,  name: 'Crossroad Phantom', species: 'croc', color: '#586582', power: 205, defeated: false, desc: 'Haunts busy junctions, luring walkers into traffic.' },
  { lv: 6,  name: 'Alley Stalker',     species: 'cat',  color: '#515d78', power: 245, defeated: false, desc: 'Lurks where sightlines are short and cars come fast.' },
  { lv: 7,  name: 'Screen Master',     species: 'fox',  color: '#49566f', power: 285, defeated: false, desc: 'Bends every walker to the pull of the screen.' },
  { lv: 8,  name: 'Attention Reaper',  species: 'bird', color: '#414d66', power: 330, defeated: false, desc: 'Harvests focus until nothing is left for the road.' },
  { lv: 9,  name: 'Doom Walker',       species: 'owl',  color: '#39445c', power: 380, defeated: false, desc: 'Marches on, blind to every warning.' },
  { lv: 10, name: 'King Smombie',      species: 'croc', color: '#2f3a52', power: 440, defeated: false, desc: 'Ruler of the screen zombies. Beat it to master the streets.' },
];

// A-8.1: how many times each villain has been cleared. The first clear is the
// one that unlocks the ladder; every clear after it pays the repeat reward.
VILLAINS.forEach(v => { v.clears = v.defeated ? 1 : 0; });

// ── Friends (F-32 / A-10) — visit-only: featured buddy, rooms, likes,
//    one-line guestbook. No chat, no real-time interaction. ──────────
const FRIENDS = [
  { id: 'f1', name: 'Jisoo', avatar: 'cat',  color: '#e278a8', online: true,  streak: 9,  chars: 11, likes: 24, liked: false,
    featured: { species: 'cat',  name: 'Cloud',  color: '#e278a8', stage: 3, rarity: 'epic' },
    rooms: [{ name: 'Candy Room', theme: '#fdeef5' }, { name: 'Cloud Loft', theme: '#eef4fd' }],
    guest: [{ by: 'Tom', text: 'Your Cloud is so cool!' }, { by: 'Aria', text: 'Nice 9-day streak 🔥' }] },
  { id: 'f2', name: 'Tom',   avatar: 'bird', color: '#67c7ce', online: false, streak: 4,  chars: 7,  likes: 12, liked: true,
    featured: { species: 'bird', name: 'Sky',    color: '#67c7ce', stage: 2, rarity: 'rare' },
    rooms: [{ name: 'Ocean Nook', theme: '#e9f4f5' }],
    guest: [{ by: 'Mina', text: 'Sky looks awesome!' }] },
  { id: 'f3', name: 'Aria',  avatar: 'owl',  color: '#b9a3ef', online: true,  streak: 15, chars: 14, likes: 31, liked: false,
    featured: { species: 'owl',  name: 'Nova',   color: '#b9a3ef', stage: 3, rarity: 'rare' },
    rooms: [{ name: 'Star Studio', theme: '#f5f1fd' }, { name: 'Moon Deck', theme: '#eef0fb' }],
    guest: [{ by: 'Jisoo', text: 'Teach me your streak secrets!' }, { by: 'Tom', text: '15 days, wow' }] },
];

const APP_CATEGORIES = [
  { id: 'video',   name: 'Video',         icon: 'play', blocked: true },
  { id: 'games',   name: 'Games',         icon: 'gamepad-2', blocked: true },
  { id: 'social',  name: 'Social',        icon: 'message-circle', blocked: true },
  { id: 'browser', name: 'Web Browser',   icon: 'globe', blocked: false },
  { id: 'camera',  name: 'Camera',        icon: 'camera', blocked: false },
  { id: 'phone',   name: 'Phone & Texts', icon: 'phone', blocked: false, locked: true },
];

// Onboarding permission grants. Smart mode is the only mode, so every
// permission is requested one screen at a time (Android-style special
// permissions). `blurb` = the one-line "Needed to…" summary shown in the
// overview list; `detail` = the request-sheet body; `warn` = the amber
// note shown if the child declines.
const PERMISSIONS = [
  { id: 'motion', icon: 'activity', name: 'Motion · Activity recognition',
    blurb: 'Needed to tell whether you are walking.',
    detail: 'JoanX uses activity recognition to notice when you start walking, so it only steps in at the right moment.',
    warn: 'If denied, JoanX can’t tell when you start walking, so warnings won’t trigger.', required: true },
  { id: 'usage', icon: 'app-window', name: 'Usage access',
    blurb: 'Needed to know when the screen is on and which apps are in use.',
    detail: 'This lets JoanX see when the screen is on and which app is open while you walk. It never reads your messages.',
    warn: 'If denied, JoanX can’t tell the screen is in use while walking, so warnings are limited.', required: true },
  { id: 'overlay', icon: 'layers', name: 'Display over other apps',
    blurb: 'Needed to show a warning when it’s dangerous.',
    detail: 'This permission is needed to show a warning on screen when it’s dangerous while you walk. You will be taken to the settings screen.',
    warn: 'If denied, Smart mode warnings are limited. Vibration and notifications will still work.', required: true,
    settings: true },  // "special" permission → opens the settings request sheet; others grant on tap
  { id: 'notif', icon: 'bell', name: 'Notifications',
    blurb: 'Needed to receive rewards and guidance.',
    detail: 'JoanX sends gentle warnings and reward updates to you, and progress notes to your parent.',
    warn: 'If denied, you won’t receive reward and guidance alerts.', required: true },
];

export { ACHIEVEMENTS, BATTLES_PER_DAY, BATTLE_REWARDS, APP_CATEGORIES, CHARACTERS, CHILDREN, CHILD_REPORTS, DECOR, EGGS, FEATURES, FRIENDS, FRIEND_REQUESTS, FRIEND_SUGGESTIONS, HOUSE_BGS, INTERVENTION, MY_GUESTBOOK, PARENT_ALERTS, PARENT_METRICS, OUTFITS, PERMISSIONS, PLAYER, POINTS, RARITIES, REACTIONS_7D, RISK_EVENT_LOG, RISK_TREND, ROOMS, SAFE_PT_PER_MIN, SPECIES_INFO, TODAY_TASKS, VILLAINS, XP_CURVE, charactersOfRarity, interventionMessages, interventionTier, isMaxLevel, isRevealed, logRiskEvent, rarityOf, visibleCharacters, xpForLevel };
