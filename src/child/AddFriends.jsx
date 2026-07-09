// JoanX — child app · AddFriends

import React from 'react';
import { FRIEND_REQUESTS, FRIEND_SUGGESTIONS, PLAYER } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { ScreenHeader } from './shared.jsx';

// Friends-area brand purple (design-system iris ramp) — 50 / 60 / 10.
const PURPLE = { main: '#7f63c5', dark: '#603fab', light: '#f5f1fd' };

// ── Add friends (F-32) — code, requests, suggestions ─────────────────
function AddFriends({ ctx }) {
  const [code, setCode] = React.useState('');
  const [added, setAdded] = React.useState({});
  const [requests, setRequests] = React.useState(FRIEND_REQUESTS);
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const accept = (id) => { setRequests(rs => rs.filter(r => r.id !== id)); setAdded(a => ({ ...a, [id]: true })); say(L('Friend added!')); };
  const decline = (id) => setRequests(rs => rs.filter(r => r.id !== id));
  const addByCode = () => { if (!code.trim()) return; say(L('Request sent!')); setCode(''); };

  const Row = ({ f, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: `1px solid ${THEME.border}` }}>
      <MascotChip species={f.avatar} color={f.color} size={44} bg={PURPLE.light} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{f.mutual} {L('mutual friends')}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Add friends')} onBack={ctx.back} />
      <div style={{ padding: '0 16px' }}>

        {/* my friend code */}
        <div style={{ borderRadius: 20, padding: 16, background: 'linear-gradient(150deg,#f3eefb,#fff 80%)', border: `1px solid ${THEME.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5, color: THEME.fg1 }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={PURPLE.main} stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>

        {/* add by code */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Add by code')}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="JNX-••••-••" style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: 14, padding: '12px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: 1, color: THEME.fg1, background: '#fff', outline: 'none' }} />
          <Button variant="primary" size="md" icon="user-plus" onClick={addByCode} disabled={!code.trim()} style={{ background: PURPLE.main, boxShadow: 'none' }}>{L('Add')}</Button>
        </div>

        {/* requests */}
        {requests.length > 0 && (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Friend requests')}</div>
            <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>
              {requests.map((f, i) => (
                <div key={f.id} style={{ borderTop: i ? '' : 'none' }}>
                  <Row f={f} right={
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => accept(f.id)} style={{ background: PURPLE.main, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="check" size={17} color="#fff" stroke={2.6} /></button>
                      <button onClick={() => decline(f.id)} style={{ background: THEME.surface2, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={16} color={THEME.fg2} stroke={2.4} /></button>
                    </div>
                  } />
                </div>
              ))}
            </div>
          </React.Fragment>
        )}

        {/* suggestions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Suggested friends')}</div>
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <Row key={f.id} f={f} right={added[f.id]
              ? <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={14} color={THEME.success} stroke={3} />{L('Added')}</span>
              : <Button variant="secondary" size="sm" onClick={() => { setAdded(a => ({ ...a, [f.id]: true })); say(L('Request sent!')); }} style={{ background: PURPLE.light, color: PURPLE.main }}><Icon name="user-plus" size={16} color={PURPLE.main} stroke={2.4} />{L('Add')}</Button>} />
          ))}
        </div>
      </div>

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

export { AddFriends };
