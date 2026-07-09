// JoanX — child app · WarningOverlay

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { Confetti } from './shared.jsx';

function RewardToast({ secs = 2.1, pts = 30 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.34)', zIndex: 5 }} className="jx-fade">
      <Confetti />
      <div className="jx-pop" style={{ width: 240, background: '#fff', borderRadius: 26, padding: '24px 20px', textAlign: 'center', boxShadow: THEME.shadowXl }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Icon name="check" size={34} color={THEME.success} stroke={3} />
        </div>
        <div className="game-font" style={{ fontSize: 21, fontWeight: 500 }}>{L('Nice save!')}</div>
        <div style={{ fontSize: 13, color: THEME.fg2, margin: '4px 0 14px' }}>{L('Stopped in')} {secs}s — {L("that's an immediate stop.")}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 16 }} className="game-font">
          <Icon name="star" size={18} color={THEME.gold} stroke={2.4} fill={THEME.gold} /> +{pts} {L('points')}
        </div>
      </div>
    </div>
  );
}

// A compact stage stepper (F-08): vibration ▸ warning ▸ character-message.
// Adapts contrast to the backdrop (light for spotlight, else on-dim white).
function StageSteps({ stage, onLight }) {
  const steps = [{ ic: 'vibrate', l: 'Buzz' }, { ic: 'triangle-alert', l: 'Warning' }, { ic: 'message-circle', l: 'Message' }];
  const idleBg = onLight ? 'rgba(43,41,38,.10)' : 'rgba(255,255,255,.24)';
  const idleFg = onLight ? THEME.fg3 : 'rgba(255,255,255,.9)';
  const barOff = onLight ? 'rgba(43,41,38,.14)' : 'rgba(255,255,255,.3)';
  return (
    <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, zIndex: 4 }}>
      {steps.map((s, i) => {
        const on = i === stage, done = i < stage;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ width: 16, height: 2, borderRadius: 2, background: i <= stage ? THEME.primary : barOff, transition: 'background .3s' }} />}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: on ? '0 11px 0 8px' : '0', width: on ? 'auto' : 24, justifyContent: 'center', borderRadius: 999, background: on ? THEME.primary : (done ? THEME.primaryLight : idleBg), transition: 'all .3s' }}>
              <Icon name={s.ic} size={12.5} color={on ? '#fff' : (done ? THEME.primary : idleFg)} stroke={2.4} />
              {on && <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{L(s.l)}</span>}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// F-09 — timed character message: a bottom toast (~20% height) that pops for
// 1.5s and repeats every 3s, cycling short nudges, once the warning is ignored.
function CharMessageToast({ c, onRespond }) {
  const lines = [L('Eyes up!'), L('Phone away for now'), L('Look ahead!')];
  const [i, setI] = React.useState(0);
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    const hide0 = setTimeout(() => setShow(false), 1500);
    const iv = setInterval(() => {
      setI(x => (x + 1) % 3);
      setShow(true);
      setTimeout(() => setShow(false), 1500);
    }, 3000);
    return () => { clearTimeout(hide0); clearInterval(iv); };
  }, []);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: '20%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 16px calc(env(safe-area-inset-bottom) + 22px)', pointerEvents: 'none' }}>
      <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity .3s ease, transform .3s ease', pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 22, padding: '12px 14px 12px 12px', boxShadow: THEME.shadowCard, width: '100%', maxWidth: 340 }}>
        <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={52} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{lines[i]}</div>
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{c.name} · {L('still walking')}</div>
        </div>
        <button onClick={onRespond} style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 999, background: THEME.primary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="check" size={20} color="#fff" stroke={2.6} />
        </button>
      </div>
    </div>
  );
}

const GRACE_MS = 2600;   // demo-compressed stand-in for the spec's 10s grace window

function WarningOverlay({ ctx }) {
  const variant = ctx.tweaks.overlay || 'sheet';
  const [phase, setPhase] = React.useState('grace'); // grace -> buzz -> warn -> message -> reward
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const respond = () => { setPhase('reward'); setTimeout(() => ctx.closeOverlay(), 1800); };

  // F-07 grace period + F-08 staged escalation — auto-advance:
  // grace (subtle self-correct window) → gentle buzz → on-screen warning → repeating message.
  React.useEffect(() => {
    if (phase === 'grace') { const t = setTimeout(() => setPhase('buzz'), GRACE_MS); return () => clearTimeout(t); }
    if (phase === 'buzz') { const t = setTimeout(() => setPhase('warn'), 1300); return () => clearTimeout(t); }
    if (phase === 'warn') { const t = setTimeout(() => setPhase('message'), 5000); return () => clearTimeout(t); }
  }, [phase]);
  const stage = { buzz: 0, warn: 1, message: 2 }[phase];
  const grace = phase === 'grace';
  const lightBg = variant === 'spotlight' && phase === 'warn';

  const Msg = () => (
    <React.Fragment>
      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25 }}>{L('Eyes up,')} {PLAYER.name}!</div>
      <div style={{ fontSize: 13.5, color: THEME.fg2, marginTop: 4, lineHeight: 1.4 }}>{L("Let's put the phone away while we're walking.")}</div>
    </React.Fragment>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
      {/* dim — barely-there during grace, then deepens as the escalation advances */}
      <div className="jx-fade" style={{ position: 'absolute', inset: 0, background: grace ? 'rgba(43,41,38,.16)' : lightBg ? 'rgba(248,247,247,.86)' : phase === 'message' ? 'rgba(43,41,38,.52)' : 'rgba(43,41,38,.34)', backdropFilter: lightBg ? 'blur(3px)' : 'none', transition: 'background .4s ease' }} />

      {/* ── STAGE 0: grace period — a calm, self-correct window before any warning (F-07).
          Tapping "I've got it" here means you caught yourself → no warning, straight to the save. */}
      {grace && (
        <div className="jx-rise" style={{ position: 'absolute', top: 92, left: 16, right: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '13px 15px', boxShadow: THEME.shadowXl }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={46} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Walking — heads up in a sec')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Look up now and no warning is needed.')}</div>
              </div>
              <button onClick={respond} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.primaryLight, color: THEME.primary, fontWeight: 800, fontSize: 12.5, padding: '9px 13px', borderRadius: 999 }}>{L("I've got it")}</button>
            </div>
            {/* depleting bar = the remaining grace before the gentle buzz */}
            <div style={{ marginTop: 11, height: 4, borderRadius: 999, background: THEME.surface2, overflow: 'hidden' }}>
              <div className="jx-countdown" style={{ height: '100%', borderRadius: 999, background: THEME.warning, animationDuration: `${GRACE_MS}ms` }} />
            </div>
          </div>
        </div>
      )}

      {phase === 'reward' ? <RewardToast /> : (
        <React.Fragment>
          {/* escalation stepper — only once the grace window has passed */}
          {!grace && <StageSteps stage={stage} onLight={lightBg} />}

          {/* ── STAGE 1: gentle buzz (pre-warning) ── */}
          {phase === 'buzz' && (
            <div className="jx-fade" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-ring-slow" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-pulse" style={{ width: 78, height: 78, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="vibrate" size={34} color={THEME.fg1} stroke={2.2} />
                </div>
              </div>
              <div className="game-font" style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>{L('One gentle buzz')}</div>
            </div>
          )}

          {/* ── STAGE 3: repeating character message ── */}
          {phase === 'message' && <CharMessageToast c={c} onRespond={respond} />}

          {/* ── STAGE 2: the on-screen warning (chosen variant) ── */}
          {phase === 'warn' && (<React.Fragment>

          {/* ── VARIANT: bottom sheet (spec-accurate, default) ── */}
          {variant === 'sheet' && (
            <div className="jx-overlay-up" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '32px 32px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -10px 30px rgba(0,0,0,.16)' }}>
              <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div className="jx-pop"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={104} /></div>
                <div style={{ flex: 1, background: THEME.surface2, borderRadius: '18px 18px 18px 4px', padding: '12px 14px', marginBottom: 8 }}><Msg /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Button variant="primary" size="md" fullWidth onClick={respond}>{L('I looked up')}</Button>
              </div>
              {/* live countdown of the escalate-to-message window (F-08) */}
              <div style={{ marginTop: 12, height: 5, borderRadius: 999, background: THEME.surface2, overflow: 'hidden' }}>
                <div className="jx-countdown" style={{ height: '100%', borderRadius: 999, background: THEME.gold }} />
              </div>
              <div style={{ fontSize: 11, color: THEME.fg3, textAlign: 'center', marginTop: 6 }}>{L('Look up soon, or I’ll keep reminding you')}</div>
            </div>
          )}

          {/* ── VARIANT: spotlight ── */}
          {variant === 'spotlight' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
              <div className="jx-pop jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={172} /></div>
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 10 }}>{L('Eyes up,')} {PLAYER.name}!</div>
              <div style={{ fontSize: 15, color: THEME.fg2, margin: '8px 0 22px', lineHeight: 1.45 }}>{L("Hammy noticed you're walking. Let's put the phone away and stay safe.")}</div>
              <Button variant="primary" size="lg" fullWidth onClick={respond} style={{ maxWidth: 280 }}>{L('I looked up')}</Button>
              <div style={{ fontSize: 12, color: THEME.fg3, marginTop: 14 }}>{L('Stop fast for bonus points')}</div>
            </div>
          )}

          {/* ── VARIANT: minimal banner ── */}
          {variant === 'banner' && (
            <div className="jx-rise" style={{ position: 'absolute', top: 94, left: 14, right: 14 }}>
              <div onClick={respond} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 20, padding: '12px 14px', boxShadow: THEME.shadowXl, cursor: 'pointer' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Eyes up while walking')}</div>
                  <div style={{ fontSize: 12, color: THEME.fg2 }}>{L("Tap when you've looked up")}</div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={18} color={THEME.primary} stroke={2.6} />
                </div>
              </div>
            </div>
          )}
          </React.Fragment>)}

          {/* close affordance for the prototype */}
          {variant !== 'sheet' && phase !== 'buzz' && (
            <button onClick={() => ctx.closeOverlay()} style={{ position: 'absolute', top: 96, right: 16, width: 34, height: 34, borderRadius: 999, background: 'rgba(0,0,0,.18)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}>
              <Icon name="x" size={18} color="#fff" stroke={2.4} />
            </button>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

export { WarningOverlay };
