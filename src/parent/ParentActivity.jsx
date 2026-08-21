// JoanX — parent app · ParentActivity (Alerts feed)

import React from 'react';
import { CHILDREN, PARENT_ALERTS, guardianMe } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// Same split the child app's own Notifications screen uses, for the same reason: this feed
// carries two kinds of news that have nothing to do with each other — something that needs a
// parent's attention (a warning, a device dropping off, protection getting turned down) and
// reassurance that things went fine (a safe walk, a streak, the device back online). Mixed
// together by time alone, checking for a problem means reading past the good news to find it.
// Safety comes first: it's the reason a parent opens this tab at all, the mirror of the child
// app putting Buddy first because that is what a child hopes to see.
const FAMILY = { warning: 'safety', ignored: 'safety', limited: 'safety', device_off: 'safety', impact: 'safety', safe: 'progress', streak: 'progress', device_on: 'progress' };
const familyOf = (a) => FAMILY[a.kind] || 'safety';
const FAMILIES = [{ id: 'safety', label: 'Safety' }, { id: 'progress', label: 'Progress' }];

// `kind` maps to an icon + tone tile; each row also shows the child (mascot) it belongs to,
// since — unlike the child app, which only ever has one buddy to talk about — a parent account
// can be watching several.
const KIND = {
  warning:    { icon: 'triangle-alert', bg: THEME.warningLight,  fg: THEME.warning },
  ignored:    { icon: 'octagon-alert',  bg: THEME.dangerLight,   fg: THEME.danger },
  impact:     { icon: 'triangle-alert', bg: THEME.dangerLight,   fg: THEME.danger },
  safe:       { icon: 'shield-check',   bg: THEME.successLight,  fg: THEME.success },
  streak:     { icon: 'flame',          bg: THEME.goldLight,     fg: THEME.gold },
  device_off: { icon: 'wifi-off',       bg: THEME.surface2,      fg: THEME.fg2 },
  device_on:  { icon: 'wifi',           bg: THEME.surface2,      fg: THEME.fg2 },
  limited:    { icon: 'shield-alert',   bg: THEME.warningLight,  fg: THEME.warning },
};

// One row. `top` draws the hairline separating it from the row above — the first row in a card
// doesn't take one. Unread is carried by the brand wash and the dot on the right, never by
// weight — the same language the child app's own feed uses, so a parent switching between the
// two apps reads "new" the same way in both.
function AlertRow({ a, ctx, read, top }) {
  const k = KIND[a.kind] || KIND.safe;
  const child = CHILDREN.find(c => c.id === a.child);
  return (
    <div onClick={() => { read(a.id); if (a.kind === 'impact') { ctx.nav('p_alert', { alertId: a.id }); return; } if (child) ctx.nav('p_settings', { child }); }}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: top ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', background: a.unread ? BRAND.primaryLight + '88' : '#fff' }}>
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
        {/* Both parents' phones buzz for the same event. Without this they both ring the
            child about one warning — so the second one to look sees that it is handled. */}
        {a.ack && a.ack !== guardianMe().name && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 5, padding: '3px 8px', borderRadius: 999, background: THEME.successLight, color: THEME.success, fontSize: 11, fontWeight: 800 }}>
            <Icon name="check" size={11} color={THEME.success} stroke={3} />
            {a.ack} {L('already checked this')}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{L(a.time)}</span>
        {a.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: BRAND.primary }} />}
      </div>
    </div>
  );
}

// A labelled card of rows. Renders nothing when its list is empty, so a filter that empties a
// group takes the group's heading away with it rather than leaving a title over a void.
function AlertGroup({ label, list, ctx, read }) {
  if (!list.length) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, margin: '0 4px 8px' }}>{label}</div>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
        {list.map((a, i) => <AlertRow key={a.id} a={a} ctx={ctx} read={read} top={!!i} />)}
      </div>
    </div>
  );
}

function ParentActivity({ ctx }) {
  const [items, setItems] = React.useState(PARENT_ALERTS);
  const [tab, setTab] = React.useState('safety');
  const unread = items.filter(i => i.unread).length;
  const read = (id) => setItems(s => s.map(i => i.id === id ? { ...i, unread: false } : i));
  const allRead = () => setItems(s => s.map(i => ({ ...i, unread: false })));

  // Today / Earlier still splits the list — but within the chosen side, so time orders what
  // is on screen rather than deciding what is.
  const shown = items.filter(i => familyOf(i) === tab);
  const today = shown.filter(a => a.today);
  const earlier = shown.filter(a => !a.today);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead title={L('Alerts')}
        right={unread ? <button onClick={allRead} style={{ border: 'none', background: 'none', color: BRAND.primary, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>{L('Mark read')}</button> : null} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* Same well + chip recipe as the child app's tab bar: track at --r-lg 16, chips at
            --r-md 12 once the 4px inset is taken out. The count is UNREAD, not total, for the
            same reason it is there — a tab is worth crossing to because something is waiting
            behind it. */}
        <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 16, padding: 4, marginBottom: 16 }}>
          {FAMILIES.map(f => {
            const n = items.filter(i => familyOf(i) === f.id && i.unread).length;
            const on = tab === f.id;
            return (
              <button key={f.id} onClick={() => setTab(f.id)} aria-pressed={on}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 800, background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', color: on ? THEME.fg1 : THEME.fg2, transition: 'background .16s ease, color .16s ease', WebkitTapHighlightColor: 'transparent' }}>
                {L(f.label)}
                {n > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 6px', background: on ? BRAND.primary : BRAND.primaryLight, color: on ? '#fff' : BRAND.primaryDark, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
                )}
              </button>
            );
          })}
        </div>
        <AlertGroup label={L('Today')} list={today} ctx={ctx} read={read} />
        <AlertGroup label={L('Earlier')} list={earlier} ctx={ctx} read={read} />
        {shown.length === 0 && (
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '26px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: THEME.fg3 }}>{L('Nothing here yet')}</div>
        )}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L("JoanX only pings you for safety and your child's progress.")}</div>
      </div>
    </div>
  );
}

export { ParentActivity };
