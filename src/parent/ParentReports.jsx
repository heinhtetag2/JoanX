// JoanX — parent app · ParentReports

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, PhotoAvatar, THEME, screenBgFor } from '../core/primitives.jsx';
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
  // A real child face in the switcher, never the buddy character: the child's own
  // photo first, then the shared default child photo, and only a mascot if both are
  // missing — the same fallback chain the Children list uses.
  const PAL = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'];
  const kidFace = (c, i, size, selectedBg) => {
    const pal = PAL[i % PAL.length];
    return (
      <PhotoAvatar src={c.photo} size={size} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }} fallback={
        <PhotoAvatar src="/assets/avatars/avatar-child.png" size={size} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }}
          fallback={<MascotChip species={c.avatar} color={c.color} size={size} bg={selectedBg} />} />} />
    );
  };
  return (
    <div style={{ position: 'relative' }}>
      {/* the child's name already headlines the page, so the switcher is just a face +
          chevron — no second "Mina" sitting right beside the title. */}
      <button onClick={() => setOpen(o => !o)} aria-label={k.name} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', padding: '6px 8px 6px 6px', borderRadius: 999, boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        {kidFace(k, idx, 32, BRAND.primaryLight)}
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
                  {kidFace(c, i, 30, on ? '#fff' : THEME.surface2)}
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

// Small round avatar chip for the bot side of the chat drawer — same gradient as the FAB
// that opens it, so the icon that started the conversation keeps "speaking" inside it.
function ChatAvatar() {
  return (
    <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="sparkles" size={13} color="#fff" stroke={2.3} />
    </div>
  );
}

// Shimmer placeholder used by the Reports loading skeleton.
const RSk = ({ w = '100%', h = 12, r = 8, style }) => <div className="jx-skeleton" style={{ width: w, height: h, borderRadius: r, ...style }} />;

// ── Reports dashboard — clean analytics layout (numbers + gridded charts) ──
function ParentReports({ ctx, kpiStyle = 'cards' }) {
  // which child's report is in view (header chip switches this)
  const [sel, setSel] = React.useState(0);
  const [respActive, setRespActive] = React.useState(null);   // selected day in the response-mix chart — null until a bar is tapped (tooltip is click-only)
  const [chatOpen, setChatOpen] = React.useState(false);       // "Ask about this week" drawer
  const [askedQ, setAskedQ] = React.useState([]);               // chatQuestions indices asked so far, in order — the running thread

  // loading — KPI + chart shimmer while the week's report is fetched
  if (ctx.demo?.loading) {
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
  const RESP = { immediate: '#4f9d89', delayed: '#e0af3e', ignored: '#e86f5f' };
  // response-mix chart shows the week weekend-first: Sat, Sun, then Mon–Fri. reactions is
  // Mon-first, so this maps display position → source index for the bars, labels and tooltip.
  const WEEK_ORDER = [0, 1, 2, 3, 4, 5, 6];   // Mon→Sun, matching the detail page + streak screen
  const oReactions = WEEK_ORDER.map(i => reactions[i]);
  const dayLabels = ctx.lang === 'ko' ? ['월', '화', '수', '목', '금', '토', '일'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  // F-20 — behavior-change framing: risky events are reported as a reduction
  // rate (start-of-week baseline vs the latest days), not a raw weekly count.
  const base3 = risk.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const recent3 = risk.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const riskReduction = base3 > 0 ? Math.round(((base3 - recent3) / base3) * 100) : 0;
  const stopsTotal = reactions.reduce((a, d) => a + d.immediate, 0);
  const delayedTotal = reactions.reduce((a, d) => a + d.delayed, 0);
  const ignoredTotal = reactions.reduce((a, d) => a + d.ignored, 0);
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
    respTitle: ko ? '경고에 반응하는 방식' : 'How they respond to warnings',
    respInsTitle: doingWell
      ? (ko ? '즉시 멈춤이 대부분이에요' : 'Mostly immediate stops')
      : (ko ? '늦은 반응·무시가 늘었어요' : 'More delayed & ignored'),
    respInsBody: doingWell
      ? (ko ? '좋은 습관이 자리잡고 있어요 — 계속 응원해 주세요.' : 'A good habit is forming — keep cheering them on.')
      : (ko ? '함께 규칙을 살펴보고 즉시 멈추는 연습을 해보세요.' : 'Review the rules together and practice stopping right away.'),
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
    { icon: 'shield-check', v: rep.acceptance + '%', delta: rep.deltas.acceptance, l: 'Warning acceptance', c: THEME.success, bg: THEME.successLight },
    { icon: 'flame', v: rep.streak + 'd', delta: rep.deltas.streak, l: 'Safe streak', c: THEME.joy, bg: THEME.joyBg },
  ].map(k => {
    const positive = String(k.delta).trim().startsWith('+');
    const good = k.l === 'Avg. response' ? !positive : positive;
    return { ...k, good };
  });
  // "Ring + stats" KPI variant (Tweaks): a donut + a 2×2 grid. The tile icons wear a
  // green-forward family that echoes the response donut beside them (brand green ·
  // teal · gold · brand green) so the whole KPI block reads as one palette, not two.
  const gridStats = [
    { icon: 'footprints',   c: '#6a9f4b', v: rep.safeWalkMin + 'm', l: 'Safe walking' },   // olive green
    { icon: 'timer',        c: '#3f9d8c', v: rep.avgResponse + 's', l: 'Avg. response' },   // teal
    { icon: 'flame',        c: '#c9922b', v: rep.streak + 'd',      l: 'Safe streak' },     // gold (echoes donut delayed)
    { icon: 'shield-check', c: '#4f9d89', v: stopsTotal,            l: 'Safe stops' },       // data teal-green (= donut immediate), NOT the brand green
  ];
  // inline stat-dots inside the activity card. Lead metric is the risky-behavior
  // reduction rate (a down-arrow % is the win), not the raw event count (F-20).
  const inline = [
    { v: (riskReduction >= 0 ? '↓' : '↑') + Math.abs(riskReduction) + '%', l: 'Risky moments', sub: 'vs. week start', c: '#bdd2ee', vc: riskReduction >= 0 ? THEME.success : THEME.danger },
    { v: stopsTotal, l: 'Safe stops', c: SERIES.trend },
    { v: rep.acceptance + '%', l: 'Acceptance', c: SERIES.rate },
  ];
  // activity-card footer: a small at-a-glance read of the week's chart —
  // which day drew the most safe stops, and which had the most risky moments.
  const stopsByDay = reactions.map(d => d.immediate);
  const bestDayIdx = stopsByDay.indexOf(Math.max(...stopsByDay));
  const riskiestIdx = risk.indexOf(Math.max(...risk));
  const activityFoot = [
    { l: ko ? '가장 안전한 날' : 'Safest day', v: dayName(bestDayIdx), c: SERIES.trend },
    { l: ko ? '주의가 많던 날' : 'Most alerts', v: dayName(riskiestIdx), c: '#8fb0dd' },
    { l: ko ? '이번 주 안전 멈춤' : 'Safe stops', v: stopsTotal, c: '#4f9d89' },
  ];

  // "Ask about this week" — canned Q&A behind the floating chat button. Every answer
  // reuses numbers already computed above, so the drawer can never contradict the
  // cards/charts it's explaining.
  const chatQuestions = [
    {
      icon: 'trending-down', c: THEME.success, bg: THEME.successLight,
      q: ko ? '위험한 순간이 왜 줄었나요?' : 'Why did risky moments drop?',
      a: ko
        ? `2주 전과 비교해 위험한 순간이 ${riskReduction}% 줄었어요. ${dayName(riskiestIdx)}에 주의가 가장 많았고, ${dayName(bestDayIdx)}이 가장 안전했어요.`
        : `Risky moments are down ${riskReduction}% compared to two weeks ago. ${dayName(riskiestIdx)} had the most alerts, while ${dayName(bestDayIdx)} was the safest day.`,
      chart: true,
    },
    {
      icon: 'shield-check', c: THEME.success, bg: THEME.successLight,
      q: ko ? '경고 수용률은 어떻게 계산되나요?' : 'How is the acceptance rate calculated?',
      a: ko
        ? `이번 주 경고 ${totalReacts}건 중 ${stopsTotal + delayedTotal}건에서 멈췄어요 — 수용률 ${rep.acceptance}% (지난주보다 ${rep.deltas.acceptance}). 그중 ${stopsTotal}건은 즉시 멈춤이었어요.`
        : `Out of ${totalReacts} warnings this week, ${nm} stopped for ${stopsTotal + delayedTotal} of them — an acceptance rate of ${rep.acceptance}% (${rep.deltas.acceptance} vs last week). ${stopsTotal} of those were immediate stops.`,
    },
    {
      icon: 'flame', c: THEME.joy, bg: THEME.joyBg,
      q: ko ? '안전 연속 기록은 무슨 뜻인가요?' : 'What does the safe streak mean?',
      a: ko
        ? `${nm}는 ${rep.streak}일 연속 하루 안전 목표를 지켰어요 (지난주보다 ${rep.deltas.streak}). 위험한 순간 없이 하루를 마치면 기록이 이어져요.`
        : `${nm} has kept a ${rep.streak}-day streak of hitting the daily safety goal (${rep.deltas.streak} vs last week). It continues each day they finish with no risky moments.`,
    },
    {
      icon: 'lightbulb', c: tone.icon, bg: tone.bg,
      q: ko ? '이번 주 뭘 도와주면 될까요?' : 'What should I help with this week?',
      a: t.insightBody,
    },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead stacked sub={L("This week's progress")} title={<span>{nm} <span style={{ fontSize: 19 }}>{doingWell ? '🌱' : '💪'}</span></span>} right={<ChildChip selected={sel} onPick={setSel} />} />
      <div style={{ padding: '8px 20px 0' }}>

        {/* Highlight strip — the one-line "so, how's the week going?" the header used to
            leave blank. Tone-aware: a warm-green win when the child is trending well, a
            soft amber nudge when it needs a look. The emoji + bold headline give the
            screen a lead voice before the numbers start. Tappable — jumps straight to
            this child's Rules & settings. */}
        <button onClick={() => ctx.nav('p_settings', { child })} aria-label={L('Rules & settings')}
          style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: tone.bg, borderRadius: 18, padding: '12px 14px', marginBottom: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, lineHeight: 1 }}>{doingWell ? '🎉' : '👀'}</span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: tone.ink, letterSpacing: '-0.2px' }}>
              {doingWell ? (ko ? `이번 주, 좋은 흐름이에요` : `On a roll this week`) : (ko ? `조금만 더 도와주면 돼요` : `Could use a nudge this week`)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: tone.ink, opacity: .82, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ko
                ? `위험 순간 ${riskReduction >= 0 ? '↓' : '↑'}${Math.abs(riskReduction)}% · 안전 멈춤 ${stopsTotal}회 · 수용 ${rep.acceptance}%`
                : `Risky moments ${riskReduction >= 0 ? '↓' : '↑'}${Math.abs(riskReduction)}% · ${stopsTotal} safe stops · ${rep.acceptance}% accepted`}
            </div>
          </div>
          <Icon name="chevron-right" size={18} color={tone.ink} stroke={2.4} style={{ opacity: .55, flexShrink: 0 }} />
        </button>

        {/* KPI block — Tweaks: 'cards' (2×2 white cards) or flat 'ring' (ring + stat grid, no card bg) */}
        {kpiStyle === 'ring' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '6px 2px 12px' }}>
            {/* response-mix donut — total responses in the middle, coloured segments for the
                immediate / delayed / ignored split (like the reference's "Total" donut) */}
            <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
              <svg width={104} height={104} viewBox="0 0 104 104">
                <circle cx="52" cy="52" r="44" fill="none" stroke="rgba(46,43,41,.08)" strokeWidth="11" />
                {(() => {
                  const C = 2 * Math.PI * 44, gap = 4;
                  let acc = 0;
                  return [
                    { v: stopsTotal,   c: RESP.immediate },
                    { v: delayedTotal, c: RESP.delayed },
                    { v: ignoredTotal, c: RESP.ignored },
                  ].filter(s => s.v > 0).map((s, i) => {
                    const full = (s.v / totalReacts) * C;
                    const len = Math.max(1, full - gap);
                    const off = -acc;
                    acc += full;
                    return <circle key={i} cx="52" cy="52" r="44" fill="none" stroke={s.c} strokeWidth="11" strokeLinecap="round"
                      strokeDasharray={`${len} ${C - len}`} strokeDashoffset={off} transform="rotate(-90 52 52)" />;
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 27, fontWeight: 800, color: THEME.fg1, lineHeight: 1 }}>{totalReacts}</span>
                <span style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{ko ? '총 반응' : 'Total'}</span>
              </div>
            </div>
            {/* 2×2 stat grid */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 10px' }}>
              {gridStats.map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: `${s.c}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={s.icon} size={16} color={s.c} stroke={2.3} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 17, fontWeight: 800, color: THEME.fg1, lineHeight: 1 }}>{s.v}</span>
                    <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(s.l)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '4px 0 6px' }}>
            {kpis.map((k, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 999, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name={k.icon} size={15} color={k.c} stroke={2.3} />
                  </div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 700, color: k.good ? THEME.success : THEME.danger }}>{k.delta}<Icon name={k.good ? 'trending-up' : 'trending-down'} size={11} color={k.good ? THEME.success : THEME.danger} stroke={2.6} /></span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: k.c, marginTop: 10 }}>{k.v}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L(k.l)}</div>
              </div>
            ))}
          </div>
        )}

        {/* response mix card — per-series stats up top, a right %-axis chart with dashed
            gridlines and connected rounded bars, and a bottom insight (reference layout) */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{t.respTitle}</div>
            <button onClick={() => ctx.nav('p_response', { childId: child.id })} aria-label={t.respTitle} style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></button>
          </div>

          {/* per-series summary — just dot + label + the week's share, no range band or warn flag */}
          <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
            {[
              { label: 'Immediate', c: RESP.immediate, val: stopsTotal },
              { label: 'Delayed',   c: RESP.delayed,   val: delayedTotal },
              { label: 'Ignored',   c: RESP.ignored,   val: ignoredTotal },
            ].map(s => {
              const pct = Math.round((s.val / totalReacts) * 100);
              return (
                <div key={s.label} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 999, background: s.c, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(s.label)}</span>
                  </div>
                  <div style={{ marginTop: 7 }}>
                    <span style={{ fontSize: 21, fontWeight: 800, color: THEME.fg1, lineHeight: 1 }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* chart — dashed 0/50/100 gridlines behind connected rounded bars, %-axis on the right */}
          <div style={{ display: 'flex', gap: 8, marginTop: 26 }}>
            <div style={{ flex: 1, position: 'relative', height: 132 }}>
              {[100, 50, 0].map(g => (
                <div key={g} style={{ position: 'absolute', left: 0, right: 0, top: `${100 - g}%`, borderTop: `1px dashed ${THEME.border}` }} />
              ))}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                {oReactions.map((d, i) => {
                  const tot = d.immediate + d.delayed + d.ignored;
                  const on = respActive === i;
                  return (
                    <div key={i} onClick={() => setRespActive(a => (a === i ? null : i))} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(46,43,41,.05)' : 'transparent', transition: 'background .15s', WebkitTapHighlightColor: 'transparent' }}>
                      {/* one continuous stacked bar — segments butt together, the column clips
                          to a rounded outline so it reads as a single connected line */}
                      <div style={{ width: 18, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderRadius: 6, overflow: 'hidden' }}>
                        {d.ignored > 0 && <div style={{ height: `${(d.ignored / tot) * 100}%`, background: RESP.ignored }} />}
                        {d.delayed > 0 && <div style={{ height: `${(d.delayed / tot) * 100}%`, background: RESP.delayed }} />}
                        <div style={{ height: `${(d.immediate / tot) * 100}%`, background: RESP.immediate }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* tap tooltip — click a bar to show that day's breakdown over it (click-only, no hover) */}
              {respActive != null && (() => {
                const d = oReactions[respActive];
                const center = Math.min(84, Math.max(16, ((respActive + 0.5) / oReactions.length) * 100));
                return (
                  <div style={{ position: 'absolute', top: 2, left: `${center}%`, transform: 'translateX(-50%)', zIndex: 5, pointerEvents: 'none', background: '#fff', borderRadius: 12, boxShadow: '0 8px 22px rgba(46,43,41,.16)', padding: '8px 11px', minWidth: 104 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg2, marginBottom: 5 }}>{dayName(WEEK_ORDER[respActive])}</div>
                    {[['Immediate', RESP.immediate, d.immediate], ['Delayed', RESP.delayed, d.delayed], ['Ignored', RESP.ignored, d.ignored]].map(([l, c, v]) => (
                      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <span style={{ width: 7, height: 7, borderRadius: 999, background: c, flexShrink: 0 }} />
                        <span style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, flex: 1, whiteSpace: 'nowrap' }}>{L(l)}</span>
                        <span style={{ fontSize: 11, color: THEME.fg1, fontWeight: 800 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div style={{ width: 30, height: 132, position: 'relative', flexShrink: 0 }}>
              {[100, 50, 0].map(g => (
                <span key={g} style={{ position: 'absolute', right: 0, top: `${100 - g}%`, transform: 'translateY(-50%)', fontSize: 10, color: THEME.fg3, fontWeight: 600 }}>{g}%</span>
              ))}
            </div>
          </div>

          {/* day labels, caret under the selected day (aligned to the bars, not the axis) */}
          <div style={{ display: 'flex', gap: 8, marginTop: 6, paddingRight: 38 }}>
            {oReactions.map((d, i) => (
              <div key={i} onClick={() => setRespActive(a => (a === i ? null : i))} style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 10.5, color: respActive === i ? THEME.fg1 : THEME.fg3, fontWeight: respActive === i ? 800 : 600 }}>{ko ? dayName(WEEK_ORDER[i]) : d.day[0]}</div>
                {respActive === i && <div style={{ width: 0, height: 0, margin: '4px auto 0', borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderBottom: `5px solid ${THEME.fg1}` }} />}
              </div>
            ))}
          </div>

          {/* bottom insight — the takeaway, framed like the reference's diagnosis line */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${THEME.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{t.respInsTitle}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 4, lineHeight: 1.5 }}>{t.respInsBody}</div>
          </div>
        </div>

        {/* activity card — inline stats + bars-and-line chart + CTA */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L('Weekly activity')}</span>
            <button onClick={() => ctx.nav('p_weekactivity', { childId: child.id })} aria-label={L('Weekly activity')} style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', padding: 0, cursor: 'pointer' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></button>
          </div>
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
          {/* footer — a divider, then a plain read of the week's chart */}
          <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: 16, paddingTop: 14, display: 'flex', gap: 26 }}>
            {activityFoot.map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1, color: THEME.fg1 }}>{s.v}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: s.c }} />
                  <span style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>{s.l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* insight — tone adapts to whether this child is trending well */}
        <div style={{ display: 'flex', gap: 12, background: tone.bg, borderRadius: 18, padding: 16, marginTop: 14 }}>
          <Icon name={tone.name} size={20} color={tone.icon} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: tone.ink }}>{t.insightTitle}</div>
            <div style={{ fontSize: 12.5, color: tone.ink, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{t.insightBody}</div>
          </div>
        </div>

      </div>

      {/* floating "ask about this week" button — a guided Q&A, not a free-text chat, so
          every answer is a pre-written explanation of a number already on this screen */}
      <button onClick={() => { setChatOpen(true); setAskedQ([]); }} aria-label={L('Ask about this week')}
        style={{ position: 'fixed', right: 20, bottom: 104, height: 38, padding: '0 16px 0 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', gap: 6, zIndex: 45 }}>
        <Icon name="sparkles" size={16} color="#fff" stroke={2.2} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{ko ? 'AI 요약' : 'AI summary'}</span>
      </button>

      {chatOpen && (
        <div className="no-sb jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 90, overflowY: 'auto', paddingTop: 50, paddingBottom: 30, background: screenBgFor(BRAND.primary) }}>
          <ParentHead onBack={() => setChatOpen(false)} title={ko ? `${nm}의 한 주에 대해 물어보세요` : `Ask about ${nm}'s week`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 20px 4px' }}>
            {/* bot greeting */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <ChatAvatar />
              <div style={{ maxWidth: '86%', background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.5, fontWeight: 500 }}>
                {ko ? `안녕하세요! ${nm}의 이번 주에 대해 궁금한 걸 아래에서 골라보세요.` : `Hi! Pick anything below to learn more about ${nm}'s week.`}
              </div>
            </div>

            {/* running thread — each asked question as a user bubble, its answer as a bot bubble */}
            {askedQ.map((qi, turn) => {
              const cq = chatQuestions[qi];
              return (
                <React.Fragment key={turn}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ maxWidth: '86%', background: BRAND.primary, borderRadius: '16px 4px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: '#fff', fontWeight: 600, lineHeight: 1.4 }}>
                      {cq.q}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <ChatAvatar />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ maxWidth: '86%', background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.55, fontWeight: 500 }}>
                        {cq.a}
                      </div>
                      {cq.chart && (
                        <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 12 }}>
                          <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={Math.ceil(riskMax / 2) * 2} yStep={2} barW={14} height={130}
                            tooltip={(d, i) => ({ title: dayName(i), rows: [{ label: L('Risky moments'), value: d.risk, color: '#bdd2ee' }, { label: L('Safe stops'), value: d.stops, color: SERIES.trend }] })} />
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}

            {/* suggested-question badges — only the ones not asked yet, chip-style like a chat suggestion row */}
            {(() => {
              const remaining = chatQuestions.map((cq, i) => ({ ...cq, i })).filter(cq => !askedQ.includes(cq.i));
              if (!remaining.length) return null;
              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {remaining.map(cq => (
                    <button key={cq.i} onClick={() => setAskedQ(h => [...h, cq.i])} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '7px 12px 7px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 999, background: cq.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name={cq.icon} size={11} color={cq.c} stroke={2.4} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{cq.q}</span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export { ParentReports, StdBarChart };
