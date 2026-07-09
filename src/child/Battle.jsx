// JoanX — child app · Battle

import React from 'react';
import { CHARACTERS, PLAYER, VILLAINS } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, Confetti } from './shared.jsx';

function Battle({ ctx }) {
  const owned = CHARACTERS.filter(c => c.owned);
  const [sel, setSel] = React.useState(owned[0]);
  const [phase, setPhase] = React.useState('select'); // select|matching|versus|result
  const [won, setWon] = React.useState(true);
  const [usedToday, setUsedToday] = React.useState(!!PLAYER.battledToday);   // A-8: up to 1 challenge per day (persists this session)
  // A-8: the villain ladder is climbed sequentially — face the next undefeated foe.
  const idx = Math.max(0, VILLAINS.findIndex(v => !v.defeated));
  const villain = VILLAINS[idx];
  const opp = { species: villain.species, name: villain.name, color: villain.color, level: villain.lv, rarity: 'rare' };

  const power = c => (c.traits ? (c.traits.guard + c.traits.speed + c.traits.heart) : 180) + c.level * 4;

  const start = () => {
    setPhase('matching');
    setTimeout(() => setPhase('versus'), 1600);
    setTimeout(() => { const w = power(sel) + 30 >= villain.power; if (w) villain.defeated = true; PLAYER.battledToday = true; setUsedToday(true); setWon(w); setPhase('result'); }, 3200);
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
                {won && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 15, marginTop: 12 }} className="game-font"><Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} /> +120 points</div>}
                {!won && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 8 }}>{L('Still earned +40 points for trying!')}</div>}
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
            {/* one battle per day — after a result there's no "battle again"; the ladder waits for tomorrow */}
            <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L("That's your battle for today")}</Button>
            <button onClick={() => ctx.nav('home')} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Back home')}</button>
          </div>
        )}
      </div>
    );
  }

  // select
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Battle')} onBack={() => ctx.nav('home')} right={<button onClick={() => ctx.nav('villaindex')} aria-label={L('Villain Dex')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: 'none', borderRadius: 999, padding: '7px 12px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{L('Dex')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.primaryLight, borderRadius: 14, padding: '11px 14px', marginBottom: 16 }}>
          <Icon name="info" size={18} color={THEME.primary} stroke={2.3} />
          <span style={{ fontSize: 12.5, color: THEME.primaryDark, fontWeight: 600 }}>{usedToday ? L('Come back tomorrow for your next challenge.') : L("One villain challenge a day. Battles pause while you're walking.")}</span>
        </div>

        {/* next villain on the ladder (A-8) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16, border: `1.5px solid ${THEME.dangerLight}` }}>
          <div style={{ flexShrink: 0 }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={56} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Next villain')} · Lv{villain.lv}</div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Power')} {villain.power}</div>
          </div>
        </div>

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
          : <Button variant="play" size="lg" fullWidth icon="swords" onClick={start}>{L('Find a match')}</Button>}
      </div>
    </div>
  );
}

export { Battle };
