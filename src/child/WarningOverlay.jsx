// JoanX — child app · WarningOverlay

import React from 'react';
import { CHARACTERS, INTERVENTION, PLAYER, interventionMessages, interventionTier, logRiskEvent } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { Confetti } from './shared.jsx';

// Timings. Everything the spec pins down (the 2s hold, the 1.5s message, the 3s gap, the 5s
// cooldown) runs at full length and comes straight from INTERVENTION, which is where the pilot
// will retune them. Only the 10s grace window is demo-compressed, to keep the flow watchable.
const BUZZ_HOLD_MS = INTERVENTION.buzzHoldSeconds * 1000;   // F-08.1 — risk must persist 2s past the buzz
const MESSAGE_MS = INTERVENTION.messageSeconds * 1000;      // F-09 — how long one message stays up
const MESSAGE_GAP_MS = INTERVENTION.messageGapSeconds * 1000; // F-09 — minimum gap between messages
const RECHECK_MS = INTERVENTION.recheckSeconds * 1000; // F-08.2 — 5s quiet cooldown, then re-assess
const SAFE_CONFIRM_MS = INTERVENTION.safeConfirmSeconds * 1000; // F-08.4 — safe must hold this long to remove the overlay
const GRACE_MS = 2600;    // spec: INTERVENTION.graceSeconds (10s)
const IGNORE_MS = MESSAGE_GAP_MS * 2 + MESSAGE_MS;  // two unanswered messages = ignored

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

// F-08.3 — round marker: an ignored warning returns firmer, and the child is told plainly
// that the repeat is being recorded (it feeds the reward system and the parent report).
function RoundBadge({ round, tier, inline }) {
  const urgent = tier.key === 'urgent';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: inline ? 0 : 10 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: urgent ? THEME.dangerLight : THEME.warningLight, color: urgent ? THEME.danger : THEME.warning }}>
        <Icon name="triangle-alert" size={12} color={urgent ? THEME.danger : THEME.warning} stroke={2.4} />
        {L('Reminder')} {round} · {L('recorded in your report')}
      </span>
    </div>
  );
}

// F-09 — timed character message: a bottom toast (~20% height). Each message is on screen
// for MESSAGE_MS, and at least MESSAGE_GAP_MS separates one from the next, so the same line
// can never be redisplayed inside the minimum interval. The toast lives only while the risk
// does — a stop or a dismiss unmounts it, and nothing further is shown.
// Lines rotate through the tier's pool (never twice in a row) to blunt message fatigue,
// and each round starts at a different point in the pool so a repeat offender doesn't hear
// the same opening nudge every time.
// Tone tier → the toast's visual weight. The message step is the *last* thing the child
// sees before the round is logged, so it must not read lighter than the buzz and the
// warning that preceded it. Gentle stays calm; urgent gets the danger rail, the firmer
// copy, and the "this is being recorded" line (F-08.3) — which the sheet and spotlight
// variants already showed but the toast did not.
const TOAST_TONE = {
  gentle: { rail: THEME.primary, chip: THEME.primaryLight, ink: THEME.primary },
  firm:   { rail: THEME.warning, chip: THEME.warningLight, ink: THEME.warning },
  urgent: { rail: THEME.danger,  chip: THEME.dangerLight,  ink: THEME.danger },
};

function CharMessageToast({ c, round, tier, onRespond, onDismiss }) {
  const pool = interventionMessages(round);
  const [i, setI] = React.useState((round - 1) % pool.length);
  const [show, setShow] = React.useState(true);
  React.useEffect(() => {
    const hides = [setTimeout(() => setShow(false), MESSAGE_MS)];
    const iv = setInterval(() => {
      setI(x => (x + 1) % pool.length);   // advance — never the line just shown
      setShow(true);
      hides.push(setTimeout(() => setShow(false), MESSAGE_MS));
    }, MESSAGE_GAP_MS);
    return () => { hides.forEach(clearTimeout); clearInterval(iv); };
  }, [pool.length]);

  const tone = TOAST_TONE[tier.key] || TOAST_TONE.gentle;
  const urgent = tier.key === 'urgent';
  return (
    // F-09 pins the message bottom-centre at ~20% of screen height. The card now actually
    // fills that band instead of sitting in it as a thin strip.
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: '20%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0 14px calc(env(safe-area-inset-bottom) + 18px)', pointerEvents: 'none' }}>
      <div style={{ opacity: show ? 1 : 0, transform: show ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity .3s ease, transform .3s ease', pointerEvents: 'auto', background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: THEME.shadowXl, width: '100%', maxWidth: 360, minHeight: 168 }}>
        {/* tone rail — the one element that reads instantly, before any copy is parsed */}
        <div style={{ height: 5, background: tone.rail }} />
        <div style={{ padding: '13px 15px 15px' }}>
          {/* F-08.3 — a repeat round is recorded, and the child is told so plainly */}
          {round > 1 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: tone.chip, color: tone.ink, marginBottom: 10 }}>
              <Icon name="triangle-alert" size={12} color={tone.ink} stroke={2.4} />
              {L('Reminder')} {round} · {L('recorded in your report')}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={72} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="game-font" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2, color: urgent ? THEME.danger : THEME.fg1 }}>{L(pool[i])}</div>
              {/* at the firmest tier the rotating nudge alone isn't enough — say what to do */}
              <div style={{ fontSize: 13, color: THEME.fg2, marginTop: 3, lineHeight: 1.4 }}>{urgent ? L(tier.body) : `${c.name} · ${L('still walking')}`}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
            <button onClick={onRespond} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.primary, color: '#fff', fontWeight: 800, fontSize: 14, padding: '13px 14px', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
              <Icon name="check" size={17} color="#fff" stroke={2.7} />{L('I looked up')}
            </button>
            <button onClick={onDismiss} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.surface2, color: THEME.fg2, fontWeight: 800, fontSize: 13, padding: '13px 16px', borderRadius: 999 }}>{L('Got it!')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningOverlay({ ctx }) {
  const variant = ctx.tweaks.overlay || 'spotlight';
  const [phase, setPhase] = React.useState('grace'); // grace -> buzz -> warn -> message -> (cooldown ->) buzz... -> reward
  const [round, setRound] = React.useState(1);       // intervention rounds run so far for this one risk event
  const [confirming, setConfirming] = React.useState(false); // F-08.4 — safe state seen; holding to be sure
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const tier = interventionTier(round);              // F-08.3 — tone firms up with every ignored round
  const stoppedAt = React.useRef(null);              // phase the risk ended in → immediate vs delayed stop

  // F-08.4 — detection reports the risk has ended (phone put away, or walking finished). We do NOT
  // tear the overlay down on that first safe sample: accelerometer and usage signals flutter, and a
  // single stray reading would flicker the overlay off and straight back on. Instead the escalation
  // freezes and the safe state has to hold for SAFE_CONFIRM_MS; only then is the overlay removed.
  // If the risk returns inside that window the timer is dropped and the escalation simply resumes.
  // (In the prototype the "I looked up" / "I stopped" buttons stand in for that detection signal.)
  const respond = () => {
    if (confirming) return;
    stoppedAt.current = phase;
    setConfirming(true);
  };

  React.useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => {
      const from = stoppedAt.current;
      logRiskEvent({ outcome: from === 'grace' || from === 'buzz' ? 'immediate' : 'delayed', rounds: round, tier: tier.key });
      setConfirming(false);
      setPhase('reward');
      setTimeout(() => ctx.closeOverlay(), 1800);
    }, SAFE_CONFIRM_MS);
    return () => clearTimeout(t);
  }, [confirming]);
  // F-08.2 — "Got it!" (and simply ignoring the message) clears the UI, not the risk. The overlay
  // leaves the screen immediately and RECHECK_MS of quiet follows: no warning of any kind for this
  // same hazardous situation. Only when the cooldown lapses is the risk re-assessed — and only if
  // walking + phone use are still going do we buzz again and re-show the warning, one tone firmer.
  // No screen block, ever.
  const standDown = (outcome) => {
    logRiskEvent({ outcome, rounds: round, tier: tier.key });
    setPhase('cooldown');
  };

  // F-07 grace period + F-08 staged escalation — auto-advance:
  // grace (subtle self-correct window) → gentle buzz → on-screen warning → repeating message.
  // The buzz→warn hop is conditional: the warning is only drawn if walking + phone use are
  // still going BUZZ_HOLD_MS later. Stopping inside that window ends the escalation here.
  React.useEffect(() => {
    if (confirming) return;   // the risk looks over — hold everything until the safe state is confirmed
    if (phase === 'grace') { const t = setTimeout(() => setPhase('buzz'), GRACE_MS); return () => clearTimeout(t); }
    if (phase === 'buzz') { const t = setTimeout(() => setPhase('warn'), BUZZ_HOLD_MS); return () => clearTimeout(t); }
    if (phase === 'warn') { const t = setTimeout(() => setPhase('message'), 5000); return () => clearTimeout(t); }
    if (phase === 'message') { const t = setTimeout(() => standDown('ignored'), IGNORE_MS); return () => clearTimeout(t); }
    if (phase === 'cooldown') { const t = setTimeout(() => { setRound(n => n + 1); setPhase('buzz'); }, RECHECK_MS); return () => clearTimeout(t); }
  }, [phase, confirming]);
  const stage = { buzz: 0, warn: 1, message: 2 }[phase];
  const grace = phase === 'grace';
  const lightBg = variant === 'spotlight' && phase === 'warn';

  // ── COOLDOWN: dismissed or ignored. The app is usable again — no dim, no block (F-10 is out of
  // MVP scope) — while the system re-assesses the risk. A quiet, non-interactive pill is all that's left.
  if (phase === 'cooldown') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        <div className="jx-rise" style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(43,41,38,.86)', color: '#fff', padding: '9px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            <Icon name="vibrate" size={13} color="#fff" stroke={2.4} />
            {L('Still walking — I’ll check again in a moment')}
          </span>
        </div>
      </div>
    );
  }

  const Msg = () => (
    <React.Fragment>
      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25 }}>{L(tier.title)} {PLAYER.name}!</div>
      <div style={{ fontSize: 13.5, color: THEME.fg2, marginTop: 4, lineHeight: 1.4 }}>{L(tier.body)}</div>
    </React.Fragment>
  );

  // Dismiss control — same label everywhere: it acknowledges the warning, it doesn't end the risk.
  const GotIt = () => (
    <button onClick={() => standDown('dismissed')} style={{
      border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: 13,
      padding: '11px 18px', borderRadius: 999, background: THEME.surface2, color: THEME.fg2,
    }}>{L('Got it!')}</button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
      {/* dim — barely-there during grace, then deepens as the escalation advances */}
      <div className="jx-fade" style={{ position: 'absolute', inset: 0, background: grace ? 'rgba(43,41,38,.16)' : lightBg ? 'rgba(248,247,247,.86)' : phase === 'message' ? 'rgba(43,41,38,.52)' : 'rgba(43,41,38,.34)', backdropFilter: lightBg ? 'blur(3px)' : 'none', transition: 'background .4s ease' }} />

      {/* F-08.4 — safe state seen: the escalation is frozen and the overlay is held for
          SAFE_CONFIRM_MS so a sensor blip can't flicker it away and back. */}
      {confirming && (
        <div className="jx-fade" style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, background: '#fff', borderRadius: 999, padding: '9px 16px 8px', boxShadow: THEME.shadowCard }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{L('Looks safe — making sure…')}</span>
            <span style={{ display: 'block', width: 96, height: 3, borderRadius: 999, background: THEME.surface2, overflow: 'hidden' }}>
              <span className="jx-countdown" style={{ display: 'block', height: '100%', borderRadius: 999, background: THEME.success, animationDuration: `${SAFE_CONFIRM_MS}ms` }} />
            </span>
          </div>
        </div>
      )}

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

          {/* ── STAGE 1: gentle buzz + the 2s hold window (F-08).
              The warning only lands if the risk keeps going for BUZZ_HOLD_MS after the buzz;
              stopping in here (button, or the phone simply going down) skips it entirely. */}
          {phase === 'buzz' && (
            <div className="jx-fade" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-ring-slow" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-pulse" style={{ width: 78, height: 78, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="vibrate" size={34} color={THEME.fg1} stroke={2.2} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="game-font" style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>{round === 1 ? L('One gentle buzz') : L('Buzzing again — still walking')}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', marginTop: 4 }}>{L('Stop within 2s and no warning appears.')}</div>
              </div>
              <div style={{ width: 200 }}>
                <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,.28)', overflow: 'hidden' }}>
                  <div className="jx-countdown" style={{ height: '100%', borderRadius: 999, background: '#fff', animationDuration: `${BUZZ_HOLD_MS}ms` }} />
                </div>
                <button onClick={respond} style={{ marginTop: 14, width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: '#fff', color: THEME.fg1, fontWeight: 800, fontSize: 13.5, padding: '11px 14px', borderRadius: 999 }}>{L('I stopped')}</button>
              </div>
            </div>
          )}

          {/* ── STAGE 3: repeating character message — ignoring it for IGNORE_MS logs
              an "ignored" event and starts the next, firmer round ── */}
          {phase === 'message' && <CharMessageToast c={c} round={round} tier={tier} onRespond={respond} onDismiss={() => standDown('dismissed')} />}

          {/* ── STAGE 2: the on-screen warning (chosen variant) ── */}
          {phase === 'warn' && (<React.Fragment>

          {/* ── VARIANT: bottom sheet ── */}
          {variant === 'sheet' && (
            <div className="jx-overlay-up" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '32px 32px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -10px 30px rgba(0,0,0,.16)' }}>
              <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />
              {round > 1 && <RoundBadge round={round} tier={tier} />}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div className="jx-pop"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={104} /></div>
                <div style={{ flex: 1, background: THEME.surface2, borderRadius: '18px 18px 18px 4px', padding: '12px 14px', marginBottom: 8 }}><Msg /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Button variant="primary" size="md" fullWidth onClick={respond}>{L('I looked up')}</Button>
                <GotIt />
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
              {round > 1 && <div style={{ marginTop: 10 }}><RoundBadge round={round} tier={tier} inline /></div>}
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 10 }}>{L(tier.title)} {PLAYER.name}!</div>
              <div style={{ fontSize: 15, color: THEME.fg2, margin: '8px 0 22px', lineHeight: 1.45 }}>{L(tier.body)}</div>
              <Button variant="primary" size="lg" fullWidth onClick={respond} style={{ maxWidth: 280 }}>{L('I looked up')}</Button>
              <div style={{ marginTop: 12 }}><GotIt /></div>
            </div>
          )}

          {/* ── VARIANT: minimal banner ── */}
          {variant === 'banner' && (
            <div className="jx-rise" style={{ position: 'absolute', top: 94, left: 14, right: 14 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '12px 14px', boxShadow: THEME.shadowXl }}>
                <div onClick={respond} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={56} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{round === 1 ? L('Eyes up while walking') : L(tier.title) + ' ' + PLAYER.name + '!'}</div>
                    <div style={{ fontSize: 12, color: THEME.fg2 }}>{round === 1 ? L("Tap when you've looked up") : L(tier.body)}</div>
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={18} color={THEME.primary} stroke={2.6} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}><GotIt /></div>
              </div>
            </div>
          )}
          </React.Fragment>)}
        </React.Fragment>
      )}
    </div>
  );
}

export { WarningOverlay };
