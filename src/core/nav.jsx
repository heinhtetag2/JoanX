import { Icon, THEME } from './primitives.jsx';
import { shade } from './characters.jsx';
import { L } from './i18n.jsx';

// JoanX — shared navigation: tab definitions + iOS-style tab bar.
// Used by both the clickable prototype (App.jsx) and the overview canvas.

const CHILD_TABS = [
  { id: 'home', root: 'home', icon: 'house', label: 'Home' },
  { id: 'collection', root: 'collection', icon: 'layout-grid', label: 'Collect', alt: ['character'] },
  // The center CTA opens the villain road (빌런 도감) directly — you pick your
  // opponent on the map first, then "배틀 시작" drops into the Battle hub to fight.
  // (id stays 'battle' for the tour hook + center styling; only the target differs.)
  { id: 'battle', root: 'villaindex', icon: 'swords', label: '', center: true },
  // Friends promoted to a primary tab (per product decision). Safety is no longer
  // a tab but stays reachable from every Home variant's "protected" status card.
  { id: 'friends', root: 'friends', icon: 'heart-handshake', label: 'Friends', alt: ['friendhouse', 'addfriend'] },
  // myhouse/decorate now live under the Profile tab (see App.jsx activeChildTab)
  { id: 'profile', root: 'profile', icon: 'circle-user', label: 'Profile', alt: ['myhouse', 'decorate'] },
];
const PARENT_TABS = [
  { id: 'p_reports', root: 'p_reports', icon: 'line-chart', label: 'Reports' },
  { id: 'p_children', root: 'p_children', icon: 'puzzle', label: 'Children' },
  { id: 'p_connect', root: 'p_connect', icon: 'scan-line', label: '', center: true },
  { id: 'p_activity', root: 'p_activity', icon: 'bell', label: 'Alerts' },
  { id: 'p_account', root: 'p_account', icon: 'circle-user', label: 'Profile' },
];

// `badges` is an optional { [tabId]: count } — a tab worth crossing to says so from here,
// rather than making you open it to find out. Used by the parent app's Alerts tab, where the
// whole point of the tab is that something may be waiting behind it.
function TabBar({ tabs, active, onTab, accent, badges }) {
  const ac = accent || THEME.primary;          // active tint follows the buddy color when given
  const renderTab = t => {
    const on = active === t.id || (t.alt && t.alt.includes(active));
    const n = (badges && badges[t.id]) || 0;
    return (
      <button key={t.id} data-tour={'tab-' + t.id} disabled={t.disabled} onClick={t.disabled ? undefined : () => onTab && onTab(t.root)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: t.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: t.disabled ? .4 : 1, pointerEvents: t.disabled ? 'none' : undefined }}>
        <span style={{ position: 'relative', display: 'flex' }}>
          <Icon name={t.icon} size={23} color={on ? ac : THEME.fg3} stroke={on ? 2.5 : 1.9} />
          {/* count, not a bare dot: "5 things are waiting" and "1 thing is waiting" are
              different enough decisions to be worth the two extra pixels. Red rather than the
              brand tint — on a safety app this is the one place a parent should be able to
              read at a glance, across the room, without having decoded the palette first. */}
          {n > 0 && (
            <span style={{ position: 'absolute', top: -5, left: 12, minWidth: 11, height: 15, padding: '0 4px', borderRadius: 999, background: THEME.danger, color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: '15px', textAlign: 'center', border: '2px solid #fff', boxSizing: 'content-box' }}>{n > 9 ? '9+' : n}</span>
          )}
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? ac : THEME.fg3 }}>{L(t.label)}</span>
      </button>
    );
  };
  // The battle button is the one CTA in the tab bar, so it gets the same living treatment as
  // the story's CTA: a gradient that drifts across it and a highlight that sweeps through
  // (.jx-cta). It's mixed from the buddy's own colour, so it moves with the accent rather than
  // introducing a second one. The fill lives in its own clipped layer, because .jx-cta hides
  // overflow — the hairline arc has to stay outside it or it would be cropped away.
  const grad = `linear-gradient(90deg, ${shade(ac, -26)} 0%, ${ac} 25%, ${shade(ac, 34)} 50%, ${ac} 75%, ${shade(ac, -26)} 100%)`;
  const renderCenter = t => (
    <button key={t.id} data-tour={'tab-' + t.id} onClick={() => onTab && onTab(t.root)} style={{ width: 76, flexShrink: 0, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
      <div style={{ marginTop: -26, width: 62, height: 62, borderRadius: 999, background: ac, border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <span className="jx-cta" style={{ position: 'absolute', inset: 0, borderRadius: 999, backgroundImage: grad, '--jx-cta-glow': `${ac}00`, '--jx-cta-glow-soft': `${ac}00` }} />
        <Icon name={t.icon} size={30} color="#fff" stroke={2.2} style={{ position: 'relative', zIndex: 1 }} />
        {/* hairline on the protruding arc only (button pokes 15px above the bar), so the
            bar's top border appears to continue around the notch instead of a full ring */}
        <div style={{ position: 'absolute', inset: -7, borderRadius: 999, border: `1px solid ${THEME.border}`, clipPath: 'inset(-1px -1px 50px -1px)', pointerEvents: 'none' }} />
      </div>
    </button>
  );
  // the raised center button sits in a fixed-width slot between two equal-width
  // halves, so it stays geometrically centered even with uneven tab counts
  const ci = tabs.findIndex(t => t.center);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px 24px 0 0', border: `1px solid ${THEME.border}`, borderBottom: 'none', boxShadow: '0 -8px 24px rgba(46,43,41,0.07)', display: 'flex', alignItems: 'flex-start', paddingTop: 11, zIndex: 40 }}>
      {ci < 0 ? tabs.map(renderTab) : (
        <>
          <div style={{ flex: 1, display: 'flex' }}>{tabs.slice(0, ci).map(renderTab)}</div>
          {renderCenter(tabs[ci])}
          <div style={{ flex: 1, display: 'flex' }}>{tabs.slice(ci + 1).map(renderTab)}</div>
        </>
      )}
    </div>
  );
}

export { CHILD_TABS, PARENT_TABS, TabBar };
