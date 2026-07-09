// JoanX — child app · AddFriends

import React from 'react';
import { FRIEND_REQUESTS, FRIEND_SUGGESTIONS, PLAYER } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip, shade } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';

// JoanX brand magenta (same ramp as the onboarding CTAs) — 50 / 60 / 10.
const BRAND = { main: '#E00477', dark: '#B00360', light: '#FCE4F0' };

// ── Add friends (F-32) — code, requests, suggestions · five layouts ──
function AddFriends({ ctx, layout = 'list' }) {
  const [code, setCode] = React.useState('');
  const [added, setAdded] = React.useState({});
  const [requests, setRequests] = React.useState(FRIEND_REQUESTS);
  const [toast, setToast] = React.useState(null);
  const [tab, setTab] = React.useState('requests');   // segmented "tabs" variant
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const accept = (id) => { setRequests(rs => rs.filter(r => r.id !== id)); setAdded(a => ({ ...a, [id]: true })); say(L('Friend added!')); };
  const decline = (id) => setRequests(rs => rs.filter(r => r.id !== id));
  const addByCode = () => { if (!code.trim()) return; say(L('Request sent!')); setCode(''); };
  const addSug = (f) => { setAdded(a => ({ ...a, [f.id]: true })); say(L('Request sent!')); };

  // shared bits ──────────────────────────────────────────────────────
  const label = (t) => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const person = (f, right, { size = 44, top = false } = {}) => (
    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: top ? `1px solid ${THEME.border}` : 'none' }}>
      <MascotChip species={f.avatar} color={f.color} size={size} bg={BRAND.light} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{f.mutual} {L('mutual friends')}</div>
      </div>
      {right}
    </div>
  );
  const acceptBtns = (f) => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={() => accept(f.id)} style={{ background: BRAND.main, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="check" size={17} color="#fff" stroke={2.6} /></button>
      <button onClick={() => decline(f.id)} style={{ background: THEME.surface2, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={16} color={THEME.fg2} stroke={2.4} /></button>
    </div>
  );
  const addedTag = <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={14} color={THEME.success} stroke={3} />{L('Added')}</span>;
  const softAdd = (f) => added[f.id] ? addedTag : <Button variant="secondary" size="sm" onClick={() => addSug(f)} style={{ background: BRAND.light, color: BRAND.main }}><Icon name="user-plus" size={16} color={BRAND.main} stroke={2.4} />{L('Add')}</Button>;
  const filledAdd = (f) => added[f.id] ? addedTag : <Button variant="primary" size="sm" onClick={() => addSug(f)} style={{ background: BRAND.main, boxShadow: 'none' }}><Icon name="user-plus" size={16} color="#fff" stroke={2.4} />{L('Add')}</Button>;
  const textAdd = (f) => added[f.id] ? addedTag : <button onClick={() => addSug(f)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13.5, fontWeight: 800 }}>{L('Add')}</button>;
  const codeInput = (compact) => (
    <div style={{ display: 'flex', gap: 8 }}>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="JNX-••••-••" style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: compact ? 12 : 14, padding: compact ? '10px 12px' : '12px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: 1, color: THEME.fg1, background: '#fff', outline: 'none' }} />
      <Button variant="primary" size={compact ? 'sm' : 'md'} icon="user-plus" onClick={addByCode} disabled={!code.trim()} style={{ background: BRAND.main, boxShadow: 'none' }}>{L('Add')}</Button>
    </div>
  );

  // reusable soft friend-code card (gradient tint) used by several layouts
  const softCodeCard = (
    <div style={{ borderRadius: 20, padding: 16, background: 'linear-gradient(150deg,#f3eefb,#fff 80%)', border: `1px solid ${THEME.border}`, marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>{L('My friend code')}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5, color: THEME.fg1 }}>{PLAYER.friendCode}</div>
        <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
      </div>
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
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
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
        <div style={{ borderRadius: 24, padding: '22px 18px', marginBottom: 18, textAlign: 'center', background: `linear-gradient(160deg, ${BRAND.light}, #fff 85%)`, border: `1px solid ${THEME.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.main, textTransform: 'uppercase', letterSpacing: .6 }}>{L('My friend code')}</div>
          <div className="game-font" style={{ fontSize: 32, fontWeight: 500, letterSpacing: 2, color: THEME.fg1, margin: '10px 0 16px' }}>{PLAYER.friendCode}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="primary" size="sm" onClick={() => say(L('Copied!'))} style={{ background: BRAND.main, boxShadow: 'none' }}><Icon name="copy" size={15} color="#fff" stroke={2.4} />{L('Copy')}</Button>
            <Button variant="secondary" size="sm" onClick={() => say(L('Shared!'))} style={{ background: BRAND.light, color: BRAND.main }}><Icon name="share-2" size={15} color={BRAND.main} stroke={2.4} />{L('Share')}</Button>
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
      const head = (icon, t) => <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><div style={{ width: 30, height: 30, borderRadius: 9, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16} color={BRAND.main} stroke={2.3} /></div><span style={{ fontSize: 14, fontWeight: 800 }}>{t}</span></div>;
      const card = (children) => <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}`, padding: 16, marginBottom: 14 }}>{children}</div>;
      return (
        <React.Fragment>
          {card(<React.Fragment>
            {head('hash', L('My friend code'))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5 }}>{PLAYER.friendCode}</div>
              <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: BRAND.light, border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
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
          <Icon name="hash" size={16} color={BRAND.main} stroke={2.3} />
          <div className="game-font" style={{ flex: 1, fontSize: 18, fontWeight: 500, letterSpacing: 1 }}>{PLAYER.friendCode}</div>
          <button onClick={() => say(L('Copied!'))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="copy" size={14} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
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
        <div style={{ borderRadius: 22, padding: '18px', marginBottom: 16, background: `linear-gradient(135deg, ${BRAND.main}, ${BRAND.dark})` }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.8)', textTransform: 'uppercase', letterSpacing: .5 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div className="game-font" style={{ fontSize: 26, fontWeight: 500, letterSpacing: 1.5, color: '#fff' }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.9)', border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.dark, fontSize: 13, fontWeight: 800 }}><Icon name="copy" size={15} color={BRAND.dark} stroke={2.4} />{L('Copy')}</button>
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

    // 6 · Grid — suggestions shown as a 2-column card grid
    grid: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <div key={f.id} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <MascotChip species={f.avatar} color={f.color} size={52} bg={BRAND.light} />
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div>
              <div style={{ marginTop: 8 }}>{softAdd(f)}</div>
            </div>
          ))}
        </div>
      </React.Fragment>
    ),

    // 7 · Gradient — purple gradient code banner + icon section headers
    gradient: () => {
      const head = (t) => <div style={{ fontSize: 13, fontWeight: 800, color: BRAND.dark, margin: '2px 2px 10px' }}>{t}</div>;
      return (
        <React.Fragment>
          <div style={{ borderRadius: 22, padding: 18, marginBottom: 18, background: `linear-gradient(135deg, ${shade(BRAND.main, 30)}, ${BRAND.light})` }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: BRAND.dark, textTransform: 'uppercase', letterSpacing: .5 }}>{L('My friend code')}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, letterSpacing: 1.5, color: BRAND.dark }}>{PLAYER.friendCode}</div>
              <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.dark, fontSize: 13, fontWeight: 800 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.4} />{L('Copy')}</button>
            </div>
          </div>
          {head(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
          {requests.length > 0 && <React.Fragment>{head(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
          {head(L('Suggested friends'))}
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
        </React.Fragment>
      );
    },

    // 8 · Minimal — borderless, thin dividers, text buttons
    minimal: () => (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 2px 14px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .4 }}>{L('My friend code')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, letterSpacing: 1, marginTop: 3 }}>{PLAYER.friendCode}</div>
          </div>
          <button onClick={() => say(L('Copied!'))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
        </div>
        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 14, marginBottom: 14 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ marginBottom: 8 }}>{requests.map((f, i) => person(f, acceptBtns(f), { size: 40, top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div>{FRIEND_SUGGESTIONS.map((f, i) => person(f, textAdd(f), { size: 40, top: !!i }))}</div>
      </React.Fragment>
    ),

    // 9 · Rounded — everything pill-shaped and soft
    rounded: () => {
      const pillRow = (f, right) => (
        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 999, border: `1px solid ${THEME.border}`, padding: '8px 14px 8px 8px', marginBottom: 10 }}>
          <MascotChip species={f.avatar} color={f.color} size={42} bg={BRAND.light} />
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div><div style={{ fontSize: 12, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div></div>
          {right}
        </div>
      );
      return (
        <React.Fragment>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: BRAND.light, borderRadius: 999, padding: '12px 12px 12px 18px', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.dark }}>{L('My friend code')}</div><div className="game-font" style={{ fontSize: 20, fontWeight: 500, letterSpacing: 1, color: BRAND.dark }}>{PLAYER.friendCode}</div></div>
            <button onClick={() => say(L('Copied!'))} style={{ background: '#fff', border: 'none', borderRadius: 999, padding: '8px 16px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icon name="copy" size={14} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="JNX-••••-••" style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: 999, padding: '12px 18px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: 1, color: THEME.fg1, background: '#fff', outline: 'none' }} />
            <Button variant="primary" size="md" icon="user-plus" onClick={addByCode} disabled={!code.trim()} style={{ background: BRAND.main, boxShadow: 'none', borderRadius: 999 }}>{L('Add')}</Button>
          </div>
          {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}{requests.map(f => pillRow(f, acceptBtns(f)))}</React.Fragment>}
          {label(L('Suggested friends'))}
          {FRIEND_SUGGESTIONS.map(f => pillRow(f, softAdd(f)))}
        </React.Fragment>
      );
    },

    // 10 · QR — share the code as a scannable QR
    qr: () => (
      <React.Fragment>
        <div style={{ borderRadius: 22, padding: '22px 18px', marginBottom: 18, textAlign: 'center', background: '#fff', border: `1px solid ${THEME.border}` }}>
          <div style={{ width: 128, height: 128, margin: '0 auto', borderRadius: 18, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="qr-code" size={92} color={BRAND.dark} stroke={1.6} /></div>
          <div style={{ fontSize: 13, color: THEME.fg2, margin: '12px 0 6px', fontWeight: 600 }}>{L('Scan to add a friend')}</div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500, letterSpacing: 1.5 }}>{PLAYER.friendCode}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14 }}>
            <Button variant="primary" size="sm" onClick={() => say(L('Copied!'))} style={{ background: BRAND.main, boxShadow: 'none' }}><Icon name="copy" size={15} color="#fff" stroke={2.4} />{L('Copy')}</Button>
            <Button variant="secondary" size="sm" onClick={() => say(L('Shared!'))} style={{ background: BRAND.light, color: BRAND.main }}><Icon name="share-2" size={15} color={BRAND.main} stroke={2.4} />{L('Share')}</Button>
          </div>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 11 · Tabs — a segmented control toggling requests / suggested
    tabs: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        <div style={{ display: 'flex', gap: 6, background: THEME.surface2, borderRadius: 12, padding: 4, marginBottom: 14 }}>
          {[['requests', L('Requests'), requests.length], ['suggested', L('Suggested'), FRIEND_SUGGESTIONS.length]].map(([k, l, n]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 9, padding: '9px 8px', fontSize: 13, fontWeight: 800, background: tab === k ? '#fff' : 'transparent', color: tab === k ? BRAND.main : THEME.fg2 }}>{l} {n}</button>
          ))}
        </div>
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {tab === 'requests'
            ? (requests.length ? requests.map((f, i) => person(f, acceptBtns(f), { top: !!i })) : <div style={{ padding: 20, textAlign: 'center', fontSize: 13, color: THEME.fg3, fontWeight: 600 }}>{L('All caught up')}</div>)
            : FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}
        </div>
      </React.Fragment>
    ),

    // 12 · Spotlight — an invite hero, then a compact suggestions list
    spotlight: () => (
      <React.Fragment>
        <div style={{ borderRadius: 24, padding: '24px 20px', marginBottom: 18, textAlign: 'center', background: `linear-gradient(160deg, ${BRAND.light}, #fff 88%)`, border: `1px solid ${THEME.border}` }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: BRAND.main, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="user-plus" size={28} color="#fff" stroke={2.2} /></div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{L('Invite friends')}</div>
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5, margin: '10px 0 14px' }}>{PLAYER.friendCode}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="primary" size="sm" onClick={() => say(L('Copied!'))} style={{ background: BRAND.main, boxShadow: 'none' }}><Icon name="copy" size={15} color="#fff" stroke={2.4} />{L('Copy')}</Button>
            <Button variant="secondary" size="sm" onClick={() => say(L('Shared!'))} style={{ background: BRAND.light, color: BRAND.main }}><Icon name="share-2" size={15} color={BRAND.main} stroke={2.4} />{L('Share')}</Button>
          </div>
        </div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { size: 40, top: !!i }))}</div>
      </React.Fragment>
    ),

    // 13 · Outline — outlined, low-fill sections
    outline: () => (
      <React.Fragment>
        <div style={{ borderRadius: 20, padding: 16, border: `1.5px solid ${BRAND.main}`, marginBottom: 16, background: 'transparent' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.main, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5 }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1.5px solid ${BRAND.main}`, borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 13, fontWeight: 800 }}><Icon name="copy" size={15} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ borderRadius: 18, border: `1.5px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ borderRadius: 18, border: `1.5px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 14 · Split — code panel beside a share action, one merged people list
    split: () => (
      <React.Fragment>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 0, borderRadius: 18, padding: '14px 16px', background: `linear-gradient(150deg, ${shade(BRAND.main, 40)}, ${BRAND.light})` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: BRAND.dark, textTransform: 'uppercase', letterSpacing: .4 }}>{L('My friend code')}</div>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500, letterSpacing: 1, color: BRAND.dark, marginTop: 4 }}>{PLAYER.friendCode}</div>
          </div>
          <button onClick={() => say(L('Copied!'))} style={{ width: 84, flexShrink: 0, borderRadius: 18, border: 'none', background: BRAND.main, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12.5, fontWeight: 800 }}><Icon name="copy" size={20} color="#fff" stroke={2.3} />{L('Copy')}</button>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {label(L('People'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}
          {FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i || requests.length > 0 }))}
        </div>
      </React.Fragment>
    ),

    // 15 · Panel — a distinct top code panel, then flat grouped sections
    panel: () => (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 20, padding: '16px', marginBottom: 18, background: '#fff', border: `1px solid ${THEME.border}` }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="hash" size={22} color={BRAND.main} stroke={2.3} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('My friend code')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, letterSpacing: 1 }}>{PLAYER.friendCode}</div>
          </div>
          <button onClick={() => say(L('Copied!'))} style={{ background: BRAND.light, border: 'none', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="copy" size={18} color={BRAND.main} stroke={2.3} /></button>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 16 · Bubbles — suggestions as circular avatar bubbles
    bubbles: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 12px', justifyContent: 'center', padding: '8px 0' }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <div key={f.id} style={{ width: 92, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 70, height: 70, borderRadius: 999, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={58} /></div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{f.name}</div>
              {added[f.id] ? <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={13} color={THEME.success} stroke={3} />{L('Added')}</span> : <button onClick={() => addSug(f)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: BRAND.light, color: BRAND.main, border: 'none', borderRadius: 999, padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 800 }}><Icon name="plus" size={13} color={BRAND.main} stroke={2.6} />{L('Add')}</button>}
            </div>
          ))}
        </div>
      </React.Fragment>
    ),

    // 17 · Carousel — suggestions in a horizontal snap-scroll
    carousel: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: '0 -16px', padding: '2px 16px 8px', scrollSnapType: 'x mandatory' }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <div key={f.id} style={{ flex: '0 0 auto', width: 148, scrollSnapAlign: 'start', background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={54} /></div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{f.name}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div>
              <div style={{ marginTop: 8 }}>{softAdd(f)}</div>
            </div>
          ))}
        </div>
      </React.Fragment>
    ),

    // 18 · Ticket — the code as a QR-stub ticket card
    ticket: () => (
      <React.Fragment>
        <div style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: `1px solid ${THEME.border}`, marginBottom: 16, background: '#fff' }}>
          <div style={{ width: 96, flexShrink: 0, position: 'relative', background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="qr-code" size={64} color={BRAND.dark} stroke={1.7} />
            <span style={{ position: 'absolute', right: -1, top: 0, bottom: 0, borderRight: `2px dashed ${THEME.border}` }} />
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('My friend code')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, letterSpacing: 1, margin: '4px 0 10px' }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 5, background: BRAND.light, border: 'none', borderRadius: 999, padding: '7px 14px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.main, fontSize: 12.5, fontWeight: 800 }}><Icon name="copy" size={14} color={BRAND.main} stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 19 · Dark — a contrasting dark friend-code card
    dark: () => (
      <React.Fragment>
        <div style={{ borderRadius: 22, padding: 18, marginBottom: 16, background: 'linear-gradient(160deg,#2b2540,#17131f)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: .5 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <div className="game-font" style={{ fontSize: 26, fontWeight: 500, letterSpacing: 1.5, color: '#fff' }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.14)', border: 'none', borderRadius: 999, padding: '8px 14px', cursor: 'pointer', fontFamily: 'inherit', color: '#fff', fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color="#fff" stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 20 · Chips — suggestions as wrapping add-pills
    chips: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <button key={f.id} onClick={() => !added[f.id] && addSug(f)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '6px 12px 6px 6px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <MascotChip species={f.avatar} color={f.color} size={30} bg={BRAND.light} />
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{f.name}</span>
              <Icon name={added[f.id] ? 'check' : 'plus'} size={15} color={added[f.id] ? THEME.success : BRAND.main} stroke={2.6} />
            </button>
          ))}
        </div>
      </React.Fragment>
    ),

    // 21 · Numbered — a numbered suggestions directory
    numbered: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {FRIEND_SUGGESTIONS.map((f, i) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <span style={{ width: 20, textAlign: 'center', fontSize: 14, fontWeight: 800, color: THEME.fg3, flexShrink: 0 }}>{i + 1}</span>
              <MascotChip species={f.avatar} color={f.color} size={40} bg={BRAND.light} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div><div style={{ fontSize: 12, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div></div>
              {softAdd(f)}
            </div>
          ))}
        </div>
      </React.Fragment>
    ),

    // 22 · Grid-mini — a dense 3-across suggestions gallery
    gridMini: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {label(L('Suggested friends'))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <button key={f.id} onClick={() => !added[f.id] && addSug(f)} style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
              <MascotChip species={f.avatar} color={f.color} size={50} bg={BRAND.light} />
              <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: added[f.id] ? THEME.successLight : BRAND.light, color: added[f.id] ? THEME.success : BRAND.main, borderRadius: 999, padding: '3px 10px', fontSize: 11.5, fontWeight: 800 }}><Icon name={added[f.id] ? 'check' : 'plus'} size={12} color={added[f.id] ? THEME.success : BRAND.main} stroke={2.6} />{L(added[f.id] ? 'Added' : 'Add')}</span>
            </button>
          ))}
        </div>
      </React.Fragment>
    ),

    // 23 · Card stack — each suggestion its own standalone card
    cardStack: () => (
      <React.Fragment>
        {softCodeCard}
        {label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
        {requests.length > 0 && <React.Fragment>{label(L('Friend requests'))}{requests.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 10 }}>
            <MascotChip species={f.avatar} color={f.color} size={46} bg={BRAND.light} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div><div style={{ fontSize: 12, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div></div>
            {acceptBtns(f)}
          </div>
        ))}</React.Fragment>}
        {label(L('Suggested friends'))}
        {FRIEND_SUGGESTIONS.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 10 }}>
            <MascotChip species={f.avatar} color={f.color} size={46} bg={BRAND.light} />
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div><div style={{ fontSize: 12, color: THEME.fg2 }}>{f.mutual} {L('mutual friends')}</div></div>
            {softAdd(f)}
          </div>
        ))}
      </React.Fragment>
    ),

    // 24 · Centered — a centered code header + focused add-by-code
    centered: () => (
      <React.Fragment>
        <div style={{ textAlign: 'center', padding: '8px 0 18px' }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.main, textTransform: 'uppercase', letterSpacing: .6 }}>{L('My friend code')}</div>
          <div className="game-font" style={{ fontSize: 34, fontWeight: 500, letterSpacing: 2, margin: '8px 0 14px' }}>{PLAYER.friendCode}</div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <Button variant="primary" size="sm" onClick={() => say(L('Copied!'))} style={{ background: BRAND.main, boxShadow: 'none' }}><Icon name="copy" size={15} color="#fff" stroke={2.4} />{L('Copy')}</Button>
            <Button variant="secondary" size="sm" onClick={() => say(L('Shared!'))} style={{ background: BRAND.light, color: BRAND.main }}><Icon name="share-2" size={15} color={BRAND.main} stroke={2.4} />{L('Share')}</Button>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>{label(L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div></div>
        {label(L('Suggested friends'))}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
      </React.Fragment>
    ),

    // 25 · Icon heads — inline colored icon section headers
    iconHeads: () => {
      const head = (icon, t) => <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '4px 2px 10px' }}><div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16} color={BRAND.main} stroke={2.3} /></div><span style={{ fontSize: 14, fontWeight: 800 }}>{t}</span></div>;
      return (
        <React.Fragment>
          {softCodeCard}
          {head('keyboard', L('Add by code'))}<div style={{ marginBottom: 18 }}>{codeInput(false)}</div>
          {requests.length > 0 && <React.Fragment>{head('user-plus', L('Friend requests'))}<div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, marginBottom: 18, overflow: 'hidden' }}>{requests.map((f, i) => person(f, acceptBtns(f), { top: !!i }))}</div></React.Fragment>}
          {head('sparkles', L('Suggested friends'))}
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>{FRIEND_SUGGESTIONS.map((f, i) => person(f, softAdd(f), { top: !!i }))}</div>
        </React.Fragment>
      );
    },
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
