// JoanX — parent app · ParentAccount

import React from 'react';
import { FEATURES, guardians, PARENT_PROFILE } from '../core/data.jsx';
import { Button, Icon, Modal, PhotoAvatar, THEME, Toggle, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── Parent / account settings (global — not tied to one child) ───────
function ParentAccount({ ctx }) {
  const [push, setPush] = React.useState(true);
  const [weekly, setWeekly] = React.useState(true);
  const [signOut, setSignOut] = React.useState(false);   // sign-out confirmation modal
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
          <PhotoAvatar src={PARENT_PROFILE.avatar} size={52}
            fallback={<div style={{ width: 52, height: 52, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800 }}>{PARENT_PROFILE.name[0]}</div>} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{PARENT_PROFILE.name}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>{PARENT_PROFILE.email}</div>
          </div>
          {chev}
        </div>

        {/* Language sits up top — it's the setting a parent is most likely to reach for, so it
            shouldn't be buried under Support at the bottom of the screen. */}
        {label(L('General'))}
        {card(
          <div style={{ ...rowStyle(0), cursor: 'default' }}><Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div>
            <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 999, padding: 3 }}>
              {[['en', 'EN'], ['ko', '한국어']].map(([v, l]) => (
                <button key={v} onClick={() => ctx.setLang(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '4px 13px', borderRadius: 999, background: ctx.lang === v ? '#fff' : 'transparent', color: ctx.lang === v ? BRAND.primary : THEME.fg2, boxShadow: ctx.lang === v ? THEME.shadowCard : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
        )}

        {/* The household. Sits above Notifications because "who else can see my child" is a
            bigger question than "does my phone buzz", and a parent looking for it looks here. */}
        {label(L('Family'))}
        {card(
          <div onClick={() => ctx.nav('p_family')} style={rowStyle(0)}>
            <Icon name="users" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Parents')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: -6, marginRight: 6 }}>
              {guardians().map((m, i) => (
                <span key={m.id} style={{ width: 24, height: 24, borderRadius: 999, background: BRAND.primaryLight, color: BRAND.primaryDark, border: '2px solid #fff', marginLeft: i ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 800 }}>{m.name[0]}</span>
              ))}
            </div>
            {chev}
          </div>
        )}

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

        {label(L('Support'))}
        {card(<React.Fragment>
          <div onClick={() => ctx.nav('p_detail', { page: 'notices' })} style={rowStyle(0)}><Icon name="megaphone" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Notices')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'help' })} style={rowStyle(1)}><Icon name="help-circle" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Help & support')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'inquiry' })} style={rowStyle(2)}><Icon name="headphones" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('1:1 Inquiry')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'about' })} style={rowStyle(3)}><Icon name="info" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('About JoanX')}</div>{chev}</div>
        </React.Fragment>)}

        {card(
          <div onClick={() => setSignOut(true)} style={{ ...rowStyle(0), justifyContent: 'center' }}><Icon name="log-out" size={18} color={THEME.danger} stroke={2.2} /><div style={{ fontSize: 14, fontWeight: 800, color: THEME.danger }}>{L('Sign out')}</div></div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4 }}>JoanX · v1.0.0</div>
      </div>

      {/* sign-out confirmation — centered dialog */}
      {signOut && (
        <Modal title={L('Sign out?')} onClose={() => setSignOut(false)}>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.55, marginBottom: 20, textAlign: 'center' }}>{L('You can sign back in anytime. Your children stay protected.')}</div>
          <Button variant="danger" fullWidth onClick={() => { setSignOut(false); ctx.nav('p_reports'); }}>{L('Sign out')}</Button>
          <button onClick={() => setSignOut(false)} style={{ width: '100%', marginTop: 4, padding: '12px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, color: THEME.fg2 }}>{L('Cancel')}</button>
        </Modal>
      )}
    </div>
  );
}

export { ParentAccount };
