// JoanX — child app · Shop

import React from 'react';
import { createPortal } from 'react-dom';
import { activeEggs, buyEgg, canConvertPoints, CHARACTERS, convertPointsToXp, eggCount, eggSources, EXCHANGE, hatchFromInventory, maxConvertibleXp, PLAYER, POINTS, pointsForXp, rarityOf, totalEggs, xpToCap } from '../core/data.jsx';
import { Bar, Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, HatchCelebration, StageUpMoment } from './shared.jsx';
import { EggShape, EggHalf, CrackingEgg, eggColorFor, requestMotionPermission, useShakeToHatch, HATCH_MS, HATCH_CRACK_MS } from './EggHatch.jsx';

// ── Points & Shop ────────────────────────────────────────────────────
// Buying is only ONE of the ways an egg arrives (A-2.1) — missions, distance
// milestones, level-ups, events and achievements all grant them too, and those land
// unhatched in PLAYER.eggs. So this screen has two halves: the eggs you already own
// (hatch them now) and the shop (buy another). Both funnel into the same hatch flow.
// The tier roll and the buddy draw live in data.jsx (hatchEgg) — probability is
// business policy, not screen logic, and the missions beat hatches through it too.
// `eggShake` gates the shake-to-hatch gesture and the affordance that teaches it. Off by
// default: the tap is the whole interaction for now, and a block of copy explaining a second
// way to do the thing you just did competes with the egg it sits under.
function Shop({ ctx, eggShake = false, eggHatch = 'pop' }) {
  const gradualCrack = eggHatch === 'crack';   // Tweaks: Egg hatch → gradual crack vs quick pop
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [owned, setOwned] = React.useState(() => ({ ...PLAYER.eggs }));
  const [toast, setToast] = React.useState(null);

  // egg & hatch flow state — { phase:'egg'|'reveal', buddy, dup, xp }
  const [hatch, setHatch] = React.useState(null);

  // A-1.2 · points → EXP. Which buddy the EXP goes into is the child's call, so the
  // exchange keeps its own target rather than silently spending on the active buddy.
  const roster = CHARACTERS.filter(x => x.owned);
  const [targetId, setTargetId] = React.useState(PLAYER.activeCharId);
  const [xpAmt, setXpAmt] = React.useState(EXCHANGE.stepXp);
  const [, redraw] = React.useReducer(n => n + 1, 0);   // XP/level live on the shared roster row
  const target = roster.find(x => x.id === targetId) || roster[0];
  const capLeft = target ? xpToCap(target) : 0;            // EXP the buddy can still absorb
  const ceiling = target ? maxConvertibleXp(target) : 0;   // wallet AND cap, whichever binds first
  // With an empty wallet the ceiling is 0, but "+0 EXP for 0 points" reads like a bug — so a
  // card that cannot be bought still shows the smallest real purchase, greyed out.
  const amount = ceiling >= EXCHANGE.stepXp ? Math.min(xpAmt, ceiling) : EXCHANGE.stepXp;
  const verdict = target ? canConvertPoints(amount, target) : { ok: false, reason: 'no-buddy' };

  // A-3.3 — a purchase can carry the buddy across a stage threshold. When it does, the
  // transformation gets the full-screen beat instead of a toast that says "Lv 8".
  const [stageUp, setStageUp] = React.useState(null);

  const convert = () => {
    const res = convertPointsToXp(amount, target);
    if (!res.ok) return;
    setPts(PLAYER.points);
    setXpAmt(EXCHANGE.stepXp);
    redraw();
    if (res.stageUp) return setStageUp({ character: target, stage: res.stageUp });
    setToast({ ok: true, msg: res.levels ? `${L('Level up!')} Lv ${target.level}` : `+${res.gained} EXP` });
    setTimeout(() => setToast(null), 1800);
  };

  // The overlay opens on the EGG alone. Nothing is rolled and nothing is spent yet — the egg
  // is only consumed, and the buddy only drawn, at the reveal (hatchFromInventory). Rolling
  // here would mean an abandoned animation had already decided the character and eaten the egg.
  const openHatch = (egg) => {
    if (eggShake) requestMotionPermission();   // iOS 13+: must be asked from this user gesture
    setHatch({ phase: 'egg', egg, eggRarity: egg.rarity });
  };

  // A-2.3 — buying an egg puts an EGG in the bag. It does not hatch it: the rules live in
  // data.jsx (buyEgg), so no screen can take the points without handing over the egg. The
  // hatch overlay opens straight after as a convenience, but the egg is already yours — back
  // out of it and it is sitting in "Your eggs", waiting.
  const purchase = (egg) => {
    const res = buyEgg(egg, PLAYER);
    if (!res.ok) {
      const msg = res.reason === 'not-for-sale' ? L('Only from events and missions')
        : res.reason === 'level' ? `${L('Unlocks at Lv')} ${res.need}`
        : L('Not enough points yet');
      setToast({ ok: false, msg }); setTimeout(() => setToast(null), 1600);
      return;
    }
    setPts(PLAYER.points);
    setOwned({ ...PLAYER.eggs });
    openHatch(egg);
  };

  // A-2.3 — hatching costs nothing beyond the egg itself. No power, no energy, no second
  // currency: the egg was already paid for (or earned), and pressing Hatch is free.
  const hatchOwned = (egg) => {
    if (eggCount(egg.id) < 1) return;
    openHatch(egg);   // the egg is spent at the REVEAL, not here — see revealEgg
  };
  // A tap and a shake can both crack the same egg, and each schedules a reveal — so the crack
  // is latched. Without it, two reveals fire, and since the reveal is what SPENDS the egg,
  // one careless double-hatch would eat two eggs and hand out two buddies for one.
  const cracking = React.useRef(false);
  const crackEgg = () => {
    if (cracking.current) return;
    cracking.current = true;
    setHatch(h => (h && h.phase === 'egg' ? { ...h, phase: 'cracking' } : h));
    // hold the reveal for the length of the chosen animation — the gradual crack
    // runs longer on purpose, so the fissure has time to spread before the pop
    setTimeout(() => revealEgg(hatchEggRef.current), gradualCrack ? HATCH_CRACK_MS : HATCH_MS);
  };

  // the egg being hatched, readable from the timer without depending on a stale closure
  const hatchEggRef = React.useRef(null);
  React.useEffect(() => { hatchEggRef.current = hatch?.egg || null; }, [hatch]);

  // shake-to-hatch: while the egg is waiting, a firm phone shake also cracks it
  useShakeToHatch(eggShake && hatch?.phase === 'egg', crackEgg);

  // A-2.3 — the reveal IS the hatch: one call spends the egg, rolls the rarity tier from the
  // egg's own odds, draws the buddy and grants it. Atomic, so there is never a moment where
  // the egg is gone and no character has arrived. The mutation is deliberately NOT inside a
  // setState updater — an updater must be pure, and a hatch is the least pure thing here.
  const revealEgg = (egg) => {
    if (!egg) return;
    const res = hatchFromInventory(egg, PLAYER);
    if (!res.ok) { setHatch(null); cracking.current = false; return; }   // nothing to hatch — don't fake a reveal
    setOwned({ ...PLAYER.eggs });
    setPts(PLAYER.points);
    setHatch(h => (h ? { ...h, phase: 'reveal', buddy: res.buddy, dup: res.dup, xp: res.xp } : h));
  };

  const closeHatch = () => { cracking.current = false; setHatch(null); redraw(); };


  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Points')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* balance */}
        <div style={{ borderRadius: 22, padding: '20px 18px', background: 'linear-gradient(160deg,#fff2d1,#fff 78%)', boxShadow: THEME.shadowCard, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="star" size={30} color={THEME.gold} fill={THEME.gold} stroke={2} />
            <span className="game-font" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{pts.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L('Your points')}</div>
          {/* how points are actually earned (F-13 / A-1.1) — battles pay no points */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['footprints', L('Safe walking'), `+${POINTS.perSafeMinute} / ${L('min')}`],
              ['hand', L('Safe stop'), `+${POINTS.postWarningStopBonus}–${POINTS.selfCorrectBonus}`],
              ['shield-check', L('Accident-free day'), `+${POINTS.dailyAccidentFreeBonus}`]].map(([ic, t, v], i) => (
              <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Icon name={ic} size={16} color={THEME.gold} stroke={2.3} />
                <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{v}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.fg2, textAlign: 'center', lineHeight: 1.15 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* eggs you already earned (A-2.1) — from missions, milestones, level-ups,
            events, achievements. They sit here until you hatch them, so an egg won
            by walking never gets lost in a notification the child swiped away. */}
        {totalEggs() > 0 && (
          <React.Fragment>
            <SectionHead title={L('Your eggs')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {activeEggs().filter(egg => (owned[egg.id] || 0) > 0).map(egg => {
                const rar = RARITY[egg.rarity];
                const n = owned[egg.id];
                return (
                  <div key={egg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}40`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard }}>
                    <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EggShape size={56} rarity={egg.rarity} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                        {n > 1 && <span style={{ fontSize: 11, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '1px 7px', borderRadius: 999 }}>×{n}</span>}
                      </div>
                      <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>{L('Earned — ready to hatch')}</div>
                    </div>
                    <button onClick={() => hatchOwned(egg)} className="jx-press" style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: rar.fg, color: '#fff', borderRadius: 999, padding: '9px 15px', fontSize: 13, fontWeight: 800 }}>
                      {L('Hatch')}
                    </button>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {/* buddy eggs — one per rarity, priced + gated by EGGS (A-2 / F-15) */}
        <SectionHead title={L('Buddy Eggs')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {activeEggs().map(egg => {
            const rar = RARITY[egg.rarity];
            const locked = PLAYER.level < egg.minLevel;      // level gate
            const unbuyable = egg.price == null;             // reward-only
            const afford = !unbuyable && pts >= egg.price;
            const on = !unbuyable && !locked && afford;      // fully purchasable now
            // A-2.1 — every way this egg can be earned, read off the grant table.
            // Nothing is hand-listed here, so adding a grant rule surfaces it.
            const earnable = eggSources(egg.id).filter(s => s.key !== 'purchase');
            // the epic egg is a prize, not a dead item — never dim it. Only a
            // level-locked egg should read as unavailable.
            return (
              <div key={egg.id} style={{ background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}${unbuyable ? '55' : '22'}`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, opacity: locked ? .78 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {/* the eggs in this list sit still — the float belongs to the hatch flow, where
                      the egg is the thing you tap, not to a price list you are reading down */}
                  <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked ? 'grayscale(.5)' : 'none' }}>
                    <EggShape size={56} rarity={egg.rarity} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, color: rar.fg, background: rar.bg, padding: '2px 7px', borderRadius: 999 }}>{L(rar.label)}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>
                      {locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy')}
                    </div>
                  </div>

                  {unbuyable ? (
                    <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800 }}>
                      <Icon name="gift" size={13} color={THEME.gold} stroke={2.3} />{L('Reward')}
                    </span>
                  ) : (
                    <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? rar.fg : THEME.surface2, color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Icon name={locked ? 'lock' : 'star'} size={13} color={on ? '#fff' : THEME.fg3} fill={locked ? 'none' : (on ? '#fff' : THEME.fg3)} stroke={2} />
                      {egg.price.toLocaleString()}
                    </button>
                  )}
                </div>

                {/* how else to get one — the earn routes, so a reward-only egg reads as
                    a goal with a path rather than a locked item with a shrug */}
                {earnable.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${rar.fg}1f` }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, alignSelf: 'center', marginRight: 2 }}>{L('Also earn from')}</span>
                    {earnable.map(s => (
                      <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5, background: '#fff', border: `1px solid ${rar.fg}2e`, color: THEME.fg2, borderRadius: 999, padding: '3.5px 9px', fontSize: 10.5, fontWeight: 800 }}>
                        <Icon name={s.icon} size={11} color={rar.fg} stroke={2.4} />{L(s.label)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* A-1.2 — the other thing points buy: EXP for a buddy you already have.
            The rate comes from EXCHANGE (server-configurable), and it is printed on the
            card rather than buried, because "how much walking is a level worth" is the
            question the child is actually asking. Buying is capped by xpToCap so no point
            is ever spent on EXP that lands past the level cap. */}
        {target && (
          <React.Fragment>
            <SectionHead title={L('Grow your buddy')} />
            <div style={{ background: 'linear-gradient(150deg,#fff2d1,#fff 72%)', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 700, lineHeight: 1.4 }}>{L('Turn points into EXP for a buddy.')}</span>
                <span className="game-font" style={{ marginLeft: 'auto', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', color: THEME.fg1, borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 500 }}>
                  <Icon name="star" size={12} color={THEME.gold} fill={THEME.gold} stroke={2} />{EXCHANGE.pointsPerXp} = 1 EXP
                </span>
              </div>

              {/* who gets it — the roster, so the choice is visible rather than implied */}
              {roster.length > 1 && (
                <div className="no-sb" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 12 }}>
                  {roster.map(b => {
                    const on = b.id === target.id;
                    return (
                      <button key={b.id} onClick={() => { setTargetId(b.id); setXpAmt(EXCHANGE.stepXp); }} className="jx-press"
                        style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: on ? '#fff' : 'transparent', border: `1.5px solid ${on ? b.color : 'transparent'}`, borderRadius: 14, padding: '5px 7px', cursor: 'pointer', fontFamily: 'inherit', opacity: b.maxed ? .5 : 1 }}>
                        <MascotChip species={b.species} stage={b.stage} color={b.color} size={34} bg="transparent" />
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: on ? THEME.fg1 : THEME.fg3 }}>{b.maxed ? L('MAX') : `Lv ${b.level}`}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* where that buddy stands right now */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 13.5, fontWeight: 800, flexShrink: 0 }}>{target.name}</span>
                <div style={{ flex: 1 }}><Bar value={target.xp} max={target.xpMax} color={THEME.gold} /></div>
                <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg2, flexShrink: 0 }}>
                  {target.maxed ? L('MAX') : `${target.xp}/${target.xpMax}`}
                </span>
              </div>

              {target.maxed ? (
                <div style={{ fontSize: 12.5, color: THEME.fg2, textAlign: 'center', padding: '10px 0', fontWeight: 700 }}>
                  {L('This buddy finished growing. Pick another one.')}
                </div>
              ) : (
                <React.Fragment>
                  {/* stepper — the child picks the amount, so points stay theirs to allocate */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 16, padding: '10px 12px', marginBottom: 10 }}>
                    {[['minus', -EXCHANGE.stepXp], ['plus', EXCHANGE.stepXp]].map(([ic, d], i) => {
                      const next = amount + d;
                      const can = next >= EXCHANGE.stepXp && next <= ceiling;
                      return (
                        <button key={ic} onClick={() => can && setXpAmt(next)} disabled={!can} aria-label={L(d > 0 ? 'More' : 'Less')}
                          className={can ? 'jx-press' : undefined}
                          style={{ order: i * 2, flexShrink: 0, width: 34, height: 34, borderRadius: 999, border: 'none', background: can ? THEME.goldLight : THEME.surface2, cursor: can ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name={ic} size={16} color={can ? '#9e7300' : THEME.fg3} stroke={2.6} />
                        </button>
                      );
                    })}
                    <div style={{ order: 1, flex: 1, textAlign: 'center', minWidth: 0 }}>
                      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.1 }}>+{amount} EXP</div>
                      <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 700, marginTop: 2 }}>
                        {pointsForXp(amount).toLocaleString()} {L('points')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setXpAmt(ceiling)} disabled={ceiling < EXCHANGE.stepXp} className={ceiling >= EXCHANGE.stepXp ? 'jx-press' : undefined}
                      style={{ flexShrink: 0, border: `1.5px solid ${THEME.border}`, background: '#fff', color: ceiling >= EXCHANGE.stepXp ? THEME.fg1 : THEME.fg3, borderRadius: 14, padding: '0 14px', fontSize: 13, fontWeight: 800, fontFamily: 'inherit', cursor: ceiling >= EXCHANGE.stepXp ? 'pointer' : 'default' }}>
                      {L('Max')}
                    </button>
                    <button onClick={convert} disabled={!verdict.ok} className={verdict.ok ? 'jx-press' : undefined}
                      style={{ flex: 1, border: 'none', background: verdict.ok ? THEME.gold : THEME.surface2, color: verdict.ok ? '#fff' : THEME.fg3, borderRadius: 14, padding: '13px 0', fontSize: 14.5, fontWeight: 800, fontFamily: 'inherit', cursor: verdict.ok ? 'pointer' : 'default' }}>
                      {verdict.ok ? L('Convert') : L(capLeft < EXCHANGE.stepXp ? 'Almost at the level cap' : 'Not enough points yet')}
                    </button>
                  </div>
                </React.Fragment>
              )}
            </div>
          </React.Fragment>
        )}

        {/* Outfits are NOT sold here (A-5): an outfit belongs to a character, so
            it is bought on that buddy's own detail screen, where you can see it
            on them. This card just points the way. */}
        <SectionHead title={L('Outfits')} />
        <button onClick={() => ctx.nav('character', { id: c.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: 'none', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 18, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={44} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Dress up your buddy')}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>{L('Outfits are bought on each buddy’s page — some unlock as they evolve.')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
        </button>

        {/* rooms are earned by milestones (see Collection), not bought — so the
            Shop stays eggs only, avoiding a conflicting acquisition story. */}
      </div>

      {/* egg hatch overlay (A-2 / F-15) — portaled to the phone screen so it
          covers the tab bar, matching the app's full-screen "moment" pattern */}
      {hatch && createPortal((() => {
        const reveal = hatch.phase === 'reveal';
        const cracking = hatch.phase === 'cracking';
        // A-2.3 — the buddy does not exist until the reveal: the tier is rolled and the
        // character drawn at hatch time, not when the overlay opens. So nothing here may
        // read `buddy` before then — the pre-reveal half of this overlay is about the EGG.
        const b = reveal ? hatch.buddy : null;
        const rar = b ? RARITY[b.rarity] : null;
        const eggC = eggColorFor(hatch.eggRarity);   // shell colour of the egg being hatched
        return (
          <div className={`jx-fade${reveal ? '' : ' jx-egg-bg'}`} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', ...(reveal
            ? { background: `radial-gradient(120% 80% at 50% 34%, ${shade(b.color, 70)} 0%, ${shade(b.color, 92)} 58%, #fff 100%)` }
            : { '--egg-a': shade(eggC, 38), '--egg-b': shade(eggC, 66), '--egg-base': shade(eggC, 92) }) }}>
            {!reveal ? (
              <React.Fragment>
                {/* rings + tappable egg — tinted to the EGG, not the buddy inside */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
                  <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
                  <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
                  {/* quick-pop glow — the gradual crack brings its own seam-light instead */}
                  {cracking && !gradualCrack && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(eggC, 60)} 0%, transparent 68%)` }} />}
                  <button onClick={cracking ? undefined : crackEgg} disabled={cracking} className={`jx-press ${cracking ? (gradualCrack ? '' : 'jx-egg-hatch') : 'jx-egg-idle'}`} aria-label={L('Tap to hatch')} style={{ background: 'none', border: 'none', cursor: cracking ? 'default' : 'pointer', padding: 0 }}>
                    {cracking && gradualCrack
                      ? <CrackingEgg size={132} rarity={hatch.eggRarity} />
                      : <EggShape size={132} rarity={hatch.eggRarity} />}
                  </button>
                </div>
                <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Buddy Egg')}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: cracking ? .85 : 1 }}>
                  <Icon name={cracking ? 'hourglass' : 'pointer'} size={15} color={eggC} stroke={2.3} className={cracking ? 'jx-pulse-soft' : undefined} />{L(cracking ? 'Hatching…' : 'Tap to hatch')}
                </div>
                {/* shake affordance — parked at the far bottom, bigger + its own copy */}
                {eggShake && !cracking && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom) + 46px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(eggC, 64), alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="vibrate" size={28} color={shade(eggC, -28)} stroke={2.3} />
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Shake to hatch too')}</div>
                    <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('Give your phone a little shake')}</div>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {/* the hatch celebration — now shared, so the missions beat plays the same one */}
                <HatchCelebration color={b.color} accent={rar.fg} />

                {/* status ribbon — solid white pill so it reads on any buddy tint */}
                <div className="jx-drop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(46,43,41,.08)', color: hatch.dup ? shade(THEME.gold, -40) : THEME.fg1, borderRadius: 999, padding: '6px 14px 6px 12px', fontSize: 12.5, fontWeight: 800, letterSpacing: .3, position: 'relative', marginBottom: 16 }}>
                  {hatch.dup
                    ? <React.Fragment><Icon name="zap" size={14} color={THEME.gold} fill={THEME.gold} stroke={1.8} />+{hatch.xp} XP</React.Fragment>
                    : <React.Fragment><Icon name="egg" size={14} color={b.color} stroke={2.3} />{L('New buddy!')}</React.Fragment>}
                </div>

                {/* the hatch: buddy pops out of a cracked-open shell over a soft glow */}
                <div className="jx-gift-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${shade(b.color, 74)} 0%, rgba(255,255,255,0) 66%)`, zIndex: 0 }} />
                  <div className="jx-burst" style={{ position: 'absolute', top: '48%', left: '50%', width: 210, height: 210, borderRadius: 999, border: `3px solid ${b.color}`, opacity: 0, zIndex: 0 }} />
                  {/* cracked eggshell halves under the buddy's feet */}
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, zIndex: 1 }}>
                    <EggHalf color={eggC} />
                    <EggHalf color={eggC} flip />
                  </div>
                  <div className="jx-float" style={{ position: 'relative', zIndex: 2 }}><Mascot species={b.species} stage={2} color={b.color} size={182} /></div>
                </div>

                {/* name with an inline rarity gem chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', marginTop: 6 }}>
                  <h1 className="game-font" style={{ fontSize: 31, fontWeight: 500, margin: 0 }}>{b.name}</h1>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1.5px solid ${rar.fg}40`, color: b.rarity === 'common' ? THEME.fg2 : rar.fg, borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 800 }}>
                    <Icon name="gem" size={12} color={b.rarity === 'common' ? THEME.fg2 : rar.fg} stroke={2.4} />{L(rar.label)}
                  </span>
                </div>
                <p style={{ fontSize: 14.5, color: THEME.fg2, lineHeight: 1.5, margin: '10px 0 0', position: 'relative' }}>
                  {hatch.dup ? `${L('You already have')} ${b.name} — ${L('turned into XP')}` : L('Added to your collection')}
                </p>

                {/* CTA — flat, buddy-tinted, full-width pill (no glow, no icon) */}
                <button onClick={closeHatch} className="jx-press" style={{ marginTop: 30, width: 260, maxWidth: '82%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: b.color, color: '#fff', borderRadius: 18, padding: '15px 0', fontSize: 15.5, fontWeight: 800, boxShadow: 'none' }}>
                  {hatch.dup ? L('Awesome!') : L('Keep it')}
                </button>
              </React.Fragment>
            )}
          </div>
        );
      })(), document.querySelector('.screen') || document.body)}

      {/* stage-up (A-3.3) — portaled to the phone screen like the hatch, so the buddy's
          new form covers the tab bar instead of being a card in a shop list */}
      {stageUp && createPortal(
        <StageUpMoment character={stageUp.character} stage={stageUp.stage} color={stageUp.character.color}
          onDone={() => { setStageUp(null); redraw(); }} />,
        document.querySelector('.screen') || document.body)}

      {/* toast */}
      {toast && (
        <div className="jx-pop" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: toast.ok ? THEME.fg1 : THEME.danger, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, boxShadow: THEME.shadowXl }}>
            <Icon name={toast.ok ? 'party-popper' : 'info'} size={16} color="#fff" stroke={2.3} />{toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export { Shop };
