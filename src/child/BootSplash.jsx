// JoanX — child app · BootSplash
//
// The very first thing the child app shows on a cold launch — before Home, before
// Onboarding's intro slides — while it syncs the safety/permission "clearance" data the
// rest of the app depends on. Two distinct beats, not variations of one screen:
//   1. logo    — same near-black backdrop as the app's established logo-splash treatment,
//               wordmark dead-center with a jx-pop bounce-in — this IS the animated
//               "onboarding logo" moment.
//   2. loading — full-bleed illustrated art (splashloading.png, the same asset folder as
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
import { Icon } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

const LOGO_MS = 1000;
const LOAD_MS = 2200;
const APP_VERSION = '1.0.0';
// Base coat under the splash art, sampled from its own top and bottom edges (#8DA3AA sky,
// #A78668 pavement). The blurred backdrop layer covers this in practice — it is what shows
// for the frame or two before the image decodes, so it matches rather than flashing white.
const SPLASH_BG = 'linear-gradient(180deg, #8da3aa 0%, #93a3a2 42%, #a78668 100%)';

function BootSplash({ onDone }) {
  const [phase, setPhase] = React.useState('logo');   // 'logo' → 'loading'
  const [pct, setPct] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  // Progress is accumulated, not measured from a single start stamp: pausing has to hold the
  // bar where it is, and a start-stamp clock would jump forward by the whole paused duration
  // the moment it resumed.
  const elapsed = React.useRef(0);

  // Phase 1 — logo beat, timed, then hand off to the loading beat.
  React.useEffect(() => {
    if (phase !== 'logo') return undefined;
    const t = setTimeout(() => setPhase('loading'), LOGO_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // Phase 2 — the progress bar, driven by real elapsed time so it can't drift. Pausing
  // simply tears the loop down; the accumulated time survives in the ref, and resuming
  // starts a fresh loop from wherever it stopped.
  React.useEffect(() => {
    if (phase !== 'loading' || paused) return undefined;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      elapsed.current += now - last;
      last = now;
      const p = Math.min(100, Math.round((elapsed.current / LOAD_MS) * 100));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => onDone && onDone(), 260);   // hold the full bar a beat before handing off
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, paused, onDone]);

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
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: SPLASH_BG }}>
      {/* Two copies of the same art, which is how the whole picture shows with nothing
          cropped and no bars.
          BACK — `cover`, blown up and blurred out of focus, filling the frame edge to edge.
          FRONT — the picture itself, complete and un-zoomed, its top and bottom edges MASKED
          so they dissolve into the blurred copy.
          The mask is the part that matters. `cover` alone cut the sides off (the villains
          live there) and `contain` alone left the picture stopping at a hard horizontal line
          — and it is that line, not the band, that reads as "cut off". Fading the last few
          percent of the image into an out-of-focus version of itself removes the line, so
          the art appears to run off the top and bottom of the screen.
          Sized by max-width/max-height rather than objectFit: the element box then matches
          the rendered picture exactly, which is what lets the mask land on the image's own
          edges instead of on the letterbox. */}
      <img src="/assets/onboarding/splashloading.png" alt="" aria-hidden
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.15)', filter: 'blur(18px) saturate(1.08)' }} />
      <img src="/assets/onboarding/splashloading.png" alt=""
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          maxWidth: '100%', maxHeight: '100%', display: 'block',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
          maskImage: 'linear-gradient(180deg, transparent 0%, #000 7%, #000 93%, transparent 100%)',
        }} />
      {/* top/bottom scrims — legibility for the logo and the loading bar over busy art */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 210, background: 'linear-gradient(180deg, rgba(8,10,18,.72) 0%, rgba(8,10,18,.34) 52%, rgba(8,10,18,0) 100%)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 230, background: 'linear-gradient(0deg, rgba(8,10,18,.72) 8%, rgba(8,10,18,0) 100%)' }} />

      {/* Hold button. A child wants to look at the picture, and the bar does not wait — this
          parks it. It only stops the timer: nothing about the boot itself is skipped or
          reordered, so releasing carries on from the same percentage. */}
      <button type="button" onClick={() => setPaused(p => !p)}
        aria-label={paused ? L('Resume') : L('Hold')}
        style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 14px)', right: 14, zIndex: 2, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, border: '1.5px solid rgba(255,255,255,.55)', background: 'rgba(8,10,18,.42)', backdropFilter: 'blur(6px)', cursor: 'pointer', padding: 0 }}>
        <Icon name={paused ? 'play' : 'pause'} size={18} color="#fff" stroke={2.2} fill="#fff" />
      </button>

      {/* plain, static — the default top placement for this screen, no entrance animation.
          The wordmark's green X sat on bright sky and disappeared; the drop shadow separates
          every letter from whatever is behind it. */}
      <img src="/assets/brand/logo-wordmark.svg" alt="JoanX"
        style={{ position: 'relative', width: 168, display: 'block', margin: '0 auto', marginTop: 'calc(env(safe-area-inset-top) + 84px)', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.6)) drop-shadow(0 0 14px rgba(0,0,0,.4))' }} />

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
