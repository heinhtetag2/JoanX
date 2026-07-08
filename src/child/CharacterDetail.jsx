// JoanX — child app · CharacterDetail

import React from 'react';
import { CHARACTERS } from '../core/data.jsx';
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

  const traits = [
    { k: 'guard', label: 'Guard', icon: 'shield', color: THEME.primary },
    { k: 'speed', label: 'Speed', icon: 'gauge', color: THEME.gold },
    { k: 'heart', label: 'Heart', icon: 'heart', color: THEME.joy },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={orig.name} onBack={() => ctx.back()} right={<button onClick={() => ctx.nav('battle')} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="swords" size={18} color={THEME.joy} stroke={2.2} /></button>} />

      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ borderRadius: 24, padding: '18px', background: `linear-gradient(165deg, ${shade(color, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant={orig.rarity === 'special' ? 'special' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
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

        {/* traits */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Battle traits')}</div>
          {traits.map(t => (
            <div key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon name={t.icon} size={16} color={t.color} stroke={2.3} />
              <span style={{ fontSize: 12.5, fontWeight: 700, width: 48 }}>{L(t.label)}</span>
              <div style={{ flex: 1 }}><Bar value={orig.traits[t.k] || 50} max={100} color={t.color} height={8} /></div>
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500, width: 24, textAlign: 'right' }}>{orig.traits[t.k] || 50}</span>
            </div>
          ))}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {items.map(it => (
              <div key={it.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, background: it.on ? THEME.primaryLight : THEME.surface2, border: it.on ? `2px solid ${THEME.primary}` : `2px solid transparent`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon name={it.locked ? 'lock' : it.icon} size={20} color={it.locked ? THEME.fg3 : it.on ? THEME.primary : THEME.fg2} stroke={2.2} />
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth style={{ boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
      </div>
    </div>
  );
}

export { CharacterDetail };
