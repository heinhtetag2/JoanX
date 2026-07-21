// JoanX — child app · VillainDex

import React from 'react';
import { activeVillains, endingUnlocked, isBoss, roleOf, storyProgress, storyUnlocked } from '../core/data.jsx';
import { Badge, Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { ScreenHeader, DexProgress, screenBgActive } from './shared.jsx';

// ── Villain Encyclopedia (A-9) ───────────────────────────────────────
// Two layouts, switchable from the Tweaks panel: 'road' (level-map trail,
// à la Candy Crush) and 'list' (the original card list).
function VillainDex({ ctx, layout = 'road' }) {
  if (layout === 'road') return <VillainRoad ctx={ctx} />;
  return <VillainList ctx={ctx} />;
}

function VillainList({ ctx }) {
  const VILLAINS = activeVillains();                            // seasonal villains ops hasn't turned on aren't here
  const firstOpen = VILLAINS.findIndex(v => !v.defeated);      // current challenger index
  const defeated = VILLAINS.filter(v => v.defeated).length;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Villain Dex')} onBack={() => ctx.nav('battle')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{defeated}/{VILLAINS.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        <DexProgress have={defeated} total={VILLAINS.length} label="Villains defeated" icon="skull" accent={THEME.danger} accentLight={THEME.dangerLight} />
        {/* A-8.1 — chapters are earned by first clears, so this counter and the defeated
            counter move together. It is here to make the story feel like a thing you are
            collecting, not a paragraph that happens to appear. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: THEME.goldLight, borderRadius: 12, padding: '9px 12px', margin: '0 0 12px' }}>
          <Icon name="book-open" size={14} color={THEME.gold} stroke={2.4} />
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#9e7300' }}>{L('Story chapters')}</span>
          <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#9e7300' }}>{storyProgress().read}/{storyProgress().total}</span>
        </div>
        {VILLAINS.map((v, i) => {
          const discovered = v.defeated || i === firstOpen;     // seen = beaten or the current one
          const current = i === firstOpen;
          const role = roleOf(v);
          return (
            <div key={v.id} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10, alignItems: 'center', border: current ? `1.5px solid ${THEME.danger}` : '1.5px solid transparent' }}>
              <div style={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'center', filter: discovered ? 'none' : 'grayscale(1) brightness(.4) opacity(.55)' }}>
                <Mascot species={v.species} stage={2} color={v.color} mood="alert" size={56} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3 }}>Lv{v.lv}</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{discovered ? L(v.name) : '???'}</span>
                  {isBoss(v) && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '2px 7px', fontSize: 9.5, fontWeight: 800 }}>
                      <Icon name={role.icon} size={10} color="#9e7300" stroke={2.6} />{L(role.label)}
                    </span>
                  )}
                </div>
                {discovered ? (
                  <React.Fragment>
                    {/* what this villain IS — the risk it personifies, not a monster stat */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: THEME.danger, marginTop: 4 }}>{L(v.risk)}</div>
                    <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 3 }}>{L(v.desc)}</div>
                    {/* A-8.1 — the story is the FIRST-CLEAR prize. Reaching a villain reveals who
                        it is; beating it earns the chapter. Until now this text was authored on
                        every villain and rendered nowhere — the ladder told a story no one read. */}
                    {storyUnlocked(v) ? (
                      <div style={{ display: 'flex', gap: 7, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${THEME.border}` }}>
                        <Icon name="book-open" size={13} color={THEME.gold} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ fontSize: 11.5, color: THEME.fg1, lineHeight: 1.5, fontStyle: 'italic' }}>{L(v.story)}</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${THEME.border}`, color: THEME.fg3 }}>
                        <Icon name="book-open" size={13} color={THEME.fg3} stroke={2.3} />
                        <span style={{ fontSize: 11.5, fontWeight: 700 }}>{L('Beat it to unlock its story')}</span>
                      </div>
                    )}
                  </React.Fragment>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: THEME.fg3 }}>
                    <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{L('Defeat the villain before to reveal')}</span>
                  </div>
                )}
              </div>
              {v.defeated ? <Badge variant="success">{L('Defeated')}</Badge>
                : current ? <Badge variant="danger">{L('Now')}</Badge> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Villain Road — the same ladder as a snaking level map. One smooth
//    S-curved road, defeated stops behind you, the current challenger
//    pulsing mid-trail, locked silhouettes ahead, boss at the end. ────
function VillainRoad({ ctx }) {
  const VILLAINS = activeVillains();
  const firstOpen = VILLAINS.findIndex(v => !v.defeated);
  const defeated = VILLAINS.filter(v => v.defeated).length;
  const ending = endingUnlocked();
  const current = firstOpen === -1 ? VILLAINS.length - 1 : firstOpen;
  const [sel, setSel] = React.useState(current);
  const curRef = React.useRef(null);

  // geometry: hand-tuned stops — irregular lanes and leg heights so the
  // trail meanders like a drawn map instead of a perfect sine wave. The
  // boss sits near the centre for a finale. Catmull-Rom tangents turn the
  // stops into one organic, C1-smooth flow (no formula-y symmetry).
  const W = 360;
  const pts = [
    { x: 118, y: 96 },  { x: 252, y: 232 }, { x: 150, y: 372 },  { x: 258, y: 520 },
    { x: 112, y: 660 }, { x: 234, y: 795 }, { x: 122, y: 950 },  { x: 262, y: 1088 },
    { x: 132, y: 1235 }, { x: 196, y: 1390 },
  ].slice(0, VILLAINS.length);
  const H = pts[pts.length - 1].y + 92;
  const tanAt = i => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    return { x: (b.x - a.x) / 2, y: (b.y - a.y) / 2 };
  };
  const cps = pts.slice(1).map((p, i) => {
    const a = pts[i], ma = tanAt(i), mb = tanAt(i + 1);
    return [{ x: a.x + ma.x / 3, y: a.y + ma.y / 3 }, { x: p.x - mb.x / 3, y: p.y - mb.y / 3 }];
  });
  const seg = (p, i) => !i ? `M ${p.x} ${p.y}`
    : `C ${cps[i - 1][0].x} ${cps[i - 1][0].y}, ${cps[i - 1][1].x} ${cps[i - 1][1].y}, ${p.x} ${p.y}`;
  // sub-path over a node range [from..to] — lets us style behind/ahead apart
  const part = (from, to) => pts.slice(from, to + 1)
    .map((p, j) => j === 0 ? `M ${p.x} ${p.y}` : seg(p, from + j)).join(' ');
  const road = part(0, pts.length - 1);
  const roadDone = part(0, current);              // the legs behind you
  const roadAhead = part(current, pts.length - 1);

  // point + travel direction at t along segment i (for the road chevrons)
  const at = (i, t) => {
    const a = pts[i], b = pts[i + 1], [c1, c2] = cps[i], u = 1 - t;
    const f = k => u * u * u * a[k] + 3 * u * u * t * c1[k] + 3 * u * t * t * c2[k] + t * t * t * b[k];
    const g = k => 3 * u * u * (c1[k] - a[k]) + 6 * u * t * (c2[k] - c1[k]) + 3 * t * t * (b[k] - c2[k]);
    return { x: f('x'), y: f('y'), deg: Math.atan2(g('y'), g('x')) * 180 / Math.PI };
  };

  // roadside scenery, planted on the free side across from each stop
  const SCENERY = [
    ['tree-pine', THEME.success, 22], ['flower-2', '#e278a8', 17], ['cloud', '#9db6cf', 20],
    ['sprout', THEME.success, 17], ['star', THEME.gold, 15],
  ];

  React.useEffect(() => { curRef.current?.scrollIntoView({ block: 'center' }); }, []);

  const v = VILLAINS[sel];
  const selDiscovered = v.defeated || sel === firstOpen;
  const selCurrent = sel === firstOpen;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 300, background: screenBgActive() }}>
        <div style={{ padding: '0 16px' }}>
          <DexProgress have={defeated} total={VILLAINS.length} label="Villains defeated" icon="skull" accent={THEME.danger} accentLight={THEME.dangerLight} />
        {/* A-8.1 — chapters are earned by first clears, so this counter and the defeated
            counter move together. It is here to make the story feel like a thing you are
            collecting, not a paragraph that happens to appear. */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: THEME.goldLight, borderRadius: 12, padding: '9px 12px', margin: '0 0 12px' }}>
          <Icon name="book-open" size={14} color={THEME.gold} stroke={2.4} />
          <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: '#9e7300' }}>{L('Story chapters')}</span>
          <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#9e7300' }}>{storyProgress().read}/{storyProgress().total}</span>
        </div>
        </div>

        <div style={{ position: 'relative', height: H }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, display: 'block' }}>
            {/* ground: faint edge, white trail (narrower than the pads), a
                soft warm tint behind you, then platform pads */}
            <path d={road} fill="none" stroke="rgba(43,41,38,.09)" strokeWidth={38} strokeLinecap="round" />
            <path d={road} fill="none" stroke="#fff" strokeWidth={31} strokeLinecap="round" />
            <path d={roadDone} fill="none" stroke="rgba(209,69,50,.10)" strokeWidth={31} strokeLinecap="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={i === firstOpen ? 46 : 38} fill="#fff" stroke="rgba(43,41,38,.06)" strokeWidth={1.5} />
            ))}
            {/* markings: red footstep beads behind you, small gray dots ahead */}
            <path d={roadAhead} fill="none" stroke={THEME.border} strokeWidth={4} strokeLinecap="round" strokeDasharray="1 15" />
            <path d={roadDone} fill="none" stroke={THEME.danger} strokeWidth={6.5} strokeLinecap="round" strokeDasharray="0.1 19" opacity={.85} />
          </svg>

          {/* mid-leg stops: collected stars behind you, gift stops ahead,
              and a red direction chevron on the very next leg */}
          {pts.slice(0, -1).map((_, i) => {
            const m = at(i, .5);
            if (i === current) return (
              <Icon key={i} name="chevrons-down" size={20} color={THEME.danger} stroke={2.6}
                style={{ position: 'absolute', left: `${(m.x / W) * 100}%`, top: m.y, transform: `translate(-50%,-50%) rotate(${m.deg - 90}deg)`, opacity: .9, pointerEvents: 'none' }} />
            );
            const done = i < current;
            return (
              <div key={i} style={{ position: 'absolute', left: `${(m.x / W) * 100}%`, top: m.y, transform: 'translate(-50%,-50%)', width: 26, height: 26, borderRadius: 999, background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                {done ? <Icon name="star" size={14} color={THEME.gold} fill={THEME.gold} stroke={2} />
                      : <Icon name="gift" size={13} color={THEME.fg3} stroke={2.3} />}
              </div>
            );
          })}

          {/* roadside scenery across from each stop + start flag */}
          <Icon name="flag" size={20} color={THEME.success} stroke={2.4} fill={`${THEME.success}33`}
            style={{ position: 'absolute', left: `${((pts[0].x - 72) / W) * 100}%`, top: pts[0].y - 26, opacity: .85, pointerEvents: 'none' }} />
          {pts.map((p, i) => {
            const [icon, color, size] = SCENERY[i % SCENERY.length];
            const x = W - p.x + ((i * 37) % 26) - 13, y = p.y + ((i * 53) % 40) - 20;
            return (
              <Icon key={i} name={icon} size={size} color={color} stroke={2.1}
                style={{ position: 'absolute', left: `${(x / W) * 100}%`, top: y, transform: 'translate(-50%,-50%)', opacity: .5, pointerEvents: 'none' }} />
            );
          })}

          {/* stops */}
          {VILLAINS.map((vi, i) => {
            const isCur = i === firstOpen;
            const discovered = vi.defeated || isCur;
            const boss = isBoss(vi);          // the ROLE says so — not "the last stop on the road"
            const isSel = i === sel;
            const size = isCur ? 80 : 64;
            return (
              <div key={vi.id} ref={isCur ? curRef : null} onClick={() => setSel(i)}
                style={{ position: 'absolute', left: `${(pts[i].x / W) * 100}%`, top: pts[i].y, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', zIndex: 2 }}>
                <div style={{ position: 'relative' }}>
                  {/* sonar ring on the current challenger */}
                  {isCur && <span style={{ position: 'absolute', inset: -7, borderRadius: 999, border: `2.5px solid ${THEME.danger}`, animation: 'jxRing 1.8s ease-out infinite', pointerEvents: 'none' }} />}
                  <div style={{ width: size, height: size, borderRadius: 999, background: discovered ? '#fff' : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: isCur ? `2.5px solid ${THEME.danger}` : isSel ? `2.5px solid ${THEME.fg2}` : '2.5px solid #fff',
                    boxShadow: isCur ? '0 8px 20px rgba(209,69,50,.28)' : THEME.shadowCard, transition: 'border-color .2s' }}>
                    <div style={{ filter: discovered ? 'none' : 'grayscale(1) brightness(.4) opacity(.55)' }}>
                      <Mascot species={vi.species} stage={2} color={vi.color} mood="alert" size={size - 16} />
                    </div>
                  </div>
                  {/* level pill / boss crown */}
                  <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 3, background: boss ? THEME.gold : '#fff', color: boss ? '#fff' : THEME.fg2, fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, boxShadow: THEME.shadowCard, whiteSpace: 'nowrap' }}>
                    {boss && <Icon name={roleOf(vi).icon} size={10} color="#fff" stroke={2.6} />}{boss ? L(roleOf(vi).label) : `Lv${vi.lv}`}
                  </span>
                  {/* status chip */}
                  {vi.defeated ? (
                    <span style={{ position: 'absolute', bottom: -2, right: -4, width: 21, height: 21, borderRadius: 999, background: THEME.success, border: '2.5px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={11} color="#fff" stroke={3.4} /></span>
                  ) : !isCur && (
                    <span style={{ position: 'absolute', bottom: -2, right: -4, width: 21, height: 21, borderRadius: 999, background: '#fff', border: `1.5px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="lock" size={10} color={THEME.fg3} stroke={2.6} /></span>
                  )}
                </div>
                <span style={{ marginTop: 7, fontSize: 11, fontWeight: 800, color: isCur ? THEME.danger : THEME.fg2, background: '#fff', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: THEME.shadowCard }}>
                  {discovered ? L(vi.name) : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <ScreenHeader title={L('Villain Dex')} onBack={() => ctx.nav('battle')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{defeated}/{VILLAINS.length}</span></div>} />

      {/* detail card for the selected stop — anchored near the bottom edge. This
          screen has no child tab bar (villaindex isn't a CHILD_TAB_ROOT), so the
          card floats above just the home indicator, not a phantom nav bar. */}
      <div key={sel} className="jx-rise" style={{ position: 'absolute', left: 16, right: 16, bottom: 24, background: '#fff', borderRadius: 20, padding: '15px 15px 14px', boxShadow: THEME.shadowSoft, zIndex: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 18, background: selDiscovered ? THEME.dangerLight : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ filter: selDiscovered ? 'none' : 'grayscale(1) brightness(.4) opacity(.55)' }}><Mascot species={v.species} stage={2} color={v.color} mood="alert" size={46} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: THEME.danger, background: THEME.dangerLight, padding: '2px 7px', borderRadius: 999, flexShrink: 0 }}>Lv{v.lv}</span>
              <span style={{ fontSize: 16.5, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selDiscovered ? L(v.name) : '???'}</span>
            </div>
            {/* stat chips: power + points reward for beating it */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.surface2, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>
                <Icon name="zap" size={11} color={THEME.danger} stroke={2.4} />{L('Power')} {selDiscovered ? v.power : '???'}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 700, color: '#9e7300' }}>
                <Icon name="star" size={11} color={THEME.gold} fill={THEME.gold} stroke={2} />{L('Reward')} {selDiscovered ? `+${v.power}P` : '???'}
              </span>
            </div>
          </div>
          {v.defeated ? <Badge variant="success">{L('Defeated')}</Badge>
            : !selCurrent ? <Badge>{L('Locked')}</Badge> : null}
        </div>

        {/* A-9 — the character sheet, not a stat block: what this villain represents, its
            story, and the trick it fights with. Hidden behind the same silhouette gate as
            the name, so reading it is a reward for reaching the villain. */}
        {selDiscovered ? (
          <React.Fragment>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.danger, marginTop: 10 }}>{L(v.risk)}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.55, marginTop: 4 }}>{L(v.story)}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, background: THEME.surface2, borderRadius: 12, padding: '9px 11px' }}>
              <Icon name="zap" size={14} color={THEME.danger} stroke={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg1 }}>{L(v.ability.name)}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 1 }}>{L(v.ability.effect)}</div>
              </div>
            </div>
          </React.Fragment>
        ) : (
          <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.55, marginTop: 10 }}>{L('Defeat the villain before to reveal')}</div>
        )}

        {/* the ladder is finished — the ending, shown wherever the story is read */}
        {ending && v.role === 'finalBoss' && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, background: THEME.goldLight, borderRadius: 12, padding: '9px 11px' }}>
            <Icon name="sunrise" size={14} color="#9e7300" stroke={2.4} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 11.5, color: '#9e7300', fontWeight: 700, lineHeight: 1.45 }}>{L('The dark the others were made of is gone. The city can look up again — and so can you.')}</div>
          </div>
        )}

        {selCurrent && (
          <Button variant="danger" fullWidth size="md" icon="swords" style={{ marginTop: 11 }} onClick={() => ctx.nav('battle')}>{L('Start battle')}</Button>
        )}
      </div>
    </div>
  );
}

export { VillainDex };
