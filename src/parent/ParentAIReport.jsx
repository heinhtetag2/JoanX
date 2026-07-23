// JoanX — parent app · ParentAIReport

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Badge, Bar, Icon, PhotoAvatar, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip } from '../core/characters.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── AI parent report (F-31) — natural-language read of the selected child's
// week. Reads per-child data (CHILD_REPORTS, chosen via the Reports chip) and
// adapts both tone and language, so switching to a struggling child changes the
// narrative — it never hard-codes one child.
//
// Verdict-first layout: a busy parent lands on the plain-language conclusion +
// the one hero number FIRST (not a paragraph), then reads the narrative with the
// figures they care about emphasised inline, then gets ONE thing to try this
// week highlighted above the rest. The takeaway does the work at a glance; the
// detail rewards the parent who keeps reading.

// mark a token for inline emphasis inside the narrative
const E = (v) => ({ e: v });

// render an array of strings + E(...) markers as a paragraph, bolding the marks
function Narrative({ parts, color }) {
  return (
    <div style={{ fontSize: 13.5, color: THEME.fg1, lineHeight: 1.7 }}>
      {parts.map((p, i) => typeof p === 'string'
        ? <React.Fragment key={i}>{p}</React.Fragment>
        : <b key={i} style={{ fontWeight: 800, color }}>{p.e}</b>)}
    </div>
  );
}

function ParentAIReport({ ctx }) {
  const ko = getLang() === 'ko';
  const child = CHILDREN.find(c => c.id === ctx.params?.childId) || CHILDREN[0];
  const rep = CHILD_REPORTS[child.id] || {
    acceptance: PARENT_METRICS.acceptance, safeWalkMin: PARENT_METRICS.safeWalkMin,
    avgResponse: PARENT_METRICS.avgResponse, streak: child.streak || 0,
    deltas: { acceptance: '+6%', walk: '+12%', resp: '-0.3s', streak: '+2' },
    reactions: REACTIONS_7D, risk: RISK_TREND,
  };
  const nm = child.name;
  const risk = rep.risk || RISK_TREND;
  const first = risk[0], last = risk[risk.length - 1];
  // reduction rate from the risk trend (start-of-week baseline vs latest) — matches ParentReports
  const base3 = risk.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const recent3 = risk.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const reduction = base3 > 0 ? Math.round(((base3 - recent3) / base3) * 100) : 0;
  const doingWell = rep.acceptance >= 75 && reduction > 0;

  // The verdict hero — tone, the one hero stat, and the plain-language conclusion.
  // Green + reduction% when the habit is forming; amber + acceptance% when it needs
  // a nudge. The stat is the single number a parent should walk away remembering.
  const tone = doingWell
    ? { bg: THEME.successLight, ink: '#274427', accent: THEME.success,
        stat: `${reduction}%`, statLabel: ko ? '첫 주보다 안전' : 'safer than week 1', bar: Math.min(100, Math.max(reduction, 4)) }
    : { bg: THEME.goldLight, ink: '#5b4a1e', accent: THEME.gold,
        stat: `${rep.acceptance}%`, statLabel: ko ? '경고에 멈춰요' : 'warnings heeded', bar: rep.acceptance };
  const verdict = doingWell
    ? (ko ? `${nm}는 더 안전해지고 있어요` : `${nm} is getting safer`)
    : (ko ? `아직 습관을 만들어가는 중이에요` : `Still building ${nm}'s habit`);
  const takeaway = doingWell
    ? (ko ? '좋은 습관이 자리잡고 있어요.' : 'A good habit is taking hold.')
    : (ko ? '함께 조금씩 만들어가요.' : "Let's build it together.");

  // The narrative — same read as before, but as segments so the figures a parent
  // scans for (counts, %, seconds) are bold + tone-coloured instead of buried.
  const summaryParts = doingWell
    ? (ko
      ? [`이번 주 ${nm}는 확실히 더 안전한 걷기 습관을 만들고 있어요. 하루 위험한 폰 사용 순간이 `, E(`${first}회`), `에서 `, E(`${last}회`), `로 줄어, 첫 주보다 약 `, E(`${reduction}%`), ` 감소했어요. 이제 경고의 `, E(`${rep.acceptance}%`), `에서 멈추고, 평균 반응 시간은 `, E(`${rep.avgResponse}초`), `예요. 아침이 가장 안전한 시간대이고, 남은 위험은 대부분 하교길에 나타나요.`]
      : [`This week ${nm} is clearly building a safer walking habit. Daily risky phone-use moments fell from `, E(`${first}`), ` to `, E(`${last}`), ` — about `, E(`${reduction}% fewer`), ` than the first week. ${nm} now stops for `, E(`${rep.acceptance}%`), ` of warnings, reacting in `, E(`${rep.avgResponse}s`), ` on average. Mornings are the strongest window; most remaining risks show up on the after-school walk.`])
    : (ko
      ? [`이번 주 ${nm}는 아직 안전한 걷기 습관을 만들어가는 중이에요. 하루 위험한 순간이 눈에 띄게 줄지 않았고, 경고 수용률은 `, E(`${rep.acceptance}%`), `, 평균 반응 시간은 `, E(`${rep.avgResponse}초`), `예요. 함께 규칙을 살펴보고 하교길을 특히 신경 써 보세요.`]
      : [`This week ${nm} is still forming the habit. Daily risky moments haven't dropped much yet, warning acceptance is `, E(`${rep.acceptance}%`), `, and average reaction time is `, E(`${rep.avgResponse}s`), `. Reviewing the rules together — especially the after-school walk — would help.`]);

  const improving = doingWell ? [
    { icon: 'timer', t: ko ? '더 빠른 반응' : 'Faster reactions', s: ko ? `평균 ${rep.avgResponse}초 — 지난주보다 ${rep.deltas.resp} 빨라졌어요.` : `Now ${rep.avgResponse}s on average — ${rep.deltas.resp} from last week.` },
    { icon: 'trending-down', t: ko ? '줄어든 위험 순간' : 'Fewer risky moments', s: ko ? `하루 ${first} → ${last}회로 감소.` : `${first} → ${last} per day across the week.` },
    { icon: 'footprints', t: ko ? '늘어난 안전 걷기' : 'More safe walking', s: ko ? `이번 주 안전 걷기 ${rep.safeWalkMin}분 (${rep.deltas.walk}).` : `${rep.safeWalkMin} safe minutes this week (${rep.deltas.walk}).` },
  ] : [
    { icon: 'timer', t: ko ? '반응 시간' : 'Reaction time', s: ko ? `평균 ${rep.avgResponse}초 (${rep.deltas.resp}).` : `${rep.avgResponse}s on average (${rep.deltas.resp}).` },
    { icon: 'shield-alert', t: ko ? '경고 수용률' : 'Warning acceptance', s: ko ? `경고의 ${rep.acceptance}%에서 멈춰요 (${rep.deltas.acceptance}).` : `Stops for ${rep.acceptance}% of warnings (${rep.deltas.acceptance}).` },
    { icon: 'footprints', t: ko ? '안전 걷기' : 'Safe walking', s: ko ? `이번 주 ${rep.safeWalkMin}분 (${rep.deltas.walk}).` : `${rep.safeWalkMin} minutes this week (${rep.deltas.walk}).` },
  ];

  const actions = doingWell ? [
    { icon: 'map-pin', t: ko ? '하교길 이야기 나누기' : 'Talk about the after-school walk', s: ko ? '경고 대부분이 오후 3시경 오크 거리 근처예요. 가벼운 대화가 도움돼요.' : 'Most warnings happen near Oak St. around 3pm. A gentle check-in helps.' },
    { icon: 'sun', t: ko ? '아침 루틴 유지하기' : 'Keep the morning routine', s: ko ? '아침 등굣길은 거의 위험이 없어요 — 지금처럼 이어가요.' : 'The morning commute is nearly risk-free — keep it up.' },
    { icon: 'flame', t: ko ? '연속 기록 축하하기' : 'Celebrate the streak', s: ko ? `${nm}는 ${rep.streak}일 연속 안전 기록 중이에요. 소리 내어 칭찬해 주세요.` : `${nm} is on a ${rep.streak}-day safe streak. Naming it out loud reinforces the habit.` },
  ] : [
    { icon: 'list-checks', t: ko ? '규칙 함께 살펴보기' : 'Review the rules together', s: ko ? '경고 민감도와 걷는 시간대를 함께 확인해 보세요.' : 'Go over warning sensitivity and walking times together.' },
    { icon: 'map-pin', t: ko ? '하교길에 집중하기' : 'Focus on the after-school walk', s: ko ? '위험 순간이 오후에 집중돼요. 그 시간대를 함께 이야기해요.' : 'Risky moments cluster in the afternoon — talk through that window.' },
    { icon: 'heart', t: ko ? '작은 진전도 응원하기' : 'Cheer small wins', s: ko ? '작은 향상도 알아채고 격려하면 습관이 자라요.' : 'Noticing small improvements out loud helps the habit grow.' },
  ];
  const [primaryAction, ...restActions] = actions;   // feature the first, list the rest

  const tHead = { improving: ko ? '나아지고 있어요' : "What's improving", tryAtHome: ko ? '집에서 해보세요' : 'Try this at home' };
  const pal = child.avatar || 'fox';

  const eyebrow = { fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={ko ? `이번 주 · ${nm}` : `This week · ${nm}`} title={L('AI Safety Report')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* verdict hero — the conclusion + the one hero stat, before any prose */}
        <div style={{ background: tone.bg, borderRadius: 22, padding: 18, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <PhotoAvatar src={child.photo} size={46} style={{ flexShrink: 0, background: `var(--color-interactives-avatar-${pal}-default)` }}
              fallback={<MascotChip species={pal} color={child.color} size={46} />} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 16.5, fontWeight: 800, color: tone.ink, lineHeight: 1.25 }}>{verdict}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: tone.ink, opacity: .78, marginTop: 2 }}>{takeaway}</div>
            </div>
            <Badge variant="primary" style={{ alignSelf: 'flex-start', flexShrink: 0 }}>AI</Badge>
          </div>
          {/* the hero number — big, in the game font, with a progress bar under it */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 16 }}>
            <span className="game-font" style={{ fontSize: 40, fontWeight: 500, color: tone.ink, lineHeight: .85 }}>{tone.stat}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: tone.ink, opacity: .85, marginBottom: 5 }}>{tone.statLabel}</span>
          </div>
          <div style={{ marginTop: 12 }}>
            <Bar value={tone.bar} max={100} color={tone.accent} track="rgba(255,255,255,.6)" height={7} />
          </div>
        </div>

        {/* the narrative — the coach's read, key figures emphasised inline */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 10, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="sparkles" size={16} color="#fff" stroke={2.3} /></div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{ko ? `${nm}의 한 주` : `${nm}'s week`}</span>
          </div>
          <Narrative parts={summaryParts} color={tone.accent} />
        </div>

        {/* what's improving */}
        <div style={eyebrow}>{tHead.improving}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {improving.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={THEME.success} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{it.t}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        {/* try this at home — the first suggestion is featured as the one thing to start with */}
        <div style={eyebrow}>{tHead.tryAtHome}</div>
        <div style={{ background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginBottom: restActions.length ? 10 : 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 9 }}>
            <Icon name="star" size={13} color={BRAND.primary} fill={BRAND.primary} stroke={0} />
            <span style={{ fontSize: 10.5, fontWeight: 800, color: BRAND.primary, textTransform: 'uppercase', letterSpacing: .5 }}>{ko ? '이번 주 우선' : 'Start here'}</span>
          </div>
          <div style={{ display: 'flex', gap: 13, alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={primaryAction.icon} size={19} color={BRAND.primary} stroke={2.3} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: BRAND.primaryDark }}>{primaryAction.t}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.45 }}>{primaryAction.s}</div>
            </div>
          </div>
        </div>
        {restActions.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 16, overflow: 'hidden' }}>
            {restActions.map((it, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={BRAND.primary} stroke={2.3} /></div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{it.t}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1, lineHeight: 1.4 }}>{it.s}</div></div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}>
          <Icon name="sparkles" size={12} color={THEME.fg3} stroke={2.2} />
          {L('AI-generated from this week’s activity. It summarizes behavior trends — it never shares raw locations or messages.')}
        </div>
      </div>
    </div>
  );
}

export { ParentAIReport };
