// JoanX — shared navigation: tab definitions + iOS-style tab bar.
// Used by both the clickable prototype (App.jsx) and the overview canvas.

const CHILD_TABS = [
  { id: 'home', root: 'home', icon: 'house', label: 'Home' },
  { id: 'collection', root: 'collection', icon: 'layout-grid', label: 'Collect', alt: ['character'] },
  { id: 'battle', root: 'battle', icon: 'swords', label: '', center: true },
  { id: 'safety', root: 'safety', icon: 'shield-check', label: 'Safety' },
  { id: 'profile', root: 'profile', icon: 'user', label: 'Profile' },
];
const PARENT_TABS = [
  { id: 'p_reports', root: 'p_reports', icon: 'bar-chart-3', label: 'Reports' },
  { id: 'p_children', root: 'p_children', icon: 'users', label: 'Children' },
  { id: 'p_account', root: 'p_account', icon: 'settings', label: 'Settings' },
];

function TabBar({ tabs, active, onTab, accent }) {
  const ac = accent || THEME.primary;          // active tint follows the buddy color when given
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 86, background: 'rgba(255,255,255,.94)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '24px 24px 0 0', border: `1px solid ${THEME.border}`, borderBottom: 'none', boxShadow: '0 -8px 24px rgba(46,43,41,0.07)', display: 'flex', alignItems: 'flex-start', paddingTop: 11, zIndex: 40 }}>
      {tabs.map(t => {
        const on = active === t.id || (t.alt && t.alt.includes(active));
        if (t.center) {
          return (
            <button key={t.id} onClick={() => onTab && onTab(t.root)} style={{ flex: 1, display: 'flex', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
              <div style={{ marginTop: -26, width: 62, height: 62, borderRadius: 999, background: ac, border: '6px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={t.icon} size={30} color="#fff" stroke={2.2} />
              </div>
            </button>
          );
        }
        return (
          <button key={t.id} disabled={t.disabled} onClick={t.disabled ? undefined : () => onTab && onTab(t.root)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: t.disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: t.disabled ? .4 : 1, pointerEvents: t.disabled ? 'none' : undefined }}>
            <Icon name={t.icon} size={23} color={on ? ac : THEME.fg3} stroke={on ? 2.5 : 1.9} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: on ? ac : THEME.fg3 }}>{L(t.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, { CHILD_TABS, PARENT_TABS, TabBar });
