// JoanX — child app · Friends

import React from 'react';
import { CHARACTERS, FRIENDS, PLAYER } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip } from '../core/characters.jsx';
import { ScreenHeader } from './shared.jsx';

// Friends-area brand purple (design-system iris ramp) — 50 / 60 / 10.
const PURPLE = { main: '#7f63c5', dark: '#603fab', light: '#f5f1fd' };

// ── Friends list (F-32) — a primary tab, so no back button ───────────
function Friends({ ctx }) {
  const friends = ctx.demo?.empty ? [] : FRIENDS;   // first-run: no friends added yet
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Friends')}
        right={<button onClick={() => ctx.nav('addfriend')} aria-label={L('Add friends')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: PURPLE.main, border: 'none', borderRadius: 999, padding: '8px 13px', boxShadow: 'none', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="user-plus" size={15} color="#fff" stroke={2.5} /><span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{L('Add')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        {/* my own profile */}
        {(() => { const me = CHARACTERS.find(x => x.id === PLAYER.activeCharId); return (
          <button onClick={() => ctx.nav('myhouse')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: `linear-gradient(135deg,${PURPLE.main},${PURPLE.dark})`, border: 'none', borderRadius: 20, padding: 14, boxShadow: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, textAlign: 'left' }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={me.species} stage={me.stage} color={me.color} size={46} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: '#fff' }}>{L('My Profile')}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{L('Edit your buddy, background & rooms')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.16)', borderRadius: 999, padding: '5px 10px' }}><Icon name="heart" size={13} color="#fff" fill="#fff" stroke={2} /><span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{PLAYER.likes}</span></div>
          </button>
        ); })()}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 10px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Your friends')}</div>
        {friends.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '26px 24px', background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}` }}>
            <div style={{ width: 76, height: 76, borderRadius: 999, background: PURPLE.light, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon name="users" size={34} color={PURPLE.main} stroke={2} /></div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L('No friends yet')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '6px 0 16px', maxWidth: 230 }}>{L('Add a friend to visit their room, leave likes, and cheer each other on.')}</div>
            <button onClick={() => ctx.nav('addfriend')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: PURPLE.main, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 22px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="user-plus" size={16} color="#fff" stroke={2.4} />{L('Add friends')}
            </button>
          </div>
        )}
        {friends.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, border: `1px solid ${THEME.border}`, marginBottom: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MascotChip species={f.avatar} color={f.color} size={50} bg={PURPLE.light} />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 999, background: f.online ? THEME.success : THEME.fg3, border: '2.5px solid #fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: THEME.fg2, fontWeight: 600 }}><Icon name="flame" size={13} color={THEME.gold} stroke={2.3} />{f.streak}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: THEME.fg2, fontWeight: 600 }}><Icon name="gem" size={13} color={PURPLE.main} stroke={2.3} />{f.chars}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => ctx.nav('friendhouse', { id: f.id })} style={{ background: PURPLE.light, color: PURPLE.main }}><Icon name="home" size={16} color={PURPLE.main} stroke={2.4} />{L('Visit')}</Button>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: THEME.fg3, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>{L('JoanX has no chat — just friendly visits, likes, and guestbook notes.')}</div>
      </div>
    </div>
  );
}

export { Friends };
