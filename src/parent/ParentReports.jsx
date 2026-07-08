// JoanX — parent app · ParentReports

import React from 'react';
import { CHILDREN, PARENT_METRICS, PLAYER, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

function ChildChip({ active }) {
  const k = CHILDREN[0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 12px 6px 6px', borderRadius: 999, boxShadow: THEME.shadowCard }}>
      <MascotChip species={k.avatar} color={k.color} size={32} bg={BRAND.primaryLight} />
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{k.name}</span>
      <Icon name="chevron-down" size={15} color={THEME.fg2} stroke={2.4} />
    </div>
  );
}

// Standard gridded bar chart — y-axis ticks + dashed gridlines + bars, optional line overlay.
function StdBarChart({ data, series, line, yMax, yStep, height = 168, barW = 9 }) {
  const ticks = [];
  for (let v = 0; v <= yMax; v += yStep) ticks.push(v);
  const topPad = 10;                 // headroom above the top gridline
  const plot = height - topPad;
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* y-axis labels */}
      <div style={{ position: 'relative', width: 16, height, flexShrink: 0 }}>
        {ticks.map(t => (
          <span key={t} style={{ position: 'absolute', right: 0, bottom: `${(t / yMax) * plot - 6}px`, fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', height }}>
          {ticks.map((t, i) => (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(t / yMax) * plot}px`, borderTop: i === 0 ? `1.5px solid ${THEME.border}` : `1px dashed ${THEME.border}` }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
            {data.map((d, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
                {series.map(s => {
                  const fill = typeof s.color === 'function' ? s.color(d, i, data) : s.color;
                  return <div key={s.key} style={{ width: barW, height: `${(d[s.key] / yMax) * plot}px`, background: fill, borderRadius: '4px 4px 0 0' }} />;
                })}
              </div>
            ))}
          </div>
          {/* line overlay (stretched horizontally, uniform stroke) */}
          {line && (
            <svg viewBox={`0 0 ${data.length} ${plot}`} preserveAspectRatio="none" width="100%" height={plot} style={{ position: 'absolute', left: 0, bottom: 0, overflow: 'visible' }}>
              <polyline points={data.map((d, i) => `${i + 0.5},${plot - (d[line.key] / yMax) * plot}`).join(' ')} fill="none" stroke={line.color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          )}
          {line && data.map((d, i) => (
            <div key={'dot' + i} style={{ position: 'absolute', left: `${((i + 0.5) / data.length) * 100}%`, bottom: `${(d[line.key] / yMax) * plot}px`, transform: 'translate(-50%, 50%)', width: 7, height: 7, borderRadius: 999, background: line.color, border: '1.5px solid #fff' }} />
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 7 }}>
          {data.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const Legend = ({ items }) => (
  <div style={{ display: 'flex', gap: 18, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
    {items.map(([l, c]) => (
      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
        <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L(l)}</span>
      </div>
    ))}
  </div>
);

// ── Reports dashboard — clean analytics layout (numbers + gridded charts) ──
function ParentReports({ ctx }) {
  const m = PARENT_METRICS;
  // data-viz palette (tuned for charts / color-blindness at 40–60)
  const SERIES = { good: 'var(--color-data-green-50)', mid: 'var(--color-data-yellow-40)', bad: 'var(--color-data-red-50)', trend: 'var(--color-data-blue-40)', rate: 'var(--color-data-yellow-40)' };
  // calmer palette for the response-mix chart — teal hero, muted accents
  const RESP = { immediate: '#4f9d89', delayed: '#ecc879', ignored: '#e2a395' };
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const riskTotal = RISK_TREND.reduce((a, b) => a + b, 0);
  const stopsTotal = REACTIONS_7D.reduce((a, d) => a + d.immediate, 0);
  const actData = REACTIONS_7D.map((d, i) => ({ label: dayLabels[i], risk: RISK_TREND[i], stops: d.immediate }));

  // top KPI cards (horizontally scrollable)
  const kpis = [
    { icon: 'check-circle-2', v: m.acceptance + '%', delta: '+6%', l: 'Warning acceptance' },
    { icon: 'footprints', v: m.safeWalkMin + 'm', delta: '+12%', l: 'Safe walking' },
    { icon: 'timer', v: m.avgResponse + 's', delta: '-0.3s', l: 'Avg. response' },
    { icon: 'flame', v: PLAYER.streak + 'd', delta: '+2', l: 'Safe streak' },
  ];
  // inline stat-dots inside the activity card
  const inline = [
    { v: riskTotal, l: 'Risky moments', c: '#bdd2ee' },
    { v: stopsTotal, l: 'Safe stops', c: SERIES.trend },
    { v: m.acceptance + '%', l: 'Acceptance', c: SERIES.rate },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L("This week's progress")} title={L('Mina is improving')} right={<ChildChip />} />
      <div style={{ padding: '8px 20px 0' }}>

        {/* KPI cards — scroll horizontally */}
        <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 20px 6px', margin: '0 -20px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ minWidth: 142, flexShrink: 0, background: '#fff', borderRadius: 18, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon name={k.icon} size={17} color={THEME.fg3} stroke={2} /></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.v}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 700, color: THEME.success }}>{k.delta}<Icon name="trending-up" size={11} color={THEME.success} stroke={2.6} /></span>
              </div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 5 }}>{L(k.l)}</div>
            </div>
          ))}
        </div>

        {/* AI report entry (F-31) */}
        <button onClick={() => ctx.nav('p_aireport')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="sparkles" size={20} color="#fff" stroke={2.3} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>{L('Read the AI Safety Report')}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{L('A plain-language summary of Mina’s week')}</div>
          </div>
          <Icon name="chevron-right" size={20} color="#fff" stroke={2.4} />
        </button>

        {/* response mix card */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{L('How Mina responds to warnings')}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 3 }}>{L('Most warnings end in an immediate stop — exactly what we want.')}</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 94, borderBottom: `1.5px solid ${THEME.border}`, marginTop: 18 }}>
            {REACTIONS_7D.map((d, i) => {
              const tot = d.immediate + d.delayed + d.ignored;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: 17, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                    {d.ignored > 0 && <div style={{ height: `${(d.ignored / tot) * 100}%`, background: RESP.ignored, borderRadius: 4 }} />}
                    {d.delayed > 0 && <div style={{ height: `${(d.delayed / tot) * 100}%`, background: RESP.delayed, borderRadius: 4 }} />}
                    <div style={{ height: `${(d.immediate / tot) * 100}%`, background: RESP.immediate, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {REACTIONS_7D.map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{d.day[0]}</span>
            ))}
          </div>
          <Legend items={[['Immediate', RESP.immediate], ['Delayed', RESP.delayed], ['Ignored', RESP.ignored]]} />
        </div>

        {/* activity card — inline stats + bars-and-line chart + CTA */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L('Weekly activity')}</span>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
          </div>
          <div style={{ display: 'flex', gap: 22, marginBottom: 18 }}>
            {inline.map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.v}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: s.c }} />
                  <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L(s.l)}</span>
                </div>
              </div>
            ))}
          </div>
          <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={10} yStep={2} barW={14} />
          <button onClick={() => ctx.nav('p_children')} style={{ width: '100%', marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, background: THEME.surface2, border: 'none', borderRadius: 14, padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="sparkles" size={17} color={BRAND.primary} stroke={2.3} />
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1 }}>{L('Build safer habits with Mina')}</span>
          </button>
        </div>

        {/* insight */}
        <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16, marginTop: 14 }}>
          <Icon name="lightbulb" size={20} color={THEME.success} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#274427' }}>{L('What this means')}</div>
            <div style={{ fontSize: 12.5, color: '#274427', lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Mina is reacting faster and ignoring fewer warnings than two weeks ago. The habit is forming — keep it up.')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ParentReports };
