// JoanX — child app · the VERSUS moment (fight staging)
//
// The two seconds after "Start battle" and before the roll: who is fighting whom.
// `classic` is the baseline that shipped — both fighters side by side, VS between.
// `banner` stacks them instead: a painted plate per fighter, the mascot standing on it
// and breaking its top edge, name + power below, a shield in the gap. Switch via Tweaks
// ("Versus screen").
//
// Both layouts render the SAME block on both the versus phase and the result
// phase — the result screen is the versus screen with the outcome written under
// it, so the fighters must not jump position between the two. `result` only
// changes the scale (the result screen has the battle math and rewards to fit
// underneath) and dims the loser.
//
// System notes: no decorative sparkle, and the only thing that moves is the winner's
// mascot on the result. The plates are painted assets (see PLATE_ART) rather than CSS
// fills — the buddy stands on the autumn plate and the villain on the grove plate, a
// fixed pairing so the two scenes read as "your side / their side" like team colours.

import React from 'react';
import { STATS, statsFor } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';

const VERSUS_LAYOUTS = [
  { id: 'classic', label: 'Classic' },
  { id: 'banner', label: 'Banner' },
];

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

// one tint per stat, keyed by the stat itself rather than by its position in the row —
// a stat has to keep its colour whatever else is or isn't being shown next to it
const STAT_TINT = { hp: THEME.heart, courage: THEME.joy, protection: THEME.brand, speed: THEME.rRare };
const tintOf = (key) => STAT_TINT[key] || THEME.fg3;

// HP is off the medallion row. It is not on the same scale as the other three —
// data.jsx gives it its own ceiling precisely because "HP runs several times higher"
// — so a 157 sitting next to a 58 read as the one stat that mattered when it is just
// the one measured differently. Still shown everywhere it has a bar to be judged
// against; here, where the numbers are bare, the three comparable ones tell the truth.
const MEDALLION_STATS = STATS.filter(t => t.key !== 'hp');

// ── classic — the baseline, both fighters on one row ─────────────────────

function ClassicStage({ me, foe, result, won }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-around' }}>
      <div style={{ textAlign: 'center', opacity: result && !won ? .4 : 1, transition: 'opacity .4s' }}>
        <div className={result && won ? 'jx-pop' : ''}><Mascot species={me.species} stage={me.stage} color={me.color} size={120} /></div>
        <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{me.name}</div>
        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {me.level} · PWR {me.power}</div>
      </div>
      <div className="game-font" style={{ color: THEME.gold, fontSize: 26, fontWeight: 500 }}>VS</div>
      <div style={{ textAlign: 'center', opacity: result && won ? .4 : 1, transition: 'opacity .4s' }}>
        <div style={{ transform: 'scaleX(-1)' }}><Mascot species={foe.species} stage={2} color={foe.color} mood="alert" size={120} /></div>
        <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{L(foe.name)}</div>
        <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {foe.level} · PWR {foe.power}</div>
      </div>
    </div>
  );
}

// ── banner — a painted plate per fighter, stacked, a shield between ───────

// The three core stats as medallions (HP is off the row, see MEDALLION_STATS). They ride
// the plate's bottom edge, half outside it, on the side AWAY from the ornament — the
// ornament corner is already the busy end of the scene, and stacking numbers on top of it
// is the one place they cannot be read. Read through statsFor, so a stat added to the
// registry appears here too.
function Medallions({ c, size = 40 }) {
  const s = statsFor(c);
  return (
    <div style={{ display: 'flex', gap: 7 }}>
      {MEDALLION_STATS.map(t => (
        <div key={t.key} style={{
          width: size, height: size, borderRadius: 999, background: '#20201d',
          border: `1.5px solid ${tintOf(t.key)}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={t.icon} size={13} color={tintOf(t.key)} stroke={2.4} />
          <span className="game-font" style={{ fontSize: 11, fontWeight: 500, color: '#fff', lineHeight: 1 }}>{s[t.key]}</span>
        </div>
      ))}
    </div>
  );
}

// One fighter: the painted plate, its mascot standing centre-stage and breaking the top
// edge, the stat medallions on the plate's outer bottom corner, and the name + power
// BELOW the plate. Nothing sits over the middle of the scene, so no scrim is needed —
// the name reads on the dark backdrop under the art, not on a sunlit sky inside it.
// `ornament` says which corner the painted scroll is in; the mascot leans the other way
// and the medallions take the opposite bottom corner, so neither lands on the ornament.
function Plate({ char, name, level, power, art, ornament, mood, dim, pop, compact, enterFrom }) {
  const ornLeft = ornament === 'left';
  const mSize = compact ? 104 : 132;
  // how far the plate runs PAST its pinned screen edge — the extra push that makes the
  // stagger read as a hard diagonal rather than two plates merely offset. The medallions
  // below are shifted inward by the same amount so they never ride off with the bleed.
  const bleed = compact ? 18 : 30;
  // which way the mascot (and the name under it) sits off the plate centre. It leans toward
  // the ornament/inset side — into the open scene, AWAY from the bleeding edge — so the fox
  // reads over the autumn sky (not off the right) and the panda over the grove path.
  const lean = ornLeft ? -30 : 30;
  return (
    // The two plates are staggered, not stacked flush: each is narrower than the phone and
    // pinned to the edge OPPOSITE its ornament, then pushed further past that edge. Buddy
    // (ornament left) pins + bleeds RIGHT; villain (ornament right) pins + bleeds LEFT — the
    // diagonal the reference is built on. Medallions and name stay on the inset side, on-screen.
    <div className={enterFrom === 'left' ? 'jx-slide-left' : 'jx-slide-right'} style={{
      opacity: dim ? .42 : 1, transition: 'opacity .4s',
      width: compact ? '90%' : '95%', alignSelf: ornLeft ? 'flex-end' : 'flex-start',
      marginRight: ornLeft ? -bleed : 0, marginLeft: ornLeft ? 0 : -bleed,
    }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* the scene, at its own aspect — the plate's height is the art's height at this
            width. The buddy art is drawn ornament-right and flipped to put it left. */}
        <img src={art.src} alt="" style={{ display: 'block', width: '100%', height: 'auto', transform: art.flip ? 'scaleX(-1)' : 'none' }} />

        {/* the mascot stands on the scene and breaks its top edge — the move the whole
            layout is built on. Nudged away from the ornament so it stands on open ground
            rather than in the scroll. */}
        <div className={pop ? 'jx-pop' : ''} style={{
          position: 'absolute', bottom: compact ? 2 : 6, left: `calc(50% + ${lean}px)`, transform: 'translateX(-50%)',
        }}>
          <Mascot species={char.species} stage={char.stage} color={char.color} mood={mood} size={mSize} />
        </div>

        {/* medallions on the outer bottom corner, half below the plate. Inset by bleed+14
            from the plate edge so they clear the off-screen bleed and land 14px in-screen. */}
        {!compact && (
          <div style={{ position: 'absolute', bottom: -16, [ornLeft ? 'right' : 'left']: bleed - 8 }}>
            <Medallions c={char} />
          </div>
        )}
      </div>

      {/* name + power below the plate, CENTERED under the mascot — the mascot leans off the
          plate centre by `lean`, and the name tracks it by the same shift, so the two read as
          one stacked unit rather than the name drifting to a corner. */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        // extra nudge on the name block only (not the mascot): buddy pulls further
        // left, villain further right, so each label sits tucked toward its own side.
        transform: `translateX(${lean + (ornLeft ? -30 : 30)}px)`,
        // clears the medallions, which hang ~17px below the plate on the opposite corner
        marginTop: compact ? 2 : 6,
      }}>
        <div className="game-font" style={{ color: '#fff', fontSize: compact ? 17 : 20, fontWeight: 500, lineHeight: 1.1 }}>{name}</div>
        <div className="game-font" style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
          <Icon name="zap" size={15} color={THEME.gold} stroke={2.5} />
          <span style={{ fontSize: compact ? 18 : 22, fontWeight: 500, color: THEME.gold, lineHeight: 1 }}>{power}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.55)' }}>· {L('Lv')} {level}</span>
        </div>
      </div>
    </div>
  );
}

// The shield in the gap between the two plates. Flat gold on a hexagon — no glow, no
// shine sweep; it marks where the two sides meet, not an effect.
function Shield({ size = 62 }) {
  const hex = 'polygon(50% 0, 100% 26%, 100% 74%, 50% 100%, 0 74%, 0 26%)';
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: 0, background: THEME.gold, clipPath: hex }} />
      <div style={{ position: 'absolute', inset: 3, background: '#20201d', clipPath: hex, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="game-font" style={{ fontSize: size * .34, fontWeight: 500, color: THEME.gold, letterSpacing: .5 }}>VS</span>
      </div>
    </div>
  );
}

function BannerStage({ me, foe, result, won }) {
  const foeChar = { species: foe.species, stage: 2, color: foe.color, level: foe.level, name: foe.name };
  return (
    // full-bleed to the phone edges (cancels the versus screen's 24px gutter) so a plate
    // pinned to an edge actually reaches it — the stagger needs the real screen width
    <div style={{ width: '100%', margin: '0 -24px', display: 'flex', flexDirection: 'column' }}>
      {/* villain on TOP — RED autumn plate (ornament left), mascot leaning right. Enters
          from the right (position-based, so the top card always slides in from the right). */}
      <Plate char={foeChar} name={L(foe.name)} level={foe.level} power={foe.power}
        art={PLATE_ART.red} ornament="left" mood="alert" enterFrom="right"
        dim={result && won} pop={false} compact={result} />

      {/* the shield sits in the gap alone — no rule behind it. The two plates already read
          as two sides; the gap is sized so the shield floats clear of both rather than
          resting on a mascot, which breaks the neighbouring plate's top edge. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: result ? 80 : 128, zIndex: 2 }}>
        <Shield size={result ? 52 : 64} />
      </div>

      {/* buddy (our hero) on BOTTOM — GREEN grove plate (ornament right), mascot leaning
          left. Enters from the left (bottom card always slides in from the left). */}
      <Plate char={me} name={me.name} level={me.level} power={me.power}
        art={PLATE_ART.green} ornament="right" mood="happy" enterFrom="left"
        dim={result && !won} pop={result && won} compact={result} />
    </div>
  );
}

// ── entry point ──────────────────────────────────────────────────────────
// `me` and `foe` are already flattened by Battle.jsx (name / level / power /
// species / colour), so no layout here reaches back into PLAYER or the villain
// ladder — the result screen fights a frozen opponent and this must not undo it.
function VersusStage({ variant = 'classic', me, foe, result, won }) {
  if (variant === 'banner') return <BannerStage me={me} foe={foe} result={result} won={won} />;
  return <ClassicStage me={me} foe={foe} result={result} won={won} />;
}

export { VersusStage, VERSUS_LAYOUTS };
