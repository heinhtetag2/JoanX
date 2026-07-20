// JoanX — child app · Notifications

import React from 'react';
import { CHARACTERS, FEATURES, PLAYER } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// The feed carries two kinds of news that have nothing to do with each other: what the buddy
// and the game did (a reward, an evolution, a streak, a win) and what the world and the
// grown-ups did (a good crossing, a settings change). Interleaved by time alone they compete —
// a child scanning for their buddy scrolls past the crossing, and the settings change lands
// between two prizes. So each `type` declares a side, and the screen offers one at a time.
const FAMILY = { reward: 'buddy', char: 'buddy', streak: 'buddy', battle: 'buddy', safety: 'safety', zone: 'safety', parent: 'safety' };
const familyOf = (n) => FAMILY[n.type] || 'buddy';
// Buddy first: it is what a child opens this screen hoping to see. Safety second, where it can
// be found rather than scrolled past.
const FAMILIES = [{ id: 'buddy', label: 'Buddy' }, { id: 'safety', label: 'Safety' }];

// The feed itself. Takes the active character because one row is about them by name, and shows
// their mascot rather than an icon. Danger-zone alerts (F-05) are excluded this revision.
const notifSeed = (c) => [
  { id: 'n1', when: 'today', type: 'reward', icon: 'gift', color: THEME.gold, bg: THEME.goldLight, t: 'Daily reward is ready', s: 'Claim +100 points for walking safely.', time: 'now', unread: true, cta: 'Claim', go: 'rewards' },
  // The buddy's name is a {name} placeholder rather than baked in, so the title stays a
  // translatable key — L() is an exact lookup, and a name spliced in ahead of it would never
  // match the Korean table. NotifRow fills it at render, which is also where the language is
  // known: switching to 한국어 re-renders rather than remounting, so a seed-time swap would
  // leave this one row in English.
  { id: 'n2', when: 'today', type: 'char', mascot: true, t: '{name} is almost ready to evolve', s: '180 XP to Stage 3 — keep walking phone-free.', time: '20m', unread: true, go: 'character' },
  { id: 'n3', when: 'today', type: 'safety', icon: 'timer', color: THEME.success, bg: THEME.successLight, t: 'Nice save near Oak St.', s: 'You looked up in 2s — +30 bonus points.', time: '1h', unread: true },
  { id: 'n4', when: 'today', type: 'zone', icon: 'map-pin', color: THEME.danger, bg: THEME.dangerLight, t: 'New danger zone near school', s: 'A busy crossing was added to your route.', time: '3h', unread: false },
  { id: 'n5', when: 'earlier', type: 'streak', icon: 'flame', color: THEME.joy, bg: THEME.joyBg, t: '5-day safe streak!', s: '2 more days unlocks a Special buddy.', time: 'Yest.', unread: false },
  { id: 'n6', when: 'earlier', type: 'battle', icon: 'swords', color: THEME.camping, bg: THEME.campingBg, t: 'You beat Rush', s: '+120 points earned.', time: 'Yest.', unread: false, go: 'battle' },
  { id: 'n7', when: 'earlier', type: 'parent', icon: 'shield-check', color: THEME.primary, bg: THEME.primaryLight, t: 'A grown-up updated your settings', s: 'Warning style is now set to “gentle”.', time: '2d', unread: false },
].filter(n => FEATURES.dangerZones || n.type !== 'zone');

// One row. `top` draws the hairline that separates it from the row above — the first row in a
// card doesn't take one. Unread is carried by the brand-green wash and the dot on the right,
// never by weight, so a read row and an unread one still scan as the same kind of thing.
function NotifRow({ n, c, ctx, read, top }) {
  return (
    <div onClick={() => { read(n.id); if (n.go) ctx.nav(n.go, { id: c.id }); }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderTop: top ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', background: n.unread ? THEME.brandLight + '55' : '#fff' }}>
      {n.mascot
        ? <div style={{ width: 40, height: 40, borderRadius: 12, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={40} /></div>
        : <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={n.icon} size={20} color={n.color} stroke={2.3} /></div>}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.3 }}>{L(n.t).replace('{name}', c.name)}</span>
        </div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4 }}>{L(n.s)}</div>
        {n.cta && <button onClick={(e) => { e.stopPropagation(); read(n.id); ctx.nav(n.go); }} style={{ marginTop: 8, background: THEME.gold, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>{L(n.cta)}</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600 }}>{n.time}</span>
        {n.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: THEME.brand }} />}
      </div>
    </div>
  );
}

// A labelled card of rows. Renders nothing when its list is empty, so a filter that empties a
// group takes the group's heading away with it rather than leaving a title over a void.
function NotifGroup({ label, list, children }) {
  if (!list.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, margin: '0 4px 8px' }}>{label}</div>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────────
function Notifications({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [items, setItems] = React.useState(() => notifSeed(c));
  const [tab, setTab] = React.useState('buddy');
  const unread = items.filter(i => i.unread).length;
  const read = (id) => setItems(s => s.map(i => i.id === id ? { ...i, unread: false } : i));
  const allRead = () => setItems(s => s.map(i => ({ ...i, unread: false })));

  // Today / Earlier still splits the list — but within the chosen side, so time orders what
  // is on screen rather than deciding what is.
  const shown = items.filter(i => familyOf(i) === tab);
  const Group = ({ label, when }) => {
    const list = shown.filter(i => i.when === when);
    return (
      <NotifGroup label={label} list={list}>
        {list.map((n, i) => <NotifRow key={n.id} n={n} c={c} ctx={ctx} read={read} top={!!i} />)}
      </NotifGroup>
    );
  };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Notifications')} onBack={() => ctx.nav('home')} right={unread ? <button onClick={allRead} style={{ border: 'none', background: 'none', color: THEME.brand, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>{L('Mark read')}</button> : null} />
      <div style={{ padding: '0 16px' }}>
        {/* A well (surface2, the system's chip/well tint) holding two sm buttons. Radii nest on
            the scale: track --r-lg 16, minus the 4px inset, leaves the chips at --r-md 12, the
            token for small buttons — so the gap between chip and track reads as even rather
            than as two unrelated curves. The selected chip is the card recipe at chip scale:
            white on the well, defined by shadowCard's hairline ring, no drop shadow.

            The count is UNREAD, not total: a tab is worth crossing to because something is
            waiting behind it, and a number that never moves stops being read. It carries the
            brand tint (brandLight/brandDark) when its tab is resting and inverts to solid brand
            green on the selected one, so the count stays legible either side of the swap. */}
        <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 16, padding: 4, marginBottom: 16 }}>
          {FAMILIES.map(f => {
            const n = items.filter(i => familyOf(i) === f.id && i.unread).length;
            const on = tab === f.id;
            // Not .jx-press — that scales to .9, which is right for an icon button and far too
            // much travel for a half-width chip. The Button primitive's own idiom is a short
            // transition and no tap highlight, so the swap eases rather than jumps.
            return (
              <button key={f.id} onClick={() => setTab(f.id)} aria-pressed={on}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 800, background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', color: on ? THEME.fg1 : THEME.fg2, transition: 'background .16s ease, color .16s ease', WebkitTapHighlightColor: 'transparent' }}>
                {L(f.label)}
                {n > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 6px', background: on ? THEME.brand : THEME.brandLight, color: on ? '#fff' : THEME.brandDark, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                )}
              </button>
            );
          })}
        </div>
        <Group label={L('Today')} when="today" />
        <Group label={L('Earlier')} when="earlier" />
        {shown.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '26px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: THEME.fg3 }}>{L('Nothing here yet')}</div>
        )}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L('JoanX only pings you for safety, rewards, and your buddy.')}</div>
      </div>
    </div>
  );
}

export { Notifications };
