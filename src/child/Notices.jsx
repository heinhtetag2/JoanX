// JoanX — child app · Notices (공지사항, reached from Profile › Account)

import React from 'react';
import { NOTICES } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// Category pill — brand tint for updates, neutral for policy/notice.
const TAGS = {
  update: { l: 'Update', bg: 'var(--color-interactives-badge-evergreen-default, #E9F1E9)', fg: THEME.success },
  policy: { l: 'Policy', bg: THEME.surface2, fg: THEME.fg2 },
  notice: { l: 'Announcement', bg: THEME.surface2, fg: THEME.fg2 },
};
function Pill({ tag }) {
  const t = TAGS[tag] || TAGS.notice;
  return <span style={{ fontSize: 10, fontWeight: 800, color: t.fg, background: t.bg, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: .3 }}>{L(t.l)}</span>;
}

// Both the list and the single-notice view live here — one screen, internal
// state — so a child taps once to read and once (back) to return, without a
// second router entry.
function Notices({ ctx }) {
  const [openId, setOpenId] = React.useState(null);
  const active = NOTICES.find(n => n.id === openId);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Notices')} onBack={() => active ? setOpenId(null) : ctx.back()} />
      <div style={{ padding: '0 16px' }}>

        {active ? (
          /* single notice */
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '16px 16px 20px', marginTop: 12 }}>
            <div style={{ marginBottom: 8 }}><Pill tag={active.tag} /></div>
            <div style={{ fontSize: 17, fontWeight: 800, color: THEME.fg1, lineHeight: 1.35 }}>{L(active.title)}</div>
            <div style={{ fontSize: 12, color: THEME.fg3, marginTop: 6 }}>{active.date}</div>
            <div style={{ height: 1, background: THEME.border, margin: '16px 0' }} />
            {active.body.map((p, i) => (
              <div key={i} style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6, marginTop: i ? 12 : 0 }}>{L(p)}</div>
            ))}
          </div>
        ) : (
          /* list */
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginTop: 12 }}>
            {NOTICES.map((n, i) => (
              <button key={n.id} onClick={() => setOpenId(n.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ marginBottom: 4 }}><Pill tag={n.tag} /></div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.35 }}>{L(n.title)}</div>
                  <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 3 }}>{n.date}</div>
                </div>
                <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export { Notices };
