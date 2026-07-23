// JoanX — child app · VillainDex

import React from 'react';
import { activeVillains, endingUnlocked, isBoss, roleOf, storyProgress, storyUnlocked } from '../core/data.jsx';
import { Badge, Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { ScreenHeader, DexProgress, screenBgActive } from './shared.jsx';
import { music, sfx } from '../core/sound.jsx';

// ── Villain Encyclopedia (A-9) ───────────────────────────────────────
// Two layouts, switchable from the Tweaks panel: 'road' (level-map trail,
// à la Candy Crush) and 'list' (the original card list).
function VillainDex({ ctx, layout = 'road' }) {
  // the villain map is the "fighting" screen — a looping battle theme plays while
  // it's open and stops the moment you leave (both layouts, hence it lives here).
  // Muted like every other cue by Profile → Sound effects.
  React.useEffect(() => { music.start('battle'); return () => music.stop(); }, []);
  if (layout === 'road') return <VillainRoad ctx={ctx} />;
  return <VillainList ctx={ctx} />;
}

function VillainList({ ctx }) {
  const VILLAINS = activeVillains();                            // seasonal villains ops hasn't turned on aren't here
  const firstOpen = VILLAINS.findIndex(v => !v.defeated);      // current challenger index
  const defeated = VILLAINS.filter(v => v.defeated).length;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Villain Dex')} onBack={() => ctx.back()}
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

  // stop coordinates in a 0..W × 0..H space — hand-placed to land on the path
  // that is PAINTED INTO the map art (villain-map.png), not on a road we draw.
  // The art climbs BOTTOM → TOP: the lush garden at the bottom is level 1, the
  // trail winds up over the stone bridge and ends at the star gate at the top,
  // which is where the toughest villain / boss sits. So index 0 is the bottom
  // stop and the last index is the gate — VILLAINS[0] (lowest) renders lowest.
  // Coordinates come straight from the Figma arrangement (node 168:19774), where the
  // villains were hand-placed on the trail. That frame (320×1294) and this map div
  // (~366×1482) are both height-constrained `cover` crops of the same 941×1672 art, so
  // the crop is identical and each Figma fraction maps directly: x = fx·W, y = fy·H.
  // Figma lists gate→garden (top→bottom); this ladder is garden→gate, so index 0 (the
  // lowest level) is the BOTTOM stop — the array is the reverse of the Figma order.
  const W = 360;
  const pts = [
    { x: 289, y: 1228 }, { x: 117, y: 1102 }, { x: 304, y: 1024 }, { x: 264, y: 822 },
    { x: 80,  y: 772 },  { x: 138, y: 640 },  { x: 309, y: 561 },  { x: 151, y: 479 },
    { x: 309, y: 404 },  { x: 195, y: 287 },
  ].slice(0, VILLAINS.length);
  // The whole art is shown at cover-scale k=.886, so its full height maps to 1482px
  // of trail (not derived from the last stop, which is now the TOP of the climb).
  const H = 1482;

  React.useEffect(() => { curRef.current?.scrollIntoView({ block: 'center' }); }, []);

  // sel can be null — tapping empty map ground dismisses the detail card, so the
  // world reads clean until a villain is picked again.
  const v = sel != null ? VILLAINS[sel] : null;
  const selDiscovered = v != null && (v.defeated || sel === firstOpen);
  const selCurrent = sel === firstOpen;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* brand-green scroll surface; the illustrated map itself is ONE image laid on the
          trail container below, so it reads as a single continuous world (not a tile) and
          travels with the stops as you scroll — the villains stay pinned to their spot on it */}
      {/* no top padding: with the progress/chapters cards gone, the map itself fills
          to the very top and sits UNDER the frosted (transparent + blur) header, so
          there's no green band between the header and the world. */}
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 0, paddingBottom: 0,
        backgroundColor: THEME.brand }}>

        {/* the ONE map image — `cover` fills the trail at the art's own proportions (never
            stretched, so it always looks right); the stops are pinned by coordinate on top,
            so it's the PATH that adapts to the art, not the art that bends to the path. */}
        <div onClick={() => { if (sel != null) setSel(null); }} style={{ position: 'relative', height: H,
          backgroundImage: 'url(/assets/backgrounds/villain-map.png)',
          backgroundSize: 'cover', backgroundRepeat: 'no-repeat', backgroundPosition: 'center top' }}>
          {/* no drawn road, footsteps, or scenery: the path and world are painted INTO the
              map art, so the only overlay is the villains themselves, dropped onto it. */}

          {/* stops */}
          {VILLAINS.map((vi, i) => {
            const isCur = i === firstOpen;
            const discovered = vi.defeated || isCur;
            const boss = isBoss(vi);          // the ROLE says so — not "the last stop on the road"
            const isSel = i === sel;
            const size = isCur ? 80 : 64;
            return (
              <div key={vi.id} ref={isCur ? curRef : null} onClick={(e) => { e.stopPropagation(); if (i !== sel) sfx.select(); setSel(i); }}
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
                  {/* status pill — one chip at the top carries the whole state instead of a
                      check/lock floating off the circle's corner: green ✓ once defeated, a
                      grey lock while still out of reach, the boss role or plain Lv otherwise.
                      Centred over the avatar and mirrored by the name pill below, so the stop
                      reads as one tidy unit. */}
                  {(() => {
                    const locked = !discovered && !isCur;
                    const bg = vi.defeated ? THEME.success : locked ? THEME.surface2 : boss ? THEME.gold : '#fff';
                    const fg = vi.defeated ? '#fff' : locked ? THEME.fg3 : boss ? '#fff' : THEME.fg2;
                    const lead = vi.defeated ? 'check' : locked ? 'lock' : boss ? roleOf(vi).icon : null;
                    const label = boss && discovered ? L(roleOf(vi).label) : `Lv${vi.lv}`;
                    return (
                      <span style={{ position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 3, background: bg, color: fg, fontSize: 9.5, fontWeight: 800, padding: '2px 8px', borderRadius: 999, boxShadow: THEME.shadowCard, whiteSpace: 'nowrap' }}>
                        {lead && <Icon name={lead} size={10} color={fg} stroke={2.8} />}{label}
                      </span>
                    );
                  })()}
                </div>
                <span style={{ marginTop: 7, fontSize: 11, fontWeight: 800, color: isCur ? THEME.danger : THEME.fg2, background: '#fff', padding: '3px 9px', borderRadius: 999, whiteSpace: 'nowrap', boxShadow: THEME.shadowCard }}>
                  {discovered ? L(vi.name) : '???'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* light: the map runs full-bleed under the header, so drop the frosted blur and
          render the title + skull count in white (with a soft shadow) — no chips, just
          readable text on the busy night art. Only the back button keeps its circle. */}
      <ScreenHeader light title={L('Villain Dex')} onBack={() => ctx.back()}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4, textShadow: '0 1px 4px rgba(0,0,0,.5)' }}><Icon name="skull" size={15} color="#fff" stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{defeated}/{VILLAINS.length}</span></div>} />

      {/* detail card for the selected stop — anchored near the bottom edge. This
          screen has no child tab bar (villaindex isn't a CHILD_TAB_ROOT), so the
          card floats above just the home indicator, not a phantom nav bar. Only
          shown while a villain is selected — tapping empty map ground clears it. */}
      {v != null && (
      <div key={sel} className="jx-rise" style={{ position: 'absolute', left: 16, right: 16, bottom: 24, background: '#fff', borderRadius: 20, padding: '15px 15px 14px', boxShadow: '0 4px 13px rgba(46,43,41,0.06)', zIndex: 5 }}>
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
      )}
    </div>
  );
}

export { VillainDex };
