// JoanX — child app · RoomStage
//
// The room, drawn once and edited in place. Two screens mount this: the Decorate
// screen (all unlocked rooms, tabbed, one explicit Save) and the profile hero (just
// the home room, saving as you go). Extracting it is what keeps those two honest —
// a room a friend sees is rendered by the same code that painted it.
//
// The pattern is the one A-7 asks for: every surface it names — wallpaper, flooring,
// furniture, ornaments — is its own tap target, a puck parked beside the thing it
// changes and joined to it by a leader line. You edit the room by touching the room.

import React from 'react';
import { buyItem, CHARACTERS, DECOR, decorForRoom, OUTFITS, PLAYER, ROOMS, themeOf } from '../core/data.jsx';
import { BottomSheet, Icon, SafePointIcon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { wornSlugFor } from './shared.jsx';
import { RoomPucks } from './RoomPuckStyles.jsx';
import { sfx } from '../core/sound.jsx';

// ── useRoomEditing — everything a room editor needs to hold ──────────
// Edits live per room in `drafts`, so Decorate can dress the Green Room, hop to the
// Dream Room, dress that too, and commit once. `autoSave` is for the profile, which
// has no Save button: a change there is the change.
function useRoomEditing(rooms, roomId, { autoSave = false } = {}) {
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const theme = themeOf(room);

  const [drafts, setDrafts] = React.useState(() => Object.fromEntries(
    rooms.map(r => [r.id, { wallpaper: r.wallpaper, flooring: r.flooring, placed: { ...r.placed } }])));
  const draft = drafts[room.id];

  const [pts, setPts] = React.useState(PLAYER.points);
  // ownership is global (you own the item, not "the item in this room"), so it is
  // seeded from the whole table — not just the room you happen to be standing in
  const [ownedDecor, setOwnedDecor] = React.useState(() =>
    Object.fromEntries(DECOR.map(d => [d.id, d.owned])));
  // characters live on the character row (c.room), so placement survives this screen
  const [homes, setHomes] = React.useState(() =>
    Object.fromEntries(CHARACTERS.filter(c => c.owned).map(c => [c.id, c.room])));
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1600); };

  const catalog = decorForRoom(room.id);
  const inRoom = CHARACTERS.filter(c => c.owned && homes[c.id] === room.id);
  const placedDecor = catalog.filter(d => draft.placed[d.id]);

  // commit — drafts win over whatever the rows currently hold
  const commit = (nextDrafts = drafts, nextHomes = homes) => {
    rooms.forEach(r => {
      const d = nextDrafts[r.id];
      r.wallpaper = d.wallpaper; r.flooring = d.flooring; r.placed = d.placed;
    });
    CHARACTERS.forEach(c => { if (c.owned) c.room = nextHomes[c.id] ?? null; });
  };

  const editDraft = (patch) => setDrafts(d => {
    const next = { ...d, [room.id]: { ...d[room.id], ...patch } };
    if (autoSave) commit(next);
    return next;
  });

  // A-5.1 — buying goes through buyItem() so the points check, the level gate and the
  // ownership write are the same here as on every other item surface.
  // one item at a time per slot group — the shelf holds ONE object, the seat's area
  // holds ONE furniture piece. Placing a new one clears whatever was there in the same
  // group first, rather than stacking a shelf full of icons; tapping the one that's
  // already on just takes it back, same "tap to take back" gesture reactions use.
  const tapDecor = (d) => {
    const turningOn = !draft.placed[d.id];
    if (!ownedDecor[d.id]) {
      const verdict = buyItem(d, PLAYER);
      if (!verdict.ok) { say(L(verdict.reason === 'level' ? 'Unlocks at Lv' : 'Not enough points yet')); return; }
      sfx.purchase();   // same cue Shop's egg purchase plays — spending points gets a sound either place
      setPts(PLAYER.points); setOwnedDecor(o => ({ ...o, [d.id]: true }));
    }
    const nextPlaced = { ...draft.placed };
    if (turningOn) catalog.forEach(item => { if (item.slot === d.slot) nextPlaced[item.id] = false; });
    nextPlaced[d.id] = turningOn;
    editDraft({ placed: nextPlaced });
  };

  // free placement (A-6) — a buddy lives in exactly one room, and a room holds `slots`
  const tapChar = (c) => {
    const leaving = homes[c.id] === room.id;
    if (!leaving && inRoom.length >= room.slots) { say(`${L(room.name)} · ${L('Room is full')}`); return; }
    setHomes(h => {
      const next = { ...h, [c.id]: leaving ? null : room.id };
      if (autoSave) commit(drafts, next);
      return next;
    });
  };

  return { room, theme, draft, drafts, editDraft, pts, ownedDecor, homes, tapChar, tapDecor,
           catalog, inRoom, placedDecor, toast, say, save: () => commit() };
}

// `puck` is where the button sits, `aim` the point on the surface it points at —
// both percentages of the canvas, so the room can be any height.
// The three illustrated rooms are one set, drawn to a shared layout: a shelf standing on the
// left, a seat on the right, a window centred above them, and an empty floor for the buddy.
// So these aim at that layout once and hold for every room — Green's stump chair, Town's desk
// and Magic's armchair all sit under the same dot. A phone crops ~9% off each side of the art,
// which is why nothing aims past ~85%: the wall decor drawn at the far edges (the framed leaf,
// the pinboard, the dreamcatcher) is only half there on a real screen, so it can't hold a dot.
const HOTSPOTS = [
  { slot: 'wallpaper', icon: 'paint-roller', label: 'Wallpaper', puck: [14, 17], aim: [45, 8] },
  // The shelf, and the only way to the object catalogue — plants, lanterns, the small things
  // that stand ON furniture rather than being it. Every room in the set puts a full-height
  // shelf here: Green's tree-trunk bookcase, Town's toy shelf, Magic's crystal cabinet.
  { slot: 'shelf',     icon: 'sprout',       label: 'Shelf',     puck: [27, 30], aim: [12, 45] },
  // The seat, opposite it. Dot on the seat rather than its back: the line only has to reach
  // the object, not travel the length of it — and a puck parked ON its own subject points at
  // nothing, since both ends land on the same thing and the line says nothing.
  { slot: 'furniture', icon: 'armchair',     label: 'Furniture', puck: [62, 32], aim: [80, 45] },
  // aim low on the buddy, not at her head — a dot on the face covers the one part of her
  // that carries any expression, and that face is what the page is for. The puck sits on
  // bare floor to the right, where every room in the set leaves it empty.
  { slot: 'buddy',     icon: 'paw-print',    label: 'Buddies',   puck: [89, 88], aim: [58, 82] },
  { slot: 'flooring',  icon: 'grid-3x3',     label: 'Flooring',  puck: [17, 86], aim: [45, 91] },
];

// ── RoomStage — the canvas, and the pucks that edit it ───────────────
// `buddies` is whoever the host wants standing here — the caller decides, because the
// two hosts mean different things by it: Decorate shows everyone who LIVES in the room,
// the profile shows the one featured buddy a visiting friend came to see (F-32).
// `backdrop` — draw the room's own surfaces, or stand on someone else's. The profile
// paints the room across the whole page and passes false, so the stage contributes
// only what lives IN the room: the buddy, the decor and the pucks.
// `buddySize` — the mascot has to be sized against whatever the ART is scaled to, not
// against this box. The profile paints the room across the whole page, which draws the
// backdrop at a different scale from the same art inside Decorate's card; a buddy that
// reads at one scale is a doll at the other. So the host, which knows how big its room is
// drawn, says how big the buddy stands. Only the solo case takes it — a full room still
// packs its buddies down by count.
// `floorLine` — where the ground is, as a distance up from the bottom. The painted floor
// band puts it at 24%; a room drawn as art puts it wherever the artist drew it, so the
// host aims at the art rather than the box. Buddy and furniture share it — they stand on
// the same ground.
// `interactive` — false for a read-only visit (FriendHouse): the room, its decor and its
// buddy still render, but the edit pucks don't — a dot that opens nothing on tap reads as
// broken, not as "not yours to touch". `onPuck` still defaults to a no-op underneath that,
// since interactive-but-handlerless is also a valid state to fail quietly on.
function RoomStage({ theme, draft, buddies, placedDecor, onPuck = () => {}, height = 340, radius = 22, backdrop = true, buddySize, floorLine = '24%', interactive = true }) {
  // A room drawn as one illustration has no repaintable wall or floor, so those two pucks
  // would open a picker whose effect nobody can see. They come back the day the art ships
  // as separate wall/floor layers — which is what A-7's wallpaper and flooring really need.
  const pucks = interactive ? HOTSPOTS.filter(h => !(theme.bg && (h.slot === 'wallpaper' || h.slot === 'flooring'))) : [];
  // a hairline of ink reads on a pale gradient and disappears into illustration, so the
  // leader lines flip to white the moment there's art under them
  const onArt = !!theme.bg || !backdrop;

  return (
    <div style={{ position: 'relative', height, borderRadius: radius, overflow: backdrop ? 'hidden' : 'visible' }}>
      {backdrop && (
        <React.Fragment>
          {/* the two painted surfaces — also the fallback under a theme with no art */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: '28%', background: theme.wall(draft.wallpaper) }} />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%', background: theme.floor(draft.flooring), borderTop: `2px solid ${theme.accent}` }} />

          {/* the room itself, as one illustration. It sits over the painted surfaces rather
              than replacing them, so a theme with no art still renders a room. */}
          {theme.bg && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${theme.bg})`, backgroundSize: 'cover', backgroundPosition: 'center bottom' }} />
          )}
        </React.Fragment>
      )}

      {/* ornaments hang on the wall, furniture stands on the floor line — the slot
          decides where a piece lives, so no item needs coordinates of its own */}
      <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {placedDecor.filter(d => d.slot === 'object').map(d => (
          <div key={d.id} style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.7)', border: `2px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={d.icon} size={22} color={THEME.fg2} stroke={2.1} />
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: floorLine, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16 }}>
        {placedDecor.filter(d => d.slot !== 'object').map(d => (
          <Icon key={d.id} name={d.icon} size={30} color={THEME.fg2} stroke={2.1} />
        ))}
      </div>

      {/* standing on the floor line — a full room holds ROOM_CAPACITY, so the mascot
          shrinks as the room fills instead of overflowing */}
      <div style={{ position: 'absolute', bottom: floorLine, left: 0, right: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 4 }}>
        {/* the lone featured buddy gets Home's idle bob — it's the thing you came to look
            at. A roomful doesn't: a shelf of buddies all bobbing is a list in motion, and
            the eye can't settle on any of them. */}
        {buddies.map(c => (
          <Mascot key={c.id} species={c.species} stage={c.stage} color={c.color} float={buddies.length <= 1}
            size={buddies.length <= 1 ? (buddySize || 132) : buddies.length <= 2 ? 96 : buddies.length <= 4 ? 72 : 54}
            wornHat={wornSlugFor(c.worn, OUTFITS, 'hat')} wornClothing={wornSlugFor(c.worn, OUTFITS, 'clothing')} />
        ))}
      </div>

      <RoomPucks pucks={pucks} onPuck={onPuck} onArt={onArt} />
    </div>
  );
}

// ── RoomSlotSheet — one puck, one picker ────────────────────────────
// Each sheet edits only the surface its puck points at, so a child never meets a
// piece that wouldn't land where they just tapped.
function RoomSlotSheet({ slot, onClose, ed }) {
  const { room, theme, draft, editDraft, catalog, ownedDecor, homes, tapChar, tapDecor, inRoom } = ed;
  const hs = HOTSPOTS.find(h => h.slot === slot);

  return (
    // furniture/shelf share one grid layout but not one item count — Shelf's catalogue
    // runs three rows deep, Furniture sometimes just one, and the sheet used to
    // shrink-wrap to whichever you'd tapped. minHeight keeps the two catalogue slots at
    // the same card height either way, so switching between them doesn't visibly resize
    // the sheet out from under you. Wallpaper/flooring/buddy stay shrink-wrapped —
    // their own content shapes are steady enough not to need it.
    <BottomSheet title={L(hs.label)} onClose={onClose} minHeight={(slot === 'furniture' || slot === 'shelf') ? 440 : undefined}>
      {(slot === 'wallpaper' || slot === 'flooring') && (
        <div style={{ display: 'flex', gap: 10 }}>
          {(slot === 'wallpaper' ? theme.wallpapers : theme.floorings).map(t => {
            const on = (slot === 'wallpaper' ? draft.wallpaper : draft.flooring) === t;
            return (
              <button key={t} onClick={() => editDraft({ [slot]: t })} aria-label={L(hs.label)}
                style={{ flex: 1, height: 56, borderRadius: 14, background: t, border: on ? `3px solid ${THEME.brand}` : `1.5px solid ${THEME.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {on && <Icon name="check" size={18} color={THEME.brand} stroke={3} />}
              </button>
            );
          })}
        </div>
      )}

      {slot === 'buddy' && (
        <React.Fragment>
          <div style={{ fontSize: 12, color: THEME.fg2, marginBottom: 10 }}>{inRoom.length}/{room.slots} · {L('Tap to move a buddy in or out.')}</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }} className="no-sb">
            {CHARACTERS.filter(c => c.owned).map(c => {
              const here = homes[c.id] === room.id, elsewhere = homes[c.id] && !here;
              return (
                <button key={c.id} onClick={() => tapChar(c)} style={{ flexShrink: 0, width: 84, border: here ? `2px solid ${THEME.brand}` : '2px solid transparent', borderRadius: 16, background: here ? THEME.brandLight : THEME.surface2, cursor: 'pointer', padding: '10px 4px 8px', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: elsewhere ? 0.55 : 1 }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={52} />
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: here ? THEME.brand : THEME.fg3 }}>
                    {here ? L('Placed') : elsewhere ? L(ROOMS.find(r => r.id === homes[c.id])?.name || '') : L('Not placed')}
                  </span>
                </button>
              );
            })}
          </div>
        </React.Fragment>
      )}

      {/* Both object pucks land here. The room art paints its own shelf and seat, while the
          DECOR table owns plants, saplings and mailboxes — two disjoint sets — so a puck can
          only offer the generic catalogue, split by slot: the shelf takes the things that
          stand on it, the seat takes the furniture. Until each object ships as its own sprite,
          tapping the painted chair means "the furniture list, opened from the chair" — a
          pointer, not a swap. (There used to be a third, 'tv', offering this same furniture
          list from a second dot; the room it pointed at is gone and it was never a distinct
          choice, so it went with the art.) */}
      {(slot === 'furniture' || slot === 'shelf') && (() => {
        const forSlot = catalog.filter(d => slot === 'shelf' ? d.slot === 'object' : d.slot !== 'object');
        if (!forSlot.length) return <div style={{ fontSize: 13, color: THEME.fg2, textAlign: 'center', padding: '18px 0' }}>{L('Nothing for this spot in this room yet.')}</div>;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {forSlot.map(d => {
              const own = ownedDecor[d.id], isOn = !!draft.placed[d.id];
              return (
                <button key={d.id} onClick={() => tapDecor(d)} style={{ background: isOn ? THEME.brandLight : THEME.surface2, border: isOn ? `2px solid ${THEME.brand}` : '2px solid transparent', outline: 'none', borderRadius: 16, padding: '14px 6px 10px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                  {isOn && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
                  <Icon name={d.icon} size={26} color={isOn ? THEME.brand : THEME.fg2} stroke={2.1} />
                  <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{L(d.name)}</div>
                  {own ? <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.success }}>{isOn ? L('Placed') : L('Owned')}</span>
                       : <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><SafePointIcon size={13} />{d.price}</span>}
                </button>
              );
            })}
          </div>
        );
      })()}
    </BottomSheet>
  );
}

export { RoomStage, RoomSlotSheet, useRoomEditing };
