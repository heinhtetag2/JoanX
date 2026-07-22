// JoanX — parent app · ParentChildren

import React from 'react';
import { CHILDREN, FEATURES, MAX_CHILDREN } from '../core/data.jsx';
import { Icon, PhotoAvatar, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── Children / devices ───────────────────────────────────────────────
// Reconnecting an offline child is done from that child's Rules & settings
// screen ("Connect device"), so the card itself just shows status — no button.
function ParentChildren({ ctx }) {
  const ko = getLang() === 'ko';
  const atCap = CHILDREN.length >= MAX_CHILDREN;   // A-13 · account is full at MAX_CHILDREN
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={ko ? `자녀 ${CHILDREN.length}/${MAX_CHILDREN}명 · ${CHILDREN.filter(c => c.online).length}명 연결됨` : `${CHILDREN.length}/${MAX_CHILDREN} children · ${CHILDREN.filter(c => c.online).length} connected`} title={L('Children')} right={<button onClick={() => !atCap && ctx.nav('p_addchild', { direct: true })} disabled={atCap} aria-disabled={atCap} title={atCap ? L('Child limit reached') : undefined} style={{ height: 40, padding: '0 15px 0 12px', borderRadius: 999, background: BRAND.primary, border: 'none', boxShadow: BRAND.shadowPrimary, display: 'inline-flex', alignItems: 'center', gap: 5, cursor: atCap ? 'default' : 'pointer', opacity: atCap ? 0.4 : 1, fontFamily: 'inherit' }}><Icon name="plus" size={18} color="#fff" stroke={2.7} /><span style={{ color: '#fff', fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap' }}>{L('Add a child')}</span></button>} />
      <div style={{ padding: '8px 16px 0' }}>
        {CHILDREN.map((k, ki) => {
          const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][ki % 6];  // distinct avatar palette per child
          return (
          <div key={k.id} onClick={() => ctx.nav('p_settings', { child: k })} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <PhotoAvatar src={k.photo} size={46} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }} fallback={<MascotChip species={k.avatar} color={k.color} size={46} bg={`var(--color-interactives-avatar-${pal}-default)`} />} />
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={k.online ? 'link-2' : 'link-2-off'} size={14} color={k.online ? THEME.success : THEME.fg3} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700, color: k.online ? THEME.success : THEME.fg2 }}>{k.online ? L('Protected now') : L('Not connected')}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{k.online ? `${L('Last seen')} ${k.lastSeen}` : L('Open to connect')}</div>
              </div>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="battery-medium" size={14} color={k.battery < 50 ? THEME.warning : THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700 }}>{k.online ? `${k.battery}%` : '—'}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{L('Battery')}</div>
              </div>
            </div>
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
  );
}

export { ParentChildren };
