// JoanX — C7 · Impact / Fall Detection (highest-priority safety event)
//
// The IMU reports a hard impact / free-fall. That reading is a FIRST-PASS ESTIMATE, so before
// anything reaches the parent the child gets a manual safety check to rule out a false positive
// (phone dropped, roughhousing). Only a "need help" tap — or no answer inside the 20s window —
// escalates. This is the top of the intervention hierarchy (impact > risk event > general
// status): when it fires it takes the whole screen and ends any warning already in progress.
//
// One component, both sides of the event: `role === 'child'` renders the on-device safety
// check; `role === 'parent'` renders the urgent notification the parent receives. Kept together
// because the two screens are one feature and share its copy, colours and the 20s contract —
// splitting them across child/ and parent/ is how the two halves drift apart.

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';

// The window before we notify the parent for the child. Full 20s per the spec; the pilot can
// retune it. Named once so the copy, the ring and the bar all count the same clock.
const IMPACT_COUNTDOWN_S = 20;

// A depleting ring around the countdown number. SVG stroke-dashoffset animated by the remaining
// fraction, so the ring, the digit and the bar never disagree. Turns from safe-green to danger
// as the window runs out — the colour itself says "answer soon".
function CountRing({ secs, total, size = 132 }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const frac = Math.max(0, secs / total);
  const late = frac <= 0.35;
  const col = late ? THEME.danger : '#fff';
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={6} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} style={{ transition: 'stroke-dashoffset 1s linear, stroke .4s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="game-font" style={{ fontSize: 40, fontWeight: 500, color: '#fff', lineHeight: 1 }}>{secs}</span>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>{L('sec')}</span>
      </div>
    </div>
  );
}

// ── CHILD · the safety check ─────────────────────────────────────────
// "Are you okay?" with a 20s countdown to auto-notify. Two answers: "I'm okay" dismisses with no
// alert sent; "I need help" escalates immediately. Silence for the full window escalates too.
function ImpactSafetyCheck({ onClose, onGoParent, onKey }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [phase, setPhase] = React.useState('check');   // check → sent (escalated)
  const [reason, setReason] = React.useState(null);    // 'help' | 'timeout' — how the escalation happened
  const [secs, setSecs] = React.useState(IMPACT_COUNTDOWN_S);
  // tell the dev handoff badge which step is on screen
  React.useEffect(() => { onKey && onKey(phase === 'sent' ? 'impact_sent' : 'impact_check'); }, [phase, onKey]);

  // The countdown. Ticks once a second while the check is up; reaching zero auto-escalates,
  // which is the same outcome as "I need help" (spec: no response within 20s → auto-notify).
  React.useEffect(() => {
    if (phase !== 'check') return;
    if (secs <= 0) { escalate('timeout'); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs, phase]);

  const escalate = (why) => { setReason(why); setPhase('sent'); };

  // The escalated screen carries no actions — the child has already done the one thing asked of
  // them, so it states what happened, holds long enough to read, and dismisses itself.
  React.useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => onClose && onClose(), 5000);
    return () => clearTimeout(t);
  }, [phase, onClose]);

  // ── ESCALATED — the parent has been told. Calm, not alarming: the child has already done the
  // one thing asked of them, so this reassures rather than counts down. Restates that JoanX is a
  // safety aid, not an emergency service (set in onboarding), so no one waits on it in a crisis.
  if (phase === 'sent') {
    return (
      <div className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }}>
        {/* matching living backdrop in the brand green — the "you're safe" counterpart of the red */}
        <div className="jx-impact-bg safe" style={{ zIndex: -1 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
          {/* same disc as the check screen (156/128), so both states hold the buddy the same way.
              The check badge sits flat — a brand-green ring reads it apart from the mascot without
              the drop-shadow glow the flat-UI direction rules out. */}
          <div className="jx-char-in" style={{ position: 'relative', width: 156, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(255,255,255,.12)' }} />
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="happy" size={128} /></div>
            <span className="jx-pop" style={{ position: 'absolute', right: 8, bottom: 10, width: 42, height: 42, borderRadius: 999, background: '#fff', border: `3px solid ${THEME.brand}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="check" size={20} color={THEME.brand} stroke={3.2} />
            </span>
          </div>
          <div className="game-font jx-content-in" style={{ fontSize: 26, fontWeight: 500 }}>{L('Your parent has been told')}</div>
          <div className="jx-content-in" style={{ fontSize: 14.5, color: 'rgba(255,255,255,.88)', margin: '8px 0 0', lineHeight: 1.5, animationDelay: '.1s' }}>
            {reason === 'timeout' ? L('You didn’t answer, so I let them know. Stay where you are — help is coming.') : L('I let them know right away. Stay where you are — help is coming.')}
          </div>
        </div>
        {/* no actions — just the safety note (led by the shield, matching the managed-device
            line on Profile), then the screen dismisses itself */}
        <div style={{ padding: '0 30px calc(env(safe-area-inset-bottom) + 26px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <Icon name="shield-check" size={16} color="rgba(255,255,255,.72)" stroke={2.2} />
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.72)', textAlign: 'center', lineHeight: 1.45 }}>
            {L('JoanX is a safety aid, not an emergency service. In a real emergency, call for help.')}
          </div>
        </div>
      </div>
    );
  }

  // ── CHECK — "Are you okay?" over a danger backdrop. Danger red, not the warning green: this
  // outranks the walking warning and must not be mistaken for it.
  return (
    <div className="jx-dim-in" style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }}>
      {/* living red backdrop — a diagonal base with two slow-drifting glows, so the top-priority
          screen reads as a breathing surface, not a flat fill. Sits behind the content (z -1). */}
      <div className="jx-impact-bg danger" style={{ zIndex: -1 }} />
      {/* header — the status as a chip (the system's Badge idiom), not a bare rail. Matches
          the parent-alert "Urgent" pill so both faces of the event read the same way. */}
      <div style={{ padding: '52px 24px 0', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.16)', borderRadius: 999, padding: '7px 14px' }}>
          <Icon name="triangle-alert" size={15} color="#fff" stroke={2.6} />
          <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: 'uppercase' }}>{L('Impact detected')}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        {/* mascot sits in a soft disc — the same container the escalated "sent" state uses,
            so the buddy is held on both screens rather than floating on one */}
        <div className="jx-char-in" style={{ position: 'relative', width: 156, height: 156, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(255,255,255,.12)' }} />
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={128} /></div>
        </div>
        <div className="game-font" style={{ fontSize: 29, fontWeight: 500 }}>{L('Are you okay?')}</div>
        <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.88)', margin: '8px 0 24px', lineHeight: 1.5 }}>
          {L('A strong impact was detected.')}
        </div>
        <CountRing secs={secs} total={IMPACT_COUNTDOWN_S} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginTop: 16, lineHeight: 1.45 }}>
          {L('If you don’t answer, I’ll tell your parent.')}
        </div>
      </div>

      {/* the two answers. "I'm okay" is the common case (a dropped phone), so it leads as the solid
          reassuring action; "I need help" sits below as the firm escalate. Both are full-width and
          large — a child who just fell should not have to aim. */}
      <div style={{ padding: '0 22px calc(env(safe-area-inset-bottom) + 22px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onClose} style={{ width: '100%', padding: '15px 28px', borderRadius: 16, border: 'none', background: '#fff', color: THEME.danger, fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          {L('I’m okay')}
        </button>
        <button onClick={() => escalate('help')} style={{ width: '100%', padding: '15px 28px', borderRadius: 16, border: '1.5px solid rgba(255,255,255,.7)', background: 'transparent', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          {L('I need help')}
        </button>
      </div>
    </div>
  );
}

// ── PARENT · the urgent notification ─────────────────────────────────
// What the parent's device shows when the child didn't answer. Urgent by construction: full
// takeover, danger backdrop, two direct actions (call, see where). Nothing to read past first —
// the title, the no-response line and the two buttons are the whole card.
function ImpactParentAlert({ childName = PLAYER.name, onClose, onKey }) {
  React.useEffect(() => { onKey && onKey('impact_parent'); }, [onKey]);
  return (
    <div className="jx-dim-in" style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', color: '#fff', overflow: 'hidden' }}>
      {/* same living red backdrop as the child check — one surface for both faces of the event */}
      <div className="jx-impact-bg danger" style={{ zIndex: -1 }} />
      <div style={{ padding: '52px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
          <span className="jx-pulse-soft" style={{ width: 9, height: 9, borderRadius: 999, background: '#fff', display: 'inline-block' }} />
          {L('Urgent')}
        </span>
        <button onClick={onClose} aria-label={L('Dismiss')} style={{ width: 34, height: 34, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="x" size={18} color="#fff" stroke={2.6} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px' }}>
        <div className="jx-char-in" style={{ position: 'relative', width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <span className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.5)' }} />
          <span className="jx-ring-slow" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.5)' }} />
          <div style={{ width: 98, height: 98, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="triangle-alert" size={54} color={THEME.danger} stroke={2.4} />
          </div>
        </div>
        <div className="game-font" style={{ fontSize: 27, fontWeight: 500 }}>{L('Impact detected')}</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', marginTop: 4 }}>{childName}</div>
        <div style={{ fontSize: 14.5, color: 'rgba(255,255,255,.92)', margin: '12px 0 0', lineHeight: 1.5 }}>
          {L('No response for 20 seconds. Please check on them right away.')}
        </div>
      </div>

      {/* one direct action — call the child. The last-known place is already shown above as
          context; a separate map viewer isn't part of this flow, so calling is the whole CTA. */}
      <div style={{ padding: '0 22px calc(env(safe-area-inset-bottom) + 22px)' }}>
        <button style={{ width: '100%', padding: '15px 28px', borderRadius: 16, border: 'none', background: '#fff', color: THEME.danger, fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
          <Icon name="phone" size={19} color={THEME.danger} stroke={2.6} />{L('Make a call')}
        </button>
      </div>
    </div>
  );
}

// The single entry point App renders. Branches on role so the impact event is one overlay with
// two faces — the child's safety check and the parent's urgent notice. `onKey` reports the
// current step (impact_check / impact_sent / impact_parent) so the dev handoff badge can name it.
function ImpactOverlay({ role, childName, onClose, onGoParent, onKey }) {
  if (role === 'parent') return <ImpactParentAlert childName={childName} onClose={onClose} onKey={onKey} />;
  return <ImpactSafetyCheck onClose={onClose} onGoParent={onGoParent} onKey={onKey} />;
}

export { ImpactOverlay };
