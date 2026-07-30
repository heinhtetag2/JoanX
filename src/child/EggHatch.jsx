// JoanX — child app · shared egg-hatch motif (A-2 / F-15)
//
// The egg, the cracked shell halves, and the tap/shake-to-hatch interaction.
// Used by the Shop (buy an egg → hatch a collectible) and by Onboarding
// (first buddy arrives as an egg, not as a handout). Animations — jx-egg-hatch,
// jx-egg-bg, jx-press, jx-float, jx-wiggle, jx-burst — live in styles/joanx.css.

import React from 'react';
import { createPortal } from 'react-dom';
import { hatchFromInventory, PLAYER } from '../core/data.jsx';
import { Icon, RARITY, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { sfx } from '../core/sound.jsx';
import { HatchCelebration } from './shared.jsx';

// Each rarity gets its own shell so the three eggs are told apart at a glance,
// not just by their price tag: plain speckles → banded → crowned with stars.
const EGG_SKIN = {
  common: '#d9b98a',   // warm sand
  rare:   '#3fa15c',   // leaf green, not teal — reads as a gem, and sits against the rare
                        // backdrop's forest instead of fighting it the way the old ocean blue did
  epic:   '#7f63c5',   // iris
};
const eggColorFor = (rarity) => EGG_SKIN[rarity] || '#e6a94b';

// Painted hatch backdrops, one per egg tier — shared by the Shop (buying/hatching
// an owned egg) and Onboarding (the first buddy's egg). /assets/egg/ is the standard
// drop folder for this art; a tier missing from this map just keeps the drifting
// jx-egg-bg CSS gradient, so adding one here is the whole job.
const EGG_HATCH_BG = {
  common: '/assets/egg/egg-bg-common.png',
  rare: '/assets/egg/egg-bg-forest2.png',
  epic: '/assets/egg/egg-bg-epic2.png',
  // new candidates not yet assigned to a tier — kept as their own keys so Tweaks →
  // Preview: background can try them against any egg before one gets picked for a tier.
  forest: '/assets/egg/egg-bg-forest.png',
  gold: '/assets/egg/egg-bg-gold.png',
};

const STAR = 'polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%)';

// A soft egg. `rarity` adds that tier's ornament; omit it for the plain shell.
function EggShape({ size = 120, color, rarity }) {
  const epic = rarity === 'epic' && !color;
  const c = color || eggColorFor(rarity);
  // epic gets an iridescent body — violet into magenta into deep indigo — so it
  // reads as legendary next to the flat common/rare shells
  const shell = epic
    ? 'radial-gradient(130% 95% at 30% 20%, #fdf6ff 0%, #d8a9f0 26%, #a97fe4 48%, #7a4fd0 72%, #4a2a8f 100%)'
    : `radial-gradient(120% 90% at 32% 26%, #fff 0%, ${c} 60%, ${shade(c, -22)} 100%)`;
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.28 }}>
      {/* epic — an aura pooled behind the shell */}
      {epic && <div style={{ position: 'absolute', inset: '-14%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,127,247,.45) 0%, rgba(191,127,247,0) 68%)', filter: 'blur(2px)', pointerEvents: 'none' }} />}

      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50% 50% 48% 48% / 62% 62% 38% 38%', background: shell,
        boxShadow: epic
          ? 'inset -7px -10px 18px rgba(40,16,80,.45), inset 6px 8px 20px rgba(255,214,255,.35), 0 12px 26px rgba(74,42,143,.34)'
          : `inset -6px -9px 15px ${shade(c, -30)}55, 0 10px 22px rgba(46,43,41,.16)` }}>

        {/* rare — small flat gem flecks: the exact same recipe as common's speckles below
            (a few single-shade shapes, no gradient, no rotation-heavy composition) so it
            stays exactly as simple, just diamonds instead of dots. That's the whole rung up
            from common — plain became gem-cut — without repeating the earlier attempts'
            mistake of layering gradients/textures onto a shell this small. */}
        {rarity === 'rare' && [[28, 26, 8, .6], [54, 68, 7, .5], [74, 32, 6, .45]].map(([t, l, s, o], i) => (
          <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: s, height: s, background: shade(c, -22), opacity: o, transform: 'rotate(45deg)' }} />
        ))}

        {epic && (
          <React.Fragment>
            {/* magenta iridescence sweeping the lower shell */}
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(80% 60% at 78% 82%, rgba(255,106,193,.55) 0%, rgba(255,106,193,0) 62%)' }} />
            {/* jewelled gold band with a bright specular run */}
            <div style={{ position: 'absolute', top: '45%', left: '-12%', width: '124%', height: '11%', transform: 'rotate(-7deg)', background: 'linear-gradient(90deg,#8a6200 0%,#e0ac1f 18%,#fff3b0 42%,#ffffff 52%,#fff3b0 62%,#e0ac1f 84%,#8a6200 100%)', boxShadow: '0 1px 0 rgba(255,255,255,.5) inset, 0 3px 7px rgba(40,16,80,.35)' }} />
            <div style={{ position: 'absolute', top: '47.5%', left: '-12%', width: '124%', height: '1.6%', transform: 'rotate(-7deg)', background: 'rgba(255,255,255,.85)', opacity: .7 }} />
            {/* graded star flecks — a few bright, a few faint, none uniform */}
            {[[20, 24, 13, 1], [30, 72, 9, .95], [63, 20, 8, .85], [70, 68, 12, 1], [82, 42, 7, .7], [52, 84, 6, .6], [88, 74, 5, .5]].map(([t, l, s, o], i) => (
              <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: s, height: s, background: '#fff6c9', opacity: o, clipPath: STAR, filter: i % 3 === 0 ? 'drop-shadow(0 0 3px #ffe680)' : 'none' }} />
            ))}
          </React.Fragment>
        )}

        {/* common — plain speckles */}
        {(!rarity || rarity === 'common') && [[34, 26, 7, 9, .5], [54, 62, 6, 8, .45], [70, 38, 5, 6, .4]].map(([t, l, w, h, o], i) => (
          <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: w, height: h, borderRadius: '50%', background: shade(c, -20), opacity: o }} />
        ))}

        <div style={{ position: 'absolute', top: '15%', left: '22%', width: '22%', height: '15%', borderRadius: '50%', background: 'rgba(255,255,255,.7)', transform: 'rotate(-18deg)', filter: 'blur(1px)' }} />
      </div>
    </div>
  );
}

// A cracked eggshell half — sits under the hatched buddy so the reveal reads
// as "just came out of the egg".
function EggHalf({ color, flip }) {
  return (
    <div style={{ position: 'relative', width: 72, height: 40 }}>
      <div style={{ width: '100%', height: '100%', background: `radial-gradient(130% 150% at 42% 0%, #fff 0%, ${color} 66%, ${shade(color, -22)} 100%)`, clipPath: 'polygon(0 32%, 13% 4%, 27% 30%, 41% 2%, 55% 30%, 69% 2%, 83% 28%, 100% 8%, 100% 100%, 0 100%)', borderRadius: '0 0 36px 36px / 0 0 44px 40px', transform: `rotate(${flip ? 15 : -15}deg)`, boxShadow: `inset 0 -6px 10px ${shade(color, -26)}44` }} />
      {[[52, 34, 5, 6], [70, 62, 4, 5]].map(([t, l, w, h], i) => (
        <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: w, height: h, borderRadius: '50%', background: shade(color, -20), opacity: .4 }} />
      ))}
    </div>
  );
}

// iOS 13+ gates devicemotion behind a permission that must be asked from a
// user gesture. Best-effort: on refusal (or older browsers) tapping still works.
function requestMotionPermission() {
  try {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission().catch(() => {});
    }
  } catch { /* unsupported — tap is the fallback */ }
}

// Shake-to-hatch: while `active`, a firm phone shake fires `onShake` (throttled).
function useShakeToHatch(active, onShake) {
  const cb = React.useRef(onShake);
  cb.current = onShake;
  React.useEffect(() => {
    if (!active) return;
    let last = null, lastFire = 0;
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      const now = Date.now();
      if (last && now - lastFire > 600) {
        const jolt = Math.abs((a.x || 0) - last.x) + Math.abs((a.y || 0) - last.y) + Math.abs((a.z || 0) - last.z);
        if (jolt > 26) { lastFire = now; cb.current(); }
      }
      last = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [active]);
}

// how long the crack animation runs before the buddy pops out. Held a beat longer
// than a reflex-pop so the reveal lands as a surprise, not a blink. Must match
// jxEggHatch in joanx.css.
const HATCH_MS = 1250;
// the "Gradual crack" tweak runs longer still — the anticipation IS the feature, so
// the reveal is held back while the fissure spreads and the tension builds. Must
// match jxEggCrack in joanx.css.
const HATCH_CRACK_MS = 2400;

// The gradual-crack egg (Tweaks: Egg hatch → "Gradual crack"). The shell trembles
// and pops via .jx-egg-crack, a jagged fissure draws itself down the shell, and a
// glow seeps brighter from the seam — so hatching becomes a moment that builds,
// not an instant swap. Same EggShape underneath, so the shell art is unchanged;
// this only layers the crack + light and swaps the animation timing.
function CrackingEgg({ size = 132, rarity, color }) {
  const c = color || eggColorFor(rarity);
  const w = size, h = size * 1.28;
  // a jagged seam down the shell, plus two short branches that spread off it
  const seam = 'M50 6 L45 24 L55 40 L44 58 L57 76 L46 95 L52 116';
  const branchL = 'M55 40 L64 48 L60 62';
  const branchR = 'M44 58 L34 66 L38 80';
  return (
    <div style={{ position: 'relative', width: w, height: h }}>
      {/* light leaking from the seam — sits behind the shell, brightening over time */}
      <div className="jx-crack-glow" style={{ position: 'absolute', inset: '-12%', borderRadius: '50%',
        background: `radial-gradient(circle, ${shade(c, 88)} 0%, ${shade(c, 58)} 32%, transparent 64%)`,
        pointerEvents: 'none', zIndex: 0 }} />
      {/* shell + fissure share one element so the crack shakes and pops WITH the egg */}
      <div className="jx-egg-crack" style={{ position: 'relative', width: '100%', height: '100%', zIndex: 1 }}>
        <EggShape size={size} rarity={rarity} color={color} />
        <svg viewBox="0 0 100 128" width={w} height={h} aria-hidden="true"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {/* dark crack, then a bright inner line so light appears to spill out of it */}
          {[seam, branchL, branchR].map((d, i) => (
            <path key={'d' + i} className={'jx-crack-line' + (i ? ' jx-crack-branch' : '')} d={d}
              fill="none" stroke="rgba(28,16,48,.5)" strokeWidth={i ? 2 : 3} strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {[seam, branchL, branchR].map((d, i) => (
            <path key={'l' + i} className={'jx-crack-line' + (i ? ' jx-crack-branch' : '')} d={d}
              fill="none" stroke={shade(c, 92)} strokeWidth={i ? 0.9 : 1.4} strokeLinejoin="round" strokeLinecap="round" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// The whole egg → crack → reveal moment as one self-contained, portaled overlay — pulled out
// of the Shop (its original and still only OTHER caller) so a second flow (a battle win's
// egg drop) can play the exact same hatch instead of re-building it. `egg` is the inventory
// egg definition to hatch (an `eggById()` result); the egg is only actually spent, and the
// buddy only drawn, at the reveal (hatchFromInventory) — same rule as the Shop's own version.
// `onReveal(res)` fires the instant the buddy is drawn (so a caller can refresh any points/
// owned-eggs display it's showing under this overlay); `onDone()` fires when the child
// dismisses the reveal, which is the caller's cue that the moment is over.
function EggHatchFlow({ egg, bgRarity, eggShake = false, gradualCrack = false, onReveal, onDone }) {
  const [phase, setPhase] = React.useState('egg');    // 'egg' | 'cracking' | 'reveal'
  const [result, setResult] = React.useState(null);   // { buddy, dup, xp } once revealed
  const cracking = React.useRef(false);

  const revealEgg = () => {
    const res = hatchFromInventory(egg, PLAYER);
    if (!res.ok) { onDone(); return; }   // nothing to hatch — don't fake a reveal
    sfx.hatchReveal();
    setResult(res);
    setPhase('reveal');
    onReveal?.(res);
  };
  // A tap and a shake can both crack the same egg, and each schedules a reveal — so the crack
  // is latched. Without it, two reveals fire, and since the reveal is what SPENDS the egg,
  // one careless double-hatch would eat two eggs and hand out two buddies for one.
  const crackEgg = () => {
    if (cracking.current) return;
    cracking.current = true;
    sfx.hatchCrack(gradualCrack);
    setPhase('cracking');
    // hold the reveal for the length of the chosen animation — the gradual crack
    // runs longer on purpose, so the fissure has time to spread before the pop
    setTimeout(revealEgg, gradualCrack ? HATCH_CRACK_MS : HATCH_MS);
  };

  // shake-to-hatch: while the egg is waiting, a firm phone shake also cracks it
  useShakeToHatch(eggShake && phase === 'egg', crackEgg);

  const reveal = phase === 'reveal';
  const isCracking = phase === 'cracking';
  const b = reveal ? result.buddy : null;
  const rar = b ? RARITY[b.rarity] : null;
  const eggC = eggColorFor(egg.rarity);   // shell colour of the egg being hatched
  // A tier with painted art gets that image instead of the drifting CSS gradient. Kept
  // through the reveal too — the scene shouldn't swap out from under the buddy the moment
  // it appears, so the same backdrop carries from waiting egg through reveal.
  const bgImg = EGG_HATCH_BG[bgRarity || egg.rarity];

  return createPortal(
    <div className={`jx-fade${!reveal && !bgImg ? ' jx-egg-bg' : ''}`} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', ...(bgImg
      ? { backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : reveal
        // Backdrop + CTA both derive from the SAME egg shell colour, so the whole reveal
        // matches the egg you opened — surface and button never clash across any tier.
        ? { background: `radial-gradient(120% 80% at 50% 34%, ${shade(eggC, 76)} 0%, ${shade(eggC, 90)} 58%, #fff 100%)` }
        : { '--egg-a': shade(eggC, 38), '--egg-b': shade(eggC, 66), '--egg-base': shade(eggC, 92) }) }}>
      {!reveal ? (
        <React.Fragment>
          {/* rings + tappable egg */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
            <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
            <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
            {/* quick-pop glow — the gradual crack brings its own seam-light instead */}
            {isCracking && !gradualCrack && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(eggC, 60)} 0%, transparent 68%)` }} />}
            <button data-sfx="off" onClick={isCracking ? undefined : crackEgg} disabled={isCracking} className={`jx-press ${isCracking ? (gradualCrack ? '' : 'jx-egg-hatch') : 'jx-egg-idle'}`} aria-label={L('Tap the egg to hatch')} style={{ background: 'none', border: 'none', cursor: isCracking ? 'default' : 'pointer', padding: 0 }}>
              {isCracking && gradualCrack
                ? <CrackingEgg size={132} rarity={egg.rarity} />
                : <EggShape size={132} rarity={egg.rarity} />}
            </button>
          </div>
          <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Buddy Egg')}</h2>
          {/* label pill doubles as a second hatch trigger, so tapping it isn't a
              dead-end — the copy still points at the egg as the main target */}
          <button data-sfx="off" onClick={isCracking ? undefined : crackEgg} disabled={isCracking} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: isCracking ? .85 : 1, border: 'none', fontFamily: 'inherit', cursor: isCracking ? 'default' : 'pointer' }}>
            <Icon name={isCracking ? 'hourglass' : 'pointer'} size={15} color={eggC} stroke={2.3} className={isCracking ? 'jx-pulse-soft' : undefined} />{L(isCracking ? 'Hatching…' : 'Tap the egg to hatch')}
          </button>
          {/* shake affordance — parked at the far bottom, bigger + its own copy */}
          {eggShake && !isCracking && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom) + 46px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(eggC, 64), alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="vibrate" size={28} color={shade(eggC, -28)} stroke={2.3} />
              </span>
              <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Shake to hatch too')}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('Give your phone a little shake')}</div>
            </div>
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {/* the hatch celebration — shared, so every hatch flow plays the same one */}
          <HatchCelebration color={b.color} accent={rar.fg} />

          {/* status ribbon — solid white pill so it reads on any buddy tint */}
          <div className="jx-drop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(46,43,41,.08)', color: result.dup ? shade(THEME.gold, -40) : THEME.fg1, borderRadius: 999, padding: '6px 14px 6px 12px', fontSize: 12.5, fontWeight: 800, letterSpacing: .3, position: 'relative', marginBottom: 16 }}>
            {result.dup
              ? <React.Fragment><Icon name="zap" size={14} color={THEME.gold} fill={THEME.gold} stroke={1.8} />+{result.xp} XP</React.Fragment>
              : <React.Fragment><Icon name="egg" size={14} color={b.color} stroke={2.3} />{L('New buddy!')}</React.Fragment>}
          </div>

          {/* the hatch: buddy pops out of a cracked-open shell over a soft glow */}
          <div className="jx-gift-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
            <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${shade(eggC, 74)} 0%, rgba(255,255,255,0) 66%)`, zIndex: 0 }} />
            <div className="jx-burst" style={{ position: 'absolute', top: '48%', left: '50%', width: 210, height: 210, borderRadius: 999, border: `3px solid ${b.color}`, opacity: 0, zIndex: 0 }} />
            {/* cracked eggshell halves under the buddy's feet */}
            <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, zIndex: 1 }}>
              <EggHalf color={eggC} />
              <EggHalf color={eggC} flip />
            </div>
            <div className="jx-float" style={{ position: 'relative', zIndex: 2 }}><Mascot species={b.species} stage={2} color={b.color} size={182} /></div>
          </div>

          {/* name with an inline rarity gem chip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', marginTop: 6 }}>
            <h1 className="game-font" style={{ fontSize: 31, fontWeight: 500, margin: 0, color: bgImg ? '#fff' : THEME.fg1, textShadow: bgImg ? '0 2px 12px rgba(0,0,0,.5)' : 'none' }}>{b.name}</h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1.5px solid ${rar.fg}40`, color: b.rarity === 'common' ? THEME.fg2 : rar.fg, borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 800 }}>
              <Icon name="gem" size={12} color={b.rarity === 'common' ? THEME.fg2 : rar.fg} stroke={2.4} />{L(rar.label)}
            </span>
          </div>
          <p style={{ fontSize: 14.5, color: bgImg ? 'rgba(255,255,255,.92)' : THEME.fg2, textShadow: bgImg ? '0 1px 10px rgba(0,0,0,.5)' : 'none', lineHeight: 1.5, margin: '10px 0 0', position: 'relative' }}>
            {result.dup ? `${L('You already have')} ${b.name} — ${L('turned into XP')}` : L('Added to your collection')}
          </p>

          {/* CTA — bottom-anchored, full-width pill */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <button onClick={onDone} className="jx-press" style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: shade(eggC, -22), color: '#fff', borderRadius: 18, padding: '16px 0', fontSize: 15.5, fontWeight: 800, boxShadow: 'none' }}>
              {result.dup ? L('Awesome!') : L('Keep it')}
            </button>
          </div>
        </React.Fragment>
      )}
    </div>,
    document.querySelector('.screen') || document.body
  );
}

export { EggShape, EggHalf, CrackingEgg, eggColorFor, EGG_HATCH_BG, requestMotionPermission, useShakeToHatch, HATCH_MS, HATCH_CRACK_MS, EggHatchFlow };
