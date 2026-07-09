// JoanX — child app · Shop

import React from 'react';
import { createPortal } from 'react-dom';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// A soft speckled egg (used on the shop card and in the hatch overlay).
function EggShape({ size = 120, color = '#e6a94b' }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 1.28 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50% 50% 48% 48% / 62% 62% 38% 38%', background: `radial-gradient(120% 90% at 32% 26%, #fff 0%, ${color} 60%, ${shade(color, -22)} 100%)`, boxShadow: `inset -6px -9px 15px ${shade(color, -30)}55, 0 10px 22px rgba(46,43,41,.16)` }} />
      {[[34, 26, 7, 9, .5], [54, 62, 6, 8, .45], [70, 38, 5, 6, .4]].map(([t, l, w, h, o], i) => (
        <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: w, height: h, borderRadius: '50%', background: shade(color, -20), opacity: o }} />
      ))}
      <div style={{ position: 'absolute', top: '15%', left: '22%', width: '22%', height: '15%', borderRadius: '50%', background: 'rgba(255,255,255,.7)', transform: 'rotate(-18deg)', filter: 'blur(1px)' }} />
    </div>
  );
}

// A cracked eggshell half — sits under the hatched buddy so the reveal reads
// as "just came out of the egg" (its own motif, not the onboarding gift card).
function EggHalf({ color, flip }) {
  return (
    <div style={{ position: 'relative', width: 72, height: 40 }}>
      <div style={{ width: '100%', height: '100%', background: `radial-gradient(130% 150% at 42% 0%, #fff 0%, ${color} 66%, ${shade(color, -22)} 100%)`, clipPath: 'polygon(0 32%, 13% 4%, 27% 30%, 41% 2%, 55% 30%, 69% 2%, 83% 28%, 100% 8%, 100% 100%, 0 100%)', borderRadius: '0 0 36px 36px / 0 0 44px 40px', transform: `rotate(${flip ? 15 : -15}deg)`, boxShadow: `inset 0 -6px 10px ${shade(color, -26)}44` }} />
      {[[52, 34, 5, 6], [70, 62, 4, 5]].map(([t, l, w, h], i) => (
        <div key={i} style={{ position: 'absolute', top: `${t}%`, left: `${l}%`, width: w, height: h, borderRadius: '50%', background: shade(color, -20), opacity: .4 }} />
      ))}
    </div>
  );
}

// ── Egg loot pool (A-2 / F-15) ───────────────────────────────────────
// Collectible buddies distinct from the starter roster, so a hatch can be a
// genuine "new buddy" until the pool is exhausted, then rolls into duplicates.
const EGG_PRICE = 500;
const EGG_POOL = [
  { id: 'egg-cocoa', species: 'cat',  name: 'Cocoa', color: '#a9744f', rarity: 'common'  },
  { id: 'egg-sky',   species: 'bird', name: 'Sky',   color: '#5aa9e6', rarity: 'common'  },
  { id: 'egg-maple', species: 'fox',  name: 'Maple', color: '#e08a3c', rarity: 'rare'    },
  { id: 'egg-luna',  species: 'owl',  name: 'Luna',  color: '#7c5cbf', rarity: 'rare'    },
  { id: 'egg-nova',  species: 'cat',  name: 'Nova',  color: '#e0559a', rarity: 'special' },
];
const RARITY_WEIGHT = { common: 6, rare: 3, special: 1 };
const DUP_XP = { common: 30, rare: 60, special: 120 };
// weighted-random pick from the pool
const rollBuddy = () => {
  const bag = EGG_POOL.flatMap(b => Array(RARITY_WEIGHT[b.rarity]).fill(b));
  return bag[Math.floor(Math.random() * bag.length)];
};

// ── Points & Shop ────────────────────────────────────────────────────
function Shop({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [owned, setOwned] = React.useState({ scarf: true, cape: true });
  const [toast, setToast] = React.useState(null);

  // egg & hatch flow state — { phase:'egg'|'reveal', buddy, dup, xp }
  const [hatch, setHatch] = React.useState(null);
  const eggOwned = React.useRef(new Set());   // which egg-pool buddies you've hatched already

  const buyEgg = () => {
    if (pts < EGG_PRICE) { setToast({ ok: false, msg: L('Not enough points yet') }); setTimeout(() => setToast(null), 1500); return; }
    PLAYER.points -= EGG_PRICE; setPts(PLAYER.points);
    // iOS 13+ needs motion permission, requested from this user gesture (best-effort)
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') DeviceMotionEvent.requestPermission().catch(() => {});
    } catch { /* older/unsupported browsers — tap still works */ }
    setHatch({ phase: 'egg', buddy: rollBuddy() });
  };
  // tap the egg → it wobbles (crack), then the buddy pops out
  const crackEgg = () => {
    setHatch(h => (h && h.phase === 'egg' ? { ...h, phase: 'cracking' } : h));
    setTimeout(revealEgg, 820);   // matches the jx-shake duration
  };

  // shake-to-hatch: while the egg is waiting, a firm phone shake also cracks it
  React.useEffect(() => {
    if (hatch?.phase !== 'egg') return;
    let last = null, lastFire = 0;
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity; if (!a) return;
      const now = Date.now();
      if (last && now - lastFire > 600) {
        const jolt = Math.abs((a.x || 0) - last.x) + Math.abs((a.y || 0) - last.y) + Math.abs((a.z || 0) - last.z);
        if (jolt > 26) { lastFire = now; crackEgg(); }
      }
      last = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
    };
    window.addEventListener('devicemotion', onMotion);
    return () => window.removeEventListener('devicemotion', onMotion);
  }, [hatch?.phase]);
  // reveal the buddy; new ones join the collection, dupes pay XP
  const revealEgg = () => {
    setHatch(h => {
      if (!h) return h;
      const b = h.buddy;
      const dup = eggOwned.current.has(b.id);
      let xp = 0;
      if (dup) {
        xp = DUP_XP[b.rarity];
        const active = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
        if (active) active.xp = Math.min((active.xp || 0) + xp, active.xpMax || 500);
      } else {
        eggOwned.current.add(b.id);
        CHARACTERS.push({ id: b.id, species: b.species, name: b.name, color: b.color, stage: 1, rarity: b.rarity, level: 1, xp: 0, xpMax: 200, owned: true, room: null, traits: { guard: 50, speed: 60, heart: 70 } });
      }
      return { ...h, phase: 'reveal', dup, xp };
    });
  };

  const outfits = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', price: 0 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', price: 0 },
    { id: 'crown', icon: 'crown', name: 'Star Crown', price: 300 },
    { id: 'shades', icon: 'glasses', name: 'Cool Shades', price: 250 },
    { id: 'bow', icon: 'gift', name: 'Ribbon Bow', price: 200 },
    { id: 'cap', icon: 'graduation-cap', name: 'Explorer Cap', price: 280 },
  ];

  const buy = (id, price, label) => {
    if (owned[id]) return;
    if (pts < price) { setToast({ ok: false, msg: L('Not enough points yet') }); setTimeout(() => setToast(null), 1500); return; }
    PLAYER.points -= price; setPts(PLAYER.points); setOwned(o => ({ ...o, [id]: true }));
    setToast({ ok: true, msg: `${label} ${L('unlocked!')}` }); setTimeout(() => setToast(null), 1600);
  };

  const PriceBtn = ({ id, price, label }) => owned[id]
    ? <span style={{ fontSize: 11, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={12} color={THEME.success} stroke={3} />{L('Owned')}</span>
    : <button onClick={() => buy(id, price, label)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pts >= price ? THEME.gold : THEME.surface2, color: pts >= price ? '#fff' : THEME.fg3, borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="star" size={12} color={pts >= price ? '#fff' : THEME.fg3} fill={pts >= price ? '#fff' : THEME.fg3} stroke={2} />{price}</button>;

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
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['swords', L('Win battles')], ['flame', L('Keep streaks')], ['gift', L('Daily reward')]].map(([ic, t], i) => (
              <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Icon name={ic} size={16} color={THEME.gold} stroke={2.3} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* buddy egg — buy → hatch → random buddy (A-2 / F-15) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${THEME.campingBg}, #fff 80%)`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div className="jx-float" style={{ width: 64, height: 74, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><EggShape size={58} color={THEME.camping} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{L('Buddy Egg')}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Hatch a random new buddy')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7 }}>
              {['common', 'rare', 'special'].map(r => (
                <span key={r} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: RARITY[r].fg, background: RARITY[r].bg, padding: '2px 7px', borderRadius: 999 }}>{L(RARITY[r].label)}</span>
              ))}
            </div>
          </div>
          <button onClick={buyEgg} className="jx-press" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pts >= EGG_PRICE ? THEME.camping : THEME.surface2, color: pts >= EGG_PRICE ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <Icon name="star" size={13} color={pts >= EGG_PRICE ? '#fff' : THEME.fg3} fill={pts >= EGG_PRICE ? '#fff' : THEME.fg3} stroke={2} />{EGG_PRICE}
          </button>
        </div>

        {/* outfits */}
        <SectionHead title={L('Outfits')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {outfits.map(o => (
            <div key={o.id} style={{ background: '#fff', borderRadius: 18, padding: '14px 8px 12px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={o.icon} size={22} color={THEME.primary} stroke={2.2} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>{L(o.name)}</span>
              <PriceBtn id={o.id} price={o.price} label={L(o.name)} />
            </div>
          ))}
        </div>

        {/* rooms are earned by milestones (see Collection), not bought — so the
            Shop stays outfits + eggs, avoiding a conflicting acquisition story. */}
      </div>

      {/* egg hatch overlay (A-2 / F-15) — portaled to the phone screen so it
          covers the tab bar, matching the app's full-screen "moment" pattern */}
      {hatch && createPortal((() => {
        const b = hatch.buddy, rar = RARITY[b.rarity];
        const reveal = hatch.phase === 'reveal';
        const cracking = hatch.phase === 'cracking';
        return (
          <div className={`jx-fade${reveal ? '' : ' jx-egg-bg'}`} style={{ position: 'absolute', inset: 0, zIndex: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', ...(reveal
            ? { background: `radial-gradient(120% 80% at 50% 34%, ${shade(b.color, 70)} 0%, ${shade(b.color, 92)} 58%, #fff 100%)` }
            : { '--egg-a': shade(b.color, 38), '--egg-b': shade(b.color, 66), '--egg-base': shade(b.color, 92) }) }}>
            {!reveal ? (
              <React.Fragment>
                {/* rings + tappable egg */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
                  <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${b.color}55` }} />
                  <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${b.color}55` }} />
                  {/* glow that swells while the egg cracks */}
                  {cracking && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(b.color, 60)} 0%, transparent 68%)` }} />}
                  <button onClick={cracking ? undefined : crackEgg} disabled={cracking} className={`jx-press ${cracking ? 'jx-egg-hatch' : 'jx-float'}`} aria-label={L('Tap to hatch')} style={{ background: 'none', border: 'none', cursor: cracking ? 'default' : 'pointer', padding: 0 }}>
                    <EggShape size={132} color={b.color} />
                  </button>
                </div>
                <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Buddy Egg')}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: cracking ? .85 : 1 }}>
                  <Icon name={cracking ? 'hourglass' : 'pointer'} size={15} color={b.color} stroke={2.3} className={cracking ? 'jx-pulse-soft' : undefined} />{L(cracking ? 'Hatching…' : 'Tap to hatch')}
                </div>
                {/* shake affordance — parked at the far bottom, bigger + its own copy */}
                {!cracking && (
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 'calc(env(safe-area-inset-bottom) + 46px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(b.color, 64), alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="vibrate" size={28} color={shade(b.color, -28)} stroke={2.3} />
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
                    <EggHalf color={b.color} />
                    <EggHalf color={b.color} flip />
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
