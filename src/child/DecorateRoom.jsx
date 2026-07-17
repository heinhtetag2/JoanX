// JoanX — child app · DecorateRoom

import React from 'react';
import { CHARACTERS, ROOMS, themeOf } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { ScreenHeader, PointsChip, screenBgActive } from './shared.jsx';
import { RoomSlotSheet, RoomStage, useRoomEditing } from './RoomStage.jsx';

// ── Room decoration (A-6 / A-7 / A-12) ───────────────────────────────
// One screen, three rooms. Picking a room switches the whole environment — wall,
// floor, wallpaper palette AND the decor catalogue — because a room theme owns its
// own set of items (ROOM_THEMES / DECOR.rooms in core/data).
//
// The editing state lives in useRoomEditing (see RoomStage.jsx), shared with the
// profile hero so both surfaces edit one room the same way.
//
// `editor` is the way IN, not the thing being edited — both variants read and write
// the same drafts, so switching one in Tweaks never changes what a saved room is:
//   'grid'    — the preview is a picture; you edit from lists below it
//   'hotspot' — the preview IS the editor; every surface is its own tap target
function DecorateRoom({ ctx, editor = 'grid' }) {
  const hot = editor === 'hotspot';
  const [sheet, setSheet] = React.useState(null);   // which hotspot's picker is open
  const rooms = ROOMS.filter(r => r.unlocked);
  const [roomId, setRoomId] = React.useState(
    rooms.some(r => r.id === ctx.params?.roomId) ? ctx.params.roomId : rooms[0].id);

  const ed = useRoomEditing(rooms, roomId);
  const { room, theme, draft, editDraft, pts, ownedDecor, homes, tapChar, tapDecor,
          catalog, inRoom, placedDecor, toast } = ed;

  const save = () => { ed.save(); ctx.nav('myhouse'); };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Decorate')} onBack={() => ctx.nav('myhouse')} right={<PointsChip pts={pts} />} />
      <div style={{ padding: '0 16px' }}>

        {/* room tabs — each tab is a whole theme, not a colour swatch */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          {rooms.map(r => {
            const t = themeOf(r), on = roomId === r.id;
            return (
              <button key={r.id} onClick={() => setRoomId(r.id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '10px 6px', fontSize: 12.5, fontWeight: 800, background: on ? THEME.primary : '#fff', color: on ? '#fff' : THEME.fg2, boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Icon name={t.icon} size={16} color={on ? '#fff' : THEME.fg2} stroke={2.2} />
                {L(r.name)}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: THEME.fg2, textAlign: 'center', margin: '0 0 12px' }}>{L(theme.blurb)}</div>

        {/* ── hotspot editor — the room IS the interface ─────────────────
            A tall room drawn from the same theme surfaces, with a puck parked next to
            each thing it changes. Nothing to scroll to: what you can change is exactly
            what you can see. */}
        {hot && (
          <React.Fragment>
            <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 12 }}>
              <RoomStage theme={theme} draft={draft} buddies={inRoom} placedDecor={placedDecor} onPuck={setSheet} />
            </div>
            <div style={{ fontSize: 12, color: THEME.fg2, textAlign: 'center', margin: '0 0 16px' }}>{L('Tap anything in the room to change it.')}</div>
            <Button variant="primary" fullWidth icon="check" onClick={save}>{L('Save room')}</Button>
          </React.Fragment>
        )}

        {/* live preview — the room itself: wall, the buddies who live here, the floor
            they stand on, and the items placed around them */}
        {!hot && (<React.Fragment>
        <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ position: 'relative', padding: '18px 14px 0', background: theme.wall(draft.wallpaper), textAlign: 'center' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-end', gap: 4, minHeight: 118 }}>
              {inRoom.length ? inRoom.map(c => {
                // a full room can hold ROOM_CAPACITY buddies — scale the mascot down as the
                // room fills so ten still fit (wrapping to a second shelf) instead of overflowing
                const size = inRoom.length <= 2 ? 104 : inRoom.length <= 4 ? 78 : inRoom.length <= 6 ? 58 : 46;
                return (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{c.name}</div>
                </div>
                );
              }) : (
                <span style={{ fontSize: 12, color: THEME.fg3, alignSelf: 'center' }}>{L('Add a buddy and some decorations below')}</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, minHeight: 26, marginTop: 4, marginBottom: 10 }}>
              {placedDecor.map(d => (
                <Icon key={d.id} name={d.icon} size={22} color={THEME.fg2} stroke={2.1} />
              ))}
            </div>
          </div>
          {/* floor — part of the theme, so it changes with the room */}
          <div style={{ height: 30, background: theme.floor(draft.flooring), borderTop: `2px solid ${theme.accent}` }} />
        </div>

        {/* wallpaper — the palette belongs to the theme, so a Town wallpaper can't
            end up on a Dream wall */}
        <SectionHead title={L('Wallpaper')} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {theme.wallpapers.map(t => (
            <button key={t} onClick={() => editDraft({ wallpaper: t })} aria-label={L('Wallpaper')} style={{ flex: 1, height: 46, borderRadius: 14, background: t, border: draft.wallpaper === t ? `3px solid ${THEME.primary}` : `1.5px solid ${THEME.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {draft.wallpaper === t && <Icon name="check" size={18} color={THEME.primary} stroke={3} />}
            </button>
          ))}
        </div>

        {/* who lives here (A-6 free placement) */}
        <SectionHead title={L('Buddies in this room')} />
        <div style={{ fontSize: 12, color: THEME.fg2, margin: '-6px 4px 10px' }}>
          {inRoom.length}/{room.slots} · {L('Tap to move a buddy in or out.')}
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 18 }} className="no-sb">
          {CHARACTERS.filter(c => c.owned).map(c => {
            const here = homes[c.id] === roomId;
            const elsewhere = homes[c.id] && !here;
            return (
              <button key={c.id} onClick={() => tapChar(c)} style={{ flexShrink: 0, width: 84, border: here ? `2px solid ${THEME.primary}` : '2px solid transparent', borderRadius: 16, background: here ? THEME.primaryLight : '#fff', boxShadow: THEME.shadowCard, cursor: 'pointer', padding: '10px 4px 8px', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, opacity: elsewhere ? 0.55 : 1 }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={52} />
                <div style={{ fontSize: 12, fontWeight: 700 }}>{c.name}</div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: here ? THEME.primary : THEME.fg3 }}>
                  {here ? L('Placed') : elsewhere ? L(ROOMS.find(r => r.id === homes[c.id])?.name || '') : L('Not placed')}
                </span>
              </button>
            );
          })}
        </div>

        {/* decor catalogue — this room's own set, plus the pieces that fit anywhere */}
        <SectionHead title={L('Decorations')} />
        <div style={{ fontSize: 12, color: THEME.fg2, margin: '-6px 4px 10px' }}>{L(room.name)} · {catalog.length} {L('items')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {catalog.map(d => {
            const own = ownedDecor[d.id], isOn = !!draft.placed[d.id];
            return (
              <button key={d.id} onClick={() => tapDecor(d)} style={{ background: isOn ? THEME.primaryLight : '#fff', border: isOn ? `2px solid ${THEME.primary}` : '2px solid transparent', borderRadius: 16, padding: '14px 6px 10px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                {isOn && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
                <Icon name={d.icon} size={26} color={isOn ? THEME.primary : THEME.fg2} stroke={2.1} />
                <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{L(d.name)}</div>
                {own ? <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.success }}>{isOn ? L('Placed') : L('Owned')}</span>
                     : <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><Icon name="star" size={10} color={THEME.gold} fill={THEME.gold} stroke={2} />{d.price}</span>}
              </button>
            );
          })}
        </div>

        <Button variant="primary" fullWidth icon="check" onClick={save}>{L('Save room')}</Button>
        </React.Fragment>)}
      </div>

      {sheet && <RoomSlotSheet slot={sheet} onClose={() => setSheet(null)} ed={ed} />}

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

export { DecorateRoom };
