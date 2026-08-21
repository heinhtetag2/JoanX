// JoanX — parent app · ParentAlertDetail
//
// Where an Alerts row lands when the list view isn't enough on its own — right now that's C7
// impact/fall (see child/ImpactOverlay.jsx's ImpactParentAlert, the full-screen version of this
// same event). A parent who missed the ring, or is checking back later, opens this from the row
// instead: what happened, to whom, when — plus the one action that matters. "Make a call" is a
// real `tel:` link, so it hands off to the phone's own dialer rather than staying inside the app.

import React from 'react';
import { CHILDREN, PARENT_ALERTS, guardianMe } from '../core/data.jsx';
import { Icon, PhotoAvatar, THEME, avatarPalFor, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// This row is written live (core/data.jsx's pushImpactAlert stamps a real `ts`), so it's
// formatted here rather than hand-authored like the rest of this prototype's mock timestamps.
const fmtTime = (ts) => {
  if (!ts) return null;
  const d = new Date(ts);
  const h24 = d.getHours(), mm = String(d.getMinutes()).padStart(2, '0');
  const h12 = ((h24 + 11) % 12) + 1;
  return getLang() === 'ko' ? `오늘 · ${h24 < 12 ? '오전' : '오후'} ${h12}:${mm}` : `Today · ${h12}:${mm} ${h24 < 12 ? 'AM' : 'PM'}`;
};

// The seeded alert rows carry a bare shorthand ('5m', '2h', '2d') — fine as a compact column in
// the Alerts list, but standing alone under a name here it reads like a stray fragment, not a
// "when". Spelled out with "ago" it's legible on its own.
const agoLabel = (t) => {
  const m = /^(\d+)([mhd])$/.exec(t);
  if (!m) return L(t);   // 'Yesterday' and the like — already a whole word
  const [, n, unit] = m;
  if (getLang() === 'ko') return `${n}${unit === 'm' ? '분' : unit === 'h' ? '시간' : '일'} 전`;
  const word = unit === 'm' ? 'minute' : unit === 'h' ? 'hour' : 'day';
  return `${n} ${word}${n === '1' ? '' : 's'} ago`;
};

function ParentAlertDetail({ ctx }) {
  const alert = PARENT_ALERTS.find(a => a.id === ctx.params?.alertId);
  const child = CHILDREN.find(c => c.id === alert?.child);
  // `alert.ack` is mutated in place (same convention ParentActivity's rows already read) —
  // this tick just forces a re-render once the mutation lands.
  const [, bump] = React.useState(0);

  if (!alert || !child) {
    return (
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
        <ParentHead title={L('Alerts')} onBack={() => ctx.nav('p_activity')} />
      </div>
    );
  }

  const message = alert.reason === 'help'
    ? L('They asked for help during a safety check.')
    : L('No response for 20 seconds. Please check right away.');
  const pal = avatarPalFor(child.id);
  const when = fmtTime(alert.ts);
  const markHandled = () => { alert.ack = guardianMe().name; bump(n => n + 1); };

  // The same escalation ImpactSafetyCheck just walked the child through, retold as a short
  // timeline — the "so what actually happened" a parent lands on this page looking for.
  const steps = [
    { icon: 'triangle-alert', label: L('Impact detected') },
    { icon: 'shield-alert', label: L('Safety check shown on their device') },
    alert.reason === 'help' ? { icon: 'hand', label: L('Tapped “I need help”') } : { icon: 'clock', label: L('No response within 20 seconds') },
    { icon: 'bell', label: L('You were notified') },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead title={L(alert.title)} onBack={() => ctx.nav('p_activity')} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* headline card — a soft danger tint, not a solid fill: the full-screen takeover is the
            urgent moment, this is a parent checking back, so the card reads "look at this"
            rather than sounding the alarm again */}
        <div style={{ background: THEME.dangerLight, borderRadius: 22, padding: '26px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 18 }}>
          <div style={{ position: 'relative', width: 84, height: 84, marginBottom: 14 }}>
            <PhotoAvatar src={child.photo} size={84} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }} fallback={
              <PhotoAvatar src="/assets/avatars/avatar-child.png" size={84} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }}
                fallback={<MascotChip species={child.avatar} color={child.color} size={84} bg={`var(--color-interactives-avatar-${pal}-default)`} />} />} />
            <span style={{ position: 'absolute', right: -2, bottom: -2, width: 30, height: 30, borderRadius: 999, background: '#fff', border: `2px solid ${THEME.dangerLight}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="triangle-alert" size={14} color={THEME.danger} stroke={2.6} />
            </span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, color: THEME.fg1 }}>{child.name}</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: THEME.danger, marginTop: 3 }}>{when || agoLabel(alert.time)}</div>
          <div style={{ fontSize: 14, color: THEME.fg2, marginTop: 10, lineHeight: 1.5 }}>{message}</div>
        </div>

        {alert.ack && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 999, background: THEME.successLight, color: THEME.success, fontSize: 12.5, fontWeight: 800, marginBottom: 14 }}>
            <Icon name="check" size={13} color={THEME.success} stroke={3} />{alert.ack} {L('already checked this')}
          </div>
        )}

        {/* what happened — the escalation retold as a short timeline */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('What happened')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '16px', marginBottom: 18 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 26, height: 26, borderRadius: 999, background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={s.icon} size={13} color={THEME.danger} stroke={2.4} />
                </div>
                {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: THEME.border, margin: '3px 0' }} />}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1, paddingTop: 3, paddingBottom: i < steps.length - 1 ? 14 : 0 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* the one direct action — call the child, handed off to the device's own dialer */}
        <a href={`tel:${child.phone}`} style={{ textDecoration: 'none', WebkitTapHighlightColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', padding: '15px 20px', borderRadius: 16, background: THEME.danger, color: '#fff', fontSize: 16, fontWeight: 700 }}>
          <Icon name="phone" size={19} color="#fff" stroke={2.6} />{L('Make a call')}
        </a>
        {!alert.ack && (
          <button onClick={markHandled} style={{ width: '100%', padding: '13px 20px', marginTop: 10, borderRadius: 16, border: `1.5px solid ${THEME.border}`, background: '#fff', color: THEME.fg1, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer' }}>
            {L('I’ve checked on them')}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16 }}>
          <Icon name="shield-check" size={14} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5, color: THEME.fg3, textAlign: 'center', lineHeight: 1.45 }}>
            {L('JoanX is a safety aid, not an emergency service. In a real emergency, call for help.')}
          </span>
        </div>
      </div>
    </div>
  );
}

export { ParentAlertDetail };
