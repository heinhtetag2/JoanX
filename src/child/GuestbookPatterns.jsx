// JoanX — child app · GuestbookPatterns
//
// The room's guestbook, read as a book on the floor: tap the book puck to fan its
// pages open in a full sheet of the notes friends left (MyHouse's F-32 return leg).
// Closing plays an exit animation before the sheet unmounts. On a friend's visit
// (FriendHouse) the same sheet also carries the write side — picking a stamp and
// leaving a note — via the `compose` prop; MyHouse never passes one, so your own
// room's book stays read-only.
//
// This used to be fifty side-by-side treatments of the same idea, switchable from
// Tweaks so one could be picked before committing — 'book' (Storybook) won, so this
// file is what's left after deleting down to that one branch.

import React from 'react';
import { createPortal } from 'react-dom';
import { themeById } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';

// One skin per room theme, both for the floor puck (public/assets/book/book-<theme>-<closed|open>.png)
// and the notes popup it opens (public/assets/book-popup/notes-frame-<theme>.png +
// close-btn-<theme>.png — an illuminated-manuscript frame and its matching round close
// button, replacing the old drawn gradient+border card and lucide `x`). So the book left
// lying on the Green Room's floor, and the popup it opens, both wear the Green Room's skin
// instead of always defaulting to Dream's indigo/purple. Any theme not listed here (a future
// room added without its own art) falls back to the Dream skin rather than a fourth guess.
const BOOK_ART = {
  dream: { closed: '/assets/book/book-dream-closed.png', open: '/assets/book/book-dream-open.png', frame: '/assets/book-popup/notes-frame-dream.png', close: '/assets/book-popup/close-btn-dream.png' },
  green: { closed: '/assets/book/book-green-closed.png', open: '/assets/book/book-green-open.png', frame: '/assets/book-popup/notes-frame-green.png', close: '/assets/book-popup/close-btn-green.png' },
  town:  { closed: '/assets/book/book-town-closed.png',  open: '/assets/book/book-town-open.png',  frame: '/assets/book-popup/notes-frame-town.png', close: '/assets/book-popup/close-btn-town.png' },
};
const bookArtFor = (theme) => BOOK_ART[theme] || BOOK_ART.dream;

// notes-list scrollbar thumb, one per book skin — sampled off each frame's own corner
// hardware (BOOK_ART above) rather than a single flat brown, so the thumb reads as that
// book's own gold/wood trim: green's carved wood post, dream's bright gold, town's honey
// oak block. Same fallback rule as bookArtFor — an unlisted theme wears dream's gold.
const BOOK_SB = { dream: '#c99a3a', green: '#a9744f', town: '#c08a52' };
const bookThumbFor = (theme) => BOOK_SB[theme] || BOOK_SB.dream;

const noteText = (n) => `${n.emoji ? n.emoji + ' ' : ''}${L(n.text)}`;

function EmptyNote() {
  return (
    <div style={{ textAlign: 'center', padding: '10px 12px 4px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>
      {L('When a friend visits your room, the note they leave shows up here.')}
    </div>
  );
}

// `compose` — the write side of the guestbook, which only exists on a visit
// (FriendHouse): your own room only ever reads what friends left, there's nothing to
// add. Lives inside the book's own open sheet rather than as a section on the page, so
// leaving a note reads as part of the same object you just opened, not a form bolted next
// to the room. Shape: { stamps, picked, onPick, draft, onDraft, onSend, signed, blockedText }.
function GuestbookPanel({ notes, likes, onLike, roomTheme, compose }) {
  const [open, setOpen] = React.useState(false);
  // closing plays the exit animation before the sheet actually unmounts — React
  // removing a node doesn't animate on its own, so this keeps it mounted (open || closing)
  // for exactly as long as jx-book-out/jx-book-dim-out take, then setOpen(false) for real.
  const [closing, setClosing] = React.useState(false);
  const closeBook = () => { setClosing(true); setTimeout(() => { setOpen(false); setClosing(false); }, 260); };
  const count = notes.length;
  // the puck lives in the room's normal content flow, capped inside a `zIndex:1`
  // wrapper (see MyHouse.jsx) — the notes sheet's dim scrim is portaled straight to
  // `.screen` at zIndex 95, well above that cap, so left alone the puck would dim along
  // with the rest of the room the instant the scrim mounts. Rather than pull the puck's
  // actual DOM node out of the room (it needs to stay there, at its normal room position,
  // for every other room-decor concern), this measures where it's actually rendered and
  // portals a live "echo" of it to `.screen` too, positioned to sit exactly on top of the
  // real one — so it reads as the same book, just no longer dimmed. `.screen` is scaled
  // for the phone-frame mockup, so raw getBoundingClientRect() pixels (post-scale) have to
  // be divided back down by that scale to land in `.screen`'s own unscaled coordinate
  // space — same reasoning as the coin-shower landing math in HomeVariantsSimple.jsx.
  const puckRef = React.useRef(null);
  const [puckRect, setPuckRect] = React.useState(null);
  // The notes card's own entrance/exit (jx-book-in/out, styles/joanx.css) is a plain scale
  // anchored on `transformOrigin` rather than a fixed slide direction — so it needs to know,
  // in percentages of ITS OWN box, where the puck it was tapped from actually sits. Measured
  // in the same effect as puckRect (below) since both need the puck's rect and both only
  // matter for exactly the same window (open || closing); cardRef only resolves once the
  // portal below has actually mounted the card, which happens in this same commit.
  const cardRef = React.useRef(null);
  const [cardOrigin, setCardOrigin] = React.useState('50% 115%');
  React.useLayoutEffect(() => {
    if (!(open || closing)) { setPuckRect(null); return; }
    const puckEl = puckRef.current, cardEl = cardRef.current, screenEl = document.querySelector('.screen');
    if (!puckEl || !screenEl) return;
    const puckBox = puckEl.getBoundingClientRect(), screenBox = screenEl.getBoundingClientRect();
    const scale = screenBox.width / screenEl.offsetWidth || 1;
    setPuckRect({
      left: (puckBox.left - screenBox.left) / scale,
      top: (puckBox.top - screenBox.top) / scale,
      width: puckBox.width / scale,
      height: puckBox.height / scale,
    });
    if (cardEl) {
      const cardBox = cardEl.getBoundingClientRect();
      const puckCx = puckBox.left + puckBox.width / 2, puckCy = puckBox.top + puckBox.height / 2;
      setCardOrigin(`${((puckCx - cardBox.left) / cardBox.width) * 100}% ${((puckCy - cardBox.top) / cardBox.height) * 100}%`);
    }
  }, [open, closing]);

  // Opens straight to the full guestbook. book-closed.png / book-open.png
  // (public/assets/book) are finished art — the puck itself flips cover-to-pages the
  // moment it's tapped, not just the sheet behind it. The cover reads as "open" only
  // while the sheet is actually up — the moment closeBook() starts the sheet's exit,
  // this flips back to closed in step with it, rather than waiting for the sheet to
  // finish unmounting and snapping shut with no warning.
  const coverOpen = open && !closing;
  const bookArt = bookArtFor(roomTheme);
  // The compose actions (send button, picked-stamp ring, the "sent" check) wear the
  // room's own accent — the same green/slate/iris ROOM_THEMES already carries for its
  // wallpaper trim and floor border — rather than the app's generic THEME.primary blue,
  // so a note posted from the Green Room's book presses a green button, not a blue one
  // borrowed from a different room's palette.
  const accent = themeById(roomTheme).accent;
  const bookThumb = bookThumbFor(roomTheme);
  // Shared between the real puck and its echo (below) so the crossfade art/badge is
  // defined once — the only difference between the two is which element wraps it.
  const puckArt = (
    <React.Fragment>
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
    </React.Fragment>
  );
  return (
    <React.Fragment>
      {/* Idle bob (jx-book-float) lives on its own outer wrapper, not the jx-press element
          underneath — jx-press's :active scale and this float both touch `transform`, and
          an element can only run one `animation`/cascade winner for a given property, so
          stacking them on the same node would have the tap-scale lose to the animation (or
          vice versa) instead of the two compositing. On separate parent/child nodes they
          nest and both just work. Paused once the cover is open (coverOpen) — a book that's
          mid-page while also drifting up and down reads as unsteady, not alive, and the
          sheet has the room's attention by then anyway.
          visibility (not display) hidden once the sheet is up — the echo below takes over
          showing the book, but this real node has to stay laid out (not collapse to 0×0)
          so puckRef keeps reporting its true room position for as long as the echo needs it. */}
      <div className={coverOpen ? '' : 'jx-book-float'} style={{ width: 108, height: 108, visibility: (open || closing) ? 'hidden' : 'visible' }}>
        <div ref={puckRef} onClick={() => setOpen(true)} role="button" tabIndex={0} aria-label={L('Guestbook')} className="jx-press" style={{ cursor: 'pointer', position: 'relative', width: 108, height: 108 }}>
          {puckArt}
        </div>
      </div>
      {/* The book lives in the room's normal flow, capped below the notes sheet's dim
          scrim (zIndex 95, portaled straight to `.screen` — see the comment further down)
          — left alone it'd dim along with the rest of the room the instant the sheet
          opens. This is a portaled "echo" of it, positioned over puckRect (measured off
          the real node above) at a zIndex ABOVE the scrim, so the book stays lit and
          visible in place instead of disappearing behind the overlay. pointerEvents:none
          so a tap here still falls through to the scrim beneath it and closes the sheet,
          same as tapping anywhere else in the dimmed room would. */}
      {(open || closing) && puckRect && createPortal(
        <div style={{ position: 'fixed', left: puckRect.left, top: puckRect.top, width: puckRect.width, height: puckRect.height, zIndex: 96, pointerEvents: 'none' }}>
          {puckArt}
        </div>,
        document.querySelector('.screen') || document.body
      )}
      {/* Portaled to .screen (the phone-frame root), not rendered in place — ScreenHeader
          is `position:fixed` too, but it lives OUTSIDE the `zIndex:1` content wrapper this
          component is nested in, so no z-index we set here could ever outrank it: a
          descendant's z-index only competes within its own ancestor stacking context, and
          that wrapper caps everything inside it at "1" no matter what number we pick. Moving
          the scrim out to be a sibling of the header (via portal) is what lets zIndex:95
          actually win, so the header is truly covered instead of always painting through. */}
      {(open || closing) && createPortal(
        <div onClick={closeBook} className={closing ? 'jx-book-dim-out' : 'jx-book-dim-in'} style={{ position: 'fixed', inset: 0, zIndex: 95, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(20,18,16,0.44)' }}>
          {/* The illuminated-manuscript frame (notes-frame.png) IS the card now — no drawn
              gradient/border underneath it. Content sits in an absolutely-positioned inset
              sized off the art's own margins, so it reads as ink on the page rather than a
              component floating in front of it. jx-book-in/out (not jx-pop/jx-dim-in) — a
              plain scale settling both ways, anchored on `transformOrigin: cardOrigin`
              (computed above from the actual puck's screen position) so the card visibly
              grows OUT OF the book that was tapped rather than just popping up centered —
              jx-pop's elastic overshoot also read as an abrupt snap here regardless. The
              idle bob (jx-book-float) lives on an INNER wrapper, not this outer element —
              both jx-book-in/out and a float animate `transform`, and stacking two
              `animation` values on one element has the later one simply win rather than
              compose, so the entrance would clobber the float (or vice versa). Splitting
              them onto parent/child means the settle and the bob are just two transforms
              nested, which do compose. Only mounted while open (not during the close
              animation) so it doesn't fight jx-book-out's own settle-down. */}
          <div ref={cardRef} onClick={e => e.stopPropagation()} className={closing ? 'jx-book-out' : 'jx-book-in'}
            style={{ position: 'relative', width: '100%', maxWidth: 320, maxHeight: '86vh', aspectRatio: '1776 / 2780', transformOrigin: cardOrigin }}>
            <div className={closing ? '' : 'jx-book-float'} style={{ position: 'absolute', inset: 0 }}>
              <img src={bookArt.frame} alt="" draggable="false" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              <button type="button" onClick={closeBook} aria-label={L('Close')}
                style={{ position: 'absolute', top: '7%', right: '7.5%', width: '12%', aspectRatio: '1 / 1', border: 'none', cursor: 'pointer', padding: 0, backgroundColor: 'transparent', backgroundImage: `url(${bookArt.close})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
              <div style={{ position: 'absolute', inset: '7.5% 9% 8.5%', display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
                {/* This wrapper spans up into the close button's corner (inset top 7.5% vs
                    the button's top 7%) — sat here with the default pointerEvents:auto, its
                    empty-looking top region was actually an invisible click-catcher stacked
                    ON TOP of the button (later in DOM order wins the paint/hit-test order
                    when boxes overlap), so taps that looked dead-on the X never reached it.
                    pointerEvents:none here, re-enabled just on the notes list below, lets
                    clicks fall through everywhere this wrapper has nothing visible. */}
                <div style={{ position: 'relative', marginTop: 14, marginBottom: 40, minHeight: 24 }}>
                  {/* Centered on the full content width, not a padded-for-the-button row — the
                      close button now sits well clear in its own corner (see its top/right
                      above), so reserving a gutter for it here just dragged the title off the
                      frame's true center. No count badge here; the puck's own overlay (below)
                      already carries the count. */}
                  <div style={{ textAlign: 'center', fontSize: 15.5, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap' }}>{L('Guestbook')}</div>
                </div>
                {/* jx-book-notes (not no-sb): once there are more notes than fit — the
                    whole point of a guestbook that fills up — a visible thumb is the only
                    cue this page keeps going below the fold. paddingRight clears the
                    thumb's own gutter so it sits inside the parchment, not on top of the
                    note cards or crossing the frame's gold border. paddingLeft matches it —
                    the cards were sitting flush against the frame's left edge with nothing
                    balancing the scrollbar's own gutter on the right. --jx-book-thumb (read
                    by joanx.css) is set here per room theme, not hardcoded in the
                    stylesheet, so the thumb wears bookThumb — the same skin's own trim color. */}
                <div className="jx-book-notes" style={{ flex: 1, overflowY: 'auto', pointerEvents: 'auto', padding: '0 8px', '--jx-book-thumb': bookThumb }}>
                  {count === 0 ? <EmptyNote /> : notes.map((n, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.6)', borderRadius: 14, padding: '10px 12px', marginBottom: 8 }}>
                      <MascotChip species={n.avatar} color={n.color} size={32} bg={THEME.primaryLight} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{n.by}</div>
                        <div style={{ fontSize: 13, color: THEME.fg1, marginTop: 1, lineHeight: 1.35 }}>{noteText(n)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* the write side — pinned under the scrolling list, not part of it, so it
                    never scrolls out of reach. Only rendered once a friend's `compose` is
                    handed down (FriendHouse); MyHouse never passes one, so its own book
                    stays read-only. */}
                {compose && (
                  <div style={{ pointerEvents: 'auto', flexShrink: 0, marginTop: 8, padding: '0 8px' }}>
                    {compose.signed ? (
                      <div className="jx-pop" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.7)', borderRadius: 999, padding: '8px 12px' }}>
                        <Icon name="check" size={14} color={accent} stroke={2.6} />
                        <span style={{ fontSize: 12, fontWeight: 800, color: accent }}>{L('Note left!')}</span>
                      </div>
                    ) : (
                      <React.Fragment>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.75)', borderRadius: 14, padding: '6px 6px 6px 11px', marginBottom: 6 }}>
                          <input
                            value={compose.draft}
                            onChange={(e) => compose.onDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && compose.draft.trim()) compose.onSend(); }}
                            maxLength={80}
                            placeholder={L('Say something kind…')}
                            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: THEME.fg1, fontFamily: 'inherit', padding: 0 }} />
                          <button onClick={compose.onSend} disabled={!compose.draft.trim()} aria-label={L('Leave note')}
                            style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: compose.draft.trim() ? 'pointer' : 'default', background: compose.draft.trim() ? accent : THEME.surface2 }}>
                            <Icon name="send" size={13} color={compose.draft.trim() ? '#fff' : THEME.fg3} stroke={2.4} />
                          </button>
                        </div>
                        {compose.blockedText && (
                          <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.danger, lineHeight: 1.35, margin: '0 2px 6px' }}>{compose.blockedText}</div>
                        )}
                        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }} className="no-sb">
                          {compose.stamps.map((s, i) => (
                            <button key={i} onClick={() => compose.onPick(s)} className="jx-press"
                              style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: compose.picked === s ? '#fff' : 'rgba(255,255,255,.6)', border: `1.5px solid ${compose.picked === s ? accent : 'transparent'}`, borderRadius: 999, padding: '5px 10px', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 700, color: compose.picked === s ? accent : THEME.fg1, cursor: 'pointer' }}>
                              <span style={{ fontSize: 13 }}>{s.emoji}</span>{L(s.text)}
                            </button>
                          ))}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.querySelector('.screen') || document.body
      )}
    </React.Fragment>
  );
}

export { GuestbookPanel };
