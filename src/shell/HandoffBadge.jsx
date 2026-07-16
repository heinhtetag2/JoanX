import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';

// JoanX — dev handoff badge.
// A dev-only corner pill that tells whoever opens a screen whether it's
// finished, still needs work, or isn't built yet. Uses the SAME status
// vocabulary as the Spec checklist (SpecChecklist.jsx) so the design → dev
// handoff speaks one language.
//
// Show it by adding ?dev to the URL, or toggling "Handoff status" in Tweaks.
// To mark a screen: add / edit its row in HANDOFF below. That's the only
// thing you maintain — the badge reads straight from it.

/* ── status vocabulary (mirrors SpecChecklist.jsx) ─────────────────── */
const STATUS = {
  done:    { label: 'Done',      fg: '#2f7a4f', bg: '#e9f6ee', dot: '#37955f', icon: 'check-circle-2' },
  partial: { label: 'Kinda',     fg: '#9a6a08', bg: '#fdf3dd', dot: '#c99215', icon: 'wrench' },
  missing: { label: 'Not built', fg: '#b04343', bg: '#fdecec', dot: '#cf5b5b', icon: 'circle-dashed' },
  unset:   { label: 'Unmarked',  fg: '#77736e', bg: '#f1f0ef', dot: '#a7a29c', icon: 'help-circle' },
};

/* ── the handoff status of every screen ────────────────────────────────
   status: 'done' · finished, matches the design — ship it
           'partial' · screen exists but something still needs work (say what in note)
           'missing' · no screen yet / placeholder
   Screens not listed here show "Unmarked" so it's obvious they still need a call.
   Keys match the router keys in App.jsx (child: `screen`, parent: `pScreen`). */
const HANDOFF = {
  // ── child app ──
  home:        { status: 'done', note: 'Final. Hero + XP ring, protection card, points/streak, and today’s missions all done.' },
  onboarding:  { status: 'done', note: 'Confirmed. Splash → intro slides → connect-to-parent → permissions all done.' },
  // child profile & its detail screens
  profile:     { status: 'done', note: 'Confirmed. Profile hub: language + sound, linked parents, and Account rows (Notices / Help & support / About).' },
  help:        { status: 'done', note: 'Confirmed. Help & support — inline FAQ accordion (help-circle icons), contact link.' },
  notices:     { status: 'done', note: 'Confirmed. Notices — list + in-place detail, reads the shared NOTICES source.' },
  about:       { status: 'done', note: 'Confirmed. About — wordmark + version + tagline, Legal rows open detail pages.' },
  legal:       { status: 'done', note: 'Confirmed. Legal document detail (terms / privacy / licenses).' },

  // ── parent app ──
  parent_onboarding: { status: 'done', note: 'Confirmed. Intro → sign-up/log-in, guardian consent gate, and profile step all done.' },
  // parent profile hub + every account/settings detail page (p_detail)
  p_account:   { status: 'done', note: 'Confirmed. Profile hub: centered title, language up top, family, notifications, privacy, support, sign-out modal.' },
  p_detail:    { status: 'done', note: 'Confirmed. All account/settings detail pages: editable name & SMS-verified phone, read-only Google-linked email, change password, delete-account modal, Notices, Help (inline FAQ), 1:1 Inquiry, About + Legal, Data & privacy, Export.' },
  // e.g. p_reports: { status: 'partial', note: 'Charts done; weekly-activity data still mocked — wire real API.' },
};

function entryFor(key) {
  return HANDOFF[key] || { status: 'unset', note: 'No handoff status set for this screen yet.' };
}

// A small, refined status card meant to sit beside the phone (not inside the
// mockup). Header names the screen; a status pill + note give its handoff state.
function HandoffBadge({ screenKey }) {
  const { status, note } = entryFor(screenKey);
  const s = STATUS[status] || STATUS.unset;

  return (
    <div style={{ width: 196, background: '#fff', borderRadius: 16, border: '1px solid #ececea', boxShadow: '0 4px 14px rgba(46,43,41,.05)', overflow: 'hidden', fontFamily: 'inherit' }}>
      <div style={{ padding: '12px 13px 13px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '.09em', color: '#b5b0aa' }}>HANDOFF</span>
          <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace, SFMono-Regular, monospace', color: '#a7a29c' }}>{screenKey}</span>
        </div>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px 5px 8px', borderRadius: 999, background: s.bg, color: s.fg, fontWeight: 800, fontSize: 13 }}>
          <Icon name={s.icon} size={14} color={s.fg} stroke={2.6} />
          {s.label}
        </span>

        <div style={{ marginTop: 9, fontSize: 11.5, lineHeight: 1.5, color: '#78716c' }}>{note}</div>
      </div>
    </div>
  );
}

export { HandoffBadge, HANDOFF, STATUS };
