// JoanX — child app · the VERSUS moment (fight staging)
//
// The two seconds after "Start battle" and before the roll: who is fighting whom.
// `classic` is the baseline that shipped — both fighters side by side, VS between.
// `banner` stacks them instead: a painted plate per fighter, the mascot standing on it
// and breaking its top edge, name + level below, a shield in the gap. Switch via Tweaks
// ("Versus screen").
//
// The versus phase is the fighters' screen; the RESULT screen is not. Two stacked
// plates plus the shield gap is a full phone height on their own, which left the
// headline, the reward and the battle math below the fold with no way to reach them.
// So on the result the banner layout folds to a single side-by-side strip (`mini`):
// same two fighters, same order of reading, a fraction of the height. The loser dims.
//
// System notes: no decorative sparkle, and the only thing that moves is the winner's
// mascot on the result. The plates are painted assets (see PLATE_ART) rather than CSS
// fills — the buddy stands on the autumn plate and the villain on the grove plate, a
// fixed pairing so the two scenes read as "your side / their side" like team colours.

import React from 'react';
import { Bar, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, VillainMascot } from '../core/characters.jsx';

const VERSUS_LAYOUTS = [
  { id: 'classic', label: 'Classic' },
  { id: 'banner', label: 'Banner' },
];

// Alternate readouts of the same clash — only the Banner layout has any clash
// choreography to swap, so Classic ignores this entirely. Real fight math
// (resolveBattle) never changes; each style just shows the same win/lose and
// hp track a different way. See useHitEvents + BannerStage below.
const CLASH_STYLES = [
  { id: 'classic', label: 'Classic' },
  { id: 'streak', label: 'Streak Attack' },
  { id: 'charge', label: 'Charge Burst' },
  { id: 'momentum', label: 'Momentum Meter' },
  { id: 'impact', label: 'Impact Numbers (default)' },
];

// Three pitches for a "the server is still resolving this fight" wait, so a real backend
// round-trip has somewhere to show progress instead of the versus beat just sitting there.
// None are wired to an actual request yet — all three just hold the pre-clash standoff so
// the ideas can be judged with a real screen behind them. See LoadingPercent / LoadingCharge
// / Shield's `pulse` prop. "Badge pulse" is the shipped default: every OTHER wait in the app
// (reconnect, pairing) is motion, not copy, over the scene, and this is what brought the
// versus standoff in line with that — no caption at all, just the shield itself breathing
// (a first pass drew expanding rings around it instead; a straight scale read clearer).
const LOADING_STYLES = [
  { id: 'off', label: 'Off' },
  { id: 'percent', label: 'Percent (dev idea)' },
  { id: 'charge', label: 'Charge hold' },
  { id: 'pulse', label: 'Badge pulse (default)' },
];

// Fires a short-lived event whenever either fighter's hp drops — the shared signal
// every non-classic style reacts to instead of reading the shake timeline directly.
// `decisive` marks the blow that took a side to zero, i.e. the final beat of the same
// 5-step track Battle.jsx already has from resolveBattle; nothing here re-rolls anything.
// `lastHit` mirrors the latest event id per side but never expires — Impact Numbers keys
// its bounce off it, and a bounce needs to retrigger every blow even after that blow's
// floating number has already faded out of `events`.
function useHitEvents(hp, active) {
  const prev = React.useRef(null);
  const [events, setEvents] = React.useState([]);
  const [lastHit, setLastHit] = React.useState({ me: null, foe: null });
  React.useEffect(() => {
    if (!active || !hp) { prev.current = null; setEvents(e => (e.length ? [] : e)); return; }
    const p = prev.current;
    if (p) {
      const fire = (side, dmg) => {
        const id = `${side}-${hp.meCur}-${hp.foeCur}-${Math.random().toString(36).slice(2)}`;
        setEvents(e => [...e, { id, side, dmg, decisive: (side === 'me' ? hp.meCur : hp.foeCur) === 0 }]);
        setLastHit(l => ({ ...l, [side]: id }));
        setTimeout(() => setEvents(e => e.filter(ev => ev.id !== id)), 900);
      };
      if (hp.meCur < p.meCur) fire('me', p.meCur - hp.meCur);
      if (hp.foeCur < p.foeCur) fire('foe', p.foeCur - hp.foeCur);
    }
    prev.current = hp;
  }, [hp?.meCur, hp?.foeCur, active]);
  return { events, lastHit };
}

// The banner art, from Figma (file crJcq4rLnoot0gWGT6F3m7, nodes 181:5869 / 181:5650):
// two painted scroll banners, one per side. The buddy stands on the autumn plate, the
// villain on the grove plate — a fixed pairing, not a choice, so the two scenes read as
// "your side / their side" the way team colours do. Each carries its own scene and its
// own corner ornament, which is why the plate below draws no shape of its own.
//
// Both assets arrive pre-oriented: the autumn (red) plate is drawn ornament-LEFT and the
// grove (green) plate ornament-RIGHT, so neither is mirrored. The RED autumn plate is the
// villain's (top); the GREEN grove plate is our hero's (bottom) — colour reads the side.
const PLATE_ART = {
  red:   { src: '/assets/battle/plate-autumn.webp', flip: false },  // autumn — villain (top), ornament left
  green: { src: '/assets/battle/plate-grove.webp',  flip: false },  // grove — our hero (bottom), ornament right
};

// A villain-specific plate, themed to that villain instead of the generic autumn scene —
// same fishtail shape and ornament-LEFT orientation as PLATE_ART.red, so it drops straight
// into the villain slot. Falls back to PLATE_ART.red for any villain without one.
// `nameLift` — the canvas has ~7% transparent padding baked in below the visible fishtail
// (measured: 694px tall, visible content stops 49px short of the bottom), which the generic
// plate art doesn't carry. The img box's CSS margin to the name below is identical either
// way, so that invisible strip alone was reading as extra gap under this one villain's
// banner; this pulls the name back up by roughly what that padding costs at full size.
const VILLAIN_PLATE_ART = {
  'v-ping': { src: '/assets/battle/fishtailbanner-villain1.png', flip: false, bleedExtra: 30, nameLift: 9 },
};
const plateFor = (foeId) => VILLAIN_PLATE_ART[foeId] || PLATE_ART.red;

// ── classic — the baseline, both fighters on one row ─────────────────────

function ClassicStage({ me, foe, result, won }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-around' }}>
      <div style={{ textAlign: 'center', filter: result && !won ? 'grayscale(1) contrast(.5) brightness(1.15)' : 'none', transition: 'filter .4s' }}>
        <div className={result && won ? 'jx-pop' : ''}><Mascot species={me.species} stage={me.stage} color={me.color} size={120} /></div>
        <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{me.name}</div>
        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {me.level}</div>
      </div>
      <div className="game-font" style={{ color: THEME.gold, fontSize: 26, fontWeight: 500 }}>VS</div>
      <div style={{ textAlign: 'center', filter: result && won ? 'grayscale(1) contrast(.5) brightness(1.15)' : 'none', transition: 'filter .4s' }}>
        <div style={{ transform: 'scaleX(-1)' }}><VillainMascot id={foe.id} species={foe.species} color={foe.color} mood="alert" size={120} /></div>
        <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{L(foe.name)}</div>
        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {foe.level}</div>
      </div>
    </div>
  );
}

// ── banner — a painted plate per fighter, stacked, a shield between ───────

// One fighter: the painted plate, its mascot standing centre-stage and breaking the top
// edge, and the name + level BELOW the plate. Nothing sits over the middle of the
// scene, so no scrim is needed —
// the name reads on the dark backdrop under the art, not on a sunlit sky inside it.
// `ornament` says which corner the painted scroll is in; the mascot leans the other way
// and the medallions take the opposite bottom corner, so neither lands on the ornament.
// `mini` is the result-screen fold: the plate keeps its painted scene and its mascot but
// drops every device that only pays off at full size — the off-screen bleed, the lean, the
// stat medallions — and sits centred in its half of a row instead.
function Plate({ char, name, level, art, ornament, mood, dim, pop, mini, enterFrom, inClash, clashClass, koClass, hpCur, hpMax, charging, auraColor, hits, bounceKey }) {
  const ornLeft = ornament === 'left';
  const mSize = mini ? 88 : 132;
  // how far the plate runs PAST its pinned screen edge — the extra push that makes the
  // stagger read as a hard diagonal rather than two plates merely offset. The medallions
  // below are shifted inward by the same amount so they never ride off with the bleed.
  // `art.bleedExtra` lets one specific plate art push further than the shared default —
  // the villain1 fishtail banner's ornament curl runs closer to its canvas edge than the
  // generic autumn plate's does, so at the standard bleed it read too close to the screen
  // edge; the extra push gives it the same breathing room the other plate has.
  const bleed = mini ? 0 : 30 + (art.bleedExtra || 0);
  // which way the mascot (and the name under it) sits off the plate centre. It leans toward
  // the ornament/inset side — into the open scene, AWAY from the bleeding edge — so the fox
  // reads over the autumn sky (not off the right) and the panda over the grove path.
  // In the result strip the two plates meet at a shield in the middle, so the lean points
  // INWARD: each mascot steps toward that seam (buddy right, villain left) so the two read
  // as facing each other rather than drifting to the outer edges of the screen.
  // Not symmetric, though: the buddy art puts its mascot further right inside its own half
  // than the villain art does inside its, so an equal inward lean crowded the buddy up
  // against the shield. The buddy leans OUT instead — past its half's centre, away from the
  // seam — which is what actually lands the two mascots mirrored across the VS.
  const lean = mini ? (ornLeft ? -18 : -30) : (ornLeft ? -30 : 30);
  return (
    // The two plates are staggered, not stacked flush: each is narrower than the phone and
    // pinned to the edge OPPOSITE its ornament, then pushed further past that edge. Buddy
    // (ornament left) pins + bleeds RIGHT; villain (ornament right) pins + bleeds LEFT — the
    // diagonal the reference is built on. The name stays on the inset side, on-screen.
    <div className={enterFrom === 'left' ? 'jx-slide-left' : enterFrom === 'right' ? 'jx-slide-right' : ''} style={{
      width: mini ? '100%' : '95%', alignSelf: mini ? 'center' : (ornLeft ? 'flex-end' : 'flex-start'),
      marginRight: ornLeft ? -bleed : 0, marginLeft: ornLeft ? 0 : -bleed,
    }}>
      {/* The plate — art, medallions, name — holds still through the exchange; it is a
          backdrop, not a fighter, so it should not be the thing recoiling from a punch. Only
          the mascot (below) carries the clash transform. koClass still runs on this whole
          wrapper: the banner coming apart is the bigger, one-time moment of the decisive
          blow, not a per-hit flinch, so it is allowed to take the whole plate with it.
          The loser reads as GREYED OUT, not faded — desaturated + darkened rather than
          see-through, the "disabled" look rather than a ghost. */}
      <div className={koClass || undefined} style={{ filter: dim ? 'grayscale(1) contrast(.5) brightness(1.15)' : 'none', transition: 'filter .4s' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* the scene, at its own aspect — the plate's height is the art's height at this
            width. The buddy art is drawn ornament-right and flipped to put it left.
            It fades out for the exchange: the banner is scenery for the stare-down, not
            the fight itself, so once the hits start it steps back and leaves the two
            mascots to trade blows against the plain arena. Opacity only (not unmounted),
            so the box keeps the height the mascot's `bottom` is measured against. */}
        <img src={art.src} alt="" style={{
          display: 'block', width: '100%', height: 'auto', transform: art.flip ? 'scaleX(-1)' : 'none',
          opacity: inClash ? 0 : 1, transition: 'opacity .3s ease',
        }} />

        {/* the mascot stands on the scene and breaks its top edge — the move the whole
            layout is built on. Nudged away from the ornament so it stands on open ground
            rather than in the scroll. The clash class sits on the INNER div so the hit
            recoil composes with (rather than replaces) this div's own translateX(-50%)
            centering; `clashClass` is null outside the Classic style, so non-classic
            concepts hold the mascot still and let their own fx (below) carry the hit. */}
        <div className={pop ? 'jx-pop' : ''} style={{
          position: 'absolute', bottom: mini ? 0 : 6, left: `calc(50% + ${lean}px)`, transform: 'translateX(-50%)',
        }}>
          <div className={clashClass || undefined} style={{ position: 'relative', width: mSize, height: mSize, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* sized WIDER than the mascot, not tighter — a ring behind it at the mascot's
                own size sits entirely under the character art and never shows at all. */}
            {charging && (
              <React.Fragment>
                <div className="jx-ring" style={{ position: 'absolute', width: mSize * 1.28, height: mSize * 1.28, borderRadius: 999, border: `3px solid ${auraColor}` }} />
                <div className="jx-ring-slow" style={{ position: 'absolute', width: mSize * 1.28, height: mSize * 1.28, borderRadius: 999, border: `3px solid ${auraColor}` }} />
              </React.Fragment>
            )}
            {/* Impact Numbers — re-keying this wrapper on every blow (bounceKey is the hit's
                own id, from useHitEvents' lastHit) forces a remount, which is what restarts a
                CSS animation on an element that never otherwise re-renders. */}
            <div key={bounceKey || 'still'} className={bounceKey ? 'jx-hit-bounce' : undefined}>
              <VillainMascot id={char.id} species={char.species} stage={char.stage} color={char.color} mood={mood} size={mSize} />
            </div>
            {/* the number reads real damage off the same hp track the HP bar below draws
                from — never a fabricated stat. Green when the OTHER side lost hp (this
                fighter landed the blow), red when this fighter is the one who got hit.
                A comic-style ink outline (text-stroke), not just a drop shadow, is what
                keeps it legible over both the light and dark halves of the arena art. */}
            {hits && hits.map(e => (
              <div key={e.id} style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none', zIndex: 3 }}>
                <div className="game-font jx-dmg-pop" style={{ fontSize: 23, fontWeight: 800, color: e.side === 'foe' ? THEME.brand : THEME.danger, WebkitTextStroke: '2px rgba(0,0,0,.55)', textShadow: '0 2px 3px rgba(0,0,0,.35)', whiteSpace: 'nowrap' }}>-{e.dmg}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* name + level below the plate, CENTERED under the mascot — the mascot leans off the
          plate centre by `lean`, and the name tracks it by the same shift, so the two read as
          one stacked unit rather than the name drifting to a corner. It fades out for the
          exchange, and an HP bar fades in on the SAME spot (a CSS grid overlap, both children
          in cell 1/1) rather than beside it — so the fight shows what that trade actually cost
          each fighter instead of just the two of them swinging at each other. */}
      <div style={{
        display: 'grid', justifyItems: 'center',
        // extra nudge on the name block only (not the mascot): buddy pulls further
        // left, villain further right, so each label sits tucked toward its own side.
        // the name tracks its mascot's lean exactly (no extra nudge in the strip) so the two
        // read as one stacked unit under each banner
        transform: mini ? `translateX(${lean}px)` : `translateX(${lean + (ornLeft ? -30 : 30)}px)`,
        // clears the plate edge below; `nameLift` (see VILLAIN_PLATE_ART) trims that for a
        // plate art with invisible padding baked into its canvas, scaled down in `mini`
        // since that art also renders roughly a third smaller there.
        marginTop: (mini ? 4 : 6) - (mini ? Math.round((art.nameLift || 0) * .67) : (art.nameLift || 0)),
      }}>
        <div style={{ gridArea: '1 / 1', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', opacity: inClash ? 0 : 1, transition: 'opacity .3s ease' }}>
          <div className="game-font" style={{ color: '#fff', fontSize: mini ? 18 : 20, fontWeight: 500, lineHeight: 1.1 }}>{name}</div>
          <div className="game-font" style={{ fontSize: mini ? 11.5 : 12, fontWeight: 700, color: 'rgba(255,255,255,.55)', marginTop: 3 }}>{L('Lv')} {level}</div>
        </div>
        {hpMax != null && (
          <div style={{ gridArea: '1 / 1', width: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: inClash ? 1 : 0, transition: 'opacity .3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="heart" size={12} color={THEME.heart} stroke={2.5} />
              <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{hpCur}</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,.55)' }}>/ {hpMax}</span>
            </div>
            <Bar value={hpCur} max={hpMax} color={THEME.heart} track="rgba(255,255,255,.22)" height={7} />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// The shield in the gap between the two plates — a painted badge (laurel wreath, gem, VS
// lettering baked in), not a CSS hexagon. It flips in alongside the two fighters as they
// slide (see jx-vs-flip in joanx.css); on the result strip it re-mounts with the same class,
// so a rematch turns the badge again rather than dropping a static one in.
// `delay` is the wait before it turns, in seconds — it belongs to the SCREEN, not to the
// badge. It is 0 on both screens now and the prop stays only because that is a property of
// the screen, not a constant: the versus stage starts the flip with the plates because they
// share a curve and are meant to settle together, and the result strip has no entrance to
// wait for at all. Anything above 0 re-opens the gap that made the old badge read as late.
// `pulse` (Battle-loading dev idea, see LOADING_STYLES) swaps in a slow continuous breathe
// instead of the one-shot turn-in — it takes over the flip entirely rather than playing
// after it, a fine trade for an unshipped Tweaks demo, not something worth a wrapper div for.
function Shield({ size = 62, delay = 0, hits, pulse }) {
  return (
    <img src="/assets/battle/vs-shield.png" alt="VS"
      className={pulse ? 'jx-badge-pulse' : hits ? 'jx-shield-hits' : 'jx-vs-flip'}
      style={{ width: size, height: size, flexShrink: 0, display: 'block', animationDelay: `${delay}s` }} />
  );
}

// ── Streak Attack — a mark per blow, thrown across the gap ────────────────
// Positioned children carry no top/left of their own, so they land centred in
// the gap the same way StageUpMoment's burst/ring do: an absolutely-positioned
// child with every inset auto takes its flex parent's centring as its static
// position. The travelling dot's own keyframe owns the whole motion (start to
// end); the burst and damage number are static at the ARRIVAL point instead —
// stacking a still offset with a running scale/float animation on the same
// element would fight over the `transform` property, so each gets its own div.
function StreakFx({ events }) {
  return events.map(e => {
    const up = e.side === 'foe';    // foe took the hit → buddy threw it → travels UP
    const color = up ? THEME.brand : THEME.danger;
    const endY = up ? -44 : 44;
    return (
      <React.Fragment key={e.id}>
        <div className={up ? 'jx-streak-up' : 'jx-streak-down'} style={{ position: 'absolute', width: 12, height: 12, borderRadius: 999, background: color }} />
        <div style={{ position: 'absolute', transform: `translateY(${endY}px)` }}>
          <div className="jx-hit-burst" style={{ width: 28, height: 28, borderRadius: 999, background: color, animationDelay: '.3s' }} />
        </div>
        {e.dmg > 0 && (
          <div style={{ position: 'absolute', transform: `translateY(${endY - 6}px)` }}>
            <div className="game-font jx-dmg-float" style={{ fontSize: 13, fontWeight: 700, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,.6)', whiteSpace: 'nowrap', animationDelay: '.32s' }}>-{e.dmg}</div>
          </div>
        )}
      </React.Fragment>
    );
  });
}

// ── Charge Burst — no per-hit shake; one flare on the blow that ends it ───
// Colour reads the outcome the instant it lands: gold for the villain going
// down, danger-red for the buddy going down — same win/lose the shake styles
// already carry, just spent on a single flash instead of five small hits.
function ChargeBurst({ event }) {
  if (!event) return null;
  const color = event.side === 'foe' ? THEME.gold : THEME.danger;
  return (
    <React.Fragment>
      <div className="jx-flash-pulse" style={{ position: 'absolute', width: 320, height: 200, background: `radial-gradient(circle, ${color}55 0%, transparent 70%)` }} />
      <div className="jx-burst" style={{ position: 'absolute', width: 220, height: 220, borderRadius: 999, background: `radial-gradient(circle, ${color}99 0%, transparent 66%)` }} />
    </React.Fragment>
  );
}

// ── Momentum Meter — a tug-of-war bar instead of a fight ───────────────────
// Reads live hp share, not raw hp, so a levelled-up buddy's bigger max doesn't
// make the bar misleadingly "fuller" — half hp is half the bar for either side.
function MomentumBar({ meCur, meMax, foeCur, foeMax }) {
  const meShare = meMax ? meCur / meMax : .5;
  const foeShare = foeMax ? foeCur / foeMax : .5;
  const pct = Math.round((meShare / (meShare + foeShare || 1)) * 100);
  return (
    <div style={{ width: 168, height: 10, borderRadius: 999, overflow: 'hidden', display: 'flex', background: 'rgba(255,255,255,.2)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.25)' }}>
      <div style={{ width: `${pct}%`, background: THEME.brand, transition: 'width .55s cubic-bezier(.4,.05,.25,1)' }} />
      <div style={{ width: `${100 - pct}%`, background: THEME.danger, transition: 'width .55s cubic-bezier(.4,.05,.25,1)' }} />
    </div>
  );
}

// ── Battle-loading demos (Tweaks-only, see LOADING_STYLES) ─────────────────

// PERCENT (dev idea) — a literal progress readout: a thin ring fills 0→100 while the
// number counts up beside it, looping so the demo never actually finishes. rAF rather
// than a CSS animation so the digits and the ring stay on the exact same frame.
function LoadingPercent() {
  const [pct, setPct] = React.useState(0);
  React.useEffect(() => {
    let raf, t0;
    const dur = 1800;
    const step = (t) => {
      if (t0 == null) t0 = t;
      setPct(Math.round((((t - t0) % dur) / dur) * 100));
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);
  const r = 14, c = 2 * Math.PI * r;
  return (
    <div className="jx-content-in" style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(20,18,26,.55)', borderRadius: 999, padding: '5px 12px 5px 8px' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
        <circle cx="16" cy="16" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" />
        <circle cx="16" cy="16" r={r} fill="none" stroke={THEME.gold} strokeWidth="3" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff', minWidth: 30 }}>{pct}%</span>
    </div>
  );
}

// CHARGE HOLD (alternative) — no number tied to nothing real: a short line of text carries
// the wait instead of a counter. The dots are a plain interval, not CSS, so this stays a
// small, removable demo rather than a new keyframe added to joanx.css. Bare text + shadow,
// not a chip — every other label on this screen (names, Lv, HP) reads the same way, so a
// pill here would be the one card floating on an otherwise chrome-free scene. Pulled in
// tight under the badge (see the absolute offset where this renders, below) rather than
// floating alone in the open grass, so it reads as the badge's own caption.
function LoadingCharge() {
  const [dots, setDots] = React.useState(1);
  React.useEffect(() => {
    const id = setInterval(() => setDots(d => (d % 3) + 1), 450);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="jx-content-in game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>
      {L('Rolling the fight')}{'.'.repeat(dots)}
    </div>
  );
}

function BannerStage({ me, foe, result, won, clash, hp, clashStyle = 'impact', loadingStyle = 'pulse' }) {
  const foeChar = { id: foe.id, species: foe.species, stage: 2, color: foe.color, level: foe.level, name: foe.name };
  // Classic keeps the mascot-shake choreography; every other style holds both
  // mascots still and carries the hit through its own fx instead (streak marks,
  // a charge flare, a momentum bar) — see the style switch in the gap, below.
  const shake = clashStyle === 'classic';
  const { events: hitEvents, lastHit } = useHitEvents(hp, !!clash);
  const decisiveHit = hitEvents.find(e => e.decisive);
  // the pre-tap standoff — no clash rolled yet — is also where a real server round-trip
  // would sit, so the "charge hold" loading demo sits in the same beat rather than adding
  // a new one. It does NOT also borrow the charging aura ring below: on a plain mascot
  // (no clash context) that ring read as decoration rather than a fight signal, so the
  // hold stays text-only — the ring is reserved for the Charge Burst clash style.
  const waiting = !result && !clash;
  const charging = clashStyle === 'charge' && !!clash;
  // Impact Numbers — the hit fighter itself bounces and a real "-N" (off the same hp track
  // the bar reads) floats off it, instead of anything happening in the gap between them.
  const impact = clashStyle === 'impact';
  const foeHits = impact ? hitEvents.filter(e => e.side === 'foe') : null;
  const meHits = impact ? hitEvents.filter(e => e.side === 'me') : null;

  // RESULT — the fold. Both plates on one row, the shield between them, no bleed: a strip
  // that says who fought, not a stage. Buddy on the left because the sentence the result
  // screen tells is "you beat them", read left to right. No slide-in either — this is not
  // an entrance, it is what the entrance settled into.
  if (result) {
    // Full-bleed to the phone edges (cancels the result screen's 24px gutter) and the shield
    // sits ON the seam rather than in a gap between: every pixel of width goes to the two
    // painted banners, which is the only way they read as banners at this height.
    return (
      <div style={{ width: 'calc(100% + 48px)', margin: '0 -24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Plate char={me} name={me.name} level={me.level}
            art={PLATE_ART.green} ornament="right" mood="happy" mini
            dim={!won} pop={won} />
        </div>
        {/* overlapping the seam by 10px a side, not spacing the two apart — the shield
            should cost the banners as little width as possible. Lifted well off the seam
            so it sits toward the top of the two plates rather than on their shared centre. */}
        <div style={{ margin: '-46px -10px 0', zIndex: 2, flexShrink: 0 }}><Shield size={58} /></div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Plate char={foeChar} name={L(foe.name)} level={foe.level}
            art={plateFor(foe.id)} ornament="left" mood="alert" mini
            dim={won} pop={false} />
        </div>
      </div>
    );
  }

  return (
    // full-bleed to the phone edges (cancels the versus screen's 24px gutter) so a plate
    // pinned to an edge actually reaches it — the stagger needs the real screen width
    <div style={{ width: '100%', margin: '0 -24px', display: 'flex', flexDirection: 'column' }}>
      {/* villain on TOP — RED autumn plate (ornament left), mascot leaning right. Enters
          from the right (position-based, so the top card always slides in from the right). */}
      <Plate char={foeChar} name={L(foe.name)} level={foe.level}
        art={plateFor(foe.id)} ornament="left" mood="alert" enterFrom="right"
        inClash={!!clash}
        clashClass={shake ? (clash && (clash === 'win' ? 'jx-clash-top-lose' : 'jx-clash-top-win')) : null}
        koClass={clash === 'win' ? 'jx-ko' : null}
        charging={charging} auraColor={THEME.danger}
        hits={foeHits} bounceKey={impact ? lastHit.foe : null}
        hpCur={hp?.foeCur} hpMax={hp?.foeMax} />

      {/* the shield sits in the gap alone — no rule behind it. The two plates already read
          as two sides; the gap is sized so the shield floats clear of both rather than
          resting on a mascot, which breaks the neighbouring plate's top edge. Sized up so
          it reads as the centrepiece of the gap, not a small badge lost in it — and centred
          with NO extra margin: `justifyContent: 'center'` on a fixed-height box already puts
          equal space above and below the badge inside this box, so the badge sits equidistant
          from the villain's caption (which lives inside this gap, above the badge) and the
          buddy's plate (which follows right after, below it) without any manual nudge. A
          negative marginTop here previously pulled the whole box — badge AND the buddy plate
          that follows it in flow — up as one unit, which only ever widened the bottom gap
          relative to the top one; it did not "balance" anything.
          Non-classic styles layer their own fx here instead of shaking the plates — a shared
          centre because that is where the two fighters' blows meet. */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 128, zIndex: 2 }}>
        {/* starts with the plates, not after them: the flip runs the same .6s on the same
            curve, so badge and banners decelerate together and stop on the same frame.
            The per-hit growth pulse is Classic/Streak only — Charge and Momentum carry
            the hit their own way and a badge also flinching on every blow doubles up. */}
        <Shield size={76} hits={!!clash && (clashStyle === 'classic' || clashStyle === 'streak')}
          pulse={waiting && loadingStyle === 'pulse'} />
        {clashStyle === 'streak' && <StreakFx events={hitEvents} />}
        {clashStyle === 'charge' && <ChargeBurst event={decisiveHit} />}
        {clashStyle === 'momentum' && clash && (
          <MomentumBar meCur={hp?.meCur} meMax={hp?.meMax} foeCur={hp?.foeCur} foeMax={hp?.foeMax} />
        )}
        {/* Battle-loading demo, Tweaks-only — see LOADING_STYLES. Sits in the same standoff
            a real server round-trip would occupy, so any concept can be judged against the
            actual screen rather than a mock. Only the two caption styles need anything
            rendered here (absolutely positioned off the badge's own centre, not a flex
            sibling, so showing one never nudges the badge itself off the true midpoint
            between the two banners) — "Badge pulse" has no caption at all, it's handled
            entirely by the `pulse` prop passed straight into <Shield> above. */}
        {waiting && (loadingStyle === 'percent' || loadingStyle === 'charge') && (
          <div style={{ position: 'absolute', top: 'calc(50% + 46px)', left: '50%', transform: 'translateX(-50%)' }}>
            {loadingStyle === 'percent' ? <LoadingPercent /> : <LoadingCharge />}
          </div>
        )}
      </div>

      {/* buddy (our hero) on BOTTOM — GREEN grove plate (ornament right), mascot leaning
          left. Enters from the left (bottom card always slides in from the left). */}
      <Plate char={me} name={me.name} level={me.level}
        art={PLATE_ART.green} ornament="right" mood="happy" enterFrom="left"
        inClash={!!clash}
        clashClass={shake ? (clash && (clash === 'win' ? 'jx-clash-bot-win' : 'jx-clash-bot-lose')) : null}
        koClass={clash === 'lose' ? 'jx-ko' : null}
        charging={charging} auraColor={THEME.brand}
        hits={meHits} bounceKey={impact ? lastHit.me : null}
        hpCur={hp?.meCur} hpMax={hp?.meMax} />
    </div>
  );
}

// ── entry point ──────────────────────────────────────────────────────────
// `me` and `foe` are already flattened by Battle.jsx (name / level /
// species / colour), so no layout here reaches back into PLAYER or the villain
// ladder — the result screen fights a frozen opponent and this must not undo it.
function VersusStage({ variant = 'classic', clashStyle = 'impact', loadingStyle = 'pulse', me, foe, result, won, clash, hp }) {
  if (variant === 'banner') return <BannerStage me={me} foe={foe} result={result} won={won} clash={clash} hp={hp} clashStyle={clashStyle} loadingStyle={loadingStyle} />;
  return <ClassicStage me={me} foe={foe} result={result} won={won} />;
}

export { VersusStage, VERSUS_LAYOUTS, CLASH_STYLES, LOADING_STYLES };
