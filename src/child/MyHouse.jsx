// JoanX — child app · MyHouse

import React from 'react';
import { buyItem, CHARACTERS, HOUSE_BGS, MY_GUESTBOOK, PLAYER, ROOMS } from '../core/data.jsx';
import { Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip } from '../core/characters.jsx';
import { ScreenHeader, PointsChip, screenBgActive } from './shared.jsx';
import { GuestbookNote } from './Guestbook.jsx';
import { ROOM_STYLES } from './DecorateRoom.jsx';

const PREVIEW_NOTES = 2;   // My Profile shows a taste; the Guestbook screen holds the rest

// ── My Profile / House (F-32) — the public page friends visit ────────
function MyHouse({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const rooms = ROOMS.filter(r => r.unlocked);
  const owned = CHARACTERS.filter(x => x.owned);
  const [bg, setBg] = React.useState(PLAYER.houseBg);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [likes, setLikes] = React.useState(MY_GUESTBOOK.map(g => g.liked));
  const [toast, setToast] = React.useState(null);
  const bgObj = HOUSE_BGS.find(b => b.id === bg) || HOUSE_BGS[0];

  // A-5.1 — a wallpaper is an item like any other, so it buys through buyItem()
  const chooseBg = (b) => {
    if (!b.owned) {
      const verdict = buyItem(b, PLAYER);
      if (!verdict.ok) { setToast(L('Not enough points yet')); setTimeout(() => setToast(null), 1500); return; }
      setPts(PLAYER.points);
    }
    setBg(b.id); PLAYER.houseBg = b.id;
  };
  const toggleLike = (i) => setLikes(s => s.map((v, j) => j === i ? !v : v));

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('My Profile')} onBack={() => ctx.back()}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{PLAYER.likes}</span></div>} />
      <div style={{ padding: '0 16px' }}>

        {/* hero on chosen background */}
        <div style={{ borderRadius: 24, padding: '18px 16px 20px', background: bgObj.grad, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10.5, fontWeight: 700, color: THEME.fg3, background: 'rgba(255,255,255,.7)', padding: '4px 9px', borderRadius: 999 }}>{L('Friends see this')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{PLAYER.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            {[['star', `Lv ${PLAYER.level}`], ['flame', `${PLAYER.streak}${L('d')}`], ['heart', `${PLAYER.likes}`]].map(([ic, v], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.75)', borderRadius: 999, padding: '5px 11px' }}>
                <Icon name={ic} size={13} color={THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* edit actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[['sparkles', 'Change buddy', () => ctx.nav('collection')], ['paintbrush', 'Decorate rooms', () => ctx.nav('decorate')]].map(([ic, lbl, on], i) => (
            <button key={i} onClick={on} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 16, padding: '13px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Icon name={ic} size={17} color={THEME.primary} stroke={2.3} /><span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{L(lbl)}</span>
            </button>
          ))}
        </div>

        {/* background picker */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 4px 10px' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{L('House background')}</span>
          <PointsChip pts={pts} />
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 18 }} className="no-sb">
          {HOUSE_BGS.map(b => {
            const on = bg === b.id;
            return (
              <button key={b.id} onClick={() => chooseBg(b)} style={{ flexShrink: 0, width: 88, border: on ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent', borderRadius: 16, background: '#fff', boxShadow: THEME.shadowCard, cursor: 'pointer', padding: 6, fontFamily: 'inherit' }}>
                <div style={{ height: 54, borderRadius: 11, background: b.grad, position: 'relative' }}>
                  {!b.owned && <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={16} color={THEME.fg3} stroke={2.4} /></div>}
                  {on && <div style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: 999, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 5 }}>{L(b.name)}</div>
                {!b.owned && <div style={{ fontSize: 10.5, color: THEME.gold, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}><Icon name="star" size={10} color={THEME.gold} fill={THEME.gold} stroke={2} />{b.price}</div>}
              </button>
            );
          })}
        </div>

        {/* my rooms */}
        <SectionHead title={L('My rooms')} />
        {rooms.map(room => {
          const placed = owned.filter(x => x.room === room.id);
          const rs = ROOM_STYLES.find(s => s.id === (room.style || 'cozy')) || ROOM_STYLES[0];
          return (
            <div key={room.id} style={{ borderRadius: 20, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 12 }}>
             <div style={{ padding: '16px 14px 12px', background: rs.wall(room.theme) }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800 }}>{L(room.name)}</span>
                <button onClick={() => ctx.nav('decorate', { roomId: room.id })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', border: 'none', borderRadius: 999, padding: '6px 12px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: THEME.primary }}>
                  <Icon name="paintbrush" size={13} color={THEME.primary} stroke={2.3} />{L('Decorate')}
                </button>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {Array.from({ length: room.slots }).map((_, i) => placed[i] ? (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Mascot species={placed[i].species} stage={placed[i].stage} color={placed[i].color} size={56} /><div style={{ fontSize: 11, fontWeight: 700, marginTop: 2 }}>{placed[i].name}</div></div>
                ) : (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 78 }}><div style={{ width: 42, height: 42, borderRadius: 14, border: `2px dashed ${THEME.border}` }} /></div>
                ))}
              </div>
             </div>
             {/* floor band — reflects the saved room style */}
             <div style={{ height: 16, background: rs.floor, borderTop: `2px solid ${rs.accent}` }} />
            </div>
          );
        })}

        {/* Guestbook — a preview only. The full list is its own screen now (reached from the
            "me" card on Friends); rendering the rows from the shared GuestbookNote keeps the
            two surfaces from drifting apart. */}
        <SectionHead title={L('Guestbook')} action={MY_GUESTBOOK.length > PREVIEW_NOTES ? L('See all') : null} onAction={() => ctx.nav('guestbook')} />
        <div style={{ fontSize: 12, color: THEME.fg2, margin: '-6px 4px 10px' }}>{L('Notes your friends left when they visited.')}</div>
        {MY_GUESTBOOK.slice(0, PREVIEW_NOTES).map((g, i) => (
          <GuestbookNote key={i} note={g} liked={likes[i]} onLike={() => toggleLike(i)} />
        ))}
        {MY_GUESTBOOK.length > PREVIEW_NOTES && (
          <button onClick={() => ctx.nav('guestbook')} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.surface2, color: THEME.fg2, fontWeight: 800, fontSize: 13, padding: '12px', borderRadius: 14 }}>
            {L('See all')} · {MY_GUESTBOOK.length}
          </button>
        )}
      </div>

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

export { MyHouse };
