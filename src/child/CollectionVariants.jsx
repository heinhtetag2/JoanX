// JoanX — child app · Collection House layout explorations (10 variants)
// One data model (rooms + owned/locked buddies), ten different presentations.
// Switch via the Tweaks panel ("Collection layout").

import React from 'react';
import { CHARACTERS, ROOMS } from '../core/data.jsx';
import { Badge, Bar, Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

const COLLECTION_LAYOUTS = [
  { id: 'shelf', label: 'Shelf' },
  { id: 'grid', label: 'Grid' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'bookshelf', label: 'Bookshelf' },
  { id: 'list', label: 'List' },
  { id: 'rarity', label: 'By rarity' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'journey', label: 'Journey' },
  { id: 'cards', label: 'Cards' },
  { id: 'bento', label: 'Bento' },
  { id: 'stack', label: 'Stack' },
  { id: 'bubbles', label: 'Bubbles' },
  { id: 'dex', label: 'Dex' },
  { id: 'progress', label: 'Progress' },
  { id: 'tabs', label: 'Tabs' },
  { id: 'masonry', label: 'Masonry' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'compact', label: 'Compact' },
  { id: 'podium', label: 'Podium' },
];

const rarBadge = (c, style) => (
  <Badge variant={c.rarity === 'epic' ? 'epic' : c.rarity === 'rare' ? 'primary' : 'default'} style={style}>Lv{c.level}</Badge>
);

// ── shared building blocks ───────────────────────────────────────────
function RoomHead({ room, placed }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ fontSize: 16, fontWeight: 800 }}>{L(room.name)}</span>
        {!room.unlocked && <Icon name="lock" size={14} color={THEME.fg3} stroke={2.3} />}
      </div>
      <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{room.unlocked ? `${placed.length}/${room.slots}` : L('Locked')}</span>
    </div>
  );
}

function LockedRoom({ room }) {
  return (
    <div style={{ borderRadius: 22, padding: 22, background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={22} color={THEME.fg3} stroke={2.2} />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{L(room.name)}</div>
        <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L(room.req)}</div>
      </div>
    </div>
  );
}

const EmptySlot = ({ size = 56 }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110 }}>
    <div style={{ width: size, height: size, borderRadius: 18, border: `2px dashed ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="plus" size={22} color={THEME.fg3} stroke={2.2} />
    </div>
  </div>
);

// ── the variant screen ───────────────────────────────────────────────
function CollectionVariant({ variant = 'shelf', ctx }) {
  const [tab, setTab] = React.useState(0);   // used by the 'tabs' variant
  const all = CHARACTERS;
  const owned = all.filter(c => c.owned);
  const rooms = ROOMS;
  const openC = (c) => c && c.owned && ctx.nav('character', { id: c.id });
  const roomChars = (room) => owned.filter(c => c.room === room.id);

  // clickable big mascot tile (shelf / carousel / bookshelf)
  const bigTile = (c, i, size = 74) => c ? (
    <button key={c.id} onClick={() => openC(c)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0 }}>
      <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />
      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
      {rarBadge(c, { marginTop: 3, fontSize: 9.5, padding: '2px 7px' })}
    </button>
  ) : <EmptySlot key={'e' + i} />;

  // ── VARIANTS ──
  let body;

  // 1 · SHELF — gradient room cards with a shelf line (the current baseline)
  if (variant === 'shelf') body = rooms.map(room => {
    const placed = roomChars(room);
    return (
      <div key={room.id} style={{ marginBottom: 16 }}>
        <RoomHead room={room} placed={placed} />
        {room.unlocked ? (
          <div style={{ borderRadius: 22, padding: '20px 14px 14px', background: `linear-gradient(180deg, ${room.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard }}>
            <div style={{ display: 'flex', gap: 10 }}>{Array.from({ length: room.slots }).map((_, i) => bigTile(placed[i], i))}</div>
            <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.05)', marginTop: 6 }} />
          </div>
        ) : <LockedRoom room={room} />}
      </div>
    );
  });

  // 2 · GRID — no rooms; one clean 3-up grid of every buddy (owned + locked)
  else if (variant === 'grid') body = (
    <React.Fragment>
      <SectionHead title={L('All buddies')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {all.map(c => (
          <button key={c.id} disabled={!c.owned} onClick={() => openC(c)} style={{ background: '#fff', borderRadius: 18, padding: '12px 6px 10px', boxShadow: THEME.shadowCard, border: 'none', cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
            {!c.owned && <div style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="lock" size={13} color={THEME.fg3} stroke={2.4} /></div>}
            <div style={{ filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.5)' }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={62} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{c.owned ? c.name : '???'}</div>
            <Badge variant={c.rarity === 'epic' ? 'epic' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 4, fontSize: 9, padding: '2px 6px' }}>{L(RARITY[c.rarity].label)}</Badge>
          </button>
        ))}
      </div>
    </React.Fragment>
  );

  // 3 · CAROUSEL — each room a horizontally-scrolling row of tall cards
  else if (variant === 'carousel') body = rooms.map(room => {
    const placed = roomChars(room);
    return (
      <div key={room.id} style={{ marginBottom: 18 }}>
        <RoomHead room={room} placed={placed} />
        {room.unlocked ? (
          <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 2px 8px', margin: '0 -2px' }}>
            {(placed.length ? placed : [null]).map((c, i) => c ? (
              <button key={c.id} onClick={() => openC(c)} style={{ flexShrink: 0, width: 132, borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: `linear-gradient(180deg, ${shade(c.color, 74)}, #fff 90%)`, boxShadow: THEME.shadowCard, padding: '16px 10px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={86} />
                <div style={{ fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>{c.name}</div>
                {rarBadge(c, { marginTop: 5 })}
              </button>
            ) : <div key="e" style={{ width: 132, height: 150, borderRadius: 20, border: `2px dashed ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="plus" size={24} color={THEME.fg3} stroke={2.2} /></div>)}
          </div>
        ) : <LockedRoom room={room} />}
      </div>
    );
  });

  // 4 · BOOKSHELF — skeuomorphic warm wood shelves the buddies stand on
  else if (variant === 'bookshelf') body = rooms.filter(r => r.unlocked).map(room => {
    const placed = roomChars(room);
    const wood = '#a9744f';
    return (
      <div key={room.id} style={{ marginBottom: 16 }}>
        <RoomHead room={room} placed={placed} />
        <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: THEME.shadowCard, background: '#fbf3ea' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '18px 12px 0', minHeight: 96 }}>
            {Array.from({ length: room.slots }).map((_, i) => {
              const c = placed[i];
              return c ? (
                <button key={c.id} onClick={() => openC(c)} style={{ flex: 1, minWidth: 0, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0 }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={70} />
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{c.name}</div>
                </button>
              ) : <div key={'e' + i} style={{ flex: 1, minHeight: 72, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4 }}><div style={{ width: 40, height: 40, borderRadius: 12, border: `2px dashed ${shade(wood, 40)}` }} /></div>;
            })}
          </div>
          {/* the plank */}
          <div style={{ height: 16, background: `linear-gradient(${shade(wood, 20)}, ${wood})`, borderTop: `2px solid ${shade(wood, 34)}`, boxShadow: `0 3px 6px ${shade(wood, -30)}55` }} />
        </div>
      </div>
    );
  });

  // 5 · LIST — compact rows grouped by room: chip + name + rarity + XP bar
  else if (variant === 'list') body = rooms.filter(r => r.unlocked).map(room => {
    const placed = roomChars(room);
    return (
      <div key={room.id} style={{ marginBottom: 18 }}>
        <RoomHead room={room} placed={placed} />
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          {placed.map((c, i) => (
            <button key={c.id} onClick={() => openC(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: shade(c.color, 70), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={44} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</span><span style={{ fontSize: 11, fontWeight: 800, color: RARITY[c.rarity].fg }}>{L(RARITY[c.rarity].label)}</span></div>
                <div style={{ marginTop: 5 }}><Bar value={c.xp} max={c.xpMax} color={c.color} height={5} /></div>
              </div>
              <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.fg2 }}>Lv{c.level}</span>
            </button>
          ))}
        </div>
      </div>
    );
  });

  // 6 · BY RARITY — regroup across rooms into Special / Rare / Common bands
  else if (variant === 'rarity') body = ['epic', 'rare', 'common'].map(rk => {
    const list = owned.filter(c => c.rarity === rk);
    if (!list.length) return null;
    const R = RARITY[rk];
    return (
      <div key={rk} style={{ marginBottom: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: R.bg, color: R.fg, borderRadius: 999, padding: '5px 13px', fontSize: 12.5, fontWeight: 800, marginBottom: 10, border: `1.5px solid ${R.fg}33` }}>
          <Icon name="gem" size={13} color={R.fg} stroke={2.4} />{L(R.label)} · {list.length}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {list.map(c => (
            <button key={c.id} onClick={() => openC(c)} style={{ background: '#fff', borderRadius: 18, padding: '12px 6px 10px', border: `1.5px solid ${R.fg}22`, boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={62} />
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{c.name}</div>
              {rarBadge(c, { marginTop: 4, fontSize: 9, padding: '2px 6px' })}
            </button>
          ))}
        </div>
      </div>
    );
  });

  // 7 · GALLERY — museum wall: framed 2-up portraits
  else if (variant === 'gallery') body = (
    <React.Fragment>
      <SectionHead title={L('All buddies')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {owned.map(c => (
          <button key={c.id} onClick={() => openC(c)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 16, padding: 7, background: '#f4ece0', boxShadow: THEME.shadowCard }}>
            <div style={{ borderRadius: 12, border: `3px solid ${shade('#b98a5a', 10)}`, background: `linear-gradient(160deg, ${shade(c.color, 72)}, #fff)`, padding: '14px 8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={92} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 7, marginBottom: 2 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{c.name}</span>{rarBadge(c, { fontSize: 9, padding: '2px 6px' })}
            </div>
          </button>
        ))}
      </div>
    </React.Fragment>
  );

  // 8 · SPOTLIGHT — big active buddy hero, then a dense mini-grid of the rest
  else if (variant === 'spotlight') {
    const hero = owned[0];
    const rest = owned.slice(1);
    body = (
      <React.Fragment>
        {hero && (
          <button onClick={() => openC(hero)} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 24, padding: '22px 18px', marginBottom: 16, background: `linear-gradient(165deg, ${shade(hero.color, 66)}, #fff 92%)`, boxShadow: THEME.shadowCard, textAlign: 'center', position: 'relative' }}>
            <span style={{ position: 'absolute', top: 14, left: 14, fontSize: 10.5, fontWeight: 800, letterSpacing: .4, textTransform: 'uppercase', color: THEME.fg3 }}>{L('Featured')}</span>
            <div className="jx-float"><Mascot species={hero.species} stage={hero.stage} color={hero.color} size={132} /></div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 4 }}>{hero.name}</div>
            <div style={{ display: 'inline-flex', gap: 6, marginTop: 8 }}>{rarBadge(hero, {})}</div>
          </button>
        )}
        <SectionHead title={L('All buddies')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 9 }}>
          {rest.map(c => (
            <button key={c.id} onClick={() => openC(c)} style={{ background: '#fff', borderRadius: 15, padding: '9px 4px', boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={48} />
              <div style={{ fontSize: 10.5, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
            </button>
          ))}
        </div>
      </React.Fragment>
    );
  }

  // 9 · JOURNEY — rooms as nodes down a vertical path (map / progress feel)
  else if (variant === 'journey') body = (
    <div style={{ position: 'relative', paddingLeft: 30 }}>
      <div style={{ position: 'absolute', left: 13, top: 8, bottom: 8, width: 3, borderRadius: 3, background: THEME.border }} />
      {rooms.map(room => {
        const placed = roomChars(room);
        return (
          <div key={room.id} style={{ position: 'relative', marginBottom: 16 }}>
            <div style={{ position: 'absolute', left: -30, top: 4, width: 28, height: 28, borderRadius: 999, background: room.unlocked ? THEME.primary : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: THEME.shadowCard }}>
              <Icon name={room.unlocked ? 'check' : 'lock'} size={14} color={room.unlocked ? '#fff' : THEME.fg3} stroke={2.6} />
            </div>
            <div style={{ background: '#fff', borderRadius: 18, padding: '13px 14px', boxShadow: THEME.shadowCard }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14.5, fontWeight: 800 }}>{L(room.name)}</span>
                <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{room.unlocked ? `${placed.length}/${room.slots}` : L('Locked')}</span>
              </div>
              {room.unlocked ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  {Array.from({ length: room.slots }).map((_, i) => { const c = placed[i]; return c ? (
                    <button key={c.id} onClick={() => openC(c)} style={{ width: 52, height: 52, borderRadius: 999, background: shade(c.color, 70), border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={50} /></button>
                  ) : <div key={'e' + i} style={{ width: 52, height: 52, borderRadius: 999, border: `2px dashed ${THEME.border}`, flexShrink: 0 }} />; })}
                </div>
              ) : <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 4 }}>{L(room.req)}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );

  // 10 · CARDS — trading-card frames with rarity banner + tiny stat row
  else if (variant === 'cards') body = (
    <React.Fragment>
      <SectionHead title={L('All buddies')} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {owned.map(c => {
          const R = RARITY[c.rarity], t = c.traits || {};
          return (
            <button key={c.id} onClick={() => openC(c)} style={{ border: `2px solid ${R.fg}`, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', background: '#fff', boxShadow: THEME.shadowCard, padding: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 11px', background: R.fg }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{c.name}</span>
                <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Lv{c.level}</span>
              </div>
              <div style={{ background: `linear-gradient(180deg, ${R.bg}, #fff)`, padding: '10px 8px 6px', display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={84} /></div>
              <div style={{ display: 'flex', gap: 6, padding: '8px 10px 11px' }}>
                {[['shield', t.guard || 50], ['zap', t.speed || 60], ['heart', t.heart || 70]].map(([ic, v], i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, background: THEME.surface2, borderRadius: 8, padding: '4px 0' }}>
                    <Icon name={ic} size={11} color={THEME.fg2} stroke={2.3} /><span style={{ fontSize: 11, fontWeight: 800, color: THEME.fg1 }}>{v}</span>
                  </div>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 11 · BENTO — asymmetric grid, every 5th buddy gets a full-width hero tile
  else if (variant === 'bento') body = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {owned.map((c, i) => {
        const big = i % 5 === 0;
        return (
          <button key={c.id} onClick={() => openC(c)} style={{ gridColumn: big ? 'span 2' : 'span 1', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 18, background: `linear-gradient(150deg, ${shade(c.color, 70)}, #fff 88%)`, boxShadow: THEME.shadowCard, padding: big ? '18px 12px' : '14px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={big ? 104 : 62} />
            <div style={{ fontSize: big ? 15 : 12.5, fontWeight: 800, marginTop: 4 }}>{c.name}</div>
            {rarBadge(c, { marginTop: 4, fontSize: 9.5, padding: '2px 7px' })}
          </button>
        );
      })}
    </div>
  );

  // 12 · STACK — full-width banner cards: mascot + name + rarity + XP bar
  else if (variant === 'stack') body = owned.map(c => (
    <button key={c.id} onClick={() => openC(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', borderRadius: 20, background: `linear-gradient(110deg, ${shade(c.color, 68)}, #fff 78%)`, boxShadow: THEME.shadowCard, padding: '12px 16px 12px 12px' }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={68} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 16, fontWeight: 800 }}>{c.name}</span><span style={{ fontSize: 11, fontWeight: 800, color: RARITY[c.rarity].fg }}>{L(RARITY[c.rarity].label)}</span></div>
        <div style={{ margin: '7px 0 4px' }}><Bar value={c.xp} max={c.xpMax} color={c.color} height={6} /></div>
      </div>
      <span className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.fg2 }}>Lv{c.level}</span>
    </button>
  ));

  // 13 · BUBBLES — round avatar bubbles that wrap, grouped by room
  else if (variant === 'bubbles') body = rooms.filter(r => r.unlocked).map(room => {
    const placed = roomChars(room);
    return (
      <div key={room.id} style={{ marginBottom: 16 }}>
        <RoomHead room={room} placed={placed} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, padding: '18px 14px' }}>
          {placed.map(c => (
            <button key={c.id} onClick={() => openC(c)} style={{ width: 78, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0 }}>
              <div style={{ width: 66, height: 66, borderRadius: 999, background: shade(c.color, 66), border: `2.5px solid ${c.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={62} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700 }}>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  });

  // 14 · DEX — numbered pokédex list; locked buddies show a ??? silhouette
  else if (variant === 'dex') body = (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {all.map((c, i) => (
        <button key={c.id} disabled={!c.owned} onClick={() => openC(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: 'none', border: 'none', cursor: c.owned ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left' }}>
          <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg3, width: 26 }}>#{String(i + 1).padStart(2, '0')}</span>
          <div style={{ width: 42, height: 42, flexShrink: 0, filter: c.owned ? 'none' : 'grayscale(1) brightness(1.6) opacity(.5)' }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={42} /></div>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 800, color: c.owned ? THEME.fg1 : THEME.fg3 }}>{c.owned ? c.name : '???'}</span>
          {c.owned ? <span style={{ fontSize: 11, fontWeight: 800, color: RARITY[c.rarity].fg }}>{L(RARITY[c.rarity].label)}</span> : <Icon name="lock" size={14} color={THEME.fg3} stroke={2.4} />}
        </button>
      ))}
    </div>
  );

  // 15 · PROGRESS — completion ring up top, then per-room progress bars
  else if (variant === 'progress') {
    const pct = Math.round((owned.length / all.length) * 100);
    const R = 46, circ = 2 * Math.PI * R;
    body = (
      <React.Fragment>
        <div style={{ background: '#fff', borderRadius: 22, boxShadow: THEME.shadowCard, padding: '22px 18px', display: 'flex', alignItems: 'center', gap: 18, marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
            <svg width="104" height="104" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="52" cy="52" r={R} fill="none" stroke={THEME.surface2} strokeWidth="10" />
              <circle cx="52" cy="52" r={R} fill="none" stroke={THEME.primary} strokeWidth="10" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span className="game-font" style={{ fontSize: 26, fontWeight: 500 }}>{pct}%</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L('Collection')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, marginTop: 3 }}>{owned.length}/{all.length} {L('collected')}</div>
          </div>
        </div>
        {rooms.map(room => {
          const placed = roomChars(room);
          return (
            <div key={room.id} style={{ background: '#fff', borderRadius: 16, boxShadow: THEME.shadowCard, padding: '13px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: room.unlocked ? THEME.fg1 : THEME.fg3 }}>{L(room.name)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2 }}>{room.unlocked ? `${placed.length}/${room.slots}` : L('Locked')}</span>
              </div>
              <Bar value={room.unlocked ? placed.length : 0} max={room.slots} color={THEME.primary} height={7} />
            </div>
          );
        })}
      </React.Fragment>
    );
  }

  // 16 · TABS — room segmented control, one room shown big at a time
  else if (variant === 'tabs') {
    const unlocked = rooms.filter(r => r.unlocked);
    const room = unlocked[Math.min(tab, unlocked.length - 1)] || unlocked[0];
    const placed = room ? roomChars(room) : [];
    body = (
      <React.Fragment>
        <div className="no-sb" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }}>
          {unlocked.map((r, i) => {
            const on = i === Math.min(tab, unlocked.length - 1);
            return <button key={r.id} onClick={() => setTab(i)} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 800, background: on ? THEME.primary : '#fff', color: on ? '#fff' : THEME.fg2, boxShadow: THEME.shadowCard }}>{L(r.name)}</button>;
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {Array.from({ length: room ? room.slots : 0 }).map((_, i) => { const c = placed[i]; return c ? (
            <button key={c.id} onClick={() => openC(c)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 20, background: `linear-gradient(180deg, ${shade(c.color, 72)}, #fff 92%)`, boxShadow: THEME.shadowCard, padding: '18px 10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={90} /><div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{c.name}</div>{rarBadge(c, { marginTop: 5 })}
            </button>
          ) : <div key={'e' + i} style={{ borderRadius: 20, border: `2px dashed ${THEME.border}`, minHeight: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={24} color={THEME.fg3} stroke={2.2} /></div>; })}
        </div>
      </React.Fragment>
    );
  }

  // 17 · MASONRY — 2-column varying-height cards (rarer buddies stand taller)
  else if (variant === 'masonry') body = (
    <div style={{ columns: 2, columnGap: 10 }}>
      {owned.map(c => {
        const sz = c.rarity === 'epic' ? 108 : c.rarity === 'rare' ? 86 : 66;
        return (
          <button key={c.id} onClick={() => openC(c)} style={{ display: 'inline-flex', width: '100%', breakInside: 'avoid', marginBottom: 10, flexDirection: 'column', alignItems: 'center', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 18, background: `linear-gradient(180deg, ${shade(c.color, 72)}, #fff)`, boxShadow: THEME.shadowCard, padding: '16px 10px 12px' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={sz} />
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 5 }}>{c.name}</div>
            {rarBadge(c, { marginTop: 4, fontSize: 9.5, padding: '2px 7px' })}
          </button>
        );
      })}
    </div>
  );

  // 18 · FILMSTRIP — big horizontal snap cards, one buddy at a time
  else if (variant === 'filmstrip') body = (
    <div className="no-sb" style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '2px 2px 10px', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
      {owned.map(c => (
        <button key={c.id} onClick={() => openC(c)} style={{ flexShrink: 0, width: '78%', scrollSnapAlign: 'center', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 26, background: `linear-gradient(165deg, ${shade(c.color, 64)}, #fff 92%)`, boxShadow: THEME.shadowCard, padding: '26px 16px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={140} /></div>
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 6 }}>{c.name}</div>
          <div style={{ marginTop: 8 }}>{rarBadge(c, {})}</div>
        </button>
      ))}
    </div>
  );

  // 19 · COMPACT — dense 4-column mini grid of everything
  else if (variant === 'compact') body = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
      {all.map(c => (
        <button key={c.id} disabled={!c.owned} onClick={() => openC(c)} style={{ background: '#fff', borderRadius: 14, padding: '9px 3px 7px', boxShadow: THEME.shadowCard, border: 'none', cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {!c.owned && <div style={{ position: 'absolute', top: 5, right: 5 }}><Icon name="lock" size={11} color={THEME.fg3} stroke={2.4} /></div>}
          <div style={{ filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.5)' }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={44} /></div>
          <div style={{ fontSize: 9.5, fontWeight: 700, marginTop: 2, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owned ? c.name : '???'}</div>
        </button>
      ))}
    </div>
  );

  // 20 · PODIUM — top-3 by level on a podium, the rest as a ranked list
  else if (variant === 'podium') {
    const sorted = [...owned].sort((a, b) => b.level - a.level);
    const top = sorted.slice(0, 3);
    const rest = sorted.slice(3);
    const order = [top[1], top[0], top[2]].filter(Boolean);   // 2nd · 1st · 3rd
    const podH = { 0: 64, 1: 92, 2: 48 };   // by rank
    body = (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10, marginBottom: 18 }}>
          {order.map((c) => {
            const rank = top.indexOf(c);
            return (
              <button key={c.id} onClick={() => openC(c)} style={{ flex: 1, maxWidth: 108, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={rank === 0 ? 78 : 58} />
                <div style={{ fontSize: 12.5, fontWeight: 800, margin: '2px 0 6px' }}>{c.name}</div>
                <div style={{ width: '100%', height: podH[rank], borderRadius: '12px 12px 0 0', background: `linear-gradient(${shade(c.color, 40)}, ${c.color})`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 6 }}>
                  <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{rank + 1}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          {rest.map((c, i) => (
            <button key={c.id} onClick={() => openC(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg3, width: 22 }}>{i + 4}</span>
              <div style={{ width: 40, height: 40, flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={40} /></div>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 800 }}>{c.name}</span>
              <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg2 }}>Lv{c.level}</span>
            </button>
          ))}
        </div>
      </React.Fragment>
    );
  }

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Collection House')} onBack={() => ctx.back()} right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="gem" size={15} color={THEME.gold} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned.length}/{all.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        {/* encyclopedia entry — kept across every variant */}
        <button onClick={() => ctx.nav('chardex')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: 'none', borderRadius: 16, padding: '13px 14px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}>
          <span style={{ width: 34, height: 34, borderRadius: 11, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="book-open" size={17} color={THEME.primary} stroke={2.3} /></span>
          <span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{L('Encyclopedia')}</span>
        </button>
        {body}
      </div>
    </div>
  );
}

export { CollectionVariant, COLLECTION_LAYOUTS };
