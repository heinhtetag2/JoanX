// JoanX — child app · ChildHome

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Badge, Bar, Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgFor, StatCard } from './shared.jsx';

// ── Child Home ───────────────────────────────────────────────────────
function ChildHome({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      {/* header */}
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', padding: '7px 12px', borderRadius: 999, boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} />
            <span className="game-font" style={{ fontSize: 15, fontWeight: 500 }}>{PLAYER.points.toLocaleString()}</span>
          </button>
          <button onClick={() => ctx.nav('notifications')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: '#fff', border: 'none', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={19} color={THEME.fg1} stroke={2} />
            <span style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 999, background: THEME.danger, border: '2px solid #fff' }} />
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        {/* safety status banner */}
        <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: lite ? THEME.warningLight : THEME.successLight, borderRadius: 16, padding: '12px 14px', marginBottom: 14, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: lite ? THEME.warning : THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={lite ? 'shield' : 'shield-check'} size={20} color="#fff" stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: lite ? '#602f0c' : '#274427' }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
            <div style={{ fontSize: 12, color: lite ? '#602f0c' : '#274427', opacity: .85 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={lite ? '#602f0c' : '#274427'} stroke={2.5} />
        </div>

        {/* character hero */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', borderRadius: 24, padding: '18px 18px 20px', marginBottom: 14, cursor: 'pointer', overflow: 'hidden', background: `linear-gradient(160deg, ${shade(c.color, 78)} 0%, ${THEME.surface} 70%)`, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[c.rarity].label)}</Badge>
              <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 8 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
            </div>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 10px' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
            <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
          </div>
          <div style={{ fontSize: 12, color: THEME.fg2, textAlign: 'center' }}>{c.stage < 3 ? `${c.xpMax - c.xp} XP → ${L('Stage')} ${c.stage + 1}` : L('Fully evolved — max stage!')}</div>
        </div>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatCard icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} big />
          <StatCard icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Day streak')} big />
        </div>

        {/* daily goal */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* quick tiles — hidden (kept for easy restore)
        <SectionHead title={L('Play')} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          <QuickTile icon="layout-grid" color={THEME.primary} bg={THEME.primaryLight} label={L('Collection')} onClick={() => ctx.nav('collection')} />
          <QuickTile icon="swords" color={THEME.joy} bg={THEME.joyBg} label={L('Battle')} onClick={() => ctx.nav('battle')} />
          <QuickTile icon="trophy" color={THEME.gold} bg={THEME.goldLight} label={L('Rewards')} onClick={() => ctx.nav('rewards')} />
          <QuickTile icon="wand-2" color={THEME.camping} bg={THEME.campingBg} label={L('Customize')} onClick={() => ctx.nav('character', { id: c.id })} />
        </div>
        */}

      </div>
    </div>
  );
}

export { ChildHome };
