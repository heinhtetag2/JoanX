import React from 'react';
import { Icon } from '../core/primitives.jsx';

// JoanX — Project documentation (in-app).
// The visual companion to PROJECT_DOCUMENTATION.md at the repo root: what the product
// is, who it is for, how the economy is tuned, and how the code is built — explained
// with the real numbers, drawn rather than described.
//
// Rendered by the shell for the "Documentation" segment (or ?view=docs). Same
// scaffolding as SpecChecklist.jsx (sticky nav + scrollspy) so the three doc pages
// read as one set.
//
// Every figure here is the REAL value from src/core/data.jsx. If you retune the
// economy there, update the constants at the top of this file — they are duplicated
// on purpose (a doc page that imports live data would silently rewrite itself and
// stop being a record of what was approved).

/* ── chart palette ──────────────────────────────────────────────────────
   Drawn from the app's own ramps, then snapped to steps that pass a
   colour-blindness + contrast check against a white surface:
     evergreen-50 (#4b814f) reads GRAY at chart scale (chroma below floor)
       → snapped to #2f7a4f
     data-yellow-50 (#d19900) fails 3:1 contrast on white
       → snapped to data-yellow-60 (#9e7300)
   Gold ↔ rust sit in the deuteranopia floor band (ΔE 10.1), which is legal ONLY
   with a second cue — so every stacked segment below carries a direct label, a
   legend, and a 2px surface gap. Never colour alone.                        */
const C = {
  good: '#2f7a4f',      // immediate stop
  warn: '#9e7300',      // delayed · XP · points
  bad:  '#d14532',      // ignored · villains
  ocean: '#447aaf',     // in-game action
  iris: '#7f63c5',      // epic
  ink: '#2b2926', ink2: '#585450', ink3: '#b0adab',
  line: '#ebebea', surf: '#f8f7f7',
};

/* ── the real numbers ───────────────────────────────────────────────── */

const XP_STEPS = [
  { lv: '1→2', xp: 100 }, { lv: '2→3', xp: 120 }, { lv: '3→4', xp: 150 },
  { lv: '4→5', xp: 180 }, { lv: '5→6', xp: 220 }, { lv: '6→7', xp: 270 },
  { lv: '7→8', xp: 330 }, { lv: '8→9', xp: 400 }, { lv: '9→10', xp: 480 },
];
const XP_TOTAL = XP_STEPS.reduce((a, b) => a + b.xp, 0);          // 2,250 EXP to the cap

const VILLAINS = [
  { lv: 1,  name: 'Temp',   power: 60,  role: '', risk: 'Temptation — the phone that begs to be checked', ability: 'Just One Peek' },
  { lv: 2,  name: 'Haze',   power: 95,  role: '', risk: 'Carelessness — attention draining away', ability: 'Blur' },
  { lv: 3,  name: 'Rush',   power: 130, role: '', risk: 'Impulse — moving before looking', ability: 'Go Now' },
  { lv: 4,  name: 'Noct',   power: 165, role: '', risk: 'Darkness — being unseen by drivers', ability: 'Lights Out' },
  { lv: 5,  name: 'Glitch', power: 205, role: '', risk: 'Confusion — danger that breaks the rules', ability: 'Wrong Signal' },
  { lv: 6,  name: 'Maze',   power: 245, role: '', risk: 'Complexity — losing your way', ability: 'Endless Detour' },
  { lv: 7,  name: 'Vex',    power: 285, role: '', risk: 'Anxiety — pressure crowding out the road', ability: 'Hurry Up' },
  { lv: 8,  name: 'Grim',   power: 330, role: '', risk: 'Fear — freezing mid-crossing', ability: 'Freeze' },
  { lv: 9,  name: 'Vilord', power: 380, role: 'Mid-boss',   risk: 'The hand behind the other eight', ability: 'Command the Eight' },
  { lv: 10, name: 'Nox',    power: 440, role: 'Final boss', risk: 'The source — the dark the others are made of', ability: 'Total Dark' },
];

const REACTIONS = [   // REACTIONS_7D — the chart the parent report is built on
  { d: 'Mon', immediate: 4, delayed: 2, ignored: 1 },
  { d: 'Tue', immediate: 5, delayed: 1, ignored: 1 },
  { d: 'Wed', immediate: 3, delayed: 2, ignored: 0 },
  { d: 'Thu', immediate: 6, delayed: 1, ignored: 0 },
  { d: 'Fri', immediate: 5, delayed: 1, ignored: 1 },
  { d: 'Sat', immediate: 7, delayed: 0, ignored: 0 },
  { d: 'Sun', immediate: 6, delayed: 1, ignored: 0 },
];

const COVERAGE = [
  { k: 'Built', n: 38, c: C.good, s: 'Every in-scope requirement' },
  { k: 'Excluded this revision', n: 5, c: C.ink3, s: 'Lite mode, danger zones, GNSS, time policy — gated, not deleted' },
  { k: 'Engine-only', n: 1, c: C.ocean, s: 'A sensor-tuning process item with no UI to design' },
];

// Effective battle power (power + the 30-point safe-walk bonus) for a buddy at neutral
// traits, computed with the real battlePower() and verified against the module — not
// estimated. This is what decides every battle: effective ≥ villain.power → win.
const POWER = [
  { k: 'Common Lv.1',  v: 170 }, { k: 'Common Lv.10', v: 300 },
  { k: 'Rare Lv.1',    v: 198 }, { k: 'Rare Lv.10',   v: 367 },
  { k: 'Epic Lv.1',    v: 235 }, { k: 'Epic Lv.10',   v: 451 },
];
const THRESHOLDS = [
  { k: 'Grim (Lv.8)',   v: 330, c: C.ink3 },
  { k: 'Vilord (Lv.9)', v: 380, c: C.warn },
  { k: 'Nox (Lv.10)',   v: 440, c: C.bad },
];

const EGG_ODDS = [
  { egg: 'Common Egg', price: '500 pt', gate: '—',      odds: [80, 20, 0] },
  { egg: 'Rare Egg',   price: '1,500 pt', gate: 'Lv.5+', odds: [30, 60, 0] },
  { egg: 'Epic Egg',   price: 'reward-only', gate: '—',  odds: [0, 40, 60] },
];
const RARITY_C = { Common: '#8f8b88', Rare: C.ocean, Epic: C.iris };

const POINTS_IN = [
  { k: 'Per phone-free walking minute', v: '10 pt' },
  { k: 'Stopping immediately after a warning', v: '+20 pt' },
  { k: 'An accident-free day', v: '+100 pt' },
  { k: 'A 7-day accident-free streak', v: '+300 pt' },
  { k: 'A 30-day streak', v: 'An Epic Egg' },
  { k: 'Minimum session that pays anything', v: '60 s' },
];

const ADRS = [
  { id: 'ADR-001', t: 'No backend in the prototype', d: 'Ship no server; model every server value as a mock, and build the seam (four validating setters) a backend will plug into.', good: 'Fastest path to a complete product story; the settings contract is designed and tested.', bad: 'No persistence; the economy is client-mutable — unacceptable in production.' },
  { id: 'ADR-003', t: 'Mutable module state instead of a store', d: 'PLAYER / CHARACTERS / VILLAINS are module-level objects that screens mutate directly.', good: 'Zero boilerplate; the data module is unambiguously the source of truth.', bad: 'Two screens can disagree until the next render; a reload wipes everything. The first thing to replace.' },
  { id: 'ADR-004', t: 'The economy is data, not code', d: 'Every balance value is a settings object with a launch default and a validating setter with per-field fallback.', good: 'Retuning needs no app release; a bad payload degrades gracefully.', bad: 'More validation code to maintain.' },
  { id: 'ADR-007', t: 'Boss status is a role, not a row position', d: 'role: minion | midBoss | finalBoss. finalVillain() matches the role, never the last index.', good: 'Seasons can append villains without stealing the ending.', bad: 'One extra field per row.' },
  { id: 'ADR-009', t: 'Guaranteed unlocks alongside the gacha', d: 'CHARACTER_UNLOCKS grants characters for real behaviour — a 30-day streak hands over an Epic outright.', good: 'The gacha becomes ethically defensible for children.', bad: 'Lower pressure to buy eggs.' },
  { id: 'ADR-010', t: 'Stamps, not free text', d: 'Six fixed guestbook stamps. No text input exists anywhere in the product.', good: 'No moderation surface and no grooming vector.', bad: 'Less expressive social play.' },
];

const RISKS = [
  { id: 'RISK-1', t: 'Client-authoritative economy', sev: 'Critical', s: 'A client mutation could grant infinite points. The hatch roll, battle outcome and every point mutation must move server-side before any public release.' },
  { id: 'RISK-2', t: 'No tests', sev: 'High', s: 'A rule change can silently break the economy. data.jsx is pure functions over plain objects — the cheapest tests in the repo, and none exist.' },
  { id: 'RISK-3', t: 'The warning overlay is inaccessible', sev: 'High', s: 'A screen-reader user is never told a warning appeared — in a safety feature. Needs aria-live and a role, today.' },
  { id: 'RISK-6', t: 'Bundle size', sev: 'Medium', s: 'Over 500 kB, almost entirely unchosen layout variants. Pruning them is the biggest single win.' },
  { id: 'RISK-9', t: 'Pairing-code brute force', sev: 'Medium', s: 'Six digits is 10⁶. Needs short expiry plus server-side attempt lockout.' },
  { id: 'RISK-5', t: 'Broken asset path', sev: 'Low', s: 'The "toy" mascot style points at /assets/characters/3d/, which does not exist. Use "comic" (the default) or "cute".' },
];

const TESTS = [
  { id: 'U-05', c: 'gainXp with an amount spanning 3 levels', e: 'levels: 3, overflow carried, lost: 0' },
  { id: 'U-09', c: 'isOwed for the every-25km egg at 80 km, nothing paid', e: '3 — a count, not a boolean' },
  { id: 'U-11', c: 'claimRewards() twice with no new progress', e: 'The second call returns three empty arrays' },
  { id: 'U-12', c: 'rollRarity over 10,000 Common Egg rolls', e: '≈80% common, 20% rare, exactly 0% epic' },
  { id: 'U-17', c: 'setXpCurve({steps:[100,"x",-5], maxLevel:0})', e: 'Every launch default restored' },
  { id: 'U-18', c: 'setStatGrowth({ stageMult: 2 })', e: 'Ignored — a stage must never grant stats' },
  { id: 'U-21', c: 'endingUnlocked() after appending an enabled 11th villain', e: 'Still keyed to Nox' },
  { id: 'C-01', c: 'Stop inside the 2-second buzz hold', e: 'No warning ever renders; outcome logged as immediate' },
  { id: 'C-03', c: 'A single stray "safe" sensor reading', e: 'The overlay does NOT come down before safeConfirmSeconds' },
];

const GLOSSARY = [
  { t: 'Smombie', d: 'Smartphone zombie — someone walking while staring at their phone. The problem JoanX exists to solve.' },
  { t: 'Grace period', d: '10 seconds to self-correct before any intervention fires (F-07).' },
  { t: 'Buzz hold', d: '2 seconds after the vibration. Stop inside it and no warning ever appears (F-08.1).' },
  { t: 'Tone tier', d: 'The escalating voice of a warning: gentle → firm → urgent. Never a screen block.' },
  { t: 'Immediate / delayed / ignored', d: 'How a risk event ended. Drives both the child’s bonus and the parent’s report — one number, from the sensor to the parent.' },
  { t: 'Stage', d: 'Evolution step 1–3 (Hatchling / Growing / Guardian). Art only — grants no stats.' },
  { t: 'Hidden Epic', d: 'An Epic that does not exist in the UI until unlocked: no slot, no silhouette, not in the completion denominator (F-15.2).' },
  { t: 'Ledger', d: 'ruleId → timesPaid. The guard that stops a grant paying twice.' },
  { t: 'Season', d: 'Content authored ahead and shipped dark (enabled: false) until ops flips a server flag.' },
  { t: 'Variant', d: 'An alternative layout of the same screen, switchable at runtime. Design inventory, not product code.' },
  { t: 'Verdict', d: 'The { ok, reason, need } shape returned by canBuyItem / canConvertPoints.' },
  { t: 'Neon guard', d: 'The s > 0.80 branch in screenBgFor() that pastelises saturated colours instead of lightening them into fluorescent pink.' },
];

/* ── chart primitives ───────────────────────────────────────────────── */

// Vertical bars — one series, so no legend (the title names it). Every bar is
// directly labelled: nine values is few enough that a hover-only reading would be
// hiding the data rather than decluttering it.
function BarsV({ data, xKey, yKey, color, height = 190, fmt = v => v }) {
  const [hov, setHov] = React.useState(null);
  const max = Math.max(...data.map(d => d[yKey]));
  return (
    <div className="doc-chart">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
        {data.map((d, i) => {
          const h = (d[yKey] / max) * (height - 26);
          const on = hov === i;
          return (
            <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'default' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: on ? C.ink : C.ink2, fontVariantNumeric: 'tabular-nums' }}>
                {fmt(d[yKey])}
              </span>
              <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: color,
                opacity: hov == null || on ? 1 : 0.45, transition: 'opacity .12s ease' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
        {data.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, fontWeight: 700,
            color: hov === i ? C.ink : C.ink3 }}>{d[xKey]}</span>
        ))}
      </div>
    </div>
  );
}

// Horizontal bars — the ladder reads top-to-bottom like the ladder is climbed.
// Boss rows carry an icon + a word, never colour alone.
function VillainLadder() {
  const [hov, setHov] = React.useState(null);
  const max = 440;
  return (
    <div className="doc-chart">
      {VILLAINS.map((v, i) => {
        const on = hov === i;
        return (
          <div key={v.name} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
            <span style={{ width: 28, fontSize: 10.5, fontWeight: 800, color: C.ink3, flexShrink: 0 }}>Lv{v.lv}</span>
            <span style={{ width: 58, fontSize: 12.5, fontWeight: 800, color: C.ink, flexShrink: 0 }}>{v.name}</span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ height: 14, width: `${(v.power / max) * 100}%`, borderRadius: '0 4px 4px 0',
                background: C.bad, opacity: hov == null || on ? 1 : 0.4, transition: 'opacity .12s ease' }} />
              <span style={{ fontSize: 11, fontWeight: 800, color: C.ink2, fontVariantNumeric: 'tabular-nums' }}>{v.power}</span>
              {v.role && (
                <span className="doc-pill" style={{ background: '#fdf3dd', color: '#9a6a08', whiteSpace: 'nowrap' }}>
                  <Icon name={v.role === 'Final boss' ? 'flame' : 'crown'} size={10} color="#9a6a08" stroke={2.6}
                    style={{ verticalAlign: -1, marginRight: 3 }} />{v.role}
                </span>
              )}
            </div>
            <span style={{ flex: '0 0 45%', fontSize: 11.5, color: on ? C.ink2 : C.ink3, minWidth: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.risk}</span>
          </div>
        );
      })}
    </div>
  );
}

// Stacked bars — 3 series, so a legend is mandatory, and gold↔rust need the second
// cue: 2px surface gaps between segments plus the legend labels.
function ReactionChart() {
  const [hov, setHov] = React.useState(null);
  const max = Math.max(...REACTIONS.map(r => r.immediate + r.delayed + r.ignored));
  const H = 150;
  const series = [
    { k: 'immediate', label: 'Immediate stop', c: C.good },
    { k: 'delayed', label: 'Delayed', c: C.warn },
    { k: 'ignored', label: 'Ignored', c: C.bad },
  ];
  return (
    <div className="doc-chart">
      <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
        {series.map(s => (
          <span key={s.k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: C.ink2 }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: s.c, display: 'inline-block' }} />{s.label}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: H }}>
        {REACTIONS.map((r, i) => {
          const on = hov === i;
          return (
            <div key={r.d} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2,
                opacity: hov == null || on ? 1 : 0.45, transition: 'opacity .12s ease' }}>
              {[...series].reverse().map(s => r[s.k] > 0 && (
                <div key={s.k} title={`${s.label}: ${r[s.k]}`}
                  style={{ height: (r[s.k] / max) * (H - 20), background: s.c, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, color: '#fff' }}>
                  {r[s.k] >= 2 ? r[s.k] : ''}
                </div>
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 10, borderTop: `1px solid ${C.line}`, paddingTop: 6, marginTop: 4 }}>
        {REACTIONS.map((r, i) => (
          <span key={r.d} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, fontWeight: 700,
            color: hov === i ? C.ink : C.ink3 }}>{r.d}</span>
        ))}
      </div>
    </div>
  );
}

// Buddy power against the villain ladder. ONE measure (effective power) across six
// ordered cases, so one hue and no legend — identity lives on the axis. The villain
// thresholds are reference lines, not a second series.
function PowerChart() {
  const [hov, setHov] = React.useState(null);
  const H = 210, MAX = 480;
  return (
    <div className="doc-chart" style={{ position: 'relative' }}>
      <div style={{ position: 'relative', height: H, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {/* villain reference lines */}
        {/* Reference lines sit BEHIND the bars, but their labels must sit above them —
            otherwise the tallest bar swallows the two lower labels. Hence z-index 2 on the
            label and a surface background so it stays legible wherever it lands. */}
        {THRESHOLDS.map(t => (
          <div key={t.k} style={{ position: 'absolute', left: 0, right: 0, bottom: (t.v / MAX) * (H - 20), pointerEvents: 'none', zIndex: 2 }}>
            <div style={{ borderTop: `1.5px dashed ${t.c}`, opacity: .6 }} />
            <span style={{ position: 'absolute', left: 0, top: -8, fontSize: 10, fontWeight: 800, color: t.c,
              background: '#fff', padding: '1px 5px', borderRadius: 5, border: `1px solid ${C.line}`, whiteSpace: 'nowrap' }}>
              {t.k} · {t.v}
            </span>
          </div>
        ))}
        {POWER.map((p, i) => {
          const on = hov === i;
          const beatsNox = p.v >= 440;
          return (
            <div key={p.k} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: on ? C.ink : C.ink2, fontVariantNumeric: 'tabular-nums' }}>{p.v}</span>
              <div style={{ width: '100%', height: (p.v / MAX) * (H - 20), borderRadius: '4px 4px 0 0',
                background: beatsNox ? C.good : C.ocean, opacity: hov == null || on ? 1 : 0.45, transition: 'opacity .12s ease' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 8, borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
        {POWER.map((p, i) => (
          <span key={p.k} style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, lineHeight: 1.3,
            color: hov === i ? C.ink : C.ink3 }}>{p.k}</span>
        ))}
      </div>
    </div>
  );
}

// Egg odds — 100% stacked, one bar per egg. Three series → a legend is mandatory, and
// each segment carries its own number, so identity is never colour alone.
function EggOdds() {
  const tiers = ['Common', 'Rare', 'Epic'];
  return (
    <div className="doc-chart">
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        {tiers.map(t => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, fontWeight: 700, color: C.ink2 }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: RARITY_C[t], display: 'inline-block' }} />{t}
          </span>
        ))}
      </div>
      {EGG_ODDS.map(e => (
        <div key={e.egg} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
            <b style={{ fontSize: 12.5, color: C.ink }}>{e.egg}</b>
            <span style={{ fontSize: 11.5, color: C.ink2 }}>{e.price}</span>
            {e.gate !== '—' && <span className="doc-pill" style={{ background: '#ecf3fe', color: '#2b5782' }}>{e.gate}</span>}
          </div>
          <div style={{ display: 'flex', gap: 2, height: 22 }}>
            {e.odds.map((pct, i) => pct > 0 && (
              <div key={i} style={{ flex: pct, background: RARITY_C[tiers[i]], borderRadius: 4, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800, color: '#fff' }}>
                {pct}%
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── diagram primitives (not charts — structure, not magnitude) ─────── */

function Node({ children, tone = 'plain', wide }) {
  const tones = {
    plain:  { bg: '#fff',    bd: C.line,    fg: C.ink },
    hub:    { bg: '#e9f1e9', bd: '#4b814f', fg: '#2f5c33' },
    danger: { bg: '#fdecec', bd: '#e8b4ae', fg: '#9e3225' },
    ocean:  { bg: '#ecf3fe', bd: '#b9d2ee', fg: '#2b5782' },
    gold:   { bg: '#fdf3dd', bd: '#e8d296', fg: '#9a6a08' },
    ghost:  { bg: C.surf,    bd: C.line,    fg: C.ink3 },
  }[tone];
  return (
    <div style={{ background: tones.bg, border: `1.5px solid ${tones.bd}`, color: tones.fg,
      borderRadius: 12, padding: '9px 12px', fontSize: 12.5, fontWeight: 700, textAlign: 'center',
      minWidth: wide ? 0 : 96, flex: wide ? 1 : undefined }}>
      {children}
    </div>
  );
}
const Arrow = ({ dir = 'right', label }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: C.ink3, flexShrink: 0 }}>
    <Icon name={dir === 'down' ? 'arrow-down' : 'arrow-right'} size={16} color={C.ink3} stroke={2.4} />
    {label && <span style={{ fontSize: 9.5, fontWeight: 700 }}>{label}</span>}
  </div>
);
const Flow = ({ children, wrap }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: wrap ? 'wrap' : 'nowrap',
    padding: '14px 12px', background: C.surf, borderRadius: 16, border: `1px solid ${C.line}`, overflowX: 'auto' }}>
    {children}
  </div>
);

/* ── content ────────────────────────────────────────────────────────── */

const STATS = [
  { n: '2', l: 'Apps · child & parent', c: C.ocean },
  { n: '45', l: 'Screen files', c: C.good },
  { n: '38/38', l: 'In-scope specs built', c: C.good },
  { n: '10', l: 'Villains (IP line)', c: C.bad },
  { n: '15', l: 'Characters · 8·5·2', c: C.iris },
  { n: '1,201', l: 'Korean strings', c: C.warn },
];

const TRUTH = [
  { ok: true,  t: 'A spec-complete front-end prototype', s: 'All 38 in-scope requirements of the 2026-06-18 functional spec are designed and built, across both apps. The Spec checklist tab is the per-requirement audit.' },
  { ok: false, t: 'No backend, database or API', s: 'Zero fetch / axios / WebSocket calls exist anywhere in src/. Every "server" value is a mock object in core/data.jsx — whose very first line says so.' },
  { ok: false, t: 'No tests, no CI, no TypeScript, no persistence', s: 'A page reload resets every point, level and battle. This is the honest distance between the prototype and a production build.' },
  { ok: true,  t: 'But the server seam is already written', s: 'Every economy value is a settings object with a validating setter — setXpCurve, setStages, setStatGrowth, setExchange — each falling back to the launch default, field by field, on a malformed payload. When the backend arrives it calls those four functions.' },
];

const FEATURES = [
  { id: 'F-07 · F-08 · F-09', t: 'Staged intervention', screens: ['WarningOverlay.jsx'],
    p: 'Get a child’s eyes up without seizing their phone.',
    d: 'A state machine, every timing from INTERVENTION: 10s grace → one buzz → 2s hold → warning card → buddy message → 5s cooldown → a firmer round. The tone escalates gentle → firm → urgent and caps at 3 rounds. Stopping fast pays +20; every outcome is logged as immediate / delayed / ignored, which is exactly what the parent report is built from.',
    e: 'The buzz stage deliberately has NO button — in the real product there is nothing to press, the phone just vibrates and detection notices you stopped.' },
  { id: 'F-13 · A-1.1 · A-1.2', t: 'Points & the exchange', screens: ['Rewards.jsx', 'Shop.jsx'],
    p: 'Turn safe behaviour into the only currency in the game.',
    d: '10 points per phone-free minute · +20 for stopping immediately · +100 for an accident-free day · +300 at a 7-day streak · a Special Egg at 30 days. Points convert to EXP at 5:1, minimum 10 EXP.',
    e: 'The conversion refuses to overshoot the level cap, so no point is ever spent on EXP with nowhere to land — and a server sending pointsPerXp: 0 is rejected, because it would divide by zero and hand out infinite levels.' },
  { id: 'F-16 · A-3.1–3.3', t: 'Growth & evolution', screens: ['CharacterVariants.jsx', 'CharacterDex.jsx'],
    p: 'Give the child something they are attached to, that visibly grows.',
    d: 'A 9-step EXP ladder to a Lv.10 cap, three stages (Hatchling · Growing · Guardian), and four battle stats derived on read from rarity + level.',
    e: 'Evolution is AUTOMATIC and grants NO stats. A manual button would let a Lv.8 buddy sit un-evolved because the child never opened the screen; a stat bonus would turn a reward into an obligation.' },
  { id: 'F-15 · A-2 · A-4.1', t: 'Eggs, rarity & the anti-gacha valve', screens: ['Shop.jsx', 'EggHatch.jsx'],
    p: 'Make acquisition exciting without making it exploitative.',
    d: 'Common 500pt (odds 8/2/0) · Rare 1,500pt at Lv.5+ (3/6/0) · Epic reward-only (0/4/6). Hatching rolls the TIER first, then picks a character from it with unowned weighted 3×. Duplicates convert to EXP (30/60/120).',
    e: 'Guaranteed unlocks sit beside the gacha: a 7-day streak, 100 safe km, a 30-day streak, or a 50% drop in phone use hand over characters outright — two of them Epics. A child who never spends a single point can still reach the rarest buddies.' },
  { id: 'F-19 · A-8 · A-9', t: 'Villains & the ending', screens: ['Battle.jsx', 'VillainDex.jsx'],
    p: 'Give the danger a face a child can beat.',
    d: 'Ten original IP characters, each personifying a real road risk. Sequential unlock, 5 challenges a day, power rising 60 → 440. Outcome is computed from accumulated growth, never from reflexes: win = power(buddy) + 30 ≥ villain.power.',
    e: 'First clear 120pt/60xp · repeat 40pt/20xp (strictly lower, so re-fighting is for records, not farming) · beating Nox pays 500pt/200xp + an Epic Egg and unlocks the ending.' },
  { id: 'F-32 · A-10', t: 'Friends, houses & guestbook', screens: ['Friends.jsx', 'FriendHouse.jsx', 'Guestbook.jsx'],
    p: 'Let children show off without exposing them to each other.',
    d: 'Visit-only: see a friend’s featured buddy, browse their rooms, leave a like, sign the guestbook.',
    e: 'The guestbook is SIX FIXED STAMPS and no free text, anywhere. A free text box between two children is an unmoderated message channel — the single most important safety decision in the social feature.' },
  { id: 'F-20 · F-22 · F-31', t: 'Parent reporting & control', screens: ['ParentReports.jsx', 'ParentAIReport.jsx', 'ParentSettings.jsx'],
    p: 'Prove to the buyer that the behaviour is actually changing.',
    d: 'Acceptance rate, safe-walk minutes, average response time and streak — each with a delta against the previous period — plus a 7-day reaction chart and an AI-written narrative. The parent tunes sensitivity, notifications, blocked app categories, and whether the game runs at all.',
    e: 'It leads with a risk-REDUCTION rate, not an incident count and not a location pin.' },
];

const RULES = [
  { t: 'A stage grants no stats', s: 'Stated twice in data.jsx so nobody "helpfully" adds a stage multiplier later. If evolving made you stronger, a child who cannot evolve yet would be punished for it.' },
  { t: 'Repeat battles pay strictly less than a first clear', s: '40/20 against 120/60. Re-fighting exists for records and practice, never for farming.' },
  { t: 'Every decoration is buyable with points', s: 'A null price would mean "unobtainable by saving", which the spec forbids. 0 means granted; null means not-for-sale — and no decoration is null.' },
  { t: 'Only an Epic Egg can hatch an Epic', s: 'That is the entire mechanism keeping the two hidden characters genuinely rare.' },
  { t: 'Hidden Epics are invisible everywhere', s: 'No dex slot, no silhouette, no "???" placeholder, and not in the completion denominator — any of those would leak that they exist.' },
  { t: 'The final boss is a ROLE, not a row position', s: 'The old code asked "is this the last villain?". Appending a seasonal villain after Nox would have silently promoted it to final boss and moved the ending. Now the ladder asks the role.' },
  { t: 'A grant can never pay twice', s: 'Three ledgers map ruleId → timesPaid. isOwed() returns a COUNT, not a boolean — so a child who walks 80km before the next check is owed all three 25km eggs at once, while a one-shot rule settles forever the moment it is paid.' },
  { t: 'Points leave the wallet only if the EXP lands', s: 'The verdict is computed first; the wallet is debited only on ok.' },
];

const ARCH = [
  { t: 'No router. No state library.', s: 'Navigation is a screen string plus a hand-rolled stack (nav / back / tabTo). State is useState plus mutable module objects. Adding React Router and Redux would have bought this prototype nothing.' },
  { t: 'core/data.jsx is the hub — and depends on nothing', s: 'The entire model AND every rule live in one ~1,500-line module that imports no screen. It sits at the bottom of the dependency graph. That is what makes a balance change a one-file edit, and what stops a screen inventing its own rule.' },
  { t: 'Screens mutate the model directly', s: 'React is not the source of truth — the data module is. buyItem() debits PLAYER.points and the screen calls setState to re-render. Correct for a prototype; the first thing to replace in production.' },
  { t: 'Inline styles over a THEME token object', s: 'No Tailwind, no CSS-in-JS. Three CSS layers: tripme-tokens → color-system → joanx (fonts, backdrop, and every jx-* animation).' },
  { t: 'The variant galleries are design inventory, not product code', s: '38 battle layouts, 35 friends layouts, 25 add-friend layouts, 20 collection layouts — built so a client can choose a direction live, in the real app, instead of in a slide deck. They are most of the bundle, and they get deleted the moment a direction is signed off.' },
  { t: 'Spec IDs are cited at the rule they implement', s: 'F-16 and A-3.1 appear in comments beside the code enforcing them. That is what makes the Spec checklist an audit rather than an aspiration.' },
];

const QUALITY = [
  { t: 'Testing', v: 'None', bad: true, s: 'No runner, no CI. The domain logic is unusually testable — pure functions over plain objects in one file — so the first tests should be XP overflow, the ledger never double-paying, hatch odds over 10k rolls, and every canBuyItem verdict.' },
  { t: 'Accessibility', v: 'Partial', bad: true, s: 'prefers-reduced-motion is respected, actions are real <button>s, and focus is not suppressed. But most icon-only buttons are unlabelled and the warning overlay announces nothing to a screen reader — unacceptable in a safety feature, and the top of the a11y backlog.' },
  { t: 'Performance', v: 'Unoptimised, knowingly', bad: true, s: 'One bundle, no code splitting, no memoisation. Vite warns it exceeds 500kB — almost entirely the variant galleries. Pruning them is the single biggest win available.' },
  { t: 'Security', v: 'Not applicable yet', bad: true, s: 'Any 6-digit SMS code passes. Role is a React state string. There is nothing to secure because there is no server — but a production build needs a server-authoritative economy, since today a client mutation could grant infinite points.' },
  { t: 'Localization', v: 'Complete', bad: false, s: 'English + Korean, 1,201 keys, English source strings as the keys so a missing translation falls back to readable English rather than a blank or a token. The app boots in Korean.' },
  { t: 'Design system', v: 'Documented', bad: false, s: 'Tokens, primitives, motion and mascots all live in the Design system tab, with a written handoff spec in DESIGN-SYSTEM.md.' },
];

const NAV = [
  { id: 'summary',   label: 'Summary',         icon: 'book-open' },
  { id: 'truth',     label: 'Read this first', icon: 'alert-circle' },
  { id: 'users',     label: 'Users & privacy', icon: 'users' },
  { id: 'flow',      label: 'User flow',       icon: 'route' },
  { id: 'ia',        label: 'Screen map',      icon: 'layout-grid' },
  { id: 'features',  label: 'Features',        icon: 'layers' },
  { id: 'economy',   label: 'The economy',     icon: 'coins' },
  { id: 'safestop',  label: 'Safe-stop reward', icon: 'hand' },
  { id: 'eggs',      label: 'Eggs & rarity',   icon: 'egg' },
  { id: 'villains',  label: 'Villain ladder',  icon: 'skull' },
  { id: 'balance',   label: 'Balance analysis', icon: 'scale-3d' },
  { id: 'rules',     label: 'Business rules',  icon: 'scale' },
  { id: 'engine',    label: 'Reward engine',   icon: 'git-merge' },
  { id: 'badges',    label: 'Badges & goals',  icon: 'trophy' },
  { id: 'parent',    label: 'Parent report',   icon: 'line-chart' },
  { id: 'arch',      label: 'Architecture',    icon: 'git-branch' },
  { id: 'adr',       label: 'Decisions (ADR)', icon: 'gavel' },
  { id: 'quality',   label: 'Quality & gaps',  icon: 'shield-check' },
  { id: 'risks',     label: 'Risk register',   icon: 'alert-triangle' },
  { id: 'testing',   label: 'Test matrix',     icon: 'flask-conical' },
  { id: 'onboard',   label: 'Day 1 onboarding', icon: 'graduation-cap' },
  { id: 'glossary',  label: 'Glossary',        icon: 'book-marked' },
  { id: 'roadmap',   label: 'Roadmap',         icon: 'flag' },
];

/* ── page ───────────────────────────────────────────────────────────── */

const DOC_CSS = `
  .doc-root { width: 100%; max-width: 1240px; display: flex; gap: 28px; align-items: flex-start; }
  .doc-nav { position: sticky; top: 84px; width: 212px; flex-shrink: 0; background: #fff; border-radius: 22px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 14px 10px; max-height: calc(100vh - 108px); overflow-y: auto; }
  .doc-nav-title { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #b0adab; padding: 4px 12px 10px; }
  .doc-nav button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: none; font-family: inherit; font-size: 13px; font-weight: 700; color: #585450; padding: 8px 12px; border-radius: 12px; cursor: pointer; text-align: left; }
  .doc-nav button:hover { background: #f8f7f7; }
  .doc-nav button.on { background: #ecf3fe; color: #2b5782; }
  .doc-main { flex: 1; min-width: 0; background: #fff; border-radius: 26px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 34px 38px 60px; }
  .doc-hero { border-bottom: 1px solid #ebebea; padding-bottom: 24px; }
  .doc-hero h1 { margin: 0 0 8px; font-size: 31px; font-weight: 800; letter-spacing: -0.5px; color: #2b2926; }
  .doc-hero p { margin: 0 0 10px; color: #585450; font-size: 14.5px; line-height: 1.65; }
  .doc-file { display: inline-flex; align-items: center; gap: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; color: #2b5782; background: #ecf3fe; border-radius: 8px; padding: 5px 10px; }
  .doc-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
  .doc-stat { flex: 1; min-width: 108px; border: 1px solid #ebebea; border-radius: 16px; padding: 12px 14px; }
  .doc-stat b { display: block; font-size: 21px; font-weight: 800; letter-spacing: -.4px; font-variant-numeric: tabular-nums; }
  .doc-stat span { font-size: 11.5px; font-weight: 700; color: #77736e; }
  .doc-section { padding: 30px 0 12px; border-bottom: 1px solid #f0efee; scroll-margin-top: 84px; }
  .doc-section:last-child { border-bottom: none; }
  .doc-h2 { font-size: 20px; font-weight: 800; letter-spacing: -0.3px; color: #2b2926; margin: 0 0 4px; }
  .doc-lead { color: #585450; font-size: 13.5px; margin: 0 0 16px; line-height: 1.65; }
  .doc-h3 { font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #b0adab; margin: 22px 0 10px; }
  .doc-row { display: flex; gap: 12px; padding: 13px 14px; border: 1px solid #ebebea; border-radius: 16px; margin-bottom: 10px; }
  .doc-row-head { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .doc-id { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11.5px; font-weight: 700; color: #2b5782; background: #ecf3fe; border-radius: 7px; padding: 2px 7px; }
  .doc-title { font-size: 14px; font-weight: 800; color: #2b2926; }
  .doc-purpose { margin: 5px 0 0; font-size: 12.5px; font-weight: 700; color: #2f7a4f; }
  .doc-note { margin: 6px 0 0; font-size: 12.5px; line-height: 1.65; color: #77736e; }
  .doc-why { margin: 8px 0 0; padding: 8px 11px; background: #fbfaf9; border-left: 3px solid #ebebea; border-radius: 0 8px 8px 0; font-size: 12.5px; line-height: 1.6; color: #585450; }
  .doc-why b { color: #2b2926; }
  .doc-screens { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }
  .doc-screens code, .doc-note code, .doc-lead code, .doc-table code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: #585450; background: #f8f7f7; border: 1px solid #ebebea; border-radius: 6px; padding: 1px 6px; }
  .doc-num { width: 26px; height: 26px; flex-shrink: 0; border-radius: 999px; background: #2b2926; color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
  .doc-chart { border: 1px solid #ebebea; border-radius: 18px; padding: 18px 18px 12px; margin: 4px 0 14px; }
  .doc-cap { font-size: 12px; color: #77736e; line-height: 1.6; margin: 0 0 16px; }
  .doc-table-wrap { overflow-x: auto; margin: 4px 0 16px; }
  .doc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .doc-table th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #77736e; padding: 8px 12px; border-bottom: 1.5px solid #ebebea; white-space: nowrap; }
  .doc-table td { padding: 9px 12px; border-bottom: 1px solid #f3f2f1; color: #3f3c39; vertical-align: top; }
  .doc-pill { display: inline-block; font-size: 10.5px; font-weight: 800; padding: 2px 8px; border-radius: 999px; }
  .doc-grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  @media (max-width: 900px) {
    .doc-root { flex-direction: column; }
    .doc-nav { position: static; width: 100%; max-height: none; display: flex; flex-wrap: wrap; gap: 2px; }
    .doc-nav button { width: auto; }
    .doc-nav-title { width: 100%; }
    .doc-grid2 { grid-template-columns: minmax(0, 1fr); }
  }
`;

function ProjectDocs() {
  const [active, setActive] = React.useState('summary');
  const refs = React.useRef({});

  React.useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-80px 0px -60% 0px' },
    );
    Object.values(refs.current).forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (id) => refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const set = (id) => (el) => { refs.current[id] = el; };
  const covTotal = COVERAGE.reduce((a, b) => a + b.n, 0);

  return (
    <div className="doc-root">
      <style>{DOC_CSS}</style>

      <nav className="doc-nav">
        <div className="doc-nav-title">Documentation</div>
        {NAV.map(n => (
          <button key={n.id} className={active === n.id ? 'on' : ''} onClick={() => go(n.id)}>
            <Icon name={n.icon} size={15} color={active === n.id ? '#2b5782' : '#b0adab'} stroke={2.2} />
            {n.label}
          </button>
        ))}
      </nav>

      <main className="doc-main">
        {/* ── SUMMARY ── */}
        <section id="summary" ref={set('summary')} className="doc-hero">
          <h1>JoanX — project documentation</h1>
          <p><b style={{ color: C.ink, fontSize: 15.5 }}>JoanX is a two-sided mobile product that stops children using their phone while walking. The child gets a game. The parent gets proof it is working.</b></p>
          <p>
            A safety app a child deletes is worth nothing. Every existing answer to this problem is
            punitive — block the phone, lock the screen, track the child — and children route around
            them or resent them. JoanX makes <b>looking up the thing that wins the game</b>: the phone
            is never seized, it buzzes; stopping quickly is what pays points; and points are what grow
            the character the child is attached to.
          </p>
          <span className="doc-file">
            <Icon name="file-text" size={13} color="#2b5782" stroke={2.2} />
            PROJECT_DOCUMENTATION.md — the full 25-section written version, at the repo root
          </span>
          <div className="doc-stats">
            {STATS.map(s => (
              <div key={s.l} className="doc-stat">
                <b style={{ color: s.c }}>{s.n}</b>
                <span>{s.l}</span>
              </div>
            ))}
          </div>

          <div className="doc-h3">Spec coverage · {covTotal} requirements audited</div>
          <div style={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', gap: 2, marginBottom: 10 }}>
            {COVERAGE.map(c => (
              <div key={c.k} style={{ flex: c.n, background: c.c, borderRadius: 3 }} title={`${c.k}: ${c.n}`} />
            ))}
          </div>
          {COVERAGE.map(c => (
            <div key={c.k} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '3px 0' }}>
              <i style={{ width: 9, height: 9, borderRadius: 3, background: c.c, flexShrink: 0 }} />
              <b style={{ fontSize: 12.5, color: C.ink, minWidth: 22, fontVariantNumeric: 'tabular-nums' }}>{c.n}</b>
              <b style={{ fontSize: 12.5, color: C.ink }}>{c.k}</b>
              <span style={{ fontSize: 12, color: C.ink3 }}>— {c.s}</span>
            </div>
          ))}
        </section>

        {/* ── READ THIS FIRST ── */}
        <section id="truth" ref={set('truth')} className="doc-section">
          <h2 className="doc-h2">Read this first</h2>
          <p className="doc-lead">
            The most important fact about this repository, stated plainly so that nobody discovers it
            the hard way on day two.
          </p>
          {TRUTH.map(t => (
            <div key={t.t} className="doc-row">
              <Icon name={t.ok ? 'circle-check' : 'circle-slash'} size={18} color={t.ok ? C.good : C.bad} stroke={2.3}
                style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{t.t}</div>
                <p className="doc-note">{t.s}</p>
              </div>
            </div>
          ))}
          <div className="doc-why">
            <b>This is a product decision, not an omission.</b> The deliverable was a spec-complete,
            reviewable prototype — a backend would have bought that goal nothing. What was built
            instead is the <i>seam</i> a backend plugs into, and it is already validated.
          </div>
        </section>

        {/* ── USERS ── */}
        <section id="users" ref={set('users')} className="doc-section">
          <h2 className="doc-h2">Users, roles & the privacy promise</h2>
          <p className="doc-lead">
            Two runtime roles — and they are <i>device</i> roles, not accounts. There is no admin role
            anywhere in the product: operational control is <b>data</b> (<code>enabled</code> flags and
            server settings), never a screen.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Role</th><th>Who</th><th>What they want</th><th>Account?</th></tr></thead>
              <tbody>
                <tr><td><b>Child</b></td><td>Roughly 6–13</td><td>A game they would choose to play — not to be policed</td><td><b>None.</b> Pairs to a parent with a 6-digit code</td></tr>
                <tr><td><b>Parent</b></td><td>The account holder, and the buyer</td><td>Evidence their child is safer, without spying on them</td><td>Phone + SMS. Google on Android, Apple on iOS</td></tr>
                <tr><td><b>Joan Company</b></td><td>Client · IP owner</td><td>An approvable spec and an original character line</td><td>Approves villain names, stories and art</td></tr>
              </tbody>
            </table>
          </div>

          <div className="doc-h3">What a parent can and cannot see</div>
          <p className="doc-lead" style={{ marginBottom: 12 }}>
            The product's central promise. The child app shows the child this same list — so the
            contract is honest in both directions, and the child has a reason to trust the app rather
            than uninstall it.
          </p>
          <div className="doc-grid2">
            <div>
              {['Walking time and safe minutes', 'Warnings, and how the child responded', 'Points and streak', 'Which app types are blocked'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                  <Icon name="eye" size={15} color={C.good} stroke={2.3} />
                  <span style={{ fontSize: 12.5, color: C.ink2, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
            <div>
              {['Location — the whole GPS family is flagged off', 'Messages and guestbook', 'Photos'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0' }}>
                  <Icon name="eye-off" size={15} color={C.bad} stroke={2.3} />
                  <span style={{ fontSize: 12.5, color: C.ink, fontWeight: 700 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="doc-why">
            Unlinking is deliberately <b>parent-only</b>. A child who could quietly disconnect would
            make the product a promise the parent cannot rely on.
          </div>
        </section>

        {/* ── FLOW ── */}
        <section id="flow" ref={set('flow')} className="doc-section">
          <h2 className="doc-h2">The complete user flow</h2>
          <p className="doc-lead">Parent first — the child device never holds an account of its own.</p>

          <div className="doc-h3">Onboarding · parent → child</div>
          <Flow wrap>
            <Node tone="ocean">Phone number</Node><Arrow />
            <Node tone="ocean">6-digit SMS</Node><Arrow />
            <Node tone="ocean">Profile</Node><Arrow />
            <Node tone="ocean">Add child</Node><Arrow label="pair" />
            <Node tone="hub">Child enters code</Node><Arrow />
            <Node tone="hub">Permissions</Node><Arrow />
            <Node tone="gold">First egg</Node>
          </Flow>
          <p className="doc-cap">
            Permissions are staged one at a time (motion → usage → overlay → notifications), each with
            a plain-language reason. Denying one does not dead-end: it offers <b>limited protection</b>.
            And the first egg hatches <i>before</i> the first walk — the reward loop starts immediately.
          </p>

          <div className="doc-h3">The core loop</div>
          <Flow wrap>
            <Node tone="hub">Walk, phone away</Node><Arrow label="10/min" />
            <Node tone="gold">Points</Node><Arrow />
            <Node tone="plain">Eggs · EXP · items</Node><Arrow />
            <Node tone="plain">Buddy levels & evolves</Node><Arrow />
            <Node tone="danger">Beat the next villain</Node><Arrow label="loops" />
            <Node tone="hub">Walk again</Node>
          </Flow>

          <div className="doc-h3">A risky moment · the intervention state machine</div>
          <Flow wrap>
            <Node tone="ghost">Risk detected</Node><Arrow label="10s" />
            <Node tone="plain">Grace</Node><Arrow label="2s hold" />
            <Node tone="gold">One buzz</Node><Arrow label="5s" />
            <Node tone="danger">Warning card</Node><Arrow />
            <Node tone="danger">Buddy message</Node><Arrow label="5s cooldown" />
            <Node tone="ghost">Re-assess · firmer</Node>
          </Flow>
          <p className="doc-cap">
            Leaving the machine at <i>any</i> point by looking up logs an outcome —{' '}
            <b style={{ color: C.good }}>immediate</b> (a bonus), <b style={{ color: C.warn }}>delayed</b>,
            or <b style={{ color: C.bad }}>ignored</b> — and those three words are literally what the
            parent report is made of. The tone escalates gentle → firm → urgent, capped at 3 rounds.
            A one-second safe-confirm hold stops sensor flutter flickering the overlay off and back on.
          </p>
        </section>

        {/* ── SCREEN MAP ── */}
        <section id="ia" ref={set('ia')} className="doc-section">
          <h2 className="doc-h2">Screen map</h2>
          <p className="doc-lead">
            45 screen files. No router: navigation is a screen string plus a hand-rolled stack, and
            sub-screens highlight the tab they belong to (the Villain dex lights up <i>Collection</i>).
          </p>
          <div className="doc-grid2">
            <div>
              <div className="doc-h3" style={{ marginTop: 0 }}>Child app · 33 files</div>
              {[
                ['Home', 'ChildHome · HomeVariants · HomeVariantsSimple · SafetyStatus'],
                ['Collection', 'Collection · CharacterDetail · CharacterDex · VillainDex · DexHeaders'],
                ['Battle', 'Battle · BattleVariants · BattleVersus'],
                ['Friends', 'Friends · AddFriends · FriendHouse · Guestbook'],
                ['Profile', 'Profile · MyHouse · DecorateRoom · HelpSupport · AboutJoanX'],
                ['Overlays', 'WarningOverlay · LiteBlock · EggHatch · Onboarding · Shop · Rewards · Notifications'],
              ].map(([tab, files]) => (
                <div key={tab} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{tab}</div>
                  <div style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.5 }}>{files}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="doc-h3" style={{ marginTop: 0 }}>Parent app · 13 files</div>
              {[
                ['Reports', 'ParentReports · ParentAIReport'],
                ['Children', 'ParentChildren · ParentSettings · ParentSchedule'],
                ['Connect', 'ParentAddChild'],
                ['Activity', 'ParentActivity'],
                ['Account', 'ParentAccount · ParentDetail'],
                ['Onboarding', 'ParentOnboarding · HowItWorks'],
              ].map(([tab, files]) => (
                <div key={tab} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{tab}</div>
                  <div style={{ fontSize: 11.5, color: C.ink3, lineHeight: 1.5 }}>{files}</div>
                </div>
              ))}
              <div className="doc-h3">Deep links</div>
              <div style={{ fontSize: 11.5, color: C.ink2, lineHeight: 1.9 }}>
                <code>?view=design</code> · <code>?view=checklist</code> · <code>?view=docs</code><br />
                <code>?detail=char-showcase</code> · <code>?home=simple-focus</code>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" ref={set('features')} className="doc-section">
          <h2 className="doc-h2">Features</h2>
          <p className="doc-lead">
            Each traced to the functional-spec IDs it implements. Green line = the user problem it
            solves. Grey block = the decision worth defending in a review.
          </p>
          {FEATURES.map(f => (
            <div key={f.id} className="doc-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="doc-row-head">
                  <span className="doc-id">{f.id}</span>
                  <span className="doc-title">{f.t}</span>
                </div>
                <p className="doc-purpose">{f.p}</p>
                <p className="doc-note">{f.d}</p>
                <div className="doc-why">{f.e}</div>
                <div className="doc-screens">{f.screens.map(s => <code key={s}>{s}</code>)}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── ECONOMY ── */}
        <section id="economy" ref={set('economy')} className="doc-section">
          <h2 className="doc-h2">The economy — and why none of it is hard-coded</h2>
          <p className="doc-lead">
            Balancing is business policy, so no economy value is app logic. Each is a settings object
            with a launch default; a setter takes the remote payload, validates it <b>field by field</b>,
            and falls back to the launch default for anything missing or malformed — so a bad server
            response degrades to the shipped economy instead of breaking the game. Retuning never needs
            an app release.
          </p>

          <div className="doc-h3">Where points come from</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <tbody>
                {POINTS_IN.map(p => (
                  <tr key={p.k}>
                    <td>{p.k}</td>
                    <td style={{ width: 130, textAlign: 'right', fontWeight: 800, color: C.warn, fontVariantNumeric: 'tabular-nums' }}>{p.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="doc-cap">
            A session under 60 seconds pays nothing — anti-gaming, so a child cannot pocket points by
            walking three steps. Every one of these values is a server setting.
          </p>

          <div className="doc-h3">EXP required per level · the approved curve</div>
          <BarsV data={XP_STEPS} xKey="lv" yKey="xp" color={C.warn} />
          <p className="doc-cap">
            The step grows from <b>+20</b> early to <b>+80</b> late — which is why this is an authored
            table and not a formula: a linear rule can only draw a straight line, and this curve bends.{' '}
            <b>{XP_TOTAL.toLocaleString()} EXP</b> takes a buddy from Lv.1 to the Lv.10 cap. Bought
            purely with points at 5:1, that is {(XP_TOTAL * 5).toLocaleString()} points —{' '}
            <b>{(XP_TOTAL * 5 / 10).toLocaleString()} minutes ≈ {Math.round(XP_TOTAL * 5 / 10 / 60)} hours
            of phone-free walking</b>. That single number is the pace of the whole game, and it is one
            server setting away from being changed.
          </p>

          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>What</th><th>Launch default</th><th>Server seam</th></tr></thead>
              <tbody>
                {[
                  ['EXP curve', '100 · 120 · 150 · 180 · 220 · 270 · 330 · 400 · 480 → Lv.10 cap', 'setXpCurve()'],
                  ['Growth stages', 'Lv.1–3 Hatchling · Lv.4–7 Growing · Lv.8–10 Guardian', 'setStages()'],
                  ['Stat growth', 'base + perLevel × (level − 1), by rarity. No stage term.', 'setStatGrowth()'],
                  ['Point → EXP', '5 points = 1 EXP · minimum purchase 10 EXP', 'setExchange()'],
                  ['Points earned', '10/min · +20 immediate stop · +100 daily · +300 at 7 days', 'POINTS'],
                  ['Intervention', '10s grace · 2s buzz hold · 5s cooldown · 3 tone tiers', 'INTERVENTION'],
                  ['Battle rewards', '120/60 first · 40/20 repeat · 10 loss · 500/200 + Epic Egg finale', 'BATTLE_REWARDS'],
                  ['Egg odds (C/R/E)', 'Common 8/2/0 · Rare 3/6/0 · Epic 0/4/6', 'EGGS'],
                ].map(([k, v, s]) => (
                  <tr key={k}><td><b>{k}</b></td><td>{v}</td><td><code>{s}</code></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>Seasons work the same way.</b> A villain, egg, item or grant rule with{' '}
            <code>enabled: false</code> is invisible everywhere — the battle ladder, the dex, and even
            the completion denominator. Turning a season on is a server flag, not a release. Three
            winter items and two spring rules already ship dark, waiting for it.
          </div>
        </section>

        {/* ── SAFE-STOP REWARD ── */}
        <section id="safestop" ref={set('safestop')} className="doc-section">
          <h2 className="doc-h2">The safe-stop reward — earned, not tapped</h2>
          <p className="doc-lead">
            The bonus for responding to a warning is the one point award a child could try to game, so
            it is the one with teeth. The rule it replaces paid the moment a button was pressed — which
            let a child <b>dismiss the warning, keep scrolling, and still bank points</b>. Now the tap
            only <i>starts</i> a verification; the points are gated on the whole behaviour the
            intervention exists to produce.
          </p>

          <div className="doc-h3">Four conditions — all must hold</div>
          <div className="doc-grid2">
            {[
              ['shield-alert', 'Warning shown', 'An intervention overlay actually appeared'],
              ['smartphone', 'Phone put away', 'Phone use while walking stopped'],
              ['power', 'Screen off', 'The screen was turned off'],
              ['footprints', 'Walking safely', 'Safe walking continued afterwards'],
            ].map(([ic, t, s]) => (
              <div key={t} className="doc-row" style={{ marginBottom: 0 }}>
                <Icon name={ic} size={17} color={C.good} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ minWidth: 0 }}>
                  <div className="doc-title">{t}</div>
                  <p className="doc-note" style={{ marginTop: 2 }}>{s}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="doc-cap" style={{ marginTop: 14 }}>
            The overlay checks these off one at a time — the points sit on the far side of a full green
            column, so the child can see the reward is earned by putting the phone away and walking on,
            not by the tap that opened the card. A bare <b>“Got it!”</b> acknowledgement sets none of the
            four and pays nothing. In the shipped app the signals come from detection (F-03 / F-08.4); in
            the prototype the verification steps stand in for them, but <code>evaluateSafeStop()</code>{' '}
            already owns the real gating logic.
          </p>

          <div className="doc-h3">Tiered by how early the child corrected</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Outcome</th><th>When</th><th>Pays</th></tr></thead>
              <tbody>
                <tr>
                  <td><b>Immediate</b></td>
                  <td>Looked up in the grace/buzz window — <i>before</i> any warning</td>
                  <td style={{ fontWeight: 800, color: C.good }}>+50 pt</td>
                </tr>
                <tr>
                  <td><b>Delayed</b></td>
                  <td>Stopped only after the warning was shown</td>
                  <td style={{ fontWeight: 800, color: C.warn }}>+20 pt</td>
                </tr>
                <tr>
                  <td><b>Dismissed / ignored</b></td>
                  <td>Acknowledged or ignored, still walking on the phone</td>
                  <td style={{ fontWeight: 700, color: C.ink3 }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="doc-cap">
            Never needing the warning is the behaviour the product is built to produce, so it pays more
            than a stop the warning had to drag out — <code>selfCorrectBonus</code> 50 vs{' '}
            <code>postWarningStopBonus</code> 20. Both are server settings.
          </p>

          <div className="doc-h3">Three layers of farm protection</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Layer</th><th>Guard</th><th>Blocks</th></tr></thead>
              <tbody>
                <tr><td><b>Conditions gate</b></td><td>All four signals must hold</td><td>Tapping a button without actually stopping</td></tr>
                <tr><td><b>Per-stop cooldown</b></td><td><code>60s</code> since the last paid stop</td><td>The trigger → tap → points → trigger loop</td></tr>
                <tr><td><b>Daily ceiling</b></td><td><code>300 pt</code> of bonus per day</td><td>Grinding warnings for points all day long</td></tr>
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>A blocked stop still counts — it just doesn’t pay.</b> Whether the reward lands, is on
            cooldown, or is past the daily cap, the event is logged to the parent report all the same, so
            the safety record is complete even when the wallet stays shut. And the child is told which
            happened (“<i>Already counted</i>”, “<i>Daily reward maxed</i>”) rather than met with a
            silent nothing. Per-minute safe-walking points are <i>not</i> capped — they are rate-limited
            by the clock and cannot be farmed, so only the per-event bonus needs the ceiling.
          </div>

          <div className="doc-h3">Behind the signals — how a real build detects each one</div>
          <p className="doc-lead" style={{ marginBottom: 12 }}>
            The prototype ticks the four boxes on a timer. A shipped build fills them from the <b>same
            detection stack that fires the warning in the first place</b> (F-03 · motion + phone-usage) —
            there is no new sensor subsystem to build; the reward just reads signals the intervention
            already produces. The client streams these signal transitions; it does <b>not</b> decide the
            payout.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Signal</th><th>Android</th><th>iOS</th><th>Confirmed when</th></tr></thead>
              <tbody>
                <tr>
                  <td><b>warned</b></td>
                  <td colSpan={2}>App state — an intervention overlay was shown</td>
                  <td>the run reached the buzz/warning stage</td>
                </tr>
                <tr>
                  <td><b>phoneStopped</b></td>
                  <td><code>UsageStatsManager</code> foreground app + touch/interaction idle</td>
                  <td><code>FamilyControls</code> / <code>DeviceActivity</code>, app <code>resignActive</code></td>
                  <td>no interaction for the hold window</td>
                </tr>
                <tr>
                  <td><b>screenOff</b></td>
                  <td><code>ACTION_SCREEN_OFF</code> · <code>PowerManager.isInteractive()</code></td>
                  <td>device lock · display-off / <code>protectedDataWillBecomeUnavailable</code></td>
                  <td>display state reads off</td>
                </tr>
                <tr>
                  <td><b>stillWalking</b></td>
                  <td><code>ActivityRecognition</code> “walking” · step counter</td>
                  <td><code>CMMotionActivityManager</code> <code>.walking</code> · <code>CMPedometer</code></td>
                  <td>walking class persists past the stop</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>Three rules make it trustworthy:</b>
            <br /><br />
            <b>1 · Debounce, don’t trust a single sample.</b> Accelerometer and usage signals flutter, so
            each condition must <i>hold</i> for <code>safeConfirmSeconds</code> before it counts as met —
            and if the risk returns inside that window the timer resets and the escalation resumes. This
            is why the overlay verifies over a beat rather than reading one instant.
            <br /><br />
            <b>2 · The server owns the decision (RISK-1).</b> The device reports signal transitions; the
            <i>server</i> runs the <code>evaluateSafeStop()</code> logic against a <b>trusted clock</b> and
            owns the ledger — <code>lastAwardAt</code> (the 60s cooldown) and <code>bonusPointsToday</code>{' '}
            (the daily cap). A client clock and a client wallet are both trivially cheatable, so the
            payout, the cooldown and the cap must all be evaluated where the child cannot reach them. The
            prototype runs it client-side purely because there is no backend yet — the function shape
            does not change when it moves.
            <br /><br />
            <b>3 · A missing permission fails closed.</b> If usage-access or motion permission is denied,
            the matching signal can never confirm, so the condition simply never goes green and the bonus
            is not paid — the same conservative default the onboarding’s “limited protection” path takes.
            No permission is ever assumed satisfied.
          </div>
        </section>

        {/* ── EGGS ── */}
        <section id="eggs" ref={set('eggs')} className="doc-section">
          <h2 className="doc-h2">Eggs, rarity & the anti-gacha valve</h2>
          <p className="doc-lead">
            Three eggs, and one rule that matters more than all of them: <b>only the Epic Egg can
            produce an Epic</b> — which is the entire mechanism keeping the two hidden characters rare.
          </p>
          <EggOdds />
          <p className="doc-cap">
            Hatching rolls the <b>tier first</b>, then picks a character from it with unowned weighted
            3×. That ordering is deliberate: if you rolled a <i>character</i> directly, shipping a new
            Common would silently dilute everyone's chance of pulling a Rare. Rolling the tier first
            makes the odds a stable contract, independent of roster size. Duplicates convert to EXP
            (30 / 60 / 120), so a duplicate is never a dead pull.
          </p>
          <div className="doc-h3">The guaranteed unlocks — the ethical guard-rail</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Rule</th><th>Condition</th><th>Grants</th></tr></thead>
              <tbody>
                <tr><td><code>u-streak-7</code></td><td>A 7-day streak</td><td>A random unowned <b>Rare</b></td></tr>
                <tr><td><code>u-km-100</code></td><td>100 safe km</td><td>A random unowned <b>Rare</b></td></tr>
                <tr><td><code>u-streak-30</code></td><td>A 30-day streak</td><td><b>Ember</b> — an Epic, by name</td></tr>
                <tr><td><code>u-phone-drop</code></td><td>A 50% drop in phone use</td><td>A random unowned <b>Epic</b></td></tr>
                <tr><td><code>u-ach-early</code></td><td>The "Early Walker" achievement</td><td>A random unowned <b>Rare</b></td></tr>
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>A child who never spends a single point can still reach the rarest characters.</b> This is
            the guard-rail on a gacha aimed at children, and it is the feature I would defend hardest in
            a review — see the balance analysis below for why it turns out to be load-bearing.
          </div>
        </section>

        {/* ── VILLAINS ── */}
        <section id="villains" ref={set('villains')} className="doc-section">
          <h2 className="doc-h2">The villain ladder</h2>
          <p className="doc-lead">
            Ten original IP characters — <b>not monsters</b>. Each personifies something that actually
            gets a child hurt on the way to school, and each carries the five fields Joan approves as
            one set: name · personality · story · look · battle characteristics.
          </p>
          <VillainLadder />
          <p className="doc-cap">
            Power rises 60 → 440 across a strictly sequential unlock: a villain opens only when the one
            before it is beaten. A battle is decided from accumulated growth, never reflexes —{' '}
            <code>win = power(buddy) + 30 ≥ villain.power</code>, where +30 is the safe-walk bonus.
          </p>
          <div className="doc-why">
            <b>Boss status is a role, not a row position.</b> The original code asked "is this the last
            villain in the array?" — which meant appending a seasonal villain after Nox would silently
            promote it to final boss and move the ending. The ladder now asks the <i>role</i>, and that
            was verified: enabling an 11th villain extends the ladder and leaves the finale with Nox.
          </div>
        </section>

        {/* ── BALANCE ── */}
        <section id="balance" ref={set('balance')} className="doc-section">
          <h2 className="doc-h2">Balance analysis — who can actually beat Nox?</h2>
          <p className="doc-lead">
            A battle is won when <code>power(buddy) + 30 ≥ villain.power</code>. So the difficulty curve
            is not an opinion — it is arithmetic, and it can be checked. These bars are the real
            <code>battlePower()</code> output at neutral traits, plotted against the villains that matter.
          </p>
          <PowerChart />
          <div className="doc-why">
            <b>Finding: the final boss is beatable only by an Epic.</b> A fully-grown <i>Rare</i> reaches
            367 effective power against Nox's 440 — it falls <b>73 short</b>, and no amount of levelling
            closes the gap, because Lv.10 is the cap. Only an Epic (451) clears it.
            <br /><br />
            That makes the guaranteed unlocks <b>load-bearing, not decorative</b>: an Epic comes from the
            Epic Egg (reward-only, never purchasable) or from a 30-day streak / a 50% drop in phone use.
            <b> The ending is therefore gated on sustained real-world behaviour change, not on spending.</b>
            {' '}Whether that is brilliant or too steep is a product decision — but it should be a decision,
            not a surprise, which is why it is written down here.
          </div>
        </section>

        {/* ── RULES ── */}
        <section id="rules" ref={set('rules')} className="doc-section">
          <h2 className="doc-h2">Business rules worth defending</h2>
          <p className="doc-lead">
            The rules that actually constrain the code — and, in a design review, the ones worth
            arguing for rather than quietly dropping.
          </p>
          {RULES.map(r => (
            <div key={r.t} className="doc-row">
              <Icon name="check" size={17} color={C.good} stroke={2.8} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{r.t}</div>
                <p className="doc-note">{r.s}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── REWARD ENGINE ── */}
        <section id="engine" ref={set('engine')} className="doc-section">
          <h2 className="doc-h2">The reward engine</h2>
          <p className="doc-lead">
            The most reusable thing in the codebase. Eggs, characters and items are three different
            rewards — but they share <b>one matcher, one owed-calculation, and one ledger discipline</b>.
            Adding a fourth reward type means adding a table, not a system.
          </p>
          <Flow wrap>
            <Node tone="hub">progress()</Node><Arrow label="context" />
            <Node tone="plain">matchWhen()</Node><Arrow label="matched?" />
            <Node tone="plain">isOwed()</Node><Arrow label="count" />
            <Node tone="gold">award*()</Node><Arrow label="write" />
            <Node tone="ocean">Ledger</Node>
          </Flow>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Step</th><th>What it does</th></tr></thead>
              <tbody>
                <tr><td><code>progress()</code></td><td>Builds one context: safeKm, safeMinutes, streak, level, phoneUseDrop, villainsDefeated — plus one-shot facts like a cleared mission or an achievement.</td></tr>
                <tr><td><code>matchWhen()</code></td><td>An AND across whichever keys a rule declares: a metric threshold, a mission scope, an achievement, an event, a streak, villains defeated, an exact level, or every-N-levels.</td></tr>
                <tr><td><code>isOwed()</code></td><td><b>Returns a count, not a boolean.</b> <code>max(0, due − alreadyPaid)</code>, where a repeatable rule's <i>due</i> is <code>floor(safeKm / 25)</code> or <code>floor(level / 5)</code>.</td></tr>
                <tr><td><code>award*()</code></td><td>Hands over the reward and writes the ledger — the only place the ledger is ever written.</td></tr>
                <tr><td><code>claimRewards()</code></td><td>Runs all three faucets in one call, so a walk that ends can pay an egg, a character AND an item without the caller remembering to ask three systems.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>Why a count and not a boolean?</b> A child who walks 80km before the app next checks is
            owed <i>three</i> 25km eggs, not one — and because the ledger is subtracted, a one-shot rule
            settles forever the moment it is paid, so a milestone cannot re-award on every render.
            That one design choice is what makes the whole engine idempotent.
          </div>
        </section>

        {/* ── BADGES & GOALS ── */}
        <section id="badges" ref={set('badges')} className="doc-section">
          <div className="doc-row-head" style={{ marginBottom: 4 }}>
            <h2 className="doc-h2" style={{ margin: 0 }}>Badges, goals & the daily loop</h2>
            <span className="doc-pill" style={{ background: '#ecf3fe', color: '#2b5782' }}>Partly built · design direction</span>
          </div>
          <p className="doc-lead">
            A badge is the <b>artifact a goal leaves behind</b> — the permanent mark the daily game makes
            on a child who keeps walking safely. It is a presentation layer over <code>ACHIEVEMENTS</code>,
            never a second list: a badge with no achievement behind it cannot exist, which is the point —
            everything on the shelf was <i>earned by doing something</i>, and the reward engine above
            already knows how to pay for it.
          </p>

          <div className="doc-h3">Three horizons — and why they must not blur</div>
          <p className="doc-lead" style={{ marginBottom: 12 }}>
            The child app already rewards on three different clocks. The design mistake to avoid is
            letting them feel like the same thing: missions are <b>renewable</b>, a streak is
            <b> fragile</b>, and a badge is <b>forever</b>.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Layer</th><th>Resets?</th><th>Pays</th><th>The feeling</th></tr></thead>
              <tbody>
                <tr>
                  <td><b>Daily / weekly missions</b><br /><span style={{ fontSize: 11, color: C.ink3 }}>Finish a phone-free walk · reach the safe-walk goal · say hi to your buddy</span></td>
                  <td style={{ color: C.warn, fontWeight: 700 }}>Every day / week</td>
                  <td>Points, then an <b>egg</b> once the whole set is cleared</td>
                  <td><i>the rhythm</i> — come back tomorrow</td>
                </tr>
                <tr>
                  <td><b>Streak</b><br /><span style={{ fontSize: 11, color: C.ink3 }}>Accident-free days in a row</span></td>
                  <td style={{ color: C.bad, fontWeight: 700 }}>Breaks if you slip</td>
                  <td>+300 at 7 days · a guaranteed Rare · an Epic Egg at 30</td>
                  <td><i>consistency</i> — don't break the chain</td>
                </tr>
                <tr>
                  <td><b>Achievements / badges</b><br /><span style={{ fontSize: 11, color: C.ink3 }}>First Steps · Quick Reflex · Zone Dodger · Collector · Early Walker</span></td>
                  <td style={{ color: C.good, fontWeight: 700 }}>Never</td>
                  <td>Points, and sometimes a character or item outright</td>
                  <td><i>the permanent record</i> — firsts & mastery</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="doc-why">
            <b>The daily loop is the engine that fills the trophy case.</b> A child clears "reach your
            safe-walk goal" every single day — and doing it <i>enough times</i> is exactly what completes
            the permanent "Zone Dodger" badge. Missions and achievements don't compete for attention;
            the renewable one quietly advances the terminal one. That single connection is what turns a
            daily chore into progress toward something a child keeps.
          </div>

          <div className="doc-h3">How a walk becomes a badge</div>
          <Flow wrap>
            <Node tone="hub">Safe walk</Node><Arrow label="mission" />
            <Node tone="gold">Daily goal cleared</Node><Arrow label="advances" />
            <Node tone="plain">Badge bar ticks up</Node><Arrow label="hits total" />
            <Node tone="ocean">claimRewards()</Node><Arrow label="pays" />
            <Node tone="plain">Medallion earned</Node>
          </Flow>
          <p className="doc-cap">
            The grant engine already treats an achievement id as a trigger — <code>EGG_GRANTS</code>,{' '}
            <code>CHARACTER_UNLOCKS</code> and <code>ITEM_GRANTS</code> all carry <code>g-ach-*</code>,{' '}
            <code>u-ach-*</code>, <code>i-ach-*</code> rows. Wiring a completed badge to pay out is one
            call, <code>claimRewards({'{'} achievement: id {'}'})</code>, not a new data structure.
          </p>

          <div className="doc-h3">The badge as an object · three tiers</div>
          <p className="doc-lead" style={{ marginBottom: 12 }}>
            Each badge is drawn — an eight-point rosette with the achievement's own icon at the centre,
            keyed to the same <b>Common · Rare · Epic</b> vocabulary a buddy uses, so "Rare" means one
            kind of scarce everywhere. A locked badge is the <i>same silhouette in greyscale</i>, never a
            padlock in a box: a child should see the shape of the thing they haven't got yet — that is
            what makes it worth walking for. No sparkle, no motion on the grid.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>Badge</th><th>Tier</th><th>Earned by</th><th>State</th></tr></thead>
              <tbody>
                {[
                  ['First Steps', 'Common', 'Walk safely for 10 minutes', 'Earned'],
                  ['5-Day Streak', 'Common', 'Be safe 5 days in a row', 'Earned'],
                  ['Quick Reflex', 'Rare', 'Stop within 3s, 10 times', 'Earned'],
                  ['Zone Dodger', 'Common', 'Avoid 5 danger zones', '3 / 5'],
                  ['Collector', 'Epic', 'Own 8 characters', '6 / 8'],
                  ['Early Walker', 'Rare', 'Safe morning commute, 7 days', '4 / 7'],
                ].map(([n, t, by, st]) => (
                  <tr key={n}>
                    <td><b>{n}</b></td>
                    <td><span className="doc-pill" style={{ background: t === 'Epic' ? '#f2ecfb' : t === 'Rare' ? '#ecf3fe' : '#f3f2f1', color: RARITY_C[t] }}>{t}</span></td>
                    <td>{by}</td>
                    <td style={{ color: st.includes('/') ? C.ink3 : C.good, fontWeight: 700 }}>{st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="doc-h3">Built vs. missing — the honest state</div>
          <div className="doc-grid2">
            <div className="doc-row" style={{ marginBottom: 0 }}>
              <Icon name="circle-check" size={18} color={C.good} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">Built</div>
                <p className="doc-note">
                  The achievement → badge model. <code>ACHIEVEMENTS</code> is the single source of truth;{' '}
                  <code>Badges.jsx</code> draws each one as a tiered medallion, greys locked ones into a
                  visible silhouette, sorts earned-first, and the grant engine already accepts an
                  achievement id as a payout trigger.
                </p>
              </div>
            </div>
            <div className="doc-row" style={{ marginBottom: 0 }}>
              <Icon name="circle-slash" size={18} color={C.bad} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">Missing</div>
                <p className="doc-note">
                  No <b>runtime evaluator</b> — every <code>done</code> and every <code>3 / 5</code> is
                  hand-seeded; nothing watches the missions and flips a badge. No <b>showcase</b> outside
                  the one tab, no <b>earn moment</b>, and no repeatable <b>bronze / silver / gold</b> tier.
                </p>
              </div>
            </div>
          </div>

          <div className="doc-h3">Design direction · in dependency order</div>
          <p className="doc-lead" style={{ marginBottom: 12 }}>
            Not four features — one feature (<i>the daily walk leaving a permanent mark</i>) seen from
            four angles. Each step makes the next one land, so the order is the plan.
          </p>
          {[
            { t: 'The wire — a runtime evaluator', s: 'The foundation. A small function reads the same numbers the missions already track (safe minutes, days walked, zones dodged, characters owned) and recomputes each badge’s progress, flipping done when it hits total. After this, clearing today’s goal moves a real bar — the connection between the renewable loop and the permanent record.' },
            { t: 'The moment — an earn / claim beat', s: 'The instant the evaluator completes a badge, the greyed medallion fills with its tier colour and flips, +points. It reuses the celebration language the egg-hatch and daily-claim already speak, so it feels native. Without it, step 1 is an invisible number change.' },
            { t: 'The showcase — a trophy shelf', s: 'A row of the child’s three best medallions on the Profile, and later a shelf object in the decorated room. A badge you can’t display is only half-earned; the room is already the child’s identity space, and a medallion on the wall is the strongest reason to walk safely tomorrow.' },
            { t: 'Tiering last — bronze / silver / gold', s: 'Repeatable, levelling badges (walk 10 / 50 / 100 safe km) that never "finish", giving a committed child an always-next rung. Last because it only makes sense on top of a working evaluator and a satisfying earn moment — then it is a small extension of the same model, not new machinery.' },
          ].map((g, i) => (
            <div key={g.t} className="doc-row">
              <div className="doc-num">{i + 1}</div>
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{g.t}</div>
                <p className="doc-note">{g.s}</p>
              </div>
            </div>
          ))}
          <div className="doc-why">
            <b>One list, one engine — throughout.</b> Every step here is behaviour and display over the
            achievements that already exist, never a parallel "badges" data structure. Building a second
            list would duplicate the model and its payout rules; the reward engine was designed so a new
            earning method is one registry entry plus rules, and this stays inside that discipline.
          </div>
        </section>

        {/* ── PARENT REPORT ── */}
        <section id="parent" ref={set('parent')} className="doc-section">
          <h2 className="doc-h2">What the parent actually sees</h2>
          <p className="doc-lead">
            The dashboard leads with <b>behaviour change</b> — not an incident count, and not a location
            pin. These are the product's own KPIs, and they are the reason a parent renews.
          </p>
          <div className="doc-stats" style={{ marginBottom: 20 }}>
            {[
              { n: '41%', l: 'Risk reduction', c: C.good },
              { n: '88%', l: 'Warning acceptance', c: C.good },
              { n: '312', l: 'Safe-walk minutes', c: C.ocean },
              { n: '2.4s', l: 'Avg. response', c: C.warn },
              { n: '5', l: 'Day streak', c: C.iris },
            ].map(s => (
              <div key={s.l} className="doc-stat">
                <b style={{ color: s.c }}>{s.n}</b><span>{s.l}</span>
              </div>
            ))}
          </div>
          <div className="doc-h3">How this child responds to warnings · 7 days</div>
          <ReactionChart />
          <p className="doc-cap">
            The three outcomes every risk event resolves into. This chart <i>is</i> the safety metric:
            a rising green band means the intervention is working, and the same three words
            (<b>immediate · delayed · ignored</b>) are what <code>logRiskEvent()</code> writes at the
            moment the child looks up. One number, from the sensor to the parent, with no
            re-interpretation in between.
          </p>
          <div className="doc-why">
            <b>phoneUseDrop is measured against the child's own first week</b>, not against other
            children. Improvement is rewarded rather than punishing whoever started out worst.
          </div>
        </section>

        {/* ── ARCHITECTURE ── */}
        <section id="arch" ref={set('arch')} className="doc-section">
          <h2 className="doc-h2">Architecture</h2>
          <p className="doc-lead">
            One React app. A shell that swaps between the child game, the parent app, and three
            documentation pages — this one included.
          </p>
          <div className="doc-h3">Dependency graph · data.jsx is the bottom, and depends on nothing</div>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 18, padding: 18, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <Node tone="ghost">main.jsx → shell/App.jsx</Node>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <Icon name="arrow-down" size={16} color={C.ink3} stroke={2.4} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Node tone="plain" wide>child/ · 32</Node>
              <Node tone="plain" wide>parent/ · 13</Node>
              <Node tone="plain" wide>docs/ · 3</Node>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <Icon name="arrow-down" size={16} color={C.ink3} stroke={2.4} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <Node tone="ocean" wide>primitives</Node>
              <Node tone="ocean" wide>characters</Node>
              <Node tone="ocean" wide>i18n</Node>
              <Node tone="ocean" wide>nav</Node>
              <Node tone="ocean" wide>auth</Node>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <Icon name="arrow-down" size={16} color={C.ink3} stroke={2.4} />
            </div>
            <div style={{ display: 'flex' }}>
              <Node tone="hub" wide>core/data.jsx — the model AND every rule · imports no screen</Node>
            </div>
          </div>
          {ARCH.map(a => (
            <div key={a.t} className="doc-row">
              <Icon name="corner-down-right" size={16} color={C.ink3} stroke={2.3} style={{ flexShrink: 0, marginTop: 3 }} />
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{a.t}</div>
                <p className="doc-note">{a.s}</p>
              </div>
            </div>
          ))}

          <div className="doc-h3">Tech stack</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <tbody>
                {[
                  ['React', '^18.3.1'], ['Vite', '^6.0.7'], ['lucide-react', '^0.469.0'],
                  ['Language', 'JavaScript (ESM · JSX) — no TypeScript'],
                  ['Router', 'none'], ['State library', 'none'],
                  ['Backend · database · API', 'none'], ['Tests · CI · Docker', 'none'],
                  ['Hosting', 'Vercel (static)'],
                  ['Fonts', 'Fredoka · Jua · Pretendard (Korean)'],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ width: 210 }}><b>{k}</b></td>
                    <td style={{ color: v === 'none' ? C.bad : '#3f3c39', fontWeight: v === 'none' ? 800 : 400 }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="doc-cap">Three runtime dependencies. The "none" rows are as informative as the rest.</p>
        </section>

        {/* ── ADRs ── */}
        <section id="adr" ref={set('adr')} className="doc-section">
          <h2 className="doc-h2">Architecture decision records</h2>
          <p className="doc-lead">
            Every significant decision, with what it bought and what it cost. A decision without a
            recorded cost is a decision nobody can revisit.
          </p>
          {ADRS.map(a => (
            <div key={a.id} className="doc-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="doc-row-head">
                  <span className="doc-id">{a.id}</span>
                  <span className="doc-title">{a.t}</span>
                </div>
                <p className="doc-note">{a.d}</p>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
                  <Icon name="plus" size={14} color={C.good} stroke={3} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>{a.good}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 4 }}>
                  <Icon name="minus" size={14} color={C.bad} stroke={3} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontSize: 12, color: C.ink2, lineHeight: 1.55 }}>{a.bad}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* ── QUALITY ── */}
        <section id="quality" ref={set('quality')} className="doc-section">
          <h2 className="doc-h2">Quality & gaps — the honest audit</h2>
          <p className="doc-lead">
            What a new engineer needs to know before they trust this codebase with anything real.
          </p>
          {QUALITY.map(q => (
            <div key={q.t} className="doc-row">
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="doc-row-head">
                  <span className="doc-title">{q.t}</span>
                  <span className="doc-pill" style={{ background: q.bad ? '#fdecec' : '#e9f6ee', color: q.bad ? '#9e3225' : '#2f7a4f' }}>{q.v}</span>
                </div>
                <p className="doc-note">{q.s}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── RISKS ── */}
        <section id="risks" ref={set('risks')} className="doc-section">
          <h2 className="doc-h2">Risk register</h2>
          <p className="doc-lead">What will hurt, ranked by how much — so nobody ships this by accident.</p>
          {RISKS.map(r => {
            const tone = r.sev === 'Critical' ? { bg: '#fdecec', fg: '#9e3225' }
              : r.sev === 'High' ? { bg: '#fdecec', fg: '#b04343' }
              : r.sev === 'Medium' ? { bg: '#fdf3dd', fg: '#9a6a08' }
              : { bg: '#f3f2f1', fg: '#77736e' };
            return (
              <div key={r.id} className="doc-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="doc-row-head">
                    <span className="doc-id">{r.id}</span>
                    <span className="doc-title">{r.t}</span>
                    <span className="doc-pill" style={{ background: tone.bg, color: tone.fg, marginLeft: 'auto' }}>{r.sev}</span>
                  </div>
                  <p className="doc-note">{r.s}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* ── TESTING ── */}
        <section id="testing" ref={set('testing')} className="doc-section">
          <h2 className="doc-h2">The test matrix that should exist</h2>
          <p className="doc-lead">
            There is <b>no test suite</b>. But <code>data.jsx</code> is pure functions over plain objects
            with zero React coupling — the cheapest, highest-value tests in the repo, and these are the
            cases. Anyone joining could write them on day two.
          </p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <thead><tr><th>ID</th><th>Case</th><th>Expected</th></tr></thead>
              <tbody>
                {TESTS.map(t => (
                  <tr key={t.id}>
                    <td><code>{t.id}</code></td>
                    <td>{t.c}</td>
                    <td style={{ color: '#2f7a4f', fontWeight: 600 }}>{t.e}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="doc-cap">
            Today the code is verified three ways instead: the <b>Tweaks panel</b> (a hand-built QA
            harness that can trigger a warning, replay onboarding and force every edge state without a
            code change), the <b>Spec checklist</b> (a manual traceability matrix with persistent review
            checkboxes), and browser-driven verification during development.
          </p>
        </section>

        {/* ── ONBOARDING ── */}
        <section id="onboard" ref={set('onboard')} className="doc-section">
          <h2 className="doc-h2">Day 1 — if you just joined</h2>
          <p className="doc-lead">In this order. It takes about two hours and you will understand the product.</p>
          {[
            { t: 'npm install && npm run dev', s: 'Three dependencies. It will be up in seconds.' },
            { t: 'Open the Tweaks panel (gear, top right) → ▶ Trigger a warning', s: 'Watch the whole intervention play out: grace → buzz → warning → buddy message. That is the product. Everything else exists to make a child care about it.' },
            { t: 'Read src/core/data.jsx — all 1,528 lines', s: 'Nothing else in the repo comes close in importance. It is the entire product, expressed as data and rules, and it imports no screen.' },
            { t: 'Then Battle.jsx, then WarningOverlay.jsx', s: 'The clearest example of a screen consuming the model, and then the most stateful screen in the app.' },
            { t: 'Ship something small', s: 'Add one data.jsx unit test, or fix RISK-5 (the broken toy-mascot asset path).' },
          ].map((s, i) => (
            <div key={s.t} className="doc-row">
              <div className="doc-num">{i + 1}</div>
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{s.t}</div>
                <p className="doc-note">{s.s}</p>
              </div>
            </div>
          ))}
          <div className="doc-h3">The five things that will trip you up</div>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <tbody>
                {[
                  ['The data module is the source of truth, not React', 'Screens mutate PLAYER and CHARACTERS directly.'],
                  ['Stage is derived from level — never set it', 'applyXpCurve() will overwrite you.'],
                  ['isOwed() returns a count, not a boolean', 'That is what makes the reward engine idempotent.'],
                  ['The "toy" mascot style is broken', 'Its assets do not exist. Use "comic" (the default).'],
                  ['A few comments in data.jsx are stale', 'They say stage thresholds are 5/10. The table says 1/4/8. Trust the table.'],
                ].map(([a, b]) => (
                  <tr key={a}><td style={{ width: 320 }}><b>{a}</b></td><td>{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── GLOSSARY ── */}
        <section id="glossary" ref={set('glossary')} className="doc-section">
          <h2 className="doc-h2">Glossary</h2>
          <p className="doc-lead">Every term this project invented, in one place.</p>
          <div className="doc-table-wrap">
            <table className="doc-table">
              <tbody>
                {GLOSSARY.map(g => (
                  <tr key={g.t}>
                    <td style={{ width: 210 }}><b>{g.t}</b></td>
                    <td>{g.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── ROADMAP ── */}
        <section id="roadmap" ref={set('roadmap')} className="doc-section">
          <h2 className="doc-h2">Roadmap</h2>
          <p className="doc-lead">In the order a production team should tackle it.</p>
          {[
            { t: 'Build the backend — server-authoritative first', s: 'Today a client-side mutation could grant infinite points. The four settings setters, the three ledgers, and logRiskEvent() are the seams it plugs into; none of them need to change shape.' },
            { t: 'Add tests, starting with data.jsx', s: 'Pure functions over plain objects, zero React coupling — the cheapest and highest-value tests in the repo. XP overflow carry, the ledger never double-paying, hatch odds over 10k rolls, every canBuyItem verdict, and setXpCurve rejecting malformed payloads.' },
            { t: 'Migrate to TypeScript', s: 'Grant rules, verdict unions and settings payloads are exactly the shapes a type system catches bugs in. This is the strongest argument against the original no-TS call.' },
            { t: 'Accessibility pass', s: 'aria-live on the warning overlay first — it is a safety feature that currently announces nothing. Then focus rings, labelled icon buttons, and a contrast audit.' },
            { t: 'Prune the variant galleries', s: 'The single biggest bundle win, available the moment the design directions are signed off.' },
            { t: 'Ship the first season', s: 'The content is already authored and dark: three winter items and two spring rules, waiting on a server flag.' },
          ].map((g, i) => (
            <div key={g.t} className="doc-row">
              <div className="doc-num">{i + 1}</div>
              <div style={{ minWidth: 0 }}>
                <div className="doc-title">{g.t}</div>
                <p className="doc-note">{g.s}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default ProjectDocs;
