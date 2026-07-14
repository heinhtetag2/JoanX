// JoanX — child app · DecorateRoom

import React from 'react';
import { buyItem, CHARACTERS, DECOR, PLAYER, ROOMS } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, PointsChip, screenBgActive } from './shared.jsx';

// Room styles (A-12) — three full looks for a room, each with its own wall
// treatment + floor, tinted by the chosen wallpaper colour. More than a flat
// background: the whole room re-skins when you switch.
const ROOM_STYLES = [
  { id: 'cozy', name: 'Cozy', icon: 'flame',
    wall: t => `linear-gradient(180deg, ${t} 0%, ${shade(t, 10)} 100%)`,
    floor: 'linear-gradient(180deg,#e8d7bf,#dcc7a8)', accent: '#c9a26a' },
  { id: 'modern', name: 'Modern', icon: 'square-dashed',
    wall: t => `linear-gradient(180deg, ${shade(t, -5)} 0%, #fbfbfc 100%)`,
    floor: 'linear-gradient(180deg,#e6e9ee,#d3d8e0)', accent: '#aeb6c2' },
  { id: 'playful', name: 'Playful', icon: 'sparkles',
    wall: t => `radial-gradient(circle at 16% 20%, rgba(255,255,255,.7) 0 7px, transparent 8px) 0 0/32px 32px, linear-gradient(180deg, ${t} 0%, ${shade(t, 8)} 100%)`,
    floor: 'linear-gradient(180deg,#ffd9ea,#ffc4dd)', accent: '#ff9ec4' },
];

// ── Room decoration (A-7) — style + theme + placeable ornaments ──────
function DecorateRoom({ ctx }) {
  const rooms = ROOMS.filter(r => r.unlocked);
  const [roomId, setRoomId] = React.useState(ctx.params?.roomId || rooms[0].id);
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const THEMES = ['#ecf3fe', '#ebf4f4', '#f5f1fd', '#f9f1ed', '#fdeef5', '#e9f4f5'];
  const [theme, setTheme] = React.useState(room.theme);
  const [styleId, setStyleId] = React.useState(room.style || 'cozy');
  const roomStyle = ROOM_STYLES.find(s => s.id === styleId) || ROOM_STYLES[0];
  const [pts, setPts] = React.useState(PLAYER.points);
  const [ownedDecor, setOwnedDecor] = React.useState(Object.fromEntries(DECOR.map(d => [d.id, d.owned])));
  const [placed, setPlaced] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const pickRoom = (r) => { setRoomId(r.id); setTheme(r.theme); setStyleId(r.style || 'cozy'); setPlaced({}); };
  // A-5.1 — buying goes through buyItem() so the points check, the level gate and the
  // ownership write are the same here as on every other item surface.
  const tapDecor = (d) => {
    if (!ownedDecor[d.id]) {
      const verdict = buyItem(d, PLAYER);
      if (!verdict.ok) { say(L(verdict.reason === 'level' ? 'Unlocks at Lv' : 'Not enough points yet')); return; }
      setPts(PLAYER.points); setOwnedDecor(o => ({ ...o, [d.id]: true }));
      setPlaced(p => ({ ...p, [d.id]: true })); return;
    }
    setPlaced(p => ({ ...p, [d.id]: !p[d.id] }));
  };
  const save = () => { room.theme = theme; room.style = styleId; ctx.nav('myhouse'); };
  const placedList = DECOR.filter(d => placed[d.id]);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Decorate')} onBack={() => ctx.nav('myhouse')} right={<PointsChip pts={pts} />} />
      <div style={{ padding: '0 16px' }}>

        {/* room tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {rooms.map(r => (
            <button key={r.id} onClick={() => pickRoom(r)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '10px 8px', fontSize: 13, fontWeight: 800, background: roomId === r.id ? THEME.primary : '#fff', color: roomId === r.id ? '#fff' : THEME.fg2, boxShadow: THEME.shadowCard }}>{L(r.name)}</button>
          ))}
        </div>

        {/* live preview — wall (styled) + floor band, re-skins with the room style */}
        <div style={{ borderRadius: 22, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ position: 'relative', padding: '22px 16px 0', background: roomStyle.wall(theme), textAlign: 'center' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={120} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, minHeight: 30, marginTop: 4, marginBottom: 12 }}>
              {placedList.length ? placedList.map(d => (
                <div key={d.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><Icon name={d.icon} size={22} color={THEME.fg2} stroke={2.1} /></div>
              )) : <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Add some decorations below')}</span>}
            </div>
          </div>
          {/* floor */}
          <div style={{ height: 30, background: roomStyle.floor, borderTop: `2px solid ${roomStyle.accent}` }} />
        </div>

        {/* room style (A-12) — three full looks, tinted by the wallpaper */}
        <SectionHead title={L('Room style')} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {ROOM_STYLES.map(s => {
            const on = styleId === s.id;
            return (
              <button key={s.id} onClick={() => setStyleId(s.id)} style={{ flex: 1, border: on ? `2px solid ${THEME.primary}` : '2px solid transparent', borderRadius: 16, padding: '8px 6px 9px', background: '#fff', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                {/* mini room swatch: wall + floor */}
                <div style={{ width: '100%', height: 38, borderRadius: 9, overflow: 'hidden', background: s.wall(theme), display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <div style={{ height: 10, background: s.floor, borderTop: `1.5px solid ${s.accent}` }} />
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: on ? THEME.primary : THEME.fg1 }}>
                  <Icon name={s.icon} size={12} color={on ? THEME.primary : THEME.fg2} stroke={2.3} />{L(s.name)}
                </span>
              </button>
            );
          })}
        </div>

        {/* wallpaper / theme */}
        <SectionHead title={L('Wallpaper')} />
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {THEMES.map(t => (
            <button key={t} onClick={() => setTheme(t)} aria-label={L('Wallpaper')} style={{ flex: 1, height: 46, borderRadius: 14, background: t, border: theme === t ? `3px solid ${THEME.primary}` : `1.5px solid ${THEME.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === t && <Icon name="check" size={18} color={THEME.primary} stroke={3} />}
            </button>
          ))}
        </div>

        {/* decor catalog */}
        <SectionHead title={L('Decorations')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {DECOR.map(d => {
            const own = ownedDecor[d.id], isOn = placed[d.id];
            return (
              <button key={d.id} onClick={() => tapDecor(d)} style={{ background: isOn ? THEME.primaryLight : '#fff', border: isOn ? `2px solid ${THEME.primary}` : '2px solid transparent', borderRadius: 16, padding: '14px 6px 10px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, position: 'relative' }}>
                {isOn && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
                <Icon name={d.icon} size={26} color={isOn ? THEME.primary : THEME.fg2} stroke={2.1} />
                <div style={{ fontSize: 12, fontWeight: 700 }}>{L(d.name)}</div>
                {own ? <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.success }}>{isOn ? L('Placed') : L('Owned')}</span>
                     : <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><Icon name="star" size={10} color={THEME.gold} fill={THEME.gold} stroke={2} />{d.price}</span>}
              </button>
            );
          })}
        </div>

        <Button variant="primary" fullWidth icon="check" onClick={save}>{L('Save room')}</Button>
      </div>

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

export { DecorateRoom, ROOM_STYLES };
