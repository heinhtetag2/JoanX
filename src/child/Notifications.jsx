// JoanX — child app · Notifications

import React from 'react';
import { CHARACTERS, FEATURES, PLAYER } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Notifications ────────────────────────────────────────────────────
function Notifications({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const init = [
    { id: 'n1', when: 'today', type: 'reward', icon: 'gift', color: THEME.gold, bg: THEME.goldLight, t: 'Daily reward is ready', s: 'Claim +100 points for walking safely.', time: 'now', unread: true, cta: 'Claim', go: 'rewards' },
    { id: 'n2', when: 'today', type: 'char', mascot: true, t: `${c.name} is almost ready to evolve`, s: '180 XP to Stage 3 — keep walking phone-free.', time: '20m', unread: true, go: 'character' },
    { id: 'n3', when: 'today', type: 'safety', icon: 'timer', color: THEME.success, bg: THEME.successLight, t: 'Nice save near Oak St.', s: 'You looked up in 2s — +30 bonus points.', time: '1h', unread: true },
    { id: 'n4', when: 'today', type: 'zone', icon: 'map-pin', color: THEME.danger, bg: THEME.dangerLight, t: 'New danger zone near school', s: 'A busy crossing was added to your route.', time: '3h', unread: false },
    { id: 'n5', when: 'earlier', type: 'streak', icon: 'flame', color: THEME.joy, bg: THEME.joyBg, t: '5-day safe streak!', s: '2 more days unlocks a Special buddy.', time: 'Yest.', unread: false },
    { id: 'n6', when: 'earlier', type: 'battle', icon: 'swords', color: THEME.camping, bg: THEME.campingBg, t: 'You beat Distractor', s: '+120 points earned.', time: 'Yest.', unread: false, go: 'battle' },
    { id: 'n7', when: 'earlier', type: 'parent', icon: 'shield-check', color: THEME.primary, bg: THEME.primaryLight, t: 'A grown-up updated your settings', s: 'Warning style is now set to “gentle”.', time: '2d', unread: false },
  ];
  // danger-zone alerts (F-05) are excluded this revision — hide when off
  const [items, setItems] = React.useState(init.filter(n => FEATURES.dangerZones || n.type !== 'zone'));
  const unread = items.filter(i => i.unread).length;
  const read = (id) => setItems(s => s.map(i => i.id === id ? { ...i, unread: false } : i));
  const allRead = () => setItems(s => s.map(i => ({ ...i, unread: false })));

  const Group = ({ label, list }) => list.length ? (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, margin: '0 4px 8px' }}>{label}</div>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
        {list.map((n, i) => (
          <div key={n.id} onClick={() => { read(n.id); if (n.go) ctx.nav(n.go, { id: c.id }); }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', background: n.unread ? THEME.primaryLight + '55' : '#fff' }}>
            {n.mascot
              ? <div style={{ width: 40, height: 40, borderRadius: 12, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={40} /></div>
              : <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={n.icon} size={20} color={n.color} stroke={2.3} /></div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.3 }}>{L(n.t)}</span>
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4 }}>{L(n.s)}</div>
              {n.cta && <button onClick={(e) => { e.stopPropagation(); read(n.id); ctx.nav(n.go); }} style={{ marginTop: 8, background: THEME.gold, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>{L(n.cta)}</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600 }}>{n.time}</span>
              {n.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: THEME.primary }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Notifications')} onBack={() => ctx.nav('home')} right={unread ? <button onClick={allRead} style={{ border: 'none', background: 'none', color: THEME.primary, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>{L('Mark read')}</button> : null} />
      <div style={{ padding: '0 16px' }}>
        {unread === 0 && (
          <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.successLight, color: '#274427', padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}><Icon name="check" size={14} color={THEME.success} stroke={2.6} /> {L('All caught up')}</div>
          </div>
        )}
        <Group label={L('Today')} list={items.filter(i => i.when === 'today')} />
        <Group label={L('Earlier')} list={items.filter(i => i.when === 'earlier')} />
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L('JoanX only pings you for safety, rewards, and your buddy.')}</div>
      </div>
    </div>
  );
}

export { Notifications };
