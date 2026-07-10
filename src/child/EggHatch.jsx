// JoanX — child app · shared egg-hatch motif (A-2 / F-15)
//
// The egg, the cracked shell halves, and the tap/shake-to-hatch interaction.
// Used by the Shop (buy an egg → hatch a collectible) and by Onboarding
// (first buddy arrives as an egg, not as a handout). Animations — jx-egg-hatch,
// jx-egg-bg, jx-press, jx-float, jx-wiggle, jx-burst — live in styles/joanx.css.

import React from 'react';
import { shade } from '../core/characters.jsx';

// Each rarity gets its own shell so the three eggs are told apart at a glance,
// not just by their price tag: plain speckles → banded → crowned with stars.
const EGG_SKIN = {
  common: '#d9b98a',   // warm sand
  rare:   '#5a92c9',   // ocean
  epic:   '#7f63c5',   // iris
};
const eggColorFor = (rarity) => EGG_SKIN[rarity] || '#e6a94b';

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

        {/* rare — two painted bands wrapping the shell */}
        {rarity === 'rare' && [58, 72].map((t, i) => (
          <div key={i} style={{ position: 'absolute', top: `${t}%`, left: '-10%', width: '120%', height: i ? '5%' : '8%', background: shade(c, -26), opacity: .5, transform: 'rotate(-7deg)' }} />
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

// how long the crack animation runs before the buddy pops out
const HATCH_MS = 820;

export { EggShape, EggHalf, eggColorFor, requestMotionPermission, useShakeToHatch, HATCH_MS };
