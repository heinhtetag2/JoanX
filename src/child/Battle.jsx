// JoanX — child app · Battle

import React from 'react';
import { BATTLES_PER_DAY, BATTLE_REWARDS, CHARACTERS, PLAYER, VILLAINS } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, Confetti } from './shared.jsx';
import { BattleSelect } from './BattleVariants.jsx';

function Battle({ ctx, layout = 'classic' }) {
  const owned = CHARACTERS.filter(c => c.owned);
  const [sel, setSel] = React.useState(owned[0]);
  const [phase, setPhase] = React.useState('select'); // select|matching|versus|result
  const [won, setWon] = React.useState(true);
  // the result screen must report the battle that just happened, not what a
  // re-render now computes — `villain.defeated` flips the moment we win.
  const [wasFirstClear, setWasFirstClear] = React.useState(false);
  const [lastReward, setLastReward] = React.useState(BATTLE_REWARDS.firstClear);
  // A-8: up to BATTLES_PER_DAY challenges per day (persists this session)
  const [usedCount, setUsedCount] = React.useState(PLAYER.battlesToday || 0);
  const left = Math.max(0, BATTLES_PER_DAY - usedCount);
  const usedToday = left === 0;
  // A-8: the ladder is climbed sequentially — the next undefeated foe is the
  // default target. A-8.1: an already-beaten villain can be re-challenged, so
  // the target is state, not a derived constant.
  const nextIdx = VILLAINS.findIndex(v => !v.defeated);
  const [targetLv, setTargetLv] = React.useState(VILLAINS[Math.max(0, nextIdx)].lv);
  const villain = VILLAINS.find(v => v.lv === targetLv) || VILLAINS[0];
  const cleared = VILLAINS.filter(v => v.defeated);
  const isRematch = villain.defeated;                       // already beaten once
  const reward = isRematch ? BATTLE_REWARDS.repeat : BATTLE_REWARDS.firstClear;
  const opp = { species: villain.species, name: villain.name, color: villain.color, level: villain.lv, rarity: 'rare' };

  const power = c => (c.traits ? (c.traits.guard + c.traits.speed + c.traits.heart) : 180) + c.level * 4;

  const start = () => {
    if (left <= 0) return;                   // A-8 cap — never spend a challenge you don't have
    setPhase('matching');
    setTimeout(() => setPhase('versus'), 1600);
    setTimeout(() => {
      const w = power(sel) + 30 >= villain.power;
      const firstClear = w && !villain.defeated;   // read BEFORE we mutate it
      if (w) {
        // A-8.1: the FIRST clear unlocks the next villain; later clears only
        // add to the record and pay the smaller repeat reward.
        villain.defeated = true;
        villain.clears = (villain.clears || 0) + 1;
        PLAYER.points += reward.points;
        if (sel.xpMax) sel.xp = Math.min(sel.xp + reward.xp, sel.xpMax);
        // a first clear opens the ladder — move the aim to the newly unlocked foe
        if (firstClear) {
          const nxt = VILLAINS.find(v => !v.defeated);
          if (nxt) setTargetLv(nxt.lv);
        }
      } else {
        PLAYER.points += BATTLE_REWARDS.loss.points;
      }
      setWasFirstClear(firstClear);
      setLastReward(w ? reward : BATTLE_REWARDS.loss);
      PLAYER.battlesToday = Math.min(BATTLES_PER_DAY, (PLAYER.battlesToday || 0) + 1);
      setUsedCount(PLAYER.battlesToday);
      setWon(w); setPhase('result');
    }, 3200);
  };

  if (phase === 'matching') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#2b5782)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 20 }}>
          <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#fff', opacity: .3 }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="swords" size={40} color="#fff" stroke={2} /></div>
        </div>
        <div className="game-font" style={{ color: '#fff', fontSize: 21, fontWeight: 500 }}>{L('Approaching the villain…')}</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, marginTop: 6 }}>{L('Lv')}{villain.lv} · {L(villain.name)}</div>
      </div>
    );
  }

  if (phase === 'versus' || phase === 'result') {
    const result = phase === 'result';
    const ko = getLang() === 'ko';
    // battle math — the same formula that decides the win, shown to the child
    const base = power(sel), bonus = 30, myTotal = base + bonus, diff = myTotal - villain.power;
    const mathRow = (lbl, val, color, i) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: i ? '1px solid rgba(255,255,255,.09)' : 'none' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', fontWeight: 600 }}>{lbl}</span>
        <span className="game-font" style={{ fontSize: 15.5, fontWeight: 500, color: color || '#fff' }}>{val}</span>
      </div>
    );
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#122536)', display: 'flex', flexDirection: 'column', zIndex: 50, paddingTop: 60 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
          {result && won && <Confetti n={24} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center', opacity: result && !won ? .4 : 1, transition: 'opacity .4s' }}>
              <div className={result && won ? 'jx-pop' : ''}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={120} /></div>
              <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{sel.name}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {sel.level} · PWR {power(sel)}</div>
            </div>
            <div className="game-font" style={{ color: THEME.gold, fontSize: 26, fontWeight: 500 }}>VS</div>
            <div style={{ textAlign: 'center', opacity: result && won ? .4 : 1, transition: 'opacity .4s' }}>
              <div style={{ transform: 'scaleX(-1)' }}><Mascot species={opp.species} stage={2} color={opp.color} mood="alert" size={120} /></div>
              <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{L(opp.name)}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {opp.level} · PWR {villain.power}</div>
            </div>
          </div>

          {result && (
            <React.Fragment>
              <div className="jx-pop" style={{ marginTop: 26, textAlign: 'center' }}>
                <div className="game-font" style={{ fontSize: 36, fontWeight: 500, color: won ? THEME.gold : '#fff' }}>{won ? L('Victory!') : L('So close!')}</div>
                {/* A-8.1: first clear pays more than a repeat challenge */}
                {won && (
                  <React.Fragment>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 15, marginTop: 12 }} className="game-font">
                      <Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} /> +{lastReward.points} {L('points')} · +{lastReward.xp} XP
                    </div>
                    <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5, marginTop: 8 }}>
                      {wasFirstClear
                        ? L('First clear! A new villain is unlocked.')
                        : `${L('Repeat challenge')} · ${L('cleared')} ${villain.clears}×`}
                    </div>
                  </React.Fragment>
                )}
                {!won && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 8 }}>{`${L('Still earned')} +${BATTLE_REWARDS.loss.points} ${L('points for trying!')}`}</div>}
              </div>

              {/* battle math — how the result was calculated */}
              <div className="jx-pop" style={{ width: '100%', maxWidth: 300, marginTop: 20, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 18, padding: '12px 16px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{L('Battle math')}</div>
                {mathRow(`${sel.name} · ${L('Power')}`, base, '#fff', 0)}
                {mathRow(L('Safe-walk bonus'), `+${bonus}`, THEME.gold, 1)}
                {mathRow(L('Your total'), myTotal, won ? THEME.gold : '#fff', 1)}
                {mathRow(`${L(opp.name)} · ${L('Power')}`, villain.power, 'rgba(255,255,255,.85)', 1)}
                <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: won ? THEME.gold : 'rgba(255,255,255,.8)', marginTop: 10 }}>
                  {won
                    ? (ko ? `빌런보다 파워 ${diff} 앞서 이겼어요!` : `Out-powered the villain by ${diff}!`)
                    : (ko ? `파워가 ${-diff} 부족했어요 — 레벨업해요!` : `Short by ${-diff} power — level up!`)}
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
        {result && (
          <div style={{ padding: '0 24px calc(env(safe-area-inset-bottom) + 24px)' }}>
            {/* A-8: challenges are capped per day — offer another only while some remain */}
            {left > 0
              ? <Button variant="play" size="lg" fullWidth icon="swords" onClick={() => setPhase('select')}>{L('Battle again')} · {left}</Button>
              : <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L("That's your battle for today")}</Button>}
            <button onClick={() => ctx.nav('home')} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Back home')}</button>
          </div>
        )}
      </div>
    );
  }

  // select — 'classic' is the baseline below; every other layout is an
  // alternative staging of the same choice (see BattleVariants.jsx)
  if (layout !== 'classic') return (
    <BattleSelect variant={layout} ctx={ctx} owned={owned} sel={sel} setSel={setSel}
      villain={villain} left={left} usedToday={usedToday} start={start} power={power} />
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Battle')} onBack={() => ctx.nav('home')} right={<button onClick={() => ctx.nav('villaindex')} aria-label={L('Villain Dex')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: 'none', borderRadius: 999, padding: '7px 12px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{L('Dex')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.primaryLight, borderRadius: 14, padding: '11px 14px', marginBottom: 16 }}>
          <Icon name="info" size={18} color={THEME.primary} stroke={2.3} />
          <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: THEME.primaryDark, fontWeight: 600 }}>{usedToday ? L('Come back tomorrow for your next challenge.') : L("Five villain challenges a day. Battles pause while you're walking.")}</span>
          <span className="game-font" style={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: THEME.primaryDark, background: '#fff', borderRadius: 999, padding: '3px 9px' }}>{left}/{BATTLES_PER_DAY}</span>
        </div>

        {/* the villain being challenged (A-8) — a rematch is labelled as such */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 12, border: `1.5px solid ${isRematch ? THEME.border : THEME.dangerLight}` }}>
          <div style={{ flexShrink: 0 }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={56} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: isRematch ? THEME.fg3 : THEME.danger, textTransform: 'uppercase', letterSpacing: .4 }}>
              {isRematch ? L('Rematch') : L('Next villain')} · Lv{villain.lv}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Power')} {villain.power}{isRematch ? ` · ${L('cleared')} ${villain.clears}×` : ''}</div>
          </div>
          <span className="game-font" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '5px 10px', fontSize: 12, fontWeight: 500 }}>
            <Icon name="star" size={12} color={THEME.gold} fill={THEME.gold} stroke={2} />+{reward.points}
          </span>
        </div>

        {/* A-8.1: beaten villains stay challengeable — for records and practice,
            at the smaller repeat reward. */}
        {cleared.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2, margin: '0 2px 7px' }}>
              {L('Challenge again')} · <span style={{ color: THEME.fg3 }}>+{BATTLE_REWARDS.repeat.points} {L('points')}</span>
            </div>
            <div className="no-sb" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 6px', margin: '0 -2px' }}>
              {nextIdx >= 0 && (
                <button onClick={() => setTargetLv(VILLAINS[nextIdx].lv)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 66, padding: '8px 4px', borderRadius: 14, background: '#fff', border: targetLv === VILLAINS[nextIdx].lv ? `2px solid ${THEME.danger}` : '2px solid transparent', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Icon name="swords" size={22} color={THEME.danger} stroke={2.2} />
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: THEME.danger }}>{L('New')}</span>
                </button>
              )}
              {cleared.map(v => (
                <button key={v.lv} onClick={() => setTargetLv(v.lv)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, width: 66, padding: '8px 4px', borderRadius: 14, background: '#fff', border: targetLv === v.lv ? `2px solid ${THEME.primary}` : '2px solid transparent', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Mascot species={v.species} stage={2} color={v.color} mood="alert" size={34} />
                  <span style={{ fontSize: 9.5, fontWeight: 800, color: THEME.fg2 }}>Lv{v.lv}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* chosen */}
        <div style={{ borderRadius: 24, padding: 18, background: `linear-gradient(165deg, ${shade(sel.color, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Your fighter')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={150} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
            {[['shield', sel.traits.guard], ['gauge', sel.traits.speed], ['heart', sel.traits.heart]].map(([ic, v], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name={ic} size={14} color={THEME.fg2} stroke={2.3} />
                <span className="game-font" style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <SectionHead title={L('Choose a buddy')} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }} className="no-sb">
          {owned.map(c => (
            <button key={c.id} onClick={() => setSel(c)} style={{ flexShrink: 0, width: 104, background: '#fff', borderRadius: 18, padding: '12px 6px', border: sel.id === c.id ? `2.5px solid ${THEME.primary}` : `2.5px solid transparent`, boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={62} />
              <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: THEME.fg2 }}>Lv {c.level}</div>
            </button>
          ))}
        </div>

        {usedToday
          ? <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L('Come back tomorrow')}</Button>
          : <Button variant="play" size="lg" fullWidth icon="swords" onClick={start}>{L('Find a match')} · {left}/{BATTLES_PER_DAY}</Button>}
      </div>
    </div>
  );
}

export { Battle };
