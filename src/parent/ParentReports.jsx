// JoanX — parent app · ParentReports

import React from 'react';
import { CHILDREN, CHILD_REPORTS, FEATURES, PARENT_ALERTS, PARENT_METRICS, PERMISSIONS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Icon, PhotoAvatar, THEME, avatarPalFor, screenBgFor } from '../core/primitives.jsx';
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
  // A real child face in the switcher: the child's own photo, falling back to the
  // same default child illustration every profile-less kid uses (by design — a
  // consistent default look, not a per-kid mascot swap, which would mix a photo-
  // style face with a cartoon animal for different kids and look inconsistent).
  // The ring is one uniform brand color for every child now — the name label next
  // to it (added below) is what actually identifies who's who, so the ring doesn't
  // need to carry that job or vary per kid.
  const kidFace = (c, size, selectedBg) => {
    const pal = avatarPalFor(c.id);
    return (
      <div style={{ width: size, height: size, borderRadius: 999, boxShadow: `0 0 0 2px #fff, 0 0 0 3.5px ${BRAND.primary}`, flexShrink: 0 }}>
        <PhotoAvatar src={c.photo} size={size} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }} fallback={
          <PhotoAvatar src="/assets/avatars/avatar-child.png" size={size} style={{ background: `var(--color-interactives-avatar-${pal}-default)` }}
            fallback={<MascotChip species={c.avatar} color={c.color} size={size} bg={selectedBg} />} />} />
      </div>
    );
  };
  return (
    <div style={{ position: 'relative' }}>
      {/* the collapsed chip now names the child instead of relying on the page title
          or a memorized ring color to confirm who's selected — the switcher's whole
          job is identification, so it shouldn't require opening it to be sure. */}
      <button onClick={() => setOpen(o => !o)} aria-label={k.name} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', padding: '6px 12px 6px 8px', borderRadius: 999, boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        {kidFace(k, 32, BRAND.primaryLight)}
        <span style={{ fontSize: 13.5, fontWeight: 800, color: THEME.fg1 }}>{k.name}</span>
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
                  {kidFace(c, 30, on ? '#fff' : THEME.surface2)}
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
            <span style={{ width: 8, height: 8, borderRadius: 999, background: r.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: THEME.fg2, whiteSpace: 'nowrap' }}>{r.label.split(' ')[0]}</span>
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

// Icon/color per PARENT_ALERTS kind — mirrors ParentActivity's own KIND map (that one's
// module-private, so this is a small deliberate duplicate, same as this file's own RESP/SERIES
// palettes) so the alerts preview here reads visually identical to the full feed it links to.
const ALERT_KIND = {
  warning:    { icon: 'triangle-alert', bg: THEME.warningLight, fg: THEME.warning },
  ignored:    { icon: 'octagon-alert',  bg: THEME.dangerLight,  fg: THEME.danger },
  safe:       { icon: 'shield-check',   bg: THEME.successLight, fg: THEME.success },
  streak:     { icon: 'flame',          bg: THEME.goldLight,    fg: THEME.gold },
  device_off: { icon: 'wifi-off',       bg: THEME.surface2,     fg: THEME.fg2 },
  device_on:  { icon: 'wifi',           bg: THEME.surface2,     fg: THEME.fg2 },
  limited:    { icon: 'shield-alert',   bg: THEME.warningLight, fg: THEME.warning },
};

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

// "2026-07-21" → "Jul 21–27" / "7월 21일 – 27일" (cross-month ranges spell out both
// months). Used by the week switcher and anywhere copy names the report's date range.
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatWeekRange = (startISO, endISO, ko) => {
  const s = new Date(startISO + 'T00:00:00'), e = new Date(endISO + 'T00:00:00');
  const sameMonth = s.getMonth() === e.getMonth();
  if (ko) return sameMonth
    ? `${s.getMonth() + 1}월 ${s.getDate()}–${e.getDate()}일`
    : `${s.getMonth() + 1}월 ${s.getDate()}일 – ${e.getMonth() + 1}월 ${e.getDate()}일`;
  return sameMonth
    ? `${EN_MONTHS[s.getMonth()]} ${s.getDate()}–${e.getDate()}`
    : `${EN_MONTHS[s.getMonth()]} ${s.getDate()} – ${EN_MONTHS[e.getMonth()]} ${e.getDate()}`;
};

// ── Reports dashboard — clean analytics layout (numbers + gridded charts) ──
function ParentReports({ ctx, kpiStyle = 'cards', homeExtras = 'off', highlightStrip = 'on' }) {
  // which child's report is in view (header chip switches this)
  const [sel, setSel] = React.useState(0);
  const [respActive, setRespActive] = React.useState(null);   // selected day in the response-mix chart — null until a bar is tapped (tooltip is click-only)
  const [chatOpen, setChatOpen] = React.useState(false);       // "Ask about this week" drawer
  const [askedQ, setAskedQ] = React.useState([]);               // chatQuestions indices asked so far, in order — the running thread
  // which week of history is in view — 0 is always the current week, higher steps
  // backward. Reset on every child switch so it can't leave you looking at week n-3
  // for a kid whose history doesn't even go that far.
  const [weekIdx, setWeekIdx] = React.useState(0);
  React.useEffect(() => { setWeekIdx(0); }, [sel]);
  // [homeExtras] "Send a cheer" confirmation — local-only (no backend in this prototype,
  // same ADR-003 no-persist rule everything else here follows), resets when the child
  // switches so a cheer sent to Mina doesn't read as already-sent when you flip to Leo.
  const [cheerSent, setCheerSent] = React.useState(false);
  React.useEffect(() => { setCheerSent(false); }, [sel]);

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

  // first-run — no child added yet, so there's nothing to report on. Gated on the demo
  // flag itself (like `loading` above), not CHILDREN.length, so the Tweaks toggle can
  // preview it regardless of the prototype's seeded data.
  if (ctx.demo?.empty) {
    const ko = ctx.lang === 'ko';
    return (
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
        <ParentHead stacked sub={L("This week's progress")} title={L('Reports')} />
        <div style={{ padding: '8px 20px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: '#fff', borderRadius: 22, padding: '36px 24px', marginTop: 8 }}>
            <div style={{ width: 84, height: 84, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Icon name="line-chart" size={38} color={BRAND.primary} stroke={2} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: THEME.fg1 }}>{ko ? '아직 리포트가 없어요' : 'No reports yet'}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '8px 0 20px', maxWidth: 260 }}>
              {ko ? '자녀를 추가하면 걷기 활동과 경고 반응이 매주 리포트로 정리돼요.' : 'Add a child and their weekly walking activity and warning responses will show up here.'}
            </div>
            <button onClick={() => ctx.nav('p_addchild', { direct: true })} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: BRAND.primary, color: '#fff', border: 'none', borderRadius: 999, padding: '13px 24px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 800, cursor: 'pointer', boxShadow: BRAND.shadowPrimary }}>
              <Icon name="plus" size={16} color="#fff" stroke={2.6} />{ko ? '자녀 추가하기' : 'Add a child'}
            </button>
          </div>

          {/* same reassurance card Children shows — trust copy shouldn't wait for there to be data to show it around */}
          <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginTop: 14 }}>
            <Icon name="shield-check" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('Privacy first')}</div>
              <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{FEATURES.dangerZones ? L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.") : L("JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.")}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const child = CHILDREN[Math.min(sel, CHILDREN.length - 1)] || CHILDREN[0];
  const ko = ctx.lang === 'ko';
  // per-child report history — weeks[0] is always the current week, weeks[1..] step
  // backward (see buildWeeks in data.jsx). Falls back to a single-week shape for any
  // child missing report data, same as before the week switcher existed.
  const weeksList = CHILD_REPORTS[child.id]?.weeks;
  const clampedWeekIdx = weeksList ? Math.min(weekIdx, weeksList.length - 1) : 0;
  const rep = (weeksList && weeksList[clampedWeekIdx]) || CHILD_REPORTS[child.id] || {
    acceptance: PARENT_METRICS.acceptance, safeWalkMin: PARENT_METRICS.safeWalkMin,
    avgResponse: PARENT_METRICS.avgResponse, streak: child.streak || 0,
    deltas: { acceptance: '+6%', walk: '+12%', resp: '-0.3s', streak: '+2' },
    reactions: REACTIONS_7D, risk: RISK_TREND,
  };
  const reactions = rep.reactions, risk = rep.risk;
  // [homeExtras] 4-week trend — oldest→newest acceptance rate, so a parent can see the
  // trajectory in one glance instead of paging the week switcher back three times to
  // piece it together themselves. weeksList is already newest-first (see comment above).
  const trendWeeks = weeksList && weeksList.length > 1 ? weeksList.slice().reverse() : null;
  // [homeExtras] Riskiest rule window — which of this child's own schedule windows
  // (School commute / After school / Playground / At home) their warning & ignored
  // events cluster in, computed from PARENT_ALERTS' `window` tag (see data.jsx). Tells a
  // parent WHICH rule to tighten instead of just how many warnings happened overall.
  const riskWindow = (() => {
    const tally = {};
    PARENT_ALERTS.filter(a => a.child === child.id && (a.kind === 'warning' || a.kind === 'ignored') && a.window)
      .forEach(a => { tally[a.window] = (tally[a.window] || 0) + 1; });
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return entries.length ? { label: entries[0][0], count: entries[0][1] } : null;
  })();
  // the range/label copy leans on — "this week" when weekIdx is 0, the concrete
  // date range otherwise, so a parent browsing history never reads a stale "this week".
  const isCurrentWeek = clampedWeekIdx === 0;
  const weekRangeLabel = rep.start && rep.end ? formatWeekRange(rep.start, rep.end, ko) : null;
  const weekLabel = isCurrentWeek ? (ko ? '이번 주' : 'this week') : (weekRangeLabel || (ko ? '그 주' : 'that week'));

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

  // top KPI cards. Counts, not percentages — the response-mix chart further down
  // already shows this same split as a %, so repeating it here just makes the
  // parent reconcile two numbers for one fact. A raw count ("44 of 47 warnings")
  // is a different, complementary read instead of a duplicate one.
  // "Ignored" reads off the same week of reactions as the donut/bars below
  // (ignoredTotal), not a separate stat — so this card and "How they respond to
  // warnings" can never drift apart. There's no last-week ignored count to diff
  // against, so unlike the other KPI cards this one has no delta/trend badge —
  // that's better than a fabricated one.
  const stoppedCount = stopsTotal + delayedTotal;
  const kpiSub = ko ? `${weekLabel} 경고 ${totalReacts}건 중` : `out of ${totalReacts} warnings ${weekLabel}`;
  // Two more cards beyond the response split — safe walking time and streak are
  // both already tracked (see gridStats below, and `deltas.walk`/`deltas.streak`
  // in data.jsx) but previously only surfaced in the 'ring' Tweaks variant. They
  // round the grid out to a 2×2 that covers response, time-on-task and consistency,
  // not just one axis of the week.
  const kpis = [
    { img: '/assets/reports/icon-stopped.png', v: stoppedCount, delta: rep.deltas?.acceptance, l: 'Stopped when warned', sub: kpiSub, c: THEME.success },
    { img: '/assets/reports/icon-ignored.png', v: ignoredTotal, l: 'Ignored', sub: kpiSub, c: THEME.danger },
    { img: '/assets/reports/icon-walking.png', v: rep.safeWalkMin + 'm', delta: rep.deltas?.walk, l: 'Safe walking', sub: ko ? `${weekLabel} 총 시간` : `total ${weekLabel}`, c: THEME.mountain },
    {
      img: '/assets/reports/icon-streak.png', v: rep.streak + 'd', delta: rep.deltas?.streak, l: 'Safe streak', sub: ko ? '연속 목표 달성' : 'days in a row', c: THEME.gold,
      // [homeExtras] personal-best badge — child.bestStreak is a tracked record distinct
      // from the current streak, so this reads "new record" only when actually true, and
      // "best: Nd" as a quiet target the rest of the time — never a fabricated "beat it!".
      badge: homeExtras === 'on' ? (rep.streak >= child.bestStreak ? (ko ? '🏆 최고 기록!' : '🏆 New best!') : (ko ? `최고 ${child.bestStreak}일` : `Best: ${child.bestStreak}d`)) : null,
    },
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
    { v: rep.acceptance + '%', l: 'Stopped when warned', c: SERIES.rate },
  ];
  // activity-card footer: a small at-a-glance read of the week's chart —
  // which day drew the most safe stops, and which had the most risky moments.
  const stopsByDay = reactions.map(d => d.immediate);
  const bestDayIdx = stopsByDay.indexOf(Math.max(...stopsByDay));
  const riskiestIdx = risk.indexOf(Math.max(...risk));
  const activityFoot = [
    { l: ko ? '가장 안전한 날' : 'Safest day', v: dayName(bestDayIdx), c: SERIES.trend },
    { l: ko ? '주의가 많던 날' : 'Most alerts', v: dayName(riskiestIdx), c: '#8fb0dd' },
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
        ? `${weekLabel} 경고 ${totalReacts}건 중 ${stopsTotal + delayedTotal}건에서 멈췄어요 — 수용률 ${rep.acceptance}%${rep.deltas ? ` (지난주보다 ${rep.deltas.acceptance})` : ''}. 그중 ${stopsTotal}건은 즉시 멈춤이었어요.`
        : `Out of ${totalReacts} warnings ${weekLabel}, ${nm} stopped for ${stopsTotal + delayedTotal} of them — an acceptance rate of ${rep.acceptance}%${rep.deltas ? ` (${rep.deltas.acceptance} vs the week before)` : ''}. ${stopsTotal} of those were immediate stops.`,
    },
    {
      icon: 'flame', c: THEME.joy, bg: THEME.joyBg,
      q: ko ? '안전 연속 기록은 무슨 뜻인가요?' : 'What does the safe streak mean?',
      a: ko
        ? `${nm}는 ${rep.streak}일 연속 하루 안전 목표를 지켰어요${rep.deltas ? ` (지난주보다 ${rep.deltas.streak})` : ''}. 위험한 순간 없이 하루를 마치면 기록이 이어져요.`
        : `${nm} has kept a ${rep.streak}-day streak of hitting the daily safety goal${rep.deltas ? ` (${rep.deltas.streak} vs the week before)` : ''}. It continues each day they finish with no risky moments.`,
    },
    {
      icon: 'lightbulb', c: tone.icon, bg: tone.bg,
      q: ko ? '뭘 도와주면 될까요?' : 'What should I help with?',
      a: t.insightBody,
    },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead stacked sub={isCurrentWeek ? L("This week's progress") : (ko ? `${weekRangeLabel} 진행 상황` : `${weekRangeLabel} progress`)} title={<span>{nm} <span style={{ fontSize: 19 }}>{doingWell ? '🌱' : '💪'}</span></span>} right={<ChildChip selected={sel} onPick={setSel} />} />
      <div style={{ padding: '8px 20px 0' }}>

        {/* [homeExtras] Other kids at a glance — a faster path than opening the switcher
            dropdown when you just want to eyeball how everyone's doing, not necessarily
            switch. Each chip still switches on tap, same as a dropdown row would. */}
        {homeExtras === 'on' && CHILDREN.length > 1 && (
          <div className="no-sb" style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto' }}>
            {CHILDREN.map((c, i) => {
              if (i === Math.min(sel, CHILDREN.length - 1)) return null;
              const r = (CHILD_REPORTS[c.id]?.weeks?.[0]) || CHILD_REPORTS[c.id];
              const acc = r?.acceptance ?? PARENT_METRICS.acceptance;
              const pal = avatarPalFor(c.id);
              return (
                <button key={c.id} onClick={() => setSel(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: 'none', borderRadius: 999, padding: '6px 13px 6px 6px', flexShrink: 0, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <PhotoAvatar src={c.photo} size={28} style={{ borderRadius: 999, background: `var(--color-interactives-avatar-${pal}-default)` }}
                    fallback={<PhotoAvatar src="/assets/avatars/avatar-child.png" size={28} style={{ borderRadius: 999, background: `var(--color-interactives-avatar-${pal}-default)` }}
                      fallback={<MascotChip species={c.avatar} color={c.color} size={28} bg={THEME.surface2} />} />} />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg1, lineHeight: 1.15 }}>{c.name}</div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: acc >= 75 ? THEME.success : THEME.gold, lineHeight: 1.2, marginTop: 1 }}>{acc}%</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Week switcher — the report's actual date range, with chevrons to step
            through this child's history. weekIdx 0 is always "now"; a parent has no
            other way to tell which 7 days the numbers below describe, or to look back. */}
        {weeksList && weeksList.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, marginBottom: 14 }}>
            <button onClick={() => setWeekIdx(i => Math.min(weeksList.length - 1, i + 1))} disabled={clampedWeekIdx >= weeksList.length - 1} aria-label={ko ? '이전 주' : 'Previous week'}
              style={{ width: 40, borderRadius: 14, border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: clampedWeekIdx >= weeksList.length - 1 ? 'default' : 'pointer', opacity: clampedWeekIdx >= weeksList.length - 1 ? .35 : 1, boxShadow: THEME.shadowCard }}>
              <Icon name="chevron-left" size={17} color={THEME.fg2} stroke={2.4} />
            </button>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', borderRadius: 14, padding: '7px 14px', boxShadow: THEME.shadowCard }}>
              <Icon name="calendar" size={13} color={THEME.fg2} stroke={2.3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{weekRangeLabel}</span>
              {isCurrentWeek && <span style={{ fontSize: 10, fontWeight: 800, color: BRAND.primary, background: BRAND.primaryLight, borderRadius: 999, padding: '2px 7px', flexShrink: 0 }}>{ko ? '이번 주' : 'Now'}</span>}
            </div>
            <button onClick={() => setWeekIdx(i => Math.max(0, i - 1))} disabled={clampedWeekIdx === 0} aria-label={ko ? '다음 주' : 'Next week'}
              style={{ width: 40, borderRadius: 14, border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: clampedWeekIdx === 0 ? 'default' : 'pointer', opacity: clampedWeekIdx === 0 ? .35 : 1, boxShadow: THEME.shadowCard }}>
              <Icon name="chevron-right" size={17} color={THEME.fg2} stroke={2.4} />
            </button>
          </div>
        )}

        {/* Highlight strip — the one-line "so, how's the week going?" the header used to
            leave blank. Tone-aware: a warm-green win when the child is trending well, a
            soft amber nudge when it needs a look. No "AI" badge here — that tag stays on
            ParentAIReport's own hero, where it labels a whole page of generated narrative;
            slapping it on every rule-based blurb waters it down. This card is still a plain-
            language read of the numbers below it though, so tapping it opens the same AI
            Assistant the floating button does — same destination, same result-first chat —
            rather than Rules & settings, which nothing about this card was actually about. */}
        {highlightStrip === 'on' && (
          <button onClick={() => homeExtras === 'on' ? ctx.nav('p_aireport', { childId: child.id }) : (setChatOpen(true), setAskedQ([]))} aria-label={ko ? 'AI 어시스턴트' : 'AI Assistant'}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: tone.bg, borderRadius: 18, padding: '12px 14px', marginBottom: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ width: 42, height: 42, flexShrink: 0, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, lineHeight: 1 }}>{doingWell ? '🎉' : '👀'}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: tone.ink, letterSpacing: '-0.2px' }}>
                {doingWell
                  ? (isCurrentWeek ? (ko ? `이번 주, 좋은 흐름이에요` : `On a roll this week`) : (ko ? `${weekRangeLabel}, 좋은 흐름이었어요` : `On a roll ${weekRangeLabel}`))
                  : (isCurrentWeek ? (ko ? `조금만 더 도와주면 돼요` : `Could use a nudge this week`) : (ko ? `${weekRangeLabel}엔 도움이 필요했어요` : `Could've used a nudge ${weekRangeLabel}`))}
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: tone.ink, opacity: .82, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ko
                  ? `위험 순간 ${riskReduction >= 0 ? '↓' : '↑'}${Math.abs(riskReduction)}% · 안전 멈춤 ${stopsTotal}회 · 수용 ${rep.acceptance}%`
                  : `Risky moments ${riskReduction >= 0 ? '↓' : '↑'}${Math.abs(riskReduction)}% · ${stopsTotal} safe stops · ${rep.acceptance}% accepted`}
              </div>
            </div>
            <Icon name="chevron-right" size={18} color={tone.ink} stroke={2.4} style={{ opacity: .55, flexShrink: 0 }} />
          </button>
        )}

        {/* Live status — "is protection on right now", the one thing on this screen that's
            true as of this moment rather than a weekly retrospective. Sits below the
            highlight strip: header → date range → "how's the week going" → "is it actually
            working right now" → the numbers. Taps through to the device list (Children).
            One card, one thin divider between the status row and the permission row (not
            two nested colored boxes) — matches how the response-mix and recent-alerts cards
            below use dividers between sections rather than stacking blocks. The permission
            row reads the same onboarding-consent data Children already shows (cfg.grants) —
            a missing permission silently limits warnings, which matters just as much as
            "online" does to whether protection is actually working, so it's one tap away
            instead of requiring a trip to a different tab to discover. */}
        {(() => {
          const grants = child.cfg?.grants || Object.fromEntries(PERMISSIONS.map(p => [p.id, true]));
          const consentOff = PERMISSIONS.filter(p => !grants[p.id]).length;
          const allConsented = consentOff === 0;
          return (
            <div style={{ background: '#fff', borderRadius: 18, padding: '13px 15px', marginBottom: 14 }}>
              <button onClick={() => ctx.nav('p_children')} aria-label={L('Children')}
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 999, background: child.online ? THEME.successLight : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* link-2, not shield-check — shield is reserved for the permission row
                      below, so an online + fully-consented child doesn't show the same icon
                      twice in one card. Matches ParentChildren's own online/offline glyph. */}
                  <Icon name={child.online ? 'link-2' : 'link-2-off'} size={18} color={child.online ? THEME.success : THEME.fg3} stroke={2.3} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.fg1 }}>
                    {child.online ? (ko ? '지금 보호 중이에요' : 'Protection is active') : (ko ? '기기가 오프라인이에요' : 'Device is offline')}
                  </div>
                  <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {child.device} · {child.online ? L('Connected') : L('Open to connect')}
                  </div>
                </div>
                {child.online && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Icon name="battery-medium" size={14} color={child.battery < 50 ? THEME.warning : THEME.fg2} stroke={2.3} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2 }}>{child.battery}%</span>
                  </span>
                )}
              </button>
              <button onClick={() => ctx.nav('p_settings', { child })} aria-label={L('Rules & settings')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginTop: 11, paddingTop: 11, border: 'none', borderTop: `1px solid ${THEME.border}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <Icon name={allConsented ? 'shield-check' : 'shield-alert'} size={14} color={allConsented ? THEME.success : THEME.warning} stroke={2.3} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: allConsented ? THEME.success : THEME.warning }}>
                  {allConsented
                    ? (ko ? '온보딩 동의 모두 완료' : 'All setup permissions on')
                    : (ko ? `온보딩 ${consentOff}개 미동의 · 안전 경고 제한` : `${consentOff} setup permission${consentOff > 1 ? 's' : ''} off · warnings limited`)}
                </span>
                <Icon name="chevron-right" size={13} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
              </button>
            </div>
          );
        })()}

        {/* [homeExtras] 4-week trend + "send a cheer" — one compact row rather than two more
            full cards. The sparkline answers "is this really improving" without paging the
            week switcher three times; the cheer button is the one action on this whole screen
            that talks back to the child instead of just reporting on them. Local-only state
            (no backend), matching this prototype's no-persist rule elsewhere. */}
        {homeExtras === 'on' && trendWeeks && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: '13px 15px', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .3 }}>{ko ? '4주 추이 · 수용률' : '4-week trend · acceptance'}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 6 }}>
                <svg width={92} height={30} viewBox="0 0 92 30" style={{ flexShrink: 0, overflow: 'visible' }}>
                  <polyline points={trendWeeks.map((w, i) => `${(i / (trendWeeks.length - 1)) * 84 + 4},${28 - (w.acceptance / 100) * 24}`).join(' ')} fill="none" stroke={BRAND.primary} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  {trendWeeks.map((w, i) => {
                    const last = i === trendWeeks.length - 1;
                    return <circle key={i} cx={(i / (trendWeeks.length - 1)) * 84 + 4} cy={28 - (w.acceptance / 100) * 24} r={last ? 3.4 : 2.2} fill={last ? BRAND.primary : '#fff'} stroke={BRAND.primary} strokeWidth={last ? 0 : 1.6} />;
                  })}
                </svg>
                <span style={{ fontSize: 19, fontWeight: 800, color: THEME.fg1, lineHeight: 1 }}>{trendWeeks[trendWeeks.length - 1].acceptance}%</span>
              </div>
            </div>
            <button onClick={() => setCheerSent(true)} disabled={cheerSent} aria-label={ko ? '응원 보내기' : 'Send encouragement'}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: cheerSent ? THEME.successLight : '#fff', border: `1.5px solid ${cheerSent ? 'transparent' : THEME.border}`, borderRadius: 999, padding: '9px 14px', fontFamily: 'inherit', cursor: cheerSent ? 'default' : 'pointer', flexShrink: 0 }}>
              <span style={{ fontSize: 15, lineHeight: 1 }}>{cheerSent ? '✅' : '🎉'}</span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: cheerSent ? THEME.success : THEME.fg1, whiteSpace: 'nowrap' }}>
                {cheerSent ? (ko ? '응원 보냄' : 'Sent!') : (ko ? '응원 보내기' : 'Send cheer')}
              </span>
            </button>
          </div>
        )}

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
                  <img src={k.img} alt="" width={27} height={27} style={{ display: 'block', flexShrink: 0 }} />
                  {k.delta && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 700, color: k.good ? THEME.success : THEME.danger }}>{k.delta}<Icon name={k.good ? 'trending-up' : 'trending-down'} size={11} color={k.good ? THEME.success : THEME.danger} stroke={2.6} /></span>}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1, color: k.c, marginTop: 10 }}>{k.v}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L(k.l)}</div>
                {k.sub && <div style={{ fontSize: 10.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{k.sub}</div>}
                {k.badge && <div style={{ fontSize: 10.5, color: THEME.gold, fontWeight: 800, marginTop: 4 }}>{k.badge}</div>}
              </div>
            ))}
          </div>
        )}

        {/* [homeExtras] Recent alerts — the KPI grid says "3 ignored"; this says when and
            where, which is what a parent actually needs to bring up with their kid. Reads
            straight off PARENT_ALERTS (same source as the full Activity feed this links to),
            filtered to the selected child, newest first. Each row also names the rule window
            (School commute / After school / …) it happened in when one's tagged, and the
            footer surfaces the riskWindow aggregate computed above — not more hardcoded
            flavor text, an actual tally over this child's own alerts. */}
        {homeExtras === 'on' && (() => {
          const childAlerts = PARENT_ALERTS.filter(a => a.child === child.id).slice(0, 3);
          if (!childAlerts.length) return null;
          return (
            <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon name="bell" size={17} color={THEME.fg2} stroke={2.2} />
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{ko ? '최근 알림' : 'Recent alerts'}</div>
                </div>
                <button onClick={() => ctx.nav('p_activity')} aria-label={ko ? '전체 보기' : 'See all'} style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></button>
              </div>
              <div style={{ marginTop: 10 }}>
                {childAlerts.map((a, i) => {
                  const k = ALERT_KIND[a.kind] || ALERT_KIND.safe;
                  return (
                    <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 0', borderTop: i === 0 ? 'none' : `1px solid ${THEME.border}` }}>
                      <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 999, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name={k.icon} size={16} color={k.fg} stroke={2.3} />
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(a.title)}</div>
                        <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(a.sub)}{a.window ? ` · ${L(a.window)}` : ''}</div>
                      </div>
                      <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, flexShrink: 0 }}>{L(a.time)}</span>
                    </div>
                  );
                })}
              </div>
              {riskWindow && (
                <button onClick={() => ctx.nav('p_settings', { child })} aria-label={L('Rules & settings')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: 'none', border: 'none', borderTop: `1px solid ${THEME.border}`, marginTop: 6, paddingTop: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <Icon name="clock" size={15} color={THEME.warning} stroke={2.3} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: THEME.fg2, fontWeight: 600, lineHeight: 1.4 }}>
                    {ko
                      ? <span>위험 순간은 주로 <b style={{ color: THEME.fg1 }}>{L(riskWindow.label)}</b> 시간대에 나타나요</span>
                      : <span>Risky moments cluster during <b style={{ color: THEME.fg1 }}>{L(riskWindow.label)}</b></span>}
                  </span>
                  <Icon name="chevron-right" size={15} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
                </button>
              )}
            </div>
          );
        })()}

        {/* response mix card — per-series stats up top, a right %-axis chart with dashed
            gridlines and connected rounded bars, and a bottom insight (reference layout) */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {/* shield-alert over a plain warning glyph — this card is the RESPONSE to a
                  safety warning, not the warning itself, and "shield" already reads as
                  JoanX's own safety mark elsewhere on this screen (shield-check on the
                  "Safe stops" KPI) — so it ties back to that vocabulary instead of
                  introducing an unrelated warning-sign icon. */}
              <Icon name="shield-alert" size={17} color={THEME.fg2} stroke={2.2} />
              <div style={{ fontSize: 15, fontWeight: 800 }}>{t.respTitle}</div>
            </div>
            <button onClick={() => ctx.nav('p_response', { childId: child.id })} aria-label={t.respTitle} style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', padding: 0, cursor: 'pointer' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></button>
          </div>

          {/* per-series summary — dot + label + the week's share, plus a one-line
              definition (same copy ParentResponseDetail already uses for these three
              terms) so "Immediate / Delayed / Ignored" doesn't require a trip to the
              detail page just to know what they mean. */}
          <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
            {[
              { label: 'Immediate', c: RESP.immediate, val: stopsTotal, desc: ko ? '경고와 동시에 바로 멈췄어요' : 'Stopped the moment they were warned' },
              { label: 'Delayed',   c: RESP.delayed,   val: delayedTotal, desc: ko ? '경고 후 잠시 뒤에 멈췄어요' : 'Stopped, but a moment later' },
              { label: 'Ignored',   c: RESP.ignored,   val: ignoredTotal, desc: ko ? '경고에도 계속 걸었어요' : 'Kept walking despite the warning' },
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
                  <div style={{ fontSize: 10.5, color: THEME.fg3, fontWeight: 600, marginTop: 3, lineHeight: 1.3 }}>{s.desc}</div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon name="calendar-days" size={17} color={THEME.fg2} stroke={2.2} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>{L('Weekly activity')}</span>
            </div>
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
          <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={Math.ceil(riskMax / 2) * 2} yStep={2} barW={14} />
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

      {/* floating "AI Assistant" button — a guided chat, not a straight jump to a static
          report: it's a conversation (canned Q&A for now, no live LLM call in this
          prototype) so a parent can ask a follow-up instead of only reading one fixed
          page. Opens straight into a result rather than an empty question-picker — the
          drawer greets you, then leads with the assistant's own summary (risk-moments
          trend, the one with the chart), not a fake pre-asked question; the other three
          questions stay below as follow-ups. [homeExtras] additionally offers the fuller AI
          report screen (ParentAIReport) as the destination instead — that page still exists and is
          still reachable, just not what this button opens by default anymore. */}
      <button onClick={() => homeExtras === 'on' ? ctx.nav('p_aireport', { childId: child.id }) : (setChatOpen(true), setAskedQ([]))} aria-label={ko ? 'AI 어시스턴트' : 'AI Assistant'}
        style={{ position: 'fixed', right: 20, bottom: 104, height: 38, padding: '0 16px 0 12px', borderRadius: 999, border: 'none', cursor: 'pointer', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', gap: 6, zIndex: 45 }}>
        <Icon name="sparkles" size={16} color="#fff" stroke={2.2} />
        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{ko ? 'AI 어시스턴트' : 'AI Assistant'}</span>
      </button>

      {chatOpen && (
        <div className="no-sb jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 90, overflowY: 'auto', paddingTop: 50, paddingBottom: 30, background: screenBgFor(BRAND.primary) }}>
          <ParentHead onBack={() => setChatOpen(false)} title={ko ? `${nm}의 한 주에 대해 물어보세요` : `Ask about ${nm}'s week`} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '10px 20px 4px' }}>
            {/* bot greeting */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <ChatAvatar />
              <div style={{ maxWidth: '86%', background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.5, fontWeight: 500 }}>
                {ko ? `안녕하세요! ${nm}의 ${weekLabel}을 살펴봤어요.` : `Hi! I took a look at ${nm}'s ${isCurrentWeek ? 'week' : `week of ${weekRangeLabel}`}.`}
              </div>
            </div>

            {/* lead AI summary — chatQuestions[0]'s content, shown proactively rather than
                as a fake "you asked this" exchange. Earlier this was faked via a pre-filled
                askedQ, which rendered a right-aligned bubble in the "sent by you" color as
                if the parent had typed it — misleading, since they never did. This is just
                the assistant talking, unprompted, the same way the greeting above is. */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <ChatAvatar />
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ maxWidth: '86%', background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.55, fontWeight: 500 }}>
                  {chatQuestions[0].a}
                </div>
                <div style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 16, padding: 12 }}>
                  <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={Math.ceil(riskMax / 2) * 2} yStep={2} barW={14} height={130}
                    tooltip={(d, i) => ({ title: dayName(i), rows: [{ label: L('Risky moments'), value: d.risk, color: '#bdd2ee' }, { label: L('Safe stops'), value: d.stops, color: SERIES.trend }] })} />
                </div>
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

            {/* suggested-question badges — only the ones not asked yet, chip-style like a chat suggestion row.
                Excludes index 0 permanently (not just while unasked) — it's already shown above as the
                lead summary, so leaving it in the chip row would let a parent tap it and see the exact
                same content appear twice. */}
            {(() => {
              const remaining = chatQuestions.map((cq, i) => ({ ...cq, i })).filter(cq => cq.i !== 0 && !askedQ.includes(cq.i));
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
