// JoanX — child app · the VERSUS moment (fight staging)
//
// The two seconds after "Start battle" and before the roll: who is fighting whom.
// `classic` is the baseline that shipped — both fighters side by side, VS between.
// `banner` stacks them instead: a painted plate per fighter, the mascot standing on it
// and breaking its top edge, name + power below, a shield in the gap. Switch via Tweaks
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
// `mini` is the result-screen fold: the plate keeps its painted scene and its mascot but
// drops every device that only pays off at full size — the off-screen bleed, the lean, the
// stat medallions — and sits centred in its half of a row instead.
function Plate({ char, name, level, power, art, ornament, mood, dim, pop, mini, enterFrom, note, clashClass, koClass }) {
  const ornLeft = ornament === 'left';
  const mSize = mini ? 88 : 132;
  // how far the plate runs PAST its pinned screen edge — the extra push that makes the
  // stagger read as a hard diagonal rather than two plates merely offset. The medallions
  // below are shifted inward by the same amount so they never ride off with the bleed.
  const bleed = mini ? 0 : 30;
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
    // diagonal the reference is built on. Medallions and name stay on the inset side, on-screen.
    <div className={`${enterFrom === 'left' ? 'jx-slide-left' : enterFrom === 'right' ? 'jx-slide-right' : ''}${clashClass ? ' ' + clashClass : ''}`} style={{
      opacity: dim ? .42 : 1, transition: 'opacity .4s',
      width: mini ? '100%' : '95%', alignSelf: mini ? 'center' : (ornLeft ? 'flex-end' : 'flex-start'),
      marginRight: ornLeft ? -bleed : 0, marginLeft: ornLeft ? 0 : -bleed,
    }}>
      {/* Two layers, because the loser is doing two things at once and they cannot share a
          `transform`. The OUTER element is the fight — it is being driven around by the clash
          keyframes. This one is the plate coming apart, and it has to run over the top of that
          movement rather than replace it. One wrapper, and the two compose. */}
      <div className={koClass || undefined}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* the scene, at its own aspect — the plate's height is the art's height at this
            width. The buddy art is drawn ornament-right and flipped to put it left. */}
        <img src={art.src} alt="" style={{ display: 'block', width: '100%', height: 'auto', transform: art.flip ? 'scaleX(-1)' : 'none' }} />

        {/* the mascot stands on the scene and breaks its top edge — the move the whole
            layout is built on. Nudged away from the ornament so it stands on open ground
            rather than in the scroll. */}
        <div className={pop ? 'jx-pop' : ''} style={{
          position: 'absolute', bottom: mini ? 0 : 6, left: `calc(50% + ${lean}px)`, transform: 'translateX(-50%)',
        }}>
          <Mascot species={char.species} stage={char.stage} color={char.color} mood={mood} size={mSize} />
        </div>

        {/* medallions on the outer bottom corner, half below the plate. Inset by bleed+14
            from the plate edge so they clear the off-screen bleed and land 14px in-screen. */}
        {!mini && (
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
        // the name tracks its mascot's lean exactly (no extra nudge in the strip) so the two
        // read as one stacked unit under each banner
        transform: mini ? `translateX(${lean}px)` : `translateX(${lean + (ornLeft ? -30 : 30)}px)`,
        // clears the medallions, which hang ~17px below the plate on the opposite corner
        marginTop: mini ? 4 : 6,
      }}>
        <div className="game-font" style={{ color: '#fff', fontSize: mini ? 18 : 20, fontWeight: 500, lineHeight: 1.1 }}>{name}</div>
        <div className="game-font" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
          <Icon name="zap" size={mini ? 14 : 15} color={THEME.gold} stroke={2.5} />
          <span style={{ fontSize: mini ? 18.5 : 22, fontWeight: 500, color: THEME.gold, lineHeight: 1 }}>{power}</span>
          <span style={{ fontSize: mini ? 11.5 : 12, fontWeight: 700, color: 'rgba(255,255,255,.55)' }}>· {L('Lv')} {level}</span>
        </div>
      </div>
      {/* OUTSIDE the name block, and deliberately so. That block is shoved 60px right of centre
          (lean + 30) to sit under a mascot that leans the same way — fine for two short lines,
          but the charge readout is a wide pill, and riding that offset put it half off the phone.
          It centres on the plate instead. */}
      {note}
      </div>
    </div>
  );
}

// The power number counting up through the safe-walk bonus. rAF rather than a CSS transition
// because the thing being animated is the VALUE, not a style — and the value is the point:
// a child watching 352 become 392 is watching this morning's walk being spent.
// It lands exactly on `to` on the final frame rather than wherever the clock happened to be,
// so the number the charge settles on is always the number the fight is rolled against.
function useCountUp(from, to, ms, run) {
  const [v, setV] = React.useState(to);
  React.useEffect(() => {
    if (!run || from === to) { setV(to); return; }
    let raf, t0;
    const step = (t) => {
      if (t0 == null) t0 = t;
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [from, to, ms, run]);
  return v;
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
function Shield({ size = 62, delay = 0, hits }) {
  return (
    <img src="/assets/battle/vs-shield.png" alt="VS" className={hits ? 'jx-shield-hits' : 'jx-vs-flip'}
      style={{ width: size, height: size, flexShrink: 0, display: 'block', animationDelay: `${delay}s` }} />
  );
}

function BannerStage({ me, foe, result, won, charge, clash }) {
  const foeChar = { species: foe.species, stage: 2, color: foe.color, level: foe.level, name: foe.name };

  // CHARGE — the buddy's power counting up through the safe-walk bonus, and the chance that
  // total buys. The result screen already prints all of this, but as a receipt, after it has
  // stopped mattering. Here it lands in the one second a child is actually leaning in, which
  // is the only moment "you are at 392 instead of 352 because you walked safe today" is worth
  // saying. Same numbers, same source (lastMath / live in Battle.jsx) — read earlier.
  const shownPower = useCountUp(me.power, me.power + (charge?.bonus || 0), 900, !!charge);

  // RESULT — the fold. Both plates on one row, the shield between them, no bleed and no
  // medallions: a strip that says who fought, not a stage. Buddy on the left because the
  // sentence the result screen tells is "you beat them", read left to right. No slide-in
  // either — this is not an entrance, it is what the entrance settled into.
  if (result) {
    // Full-bleed to the phone edges (cancels the result screen's 24px gutter) and the shield
    // sits ON the seam rather than in a gap between: every pixel of width goes to the two
    // painted banners, which is the only way they read as banners at this height.
    return (
      <div style={{ width: 'calc(100% + 48px)', margin: '0 -24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Plate char={me} name={me.name} level={me.level} power={me.power}
            art={PLATE_ART.green} ornament="right" mood="happy" mini
            dim={!won} pop={won} />
        </div>
        {/* overlapping the seam by 10px a side, not spacing the two apart — the shield
            should cost the banners as little width as possible. Lifted well off the seam
            so it sits toward the top of the two plates rather than on their shared centre. */}
        <div style={{ margin: '-46px -10px 0', zIndex: 2, flexShrink: 0 }}><Shield size={58} /></div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
          <Plate char={foeChar} name={L(foe.name)} level={foe.level} power={foe.power}
            art={PLATE_ART.red} ornament="left" mood="alert" mini
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
      <Plate char={foeChar} name={L(foe.name)} level={foe.level} power={foe.power}
        art={PLATE_ART.red} ornament="left" mood="alert" enterFrom="right"
        clashClass={clash && (clash === 'win' ? 'jx-clash-top-lose' : 'jx-clash-top-win')}
        koClass={clash === 'win' ? 'jx-ko' : null} />

      {/* the shield sits in the gap alone — no rule behind it. The two plates already read
          as two sides; the gap is sized so the shield floats clear of both rather than
          resting on a mascot, which breaks the neighbouring plate's top edge. Nudged up a
          touch and sized up so it reads as the centrepiece of the gap, not a small badge
          lost in it. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 128, zIndex: 2, marginTop: -14 }}>
        {/* starts with the plates, not after them: the flip runs the same .6s on the same
            curve, so badge and banners decelerate together and stop on the same frame */}
        <Shield size={76} hits={!!clash} />
      </div>

      {/* buddy (our hero) on BOTTOM — GREEN grove plate (ornament right), mascot leaning
          left. Enters from the left (bottom card always slides in from the left). */}
      <Plate char={me} name={me.name} level={me.level} power={shownPower}
        art={PLATE_ART.green} ornament="right" mood="happy" enterFrom="left"
        clashClass={clash && (clash === 'win' ? 'jx-clash-bot-win' : 'jx-clash-bot-lose')}
        koClass={clash === 'lose' ? 'jx-ko' : null}
        note={
          // The BOX is always here, empty or not. The versus column is centre-justified, so a
          // block that only mounts at 620ms re-centres the whole stage and jerks both plates
          // upward at the exact moment the child starts reading them. Holding the height from
          // the first frame keeps the stage still and lets the readout simply fade in.
          <div style={{ height: 44, marginTop: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            {charge && (
              // Two lines, both earned: what the walk added, and what the total buys. The bonus
              // is gold like the power it just fed; the chance is quieter, because it is context
              // for that number rather than a second headline competing with it.
              <React.Fragment>
                <div className="jx-content-in" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(20,18,26,.55)', borderRadius: 999, padding: '4px 11px' }}>
                  <Icon name="footprints" size={12} color={THEME.gold} stroke={2.4} />
                  <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.gold, lineHeight: 1 }}>+{charge.bonus}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}>{L('Safe-walk bonus')}</span>
                </div>
                <div className="jx-content-in" style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.75)', textShadow: '0 1px 4px rgba(0,0,0,.5)', animationDelay: '.08s' }}>
                  {L('Your chance')} {charge.odds}%
                </div>
              </React.Fragment>
            )}
          </div>
        } />
    </div>
  );
}

// ── entry point ──────────────────────────────────────────────────────────
// `me` and `foe` are already flattened by Battle.jsx (name / level / power /
// species / colour), so no layout here reaches back into PLAYER or the villain
// ladder — the result screen fights a frozen opponent and this must not undo it.
function VersusStage({ variant = 'classic', me, foe, result, won, charge, clash }) {
  if (variant === 'banner') return <BannerStage me={me} foe={foe} result={result} won={won} charge={charge} clash={clash} />;
  return <ClassicStage me={me} foe={foe} result={result} won={won} />;
}

export { VersusStage, VERSUS_LAYOUTS };
