// JoanX — game extras: Character Encyclopedia (A-4), Villain Encyclopedia
// (A-9), and the Friend visit system (F-32 / A-10). All TripMe-styled.

// small rarity pill reused across the dex screens
function RarityPill({ rarity }) {
  const r = RARITY[rarity] || RARITY.common;
  return <span style={{ fontSize: 9.5, fontWeight: 800, color: r.fg, background: r.bg, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: .3 }}>{L(r.label)}</span>;
}

// completion header used by both encyclopedias
function DexProgress({ have, total, label }) {
  const pct = Math.round((have / total) * 100);
  return (
    <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg2 }}>{L(label)}</span>
        <span className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.fg1 }}>{pct}%</span>
      </div>
      <Bar value={have} max={total} color={THEME.gold} height={9} />
      <div style={{ fontSize: 12, color: THEME.fg3, marginTop: 8 }}>{have} {L('of')} {total} {L('discovered')}</div>
    </div>
  );
}

// ── Character Encyclopedia (A-4) ─────────────────────────────────────
function CharacterDex({ ctx }) {
  const owned = CHARACTERS.filter(c => c.owned).length;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Encyclopedia')} onBack={() => ctx.nav('collection')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="book-open" size={15} color={THEME.primary} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned}/{CHARACTERS.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        <DexProgress have={owned} total={CHARACTERS.length} label="Characters collected" />
        {CHARACTERS.map(c => {
          const info = SPECIES_INFO[c.species] || {};
          return (
            <div key={c.id} onClick={() => c.owned && ctx.nav('character', { id: c.id })} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10, cursor: c.owned ? 'pointer' : 'default', alignItems: 'center' }}>
              <div style={{ width: 66, flexShrink: 0, display: 'flex', justifyContent: 'center', filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.45)' }}>
                <Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={60} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{c.owned ? c.name : '???'}</span>
                  <RarityPill rarity={c.rarity} />
                </div>
                {c.owned ? (
                  <React.Fragment>
                    <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{L(info.label)} · {L('Stage')} {c.stage} · Lv {c.level}</div>
                    <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 5 }}>{L(info.blurb)}</div>
                  </React.Fragment>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: THEME.fg3 }}>
                    <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{L(c.locked || 'Not yet discovered')}</span>
                  </div>
                )}
              </div>
              {c.owned && <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Villain Encyclopedia (A-9) ───────────────────────────────────────
function VillainDex({ ctx }) {
  const firstOpen = VILLAINS.findIndex(v => !v.defeated);      // current challenger index
  const defeated = VILLAINS.filter(v => v.defeated).length;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Villain Dex')} onBack={() => ctx.nav('battle')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{defeated}/{VILLAINS.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        <DexProgress have={defeated} total={VILLAINS.length} label="Villains defeated" />
        {VILLAINS.map((v, i) => {
          const discovered = v.defeated || i === firstOpen;     // seen = beaten or the current one
          const current = i === firstOpen;
          return (
            <div key={v.lv} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10, alignItems: 'center', border: current ? `1.5px solid ${THEME.danger}` : '1.5px solid transparent' }}>
              <div style={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'center', filter: discovered ? 'none' : 'grayscale(1) brightness(.4) opacity(.55)' }}>
                <Mascot species={v.species} stage={2} color={v.color} mood="alert" size={56} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3 }}>Lv{v.lv}</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{discovered ? L(v.name) : '???'}</span>
                </div>
                {discovered ? (
                  <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 5 }}>{L(v.desc)}</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: THEME.fg3 }}>
                    <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{L('Defeat the villain before to reveal')}</span>
                  </div>
                )}
              </div>
              {v.defeated ? <Badge variant="success">{L('Defeated')}</Badge>
                : current ? <Badge variant="danger">{L('Now')}</Badge> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Friends list (F-32) ──────────────────────────────────────────────
function Friends({ ctx }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Friends')} onBack={() => ctx.nav('collection')}
        right={<button onClick={() => ctx.nav('addfriend')} aria-label={L('Add friends')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: THEME.primary, border: 'none', borderRadius: 999, padding: '8px 13px', boxShadow: THEME.shadowPrimary, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="user-plus" size={15} color="#fff" stroke={2.5} /><span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{L('Add')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        {/* my own profile */}
        {(() => { const me = CHARACTERS.find(x => x.id === PLAYER.activeCharId); return (
          <button onClick={() => ctx.nav('myhouse')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(135deg,#447aaf,#2b5782)', border: 'none', borderRadius: 20, padding: 14, boxShadow: THEME.shadowPrimary, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, textAlign: 'left' }}>
            <div style={{ width: 52, height: 52, borderRadius: 999, background: 'rgba(255,255,255,.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={me.species} stage={me.stage} color={me.color} size={46} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 800, color: '#fff' }}>{L('My Profile')}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{L('Edit your buddy, background & rooms')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.16)', borderRadius: 999, padding: '5px 10px' }}><Icon name="heart" size={13} color="#fff" fill="#fff" stroke={2} /><span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{PLAYER.likes}</span></div>
          </button>
        ); })()}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 10px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Your friends')}</div>
        {FRIENDS.map(f => (
          <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MascotChip species={f.avatar} color={f.color} size={50} bg={THEME.primaryLight} />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 999, background: f.online ? THEME.success : THEME.fg3, border: '2.5px solid #fff' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: THEME.fg2, fontWeight: 600 }}><Icon name="flame" size={13} color={THEME.gold} stroke={2.3} />{f.streak}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: THEME.fg2, fontWeight: 600 }}><Icon name="gem" size={13} color={THEME.primary} stroke={2.3} />{f.chars}</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" icon="home" onClick={() => ctx.nav('friendhouse', { id: f.id })}>{L('Visit')}</Button>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: THEME.fg3, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }}>{L('JoanX has no chat — just friendly visits, likes, and guestbook notes.')}</div>
      </div>
    </div>
  );
}

// ── Friend's Collection House (A-10) — featured buddy, rooms, likes,
//    one-line guestbook. Visit-only, no chat/real-time. ──────────────
function FriendHouse({ ctx }) {
  const f = FRIENDS.find(x => x.id === ctx.params?.id) || FRIENDS[0];
  const [liked, setLiked] = React.useState(f.liked);
  const [likes, setLikes] = React.useState(f.likes);
  const [entries, setEntries] = React.useState(f.guest);
  const [draft, setDraft] = React.useState('');

  const toggleLike = () => {
    const next = !liked; setLiked(next); setLikes(n => n + (next ? 1 : -1));
    f.liked = next; f.likes = likes + (next ? 1 : -1);
  };
  const sign = () => {
    const t = draft.trim(); if (!t) return;
    const e = { by: PLAYER.name, text: t };
    setEntries(list => [e, ...list]); f.guest.unshift(e); setDraft('');
  };
  const fc = f.featured;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={`${f.name}${L("’s house")}`} onBack={() => ctx.nav('friends')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{likes}</span></div>} />
      <div style={{ padding: '0 16px' }}>

        {/* featured buddy */}
        <div style={{ borderRadius: 24, padding: '18px 16px', background: `linear-gradient(165deg, ${shade(fc.color, 74)}, #fff 78%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Featured buddy')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={140} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{fc.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><RarityPill rarity={fc.rarity} /></div>
        </div>

        {/* like sticker */}
        <button onClick={toggleLike} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: liked ? THEME.joyBg : '#fff', border: `1.5px solid ${liked ? THEME.joy : THEME.border}`, borderRadius: 16, padding: '13px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>
          <Icon name="heart" size={19} color={THEME.joy} stroke={2.3} fill={liked ? THEME.joy : 'none'} />
          <span style={{ fontSize: 14, fontWeight: 800, color: liked ? THEME.joy : THEME.fg1 }}>{liked ? L('Liked!') : L('Leave a like')}</span>
        </button>

        {/* rooms */}
        <SectionHead title={L('Rooms')} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }} className="no-sb">
          {f.rooms.map((r, i) => (
            <div key={i} style={{ flexShrink: 0, width: 132, borderRadius: 18, padding: '14px 12px', background: `linear-gradient(180deg, ${r.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={54} /></div>
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,.05)', margin: '8px 0 8px' }} />
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>{L(r.name)}</div>
            </div>
          ))}
        </div>

        {/* guestbook */}
        <SectionHead title={L('Guestbook')} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input value={draft} onChange={e => setDraft(e.target.value.slice(0, 60))} placeholder={L('Write one line…')} maxLength={60}
            style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: 14, padding: '11px 14px', fontFamily: 'inherit', fontSize: 13.5, color: THEME.fg1, background: '#fff', outline: 'none' }} />
          <Button variant="primary" size="md" icon="send" onClick={sign} disabled={!draft.trim()}>{L('Sign')}</Button>
        </div>
        {entries.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowCard, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: THEME.primaryDark }}>{e.by[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{e.by}</div>
              <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{e.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// small points chip for the profile / decoration headers
function PointsChip({ pts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 999, padding: '6px 12px', boxShadow: THEME.shadowCard }}>
      <Icon name="star" size={14} color={THEME.gold} fill={THEME.gold} stroke={2} />
      <span className="game-font" style={{ fontSize: 13, fontWeight: 500 }}>{pts.toLocaleString()}</span>
    </div>
  );
}

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

  const chooseBg = (b) => {
    if (!b.owned) {
      if (pts < b.cost) { setToast(L('Not enough points yet')); setTimeout(() => setToast(null), 1500); return; }
      PLAYER.points -= b.cost; setPts(PLAYER.points); b.owned = true;
    }
    setBg(b.id); PLAYER.houseBg = b.id;
  };
  const toggleLike = (i) => setLikes(s => s.map((v, j) => j === i ? !v : v));

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('My Profile')} onBack={() => ctx.nav('friends')}
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
                {!b.owned && <div style={{ fontSize: 10.5, color: THEME.gold, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}><Icon name="star" size={10} color={THEME.gold} fill={THEME.gold} stroke={2} />{b.cost}</div>}
              </button>
            );
          })}
        </div>

        {/* my rooms */}
        <SectionHead title={L('My rooms')} />
        {rooms.map(room => {
          const placed = owned.filter(x => x.room === room.id);
          return (
            <div key={room.id} style={{ borderRadius: 20, padding: '16px 14px 12px', background: `linear-gradient(180deg, ${room.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, marginBottom: 12 }}>
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
              <div style={{ height: 6, borderRadius: 999, background: 'rgba(0,0,0,.05)', marginTop: 6 }} />
            </div>
          );
        })}

        {/* guestbook received */}
        <SectionHead title={L('Guestbook')} />
        <div style={{ fontSize: 12, color: THEME.fg2, margin: '-6px 4px 10px' }}>{L('Notes your friends left when they visited.')}</div>
        {MY_GUESTBOOK.map((g, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowCard, marginBottom: 8 }}>
            <MascotChip species={g.avatar} color={g.color} size={34} bg={THEME.primaryLight} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{g.by}</div>
              <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{g.text}</div>
            </div>
            <button onClick={() => toggleLike(i)} aria-label={L('Like')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <Icon name="heart" size={18} color={THEME.joy} stroke={2.3} fill={likes[i] ? THEME.joy : 'none'} />
            </button>
          </div>
        ))}
      </div>

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

// ── Room decoration (A-7) — theme + placeable ornaments ──────────────
function DecorateRoom({ ctx }) {
  const rooms = ROOMS.filter(r => r.unlocked);
  const [roomId, setRoomId] = React.useState(ctx.params?.roomId || rooms[0].id);
  const room = rooms.find(r => r.id === roomId) || rooms[0];
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const THEMES = ['#ecf3fe', '#ebf4f4', '#f5f1fd', '#f9f1ed', '#fdeef5', '#e9f4f5'];
  const [theme, setTheme] = React.useState(room.theme);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [ownedDecor, setOwnedDecor] = React.useState(Object.fromEntries(DECOR.map(d => [d.id, d.owned])));
  const [placed, setPlaced] = React.useState({});
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const pickRoom = (r) => { setRoomId(r.id); setTheme(r.theme); setPlaced({}); };
  const tapDecor = (d) => {
    if (!ownedDecor[d.id]) {
      if (pts < d.cost) { say(L('Not enough points yet')); return; }
      PLAYER.points -= d.cost; setPts(PLAYER.points); setOwnedDecor(o => ({ ...o, [d.id]: true }));
      setPlaced(p => ({ ...p, [d.id]: true })); return;
    }
    setPlaced(p => ({ ...p, [d.id]: !p[d.id] }));
  };
  const save = () => { room.theme = theme; ctx.nav('myhouse'); };
  const placedList = DECOR.filter(d => placed[d.id]);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Decorate')} onBack={() => ctx.nav('myhouse')} right={<PointsChip pts={pts} />} />
      <div style={{ padding: '0 16px' }}>

        {/* room tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {rooms.map(r => (
            <button key={r.id} onClick={() => pickRoom(r)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '10px 8px', fontSize: 13, fontWeight: 800, background: roomId === r.id ? THEME.primary : '#fff', color: roomId === r.id ? '#fff' : THEME.fg2, boxShadow: THEME.shadowCard }}>{L(r.name)}</button>
          ))}
        </div>

        {/* live preview */}
        <div style={{ borderRadius: 22, padding: '22px 16px 14px', background: `linear-gradient(180deg, ${theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, marginBottom: 16, textAlign: 'center' }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={120} /></div>
          <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.06)', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, minHeight: 30 }}>
            {placedList.length ? placedList.map(d => (
              <div key={d.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><Icon name={d.icon} size={22} color={THEME.fg2} stroke={2.1} /></div>
            )) : <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Add some decorations below')}</span>}
          </div>
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
                     : <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><Icon name="star" size={10} color={THEME.gold} fill={THEME.gold} stroke={2} />{d.cost}</span>}
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

// ── Add friends (F-32) — code, requests, suggestions ─────────────────
function AddFriends({ ctx }) {
  const [code, setCode] = React.useState('');
  const [added, setAdded] = React.useState({});
  const [requests, setRequests] = React.useState(FRIEND_REQUESTS);
  const [toast, setToast] = React.useState(null);
  const say = (m) => { setToast(m); setTimeout(() => setToast(null), 1500); };

  const accept = (id) => { setRequests(rs => rs.filter(r => r.id !== id)); setAdded(a => ({ ...a, [id]: true })); say(L('Friend added!')); };
  const decline = (id) => setRequests(rs => rs.filter(r => r.id !== id));
  const addByCode = () => { if (!code.trim()) return; say(L('Request sent!')); setCode(''); };

  const Row = ({ f, right }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: `1px solid ${THEME.border}` }}>
      <MascotChip species={f.avatar} color={f.color} size={44} bg={THEME.primaryLight} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{f.mutual} {L('mutual friends')}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Add friends')} onBack={() => ctx.nav('friends')} />
      <div style={{ padding: '0 16px' }}>

        {/* my friend code */}
        <div style={{ borderRadius: 20, padding: 16, background: 'linear-gradient(150deg,#eef3fe,#fff 80%)', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>{L('My friend code')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, letterSpacing: 1.5, color: THEME.fg1 }}>{PLAYER.friendCode}</div>
            <button onClick={() => say(L('Copied!'))} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: 'none', borderRadius: 999, padding: '8px 14px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', color: THEME.primary, fontSize: 13, fontWeight: 700 }}><Icon name="copy" size={15} color={THEME.primary} stroke={2.3} />{L('Copy')}</button>
          </div>
        </div>

        {/* add by code */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Add by code')}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="JNX-••••-••" style={{ flex: 1, minWidth: 0, border: `1.5px solid ${THEME.border}`, borderRadius: 14, padding: '12px 14px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: 1, color: THEME.fg1, background: '#fff', outline: 'none' }} />
          <Button variant="primary" size="md" icon="user-plus" onClick={addByCode} disabled={!code.trim()}>{L('Add')}</Button>
        </div>

        {/* requests */}
        {requests.length > 0 && (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Friend requests')}</div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
              {requests.map((f, i) => (
                <div key={f.id} style={{ borderTop: i ? '' : 'none' }}>
                  <Row f={f} right={
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => accept(f.id)} style={{ background: THEME.primary, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="check" size={17} color="#fff" stroke={2.6} /></button>
                      <button onClick={() => decline(f.id)} style={{ background: THEME.surface2, border: 'none', borderRadius: 999, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="x" size={16} color={THEME.fg2} stroke={2.4} /></button>
                    </div>
                  } />
                </div>
              ))}
            </div>
          </React.Fragment>
        )}

        {/* suggestions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Suggested friends')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          {FRIEND_SUGGESTIONS.map(f => (
            <Row key={f.id} f={f} right={added[f.id]
              ? <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Icon name="check" size={14} color={THEME.success} stroke={3} />{L('Added')}</span>
              : <Button variant="secondary" size="sm" icon="user-plus" onClick={() => { setAdded(a => ({ ...a, [f.id]: true })); say(L('Request sent!')); }}>{L('Add')}</Button>} />
          ))}
        </div>
      </div>

      {toast && <div style={{ position: 'absolute', bottom: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20 }} className="jx-fade"><div style={{ background: 'rgba(43,41,38,.9)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>{toast}</div></div>}
    </div>
  );
}

Object.assign(window, { CharacterDex, VillainDex, Friends, FriendHouse, MyHouse, DecorateRoom, AddFriends, RarityPill, DexProgress, PointsChip });
