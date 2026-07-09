// JoanX — mock data for the prototype (stand-ins for API responses).

// ── Feature flags ─────────────────────────────────────────────────────
// `dangerZones` gates the location / danger-zone family (F-05 danger-zone
// algorithm, F-06 GNSS) — EXCLUDED in the 2026.06.18 revision. Off = the
// in-scope build (Smart mode, motion only, no GPS). Flip to true to bring
// the danger-zone + GNSS surfaces back for reference.
const FEATURES = { dangerZones: false };

const PLAYER = {
  name: 'Mina', age: 11, points: 1240,
  streak: 5, level: 7, xp: 320, xpMax: 500,
  safeMinutesToday: 47, safeWalkGoal: 60,
  activeCharId: 'c2',
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

// F-13: "10 pt per minute of non-use while walking."
const SAFE_PT_PER_MIN = 10;

// owned + collectible characters
const CHARACTERS = [
  { id: 'c1', species: 'fox',  name: 'Hammy',  color: '#4b814f', stage: 2, rarity: 'rare',    level: 7, xp: 320, xpMax: 500, owned: true,  room: 'r1', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c2', species: 'cat',  name: 'Mochi',  color: '#e1874a', stage: 2, rarity: 'common',  level: 4, xp: 140, xpMax: 300, owned: true,  room: 'r1', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c3', species: 'bird', name: 'Pip',    color: '#447aaf', stage: 1, rarity: 'common',  level: 2, xp: 60,  xpMax: 200, owned: true,  room: 'r1', traits: { guard: 40, speed: 72, heart: 50 } },
  { id: 'c6', species: 'owl',  name: 'Sunny',  color: '#e0554a', stage: 2, rarity: 'rare',    level: 5, xp: 110, xpMax: 350, owned: true,  room: 'r2', traits: { guard: 60, speed: 85, heart: 64 } },
  // legacy (06-29 / 0da9b64) versions of Hammy & Mochi, kept as new characters — old colours, new names
  { id: 'c9',  species: 'fox', name: 'Toffee', color: '#d99c5a', stage: 2, rarity: 'rare',    level: 7, xp: 320, xpMax: 500, owned: true,  room: 'r2', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c10', species: 'cat', name: 'Bloo',   color: '#a8c3eb', stage: 2, rarity: 'common',  level: 4, xp: 140, xpMax: 300, owned: true,  room: 'r2', traits: { guard: 55, speed: 80, heart: 60 } },
  // ── hidden for now — keeping the app to 4 characters (Hammy / Mochi / Pip / Sunny).
  //    Restore these to bring back Ember, Pixel and the two locked slots.
  // { id: 'c4', species: 'croc', name: 'Ember',  color: '#9867e4', stage: 3, rarity: 'special', level: 12, xp: 80, xpMax: 800, owned: true,  room: 'r2', traits: { guard: 95, speed: 70, heart: 88 } },
  // { id: 'c5', species: 'cat',  name: 'Pixel',  color: '#6697c9', stage: 1, rarity: 'rare',    level: 3, xp: 150, xpMax: 200, owned: true,  room: null, traits: { guard: 48, speed: 66, heart: 58 } },
  // { id: 'c7', species: 'cat',  name: '???',    color: '#e278a8', stage: 1, rarity: 'special', level: 0, xp: 0,   xpMax: 200, owned: false, locked: 'Walk safely 7 days in a row', room: null, traits: {} },
  // { id: 'c8', species: 'fox',  name: '???',    color: '#67c7ce', stage: 1, rarity: 'rare',    level: 0, xp: 0,   xpMax: 200, owned: false, locked: 'Reach a 14-day streak', room: null, traits: {} },
];

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

// ── Friends (F-32 / A-10) — visit-only: featured buddy, rooms, likes,
//    one-line guestbook. No chat, no real-time interaction. ──────────
const FRIENDS = [
  { id: 'f1', name: 'Jisoo', avatar: 'cat',  color: '#e278a8', online: true,  streak: 9,  chars: 11, likes: 24, liked: false,
    featured: { species: 'cat',  name: 'Cloud',  color: '#e278a8', stage: 3, rarity: 'special' },
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

export { ACHIEVEMENTS, APP_CATEGORIES, CHARACTERS, CHILDREN, CHILD_REPORTS, DECOR, FEATURES, FRIENDS, FRIEND_REQUESTS, FRIEND_SUGGESTIONS, HOUSE_BGS, MY_GUESTBOOK, PARENT_ALERTS, PARENT_METRICS, PERMISSIONS, PLAYER, REACTIONS_7D, RISK_TREND, ROOMS, SAFE_PT_PER_MIN, SPECIES_INFO, TODAY_TASKS, VILLAINS };
