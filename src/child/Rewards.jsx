// JoanX — child app · Rewards

import React from 'react';
import { ACHIEVEMENTS, PLAYER, POINTS } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, Confetti } from './shared.jsx';
import { sfx } from '../core/sound.jsx';

function Rewards({ ctx }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakDone = [true, true, true, true, true, false, false];
  const [claimed, setClaimed] = React.useState(false);
  const [pop, setPop] = React.useState(false);
  const claim = () => { if (claimed) return; sfx.claim(); setClaimed(true); setPop(true); PLAYER.points += POINTS.dailyAccidentFreeBonus; setTimeout(() => setPop(false), 1900); };

  // next accident-free milestone (A-1.1): 7 days → +300, 30 days → Special Egg
  const nextMilestone = PLAYER.streak < POINTS.streak7Days
    ? { days: POINTS.streak7Days - PLAYER.streak, prize: `+${POINTS.streak7Bonus} ${L('points')}` }
    : PLAYER.streak < POINTS.streak30Days
      ? { days: POINTS.streak30Days - PLAYER.streak, prize: L('a Special Egg') }
      : null;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 56, paddingBottom: 110, background: screenBgActive() }}>
      <div style={{ padding: '0 18px' }}>
        <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '0 0 16px' }}>{L('Rewards')}</h1>

        {/* streak */}
        <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(160deg,#fff2d1,#fff 80%)', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.joyBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="flame" size={26} color={THEME.joy} stroke={2.3} /></div>
            <div>
              <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{PLAYER.streak}{L('-day streak')}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2 }}>
                {nextMilestone
                  ? `${nextMilestone.days} ${L('more days for')} ${nextMilestone.prize}`
                  : L('Every milestone cleared — amazing!')}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: streakDone[i] ? THEME.joy : '#fff', border: streakDone[i] ? 'none' : `2px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: streakDone[i] ? '0 3px 8px rgba(255,140,102,.35)' : 'none' }}>
                  {streakDone[i] ? <Icon name="check" size={16} color="#fff" stroke={3} /> : <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 700 }}>{d}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* daily claim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: claimed ? THEME.successLight : '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 18, transition: 'background .3s' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: claimed ? '#fff' : THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={claimed ? 'calendar-check' : 'gift'} size={22} color={claimed ? THEME.success : THEME.gold} stroke={2.3} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Daily safe-walk reward')}</div>
            <div style={{ fontSize: 12, color: claimed ? '#274427' : THEME.fg2 }}>{claimed ? L('Claimed — see you tomorrow!') : `${L('Ready to claim')} · +${POINTS.dailyAccidentFreeBonus} ${L('points')}`}</div>
          </div>
          {claimed
            ? <Badge variant="success">{L('Claimed')}</Badge>
            : <Button variant="gold" size="sm" onClick={claim}>{L('Claim')}</Button>}
        </div>

        {/* accident-free streak milestones (F-14 / A-1.1) */}
        <SectionHead title={L('Streak rewards')} />
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 }}>
          {[
            { icon: 'flame', days: POINTS.streak7Days, label: L('accident-free days'), prize: `+${POINTS.streak7Bonus}` },
            { icon: 'egg', days: POINTS.streak30Days, label: L('accident-free days'), prize: L('Special Egg') },
          ].map((m, i) => {
            const hit = PLAYER.streak >= m.days;
            return (
              <div key={m.days} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: hit ? THEME.successLight : THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={hit ? 'check' : m.icon} size={19} color={hit ? THEME.success : THEME.gold} stroke={2.3} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{m.days} {m.label}</div>
                  <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 1 }}>
                    {hit ? L('Earned') : `${m.days - PLAYER.streak} ${L('days to go')}`}
                  </div>
                </div>
                <span className="game-font" style={{ flexShrink: 0, fontSize: 12.5, fontWeight: 500, color: hit ? THEME.success : THEME.fg2, background: hit ? THEME.successLight : THEME.goldLight, borderRadius: 999, padding: '4px 10px' }}>
                  {m.prize}
                </span>
              </div>
            );
          })}
        </div>

        {pop && (
          <div className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.34)' }}>
            <Confetti n={22} />
            <div className="jx-pop" style={{ width: 244, background: '#fff', borderRadius: 26, padding: '24px 20px', textAlign: 'center', boxShadow: THEME.shadowXl }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="gift" size={32} color={THEME.gold} stroke={2.3} /></div>
              <div className="game-font" style={{ fontSize: 21, fontWeight: 500 }}>{L('Daily reward claimed!')}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', padding: '8px 14px', borderRadius: 999, fontWeight: 600, fontSize: 15 }} className="game-font"><Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} />+{POINTS.dailyAccidentFreeBonus} {L('points')}</span>
              </div>
            </div>
          </div>
        )}

        {/* achievements */}
        <SectionHead title={L('Achievements')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, opacity: a.done ? 1 : 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: a.done ? THEME.successLight : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={a.icon} size={22} color={a.done ? THEME.success : THEME.fg3} stroke={2.3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{L(a.name)}</span>
                  {a.done && <Icon name="check-circle-2" size={15} color={THEME.success} stroke={2.4} />}
                </div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L(a.desc)}</div>
                {!a.done && a.progress != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1 }}><Bar value={a.progress} max={a.total} color={THEME.primary} height={6} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>{a.progress}/{a.total}</span>
                  </div>
                )}
              </div>
              <Badge variant="gold" style={{ flexShrink: 0 }}><Icon name="star" size={11} color="#9e7300" stroke={2.4} fill={THEME.gold} />{a.reward}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Rewards };
