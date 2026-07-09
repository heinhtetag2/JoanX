// JoanX — child app · FriendHouse

import React from 'react';
import { FRIENDS, PLAYER } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, RarityPill } from './shared.jsx';

// ── Friend's Collection House (A-10) — featured buddy, rooms, likes,
//    one-line guestbook. Visit-only, no chat/real-time. ──────────────
function FriendHouse({ ctx }) {
  const f = FRIENDS.find(x => x.id === ctx.params?.id) || FRIENDS[0];
  const [liked, setLiked] = React.useState(f.liked);
  const [likes, setLikes] = React.useState(f.likes);
  const [entries, setEntries] = React.useState(f.guest);
  const [draft, setDraft] = React.useState('');

  const toggleLike = () => {
    const next = !liked; setLiked(next); setLikes(n => n + (next ? 1 : -1));
    f.liked = next; f.likes = likes + (next ? 1 : -1);
  };
  const sign = () => {
    const t = draft.trim(); if (!t) return;
    const e = { by: PLAYER.name, text: t };
    setEntries(list => [e, ...list]); f.guest.unshift(e); setDraft('');
  };
  const fc = f.featured;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgFor(f.color) }}>
      <ScreenHeader title={`${f.name}${L("’s house")}`} onBack={() => ctx.nav('friends')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{likes}</span></div>} />
      <div style={{ padding: '0 16px' }}>

        {/* featured buddy */}
        <div style={{ borderRadius: 24, padding: '18px 16px', background: `linear-gradient(165deg, ${shade(fc.color, 74)}, #fff 78%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Featured buddy')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={140} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{fc.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><RarityPill rarity={fc.rarity} /></div>
        </div>

        {/* like sticker */}
        <button onClick={toggleLike} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: liked ? THEME.joyBg : '#fff', border: `1.5px solid ${liked ? THEME.joy : THEME.border}`, borderRadius: 16, padding: '13px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>
          <Icon name="heart" size={19} color={THEME.joy} stroke={2.3} fill={liked ? THEME.joy : 'none'} />
          <span style={{ fontSize: 14, fontWeight: 800, color: liked ? THEME.joy : THEME.fg1 }}>{liked ? L('Liked!') : L('Leave a like')}</span>
        </button>

        {/* rooms */}
        <SectionHead title={L('Rooms')} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }} className="no-sb">
          {f.rooms.map((r, i) => (
            <div key={i} style={{ flexShrink: 0, width: 132, borderRadius: 18, padding: '14px 12px', background: `linear-gradient(180deg, ${r.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={54} /></div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,.05)', margin: '8px 0 8px' }} />
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{L(r.name)}</div>
            </div>
          ))}
        </div>

        {/* guestbook */}
        <SectionHead title={L('Guestbook')} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={draft} onChange={e => setDraft(e.target.value.slice(0, 60))} placeholder={L('Write one line…')} maxLength={60}
            style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: 14, padding: '11px 14px', fontFamily: 'inherit', fontSize: 13.5, color: THEME.fg1, background: '#fff', outline: 'none' }} />
          <Button variant="primary" size="md" icon="send" onClick={sign} disabled={!draft.trim()}>{L('Sign')}</Button>
        </div>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowCard, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: THEME.primaryDark }}>{e.by[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{e.by}</div>
              <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{e.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { FriendHouse };
