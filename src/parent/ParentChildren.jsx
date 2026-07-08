// JoanX — parent app · ParentChildren

import React from 'react';
import { CHILDREN, FEATURES } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── Children / devices ───────────────────────────────────────────────
function ParentChildren({ ctx }) {
  const ko = getLang() === 'ko';
  const waiting = CHILDREN.filter(c => !c.online).length;
  return (
    <>
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={ko ? `자녀 ${CHILDREN.length}명 · ${CHILDREN.filter(c => c.online).length}명 연결됨` : `${CHILDREN.length} children · ${CHILDREN.filter(c => c.online).length} connected`} title={L('Children')} right={<button onClick={() => ctx.nav('p_addchild', { direct: true })} style={{ width: 40, height: 40, borderRadius: 999, background: BRAND.primary, border: 'none', boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></button>} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* global connect entry — opens the scan/code chooser, then the child picker */}
        <button onClick={() => ctx.nav('p_addchild', { connect: true })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: BRAND.primaryLight, border: 'none', borderRadius: 18, padding: 14, marginBottom: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <span style={{ width: 42, height: 42, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="scan-line" size={22} color={BRAND.primary} stroke={2.3} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 14.5, fontWeight: 800, color: BRAND.primaryDark }}>{L('Connect a device')}</span>
            <span style={{ display: 'block', fontSize: 12, color: BRAND.primaryDark, opacity: .85, marginTop: 2 }}>{waiting > 0 ? (ko ? `${waiting}명이 연결을 기다리고 있어요` : `${waiting} waiting to connect`) : L('Scan a QR or enter a code to link.')}</span>
          </span>
          <Icon name="chevron-right" size={18} color={BRAND.primaryDark} stroke={2.4} />
        </button>

        {CHILDREN.map((k, ki) => {
          const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][ki % 6];  // distinct avatar palette per child
          return (
          <div key={k.id} onClick={() => ctx.nav('p_settings', { child: k })} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <MascotChip species={k.avatar} color={k.color} size={56} bg={`var(--color-interactives-avatar-${pal}-default)`} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 999, background: k.online ? THEME.success : THEME.fg3, border: '2.5px solid #fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{k.name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800 }}><Icon name="flame" size={12} color={THEME.gold} stroke={2.4} />{k.streak || 0}{getLang() === 'ko' ? '일 안전' : 'd safe'}</span>
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
          </div>
          );})}

        <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginTop: 4 }}>
          <Icon name="shield-check" size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{L('Privacy first')}</div>
            <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{FEATURES.dangerZones ? L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.") : L("JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.")}</div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export { ParentChildren };
