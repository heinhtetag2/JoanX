// JoanX — parent app · ParentAIReport

import React from 'react';
import { CHILDREN, CHILD_REPORTS, PARENT_METRICS, REACTIONS_7D, RISK_TREND } from '../core/data.jsx';
import { Badge, Icon, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// ── AI parent report (F-31) — natural-language read of the selected child's
// week. Reads per-child data (CHILD_REPORTS, chosen via the Reports chip) and
// adapts both tone and language, so switching to a struggling child changes the
// narrative — it never hard-codes one child.
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

  const summary = doingWell
    ? (ko
      ? `이번 주 ${nm}는 확실히 더 안전한 걷기 습관을 만들고 있어요. 하루 위험한 폰 사용 순간이 ${first}회에서 ${last}회로 줄어, 첫 주보다 약 ${reduction}% 감소했어요. 이제 경고의 ${rep.acceptance}%에서 멈추고, 평균 반응 시간은 ${rep.avgResponse}초예요. 아침이 가장 안전한 시간대이고, 남은 위험은 대부분 하교길에 나타나요.`
      : `This week ${nm} is clearly building a safer walking habit. Daily risky phone-use moments fell from ${first} to ${last} — about ${reduction}% fewer than the first week. ${nm} now stops for ${rep.acceptance}% of warnings, with an average reaction time of ${rep.avgResponse} seconds. Mornings are the strongest window; most remaining risks show up on the after-school walk.`)
    : (ko
      ? `이번 주 ${nm}는 아직 안전한 걷기 습관을 만들어가는 중이에요. 하루 위험한 순간이 눈에 띄게 줄지 않았고, 경고 수용률은 ${rep.acceptance}%, 평균 반응 시간은 ${rep.avgResponse}초예요. 함께 규칙을 살펴보고 하교길을 특히 신경 써 보세요.`
      : `This week ${nm} is still forming the habit. Daily risky moments haven't dropped much yet, warning acceptance is ${rep.acceptance}%, and average reaction time is ${rep.avgResponse} seconds. Reviewing the rules together — especially the after-school walk — would help.`);

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
    { icon: 'sun', t: ko ? '아침 루틴 유지하기' : 'Keep the morning routine', s: ko ? '아침 등굣길은 거의 위험이 없어요 — 지금처럼 이어가요.' : 'The morning commute is nearly risk-free — keep it up.' },
    { icon: 'map-pin', t: ko ? '하교길 이야기 나누기' : 'Talk about the after-school walk', s: ko ? '경고 대부분이 오후 3시경 오크 거리 근처예요. 가벼운 대화가 도움돼요.' : 'Most warnings happen near Oak St. around 3pm. A gentle check-in helps.' },
    { icon: 'flame', t: ko ? '연속 기록 축하하기' : 'Celebrate the streak', s: ko ? `${nm}는 ${rep.streak}일 연속 안전 기록 중이에요. 소리 내어 칭찬해 주세요.` : `${nm} is on a ${rep.streak}-day safe streak. Naming it out loud reinforces the habit.` },
  ] : [
    { icon: 'list-checks', t: ko ? '규칙 함께 살펴보기' : 'Review the rules together', s: ko ? '경고 민감도와 걷는 시간대를 함께 확인해 보세요.' : 'Go over warning sensitivity and walking times together.' },
    { icon: 'map-pin', t: ko ? '하교길에 집중하기' : 'Focus on the after-school walk', s: ko ? '위험 순간이 오후에 집중돼요. 그 시간대를 함께 이야기해요.' : 'Risky moments cluster in the afternoon — talk through that window.' },
    { icon: 'heart', t: ko ? '작은 진전도 응원하기' : 'Cheer small wins', s: ko ? '작은 향상도 알아채고 격려하면 습관이 자라요.' : 'Noticing small improvements out loud helps the habit grow.' },
  ];

  const tHead = { improving: ko ? '나아지고 있어요' : "What's improving", tryAtHome: ko ? '집에서 해보세요' : 'Try this at home', nutshell: ko ? '한마디로' : 'In a nutshell' };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={ko ? `이번 주 · ${nm}` : `This week · ${nm}`} title={L('AI Safety Report')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* AI summary */}
        <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(160deg,#eef3fe,#fff 82%)', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={17} color="#fff" stroke={2.3} /></div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{tHead.nutshell}</span>
            <Badge variant="primary" style={{ marginLeft: 'auto' }}>AI</Badge>
          </div>
          <div style={{ fontSize: 13.5, color: THEME.fg1, lineHeight: 1.55 }}>{summary}</div>
        </div>

        {/* headline metric — a reduction tile when improving, an attention tile otherwise */}
        {reduction > 0 ? (
          <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16, marginBottom: 16 }}>
            <Icon name="trending-up" size={22} color={THEME.success} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#274427', lineHeight: 1 }}>{reduction}% {ko ? '더 안전' : 'safer'}</div>
              <div style={{ fontSize: 12.5, color: '#274427', opacity: .9, marginTop: 4, lineHeight: 1.4 }}>{ko ? `첫 주보다 걸으며 폰 보는 위험 순간이 줄었어요.` : `Fewer risky walking-while-using moments than ${nm}'s first week on JoanX.`}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, background: THEME.goldLight, borderRadius: 18, padding: 16, marginBottom: 16 }}>
            <Icon name="alert-circle" size={22} color={THEME.gold} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#5b4a1e', lineHeight: 1.2 }}>{ko ? '조금 더 신경 써 볼 때예요' : "Let's work on it together"}</div>
              <div style={{ fontSize: 12.5, color: '#5b4a1e', opacity: .9, marginTop: 4, lineHeight: 1.4 }}>{ko ? `이번 주 위험 순간이 뚜렷이 줄지 않았어요. 아래 제안을 참고하세요.` : `Risky moments haven't dropped much this week. The suggestions below can help.`}</div>
            </div>
          </div>
        )}

        {/* what's improving */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{tHead.improving}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {improving.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={THEME.success} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{it.t}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        {/* recommended actions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{tHead.tryAtHome}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 16, overflow: 'hidden' }}>
          {actions.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={BRAND.primary} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{it.t}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1, lineHeight: 1.4 }}>{it.s}</div></div>
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
