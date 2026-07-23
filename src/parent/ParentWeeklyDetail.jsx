// JoanX — parent app · ParentWeeklyDetail
//
// Detail view for the Reports "Weekly activity" card. Opens from that card's
// chevron with { childId }. Reads the same per-child series the card charts
// (CHILD_REPORTS[id].risk + .reactions), so the two can never disagree — here
// it's expanded into the full bars-and-line week (reusing the card's own
// StdBarChart), a per-day table, and a grounded insight (safest / riskiest day),
// all computed from that data. Same header, background, cards and eyebrow
// labels as the response detail, so it reads as one system, not a bolt-on.

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';
import { StdBarChart } from './ParentReports.jsx';

// Same chart hues the card uses — light blue for risky-moment bars, blue trend
// line for safe stops — so the two views share one palette.
const RISK_C = '#bdd2ee';
const STOP_C = 'var(--color-data-blue-40)';

function ParentWeeklyDetail({ ctx }) {
  const ko = getLang() === 'ko';
  const child = CHILDREN.find(c => c.id === ctx.params?.childId) || CHILDREN[0];
  const rep = CHILD_REPORTS[child.id] || {
    acceptance: PARENT_METRICS.acceptance, reactions: REACTIONS_7D, risk: RISK_TREND,
  };
  const risk = rep.risk || RISK_TREND;
  const reactions = rep.reactions || REACTIONS_7D;
  const nm = child.name;

  const dayShort = i => (ko ? ['월', '화', '수', '목', '금', '토', '일'][i] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]);
  const dayFull  = i => (ko ? ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'][i]
                            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]);

  // Week totals + the same behaviour-change framing the card leads with (F-20):
  // risky moments reported as a reduction rate (start-of-week baseline vs latest
  // days), not a raw count. A down-arrow % is the win.
  const stopsByDay = reactions.map(d => d.immediate);
  const stopsTotal = stopsByDay.reduce((a, b) => a + b, 0);
  const riskTotal = risk.reduce((a, b) => a + b, 0);
  const base3 = risk.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const recent3 = risk.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const riskReduction = base3 > 0 ? Math.round(((base3 - recent3) / base3) * 100) : 0;
  const improving = riskReduction >= 0;

  const bestDayIdx = stopsByDay.indexOf(Math.max(...stopsByDay));
  const riskiestIdx = risk.indexOf(Math.max(...risk));

  // chart series — mirrors the card exactly (light-blue risky bars + blue safe-stop line)
  const actData = risk.map((r, i) => ({ label: dayShort(i), risk: r, stops: stopsByDay[i] }));
  const riskMax = Math.max(10, ...risk);
  const yMax = Math.ceil(riskMax / 2) * 2;

  // per-day table rows — the raw week behind the chart, for a parent who wants the numbers
  const rows = risk.map((r, i) => ({ i, risk: r, stops: stopsByDay[i] }));

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={ko ? `이번 주 · ${nm}` : `This week · ${nm}`} title={L('Weekly activity')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* headline — the week's risky-moment reduction, tone tinted by direction */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: improving ? THEME.successLight : THEME.goldLight, borderRadius: 20, padding: '18px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', flexShrink: 0, color: improving ? '#274427' : '#5b4a1e' }}>
            <span style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}>{improving ? '↓' : '↑'}</span>
            <span className="game-font" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1 }}>{Math.abs(riskReduction)}%</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: improving ? '#274427' : '#5b4a1e', lineHeight: 1.3 }}>
              {improving ? (ko ? '위험한 순간이 줄었어요' : 'Fewer risky moments this week') : (ko ? '위험한 순간이 늘었어요' : 'Risky moments crept up')}
            </div>
            <div style={{ fontSize: 12.5, color: improving ? '#274427' : '#5b4a1e', opacity: .88, marginTop: 4, lineHeight: 1.45 }}>
              {improving
                ? (ko ? `주 초 대비 위험한 순간이 줄고, ${nm}는 ${stopsTotal}번 안전하게 멈췄어요.` : `Down vs. the start of the week — ${nm} stopped safely ${stopsTotal} times.`)
                : (ko ? `주 초보다 조금 늘었어요. 아래에서 어떤 날인지 확인해 보세요.` : `A little higher than the week's start — see which days below.`)}
            </div>
          </div>
        </div>

        {/* the week — the same bars-and-line chart as the card, tap a day to read it */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('This week')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '16px 14px 14px', marginBottom: 18 }}>
          <StdBarChart data={actData} series={[{ key: 'risk', color: RISK_C }]} line={{ key: 'stops', color: STOP_C }} yMax={yMax} yStep={2} barW={16} height={180}
            tooltip={(d, i) => ({ title: dayFull(i), rows: [{ label: L('Risky moments'), value: d.risk, color: RISK_C }, { label: L('Safe stops'), value: d.stops, color: STOP_C }] })} />
        </div>

        {/* headline totals — the week rolled up, one number each */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{ko ? '이번 주 합계' : "This week's totals"}</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          {[
            { v: riskTotal, l: L('Risky moments'), c: RISK_C },
            { v: stopsTotal, l: L('Safe stops'), c: STOP_C },
            { v: rep.acceptance + '%', l: L('Acceptance'), c: 'var(--color-data-yellow-40)' },
          ].map(s => (
            <div key={s.l} style={{ flex: 1, background: '#fff', borderRadius: 16, boxShadow: THEME.shadowCard, padding: '14px 12px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: THEME.fg1 }}>{s.v}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: s.c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>{s.l}</span>
              </div>
            </div>
          ))}
        </div>

        {/* per-day — the raw week behind the chart, for a parent who wants the numbers */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{ko ? '요일별' : 'Day by day'}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderBottom: `1px solid ${THEME.border}` }}>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: THEME.fg3 }}>{ko ? '요일' : 'Day'}</span>
            <span style={{ width: 74, textAlign: 'right', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, fontSize: 11, fontWeight: 700, color: THEME.fg3 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: RISK_C }} />{L('Risky moments')}</span>
            <span style={{ width: 74, textAlign: 'right', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, fontSize: 11, fontWeight: 700, color: THEME.fg3 }}><span style={{ width: 7, height: 7, borderRadius: 999, background: STOP_C }} />{L('Safe stops')}</span>
          </div>
          {rows.map((r, i) => (
            <div key={r.i} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderTop: i ? `1px solid ${THEME.border}` : 'none',
              background: r.i === riskiestIdx ? '#fbf6ef' : 'transparent' }}>
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{dayFull(r.i)}</span>
              <span style={{ width: 74, textAlign: 'right', fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{r.risk}</span>
              <span style={{ width: 74, textAlign: 'right', fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{r.stops}</span>
            </div>
          ))}
        </div>

        {/* grounded insight — pulled straight from the week, not generic advice */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{ko ? '이번 주 눈여겨볼 점' : 'Worth noticing'}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="shield-check" size={17} color={THEME.success} stroke={2.3} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ko ? `가장 안전했던 날 · ${dayFull(bestDayIdx)}` : `Safest day · ${dayFull(bestDayIdx)}`}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{ko ? `안전하게 ${stopsByDay[bestDayIdx]}번 멈췄어요.` : `Stopped safely ${stopsByDay[bestDayIdx]} times.`}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderTop: `1px solid ${THEME.border}` }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: '#fbf1e6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="alert-triangle" size={17} color={THEME.warning} stroke={2.3} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ko ? `주의가 많던 날 · ${dayFull(riskiestIdx)}` : `Most alerts · ${dayFull(riskiestIdx)}`}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{ko ? `위험한 순간이 ${risk[riskiestIdx]}번 있었어요. 그날 이야기를 나눠 보세요.` : `${risk[riskiestIdx]} risky moments — a good day to check in about.`}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ParentWeeklyDetail };
