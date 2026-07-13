// JoanX — child app · Shop

import React from 'react';
import { createPortal } from 'react-dom';
import { CHARACTERS, EGGS, PLAYER, POINTS, rarityOf, xpForLevel } from '../core/data.jsx';
import { Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';
import { EggShape, EggHalf, eggColorFor, requestMotionPermission, useShakeToHatch, HATCH_MS } from './EggHatch.jsx';

// ── Egg hatching (A-2 / F-15) ────────────────────────────────────────
// Eggs hatch straight from the roster in data.jsx — there is no second, private
// pool of buddies. That is what makes the collection totals mean something: every
// buddy you can hatch is one of the 15, and an unowned one is a genuinely new
// character until the tier is exhausted, after which the tier rolls duplicates.
// Odds come from the egg (server-configurable); only the Epic Egg can hatch an Epic.
const rollBuddy = (egg) => {
  const odds = egg.odds || {};
  // weight each candidate by its tier, preferring buddies you don't own yet so a
  // hatch stays exciting while there is anything left to find
  const bag = CHARACTERS.flatMap(c => Array((odds[c.rarity] || 0) * (c.owned ? 1 : 3)).fill(c));
  return bag.length ? bag[Math.floor(Math.random() * bag.length)] : null;
};

// ── Points & Shop ────────────────────────────────────────────────────
function Shop({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [toast, setToast] = React.useState(null);

  // egg & hatch flow state — { phase:'egg'|'reveal', buddy, dup, xp }
  const [hatch, setHatch] = React.useState(null);

  // A-2: price + eligibility come from EGGS (server-configurable). Epic has no
  // price — it is only granted by events, missions and achievements.
  const buyEgg = (egg) => {
    const nope = (msg) => { setToast({ ok: false, msg }); setTimeout(() => setToast(null), 1600); };
    if (egg.price == null) return nope(L('Only from events and missions'));
    if (PLAYER.level < egg.minLevel) return nope(`${L('Unlocks at Lv')} ${egg.minLevel}`);
    if (pts < egg.price) return nope(L('Not enough points yet'));
    PLAYER.points -= egg.price; setPts(PLAYER.points);
    requestMotionPermission();   // iOS 13+: must be asked from this user gesture
    setHatch({ phase: 'egg', buddy: rollBuddy(egg), eggRarity: egg.rarity });
  };
  // tap the egg → it wobbles (crack), then the buddy pops out
  const crackEgg = () => {
    setHatch(h => (h && h.phase === 'egg' ? { ...h, phase: 'cracking' } : h));
    setTimeout(revealEgg, HATCH_MS);
  };

  // shake-to-hatch: while the egg is waiting, a firm phone shake also cracks it
  useShakeToHatch(hatch?.phase === 'egg', crackEgg);
  // reveal the buddy; new ones join the collection, dupes pay XP
  const revealEgg = () => {
    setHatch(h => {
      if (!h || !h.buddy) return h;
      const b = h.buddy;
      const dup = b.owned;
      let xp = 0;
      if (dup) {
        xp = rarityOf(b.rarity).dupXp;
        const active = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
        if (active) active.xp = Math.min((active.xp || 0) + xp, active.xpMax || xpForLevel(active.level || 1));
      } else {
        // joins the collection — and for an Epic this is the moment it stops being
        // hidden and appears in the dex at all (F-15.2)
        b.owned = true; b.level = 1; b.xp = 0; b.xpMax = xpForLevel(1);
      }
      return { ...h, phase: 'reveal', dup, xp };
    });
  };


  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Points')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* balance */}
        <div style={{ borderRadius: 22, padding: '20px 18px', background: 'linear-gradient(160deg,#fff2d1,#fff 78%)', boxShadow: THEME.shadowCard, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="star" size={30} color={THEME.gold} fill={THEME.gold} stroke={2} />
            <span className="game-font" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{pts.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L('Your points')}</div>
          {/* how points are actually earned (F-13 / A-1.1) — battles pay no points */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['footprints', L('Safe walking'), `+${POINTS.perSafeMinute} / ${L('min')}`],
              ['hand', L('Immediate stop'), `+${POINTS.immediateStopBonus}`],
              ['shield-check', L('Accident-free day'), `+${POINTS.dailyAccidentFreeBonus}`]].map(([ic, t, v], i) => (
              <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <Icon name={ic} size={16} color={THEME.gold} stroke={2.3} />
                <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{v}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: THEME.fg2, textAlign: 'center', lineHeight: 1.15 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* buddy eggs — one per rarity, priced + gated by EGGS (A-2 / F-15) */}
        <SectionHead title={L('Buddy Eggs')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {EGGS.map(egg => {
            const rar = RARITY[egg.rarity];
            const locked = PLAYER.level < egg.minLevel;      // level gate
            const unbuyable = egg.price == null;             // epic: reward-only
            const afford = !unbuyable && pts >= egg.price;
            const on = !unbuyable && !locked && afford;      // fully purchasable now
            // the epic egg is a prize, not a dead item — never dim it. Only a
            // level-locked egg should read as unavailable.
            return (
              <div key={egg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}${unbuyable ? '55' : '22'}`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, opacity: locked ? .78 : 1 }}>
                <div className={on || unbuyable ? 'jx-float' : undefined} style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked ? 'grayscale(.5)' : 'none' }}>
                  <EggShape size={56} rarity={egg.rarity} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: rar.fg, background: rar.bg, padding: '2px 7px', borderRadius: 999 }}>{L(rar.label)}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>
                    {unbuyable
                      ? L('Only from events, special missions and achievement rewards.')
                      : locked
                        ? `${L('Unlocks at Lv')} ${egg.minLevel}`
                        : L('Hatch a random new buddy')}
                  </div>
                </div>

                {unbuyable ? (
                  <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800 }}>
                    <Icon name="gift" size={13} color={THEME.gold} stroke={2.3} />{L('Reward')}
                  </span>
                ) : (
                  <button onClick={() => buyEgg(egg)} className={on ? 'jx-press' : undefined} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? rar.fg : THEME.surface2, color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Icon name={locked ? 'lock' : 'star'} size={13} color={on ? '#fff' : THEME.fg3} fill={locked ? 'none' : (on ? '#fff' : THEME.fg3)} stroke={2} />
                    {egg.price.toLocaleString()}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Outfits are NOT sold here (A-5): an outfit belongs to a character, so
            it is bought on that buddy's own detail screen, where you can see it
            on them. This card just points the way. */}
        <SectionHead title={L('Outfits')} />
        <button onClick={() => ctx.nav('character', { id: c.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: 'none', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 18, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 46, height: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={44} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Dress up your buddy')}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>{L('Outfits are bought on each buddy’s page — some unlock as they evolve.')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
        </button>

        {/* rooms are earned by milestones (see Collection), not bought — so the
            Shop stays eggs only, avoiding a conflicting acquisition story. */}
      </div>

      {/* egg hatch overlay (A-2 / F-15) — portaled to the phone screen so it
          covers the tab bar, matching the app's full-screen "moment" pattern */}
      {hatch && createPortal((() => {
        const b = hatch.buddy, rar = RARITY[b.rarity];
        const reveal = hatch.phase === 'reveal';
        const cracking = hatch.phase === 'cracking';
        const eggC = eggColorFor(hatch.eggRarity);   // shell colour of the egg bought
        return (
          <div className={`jx-fade${reveal ? '' : ' jx-egg-bg'}`} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', ...(reveal
            ? { background: `radial-gradient(120% 80% at 50% 34%, ${shade(b.color, 70)} 0%, ${shade(b.color, 92)} 58%, #fff 100%)` }
            : { '--egg-a': shade(eggC, 38), '--egg-b': shade(eggC, 66), '--egg-base': shade(eggC, 92) }) }}>
            {!reveal ? (
              <React.Fragment>
                {/* rings + tappable egg — tinted to the EGG, not the buddy inside */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
                  <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
                  <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${eggC}55` }} />
                  {/* glow that swells while the egg cracks */}
                  {cracking && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(eggC, 60)} 0%, transparent 68%)` }} />}
                  <button onClick={cracking ? undefined : crackEgg} disabled={cracking} className={`jx-press ${cracking ? 'jx-egg-hatch' : 'jx-float'}`} aria-label={L('Tap to hatch')} style={{ background: 'none', border: 'none', cursor: cracking ? 'default' : 'pointer', padding: 0 }}>
                    <EggShape size={132} rarity={hatch.eggRarity} />
                  </button>
                </div>
                <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Buddy Egg')}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: cracking ? .85 : 1 }}>
                  <Icon name={cracking ? 'hourglass' : 'pointer'} size={15} color={eggC} stroke={2.3} className={cracking ? 'jx-pulse-soft' : undefined} />{L(cracking ? 'Hatching…' : 'Tap to hatch')}
                </div>
                {/* shake affordance — parked at the far bottom, bigger + its own copy */}
                {!cracking && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom) + 46px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(eggC, 64), alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="vibrate" size={28} color={shade(eggC, -28)} stroke={2.3} />
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Shake to hatch too')}</div>
                    <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('Give your phone a little shake')}</div>
                  </div>
                )}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {/* confetti raining from the top — tinted to the buddy + its rarity */}
                {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                  const cols = [b.color, rar.fg, shade(b.color, 42), THEME.gold, shade(b.color, -16), THEME.success, b.color, rar.fg];
                  const lefts = ['18%', '30%', '44%', '56%', '68%', '80%', '24%', '74%'];
                  const dl = [0, .12, .04, .18, .08, .22, .3, .26];
                  return <div key={`cf${i}`} className="jx-confetti" style={{ position: 'absolute', top: '7%', left: lefts[i], width: i % 3 ? 7 : 9, height: i % 2 ? 8 : 11, borderRadius: i % 2 ? 999 : 2, background: cols[i], animationDelay: `${dl[i]}s` }} />;
                })}
                {/* twinkling sparkles */}
                {[{ t: '20%', l: '18%', s: 20, d: 0 }, { t: '15%', l: '77%', s: 15, d: .5 }, { t: '42%', l: '85%', s: 12, d: 1 }, { t: '45%', l: '11%', s: 13, d: .3 }, { t: '11%', l: '48%', s: 12, d: .8 }].map((p, i) => (
                  <Icon key={i} name="sparkles" size={p.s} color={i % 2 ? THEME.gold : b.color} fill={i % 2 ? THEME.gold : b.color} stroke={0} className="jx-twinkle" style={{ position: 'absolute', top: p.t, left: p.l, animationDelay: `${p.d}s` }} />
                ))}

                {/* status ribbon — solid white pill so it reads on any buddy tint */}
                <div className="jx-drop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(46,43,41,.08)', color: hatch.dup ? shade(THEME.gold, -40) : THEME.fg1, borderRadius: 999, padding: '6px 14px 6px 12px', fontSize: 12.5, fontWeight: 800, letterSpacing: .3, position: 'relative', marginBottom: 16 }}>
                  {hatch.dup
                    ? <React.Fragment><Icon name="zap" size={14} color={THEME.gold} fill={THEME.gold} stroke={1.8} />+{hatch.xp} XP</React.Fragment>
                    : <React.Fragment><Icon name="egg" size={14} color={b.color} stroke={2.3} />{L('New buddy!')}</React.Fragment>}
                </div>

                {/* the hatch: buddy pops out of a cracked-open shell over a soft glow */}
                <div className="jx-gift-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                  <div style={{ position: 'absolute', top: '48%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${shade(b.color, 74)} 0%, rgba(255,255,255,0) 66%)`, zIndex: 0 }} />
                  <div className="jx-burst" style={{ position: 'absolute', top: '48%', left: '50%', width: 210, height: 210, borderRadius: 999, border: `3px solid ${b.color}`, opacity: 0, zIndex: 0 }} />
                  {/* cracked eggshell halves under the buddy's feet */}
                  <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, zIndex: 1 }}>
                    <EggHalf color={eggC} />
                    <EggHalf color={eggC} flip />
                  </div>
                  <div className="jx-float" style={{ position: 'relative', zIndex: 2 }}><Mascot species={b.species} stage={2} color={b.color} size={182} /></div>
                </div>

                {/* name with an inline rarity gem chip */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', marginTop: 6 }}>
                  <h1 className="game-font" style={{ fontSize: 31, fontWeight: 500, margin: 0 }}>{b.name}</h1>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fff', border: `1.5px solid ${rar.fg}40`, color: b.rarity === 'common' ? THEME.fg2 : rar.fg, borderRadius: 999, padding: '4px 11px', fontSize: 12, fontWeight: 800 }}>
                    <Icon name="gem" size={12} color={b.rarity === 'common' ? THEME.fg2 : rar.fg} stroke={2.4} />{L(rar.label)}
                  </span>
                </div>
                <p style={{ fontSize: 14.5, color: THEME.fg2, lineHeight: 1.5, margin: '10px 0 0', position: 'relative' }}>
                  {hatch.dup ? `${L('You already have')} ${b.name} — ${L('turned into XP')}` : L('Added to your collection')}
                </p>

                {/* CTA — flat, buddy-tinted, full-width pill (no glow, no icon) */}
                <button onClick={() => setHatch(null)} className="jx-press" style={{ marginTop: 30, width: 260, maxWidth: '82%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: b.color, color: '#fff', borderRadius: 18, padding: '15px 0', fontSize: 15.5, fontWeight: 800, boxShadow: 'none' }}>
                  {hatch.dup ? L('Awesome!') : L('Keep it')}
                </button>
              </React.Fragment>
            )}
          </div>
        );
      })(), document.querySelector('.screen') || document.body)}

      {/* toast */}
      {toast && (
        <div className="jx-pop" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: toast.ok ? THEME.fg1 : THEME.danger, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, boxShadow: THEME.shadowXl }}>
            <Icon name={toast.ok ? 'party-popper' : 'info'} size={16} color="#fff" stroke={2.3} />{toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export { Shop };
