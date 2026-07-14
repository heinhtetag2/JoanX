// JoanX — child app · CharacterDetail

import React from 'react';
import { battlePower, CHARACTERS, nextStageAt, PLAYER, STATS, statsFor } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, RARITY, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Character detail / customize / evolve ────────────────────────────
function CharacterDetail({ ctx }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params.id) || CHARACTERS[0];
  const [color, setColor] = React.useState(orig.color);
  // Evolution is automatic — a buddy evolves on level-up when its XP fills.
  // No manual evolve action, so stage/level are read-only here.
  const stage = orig.stage;
  const level = orig.level;

  const swatches = ['#e1874a', '#9867e4', '#67c7ce', '#e278a8', '#6697c9', '#ffbc05', '#a8c3eb', '#e86f5f'];
  const items = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', on: stage >= 2 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', on: stage >= 3 },
    { id: 'hat', icon: 'crown', name: 'Star Crown', on: false, locked: true },
    { id: 'glasses', icon: 'glasses', name: 'Cool Shades', on: false, locked: true },
  ];

  // A-3.3 — the four core stats villain battles are fought with. Values are DERIVED
  // from rarity, level and stage (statsFor), so this card cannot drift from the number
  // the battle actually uses. Colour is presentation and stays here; the stat list
  // itself comes from data, so a fifth stat needs no edit to this screen.
  const stats = statsFor(orig);
  const nextAt = nextStageAt(level);
  const STAT_COLOR = { hp: THEME.joy, courage: THEME.gold, protection: THEME.primary, speed: '#4b9a6b' };
  // bars are relative to the best stat on show — a fixed /100 max would peg every bar
  // full the moment a buddy levels past it
  const statMax = Math.max(...STATS.map(s => stats[s.key]), 1);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={orig.name} onBack={() => ctx.back()} right={<button onClick={() => ctx.nav('battle')} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="swords" size={18} color={THEME.joy} stroke={2.2} /></button>} />

      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ borderRadius: 24, padding: '18px', background: `linear-gradient(165deg, ${shade(color, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant={orig.rarity === 'epic' ? 'epic' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
            <Badge variant="gold">{L('Stage')} {stage}</Badge>
          </div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}>
            <Mascot species={orig.species} stage={stage} color={color} size={172} />
          </div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, marginTop: 4 }}>{orig.name}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
            <div style={{ flex: 1 }}><Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500 }}>{orig.xp}/{orig.xpMax}</span>
          </div>
        </div>

        {/* core stats (A-3.3) — HP · Courage · Protection · Speed */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{L('Battle stats')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: THEME.fg2, background: THEME.surface2, borderRadius: 999, padding: '3px 9px' }}>
              <Icon name="swords" size={11} color={THEME.fg2} stroke={2.4} />{L('Power')} {battlePower(orig)}
            </span>
          </div>
          {STATS.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon name={s.icon} size={16} color={STAT_COLOR[s.key]} stroke={2.3} />
              <span style={{ fontSize: 12.5, fontWeight: 700, width: 66 }}>{L(s.label)}</span>
              <div style={{ flex: 1 }}><Bar value={stats[s.key]} max={statMax} color={STAT_COLOR[s.key]} height={8} /></div>
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500, width: 30, textAlign: 'right' }}>{stats[s.key]}</span>
            </div>
          ))}
          {/* what the next stage is worth — the stat step is the reason to keep walking */}
          <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 4 }}>
            {nextAt
              ? `${L('Every stat grows with each level — Stage')} ${stage + 1} ${L('at Lv')} ${nextAt}.`
              : L('Fully grown — every stat is at its peak.')}
          </div>
        </div>

        {/* customize color */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Color')}</div>
          <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
            {swatches.map(s => {
              const sel = color === s;
              return (
                <button key={s} onClick={() => setColor(s)} aria-label={s} style={{
                  width: 32, height: 32, borderRadius: 999, background: s, border: 'none', padding: 0, cursor: 'pointer',
                  boxShadow: sel ? `0 0 0 2.5px #fff, 0 0 0 4.5px ${s}` : 'inset 0 0 0 1px rgba(46,43,41,0.10)',
                  transform: sel ? 'scale(1.06)' : 'none', transition: 'transform .12s ease',
                }} />
              );
            })}
          </div>
        </div>

        {/* customize items */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Items')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
            {items.map(it => (
              <div key={it.id} style={{ position: 'relative', aspectRatio: '1', minWidth: 0, borderRadius: 16, background: it.on ? THEME.primaryLight : THEME.surface2, border: it.on ? `2px solid ${THEME.primary}` : `2px solid transparent`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon name={it.locked ? 'lock' : it.icon} size={20} color={it.locked ? THEME.fg3 : it.on ? THEME.primary : THEME.fg2} stroke={2.2} />
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth style={{ background: (CHARACTERS.find(x => x.id === PLAYER.activeCharId) || orig).color, boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
      </div>
    </div>
  );
}

export { CharacterDetail };
