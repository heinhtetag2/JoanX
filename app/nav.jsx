// JoanX — shared navigation: tab definitions + iOS-style tab bar.
// Used by both the clickable prototype (App.jsx) and the overview canvas.

const CHILD_TABS = [
  { id: 'home', root: 'home', icon: 'home', label: 'Home' },
  { id: 'collection', root: 'collection', icon: 'layout-grid', label: 'Collect', alt: ['character'] },
  { id: 'safety', root: 'safety', icon: 'shield-check', label: '', center: true },
  { id: 'battle', root: 'battle', icon: 'swords', label: 'Battle' },
  { id: 'rewards', root: 'rewards', icon: 'trophy', label: 'Rewards' },
];
const PARENT_TABS = [
  { id: 'p_reports', root: 'p_reports', icon: 'bar-chart-3', label: 'Reports' },
  { id: 'p_children', root: 'p_children', icon: 'users', label: 'Children' },
  { id: 'p_settings', root: 'p_settings', icon: 'sliders-horizontal', label: 'Rules' },
];

function TabBar({ tabs, active, onTab }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${THEME.border}`, display: 'flex', alignItems: 'flex-start', paddingTop: 9, zIndex: 40 }}>
      {tabs.map(t => {
        const on = active === t.id || (t.alt && t.alt.includes(active));
        if (t.center) {
          return (
            <button key={t.id} onClick={() => onTab && onTab(t.root)} style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ marginTop: -22, width: 56, height: 56, borderRadius: 999, background: on ? THEME.success : THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: on ? '0 8px 18px rgba(16,185,129,.4)' : THEME.shadowPrimary, border: '4px solid #fff' }}>
                <Icon name="shield-check" size={26} color="#fff" stroke={2.2} />
              </div>
            </button>
          );
        }
        return (
          <button key={t.id} onClick={() => onTab && onTab(t.root)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name={t.icon} size={23} color={on ? THEME.primary : THEME.fg3} stroke={on ? 2.5 : 1.9} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? THEME.primary : THEME.fg3 }}>{L(t.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { CHILD_TABS, PARENT_TABS, TabBar });
