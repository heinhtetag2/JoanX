// JoanX — parent app · ParentAccount

import React from 'react';
import { FEATURES } from '../core/data.jsx';
import { Icon, THEME, Toggle, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── Parent / account settings (global — not tied to one child) ───────
function ParentAccount({ ctx }) {
  const [push, setPush] = React.useState(true);
  const [weekly, setWeekly] = React.useState(true);
  const chev = <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />;
  const rowStyle = i => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' });
  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const card = children => <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>{children}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Parent app')} title={L('Profile')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* account identity */}
        <div onClick={() => ctx.nav('p_detail', { page: 'account' })} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, cursor: 'pointer' }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800 }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Sora Kim</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>sora.kim@email.com</div>
          </div>
          {chev}
        </div>

        {label(L('Notifications'))}
        {card(<React.Fragment>
          <div style={{ ...rowStyle(0), cursor: 'default' }}><Icon name="bell" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Push notifications')}</div><Toggle on={push} onChange={setPush} /></div>
          <div style={{ ...rowStyle(1), cursor: 'default' }}><Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Weekly summary email')}</div><Toggle on={weekly} onChange={setWeekly} /></div>
        </React.Fragment>)}

        {label(L('Privacy & data'))}
        {card(<React.Fragment>
          <div onClick={() => ctx.nav('p_detail', { page: 'privacy' })} style={rowStyle(0)}><Icon name="shield-check" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Data & privacy')}</div>{chev}</div>
          {FEATURES.dangerZones && <div onClick={() => ctx.nav('p_detail', { page: 'location' })} style={rowStyle(1)}><Icon name="map-pin" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Location history')}</div>{chev}</div>}
          <div onClick={() => ctx.nav('p_detail', { page: 'export' })} style={rowStyle(FEATURES.dangerZones ? 2 : 1)}><Icon name="download" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Export my data')}</div>{chev}</div>
        </React.Fragment>)}

        {label(L('General'))}
        {card(<React.Fragment>
          <div onClick={() => ctx.nav('p_detail', { page: 'language' })} style={rowStyle(0)}><Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div><span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginRight: 4 }}>{ctx.lang === 'ko' ? '한국어' : 'English'}</span>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'help' })} style={rowStyle(1)}><Icon name="help-circle" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Help & support')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'faq' })} style={rowStyle(2)}><Icon name="messages-square" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('FAQ')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'about' })} style={rowStyle(3)}><Icon name="info" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('About JoanX')}</div>{chev}</div>
        </React.Fragment>)}

        {card(
          <div onClick={() => ctx.nav('p_detail', { page: 'signout' })} style={{ ...rowStyle(0), justifyContent: 'center' }}><Icon name="log-out" size={18} color={THEME.danger} stroke={2.2} /><div style={{ fontSize: 14, fontWeight: 800, color: THEME.danger }}>{L('Sign out')}</div></div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4 }}>JoanX · v1.0.0</div>
      </div>
    </div>
  );
}

export { ParentAccount };
