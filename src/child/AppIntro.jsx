// JoanX — child app · App introduction (coach-mark tour)
//
// A guided overlay that dims the screen and spotlights each real element in turn —
// the tab-bar buttons — with a tooltip saying what it is and why it's there. Shown on
// first run and replayable from Profile › Account (and the Tweaks panel). Targets are
// found by their `data-tour` attribute (added in core/nav.jsx), so the spotlight tracks
// the actual on-screen button rather than a hard-coded position.

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

// Each step points at one real element (by data-tour key) and says what it does.
const STEPS = [
  { target: 'tab-home',       title: 'Home',       body: 'See how safely you walked today — and start from here.' },
  { target: 'tab-collection', title: 'Collection', body: 'Every buddy you hatch, and your Collection House, live here.' },
  { target: 'tab-battle',     title: 'Battle',     body: 'Tap the big centre button to battle villains with your buddy.' },
  { target: 'tab-friends',    title: 'Friends',    body: 'Add friends and visit their houses.' },
  { target: 'tab-profile',    title: 'Profile',    body: 'Your buddy, settings and this intro all live here.' },
];

const PAD = 9;          // spotlight breathing room around the target
const TIP_W = 250;      // tooltip width

function AppIntro({ onClose }) {
  const rootRef = React.useRef(null);
  const [i, setI] = React.useState(0);
  const [box, setBox] = React.useState(null);   // { top,left,width,height, cx, screenW, screenH }
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  // Measure the current target relative to the overlay root, re-running on step change
  // and on resize so the spotlight always sits on the live button.
  React.useLayoutEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      if (!root) return;
      const base = root.getBoundingClientRect();
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (!el) { setBox(null); return; }
      const r = el.getBoundingClientRect();
      setBox({
        top: r.top - base.top, left: r.left - base.left, width: r.width, height: r.height,
        screenW: base.width, screenH: base.height,
      });
    };
    measure();
    const id = requestAnimationFrame(measure);   // second pass once layout settles
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', measure); };
  }, [i]);

  const next = () => (last ? onClose() : setI(i + 1));

  // Spotlight rect (padded). Tooltip sits ABOVE the target (tabs are at the bottom),
  // centred on the target and clamped to the screen edges.
  const sx = box ? box.left - PAD : 0, sy = box ? box.top - PAD : 0;
  const sw = box ? box.width + PAD * 2 : 0, sh = box ? box.height + PAD * 2 : 0;
  const cx = box ? box.left + box.width / 2 : 0;
  const tipLeft = box ? Math.max(12, Math.min(box.screenW - TIP_W - 12, cx - TIP_W / 2)) : 12;
  const tipBottom = box ? box.screenH - sy + 12 : 0;

  return (
    <div ref={rootRef} onClick={next} className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 80, overflow: 'hidden', cursor: 'pointer' }}>
      {/* dim + spotlight — a transparent padded rect with a huge shadow spread dims
          everything except the target, and a brand ring outlines it */}
      {box ? (
        <div style={{ position: 'absolute', top: sy, left: sx, width: sw, height: sh, borderRadius: 16, boxShadow: '0 0 0 9999px rgba(15,17,20,0.66)', border: `2px solid ${THEME.brand}`, pointerEvents: 'none', transition: 'top .25s ease, left .25s ease, width .25s ease, height .25s ease' }} />
      ) : (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,17,20,0.66)' }} />
      )}

      {/* skip — top-right, above the dim */}
      <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ position: 'absolute', top: 52, right: 16, zIndex: 2, background: 'rgba(255,255,255,0.16)', border: 'none', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#fff', padding: '7px 14px' }}>{L('Skip')}</button>

      {/* tooltip */}
      <div onClick={(e) => e.stopPropagation()} style={box
        ? { position: 'absolute', left: tipLeft, bottom: tipBottom, width: TIP_W, zIndex: 2 }
        : { position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', width: TIP_W, zIndex: 2 }}>
        <div key={i} className="jx-rise" style={{ background: '#fff', borderRadius: 18, padding: '15px 16px 14px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <span className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.fg1 }}>{L(step.title)}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}>{i + 1}/{STEPS.length}</span>
          </div>
          <p style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 13px' }}>{L(step.body)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {STEPS.map((_, k) => (
              <div key={k} style={{ width: k === i ? 16 : 6, height: 6, borderRadius: 999, background: k === i ? THEME.brand : THEME.border, transition: 'width .2s' }} />
            ))}
            <button onClick={next} style={{ marginLeft: 'auto', background: THEME.brand, color: '#fff', border: 'none', borderRadius: 12, padding: '9px 18px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}>
              {last ? L('Got it') : L('Next')}
            </button>
          </div>
          {/* arrow pointing down to the target */}
          {box && <div style={{ position: 'absolute', bottom: -6, left: Math.max(14, Math.min(TIP_W - 26, cx - tipLeft - 6)), width: 14, height: 14, background: '#fff', transform: 'rotate(45deg)', borderRadius: 3 }} />}
        </div>
      </div>
    </div>
  );
}

export { AppIntro };
