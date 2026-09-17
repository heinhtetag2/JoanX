// JoanX — how a buddy the child doesn't own yet is drawn in the collection grids.
// None of these reveal the buddy's body: a locked buddy is a surprise that comes out of an
// egg, so the looks are built from the app's own egg art rather than a greyed-out figure.
// Switch via Tweaks → "Locked buddy"; read off window.JX_LOCKED_BUDDY like JX_DEX_HEADER.
//
//   mark       — a "?" pressed into a sand disc (the plain baseline)
//   (default is mark-squircle, chosen in review)
//   mark-rarity  — the same disc tinted by rarity (sand / ocean / iris), "?" in the tier ink
//   mark-squircle— the "?" on a rounded-square tile, the shape of the app's room pucks
//   mark-coin    — a brand-green disc with an inner ring, the points coin's shape, white "?"
//   mark-pressed — the disc pressed into the card: a shade on its top inner edge, flat fill
//   mark-big     — one disc sized to the card's width, the "?" as the whole card
//   mark-quiet   — the plain mark with the repeated "???" line and corner lock removed
//   mark-rarity-quiet — rarity tint + quiet together
//   mark-mint    — a pale brand-green disc with a green "?", the app's own tint rather than grey
//   mark-ring    — no fill: a thin ring in the rarity ink around the "?"
//   mark-tilt    — the plain disc knocked a little off-true, "?" leaning with it
//   mark-ink     — a dark ink disc with a white "?", the loudest of the set
//   mark-tint-card — the whole card takes the rarity tint; a bare "?" and no extra text
//   egg        — the painted egg it hatches from, resting on the card floor
//   nest       — the whole card becomes that rarity's hatch scene (golden grove / ice
//                cave / dream sky) with the egg waiting on its pedestal
//   cracking   — the whole card is the onboarding "who's inside?" art: an egg splitting
//                open around a question mark
//   hatch      — the egg plus a plain "Hatch ›" line; tapping a locked card opens the egg
//                shop, so the card is a way to get the buddy, not a dead end
//   stall      — the egg sitting on the egg shop's market stall, where it will come from
//   room       — the whole card is the room the buddy will live in (Green / Town / Dream),
//                empty, with the floor marker the room editor uses for "place here"
//   clouds     — the whole card is the dream-cloud art; the buddy is still up there
//   bag        — the egg plus the child's REAL inventory: "1 egg · Hatch ›" when they hold
//                one of that rarity, "Get in shop ›" when they don't; taps go to the shop
//   hint       — a "?" plus the real unlock condition ("Hatch a Rare Egg")
//   silhouette — the old greyed-out figure, kept for comparison
//
// Card-level looks also restyle the tile around the art. Grids read that through
// lockedCard(c, ctx) → { style, text, onClick, cornerLock }.

import React from 'react';
import { RARITY, THEME } from '../core/primitives.jsx';
import { PLAYER } from '../core/data.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';

const LOCKED_BUDDY_STYLES = [
  { id: 'mark', label: '? mark' },
  { id: 'mark-rarity', label: '? · rarity tint' },
  { id: 'mark-squircle', label: '? · square tile' },
  { id: 'mark-coin', label: '? · green coin' },
  { id: 'mark-pressed', label: '? · pressed in' },
  { id: 'mark-big', label: '? · big disc' },
  { id: 'mark-quiet', label: '? · quiet' },
  { id: 'mark-rarity-quiet', label: '? · rarity + quiet' },
  { id: 'mark-mint', label: '? · mint' },
  { id: 'mark-ring', label: '? · rarity ring' },
  { id: 'mark-tilt', label: '? · tilted' },
  { id: 'mark-ink', label: '? · ink' },
  { id: 'mark-tint-card', label: '? · tinted card' },
  { id: 'egg', label: 'Painted egg' },
  { id: 'nest', label: 'Hatch scene' },
  { id: 'cracking', label: 'Cracking egg' },
  { id: 'hatch', label: 'Egg + Hatch' },
  { id: 'stall', label: 'Shop stall' },
  { id: 'room', label: 'Empty room' },
  { id: 'clouds', label: 'In the clouds' },
  { id: 'bag', label: 'Eggs you hold' },
  { id: 'hint', label: '? + hint' },
  { id: 'silhouette', label: 'Silhouette' },
];

const lockedBuddyStyle = () => window.JX_LOCKED_BUDDY || 'mark-squircle';   // default: ? · square tile

const EGG_IMG = { common: '/assets/egg-types/common.png', rare: '/assets/egg-types/rare.png', epic: '/assets/egg-types/epic.png' };
const SCENE_IMG = { common: '/assets/egg/egg-bg-common.png', rare: '/assets/egg/bgbgrare.png', epic: '/assets/egg/egg-bg-epic2.png' };
const CRACKING_IMG = '/assets/onboarding/16.png';
const STALL_IMG = '/assets/shop/shop-stall.png';
const CLOUD_IMG = '/assets/backgrounds/cloud.png';
// the room a buddy of each rarity is shown moving into — one room per tier, so the grid
// reads as three neighbourhoods rather than one repeated picture
const ROOM_IMG = { common: '/assets/rooms/green-room.png', rare: '/assets/rooms/town-room.png', epic: '/assets/rooms/dream-room.png' };

// under the name on art-backed cards — just enough for white text to read
const SCRIM = 'linear-gradient(to top, rgba(20,16,10,.62) 0%, rgba(20,16,10,.18) 38%, rgba(20,16,10,0) 60%)';

function lockedCard(c, ctx) {
  const plain = { style: null, text: null, onClick: null, cornerLock: !c.owned, hideName: false };
  if (c.owned) return plain;
  const style = lockedBuddyStyle();
  // the "?" already says unknown — a second "???" under it and a padlock in the corner
  // say the same thing twice more
  if (style === 'mark-quiet' || style === 'mark-rarity-quiet') return { ...plain, cornerLock: false, hideName: true };
  if (style === 'mark-tint-card') {
    const r = RARITY[c.rarity] || RARITY.common;
    return { ...plain, cornerLock: false, hideName: true, style: { background: c.rarity === 'common' ? THEME.surface2 : r.bg } };
  }
  if (style === 'nest') {
    return { ...plain, cornerLock: false, text: '#fff',
      style: { backgroundImage: `${SCRIM}, url(${SCENE_IMG[c.rarity] || SCENE_IMG.common})`, backgroundSize: 'cover', backgroundPosition: 'center 70%', boxShadow: 'none' } };
  }
  if (style === 'cracking') {
    return { ...plain, cornerLock: false, text: '#fff',
      style: { backgroundImage: `${SCRIM}, url(${CRACKING_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center 12%', boxShadow: 'none' } };
  }
  if (style === 'room') {
    return { ...plain, cornerLock: false, text: '#fff',
      style: { backgroundImage: `${SCRIM}, url(${ROOM_IMG[c.rarity] || ROOM_IMG.common})`, backgroundSize: 'cover', backgroundPosition: 'center 62%', boxShadow: 'none' } };
  }
  if (style === 'clouds') {
    return { ...plain, cornerLock: false, text: '#fff',
      style: { backgroundImage: `linear-gradient(to top, rgba(40,28,80,.45), rgba(40,28,80,0) 55%), url(${CLOUD_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center 40%', boxShadow: 'none' } };
  }
  if (style === 'hatch' || style === 'bag') {
    return { ...plain, cornerLock: false, onClick: ctx ? () => ctx.nav('shop') : null };
  }
  return plain;
}

const Q = ({ px, color }) => (
  <span className="game-font" style={{ fontSize: px, fontWeight: 800, lineHeight: 1, color, fontFamily: 'Fredoka, var(--font-sans)' }}>?</span>
);

// `size` is the box the owned Mascot would occupy, so locked and owned cards line up.
function LockedBuddyArt({ c, size = 62 }) {
  const style = lockedBuddyStyle();
  const box = { width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  const egg = EGG_IMG[c.rarity] || EGG_IMG.common;

  if (style === 'silhouette') {
    return (
      <div style={{ filter: 'grayscale(1) brightness(1.7) opacity(.5)' }}>
        <Mascot id={c.id} species={c.species} stage={1} color={c.color} size={size} />
      </div>
    );
  }

  if (style === 'egg') {
    // resting, not floating: a flat contact shadow under the shell, no bob, no glow
    return (
      <div style={{ ...box, flexDirection: 'column', justifyContent: 'flex-end' }}>
        <img src={egg} alt="" draggable="false" style={{ height: size * 0.88, width: 'auto', display: 'block', position: 'relative' }} />
        <div style={{ width: size * 0.5, height: size * 0.08, borderRadius: '50%', background: 'rgba(43,41,38,.10)', marginTop: -size * 0.05 }} />
      </div>
    );
  }

  if (style === 'nest') {
    // the scene is the card background (lockedCard); the egg sits on the scene's pedestal
    return (
      <div style={{ ...box, alignItems: 'flex-end' }}>
        <img src={egg} alt="" draggable="false" style={{ height: size * 0.74, width: 'auto', display: 'block' }} />
      </div>
    );
  }

  if (style === 'cracking') {
    // the art is the card background — keep the box so the name lands where it always does
    return <div style={box} />;
  }

  if (style === 'hatch') {
    return (
      <div style={{ minHeight: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <img src={egg} alt="" draggable="false" style={{ height: size * 0.78, width: 'auto', display: 'block' }} />
        <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.brand, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          {L('Hatch')}<span style={{ fontSize: 14, lineHeight: 1 }}>›</span>
        </span>
      </div>
    );
  }

  if (style === 'stall') {
    return (
      <div style={{ ...box, position: 'relative', alignItems: 'flex-end' }}>
        <img src={STALL_IMG} alt="" draggable="false" style={{ width: size * 1.05, height: 'auto', display: 'block' }} />
        {/* on the counter, between the awning posts */}
        <img src={egg} alt="" draggable="false" style={{ position: 'absolute', left: '50%', bottom: size * 0.3, height: size * 0.42, width: 'auto', transform: 'translateX(-50%)' }} />
      </div>
    );
  }

  if (style === 'room') {
    // the room editor's own drop marker: a flat floor ellipse where a piece will stand
    return (
      <div style={{ ...box, flexDirection: 'column', justifyContent: 'center', gap: 2, marginBottom: 6 }}>
        <Q px={size * 0.4} color="#fff" />
        <div style={{ width: size * 0.62, height: size * 0.15, borderRadius: '50%', border: '2px dashed rgba(255,255,255,.85)' }} />
      </div>
    );
  }

  if (style === 'clouds') {
    return (
      <div style={box}>
        <Q px={size * 0.6} color="rgba(255,255,255,.95)" />
      </div>
    );
  }

  if (style === 'bag') {
    const held = (PLAYER.eggs && PLAYER.eggs[c.rarity]) || 0;
    return (
      <div style={{ minHeight: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <div style={{ position: 'relative' }}>
          <img src={egg} alt="" draggable="false" style={{ height: size * 0.78, width: 'auto', display: 'block', opacity: held ? 1 : 0.45 }} />
          {held > 0 && (
            <span style={{ position: 'absolute', right: -size * 0.16, top: -size * 0.02, minWidth: 20, height: 20, padding: '0 5px', borderRadius: 10, background: THEME.fg1, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontVariantNumeric: 'tabular-nums' }}>×{held}</span>
          )}
        </div>
        <span style={{ fontSize: 11, fontWeight: 800, color: held ? THEME.brand : THEME.fg2, display: 'inline-flex', alignItems: 'center', gap: 2, wordBreak: 'keep-all' }}>
          {held ? L('Hatch') : L('Get in shop')}<span style={{ fontSize: 14, lineHeight: 1 }}>›</span>
        </span>
      </div>
    );
  }

  if (style === 'hint') {
    return (
      // grows past `size` on purpose: the hint is the point of this look, so the card gets
      // taller rather than the text squeezing into the art box and over the name below
      <div style={{ minHeight: size, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: size * 0.52, height: size * 0.52, borderRadius: '50%', background: RARITY[c.rarity].bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.32} color={RARITY[c.rarity].fg} />
        </div>
        {c.locked && (
          <span style={{ fontSize: 10, fontWeight: 700, color: THEME.fg2, lineHeight: 1.25, textAlign: 'center', maxWidth: size * 1.55, wordBreak: 'keep-all', marginBottom: 4 }}>{L(c.locked)}</span>
        )}
      </div>
    );
  }

  if (style === 'mark-rarity' || style === 'mark-rarity-quiet') {
    const r = RARITY[c.rarity] || RARITY.common;
    return (
      <div style={box}>
        <div style={{ width: size * 0.82, height: size * 0.82, borderRadius: '50%', background: r.bg, boxShadow: `inset 0 0 0 1.5px ${c.rarity === 'common' ? THEME.border : r.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.48} color={c.rarity === 'common' ? THEME.fg3 : r.fg} />
        </div>
      </div>
    );
  }

  if (style === 'mark-squircle') {
    return (
      <div style={box}>
        <div style={{ width: size * 0.78, height: size * 0.78, borderRadius: size * 0.24, background: THEME.surface2, boxShadow: `inset 0 0 0 1.5px ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.46} color={THEME.fg3} />
        </div>
      </div>
    );
  }

  if (style === 'mark-coin') {
    return (
      <div style={box}>
        <div style={{ width: size * 0.8, height: size * 0.8, borderRadius: '50%', background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '78%', height: '78%', borderRadius: '50%', border: '2px solid rgba(255,255,255,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Q px={size * 0.4} color="#fff" />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'mark-pressed') {
    return (
      <div style={box}>
        <div style={{ width: size * 0.82, height: size * 0.82, borderRadius: '50%', background: '#efeeec', boxShadow: 'inset 0 3px 0 rgba(43,41,38,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.48} color="#c9c6c3" />
        </div>
      </div>
    );
  }

  if (style === 'mark-big') {
    return (
      <div style={{ ...box, width: '100%', height: 'auto', padding: '0 4px' }}>
        <div style={{ width: size * 1.35, maxWidth: '100%', aspectRatio: '1 / 1', borderRadius: '50%', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.72} color={THEME.border} />
        </div>
      </div>
    );
  }

  if (style === 'mark-mint') {
    return (
      <div style={box}>
        <div style={{ width: size * 0.82, height: size * 0.82, borderRadius: '50%', background: THEME.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.48} color={THEME.brand} />
        </div>
      </div>
    );
  }

  if (style === 'mark-ring') {
    const ink = c.rarity === 'common' ? THEME.fg3 : (RARITY[c.rarity] || RARITY.common).fg;
    return (
      <div style={box}>
        <div style={{ width: size * 0.8, height: size * 0.8, borderRadius: '50%', border: `2.5px solid ${ink}`, opacity: c.rarity === 'common' ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.46} color={ink} />
        </div>
      </div>
    );
  }

  if (style === 'mark-tilt') {
    // each card leans its own way, off its id, so the grid doesn't tilt in lockstep
    const lean = (parseInt(String(c.id).replace(/\D/g, ''), 10) || 0) % 2 ? -9 : 7;
    return (
      <div style={box}>
        <div style={{ width: size * 0.82, height: size * 0.82, borderRadius: '50%', background: THEME.surface2, boxShadow: `inset 0 0 0 1.5px ${THEME.border}`, transform: `rotate(${lean}deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.5} color={THEME.fg3} />
        </div>
      </div>
    );
  }

  if (style === 'mark-ink') {
    return (
      <div style={box}>
        <div style={{ width: size * 0.8, height: size * 0.8, borderRadius: '50%', background: THEME.fg1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Q px={size * 0.46} color="#fff" />
        </div>
      </div>
    );
  }

  if (style === 'mark-tint-card') {
    const ink = c.rarity === 'common' ? THEME.fg3 : (RARITY[c.rarity] || RARITY.common).fg;
    return (
      <div style={box}>
        <Q px={size * 0.78} color={ink} />
      </div>
    );
  }

  // 'mark' and 'mark-quiet'
  return (
    <div style={box}>
      <div style={{ width: size * 0.82, height: size * 0.82, borderRadius: '50%', background: THEME.surface2, boxShadow: `inset 0 0 0 1.5px ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Q px={size * 0.48} color={THEME.fg3} />
      </div>
    </div>
  );
}

export { LockedBuddyArt, LOCKED_BUDDY_STYLES, lockedCard };
