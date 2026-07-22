// JoanX — parent app · ParentReports, alternate layouts.
//
// Five distinct layout directions for the weekly Reports dashboard, all built on the
// SAME real data and design system as the original (BRAND/THEME tokens, the live charts,
// the child switcher) — so the client compares working alternatives, not flat mockups.
// The original "analytics" layout lives in ParentReports.jsx; App.jsx routes between them
// via the "Report layout" tweak. Same convention as ProfileVariants / HomeVariants.

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── shared model ─────────────────────────────────────────────────────
// Plain function (not a hook) so it can be called after the loading early-return.
// Mirrors the data prep in ParentReports.jsx so every layout reads one source of truth.
function reportModel(sel, ctx) {
  const child = CHILDREN[Math.min(sel, CHILDREN.length - 1)] || CHILDREN[0];
  const rep = CHILD_REPORTS[child.id] || {
    acceptance: PARENT_METRICS.acceptance, safeWalkMin: PARENT_METRICS.safeWalkMin,
    avgResponse: PARENT_METRICS.avgResponse, streak: child.streak || 0,
    deltas: { acceptance: '+6%', walk: '+12%', resp: '-0.3s', streak: '+2' },
    reactions: REACTIONS_7D, risk: RISK_TREND,
  };
  const reactions = rep.reactions, risk = rep.risk;
  const SERIES = { trend: 'var(--color-data-blue-40)', rate: 'var(--color-data-yellow-40)' };
  const RESP = { immediate: '#4f9d89', delayed: '#e0af3e', ignored: '#e86f5f' };
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const base3 = risk.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const recent3 = risk.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const riskReduction = base3 > 0 ? Math.round(((base3 - recent3) / base3) * 100) : 0;
  const stopsTotal = reactions.reduce((a, d) => a + d.immediate, 0);
  const actData = reactions.map((d, i) => ({ label: dayLabels[i], risk: risk[i], stops: d.immediate }));
  const riskMax = Math.max(10, ...risk);
  const doingWell = rep.acceptance >= 75;
  const ko = ctx.lang === 'ko';
  const nm = child.name;
  const dayName = i => (ko ? ['월', '화', '수', '목', '금', '토', '일'][i] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]);
  const t = {
    aiSub: ko ? `${nm}의 한 주를 쉬운 말로 요약` : `A plain-language summary of ${nm}'s week`,
    respTitle: ko ? '경고에 반응하는 방식' : 'How they respond to warnings',
    respNote: doingWell
      ? (ko ? '대부분 즉시 멈춰요.' : 'Mostly immediate stops.')
      : (ko ? '늦은 반응·무시가 늘었어요.' : 'More delayed and ignored responses.'),
    buildHabits: ko ? `${nm}와 안전한 습관 만들기` : `Build safer habits with ${nm}`,
    insightTitle: ko ? '이게 무슨 의미냐면' : 'What this means',
    insightBody: doingWell
      ? (ko ? `${nm}가 2주 전보다 더 빨리 반응하고 경고를 덜 무시해요. 습관이 자리잡고 있어요 — 계속 이어가요.` : `${nm} is reacting faster and ignoring fewer warnings than two weeks ago. The habit is forming — keep it up.`)
      : (ko ? `${nm}는 아직 경고에 천천히 반응할 때가 있어요. 함께 규칙을 살펴보고 응원해 주세요.` : `${nm} is still slow to respond to some warnings. Review the rules together and cheer them on.`),
  };
  const tone = doingWell
    ? { bg: THEME.successLight, ink: '#274427', icon: THEME.success, name: 'lightbulb' }
    : { bg: THEME.goldLight, ink: '#5b4a1e', icon: THEME.gold, name: 'alert-circle' };
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
  const inline = [
    { v: (riskReduction >= 0 ? '↓' : '↑') + Math.abs(riskReduction) + '%', l: 'Risky moments', sub: 'vs. week start', c: '#bdd2ee', vc: riskReduction >= 0 ? THEME.success : THEME.danger },
    { v: stopsTotal, l: 'Safe stops', c: SERIES.trend },
    { v: rep.acceptance + '%', l: 'Acceptance', c: SERIES.rate },
  ];
  return { child, rep, reactions, risk, SERIES, RESP, actData, riskMax, doingWell, ko, dayName, t, tone, kpis, inline,
    openResponse: () => ctx.nav('p_response', { childId: child.id }) };
}

// ── child switcher (identical behaviour to the original) ─────────────
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

// ── chart primitives (shared by every layout) ───────────────────────
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

function StdBarChart({ data, series, line, yMax, yStep, height = 168, barW = 9, tooltip }) {
  const [active, setActive] = React.useState(() => data.length - 1);
  const idx = Math.min(active, data.length - 1);
  const ticks = [];
  for (let v = 0; v <= yMax; v += yStep) ticks.push(v);
  const topPad = 10;
  const plot = height - topPad;
  const read = tooltip ? tooltip(data[idx], idx) : null;
  return (
    <div>
      {read && <ChartReadout title={read.title} rows={read.rows} />}
      <div style={{ display: 'flex', gap: 8 }}>
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
                  <div key={i} onClick={() => setActive(i)}
                    style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(46,43,41,.06)' : 'transparent', transition: 'background .15s', WebkitTapHighlightColor: 'transparent' }}>
                    {series.map(s => {
                      const fill = typeof s.color === 'function' ? s.color(d, i, data) : s.color;
                      return <div key={s.key} style={{ width: barW, height: `${(d[s.key] / yMax) * plot}px`, background: fill, borderRadius: '4px 4px 0 0' }} />;
                    })}
                  </div>
                );
              })}
            </div>
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

// ── reusable content blocks (self-contained; own their chart state) ──
// Stacked-bar response mix over 7 days. `bare` drops the card chrome for the feed layout.
function ResponseMixCard({ model, bare }) {
  const { reactions, RESP, dayName, ko, t, openResponse } = model;
  const [active, setActive] = React.useState(6);
  const body = (
    <React.Fragment>
      {!bare && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, paddingRight: 10 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{t.respTitle}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 3 }}>{t.respNote}</div>
          </div>
          <button onClick={() => openResponse && openResponse()} aria-label={t.respTitle} style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></button>
        </div>
      )}
      <div style={{ marginTop: bare ? 4 : 16 }}>
        <ChartReadout title={dayName(active)} rows={[
          { label: 'immediate', value: reactions[active].immediate, color: RESP.immediate },
          { label: 'delayed', value: reactions[active].delayed, color: RESP.delayed },
          { label: 'ignored', value: reactions[active].ignored, color: RESP.ignored },
        ]} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 94, borderBottom: `1.5px solid ${THEME.border}` }}>
        {reactions.map((d, i) => {
          const tot = d.immediate + d.delayed + d.ignored;
          const on = active === i;
          return (
            <div key={i} onClick={() => setActive(i)}
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
          <span key={i} onClick={() => setActive(i)} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: active === i ? THEME.fg1 : THEME.fg3, fontWeight: active === i ? 800 : 600, cursor: 'pointer' }}>{ko ? dayName(i) : d.day[0]}</span>
        ))}
      </div>
      <Legend items={[['Immediate', RESP.immediate], ['Delayed', RESP.delayed], ['Ignored', RESP.ignored]]} />
    </React.Fragment>
  );
  return bare ? body : <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>{body}</div>;
}

// Inline stats + bars-and-line chart + habit CTA. `bare` drops the card chrome.
function ActivityCard({ model, ctx, bare }) {
  const { inline, actData, riskMax, SERIES, dayName, t } = model;
  const body = (
    <React.Fragment>
      {!bare && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{L('Weekly activity')}</span>
          <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 22, marginBottom: 18, alignItems: 'flex-start' }}>
        {inline.map(s => (
          <div key={s.l}>
            <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: s.vc || THEME.fg1 }}>{s.v}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: s.c }} />
              <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L(s.l)}</span>
            </div>
            {s.sub && <div style={{ fontSize: 10, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{L(s.sub)}</div>}
          </div>
        ))}
      </div>
      <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={Math.ceil(riskMax / 2) * 2} yStep={2} barW={14}
        tooltip={(d, i) => ({ title: dayName(i), rows: [{ label: L('Risky moments'), value: d.risk, color: '#bdd2ee' }, { label: L('Safe stops'), value: d.stops, color: SERIES.trend }] })} />
      <button onClick={() => ctx.nav('p_children')} style={{ width: '100%', marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, background: THEME.surface2, border: 'none', borderRadius: 14, padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
        <Icon name="sparkles" size={17} color={BRAND.primary} stroke={2.3} />
        <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1 }}>{t.buildHabits}</span>
      </button>
    </React.Fragment>
  );
  return bare ? body : <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>{body}</div>;
}

function InsightCard({ model, big }) {
  const { tone, t } = model;
  return (
    <div style={{ display: 'flex', gap: 12, background: tone.bg, borderRadius: 18, padding: big ? 18 : 16, marginTop: 14 }}>
      <Icon name={tone.name} size={big ? 22 : 20} color={tone.icon} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: big ? 15 : 13.5, fontWeight: 800, color: tone.ink }}>{t.insightTitle}</div>
        <div style={{ fontSize: big ? 13.5 : 12.5, color: tone.ink, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{t.insightBody}</div>
      </div>
    </div>
  );
}

function AiReportCta({ model, ctx }) {
  const { child, t } = model;
  return (
    <button onClick={() => ctx.nav('p_aireport', { childId: child.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="sparkles" size={20} color="#fff" stroke={2.3} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>{L('Read the AI Safety Report')}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{t.aiSub}</div>
      </div>
      <Icon name="chevron-right" size={20} color="#fff" stroke={2.4} />
    </button>
  );
}

// small helpers for KPI presentation
const DeltaTag = ({ k, size = 11 }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: size, fontWeight: 700, color: k.good ? THEME.success : THEME.danger }}>{k.delta}<Icon name={k.good ? 'trending-up' : 'trending-down'} size={size} color={k.good ? THEME.success : THEME.danger} stroke={2.6} /></span>
);

// editorial helpers — restraint over decoration: small-caps kickers, hairline rules,
// tabular numerals, flat bordered rows. Deliberately no gradients, glows, colored
// icon-tiles or sparkles (the tropes that read as "AI design").
const NUM = { fontVariantNumeric: 'tabular-nums' };
const Kicker = ({ children, style }) => <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.3, textTransform: 'uppercase', color: THEME.fg3, ...style }}>{children}</div>;
const Rule = ({ style }) => <div style={{ height: 1, background: THEME.fg1, opacity: .13, ...style }} />;

// Flat, bordered entry to the AI report — the gradient/glow version stays on the
// data-forward layouts; the editorial ones get this restrained row instead.
function FlatAiRow({ model, ctx, style }) {
  const { child, t } = model;
  return (
    <button onClick={() => ctx.nav('p_aireport', { childId: child.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 14, padding: '14px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', ...style }}>
      <Icon name="file-text" size={18} color={BRAND.primary} stroke={2.1} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Read the AI Safety Report')}</div>
        <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2 }}>{t.aiSub}</div>
      </div>
      <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.4} />
    </button>
  );
}

// ── page shell — scroll container + brand-tinted wash + header ────────
function Shell({ title, chip, children }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead stacked sub={L("This week's progress")} title={L(title)} right={chip} />
      <div style={{ padding: '8px 20px 0' }}>{children}</div>
    </div>
  );
}

const Divider = () => <div style={{ height: 1, background: THEME.border, margin: '18px 0' }} />;
const SectionLabel = ({ children }) => <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .5, margin: '2px 0 12px' }}>{children}</div>;

// ── 1 · HERO — lead with the headline metric, big and confident ──────
function ReportHero({ model, chip, ctx }) {
  const [hero, ...rest] = model.kpis;
  const pct = parseInt(model.rep.acceptance, 10) || 0;
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ background: `linear-gradient(160deg, ${BRAND.primaryLight}, #fff 82%)`, borderRadius: 24, padding: '20px 20px 18px', border: `1px solid ${THEME.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Icon name={hero.icon} size={16} color={BRAND.primary} stroke={2.3} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg2 }}>{L(hero.l)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontSize: 52, fontWeight: 800, lineHeight: .95, color: THEME.fg1 }}>{hero.v}</span>
          <DeltaTag k={hero} size={13} />
        </div>
        <div style={{ height: 9, borderRadius: 999, background: BRAND.primaryLight, marginTop: 16, overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 999, background: BRAND.primary }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 12 }}>
        {rest.map((k, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 16, padding: 12 }}>
            <Icon name={k.icon} size={15} color={THEME.fg3} stroke={2} />
            <div style={{ fontSize: 19, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 5 }}>{L(k.l)}</div>
            <div style={{ marginTop: 4 }}><DeltaTag k={k} size={10} /></div>
          </div>
        ))}
      </div>
      <ResponseMixCard model={model} />
      <ActivityCard model={model} ctx={ctx} />
      <InsightCard model={model} />
      <AiReportCta model={model} ctx={ctx} />
    </Shell>
  );
}

// ── 2 · COMPACT — dense, everything close; KPIs as a scroll strip ────
function ReportCompact({ model, chip, ctx }) {
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div className="no-sb" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '4px 0 6px', margin: '0 -20px', paddingLeft: 20, paddingRight: 20 }}>
        {model.kpis.map((k, i) => (
          <div key={i} style={{ flex: '0 0 auto', width: 118, background: '#fff', borderRadius: 16, padding: 13 }}>
            <Icon name={k.icon} size={15} color={THEME.fg3} stroke={2} />
            <div style={{ fontSize: 20, fontWeight: 800, marginTop: 7, lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, margin: '5px 0 4px' }}>{L(k.l)}</div>
            <DeltaTag k={k} size={10} />
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 18, padding: 14, marginTop: 12 }}><ResponseMixCard model={model} bare /></div>
      <div style={{ background: '#fff', borderRadius: 18, padding: 14, marginTop: 12 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 12 }}>{L('Weekly activity')}</div>
        <ActivityCard model={model} ctx={ctx} bare />
      </div>
      <InsightCard model={model} />
      <AiReportCta model={model} ctx={ctx} />
    </Shell>
  );
}

// ── 3 · FEED — edge-to-edge story feed, labelled sections, no cards ──
function ReportFeed({ model, chip, ctx }) {
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <SectionLabel>{L("This week's progress")}</SectionLabel>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {model.kpis.map((k, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', borderLeft: i ? `1px solid ${THEME.border}` : 'none' }}>
            <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1 }}>{k.v}</div>
            <div style={{ fontSize: 9.5, color: THEME.fg2, fontWeight: 600, margin: '5px 6px 4px' }}>{L(k.l)}</div>
            <DeltaTag k={k} size={9.5} />
          </div>
        ))}
      </div>
      <Divider />
      <SectionLabel>{model.t.respTitle}</SectionLabel>
      <div style={{ fontSize: 12, color: THEME.fg2, margin: '-6px 0 12px' }}>{model.t.respNote}</div>
      <ResponseMixCard model={model} bare />
      <Divider />
      <SectionLabel>{L('Weekly activity')}</SectionLabel>
      <ActivityCard model={model} ctx={ctx} bare />
      <Divider />
      <SectionLabel>{model.t.insightTitle}</SectionLabel>
      <div style={{ fontSize: 13.5, color: THEME.fg1, lineHeight: 1.5 }}>{model.t.insightBody}</div>
      <AiReportCta model={model} ctx={ctx} />
    </Shell>
  );
}

// ── 4 · CARDS — magazine list; each metric its own full-width card ──
function ReportCards({ model, chip, ctx }) {
  const spark = model.actData.map(d => d.stops);
  const smax = Math.max(1, ...spark);
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 4 }}>
        {model.kpis.map((k, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: '15px 16px' }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={k.icon} size={20} color={BRAND.primary} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{L(k.l)}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 2 }}>
                <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{k.v}</span>
                <DeltaTag k={k} size={11} />
              </div>
            </div>
            {/* mini sparkline — the week's safe-stop shape, same for every card as a texture */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 30, flexShrink: 0 }}>
              {spark.map((v, j) => (
                <div key={j} style={{ width: 4, height: `${Math.max(12, (v / smax) * 100)}%`, borderRadius: 2, background: j === spark.length - 1 ? BRAND.primary : THEME.border }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ResponseMixCard model={model} />
      <ActivityCard model={model} ctx={ctx} />
      <InsightCard model={model} />
      <AiReportCta model={model} ctx={ctx} />
    </Shell>
  );
}

// ── 5 · SUMMARY — narrative first: insight + AI report lead, data below ─
function ReportSummary({ model, chip, ctx }) {
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ marginTop: 4 }}><InsightCard model={model} big /></div>
      <AiReportCta model={model} ctx={ctx} />
      <SectionLabel>{L("This week's progress")}</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {model.kpis.map((k, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon name={k.icon} size={17} color={THEME.fg3} stroke={2} /></div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.v}</span>
              <DeltaTag k={k} />
            </div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 5 }}>{L(k.l)}</div>
          </div>
        ))}
      </div>
      <ResponseMixCard model={model} />
      <ActivityCard model={model} ctx={ctx} />
    </Shell>
  );
}

// ── 6 · LEDGER — the week as a document: tables, tabular numerals, hairlines ─
function ReportLedger({ model, chip, ctx }) {
  const { kpis, reactions, dayName, ko, RESP } = model;
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 14, padding: '2px 16px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '13px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
            <span style={{ flex: 1, fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L(k.l)}</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: THEME.fg1, ...NUM }}>{k.v}</span>
            <span style={{ width: 52, textAlign: 'right' }}><DeltaTag k={k} size={11} /></span>
          </div>
        ))}
      </div>

      <Kicker style={{ margin: '22px 2px 10px' }}>{model.t.respTitle}</Kicker>
      <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '9px 14px', background: THEME.surface2 }}>
          <span style={{ flex: 1, fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{ko ? '요일' : 'Day'}</span>
          {[[ko ? '즉시' : 'Imm.', RESP.immediate], [ko ? '늦음' : 'Del.', '#b98f2e'], [ko ? '무시' : 'Ign.', RESP.ignored]].map(([l, c]) => (
            <span key={l} style={{ width: 44, textAlign: 'right', fontSize: 10.5, fontWeight: 800, color: c }}>{l}</span>
          ))}
        </div>
        {reactions.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderTop: `1px solid ${THEME.border}` }}>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{dayName(i)}</span>
            <span style={{ width: 44, textAlign: 'right', fontSize: 13, fontWeight: 700, color: THEME.fg1, ...NUM }}>{d.immediate}</span>
            <span style={{ width: 44, textAlign: 'right', fontSize: 13, color: THEME.fg2, ...NUM }}>{d.delayed}</span>
            <span style={{ width: 44, textAlign: 'right', fontSize: 13, color: THEME.fg3, ...NUM }}>{d.ignored}</span>
          </div>
        ))}
      </div>

      <Kicker style={{ margin: '22px 2px 10px' }}>{ko ? '주간 활동' : 'Weekly activity'}</Kicker>
      <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 14, padding: 16 }}>
        <ActivityCard model={model} ctx={ctx} bare />
      </div>
      <FlatAiRow model={model} ctx={ctx} style={{ marginTop: 16 }} />
    </Shell>
  );
}

// ── 7 · EDITORIAL — masthead typography; the number leads, the rest follows ─
function ReportEditorial({ model, chip, ctx }) {
  const [lead, ...rest] = model.kpis;
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <Kicker style={{ marginTop: 6 }}>{L("This week's progress")} · {model.child.name}</Kicker>
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: .95, letterSpacing: -1.5, marginTop: 8, ...NUM }}>{lead.v}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg2 }}>{L(lead.l)}</span>
        <DeltaTag k={lead} size={12} />
      </div>
      <div style={{ fontSize: 15, lineHeight: 1.5, color: THEME.fg1, fontWeight: 600, margin: '14px 0 16px' }}>{model.t.respNote}</div>
      <Rule />
      <div style={{ display: 'flex', margin: '16px 0 4px' }}>
        {rest.map((k, i) => (
          <div key={i} style={{ flex: 1, paddingLeft: i ? 14 : 0, borderLeft: i ? `1px solid ${THEME.border}` : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 800, ...NUM }}>{k.v}</div>
            <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{L(k.l)}</div>
          </div>
        ))}
      </div>
      <Kicker style={{ margin: '24px 2px 10px' }}>{model.t.respTitle}</Kicker>
      <ResponseMixCard model={model} bare />
      <Kicker style={{ margin: '24px 2px 10px' }}>{model.ko ? '주간 활동' : 'Weekly activity'}</Kicker>
      <ActivityCard model={model} ctx={ctx} bare />
      <div style={{ borderLeft: `3px solid ${model.tone.icon}`, paddingLeft: 14, margin: '22px 0 4px' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .8 }}>{model.t.insightTitle}</div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: THEME.fg1, fontWeight: 600, marginTop: 5 }}>{model.t.insightBody}</div>
      </div>
      <FlatAiRow model={model} ctx={ctx} style={{ marginTop: 20 }} />
    </Shell>
  );
}

// ── 8 · MINIMAL — Swiss restraint: air, hairlines, no cards, no icon chrome ─
function ReportMinimal({ model, chip, ctx }) {
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ marginTop: 8 }}>
        {model.kpis.map((k, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '18px 2px', borderTop: `1px solid ${THEME.border}` }}>
            <span style={{ fontSize: 30, fontWeight: 800, width: 92, ...NUM }}>{k.v}</span>
            <span style={{ flex: 1, fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L(k.l)}</span>
            <DeltaTag k={k} size={12} />
          </div>
        ))}
      </div>
      <Kicker style={{ margin: '28px 2px 12px' }}>{model.t.respTitle}</Kicker>
      <ResponseMixCard model={model} bare />
      <Kicker style={{ margin: '28px 2px 12px' }}>{model.ko ? '주간 활동' : 'Weekly activity'}</Kicker>
      <ActivityCard model={model} ctx={ctx} bare />
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '26px 2px 0' }}>
        <span style={{ width: 7, height: 7, borderRadius: 999, background: model.tone.icon, marginTop: 7, flexShrink: 0 }} />
        <div style={{ fontSize: 14, lineHeight: 1.55, color: THEME.fg1 }}>{model.t.insightBody}</div>
      </div>
      <button onClick={() => ctx.nav('p_aireport', { childId: model.child.id })} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: '18px 2px 4px', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primary, fontSize: 13.5, fontWeight: 800 }}>
        {L('Read the AI Safety Report')} <Icon name="arrow-right" size={15} color={BRAND.primary} stroke={2.4} />
      </button>
    </Shell>
  );
}

// ── 9 · JOURNAL — the week as a day-by-day log on a timeline rail ─
function ReportJournal({ model, chip, ctx }) {
  const { reactions, risk, dayName, ko, RESP } = model;
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '6px 2px 18px' }}>
        {model.kpis.map((k, i) => (
          <div key={i}>
            <span style={{ fontSize: 17, fontWeight: 800, ...NUM }}>{k.v}</span>
            <span style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginLeft: 5 }}>{L(k.l)}</span>
          </div>
        ))}
      </div>
      <div style={{ position: 'relative', paddingLeft: 20 }}>
        <div style={{ position: 'absolute', left: 4, top: 6, bottom: 10, width: 2, background: THEME.border }} />
        {reactions.map((d, i) => {
          const latest = i === reactions.length - 1;
          return (
            <div key={i} style={{ position: 'relative', paddingBottom: latest ? 0 : 18 }}>
              <div style={{ position: 'absolute', left: -20, top: 2, width: 10, height: 10, borderRadius: 999, background: latest ? BRAND.primary : '#fff', border: `2px solid ${latest ? BRAND.primary : THEME.border}` }} />
              <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{dayName(i)}</div>
              <div style={{ display: 'flex', gap: 14, marginTop: 5, alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: THEME.fg2 }}><b style={{ color: RESP.immediate }}>{d.immediate}</b> {ko ? '즉시' : 'immediate'}</span>
                {d.delayed > 0 && <span style={{ fontSize: 12, color: THEME.fg2 }}><b style={{ color: '#b98f2e' }}>{d.delayed}</b> {ko ? '늦음' : 'delayed'}</span>}
                {d.ignored > 0 && <span style={{ fontSize: 12, color: THEME.fg2 }}><b style={{ color: RESP.ignored }}>{d.ignored}</b> {ko ? '무시' : 'ignored'}</span>}
                <span style={{ fontSize: 12, color: THEME.fg3, marginLeft: 'auto' }}>{ko ? '위험' : 'risk'} {risk[i]}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: model.tone.bg, borderRadius: 14, padding: 16, marginTop: 22 }}>
        <div style={{ fontSize: 13.5, fontWeight: 800, color: model.tone.ink }}>{model.t.insightTitle}</div>
        <div style={{ fontSize: 12.5, color: model.tone.ink, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{model.t.insightBody}</div>
      </div>
      <FlatAiRow model={model} ctx={ctx} style={{ marginTop: 14 }} />
    </Shell>
  );
}

// ── 10 · PANEL — a spec-sheet: grouped rows, dotted leaders, utilitarian ─
function ReportPanel({ model, chip, ctx }) {
  const { kpis, inline, ko } = model;
  const groups = [
    { head: ko ? '안전' : 'Safety', rows: [kpis[0], kpis[2], kpis[3]] },
    { head: ko ? '활동' : 'Activity', rows: [kpis[1], ...inline.slice(1).map(s => ({ v: s.v, l: s.l }))] },
  ];
  const LeaderRow = ({ r }) => (
    <div style={{ display: 'flex', alignItems: 'baseline', padding: '12px 0', borderTop: `1px solid ${THEME.border}` }}>
      <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L(r.l)}</span>
      <span style={{ flex: 1, borderBottom: `1px dotted ${THEME.border}`, margin: '0 8px', transform: 'translateY(-3px)' }} />
      <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1, ...NUM }}>{r.v}</span>
      {r.delta && <span style={{ width: 48, textAlign: 'right', marginLeft: 6 }}><DeltaTag k={r} size={11} /></span>}
    </div>
  );
  return (
    <Shell title={model.doingWell ? 'Getting better' : 'Needs attention'} chip={chip}>
      {groups.map((g, gi) => (
        <div key={gi} style={{ marginTop: gi ? 22 : 8 }}>
          <Kicker style={{ marginBottom: 2 }}>{g.head}</Kicker>
          {g.rows.map((r, i) => <LeaderRow key={i} r={r} />)}
        </div>
      ))}
      <Kicker style={{ margin: '24px 2px 10px' }}>{model.t.respTitle}</Kicker>
      <ResponseMixCard model={model} bare />
      <Kicker style={{ margin: '24px 2px 10px' }}>{ko ? '주간 활동' : 'Weekly activity'}</Kicker>
      <ActivityCard model={model} ctx={ctx} bare />
      <FlatAiRow model={model} ctx={ctx} style={{ marginTop: 20 }} />
    </Shell>
  );
}

// ── loading skeleton (shared) ────────────────────────────────────────
const RSk = ({ w = '100%', h = 12, r = 8, style }) => <div className="jx-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;
function ReportSkeleton() {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead stacked sub={L("This week's progress")} title={L('Loading…')} right={<RSk w={110} h={40} r={999} />} />
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 0 6px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14 }}>
              <RSk w={26} h={16} style={{ marginLeft: 'auto' }} /><RSk w={70} h={22} style={{ marginTop: 10 }} /><RSk w={90} h={11} style={{ marginTop: 8 }} />
            </div>
          ))}
        </div>
        {[0, 1].map(i => (
          <div key={i} style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
            <RSk w={160} h={15} /><RSk w={220} h={11} style={{ marginTop: 8 }} />
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 94, marginTop: 20 }}>
              {[62, 40, 78, 52, 88, 46, 70].map((h, j) => <RSk key={j} h={h} r={6} style={{ flex: 1 }} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── registry + router ────────────────────────────────────────────────
// 'analytics' is the original (ParentReports.jsx); the other five live here.
const REPORT_LAYOUTS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'hero', label: 'Hero' },
  { id: 'compact', label: 'Compact' },
  { id: 'feed', label: 'Feed' },
  { id: 'cards', label: 'Cards' },
  { id: 'summary', label: 'Summary' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'journal', label: 'Journal' },
  { id: 'panel', label: 'Panel' },
];

function ParentReportsVariant({ variant, ctx }) {
  const [sel, setSel] = React.useState(0);
  if (ctx.demo?.loading) return <ReportSkeleton />;
  const model = reportModel(sel, ctx);
  const chip = <ChildChip selected={sel} onPick={setSel} />;
  const props = { model, chip, ctx };
  switch (variant) {
    case 'compact': return <ReportCompact {...props} />;
    case 'feed':    return <ReportFeed {...props} />;
    case 'cards':   return <ReportCards {...props} />;
    case 'summary':   return <ReportSummary {...props} />;
    case 'ledger':    return <ReportLedger {...props} />;
    case 'editorial': return <ReportEditorial {...props} />;
    case 'minimal':   return <ReportMinimal {...props} />;
    case 'journal':   return <ReportJournal {...props} />;
    case 'panel':     return <ReportPanel {...props} />;
    case 'hero':
    default:          return <ReportHero {...props} />;
  }
}

export { REPORT_LAYOUTS, ParentReportsVariant };
