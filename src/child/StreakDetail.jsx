// JoanX — child app · Safe-streak detail (reached from the home streak card)
//
// The streak is the product's core loop made legible: one accident-free day is
// one flame, and the flames buy real things (a 7-day bonus, a 30-day Special
// Egg). The home card shows only the count; this page shows what it's building
// toward — the week so far, the two milestones with their live progress, and the
// one rule that makes a streak a streak (miss a day, start over). It reads
// ACHIEVEMENTS/POINTS-side truth (PLAYER.streak + POINTS.streak*), never a second
// number, so the home card and this page can't disagree.

import React from 'react';
import { PLAYER, POINTS } from '../core/data.jsx';
import { Bar, Icon, SealCheck, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Streak-badge ladder ──────────────────────────────────────────────
// Length landmarks for how long the streak has burned. These are dedication
// markers, not reward tiers (the tangible payouts live in "Streak goals" below,
// straight from POINTS). Every badge is the SAME size — only the DESIGN changes:
// the flame art (from Figma, /assets/streak) runs hotter and more elaborate up the
// ladder. A reached tier burns in full colour; a locked one is desaturated to a
// grey flame. Data-driven off PLAYER.streak, so it can't disagree with the count.
const HEAT = [
  { days: 3,   img: 1 },
  { days: 10,  img: 2 },
  { days: 30,  img: 3 },
  { days: 100, img: 4 },
  { days: 200, img: 5 },
];
const FLAME_SIZE = 36;   // one size for every badge — the design changes, not the scale.
                         // Sized to the app's icon rhythm (the week dots are 34px), so the
                         // ladder reads as part of the system, not oversized hero art.

// One flame from the set. The PNGs sit on white, which blends into the white card;
// a locked tier is desaturated to a grey flame.
function StreakFlame({ tier, lit }) {
  return (
    <img src={`/assets/streak/flame-${tier.img}.png`} alt="" draggable="false"
      style={{ height: FLAME_SIZE, display: 'block', filter: lit ? 'none' : 'grayscale(1) opacity(.5)' }} />
  );
}

function StreakDetail({ ctx }) {
  const streak = PLAYER.streak;
  // The two accident-free milestones, straight from POINTS so the numbers match the grant
  // engine. 7 days pays points; 30 days pays a Special Egg (and the Ember buddy). Built in
  // render, not at module load, so the reward copy re-localises when the language toggles.
  const MILESTONES = [
    { days: POINTS.streak7Days,  reward: `+${POINTS.streak7Bonus} ${L('points')}` },
    { days: POINTS.streak30Days, reward: L('a Special Egg') },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Safe streak')} onBack={() => ctx.back()} />
      <div style={{ padding: '0 16px' }}>

        {/* streak-heat ladder — the flame grows hotter the longer the streak burns */}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: '15px 16px 16px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1, marginBottom: 16 }}>{L('Streak milestones')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            {HEAT.map((tier, i) => {
              // Prototype default: unlock the first four milestones (3/10/30/100d) so the
              // ladder shows lit by default; the rest still light from the live streak.
              const lit = i < 4 || streak >= tier.days;
              return (
                <React.Fragment key={tier.days}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <StreakFlame tier={tier} lit={lit} />
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: lit ? THEME.fg1 : THEME.fg3 }}>{tier.days}{L('d')}</span>
                  </div>
                  {i < HEAT.length - 1 && (
                    // a SHORT connector, centred in the gap and on the flame's mid-line
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: FLAME_SIZE / 2 - 1 }}>
                      <div style={{ width: 16, height: 2, borderRadius: 999,
                        background: (i + 1 < 4 || streak >= HEAT[i + 1].days) ? '#f0d6c4' : THEME.border }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* milestones — the two goals with their live progress, reached ones flagged */}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1, padding: '15px 16px 6px' }}>{L('Streak goals')}</div>
          {MILESTONES.map((m, i) => {
            const done = streak >= m.days;
            return (
              <div key={m.days} style={{ padding: '14px 16px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                  {/* the same seal-check the daily tasks use — green when the goal is reached,
                      grey while it's still being earned (replaces the padlock chip) */}
                  <SealCheck size={40} bg={done ? THEME.success : THEME.border} tick={done ? '#fff' : THEME.fg3} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* title left, count/Reached pushed to the top-right — so the row isn't
                        four things stacked in one column. The bar spans below on its own. */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 14.5, fontWeight: 800, color: THEME.fg1 }}>{m.days}{L('-day streak')}</span>
                      {done
                        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: THEME.success, background: THEME.successLight, borderRadius: 999, padding: '2px 8px' }}>{L('Reached')}</span>
                        : <span style={{ flexShrink: 0, fontSize: 12, fontWeight: 800, color: THEME.fg3 }}>{streak}/{m.days}</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{m.reward}</div>
                  </div>
                </div>
                {/* just the bar now — full-width across the row, no label stacked beneath it */}
                {!done && (
                  <div style={{ marginTop: 11 }}>
                    <Bar value={streak} max={m.days} color={THEME.joy} height={6} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* how it works — the one rule that gives the streak its stakes */}
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: '14px 16px 6px', marginBottom: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1, marginBottom: 4 }}>{L('How streaks work')}</div>
          {[['flame', L('Walk safely each day to add to your streak.')],
            ['rotate-ccw', L('Miss a day and your streak starts over.')],
            ['gift', L('Reach a goal to earn its reward.')]].map(([ic, tx], i) => (
            <div key={ic} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <Icon name={ic} size={17} color={THEME.joy} stroke={2.3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: THEME.fg1, fontWeight: 600, lineHeight: 1.4 }}>{tx}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { StreakDetail };
