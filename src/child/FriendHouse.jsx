// JoanX — child app · FriendHouse

import React from 'react';
import { CHARACTERS, FRIENDS, GUEST_STAMPS, PLAYER, react, REACTIONS, reactionTotal, ROOMS, themeOf } from '../core/data.jsx';
import { BottomSheet, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { moderate, REASON_TEXT } from '../core/moderation.jsx';
import { shade } from '../core/characters.jsx';
import { LevelBadge, ScreenHeader } from './shared.jsx';
import { RoomStage } from './RoomStage.jsx';
import { GuestbookPanel } from './GuestbookPatterns.jsx';

// ── Friend's Collection House (A-10 / F-32) — visit-only mirror of MyHouse's
// 'hotspot' hero: the same painted room, the same name+level header, the same book
// guestbook puck. What differs is what a VISIT adds back — reacting, and leaving a note
// from inside the book itself — since a child can't do either on their own room. No chat,
// no real-time interaction.
function FriendHouse({ ctx }) {
  const f = FRIENDS.find(x => x.id === ctx.params?.id) || FRIENDS[0];
  const fc = f.featured;

  // the room art is the SAME shared ROOMS table "my room" (MyHouse) draws from — a visit
  // should feel like the same world, not a parallel one. Not yet a room of the friend's
  // own to decorate independently; see the note on `roomId` in FRIENDS (core/data.jsx).
  // `f.roomId` is only where the visit lands — same as MyHouse's own room switcher, all
  // three are open to page through from here, not just the one the friend is "in".
  const [viewRoomId, setViewRoomId] = React.useState(f.roomId);
  const [roomPicker, setRoomPicker] = React.useState(false);
  const room = ROOMS.find(r => r.id === viewRoomId) || ROOMS[0];
  const theme = themeOf(room);
  const draft = { wallpaper: room.wallpaper, flooring: room.flooring, placed: room.placed };
  const roomPage = !!theme.bg;
  const tapRoom = (r) => { setViewRoomId(r.id); setRoomPicker(false); };

  // A-10 — which reaction I left (or none), and the running tally per reaction. Both come
  // straight off the friend row, which react() keeps in step, so leaving one here shows up
  // on the friends list too rather than only inside this screen.
  const [mine, setMine] = React.useState(f.myReaction);
  const [counts, setCounts] = React.useState(() => ({ ...f.reactions }));
  const likes = reactionTotal({ reactions: counts });
  const leaveReaction = (key) => { setMine(react(f, key)); setCounts({ ...f.reactions }); };

  // Copy, don't alias: f.guest is mutated below to persist the note across visits, and a
  // shared reference would make the state prepend and that mutation both show up — the
  // note twice. `likes` runs parallel to `entries` by index (same shape GuestbookPanel
  // reads on MyHouse) rather than living on the note itself.
  const [entries, setEntries] = React.useState(() => [...f.guest]);
  const [noteLikes, setNoteLikes] = React.useState(() => f.guest.map(() => false));
  const toggleNoteLike = (i) => setNoteLikes(s => s.map((v, j) => (j === i ? !v : v)));
  const [picked, setPicked] = React.useState(null);   // the stamp mid-tap, held briefly so the press reads as "sent"
  const [signed, setSigned] = React.useState(false);
  const [draftNote, setDraftNote] = React.useState('');  // the typed note, before it's sent
  const [blocked, setBlocked] = React.useState(null); // moderation reason key to show, or null

  // Both paths — a tapped stamp and a typed message — end here. Whichever buddy is
  // currently active on MY OWN profile is what a note posted from here wears — the same
  // avatar+color every other guestbook row on this room carries.
  const myChar = CHARACTERS.find(c => c.id === PLAYER.activeCharId) || CHARACTERS[0];
  const post = (e) => {
    const note = { ...e, avatar: myChar.species, color: myChar.color };
    setEntries(list => [note, ...list]); f.guest.unshift(note);
    setNoteLikes(l => [false, ...l]);
    setSigned(true);
  };
  const timer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const pickStamp = (s) => {
    if (signed || picked) return;
    setPicked(s);
    timer.current = setTimeout(() => post({ by: PLAYER.name, emoji: s.emoji, text: s.text }), 320);
  };
  // A typed note is screened before it can be posted (see moderation.jsx): profanity, abuse,
  // sexual language, phone numbers, e-mails, social handles and links are turned away with a
  // reason, never posted. The server re-screens on write — this is the fast first gate.
  const sendNote = () => {
    if (signed || picked) return;
    const verdict = moderate(draftNote);
    if (!verdict.ok) { setBlocked(verdict.reason || 'language'); return; }
    post({ by: PLAYER.name, emoji: '', text: draftNote.trim() });
    setDraftNote('');
  };
  const onDraft = (v) => { setDraftNote(v); if (blocked) setBlocked(null); };   // clear the warning as they edit

  // Handed to the book's own open sheet (GuestbookPatterns.jsx) — leaving a note happens
  // inside the guestbook you just opened, not in a separate section on the page.
  const compose = { stamps: GUEST_STAMPS, picked, onPick: pickStamp, draft: draftNote, onDraft, onSend: sendNote, signed,
    blockedText: blocked ? L(REASON_TEXT[blocked]) : null };

  return (
    // Same hotspot hero as MyHouse, so it carries the same fix: the room already fills the
    // screen with room to spare, and only the standard 110 bottom buffer (shared with every
    // other screen) pushed it past the fold — a scroll that revealed nothing but empty floor
    // and let the room switcher pill scroll out from under the header. Locked to `hidden`.
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'hidden', paddingTop: 102, paddingBottom: 110,
      ...(roomPage
        ? { backgroundImage: `url(${theme.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: theme.accent }
        : { background: `linear-gradient(180deg, ${shade(fc.color, 88)}, #fff 60%)` }) }}>
      {/* same bare-white-on-art treatment as MyHouse's own header — the room's art runs to
          the top edge uninterrupted, only the back chevron keeps a background chip. The
          title carries "'s house" (not just the bare name) so it reads as whose room this
          is in either language, the same wording F-32 already uses. */}
      <ScreenHeader light title={`${f.name}${L('’s house')}`} onBack={() => ctx.nav('friends')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}><Icon name="heart" size={15} color="#fff" fill="#fff" stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{likes}</span></div>} />

      <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 14 }}>
          {/* the same room-switcher pill MyHouse wears — the world has three rooms whether
              you're standing in your own or visiting, so a visit can page through all of
              them exactly the way "my room" does. */}
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
            <button onClick={() => setRoomPicker(true)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, background: 'rgba(0,0,0,.34)', color: '#fff' }}>
              <Icon name={theme.icon} size={14} color="#fff" stroke={2.3} />{L(room.name)}
              <Icon name="chevron-down" size={14} color="#fff" stroke={2.4} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            {/* the one buddy a visiting friend came to see (F-32) — read-only: nothing here
                is yours to edit, so the room's pucks don't render at all (interactive=false).
                placedDecor stays empty, same call MyHouse's own hotspot room makes — over
                painted art those little icon chips read as debug UI stuck to the screen,
                not furniture. */}
            <RoomStage theme={theme} draft={draft} buddies={[{ id: f.id, species: fc.species, stage: fc.stage, color: fc.color }]}
              backdrop={!theme.bg} placedDecor={[]} height={460} radius={theme.bg ? 0 : 22} buddySize={168} floorLine="9%" interactive={false} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10 }}>
            <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,.55)' }}>{f.name}</span>
            <LevelBadge level={f.level} />
          </div>

          {/* A-10 — the return leg a visit adds back: your own room only ever shows what
              reactions landed (MyHouse's read-only top-3), because reacting to yourself
              isn't a thing — here it's the whole point, so every reaction is live and
              tappable rather than trimmed to a top-3 summary. */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {REACTIONS.map(r => {
              const on = mine === r.key;
              const n = counts[r.key] || 0;
              return (
                <button key={r.key} onClick={() => leaveReaction(r.key)} aria-label={L(r.label)} className="jx-press"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '5px 10px',
                    background: on ? '#fff' : 'rgba(255,255,255,.85)', boxShadow: on ? `0 0 0 1.5px ${r.color}` : 'none' }}>
                  <Icon name={r.icon} size={13} color={on ? r.color : THEME.fg2} stroke={2.3} />
                  <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: on ? r.color : THEME.fg1 }}>{n}</span>
                </button>
              );
            })}
          </div>

          {/* the notes friends left, same book puck MyHouse shows on its own room — this
              one also carries `compose`, so opening it is also where you leave yours */}
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: 18 }}>
            <GuestbookPanel notes={entries} likes={noteLikes} onLike={toggleNoteLike} roomTheme={room.theme} compose={compose} />
          </div>
        </div>
      </div>

      {/* same picker MyHouse's own room switcher opens — three cards, no scrolling, since
          every room is free and there's nothing to rank, gate, or count toward */}
      {roomPicker && (
        <BottomSheet title={L('Rooms')} onClose={() => setRoomPicker(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {ROOMS.map(r => {
              const t = themeOf(r), on = r.id === room.id;
              return (
                <button key={r.id} onClick={() => tapRoom(r)} style={{ textAlign: 'left', border: on ? `2px solid ${THEME.brand}` : `2px solid ${THEME.border}`, borderRadius: 18, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 96, background: t.wall(r.wallpaper), backgroundImage: t.bg ? `url(${t.bg})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center 30%', position: 'relative' }}>
                    {on && (
                      <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 999, background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="check" size={14} color="#fff" stroke={3} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '9px 10px 11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>
                      <Icon name={t.icon} size={13} color={THEME.fg2} stroke={2.3} />{L(r.name)}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: on ? THEME.brand : THEME.fg3, marginTop: 3, lineHeight: 1.35 }}>
                      {on ? L('Showing') : L('Tap to show')}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

export { FriendHouse };
