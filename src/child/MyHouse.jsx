// JoanX — child app · MyHouse

import React from 'react';
import { CHARACTERS, DECOR, HOUSE_BGS, MY_GUESTBOOK, PLAYER, SCENES } from '../core/data.jsx';
import { BottomSheet, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';
import { GuestbookNote } from './Guestbook.jsx';

const PREVIEW_NOTES = 2;   // My Profile shows a taste; the Guestbook screen holds the rest

// A themed room can render two ways: 'theme' (flat wallpaper + floor band) or
// 'scene' (a real photo backdrop with the buddy standing in front of it). The
// scene itself is one of SCENES (see core/data.jsx) — swap which one via the
// "Change scene" sheet on the profile. Each scene's img is layered ON TOP of its
// fallback, so a missing asset still shows a solid backdrop.
const sceneBgImg = (s) => `url(${s.img}), url(${s.fallback})`;

// ── My Profile / House (F-32) — the public page friends visit ────────
function MyHouse({ ctx, variant = 'theme', buddySwitch = 'sheet', roomDecor = 'tray', heroDecorStyle = 'shelf' }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const owned = CHARACTERS.filter(x => x.owned);
  const buddies = owned;   // owned characters — the buddies you can switch to
  const [likes, setLikes] = React.useState(MY_GUESTBOOK.map(g => g.liked));
  const [toast, setToast] = React.useState(null);
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

  const setScene = (s) => { setSceneId(s.id); PLAYER.scene = s.id; };
  const chooseScene = (s) => { setScene(s); setScenePicker(false); };
  const cycleScene = (dir) => setScene(SCENES[(sceneIdx + dir + SCENES.length) % SCENES.length]);
  const toggleLike = (i) => setLikes(s => s.map((v, j) => j === i ? !v : v));

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      {/* scene: the photo is a full-bleed backdrop from the very top of the screen
          down past the character, then masked to fade into the page background */}
      {variant === 'scene' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 470, backgroundImage: sceneBgImg(sceneObj), backgroundSize: '140%', backgroundPosition: '38% top', backgroundRepeat: 'no-repeat', backgroundColor: sceneObj.tint, WebkitMaskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)', maskImage: 'linear-gradient(180deg, #000 68%, transparent 100%)', zIndex: 0, pointerEvents: 'none' }} />
      )}
      <ScreenHeader title={L('My Profile')} onBack={() => ctx.back()} flush={variant === 'scene'}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{PLAYER.likes}</span></div>} />
      <div style={{ padding: '0 16px', position: 'relative', zIndex: 1 }}>

        {/* hero — 'theme' is a card on a gradient; 'scene' drops the card so the
            buddy sits directly on the full-bleed photo behind the whole top */}
        {(() => { const scene = variant === 'scene'; return (
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
          {buddySwitch === 'sheet'
            ? <button onClick={() => setBuddyPicker(true)} aria-label={L('Change buddy')} className="jx-float" style={{ display: 'block', margin: '0 auto', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', position: 'relative' }}>
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

        {/* edit actions */}
        <div style={{ display: 'flex', gap: 10, marginBottom: buddySwitch === 'row' ? 12 : 18 }}>
          {[['sparkles', 'Change buddy', onChangeBuddy], ['paintbrush', 'Decorate rooms', () => ctx.nav('decorate')]].map(([ic, lbl, on], i) => (
            <button key={i} onClick={on} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 16, padding: '13px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Icon name={ic} size={17} color={THEME.brand} stroke={2.3} /><span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{L(lbl)}</span>
            </button>
          ))}
        </div>

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
