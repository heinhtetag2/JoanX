// JoanX — mock data for the prototype (stand-ins for API responses).

const PLAYER = {
  name: 'Mina', age: 11, points: 1240, coins: 38,
  streak: 5, level: 7, xp: 320, xpMax: 500,
  safeMinutesToday: 47, safeWalkGoal: 60,
  activeCharId: 'c4',
};

// owned + collectible characters
const CHARACTERS = [
  { id: 'c1', species: 'fox',  name: 'Foxy',   color: '#e1874a', stage: 2, rarity: 'rare',    level: 7, xp: 320, xpMax: 500, owned: true,  room: 'r1', traits: { guard: 78, speed: 62, heart: 90 } },
  { id: 'c2', species: 'cat',  name: 'Mochi',  color: '#a8c3eb', stage: 2, rarity: 'common',  level: 4, xp: 140, xpMax: 300, owned: true,  room: 'r1', traits: { guard: 55, speed: 80, heart: 60 } },
  { id: 'c3', species: 'bird', name: 'Pip',    color: '#e278a8', stage: 1, rarity: 'common',  level: 2, xp: 60,  xpMax: 200, owned: true,  room: 'r1', traits: { guard: 40, speed: 72, heart: 50 } },
  { id: 'c4', species: 'croc', name: 'Ember',  color: '#9867e4', stage: 3, rarity: 'special', level: 12, xp: 80, xpMax: 800, owned: true,  room: 'r2', traits: { guard: 95, speed: 70, heart: 88 } },
  { id: 'c5', species: 'cat',  name: 'Pixel',  color: '#6697c9', stage: 1, rarity: 'rare',    level: 3, xp: 150, xpMax: 200, owned: true,  room: null, traits: { guard: 48, speed: 66, heart: 58 } },
  { id: 'c6', species: 'owl',  name: 'Sunny',  color: '#ffbc05', stage: 2, rarity: 'rare',    level: 5, xp: 110, xpMax: 350, owned: true,  room: 'r2', traits: { guard: 60, speed: 85, heart: 64 } },
  { id: 'c7', species: 'cat',  name: '???',    color: '#e278a8', stage: 1, rarity: 'special', level: 0, xp: 0,   xpMax: 200, owned: false, locked: 'Walk safely 7 days in a row', room: null, traits: {} },
  { id: 'c8', species: 'fox',  name: '???',    color: '#67c7ce', stage: 1, rarity: 'rare',    level: 0, xp: 0,   xpMax: 200, owned: false, locked: 'Reach a 14-day streak', room: null, traits: {} },
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

const CHILDREN = [
  { id: 'k1', name: 'Mina', age: 11, mode: 'smart', device: 'iPhone 13', battery: 72, online: true,  lastSeen: 'now', avatar: 'fox',  color: '#e1874a' },
  { id: 'k2', name: 'Leo',  age: 8,  mode: 'lite',  device: 'Galaxy A14', battery: 45, online: false, lastSeen: '2h ago', avatar: 'bird', color: '#67c7ce' },
];

const APP_CATEGORIES = [
  { id: 'video',   name: 'Video',         icon: 'play', blocked: true },
  { id: 'games',   name: 'Games',         icon: 'gamepad-2', blocked: true },
  { id: 'social',  name: 'Social',        icon: 'message-circle', blocked: true },
  { id: 'browser', name: 'Web Browser',   icon: 'globe', blocked: false },
  { id: 'camera',  name: 'Camera',        icon: 'camera', blocked: false },
  { id: 'phone',   name: 'Phone & Texts', icon: 'phone', blocked: false, locked: true },
];

const PERMISSIONS = [
  { id: 'motion', icon: 'activity',   name: 'Motion & Fitness', why: 'Detects when your child is walking so JoanX can step in at the right moment.', required: true },
  { id: 'location', icon: 'map-pin',  name: 'Location',         why: 'Smart mode only — warns near danger zones while walking. Never tracked at rest.', required: false },
  { id: 'notif',  icon: 'bell',       name: 'Notifications',    why: 'Sends gentle warnings to your child and updates to you.', required: true },
  { id: 'screen', icon: 'smartphone', name: 'Screen Time',      why: 'Sees when an app is open while walking. Never reads your messages.', required: true },
];

Object.assign(window, {
  PLAYER, CHARACTERS, ROOMS, ACHIEVEMENTS, REACTIONS_7D, RISK_TREND,
  PARENT_METRICS, CHILDREN, APP_CATEGORIES, PERMISSIONS,
});
