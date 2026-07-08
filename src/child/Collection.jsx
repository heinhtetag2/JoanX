// JoanX — child app · Collection

import React from 'react';
import { CHARACTERS, ROOMS } from '../core/data.jsx';
import { Badge, Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Collection House ─────────────────────────────────────────────────
function Collection({ ctx }) {
  const owned = CHARACTERS.filter(c => c.owned);
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Collection House')} onBack={() => ctx.back()} right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="gem" size={15} color={THEME.gold} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned.length}/{CHARACTERS.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        {/* encyclopedia + friends entry points */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[['book-open', 'Encyclopedia', 'chardex', THEME.primary, THEME.primaryLight], ['users', 'Visit friends', 'friends', THEME.joy, THEME.joyBg]].map(([ic, lbl, dest, col, bg]) => (
            <button key={dest} onClick={() => ctx.nav(dest)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: 'none', borderRadius: 16, padding: '13px 14px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
              <span style={{ width: 34, height: 34, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={17} color={col} stroke={2.3} /></span>
              <span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1, textAlign: 'left', lineHeight: 1.15 }}>{L(lbl)}</span>
            </button>
          ))}
        </div>
        {ROOMS.map(room => {
          const placed = owned.filter(c => c.room === room.id);
          return (
            <div key={room.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{L(room.name)}</span>
                  {!room.unlocked && <Icon name="lock" size={14} color={THEME.fg3} stroke={2.3} />}
                </div>
                <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{room.unlocked ? `${placed.length}/${room.slots}` : L('Locked')}</span>
              </div>

              {room.unlocked ? (
                <div style={{ borderRadius: 22, padding: '20px 14px 14px', background: `linear-gradient(180deg, ${room.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, position: 'relative', overflow: 'hidden' }}>
                  {/* shelf */}
                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    {Array.from({ length: room.slots }).map((_, i) => {
                      const c = placed[i];
                      return c ? (
                        <button key={i} onClick={() => ctx.nav('character', { id: c.id })} style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0 }}>
                          <Mascot species={c.species} stage={c.stage} color={c.color} size={74} />
                          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
                          <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 3, fontSize: 9.5, padding: '2px 7px' }}>Lv{c.level}</Badge>
                        </button>
                      ) : (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 18, border: `2px dashed ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="plus" size={22} color={THEME.fg3} stroke={2.2} />
                          </div>
                          <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 6 }}>{L('Empty')}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* shelf line */}
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.05)', marginTop: 6 }} />
                </div>
              ) : (
                <div style={{ borderRadius: 22, padding: 22, background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock" size={22} color={THEME.fg3} stroke={2.2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{L(room.name)}</div>
                    <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L(room.req)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* all characters grid incl. locked */}
        <SectionHead title={L('All buddies')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {CHARACTERS.map(c => (
            <button key={c.id} disabled={!c.owned} onClick={() => c.owned && ctx.nav('character', { id: c.id })} style={{ background: '#fff', borderRadius: 18, padding: '12px 6px 10px', boxShadow: THEME.shadowCard, border: 'none', cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {!c.owned && <div style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="lock" size={13} color={THEME.fg3} stroke={2.4} /></div>}
              <div style={{ filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.5)' }}>
                <Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={62} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{c.owned ? c.name : '???'}</div>
              <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 4, fontSize: 9, padding: '2px 6px' }}>{L(RARITY[c.rarity].label)}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Collection };
