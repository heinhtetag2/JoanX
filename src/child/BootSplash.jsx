// JoanX — child app · BootSplash
//
// The very first thing the child app shows on a cold launch — before Home, before
// Onboarding's own logo splash — while it syncs the safety/permission "clearance" data
// the rest of the app depends on. Full-bleed illustrated art (splashloading.jpg, the same
// asset folder as the onboarding intro slides) does the "game loading screen" work by
// itself, so this stays a still image, not another animated character moment — top/bottom
// scrims (the same treatment Onboarding's own intro slides use over their hero art) keep
// the logo and the loading bar legible over it. A chunky bottom-anchored progress bar
// with a percentage read-out is the only thing that moves.

import React from 'react';
import { L } from '../core/i18n.jsx';

const DURATION_MS = 20000;

// Rotate through these as the bar fills — the "tips scrolling by" beat a game loading
// screen uses to make a fixed wait feel like it's actually doing something.
const STEPS = [
  { at: 0, label: 'Waking up your buddy…' },
  { at: 28, label: 'Checking safety settings…' },
  { at: 62, label: 'Syncing today’s clearance…' },
  { at: 90, label: 'Almost ready…' },
];

function BootSplash({ onDone }) {
  const [pct, setPct] = React.useState(0);

  React.useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(100, Math.round(((now - start) / DURATION_MS) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => onDone && onDone(), 260);   // hold the full bar a beat before handing off
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const step = STEPS.slice().reverse().find(s => pct >= s.at) || STEPS[0];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src="/assets/onboarding/splashloading.jpg" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* center scrim behind the logo + bottom scrim for the loading bar — legibility over busy art */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 340, height: 200, borderRadius: 999, background: 'radial-gradient(closest-side, rgba(8,10,18,.5) 0%, rgba(8,10,18,0) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 220, background: 'linear-gradient(0deg, rgba(8,10,18,.72) 8%, rgba(8,10,18,0) 100%)' }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img className="jx-fade" src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ width: 176, display: 'block' }} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', maxWidth: 280, margin: '0 auto', padding: '0 32px calc(env(safe-area-inset-bottom) + 56px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9 }}>
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{L(step.label)}</span>
          <span style={{ fontSize: 12.5, fontWeight: 800, color: 'rgba(255,255,255,.75)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,.22)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: '#fff', transition: 'width .1s linear' }} />
        </div>
      </div>
    </div>
  );
}

export { BootSplash };
