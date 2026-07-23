// JoanX — child app · Battle

import React from 'react';
import { activeVillains, BATTLE_ODDS, battlesPerDay, BATTLE_REWARDS, BATTLE_RULES, battlePower, canChallenge, CHARACTERS, nextVillain, PLAYER, rarityOf, resolveBattle, underLevelled, villainByLv, winPercent } from '../core/data.jsx';
import { Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, Confetti, StageUpMoment } from './shared.jsx';
import { BattleSelect } from './BattleVariants.jsx';
import { sfx, music } from '../core/sound.jsx';

function Battle({ ctx, layout = 'classic' }) {
  const owned = CHARACTERS.filter(c => c.owned);
  const [sel, setSel] = React.useState(owned[0]);
  const [phase, setPhase] = React.useState('select'); // select|matching|versus|result
  const [won, setWon] = React.useState(true);
  // the result screen must report the battle that just happened, not what a
  // re-render now computes — `villain.defeated` flips the moment we win.
  const [wasFirstClear, setWasFirstClear] = React.useState(false);
  const [wasEnding, setWasEnding] = React.useState(false);   // A-8: the final boss just fell
  const [wasImproved, setWasImproved] = React.useState(false);   // A-8.1: a new personal best
  const [stageUp, setStageUp] = React.useState(null);            // A-3.3: the win evolved the buddy
  const [storyChapter, setStoryChapter] = React.useState(null);   // A-8.1: the first win opened a chapter
  const [wonEgg, setWonEgg] = React.useState(null);               // A-8.4: the egg this win actually paid
  const [lastReward, setLastReward] = React.useState(BATTLE_REWARDS.firstClear);
  // A-8.2 — the villain fought and the power/odds it was rolled against, frozen at roll time
  const [lastFoe, setLastFoe] = React.useState(null);
  const [lastMath, setLastMath] = React.useState({ base: 0, bonus: 0, odds: 0 });
  // A-8: up to battlesPerDay() challenges per day (persists this session)
  const [usedCount, setUsedCount] = React.useState(PLAYER.battlesToday || 0);
  const left = Math.max(0, battlesPerDay() - usedCount);
  const usedToday = left === 0;

  // The battle theme carries in from the Villain Dex: it loops while you're choosing
  // a fighter, then stops the moment the match starts (matching / versus / result),
  // so the start / win / lose cues land clean over silence. Muted by the sound toggle.
  React.useEffect(() => {
    if (phase === 'select' && !PLAYER.walking) music.start('battle');
    else music.stop();
    return () => music.stop();
  }, [phase]);
  // A-8: the ladder is climbed sequentially — the next undefeated foe is the
  // default target. A-8.1: an already-beaten villain can be re-challenged, so
  // the target is state, not a derived constant.
  const ladder = activeVillains();                          // a dark/seasonal villain is not on it
  const open = nextVillain();                               // null once the whole ladder is cleared
  const [targetLv, setTargetLv] = React.useState((open || ladder[ladder.length - 1]).lv);
  const villain = villainByLv(targetLv) || ladder[0];
  const isFinale = villain.role === 'finalBoss' && !villain.defeated;
  const opp = { species: villain.species, name: villain.name, color: villain.color, level: villain.lv, rarity: 'rare' };

  // A-3.3 — battles are fought with the four core stats (HP · Courage · Protection ·
  // Speed), which grow with rarity and LEVEL in data.jsx (stage grants nothing). The
  // formula lives there, not here: a balance retune is a server settings change, and a
  // screen that did its own arithmetic would quietly disagree with the stats it displays.
  const power = battlePower;
  // A-8.2 — the recommended level is advice, not a gate. A buddy below it can still be sent
  // in; the odds just get long. `odds` is the number the child is shown BEFORE committing,
  // and it is the same number the roll happens against — see rollBattle.
  const odds = winPercent(sel, villain);
  const under = underLevelled(sel, villain);

  // A-8 / A-8.1 — every rule lives in resolveBattle(): the sequential-unlock gate, the
  // A-8.2 odds roll, the reward tier (a first clear pays once and ONLY once), the villain's
  // record, and the daily cap. This screen only animates what comes back. Deciding any of it
  // here too would be two rule sets to keep in step, and the one that drifted would be the
  // one that pays the first-clear bonus a second time.
  //
  // resolveBattle reads power and odds BEFORE it awards XP, so the numbers it hands back are
  // the ones the fight was actually decided on — a win can level the buddy up, and recomputing
  // afterwards would report a chance the child never fought at.
  const start = () => {
    if (!canChallenge(villain).ok) return;   // locked villain, or no challenges left today
    sfx.battleStart();
    setPhase('matching');
    setTimeout(() => { sfx.attack(); setPhase('versus'); }, 1600);
    setTimeout(() => {
      const res = resolveBattle(villain, sel);
      if (!res.ok) { setPhase('select'); return; }   // gate closed between tap and resolve
      const w = res.won;
      // Freeze WHO was fought, not just the numbers. A first clear moves `targetLv` to the
      // newly unlocked villain a few lines down, and the result screen derives its opponent
      // from `targetLv` — so without this the victory screen shows the face and the power of
      // the villain you just unlocked instead of the one you actually beat.
      setLastFoe(villain);
      setLastMath({ base: res.power, bonus: BATTLE_ODDS.safeWalkBonus, odds: res.odds });
      // a first clear opens the ladder — move the aim to the newly unlocked foe. After the
      // finale there is none, so the aim stays on Nox, which stays re-challengeable (A-8.1).
      if (res.firstClear) {
        const nxt = nextVillain();          // ladder-aware: skips dark/seasonal villains
        if (nxt) setTargetLv(nxt.lv);
      }
      setWasEnding(res.ending);
      setWasFirstClear(res.firstClear);
      setWasImproved(res.improved);         // A-8.1 — a new personal best against this villain
      setStageUp(res.stageUp);              // A-3.3 — battle XP carried the buddy into a new stage
      setStoryChapter(res.storyChapter);    // A-8.1 — a first win, and only a first win, tells its story
      setWonEgg(res.eggWon);                // A-8.4 — the egg that actually dropped, not the one the tier lists
      setLastReward(res.reward);
      setUsedCount(PLAYER.battlesToday);
      w ? sfx.win() : sfx.lose();
      setWon(w); setPhase('result');
    }, 3200);
  };

  if (phase === 'matching') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#365C39)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
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
    // Who the result screen is ABOUT: the villain that was actually fought. `villain` follows
    // `targetLv`, which a first clear has already moved on to the next foe by the time this
    // renders — so on the result screen every opponent detail comes from the frozen `lastFoe`.
    const foe = (result && lastFoe) || villain;
    const foeCard = { species: foe.species, name: foe.name, color: foe.color, level: foe.lv };
    // battle math — the numbers the win was actually rolled against. On the result screen they
    // come from the snapshot taken at roll time (a level-up would otherwise rewrite history);
    // during the versus phase, nothing has been rolled yet, so they are computed live.
    const live = { base: power(sel), bonus: BATTLE_ODDS.safeWalkBonus, odds };
    const { base, bonus, odds: shownOdds } = result ? lastMath : live;
    const myTotal = base + bonus;
    const mathRow = (lbl, val, color, i) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: i ? '1px solid rgba(255,255,255,.09)' : 'none' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', fontWeight: 600 }}>{lbl}</span>
        <span className="game-font" style={{ fontSize: 15.5, fontWeight: 500, color: color || '#fff' }}>{val}</span>
      </div>
    );
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#14291b)', display: 'flex', flexDirection: 'column', zIndex: 50, paddingTop: 60 }}>
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
              <div style={{ transform: 'scaleX(-1)' }}><Mascot species={foeCard.species} stage={2} color={foeCard.color} mood="alert" size={120} /></div>
              <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{L(foeCard.name)}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {foeCard.level} · PWR {foe.power}</div>
            </div>
          </div>

          {result && (
            <React.Fragment>
              <div className="jx-pop" style={{ marginTop: 26, textAlign: 'center' }}>
                <div className="game-font" style={{ fontSize: 36, fontWeight: 500, color: won ? THEME.gold : '#fff' }}>
                  {!won ? L('So close!') : wasEnding ? L('Nox is out.') : L('Victory!')}
                </div>
                {/* A-8.1 — a rematch that beat the old record. This is the payoff for
                    re-challenging: proof the buddy actually grew, not just another clear. */}
                {won && wasImproved && !wasFirstClear && (
                  <div className="jx-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, background: 'rgba(255,255,255,.14)', color: '#fff', borderRadius: 999, padding: '5px 12px', fontSize: 12, fontWeight: 800 }}>
                    <Icon name="trending-up" size={13} color={THEME.gold} stroke={2.4} />{L('New personal best')}
                  </div>
                )}
                {/* A-8.1 — EVERY win pays the basic reward; a first win adds the first-clear
                    bonus on top. Showing the two lines separately is the point: the child can
                    see what the repeat is worth and what the first win was worth, which is the
                    difference the whole rule exists to create. */}
                {won && (
                  <React.Fragment>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 15, marginTop: 12 }} className="game-font">
                      <Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} /> +{lastReward.points} {L('points')} · +{lastReward.xp} XP
                    </div>
                    {/* A-8.4 — the EGG. Driven by what was actually awarded, never by
                        `reward.egg`: an event drop on a repeat is a chance, so reading the
                        tier would promise an egg the roll did not hand over. It waits in
                        Your Eggs rather than hatching here — one celebration at a time. */}
                    {wonEgg && !wasEnding && (
                      <div className="jx-pop" style={{ display: 'flex', justifyContent: 'center', marginTop: 9 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.14)', borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 800, color: '#fff' }}>
                          <Icon name="egg" size={14} color="#fff" stroke={2.3} />
                          {L(rarityOf(wonEgg).label)} {L('Egg')} · {L('waiting in Your Eggs')}
                        </span>
                      </div>
                    )}
                    {wasFirstClear && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.7)' }}>
                          {L('Basic')} +{BATTLE_RULES.base.points}
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.gold }}>
                          {L('First-clear bonus')} +{lastReward.points - BATTLE_RULES.base.points}
                        </span>
                      </div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 12.5, marginTop: 8 }}>
                      {wasEnding
                        ? L('The final villain is beaten — the ending is yours.')
                        : wasFirstClear
                          ? L('First clear! A new villain is unlocked.')
                          : `${L('Repeat challenge')} · ${L('cleared')} ${foe.clears}×`}
                    </div>
                    {/* the third thing a first win buys, after the bonus and the next villain */}
                    {storyChapter && (
                      <button onClick={() => ctx.nav('villaindex')} className="jx-press"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', borderRadius: 999, padding: '7px 14px', fontSize: 12, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>
                        <Icon name="book-open" size={13} color={THEME.gold} stroke={2.4} />
                        {L('Story unlocked')} · {L('Chapter')} {storyChapter}
                      </button>
                    )}
                  </React.Fragment>
                )}
                {!won && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 8 }}>{`${L('Still earned')} +${BATTLE_REWARDS.loss.points} ${L('points for trying!')}`}</div>}
                {/* A-8.1 — a rematch is only worth fighting if it can beat something. The
                    record tracks the strongest buddy you have won with, so this is the line
                    that says the re-challenge actually meant something. */}
                {wasImproved && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(255,255,255,.12)', borderRadius: 999, padding: '5px 12px' }}>
                    <Icon name="trending-up" size={13} color={THEME.gold} stroke={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: THEME.gold }}>{L('New personal best')} · {L('Power')} {lastMath.base}</span>
                  </div>
                )}
              </div>

              {/* A-8 — ENDING. Beating the final boss is the one result that is not just a
                  bigger number: it closes the story the ten villains were telling and hands
                  over the special reward. Nothing else in the app shows this panel. */}
              {wasEnding && (
                <div className="jx-pop" style={{ width: '100%', maxWidth: 300, marginTop: 18, background: 'rgba(255,255,255,.09)', border: `1px solid ${THEME.gold}66`, borderRadius: 18, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <Icon name="sunrise" size={16} color={THEME.gold} stroke={2.3} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.gold, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Ending unlocked')}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.86)', lineHeight: 1.6 }}>{L('The dark the others were made of is gone. The city can look up again — and so can you.')}</div>
                  {lastReward.egg && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(255,255,255,.12)', borderRadius: 999, padding: '6px 12px' }}>
                      <Icon name="egg" size={14} color="#fff" stroke={2.3} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{L('Special reward')} · {L(rarityOf(lastReward.egg).label)} {L('Egg')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* battle math — how the result was calculated */}
              <div className="jx-pop" style={{ width: '100%', maxWidth: 300, marginTop: 20, background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.13)', borderRadius: 18, padding: '12px 16px 14px' }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: .5, marginBottom: 2 }}>{L('Battle math')}</div>
                {mathRow(`${sel.name} · ${L('Power')}`, base, '#fff', 0)}
                {mathRow(L('Safe-walk bonus'), `+${bonus}`, THEME.gold, 1)}
                {mathRow(L('Your total'), myTotal, won ? THEME.gold : '#fff', 1)}
                {mathRow(`${L(foeCard.name)} · ${L('Power')}`, foe.power, 'rgba(255,255,255,.85)', 1)}
                {mathRow(L('Your chance'), `${shownOdds}%`, THEME.gold, 1)}
                <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: won ? THEME.gold : 'rgba(255,255,255,.8)', marginTop: 10 }}>
                  {won
                    ? (ko ? `승률 ${shownOdds}%를 뚫고 이겼어요!` : `Won on a ${shownOdds}% chance!`)
                    : (ko ? `이번엔 안 됐어요 — 능력치를 키우면 승률이 올라가요.` : `Not this time — stronger stats mean better odds.`)}
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

        {/* A-3.3 — the battle XP carried the buddy into a new stage. It plays over the result,
            because this is the moment it happened; making the child find out later on the
            character screen is what the old manual "Evolve" button did wrong. */}
        {result && stageUp && (
          <StageUpMoment character={sel} stage={stageUp} color={sel.color} onDone={() => setStageUp(null)} />
        )}
      </div>
    );
  }

  // F-19 — WALKING CLOSES THE BATTLE SCREEN. Placed above the layout switch on purpose, so
  // every battle layout is covered by one rule rather than each having to remember it. And it
  // replaces the screen rather than merely disabling the CTA: a villain card with an ability,
  // a power number and a win chance is exactly the thing a child would stand and read at a
  // kerb. The app cannot tell them to look up and then hand them something to look down at.
  if (PLAYER.walking) return <WalkingBlock ctx={ctx} buddy={sel} />;

  // select — 'classic' is the baseline below; every other layout is an
  // alternative staging of the same choice (see BattleVariants.jsx)
  if (layout !== 'classic') return (
    <BattleSelect variant={layout} ctx={ctx} owned={owned} sel={sel} setSel={setSel}
      villain={villain} left={left} usedToday={usedToday} start={start} power={power} />
  );

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: screenBgActive() }}>
      <ScreenHeader title={L('Battle')} onBack={() => ctx.back()} />
      <div className="no-sb" style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingTop: 102 }}>
      <div style={{ padding: '0 16px 8px' }}>
        {/* Who you're up against — already chosen on the villain road, so it's one compact
            line here, not a card. This screen's whole job is the fighter choice. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 16, padding: '10px 13px', border: `1.5px solid ${THEME.border}`, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={34} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Opponent')} · Lv{villain.lv}</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{L(villain.name)}</div>
          </div>
          <span className="game-font" style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.surface2, borderRadius: 999, padding: '5px 11px', fontSize: 13, fontWeight: 500, color: THEME.fg2 }}>
            <Icon name="zap" size={13} color={THEME.danger} stroke={2.4} />{villain.power}
          </span>
        </div>

        {/* Choose your fighter — the one decision this screen exists for. Each buddy shows
            its win chance against THIS villain, turning the pick into a read of the odds
            rather than a guess. The selected one gets the buddy-tinted card + check. */}
        <SectionHead title={L('Choose your fighter')} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {owned.map(c => {
            const on = sel.id === c.id;
            const w = winPercent(c, villain);                                  // this buddy vs this villain
            const wc = w >= 50 ? THEME.success : w >= 25 ? THEME.warning : THEME.danger;
            return (
              <button key={c.id} onClick={() => setSel(c)} style={{ position: 'relative', textAlign: 'left', background: on ? THEME.successLight : '#fff', borderRadius: 18, padding: '12px 12px 11px', border: `2px solid ${on ? THEME.success : THEME.border}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s, background .15s' }}>
                {on && <span style={{ position: 'absolute', top: 9, right: 9, width: 20, height: 20, borderRadius: 999, background: THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={12} color="#fff" stroke={3} /></span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={48} /></div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.fg1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 1 }}>Lv {c.level} · {L('Power')} {power(c)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, background: on ? '#fff' : THEME.surface2, borderRadius: 10, padding: '5px 9px' }}>
                  <Icon name="target" size={12} color={wc} stroke={2.5} />
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg2 }}>{L('Win chance')}</span>
                  <span className="game-font" style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 500, color: wc }}>{w}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* the one caveat worth keeping — the picked buddy is under the villain's level, so
            the odds are long. Not a block, just a heads-up before committing. */}
        {under && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: THEME.warningLight, borderRadius: 12, padding: '9px 12px', marginBottom: 14 }}>
            <Icon name="alert-triangle" size={14} color={THEME.warning} stroke={2.4} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, lineHeight: 1.4 }}>{sel.name} {L('is under the recommended level — you can still fight, the odds are just longer.')}</span>
          </div>
        )}

      </div>
      </div>
      {/* CTA pinned to the bottom of the screen — it no longer floats mid-page with a
          gap beneath it. The fighter grid scrolls above; this footer stays put. */}
      <div style={{ flexShrink: 0, padding: '10px 16px calc(env(safe-area-inset-bottom) + 14px)' }}>
        {usedToday
          ? <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L('Come back tomorrow')}</Button>
          : <Button variant="play" size="lg" fullWidth icon="swords" onClick={start}>{L('Start battle')} · {left}/{battlesPerDay()}</Button>}
      </div>
    </div>
  );
}

// ── F-19 · Walking → battles are closed ──────────────────────────────
// The tone matters more than the mechanic. This is not a punishment screen and it must not
// read as one: the child has done nothing wrong, and in fact they are doing the single thing
// the whole product wants — walking with their head up. So the state SAYS that, and shows the
// points stacking up while they do it. The battle isn't taken away; it's waiting, and the walk
// is what pays for it.
//
// Design notes for the system: flat surfaces (no glow), the buddy plus a soft ripple as the
// "in progress" signal rather than a spinner or a checkmark, and no decorative sparkle. The
// only motion is on the buddy — the thing the child is meant to look at.
function WalkingBlock({ ctx, buddy }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: screenBgActive() }}>
      {/* Close, not Back — and it is the ONLY control. This screen is a state the app put the
          child in, not a place they navigated to, so there is nothing "behind" it to go back
          to. A "Back home" button underneath was a second door to the same room. */}
      <ScreenHeader title={L('Battle')} right={
        <button onClick={() => ctx.nav('home')} aria-label={L('Close')}
          style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="x" size={19} color={THEME.fg1} stroke={2.4} />
        </button>
      } />

      {/* The message IS the screen, so it sits in the middle of it rather than stacked under
          the header with dead space below. Nothing to scroll, nothing to press, nothing to
          read twice — this is the one screen whose whole job is to get a child's eyes back up. */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>

        {/* the buddy, walking with you — a soft ripple rather than a spinner */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 200, height: 200 }}>
          <div className="jx-ring-slow" style={{ position: 'absolute', width: 170, height: 170, borderRadius: 999, border: `2px solid ${shade(buddy.color, 52)}` }} />
          <div className="jx-ring" style={{ position: 'absolute', width: 170, height: 170, borderRadius: 999, border: `2px solid ${shade(buddy.color, 52)}` }} />
          <div className="jx-float" style={{ position: 'relative' }}>
            <Mascot species={buddy.species} stage={buddy.stage} color={buddy.color} size={140} />
          </div>
        </div>

        <h2 className="game-font" style={{ fontSize: 23, fontWeight: 500, margin: '10px 0 0', color: THEME.fg1 }}>
          {L('Battles pause while you walk')}
        </h2>
        <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 280 }}>
          {L('Eyes up — the villains will still be there. They open again as soon as you stop.')}
        </p>
      </div>
    </div>
  );
}

export { Battle };
