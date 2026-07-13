// JoanX — child app · Guestbook

import React from 'react';
import { MY_GUESTBOOK, PLAYER } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';

// ── Guestbook (F-32) — the notes friends leave when they visit ───────
// Its own screen, reached from the "me" card at the top of Friends. It used to be a
// section buried inside My Profile, which sits behind Profile → settings: three taps from
// anywhere, and nothing on the Friends screen hinted it existed. Guestbook notes are the
// social payoff of a visit, so they belong on the social tab, one tap in.
//
// A single row is exported so My Profile can render a short preview of the same notes
// without the list drifting between the two screens.
function GuestbookNote({ note, liked, onLike }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.surface, borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowCard, marginBottom: 8 }}>
      <MascotChip species={note.avatar} color={note.color} size={34} bg={THEME.primaryLight} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{note.by}</div>
        <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{note.text}</div>
      </div>
      <button onClick={onLike} aria-label={L('Like')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
        <Icon name="heart" size={18} color={THEME.joy} stroke={2.3} fill={liked ? THEME.joy : 'none'} />
      </button>
    </div>
  );
}

function Guestbook({ ctx }) {
  const [likes, setLikes] = React.useState(MY_GUESTBOOK.map(g => g.liked));
  const toggleLike = (i) => setLikes(s => s.map((v, j) => (j === i ? !v : v)));
  const empty = MY_GUESTBOOK.length === 0;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Guestbook')} onBack={() => ctx.back()}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} />
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{PLAYER.likes}</span>
        </div>} />

      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 12.5, color: THEME.fg2, margin: '0 4px 14px', lineHeight: 1.5 }}>
          {L('Notes your friends left when they visited.')}
        </div>

        {empty ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 24px', background: THEME.surface, borderRadius: 20, border: `1px solid ${THEME.border}` }}>
            <div style={{ width: 72, height: 72, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name="book-heart" size={32} color={THEME.primary} stroke={2} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L('No notes yet')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '6px 0 16px', maxWidth: 240 }}>
              {L('When a friend visits your room, the note they leave shows up here.')}
            </div>
            <button onClick={() => ctx.nav('addfriend')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: THEME.primary, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 22px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="user-plus" size={16} color="#fff" stroke={2.4} />{L('Add friends')}
            </button>
          </div>
        ) : (
          MY_GUESTBOOK.map((g, i) => (
            <GuestbookNote key={i} note={g} liked={likes[i]} onLike={() => toggleLike(i)} />
          ))
        )}
      </div>
    </div>
  );
}

export { Guestbook, GuestbookNote };
