// JoanX — child app · Onboarding

import React from 'react';
import { CHARACTERS, PERMISSIONS, PLAYER } from '../core/data.jsx';
import { Badge, Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgFor } from './shared.jsx';
import { EggShape, EggHalf, requestMotionPermission, useShakeToHatch, HATCH_MS } from './EggHatch.jsx';

// Parent-app brand magenta — reused across the child onboarding flow so its
// CTAs, inputs, and accents match the parent onboarding (per design request).
const P_BRAND = { primary: THEME.brand, primaryDark: THEME.brandDark, primaryLight: THEME.brandLight };

const pBrandBtn = { background: P_BRAND.primary, boxShadow: 'none' };

// Decorative pairing QR — a deterministic dot matrix with the three finder
// squares, so it reads as a real QR without needing a QR library offline.
function PairQR({ size = 190 }) {
  const N = 25;
  const finder = (r, c, br, bc) => {
    const rr = r - br, cc = c - bc;
    if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return null;
    const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return ring || core;
  };
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let v = finder(r, c, 0, 0);
      if (v === null) v = finder(r, c, 0, N - 7);
      if (v === null) v = finder(r, c, N - 7, 0);
      if (v === null) {
        const nearFinder = (r <= 7 && c <= 7) || (r <= 7 && c >= N - 8) || (r >= N - 8 && c <= 7);
        if (nearFinder) v = false;
        else { const h = (r * 73856093) ^ (c * 19349663); v = ((h >>> 3) & 3) === 0 || ((h >>> 7) & 7) === 1; }
      }
      if (v) cells.push(<rect key={r + '-' + c} x={c} y={r} width="1.04" height="1.04" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <g fill={THEME.fg1}>{cells}</g>
    </svg>
  );
}

// ── Onboarding / permissions ─────────────────────────────────────────
// Smart mode is the only mode now. The flow is:
//   splash → 2 intro slides → connect-to-parent (code / QR) → permissions.
// The child device carries no account of its own: identity comes from the parent it pairs
// with, so there is no sign-in here (F-33 is the parent app only).
function Onboarding({ ctx }) {
  const perms = PERMISSIONS;
  const [step, setStep] = React.useState(0);     // 0 splash · 1-2 slides · 3 connect · 4 permissions
  const [grants, setGrants] = React.useState({});
  const [code, setCode] = React.useState('');    // parent's 6-digit code, typed on the connect screen
  const [codeErr, setCodeErr] = React.useState(false); // validation error on the connect screen
  const [showQR, setShowQR] = React.useState(false); // show the child's shareable QR on the connect screen
  const [pairing, setPairing] = React.useState(false); // "connecting…" wait screen after the QR is scanned / code submitted
  const [connected, setConnected] = React.useState(false); // "connected" success screen after linking
  const [charReveal, setCharReveal] = React.useState(false); // egg → hatch → congrats screen
  // A-2: the first buddy arrives as an egg, not a handout. Tap or shake it and
  // a random starter hatches out — same motif as the Shop's buddy egg.
  const [eggPhase, setEggPhase] = React.useState('egg');     // egg | cracking | reveal
  const [prize, setPrize] = React.useState(null);            // the starter that hatches
  const codeRef = React.useRef(null);
  const submitCode = () => (code.length < 6 ? setCodeErr(true) : setPairing(true)); // any complete code is accepted
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];
  const b = prize || c;                                      // buddy shown on the reveal

  // hand the egg over: roll a starter now, show it only after the shell cracks
  const openEgg = () => {
    const starters = CHARACTERS.filter(x => x.owned);
    setPrize(starters[Math.floor(Math.random() * starters.length)] || CHARACTERS[0]);
    setEggPhase('egg');
    requestMotionPermission();   // iOS 13+: must be asked from a user gesture
    setCharReveal(true);
  };
  const crackEgg = () => {
    setEggPhase(p => (p === 'egg' ? 'cracking' : p));
    setTimeout(() => {
      setEggPhase('reveal');
      setPrize(p => { if (p) ctx.setBuddy(p.id, {}); return p; });   // adopt the hatched buddy app-wide
    }, HATCH_MS);
  };
  useShakeToHatch(charReveal && eggPhase === 'egg', crackEgg);

  const [modal, setModal] = React.useState(null); // permission id of the active request sheet
  const [denied, setDenied] = React.useState({}); // permissions the user skipped → fallback / limited state
  const [showFallback, setShowFallback] = React.useState(false); // "limited protection" confirm before continuing
  const allGranted = perms.every(p => grants[p.id]);
  // F-26 staged requests: we ask for exactly one permission at a time. The live one is the
  // first that isn't granted yet; everything after it waits its turn. A denied permission
  // stays live (it's still the blocker), so the sequence can't be walked around.
  const stepIdx = perms.findIndex(p => !grants[p.id]);
  const finish = () => ctx.finishOnboarding('smart');

  const grant = id => { setGrants(g => ({ ...g, [id]: true })); setDenied(d => { const n = { ...d }; delete n[id]; return n; }); }; // granting clears any "denied" fallback
  const deny = id => setDenied(d => ({ ...d, [id]: true }));    // user skips a permission → its card drops to the limited state
  const openOne = id => setModal(id);                           // "special" perm → open its sheet
  const dismiss = () => setModal(null);
  const grantActive = () => { grant(modal); setModal(null); };  // "Go to settings" in the sheet
  const denyActive = () => { deny(modal); setModal(null); };    // "Not now" in the sheet → limited fallback

  const modalPerm = modal && perms.find(p => p.id === modal);
  const Buddy = ({ size }) => <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />;

  // live 5-minute validity countdown — shared by the code and QR connect screens
  const [codeLeft, setCodeLeft] = React.useState(300);
  const codeExpired = codeLeft <= 0;
  const regenCode = () => setCodeLeft(300);   // "get a new code/QR" — restarts the timer
  React.useEffect(() => {
    if (step !== 3 || pairing || connected) return undefined;
    const t = setInterval(() => setCodeLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, pairing, connected]);

  // pairing handshake — brief "connecting…" wait, then the success screen
  React.useEffect(() => {
    if (!pairing) return undefined;
    const t = setTimeout(() => { setPairing(false); setConnected(true); }, 2800);
    return () => clearTimeout(t);
  }, [pairing]);
  const codeLeftLabel = `${Math.floor(codeLeft / 60)}:${String(codeLeft % 60).padStart(2, '0')}`;

  // logo splash auto-advances into the intro slides
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(1), 1500);
    return () => clearTimeout(t);
  }, [step]);

  // value-prop slides shown at steps 1–2 (step 3 = connect)
  const SLIDES = [
    { title: 'Walk safe, grow your buddy', sub: "JoanX notices when you're walking on your phone — and turns staying safe into a game." },
    { title: 'Every safe walk levels you up', sub: 'Earn points, evolve your buddy, and beat the distractions.' },
  ];
  const introIdx = step - 1;
  const slide = SLIDES[introIdx];

  return (
    <div style={{ position: 'absolute', inset: 0, background: screenBgFor(P_BRAND.primary), display: 'flex', flexDirection: 'column', paddingTop: 50 }}>
      {/* 0 · logo splash */}
      {step === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 36%, #24242c 0%, #131318 52%, #08080b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <img className="jx-pop" src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ width: 176, display: 'block' }} />
          {/* company credit — "powered by" lockup with a shield, pinned above the home indicator */}
          <div className="jx-fade" style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 34px)', left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.38)', letterSpacing: .4 }}>
              <Icon name="shield-check" size={12} color="rgba(255,255,255,.38)" stroke={2.2} />Powered by
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', letterSpacing: .6, marginTop: 3 }}>Joan Technology</div>
          </div>
        </div>
      )}

      {/* 1–2 · value-prop intro slides — full-bleed hero image with dark scrims,
          white copy, and a bottom-aligned CTA (mirrors the parent onboarding). */}
      {slide && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 60px)' }}>
          {/* background: full-screen hero photo (reusing the parent intro image for now) */}
          <img src="/assets/onboarding/intro.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '58% 36%' }} />
          {/* soft dark scrims top & bottom keep the copy and CTA legible */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 330, background: 'linear-gradient(180deg, rgba(12,14,22,.74) 0%, rgba(12,14,22,0) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(0deg, rgba(10,12,20,.92) 8%, rgba(10,12,20,0) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', gap: 7, padding: '0 28px' }}>
              {SLIDES.map((_, i) => (
                <div key={i} style={{ height: 5, flex: 1, borderRadius: 999, background: i <= introIdx ? '#fff' : 'rgba(255,255,255,.4)', transition: 'background .3s' }} />
              ))}
            </div>

            <div style={{ padding: '32px 30px 0' }}>
              <h1 className="game-font" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.18, margin: 0, color: '#fff', textShadow: '0 2px 16px rgba(0,0,0,.5)' }}>{L(slide.title)}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.45, margin: '12px 0 0', color: 'rgba(255,255,255,.92)', textShadow: '0 1px 12px rgba(0,0,0,.5)' }}>{L(slide.sub)}</p>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
              <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => setStep(step + 1)}>{L('Continue')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* 4 · permission guide (last step) — full page with a toggle per permission */}
      {step === 4 && !charReveal && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 0' }}>
            {/* Skip rides the title's first line rather than sitting in a band of its own —
                permissions are never hard-blocked (F-26), and it lands in the same
                limited-protection sheet Continue does when something is still off. */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '4px 0 12px' }}>
              <h1 className="game-font" style={{ flex: 1, fontSize: 22, fontWeight: 500, margin: 0, lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('To keep you safe,\nwe need a little help')}</h1>
              <button onClick={() => setShowFallback(true)} style={{ flexShrink: 0, marginTop: 3, padding: '4px 2px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: P_BRAND.primary, cursor: 'pointer' }}>{L('Skip')}</button>
            </div>
            {/* the buddy does the asking — keeps the request in the game's voice */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', margin: '0 0 18px' }}>
              <div style={{ flexShrink: 0 }}><Buddy size={58} /></div>
              <p style={{ flex: 1, background: '#fff', borderRadius: '16px 16px 16px 4px', padding: '11px 13px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: 0 }}>{L('For JoanX to notice danger while you walk, the permissions below are needed. Turn them on together with your parents.')}</p>
            </div>

            {/* One flat card per permission — copy + Allow pill; a quiet "Allowed" label once granted.
                A pill, not a toggle: granting is one-way, so it shouldn't look reversible.
                Staged, per F-26: only one permission is live at a time. The next unlocks when the
                current one is granted, so the child faces a single decision instead of a wall of
                four — and the system prompts arrive one at a time, the way the OS expects. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {perms.map((p, i) => {
                const on = !!grants[p.id];
                const off = !on && !!denied[p.id];      // skipped → limited fallback state
                const live = i === stepIdx;             // the one permission we're asking for now
                const locked = !on && !live;            // waiting its turn — shown, but not yet askable
                return (
                  <div key={p.id} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '15px 16px', background: off ? THEME.warningLight : '#fff', borderRadius: 18, border: off ? `1px solid ${shade(THEME.warning, 78)}` : '1px solid transparent', opacity: locked ? 0.45 : 1, transition: 'opacity .25s ease' }}>
                    {/* bare ink icon — no chip background, per design direction */}
                    <Icon name={p.icon} size={21} color={off ? THEME.warning : THEME.fg1} stroke={2.1} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L(p.name)}</div>
                      {/* when skipped, the card owns up to the consequence instead of the sell */}
                      <div style={{ fontSize: 12, color: off ? THEME.warning : THEME.fg2, lineHeight: 1.4, marginTop: 2, fontWeight: off ? 600 : 400 }}>{L(off ? p.warn : p.blurb)}</div>
                    </div>
                    {on ? (
                      <span className="jx-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, color: THEME.success, fontWeight: 800, fontSize: 12.5 }}>
                        <Icon name="check" size={15} color={THEME.success} stroke={2.8} />{L('Allowed')}
                      </span>
                    ) : locked ? (
                      <Icon name="lock" size={17} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginRight: 6 }} />
                    ) : off ? (
                      <button onClick={() => (p.settings ? openOne(p.id) : grant(p.id))} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px solid ${THEME.warning}`, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: shade(THEME.warning, -18), fontWeight: 800, fontSize: 12.5, padding: '8px 13px', borderRadius: 999 }}>
                        <Icon name="rotate-cw" size={13} color={shade(THEME.warning, -18)} stroke={2.6} />{L('Turn on')}
                      </button>
                    ) : (
                      <button onClick={() => (p.settings ? openOne(p.id) : grant(p.id))} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.fg1, color: '#fff', fontWeight: 800, fontSize: 12.5, padding: '9px 15px', borderRadius: 999 }}>{L('Allow')}</button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', margin: '16px 0 4px' }}>
              <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}>{L('Private & secure — only used to keep you safe')}</span>
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {/* Continue unlocks only once every permission is granted. Nobody is trapped:
                Skip (top right) is the way past, and it owns the consequence in the
                limited-protection sheet rather than pretending nothing was lost (F-26). */}
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} disabled={!allGranted} onClick={allGranted ? openEgg : undefined}>{L('Continue')}</Button>
          </div>
        </>
      )}

      {/* 3 · connect — child types the code shown in the parent app */}
      {step === 3 && !showQR && !pairing && !connected && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '6px 0 10px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L("Enter your parent's\nconnect code")}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 30px' }}>{L('Open the JoanX Parent app and type the 6-digit code shown there.')}</p>

            {/* 6-digit code input — tap to type */}
            <div style={{ position: 'relative' }} onClick={() => codeRef.current && codeRef.current.focus()}>
              <input ref={codeRef} value={code} inputMode="numeric"
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeErr(false); }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
              <div className={codeErr ? 'jx-shake' : ''} style={{ display: 'flex', gap: 9 }}>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const ch = code[i];
                  const active = !codeErr && i === code.length && code.length < 6;
                  const border = codeErr ? THEME.danger : (active ? THEME.fg1 : 'transparent');
                  return (
                    <div key={i} style={{ width: 44, height: 56, borderRadius: 14, background: codeErr ? THEME.dangerLight : '#fff', border: `2px solid ${border}`, boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s, background .15s' }}>
                      <span className="game-font" style={{ fontSize: 27, fontWeight: 500, color: codeErr ? THEME.danger : THEME.fg1 }}>{ch || ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {codeErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <Icon name="alert-circle" size={15} color={THEME.danger} stroke={2.3} />
                <span style={{ fontSize: 12.5, color: THEME.danger, fontWeight: 700 }}>{L('Enter all 6 digits of the code.')}</span>
              </div>
            )}

            {/* validity — live countdown; flips to an expired notice at 0:00 */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '14px 4px 0', maxWidth: 320 }}>
              <Icon name="clock" size={13} color={codeExpired ? THEME.danger : THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              {codeExpired ? (
                <span style={{ fontSize: 11.5, color: THEME.danger, lineHeight: 1.45, fontWeight: 700 }}>{L('The code expired — create a new one in the Parent app.')}</span>
              ) : (
                <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>
                  <b style={{ color: THEME.fg2, fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{L('Time left')} {codeLeftLabel}</b>
                  {' · '}{L('If it expires, create a new code in the Parent app.')}
                </span>
              )}
            </div>

            {/* ── or ── typing the code and showing a QR are alternative ways to pair */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'stretch', margin: '26px 0 14px' }}>
              <div style={{ flex: 1, height: 1.5, background: THEME.border }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg3 }}>{L('or')}</span>
              <div style={{ flex: 1, height: 1.5, background: THEME.border }} />
            </div>

            {/* option 2 — show the child's QR and let the parent scan it */}
            <button onClick={() => setShowQR(true)} style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', background: '#fff', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name="qr-code" size={21} color={THEME.fg1} stroke={2.2} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Show a QR to scan instead')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{L('Connects automatically once scanned.')}</div>
              </div>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
            </button>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={submitCode}>{L('Connect')}</Button>
          </div>
        </>
      )}

      {/* 3b · share the child's QR for a parent to scan */}
      {step === 3 && showQR && !pairing && !connected && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '18px 28px 0', textAlign: 'left' }}>
            <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '6px 0 10px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('Show this to\nyour parent')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('Have a parent scan this QR in the JoanX Parent app to link your accounts.')}</p>

            {/* connect card — QR while valid; at 0:00 it's replaced by a clean,
                self-contained expired state (same footprint), not an overlay. */}
            {codeExpired ? (
              <div style={{ alignSelf: 'center', width: 250, minHeight: 250, marginTop: 4, background: '#fff', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: 58, height: 58, borderRadius: 999, background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="timer-off" size={28} color={THEME.danger} stroke={2.3} /></div>
                <div style={{ fontSize: 16, fontWeight: 800, color: THEME.fg1, marginTop: 14, wordBreak: 'keep-all' }}>{L('This QR expired')}</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, marginTop: 6, maxWidth: 200, wordBreak: 'keep-all' }}>{L('The 5-minute code ran out. Get a new one to try again.')}</div>
                <button onClick={regenCode} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: P_BRAND.primary, color: '#fff', border: 'none', borderRadius: 999, padding: '11px 20px', marginTop: 18, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  <Icon name="refresh-cw" size={16} color="#fff" stroke={2.5} />{L('Get a new QR')}
                </button>
              </div>
            ) : (
              <div onClick={() => setPairing(true)} style={{ alignSelf: 'center', width: 250, marginTop: 4, background: '#fff', borderRadius: 24, padding: 22, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                <PairQR size={206} />
              </div>
            )}

            {/* live countdown chip — only while valid.
                Prototype shortcut: tap it to jump straight to the expired state. */}
            {!codeExpired && (
              <button onClick={() => setCodeLeft(0)} title={L('Tap to preview the expired state')} style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, padding: '7px 15px', borderRadius: 999, background: P_BRAND.primaryLight, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon name="clock" size={14} color={P_BRAND.primary} stroke={2.4} />
                <span style={{ fontSize: 13, fontWeight: 700, color: P_BRAND.primaryDark }}>{L('Expires in')} <b style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{codeLeftLabel}</b></span>
              </button>
            )}

            {/* validity note — only while valid; the expired card is self-explanatory */}
            {!codeExpired && (
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '16px 2px 0' }}>
                <Icon name="info" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L("The linking code is valid for 5 minutes. If time runs out, please create a new one in your parent's app.")}</span>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="outline" size="lg" fullWidth icon="keyboard" onClick={() => setShowQR(false)}>{L('Enter code instead')}</Button>
          </div>
        </>
      )}

      {/* 3b2 · pairing — the parent scanned the QR (or the code was sent);
          the two apps are shaking hands. Radar pattern: the buddy floats at the
          center while calm signal rings ripple outward, reaching for the parent
          app. No QR or checkmark imagery — just the handshake in progress. */}
      {step === 3 && pairing && !connected && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* radar — staggered rings ripple out from the buddy */}
            <div className="jx-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 240, height: 240, marginBottom: 14 }}>
              {[0, 0.8, 1.6].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring-slow" style={{ position: 'absolute', top: '50%', left: '50%', width: 170, height: 170, marginTop: -85, marginLeft: -85, borderRadius: 999, border: '2px solid rgba(224,4,119,.45)', animationDelay: `${d}s` }} />
              ))}
              <div style={{ width: 124, height: 124, borderRadius: 999, background: shade(c.color, 82), border: '5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)' }}>
                <div className="jx-float"><Buddy size={98} /></div>
              </div>
            </div>

            {/* title with its own live ellipsis — the dots breathe in sequence */}
            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px', display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              {L('Connecting')}
              {[0, 1, 2].map(i => (
                <span key={i} className="jx-link-dot" style={{ width: 6, height: 6, borderRadius: 999, background: THEME.fg1, animationDelay: `${i * 0.18}s` }} />
              ))}
            </h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, maxWidth: 280 }}>{L("Linking with your parent's app — this only takes a moment.")}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: THEME.fg3, fontWeight: 700 }}>{L('Keep both apps open.')}</div>
          </div>
        </>
      )}

      {/* 3c · connected — success result screen */}
      {step === 3 && connected && !charReveal && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* soft success glow */}
            <div style={{ position: 'absolute', top: '39%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(75,129,79,.16) 0%, rgba(255,255,255,0) 68%)' }} />

            {/* child + parent joined — overlapping avatar pair, verified check on the corner */}
            <div className="jx-pop" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* gentle "live connection" pulse rings behind the pair (margin-centered so scale keeps its origin) */}
              {[0, 0.8].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring" style={{ position: 'absolute', top: '50%', left: '50%', width: 152, height: 152, marginTop: -76, marginLeft: -76, borderRadius: 999, border: `2px solid ${THEME.success}`, zIndex: 0, animationDelay: `${d}s` }} />
              ))}
              {/* buddy (child) — sits on top */}
              <div style={{ width: 104, height: 104, borderRadius: 999, background: shade(c.color, 82), border: '5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)' }}>
                <Buddy size={86} />
              </div>
              {/* parent — tucked behind, overlapping */}
              <div style={{ width: 104, height: 104, borderRadius: 999, background: P_BRAND.primaryLight, border: '5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -30, position: 'relative', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(224,4,119,.10)' }}>
                <Icon name="users" size={44} color={P_BRAND.primary} stroke={2.2} />
              </div>
            </div>

            {/* linked-with-parent pill reinforces the connection */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: THEME.successLight, color: shade(THEME.success, -22), borderRadius: 999, padding: '5px 14px 5px 6px', fontSize: 13, fontWeight: 700, position: 'relative', marginBottom: 18 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={12} color="#fff" stroke={3.4} />
              </span>{L('Linked with parent')}
            </div>

            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px', position: 'relative' }}>{L('Connected!')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, position: 'relative', maxWidth: 280 }}>{L("You're now linked with your parent and protected together.")}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => setStep(4)}>{L('Continue')}</Button>
          </div>
        </>
      )}

      {/* 3d · the buddy egg — tap or shake to hatch (A-2, same motif as the Shop) */}
      {/* absolute inset:0 like the splash — an abspos child fills the parent's
          padding box, so the wash reaches under the status bar with no pink gap */}
      {step === 4 && charReveal && eggPhase !== 'reveal' && (
        <>
          <div className="jx-egg-bg" style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '50px 30px 0', overflow: 'hidden', '--egg-a': shade(THEME.gold, 38), '--egg-b': shade(THEME.gold, 66), '--egg-base': shade(THEME.gold, 92) }}>
            {/* rings + the tappable egg */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
              <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${THEME.gold}55` }} />
              <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${THEME.gold}55` }} />
              {eggPhase === 'cracking' && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(THEME.gold, 60)} 0%, transparent 68%)` }} />}
              <button onClick={eggPhase === 'cracking' ? undefined : crackEgg} disabled={eggPhase === 'cracking'} className={`jx-press ${eggPhase === 'cracking' ? 'jx-egg-hatch' : 'jx-float'}`} aria-label={L('Tap to hatch')} style={{ background: 'none', border: 'none', cursor: eggPhase === 'cracking' ? 'default' : 'pointer', padding: 0 }}>
                {/* neutral gold shell — a buddy-tinted egg would give the surprise away */}
                <EggShape size={132} />
              </button>
            </div>

            <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Your first buddy!')}</h2>
            <p style={{ fontSize: 14.5, color: THEME.fg2, lineHeight: 1.5, margin: '8px 0 0', maxWidth: 260 }}>{L('Someone is waiting inside. Hatch the egg to meet them.')}</p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: eggPhase === 'cracking' ? .85 : 1 }}>
              <Icon name={eggPhase === 'cracking' ? 'hourglass' : 'pointer'} size={15} color={THEME.gold} stroke={2.3} className={eggPhase === 'cracking' ? 'jx-pulse-soft' : undefined} />{L(eggPhase === 'cracking' ? 'Hatching…' : 'Tap to hatch')}
            </div>

            {/* shake affordance — parked at the bottom, same as the Shop's */}
            {eggPhase !== 'cracking' && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(THEME.gold, 64), alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="vibrate" size={28} color={shade(THEME.gold, -28)} stroke={2.3} />
                </span>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Shake to hatch too')}</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('Give your phone a little shake')}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 3e · hatched — congrats reveal */}
      {step === 4 && charReveal && eggPhase === 'reveal' && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* confetti burst raining from the top on reveal */}
            {[{ l: '18%', c: THEME.gold, d: 0, w: 7, h: 11 }, { l: '30%', c: THEME.primary, d: .12, w: 8, h: 8 }, { l: '44%', c: THEME.heart, d: .04, w: 6, h: 12 }, { l: '56%', c: THEME.camping, d: .18, w: 9, h: 9 }, { l: '68%', c: THEME.gold, d: .08, w: 7, h: 11 }, { l: '80%', c: THEME.success, d: .22, w: 6, h: 10 }, { l: '24%', c: THEME.primary, d: .3, w: 6, h: 6 }, { l: '74%', c: THEME.heart, d: .26, w: 7, h: 7 }].map((p, i) => (
              <div key={`cf${i}`} className="jx-confetti" style={{ position: 'absolute', top: '8%', left: p.l, width: p.w, height: p.h, borderRadius: i % 2 ? 999 : 2, background: p.c, animationDelay: `${p.d}s` }} />
            ))}

            {/* twinkling sparkles, staggered */}
            {[{ t: '20%', l: '20%', s: 20, d: 0 }, { t: '16%', l: '76%', s: 15, d: .5 }, { t: '44%', l: '84%', s: 12, d: 1 }, { t: '46%', l: '12%', s: 13, d: .3 }, { t: '12%', l: '48%', s: 12, d: .8 }].map((p, i) => (
              <Icon key={i} name="sparkles" size={p.s} color={i % 2 ? THEME.gold : THEME.primary} fill={i % 2 ? THEME.gold : THEME.primary} stroke={0} className="jx-twinkle" style={{ position: 'absolute', top: p.t, left: p.l, animationDelay: `${p.d}s` }} />
            ))}

            {/* hatched eyebrow pill — the egg motif, not a gift box */}
            <div className="jx-drop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '5px 12px 5px 10px', fontSize: 12.5, fontWeight: 800, letterSpacing: .3, position: 'relative', marginBottom: 12 }}>
              <Icon name="egg" size={14} color="#9e7300" stroke={2.4} />{L('New buddy!')}
            </div>
            <div className="jx-gift-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* soft standing glow — centered on the character */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${shade(b.color, 78)} 0%, rgba(255,255,255,0) 68%)`, zIndex: 0 }} />
              {/* one-shot burst ring — flares out from the character's center */}
              <div className="jx-burst" style={{ position: 'absolute', top: '50%', left: '50%', width: 210, height: 210, borderRadius: 999, border: `3px solid ${THEME.gold}`, opacity: 0, zIndex: 0 }} />
              {/* cracked shell halves under the buddy's feet — it just came out */}
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, zIndex: 1 }}>
                <EggHalf color={THEME.gold} />
                <EggHalf color={THEME.gold} flip />
              </div>
              <div className="jx-float" style={{ position: 'relative', zIndex: 2 }}><Mascot species={b.species} stage={b.stage} color={b.color} size={188} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative', marginTop: 8 }}>
              <h1 className="game-font" style={{ fontSize: 30, fontWeight: 500, margin: 0 }}>{b.name}</h1>
              <Badge variant={b.rarity === 'epic' ? 'epic' : b.rarity === 'rare' ? 'primary' : 'default'}>{L(b.rarity === 'epic' ? 'Epic' : b.rarity === 'rare' ? 'Rare' : 'Common')}</Badge>
            </div>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.5, margin: '10px 0 0', position: 'relative' }}>{L('Walk safely with your parent to grow your buddy together.')}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={finish}>{L("Let's go")}</Button>
          </div>
        </>
      )}

      {/* per-permission request — a half-height bottom sheet over the dimmed guide */}
      {modalPerm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={dismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
          <div key={modalPerm.id} className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 24px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <Buddy size={84} />
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '0 8px 8px', lineHeight: 1.2, textAlign: 'center' }}>{L(modalPerm.name)}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 2px 15px', textAlign: 'center' }}>{L(modalPerm.detail)}</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: THEME.warningLight, border: `1px solid ${shade(THEME.warning, 78)}`, borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <Icon name="alert-triangle" size={17} color={THEME.warning} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: THEME.warning, fontWeight: 600, lineHeight: 1.45 }}>{L(modalPerm.warn)}</span>
            </div>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={grantActive}>{L('Go to settings')}</Button>
            {/* declining is a real choice — it drops the card to the limited state (F-26) */}
            <button onClick={denyActive} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Not now')}</button>
          </div>
        </div>
      )}

      {/* permission-denied fallback (F-26) — instead of hard-blocking, spell out
          exactly which protections drop and let the child continue in limited mode.
          Warnings, vibration and notifications still work for the granted ones. */}
      {showFallback && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setShowFallback(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
          <div className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 24px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 62, height: 62, borderRadius: 999, background: THEME.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield-alert" size={30} color={THEME.warning} stroke={2.2} />
              </div>
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '0 8px 8px', lineHeight: 1.2, textAlign: 'center' }}>{L('Protection will be limited')}</h1>
            <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, margin: '0 2px 15px', textAlign: 'center' }}>{L('Without these, JoanX keeps running — but some warnings won’t work. You can turn them on anytime in Settings.')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, textAlign: 'left' }}>
              {perms.filter(p => !grants[p.id]).map(p => (
                <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: THEME.warningLight, borderRadius: 12, padding: '11px 13px' }}>
                  <Icon name={p.icon} size={17} color={THEME.warning} stroke={2.1} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{L(p.name)}</div>
                    <div style={{ fontSize: 12, color: THEME.warning, fontWeight: 600, lineHeight: 1.4, marginTop: 1 }}>{L(p.warn)}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => setShowFallback(false)}>{L('Go back & allow')}</Button>
            <button onClick={() => { perms.forEach(p => { if (!grants[p.id]) deny(p.id); }); setShowFallback(false); openEgg(); }} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Continue with limited protection')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Onboarding };
