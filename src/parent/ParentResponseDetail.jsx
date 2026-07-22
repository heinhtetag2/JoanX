// JoanX — parent app · ParentResponseDetail
//
// Detail view for the Reports "How they respond to warnings" card. Opens from
// that card's chevron with { childId }. Reads the same per-child reactions
// (CHILD_REPORTS[id].reactions) the card charts, so the two never disagree —
// here it's expanded into a tappable weekly chart, a per-type breakdown, and a
// grounded insight (safest day / a day to watch), all computed from that data.

import React from 'react';
import { CHILDREN, CHILD_REPORTS, REACTIONS_7D } from '../core/data.jsx';
import { Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

// Immediate = safe (green), delayed = yellow, ignored = risky (red). This is the
// semantic palette — ignored is the one to worry about, so it reads red, not blue.
const RESP = { immediate: '#4f9d89', delayed: '#e0af3e', ignored: '#e86f5f' };

function ParentResponseDetail({ ctx }) {
  const ko = getLang() === 'ko';
  const child = CHILDREN.find(c => c.id === ctx.params?.childId) || CHILDREN[0];
  const rep = CHILD_REPORTS[child.id] || { reactions: REACTIONS_7D };
  const reactions = rep.reactions || REACTIONS_7D;
  const nm = child.name;

  const [active, setActive] = React.useState(reactions.length - 1);   // default: latest day
  const dayShort = i => (ko ? ['월', '화', '수', '목', '금', '토', '일'][i] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]);
  const dayFull  = i => (ko ? ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'][i]
                            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][i]);

  // weekly totals + the headline immediate-stop share
  const tot = reactions.reduce((a, d) => ({ immediate: a.immediate + d.immediate, delayed: a.delayed + d.delayed, ignored: a.ignored + d.ignored }), { immediate: 0, delayed: 0, ignored: 0 });
  const grand = tot.immediate + tot.delayed + tot.ignored || 1;
  const immediateShare = Math.round((tot.immediate / grand) * 100);
  const doingWell = immediateShare >= 70;

  // absolute-volume stacked bars: tallest day sets the scale, so height reads as
  // "how many warnings that day" and the segments read as the mix within it
  const dayTot = d => d.immediate + d.delayed + d.ignored;
  const maxTot = Math.max(1, ...reactions.map(dayTot));
  const AREA = 150;

  // grounded insight — safest day (highest immediate share) and, if any, the day to watch
  const shareOf = d => d.immediate / (dayTot(d) || 1);
  let safest = 0;
  reactions.forEach((d, i) => { if (shareOf(d) > shareOf(reactions[safest])) safest = i; });
  const watch = reactions.map((d, i) => ({ i, n: d.ignored })).filter(x => x.n > 0).sort((a, b) => b.n - a.n)[0];

  const TYPES = [
    { key: 'immediate', label: L('Immediate'), color: RESP.immediate, count: tot.immediate,
      desc: ko ? '경고와 동시에 바로 멈췄어요.' : 'Stopped the moment they were warned.' },
    { key: 'delayed', label: L('Delayed'), color: RESP.delayed, count: tot.delayed,
      desc: ko ? '경고 후 잠시 뒤에 멈췄어요.' : 'Stopped, but a moment later.' },
    { key: 'ignored', label: L('Ignored'), color: RESP.ignored, count: tot.ignored,
      desc: ko ? '경고에도 계속 걸었어요.' : 'Kept walking despite the warning.' },
  ];

  const sel = reactions[active];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={ko ? `이번 주 · ${nm}` : `This week · ${nm}`} title={L('How they respond to warnings')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* headline — the week's immediate-stop share, tone tinted by how it's going */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', background: doingWell ? THEME.successLight : THEME.goldLight, borderRadius: 20, padding: '18px 18px', marginBottom: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <span className="game-font" style={{ fontSize: 38, fontWeight: 500, lineHeight: 1, color: doingWell ? '#274427' : '#5b4a1e' }}>{immediateShare}%</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: doingWell ? '#274427' : '#5b4a1e', lineHeight: 1.3 }}>
              {ko ? '경고에 바로 반응한 비율' : 'Stopped right away this week'}
            </div>
            <div style={{ fontSize: 12.5, color: doingWell ? '#274427' : '#5b4a1e', opacity: .88, marginTop: 4, lineHeight: 1.45 }}>
              {doingWell
                ? (ko ? `${nm}는 대부분의 경고에 곧바로 멈췄어요.` : `${nm} stopped immediately for most warnings.`)
                : (ko ? `늦은 반응과 무시가 조금 늘었어요. 아래에서 자세히 볼 수 있어요.` : `Delayed and ignored responses crept up — see the days below.`)}
            </div>
          </div>
        </div>

        {/* weekly chart — tappable days, absolute-volume stacked bars, localized labels */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('This week')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '16px 14px 14px', marginBottom: 18 }}>
          {/* selected-day readout */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 2px' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{dayFull(active)}</span>
            <div style={{ display: 'flex', gap: 12 }}>
              {[['immediate', sel.immediate], ['delayed', sel.delayed], ['ignored', sel.ignored]].map(([k, v]) => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: RESP[k] }} />
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{v}</span>
                </span>
              ))}
            </div>
          </div>
          {/* bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: AREA, borderBottom: `1.5px solid ${THEME.border}` }}>
            {reactions.map((d, i) => {
              const on = active === i;
              const seg = (v, c, top) => v > 0 ? <div style={{ height: (v / maxTot) * AREA, background: c, borderRadius: top ? '4px 4px 0 0' : 0 }} /> : null;
              return (
                <div key={i} onClick={() => setActive(i)} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%', cursor: 'pointer', borderRadius: 8, background: on ? 'rgba(46,43,41,.06)' : 'transparent', transition: 'background .15s', WebkitTapHighlightColor: 'transparent' }}>
                  <div style={{ width: 22, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                    {seg(d.ignored, RESP.ignored, true)}
                    {seg(d.delayed, RESP.delayed, d.ignored === 0)}
                    {seg(d.immediate, RESP.immediate, d.ignored === 0 && d.delayed === 0)}
                  </div>
                </div>
              );
            })}
          </div>
          {/* weekday labels */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {reactions.map((d, i) => (
              <span key={i} onClick={() => setActive(i)} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: active === i ? THEME.fg1 : THEME.fg3, fontWeight: active === i ? 800 : 600, cursor: 'pointer' }}>{dayShort(i)}</span>
            ))}
          </div>
        </div>

        {/* per-type breakdown — what each response means + the week's total + its share */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{ko ? '반응 유형' : 'Response types'}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {TYPES.map((it, i) => {
            const pct = Math.round((it.count / grand) * 100);
            return (
              <div key={it.key} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: it.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{it.label}</span>
                    <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4 }}>{it.desc}</div>
                  <div style={{ height: 5, borderRadius: 999, background: THEME.surface2, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: it.color, borderRadius: 999 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, flexShrink: 0 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: THEME.fg1 }}>{it.count}</span>
                  <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 700 }}>{ko ? '회' : '×'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* grounded insight — pulled straight from the week, not generic advice */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{ko ? '이번 주 눈여겨볼 점' : 'Worth noticing'}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center' }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="shield-check" size={17} color={THEME.success} stroke={2.3} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ko ? `가장 안전했던 날 · ${dayFull(safest)}` : `Safest day · ${dayFull(safest)}`}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{ko ? `경고의 ${Math.round(shareOf(reactions[safest]) * 100)}%에 바로 멈췄어요.` : `Stopped right away for ${Math.round(shareOf(reactions[safest]) * 100)}% of warnings.`}</div>
            </div>
          </div>
          {watch && (
            <div style={{ display: 'flex', gap: 12, padding: '13px 14px', alignItems: 'center', borderTop: `1px solid ${THEME.border}` }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: '#fbecec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="alert-triangle" size={17} color={RESP.ignored} stroke={2.3} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ko ? `살펴볼 날 · ${dayFull(watch.i)}` : `Day to watch · ${dayFull(watch.i)}`}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{ko ? `경고를 ${watch.n}번 무시했어요. 그날 이야기를 나눠 보세요.` : `Ignored ${watch.n} warning${watch.n > 1 ? 's' : ''} — a good day to check in about.`}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ParentResponseDetail };
