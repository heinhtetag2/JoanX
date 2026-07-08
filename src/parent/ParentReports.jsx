// JoanX — parent app · ParentReports

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// Child selector — tapping the chip opens a dropdown to switch which child's
// weekly report is in view. Self-contained: keeps its own selection + open state.
function ChildChip({ selected, onPick }) {
  const [open, setOpen] = React.useState(false);
  const idx = Math.min(selected, CHILDREN.length - 1);
  const k = CHILDREN[idx];
  if (!k) return null;
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 12px 6px 6px', borderRadius: 999, boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <MascotChip species={k.avatar} color={k.color} size={32} bg={BRAND.primaryLight} />
        <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{k.name}</span>
        <Icon name="chevron-down" size={15} color={THEME.fg2} stroke={2.4} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .18s ease' }} />
      </button>
      {open && (
        <React.Fragment>
          {/* tap-away layer, scoped to the phone screen */}
          <div onClick={() => setOpen(false)} style={{ position: 'absolute', top: -1200, left: -1200, right: -1200, bottom: -1200, zIndex: 49 }} />
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: 214, background: '#fff', borderRadius: 16, boxShadow: '0 14px 36px rgba(46,43,41,.18)', padding: 6, zIndex: 50 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .4, padding: '6px 10px 6px' }}>{L('Switch child')}</div>
            {CHILDREN.map((c, i) => {
              const on = i === idx;
              return (
                <button key={c.id} onClick={() => { onPick(i); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: on ? BRAND.primaryLight : 'transparent', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <MascotChip species={c.avatar} color={c.color} size={30} bg={on ? '#fff' : THEME.surface2} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: THEME.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L('Age')} {c.age} · {c.device}</div>
                  </div>
                  {on && <Icon name="check" size={16} color={BRAND.primary} stroke={2.6} />}
                </button>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

// Selected-day readout strip (mobile pattern: tap a bar, its values show here).
// Day name on the left, colored value chips on the right. Always shows something,
// so there's no empty/hover state — one bar is always selected.
function ChartReadout({ title, rows }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12, minHeight: 22 }}>
      <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{title}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {rows.map(r => (
          <span key={r.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: r.color }} />
            <span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{r.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Standard gridded bar chart — y-axis ticks + dashed gridlines + bars, optional
// line overlay. Tap a column to select it (mobile-native: no hover). The selected
// day's values surface in the readout strip above; the selected column highlights.
function StdBarChart({ data, series, line, yMax, yStep, height = 168, barW = 9, tooltip }) {
  const [active, setActive] = React.useState(() => data.length - 1);   // default: latest day
  const idx = Math.min(active, data.length - 1);
  const ticks = [];
  for (let v = 0; v <= yMax; v += yStep) ticks.push(v);
  const topPad = 10;                 // headroom above the top gridline
  const plot = height - topPad;
  const read = tooltip ? tooltip(data[idx], idx) : null;
  return (
    <div>
      {read && <ChartReadout title={read.title} rows={read.rows} />}
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
              {data.map((d, i) => {
                const on = idx === i;
                return (
                  <div key={i}
                    onClick={() => setActive(i)}
                    style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(46,43,41,.06)' : 'transparent', transition: 'background .15s', WebkitTapHighlightColor: 'transparent' }}>
                    {series.map(s => {
                      const fill = typeof s.color === 'function' ? s.color(d, i, data) : s.color;
                      return <div key={s.key} style={{ width: barW, height: `${(d[s.key] / yMax) * plot}px`, background: fill, borderRadius: '4px 4px 0 0' }} />;
                    })}
                  </div>
                );
              })}
            </div>
            {/* line overlay (stretched horizontally, uniform stroke) */}
            {line && (
              <svg viewBox={`0 0 ${data.length} ${plot}`} preserveAspectRatio="none" width="100%" height={plot} style={{ position: 'absolute', left: 0, bottom: 0, overflow: 'visible', pointerEvents: 'none' }}>
                <polyline points={data.map((d, i) => `${i + 0.5},${plot - (d[line.key] / yMax) * plot}`).join(' ')} fill="none" stroke={line.color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            )}
            {line && data.map((d, i) => (
              <div key={'dot' + i} style={{ position: 'absolute', left: `${((i + 0.5) / data.length) * 100}%`, bottom: `${(d[line.key] / yMax) * plot}px`, transform: 'translate(-50%, 50%)', width: idx === i ? 11 : 7, height: idx === i ? 11 : 7, borderRadius: 999, background: line.color, border: `${idx === i ? 2 : 1.5}px solid #fff`, transition: 'all .15s', pointerEvents: 'none' }} />
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: 7 }}>
            {data.map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: idx === i ? THEME.fg1 : THEME.fg3, fontWeight: idx === i ? 800 : 600 }}>{d.label}</span>
            ))}
          </div>
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
  // which child's report is in view (header chip switches this)
  const [sel, setSel] = React.useState(0);
  const [respActive, setRespActive] = React.useState(6);   // selected day in the response-mix chart (default: latest)
  const child = CHILDREN[Math.min(sel, CHILDREN.length - 1)] || CHILDREN[0];
  // per-child report data, falling back to the global demo metrics
  const rep = CHILD_REPORTS[child.id] || {
    acceptance: PARENT_METRICS.acceptance, safeWalkMin: PARENT_METRICS.safeWalkMin,
    avgResponse: PARENT_METRICS.avgResponse, streak: child.streak || 0,
    deltas: { acceptance: '+6%', walk: '+12%', resp: '-0.3s', streak: '+2' },
    reactions: REACTIONS_7D, risk: RISK_TREND,
  };
  const reactions = rep.reactions, risk = rep.risk;

  // data-viz palette (tuned for charts / color-blindness at 40–60)
  const SERIES = { good: 'var(--color-data-green-50)', mid: 'var(--color-data-yellow-40)', bad: 'var(--color-data-red-50)', trend: 'var(--color-data-blue-40)', rate: 'var(--color-data-yellow-40)' };
  // calmer palette for the response-mix chart — teal hero, muted accents
  const RESP = { immediate: '#4f9d89', delayed: '#ecc879', ignored: '#e2a395' };
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const riskTotal = risk.reduce((a, b) => a + b, 0);
  const stopsTotal = reactions.reduce((a, d) => a + d.immediate, 0);
  const totalReacts = reactions.reduce((a, d) => a + d.immediate + d.delayed + d.ignored, 0) || 1;
  const immediateShare = stopsTotal / totalReacts;
  const actData = reactions.map((d, i) => ({ label: dayLabels[i], risk: risk[i], stops: d.immediate }));
  const riskMax = Math.max(10, ...risk);         // keep the y-axis above the worst day

  // is this child trending well? (drives copy + accent tone)
  const doingWell = rep.acceptance >= 75;
  const ko = ctx.lang === 'ko';
  const nm = child.name;
  const dayName = i => (ko ? ['월', '화', '수', '목', '금', '토', '일'][i] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]);
  const t = {
    aiSub: ko ? `${nm}의 한 주를 쉬운 말로 요약` : `A plain-language summary of ${nm}'s week`,
    respTitle: ko ? `${nm}가 경고에 반응하는 방식` : `How ${nm} responds to warnings`,
    respNote: doingWell
      ? (ko ? '대부분의 경고가 즉시 멈춤으로 이어져요 — 바라던 모습이에요.' : 'Most warnings end in an immediate stop — exactly what we want.')
      : (ko ? '이번 주엔 늦은 반응과 무시가 늘었어요 — 부드럽게 이야기 나눠보세요.' : 'More delayed and ignored responses this week — worth a gentle chat.'),
    buildHabits: ko ? `${nm}와 안전한 습관 만들기` : `Build safer habits with ${nm}`,
    insightTitle: ko ? '이게 무슨 의미냐면' : 'What this means',
    insightBody: doingWell
      ? (ko ? `${nm}가 2주 전보다 더 빨리 반응하고 경고를 덜 무시해요. 습관이 자리잡고 있어요 — 계속 이어가요.` : `${nm} is reacting faster and ignoring fewer warnings than two weeks ago. The habit is forming — keep it up.`)
      : (ko ? `${nm}는 아직 경고에 천천히 반응할 때가 있어요. 함께 규칙을 살펴보고 응원해 주세요.` : `${nm} is still slow to respond to some warnings. Review the rules together and cheer them on.`),
  };
  // insight card tone: calm green when doing well, soft amber when it needs a look
  const tone = doingWell
    ? { bg: THEME.successLight, ink: '#274427', icon: THEME.success, name: 'lightbulb' }
    : { bg: THEME.goldLight, ink: '#5b4a1e', icon: THEME.gold, name: 'alert-circle' };

  // top KPI cards (horizontally scrollable). A delta is "good" when it moves the
  // right way for its metric — for Avg. response, lower (a minus) is the win.
  const kpis = [
    { icon: 'check-circle-2', v: rep.acceptance + '%', delta: rep.deltas.acceptance, l: 'Warning acceptance' },
    { icon: 'footprints', v: rep.safeWalkMin + 'm', delta: rep.deltas.walk, l: 'Safe walking' },
    { icon: 'timer', v: rep.avgResponse + 's', delta: rep.deltas.resp, l: 'Avg. response' },
    { icon: 'flame', v: rep.streak + 'd', delta: rep.deltas.streak, l: 'Safe streak' },
  ].map(k => {
    const positive = String(k.delta).trim().startsWith('+');
    const good = k.l === 'Avg. response' ? !positive : positive;
    return { ...k, good };
  });
  // inline stat-dots inside the activity card
  const inline = [
    { v: riskTotal, l: 'Risky moments', c: '#bdd2ee' },
    { v: stopsTotal, l: 'Safe stops', c: SERIES.trend },
    { v: rep.acceptance + '%', l: 'Acceptance', c: SERIES.rate },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L("This week's progress")} title={L(doingWell ? 'Getting better' : 'Needs attention')} right={<ChildChip selected={sel} onPick={setSel} />} />
      <div style={{ padding: '8px 20px 0' }}>

        {/* KPI cards — 2×2 grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 0 6px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon name={k.icon} size={17} color={THEME.fg3} stroke={2} /></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.v}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 700, color: k.good ? THEME.success : THEME.danger }}>{k.delta}<Icon name={k.good ? 'trending-up' : 'trending-down'} size={11} color={k.good ? THEME.success : THEME.danger} stroke={2.6} /></span>
              </div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 5 }}>{L(k.l)}</div>
            </div>
          ))}
        </div>

        {/* response mix card */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{t.respTitle}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 3 }}>{t.respNote}</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <ChartReadout title={dayName(respActive)} rows={[
              { label: 'immediate', value: reactions[respActive].immediate, color: RESP.immediate },
              { label: 'delayed', value: reactions[respActive].delayed, color: RESP.delayed },
              { label: 'ignored', value: reactions[respActive].ignored, color: RESP.ignored },
            ]} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 94, borderBottom: `1.5px solid ${THEME.border}` }}>
            {reactions.map((d, i) => {
              const tot = d.immediate + d.delayed + d.ignored;
              const on = respActive === i;
              return (
                <div key={i}
                  onClick={() => setRespActive(i)}
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(46,43,41,.06)' : 'transparent', transition: 'background .15s', WebkitTapHighlightColor: 'transparent' }}>
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
            {reactions.map((d, i) => (
              <span key={i} onClick={() => setRespActive(i)} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: respActive === i ? THEME.fg1 : THEME.fg3, fontWeight: respActive === i ? 800 : 600, cursor: 'pointer' }}>{d.day[0]}</span>
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
          <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={Math.ceil(riskMax / 2) * 2} yStep={2} barW={14}
            tooltip={(d, i) => ({ title: dayName(i), rows: [{ label: L('Risky moments'), value: d.risk, color: '#bdd2ee' }, { label: L('Safe stops'), value: d.stops, color: SERIES.trend }] })} />
          <button onClick={() => ctx.nav('p_children')} style={{ width: '100%', marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, background: THEME.surface2, border: 'none', borderRadius: 14, padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="sparkles" size={17} color={BRAND.primary} stroke={2.3} />
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1 }}>{t.buildHabits}</span>
          </button>
        </div>

        {/* insight — tone adapts to whether this child is trending well */}
        <div style={{ display: 'flex', gap: 12, background: tone.bg, borderRadius: 18, padding: 16, marginTop: 14 }}>
          <Icon name={tone.name} size={20} color={tone.icon} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: tone.ink }}>{t.insightTitle}</div>
            <div style={{ fontSize: 12.5, color: tone.ink, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{t.insightBody}</div>
          </div>
        </div>

        {/* AI report entry (F-31) — full weekly summary, offered after the charts */}
        <button onClick={() => ctx.nav('p_aireport')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="sparkles" size={20} color="#fff" stroke={2.3} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>{L('Read the AI Safety Report')}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{t.aiSub}</div>
          </div>
          <Icon name="chevron-right" size={20} color="#fff" stroke={2.4} />
        </button>
      </div>
    </div>
  );
}

export { ParentReports };
