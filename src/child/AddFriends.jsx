// JoanX — child app · AddFriends

import React from 'react';
import { FRIEND_REQUESTS, FRIEND_SUGGESTIONS, PLAYER } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';

// Friends-area brand purple (design-system iris ramp) — 50 / 60 / 10.
const PURPLE = { main: '#7f63c5', dark: '#603fab', light: '#f5f1fd' };

// ── Add friends (F-32) — code, requests, suggestions · five layouts ──
function AddFriends({ ctx, layout = 'list' }) {
  const [code, setCode] = React.useState('');
  const [added, setAdded] = React.useState({});
  const [requests, setRequests] = React.useState(FRIEND_REQUESTS);
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const accept = (id) => { setRequests(rs => rs.filter(r => r.id !== id)); setAdded(a => ({ ...a, [id]: true })); say(L('Friend added!')); };
  const decline = (id) => setRequests(rs => rs.filter(r => r.id !== id));
  const addByCode = () => { if (!code.trim()) return; say(L('Request sent!')); setCode(''); };
  const addSug = (f) => { setAdded(a => ({ ...a, [f.id]: true })); say(L('Request sent!')); };

  // shared bits ──────────────────────────────────────────────────────
  const label = (t) => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const person = (f, right, { size = 44, top = false } = {}) => (
    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: top ? `1px solid ${THEME.border}` : 'none' }}>
      <MascotChip species={f.avatar} color={f.color} size={size} bg={PURPLE.light} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{f.mutual} {L('mutual friends')}</div>
      </div>
      {right}
    </div>
  );
  const acceptBtns = (f) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={() => accept(f.id)} style={{ background: PURPLE.main, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="check" size={17} color="#fff" stroke={2.6} /></button>
      <button onClick={() => decline(f.id)} style={{ background: THEME.surface2, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={16} color={THEME.fg2} stroke={2.4} /></button>
    </div>
  );
  const addedTag = <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={14} color={THEME.success} stroke={3} />{L('Added')}</span>;
  const softAdd = (f) => added[f.id] ? addedTag : <Button variant="secondary" size="sm" onClick={() => addSug(f)} style={{ background: PURPLE.light, color: PURPLE.main }}><Icon name="user-plus" size={16} color={PURPLE.main} stroke={2.4} />{L('Add')}</Button>;
  const filledAdd = (f) => added[f.id] ? addedTag : <Button variant="primary" size="sm" onClick={() => addSug(f)} style={{ background: PURPLE.main, boxShadow: 'none' }}><Icon name="user-plus" size={16} color="#fff" stroke={2.4} />{L('Add')}</Button>;
  const textAdd = (f) => added[f.id] ? addedTag : <button onClick={() => addSug(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.main, fontSize: 13.5, fontWeight: 800 }}>{L('Add')}</button>;
  const codeInput = (compact) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="JNX-••••-••" style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: compact ? 12 : 14, padding: compact ? '10px 12px' : '12px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: 1, color: THEME.fg1, background: '#fff', outline: 'none' }} />
      <Button variant="primary" size={compact ? 'sm' : 'md'} icon="user-plus" onClick={addByCode} disabled={!code.trim()} style={{ background: PURPLE.main, boxShadow: 'none' }}>{L('Add')}</Button>
    </div>
  );

  // ── layout bodies ───────────────────────────────────────────────────
  const bodies = {
    // 1 · List — sectioned cards (the default)
    list: () => (
      <React.Fragment>
        <div style={{ borderRadius: 20, padding: 16, background: 'linear-gradient(150deg,#f3eefb,#fff 80%)', border: `1px solid ${THEME.border}`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5, color: THEME.fg1 }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={PURPLE.main} stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>
        {label(L('Add by code'))}
        <div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>
          {label(L('Friend requests'))}
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>
            {requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}
          </div>
        </React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}
        </div>
      </React.Fragment>
    ),

    // 2 · Hero — big share-your-code hero, borderless people lists below
    hero: () => (
      <React.Fragment>
        <div style={{ borderRadius: 24, padding: '22px 18px', marginBottom: 18, textAlign: 'center', background: `linear-gradient(160deg, ${PURPLE.light}, #fff 85%)`, border: `1px solid ${THEME.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: PURPLE.main, textTransform: 'uppercase', letterSpacing: .6 }}>{L('My friend code')}</div>
          <div className="game-font" style={{ fontSize: 32, fontWeight: 500, letterSpacing: 2, color: THEME.fg1, margin: '10px 0 16px' }}>{PLAYER.friendCode}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="primary" size="sm" onClick={() => say(L('Copied!'))} style={{ background: PURPLE.main, boxShadow: 'none' }}><Icon name="copy" size={15} color="#fff" stroke={2.4} />{L('Copy')}</Button>
            <Button variant="secondary" size="sm" onClick={() => say(L('Shared!'))} style={{ background: PURPLE.light, color: PURPLE.main }}><Icon name="share-2" size={15} color={PURPLE.main} stroke={2.4} />{L('Share')}</Button>
          </div>
        </div>
        {label(L('Add by code'))}
        <div style={{ marginBottom: 20 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>
          {label(L('Friend requests'))}
          <div style={{ marginBottom: 18 }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div>
        </React.Fragment>}
        {label(L('Suggested friends'))}
        <div>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 3 · Cards — each section a titled card with an icon header
    cards: () => {
      const head = (icon, t) => <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><div style={{ width: 30, height: 30, borderRadius: 9, background: PURPLE.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16} color={PURPLE.main} stroke={2.3} /></div><span style={{ fontSize: 14, fontWeight: 800 }}>{t}</span></div>;
      const card = (children) => <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}`, padding: 16, marginBottom: 14 }}>{children}</div>;
      return (
        <React.Fragment>
          {card(<React.Fragment>
            {head('hash', L('My friend code'))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5 }}>{PLAYER.friendCode}</div>
              <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: PURPLE.light, border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={PURPLE.main} stroke={2.3} />{L('Copy')}</button>
            </div>
          </React.Fragment>)}
          {card(<React.Fragment>{head('keyboard', L('Add by code'))}{codeInput(false)}</React.Fragment>)}
          {requests.length > 0 && card(<React.Fragment>{head('user-plus', L('Friend requests'))}<div style={{ margin: '0 -16px -16px' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>)}
          {card(<React.Fragment>{head('sparkles', L('Suggested friends'))}<div style={{ margin: '0 -16px -16px' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div></React.Fragment>)}
        </React.Fragment>
      );
    },

    // 4 · Compact — thin rows, small avatars, text buttons
    compact: () => (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 12, padding: '10px 12px', marginBottom: 14 }}>
          <Icon name="hash" size={16} color={PURPLE.main} stroke={2.3} />
          <div className="game-font" style={{ flex: 1, fontSize: 18, fontWeight: 500, letterSpacing: 1 }}>{PLAYER.friendCode}</div>
          <button onClick={() => say(L('Copied!'))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.main, fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="copy" size={14} color={PURPLE.main} stroke={2.3} />{L('Copy')}</button>
        </div>
        <div style={{ marginBottom: 16 }}>{codeInput(true)}</div>
        {requests.length > 0 && <React.Fragment>
          {label(L('Friend requests'))}
          <div style={{ marginBottom: 14 }}>{requests.map((f, i) => person(f, acceptBtns(f), { size: 34, top: !!i }))}</div>
        </React.Fragment>}
        {label(L('Suggested friends'))}
        <div>{FRIEND_SUGGESTIONS.map((f, i) => person(f, textAdd(f), { size: 34, top: !!i }))}</div>
      </React.Fragment>
    ),

    // 5 · Bold — full purple code card + filled purple actions
    bold: () => (
      <React.Fragment>
        <div style={{ borderRadius: 22, padding: '18px', marginBottom: 16, background: `linear-gradient(135deg, ${PURPLE.main}, ${PURPLE.dark})` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: .5 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div className="game-font" style={{ fontSize: 26, fontWeight: 500, letterSpacing: 1.5, color: '#fff' }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: PURPLE.dark, fontSize: 13, fontWeight: 800 }}><Icon name="copy" size={15} color={PURPLE.dark} stroke={2.4} />{L('Copy')}</button>
          </div>
        </div>
        {label(L('Add by code'))}
        <div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>
          {label(L('Friend requests'))}
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>
            {requests.map((f, i) => person(f, acceptBtns(f), { size: 48, top: !!i }))}
          </div>
        </React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {FRIEND_SUGGESTIONS.map((f, i) => person(f, filledAdd(f), { size: 48, top: !!i }))}
        </div>
      </React.Fragment>
    ),
  };

  const renderBody = bodies[layout] || bodies.list;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Add friends')} onBack={ctx.back} />
      <div style={{ padding: '0 16px' }}>{renderBody()}</div>
      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

export { AddFriends };
