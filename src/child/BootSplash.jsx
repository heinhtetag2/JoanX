// JoanX — child app · BootSplash
//
// The very first thing the child app shows on a cold launch — before Home, before
// Onboarding's intro slides — while it syncs the safety/permission "clearance" data the
// rest of the app depends on. Two distinct beats, not variations of one screen:
//   1. logo    — same near-black backdrop as the app's established logo-splash treatment,
//               wordmark dead-center with a jx-pop bounce-in — this IS the animated
//               "onboarding logo" moment.
//   2. loading — full-bleed illustrated art (splashloading.jpg, the same asset folder as
//               the onboarding intro slides), wordmark plain and static up top (that
//               placement is this screen's own default, no entrance animation), and a
//               chunky game-style "Loading… NN%" pill bar pinned to the bottom — the
//               glossy, thick-bordered mobile-game loading-bar look, not the flat/no-glow
//               treatment the rest of the app uses; this screen is deliberately styled to
//               read as a game booting up.
// Onboarding no longer carries its own step-0 logo splash — this is that beat now, so
// Onboarding starts straight at its intro slides whenever it follows this. Only ever plays
// once, on the cold-launch mount (or a Tweaks replay) — not on every screen nav.

import React from 'react';
import { L } from '../core/i18n.jsx';

const LOGO_MS = 1000;
const LOAD_MS = 2200;
const APP_VERSION = '1.0.0';

function BootSplash({ onDone }) {
  const [phase, setPhase] = React.useState('logo');   // 'logo' → 'loading'
  const [pct, setPct] = React.useState(0);

  // Phase 1 — logo beat, timed, then hand off to the loading beat.
  React.useEffect(() => {
    if (phase !== 'logo') return undefined;
    const t = setTimeout(() => setPhase('loading'), LOGO_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 2 — the progress bar, driven by real elapsed time so it can't drift.
  React.useEffect(() => {
    if (phase !== 'loading') return undefined;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min(100, Math.round(((now - start) / LOAD_MS) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => onDone && onDone(), 260);   // hold the full bar a beat before handing off
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, onDone]);

  if (phase === 'logo') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 36%, #24242c 0%, #131318 52%, #08080b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* jx-pop — the same bouncy scale-in every other JoanX splash/celebration moment
            uses (Onboarding/ParentOnboarding's own former step-0, AchievementUnlock, …):
            this beat is the logo moment, so it lands with a beat, not a flat fade. */}
        <img className="jx-pop" src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ width: 176, display: 'block', marginTop: 48 }} />
      </div>
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <img src="/assets/onboarding/splashloading.jpg" alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      {/* top/bottom scrims — legibility for the logo and the loading bar over busy art */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 190, background: 'linear-gradient(180deg, rgba(8,10,18,.6) 0%, rgba(8,10,18,0) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 230, background: 'linear-gradient(0deg, rgba(8,10,18,.72) 8%, rgba(8,10,18,0) 100%)' }} />

      {/* plain, static — the default top placement for this screen, no entrance animation */}
      <img src="/assets/brand/logo-wordmark.svg" alt="JoanX"
        style={{ position: 'relative', width: 168, display: 'block', margin: '0 auto', marginTop: 'calc(env(safe-area-inset-top) + 84px)' }} />

      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', maxWidth: 290, margin: '0 auto', padding: '0 30px calc(env(safe-area-inset-bottom) + 26px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div className="game-font" style={{ fontSize: 17, fontWeight: 500, color: '#fff', textShadow: '0 1px 0 rgba(0,0,0,.45), 0 2px 6px rgba(0,0,0,.35)', marginBottom: 9 }}>{L('Loading…')}</div>

        {/* chunky pill bar — dark navy shell in a white ring, glossy green fill, % centered inside */}
        <div style={{ position: 'relative', width: '100%', height: 30, borderRadius: 999, background: 'linear-gradient(180deg, #1c2b3a 0%, #0f1a24 100%)', border: '2px solid #fff', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.5)', overflow: 'hidden' }}>
          <div style={{
            width: `${pct}%`, height: '100%', borderRadius: 999,
            background: 'linear-gradient(180deg, #a8f06a 0%, #5fbf3a 46%, #3f9a26 100%)',
            boxShadow: 'inset 0 8px 10px -4px rgba(255,255,255,.55), inset 0 -6px 8px -3px rgba(0,0,0,.28)',
            transition: 'width .1s linear',
          }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', letterSpacing: .2, textShadow: '0 1px 0 rgba(0,0,0,.55), 0 0 4px rgba(0,0,0,.35)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
          </div>
        </div>

        <div style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,.75)', marginTop: 20, textShadow: '0 1px 3px rgba(0,0,0,.4)' }}>{L('Version')}: {APP_VERSION}</div>
      </div>
    </div>
  );
}

export { BootSplash };
