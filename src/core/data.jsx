// JoanX — mock data for the prototype (stand-ins for API responses).

import { shade } from './characters.jsx';   // room themes tint their walls from the chosen wallpaper

// ── Feature flags ─────────────────────────────────────────────────────
// `dangerZones` gates the location / danger-zone family (F-05 danger-zone
// algorithm, F-06 GNSS) — EXCLUDED in the 2026.06.18 revision. Off = the
// in-scope build (Smart mode, motion only, no GPS). Flip to true to bring
// the danger-zone + GNSS surfaces back for reference.
const FEATURES = { dangerZones: false };

// ── A-8.1 · Battle rewards & the daily limit ─────────────────────────
// Every win pays the BASIC reward. A first win pays that basic reward PLUS a first-clear
// bonus, and only a first win moves the story on and opens the next villain. This is
// modelled as base + bonus rather than as two independent tiers on purpose: written as
// separate numbers, "repeat must be lower than first clear" is an invariant somebody has
// to remember, and a server payload could quietly break it. Written as base + a bonus that
// cannot be negative, a repeat is lower than a first clear BY CONSTRUCTION.
//
// perDay is the daily challenge limit — and therefore the daily reward limit, since a
// challenge is the only thing that pays out. Business policy, so it lives here.
const BATTLE_RULES_DEFAULTS = {
  perDay: 5,
  base:            { points: 40,  xp: 20 },              // paid on EVERY win, first or not
  // A-8.4 — a first clear pays Points, EXP **and an Egg**. The egg is the point: the ladder
  // is a character faucet, so beating a villain for the first time hands you a new buddy to
  // hatch, not just a number that goes up.
  firstClearBonus: { points: 80,  xp: 40, egg: 'common' },
  // A-8.4 — the two bosses are not just bigger first clears; each pays an ADDITIONAL special
  // reward on top of the ordinary first clear. Keyed off the ROLE, never off "the 9th villain"
  // or "the last one" — a seasonal villain appended to the ladder must not inherit a boss payout.
  bossClearBonus:  { points: 200, xp: 90,  egg: 'rare' },   // Vilord (midBoss)
  finalClearBonus: { points: 460, xp: 180, egg: 'epic', ending: true },   // Nox (finalBoss)
  // A-8.4 — repeat wins pay Points and EXP. An egg on a repeat is OFF by default and exists
  // for events and ops policy: set `egg` and a `chance` (0…1) and rematches start dropping
  // one. A flat `chance: 1` would make farming the easiest villain the best egg source in the
  // game, which is why it is a probability ops dials rather than a reward we ship on.
  repeatDrop:      { egg: null, chance: 0 },
  loss:            { points: 10,  xp: 0 },               // consolation for trying
};
const BATTLE_RULES = JSON.parse(JSON.stringify(BATTLE_RULES_DEFAULTS));

// The resolved totals every screen reads. Derived from the rules above, never authored, so
// the reward a child is promised on the battle card is arithmetically the one they get.
const BATTLE_REWARDS = { firstClear: null, bossClear: null, finalClear: null, repeat: null, loss: null };

const applyBattleRules = () => {
  const R = BATTLE_RULES;
  const plus = (a, b, extra = {}) => ({ points: a.points + b.points, xp: a.xp + b.xp, ...extra });
  // A repeat win pays the base. Every first clear is base + the first-clear bonus, and a BOSS
  // first clear stacks its own bonus on top of that — so a boss clear is greater than an
  // ordinary first clear BY CONSTRUCTION, not because someone remembered to keep it bigger.
  BATTLE_REWARDS.repeat     = { ...R.base, egg: R.repeatDrop.egg, eggChance: R.repeatDrop.chance };
  BATTLE_REWARDS.firstClear = plus(R.base, R.firstClearBonus, { egg: R.firstClearBonus.egg });
  const first = BATTLE_REWARDS.firstClear;
  BATTLE_REWARDS.bossClear  = plus(first, R.bossClearBonus,  { egg: R.bossClearBonus.egg });
  BATTLE_REWARDS.finalClear = plus(first, R.finalClearBonus, { egg: R.finalClearBonus.egg, ending: true });
  BATTLE_REWARDS.loss       = { ...R.loss };
  return BATTLE_REWARDS;
};
applyBattleRules();

// The daily limit, read through a function so a server retune actually reaches the screens.
// It used to be an exported const, which meant "configurable per business policy" was a
// promise the code could not keep — an importer captured the number at load and never saw a change.
const battlesPerDay = () => BATTLE_RULES.perDay;

// A-8.1 — the server seam for reward policy. Anything omitted or malformed keeps the launch
// default. A bonus may be zeroed (ops may want first clears to stop paying extra) but never
// go negative, because a negative bonus would make a first clear pay LESS than a repeat —
// the exact inversion the spec forbids — and it is refused rather than clamped.
const setBattleRules = (settings = {}) => {
  const num = (v, fallback, min) =>
    (typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.round(v) : fallback);
  const pot = (key, floorAt) => {
    const row = settings[key];
    if (!row || typeof row !== 'object') return;
    const cur = BATTLE_RULES[key], def = BATTLE_RULES_DEFAULTS[key];
    cur.points = num(row.points, def.points, floorAt);
    cur.xp     = num(row.xp,     def.xp,     floorAt);
  };
  BATTLE_RULES.perDay = num(settings.perDay, BATTLE_RULES_DEFAULTS.perDay, 1);
  pot('base', 0);
  pot('firstClearBonus', 0);      // 0 is allowed; negative is not — see above
  pot('bossClearBonus', 0);
  pot('finalClearBonus', 0);
  pot('loss', 0);
  // A-8.4 — which egg each tier pays. Only a REAL egg id is accepted: a payload naming an egg
  // that does not exist would hand the child an egg they can never hatch, so an unknown id is
  // ignored and the launch default stands. `null` is how ops turn a tier's egg off.
  const eggFor = (key) => {
    const row = settings[key];
    if (!row || !('egg' in row)) return;
    if (row.egg === null) { BATTLE_RULES[key].egg = null; return; }
    if (typeof row.egg === 'string' && eggById(row.egg)) BATTLE_RULES[key].egg = row.egg;
  };
  eggFor('firstClearBonus');
  eggFor('bossClearBonus');
  eggFor('finalClearBonus');
  // the event drop on repeats: an egg id plus the odds of it landing
  eggFor('repeatDrop');
  const ch = settings.repeatDrop?.chance;
  if (typeof ch === 'number' && Number.isFinite(ch) && ch >= 0 && ch <= 1) BATTLE_RULES.repeatDrop.chance = ch;
  applyBattleRules();
  return BATTLE_RULES;
};

const PLAYER = {
  name: 'Mina', age: 11, points: 1240,
  streak: 5, level: 7, xp: 320,   // xpMax / maxed are derived from XP_CURVE — see applyXpCurve()
  safeMinutesToday: 47, safeWalkGoal: 60,
  activeCharId: 'c2',
  battlesToday: 0,                         // A-8: 0 … battlesPerDay()
  // F-19 — is the child walking right now? In the shipped app this comes from the same
  // motion detection that drives the safety warnings (F-03). While it is true, battles are
  // closed: see canChallenge(). The Tweaks panel flips it so the state can be designed.
  walking: false,
  // A-2.1 — lifetime safe-walking totals. Distance/duration egg milestones are
  // measured against these, so they are cumulative and never reset with the day.
  safeKm: 32.4, safeMinutes: 1180,
  // A-4.1 — how far phone use while walking has fallen against this child's own first
  // week (0.42 = 42% less). Measured against themselves so the Epic unlock rewards
  // improvement rather than punishing whoever started out worst.
  phoneUseDrop: 0.42,
  // Unhatched eggs, keyed by egg id — a new egg type needs no new field here.
  eggs: { common: 1, rare: 0, epic: 1 },
  // A-2.1 / A-4.1 — payout ledgers: rule id → times paid. This is what stops a one-shot
  // milestone from re-awarding on every check, and lets a repeatable one resume
  // mid-way (25 km paid, 50 km not yet). Server-owned in the shipped app.
  eggGrants: { 'g-km-10': 1, 'g-km-every': 1 },
  charUnlocks: { 'u-streak-7': 1 },   // the 7-day streak already paid out a Rare
  itemGrants: {},                     // A-5.1 — item rules paid out so far
  // public profile / house (F-32 / A-6·A-7)
  friendCode: 'JNX-MINA-27', likes: 18, houseBg: 'sky',
  // A-13 — which CHILDREN row this device IS. The parent app and the child app were two
  // separate models of the same kid with nothing joining them; this is the join.
  childId: 'k1',
};

// ── Safe-walking missions (A-1.1 / A-2.1) ────────────────────────────
// Small goals that pay points, and — once every mission in a scope is cleared —
// an egg (see EGG_GRANTS 'g-daily' / 'g-weekly'). Clearing the *set* is what pays
// the egg, not each task, so the egg stays a genuine goal rather than a trickle.
// `done` seeds which are already cleared; the rest can be tapped complete.
const TODAY_TASKS = [
  { id: 't1', scope: 'daily', icon: 'footprints',  title: 'Finish a phone-free walk',  reward: 100, done: true },
  { id: 't2', scope: 'daily', icon: 'shield-check', title: 'Reach your safe-walk goal', reward: 50,  done: false },
  { id: 't3', scope: 'daily', icon: 'heart-handshake', title: 'Say hi to your buddy',   reward: 20,  done: false },
];

// Weekly goals — longer arcs, and they pay the better egg. Same shape as the daily
// set, so any surface that renders missions renders both without a special case.
const WEEKLY_TASKS = [
  { id: 'w1', scope: 'weekly', icon: 'calendar-check', title: 'Walk safely 5 days',        reward: 300, done: false, progress: 3, total: 5 },
  { id: 'w2', scope: 'weekly', icon: 'route',          title: 'Walk 15 km safely',         reward: 250, done: false, progress: 9, total: 15 },
  { id: 'w3', scope: 'weekly', icon: 'hand',           title: 'Stop right away 10 times',  reward: 200, done: true },
];

const MISSIONS = { daily: TODAY_TASKS, weekly: WEEKLY_TASKS };

// The egg is owed once every mission in the scope is done (A-2.1).
const missionsCleared = (scope) => (MISSIONS[scope] || []).every(t => t.done);

// ── Wallpaper & flooring (A-6 / A-5.1 · room decoration) ─────────────
// The backdrop of the child's profile / room. These are ITEMS like any other — same
// shape, same shop, same grant rules — they just happen to render as a gradient.
//   price — point cost. EVERY decoration item is buyable with points (A-5.1); a null
//           price would mean "unobtainable by saving", which the spec does not allow.
//           0 = granted from the start.
const HOUSE_BGS = [
  { id: 'sky',    name: 'Sky',    category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#eaf3ff,#ffffff 82%)', owned: true,  price: 0 },
  { id: 'sunset', name: 'Sunset', category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#ffe7d4,#ffffff 82%)', owned: true,  price: 0 },
  { id: 'mint',   name: 'Mint',   category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#e2f6ec,#ffffff 82%)', owned: true,  price: 0 },
  { id: 'grape',  name: 'Grape',  category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#efe6fd,#ffffff 82%)', owned: false, price: 200 },
  { id: 'candy',  name: 'Candy',  category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#ffe4f0,#ffffff 82%)', owned: false, price: 200 },
  { id: 'night',  name: 'Night',  category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#d9e1f5,#ffffff 82%)', owned: false, price: 300 },
  // flooring — same slot family, so the room screen renders it with no new branch
  { id: 'wood',   name: 'Wood Floor',  category: 'room', slot: 'flooring', grad: 'linear-gradient(180deg,#f0e0cc,#ffffff 82%)', owned: false, price: 180 },
  { id: 'meadow', name: 'Meadow Floor', category: 'room', slot: 'flooring', grad: 'linear-gradient(180deg,#e4f2dc,#ffffff 82%)', owned: false, price: 180 },
  // limited edition — still buyable with points while its season is live (A-5.1),
  // it just stops being offered once the set is retired
  { id: 'aurora', name: 'Aurora',  category: 'room', slot: 'wallpaper', grad: 'linear-gradient(180deg,#d9f2ee,#efe0fb 82%)', owned: false, price: 400, limited: true, set: 'winter-2026' },
];

// ── Room decoration items (A-7 / A-5.1) — placed inside a room ───────
//   rooms — the room themes an item belongs to. Each theme has its OWN set, so a
//           bird feeder is a Green Room thing and a bus stop is a Town Room thing.
//           ['*'] = fits every room; a new theme inherits those without editing a
//           single row here, which is what makes adding a theme a one-line job.
//   slot  — furniture · object … the taxonomy the shop groups by
const DECOR = [
  // ── Green Room · nature & forest ──
  { id: 'plant',     name: 'Plant',       rooms: ['green'], category: 'room', slot: 'object',    icon: 'sprout',    owned: true,  price: 0 },
  { id: 'sapling',   name: 'Little Tree', rooms: ['green'], category: 'room', slot: 'object',    icon: 'tree-pine', owned: true,  price: 0 },
  { id: 'canteen',   name: 'Watering Can',rooms: ['green'], category: 'room', slot: 'object',    icon: 'droplets',  owned: false, price: 70 },
  { id: 'feeder',    name: 'Bird Feeder', rooms: ['green'], category: 'room', slot: 'object',    icon: 'bird',      owned: false, price: 110 },
  { id: 'flowerbed', name: 'Flower Bed',  rooms: ['green'], category: 'room', slot: 'furniture', icon: 'flower-2',  owned: false, price: 130 },
  { id: 'tent',      name: 'Camp Tent',   rooms: ['green'], category: 'room', slot: 'furniture', icon: 'tent',      owned: false, price: 220 },

  // ── Town Room · school, park, city centre ──
  { id: 'lamp',      name: 'Lamp',        rooms: ['town'], category: 'room', slot: 'furniture', icon: 'lamp',     owned: true,  price: 0 },
  { id: 'mailbox',   name: 'Mailbox',     rooms: ['town'], category: 'room', slot: 'object',    icon: 'mailbox',  owned: true,  price: 0 },
  { id: 'bench',     name: 'Park Bench',  rooms: ['town'], category: 'room', slot: 'furniture', icon: 'armchair', owned: false, price: 100 },
  { id: 'signpost',  name: 'Street Sign', rooms: ['town'], category: 'room', slot: 'object',    icon: 'signpost', owned: false, price: 120 },
  { id: 'busstop',   name: 'Bus Stop',    rooms: ['town'], category: 'room', slot: 'furniture', icon: 'bus',      owned: false, price: 200 },
  // earned as well as bought — the grant rules below hand this one out (A-5.1)
  { id: 'shelf',     name: 'Bookshelf',   rooms: ['town'], category: 'room', slot: 'furniture', icon: 'library',  owned: false, price: 120 },

  // ── Dream Room · imagination & fantasy ──
  { id: 'moonlamp',  name: 'Moon Lamp',     rooms: ['dream'], category: 'room', slot: 'furniture', icon: 'moon-star', owned: true,  price: 0 },
  { id: 'cloud',     name: 'Cloud',         rooms: ['dream'], category: 'room', slot: 'object',    icon: 'cloud',     owned: true,  price: 0 },
  { id: 'rocket',    name: 'Toy Rocket',    rooms: ['dream'], category: 'room', slot: 'object',    icon: 'rocket',    owned: false, price: 150 },
  { id: 'crystal',   name: 'Dream Crystal', rooms: ['dream'], category: 'room', slot: 'object',    icon: 'gem',       owned: false, price: 180 },
  { id: 'rainbow',   name: 'Rainbow',       rooms: ['dream'], category: 'room', slot: 'object',    icon: 'rainbow',   owned: false, price: 200 },
  { id: 'telescope', name: 'Telescope',     rooms: ['dream'], category: 'room', slot: 'furniture', icon: 'telescope', owned: false, price: 240 },

  // ── fits any room ──
  { id: 'rug',     name: 'Rug',       rooms: ['*'], category: 'room', slot: 'furniture', icon: 'square',       owned: false, price: 80 },
  { id: 'poster',  name: 'Poster',    rooms: ['*'], category: 'room', slot: 'object',    icon: 'image',        owned: false, price: 90 },
  { id: 'balloon', name: 'Balloons',  rooms: ['*'], category: 'room', slot: 'object',    icon: 'party-popper', owned: false, price: 60 },
  { id: 'trophy',  name: 'Champion Trophy', rooms: ['*'], category: 'room', slot: 'object', icon: 'trophy', owned: false, price: 260 },

  // ── seasonal · dark until ops turns the set on (A-5.1) ──
  { id: 'lantern', name: 'Star Lantern', rooms: ['dream', 'winter'], category: 'room', slot: 'object', icon: 'lamp-ceiling', owned: false, price: 340, limited: true, set: 'winter-2026' },
  { id: 'wreath2', name: 'Snow Globe',   rooms: ['winter'],          category: 'room', slot: 'object', icon: 'snowflake',    owned: false, price: 280, limited: true, set: 'winter-2026' },
];

// The catalogue a given room offers. Room-scoped items plus the universal ones —
// so "what can I put in here?" is answered by the theme, not by a hand-kept list.
const decorForRoom = (roomId) => DECOR.filter(d => d.rooms.includes('*') || d.rooms.includes(roomId));

// messages friends have left on MY profile (F-32 guestbook, received side)
// Every note in a guestbook — received or left — is one of the GUEST_STAMPS below. Nothing
// here is ever free text, so the seeds are stamps too.
const MY_GUESTBOOK = [
  { by: 'Jisoo', avatar: 'cat',  color: '#e278a8', emoji: '😍', text: 'Your room is awesome!', liked: true },
  { by: 'Aria',  avatar: 'owl',  color: '#b9a3ef', emoji: '⭐', text: 'Cool collection!', liked: false },
  { by: 'Tom',   avatar: 'bird', color: '#67c7ce', emoji: '🔥', text: 'Nice streak!', liked: false },
];

// add-friends flow
// ── Parent ↔ child link (A-13 · F-33) ─────────────────────────────────
// The child device carries no account of its own — its identity IS this link (see the
// Onboarding header). The parent app and the child app used to describe the pairing from
// opposite ends and never share a record: the parent saw a device row, the child saw the
// words "managed by your parent" and no way to find out by WHOM. One record, read by both.
//
// `code` is the same 6-digit pairing code ParentAddChild displays; the child types it (or
// scans the QR) during onboarding. It is kept after pairing so the child's settings can
// show what they are linked with, and so a device change re-pairs against the same value.
const LINK = {
  connected: true,
  childId: 'k1',                    // → CHILDREN
  code: '482193',                   // the 6-digit code the parent app shows
  familyId: 'f1',                   // → FAMILY. The child pairs to the HOUSEHOLD, not to a person.
  since: '2026-03-14',
  // no `device` here on purpose — that lives on the CHILDREN row the parent app already
  // maintains (and re-writes on a device change). Read it via linkedChild().device.
  // no `parent` here either, and that is the point: a link that named one adult could not
  // survive a second one. Read the guardians via guardians().
};

// ── The family (household) ───────────────────────────────────────────
// Two parents, one child, one set of numbers. The family owns the children — NOT the parent
// who happened to do the setup — and the child's device pairs to the family. That is what
// lets a second guardian be added, or removed, without ever touching the child's phone: no
// re-scan, no re-pair, no chance of knocking the first parent offline (the pairing flow
// unlinks the previously-paired device, so "just scan the child again" was never an option).
//
// Both guardians see identical data by construction rather than by syncing: reports, points
// and settings are family-scoped, so there is nothing to reconcile between two devices.
//
// Every member signs in as THEMSELVES (own phone number). Sharing one login is the tempting
// shortcut and it breaks three things at once: push reaches one device, no change can be
// attributed, and no alert can show who already responded.
const FAMILY = {
  id: 'f1',
  members: [
    { id: 'm1', name: 'Ji-won',  relation: 'Mum', phone: '010-1234-5678', role: 'owner',    since: '2026-03-14', me: true },
    { id: 'm2', name: 'Min-jun', relation: 'Dad', phone: '010-9876-5432', role: 'guardian', since: '2026-06-02' },
  ],
};

// Both roles see everything and change everything — the difference is only over the family
// itself (who may add or remove a guardian, and who holds billing). Two guardians shown
// different numbers would be a support nightmare, and it would break the promise PARENT_SEES
// makes to the child. So: no per-parent data restrictions, ever.
// (the badge says 'Co-parent', not 'Guardian' — 'Guardian' is already the character STAGE name,
// 수호자, and two things called the same word in one app is one thing too many)
const FAMILY_ROLES = {
  owner:    { label: 'Owner',     can: { settings: true, invite: true,  remove: true,  billing: true } },
  guardian: { label: 'Co-parent', can: { settings: true, invite: false, remove: false, billing: false } },
};

// A guardian invite: single-use and expiring. Sent as a link (the realistic case — the other
// parent is at work, not standing next to you), with the QR and the 6-digit code on the same
// screen for when they ARE together. Joining still requires the invitee to verify their own
// phone number, so a leaked link alone gets nobody in.
const FAMILY_INVITE = { code: '735204', link: 'joanx.app/j/7c1f9a', expiresHours: 48 };

const guardians = () => FAMILY.members;
const guardianOwner = () => FAMILY.members.find(m => m.role === 'owner') || FAMILY.members[0];
const guardianMe = () => FAMILY.members.find(m => m.me) || guardianOwner();
const guardianCan = (member, action) => !!(FAMILY_ROLES[member?.role]?.can[action]);
// "엄마와 아빠" — the child is told who is watching, by name, not just what is shared (A-13).
const guardianNames = () => FAMILY.members.map(m => m.relation);

const addGuardian = (member) => {
  FAMILY.members.push({ id: `m${FAMILY.members.length + 1}`, role: 'guardian', ...member });
  return FAMILY.members;
};
const removeGuardian = (id) => {
  const i = FAMILY.members.findIndex(m => m.id === id && m.role !== 'owner');   // the owner cannot be removed, only transferred
  if (i >= 0) FAMILY.members.splice(i, 1);
  return FAMILY.members;
};

// Two adults with equal control WILL overwrite each other's settings. The fix is not to take
// the control away — it is to make sure nobody acts invisibly. Every change is stamped with
// who made it, and the pair of them can see it. Solve the conflict with visibility, not with
// permissions: a parent locked out of a safety setting is a worse failure than a parent who
// has to ask "why did you loosen this?".
const FAMILY_LOG = [
  { id: 'l1', by: 'Ji-won',  icon: 'sliders',      what: 'Raised sensitivity',   detail: 'Mina · Balanced → Strict', time: '2h' },
  { id: 'l2', by: 'Min-jun', icon: 'bell',         what: 'Acknowledged an alert', detail: 'Mina · distraction warning', time: '4h' },
  { id: 'l3', by: 'Min-jun', icon: 'calendar',     what: 'Edited a schedule',    detail: 'Mina · School commute', time: 'Yesterday' },
  { id: 'l4', by: 'Ji-won',  icon: 'user-plus',    what: 'Added a guardian',     detail: 'Min-jun joined the family', time: '2026-06-02' },
];
const logFamilyChange = (entry) => { FAMILY_LOG.unshift({ id: `l${FAMILY_LOG.length + 1}`, by: guardianMe().name, time: 'now', ...entry }); return FAMILY_LOG; };

// A-13 — a child old enough to earn points is old enough to be told what is being watched.
// This is the honest answer, phrased for a 10-year-old, and it is DATA so the child app and
// the parent app cannot describe the same monitoring differently. `shared` must stay true
// to what the app actually collects; `private` is the promise (F-10: no chat, F-05/F-06
// excluded: no GPS), and breaking one means editing this list, in the open.
const PARENT_SEES = [
  { icon: 'footprints',   label: 'How long you walked safely', shared: true },
  { icon: 'alert-triangle', label: 'Warnings you got while walking', shared: true },
  { icon: 'star',         label: 'Your points and streak', shared: true },
  { icon: 'smartphone',   label: 'Which app types are blocked', shared: true },
  { icon: 'map-pin',      label: 'Where you are', shared: false },
  { icon: 'message-circle', label: 'Your messages and guestbook', shared: false },
  { icon: 'camera',       label: 'Your photos', shared: false },
];

const linkedChild = () => CHILDREN.find(c => c.id === LINK.childId) || null;
const parentSharesSeen = () => PARENT_SEES.filter(r => r.shared);
const parentSharesHidden = () => PARENT_SEES.filter(r => !r.shared);

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
  // F-09 — character message: a line holds for messageSeconds, and at least
  // messageGapSeconds must pass before the next one appears. Both are pilot-tunable, so
  // they live here rather than in the component — remote settings can retune them without
  // an app release once field data comes back.
  // The spec's 1.5s was written for a bare toast. The message step is a card the child has to
  // read *and answer*, and at 1.5s a Korean line was gone before it could be finished — so a
  // line now holds long enough to read at a walking glance, and the gap is just the beat it
  // takes to swap the next one in.
  messageSeconds: 4,
  messageGapSeconds: 4.5,
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
// EXP to reach the next level starts low and grows as the level rises:
//   Lv1→2 100 · Lv2→3 120 · Lv3→4 150 · Lv4→5 180 · Lv5→6 220 · Lv6→7 270 …
// At maxLevel the character has completed its final growth stage, is registered
// in the Collection, and earns no further EXP.
//
// The curve is a settings OBJECT, not a formula baked into app logic: how steep
// the climb feels is business policy, so the shipped app takes it from remote
// settings (see setXpCurve) and the values below are only the launch defaults /
// offline fallback. Each step is authored per level rather than derived, so ops can
// bend one level without re-deriving the whole ladder; `growth` only covers levels
// past the authored table, so raising `maxLevel` in a future update (A-3.2) still
// yields a sane curve if the table is not extended at the same time.
const XP_CURVE_DEFAULTS = {
  maxLevel: 10,
  // steps[i] = EXP to go from Lv.(i+1) to Lv.(i+2) — index 0 is Lv1→2
  steps: [100, 120, 150, 180, 220, 270, 330, 400, 480],
  growth: 1.2,   // beyond `steps`: previous step × growth …
  roundTo: 10,   // … rounded up to a tidy number
};

// The curve in force. Mutated in place by setXpCurve so existing importers of
// XP_CURVE (e.g. ChildHome's cap label) see a retune without re-importing.
const XP_CURVE = { ...XP_CURVE_DEFAULTS };

const isMaxLevel = (level) => level >= XP_CURVE.maxLevel;

// EXP required to go from `level` to `level + 1`, or null at the cap (A-3.2).
const xpForLevel = (level) => {
  if (isMaxLevel(level)) return null;
  const { steps, growth, roundTo } = XP_CURVE;
  const i = Math.max(1, level) - 1;                 // a level-0 (unhatched) buddy climbs Lv1→2 first
  if (i < steps.length) return steps[i];
  const grown = steps[steps.length - 1] * Math.pow(growth, i - steps.length + 1);
  return Math.ceil(grown / roundTo) * roundTo;
};

// xpMax is derived, never authored — the curve is the single source of truth, so a
// retune moves every bar in the app at once instead of leaving hand-written maxima
// behind. At the cap there is no "next level", so the bar is pinned full rather than
// left dividing by null; `maxed` marks a character that finished its growth.
const applyXpCurve = (holders = [PLAYER, ...CHARACTERS]) => {
  holders.forEach(h => {
    h.level = Math.min(h.level, XP_CURVE.maxLevel);
    h.maxed = isMaxLevel(h.level);
    h.xpMax = h.maxed ? xpForLevel(XP_CURVE.maxLevel - 1) : xpForLevel(h.level);
    h.xp = h.maxed ? h.xpMax : Math.min(h.xp, h.xpMax);
    // A-3.3 — stage follows the level, always. Authoring it separately is what let a
    // Lv.4 buddy claim Stage 2; deriving it here means a level-up, an evolve and a
    // server retune of the thresholds all move the stage with no extra bookkeeping.
    if (h.rarity) h.stage = stageForLevel(h.level);
  });
};

// ── Growth stages (A-3.3 · three stages, Lv-gated) ───────────────────
// A buddy hatches at Stage 1 and climbs to Stage 2 and Stage 3 as it levels. Stage 3
// is the fully-grown form. The stage is DERIVED from the level, never authored: two
// sources of truth would let a Lv.7 buddy sit at Stage 1 forever, and the roster had
// exactly that bug (a Lv.4 buddy hand-marked Stage 2) before this table existed.
//
// `minLevel` is business policy — "The Level requirements for each Stage should be
// configurable through server-side settings" — so it comes from server settings (see
// setStages); nothing below assumes the thresholds are 4 and 8, or that there are
// three stages.
//
// A stage is PRESENTATION ONLY. It grants no stats: stat growth is the Level's job
// alone (see statsFor), so crossing a threshold never hands out a power spike. What it
// does is change how the buddy looks, moves, and talks:
//   art        — which mascot form to draw (Mascot already takes a stage)
//   anim       — the idle animation class
//   expression — the face
//   lines      — what the buddy says; its voice grows up with it
const STAGE_DEFAULTS = [
  { stage: 1, minLevel: 1, name: 'Hatchling', anim: 'jx-float',      expression: 'curious',
    lines: ['Hi! I just hatched.', 'Where are we walking today?', 'Keep me safe and I will grow!'] },
  { stage: 2, minLevel: 4, name: 'Growing',   anim: 'jx-bounce',     expression: 'happy',
    lines: ['I am getting stronger!', 'Eyes up — I am watching with you.', 'We make a good team.'] },
  { stage: 3, minLevel: 8, name: 'Guardian',  anim: 'jx-pulse-soft', expression: 'proud',
    lines: ['Fully grown — and still walking beside you.', 'Nothing gets past us now.', 'You taught me every step of this.'] },
];

const STAGES = STAGE_DEFAULTS.map(s => ({ ...s }));

// The stage a level belongs to. Reads the table rather than testing 5 and 10, so a
// retune (or a fourth stage) needs no code change here.
const stageForLevel = (level) => {
  const lv = Math.max(1, level || 1);
  let stage = STAGES[0].stage;
  for (const s of STAGES) if (lv >= s.minLevel) stage = s.stage;
  return stage;
};

const stageOf = (stage) => STAGES.find(s => s.stage === stage) || STAGES[0];

// The level range a stage covers — Stage 2 is "Lv 4–7" because Stage 3 starts at 8. Read
// off the table so a screen can print the band without knowing the thresholds, and a
// server retune relabels every screen at once.
const stageBand = (stage) => {
  const i = STAGES.findIndex(s => s.stage === stage);
  if (i < 0) return { min: 1, max: XP_CURVE.maxLevel };
  const next = STAGES[i + 1];
  return { min: STAGES[i].minLevel, max: next ? next.minLevel - 1 : XP_CURVE.maxLevel };
};

// The face and idle animation for a stage, mapped onto what Mascot actually supports.
// The stage table names an expression in its own vocabulary (curious / happy / proud);
// this is the one place that translates it, so the table stays about the character and
// the mascot keeps its small mood API.
const MOOD_FOR_EXPRESSION = { curious: 'alert', happy: 'happy', proud: 'proud' };
const moodForStage = (stage) => MOOD_FOR_EXPRESSION[stageOf(stage).expression] || 'happy';
const finalStage = () => STAGES[STAGES.length - 1].stage;
// the level at which the NEXT stage lands, or null once fully grown (A-3.3)
const nextStageAt = (level) => {
  const next = STAGES.find(s => s.minLevel > Math.max(1, level || 1));
  return next ? next.minLevel : null;
};

// ── Core battle stats (A-3.3) ────────────────────────────────────────
// The four stats villain battles are fought with. A registry, not four hard-coded
// fields: a fifth stat is one row here plus its growth numbers.
const STATS = [
  { key: 'hp',         label: 'HP',         icon: 'heart' },
  { key: 'courage',    label: 'Courage',    icon: 'flame' },
  { key: 'protection', label: 'Protection', icon: 'shield' },
  { key: 'speed',      label: 'Speed',      icon: 'gauge' },
];

// Stat growth — "applied differently based on the character's rarity tier and Level",
// and server-tunable so balance can be retuned without an app release.
//   base      — the stat at Lv.1, per rarity
//   perLevel  — added per level, per rarity (the "predefined rate")
// There is deliberately no stage term. Stats are a pure function of Level (and rarity,
// and the character's own leaning): "advancing to a new Stage does not provide any
// additional stat bonuses." A stage multiplier here would double-count the same level-up
// and put a power cliff at every threshold — the buddy would visibly transform AND
// suddenly out-punch a villain it lost to a minute ago. Stage earns its keep in the
// presentation table above, not in the numbers.
const STAT_GROWTH_DEFAULTS = {
  base: {
    common: { hp: 100, courage: 40, protection: 40, speed: 40 },
    rare:   { hp: 120, courage: 50, protection: 48, speed: 46 },
    epic:   { hp: 150, courage: 62, protection: 58, speed: 55 },
  },
  perLevel: {
    common: { hp: 12, courage: 4,   protection: 4,   speed: 4 },
    rare:   { hp: 16, courage: 5.5, protection: 5,   speed: 5 },
    epic:   { hp: 22, courage: 7,   protection: 6.5, speed: 6 },
  },
};

const STAT_GROWTH = JSON.parse(JSON.stringify(STAT_GROWTH_DEFAULTS));

// Per-character leaning. Without this, every Common at Lv.5 would have identical stats
// and the roster would lose its personality — Snap the guard and Sky the sprinter would
// be the same buddy in different colours. The roster's authored traits (guard/speed/
// heart) are exactly that personality, so they are kept and read as an AFFINITY around
// 1.0 rather than thrown away for a flat curve.
//   guard → protection · heart → courage · speed → speed · their mean → HP
const affinityOf = (c) => {
  const t = c.traits || {};
  const lean = (v) => (typeof v === 'number' ? 0.8 + v / 250 : 1);   // 50 → 1.0 · 90 → 1.16
  const mean = ((t.guard || 50) + (t.speed || 50) + (t.heart || 50)) / 3;
  return { hp: lean(mean), courage: lean(t.heart), protection: lean(t.guard), speed: lean(t.speed) };
};

// A character's current stats: rarity curve × level × personality. Note what is NOT here:
// the stage. Stats climb smoothly with the level and nothing else, so a stage-up is a
// costume change, not a power spike.
// Derived on read, never stored — a stored copy would go stale the moment a level-up or a
// server retune landed, and stale stats decide battles wrongly.
const statsFor = (c) => {
  if (!c) return Object.fromEntries(STATS.map(s => [s.key, 0]));
  const level = Math.max(1, c.level || 1);
  const rarity = STAT_GROWTH.base[c.rarity] ? c.rarity : 'common';
  const base = STAT_GROWTH.base[rarity], per = STAT_GROWTH.perLevel[rarity];
  const aff = affinityOf(c);
  return Object.fromEntries(STATS.map(s =>
    [s.key, Math.round((base[s.key] + per[s.key] * (level - 1)) * aff[s.key])]));
};

// The top of a stat's bar: what that stat reaches at the level cap, for the strongest
// rarity, with a little headroom for a character's leaning. Each stat gets its OWN
// ceiling because they do not share a scale — HP runs several times higher than Courage,
// so a common 0–100 bar would peg HP to full and leave the other three looking broken.
// Derived from the growth table, so a rebalance moves every bar with it.
const statMax = (key) => {
  const tops = Object.keys(STAT_GROWTH.base).map(r =>
    STAT_GROWTH.base[r][key] + STAT_GROWTH.perLevel[r][key] * (XP_CURVE.maxLevel - 1));
  return Math.ceil((Math.max(...tops) * 1.2) / 10) * 10;
};

// The single number a villain battle is decided on. HP is a deep pool rather than a
// per-swing stat, so it is scaled down — counting it raw would drown the other three
// and make every fight a question of HP alone.
const battlePower = (c) => {
  const s = statsFor(c);
  return Math.round(s.courage + s.protection + s.speed + s.hp / 5);
};

// A-3.3 — the server seam for stage ranges and stat growth. Same discipline as
// setXpCurve: anything omitted or malformed falls back to the launch default, so a bad
// remote payload can never strand a buddy at an unreachable stage or a zeroed stat.
const setStages = (rows) => {
  if (!Array.isArray(rows) || !rows.length) return STAGES;
  const valid = rows.filter(r => typeof r?.stage === 'number' && typeof r?.minLevel === 'number' && r.minLevel >= 1);
  if (!valid.length) return STAGES;
  STAGES.length = 0;
  valid.sort((a, b) => a.minLevel - b.minLevel)
    .forEach((r, i) => STAGES.push({ ...STAGE_DEFAULTS[i], ...r }));
  applyXpCurve();          // stage is derived from level — resync every holder
  return STAGES;
};

const setStatGrowth = (settings = {}) => {
  for (const field of ['base', 'perLevel']) {
    if (!settings[field]) continue;
    for (const rarity of Object.keys(STAT_GROWTH[field])) {
      const row = settings[field][rarity];
      if (!row) continue;
      for (const s of STATS) {
        const v = row[s.key];
        if (typeof v === 'number' && Number.isFinite(v) && v >= 0) STAT_GROWTH[field][rarity][s.key] = v;
      }
    }
  }
  // A stageMult in the payload is ignored on purpose: stage grants no stats, and a remote
  // value must not be able to reintroduce that coupling behind the app's back.
  return STAT_GROWTH;
};

// A-3.1 — "The EXP values can be adjusted through server settings." This is the seam
// the shipped app calls with the remote payload; the prototype just ships the defaults.
// Anything the payload omits or sends malformed falls back to the launch default, so a
// bad remote value can never strand a child on an unreachable level. Derived state is
// recomputed on the spot, since a curve that changed but left old xpMax bars behind
// would show a full bar that never levels up.
const setXpCurve = (settings = {}) => {
  const num = (v, fallback, min) =>
    (typeof v === 'number' && Number.isFinite(v) && v >= min ? v : fallback);
  const validSteps = Array.isArray(settings.steps) && settings.steps.length > 0
    && settings.steps.every(n => typeof n === 'number' && Number.isFinite(n) && n > 0);
  Object.assign(XP_CURVE, {
    maxLevel: Math.round(num(settings.maxLevel, XP_CURVE_DEFAULTS.maxLevel, 2)),
    steps:    validSteps ? settings.steps.map(Math.round) : XP_CURVE_DEFAULTS.steps,
    growth:   num(settings.growth,  XP_CURVE_DEFAULTS.growth, 1),
    roundTo:  num(settings.roundTo, XP_CURVE_DEFAULTS.roundTo, 1),
  });
  applyXpCurve();
  return XP_CURVE;
};

// Total EXP still needed to carry a character from where it stands to the level cap.
// The exchange uses it to refuse a purchase that would overshoot: EXP past the cap has
// nowhere to go, and the child paid points for it.
const xpToCap = (c) => {
  if (!c || isMaxLevel(c.level)) return 0;
  let total = xpForLevel(c.level) - c.xp;
  for (let lv = c.level + 1; lv < XP_CURVE.maxLevel; lv++) total += xpForLevel(lv);
  return total;
};

// The single XP path for the whole app — battles, duplicate hatches, and the point
// exchange all land here. EXP that fills the bar CARRIES into the next level rather than
// being clamped away: a battle reward could shrug off the overflow, but bought EXP cannot.
// Returns what actually happened, so a caller can celebrate a level-up it did not predict.
const gainXp = (c, amount, player = PLAYER) => {
  if (!c || !(amount > 0) || c.maxed) return { gained: 0, levels: 0, lost: amount > 0 ? amount : 0, stageUp: null };
  const stageBefore = c.stage;
  let left = amount, levels = 0;
  while (left > 0 && !isMaxLevel(c.level)) {
    const need = xpForLevel(c.level) - c.xp;
    if (left < need) { c.xp += left; left = 0; break; }
    left -= need;
    c.level += 1; c.xp = 0; levels += 1;
  }
  // at the cap the bar is pinned full — there is no "next level" to divide by
  c.maxed = isMaxLevel(c.level);
  c.xpMax = c.maxed ? xpForLevel(XP_CURVE.maxLevel - 1) : xpForLevel(c.level);
  if (c.maxed) c.xp = c.xpMax;
  // A-3.3 — the stage rides on the level, so it is re-derived on every level-up rather
  // than waiting for someone to remember. Without this a buddy could cross the Lv.4
  // threshold in a battle and stay a Hatchling until the next full reload.
  c.stage = stageForLevel(c.level);
  // the player level tracks the highest buddy — level gates on eggs and outfits read it
  if (levels && player) player.level = Math.max(player.level, c.level);
  // a caller that wants to celebrate the transformation needs to know it happened
  return { gained: amount - left, levels, lost: left, stageUp: c.stage > stageBefore ? c.stage : null };
};

// ── Points → EXP exchange (A-1.2) ────────────────────────────────────
// Points are the only currency, and EXP is one of the things they buy — alongside eggs,
// outfits and room decor. Nothing forces the split: a child can pour every point into
// growing the buddy they have, or save them all for another egg.
// Server-configurable like POINTS / EGGS / XP_CURVE. The rate IS the economy — it decides
// whether walking safely for an hour is worth a level or a shrug — so it is expected to
// arrive from remote settings and be retunable without an app release. Values below are
// the launch defaults / offline fallback.
const EXCHANGE_DEFAULTS = {
  pointsPerXp: 5,   // A-1.2 — 5 points → 1 EXP
  stepXp: 10,       // the stepper's increment, and the smallest purchase (= 50 points)
};

// The rate in force. Mutated in place by setExchange, like XP_CURVE, so a screen that
// already imported EXCHANGE sees a retune without re-importing.
const EXCHANGE = { ...EXCHANGE_DEFAULTS };

// A-1.2 — "The conversion ratio should be configurable through server-side settings."
// Same seam and same guarantees as setXpCurve: anything omitted or malformed falls back to
// the launch default, so a bad remote value can never make EXP free (pointsPerXp ≤ 0 would
// divide by zero and hand out infinite levels) or unbuyable.
const setExchange = (settings = {}) => {
  const num = (v, fallback, min) =>
    (typeof v === 'number' && Number.isFinite(v) && v >= min ? Math.round(v) : fallback);
  Object.assign(EXCHANGE, {
    pointsPerXp: num(settings.pointsPerXp, EXCHANGE_DEFAULTS.pointsPerXp, 1),
    stepXp:      num(settings.stepXp,      EXCHANGE_DEFAULTS.stepXp,      1),
  });
  return EXCHANGE;
};

const pointsForXp = (xp) => xp * EXCHANGE.pointsPerXp;
const xpFromPoints = (points) => Math.floor(points / EXCHANGE.pointsPerXp);

// The biggest purchase that is both affordable and useful — bounded by the wallet AND by
// how much EXP the buddy can still absorb before the cap.
const maxConvertibleXp = (c, player = PLAYER) => Math.min(xpFromPoints(player.points), xpToCap(c));

// Can this exchange happen, and if not, why — one verdict shape, same as canBuyItem.
const canConvertPoints = (xp, c, player = PLAYER) => {
  if (!c || !c.owned) return { ok: false, reason: 'no-buddy' };
  if (c.maxed) return { ok: false, reason: 'maxed' };
  if (!(xp >= EXCHANGE.stepXp)) return { ok: false, reason: 'min', need: EXCHANGE.stepXp };
  if (xp > xpToCap(c)) return { ok: false, reason: 'cap', need: xpToCap(c) };
  const cost = pointsForXp(xp);
  if (player.points < cost) return { ok: false, reason: 'points', need: cost };
  return { ok: true, cost };
};

// Spend the points, hand over the EXP. Points leave the wallet only if the EXP lands.
const convertPointsToXp = (xp, c, player = PLAYER) => {
  const verdict = canConvertPoints(xp, c, player);
  if (!verdict.ok) return verdict;
  player.points -= verdict.cost;
  return { ...verdict, ...gainXp(c, xp, player) };
};

// ── Outfits (A-5 / A-5.1 · character customization) ──────────────────
// Bought on the buddy's own detail screen, not in the Points shop — an outfit
// belongs to a character, so it is chosen while looking at that character.
//   price     — point cost (0 = granted, no purchase). Never null: every customization
//               item is buyable with points, per A-5.1.
//   slot      — hat · glasses · clothing · accessory (the A-5.1 taxonomy)
//   minStage  — evolution stage required before it can be worn/bought
//   minLevel  — player level required (0 = no gate); some items unlock by levelling
const OUTFITS = [
  { id: 'scarf',   icon: 'shirt',          name: 'Hero Scarf',    category: 'character', slot: 'clothing',  price: 0,   minStage: 2, minLevel: 0 },
  { id: 'cape',    icon: 'wind',           name: 'Guardian Cape', category: 'character', slot: 'clothing',  price: 0,   minStage: 3, minLevel: 0 },
  { id: 'bow',     icon: 'gift',           name: 'Ribbon Bow',    category: 'character', slot: 'accessory', price: 200, minStage: 1, minLevel: 0 },
  { id: 'glasses', icon: 'glasses',        name: 'Cool Shades',   category: 'character', slot: 'glasses',   price: 250, minStage: 1, minLevel: 0 },
  { id: 'cap',     icon: 'graduation-cap', name: 'Explorer Cap',  category: 'character', slot: 'hat',       price: 280, minStage: 2, minLevel: 0 },
  { id: 'crown',   icon: 'crown',          name: 'Star Crown',    category: 'character', slot: 'hat',       price: 300, minStage: 3, minLevel: 0 },
  // also earned — the grant rules below hand these out (A-5.1)
  { id: 'goggles', icon: 'glasses',        name: 'Night Goggles', category: 'character', slot: 'glasses',   price: 320, minStage: 1, minLevel: 8 },
  { id: 'medal',   icon: 'medal',          name: 'Victory Medal', category: 'character', slot: 'accessory', price: 280, minStage: 1, minLevel: 0 },
  { id: 'wreath',  icon: 'sparkles',       name: 'Winter Wreath', category: 'character', slot: 'accessory', price: 360, minStage: 1, minLevel: 0, limited: true, set: 'winter-2026' },
];

// ── Items (A-5.1 · the unified purchasing & reward model) ────────────
// Customization and decoration items are ONE model, not three. They differ only in
// where they are worn/placed — the money, the level gates, the reward rules and the
// limited-edition handling are identical, so a single table means a new acquisition
// route lights up hats, wallpaper and furniture at once instead of three times.
// OUTFITS / DECOR / HOUSE_BGS stay as views over the same row objects, so the screens
// that render them keep working and ownership set here shows up there (same reference).
const ITEM_CATEGORIES = [
  { key: 'character', icon: 'shirt', label: 'Character items', desc: 'Hats, glasses, clothing and accessories',
    slots: ['hat', 'glasses', 'clothing', 'accessory'] },
  { key: 'room',      icon: 'sofa',  label: 'Room items',      desc: 'Furniture, wallpaper, flooring and decorations',
    slots: ['furniture', 'wallpaper', 'flooring', 'object'] },
];

const ITEMS = [...OUTFITS, ...DECOR, ...HOUSE_BGS];

const itemById = (id) => ITEMS.find(i => i.id === id) || null;
const itemsOfCategory = (key) => ITEMS.filter(i => i.category === key);
const itemsOfSlot = (slot) => ITEMS.filter(i => i.slot === slot);
// A-5.1 — limited-edition items are not a third category; they are a FLAG on an item,
// because a limited hat is still a hat and must sit in the hat slot, be bought with
// points, and be worn like any other. A separate category would fork all three.
const limitedItems = () => ITEMS.filter(i => i.limited);

// A-5.1 — "All decoration items can be purchased using Points." Purchase is therefore
// never the *only* question; the rules below are the EXTRA routes on top of it.
//   Level · Achievements · Events · Villain competitions
// Same shape, same matcher and same ledger discipline as the egg and character tables.
const ITEM_GRANTS = [
  // reaching a required level
  { id: 'i-lv-8', source: 'levelUp', item: 'goggles', enabled: true,
    when: { atLevel: 8 }, label: 'Reach level 8' },

  // completing achievements
  { id: 'i-ach-reflex', source: 'achievement', item: 'poster', enabled: true,
    when: { achievement: 'a3' }, label: 'Quick Reflex' },
  { id: 'i-ach-collector', source: 'achievement', item: 'shelf', enabled: true,
    when: { achievement: 'a5' }, label: 'Collector' },

  // villain competition rewards
  { id: 'i-villain-5', source: 'villain', item: 'medal', enabled: true,
    when: { villainsDefeated: 5 }, label: 'Defeat 5 villains' },
  { id: 'i-villain-10', source: 'villain', item: 'trophy', enabled: true,
    when: { villainsDefeated: 10 }, label: 'Defeat 10 villains' },

  // event & seasonal rewards — the limited-edition set, authored ahead and dark
  // until ops turns the season on. Enabling the season is a server flag, not a release.
  { id: 'i-winter-wreath',  source: 'event', item: 'wreath',  enabled: false, set: 'winter-2026',
    when: { event: 'winter-2026' }, label: 'Winter event' },
  { id: 'i-winter-lantern', source: 'event', item: 'lantern', enabled: false, set: 'winter-2026',
    when: { event: 'winter-2026' }, label: 'Winter event' },
  { id: 'i-winter-aurora',  source: 'event', item: 'aurora',  enabled: false, set: 'winter-2026',
    when: { event: 'winter-2026' }, label: 'Winter event' },
];

const activeItemGrants = () => ITEM_GRANTS.filter(g => g.enabled !== false);
const grantsForItem = (itemId) => activeItemGrants().filter(g => g.item === itemId);

// Every route to an item, purchase folded in from its price — the same derivation the
// egg cards use, so "how do I get this?" is answered from the rules rather than a
// hand-kept sentence that goes stale the first time a grant is retuned.
const itemSources = (itemId) => {
  const item = itemById(itemId);
  if (!item) return [];
  const keys = new Set(grantsForItem(itemId).map(g => g.source));
  if (item.price != null) keys.add('purchase');
  return SOURCES.filter(s => keys.has(s.key));
};

// The items a progress snapshot has earned outright. Already-owned items are skipped,
// so a child who simply bought the trophy is not "granted" it again on their 10th win.
const itemsEarned = (ctx, claimed = PLAYER.itemGrants) => {
  const out = [];
  for (const g of activeItemGrants()) {
    if (ctx.source && g.source !== ctx.source) continue;
    if (!isOwed(g, ctx, claimed)) continue;
    const item = itemById(g.item);
    if (!item || item.owned) continue;
    out.push({ grant: g, item });
  }
  return out;
};

const awardItems = (earned, player = PLAYER) => {
  for (const { grant, item } of earned) {
    item.owned = true;
    player.itemGrants[grant.id] = (player.itemGrants[grant.id] || 0) + 1;
  }
  return earned;
};

// A-5.1 — can this be bought right now, and if not, why. One answer for every item, so
// the outfit screen, the room screen and the wallpaper picker cannot disagree.
const canBuyItem = (item, player = PLAYER, stage = null) => {
  if (item.owned) return { ok: false, reason: 'owned' };
  if (item.price == null) return { ok: false, reason: 'not-for-sale' };
  if (item.minLevel && player.level < item.minLevel) return { ok: false, reason: 'level', need: item.minLevel };
  if (item.minStage && stage != null && stage < item.minStage) return { ok: false, reason: 'stage', need: item.minStage };
  if (player.points < item.price) return { ok: false, reason: 'points', need: item.price };
  return { ok: true };
};

// Spend the points and hand it over. Returns the same verdict shape so a caller can
// branch on one thing; ownership lives on the item row, which the views share by
// reference, so the room and shop screens see the purchase immediately.
const buyItem = (item, player = PLAYER, stage = null) => {
  const verdict = canBuyItem(item, player, stage);
  if (!verdict.ok) return verdict;
  player.points -= item.price;
  item.owned = true;
  return verdict;
};

// ── Egg types (A-2 · MVP) ────────────────────────────────────────────
// After the starter buddy, every new character comes out of an egg — eggs are the
// game's only character faucet. An egg type is pure data so a seasonal or event egg
// is one more row here (plus its odds), never a new branch in a screen.
// Like POINTS, these are business policy and are expected to come from server
// settings; the values below are the launch defaults / offline fallback.
//   price    — point cost, or null when the egg cannot be bought with points
//   minLevel — player level required to purchase (0 = no gate)
//   enabled  — ops kill-switch; a disabled egg stops dropping and stops being sold
//   odds     — relative weight per rarity tier of what hatches. A pricier egg does not
//              guarantee a rarer buddy, it shifts the odds. Only the Epic Egg can hatch an
//              Epic, which is what keeps the two hidden characters genuinely rare (F-15.2).
// NOTE: an egg does not declare where it comes from. Acquisition is owned by
// EGG_GRANTS below and derived back with eggSources() — otherwise adding a way to
// earn an egg would mean editing the egg *and* the rule, and the two would drift.
const EGGS = [
  { id: 'common', rarity: 'common', name: 'Common Egg', set: 'mvp', enabled: true,
    price: 500,  minLevel: 0, odds: { common: 8, rare: 2, epic: 0 } },
  { id: 'rare',   rarity: 'rare',   name: 'Rare Egg',   set: 'mvp', enabled: true,
    price: 1500, minLevel: 5, odds: { common: 3, rare: 6, epic: 0 } },
  { id: 'epic',   rarity: 'epic',   name: 'Epic Egg',   set: 'mvp', enabled: true,
    price: null, minLevel: 0, odds: { common: 0, rare: 4, epic: 6 } },
];

const eggById = (id) => EGGS.find(e => e.id === id) || null;
const activeEggs = () => EGGS.filter(e => e.enabled !== false);

// ── Acquisition sources (A-2.1 / A-4.1 / A-5.1) ──────────────────────
// Every way anything is earned in JoanX — eggs, characters, and items all draw from
// this one registry. Keeping a single list is what guarantees "Achievements" means the
// same thing on the egg card, the dex hint and the item shop; three parallel lists
// would drift the moment someone renamed one.
// It is a registry, not a union type: a new method (referral, parent gift, sponsor
// campaign…) is one more entry here plus its rules — no screen counts these.
//   claim — 'auto'   the grant lands the moment it triggers
//           'manual' the child taps to claim it
const SOURCES = [
  { key: 'mission',     icon: 'target',       label: 'Missions',         desc: 'Clear your daily and weekly safe-walk goals', claim: 'manual' },
  { key: 'distance',    icon: 'footprints',   label: 'Distance & time',  desc: 'Reach a total safe-walking distance or duration', claim: 'auto' },
  { key: 'streak',      icon: 'flame',        label: 'Safe streak',      desc: 'Walk accident-free days in a row', claim: 'auto' },
  { key: 'behaviour',   icon: 'trending-down',label: 'Less phone use',   desc: 'Cut how much you use your phone while walking', claim: 'auto' },
  { key: 'purchase',    icon: 'star',         label: 'Point shop',       desc: 'Buy it with safety points', claim: 'manual' },
  { key: 'levelUp',     icon: 'trending-up',  label: 'Level-up reward',  desc: 'Reach a new level', claim: 'auto' },
  { key: 'event',       icon: 'party-popper', label: 'Events & seasons', desc: 'Limited-time and seasonal rewards', claim: 'auto' },
  { key: 'achievement', icon: 'trophy',       label: 'Achievements',     desc: 'Complete a designated achievement', claim: 'manual' },
  { key: 'villain',     icon: 'swords',       label: 'Villain battles',  desc: 'Win villain competitions', claim: 'auto' },
];

const sourceOf = (key) => SOURCES.find(s => s.key === key) || null;

// The grant table — the single place that says "doing X earns you egg Y".
// Each row is one earnable rule. `when` is a small descriptor read by the matcher
// for that source kind, so a new trigger shape is a new matcher, not a rewrite.
//   repeatable — can pay out more than once (every streak, every 25 km…)
//   enabled    — ops toggle; a seasonal rule ships disabled and is switched on server-side
const EGG_GRANTS = [
  // 1 · safe-walking goals — daily and weekly missions
  { id: 'g-daily',  source: 'mission', egg: 'common', qty: 1, repeatable: true, enabled: true,
    when: { missions: 'daily' },  label: 'Clear every daily mission' },
  { id: 'g-weekly', source: 'mission', egg: 'rare',   qty: 1, repeatable: true, enabled: true,
    when: { missions: 'weekly' }, label: 'Clear every weekly mission' },

  // 2 · cumulative safe-walking distance or duration
  { id: 'g-km-10',    source: 'distance', egg: 'common', qty: 1, enabled: true,
    when: { metric: 'safeKm', reach: 10 },       label: 'Walk 10 km safely' },
  { id: 'g-km-50',    source: 'distance', egg: 'rare',   qty: 1, enabled: true,
    when: { metric: 'safeKm', reach: 50 },       label: 'Walk 50 km safely' },
  { id: 'g-min-600',  source: 'distance', egg: 'common', qty: 1, enabled: true,
    when: { metric: 'safeMinutes', reach: 600 }, label: 'Walk safely for 10 hours' },
  // the endless tail — keeps paying long after the fixed milestones run out
  { id: 'g-km-every', source: 'distance', egg: 'common', qty: 1, repeatable: true, enabled: true,
    when: { metric: 'safeKm', every: 25 },       label: 'Every 25 km walked safely' },

  // 3 · purchase — no rule row: the point price lives on the egg itself, and
  //     eggSources() folds 'purchase' in for any egg carrying a price.

  // 4 · level-up rewards
  { id: 'g-lv-every-5', source: 'levelUp', egg: 'rare', qty: 1, repeatable: true, enabled: true,
    when: { everyLevels: 5 }, label: 'Every 5 levels' },
  { id: 'g-lv-10',      source: 'levelUp', egg: 'epic', qty: 1, enabled: true,
    when: { atLevel: 10 },    label: 'Reach level 10' },

  // 5 · events & seasonal rewards
  { id: 'g-streak-30', source: 'event', egg: 'epic', qty: 1, repeatable: true, enabled: true,
    when: { streakDays: POINTS.streak30Days }, label: 'Walk safely 30 days in a row' },
  // a seasonal drop, authored ahead of time and dark until ops flips it on
  { id: 'g-spring-26', source: 'event', egg: 'epic', qty: 1, enabled: false, set: 'spring-2026',
    when: { event: 'spring-2026' }, label: 'Spring event' },

  // 6 · designated achievements
  { id: 'g-ach-zone',      source: 'achievement', egg: 'common', qty: 1, enabled: true,
    when: { achievement: 'a4' }, label: 'Zone Dodger' },
  { id: 'g-ach-collector', source: 'achievement', egg: 'rare',   qty: 1, enabled: true,
    when: { achievement: 'a5' }, label: 'Collector' },
];

const activeGrants = () => EGG_GRANTS.filter(g => g.enabled !== false && eggById(g.egg)?.enabled !== false);

// Every grant that pays out this egg — the inverse of the table, used by the shop
// to answer "how do I get one?" without anybody hand-maintaining a second list.
const grantsForEgg = (eggId) => activeGrants().filter(g => g.egg === eggId);

// The source kinds an egg can arrive from, purchase folded in from its price.
// Ordered by SOURCES so the UI reads consistently.
const eggSources = (eggId) => {
  const egg = eggById(eggId);
  if (!egg) return [];
  const keys = new Set(grantsForEgg(eggId).map(g => g.source));
  if (egg.price != null) keys.add('purchase');
  return SOURCES.filter(s => keys.has(s.key));
};

// ── Condition matching (A-2.1 / A-4.1) ───────────────────────────────
// One matcher, shared by egg grants AND character unlocks, because the two ask the
// same question of the same progress snapshot — "has this child done X?" — and only
// differ in what they pay out. Keeping one engine is what stops "30 days accident-free"
// from meaning one thing to the egg table and another to the unlock table.
//
// A `when` is an AND of its keys, so conditions compose: { streakDays: 30, metric:
// 'safeKm', reach: 100 } is "a 30-day streak AND 100 km". A new condition is one more
// clause here and nothing else in the app changes.
//   ctx — the progress snapshot, built by progress() below:
//         { missions, safeKm, safeMinutes, streakDays, level, phoneUseDrop, achievement, event }
const matchWhen = (w, ctx) => {
  // cumulative metric: reach a total (100 km), or clear a repeating step (every 25 km)
  if (w.metric != null) {
    const v = ctx[w.metric] ?? 0;
    const bar = w.reach ?? w.every;
    if (bar == null || v < bar) return false;
  }
  if (w.missions != null && ctx.missions !== w.missions) return false;
  if (w.achievement != null && ctx.achievement !== w.achievement) return false;
  // `achievement` is the one that JUST completed (a trigger); `achievementDone` asks
  // whether it is done at all (a state) — which is what a room unlock needs, since it
  // is re-derived on every boot, not paid out once at the moment of completion.
  if (w.achievementDone != null && !(ctx.achievementsDone || []).includes(w.achievementDone)) return false;
  if (w.event != null && ctx.event !== w.event) return false;
  if (w.streakDays != null && (ctx.streakDays ?? 0) < w.streakDays) return false;
  if (w.villainsDefeated != null && (ctx.villainsDefeated ?? 0) < w.villainsDefeated) return false;
  if (w.atLevel != null && ctx.level !== w.atLevel) return false;
  if (w.everyLevels != null && !(ctx.level > 0 && ctx.level % w.everyLevels === 0)) return false;
  return true;
};

// How many times a repeatable rule should have paid out by now, so a child who
// walks 80 km before we ever check still gets all three of their 25 km eggs.
const grantPayouts = (rule, ctx) => {
  const w = rule.when;
  if (w.metric != null && w.every != null) return Math.floor((ctx[w.metric] || 0) / w.every);
  if (w.everyLevels != null) return Math.floor((ctx.level || 0) / w.everyLevels);
  return 1;
};

// A rule is owed if it matches and has not been settled. Shared by both tables:
// `claimed` is the payout ledger (rule id → times paid), which is what stops a
// one-shot re-awarding on every check and lets a repeatable resume mid-way.
const isOwed = (rule, ctx, claimed) => {
  if (!matchWhen(rule.when, ctx)) return 0;
  const due = rule.repeatable ? grantPayouts(rule, ctx) : 1;
  return Math.max(0, due - (claimed[rule.id] || 0));
};

// The eggs a progress snapshot has earned. Returns [{ grant, egg, qty }] — the
// caller records what it awarded (PLAYER.eggGrants) so a one-shot never repays.
const eggsEarned = (ctx, claimed = PLAYER.eggGrants) => {
  const out = [];
  for (const g of activeGrants()) {
    if (ctx.source && g.source !== ctx.source) continue;
    const owed = isOwed(g, ctx, claimed);
    if (!owed) continue;
    out.push({ grant: g, egg: eggById(g.egg), qty: owed * (g.qty || 1) });
  }
  return out;
};

// Award them: the eggs land unhatched in the inventory, and the payout is recorded
// so the same milestone never pays twice.
const awardEggs = (earned, player = PLAYER) => {
  for (const { grant, egg, qty } of earned) {
    player.eggs[egg.id] = (player.eggs[egg.id] || 0) + qty;
    player.eggGrants[grant.id] = (player.eggGrants[grant.id] || 0) + qty / (grant.qty || 1);
  }
  return earned;
};

const eggCount = (eggId, player = PLAYER) => player.eggs[eggId] || 0;
const totalEggs = (player = PLAYER) => Object.values(player.eggs).reduce((a, b) => a + b, 0);

// ── Hatch probability policy (A-2.2 / F-15) ──────────────────────────
// Two rolls, in this order: the egg's odds pick a RARITY TIER, then a buddy is drawn
// from that tier. Rolling the tier first is what makes the odds mean what they say —
// drawing from one flat bag would quietly re-weight every tier by how many characters
// happen to sit in it, so shipping a new Common would make Commons more likely.
const rollRarity = (egg, rnd = Math.random) => {
  const odds = egg.odds || {};
  const total = RARITIES.reduce((sum, r) => sum + (odds[r.key] || 0), 0);
  if (total <= 0) return null;
  let n = rnd() * total;
  for (const r of RARITIES) {
    n -= odds[r.key] || 0;
    if (n < 0) return r.key;
  }
  return null;
};

// Hatch: roll a tier, then draw from it — unowned buddies weighted heavier so a hatch
// stays exciting while there is anything left to find. Once a tier is fully collected
// it rolls duplicates, which the caller converts to XP at the tier's dupXp.
const hatchEgg = (egg, rnd = Math.random) => {
  const rarity = rollRarity(egg, rnd);
  if (!rarity) return null;
  const pool = charactersOfRarity(rarity);
  if (!pool.length) return null;
  const bag = pool.flatMap(c => Array(c.owned ? 1 : 3).fill(c));
  return bag[Math.floor(rnd() * bag.length)];
};

// ── A-2.3 · Buying an egg, and hatching it ───────────────────────────
// Two separate steps, on purpose. Buying an egg PUTS AN EGG IN YOUR BAG; hatching it is a
// second, free act you take when you feel like it. They used to be one: buying deducted the
// points and threw you straight into the hatch overlay without the egg ever entering
// PLAYER.eggs — so a purchased egg was never actually owned, and a hatch that didn't reach
// the reveal took the points AND the egg with it. Now the purchase is complete on its own.
//
// Hatching costs NOTHING. No power, no energy, no second currency: the egg IS the cost, and
// it was already paid. `hatchFromInventory` spends exactly one egg and nothing else.
const canBuyEgg = (egg, player = PLAYER) => {
  if (!egg) return { ok: false, reason: 'no-egg' };
  if (egg.enabled === false) return { ok: false, reason: 'disabled' };
  if (egg.price == null) return { ok: false, reason: 'not-for-sale' };   // reward-only — see eggSources()
  if (player.level < (egg.minLevel || 0)) return { ok: false, reason: 'level', need: egg.minLevel };
  if (player.points < egg.price) return { ok: false, reason: 'points', need: egg.price };
  return { ok: true };
};

// Spend the points, hand over the egg. The egg lands in the bag — nothing is hatched here.
const buyEgg = (egg, player = PLAYER) => {
  const verdict = canBuyEgg(egg, player);
  if (!verdict.ok) return verdict;
  player.points -= egg.price;
  player.eggs[egg.id] = (player.eggs[egg.id] || 0) + 1;
  return { ...verdict, egg };
};

// Hatch one egg from the bag. Atomic: the egg is spent and the character is granted in the
// same breath, so there is no window where a child has paid and holds neither. The rarity
// tier comes from the egg's own odds (rollRarity) — the existing probability policy, untouched.
const hatchFromInventory = (egg, player = PLAYER, rnd = Math.random) => {
  if (eggCount(egg.id, player) < 1) return { ok: false, reason: 'none' };
  const buddy = hatchEgg(egg, rnd);
  if (!buddy) return { ok: false, reason: 'empty-pool' };   // never spend the egg on nothing
  player.eggs[egg.id] -= 1;                                 // the one and only cost of a hatch
  const dup = buddy.owned;
  let xp = 0;
  if (dup) {
    // already collected → the duplicate converts to XP for the active buddy (F-15)
    xp = rarityOf(buddy.rarity).dupXp;
    gainXp(CHARACTERS.find(c => c.id === player.activeCharId), xp, player);
  } else {
    // joins the collection — and for an Epic this is the moment it stops being hidden
    // from the dex at all (F-15.2). Level 1, and applyXpCurve derives xpMax AND the stage.
    buddy.owned = true; buddy.level = 1; buddy.xp = 0;
    applyXpCurve([buddy]);
  }
  return { ok: true, buddy, dup, xp };
};

// ── Direct character unlocks (A-4.1) ─────────────────────────────────
// A Rare or Epic buddy is NOT purely a dice roll. Sustained safe behaviour earns one
// outright, on a guaranteed path that never touches the odds:
//   Rare — hatch a Rare Egg, OR hit a cumulative safe-walking goal
//   Epic — hatch an Epic Egg, OR finish a long-term mission or achievement
// This is the deliberate safety valve on a gacha: a child who walks safely for a month
// must not be left with nothing because the RNG was unkind. The random path is the fast
// one; this is the certain one. Both feed the same roster — there is no separate pool.
//
//   grant.character — unlocks that exact buddy (a named story/event reward)
//   grant.rarity    — unlocks an unowned buddy of that tier, so the rule keeps working
//                     as the roster grows and never dead-ends on a sold-out character
// Server-configurable like every other policy table here.
const CHARACTER_UNLOCKS = [
  // cumulative safe-walking goals → a guaranteed Rare
  { id: 'u-streak-7', enabled: true, source: 'streak',
    when: { streakDays: POINTS.streak7Days }, grant: { rarity: 'rare' },
    label: '7 days accident-free' },
  { id: 'u-km-100', enabled: true, source: 'distance',
    when: { metric: 'safeKm', reach: 100 }, grant: { rarity: 'rare' },
    label: 'Walk 100 km safely' },

  // long-term missions & achievements → a guaranteed Epic
  { id: 'u-streak-30', enabled: true, source: 'streak',
    when: { streakDays: POINTS.streak30Days }, grant: { character: 'c18' },   // Ember
    label: '30 days accident-free' },
  // behaviour change, not just volume: phone use while walking must actually drop.
  // Measured against the child's own first week (see PLAYER.phoneUseDrop), so it
  // rewards improvement rather than punishing whoever started out worst.
  { id: 'u-phone-drop', enabled: true, source: 'behaviour',
    when: { metric: 'phoneUseDrop', reach: 0.5 }, grant: { rarity: 'epic' },
    label: 'Halve your phone use while walking' },
  { id: 'u-ach-early', enabled: true, source: 'achievement',
    when: { achievement: 'a6' }, grant: { rarity: 'rare' },
    label: 'Early Walker' },

  // seasonal / special missions — authored ahead, dark until ops flips it on
  { id: 'u-event-spring', enabled: false, set: 'spring-2026', source: 'event',
    when: { event: 'spring-2026' }, grant: { character: 'c19' },              // Zephyr
    label: 'Win a special event mission' },
];

const activeUnlocks = () => CHARACTER_UNLOCKS.filter(u => u.enabled !== false);

// Which buddy a rule pays out right now. A rarity grant prefers one you don't own —
// that is the whole point of a guaranteed path — and returns null once the tier is
// exhausted rather than handing over a duplicate the child cannot be excited about.
const unlockTarget = (rule, rnd = Math.random) => {
  if (rule.grant.character) return CHARACTERS.find(c => c.id === rule.grant.character) || null;
  const pool = charactersOfRarity(rule.grant.rarity).filter(c => !c.owned);
  if (!pool.length) return null;
  return pool[Math.floor(rnd() * pool.length)];
};

// The characters a progress snapshot has earned outright. Same ledger discipline as
// eggs: PLAYER.charUnlocks records what paid, so a milestone never re-awards.
const charactersEarned = (ctx, claimed = PLAYER.charUnlocks, rnd = Math.random) => {
  const out = [];
  for (const u of activeUnlocks()) {
    if (ctx.source && u.source !== ctx.source) continue;
    if (!isOwed(u, ctx, claimed)) continue;
    const character = unlockTarget(u, rnd);
    if (!character || character.owned) continue;   // tier exhausted, or already theirs
    out.push({ rule: u, character });
  }
  return out;
};

// Award them: the buddy joins the collection at level 1 — and for an Epic this is the
// moment it stops being hidden and appears in the dex at all (F-15.2).
const awardCharacters = (earned, player = PLAYER) => {
  for (const { rule, character } of earned) {
    character.owned = true;
    character.level = 1; character.xp = 0; character.xpMax = xpForLevel(1);
    player.charUnlocks[rule.id] = (player.charUnlocks[rule.id] || 0) + 1;
  }
  return earned;
};

// ── Where a buddy comes from (dex hints) ─────────────────────────────
// Derived, never hand-written: a character's unlock hint is read back off the two
// tables that actually grant it. Authoring the hint by hand is how a dex ends up
// promising "Hatch a Rare Egg" for a buddy the odds can no longer produce.
//   1 — any unlock rule that names it, or names its tier
//   2 — any egg whose odds can roll its tier
// The odds this egg actually rolls that tier, normalised — 2-in-10 and 6-in-9 are not
// comparable as raw weights, and comparing them raw is how you end up telling a child
// to hatch a Common Egg to find a Rare.
const tierChance = (egg, rarity) => {
  const odds = egg.odds || {};
  const total = RARITIES.reduce((s, r) => s + (odds[r.key] || 0), 0);
  return total > 0 ? (odds[rarity] || 0) / total : 0;
};

const unlockRoutes = (c) => {
  const rules = activeUnlocks().filter(u =>
    u.grant.character === c.id || u.grant.rarity === c.rarity);
  // best egg first: the one most likely to roll this tier, not merely the first that can.
  const eggs = activeEggs()
    .filter(e => tierChance(e, c.rarity) > 0)
    .sort((a, b) => tierChance(b, c.rarity) - tierChance(a, c.rarity));
  return { rules, eggs };
};

// The routes the dex shows on a locked slot, as separate labels rather than one
// pre-joined sentence — each is a translation key on its own, and a composed string
// would never match one. The caller translates each and joins them.
// Egg first (the everyday path), then the earned path, so the child reads the route
// they can act on today before the one they have to work up to.
const unlockHints = (c) => {
  if (c.owned) return [];
  const { rules, eggs } = unlockRoutes(c);
  const out = [];
  // "an Epic Egg", "a Rare Egg" — the article follows the name, so a future
  // "Aurora Egg" reads right without anyone remembering to special-case it
  if (eggs[0]) out.push(`Hatch ${/^[aeiou]/i.test(eggs[0].name) ? 'an' : 'a'} ${eggs[0].name}`);
  if (rules[0]) out.push(rules[0].label);
  return out.length ? out : [c.locked || 'Not yet discovered'];
};

// ── Progress snapshot ────────────────────────────────────────────────
// The single builder every rule check goes through, so the egg table and the unlock
// table are always asking about the same numbers. `extra` carries the one-shot facts a
// trigger needs but the player object does not hold (which mission set just cleared,
// which achievement just completed, which event is live).
const progress = (extra = {}, player = PLAYER) => ({
  safeKm: player.safeKm,
  safeMinutes: player.safeMinutes,
  streakDays: player.streak,
  level: player.level,
  phoneUseDrop: player.phoneUseDrop,
  villainsDefeated: villainsDefeated(),   // the ENABLED ladder only — a dark season pays nothing
  achievementsDone: ACHIEVEMENTS.filter(a => a.done).map(a => a.id),   // state, not the one that just fired
  ...extra,
});

// The whole reward sweep in one call: everything this child has earned but not been
// given. Callers hand it a snapshot and get back all three faucets, already awarded.
// One entry point matters — a walk that ends should be able to pay an egg, a character
// and an item without the caller remembering to ask three separate systems.
const claimRewards = (extra = {}, player = PLAYER, rnd = Math.random) => {
  const ctx = progress(extra, player);
  const eggs = awardEggs(eggsEarned(ctx, player.eggGrants), player);
  const characters = awardCharacters(charactersEarned(ctx, player.charUnlocks, rnd), player);
  const items = awardItems(itemsEarned(ctx, player.itemGrants), player);
  return { eggs, characters, items };
};

// ── Parent account sign-in (F-33) ────────────────────────────────────
// Phone number + SMS verification is the primary method. Social sign-in is there to
// satisfy platform policy and save typing: Google on Android, Sign in with Apple on iOS.
// Email/password is out of MVP scope — note it is *disabled* here, not deleted: the flow
// renders whatever methods are enabled for the platform, so adding email later is this
// flag plus its form, not a rebuild of the screen.
const AUTH = {
  smsCodeLength: 6,
  smsResendSeconds: 180,   // how long before "Resend code" becomes available again
  methods: [
    { key: 'phone',  label: 'Phone number',        enabled: true,  primary: true },
    { key: 'google', label: 'Continue with Google', enabled: true,  platforms: ['android'] },
    { key: 'apple',  label: 'Sign in with Apple',   enabled: true,  platforms: ['ios'] },
    { key: 'email',  label: 'Continue with email',  enabled: false },   // excluded from the MVP (F-33.1)
  ],
};

// ios · android · web. The prototype runs in a desktop browser, and 'web' is treated as
// "show everything" so both social buttons can be reviewed side by side in the demo.
const devicePlatform = () => {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'web';
};

// The sign-in methods to offer on this device, in order.
const authMethods = (platform = devicePlatform()) =>
  AUTH.methods.filter(m => m.enabled && (!m.platforms || platform === 'web' || m.platforms.includes(platform)));

// Mock: phone numbers that already have an account, so verifying one signs in rather
// than walking through profile creation. Swap for the real lookup.
const KNOWN_PHONES = ['010-1234-5678', '01012345678'];

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
  // level 5, not 4: stage is derived (A-3.3) and Stage 2 starts at Lv.5, so a Lv.4 buddy
  // hand-marked Stage 2 was simply illegal. Levelled up rather than demoted — Mochi is
  // the starter buddy and is drawn at Stage 2 throughout.
  { id: 'c2',  species: 'cat',  name: 'Mochi',   color: '#e1874a', rarity: 'common', set: 'mvp', level: 5, xp: 140, owned: true,  room: 'green', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c3',  species: 'bird', name: 'Pip',     color: '#447aaf', rarity: 'common', set: 'mvp', level: 2, xp: 60,  owned: true,  room: 'green', traits: { guard: 40, speed: 72, heart: 50 } },
  { id: 'c10', species: 'cat',  name: 'Bloo',    color: '#a8c3eb', rarity: 'common', set: 'mvp', level: 5, xp: 140, owned: true,  room: 'town', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c11', species: 'cat',  name: 'Cocoa',   color: '#a9744f', rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 45, speed: 70, heart: 62 } },
  { id: 'c12', species: 'bird', name: 'Sky',     color: '#5aa9e6', rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 38, speed: 78, heart: 55 } },
  { id: 'c13', species: 'croc', name: 'Snap',    color: '#5c9e6b', rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 72, speed: 44, heart: 58 } },
  { id: 'c14', species: 'owl',  name: 'Pebble',  color: '#8b8073', rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 60, speed: 50, heart: 66 } },
  { id: 'c15', species: 'fox',  name: 'Biscuit', color: '#d8a657', rarity: 'common', set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Common Egg', room: null, traits: { guard: 52, speed: 64, heart: 70 } },
  // ── Rare ×5 ──
  { id: 'c1',  species: 'fox',  name: 'Hammy',   color: '#4b814f', rarity: 'rare',   set: 'mvp', level: 7, xp: 320, owned: true,  room: 'green', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c6',  species: 'owl',  name: 'Sunny',   color: '#e0554a', rarity: 'rare',   set: 'mvp', level: 5, xp: 350, owned: true,  room: 'town', traits: { guard: 60, speed: 85, heart: 64 } },   // Lv.5 → Stage 2, one level short of the Stage 3 threshold (A-3.3)
  { id: 'c9',  species: 'fox',  name: 'Toffee',  color: '#d99c5a', rarity: 'rare',   set: 'mvp', level: 7, xp: 320, owned: true,  room: 'town', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c16', species: 'owl',  name: 'Luna',    color: '#7c5cbf', rarity: 'rare',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Rare Egg', room: null, traits: { guard: 66, speed: 58, heart: 74 } },
  { id: 'c17', species: 'croc', name: 'Basil',   color: '#3f7f8c', rarity: 'rare',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Hatch a Rare Egg', room: null, traits: { guard: 84, speed: 48, heart: 68 } },
  // ── Epic ×2 — hidden until unlocked (F-15.2): no dex slot, no silhouette, no name ──
  { id: 'c18', species: 'croc', name: 'Ember',   color: '#9867e4', rarity: 'epic',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Walk safely 30 days in a row', room: null, traits: { guard: 95, speed: 70, heart: 88 } },
  { id: 'c19', species: 'bird', name: 'Zephyr',  color: '#e0559a', rarity: 'epic',   set: 'mvp', level: 0, xp: 0, owned: false, locked: 'Win a special event mission', room: null, traits: { guard: 80, speed: 96, heart: 82 } },
];

// F-15.2 — an Epic stays invisible until it is unlocked. Every "show me the roster"
// surface (dex, collection, totals) goes through this, so a hidden character leaks
// nowhere — not even as a locked slot or a completion denominator that hints at it.
const isRevealed = (c) => c.owned || !rarityOf(c.rarity).hiddenUntilUnlocked;
const visibleCharacters = () => CHARACTERS.filter(isRevealed);
const charactersOfRarity = (key) => CHARACTERS.filter(c => c.rarity === key);

// Seed the derived level state (xpMax / maxed) from the curve in force. The shipped
// app calls setXpCurve() again once remote settings land, which re-runs this.
applyXpCurve();

// ── Room themes (A-6 / A-7 / A-12) ───────────────────────────────────
// A theme IS the environment: the wall treatment, the floor, the accent that ties
// them together, and the wallpaper palette that suits it. Each theme also owns a
// set of decoration items (see DECOR above, scoped by `rooms`), so switching room
// changes both the place you are in and the things you can put in it.
//
// Adding a theme — a season, a partner tie-in, whatever the business asks for — is
// one row here plus its decor rows above. No screen changes: every room surface
// renders whatever is in this table.
//   wall(t) — the wall, tinted by the chosen wallpaper `t`
const ROOM_THEMES = [
  { id: 'green', name: 'Green Room', icon: 'trees', blurb: 'Forest, leaves and quiet trails.',
    wallpapers: ['#e7f3e4', '#dff0e6', '#eef5dd', '#e3efe8'],
    wall: t => `radial-gradient(circle at 84% 14%, rgba(255,255,255,.5) 0 42px, transparent 43px), linear-gradient(180deg, ${t} 0%, ${shade(t, 8)} 100%)`,
    floor: 'linear-gradient(180deg,#cfe3b7,#b9d49b)', accent: '#8bb46a' },

  { id: 'town', name: 'Town Room', icon: 'building-2', blurb: 'School, park and the streets between.',
    wallpapers: ['#eaf0f6', '#f1eee9', '#e7eef2', '#f4efe6'],
    wall: t => `linear-gradient(180deg, ${shade(t, -6)} 0%, #fbfbfc 100%)`,
    floor: 'linear-gradient(180deg,#dfe3e8,#c9cfd7)', accent: '#a7b0bc' },

  { id: 'dream', name: 'Dream Room', icon: 'moon-star', blurb: 'Stars, clouds and soft impossible things.',
    wallpapers: ['#efe8fb', '#e8e6fa', '#f7e9f5', '#e6effb'],
    wall: t => `radial-gradient(circle at 20% 24%, rgba(255,255,255,.75) 0 2.5px, transparent 3.5px) 0 0/34px 34px, linear-gradient(180deg, ${t} 0%, ${shade(t, 10)} 100%)`,
    floor: 'linear-gradient(180deg,#e4d8f7,#d0c0ee)', accent: '#b39ce0' },

  // seasonal — authored ahead and locked until ops turns the set on, exactly like the
  // limited items. This row is the proof the table above expands without a release.
  { id: 'winter', name: 'Winter Room', icon: 'snowflake', blurb: 'Snow light and a quiet, frosted hush.',
    set: 'winter-2026',
    wallpapers: ['#e6eef7', '#eaf3f5', '#f0eef9'],
    wall: t => `radial-gradient(circle at 30% 18%, rgba(255,255,255,.8) 0 2px, transparent 3px) 0 0/28px 28px, linear-gradient(180deg, ${t} 0%, ${shade(t, -4)} 100%)`,
    floor: 'linear-gradient(180deg,#eef3f8,#dbe5ee)', accent: '#b6c6d6' },
];

const themeById = (id) => ROOM_THEMES.find(t => t.id === id) || ROOM_THEMES[0];
const themeOf = (room) => themeById(room?.theme);

// The three MVP rooms — one per basic theme. `wallpaper` is the tint chosen inside the
// theme's palette and `placed` is that room's own decor, so every room is decorated
// independently (A-6 free placement: characters via CHARACTERS.room, items via this).
//   home     — the default room, handed over at sign-up. Never locked, never earned.
//   unlocked — DERIVED, never authored: applyRoomUnlocks() writes it from the rules
//              below against the child's real progress. Seeded here only so the first
//              render before that call is honest.
const ROOMS = [
  { id: 'green', name: 'Green Room', theme: 'green', home: true, unlocked: true, slots: 3, wallpaper: '#e7f3e4', placed: { plant: true, sapling: true } },
  { id: 'town',  name: 'Town Room',  theme: 'town',  unlocked: false, slots: 3, wallpaper: '#eaf0f6', placed: { lamp: true } },
  { id: 'dream', name: 'Dream Room', theme: 'dream', unlocked: false, slots: 4, wallpaper: '#efe8fb', placed: {} },
  // expansion slot — a seasonal room, dark until the winter set goes live
  { id: 'winter', name: 'Winter Room', theme: 'winter', unlocked: false, slots: 4, wallpaper: '#e6eef7', placed: {} },
];

// ── Room unlocks (A-6 · rooms are EARNED, never bought) ──────────────
// Rooms are NOT sold for points. The Green Room is the child's home and is there from
// the first walk; every other room opens by safe behaviour — an accident-free streak, a
// cumulative safe-walking total, an achievement. Same rule shape as the egg / character
// / item milestones, so it runs through the same matchWhen() against the same progress
// snapshot: one vocabulary of conditions across every faucet in the app.
//
//   room  — the room this rule opens
//   when  — the condition: streakDays · metric + reach · achievementDone · event
//   after — the room that must already be open, which is what makes the ladder
//           SEQUENTIAL: Town before Dream, however generous the numbers get retuned to.
//
// These are DEFAULTS. Ops retunes them from server settings via setRoomUnlocks() — the
// bar, the metric, even which room comes first are policy, not code.
const ROOM_UNLOCK_DEFAULTS = [
  { id: 'ru-town', room: 'town', enabled: true, source: 'streak',
    when: { streakDays: 5 },
    label: 'Walk safely 5 days in a row' },

  { id: 'ru-dream', room: 'dream', enabled: true, source: 'duration', after: 'town',
    when: { metric: 'safeMinutes', reach: 1500 },
    label: 'Walk safely for 25 hours' },

  // seasonal — authored ahead, dark until ops flips the season on
  { id: 'ru-winter', room: 'winter', enabled: false, set: 'winter-2026', source: 'event', after: 'dream',
    when: { event: 'winter-2026' },
    label: 'Winter event' },
];

const ROOM_UNLOCKS = ROOM_UNLOCK_DEFAULTS.map(r => ({ ...r }));
const activeRoomUnlocks = () => ROOM_UNLOCKS.filter(r => r.enabled !== false);
const roomRule = (roomId) => activeRoomUnlocks().find(r => r.room === roomId) || null;

// Is this room open right now? A home room always is. Any other room needs an ACTIVE
// rule that is both MET and preceded by its `after` room — so a room with no rule (or
// one whose season is dark) stays shut rather than falling open by default.
const roomOpen = (room, ctx = progress()) => {
  if (!room) return false;
  if (room.home) return true;
  const rule = roomRule(room.id);
  if (!rule) return false;
  if (rule.after && !roomOpen(ROOMS.find(r => r.id === rule.after), ctx)) return false;
  return matchWhen(rule.when, ctx);
};

// How close the child is to opening a locked room — the number the locked card shows,
// so the goal reads as "3 of 5 days", not a closed door.
const roomProgress = (room, ctx = progress()) => {
  const rule = roomRule(room?.id);
  if (!rule || room?.home) return null;
  const w = rule.when;
  const have = w.streakDays != null ? (ctx.streakDays ?? 0)
             : w.metric != null     ? (ctx[w.metric] ?? 0)
             : 0;
  const need = w.streakDays ?? w.reach ?? 0;
  const unit = w.streakDays != null ? 'days' : w.metric === 'safeKm' ? 'km' : w.metric === 'safeMinutes' ? 'min' : '';
  // a room still waiting on its predecessor shows THAT as the blocker, not a bar it
  // has already filled — otherwise a full bar sits next to a locked door
  const blockedBy = rule.after && !roomOpen(ROOMS.find(r => r.id === rule.after), ctx)
    ? ROOMS.find(r => r.id === rule.after) : null;
  return {
    rule, label: rule.label, have, need, unit, blockedBy,
    pct: need > 0 ? Math.min(1, have / need) : 0,
    measurable: need > 0,   // an event rule has nothing to count toward
  };
};

// Derive every room's `unlocked` from the rules in force. Called at boot, after a walk
// pays out, and again whenever server settings land — the same discipline as the XP
// curve: derived state is recomputed, never left behind.
const applyRoomUnlocks = (player = PLAYER) => {
  const ctx = progress({}, player);
  ROOMS.forEach(r => { r.unlocked = roomOpen(r, ctx); });
  return ROOMS;
};

// Server settings (A-6). Ops hands over the unlock table; anything malformed is
// dropped rather than trusted, and a payload that leaves NO valid rule falls back to
// the defaults — a bad push must never strand a child with one room forever.
const setRoomUnlocks = (rows) => {
  const valid = Array.isArray(rows) ? rows.filter(r =>
    r && typeof r.id === 'string'
    && ROOMS.some(x => x.id === r.room)          // opens a room that exists
    && !ROOMS.find(x => x.id === r.room).home    // …and not the home room
    && r.when && typeof r.when === 'object'
    && (r.after == null || ROOMS.some(x => x.id === r.after))
  ) : [];
  ROOM_UNLOCKS.length = 0;
  ROOM_UNLOCKS.push(...(valid.length ? valid.map(r => ({ ...r })) : ROOM_UNLOCK_DEFAULTS.map(r => ({ ...r }))));
  applyRoomUnlocks();
  return ROOM_UNLOCKS;
};

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
// `ack` — which guardian already handled this. Both parents' phones buzz for the same event,
// so without it they both call the child about the same warning. The second parent should see
// "Dad already checked this", not a fresh alarm.
const PARENT_ALERTS = [
  { id: 'n1', kind: 'warning',    child: 'k1', title: 'Distraction warning', sub: 'Near Oak Street crossing',   time: '8m',  today: true },
  { id: 'n2', kind: 'safe',       child: 'k3', title: 'Safe walk completed',  sub: '22 min phone-free',          time: '40m', today: true },
  { id: 'n3', kind: 'ignored',    child: 'k2', title: 'Warning ignored',      sub: 'Kept scrolling while walking', time: '1h', today: true, ack: 'Min-jun' },
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

// ── Villains (A-8 / A-9 · F-19) ──────────────────────────────────────
// A villain is NOT a monster. Each one is an original IP character personifying a
// real thing that hurts children on the way to school — the pull of the screen, the
// hurry, the dark. So a row carries the five things Joan approves as one set —
// name · personality · story · look · battle characteristics — instead of a name and
// a power number, with the actual character stranded in a slide deck. The dex, the
// battle screen and the art brief then all read the same row and cannot drift.
//
// `look` is the approved art direction. `species` + `color` are only the prototype's
// stand-in for it (the Mascot renderer can't draw the real IP yet) — when Joan's art
// lands, it replaces those two fields and no screen changes.
//
// Built to grow, the same way EGGS / ITEMS / CHARACTERS are:
//   set     — 'mvp' today; a seasonal wave is authored as its own set
//   enabled — false keeps a villain dark until ops flips it: shipping a season is a
//             server flag, not an app release
//   role    — minion · midBoss · finalBoss. Everything asks the ROLE who the boss is;
//             nothing keys off "the last row", so appending a seasonal villain after
//             Nox cannot silently promote it to final boss and move the ending
//   lv      — ladder position, sequential-unlock order, AND the RECOMMENDED level (A-8.2).
//             One number, so the ladder and the recommendation can never disagree
//   power   — the villain's STAT BUDGET, not a number it is compared against. winChance
//             splits it across HP/Courage/Protection/Speed via BATTLE_ODDS.villainShare and
//             fights the duel properly, so `power` sets how much villain there is, and the
//             share decides what kind. Tuned so a Common buddy AT the recommended level is
//             favoured but not safe (~60-70%), a buddy a few levels under is a long shot
//             (~25%), and the two bosses expect a Rare buddy, not a Common one that merely
//             reached the level (~36% at-level on a Common).
//             Re-check these if STAT_GROWTH or BATTLE_ODDS changes — a stat rebalance
//             silently rebalances every fight in the game.
const VILLAINS = [
  { id: 'v-temp', lv: 1, name: 'Temp', role: 'minion', set: 'mvp', enabled: true,
    species: 'cat', color: '#c06fa0', power: 145, defeated: true,
    risk: 'Temptation — the phone that begs to be checked',
    desc: 'Offers you one peek. One peek is all a road needs.',
    personality: 'Sweet, patient, never pushy. It does not grab — it invites.',
    story: 'Temp was born the first time someone said "just one look" and stepped off the kerb. It has been offering ever since, and it never has to ask twice.',
    look: 'A soft glowing lure shaped like a chat bubble, warm candy colours — the only villain that looks friendly.',
    ability: { name: 'Just One Peek', effect: 'Pulls your eyes down for a second — and a second is all a car needs.' ,
      // A-8.3 — pulls your eyes down — you lose the first move
      mods: { hero: { speed: -0.10 } } } },

  { id: 'v-haze', lv: 2, name: 'Haze', role: 'minion', set: 'mvp', enabled: true,
    species: 'fox', color: '#8a94a6', power: 160, defeated: true,
    risk: 'Carelessness — attention that quietly drains away',
    desc: 'Softens the world until a crossing looks like a pavement.',
    personality: 'Dozy and slow. Means no harm; simply is not paying attention — which is the harm.',
    story: 'Haze does not attack. It settles, the way fog settles, until the difference between the road and the path stops mattering to you.',
    look: 'A drifting fog-shape with half-lidded eyes, muted grey-blue, edges never quite in focus.',
    ability: { name: 'Blur', effect: 'Fades the edges of the street so you miss the one that matters.' ,
      // A-8.3 — you swing at the wrong thing
      mods: { hero: { courage: -0.12 } } } },

  { id: 'v-rush', lv: 3, name: 'Rush', role: 'minion', set: 'mvp', enabled: true,
    species: 'bird', color: '#d1603a', power: 175, defeated: true,
    risk: 'Impulse — moving before looking',
    desc: 'Runs first. Looks never.',
    personality: 'Loud, breathless, permanently late. Cannot stand still at a red light.',
    story: 'Rush is the voice that says the gap is big enough. It is right almost every time, and that is exactly what makes it dangerous.',
    look: 'A streaking orange blur with motion-smeared limbs, feet already three steps ahead of its body.',
    ability: { name: 'Go Now', effect: 'Shoves you off the kerb before the light has changed.' ,
      // A-8.3 — it shoves before the light changes — it always opens
      mods: { firstStrike: true } } },

  { id: 'v-noct', lv: 4, name: 'Noct', role: 'minion', set: 'mvp', enabled: true,
    species: 'owl', color: '#3c4a72', power: 190, defeated: false,
    risk: 'Darkness — being unseen by the people driving',
    desc: 'Puts out the lights and waits at the crossing.',
    personality: 'Silent and patient. Never chases. It simply arrives at dusk and stays.',
    story: 'Noct does not hide you from the road — it hides you from the driver. By the time the headlights find you, the braking distance is already gone.',
    look: 'A tall shadow with two cold lamp-yellow eyes, deep indigo, swallowing the light around it.',
    ability: { name: 'Lights Out', effect: 'Drains the streetlights so a driver sees you a heartbeat too late.' ,
      // A-8.3 — a driver who cannot see you is not slowed by your guard
      mods: { pierce: 0.22 } } },

  { id: 'v-glitch', lv: 5, name: 'Glitch', role: 'minion', set: 'mvp', enabled: true,
    species: 'croc', color: '#7b5cd6', power: 205, defeated: false,
    risk: 'Confusion — danger that will not follow the rules',
    desc: 'Makes a green light lie to you.',
    personality: 'Twitchy and unreadable. Even the other villains do not know what it will do next.',
    story: 'Glitch is the car that comes from the side you already checked. It exists to teach one lesson: safe is something you confirm, not something you assume.',
    look: 'A stuttering, half-corrupted silhouette in acid violet that never renders the same way twice.',
    ability: { name: 'Wrong Signal', effect: 'Scrambles what is safe and what is not, so the rules stop holding.' ,
      // A-8.3 — the rules stop holding, so your guard stops working
      mods: { hero: { protection: -0.18 } } } },

  { id: 'v-maze', lv: 6, name: 'Maze', role: 'minion', set: 'mvp', enabled: true,
    species: 'cat', color: '#4e7a78', power: 220, defeated: false,
    risk: 'Complexity — losing your way and ending up where you should not be',
    desc: 'Folds a street you know into one you do not.',
    personality: 'Playful, in the cruellest way. Thinks being lost is a game.',
    story: 'Maze never puts a child in front of a car. It just makes sure they end up on the road nobody walks — and lets that road do the rest.',
    look: 'A shifting labyrinth-body of teal walls that rearrange whenever you look away.',
    ability: { name: 'Endless Detour', effect: 'Rebuilds the way home until you are somewhere you have never walked.' ,
      // A-8.3 — the way home keeps growing — it simply outlasts you
      mods: { self: { hp: 0.25 } } } },

  { id: 'v-vex', lv: 7, name: 'Vex', role: 'minion', set: 'mvp', enabled: true,
    species: 'fox', color: '#8f9a45', power: 235, defeated: false,
    risk: 'Anxiety — pressure that crowds out the road',
    desc: 'Whispers that you are late, until nothing else fits in your head.',
    personality: 'Nagging and relentless. Never shouts; never stops.',
    story: 'Vex does not want to hurt you. It wants you worried — about the bell, the message, the answer you owe someone. A worried child crosses without looking.',
    look: 'A knot of jittering yellow-green threads, tightening around whoever it follows.',
    ability: { name: 'Hurry Up', effect: 'Fills your head with what you are late for, so the crossing gets none of it.' ,
      // A-8.3 — a head full of being late aims badly and moves late
      mods: { hero: { courage: -0.10, speed: -0.10 } } } },

  { id: 'v-grim', lv: 8, name: 'Grim', role: 'minion', set: 'mvp', enabled: true,
    species: 'bird', color: '#4a3f5c', power: 250, defeated: false,
    risk: 'Fear — freezing at the exact moment you must move',
    desc: 'Roots you to the spot, in the worst spot to be rooted.',
    personality: 'Looms. Says nothing. Does not need to.',
    story: 'Grim is the horn, the size of the truck, the size of the road. It stops a child halfway across — the one place on a street where standing still is the most dangerous thing you can do.',
    look: 'A vast hooded shape whose face is never shown, deep violet-black, always a little too close.',
    ability: { name: 'Freeze', effect: 'Locks you mid-crossing, where standing still is the worst move there is.' ,
      // A-8.3 — locked mid-crossing: slowest possible, and it moves first
      mods: { hero: { speed: -0.30 }, firstStrike: true } } },

  { id: 'v-vilord', lv: 9, name: 'Vilord', role: 'midBoss', set: 'mvp', enabled: true,
    species: 'owl', color: '#8e2f45', power: 300, defeated: false,
    risk: 'The hand behind the others — every distraction, arriving together',
    desc: 'Does not chase you. Sends the other eight.',
    personality: 'Cold, courteous, entirely in command. Treats your safe walk as a personal insult.',
    story: 'Vilord commands the eight. It has watched you beat them one by one, and it does not intend to fight you the same way — it will send them all at once.',
    look: 'A crowned regent in crimson and iron, the other villains rendered as banners at its back.',
    ability: { name: 'Command the Eight', effect: 'Borrows a trick from every villain you have already beaten.' ,
      // A-8.3 — borrows a trick from every villain you have beaten — it scales with your own progress
      mods: { adaptive: 0.04 } } },

  { id: 'v-nox', lv: 10, name: 'Nox', role: 'finalBoss', set: 'mvp', enabled: true,
    species: 'croc', color: '#23283c', power: 320, defeated: false,
    risk: 'The source — the dark that every other danger comes out of',
    desc: 'The dark the others are made of. Beat it and the street is yours.',
    personality: 'Ancient and impersonal. Not cruel — cruelty would require it to notice you.',
    story: 'Nox is not a villain who arrived; it is the dark that was always there, and every other villain is a piece of it. Put it out and the city can look up again.',
    look: 'A starless void in the shape of something enormous, edged in the faintest cold blue.',
    ability: { name: 'Total Dark', effect: 'Snuffs every light, every sound and every warning at once.' ,
      // A-8.3 — everything at once
      mods: { hero: { courage: -0.10, protection: -0.10, speed: -0.10 }, pierce: 0.15 } } },
];

// A-8.1: how many times each villain has been cleared. The first clear is the
// one that unlocks the ladder; every clear after it pays the repeat reward.
VILLAINS.forEach(v => { v.clears = v.defeated ? 1 : 0; });

// A villain's role decides how it is staged — nothing counts rows to find the boss.
const VILLAIN_ROLES = [
  { key: 'minion',    label: 'Villain',    icon: 'skull' },
  { key: 'midBoss',   label: 'Mid-boss',   icon: 'crown' },
  { key: 'finalBoss', label: 'Final boss', icon: 'flame' },
];
const roleOf = (v) => VILLAIN_ROLES.find(r => r.key === v.role) || VILLAIN_ROLES[0];
const isBoss = (v) => v.role === 'midBoss' || v.role === 'finalBoss';

// The ladder as it actually ships. A villain that ops has not enabled is invisible
// everywhere — battle, dex, completion totals — rather than showing up as a locked
// stop that can never open, or padding the "3/10 defeated" denominator with a
// season that has not started.
const activeVillains = () => VILLAINS.filter(v => v.enabled !== false).sort((a, b) => a.lv - b.lv);
const villainByLv = (lv) => activeVillains().find(v => v.lv === lv) || null;

// A-8 — sequential unlock: a villain opens only once the one before it is beaten.
const villainUnlocked = (v) => {
  const ladder = activeVillains();
  const i = ladder.indexOf(v);
  return i <= 0 || !!ladder[i - 1].defeated;
};
// The current challenger — the first villain still standing. null once the ladder is cleared.
const nextVillain = () => activeVillains().find(v => !v.defeated) || null;
const villainsDefeated = () => activeVillains().filter(v => v.defeated).length;

// The final boss is whoever holds the role, not whoever sits last — so a seasonal
// villain appended after Nox does not steal the ending.
const finalVillain = () => activeVillains().find(v => v.role === 'finalBoss') || activeVillains().at(-1) || null;
// A-8 — beating the final boss pays the special reward and opens the ending content.
const endingUnlocked = () => !!finalVillain()?.defeated;

// ── A-8.1 · Story progression ────────────────────────────────────────
// "The first victory unlocks story progression" — a line that was in the comments and in
// nothing else. Every villain carries an authored `story`, and until now no screen rendered
// a word of it: the ten villains were telling a story nobody could read.
//
// A chapter is EARNED, not merely reached. It opens on the first WIN, not on arriving at the
// villain — so the dex reveals who is in front of you (name, risk, what it does) as soon as
// it is your turn to fight it, but the story of it is the prize for beating it. Keyed off
// `clears`, so re-challenging cannot "re-unlock" a chapter and the ending can only be told once.
const storyUnlocked = (v) => (v?.clears || 0) > 0;
const storyChapters = () => activeVillains().map((v, i) => ({
  n: i + 1,
  villain: v,
  unlocked: storyUnlocked(v),
  text: v.story,
}));
const storyProgress = () => {
  const all = storyChapters();
  return { read: all.filter(c => c.unlocked).length, total: all.length };
};

// ── Battle rules & records (A-8 / A-8.1) ─────────────────────────────
// A-8.1 — the record each villain keeps. Re-challenging exists to verify a buddy has
// grown and to IMPROVE this record, so there has to be something to improve: a clear
// count alone has no better or worse.
// The headline is `bestPower` — the strongest buddy you have won with — NOT a win
// margin. Under A-8.2 the outcome is a roll, so "won by 40" is a fact about the dice,
// not about the buddy; the power you brought is the thing that actually grew.
VILLAINS.forEach(v => {
  v.record = { wins: v.defeated ? 1 : 0, losses: 0, bestPower: null };
});

// The one gate on starting a fight. Every entry point goes through it, so the
// sequential-unlock rule cannot be bypassed by a deep link, the dex, or a new layout —
// villainUnlocked() existed before this and was never actually called anywhere.
const canChallenge = (v, player = PLAYER) => {
  if (!v) return { ok: false, reason: 'no-villain' };
  // F-19 / F-02 — the whole product exists to stop a child staring at a phone while walking.
  // A battle is the most absorbing screen in the app, so it is the LAST thing that may open
  // mid-stride. Every battle surface already said "battles pause while you're walking" in
  // copy; this is the rule that makes the sentence true. It sits first among the gates
  // because it outranks them: it does not matter which villain is unlocked or how many
  // challenges are left if the child is currently crossing a road.
  if (player.walking) return { ok: false, reason: 'walking' };
  if (v.enabled === false) return { ok: false, reason: 'disabled' };
  if (!villainUnlocked(v)) return { ok: false, reason: 'locked' };
  if ((player.battlesToday || 0) >= battlesPerDay()) return { ok: false, reason: 'no-challenges-left' };
  return { ok: true };
};

// Which reward tier this outcome pays. The FIRST clear is keyed off `clears === 0`, not
// off `defeated` — they are two fields that can drift, and paying the first-clear bonus
// twice is exactly the bug this spec calls out. clears is the count; it cannot lie.
const rewardTier = (v, won) => {
  if (!won) return 'loss';
  if ((v.clears || 0) > 0) return 'repeat';              // already beaten → repeatable reward
  // A-8.4 — both bosses pay their own first-clear tier. Asked by ROLE, so Vilord being the
  // 9th villain is irrelevant: a seasonal villain inserted before it cannot steal the payout.
  if (v.role === 'finalBoss') return 'finalClear';
  if (v.role === 'midBoss')   return 'bossClear';
  return 'firstClear';
};

// Fight it. One function owns the whole outcome — the win check, the reward tier, the
// unlock, the record and the daily cap — so no screen can pay a first clear twice or
// beat a villain it never unlocked.
const resolveBattle = (villain, c, player = PLAYER, rng = Math.random) => {
  const gate = canChallenge(villain, player);
  if (!gate.ok) return gate;

  const power = battlePower(c);
  const odds = winPercent(c, villain);
  // A-8.2 — the outcome is the ROLL, against the very odds the child was shown.
  const won = rollBattle(c, villain, rng);
  const tier = rewardTier(villain, won);                 // read BEFORE anything mutates
  const reward = BATTLE_REWARDS[tier];
  // A boss clear IS a first clear — it just pays more. Missing it here would have let Vilord
  // and Nox be re-cleared for their special reward over and over.
  const firstClear = tier === 'firstClear' || tier === 'bossClear' || tier === 'finalClear';

  const rec = villain.record;
  // a personal best only counts on a win, and only on POWER — a luckier roll with the
  // same buddy is not growth, and the record is meant to prove growth
  const improved = won && (rec.bestPower == null || power > rec.bestPower);
  let growth = { levels: 0, stageUp: null };
  let eggWon = null;                                     // A-8.4 — the egg this win actually paid
  if (won) {
    rec.wins += 1;
    // once unlocked, a villain stays unlocked — a lost rematch never re-locks it (A-8.1)
    villain.defeated = true;
    villain.clears = (villain.clears || 0) + 1;
    if (improved) rec.bestPower = power;
    player.points += reward.points;
    // A-3.3 — the battle XP can carry the buddy over a stage threshold. gainXp reports it,
    // and the report is handed back so the screen can play the transformation right here,
    // instead of the child discovering it later on the character page.
    growth = gainXp(c, reward.xp, player);
    // A-8.4 — a first clear always hands over its egg. A REPEAT only drops one if ops have
    // turned an event drop on, and then only on the roll — so a rematch cannot be farmed for
    // guaranteed eggs. `eggChance` is undefined on the first-clear tiers, which reads as 1.
    if (reward.egg && (reward.eggChance == null || rng() < reward.eggChance)) {
      player.eggs[reward.egg] = (player.eggs[reward.egg] || 0) + 1;
      eggWon = reward.egg;
    }
  } else {
    rec.losses += 1;
    player.points += reward.points;                      // consolation for trying
  }

  player.battlesToday = Math.min(battlesPerDay(), (player.battlesToday || 0) + 1);
  return { ok: true, won, power, odds, tier, reward, firstClear, improved, eggWon,
           levels: growth.levels, stageUp: growth.stageUp,
           // A-8.1 — the three things a FIRST win buys that a repeat does not: the bonus (in
           // `reward`), the next villain (`unlocked`), and the story chapter (`storyChapter`).
           // A repeat win returns null for both, which is what makes the distinction visible
           // on the result screen instead of only in the points arithmetic.
           storyChapter: firstClear ? activeVillains().indexOf(villain) + 1 : null,
           unlocked: firstClear ? nextVillain() : null,
           ending: firstClear && villain.role === 'finalBoss' };
};

// A-8.1 — "improving or RESETTING battle records". Wipes the record only; it never
// re-locks the villain or refunds the first clear, so resetting is a clean slate to
// beat, not a way to farm the first-clear reward again.
const resetVillainRecord = (v) => {
  v.record = { wins: 0, losses: 0, bestPower: null };
  return v.record;
};

// ── A-8.2 · Recommended level & win probability ──────────────────────
// A villain's `lv` IS its recommended level (Temp Lv.1 … Nox Lv.10) — one number, not two
// that can disagree. It is a RECOMMENDATION, never a gate: the only thing that locks a
// villain is the one before it still standing (villainUnlocked). A child who wants to throw
// a Lv.3 buddy at Noct may, and the spec is explicit about why that is allowed — the odds
// are decided by the character's stats, not by a rule that refuses the fight.
const recommendedLevel = (v) => v.lv;
const underLevelled = (c, v) => (c?.level || 1) < recommendedLevel(v);

// The odds curve. Server-tunable like every other balance number.
//   spread     — how much a power gap matters. It has to be read against the stat curve, not
//                picked for feel: a Common buddy gains ~14 battle power per level, so a spread
//                of 60 would make one level worth ~6% and the recommended level would mean
//                nothing. At 25, a level is worth real odds and being three levels under is
//                genuinely a long shot — which is what makes the recommendation informative.
//   floor/ceil — no fight is hopeless and none is a formality. The floor is what makes "you
//                can still try" honest rather than cruel; the ceiling is what keeps the
//                outcome a probability, which is what the spec asks for.
//   safeWalkBonus — the flat bonus a safe walk buys you, shown in the battle math.
// NOTE `spread` changed meaning with A-8.3. It used to divide a raw power GAP (hence 25).
// It now divides the LOG-RATIO of how long each side lasts, which is a number around ±2 —
// so the old 25 would have flattened every fight to a 50/50 coin toss. Retuned, not kept.
const BATTLE_ODDS_DEFAULTS = { spread: 0.75, floor: 0.05, ceiling: 0.95, safeWalkBonus: 30 };
const BATTLE_ODDS = { ...BATTLE_ODDS_DEFAULTS };

const setBattleOdds = (settings = {}) => {
  const num = (v, fallback, min, max) =>
    (typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max ? v : fallback);
  // A-8.3 — every factor's weighting is server-tunable. A stat's weight may go to 0 (ops
  // may want to switch a factor off) but never negative: a negative weight would invert the
  // stat, so buying Protection would make a buddy easier to kill. Refused, not clamped.
  const weights = (field, table) => {
    const row = settings[field];
    if (!row || typeof row !== 'object') return;
    for (const k of Object.keys(table)) {
      const val = row[k];
      if (typeof val === 'number' && Number.isFinite(val) && val >= 0) table[k] = val;
    }
  };
  weights('attack', BATTLE_ODDS.attack);
  weights('defense', BATTLE_ODDS.defense);
  weights('endurance', BATTLE_ODDS.endurance);
  weights('rarityMod', BATTLE_ODDS.rarityMod);
  weights('villainShare', BATTLE_ODDS.villainShare);
  Object.assign(BATTLE_ODDS, {
    firstStrike:   num(settings.firstStrike, BATTLE_ODDS.firstStrike, 0, 1),
    levelWeight:   num(settings.levelWeight, BATTLE_ODDS.levelWeight, 0, 1),
    minDamage:     num(settings.minDamage,   BATTLE_ODDS.minDamage, 0.01, 1000),
    spread:        num(settings.spread, BATTLE_ODDS_DEFAULTS.spread, 0.05, 100),
    // a floor above 0.3 would make every fight at least a coin flip no matter how weak the
    // buddy, and a ceiling below 0.6 would punish a maxed one — both break the link between
    // stats and odds that this whole feature rests on, so they are refused outright
    floor:         num(settings.floor, BATTLE_ODDS_DEFAULTS.floor, 0, 0.3),
    ceiling:       num(settings.ceiling, BATTLE_ODDS_DEFAULTS.ceiling, 0.6, 1),
    safeWalkBonus: num(settings.safeWalkBonus, BATTLE_ODDS_DEFAULTS.safeWalkBonus, 0, 1000),
  });
  if (BATTLE_ODDS.floor > BATTLE_ODDS.ceiling) {   // a payload that inverts them would make every fight unwinnable
    BATTLE_ODDS.floor = BATTLE_ODDS_DEFAULTS.floor;
    BATTLE_ODDS.ceiling = BATTLE_ODDS_DEFAULTS.ceiling;
  }
  return BATTLE_ODDS;
};

// What the child is actually told before they commit a challenge: their chance of winning,
// as a probability derived from the four core stats (via battlePower) against the villain's.
// A logistic curve, so the odds bend smoothly instead of flipping at a threshold — being 10
// power short should cost a little, not everything.
// ── A-8.3 · The four stats each do a different job ───────────────────
// The odds used to be one collapsed number (battlePower) against the villain's power.
// That made HP, Courage, Protection and Speed interchangeable — 10 points of HP bought
// exactly what 10 points of Courage did — and the spec asks for the opposite: each stat
// has a distinct role, and the villain's ABILITY is part of the calculation.
//
// So the odds now come from an actual duel, solved analytically (no simulation, so the
// number is stable — the child is shown the same chance twice):
//   Courage    → offence: the damage you deal each round
//   Protection → damage reduction: what you subtract from the villain's hit
//   HP         → endurance: how many rounds you survive
//   Speed      → initiative: who lands the first blow, worth a fraction of a round
//   Level      → base growth, already through statsFor(), plus its own dial (levelWeight)
//   Rarity     → a small modifier, already in STAT_GROWTH.base (see rarityMod below)
// Whoever needs fewer rounds to fell the other is favoured; the ratio becomes a
// probability, so a stronger buddy is likelier to win but never certain (A-8.2).

// The villain's own four stats, derived from its single authored `power` so that adding a
// villain stays a one-line job. The split is its fighting profile: villains are damage
// sponges (high HP) that hit hard but guard poorly — which is what makes Protection and
// endurance worth buying on the child's side.
// Tuned against the real ladder, not picked for feel: at these shares a buddy fighting at
// its RECOMMENDED level sits around a 55–60% chance — a fair fight it can lose — and the
// two bosses sit lower, which is what makes them bosses. A villain HP share of 1.5 (the
// first guess) made every recommended-level fight a 25% long shot.
const VILLAIN_SHARE_DEFAULTS = { hp: 0.9, courage: 0.30, protection: 0.28, speed: 0.30 };

const BATTLE_ODDS_DEFAULTS_V2 = {
  // how a stat converts into the duel's two quantities
  attack:      { courage: 1.0, speed: 0.15 },   // Courage drives offence; Speed adds a little
  defense:     { protection: 0.5 },             // how much Protection subtracts from a hit
  endurance:   { hp: 1.0 },                     // HP is rounds survived
  firstStrike: 0.25,                            // how far a Speed edge shifts effective rounds
  levelWeight: 0.01,                            // Level's own dial, ON TOP of the stat curve
  // Rarity's real effect already lives in STAT_GROWTH.base (an Epic starts higher and grows
  // faster). These default to 1.0 on purpose: a second multiplier here would double-count
  // the tier. The dial exists so ops can add a tier edge WITHOUT touching the stat curve.
  rarityMod:   { common: 1.0, rare: 1.0, epic: 1.0 },
  minDamage:   1,                               // no fight can stall at zero damage
  villainShare: { ...VILLAIN_SHARE_DEFAULTS },
};
Object.assign(BATTLE_ODDS_DEFAULTS, BATTLE_ODDS_DEFAULTS_V2);
Object.assign(BATTLE_ODDS, BATTLE_ODDS_DEFAULTS_V2);

// The villain's stats, after its ability has buffed itself (`self`) and after Vilord's
// `adaptive` trick, which really does grow with every villain you have already beaten.
const villainStats = (v) => {
  const share = BATTLE_ODDS.villainShare;
  const mods = v?.ability?.mods || {};
  const self = mods.self || {};
  const adapt = mods.adaptive ? 1 + mods.adaptive * villainsDefeated() : 1;
  return Object.fromEntries(STATS.map(s =>
    [s.key, Math.max(1, v.power * (share[s.key] || 0) * (1 + (self[s.key] || 0)) * adapt)]));
};

// The buddy's stats as they enter THIS fight: its own growth, debuffed by whatever the
// villain's ability does to it (`hero`), lifted by level, rarity and the safe-walk bonus.
// The safe-walk bonus is expressed as the fraction of the buddy's power it represents, so
// the "+30 power" the battle screen shows stays literally true under the new maths.
const battleStats = (c, v) => {
  const base = statsFor(c);
  const hero = v?.ability?.mods?.hero || {};
  const lvl = 1 + BATTLE_ODDS.levelWeight * ((c?.level || 1) - 1);
  const rar = BATTLE_ODDS.rarityMod[c?.rarity] ?? 1;
  const walk = 1 + BATTLE_ODDS.safeWalkBonus / Math.max(1, battlePower(c));
  return Object.fromEntries(STATS.map(s =>
    [s.key, Math.max(1, base[s.key] * (1 + (hero[s.key] || 0)) * lvl * rar * walk)]));
};

const winChance = (c, v) => {
  if (!c || !v) return 0;
  const W = BATTLE_ODDS;
  const me = battleStats(c, v);
  const foe = villainStats(v);
  const mods = v.ability?.mods || {};

  const atk = (s) => s.courage * W.attack.courage + s.speed * W.attack.speed;
  // `pierce` — an ability that ignores part of your Protection (Noct blinds the driver:
  // your guard is irrelevant if they never see you)
  const myDef  = me.protection  * W.defense.protection * (1 - (mods.pierce || 0));
  const foeDef = foe.protection * W.defense.protection;

  const dmgToFoe = Math.max(W.minDamage, atk(me)  - foeDef);   // Courage vs their Protection
  const dmgToMe  = Math.max(W.minDamage, atk(foe) - myDef);    // their Courage vs my Protection

  // HP → endurance. The weight is an EXPONENT, not a multiplier: a multiplier scales both
  // sides' round counts and cancels clean out of the ratio below, so `endurance.hp` would
  // have been a dial connected to nothing. As an exponent it sets how much the HP *ratio*
  // matters — 1 = linear, >1 = a tanky buddy is worth more, 0 = HP stops counting at all.
  const roundsFoeLasts = Math.pow(foe.hp, W.endurance.hp) / dmgToFoe;
  const roundsILast    = Math.pow(me.hp,  W.endurance.hp) / dmgToMe;

  // Speed → initiative. A faster buddy lands the first blow, worth a fraction of a round to
  // each side. `firstStrike` on an ability means the VILLAIN always opens, so the buddy can
  // never claim the advantage — only suffer it (Rush shoves you off the kerb; Grim freezes you).
  const edge = (me.speed - foe.speed) / (me.speed + foe.speed);
  const init = mods.firstStrike ? Math.min(edge, 0) : edge;
  const mine   = roundsILast    * (1 + W.firstStrike * init);
  const theirs = roundsFoeLasts * (1 - W.firstStrike * init);

  // outlast them → favoured. The log-ratio keeps it symmetric: twice as durable is exactly
  // as good as they are half as durable.
  const p = 1 / (1 + Math.exp(-Math.log(mine / theirs) / W.spread));
  return Math.min(W.ceiling, Math.max(W.floor, p));
};
const winPercent = (c, v) => Math.round(winChance(c, v) * 100);

// The roll. Kept here beside the odds so the screen cannot fight a different battle from the
// one it previewed — the number shown IS the number rolled against.
const rollBattle = (c, v, rng = Math.random) => rng() < winChance(c, v);

// A-8 — the server seam for the villain mapping: which villain sits at which recommended
// level, how hard it hits, and whether it ships at all. Matched by id, so a payload can
// retune one villain without restating the ladder, and an unknown id is ignored rather than
// appending a villain with no art, story or role.
const setVillains = (rows = []) => {
  if (!Array.isArray(rows)) return VILLAINS;
  rows.forEach(r => {
    const v = VILLAINS.find(x => x.id === r.id);
    if (!v) return;
    if (typeof r.lv === 'number' && Number.isFinite(r.lv) && r.lv >= 1) v.lv = Math.round(r.lv);
    if (typeof r.power === 'number' && Number.isFinite(r.power) && r.power > 0) v.power = Math.round(r.power);
    if (typeof r.enabled === 'boolean') v.enabled = r.enabled;
    if (VILLAIN_ROLES.some(role => role.key === r.role)) v.role = r.role;
  });
  return activeVillains();
};

// ── Reactions (A-10) — how a visit says something ────────────────────
// A visit leaves a REACTION, not just a like. A registry, so a seasonal or event reaction
// is one more row and no screen counts them or assumes there are five.
//
// Every reaction is positive, and that is a safety decision rather than a style one. This
// is a children's social surface with no chat and no free text — a guestbook note is a
// pre-written stamp (see GUEST_STAMPS) precisely so nothing unkind can be sent. A
// thumbs-down, an angry face or a laughing-at face would hand that back: it is a bullying
// vector, not a feature. The set expresses DEGREES OF ENCOURAGEMENT, nothing else.
const REACTIONS = [
  { key: 'like', emoji: '💛', label: 'Nice',      color: '#e8a33d' },
  { key: 'love', emoji: '😍', label: 'Love it',   color: '#e0559a' },
  { key: 'wow',  emoji: '🤩', label: 'Amazing',   color: '#7c5cbf' },
  { key: 'fire', emoji: '🔥', label: 'So cool',   color: '#e0554a' },
  { key: 'clap', emoji: '👏', label: 'Well done', color: '#4b9a6b' },
];

const reactionOf = (key) => REACTIONS.find(r => r.key === key) || null;

// The headline number every screen shows. Derived, never stored twice — a `likes` field
// kept alongside the breakdown would drift the first time a reaction was switched.
const reactionTotal = (who) =>
  REACTIONS.reduce((n, r) => n + ((who?.reactions || {})[r.key] || 0), 0);

// Leave, change, or take back a reaction. ONE per visitor: switching moves the count from
// the old reaction to the new one, so a child cannot stack five reactions on one friend and
// inflate them. Tapping the same reaction again takes it back.
const react = (who, key) => {
  if (!who) return null;
  if (!who.reactions) who.reactions = {};
  const prev = who.myReaction || null;
  const next = prev === key ? null : key;
  if (prev) who.reactions[prev] = Math.max(0, (who.reactions[prev] || 0) - 1);
  if (next) who.reactions[next] = (who.reactions[next] || 0) + 1;
  who.myReaction = next;
  who.likes = reactionTotal(who);        // kept in step for the screens that show a total
  return next;
};

// ── Friends (F-32 / A-10) — visit-only: featured buddy, rooms, reactions,
//    one-line guestbook. No chat, no real-time interaction. ──────────
const FRIENDS = [
  { id: 'f1', name: 'Jisoo', avatar: 'cat',  color: '#e278a8', online: true,  streak: 9,  chars: 11, likes: 24, reactions: { like: 9, love: 7, wow: 4, fire: 3, clap: 1 }, myReaction: null,
    featured: { species: 'cat',  name: 'Cloud',  color: '#e278a8', stage: 3, rarity: 'epic' },
    // friends' rooms are the SAME themes, just decorated differently — a visit should
    // feel like the same world, not a parallel one (A-10 · F-19)
    rooms: [{ name: 'Green Room', theme: 'green', wallpaper: '#eef5dd' }, { name: 'Dream Room', theme: 'dream', wallpaper: '#f7e9f5' }],
    guest: [{ by: 'Tom', emoji: '😍', text: 'Your room is awesome!' }, { by: 'Aria', emoji: '🔥', text: 'Nice streak!' }] },
  { id: 'f2', name: 'Tom',   avatar: 'bird', color: '#67c7ce', online: false, streak: 4,  chars: 7,  likes: 12, reactions: { like: 5, love: 2, wow: 1, fire: 3, clap: 1 }, myReaction: 'fire',
    featured: { species: 'bird', name: 'Sky',    color: '#67c7ce', stage: 2, rarity: 'rare' },
    rooms: [{ name: 'Town Room', theme: 'town', wallpaper: '#e7eef2' }],
    guest: [{ by: 'Mina', emoji: '⭐', text: 'Cool collection!' }] },
  { id: 'f3', name: 'Aria',  avatar: 'owl',  color: '#b9a3ef', online: true,  streak: 15, chars: 14, likes: 31, reactions: { like: 11, love: 8, wow: 6, fire: 4, clap: 2 }, myReaction: null,
    featured: { species: 'owl',  name: 'Nova',   color: '#b9a3ef', stage: 3, rarity: 'rare' },
    rooms: [{ name: 'Dream Room', theme: 'dream', wallpaper: '#e8e6fa' }, { name: 'Town Room', theme: 'town', wallpaper: '#f4efe6' }],
    guest: [{ by: 'Jisoo', emoji: '🔥', text: 'Nice streak!' }, { by: 'Tom', emoji: '👋', text: 'I stopped by!' }] },
];

// A-10.1: guestbook notes are picked from this fixed set, never typed. A free text box
// between two children is an unmoderated message channel — the one thing the product
// promises parents it does not have — so the whole surface is a tap: pick a stamp, it's
// sent. Nothing to moderate, nothing to misspell, and a 7-year-old can leave a note
// without a keyboard.
const GUEST_STAMPS = [
  { emoji: '👋', text: 'I stopped by!' },
  { emoji: '😍', text: 'Your room is awesome!' },
  { emoji: '🔥', text: 'Nice streak!' },
  { emoji: '⭐', text: 'Cool collection!' },
  { emoji: '💪', text: 'Strong buddy!' },
  { emoji: '🎉', text: 'Congrats on the new buddy!' },
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

// Seed which rooms are open from the rules in force (A-6). The shipped app calls
// setRoomUnlocks() again once server settings land, which re-runs this. It sits at the
// very bottom because the progress snapshot it reads reaches across the whole file —
// run it any earlier and it trips over a table that has not been declared yet.
applyRoomUnlocks();

export { ACHIEVEMENTS, AUTH, REACTIONS, react, reactionOf, reactionTotal, battleStats, villainStats, canChallenge, resolveBattle, resetVillainRecord, rewardTier, KNOWN_PHONES, authMethods, devicePlatform, battlesPerDay, BATTLE_RULES, BATTLE_RULES_DEFAULTS, setBattleRules, BATTLE_REWARDS, APP_CATEGORIES, CHARACTERS, CHARACTER_UNLOCKS, CHILDREN, ITEMS, ITEM_CATEGORIES, ITEM_GRANTS, CHILD_REPORTS, DECOR, EGGS, EGG_GRANTS, EXCHANGE, EXCHANGE_DEFAULTS, setExchange, FAMILY, FAMILY_ROLES, FAMILY_INVITE, FAMILY_LOG, guardians, guardianOwner, guardianMe, guardianCan, guardianNames, addGuardian, removeGuardian, logFamilyChange,
  FEATURES, FRIENDS, FRIEND_REQUESTS, FRIEND_SUGGESTIONS, GUEST_STAMPS, HOUSE_BGS, INTERVENTION, LINK, PARENT_SEES, linkedChild, parentSharesSeen, parentSharesHidden, MISSIONS, MY_GUESTBOOK, PARENT_ALERTS, PARENT_METRICS, OUTFITS, PERMISSIONS, PLAYER, POINTS, RARITIES, REACTIONS_7D, RISK_EVENT_LOG, RISK_TREND, ROOMS, ROOM_THEMES, themeById, themeOf, decorForRoom,
  ROOM_UNLOCKS, ROOM_UNLOCK_DEFAULTS, activeRoomUnlocks, roomRule, roomOpen, roomProgress, applyRoomUnlocks, setRoomUnlocks, SAFE_PT_PER_MIN, SOURCES, SPECIES_INFO, STAGES, STATS, STAT_GROWTH, TODAY_TASKS, VILLAINS, VILLAIN_ROLES, activeVillains, villainByLv, villainUnlocked, nextVillain, villainsDefeated, finalVillain, endingUnlocked, storyUnlocked, storyChapters, storyProgress, roleOf, isBoss, BATTLE_ODDS, BATTLE_ODDS_DEFAULTS, setBattleOdds, setVillains, recommendedLevel, underLevelled, winChance, winPercent, rollBattle, WEEKLY_TASKS, XP_CURVE, XP_CURVE_DEFAULTS, setXpCurve, applyXpCurve, activeEggs, activeItemGrants, activeUnlocks, awardCharacters, awardEggs, awardItems, buyItem, canBuyItem, charactersEarned, charactersOfRarity, claimRewards, eggById, eggCount, eggSources, eggsEarned, grantsForEgg, grantsForItem, hatchEgg, buyEgg, canBuyEgg, hatchFromInventory, itemById, itemSources, itemsEarned, itemsOfCategory, itemsOfSlot, limitedItems, interventionMessages, interventionTier, isMaxLevel, isRevealed, logRiskEvent, missionsCleared, battlePower, nextStageAt, statMax, stageBand, moodForStage, progress, rarityOf, setStages, setStatGrowth, sourceOf, stageForLevel, stageOf, finalStage, statsFor, rollRarity, totalEggs, unlockHints, unlockRoutes, visibleCharacters, xpForLevel,
  canConvertPoints, convertPointsToXp, gainXp, maxConvertibleXp, pointsForXp, xpFromPoints, xpToCap };
