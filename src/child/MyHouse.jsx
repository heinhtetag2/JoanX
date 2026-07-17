// JoanX — child app · MyHouse

import React from 'react';
import { CHARACTERS, DECOR, HOUSE_BGS, PLAYER, ROOMS, SCENES, themeOf } from '../core/data.jsx';
import { BottomSheet, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';
import { RoomSlotSheet, RoomStage, useRoomEditing } from './RoomStage.jsx';

// A themed room can render two ways: 'theme' (flat wallpaper + floor band) or
// 'scene' (a real photo backdrop with the buddy standing in front of it). The
// scene itself is one of SCENES (see core/data.jsx) — swap which one via the
// "Change scene" sheet on the profile. Each scene's img is layered ON TOP of its
// fallback, so a missing asset still shows a solid backdrop.
const sceneBgImg = (s) => `url(${s.img}), url(${s.fallback})`;

// ── My Profile / House (F-32) — the public page friends visit ────────
// `variant` decides what the buddy stands in:
//   'theme'   — a flat wallpaper card on a gradient
//   'scene'   — a full-bleed photo backdrop (SCENES)
//   'hotspot' — your actual home room (ROOMS), edited right here by tapping it. This is
//               the only variant where the profile and the Decorate screen show the same
//               object, so a change here is a change a visiting friend sees.
function MyHouse({ ctx, variant = 'hotspot', buddySwitch = 'sheet', roomDecor = 'tray', heroDecorStyle = 'shelf', roomSwitch = 'sheet' }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const owned = CHARACTERS.filter(x => x.owned);
  const buddies = owned;   // owned characters — the buddies you can switch to
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  const [sceneId, setSceneId] = React.useState(PLAYER.scene);
  const [scenePicker, setScenePicker] = React.useState(false);
  const [buddyPicker, setBuddyPicker] = React.useState(false);
  // 'sheet' = tap buddy / button opens a picker sheet · 'row' = inline avatar row ·
  // 'collection' = jump to the full Collection page. Switchable in Tweaks.
  const swapBuddy = (b) => { ctx.setBuddy(b.id); setBuddyPicker(false); };
  const onChangeBuddy = () => buddySwitch === 'sheet' ? setBuddyPicker(true) : ctx.nav('collection');

  // profile-scene decor — the items you place around the buddy in the hero itself
  // (what the user pointed at). Owned objects from any room can dress the stage.
  const heroDecor = DECOR.filter(d => d.owned && d.slot === 'object');
  const [profDecor, setProfDecor] = React.useState({ ...PLAYER.profileDecor });
  const [heroDecorSheet, setHeroDecorSheet] = React.useState(false);
  const [heroTrayOpen, setHeroTrayOpen] = React.useState(false);
  const toggleProfDecor = (id) => setProfDecor(m => { const next = { ...m, [id]: !m[id] }; PLAYER.profileDecor = next; return next; });
  const heroPlaced = heroDecor.filter(d => profDecor[d.id]);
  const onHeroDecor = () => roomDecor === 'sheet' ? setHeroDecorSheet(true)
    : roomDecor === 'tray' ? setHeroTrayOpen(o => !o)
    : ctx.nav('decorate');
  const bgObj = HOUSE_BGS.find(b => b.id === PLAYER.houseBg) || HOUSE_BGS[0];
  const sceneObj = SCENES.find(s => s.id === sceneId) || SCENES[0];
  const sceneIdx = SCENES.findIndex(s => s.id === sceneObj.id);

  // 'hotspot' hero — one of your rooms, edited in place. autoSave because a profile has no
  // Save button: friends see this page, so a change to it IS the change.
  //
  // All three rooms are free, so the switcher is a plain picker: no locks, no goals, no
  // ladder. (They used to be earned — see the note on ROOMS in core/data.jsx.)
  const homeRoom = ROOMS.find(r => r.home) || ROOMS[0];
  const [profRoomId, setProfRoomId] = React.useState(homeRoom.id);
  const homeEd = useRoomEditing(ROOMS, profRoomId, { autoSave: true });
  const [homeSheet, setHomeSheet] = React.useState(null);
  const [roomPicker, setRoomPicker] = React.useState(false);
  const profIdx = ROOMS.findIndex(r => r.id === homeEd.room.id);
  const cycleRoom = (dir) => setProfRoomId(ROOMS[(profIdx + dir + ROOMS.length) % ROOMS.length].id);
  const tapRoom = (r) => { setProfRoomId(r.id); setRoomPicker(false); };

  const setScene = (s) => { setSceneId(s.id); PLAYER.scene = s.id; };
  const chooseScene = (s) => { setScene(s); setScenePicker(false); };
  const cycleScene = (dir) => setScene(SCENES[(sceneIdx + dir + SCENES.length) % SCENES.length]);

  // hotspot: the room isn't a picture on a page — it IS the page, so its art is the page's
  // own background rather than a band laid over it. No mask, no fade to white: you're
  // standing in the room from the status bar to the home indicator.
  const roomPage = variant === 'hotspot' && homeEd.theme.bg;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110,
      ...(roomPage
        ? { backgroundImage: `url(${homeEd.theme.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundColor: homeEd.theme.accent }
        : { background: screenBgActive() }) }}>
      {/* scene: the photo is a full-bleed backdrop from the very top of the screen
          down past the character, then masked to fade into the page background */}
      {variant === 'scene' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 470, backgroundImage: sceneBgImg(sceneObj), backgroundSize: '140%', backgroundPosition: '38% top', backgroundRepeat: 'no-repeat', backgroundColor: sceneObj.tint, WebkitMaskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)', zIndex: 0, pointerEvents: 'none' }} />
      )}
      <ScreenHeader title={L('My Profile')} onBack={() => ctx.back()} flush={variant === 'scene' || variant === 'hotspot'}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{PLAYER.likes}</span></div>} />
      <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>

        {/* hero · 'hotspot' — the home room itself, tappable. No "Friends see this"
            badge needed: the room a friend visits and the room you're editing are now
            literally the same object. */}
        {variant === 'hotspot' && (
          <div style={{ marginBottom: 14 }}>
            {/* 'chips' — every room as a named tab across the top, the way Decorate does it */}
            {roomSwitch === 'chips' && (
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8 }} className="no-sb">
                {ROOMS.map(r => {
                  const on = r.id === homeEd.room.id;
                  return (
                    <button key={r.id} onClick={() => tapRoom(r)} className="jx-press" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 12px', fontSize: 12, fontWeight: 800, background: on ? '#fff' : 'rgba(0,0,0,.34)', color: on ? THEME.fg1 : '#fff' }}>
                      <Icon name={themeOf(r).icon} size={13} color={on ? THEME.fg1 : '#fff'} stroke={2.3} />{L(r.name)}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 'sheet' — one quiet pill naming the room you're in; the whole ladder lives in
                a sheet behind it, so the room itself stays uncluttered. */}
            {roomSwitch === 'sheet' && (
              <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
                <button onClick={() => setRoomPicker(true)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, background: 'rgba(0,0,0,.34)', color: '#fff' }}>
                  <Icon name={homeEd.theme.icon} size={14} color="#fff" stroke={2.3} />{L(homeEd.room.name)}
                  <Icon name="chevron-down" size={14} color="#fff" stroke={2.4} />
                </button>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              {/* One buddy, not the whole room — a friend visits to see your FEATURED
                  character (F-32), so the buddy puck swaps who that is rather than moving
                  house-mates in and out. That's the Decorate screen's job.
                  backdrop — a room with art has it painted across the page already; a room
                  without art has to draw its own wall and floor here or the buddy floats.
                  floorLine — how far up from the stage's foot she stands. It lifts her off the
                  bottom edge for two reasons: the name flows after the box, so at 0 her feet
                  and her name fight over the same pixels; and the rooms are drawn with their
                  rug at the very bottom, so a buddy standing lower than this reads as parked
                  behind the room rather than in it. To move her DOWN, shorten the stage —
                  pushing her past its edge only walks her back into the name.
                  placedDecor is empty on purpose: the room's decor renders as lucide line
                  icons in little translucent boxes — fine on a flat gradient, but over painted
                  art they read as debug UI stuck to the screen. They come back when decor
                  ships as sprites that can sit in the room instead of floating over it. */}
              <RoomStage theme={homeEd.theme} draft={homeEd.draft} buddies={[c]} backdrop={!homeEd.theme.bg}
                placedDecor={[]} height={535} radius={homeEd.theme.bg ? 0 : 22} buddySize={196} floorLine="9%"
                onPuck={(slot) => slot === 'buddy' ? setBuddyPicker(true) : setHomeSheet(slot)} />

              {/* 'arrows' — the carousel the photo-scene profile already used: step through
                  the rooms you've opened, one tap at a time. */}
              {roomSwitch === 'arrows' && openRooms.length > 1 && ['left', 'right'].map(side => (
                <button key={side} onClick={() => cycleRoom(side === 'left' ? -1 : 1)} aria-label={L('Change room')} className="jx-press"
                  style={{ position: 'absolute', top: '42%', [side]: -6, transform: 'translateY(-50%)', width: 40, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                  <Icon name={side === 'left' ? 'chevron-left' : 'chevron-right'} size={26} color="#fff" stroke={2.8} style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.6))' }} />
                </button>
              ))}
            </div>

            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,.55)', textAlign: 'center', marginTop: 10 }}>{PLAYER.name}</div>

            {/* one dot per room — which one you're in, and how many there are */}
            {roomSwitch === 'arrows' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                {ROOMS.map(r => {
                  const on = r.id === homeEd.room.id;
                  return (
                    <button key={r.id} onClick={() => tapRoom(r)} aria-label={L(r.name)}
                      style={{ width: on ? 18 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', background: on ? '#fff' : 'rgba(255,255,255,.55)', transition: 'width .18s ease' }} />
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
              {[['star', `Lv ${PLAYER.level}`], ['flame', `${PLAYER.streak}${L('d')}`], ['heart', `${PLAYER.likes}`]].map(([ic, v], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.85)', borderRadius: 999, padding: '5px 11px' }}>
                  <Icon name={ic} size={13} color={THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* hero — 'theme' is a card on a gradient; 'scene' drops the card so the
            buddy sits directly on the full-bleed photo behind the whole top */}
        {variant !== 'hotspot' && (() => { const scene = variant === 'scene'; return (
        <div style={{ ...(scene ? { background: 'transparent', boxShadow: 'none', borderRadius: 0, padding: '6px 16px 26px' } : { background: bgObj.grad, boxShadow: THEME.shadowCard, borderRadius: 24, padding: '18px 16px 20px' }), textAlign: 'center', marginBottom: 14, position: 'relative', overflow: 'visible' }}>
          <div style={{ position: 'absolute', top: scene ? 0 : 12, right: scene ? 4 : 12, fontSize: 10.5, fontWeight: 700, color: scene ? '#fff' : THEME.fg3, background: scene ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.7)', padding: '4px 9px', borderRadius: 999 }}>{L('Friends see this')}</div>
          {scene && (
            <button onClick={() => setScenePicker(true)} style={{ position: 'absolute', top: 0, left: 4, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.28)', border: 'none', borderRadius: 999, padding: '5px 11px 5px 9px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Icon name="image" size={13} color="#fff" stroke={2.3} />{L('Change room')}
            </button>
          )}
          {/* decorate the stage — place/switch accessories right here around the buddy */}
          {scene && (
            <button onClick={onHeroDecor} style={{ position: 'absolute', top: 34, left: 4, display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#fff', background: heroTrayOpen ? THEME.brand : 'rgba(0,0,0,.28)', border: 'none', borderRadius: 999, padding: '5px 11px 5px 9px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Icon name="lamp" size={13} color="#fff" stroke={2.3} />{L(roomDecor === 'editor' ? 'Decorate' : 'Items')}
            </button>
          )}
          {/* tap the arrows (or the pill/sheet) to flip between scenes — same buddy, new backdrop */}
          {scene && ['left', 'right'].map((side, di) => (
            <button key={side} aria-label={side === 'left' ? 'Previous scene' : 'Next scene'} onClick={() => cycleScene(di ? 1 : -1)}
              style={{ position: 'absolute', top: 118, [side]: 2, width: 36, height: 36, background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Icon name={side === 'left' ? 'chevron-left' : 'chevron-right'} size={24} color="#fff" stroke={2.8} style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.6))' }} />
            </button>
          ))}
          {/* the buddy itself is the switcher — 'row' mode uses the avatar row below instead */}
          {buddySwitch !== 'row'
            ? <button onClick={onChangeBuddy} aria-label={L('Change buddy')} className="jx-float" style={{ display: 'block', margin: '0 auto', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={150} />
                <span style={{ position: 'absolute', right: scene ? 26 : 10, bottom: 6, width: 30, height: 30, borderRadius: 999, background: scene ? 'rgba(0,0,0,.34)' : '#fff', boxShadow: scene ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="repeat" size={15} color={scene ? '#fff' : THEME.brand} stroke={2.5} /></span>
              </button>
            : <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>}
          {/* accessories placed on the stage — three looks, switchable in Tweaks:
              'shelf' = dark chip row · 'grounded' = bare props on the grass · 'bar' = one shelf bar */}
          {scene && heroPlaced.length > 0 && heroDecorStyle === 'shelf' && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: -6, marginBottom: 2 }}>
              {heroPlaced.map(d => (
                <Icon key={d.id} name={d.icon} size={22} color="#fff" stroke={2.3} style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,.6))' }} />
              ))}
            </div>
          )}
          {scene && heroPlaced.length > 0 && heroDecorStyle === 'grounded' && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18, marginTop: -14, marginBottom: 2 }}>
              {heroPlaced.map(d => (
                <Icon key={d.id} name={d.icon} size={30} color="#fff" stroke={2.2} style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,.55))' }} />
              ))}
            </div>
          )}
          {scene && heroPlaced.length > 0 && heroDecorStyle === 'bar' && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4, marginBottom: 4 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, background: 'rgba(0,0,0,.32)', borderRadius: 999, padding: '7px 16px' }}>
                {heroPlaced.map(d => (
                  <Icon key={d.id} name={d.icon} size={18} color="#fff" stroke={2.2} />
                ))}
              </div>
            </div>
          )}
          {/* inline tray (tray mode) — tap an owned item to place/remove it on the stage */}
          {scene && roomDecor === 'tray' && heroTrayOpen && (
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 4, marginBottom: 2 }}>
              {heroDecor.map(d => {
                const on = !!profDecor[d.id];
                return (
                  <button key={d.id} onClick={() => toggleProfDecor(d.id)} aria-label={L(d.name)} style={{ width: 42, height: 42, borderRadius: 13, background: on ? '#fff' : 'rgba(255,255,255,.28)', border: on ? `2px solid ${THEME.brand}` : '2px solid rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name={d.icon} size={20} color={on ? THEME.brand : '#fff'} stroke={2.2} />
                  </button>
                );
              })}
            </div>
          )}
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, color: scene ? '#fff' : THEME.fg1, textShadow: scene ? '0 1px 10px rgba(0,0,0,.55)' : 'none' }}>{PLAYER.name}</div>
          {scene && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
              {SCENES.map((s, i) => (
                <span key={s.id} style={{ width: i === sceneIdx ? 18 : 6, height: 6, borderRadius: 999, background: i === sceneIdx ? '#fff' : 'rgba(255,255,255,.5)', transition: 'width .18s ease' }} />
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
            {[['star', `Lv ${PLAYER.level}`], ['flame', `${PLAYER.streak}${L('d')}`], ['heart', `${PLAYER.likes}`]].map(([ic, v], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.85)', borderRadius: 999, padding: '5px 11px' }}>
                <Icon name={ic} size={13} color={THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        ); })()}

        {/* inline buddy row — one tap sets the active buddy (same as the Home switcher) */}
        {buddySwitch === 'row' && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg2, margin: '0 2px 8px' }}>{L('Your buddies')}</div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }} className="no-sb">
              {buddies.map(b => {
                const on = b.id === c.id;
                return (
                  <button key={b.id} onClick={() => ctx.setBuddy(b.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, width: 62 }}>
                    <div style={{ width: 58, height: 58, borderRadius: 999, background: shade(b.color, 90), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: on ? `2.5px solid ${THEME.brand}` : '2.5px solid transparent' }}><Mascot species={b.species} stage={b.stage} color={b.color} size={54} /></div>
                    <span style={{ fontSize: 11, fontWeight: on ? 800 : 600, color: on ? THEME.fg1 : THEME.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 62 }}>{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* The guestbook preview used to sit here. It's gone from the profile — the notes
            live on their own screen (F-32 still holds; reach it from the "me" card on
            Friends), and the profile is the room, not a feed under it. */}
      </div>

      {/* the hotspot hero's pickers — same sheets the Decorate screen uses */}
      {homeSheet && <RoomSlotSheet slot={homeSheet} onClose={() => setHomeSheet(null)} ed={homeEd} />}

      {/* 'sheet' switcher — the whole ladder in one place, earned and unearned together */}
      {roomPicker && (
        <BottomSheet title={L('Your rooms')} onClose={() => setRoomPicker(false)}>
          <div style={{ fontSize: 12.5, color: THEME.fg2, margin: '-4px 2px 12px' }}>{L('Pick the room your friends see.')}</div>
          {/* Three rooms, three cards, no scrolling. Every one is free, so there is nothing
              to rank, gate or count toward — the card is a picture of the room and its name,
              and the only state worth showing is which one you're in. */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {ROOMS.map(r => {
              const t = themeOf(r), on = r.id === homeEd.room.id;
              return (
                <button key={r.id} onClick={() => tapRoom(r)} style={{ textAlign: 'left', border: on ? `2px solid ${THEME.brand}` : `2px solid ${THEME.border}`, borderRadius: 18, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', padding: 0, overflow: 'hidden' }}>
                  {/* the room's own face — its art if it has any, its wallpaper if not. Big
                      enough to actually recognise the room by, which is the only reason a
                      thumbnail earns its space. */}
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

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}

      {/* scene picker — 3 photo thumbnails; the buddy stands in the one you pick */}
      {scenePicker && (
        <BottomSheet title={L('Choose a room')} onClose={() => setScenePicker(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SCENES.map(s => {
              const on = s.id === sceneId;
              return (
                <button key={s.id} onClick={() => chooseScene(s)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, background: on ? THEME.brandLight : THEME.surface2, border: on ? `2px solid ${THEME.brand}` : '2px solid transparent', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <div style={{ width: 78, height: 56, borderRadius: 11, flexShrink: 0, backgroundImage: sceneBgImg(s), backgroundColor: s.tint, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <span style={{ flex: 1, fontSize: 15, fontWeight: on ? 800 : 700, color: on ? THEME.brandDark : THEME.fg1 }}>{L(s.name)}</span>
                  {on && <Icon name="check" size={20} color={THEME.brand} stroke={2.6} style={{ marginRight: 6 }} />}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}

      {/* buddy picker — tap a buddy to become it; full manage flow is one tap deeper */}
      {buddyPicker && (
        <BottomSheet title={L('Choose your buddy')} onClose={() => setBuddyPicker(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {buddies.map(b => {
              const on = b.id === c.id;
              return (
                <button key={b.id} onClick={() => swapBuddy(b)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', background: on ? THEME.brandLight : THEME.surface2, border: on ? `2px solid ${THEME.brand}` : '2px solid transparent', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ width: 60, height: 60, borderRadius: 999, background: shade(b.color, 90), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><Mascot species={b.species} stage={b.stage} color={b.color} size={56} /></div>
                  <span style={{ fontSize: 12.5, fontWeight: on ? 800 : 700, color: on ? THEME.brandDark : THEME.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{b.name}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => { setBuddyPicker(false); ctx.nav('collection'); }} style={{ width: '100%', marginTop: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.surface2, color: THEME.fg2, fontWeight: 800, fontSize: 13, padding: '12px', borderRadius: 14 }}>
            {L('See all in Collection')}
          </button>
        </BottomSheet>
      )}

      {/* hero accessory picker (sheet mode) — dress the profile stage around the buddy */}
      {heroDecorSheet && (
        <BottomSheet title={L('Decorate your profile')} onClose={() => setHeroDecorSheet(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {heroDecor.map(d => {
              const on = !!profDecor[d.id];
              return (
                <button key={d.id} onClick={() => toggleProfDecor(d.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 6px 10px', background: on ? THEME.brandLight : THEME.surface2, border: on ? `2px solid ${THEME.brand}` : '2px solid transparent', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' }}>
                  {on && <div style={{ position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 999, background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></div>}
                  <Icon name={d.icon} size={26} color={on ? THEME.brand : THEME.fg2} stroke={2.1} />
                  <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{L(d.name)}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: on ? THEME.brand : THEME.fg3 }}>{on ? L('Placed') : L('Owned')}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => { setHeroDecorSheet(false); ctx.nav('decorate'); }} style={{ width: '100%', marginTop: 12, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.surface2, color: THEME.fg2, fontWeight: 800, fontSize: 13, padding: '12px', borderRadius: 14 }}>
            {L('Get more in Decorate')}
          </button>
        </BottomSheet>
      )}
    </div>
  );
}

export { MyHouse };
