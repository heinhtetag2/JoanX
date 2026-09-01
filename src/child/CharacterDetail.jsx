// JoanX — child app · CharacterDetail

import React from 'react';
import { buyItem, canBuyItem, canConvertPoints, CHARACTERS, convertPointsToXp, EXCHANGE, OUTFITS, PLAYER, pointsForXp, STATS, statsFor } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, RARITY, SafePointIcon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade, tint } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, outfitSlotsFor, outfitItemsFor } from './shared.jsx';

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
  const slots = outfitSlotsFor(orig);
  const [slotFilter, setSlotFilter] = React.useState(slots[0].id);
  const [tab, setTab] = React.useState('stat');

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
  const items = outfitItemsFor(orig, OUTFITS).map(o => ({ ...o, on: isWorn(o), own: ownedOutfit(o), locked: locked_(o) }));
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
  const STAT_COLOR = { courage: THEME.gold, protection: THEME.primary, speed: '#4b9a6b' };
  // HP is hidden from this view (still drives battle math via STATS/statsFor)
  const shownStats = STATS.filter(s => s.key !== 'hp');
  // rings are relative to the biggest stat on show — a fixed /100 dial would peg
  // every ring full the moment a buddy levels past it
  const statMax = Math.max(...shownStats.map(s => stats[s.key]), 1);
  const traits = shownStats.map(s => ({ k: s.key, label: s.label, icon: s.icon, color: STAT_COLOR[s.key] }));
  // detail chrome — tabs, accents — is always the product green, never the buddy's own
  // colour, so switching buddies never repaints the screen (only the stat rings keep
  // their per-stat hues)
  const accent = THEME.brand;

  // A-1.2 — the points→EXP exchange, spec'd and built in data.jsx (convertPointsToXp) but
  // never wired into a screen. Lives here, on the buddy's own page, rather than the Points
  // shop — you're already looking at the one buddy you'd spend on. One fixed-size tap
  // (EXCHANGE.stepXp at a time), matching CharacterVariants.jsx's own xpAdd. Tweaks: Add-XP
  // style — 'cta' is the shipped default (see xpAdd's own 'cta' branch below); 'text'/
  // 'chip'/'row'/'sticker' etc. are real alternatives.
  const xpAddStyle = ctx.tweaks?.xpAddStyle || 'cta';
  const xpAdd = () => {
    if (!(orig.owned && !orig.maxed)) return null;
    const verdict = canConvertPoints(EXCHANGE.stepXp, orig, PLAYER);
    const cost = pointsForXp(EXCHANGE.stepXp);
    const on = verdict.ok;
    const onTap = () => {
      const res = convertPointsToXp(EXCHANGE.stepXp, orig, PLAYER);
      if (!res.ok) return toast(L('Not enough points yet'));
      setPts(PLAYER.points);
      toast(res.stageUp ? `${orig.name} ${L('Evolved!')}` : res.levels ? `${orig.name} ${L('Level up!')}` : `+${EXCHANGE.stepXp} XP`);
    };
    const ink = on ? shade(THEME.gold, -30) : THEME.fg3;

    // 'text' — bare icon + bold label, muted cost alongside, no chip fill at all — the
    // same bare-button idiom as "Skip"/"Not now" and an outfit tile's price line.
    if (xpAddStyle === 'text') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', padding: '4px 2px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 600, color: THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'chip' — the same content, given an actual flat tap-target: a gold-tinted pill (no
    // shadow, per the app's flat chrome) with a hairline divider before the cost, so it
    // reads as one control instead of text floating free under the bar.
    if (xpAddStyle === 'chip') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', borderRadius: 999, background: on ? tint(THEME.gold, .84) : THEME.surface2, padding: '7px 14px 7px 12px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ width: 1, height: 14, background: on ? shade(THEME.gold, -6) : THEME.border, opacity: .5 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: ink }}><SafePointIcon size={13} />{cost}</span>
        </button>
      );
    }
    // 'row' — a full-width action row (plain "Add XP" label left, a solid gold cost pill
    // right) — the same weight as the daily-task "Go" row, for when the control wants
    // more presence than a small inline chip.
    if (xpAddStyle === 'row') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: THEME.fg1 }}>
            <Icon name="zap" size={14} color={THEME.gold} fill={THEME.gold} stroke={2.4} />{L('Add')} {EXCHANGE.stepXp} XP
          </span>
          <button onClick={onTap} className={on ? 'jx-press' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: 999, background: on ? THEME.gold : THEME.surface2, color: on ? '#fff' : THEME.fg3, padding: '7px 13px', fontSize: 12.5, fontWeight: 800, cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            <SafePointIcon size={13} />{cost}
          </button>
        </div>
      );
    }
    // 'sticker' — a tilted dashed-border tag, the app's own "collectible" framing (see
    // outfit price tags), with the real point icon in place of a ★ glyph.
    if (xpAddStyle === 'sticker') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px dashed ${on ? shade(THEME.gold, -6) : THEME.border}`, background: on ? shade(THEME.gold, 82) : THEME.surface2, borderRadius: 10, padding: '5px 10px', transform: 'rotate(-2.5deg)', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={12} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: ink }}>+{EXCHANGE.stepXp} XP</span>
          <span style={{ width: 1, height: 11, background: on ? shade(THEME.gold, -6) : THEME.border, opacity: .6 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: ink }}><SafePointIcon size={11} />{cost}</span>
        </button>
      );
    }
    // 'badge' — not a bespoke button at all: the real Badge primitive this exact card
    // already uses for Rare/Stage 3, just wrapped in a bare tap target — nothing reads
    // less "invented" than reusing the actual design-system component in place.
    if (xpAddStyle === 'badge') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', padding: 0, cursor: on ? 'pointer' : 'default', opacity: on ? 1 : .6, fontFamily: 'inherit' }}>
          <Badge variant="gold"><Icon name="zap" size={10} color="#9e7300" stroke={2.8} />{L('Add')} {EXCHANGE.stepXp} XP</Badge>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'stack' — a compact two-line tile (label on top, cost big underneath), the same
    // icon+number+label skeleton the stat rings just below already use, instead of every
    // other style's single-line row.
    if (xpAddStyle === 'stack') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, border: 'none', borderRadius: 14, background: on ? tint(THEME.gold, .86) : THEME.surface2, padding: '8px 16px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: ink }}>
            <Icon name="zap" size={11} color={ink} stroke={2.4} fill={on ? ink : 'none'} />{L('Add')} {EXCHANGE.stepXp} XP
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 800, color: ink }}><SafePointIcon size={13} />{cost}</span>
        </button>
      );
    }
    // 'outline' — a lightweight bordered button, no fill — lighter weight than 'chip'/
    // 'row', matching the outlined idiom the stepper/decorate-tab chips use elsewhere.
    if (xpAddStyle === 'outline') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: `1.5px solid ${on ? THEME.gold : THEME.border}`, borderRadius: 999, background: '#fff', padding: '6px 13px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700, color: on ? shade(THEME.gold, -10) : THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'cta' — promoted to the PRIMARY action of the stacked footer pair: this is the
    // repeatable, stay-on-the-page action a child taps over and over while grinding a
    // buddy up, so it earns the solid weight; "Set as my buddy" (a one-off, page-ending
    // choice) drops to the outline secondary beneath it — see the fixed-footer stack below.
    // Solid fill borrows the buddy's own color (same rule "Set as my buddy" used to use),
    // not gold — gold stays reserved for the small points-cost readout only.
    return (
      <Button variant="primary" size="lg" fullWidth icon="zap" disabled={!on} onClick={onTap} style={{ background: color, boxShadow: 'none' }}>
        {L('Add')} {EXCHANGE.stepXp} XP
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><SafePointIcon size={14} />{cost}</span>
      </Button>
    );
  };

  // Tweaks: Character detail · XP bar style — 'inline' (default, untouched) is the thin
  // bar+number row above; 'card' is the boxed XP readout from the reference mock (hex XP
  // badge, big current/total, thicker bar+%, "to next level" caption), recolored to this
  // app's own XP gold rather than the reference's green (gold-reserved-for-points-xp).
  // Kept in sync with CharacterVariants.jsx's xpCard.
  const xpBarStyle = ctx.tweaks?.xpBarStyle || 'inline';
  const xpCard = (
    <div style={{ maxWidth: 320, margin: '14px auto 0', background: '#fff', border: `1.5px solid ${THEME.border}`, borderRadius: 20, padding: 16, textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="game-font" style={{ width: 44, height: 44, flexShrink: 0, clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: shade(THEME.gold, -20) }}>XP</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{orig.xp.toLocaleString()}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: THEME.fg3 }}>/ {orig.xpMax.toLocaleString()} XP</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} glow />
        <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: THEME.fg2, flexShrink: 0 }}>{Math.round(orig.xp / orig.xpMax * 100)}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
        <Icon name="star" size={12} color={THEME.fg3} stroke={2.2} />
        <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600 }}>{(orig.xpMax - orig.xp).toLocaleString()} {L('XP to next level')}</span>
      </div>
      {/* 'cta' rides in the fixed footer above "Set as my buddy" instead — see below */}
      {xpAddStyle !== 'cta' && <div style={{ textAlign: 'center', marginTop: 8 }}>{xpAdd()}</div>}
    </div>
  );

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
          {xpBarStyle === 'card' ? xpCard : (
            <React.Fragment>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
                <div style={{ flex: 1 }}>
                  <Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} glow />
                </div>
                <span className="game-font" style={{ fontSize: 12, fontWeight: 500 }}>{orig.xp}/{orig.xpMax}</span>
              </div>
              {xpAddStyle !== 'cta' && <div style={{ textAlign: 'center' }}>{xpAdd()}</div>}
            </React.Fragment>
          )}
        </div>

        {/* stats (A-3.3) + accessories (A-5.1) — one frosted segmented toggle over the
            same flat card/well chrome the rest of the app uses (never a colored glow):
            rings read at a glance with no header needed, items keep their own category
            chips underneath, floating free above the card rather than crammed inside it. */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.42)', borderRadius: 16, padding: 4, marginBottom: tab === 'item' ? 10 : 14, border: '1.5px solid rgba(255,255,255,0.55)' }}>
            {[['stat', L('Stats'), 'swords'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
              const on = tab === id;
              const offText = shade(accent, -48), offIcon = shade(accent, -34);
              return (
                <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '10px 4px', background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: on ? accent : offText, fontWeight: 800, fontSize: 12.5 }}>
                  <Icon name={icon} size={14} color={on ? accent : offIcon} stroke={2.4} />{label}
                </button>
              );
            })}
          </div>

          {tab === 'item' && (
            <div className="no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 2px 10px', margin: '0 -2px 4px' }}>
              {slots.filter(s => items.some(it => it.slot === s.id)).map(s => {
                const on = slotFilter === s.id;
                return (
                  <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 'none', border: `1.5px solid ${on ? accent : 'transparent'}`, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 14px', background: on ? '#fff' : 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'inline-flex', alignItems: 'center', gap: 5, color: on ? accent : shade(accent, -44), fontWeight: 800, fontSize: 11.5, whiteSpace: 'nowrap' }}>
                    <Icon name={s.icon} size={12} color={on ? accent : shade(accent, -30)} stroke={2.4} />{L(s.label)}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(46,43,41,0.12)', borderRadius: 20, padding: 16, boxShadow: '0 10px 26px rgba(46,43,41,0.10)', minHeight: 150, display: 'flex', alignItems: 'center' }}>
            {tab === 'stat' ? (
              <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                {traits.map(t => {
                  const v = stats[t.k];
                  const R = 31, SW = 7, sz = 2 * (R + SW), circ = 2 * Math.PI * R;
                  return (
                    <div key={t.k} style={{ textAlign: 'center' }}>
                      <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
                        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={`${t.color}26`} strokeWidth={SW} />
                          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v / statMax)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                          <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
                          <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{v}</span>
                        </div>
                      </div>
                      <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginTop: 9 }}>{L(t.label)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, width: '100%' }}>
                {filteredItems.map(it => (
                  <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 9, minWidth: 0, borderRadius: 16, background: '#fff', border: 'none', boxShadow: THEME.shadowCard, padding: '10px 10px', cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', opacity: it.locked ? .65 : 1 }}>
                    {it.on && <span style={{ position: 'absolute', top: 7, right: 7, width: 15, height: 15, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={9} color="#fff" stroke={3.5} /></span>}
                    {it.img && !it.locked
                      ? <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
                      : <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? accent : THEME.fg2} stroke={2.3} />
                        </div>}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: it.locked ? THEME.fg3 : THEME.fg1, lineHeight: 1.2 }}>{L(it.name)}</div>
                      <div style={{ fontSize: 9.5, fontWeight: 700, color: it.on ? accent : it.own || it.locked ? THEME.fg3 : THEME.gold, marginTop: 1 }}>{itemStatus(it)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 76 }} />
      </div>

      {/* pinned to the screen frame, not the scroll container — same fixed-bottom-CTA
          idiom as ParentDetail's danger actions, so the buddy action is always in reach
          regardless of scroll position. Add-XP's 'cta' style takes over as the PRIMARY
          (solid) action here — the repeatable one — with "Set as my buddy" (a one-off,
          page-ending choice) demoted to the outline secondary above it, matching the
          app's own solid-primary-at-the-bottom stacking order (ParentDetail's billing pair). */}
      <div style={{ position: 'fixed', left: 16, right: 16, bottom: 24, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button variant={xpAddStyle === 'cta' ? 'outline' : 'primary'} size="lg" fullWidth style={xpAddStyle === 'cta' ? { borderColor: THEME.fg3 } : { background: (CHARACTERS.find(x => x.id === PLAYER.activeCharId) || orig).color, boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
        {xpAddStyle === 'cta' && xpAdd()}
      </div>

      {/* outfit purchase feedback */}
      {note && (
        <div className="jx-fade" style={{ position: 'fixed', left: '50%', bottom: 128, transform: 'translateX(-50%)', zIndex: 60, background: THEME.fg1, color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{note}</div>
      )}
    </div>
  );
}

export { CharacterDetail };
