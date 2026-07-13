// JoanX — parent app · shared

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

// Brand palette derived from the JoanX buddy green (#4B814F) — the same brand the child
// app wears, so the two apps read as one product.
const BRAND = {
  primary:     '#4B814F',            // core brand green
  primaryDark: '#365C39',            // pressed / deep accent
  primaryLight:'#E9F1E9',            // soft tint — badges, chips, backgrounds
  onPrimary:   '#FFFFFF',            // text/icons on the green
  shadowPrimary: 'none',             // flat CTAs/accents — no brand glow (matches the child app)
  ink:         '#3D3D3D',            // softened logo black — active/focus states (inputs, radios, cards)
};

// Flat brand CTA — boxShadow:'none' also overrides the Button primitive's default glow.
const brandBtn = { background: BRAND.primary, boxShadow: 'none' };

function ParentHead({ title, sub, right, onBack }) {
  return (
    <div style={{ padding: '8px 18px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, minWidth: 0 }}>
        {onBack && (
          <button onClick={onBack} aria-label={L('Back')} style={{ width: 34, height: 34, marginTop: 2, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        )}
        <div style={{ minWidth: 0 }}>
          {sub && <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{sub}</div>}
          <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.fg1, margin: 0, letterSpacing: '-0.3px' }}>{title}</h1>
        </div>
      </div>
      {right && <div style={{ flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// ── Settings / rules ─────────────────────────────────────────────────
// per-tag badge colors for the time-rule schedules (system badge tokens)
const RULE_TAG_COLORS = {
  Strict:   { c: 'var(--color-interactives-badge-rust-label)',      bg: 'var(--color-interactives-badge-rust-default)' },
  Balanced: { c: 'var(--color-interactives-badge-ember-label)',     bg: 'var(--color-interactives-badge-ember-default)' },
  Relaxed:  { c: 'var(--color-interactives-badge-evergreen-label)', bg: 'var(--color-interactives-badge-evergreen-default)' },
};

// ── Add a child / pair a device ──────────────────────────────────────
// A "choose one" selector — mobile-native chip buttons instead of a native
// <select>. `opts` are [value, label] pairs; labels run through L(). Chips wrap
// and the picked one fills with the brand ocean, matching the form's Inputs.
// Korean-style horizontal radio group: a labelled row of circle-radio + text options.
function ChoiceGroup({ label, value, setter, opts, accent = BRAND.ink }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 22px', alignItems: 'center' }}>
        {opts.map(([v, lbl]) => {
          const on = value === v;
          return (
            <button key={v} type="button" onClick={() => setter(v)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '4px 2px',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${on ? accent : THEME.border}`, background: '#fff', transition: 'border-color .15s ease' }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: on ? 700 : 600, color: on ? THEME.fg1 : THEME.fg2, transition: 'color .15s ease' }}>{L(lbl)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { BRAND, brandBtn, ParentHead, ChoiceGroup, RULE_TAG_COLORS };
