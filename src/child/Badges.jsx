// JoanX — child app · achievement badges
//
// The badge is the *artifact* an achievement leaves behind. ACHIEVEMENTS in
// data.jsx stays the single source of truth — this file is a presentation
// layer over it, never a second list. A badge with no achievement behind it
// cannot exist, which is the point: everything here is earned by doing
// something, and the grant engine already knows how to pay for it.

import React from 'react';
import { ACHIEVEMENTS } from '../core/data.jsx';
import { Bar, BottomSheet, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { shade } from '../core/characters.jsx';

/* ── tier styling ──────────────────────────────────────────────────────
   Keyed by the RARITIES vocabulary so a Rare badge and a Rare buddy are the
   same word and the same idea. `plate` fills the medallion body, `ring` is the
   raised rim, `shine` the highlight sweep. Epic gets a second ring colour so
   it reads as scarce at a glance in a grid, without motion or sparkle. */
const BADGE_TIERS = {
  common: { plate: '#cfa46a', ring: '#a97b45', shine: '#f0d6ae', label: 'Common' },
  rare:   { plate: '#9fb6d8', ring: '#6a86ad', shine: '#dfe9f7', label: 'Rare' },
  epic:   { plate: '#c9a3e8', ring: '#8f5fc0', shine: '#efe0fb', label: 'Epic' },
};
const tierOf = (a) => BADGE_TIERS[a.tier] || BADGE_TIERS.common;

/* ── the medallion ─────────────────────────────────────────────────────
   A drawn rosette: eight points behind a round plate, a rim, and the
   achievement's own icon at the centre. Points are computed rather than
   hand-authored path data so the shape scales with `size` and a future tier
   could change the point count without a new asset.

   Locked is the SAME shape in greyscale, not a padlock in a box: a child
   should be able to see the silhouette of the thing they haven't got yet —
   that is what makes it worth walking for. The icon stays visible but dimmed,
   so the badge still tells you what it is about. */
function BadgeMedallion({ a, size = 76, locked }) {
  const t = tierOf(a);
  const plate = locked ? '#d9d6d2' : t.plate;
  const ring = locked ? '#b8b4af' : t.ring;
  const shine = locked ? '#e9e7e4' : t.shine;
  const r = size / 2;
  const pts = 8;
  const outer = r * 0.98, inner = r * 0.78;
  // star/rosette points, alternating outer and inner radius around the circle
  const star = Array.from({ length: pts * 2 }, (_, i) => {
    const rad = (i % 2 ? inner : outer);
    const ang = (Math.PI / pts) * i - Math.PI / 2;
    return `${r + rad * Math.cos(ang)},${r + rad * Math.sin(ang)}`;
  }).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', flexShrink: 0 }} aria-hidden="true">
      <polygon points={star} fill={ring} />
      <circle cx={r} cy={r} r={r * 0.72} fill={plate} />
      <circle cx={r} cy={r} r={r * 0.72} fill="none" stroke={ring} strokeWidth={size * 0.045} />
      {/* highlight sweep across the top-left of the plate — a flat wedge, no gradient */}
      <path d={`M ${r - r * 0.5} ${r - r * 0.28} A ${r * 0.58} ${r * 0.58} 0 0 1 ${r + r * 0.1} ${r - r * 0.55} L ${r - r * 0.3} ${r - r * 0.1} Z`} fill={shine} opacity={locked ? .5 : .75} />
      <circle cx={r} cy={r} r={r * 0.52} fill={shade(plate, locked ? 16 : 30)} />
    </svg>
  );
}

/* The badge face at a given size. When the achievement carries `img`, that
   finished medallion art is the badge — it already has the plate, ring, ribbon
   and central icon, so we render it whole and skip the drawn rosette. Locked is
   the same art in greyscale, matching the drawn-medallion behaviour below: a
   child still sees the silhouette of what they haven't earned. Without `img`
   (the abstract streak/collector badges), fall back to the drawn medallion with
   the lucide icon at its centre. */
function BadgeArt({ a, size = 76, locked }) {
  const iconSize = size * 0.34;
  if (a.img) {
    return (
      <img src={`/assets/badges/${a.img}`} alt="" draggable="false"
        style={{ width: size, height: size, display: 'block', flexShrink: 0, objectFit: 'contain',
          filter: locked ? 'grayscale(1) opacity(.5)' : 'none' }} />
    );
  }
  return (
    <div style={{ position: 'relative', lineHeight: 0 }}>
      <BadgeMedallion a={a} size={size} locked={locked} />
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={a.icon} size={iconSize} color={locked ? '#8e8a86' : '#fff'} stroke={2.4} />
      </span>
    </div>
  );
}

/* One badge in the grid: medallion, name, and either the tier or the progress
   toward it. The whole tile is the tap target — a badge is a thing you pick
   up, not a row with a chevron. */
function BadgeTile({ a, onPick }) {
  const locked = !a.done;
  const t = tierOf(a);
  return (
    <button onClick={() => onPick(a)} className="jx-press"
      style={{ background: '#fff', border: 'none', borderRadius: 18, padding: '14px 8px 11px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, cursor: 'pointer', fontFamily: 'inherit' }}>
      <BadgeArt a={a} locked={locked} />
      <span style={{ fontSize: 12, fontWeight: 800, color: locked ? THEME.fg3 : THEME.fg1, lineHeight: 1.2, textAlign: 'center' }}>{L(a.name)}</span>
      {locked && a.total
        ? <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg3 }}>{a.progress}/{a.total}</span>
        : <span style={{ fontSize: 10.5, fontWeight: 800, color: locked ? THEME.fg3 : t.ring }}>{L(locked ? 'Locked' : t.label)}</span>}
    </button>
  );
}

/* The detail a tap opens: the badge at display size, what it takes to earn it,
   and what it pays. Earned badges say so; locked ones show the bar so the
   child can see how close they are — the reason to keep walking. */
function BadgeSheet({ a, onClose }) {
  const locked = !a.done;
  const t = tierOf(a);
  return (
    <BottomSheet title={L('Achievement')} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4px 4px 8px' }}>
        <div style={{ marginBottom: 12 }}>
          <BadgeArt a={a} size={116} locked={locked} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: locked ? THEME.surface2 : shade(t.plate, 62), borderRadius: 999, padding: '5px 11px', marginBottom: 8 }}>
          <Icon name={locked ? 'lock' : 'check'} size={12} color={locked ? THEME.fg3 : t.ring} stroke={2.6} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: locked ? THEME.fg3 : t.ring }}>{L(locked ? 'Locked' : t.label)}</span>
        </div>
        <h3 className="game-font" style={{ fontSize: 21, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L(a.name)}</h3>
        <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, margin: '6px 0 0', maxWidth: 250 }}>{L(a.desc)}</p>

        {locked && a.total && (
          <div style={{ width: '100%', marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginBottom: 6 }}>
              <span>{L('Progress')}</span><span>{a.progress}/{a.total}</span>
            </div>
            <Bar value={a.progress} max={a.total} color={THEME.brand} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, background: THEME.goldLight, borderRadius: 14, padding: '11px 16px', width: '100%' }}>
          <Icon name="award" size={16} color={THEME.gold} stroke={2.3} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#7a5a12' }}>{locked ? L('Earn to get') : L('Earned')} +{a.reward} {L('points')}</span>
        </div>
      </div>
    </BottomSheet>
  );
}

/* The grid. Earned badges sort first: the case should open on what the child
   has, not on a wall of grey. Within each half the authored order stands. */
function BadgeGrid() {
  const [picked, setPicked] = React.useState(null);
  const list = [...ACHIEVEMENTS].sort((x, y) => (y.done ? 1 : 0) - (x.done ? 1 : 0));
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {list.map(a => <BadgeTile key={a.id} a={a} onPick={setPicked} />)}
      </div>
      {picked && <BadgeSheet a={picked} onClose={() => setPicked(null)} />}
    </>
  );
}

const badgesEarned = () => ACHIEVEMENTS.filter(a => a.done).length;

/* Cross-screen intent: the Profile trophy shelf sets this before navigating to the
   Collection tab so it opens on the Badges side, not Buddies. A one-shot flag —
   Collection reads it once on mount and clears it, so a later manual visit to the
   tab still lands on Buddies. Kept here beside the grid it targets. */
const collectionIntent = { side: null };

export { BadgeGrid, BadgeMedallion, BadgeArt, BADGE_TIERS, badgesEarned, tierOf, collectionIntent };
