// JoanX — parent app · ParentChildren

import React from 'react';
import { createPortal } from 'react-dom';
import { CHILDREN, FEATURES, MAX_CHILDREN } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// Reconnect help sheet — shown when a parent taps "Reconnect" on an offline
// child's device card. Explains the (child-side) steps + offers a reminder nudge.
function ReconnectSheet({ child, onClose }) {
  const [sent, setSent] = React.useState(false);
  const steps = [
    { ic: 'smartphone', t: 'Open JoanX on their phone' },
    { ic: 'wifi', t: 'Check Wi-Fi or mobile data' },
    { ic: 'refresh-cw', t: 'Keep the app running in the background' },
  ];
  return createPortal((
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)' }} />
      <div className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 22px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <div style={{ width: 60, height: 60, borderRadius: 999, background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="wifi-off" size={28} color={THEME.danger} stroke={2.2} />
          </div>
        </div>
        <h1 style={{ fontSize: 19, fontWeight: 800, margin: '0 0 4px', textAlign: 'center', color: THEME.fg1 }}>{L('Reconnect this device')}</h1>
        <p style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 16px', textAlign: 'center' }}>{child.name} · {child.device} · {L('Last seen')} {child.lastSeen}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: THEME.surface2, borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ width: 30, height: 30, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 800, fontSize: 13, color: BRAND.primary }}>{i + 1}</div>
              <Icon name={s.ic} size={18} color={THEME.fg2} stroke={2.1} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(s.t)}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setSent(true)} disabled={sent} style={{ width: '100%', border: 'none', cursor: sent ? 'default' : 'pointer', fontFamily: 'inherit', background: sent ? THEME.successLight : BRAND.primary, color: sent ? THEME.success : '#fff', fontWeight: 800, fontSize: 15, padding: '14px', borderRadius: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: sent ? 'none' : BRAND.shadowPrimary }}>
          <Icon name={sent ? 'check' : 'bell'} size={17} color={sent ? THEME.success : '#fff'} stroke={2.4} />{L(sent ? 'Reminder sent' : 'Send a reconnect reminder')}
        </button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Close')}</button>
      </div>
    </div>
  ), document.querySelector('.screen') || document.body);
}

// ── Children / devices ───────────────────────────────────────────────
function ParentChildren({ ctx }) {
  const ko = getLang() === 'ko';
  const [reconnect, setReconnect] = React.useState(null);   // offline child whose reconnect sheet is open
  const atCap = CHILDREN.length >= MAX_CHILDREN;   // A-13 · account is full at MAX_CHILDREN
  return (
    <>
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={ko ? `자녀 ${CHILDREN.length}/${MAX_CHILDREN}명 · ${CHILDREN.filter(c => c.online).length}명 연결됨` : `${CHILDREN.length}/${MAX_CHILDREN} children · ${CHILDREN.filter(c => c.online).length} connected`} title={L('Children')} right={<button onClick={() => !atCap && ctx.nav('p_addchild', { direct: true })} disabled={atCap} aria-disabled={atCap} title={atCap ? L('Child limit reached') : undefined} style={{ width: 40, height: 40, borderRadius: 999, background: BRAND.primary, border: 'none', boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: atCap ? 'default' : 'pointer', opacity: atCap ? 0.4 : 1 }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></button>} />
      <div style={{ padding: '8px 16px 0' }}>
        {CHILDREN.map((k, ki) => {
          const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][ki % 6];  // distinct avatar palette per child
          return (
          <div key={k.id} onClick={() => ctx.nav('p_settings', { child: k })} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <MascotChip species={k.avatar} color={k.color} size={46} bg={`var(--color-interactives-avatar-${pal}-default)`} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 999, background: k.online ? THEME.success : THEME.fg3, border: '2.5px solid #fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{k.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: THEME.successLight, color: THEME.success, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800 }}><Icon name="flame" size={12} color={THEME.success} stroke={2.4} />{k.streak || 0}{getLang() === 'ko' ? '일 안전' : 'd safe'}</span>
                </div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L('Age')} {k.age} · {k.device}</div>
              </div>
              <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={k.online ? 'wifi' : 'wifi-off'} size={14} color={k.online ? THEME.success : THEME.fg3} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700, color: k.online ? THEME.success : THEME.fg2 }}>{k.online ? L('Protected now') : L('Not connected')}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{k.online ? `${L('Last seen')} ${k.lastSeen}` : L('Open to connect')}</div>
              </div>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="battery-medium" size={14} color={k.battery < 50 ? THEME.warning : THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700 }}>{k.online ? `${k.battery}%` : '—'}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{L('Battery')}</div>
              </div>
            </div>
            {/* offline → surface a direct reconnect flow instead of a dead status */}
            {!k.online && (
              <button onClick={e => { e.stopPropagation(); setReconnect(k); }} style={{ width: '100%', marginTop: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, border: `1.5px solid ${THEME.danger}`, background: THEME.dangerLight, color: THEME.danger, borderRadius: 12, padding: '11px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 800 }}>
                <Icon name="wifi-off" size={15} color={THEME.danger} stroke={2.4} />{L('Reconnect')}
              </button>
            )}
          </div>
          );})}

        {atCap && <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center', margin: '2px 0 14px' }}>{ko ? `한 계정당 최대 ${MAX_CHILDREN}명까지 관리할 수 있어요.` : `You can manage up to ${MAX_CHILDREN} children per account.`}</div>}

        <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginTop: 4 }}>
          <Icon name="shield-check" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('Privacy first')}</div>
            <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{FEATURES.dangerZones ? L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.") : L("JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.")}</div>
          </div>
        </div>
      </div>
    </div>
    {reconnect && <ReconnectSheet child={reconnect} onClose={() => setReconnect(null)} />}
    </>
  );
}

export { ParentChildren };
