// JoanX — child app · CharacterDetail

import React from 'react';
import { battlePower, buyItem, canBuyItem, CHARACTERS, nextStageAt, OUTFITS, PLAYER, STATS, statsFor } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, RARITY, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, OUTFIT_SLOTS } from './shared.jsx';

// ── Character detail / customize / evolve ────────────────────────────
function CharacterDetail({ ctx }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params.id) || CHARACTERS[0];
  // Recolouring is gone — the buddy's colour is fixed to its species art.
  const color = orig.color;
  // Evolution is automatic — a buddy evolves on level-up when its XP fills.
  // No manual evolve action, so stage/level are read-only here.
  const stage = orig.stage;
  const level = orig.level;

  // A-5: outfits are bought here, on the buddy they belong to — not in the
  // Points shop. Free ones are granted as the buddy evolves into their stage.
  // Mirrors the same purchase/equip logic CharVariant uses in CharacterVariants.jsx.
  const [pts, setPts] = React.useState(PLAYER.points);
  const [bought, setBought] = React.useState(() => new Set());
  const [worn, setWorn] = React.useState(() => new Set());
  const [note, setNote] = React.useState(null);
  const [slotFilter, setSlotFilter] = React.useState(OUTFIT_SLOTS[0].id);

  const locked_ = (o) => stage < o.minStage;
  const ownedOutfit = (o) => o.owned || bought.has(o.id) || (o.price === 0 && !locked_(o));
  const toast = (msg) => { setNote(msg); setTimeout(() => setNote(null), 1600); };
  const buyOutfit = (o) => {
    if (ownedOutfit(o)) return;
    const verdict = canBuyItem(o, PLAYER, stage);
    if (!verdict.ok) {
      if (verdict.reason === 'stage') return toast(`${L('Unlocks at Stage')} ${verdict.need}`);
      if (verdict.reason === 'level') return toast(`${L('Unlocks at Lv')} ${verdict.need}`);
      return toast(L('Not enough points yet'));
    }
    buyItem(o, PLAYER, stage); setPts(PLAYER.points);
    setBought(s => new Set(s).add(o.id));
    setWorn(s => new Set(s).add(o.id));
    toast(`${L(o.name)} ${L('unlocked!')}`);
  };
  const toggleWear = (o) => {
    if (!ownedOutfit(o)) return;
    setWorn(s => { const n = new Set(s); n.has(o.id) ? n.delete(o.id) : n.add(o.id); return n; });
  };
  const isWorn = (o) => ownedOutfit(o) && (o.price === 0 || worn.has(o.id));
  const items = OUTFITS.map(o => ({ ...o, on: isWorn(o), own: ownedOutfit(o), locked: locked_(o) }));
  const filteredItems = items.filter(it => it.slot === slotFilter);
  const tapItem = (it) => {
    const o = OUTFITS.find(x => x.id === it.id);
    if (!o || locked_(o)) return;
    ownedOutfit(o) ? toggleWear(o) : buyOutfit(o);
  };
  const itemStatus = (it) => it.locked
    ? `${L('Stage')} ${it.minStage}`
    : it.own
      ? (it.on ? L('Equipped') : L('Tap to equip'))
      : `★ ${it.price}`;

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
      {/* the fighter is already chosen — it's the buddy you're looking at. Carry its id
          into Battle so it lands on the fight ready-to-go, no "Choose your fighter" step. */}
      <ScreenHeader title={orig.name} onBack={() => ctx.back()} right={<button onClick={() => ctx.nav('battle', { charId: orig.id })} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="swords" size={18} color={THEME.joy} stroke={2.2} /></button>} />

      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ borderRadius: 24, padding: '18px', background: `linear-gradient(165deg, ${shade(THEME.brand, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant={orig.rarity === 'epic' ? 'epic' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
            <Badge variant="gold">{L('Stage')} {stage}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
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

        {/* accessories — one OUTFITS slot at a time (A-5.1). Category chips float free
            above the card, their own crisp white pills, rather than crammed inside it
            alongside the grid. */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>{L('Items')}</div>
          <div className="no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', marginBottom: 10 }}>
            {OUTFIT_SLOTS.filter(s => items.some(it => it.slot === s.id)).map(s => {
              const on = slotFilter === s.id;
              return (
                <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 'none', border: on ? 'none' : '1.5px solid rgba(46,43,41,0.08)', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 14px', background: on ? THEME.primary : '#fff', boxShadow: on ? `0 4px 10px ${THEME.primary}4a` : THEME.shadowCard, display: 'inline-flex', alignItems: 'center', gap: 5, color: on ? '#fff' : THEME.fg2, fontWeight: 800, fontSize: 11.5, whiteSpace: 'nowrap' }}>
                  <Icon name={s.icon} size={12} color={on ? '#fff' : THEME.fg3} stroke={2.4} />{L(s.label)}
                </button>
              );
            })}
          </div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10 }}>
            {filteredItems.map(it => (
              <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ position: 'relative', aspectRatio: '1', minWidth: 0, borderRadius: 16, background: it.on ? THEME.primaryLight : THEME.surface2, border: it.on ? `2px solid ${THEME.primary}` : `2px solid transparent`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', opacity: it.locked ? .65 : 1 }}>
                <Icon name={it.locked ? 'lock' : it.icon} size={20} color={it.locked ? THEME.fg3 : it.on ? THEME.primary : THEME.fg2} stroke={2.2} />
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: it.on ? THEME.primary : it.own || it.locked ? THEME.fg3 : THEME.gold }}>{itemStatus(it)}</span>
              </button>
            ))}
          </div>
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth style={{ background: (CHARACTERS.find(x => x.id === PLAYER.activeCharId) || orig).color, boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
      </div>

      {/* outfit purchase feedback */}
      {note && (
        <div className="jx-fade" style={{ position: 'fixed', left: '50%', bottom: 128, transform: 'translateX(-50%)', zIndex: 60, background: THEME.fg1, color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{note}</div>
      )}
    </div>
  );
}

export { CharacterDetail };
