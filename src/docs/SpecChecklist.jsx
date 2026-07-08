import React from 'react';
import { Icon } from '../core/primitives.jsx';

// JoanX — Spec checklist (coverage audit).
// Maps every feature ID in JoanX_Functional_Spec_2026-06-18_EN.md to the
// screens that implement it, with an assessed status (done / needs work /
// missing / engine-only / excluded) plus a personal review checkbox that
// persists in localStorage. Rendered by the shell when the "Spec checklist"
// topbar segment is active. The machine-readable copy is SPEC-CHECKLIST.md.

/* ── status vocabulary ─────────────────────────────────────────────── */

const STATUS = {
  done:     { label: 'Done',        fg: '#2f7a4f', bg: '#e9f6ee', icon: 'check-circle-2' },
  partial:  { label: 'Needs work',  fg: '#9a6a08', bg: '#fdf3dd', icon: 'wrench' },
  missing:  { label: 'Not built',   fg: '#b04343', bg: '#fdecec', icon: 'circle-dashed' },
  na:       { label: 'No UI',       fg: '#77736e', bg: '#f3f2f1', icon: 'cpu' },
  excluded: { label: 'Excluded',    fg: '#9b9793', bg: '#faf9f8', icon: 'ban' },
};

/* ── the audit data — spec feature → screens → assessment ──────────── */
// status meanings:
//   done     · designed and matches the spec behavior
//   partial  · a screen exists but something in the spec row still needs design
//   missing  · the spec requires UI that has no screen yet
//   na       · engine/backend/process item — nothing to design
//   excluded · struck from this revision (2026-06-18)

const CHAPTERS = [
  {
    id: 'ch1', title: '1 · Detection · Core Engine', icon: 'radar',
    lead: 'Walk / phone-use detection. Almost all engine work — little to design.',
    items: [
      { id: 'F-01', title: 'Operating mode (Lite)', mode: 'Excluded', status: 'excluded',
        screens: ['LiteBlock.jsx'],
        note: 'Out of scope this revision — but LiteBlock.jsx is already designed. Keep it parked; don’t expand it.' },
      { id: 'F-02', title: 'Operating mode (Smart)', mode: 'Smart', status: 'done',
        screens: ['WarningOverlay.jsx', 'ChildHome.jsx', 'SafetyStatus.jsx'],
        note: 'The whole child app is the Smart loop: risk warnings + gamification, active only while walking.' },
      { id: 'F-03', title: 'Walk detection (1.2–2.5 Hz, 8 s sustain)', mode: 'Common', status: 'na',
        screens: [],
        note: 'Accelerometer logic — no dedicated UI. Walking state is surfaced on Home / Safety status.' },
      { id: 'F-04', title: 'Risky-behavior event (walk + use ≥ 10 s)', mode: 'Common', status: 'na',
        screens: [],
        note: 'Engine trigger behind the warning overlay. Preview it via Tweaks ▶ "Trigger a warning".' },
      { id: 'F-05', title: 'Danger-zone warning algorithm', mode: 'Excluded', status: 'excluded',
        screens: [], note: 'Location family excluded this revision.' },
      { id: 'F-06', title: 'GNSS correction & filtering', mode: 'Excluded', status: 'excluded',
        screens: [], note: 'Location family excluded this revision.' },
      { id: 'F-30', title: 'Walk-detection tuning period', mode: 'Common', status: 'na',
        screens: [], note: 'PoC process item (sensor-parameter tuning with real users) — nothing to design.' },
    ],
  },
  {
    id: 'ch2', title: '2 · Intervention · UX', icon: 'bell-ring',
    lead: 'What the child sees when a risky moment is detected.',
    items: [
      { id: 'F-07', title: 'Grace-period handling (10 s)', mode: 'Common', status: 'na',
        screens: [],
        note: 'Timing logic before the warning fires. Optional: design a subtle pre-warning countdown.' },
      { id: 'F-08', title: 'Staged intervention UX', mode: 'Common', status: 'partial',
        screens: ['WarningOverlay.jsx'],
        note: 'Three warning styles exist (sheet / spotlight / banner), but the stage sequence — vibration → on-screen warning → character message — isn’t storyboarded as an escalation. Design the stage flow.' },
      { id: 'F-09', title: 'Character message (bottom, ~20% height, 1.5 s)', mode: 'Common', status: 'partial',
        screens: ['WarningOverlay.jsx'],
        note: 'The banner style approximates it, but the spec’s timed toast (bottom-center, ~20% of screen height, 1.5 s show, 3 s min interval) needs its own auto-dismiss design.' },
      { id: 'F-10', title: 'Full-screen block (Lite)', mode: 'Excluded', status: 'excluded',
        screens: ['LiteBlock.jsx'],
        note: 'Excluded, yet LiteBlock.jsx is built — ahead of scope. Park it.' },
      { id: 'F-11', title: 'Overlay warning (Smart)', mode: 'Smart', status: 'done',
        screens: ['WarningOverlay.jsx'],
        note: 'Sheet / spotlight / banner variants, switchable in Tweaks.' },
      { id: 'F-12', title: 'User-response classification', mode: 'Common', status: 'na',
        screens: [],
        note: 'Immediate / delayed / ignored is engine classification — it surfaces in the parent metrics (F-20).' },
    ],
  },
  {
    id: 'ch3', title: '3 · Gamification · Rewards', icon: 'gamepad-2',
    lead: 'Character growth, collection, battles — the child app’s core.',
    items: [
      { id: 'F-13', title: 'Points · character growth (XP)', mode: 'Smart', status: 'done',
        screens: ['ChildHome.jsx', 'Rewards.jsx', 'CharacterDetail.jsx'],
        note: '10 pt / safe minute → XP → levels; visible on Home hero + Rewards.' },
      { id: 'F-14', title: 'Daily accident-free reward', mode: 'Smart', status: 'done',
        screens: ['Rewards.jsx'],
        note: 'Day-streak row with per-day rewards covers it.' },
      { id: 'F-15', title: 'Character acquisition · rarity', mode: 'Smart', status: 'partial',
        screens: ['Collection.jsx', 'Shop.jsx'],
        note: 'Collection grid + Common/Rare/Epic rarity exist, but the A-2 egg flow is missing: buy a Character Egg with points → hatch animation → random character, duplicates convert to XP. Shop currently only sells outfits/rooms.' },
      { id: 'F-16', title: 'Character evolution (3 stages)', mode: 'Smart', status: 'done',
        screens: ['CharacterDetail.jsx', 'CharacterVariants.jsx'],
        note: 'Stage 1→3 with appearance changes and the evolve moment.' },
      { id: 'F-17', title: 'Character customization', mode: 'Smart', status: 'done',
        screens: ['Shop.jsx', 'CharacterDetail.jsx'],
        note: 'Outfits / hats / accessories bought with points; no stat effects (per A-5).' },
      { id: 'F-18', title: 'Collection House (≥ 3 Rooms)', mode: 'Smart', status: 'done',
        screens: ['MyHouse.jsx'],
        note: '4 rooms — 2 unlocked, 2 condition-locked ("Collect 8 characters", "30-day streak") — matching gradual expansion.' },
      { id: 'F-19', title: 'Battle system (PvE, 1/day)', mode: 'Smart', status: 'done',
        screens: ['Battle.jsx'],
        note: 'System-villain battles, once daily, outcome from accumulated safe-behavior score — no real-time controls.' },
      { id: 'F-32', title: 'Friend visit · likes · guestbook', mode: 'Smart', status: 'done',
        screens: ['Friends.jsx', 'FriendHouse.jsx', 'AddFriends.jsx'],
        note: 'Featured buddy, room browsing, like stickers, one-line (60-char) guestbook. No chat / real-time — per A-10.' },
    ],
  },
  {
    id: 'ch4', title: '4 · Guardian (Parent)', icon: 'users',
    lead: 'The parent dashboard: reports, settings, AI summary.',
    items: [
      { id: 'F-20', title: 'Guardian report metrics', mode: 'Common', status: 'partial',
        screens: ['ParentReports.jsx'],
        note: 'Warning-acceptance % and safe-walking time (with deltas) are in. The spec asks for behavior-change rates, not raw counts — reframe "Risky moments" as a risky-behavior reduction rate.' },
      { id: 'F-21', title: 'Time-based policy settings', mode: 'Excluded', status: 'excluded',
        screens: ['ParentSchedule.jsx'],
        note: 'Excluded, yet ParentSchedule.jsx (and the Time-rules block in ParentSettings) is built — ahead of scope. Park or hide behind a flag.' },
      { id: 'F-22', title: 'Smart intervention-intensity settings', mode: 'Smart', status: 'done',
        screens: ['ParentSettings.jsx'],
        note: 'Sensitivity slider, notification toggle, game/rewards toggle. Warning frequency is folded into sensitivity — split it out only if the spec review demands it.' },
      { id: 'F-31', title: 'AI parent report', mode: 'Common', status: 'done',
        screens: ['ParentAIReport.jsx'],
        note: 'Natural-language trend summary, improvement points, recommended actions.' },
    ],
  },
  {
    id: 'ch5', title: '5 · Data · Processing', icon: 'database',
    lead: 'Storage, transmission, risk score, permissions.',
    items: [
      { id: 'F-23', title: 'Local event storage (≤ 100)', mode: 'Common', status: 'na',
        screens: [], note: 'Client storage — no UI.' },
      { id: 'F-24', title: 'Event transmission API (POST /event)', mode: 'Common', status: 'na',
        screens: [], note: 'Network layer — no UI.' },
      { id: 'F-25', title: 'Dynamic Risk Score processing', mode: 'Smart', status: 'na',
        screens: [], note: 'Engine value that drives the overlay + parent charts.' },
      { id: 'F-26', title: 'Staged permission requests & fallback', mode: 'Common', status: 'partial',
        screens: ['Onboarding.jsx'],
        note: 'The staged permission guide with per-permission sheets is designed. Missing: the fallback state — what the app looks like when a permission is denied (warnings keep working without location).' },
    ],
  },
  {
    id: 'ch6', title: '6 · Platform · System', icon: 'smartphone',
    lead: 'Android foreground service, restore, logging — dev-only.',
    items: [
      { id: 'F-27', title: 'Android-only implementation', mode: 'Android', status: 'na',
        screens: [], note: 'Foreground service; calls/texts exempt. No design surface.' },
      { id: 'F-28', title: 'Background state restoration', mode: 'Common', status: 'na',
        screens: [], note: 'OS lifecycle — no design surface.' },
      { id: 'F-29', title: 'Logging · debugging (7-day local)', mode: 'Common', status: 'na',
        screens: [], note: 'Dev tooling — no design surface.' },
    ],
  },
  {
    id: 'appendix', title: 'Appendix A · Game system detail', icon: 'book-open',
    lead: 'The detailed game spec (same force as the main spec). Checkpoints the screens must satisfy.',
    items: [
      { id: 'A-2', title: 'Egg acquisition (points → egg → hatch)', mode: 'Smart', status: 'missing',
        screens: ['Shop.jsx'],
        note: 'The one real gap in the game loop: no egg purchase / hatch-reveal flow anywhere. Duplicates→XP messaging also needs a home. No cash payment (per spec).' },
      { id: 'A-4', title: 'Character encyclopedia', mode: 'Smart', status: 'done',
        screens: ['CharacterDex.jsx'],
        note: 'Name, rarity, stage, description, silhouettes for unowned, completion %.' },
      { id: 'A-6', title: 'Collection House ≥ 3 Rooms, free placement', mode: 'Smart', status: 'done',
        screens: ['MyHouse.jsx'], note: '4 rooms with per-room character placement.' },
      { id: 'A-7', title: 'Room decoration (wallpaper, furniture…)', mode: 'Smart', status: 'done',
        screens: ['DecorateRoom.jsx'], note: 'Point-bought decor by category.' },
      { id: 'A-8', title: 'Villain battles — 10 named villains, Lv1–10', mode: 'Smart', status: 'done',
        screens: ['Battle.jsx', 'VillainDex.jsx'],
        note: 'Full roster Smombie Rookie → King Smombie, sequential unlock, 1 challenge/day.' },
      { id: 'A-9', title: 'Villain encyclopedia', mode: 'Smart', status: 'done',
        screens: ['VillainDex.jsx'],
        note: 'Road-map + list layouts; silhouettes, defeat status, completion %.' },
      { id: 'A-10', title: 'Friend visit system', mode: 'Smart', status: 'done',
        screens: ['FriendHouse.jsx'],
        note: 'Visit, featured character, rooms, like stickers, one-line guestbook. No chat.' },
      { id: 'A-11', title: 'Out-of-scope guard (no PvP / chat / cash…)', mode: '—', status: 'done',
        screens: [],
        note: 'Nothing designed violates the exclusion list (PvP, guilds, chat, trading, gacha-for-cash, ranked, voice, streaming).' },
    ],
  },
];

/* ── screens inventory — every built screen → spec IDs ─────────────── */

const INVENTORY = [
  { app: 'Child', file: 'Onboarding.jsx', covers: 'F-26', state: 'fix', note: 'Add the permission-denied fallback state.' },
  { app: 'Child', file: 'ChildHome.jsx · HomeVariants*.jsx', covers: 'F-02 · F-13', state: 'ok', note: 'Buddy hero, XP, daily goal.' },
  { app: 'Child', file: 'SafetyStatus.jsx', covers: 'F-02', state: 'ok', note: 'Shield / protection status tab.' },
  { app: 'Child', file: 'WarningOverlay.jsx', covers: 'F-08 · F-09 · F-11', state: 'fix', note: 'Add stage-escalation flow + timed character toast.' },
  { app: 'Child', file: 'LiteBlock.jsx', covers: 'F-10 (excluded)', state: 'parked', note: 'Built ahead of scope — keep parked.' },
  { app: 'Child', file: 'Rewards.jsx', covers: 'F-13 · F-14', state: 'ok', note: 'Streak, achievements, daily reward.' },
  { app: 'Child', file: 'Shop.jsx', covers: 'F-15 · F-17', state: 'fix', note: 'Missing the A-2 egg purchase + hatch flow.' },
  { app: 'Child', file: 'Collection.jsx', covers: 'F-15 · F-18', state: 'ok', note: 'Owned-buddy grid with rarity.' },
  { app: 'Child', file: 'CharacterDetail.jsx · CharacterVariants.jsx', covers: 'F-16 · F-17', state: 'ok', note: 'Stages, evolve, items.' },
  { app: 'Child', file: 'CharacterDex.jsx', covers: 'A-4', state: 'ok', note: 'Silhouettes + completion %.' },
  { app: 'Child', file: 'Battle.jsx', covers: 'F-19 · A-8', state: 'ok', note: 'PvE, 1/day, score-based outcome.' },
  { app: 'Child', file: 'VillainDex.jsx', covers: 'A-9', state: 'ok', note: 'Road + list layouts.' },
  { app: 'Child', file: 'MyHouse.jsx', covers: 'F-18 · A-6', state: 'ok', note: '4 rooms, 2 condition-locked.' },
  { app: 'Child', file: 'DecorateRoom.jsx', covers: 'A-7', state: 'ok', note: 'Decor shop by category.' },
  { app: 'Child', file: 'Friends.jsx · AddFriends.jsx', covers: 'F-32', state: 'ok', note: 'Friend list, requests, add.' },
  { app: 'Child', file: 'FriendHouse.jsx', covers: 'F-32 · A-10', state: 'ok', note: 'Visit, likes, guestbook.' },
  { app: 'Child', file: 'Notifications.jsx', covers: '— (supporting)', state: 'extra', note: 'Not a spec item; supports the loop.' },
  { app: 'Child', file: 'Profile.jsx', covers: '— (supporting)', state: 'extra', note: 'Child profile & settings.' },
  { app: 'Parent', file: 'ParentOnboarding.jsx', covers: '— (supporting)', state: 'extra', note: 'Splash → intro → auth.' },
  { app: 'Parent', file: 'ParentAddChild.jsx', covers: '— (pairing)', state: 'extra', note: 'Add-child wizard + QR pairing.' },
  { app: 'Parent', file: 'ParentReports.jsx', covers: 'F-20', state: 'fix', note: 'Reframe risky-moment counts as a reduction rate.' },
  { app: 'Parent', file: 'ParentAIReport.jsx', covers: 'F-31', state: 'ok', note: 'AI natural-language report.' },
  { app: 'Parent', file: 'ParentChildren.jsx', covers: '— (supporting)', state: 'extra', note: 'Children / devices list.' },
  { app: 'Parent', file: 'ParentSettings.jsx', covers: 'F-22', state: 'ok', note: 'Sensitivity, notifications, game toggle.' },
  { app: 'Parent', file: 'ParentSchedule.jsx', covers: 'F-21 (excluded)', state: 'parked', note: 'Built ahead of scope — keep parked.' },
  { app: 'Parent', file: 'ParentDetail.jsx · ParentAccount.jsx', covers: '— (supporting)', state: 'extra', note: 'Account pages, Help / FAQ.' },
];

const INV_STATE = {
  ok:     { label: 'OK',     fg: '#2f7a4f', bg: '#e9f6ee' },
  fix:    { label: 'Fix',    fg: '#9a6a08', bg: '#fdf3dd' },
  parked: { label: 'Parked', fg: '#9b9793', bg: '#f3f2f1' },
  extra:  { label: 'Extra',  fg: '#2b5782', bg: '#ecf3fe' },
};

/* ── persisted review checkboxes ───────────────────────────────────── */

const LS_KEY = 'jx-spec-checklist-v1';
function useChecks() {
  const [checks, setChecks] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch { return {}; }
  });
  const toggle = id => setChecks(c => {
    const next = { ...c, [id]: !c[id] };
    try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* private mode */ }
    return next;
  });
  return [checks, toggle];
}

/* ── building blocks ───────────────────────────────────────────────── */

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span className="cl-badge" style={{ color: s.fg, background: s.bg }}>
      <Icon name={s.icon} size={12} color={s.fg} stroke={2.4} />{s.label}
    </span>
  );
}

function FeatureRow({ item, checked, onToggle }) {
  const excluded = item.status === 'excluded';
  return (
    <div className={'cl-row' + (checked ? ' checked' : '')}>
      <button className={'cl-check' + (checked ? ' on' : '')} onClick={onToggle} title="Mark as reviewed">
        {checked && <Icon name="check" size={13} color="#fff" stroke={3.2} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cl-row-head">
          <span className="cl-id">{item.id}</span>
          <span className="cl-title" style={excluded ? { textDecoration: 'line-through', color: '#9b9793' } : null}>{item.title}</span>
          <StatusBadge status={item.status} />
          <span className="cl-mode">{item.mode}</span>
        </div>
        {item.screens.length > 0 && (
          <div className="cl-screens">
            {item.screens.map(s => <code key={s}>{s}</code>)}
          </div>
        )}
        <p className="cl-note">{item.note}</p>
      </div>
    </div>
  );
}

/* ── page CSS — mirrors the Design System doc styling ──────────────── */

const CL_CSS = `
  .cl-root { width: 100%; max-width: 1240px; display: flex; gap: 28px; align-items: flex-start; }
  .cl-nav { position: sticky; top: 84px; width: 212px; flex-shrink: 0; background: #fff; border-radius: 22px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 14px 10px; max-height: calc(100vh - 108px); overflow-y: auto; }
  .cl-nav-title { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #b0adab; padding: 4px 12px 10px; }
  .cl-nav button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: none; font-family: inherit; font-size: 13px; font-weight: 700; color: #585450; padding: 8px 12px; border-radius: 12px; cursor: pointer; text-align: left; }
  .cl-nav button:hover { background: #f8f7f7; }
  .cl-nav button.on { background: #ecf3fe; color: #2b5782; }
  .cl-main { flex: 1; min-width: 0; background: #fff; border-radius: 26px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 34px 38px 60px; }
  .cl-hero { border-bottom: 1px solid #ebebea; padding-bottom: 22px; margin-bottom: 8px; }
  .cl-hero h1 { margin: 0 0 6px; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; color: #2b2926; }
  .cl-hero p { margin: 0; color: #585450; font-size: 14.5px; }
  .cl-hero p code { background: #f8f7f7; border: 1px solid #ebebea; border-radius: 6px; padding: 1px 6px; font-size: 12.5px; }
  .cl-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .cl-stat { flex: 1; min-width: 120px; border: 1px solid #ebebea; border-radius: 16px; padding: 12px 14px; }
  .cl-stat b { display: block; font-size: 22px; font-weight: 800; letter-spacing: -.4px; }
  .cl-stat span { font-size: 11.5px; font-weight: 700; color: #77736e; }
  .cl-progress { height: 8px; border-radius: 999px; background: #f0efee; overflow: hidden; margin-top: 14px; display: flex; }
  .cl-filters { display: flex; gap: 6px; flex-wrap: wrap; margin: 18px 0 2px; }
  .cl-filter { border: 1.5px solid #ebebea; background: #fff; font-family: inherit; font-size: 12px; font-weight: 700; color: #585450; padding: 6px 11px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .cl-filter.on { background: #2b2926; border-color: #2b2926; color: #fff; }
  .cl-filter i { font-style: normal; font-size: 10.5px; opacity: .65; }
  .cl-section { padding: 26px 0 10px; border-bottom: 1px solid #f0efee; scroll-margin-top: 84px; }
  .cl-section:last-child { border-bottom: none; }
  .cl-h2 { font-size: 19px; font-weight: 800; letter-spacing: -0.3px; color: #2b2926; margin: 0 0 3px; }
  .cl-lead { color: #585450; font-size: 13.5px; margin: 0 0 14px; }
  .cl-row { display: flex; gap: 12px; padding: 13px 14px; border: 1px solid #ebebea; border-radius: 16px; margin-bottom: 10px; }
  .cl-row.checked { background: #fbfaf9; }
  .cl-check { width: 22px; height: 22px; flex-shrink: 0; margin-top: 2px; border-radius: 8px; border: 2px solid #d8d5d2; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; }
  .cl-check:hover { border-color: #2b5782; }
  .cl-check.on { background: #2f7a4f; border-color: #2f7a4f; }
  .cl-row-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .cl-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; color: #2b5782; background: #ecf3fe; border-radius: 7px; padding: 2px 7px; }
  .cl-title { font-size: 14px; font-weight: 800; color: #2b2926; }
  .cl-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; padding: 3px 9px; border-radius: 999px; }
  .cl-mode { font-size: 10.5px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #b0adab; margin-left: auto; }
  .cl-screens { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 7px; }
  .cl-screens code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #585450; background: #f8f7f7; border: 1px solid #ebebea; border-radius: 6px; padding: 1px 7px; }
  .cl-note { margin: 7px 0 0; font-size: 12.5px; line-height: 1.55; color: #77736e; }
  .cl-table-wrap { overflow-x: auto; margin: 4px 0 16px; }
  .cl-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .cl-table th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #77736e; padding: 8px 12px; border-bottom: 1.5px solid #ebebea; white-space: nowrap; }
  .cl-table td { padding: 9px 12px; border-bottom: 1px solid #f3f2f1; color: #3f3c39; vertical-align: top; }
  .cl-table td code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; background: #f8f7f7; border: 1px solid #ebebea; border-radius: 6px; padding: 1px 6px; }
  .cl-inv-state { display: inline-block; font-size: 11px; font-weight: 800; padding: 2px 9px; border-radius: 999px; }
  @media (max-width: 900px) { .cl-root { flex-direction: column; } .cl-nav { position: static; width: 100%; max-height: none; display: flex; flex-wrap: wrap; gap: 2px; } .cl-nav button { width: auto; } .cl-nav-title { width: 100%; } }
`;

/* ── the page ──────────────────────────────────────────────────────── */

const ALL_ITEMS = CHAPTERS.flatMap(c => c.items);

function SpecChecklist() {
  const [checks, toggle] = useChecks();
  const [filter, setFilter] = React.useState('all');
  const [active, setActive] = React.useState('summary');
  const refs = React.useRef({});

  React.useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    Object.values(refs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const go = id => { setActive(id); refs.current[id] && refs.current[id].scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const count = s => ALL_ITEMS.filter(i => i.status === s).length;
  const designable = ALL_ITEMS.filter(i => i.status === 'done' || i.status === 'partial' || i.status === 'missing');
  const reviewed = ALL_ITEMS.filter(i => checks[i.id]).length;

  const FILTERS = [
    ['all', 'All', ALL_ITEMS.length],
    ['done', STATUS.done.label, count('done')],
    ['partial', STATUS.partial.label, count('partial')],
    ['missing', STATUS.missing.label, count('missing')],
    ['na', STATUS.na.label, count('na')],
    ['excluded', STATUS.excluded.label, count('excluded')],
  ];

  const navItems = [
    { id: 'summary', label: 'Summary', icon: 'gauge' },
    ...CHAPTERS.map(c => ({ id: c.id, label: c.title.replace(/^\S+ · /, ''), icon: c.icon })),
    { id: 'inventory', label: 'Screens inventory', icon: 'layout-grid' },
  ];

  return (
    <div className="cl-root">
      <style>{CL_CSS}</style>
      <nav className="cl-nav">
        <div className="cl-nav-title">Spec checklist</div>
        {navItems.map(s => (
          <button key={s.id} className={active === s.id ? 'on' : ''} onClick={() => go(s.id)}>
            <Icon name={s.icon} size={15} color={active === s.id ? '#2b5782' : '#b0adab'} stroke={2.2} />{s.label}
          </button>
        ))}
      </nav>

      <main className="cl-main">
        <section id="summary" ref={el => { refs.current.summary = el; }} style={{ scrollMarginTop: 84 }}>
          <div className="cl-hero">
            <h1>Spec coverage checklist</h1>
            <p>
              Every feature in <code>JoanX_Functional_Spec_2026-06-18_EN.md</code> mapped to the screens that implement it,
              with what still needs design work. Tick a row once you’ve reviewed it — checks are saved in this browser.
              Machine-readable copy: <code>SPEC-CHECKLIST.md</code>
            </p>
            <div className="cl-stats">
              {[
                [count('done'), 'Done', STATUS.done.fg],
                [count('partial'), 'Needs work', STATUS.partial.fg],
                [count('missing'), 'Not built', STATUS.missing.fg],
                [count('na'), 'Engine / no UI', STATUS.na.fg],
                [count('excluded'), 'Excluded', STATUS.excluded.fg],
                [`${reviewed}/${ALL_ITEMS.length}`, 'Reviewed by you', '#2b5782'],
              ].map(([v, l, c]) => (
                <div className="cl-stat" key={l}><b style={{ color: c }}>{v}</b><span>{l}</span></div>
              ))}
            </div>
            <div className="cl-progress" title={`Design coverage of the ${designable.length} in-scope UI features`}>
              {['done', 'partial', 'missing'].map(s => (
                <div key={s} style={{ width: `${(count(s) / designable.length) * 100}%`, background: STATUS[s].fg, opacity: s === 'done' ? 1 : s === 'partial' ? .55 : .3 }} />
              ))}
            </div>
          </div>
          <div className="cl-filters">
            {FILTERS.map(([id, label, n]) => (
              <button key={id} className={'cl-filter' + (filter === id ? ' on' : '')} onClick={() => setFilter(id)}>{label}<i>{n}</i></button>
            ))}
          </div>
        </section>

        {CHAPTERS.map(ch => {
          const items = ch.items.filter(i => filter === 'all' || i.status === filter);
          return (
            <section key={ch.id} id={ch.id} ref={el => { refs.current[ch.id] = el; }} className="cl-section">
              <h2 className="cl-h2">{ch.title}</h2>
              <p className="cl-lead">{ch.lead}</p>
              {items.length === 0
                ? <p className="cl-note" style={{ marginBottom: 14 }}>No rows match the current filter.</p>
                : items.map(item => (
                  <FeatureRow key={item.id} item={item} checked={!!checks[item.id]} onToggle={() => toggle(item.id)} />
                ))}
            </section>
          );
        })}

        <section id="inventory" ref={el => { refs.current.inventory = el; }} className="cl-section">
          <h2 className="cl-h2">Screens inventory</h2>
          <p className="cl-lead">Every built screen, the spec IDs it covers, and its state at a glance.</p>
          <div className="cl-table-wrap">
            <table className="cl-table">
              <thead><tr><th>App</th><th>Screen file</th><th>Covers</th><th>State</th><th>Note</th></tr></thead>
              <tbody>
                {INVENTORY.map(r => {
                  const st = INV_STATE[r.state];
                  return (
                    <tr key={r.file}>
                      <td>{r.app}</td>
                      <td><code>{r.file}</code></td>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.covers}</td>
                      <td><span className="cl-inv-state" style={{ color: st.fg, background: st.bg }}>{st.label}</span></td>
                      <td style={{ color: '#77736e', fontSize: 12.5 }}>{r.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SpecChecklist;
