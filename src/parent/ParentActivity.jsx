// JoanX — parent app · ParentActivity (Alerts feed)

import React from 'react';
import { CHILDREN, PARENT_ALERTS } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── Alerts / activity feed — recent safety moments across all children ──
// `kind` maps to an icon + tone tile; each row shows the child (mascot) it
// belongs to, so the feed reads at a glance. Purely presentational (demo data).
const KIND = {
  warning:    { icon: 'triangle-alert', bg: THEME.warningLight,  fg: THEME.warning },
  ignored:    { icon: 'octagon-alert',  bg: THEME.dangerLight,   fg: THEME.danger },
  safe:       { icon: 'shield-check',   bg: THEME.successLight,  fg: THEME.success },
  streak:     { icon: 'flame',          bg: THEME.goldLight,     fg: THEME.gold },
  device_off: { icon: 'wifi-off',       bg: THEME.surface2,      fg: THEME.fg2 },
  device_on:  { icon: 'wifi',           bg: THEME.surface2,      fg: THEME.fg2 },
};

function ParentActivity({ ctx }) {
  const byId = id => CHILDREN.find(c => c.id === id);
  const today = PARENT_ALERTS.filter(a => a.today);
  const earlier = PARENT_ALERTS.filter(a => !a.today);

  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;

  const row = (a, i) => {
    const k = KIND[a.kind] || KIND.safe;
    const child = byId(a.child);
    const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][CHILDREN.indexOf(child) % 6];
    return (
      <div key={a.id} onClick={() => child && ctx.nav('p_settings', { child })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
        {/* kind tile with the child's mascot tucked in the corner */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={k.icon} size={19} color={k.fg} stroke={2.3} />
          </div>
          {child && <span style={{ position: 'absolute', bottom: -3, right: -4 }}><MascotChip species={child.avatar} color={child.color} size={20} bg="#fff" /></span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L(a.title)}</div>
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {child ? `${child.name} · ` : ''}{L(a.sub)}
          </div>
        </div>
        <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, flexShrink: 0 }}>{L(a.time)}</span>
      </div>
    );
  };

  const card = rows => <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>{rows}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Parent app')} title={L('Alerts')} />
      <div style={{ padding: '8px 16px 0' }}>
        {PARENT_ALERTS.length === 0 ? (
          <div style={{ textAlign: 'center', fontSize: 13, color: THEME.fg3, fontWeight: 600, marginTop: 40 }}>{L('Nothing yet — safety activity will show up here.')}</div>
        ) : (
          <React.Fragment>
            {today.length > 0 && <React.Fragment>{label(L('Today'))}{card(today.map(row))}</React.Fragment>}
            {earlier.length > 0 && <React.Fragment>{label(L('Earlier'))}{card(earlier.map(row))}</React.Fragment>}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export { ParentActivity };
