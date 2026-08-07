// JoanX — child app · GuestbookPatterns
//
// Fifty treatments of the same idea — react to / read notes from a room visit without
// leaving the room (MyHouse's F-32 return leg) — switchable from Tweaks so they can sit
// side by side before one is picked. Same shape as roomSwitch/buddySwitch/roomDecor
// before their pickers were retired in App.jsx: this file is what gets deleted down to
// one branch once a style wins.
//
// The first ten (sheet…cluster) lean on the app's existing chip/card/sheet vocabulary.
// The next forty (pinboard…yarnball) deliberately don't: flat kraft/parchment fills,
// hairline wood-toned borders instead of shadowCard, and tilt/clip-path instead of
// another rounded pill — physical objects a room would actually hold, not more
// component-library chrome. Batch three (acorn…bookspine) leans into the room's own
// woodland/garden setting (Hammy's an acorn-cracking hamster, the room's full of potted
// plants). Batch four (rocket…dice) borrows from the Dream/Town rooms and general kid-toy
// shelf. Batch five (mushroom…yarnball) is the room's mushroom props, a telescope-peek
// reveal, and a beach/weather/craft sweep (THEME.beach reused for the seashell, not a new
// hex) — again none repeating a shape already used.

import React from 'react';
import { createPortal } from 'react-dom';
import { Icon, THEME, BottomSheet } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';

const GUESTBOOK_STYLES = [
  ['sheet', 'Sheet'],
  ['strip', 'Live strip'],
  ['accordion', 'Accordion'],
  ['bubbles', 'Room bubbles'],
  ['carousel', 'Carousel'],
  ['stack', 'Postcard stack'],
  ['marquee', 'Ticker'],
  ['popover', 'Popover'],
  ['grid', 'Grid'],
  ['cluster', 'Avatar cluster'],
  ['pinboard', 'Pinboard'],
  ['polaroid', 'Polaroids'],
  ['clothesline', 'Clothesline'],
  ['chalkboard', 'Chalkboard'],
  ['scroll', 'Scroll'],
  ['jar', 'Firefly jar'],
  ['sticker', 'Sticker flip'],
  ['stamp', 'Stamp'],
  ['envelope', 'Envelope'],
  ['tag', 'Gift tag'],
  ['acorn', 'Acorn crack'],
  ['planemail', 'Paper plane'],
  ['vine', 'Vine bloom'],
  ['musicbox', 'Music box'],
  ['gumball', 'Gumball'],
  ['plantmarker', 'Plant marker'],
  ['frame', 'Photo frame'],
  ['bracelet', 'Charm bracelet'],
  ['inkstamp', 'Ink stamp'],
  ['bookspine', 'Book spine'],
  ['rocket', 'Rocket launch'],
  ['balloon', 'Balloon pop'],
  ['crystal', 'Crystal split'],
  ['starlight', 'Starlight'],
  ['chest', 'Treasure chest'],
  ['book', 'Storybook'],
  ['birdnest', 'Bird nest'],
  ['fortunecookie', 'Fortune cookie'],
  ['cameraprint', 'Camera print'],
  ['honeycomb', 'Honeycomb'],
  ['dice', 'Lucky dice'],
  ['mushroom', 'Mushroom cap'],
  ['telescope', 'Telescope'],
  ['trophy', 'Trophy shine'],
  ['raincloud', 'Rain cloud'],
  ['pinwheel', 'Pinwheel'],
  ['seashell', 'Seashell'],
  ['kite', 'Kite reel'],
  ['giftbox', 'Gift box'],
  ['ladybug', 'Ladybug'],
  ['yarnball', 'Yarn ball'],
];

// wood-toned palette pulled from the room art itself (Collection.jsx's bookshelf wood,
// the room theme's wood-floor gradient) rather than an invented hex — so paper and wood
// here read as the same material as the room these notes are about.
const KRAFT = '#e7d3ad';
const KRAFT_DARK = '#c9a873';
const PARCHMENT = '#fbf6ec';
const WOOD = '#a9744f';
const WOOD_DARK = '#7a5236';
const BOOK_COVER = '#4b3bc4';    // sampled from book-dream-closed/open.png's indigo cover — the 'book' style's own frame color, not the shared wood palette
// One cover skin per room theme (public/assets/book/book-<theme>-<closed|open>.png), so the
// book on the floor matches the room it's sitting in instead of always wearing the Dream
// Room's indigo regardless of where you are. `cover` is sampled per skin for the popup
// card's border, same reasoning as BOOK_COVER above. Any theme not listed here (a future
// room added without its own art) falls back to the Dream indigo rather than a fourth guess.
const BOOK_ART = {
  dream: { closed: '/assets/book/book-dream-closed.png', open: '/assets/book/book-dream-open.png', cover: BOOK_COVER },
  green: { closed: '/assets/book/book-green-closed.png', open: '/assets/book/book-green-open.png', cover: THEME.brand },
  town:  { closed: '/assets/book/book-town-closed.png',  open: '/assets/book/book-town-open.png',  cover: THEME.primary },
};
const bookArtFor = (theme) => BOOK_ART[theme] || BOOK_ART.dream;
const BOARD = THEME.brandDark;
const CHALK = '#f5f1e6';
// brass (chest trim) and honey (honeycomb) are their own hexes, deliberately not
// THEME.gold — that token stays reserved for points/XP, never decorative amber.
const BRASS = '#8a6d3b';
const HONEY = '#e0a83e';
const TILTS = [-6, 4, -3, 7, -5, 2];

const noteText = (n) => `${n.emoji ? n.emoji + ' ' : ''}${L(n.text)}`;

// ── the flip mechanic shared by sticker / stamp / envelope / tag — a plain div (not a
// button, so the like button on the back face doesn't end up nested inside one) that
// rotates a two-sided card on tap. Front/back content is supplied per style below.
function FlipCard({ label, front, back, flipped, onToggle, width = 84, height = 64 }) {
  return (
    <div onClick={onToggle} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
      role="button" tabIndex={0} aria-label={label} className="jx-press"
      style={{ cursor: 'pointer', outline: 'none', width, height, perspective: 600 }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform .45s cubic-bezier(.2,.8,.2,1)', transform: flipped ? 'rotateY(180deg)' : 'none' }}>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden' }}>{front}</div>
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>{back}</div>
      </div>
    </div>
  );
}

const stickerFront = (n) => (
  <div style={{ width: '100%', height: '100%', borderRadius: 999, background: `${n.color}22`, border: `1.5px solid ${n.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxSizing: 'border-box' }}>{n.emoji || '💬'}</div>
);

const stampFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: PARCHMENT, border: `3px dashed ${WOOD}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxSizing: 'border-box' }}>
    <span style={{ fontSize: 22 }}>{n.emoji || '✉️'}</span>
    <div style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: 999, border: `1.5px solid ${THEME.fg3}` }} />
  </div>
);

const envelopeFront = (n) => (
  <div style={{ width: '100%', height: '100%', position: 'relative', background: KRAFT, border: `1.5px solid ${WOOD}`, borderRadius: 6, overflow: 'hidden', boxSizing: 'border-box' }}>
    <div style={{ position: 'absolute', inset: 0, background: KRAFT_DARK, clipPath: 'polygon(0 0, 100% 0, 50% 58%)' }} />
    <div style={{ position: 'absolute', top: '46%', left: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: 999, background: THEME.heart, border: '1.5px solid rgba(0,0,0,.15)' }} />
  </div>
);

const tagFront = (n) => (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <div style={{ position: 'absolute', inset: '10px 0 0 0', background: KRAFT, border: `1.5px solid ${WOOD}`, clipPath: 'polygon(18% 0, 100% 0, 100% 100%, 18% 100%, 0 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 20, marginLeft: 10 }}>{n.emoji || '🏷️'}</span>
    </div>
    <div style={{ position: 'absolute', top: 2, left: '30%', width: 6, height: 6, borderRadius: 999, background: '#fff', border: `1px solid ${WOOD}` }} />
  </div>
);

const frameFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: WOOD, borderRadius: 6, padding: 6, boxSizing: 'border-box', display: 'flex' }}>
    <div style={{ flex: 1, background: `${n.color}33`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <MascotChip species={n.avatar} color={n.color} size={30} bg="transparent" />
    </div>
  </div>
);

const braceletFront = (n) => (
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 14, height: 8, border: `2px solid ${WOOD}`, borderBottom: 'none', borderRadius: '8px 8px 0 0' }} />
    <div style={{ width: '100%', height: '100%', borderRadius: 999, background: `${n.color}30`, border: `2px solid ${n.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxSizing: 'border-box' }}>{n.emoji || '💫'}</div>
  </div>
);

const inkstampFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: `${n.color}22`, border: `2px solid ${n.color}`, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', transform: 'rotate(-3deg)' }}>
    <span style={{ fontSize: 22 }}>{n.emoji || '💌'}</span>
  </div>
);

const bookspineFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: WOOD, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, boxSizing: 'border-box', border: `1.5px solid ${WOOD_DARK}` }}>
    <div style={{ width: '60%', height: 2, background: KRAFT }} />
    <span style={{ fontSize: 18 }}>{n.emoji || '📖'}</span>
    <div style={{ width: '60%', height: 2, background: KRAFT }} />
  </div>
);

const honeycombFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: HONEY, clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontSize: 18 }}>{n.emoji || '🍯'}</span>
  </div>
);

const diceFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: '#fffdf7', border: `1.5px solid ${WOOD}`, borderRadius: 8, position: 'relative', boxSizing: 'border-box' }}>
    {[[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]].map(([l, t], k) => (
      <span key={k} style={{ position: 'absolute', left: `${l}%`, top: `${t}%`, transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: 999, background: n.color }} />
    ))}
  </div>
);

const trophyFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: `${n.color}22`, border: `1.5px solid ${n.color}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
    <Icon name="trophy" size={24} color={n.color} stroke={2} />
  </div>
);

// beach/joy is the app's existing warm-tan THEME token (THEME.beach) — reused here rather
// than another invented hex, so the shell reads as the same "sand" tone as the rest of
// the app's beach category art.
const seashellFront = (n) => (
  <div style={{ width: '100%', height: '100%', background: `${THEME.beach}22`, border: `1.5px solid ${THEME.beach}`, borderRadius: '50% 50% 50% 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
    <span style={{ fontSize: 20 }}>🐚</span>
  </div>
);

const yarnballFront = (n) => (
  <div style={{ width: '100%', height: '100%', borderRadius: 999, background: `${n.color}30`, border: `2px solid ${n.color}`, position: 'relative', overflow: 'hidden', boxSizing: 'border-box' }}>
    {[20, 45, 70].map(p => (
      <div key={p} style={{ position: 'absolute', top: 0, left: `${p}%`, width: 1.5, height: '100%', background: n.color, opacity: .5, transform: 'rotate(18deg)' }} />
    ))}
  </div>
);

const flipBack = (n, i, likes, onLike) => (
  <div style={{ width: '100%', height: '100%', background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 6, boxSizing: 'border-box' }}>
    <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
    <div style={{ fontSize: 10.5, color: THEME.fg1, textAlign: 'center', lineHeight: 1.25 }}>{noteText(n)}</div>
    <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
      <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
    </button>
  </div>
);

function EmptyNote() {
  return (
    <div style={{ textAlign: 'center', padding: '10px 12px 4px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>
      {L('When a friend visits your room, the note they leave shows up here.')}
    </div>
  );
}

function NoteRow({ note, liked, onLike, compact, showLike = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 16, padding: compact ? '9px 11px' : '12px 14px', boxShadow: compact ? 'none' : THEME.shadowCard, marginBottom: 8 }}>
      <MascotChip species={note.avatar} color={note.color} size={compact ? 28 : 34} bg={THEME.primaryLight} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{note.by}</div>
        <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{noteText(note)}</div>
      </div>
      {showLike && (
        <button onClick={onLike} aria-label={L('Like')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
          <Icon name="heart" size={17} color={THEME.joy} stroke={2.3} fill={liked ? THEME.joy : 'none'} />
        </button>
      )}
    </div>
  );
}

function TriggerChip({ onClick, count, active, label }) {
  return (
    <button onClick={onClick} className="jx-press" aria-label={L('Guestbook')}
      style={{ display: 'flex', alignItems: 'center', gap: 5, background: active ? THEME.brandLight : 'rgba(255,255,255,.85)', border: active ? `1.5px solid ${THEME.brand}` : '1.5px solid transparent', borderRadius: 999, padding: '5px 11px', fontFamily: 'inherit', cursor: 'pointer' }}>
      <Icon name="book-heart" size={13} color={active ? THEME.brandDark : THEME.fg2} stroke={2.3} />
      <span style={{ fontSize: 12.5, fontWeight: 700, color: active ? THEME.brandDark : THEME.fg1 }}>{label || L('Guestbook')}</span>
      <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: active ? THEME.brandDark : THEME.fg2 }}>{count}</span>
    </button>
  );
}

// ── 'bubbles' lives ON the room art, not in the stats row — MyHouse mounts this inside
// the same relative wrapper the RoomStage pucks use, so it gets its own export instead of
// living inside GuestbookPanel below (which only ever renders in the stats row).
function GuestbookRoomBubbles({ notes, likes, onLike }) {
  const [active, setActive] = React.useState(null);
  if (!notes.length) return null;
  const spots = [[50, 5], [83, 24], [8, 52]];
  return (
    <React.Fragment>
      {notes.slice(0, 3).map((n, i) => {
        const [left, top] = spots[i];
        const open = active === i;
        return (
          <div key={i} style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, transform: 'translate(-50%,-50%)', zIndex: open ? 6 : 5 }}>
            {open ? (
              <div className="jx-pop" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 14, padding: '8px 10px', boxShadow: THEME.shadowCard, width: 178 }}>
                <MascotChip species={n.avatar} color={n.color} size={26} bg={THEME.primaryLight} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 12, color: THEME.fg1, lineHeight: 1.3 }}>{noteText(n)}</div>
                </div>
                <button onClick={() => onLike(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <Icon name="heart" size={15} color={THEME.joy} stroke={2.3} fill={likes[i] ? THEME.joy : 'none'} />
                </button>
                <button onClick={() => setActive(null)} aria-label={L('Close')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
                  <Icon name="x" size={13} color={THEME.fg3} stroke={2.4} />
                </button>
              </div>
            ) : (
              <button onClick={() => setActive(i)} className="jx-press" aria-label={n.by}
                style={{ width: 40, height: 40, borderRadius: 999, border: '2px solid #fff', background: 'rgba(255,255,255,.92)', boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, padding: 0 }}>
                {n.emoji || '💬'}
              </button>
            )}
          </div>
        );
      })}
    </React.Fragment>
  );
}

// ── everything else lives in the stats row, one component picking its own layout ────
function GuestbookPanel({ style, notes, likes, onLike, roomTheme }) {
  const [open, setOpen] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);   // carousel / stack / cluster / pinboard / polaroid / clothesline / chalkboard / scroll: which note
  const [expanded, setExpanded] = React.useState(null); // marquee: which note is pinned open
  const [flipped, setFlipped] = React.useState(() => notes.map(() => false)); // sticker / stamp / envelope / tag
  const toggleFlip = (i) => setFlipped(f => f.map((v, j) => (j === i ? !v : v)));
  const [jarPopped, setJarPopped] = React.useState(() => notes.map(() => false)); // firefly jar: released, one-way
  const toggleJarPop = (i) => setJarPopped(f => f.map((v, j) => (j === i ? true : v)));
  // book: closing plays the exit animation before the sheet actually unmounts — React
  // removing a node doesn't animate on its own, so this keeps it mounted (open || closing)
  // for exactly as long as jx-book-out/jx-book-dim-out take, then setOpen(false) for real.
  const [closing, setClosing] = React.useState(false);
  const closeBook = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 260); };
  const count = notes.length;

  if (style === 'bubbles') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.85)', borderRadius: 999, padding: '5px 11px' }}>
        <Icon name="book-heart" size={13} color={THEME.fg2} stroke={2.3} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{L('Tap the bubbles in your room')}</span>
      </div>
    );
  }

  if (style === 'sheet') {
    return (
      <React.Fragment>
        <TriggerChip onClick={() => setOpen(true)} count={count} />
        {open && (
          <BottomSheet title={L('Guestbook')} onClose={() => setOpen(false)}>
            {count === 0 ? <EmptyNote /> : notes.map((n, i) => <NoteRow key={i} note={n} liked={likes[i]} onLike={() => onLike(i)} />)}
          </BottomSheet>
        )}
      </React.Fragment>
    );
  }

  if (style === 'strip') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', width: '100%', padding: '2px 2px 4px' }} className="no-sb">
        {notes.map((n, i) => (
          <button key={i} onClick={() => onLike(i)} className="jx-press"
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: 999, padding: '5px 12px 5px 5px', fontFamily: 'inherit', cursor: 'pointer', maxWidth: 210 }}>
            <MascotChip species={n.avatar} color={n.color} size={22} bg={THEME.primaryLight} />
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{noteText(n)}</span>
            <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} style={{ flexShrink: 0 }} />
          </button>
        ))}
      </div>
    );
  }

  if (style === 'accordion') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TriggerChip onClick={() => setOpen(o => !o)} count={count} active={open} />
        {open && (
          <div className="jx-fade" style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,.92)', borderRadius: 16, padding: 10 }}>
            {count === 0 ? <EmptyNote /> : notes.map((n, i) => <NoteRow key={i} note={n} liked={likes[i]} onLike={() => onLike(i)} compact />)}
          </div>
        )}
      </div>
    );
  }

  if (style === 'carousel') {
    const i0 = count ? cursor % count : 0;
    const n = notes[i0];
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TriggerChip onClick={() => setOpen(o => !o)} count={count} active={open} />
        {open && (count === 0 ? <div style={{ marginTop: 8, width: '100%' }}><EmptyNote /></div> : (
          <div className="jx-fade" style={{ width: '100%', marginTop: 8, background: 'rgba(255,255,255,.92)', borderRadius: 16, padding: '12px 34px', position: 'relative', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MascotChip species={n.avatar} color={n.color} size={30} bg={THEME.primaryLight} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                <div style={{ fontSize: 13, color: THEME.fg1 }}>{noteText(n)}</div>
              </div>
              <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
                <Icon name="heart" size={17} color={THEME.joy} stroke={2.3} fill={likes[i0] ? THEME.joy : 'none'} />
              </button>
            </div>
            {count > 1 && (
              <React.Fragment>
                <button onClick={() => setCursor(c => (c - 1 + count) % count)} style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}><Icon name="chevron-left" size={18} color={THEME.fg2} stroke={2.4} /></button>
                <button onClick={() => setCursor(c => (c + 1) % count)} style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}><Icon name="chevron-right" size={18} color={THEME.fg2} stroke={2.4} /></button>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
                  {notes.map((_, i) => <span key={i} style={{ width: i === i0 ? 14 : 5, height: 5, borderRadius: 999, background: i === i0 ? THEME.brand : THEME.border, transition: 'width .18s ease' }} />)}
                </div>
              </React.Fragment>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (style === 'stack') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button onClick={() => setCursor(c => c + 1)} className="jx-press" aria-label={L('Guestbook')} style={{ position: 'relative', width: 216, height: 50, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          {[2, 1, 0].map(depth => {
            const idx = (cursor + depth) % count;
            const n = notes[idx];
            const isTop = depth === 0;
            return (
              <div key={depth} style={{ position: 'absolute', inset: 0, transform: `translate(${depth * 5}px, ${-depth * 4}px) rotate(${depth * -2}deg)`, background: '#fff', borderRadius: 14, boxShadow: THEME.shadowCard, display: isTop ? 'flex' : 'block', alignItems: 'center', gap: 8, padding: isTop ? '0 12px' : 0, opacity: isTop ? 1 : .85 - depth * .1, boxSizing: 'border-box' }}>
                {isTop && (
                  <React.Fragment>
                    <MascotChip species={n.avatar} color={n.color} size={26} bg={THEME.primaryLight} />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1, textAlign: 'left', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{noteText(n)}</span>
                  </React.Fragment>
                )}
              </div>
            );
          })}
        </button>
        <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Tap for the next note')} · {(cursor % count) + 1}/{count}</span>
      </div>
    );
  }

  if (style === 'marquee') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ width: '100%' }}>
        <div style={{ width: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 22, width: 'max-content', animation: expanded == null ? 'jxMarquee 14s linear infinite' : 'none' }}>
            {[...notes, ...notes].map((n, i) => (
              <button key={i} onClick={() => setExpanded(i % count)} className="jx-press"
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.85)', border: 'none', borderRadius: 999, padding: '6px 13px', fontFamily: 'inherit', cursor: 'pointer', flexShrink: 0 }}>
                <span style={{ fontSize: 13 }}>{n.emoji}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1, whiteSpace: 'nowrap' }}>{n.by}: {L(n.text)}</span>
              </button>
            ))}
          </div>
        </div>
        {expanded != null && (
          <div className="jx-fade" style={{ marginTop: 8 }}>
            <NoteRow note={notes[expanded]} liked={likes[expanded]} onLike={() => onLike(expanded)} compact />
            <button onClick={() => setExpanded(null)} style={{ display: 'block', margin: '0 auto', background: 'none', border: 'none', fontSize: 11.5, fontWeight: 700, color: THEME.fg3, cursor: 'pointer' }}>{L('Resume')}</button>
          </div>
        )}
      </div>
    );
  }

  if (style === 'popover') {
    return (
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
        <TriggerChip onClick={() => setOpen(o => !o)} count={count} active={open} />
        {open && (
          <React.Fragment>
            <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10, background: 'transparent' }} />
            <div className="jx-pop" style={{ position: 'absolute', bottom: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)', width: 240, background: '#fff', borderRadius: 16, boxShadow: THEME.shadowCard, padding: 10, zIndex: 11, boxSizing: 'border-box' }}>
              {count === 0 ? <EmptyNote /> : notes.map((n, i) => <NoteRow key={i} note={n} liked={likes[i]} onLike={() => onLike(i)} compact />)}
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 12, height: 12, background: '#fff' }} />
            </div>
          </React.Fragment>
        )}
      </div>
    );
  }

  if (style === 'grid') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TriggerChip onClick={() => setOpen(o => !o)} count={count} active={open} />
        {open && (
          <div className="jx-fade" style={{ width: '100%', marginTop: 8, display: 'grid', gridTemplateColumns: count === 0 ? '1fr' : 'repeat(2,1fr)', gap: 8 }}>
            {count === 0 ? <EmptyNote /> : notes.map((n, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 10, boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, textAlign: 'center' }}>
                <MascotChip species={n.avatar} color={n.color} size={28} bg={THEME.primaryLight} />
                <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                <div style={{ fontSize: 12, color: THEME.fg1, lineHeight: 1.3 }}>{noteText(n)}</div>
                <button onClick={() => onLike(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <Icon name="heart" size={15} color={THEME.joy} stroke={2.3} fill={likes[i] ? THEME.joy : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (style === 'cluster') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const ic = cursor % count;
    const n = notes[ic];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <button onClick={() => setCursor(c => c + 1)} className="jx-press" aria-label={L('Guestbook')} style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
          <div style={{ display: 'flex' }}>
            {notes.slice(0, 4).map((m, i) => (
              <div key={i} style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid #fff', borderRadius: 999, zIndex: 4 - i }}>
                <MascotChip species={m.avatar} color={m.color} size={30} bg={THEME.primaryLight} />
              </div>
            ))}
          </div>
          <span className="game-font" style={{ marginLeft: 8, fontSize: 12.5, fontWeight: 500, color: THEME.fg1, background: 'rgba(255,255,255,.85)', borderRadius: 999, padding: '4px 9px' }}>{count}</span>
        </button>
        <div className="jx-fade" key={ic} style={{ background: 'rgba(255,255,255,.9)', borderRadius: 12, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, maxWidth: 240 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
          <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
          <button onClick={() => onLike(ic)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, flexShrink: 0 }}>
            <Icon name="heart" size={14} color={THEME.joy} stroke={2.3} fill={likes[ic] ? THEME.joy : 'none'} />
          </button>
        </div>
      </div>
    );
  }

  // ── batch 2 — physical/tactile treatments (pinned notes, envelopes, a chalkboard…)
  // instead of more rounded pill chips and white shadow-cards, so this set doesn't read
  // like the same component-library sheet six different ways.
  if (style === 'pinboard') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const front = cursor % count;
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, background: KRAFT, border: `1.5px solid ${WOOD}`, borderRadius: 14, padding: '18px 12px 12px', boxSizing: 'border-box' }}>
        {notes.map((n, i) => {
          const isFront = i === front;
          const tilt = TILTS[i % TILTS.length];
          return (
            <div key={i} onClick={() => setCursor(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press"
              style={{ position: 'relative', width: 116, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 4, padding: '14px 8px 8px', cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box', transform: `rotate(${isFront ? 0 : tilt}deg) scale(${isFront ? 1.06 : 1})`, transition: 'transform .2s ease', zIndex: isFront ? 2 : 1 }}>
              <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, borderRadius: 999, background: WOOD_DARK }} />
              <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.3 }}>{noteText(n)}</div>
              <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'polaroid') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const front = cursor % count;
    return (
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        {notes.map((n, i) => {
          const isFront = i === front;
          const tilt = TILTS[i % TILTS.length];
          return (
            <div key={i} onClick={() => setCursor(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press"
              style={{ width: 92, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 3, padding: '6px 6px 10px', cursor: 'pointer', boxSizing: 'border-box', transform: `rotate(${isFront ? 0 : tilt}deg) scale(${isFront ? 1.06 : 1})`, transition: 'transform .2s ease', zIndex: isFront ? 2 : 1, position: 'relative' }}>
              <div style={{ height: 60, borderRadius: 2, background: `${n.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MascotChip species={n.avatar} color={n.color} size={38} bg="transparent" />
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: THEME.fg2, marginTop: 5, textAlign: 'center' }}>{n.by}</div>
              {isFront && <div style={{ fontSize: 10, color: THEME.fg1, textAlign: 'center', marginTop: 2, lineHeight: 1.25 }}>{noteText(n)}</div>}
              {isFront && (
                <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ display: 'block', margin: '4px auto 0', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'clothesline') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const front = cursor % count;
    return (
      <div style={{ width: '100%', position: 'relative', paddingTop: 8 }}>
        <div style={{ position: 'absolute', top: 8, left: 8, right: 8, height: 1.5, background: THEME.fg2, opacity: .45 }} />
        <div style={{ display: 'flex', justifyContent: 'space-around', paddingTop: 4, flexWrap: 'wrap', gap: 10 }}>
          {notes.map((n, i) => {
            const isFront = i === front;
            const tilt = TILTS[i % TILTS.length];
            return (
              <div key={i} onClick={() => setCursor(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press"
                style={{ position: 'relative', width: 102, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 6, padding: '10px 8px 8px', cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box', transform: `rotate(${isFront ? 0 : tilt}deg)`, transition: 'transform .2s ease' }}>
                <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 10, height: 14, background: WOOD, borderRadius: 2 }} />
                <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                {isFront && <div style={{ fontSize: 11, color: THEME.fg1, marginTop: 2, lineHeight: 1.3 }}>{noteText(n)}</div>}
                {isFront && (
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ marginTop: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (style === 'chalkboard') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    return (
      <div key={i0} className="jx-fade" style={{ width: '100%', maxWidth: 260, background: BOARD, border: `6px solid ${WOOD}`, borderRadius: 8, padding: '14px 16px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: CHALK, opacity: .85 }}>{n.by}</div>
        <div style={{ fontSize: 13.5, color: CHALK, marginTop: 4, lineHeight: 1.4 }}>{noteText(n)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="heart" size={15} color={CHALK} stroke={2.2} fill={likes[i0] ? CHALK : 'none'} />
          </button>
          {count > 1 && (
            <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: CHALK, fontSize: 11, fontWeight: 700 }}>
              <Icon name="eraser" size={13} color={CHALK} stroke={2.2} />{L('Next')}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (style === 'scroll') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => setOpen(o => !o)} role="button" tabIndex={0} aria-label={L('Guestbook')} className="jx-press" style={{ cursor: 'pointer', width: 220 }}>
          <div style={{ height: 10, background: WOOD, borderRadius: 6 }} />
          <div style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderTop: 'none', borderBottom: 'none', overflow: 'hidden', boxSizing: 'border-box', transition: 'max-height .35s ease, padding .35s ease', maxHeight: open ? 120 : 0, padding: open ? '10px 12px' : '0 12px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.35 }}>{noteText(n)}</div>
          </div>
          <div style={{ height: 10, background: WOOD, borderRadius: 6 }} />
        </div>
        {open && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={15} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
            </button>
            {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
          </div>
        )}
      </div>
    );
  }

  if (style === 'jar') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const spots = [[30, 30], [62, 22], [46, 46], [70, 50], [34, 58]];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 120, height: 110 }}>
          <div style={{ position: 'absolute', top: 0, left: '38%', width: '24%', height: 10, background: WOOD, borderRadius: '4px 4px 0 0' }} />
          <div style={{ position: 'absolute', top: 8, left: 0, right: 0, bottom: 0, border: `2px solid ${THEME.fg3}`, borderRadius: '16px 16px 30px 30px', background: 'rgba(255,255,255,.35)' }}>
            {notes.map((n, i) => {
              const [left, top] = spots[i % spots.length];
              return !jarPopped[i] && (
                <button key={i} onClick={() => toggleJarPop(i)} aria-label={n.by}
                  style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, width: 10, height: 10, borderRadius: 999, background: n.color, border: 'none', cursor: 'pointer', padding: 0 }} />
              );
            })}
          </div>
        </div>
        {jarPopped.some(Boolean) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {notes.map((n, i) => jarPopped[i] && (
              <div key={i} className="jx-rise" style={{ display: 'flex', alignItems: 'center', gap: 8, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 999, padding: '5px 12px' }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
                <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
                <button onClick={() => onLike(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // sticker / stamp / envelope / tag / frame / bracelet / inkstamp / bookspine / honeycomb /
  // dice / trophy / seashell / yarnball — same flip mechanic (see FlipCard), a different
  // front face each. Reusing one mechanic keeps thirteen shapes from needing thirteen
  // one-off animations.
  if (['sticker', 'stamp', 'envelope', 'tag', 'frame', 'bracelet', 'inkstamp', 'bookspine', 'honeycomb', 'dice', 'trophy', 'seashell', 'yarnball'].includes(style)) {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const front = { sticker: stickerFront, stamp: stampFront, envelope: envelopeFront, tag: tagFront,
      frame: frameFront, bracelet: braceletFront, inkstamp: inkstampFront, bookspine: bookspineFront,
      honeycomb: honeycombFront, dice: diceFront, trophy: trophyFront, seashell: seashellFront, yarnball: yarnballFront }[style];
    const [w, h] = { sticker: [72, 72], stamp: [84, 64], envelope: [84, 60], tag: [78, 74],
      frame: [70, 70], bracelet: [64, 64], inkstamp: [76, 60], bookspine: [46, 84],
      honeycomb: [70, 64], dice: [64, 64], trophy: [66, 66], seashell: [68, 60], yarnball: [66, 66] }[style];
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {notes.map((n, i) => (
          <FlipCard key={i} label={n.by} width={w} height={h} flipped={flipped[i]} onToggle={() => toggleFlip(i)}
            front={front(n)} back={flipBack(n, i, likes, onLike)} />
        ))}
      </div>
    );
  }

  // ── batch 3 — the room's own woodland/garden setting (Hammy cracks acorns, the room is
  // full of potted plants) rather than more desk-drawer objects. `flipped`/`toggleFlip` is
  // reused as a generic per-note "opened" flag here too — only the reveal animation differs.
  if (style === 'acorn') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 86, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 54 }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -20, width: 40, height: 16, background: WOOD, borderRadius: '10px 10px 2px 2px', transition: 'transform .3s ease', transform: on ? 'translateY(-4px)' : 'none' }} />
                <div style={{ position: 'absolute', top: 13, left: '50%', marginLeft: -20, width: 20, height: 34, background: KRAFT, borderRadius: '2px 0 0 20px', border: `1.5px solid ${WOOD_DARK}`, borderRight: 'none', boxSizing: 'border-box', transition: 'transform .3s ease', transform: on ? 'translateX(-9px) rotate(-8deg)' : 'none' }} />
                <div style={{ position: 'absolute', top: 13, left: '50%', width: 20, height: 34, background: KRAFT, borderRadius: '0 2px 20px 0', border: `1.5px solid ${WOOD_DARK}`, borderLeft: 'none', boxSizing: 'border-box', transition: 'transform .3s ease', transform: on ? 'translateX(9px) rotate(8deg)' : 'none' }} />
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 6, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'planemail') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer' }}>
              {!on ? (
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="send" size={26} color={WOOD} stroke={2} style={{ transform: 'rotate(-45deg)' }} />
                </div>
              ) : (
                <div className="jx-plane-in" style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '8px 10px', width: 132, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'vine') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 20, height: 20, borderRadius: '0 999px 999px 999px', background: on ? n.color : THEME.brand, margin: '0 auto', transition: 'transform .25s ease, background .25s ease', transform: on ? 'scale(1.6) rotate(45deg)' : 'rotate(45deg)' }} />
              {on && (
                <div className="jx-pop" style={{ marginTop: 6, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px', width: 118, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'musicbox') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    const on = flipped[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => toggleFlip(i0)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 100, height: 64, perspective: 300 }}>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 40, background: WOOD, borderRadius: '4px 4px 8px 8px', border: `1.5px solid ${WOOD_DARK}`, boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', top: 0, width: '100%', height: 26, background: WOOD_DARK, borderRadius: '6px 6px 0 0', transformOrigin: 'bottom', transition: 'transform .35s ease', transform: on ? 'rotateX(-110deg)' : 'none' }} />
        </div>
        {on && (
          <div className="jx-rise" style={{ display: 'flex', alignItems: 'center', gap: 10, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
            <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
            <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
            </button>
          </div>
        )}
        {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
      </div>
    );
  }

  if (style === 'gumball') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    const on = flipped[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => toggleFlip(i0)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 70, height: 84 }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 58, height: 52, borderRadius: '50% 50% 46% 46%', border: `2px solid ${THEME.fg3}`, background: 'rgba(255,255,255,.3)', boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', top: 50, left: '50%', transform: 'translateX(-50%)', width: 40, height: 34, background: WOOD, borderRadius: '4px 4px 8px 8px' }} />
          {!on && <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 16, height: 16, borderRadius: 999, background: n.color }} />}
        </div>
        {on && (
          <div className="jx-pop" style={{ display: 'flex', alignItems: 'center', gap: 8, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
            <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
            <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
            </button>
          </div>
        )}
        {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
      </div>
    );
  }

  if (style === 'plantmarker') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 2, height: 20, background: THEME.brand, margin: '0 auto' }} />
              <div style={{ width: on ? 92 : 54, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 5, padding: on ? '6px 8px' : '4px 6px', transition: 'width .2s ease', boxSizing: 'border-box' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                {on && (
                  <React.Fragment>
                    <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                    <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                      <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                    </button>
                  </React.Fragment>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── batch 4 — the Dream/Town rooms and the general kid-toy shelf (rockets, crystals, a
  // treasure chest, a fortune cookie) so nothing here repeats a shape from batch 3.
  if (style === 'rocket') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer' }}>
              {!on ? (
                <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="rocket" size={26} color={n.color} stroke={2} />
                </div>
              ) : (
                <div className="jx-rise" style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '8px 10px', width: 132, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'balloon') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 70 }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer' }}>
              {!on ? (
                <div style={{ width: 30, height: 38, borderRadius: '50% 50% 50% 4px', background: `${n.color}55`, border: `1.5px solid ${n.color}`, boxSizing: 'border-box', transform: 'rotate(-8deg)' }} />
              ) : (
                <div className="jx-pop" style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '8px 10px', width: 132, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'crystal') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          const shard = { position: 'absolute', width: 24, height: 40, background: `${n.color}55`, border: `1.5px solid ${n.color}`, clipPath: 'polygon(50% 0, 100% 35%, 70% 100%, 30% 100%, 0 35%)', boxSizing: 'border-box', transition: 'transform .3s ease' };
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 86, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 44, display: 'flex', justifyContent: 'center' }}>
                <div style={{ ...shard, transform: on ? 'translateX(-11px) rotate(-10deg)' : 'none' }} />
                <div style={{ ...shard, transform: on ? 'translateX(11px) rotate(10deg)' : 'none' }} />
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 6, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'starlight') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', background: BOARD, borderRadius: 14, padding: '16px 14px', border: `1.5px solid ${WOOD}`, boxSizing: 'border-box' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center', width: 96 }}>
              <Icon name="star" size={on ? 26 : 18} color={CHALK} fill={on ? CHALK : 'none'} stroke={2} style={{ transition: 'all .2s ease' }} />
              {on && (
                <div className="jx-pop" style={{ marginTop: 4, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'chest') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    const on = flipped[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => toggleFlip(i0)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 108, height: 68, perspective: 300 }}>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 42, background: WOOD, borderRadius: '3px 3px 8px 8px', border: `2px solid ${BRASS}`, boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: 14, height: 10, background: BRASS, borderRadius: 2 }} />
          <div style={{ position: 'absolute', top: 0, width: '100%', height: 28, background: WOOD_DARK, borderRadius: '10px 10px 0 0', border: `2px solid ${BRASS}`, borderBottom: 'none', boxSizing: 'border-box', transformOrigin: 'bottom', transition: 'transform .35s ease', transform: on ? 'rotateX(-115deg)' : 'none' }} />
        </div>
        {on && (
          <div className="jx-rise" style={{ display: 'flex', alignItems: 'center', gap: 10, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
            <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
            <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
            </button>
          </div>
        )}
        {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
      </div>
    );
  }

  if (style === 'book') {
    // Opens straight to the full guestbook — the chest's one-note-then-Next cycle read as
    // hiding the rest behind extra taps once there was more than a couple of notes. A book
    // holds many pages at once, so tapping it fans them all open in one sheet instead
    // (same list BottomSheet/NoteRow as 'sheet', just with the book as the trigger).
    // book-closed.png / book-open.png (public/assets/book) are finished art — the puck
    // itself flips cover-to-pages the moment it's tapped, not just the sheet behind it.
    // the cover reads as "open" only while the sheet is actually up — the moment closeBook()
    // starts the sheet's exit, this flips back to closed in step with it, rather than
    // waiting for the sheet to finish unmounting and snapping shut with no warning.
    const coverOpen = open && !closing;
    const bookArt = bookArtFor(roomTheme);
    return (
      <React.Fragment>
        <div onClick={() => setOpen(true)} role="button" tabIndex={0} aria-label={L('Guestbook')} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 108, height: 108 }}>
          {/* Two stacked images crossfading, not one <img> with its src swapped — a src swap
              is a hard cut (new image, new decode) with no way to animate between the two.
              Both stay mounted always; opacity/scale carry the "opening" motion. Which pair
              of images is swapped in at all (bookArt) depends on the room's theme, so the
              book left lying on the Green Room's floor doesn't wear the Dream Room's cover. */}
          <img src={bookArt.closed} alt="" draggable="false"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity .38s ease, transform .38s cubic-bezier(.2,.8,.2,1)', opacity: coverOpen ? 0 : 1, transform: coverOpen ? 'scale(.9) rotate(-2deg)' : 'scale(1)' }} />
          <img src={bookArt.open} alt="" draggable="false"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', transition: 'opacity .38s ease, transform .38s cubic-bezier(.2,.8,.2,1)', opacity: coverOpen ? 1 : 0, transform: coverOpen ? 'scale(1)' : 'scale(1.08)' }} />
          {/* A solid white ring (CollectionVariants' badge) sat on the cover like a sticker
              stuck on top of it — the cover is the illustration here, not a neutral surface a
              badge can own a corner of. A soft, borderless wash lets the art show through. */}
          {count > 0 && (
            <span style={{ position: 'absolute', top: 10, right: 18, minWidth: 22, height: 22, borderRadius: 999, background: 'rgba(255,255,255,.55)', color: THEME.fg1, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>{count}</span>
          )}
        </div>
        {/* Portaled to .screen (the phone-frame root), not rendered in place — ScreenHeader
            is `position:fixed` too, but it lives OUTSIDE the `zIndex:1` content wrapper this
            component is nested in, so no z-index we set here could ever outrank it: a
            descendant's z-index only competes within its own ancestor stacking context, and
            that wrapper caps everything inside it at "1" no matter what number we pick. Moving
            the scrim out to be a sibling of the header (via portal) is what lets zIndex:95
            actually win, so the header is truly covered instead of always painting through. */}
        {(open || closing) && createPortal(
          <div onClick={closeBook} className={closing ? 'jx-book-dim-out' : 'jx-book-dim-in'} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(20,18,16,0.44)' }}>
            {/* Pages stay the cream/parchment every other guestbook style uses (that part's
                right — a cover this blue can still hold cream pages, see book-open.png) but the
                frame is BOOK_COVER, not the shared woodland WOOD token — a brown picture-frame
                border around a blue gem cover was the actual clash, not the parchment itself.
                jx-book-in/out (not jx-pop/jx-dim-in) — a plain fade+scale settling both ways
                instead of jx-pop's elastic overshoot, which read as an abrupt snap here. */}
            <div onClick={e => e.stopPropagation()} className={closing ? 'jx-book-out' : 'jx-book-in'} style={{ width: '100%', maxWidth: 340, maxHeight: '70%', display: 'flex', flexDirection: 'column', background: `linear-gradient(160deg, ${PARCHMENT} 0%, ${KRAFT} 100%)`, border: `2.5px solid ${bookArt.cover}`, borderRadius: 26, padding: '18px 16px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <img src={bookArt.open} alt="" draggable="false" style={{ width: 28, height: 28, objectFit: 'contain', flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: THEME.fg1 }}>{L('Guestbook')}</div>
                <button type="button" onClick={closeBook} aria-label={L('Close')} style={{ width: 30, height: 30, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Icon name="x" size={17} color={THEME.fg2} stroke={2.4} />
                </button>
              </div>
              <div className="no-sb" style={{ overflowY: 'auto' }}>
                {count === 0 ? <EmptyNote /> : notes.map((n, i) => <NoteRow key={i} note={n} showLike={false} />)}
              </div>
            </div>
          </div>,
          document.querySelector('.screen') || document.body
        )}
      </React.Fragment>
    );
  }

  if (style === 'birdnest') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', background: KRAFT, borderRadius: '4px 4px 40px 40px', border: `1.5px solid ${WOOD}`, padding: '14px 14px 6px', boxSizing: 'border-box' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          const egg = { position: 'absolute', width: 18, height: 26, background: '#fffdf7', border: `1.5px solid ${WOOD_DARK}`, borderRadius: '50%', boxSizing: 'border-box', transition: 'transform .3s ease' };
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 70, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 34, display: 'flex', justifyContent: 'center' }}>
                <div style={{ ...egg, transform: on ? 'translateX(-8px) rotate(-14deg)' : 'none' }} />
                <div style={{ ...egg, transform: on ? 'translateX(8px) rotate(14deg)' : 'none' }} />
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 4, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '5px 7px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10, color: THEME.fg1, lineHeight: 1.2 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Icon name="heart" size={11} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'fortunecookie') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 80, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 30, display: 'flex', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50% 50% 50% 0', background: KRAFT_DARK, boxSizing: 'border-box', transition: 'transform .3s ease', transform: on ? 'translate(-10px, 2px) rotate(-20deg)' : 'rotate(-5deg)' }} />
                <div style={{ position: 'absolute', width: 26, height: 26, borderRadius: '50% 50% 0 50%', background: KRAFT_DARK, boxSizing: 'border-box', transition: 'transform .3s ease', transform: on ? 'translate(10px, 2px) rotate(20deg)' : 'rotate(5deg)' }} />
                {on && <div style={{ position: 'absolute', top: -4, width: 60, height: 12, background: '#fffdf7', border: `1px solid ${WOOD}`, borderRadius: 2 }} />}
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 8, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'cameraprint') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 40, height: 30, background: WOOD_DARK, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, margin: '0 auto' }}>
                <Icon name="camera" size={16} color={PARCHMENT} stroke={2} />
              </div>
              {on && (
                <div className="jx-rise" style={{ marginTop: -4, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: '2px 2px 8px 8px', padding: '10px 8px 6px', width: 100, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ── batch 5 — the room's own mushroom props, a telescope-peek reveal (new mechanic:
  // circular viewport, not a flip/split), and a beach/weather/craft sweep.
  if (style === 'mushroom') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 78, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 40 }}>
                <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 10, height: 20, background: '#fffdf7', border: `1.5px solid ${WOOD_DARK}`, borderRadius: '0 0 3px 3px', boxSizing: 'border-box' }} />
                <div style={{ position: 'absolute', bottom: 14, left: '50%', width: 46, height: 22, background: n.color, borderRadius: '50% 50% 6px 6px', border: `1.5px solid ${WOOD_DARK}`, boxSizing: 'border-box', transformOrigin: 'left bottom', transition: 'transform .3s ease', transform: on ? 'translateX(-23px) rotate(-55deg)' : 'translateX(-23px)' }} />
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 2, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'telescope') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    const on = flipped[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => toggleFlip(i0)} role="button" tabIndex={0} aria-label={n.by} className="jx-press"
          style={{ cursor: 'pointer', width: 100, height: 100, borderRadius: 999, border: `4px solid ${WOOD}`, background: on ? PARCHMENT : BOARD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', overflow: 'hidden' }}>
          {!on ? (
            <Icon name="telescope" size={30} color={CHALK} stroke={1.8} />
          ) : (
            <div className="jx-fade" style={{ padding: '0 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
              <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
            </div>
          )}
        </div>
        {on && (
          <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Icon name="heart" size={14} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
          </button>
        )}
        {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
      </div>
    );
  }

  if (style === 'raincloud') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', minHeight: 70 }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 40, height: 24, borderRadius: 999, background: THEME.fg3, opacity: .5, margin: '0 auto' }} />
              {on ? (
                <div className="jx-rise" style={{ marginTop: 4, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px', width: 118, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              ) : (
                <div style={{ width: 4, height: 10, background: THEME.primary, borderRadius: '0 0 4px 4px', margin: '2px auto 0' }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'pinwheel') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', minHeight: 60 }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer' }}>
              {!on ? (
                <div style={{ width: 34, height: 34, position: 'relative' }}>
                  {[0, 90, 180, 270].map(deg => (
                    <div key={deg} style={{ position: 'absolute', top: '50%', left: '50%', width: 15, height: 15, background: n.color, opacity: .82, clipPath: 'polygon(0 0, 100% 0, 0 100%)', transform: `rotate(${deg}deg) translate(1px,1px)`, transformOrigin: '0 0' }} />
                  ))}
                </div>
              ) : (
                <div className="jx-pop" style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '8px 10px', width: 132, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, marginTop: 2, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'kite') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ width: 24, height: 24, background: `${n.color}55`, border: `1.5px solid ${n.color}`, transform: 'rotate(45deg)', margin: '0 auto', boxSizing: 'border-box' }} />
              <div style={{ width: 1.5, height: on ? 6 : 22, background: THEME.fg3, margin: '0 auto', transition: 'height .25s ease' }} />
              {on && (
                <div className="jx-fade" style={{ background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px', width: 118, boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (style === 'giftbox') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    const i0 = cursor % count;
    const n = notes[i0];
    const on = flipped[i0];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div onClick={() => toggleFlip(i0)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 90, height: 74, perspective: 300 }}>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 46, background: n.color, opacity: .5, borderRadius: 4, boxSizing: 'border-box' }} />
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 8, height: 46, background: n.color }} />
          <div style={{ position: 'absolute', top: 0, width: '100%', height: 20, background: n.color, opacity: .8, borderRadius: '4px 4px 0 0', transformOrigin: 'bottom', transition: 'transform .35s ease', transform: on ? 'rotateX(-120deg)' : 'none' }} />
        </div>
        {on && (
          <div className="jx-rise" style={{ display: 'flex', alignItems: 'center', gap: 10, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 999, padding: '5px 12px' }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}:</span>
            <span style={{ fontSize: 12, color: THEME.fg1 }}>{noteText(n)}</span>
            <button onClick={() => onLike(i0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Icon name="heart" size={13} color={THEME.joy} stroke={2.2} fill={likes[i0] ? THEME.joy : 'none'} />
            </button>
          </div>
        )}
        {count > 1 && <button onClick={() => setCursor(c => c + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{L('Next')} ›</button>}
      </div>
    );
  }

  if (style === 'ladybug') {
    if (!count) return <TriggerChip onClick={() => {}} count={0} />;
    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {notes.map((n, i) => {
          const on = flipped[i];
          const wing = { position: 'absolute', width: 15, height: 24, background: THEME.heart, border: `1.5px solid ${WOOD_DARK}`, boxSizing: 'border-box', transition: 'transform .3s ease' };
          return (
            <div key={i} onClick={() => toggleFlip(i)} role="button" tabIndex={0} aria-label={n.by} className="jx-press" style={{ width: 78, cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ position: 'relative', height: 30, display: 'flex', justifyContent: 'center' }}>
                <div style={{ ...wing, borderRadius: '50% 4px 4px 50%', transform: on ? 'translateX(-9px) rotate(-25deg)' : 'translateX(-7px)' }} />
                <div style={{ ...wing, borderRadius: '4px 50% 50% 4px', transform: on ? 'translateX(9px) rotate(25deg)' : 'translateX(7px)' }} />
                <div style={{ position: 'absolute', top: 4, width: 10, height: 10, borderRadius: 999, background: THEME.fg1 }} />
              </div>
              {on && (
                <div className="jx-fade" style={{ marginTop: 4, background: PARCHMENT, border: `1.5px solid ${WOOD}`, borderRadius: 8, padding: '6px 8px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg1, lineHeight: 1.25 }}>{noteText(n)}</div>
                  <button onClick={(e) => { e.stopPropagation(); onLike(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginTop: 2 }}>
                    <Icon name="heart" size={12} color={THEME.joy} stroke={2.2} fill={likes[i] ? THEME.joy : 'none'} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}

export { GUESTBOOK_STYLES, GuestbookPanel, GuestbookRoomBubbles };
