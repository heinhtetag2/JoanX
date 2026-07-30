// JoanX — child app · Battle

import React from 'react';
import { activeVillains, BATTLE_ODDS, battlesPerDay, BATTLE_REWARDS, BATTLE_RULES, battlePower, canChallenge, CHARACTERS, nextVillain, PLAYER, rarityOf, resolveBattle, underLevelled, villainByLv, winPercent } from '../core/data.jsx';
import { Button, Icon, SafePointIcon, SectionHead, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, Confetti, StageUpMoment } from './shared.jsx';
import { BattleSelect } from './BattleVariants.jsx';
import { VersusStage } from './BattleVersus.jsx';
import { sfx, music } from '../core/sound.jsx';

function Battle({ ctx, layout = 'classic', versus = 'classic' }) {
  const owned = CHARACTERS.filter(c => c.owned);
  // Arriving from a character's own fight button (CharacterDetail's swords icon) means
  // the fighter is already chosen — that buddy. We land on it pre-selected and with the
  // chooser collapsed into a locked card; any other entry shows the full grid as before.
  // From a character's own fight button we get an explicit charId. The Tweaks "Versus
  // screen" preview passes none, so fall back to the ACTIVE buddy there (not owned[0]) —
  // the demo then shows whichever buddy you've picked (e.g. Hammy) against the next
  // villain (Noct / 녹트), rather than an arbitrary first-in-list fighter.
  const preChar = (ctx.params?.charId && owned.find(c => c.id === ctx.params.charId))
    || (ctx.params?.preview && owned.find(c => c.id === PLAYER.activeCharId));
  const [sel, setSel] = React.useState(preChar || owned[0]);
  const [chooserOpen, setChooserOpen] = React.useState(!preChar);
  // Tweaks → "Versus screen" jumps straight to the fight staging so a layout can be read
  // without playing a battle for it. It rolls NOTHING: no daily challenge is spent, no
  // villain record moves, nothing is frozen — which is why the numbers it shows are the
  // live ones below rather than a snapshot from a roll that never happened.
  const preview = ctx.params?.preview;                    // 'versus' | 'result' | undefined
  const [phase, setPhase] = React.useState(preview || 'select'); // select|versus|result
  // which beat of the versus phase is on screen: arrive | charge | clash. A previewed versus
  // opens straight on `charge`, because that is the beat worth looking at and a preview never
  // rolls — there is no clash for it to advance into.
  const [beat, setBeat] = React.useState(preview === 'versus' ? 'charge' : 'arrive');
  const [clash, setClash] = React.useState(null);          // null | 'win' | 'lose'
  const [won, setWon] = React.useState(true);
  // the real-time HP the clash bars show — resolveBattle hands back the whole five-beat
  // track already (see clashHpTrack in data.jsx) at roll time; this screen just walks
  // `hpStep` forward on the same timers that already drive the hit sound and shield flip,
  // so the bar drains on the exact beat the blow visibly lands.
  const [clashHp, setClashHp] = React.useState(null);
  const [hpStep, setHpStep] = React.useState(0);
  // the result screen must report the battle that just happened, not what a
  // re-render now computes — `villain.defeated` flips the moment we win.
  const [wasFirstClear, setWasFirstClear] = React.useState(false);
  const [wasEnding, setWasEnding] = React.useState(false);   // A-8: the final boss just fell
  const [wasImproved, setWasImproved] = React.useState(false);   // A-8.1: a new personal best
  const [stageUp, setStageUp] = React.useState(null);            // A-3.3: the win evolved the buddy
  // (no storyChapter state — the chapter a first win opens is not announced on this screen)
  const [lastReward, setLastReward] = React.useState(BATTLE_REWARDS.firstClear);
  // A-8.2 — the villain fought and the power/odds it was rolled against, frozen at roll time
  const [lastFoe, setLastFoe] = React.useState(null);
  const [lastMath, setLastMath] = React.useState({ base: 0, bonus: 0, odds: 0 });
  // A-8: up to battlesPerDay() challenges per day (persists this session)
  const [usedCount, setUsedCount] = React.useState(PLAYER.battlesToday || 0);
  const left = Math.max(0, battlesPerDay() - usedCount);
  const usedToday = left === 0;

  // The battle theme carries in from the Villain Dex: it loops while you're choosing
  // a fighter, then stops the moment the match starts (versus / result),
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
  // The versus phase in three beats. It used to be 1800ms with a .6s slide-in at the front and
  // nothing behind it — including an sfx.attack() at 700ms with no hit on screen to belong to.
  //   arrive (0–620)   the plates slide in and the shield flips. Already built.
  //   charge (620–2400) the buddy's power counts up through the safe-walk bonus, and the chance
  //                    that total buys appears under it.
  //   clash  (…–+5050) a five-blow exchange that escalates, holds, then finishes. The shield
  //                    snaps on every contact, and the loser is destroyed on the last one —
  //                    it shudders, greys out and breaks apart, leaving the winner alone.
  // A tap during the exchange skips to the result; a tap during the charge starts the exchange.
  // A tap fires the clash early. It CANNOT change the outcome and is not required: resolveBattle
  // owns every rule (see below), and F-19 means this screen has to be able to run to the end in
  // a pocket. If skill decided a battle, the reward would stop being about walking safely, which
  // is the only thing the game is here to pay out for.
  const beats = React.useRef([]);
  const fired = React.useRef(false);
  const clearBeats = () => { beats.current.forEach(clearTimeout); beats.current = []; };
  React.useEffect(() => clearBeats, []);

  const fire = () => {
    if (fired.current) return;               // tap racing the auto-advance, or a second tap
    fired.current = true;
    clearBeats();
    {
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
      setLastReward(res.reward);
      setUsedCount(PLAYER.battlesToday);
      setWon(w);
      // The clash SHOWS the outcome — winner drives through, loser is knocked back — so it has
      // to be told which is which. Its own state rather than reading `won`, so the animation
      // can never render a frame against a stale value.
      setClash(w ? 'win' : 'lose');
      setClashHp(res.clashHp);
      setHpStep(0);
      // one cue per blow, on the frames the plates actually meet — 24% / 46% / 84% of the 1.5s
      // exchange. A single attack sound over a three-blow trade was the old version's problem in
      // miniature: the fight had more in it than the soundtrack admitted. The HP bars step
      // forward on these exact same timers, so a bar drains on the frame the blow lands.
      beats.current.push(
        ...[646, 1254, 1862, 2432, 3344].map((at, i) => setTimeout(() => { sfx.attack(); setHpStep(i + 1); }, at)),
        // the win/lose cue lands as the loser goes, not as the screen changes
        setTimeout(() => (w ? sfx.win() : sfx.lose()), 3700),
        // …and the result waits for the knockout. .jx-ko starts on the decisive blow at 3.34s and
        // runs 1.5s, so the plate is not finished coming apart until 4.84s — cutting any earlier
        // deletes the destruction rather than showing it. This lands ~200ms after, on the winner
        // alone in the arena, which is the payoff the five blows were building to.
        setTimeout(() => setPhase('result'), 5050),
      );
    }
  };

  // A 2.6s exchange is long enough that sitting through it has to be optional. The outcome is
  // already rolled and every side effect already applied by the time the first blow lands, so
  // skipping costs nothing — it just stops showing the child something they have decided they
  // are done watching. Same reason the charge can be tapped past.
  const skipToResult = () => {
    clearBeats();
    won ? sfx.win() : sfx.lose();
    setPhase('result');
  };

  // one handler for the whole versus phase: during the charge a tap throws the first punch,
  // during the exchange it jumps to the result, and during the slide-in it does nothing —
  // there is nothing to hurry past while the fighters are still arriving.
  const tapVersus = () => {
    if (preview) return;                     // a preview rolls nothing, so it has nothing to advance
    if (beat === 'charge') fire();
    else if (clash) skipToResult();
  };

  const start = () => {
    if (!canChallenge(villain).ok) return;   // locked villain, or no challenges left today
    // Straight into the arena: no "approaching the villain" interstitial. The versus
    // stage's own slide-in (.6s) is the transition, so the wait it used to fill is gone.
    sfx.battleStart();
    fired.current = false;
    setClash(null);
    setClashHp(null);
    setHpStep(0);
    setBeat('arrive');
    setPhase('versus');
    clearBeats();
    beats.current = [
      setTimeout(() => setBeat('charge'), 620),   // once both fighters have landed
      setTimeout(fire, 2400),                     // ~1.8s to read the charge, then it goes on its own
    ];
  };

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
    // Frozen from the moment the roll happens — which is the CLASH, not the result screen. A win
    // awards XP and can level the buddy, so power(sel) may jump the instant resolveBattle returns;
    // with live numbers still feeding the charge readout, the count-up would see a new target
    // mid-clash and start over from a different base. The child would watch the number they were
    // just shown rewrite itself. `frozen` also keeps the old rule intact: a preview rolls nothing,
    // so it always reads live.
    const frozen = !preview && (result || !!clash);
    const { base, bonus, odds: shownOdds } = frozen ? lastMath : live;
    const myTotal = base + bonus;
    const mathRow = (lbl, val, color, i) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: i ? '1px solid rgba(255,255,255,.1)' : 'none' }}>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>{lbl}</span>
        <span className="game-font" style={{ fontSize: 15.5, fontWeight: 500, color: color || '#fff' }}>{val}</span>
      </div>
    );
    // Arena backdrop — a full-bleed painted battle scene (floating meadow island)
    // instead of the old flat near-black. Covers the whole screen; the two fighter
    // plates and the VS shield sit on top. A soft dark scrim (below) keeps the white
    // name/power text readable over the bright meadow without hiding the art.
    return (
      // The whole arena is the tap target during the versus beat — the child is watching two
      // fighters, not hunting a button, and a 44pt target somewhere on a full-bleed scene would
      // be the one thing they had to aim at. Not a <button>: there is nothing here a keyboard or
      // a screen reader should be told to press, since the beat completes on its own either way.
      <div onClick={!result ? tapVersus : undefined}
        style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/battle/battlebg.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', zIndex: 50, paddingTop: result ? 'calc(env(safe-area-inset-top) + 24px)' : 60 }}>
        {/* soft overlay: a gentle flat tint across the whole scene so the vibrant arena
            is muted a touch and the fighters read as the foreground. Both phases share it:
            the result's own white card carries its text, so there is nothing left for a
            heavier tint to fix — dimming the arena twice only made the screen gloomy. */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,30,.22)', pointerEvents: 'none' }} />
        {/* legibility scrim: darkens top & bottom slightly so text/plates read; the
            middle stays clear so the arena art shows through behind the VS */}
        {/* the result's bottom runs much darker, and this is what keeps the CTAs legible.
            The button is brand green and the arena's lower half is a sunlit green meadow —
            green on green, with the disabled style being the same green at 45%, is how an
            enabled button ends up looking greyed out. Darkening the strip the two CTAs stand
            on separates them by value instead of by hue, so the green can stay green. */}
        <div style={{ position: 'absolute', inset: 0, background: result
          ? 'linear-gradient(180deg,rgba(20,18,26,.4) 0%,rgba(20,18,26,.1) 30%,rgba(20,18,26,.12) 56%,rgba(20,18,26,.66) 78%,rgba(20,18,26,.9) 100%)'
          : 'linear-gradient(180deg,rgba(20,18,26,.45) 0%,rgba(20,18,26,.12) 32%,rgba(20,18,26,.12) 68%,rgba(20,18,26,.5) 100%)', pointerEvents: 'none' }} />
        {/* One fixed screen, centred — no scrolling. Everything the result has to say fits
            between the header and the buttons because the fighters fold to a strip (see
            BattleVersus.jsx); if a case ever stops fitting, that case gets shorter, it does
            not get a scrollbar. Overflow stays visible so the mascots can keep breaking the
            top edge of their plates. */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative', transform: result ? 'none' : 'translateY(-20px)' }}>
          {result && won && <Confetti n={24} />}
          {/* who is fighting whom — the one block both phases share, so the fighters
              do not jump position between the versus moment and the result. Layouts
              live in BattleVersus.jsx; switch via Tweaks ("Versus screen"). */}
          <VersusStage variant={versus} result={result} won={won}
            charge={!result && beat !== 'arrive' ? { bonus, odds: shownOdds } : null}
            clash={!result ? clash : null}
            // The real-time damage the clash bars read off — `clashHp` is the whole five-beat
            // track from resolveBattle, `hpStep` is how far the timers have walked into it.
            // Only meaningful once a clash is actually running; result has its own math card.
            hp={!result && clash && clashHp ? { meCur: clashHp.me[hpStep], meMax: clashHp.meMax, foeCur: clashHp.foe[hpStep], foeMax: clashHp.foeMax } : null}
            // During the versus beats the plate counts up FROM this number, so it has to be the
            // one the fight was decided on, not a post-XP recount. The result screen keeps the
            // live power — there the buddy has finished the battle and levelling is the payoff.
            me={{ ...sel, power: result ? power(sel) : base }}
            foe={{ ...foeCard, power: foe.power }} />

          {result && (
            /* THE SHEET. Every word the result says lives on this one card.
               Before it, the headline / reward pill / bonus lines / battle math sat straight
               on the arena art, and a bright sunlit meadow is the worst possible backing for
               white and gold text — the numbers were unreadable exactly where they mattered.
               It is a DEEP GREEN-GREY, not white and not a neutral black. Neutral dark read
               as a box dropped on a painting; plain white read as a form printed over one;
               a saturated brand green read as a slab of colour. This is the brand hue pulled
               most of the way toward charcoal and left at 72% — enough green to belong to the
               arena's meadow, not enough to compete with it, and open enough that the scene
               reads clearly through it. Flat fill, hairline edge, no shadow.
               72% is about the floor: the math inset below adds its own darkening, but the
               headline and the support lines have only this card behind them, and any thinner
               puts them back on the bright meadow they were rescued from.

               Hierarchy inside it, brightest to quietest: the gold headline, then the pale
               gold reward pill (the one thing the child came for), then the supporting lines
               in muted white, and last the battle math — sunk into a darker inset so it reads
               as the receipt under the result rather than a second announcement. */
            <div style={{ width: '100%', maxWidth: 320, marginTop: 18, background: 'rgba(40,58,44,.72)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 24, padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="jx-pop" style={{ textAlign: 'center' }}>
                <div className="game-font" style={{ fontSize: 34, fontWeight: 500, color: won ? THEME.gold : '#fff' }}>
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.successLight, color: '#274427', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 15, marginTop: 12 }} className="game-font">
                      <SafePointIcon size={20} /> +{lastReward.points} {L('points')} · +{lastReward.xp} XP
                    </div>
                    {/* A-8.4 — the egg drop is deliberately NOT surfaced here. The win
                        awards it behind the scenes; the child meets it on the egg-hatch
                        screen (via Your Eggs / Back home), so this result stays about the
                        battle, not the reward. */}
                    {wasFirstClear && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.72)' }}>
                          {L('Basic')} +{BATTLE_RULES.base.points}
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.gold }}>
                          {L('First-clear bonus')} +{lastReward.points - BATTLE_RULES.base.points}
                        </span>
                      </div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,.78)', fontSize: 12.5, marginTop: 8 }}>
                      {/* "first clear" stays — it is why the bonus above is bigger — but the
                          "a new villain is unlocked" half is gone with the story button: this
                          screen reports the fight, it does not hand out unlock notices. */}
                      {wasEnding
                        ? L('The final villain is beaten — the ending is yours.')
                        : wasFirstClear
                          ? L('First clear!')
                          : `${L('Repeat challenge')} · ${L('cleared')} ${foe.clears}×`}
                    </div>
                    {/* No "story unlocked · chapter N" button here. A first win still opens its
                        chapter — resolveBattle records it and the Villain Dex is where it is
                        read — but the result screen does not advertise it. This screen is about
                        the fight that just happened; an unlock badge pointing somewhere else is
                        a second errand stapled to the win. */}
                  </React.Fragment>
                )}
                {!won && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 8 }}>{`${L('Still earned')} +${BATTLE_REWARDS.loss.points} ${L('points for trying!')}`}</div>}
                {/* A-8.1 — a rematch is only worth fighting if it can beat something. The
                    record tracks the strongest buddy you have won with, so this is the line
                    that says the re-challenge actually meant something. */}
                {wasImproved && !wasFirstClear && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, background: 'rgba(255,255,255,.13)', borderRadius: 999, padding: '5px 12px' }}>
                    <Icon name="trending-up" size={13} color={THEME.gold} stroke={2.5} />
                    <span style={{ fontSize: 12, fontWeight: 800, color: THEME.gold }}>{L('New personal best')} · {L('Power')} {lastMath.base}</span>
                  </div>
                )}
              </div>

              {/* A-8 — ENDING. Beating the final boss is the one result that is not just a
                  bigger number: it closes the story the ten villains were telling and hands
                  over the special reward. Nothing else in the app shows this panel. */}
              {wasEnding && (
                <div className="jx-pop" style={{ width: '100%', marginTop: 14, background: 'rgba(255,255,255,.08)', border: `1px solid ${THEME.gold}66`, borderRadius: 16, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    <Icon name="sunrise" size={16} color={THEME.gold} stroke={2.3} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.gold, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Ending unlocked')}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.88)', lineHeight: 1.6 }}>{L('The dark the others were made of is gone. The city can look up again — and so can you.')}</div>
                  {/* the special-reward egg drops behind the scenes and is met on the
                      egg-hatch screen, not announced here — same rule as every other win. */}
                </div>
              )}

              {/* battle math — how the result was calculated. It is SUNK, not raised: a
                  darker inset inside the card, no border of its own. The result is the
                  announcement; this is the receipt under it, and pushing it a step back is
                  what stops five rows of numbers from out-shouting the one line that says
                  the child won. */}
              <div className="jx-pop" style={{ width: '100%', marginTop: 16, background: 'rgba(0,0,0,.2)', borderRadius: 16, padding: '10px 14px 12px', flexShrink: 0 }}>
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
            </div>
          )}
        </div>
        {/* The versus phase has no controls of its own — it is a beat between the tap and
            the roll, and a real one times out on its own after 1.6s. A previewed one never
            rolls, so it needs the one way out that a child would otherwise never see. */}
        {preview && !result && (
          <div style={{ padding: '0 24px calc(env(safe-area-inset-bottom) + 24px)', position: 'relative', zIndex: 3 }}>
            <button onClick={() => ctx.nav('home')} style={{ width: '100%', background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', borderRadius: 999, padding: '12px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Close')}</button>
          </div>
        )}
        {result && (
          // above the scrim, not under it. The scrim is an absolutely-positioned sibling and
          // this strip was static, so it painted OVER the buttons — at the very bottom that
          // is rgba(20,18,26,.9), which is how a near-solid white border and #fff label ended
          // up reading as grey. The scrim is there to darken the ART the CTAs stand on; it was
          // darkening the CTAs by the same amount, which is the one thing it must not do.
          <div style={{ padding: '0 24px calc(env(safe-area-inset-bottom) + 24px)', position: 'relative', zIndex: 1 }}>
            {/* A-8: challenges are capped per day — offer another only while some remain */}
            {/* The battle CTA stays brand green here as everywhere else — it is the same
                action, it should not change colour just because the backdrop is art. What
                made it read as disabled was the backdrop, not the fill: solid green over a
                sunlit green meadow, with the disabled state being that same green at 45%.
                The fix is under the button, not in it — the scrim above darkens the strip
                the two CTAs stand on, so a full-strength green now has something to be
                full-strength against. */}
            {left > 0
              ? <Button variant="play" size="lg" fullWidth icon="swords" onClick={() => ctx.nav('villaindex')}>{L('Battle again')} · {left}</Button>
              : <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L("That's your battle for today")}</Button>}
            {/* "Back home" is a ghost — genuinely no fill, so the green CTA above keeps the
                whole of the attention. What it must NOT be is bare text with nothing to hold
                against a sunlit meadow: a near-solid white edge draws the button's shape
                whatever the art behind it does, and the label sits just under full white so it
                reads as secondary to the green without reading as disabled. It carried a white
                wash for a while to buy contrast; that was treating the symptom — the strip
                sitting under the scrim (see the container above) was what dulled it. */}
            {/* A real fight (not a Tweaks preview jump, which never actually pays out) pays
                points on EITHER outcome — even a loss has a consolation reward — so carry
                the same coin-shower the header pill plays elsewhere into Home, timed to the
                points that were just actually added to PLAYER.points at resolveBattle(). */}
            <button onClick={() => {
              const p = {};
              if (!preview && lastReward.points > 0) {
                const to = PLAYER.points;
                p.pointsFx = { from: to - lastReward.points, to, amount: lastReward.points, key: Date.now() };
              }
              ctx.nav('home', p);
            }} style={{ width: '100%', marginTop: 10, background: 'transparent', border: '1.5px solid rgba(255,255,255,.92)', color: 'rgba(255,255,255,.96)', borderRadius: 20, padding: '15px', fontSize: 16, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Back home')}</button>
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

        {/* Fighter already chosen (came in from the buddy's own fight button): show it
            locked in, with a "Change" link to reopen the grid. Skips the pick entirely
            for the common case where the child tapped fight ON the buddy they want. */}
        {!chooserOpen ? (() => {
          const w = winPercent(sel, villain);
          const wc = w >= 50 ? THEME.success : w >= 25 ? THEME.warning : THEME.danger;
          return (
            <React.Fragment>
              <SectionHead title={L('Your fighter')} action={L('Change')} onAction={() => setChooserOpen(true)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: THEME.successLight, borderRadius: 18, padding: '12px 14px', border: `2px solid ${THEME.success}`, marginBottom: 16 }}>
                <div style={{ flexShrink: 0 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={52} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel.name}</div>
                  <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 1 }}>Lv {sel.level} · {L('Power')} {power(sel)}</div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg2 }}>{L('Win chance')}</div>
                  <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: wc, lineHeight: 1.1 }}>{w}%</div>
                </div>
              </div>
            </React.Fragment>
          );
        })() : (
        <React.Fragment>
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
        </React.Fragment>
        )}

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
