// JoanX — parent app · ParentAIReport

import React from 'react';
import { PARENT_METRICS, RISK_TREND } from '../core/data.jsx';
import { Badge, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── AI parent report (F-31) — natural-language read of the week ──────
function ParentAIReport({ ctx }) {
  const m = PARENT_METRICS;
  const first = RISK_TREND[0], last = RISK_TREND[RISK_TREND.length - 1];
  const summary = L('This week Mina is clearly building a safer walking habit. Daily risky phone-use moments fell from {a} to {b} — about {c}% fewer than her first week. She now stops for {d}% of warnings, and her average reaction time is down to {e} seconds. Mornings are her strongest window; most remaining risks show up on the after-school walk.')
    .replace('{a}', first).replace('{b}', last).replace('{c}', m.riskReduction).replace('{d}', m.acceptance).replace('{e}', m.avgResponse);

  const improving = [
    { icon: 'timer', t: 'Faster reactions', s: `${L('Now')} ${m.avgResponse}s ${L('on average — down 0.3s from last week.')}` },
    { icon: 'trending-down', t: 'Fewer risky moments', s: `${first} → ${last} ${L('per day across the week.')}` },
    { icon: 'footprints', t: 'More safe walking', s: `${m.safeWalkMin} ${L('safe minutes this week (+12%).')}` },
  ];
  const actions = [
    { icon: 'sun', t: 'Keep the morning routine', s: L('Her morning commute is nearly risk-free — whatever you’re doing, it’s working.') },
    { icon: 'map-pin', t: 'Talk about the after-school walk', s: L('Most warnings happen near Oak St. around 3pm. A gentle check-in can help.') },
    { icon: 'flame', t: 'Celebrate the streak', s: L('Mina is on a 5-day safe streak. Naming it out loud reinforces the habit.') },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L('This week · Mina')} title={L('AI Safety Report')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* AI summary */}
        <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(160deg,#eef3fe,#fff 82%)', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={17} color="#fff" stroke={2.3} /></div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L('In a nutshell')}</span>
            <Badge variant="primary" style={{ marginLeft: 'auto' }}>{L('AI')}</Badge>
          </div>
          <div style={{ fontSize: 13.5, color: THEME.fg1, lineHeight: 1.55 }}>{summary}</div>
        </div>

        {/* headline metric */}
        <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <Icon name="trending-up" size={22} color={THEME.success} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#274427', lineHeight: 1 }}>{m.riskReduction}% {L('safer')}</div>
            <div style={{ fontSize: 12.5, color: '#274427', opacity: .9, marginTop: 4, lineHeight: 1.4 }}>{L('Fewer risky walking-while-using moments than her first week on JoanX.')}</div>
          </div>
        </div>

        {/* what's improving */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L("What's improving")}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {improving.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={THEME.success} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{L(it.t)}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        {/* recommended actions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Try this at home')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 16, overflow: 'hidden' }}>
          {actions.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={BRAND.primary} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{L(it.t)}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1, lineHeight: 1.4 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}>
          <Icon name="sparkles" size={12} color={THEME.fg3} stroke={2.2} />
          {L('AI-generated from this week’s activity. It summarizes behavior trends — it never shares raw locations or messages.')}
        </div>
      </div>
    </div>
  );
}

export { ParentAIReport };
