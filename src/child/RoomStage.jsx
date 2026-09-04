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
import { createPortal } from 'react-dom';
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

  // the room canvas's own element — a catalogue item dragged out of its sheet is
  // "placed" by landing a pointer inside this box, so the drag needs the box's live
  // screen position (getBoundingClientRect), not just its React props
  const stageRef = React.useRef(null);

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
  // A placed entry is `true` (default spot for its slot — see DEFAULT_DECOR_POS in
  // RoomStage) or `{x,y}` (percent of the room canvas — where a drag dropped it).
  // Both read as "placed" (`!!draft.placed[d.id]`), so nothing that only checks
  // on/off — the sheet's checkmark, `placedDecor` — had to change for freeform to work.
  // shared by both gestures: a tap toggles (see tapDecor below) at the slot's default
  // spot, a drag only ever sets the item down at the point it was dropped (dragging an
  // already-placed item back onto the room isn't a "take it back" gesture — that's
  // still a tap, same as everywhere else in the app).
  const setPlaced = (d, on, pos) => {
    if (on && !ownedDecor[d.id]) {
      const verdict = buyItem(d, PLAYER);
      if (!verdict.ok) { say(L(verdict.reason === 'level' ? 'Unlocks at Lv' : 'Not enough points yet')); return; }
      sfx.purchase();   // same cue Shop's egg purchase plays — spending points gets a sound either place
      setPts(PLAYER.points); setOwnedDecor(o => ({ ...o, [d.id]: true }));
    }
    const nextPlaced = { ...draft.placed };
    if (on) catalog.forEach(item => { if (item.slot === d.slot) nextPlaced[item.id] = false; });
    nextPlaced[d.id] = on ? (pos || true) : false;
    editDraft({ placed: nextPlaced });
  };
  const tapDecor = (d) => setPlaced(d, !draft.placed[d.id]);

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

  return { room, theme, draft, drafts, editDraft, pts, ownedDecor, homes, tapChar, tapDecor, setPlaced,
           catalog, inRoom, placedDecor, stageRef, toast, say, save: () => commit() };
}

// Each entry is one button in RoomPucks' fixed right-edge column, top to bottom in
// this array's own order — there's no per-room aiming any more (see RoomPuckStyles.jsx),
// so the order here is the only layout decision left to make.
// `catalogSlot` — the DECOR `.slot` value this button's picker filters the catalogue by,
// and also what gates the button's very presence: `pucks` below drops any entry whose
// room has nothing in that slot, so Green/Town don't grow four buttons for a moodboard
// set only Dream has pieces for. Slot and catalogSlot used to be the same two strings
// (`shelf` button showing `object`-slot rows, `furniture` button showing
// `furniture`-slot rows); kept separate so a button can point at a DECOR slot with a
// different name (the moodboard set below) without the picker logic caring which.
const HOTSPOTS = [
  { slot: 'wallpaper', icon: 'paint-roller', label: 'Wallpaper' },
  // The only way to the object catalogue — plants, lanterns, the small things that
  // stand ON furniture rather than being it.
  { slot: 'shelf',     icon: 'sprout',       label: 'Shelf',     catalogSlot: 'object' },
  { slot: 'furniture', icon: 'armchair',     label: 'Furniture', catalogSlot: 'furniture' },
  { slot: 'buddy',     icon: 'paw-print',    label: 'Buddies' },
  { slot: 'flooring',  icon: 'grid-3x3',     label: 'Flooring' },

  // ── Dream Room moodboard set — each on its own DECOR slot (see data.jsx) so all
  // four can be placed at once instead of bumping the shelf/furniture buttons above
  // off their own pieces.
  { slot: 'ornament', icon: 'moon-star', label: 'Ornaments', catalogSlot: 'ornament' },
  { slot: 'cabinet',  icon: 'archive',   label: 'Cabinet',   catalogSlot: 'cabinet' },
  { slot: 'armchair', icon: 'armchair',  label: 'Armchair',  catalogSlot: 'armchair' },
  { slot: 'rug',      icon: 'square',    label: 'Rug',       catalogSlot: 'rug' },
];

// Where a placed item sits when nobody's dragged it there — an object (shelf item)
// starts up near where a shelf usually stands, a furniture piece down on the floor.
// Percent of the room canvas, same coordinate space a drag drop writes into draft.placed.
// Moodboard-set defaults land near their puck's `aim` above rather than sharing the
// generic object/furniture spot, since all four can be on screen together.
const DEFAULT_DECOR_POS = {
  object: { x: 50, y: 22 }, furniture: { x: 50, y: 78 },
  ornament: { x: 27, y: 24 }, cabinet: { x: 20, y: 60 }, armchair: { x: 72, y: 62 }, rug: { x: 50, y: 82 },
};

// Real illustrated art (an `img`, not a lucide glyph) renders at its own footprint per
// slot rather than the small icon-badge size — a rug drawn as a 30px glyph is illegible.
// Height is the driving dimension (`width: auto`) so a wide piece (the rug) and a tall
// one (the armchair) both read at a natural scale without stretching.
const DECOR_IMG_SIZE = { rug: 130, armchair: 150, cabinet: 130, ornament: 90 };

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
// `extraPucks` — buttons a host bolts onto the same right-edge column that don't come
// from HOTSPOTS at all (the profile's "change featured buddy" puck below `PLAYER.activeCharId`
// is not a room-occupancy slot — that's the existing 'buddy' hotspot, a different concept —
// so it can't just un-hide 'buddy' without picking up that sheet's semantics). Prepended
// ahead of the room's own pucks since it's the one action every hotspot room shares.
// `puckOpacity` — the right-edge column fades to match a sheet being dragged
// toward dismissal (see BottomSheet's onDragProgress in RoomSlotSheet below);
// callers with no sheet drag to report just leave it at the default 1.
// `selectedId` — the placed piece a child just dropped (see RoomSlotSheet's onSelect)
// gets a green ring in place, the same colour the drag ghost carries the whole way
// out of the sheet, so "this is the one you're working on" reads continuously across
// pick-up, carry and landing instead of stopping the moment it's set down.
function RoomStage({ theme, draft, buddies, placedDecor, catalog = [], onPuck = () => {}, activeSlot, hidePucks = [], extraPucks = [], height = 340, radius = 22, backdrop = true, buddySize, floorLine = '24%', interactive = true, stageRef, puckOpacity = 1, selectedId = null }) {
  // A room drawn as one illustration has no repaintable wall or floor, so those two pucks
  // would open a picker whose effect nobody can see. They come back the day the art ships
  // as separate wall/floor layers — which is what A-7's wallpaper and flooring really need.
  // A puck with its own `catalogSlot` (the moodboard set) only shows once this room's
  // catalogue actually has something in it — Green/Town don't carry Rug or Cabinet yet,
  // so those pucks remain a Dream Room thing without a room-by-room allowlist to maintain.
  // `hidePucks` drops specific slots for callers that don't want them at all — the profile
  // hero has no room-occupancy concept (see MyHouse), so it hides 'buddy' rather than
  // wiring it to a picker.
  const pucks = interactive ? [...extraPucks, ...HOTSPOTS.filter(h => {
    if (hidePucks.includes(h.slot)) return false;
    if (theme.bg && (h.slot === 'wallpaper' || h.slot === 'flooring')) return false;
    if (h.catalogSlot && !catalog.some(d => d.slot === h.catalogSlot)) return false;
    return true;
  })] : [];

  return (
    <div ref={stageRef} style={{ position: 'relative', height, borderRadius: radius, overflow: backdrop ? 'hidden' : 'visible' }}>
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

      {/* each piece sits at wherever it was dropped (a drag writes {x,y} into
          draft.placed) or, tapped on rather than dragged, at its slot's default spot —
          see DEFAULT_DECOR_POS. Both are percent of this box, so free placement scales
          with whatever size the room is drawn at (Decorate's card vs. the profile's
          full-bleed hero). */}
      {placedDecor.map(d => {
        const raw = draft.placed[d.id];
        const isObject = d.slot === 'object';
        const pos = (raw && typeof raw === 'object') ? raw : (DEFAULT_DECOR_POS[d.slot] || DEFAULT_DECOR_POS[isObject ? 'object' : 'furniture']);
        // Finished art (`img`) renders at the real illustration's own footprint — see
        // DECOR_IMG_SIZE — instead of the small icon-badge treatment icon-only rows
        // (Green/Town's tent, bench, busstop, ...) still get below.
        const imgSize = DECOR_IMG_SIZE[d.slot];
        const selected = d.id === selectedId;
        return (
          <div key={d.id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%,-50%)', borderRadius: 14, boxShadow: selected ? `0 0 0 3px ${THEME.success}, 0 0 16px 3px rgba(75,129,79,.4)` : 'none', transition: 'box-shadow .2s ease' }}>
            {d.img ? (
              <img src={d.img} alt={L(d.name)} style={{ height: imgSize, width: 'auto', maxWidth: 'none', display: 'block', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.25))' }} />
            ) : isObject ? (
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,.7)', border: `2px solid ${theme.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={d.icon} size={22} color={THEME.fg2} stroke={2.1} />
              </div>
            ) : (
              <Icon name={d.icon} size={30} color={THEME.fg2} stroke={2.1} />
            )}
          </div>
        );
      })}

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

      <RoomPucks pucks={pucks} onPuck={onPuck} activeSlot={activeSlot} opacity={puckOpacity} />
    </div>
  );
}

// ── useDecorDrag — drag a shelf/furniture item out of its sheet and drop it on the
// room to place it. A plain tap still toggles (see tapDecor) — this only decides
// whether a *pointer that moved* landed inside the room's own box (ed.stageRef) when
// it lifted. Dropped outside the room, or outside the sheet without moving far,
// cancels rather than guessing at intent. `onDropped(d)` fires only on that
// successful-drag-lands-in-the-room case — a plain tap doesn't need a confirm step,
// it already has one (tap the same tile again to take it back), but freehand placement
// just moved something to an arbitrary spot with no undo in sight, so the caller uses
// this to show one.
function useDecorDrag(ed, onDropped) {
  const [drag, setDrag] = React.useState(null);   // { d, x, y, over }
  const movedRef = React.useRef(false);
  const startRef = React.useRef({ x: 0, y: 0 });

  // null outside the room; inside, the drop point as a percent of the room box —
  // the same {x,y} shape draft.placed stores, clamped off the very edge so a piece
  // dropped against the wall still shows whole rather than clipping out of the art.
  const stagePos = (x, y) => {
    const box = ed.stageRef.current;
    if (!box) return null;
    const r = box.getBoundingClientRect();
    if (x < r.left || x > r.right || y < r.top || y > r.bottom) return null;
    return {
      x: Math.min(94, Math.max(6, ((x - r.left) / r.width) * 100)),
      y: Math.min(90, Math.max(8, ((y - r.top) / r.height) * 100)),
    };
  };

  const onDown = (e, d) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    movedRef.current = false;
    setDrag({ d, x: e.clientX, y: e.clientY, over: false });
  };

  React.useEffect(() => {
    if (!drag) return;
    const onMove = (e) => {
      if (!movedRef.current && Math.hypot(e.clientX - startRef.current.x, e.clientY - startRef.current.y) > 6) movedRef.current = true;
      setDrag(g => g && { ...g, x: e.clientX, y: e.clientY, over: !!stagePos(e.clientX, e.clientY) });
    };
    const onUp = (e) => {
      if (movedRef.current) {
        const pos = stagePos(e.clientX, e.clientY);
        if (pos) { ed.setPlaced(drag.d, true, pos); onDropped && onDropped(drag.d); }
      } else ed.tapDecor(drag.d);
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag && drag.d]);

  return { drag, onDown };
}

// ── CatalogTile — the card shape every "pick one" grid sheet uses: a rounded tile,
// a green checkmark badge when it's the one in effect, a status line underneath
// saying why (owned-but-not-placed, placed, or a price if you don't own it yet).
// Shared by the room's own catalogue pickers below (isCatalog) and the profile's
// buddy-switch sheet (MyHouse) so a "pick one of these" moment looks and behaves
// the same everywhere it shows up, not just similar.
function CatalogTile({ img, icon, name, on, status, statusColor, onClick, onPointerDown, dimmed }) {
  return (
    <button onClick={onClick} onPointerDown={onPointerDown} style={{ background: on ? THEME.brandLight : THEME.surface2, border: on ? `2px solid ${THEME.brand}` : '2px solid transparent', outline: 'none', borderRadius: 16, padding: '14px 6px 10px', cursor: onPointerDown ? 'grab' : 'pointer', touchAction: onPointerDown ? 'none' : 'auto', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative', opacity: dimmed ? 0.4 : 1 }}>
      {on && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
      {img ? <img src={img} alt="" style={{ width: 48, height: 48, objectFit: 'contain' }} /> : icon}
      <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{name}</div>
      <span style={{ fontSize: 10.5, fontWeight: 800, color: statusColor, display: 'inline-flex', alignItems: 'center', gap: 2 }}>{status}</span>
    </button>
  );
}

// ── RoomSlotSheet — one puck, one picker ────────────────────────────
// Each sheet edits only the surface its puck points at, so a child never meets a
// piece that wouldn't land where they just tapped.
function RoomSlotSheet({ slot, onClose, ed, onDragProgress, onSelect }) {
  const { room, theme, draft, editDraft, catalog, ownedDecor, homes, tapChar, inRoom } = ed;
  const hs = HOTSPOTS.find(h => h.slot === slot);
  const isCatalog = !!hs.catalogSlot;
  // Rows this particular slot's catalogue actually needs (3 tiles per row), so a
  // single-item slot (Ornament, Cabinet, ...) gets a sheet sized to fit it instead of
  // the tall card a many-item slot (Shelf) needs — see minHeight below.
  const catalogRows = isCatalog ? Math.ceil(catalog.filter(d => d.slot === hs.catalogSlot).length / 3) : 0;

  // The piece a drag just dropped into the room — not a tap-placed one, and not
  // whatever was already sitting there before this sheet opened. A drop is a bigger
  // commitment than a tap (it chose WHERE, not just on/off), so it earns a moment to
  // confirm or take back before the confirmation goes away. Cleared on slot change so
  // switching categories doesn't leave a stale confirm bar pointing at last sheet's item.
  const [justDropped, setJustDropped] = React.useState(null);
  React.useEffect(() => { setJustDropped(null); }, [slot]);
  const { drag, onDown } = useDecorDrag(ed, setJustDropped);

  // Same "fade the right-edge column" channel the sheet's own drag-to-dismiss drives
  // (see BottomSheet/onDragProgress) — a catalogue item being carried out onto the
  // room is a second, unrelated reason to want both the sheet and the puck column out
  // of the way, so it drives the same signal rather than inventing a parallel one.
  React.useEffect(() => { if (onDragProgress) onDragProgress(drag ? 1 : 0); }, [!!drag]);   // eslint-disable-line react-hooks/exhaustive-deps
  // The just-placed piece is also "the selected one" — RoomStage draws a green ring
  // around whichever placed item matches this id (see `selectedId` there), so a child
  // dragging a piece out gets the same "yes, this is the one you're moving" read once
  // it lands as the confirm bar already gives with its check/delete pair.
  React.useEffect(() => { if (onSelect) onSelect(justDropped ? justDropped.id : null); }, [justDropped]);   // eslint-disable-line react-hooks/exhaustive-deps

  // The drag ghost and the room highlight ring below are portalled straight to
  // document.body, not rendered in place. The whole app lives inside a `transform:
  // scale(...)` phone-mockup wrapper (shell/App.jsx) — CSS makes ANY transformed
  // ancestor the containing block for a `position: fixed` descendant, so without the
  // portal, `left`/`top` would resolve against that scaled wrapper's own box instead
  // of the real viewport, landing the ghost somewhere other than the pointer (often
  // clipped out entirely). Escaping to body is what makes drag.x/y (raw
  // e.clientX/clientY) and stageRef's getBoundingClientRect() — both already
  // viewport-accurate — line up with where things actually paint.
  return (
    <React.Fragment>
    {/* Catalogue sheets size to their own row count (catalogRows above) rather than one
        shared figure — Shelf's handful of items run three rows deep, but most of the
        moodboard slots (Ornament, Cabinet, Armchair, Rug) hold exactly one tile today,
        and forcing those to the same tall card left most of the sheet empty. An empty
        catalogue (0 rows) shrink-wraps to its "nothing here yet" line, same as
        wallpaper/flooring below, which stay shrink-wrapped either way.
        scrim off for the catalogue sheets AND buddy — dragging a piece onto the room, or
        checking who's already standing in it, means the room has to read at full
        brightness while the sheet is open, not dimmed the way a plain picker's backdrop
        dims. */}
    <BottomSheet title={L(hs.label)} onClose={onClose} minHeight={catalogRows > 0 ? Math.min(560, catalogRows * 150 + 230) : undefined} scrim={!isCatalog && slot !== 'buddy'} onDragProgress={onDragProgress} pulledAway={!!drag}>
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
      {isCatalog && (() => {
        const forSlot = catalog.filter(d => d.slot === hs.catalogSlot);
        if (!forSlot.length) return <div style={{ fontSize: 13, color: THEME.fg2, textAlign: 'center', padding: '18px 0' }}>{L('Nothing for this spot in this room yet.')}</div>;
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {forSlot.map(d => {
              const own = ownedDecor[d.id], isOn = !!draft.placed[d.id];
              const beingDragged = drag && drag.d.id === d.id;
              return (
                <CatalogTile key={d.id} onPointerDown={(e) => onDown(e, d)} dimmed={beingDragged} on={isOn}
                  img={d.img} icon={!d.img && <Icon name={d.icon} size={26} color={isOn ? THEME.brand : THEME.fg2} stroke={2.1} />}
                  name={L(d.name)} statusColor={own ? THEME.success : THEME.gold}
                  status={own ? (isOn ? L('Placed') : L('Owned')) : <React.Fragment><SafePointIcon size={13} />{d.price}</React.Fragment>} />
              );
            })}
          </div>
        );
      })()}

    </BottomSheet>

    {/* the drag itself — a ghost card that tracks the pointer. Green the whole time it's
        airborne (this is the piece you're moving — same colour the room highlights it
        with once it lands, see RoomStage's `selectedId`), thickening once it's over the
        room so that alone also carries the separate "this will land here" feedback.
        Portalled to document.body (see the comment above) so position:fixed is truly
        viewport-fixed. */}
    {drag && createPortal(
      <div style={{ position: 'fixed', left: drag.x, top: drag.y, transform: 'translate(-50%,-50%)', zIndex: 100, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 14px', borderRadius: 16, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,.28)', border: `${drag.over ? 3 : 2}px solid ${THEME.success}` }}>
        {drag.d.img ? <img src={drag.d.img} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                    : <Icon name={drag.d.icon} size={24} color={THEME.brand} stroke={2.1} />}
        <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg1, whiteSpace: 'nowrap' }}>{L(drag.d.name)}</span>
      </div>,
      document.body
    )}

    {/* the just-dropped confirm bar — Done keeps it exactly where it landed (already
        saved; setPlaced wrote it the moment the drag ended), Delete takes it back off
        the room. Sits near the room's own bottom edge, not the dropped item's exact
        spot: a piece dropped near the top of the room would otherwise push this bar up
        past where a thumb can reach it, and the room only ever holds the one thing this
        sheet is currently about, so "the room" is unambiguous enough to point at. Guards
        on `draft.placed[justDropped.id]` so it can't outlive the placement it's about —
        tapping the same tile off elsewhere in the sheet, or opening a fresh drag, both
        make the bar disappear rather than confirm/delete something no longer there. */}
    {justDropped && !drag && !!draft.placed[justDropped.id] && ed.stageRef.current && (() => {
      const r = ed.stageRef.current.getBoundingClientRect();
      return createPortal(
        <div style={{ position: 'fixed', left: r.left + r.width / 2, top: r.bottom - 66, transform: 'translateX(-50%)', zIndex: 97, display: 'flex', alignItems: 'center', gap: 8, padding: 6, borderRadius: 999, background: '#fff', boxShadow: '0 8px 22px rgba(0,0,0,.28)' }}>
          <button onClick={() => setJustDropped(null)} aria-label={L('Done')}
            style={{ width: 40, height: 40, borderRadius: 999, border: 'none', cursor: 'pointer', background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={19} color="#fff" stroke={2.8} />
          </button>
          <button onClick={() => { ed.setPlaced(justDropped, false); setJustDropped(null); }} aria-label={L('Delete')}
            style={{ width: 40, height: 40, borderRadius: 999, border: 'none', cursor: 'pointer', background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash-2" size={18} color={THEME.danger} stroke={2.3} />
          </button>
        </div>,
        document.body
      );
    })()}
    </React.Fragment>
  );
}

export { RoomStage, RoomSlotSheet, useRoomEditing, CatalogTile };
