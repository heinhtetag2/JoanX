// JoanX — parent app · ParentActivity (Alerts feed)

import React from 'react';
import { CHILDREN, alertUnread, guardianMe, markAlertRead, markAllAlertsRead, parentAlertFeed } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// Same split the child app's own Notifications screen uses, for the same reason: this feed
// carries two kinds of news that have nothing to do with each other — something that needs a
// parent's attention (a warning, a device dropping off, protection getting turned down) and
// reassurance that things went fine (a safe walk, a streak, the device back online). Mixed
// together by time alone, checking for a problem means reading past the good news to find it.
// Safety comes first: it's the reason a parent opens this tab at all, the mirror of the child
// app putting Buddy first because that is what a child hopes to see.
// A guardian asking to join a group is filed under Safety, not a third tab — it is exactly
// the "who can see my child" question, which is a safety question before it is anything else.
const FAMILY = { warning: 'safety', ignored: 'safety', limited: 'safety', device_off: 'safety', impact: 'safety', join_request: 'safety', safe: 'progress', streak: 'progress', device_on: 'progress' };
const familyOf = (a) => FAMILY[a.kind] || 'safety';
const FAMILIES = [{ id: 'safety', label: 'Safety' }, { id: 'progress', label: 'Progress' }];

// The one event on this feed that is not news — it is a thing to do, now. A parent whose child
// may have fallen and has not answered for twenty seconds should not have to work out which of
// six identically-weighted rows is that one, and then tap through to find the phone button.
const URGENT = new Set(['impact']);

// The rows are authored with a human shorthand ('5m', '2h', 'Yesterday') rather than real
// timestamps, and they arrive from two sources — the seeded list and live guardian requests —
// so "newest first" is not something the array order can be trusted to give. Parsed back into
// minutes, it is. Anything unrecognised sorts last rather than jumping the queue.
const UNITS = { m: 1, h: 60, d: 1440 };
const agoMinutes = (t) => {
  if (!t) return Infinity;
  if (/^now$/i.test(t)) return 0;
  const m = /^(\d+)\s*([mhd])$/i.exec(t);
  if (m) return Number(m[1]) * UNITS[m[2].toLowerCase()];
  if (/yester/i.test(t)) return 1440;
  return Infinity;
};

// `kind` maps to an icon + tone tile. The tile is the only thing carrying severity — no child
// avatar rides along on it. A parent scanning this feed is asking "how bad, and who", in that
// order, and a mascot answers neither: it is the child app's language for a buddy, not a
// legible identity badge at 20px, and stacked on the tone tile it blunted the one signal that
// had to survive a glance. The child is named in the row instead, in words.
const KIND = {
  warning:    { icon: 'triangle-alert', bg: THEME.warningLight,  fg: THEME.warning },
  ignored:    { icon: 'octagon-alert',  bg: THEME.dangerLight,   fg: THEME.danger },
  impact:     { icon: 'triangle-alert', bg: THEME.dangerLight,   fg: THEME.danger },
  safe:       { icon: 'shield-check',   bg: THEME.successLight,  fg: THEME.success },
  streak:     { icon: 'flame',          bg: THEME.goldLight,     fg: THEME.gold },
  device_off: { icon: 'wifi-off',       bg: THEME.surface2,      fg: THEME.fg2 },
  device_on:  { icon: 'wifi',           bg: THEME.surface2,      fg: THEME.fg2 },
  limited:    { icon: 'shield-alert',   bg: THEME.warningLight,  fg: THEME.warning },
  join_request: { icon: 'user-plus',    bg: BRAND.primaryLight,  fg: BRAND.primaryDark },
};

// One row. `top` draws the hairline separating it from the row above — the first row in a card
// doesn't take one. Unread is carried by the brand wash and the dot on the right, never by
// weight — the same language the child app's own feed uses, so a parent switching between the
// two apps reads "new" the same way in both.
function AlertRow({ a, ctx, read, top }) {
  const k = KIND[a.kind] || KIND.safe;
  const child = CHILDREN.find(c => c.id === a.child);
  const unread = alertUnread(a);
  const urgent = URGENT.has(a.kind);
  const open = () => {
    read(a.id);
    if (a.kind === 'impact') return ctx.nav('p_alert', { alertId: a.id });
    if (a.kind === 'join_request') return ctx.nav('p_group_detail', { groupId: a.groupId });
    if (child) ctx.nav('p_settings', { child });
  };
  return (
    <div onClick={open}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderTop: top ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer',
        background: urgent ? THEME.dangerLight : unread ? BRAND.primaryLight + '88' : '#fff',
        // an inset rule rather than a real border, so the row keeps its width and the stack
        // stays aligned — only the urgent one grows an edge
        boxShadow: urgent ? `inset 3px 0 0 ${THEME.danger}` : 'none' }}>
      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 12, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={k.icon} size={19} color={k.fg} stroke={2.3} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* what happened, then who it happened to. The child's name used to open the line
            below, where it competed with the message for the same truncated space; up here it
            is a label on the headline and the message gets the whole width back. */}
        <div style={{ fontSize: 14, lineHeight: 1.3, wordBreak: 'keep-all' }}>
          <span style={{ fontWeight: 800, color: urgent ? THEME.danger : THEME.fg1 }}>{L(a.title)}</span>
          {/* inline rather than a flex row: a long title ("Safe morning commute") would push a
              flex sibling onto a line of its own, leaving the name stranded there. As inline
              text it just wraps where it runs out of room, like the sentence it is. The space
              before the name is the break opportunity; the name itself is nowrap, so the wrap
              lands in front of the separator rather than leaving a "·" dangling at line end. */}
          {child && <>{' '}<span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg3, whiteSpace: 'nowrap' }}>· {child.name}</span></>}
        </div>
        {/* two lines, then clip. The old single nowrap line cut "please check right away" off
            the one alert on this screen where those words are the entire point. `keep-all` is
            the app's convention for Korean copy — without it the wrap lands mid-word
            ("확인해 주 / 세요"), because CJK breaks anywhere by default. */}
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4, wordBreak: 'keep-all', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{L(a.sub)}</div>
        {/* Both parents' phones buzz for the same event. Without this they both ring the
            child about one warning — so the second one to look sees that it is handled. */}
        {a.ack && a.ack !== guardianMe().name && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, padding: '3px 8px', borderRadius: 999, background: THEME.successLight, color: THEME.success, fontSize: 11, fontWeight: 800 }}>
            <Icon name="check" size={11} color={THEME.success} stroke={3} />
            {a.ack} {L('already checked this')}
          </div>
        )}
        {/* The call is a real `tel:` link, the same one the detail screen offers — so the row
            that says "check right away" can be acted on where it is read, instead of costing a
            tap-through first. It disappears once a guardian has said they checked. */}
        {urgent && !a.ack && child && (
          <a href={`tel:${child.phone}`} onClick={e => { e.stopPropagation(); read(a.id); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, padding: '8px 14px', borderRadius: 12, background: THEME.danger, color: '#fff', fontSize: 12.5, fontWeight: 800, textDecoration: 'none', WebkitTapHighlightColor: 'transparent' }}>
            <Icon name="phone" size={13} color="#fff" stroke={2.6} />{L('Make a call')}
          </a>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, paddingTop: 1 }}>
        <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{L(a.time)}</span>
        {unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: urgent ? THEME.danger : BRAND.primary }} />}
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
  const ko = getLang() === 'ko';
  const [, bump] = React.useReducer(n => n + 1, 0);
  // Read state lives in core/data.jsx, not in this component: a row marked read here has to
  // still be read after a trip to Reports and back, and the tab badge has to be counting the
  // same rows this screen is showing. `bump` just re-renders after the shared write.
  const read = (id) => { markAlertRead(id); ctx.bumpAlerts && ctx.bumpAlerts(); bump(); };
  const allRead = () => { markAllAlertsRead(); ctx.bumpAlerts && ctx.bumpAlerts(); bump(); };

  // Join requests are computed live off the group data, not hand-seeded like the seeded rows —
  // a request accepted or rejected elsewhere shouldn't keep haunting this feed.
  const items = parentAlertFeed().map(a => a.kind !== 'join_request' ? a : {
    ...a,
    title: ko ? '보호자 요청' : 'Guardian request',
    sub: ko ? `${a.guardianName}님이 ${a.groupName} 그룹에 참여를 요청했어요` : `${a.guardianName} wants to join ${a.groupName}`,
    today: !/yesterday/i.test(a.time),
  });
  const [tab, setTab] = React.useState('safety');
  const unread = items.filter(alertUnread).length;

  // Today / Earlier still splits the list — but within the chosen side, so time orders what
  // is on screen rather than deciding what is. Sorted, because the feed is two sources
  // concatenated: unsorted, a two-hour-old guardian request landed under a three-hour-old
  // warning and quietly broke the one promise a newest-first feed makes.
  const shown = items.filter(i => familyOf(i) === tab).sort((a, b) => agoMinutes(a.time) - agoMinutes(b.time));
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
            const rows = items.filter(i => familyOf(i) === f.id);
            const n = rows.filter(alertUnread).length;
            // Safety's count turns red when one of the waiting rows is the urgent kind, so the
            // difference between "five things to read" and "your child may have fallen" is
            // legible before the tab is even crossed to.
            const hot = rows.some(i => URGENT.has(i.kind) && alertUnread(i));
            const on = tab === f.id;
            return (
              <button key={f.id} onClick={() => setTab(f.id)} aria-pressed={on}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 16px', fontSize: 13, fontWeight: 800, background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', color: on ? THEME.fg1 : THEME.fg2, transition: 'background .16s ease, color .16s ease', WebkitTapHighlightColor: 'transparent' }}>
                {L(f.label)}
                {n > 0 && (
                  <span style={{ minWidth: 18, height: 18, borderRadius: 999, padding: '0 6px', background: hot ? THEME.danger : on ? BRAND.primary : BRAND.primaryLight, color: hot || on ? '#fff' : BRAND.primaryDark, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</span>
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
