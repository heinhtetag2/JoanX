import React from 'react';
import { createPortal } from 'react-dom';
import { Badge, Bar, Icon, PhotoAvatar, RARITY, SafePointIcon, SealCheck, ShopIcon, THEME } from '../core/primitives.jsx';
import { battlePower, battlesPerDay, CHARACTERS, CHILD_REPORTS, FRIENDS, PLAYER, SAFE_PT_PER_MIN, TODAY_TASKS, grantAllPermissions, missingPermissions, totalEggs, xpToCap } from '../core/data.jsx';
import { getLang, L } from '../core/i18n.jsx';
import { Mascot, shade, tint } from '../core/characters.jsx';
import { HatchCelebration, isNeon, mixHue, pastelHue, screenBgFor } from './shared.jsx';
import { EggShape } from './EggHatch.jsx';
import { sfx } from '../core/sound.jsx';

// JoanX — Child Home, "Simple Layout" set.
// A standalone DUPLICATE of the 6 home layouts (Original + the 5 in
// HomeVariants.jsx). Kept fully independent — its own helper copies and
// components — so we can simplify/modify this set without touching the
// originals. Routed via App.jsx ("Home layout" → Simple row, ids "simple-*").

// Focus home's egg-shop entry — the painted 3-egg badge dropped into /assets/egg/,
// floating beside the buddy's level/stage line (Home · Focus layout only).
const EGG_SHOP_ICON = '/assets/egg/eggshopicon.png';

// Tweaks: Home · Egg badge shine — ten candidates for the effect behind/around the
// badge above, kept as a Tweaks row (not a single hand-picked answer) after several
// rounds of "too loud" (rotating ray-burst), "too plain" (flat gradient dot), and "too
// glassy" (bright off-center highlight) — better to line them up and compare than
// guess at one more in isolation. 'rays' revisits the ray-burst idea as thin flat SVG
// lines in brand green instead of a thick glossy repeating-conic-gradient wedge — the
// wedge version is what read as a generic reward-icon; a line is JoanX's own vocabulary
// (see the flat egg ribbons/flecks elsewhere in EggHatch.jsx).
const EGG_SHINE_STYLES = ['radial', 'ring', 'halo', 'ripple', 'iconPulse', 'iconFloat', 'fadeDot', 'shimmer', 'rays', 'none'];
const EGG_RAY_ANGLES = Array.from({ length: 10 }, (_, i) => (360 / 10) * i);

function EggShopBadgeS({ ctx }) {
  const style = ctx.tweaks?.eggShineStyle || 'radial';
  const iconClass = style === 'iconPulse' ? ' jx-pulse-soft' : style === 'iconFloat' ? ' jx-egg-idle' : '';
  return (
    <button onClick={() => ctx.nav('shop')} aria-label={L('Open the egg shop')} className={'jx-press' + iconClass} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', width: 62, height: 62, border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
      {/* radial — the current default: a white-to-brand-green radial gradient, breathing */}
      {style === 'radial' && (
        <span className="jx-egg-shine" style={{ position: 'absolute', inset: '-18%', borderRadius: '50%', background: `radial-gradient(circle, #fff 0%, ${THEME.brand}99 38%, ${THEME.brand}00 70%)`, filter: 'blur(2px)', pointerEvents: 'none' }} />
      )}
      {/* ring — a plain flat stroke, no fill, breathing */}
      {style === 'ring' && (
        <span className="jx-egg-shine" style={{ position: 'absolute', inset: '-16%', borderRadius: '50%', border: `3px solid ${THEME.brand}`, pointerEvents: 'none' }} />
      )}
      {/* halo — a soft blurred glow ring via box-shadow, breathing */}
      {style === 'halo' && (
        <span className="jx-egg-halo" style={{ position: 'absolute', inset: '-10%', pointerEvents: 'none' }} />
      )}
      {/* ripple — two rings expanding outward and fading, staggered like a sonar ping */}
      {style === 'ripple' && (
        <React.Fragment>
          <span className="jx-egg-ripple" style={{ position: 'absolute', inset: 0, borderRadius: '50%', color: THEME.brand, pointerEvents: 'none' }} />
          <span className="jx-egg-ripple delay" style={{ position: 'absolute', inset: 0, borderRadius: '50%', color: THEME.brand, pointerEvents: 'none' }} />
        </React.Fragment>
      )}
      {/* fadeDot — a tiny corner presence dot, breathing opacity only (no glow layer) */}
      {style === 'fadeDot' && (
        <span className="jx-egg-dot" style={{ position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: THEME.brand, border: '2px solid #fff', pointerEvents: 'none' }} />
      )}
      {/* shimmer — a slow, dim light bar crossing the art, then a long pause before the next pass */}
      {style === 'shimmer' && (
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
          <span className="jx-egg-shimmer" style={{ position: 'absolute', top: '-20%', left: '46%', width: 10, height: '140%', background: 'linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 100%)' }} />
        </span>
      )}
      {/* rays — thin flat lines radiating out from behind the icon, slow rotation. The
          reward-coin reference's rays as a flat vector line instead of a glossy wedge. */}
      {style === 'rays' && (
        <svg viewBox="0 0 100 100" className="jx-egg-rays" style={{ position: 'absolute', inset: '-60%', pointerEvents: 'none' }}>
          {EGG_RAY_ANGLES.map((deg) => (
            <line key={deg} x1="50" y1="50" x2="50" y2="4" stroke={THEME.brand} strokeWidth="2.2" strokeLinecap="round" opacity=".5" transform={`rotate(${deg} 50 50)`} />
          ))}
        </svg>
      )}
      {/* iconPulse / iconFloat / none — no background layer; the icon itself carries the
          motion (or nothing does, for 'none' — the control case). */}
      <img src={EGG_SHOP_ICON} alt="" style={{ position: 'relative', width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
    </button>
  );
}

// Focus home's 2nd stat card (Tweaks: Home · 2nd stat card) — candidates for the slot next to
// Day streak. 'points' is the original, which just repeats the header's points pill; the rest
// each surface a number that isn't already shown anywhere else on this screen, so picking one
// is a straight swap, not a redesign.
const HOME_STAT_B_OPTIONS = [
  { id: 'points', label: 'Safe points (current)', icon: 'award', color: () => THEME.gold, value: () => PLAYER.points.toLocaleString(), sub: 'Safe points', nav: 'rewards' },
  { id: 'eggs', label: 'Eggs to hatch', icon: 'egg', color: () => THEME.camping, value: () => Object.values(PLAYER.eggs).reduce((a, b) => a + b, 0), sub: 'Eggs to hatch', nav: 'shop' },
  { id: 'badges', label: 'Badges earned', icon: 'medal', color: () => THEME.gold, value: () => PLAYER.achievementsDone.length, sub: 'Badges earned', nav: 'rewards' },
  { id: 'friends', label: 'Friends', icon: 'users', color: () => THEME.primary, value: () => FRIENDS.length, sub: 'Friends', nav: 'friends' },
  { id: 'bonus', label: 'Bonus today', icon: 'gift', color: () => THEME.success, value: () => `+${PLAYER.bonusPointsToday}`, sub: 'Bonus today', nav: 'rewards' },
  { id: 'battles', label: 'Battles left', icon: 'swords', color: () => THEME.danger, value: () => Math.max(0, battlesPerDay() - PLAYER.battlesToday), sub: 'Battles left', nav: 'villaindex' },
  // Round 2 — the first batch mostly reads as small counts (2 eggs, 3 friends). These
  // instead pull real cumulative/derived numbers that already exist in the data model, so
  // the card carries the same "big number" weight as the points pill it's replacing.
  { id: 'minutes', label: 'Minutes protected (lifetime)', icon: 'timer', color: () => THEME.mountain, value: () => PLAYER.safeMinutes.toLocaleString(), sub: 'Minutes protected', nav: 'streak' },
  { id: 'weekMinutes', label: 'Minutes this week', icon: 'calendar-check', color: () => THEME.primary, value: () => (CHILD_REPORTS[PLAYER.childId]?.safeWalkMin ?? 0).toLocaleString(), sub: 'Minutes this week', nav: 'streak' },
  { id: 'collectionXp', label: 'Collection XP', icon: 'zap', color: () => THEME.gold, value: () => CHARACTERS.filter(x => x.owned).reduce((n, x) => n + x.xp, 0).toLocaleString(), sub: 'Collection XP', nav: 'collection' },
  { id: 'xpToMax', label: 'XP to max level', icon: 'trending-up', color: () => THEME.camping, value: () => xpToCap(CHARACTERS.find(x => x.id === PLAYER.activeCharId)).toLocaleString(), sub: 'XP to max level', nav: 'shop' },
  { id: 'power', label: 'Battle power', icon: 'sword', color: () => THEME.danger, value: () => battlePower(CHARACTERS.find(x => x.id === PLAYER.activeCharId)).toLocaleString(), sub: 'Battle power', nav: 'battle' },
];

// Points-gain feedback on the header pill (Tweaks: "Simulate earning +100 points") — a coin
// shower, chosen after comparing it against a count-up, a floating "+N", a single coin
// fly-in, and a flash burst. Those four are gone now that shower's the pick; see git history
// for them if a future redesign wants to revisit.
//
// Matched against the actual reference (a Clash Royale reward screen) again: it isn't
// scattered coins each flying their own path — it's ONE dense, continuous stream pouring
// from a single spot, curving up into the counter, coins shrinking the whole way so the
// stream visually tapers INTO the icon rather than a coin arriving still full-size and
// then popping. That means it has to escape the header's own small box: the phone frame is
// exactly 390×844 (see index.html's .bezel) and .screen is the containing block for it (it
// sets transform for exactly this reason), so the stream is portaled there and placed with
// real pixel coordinates rather than positioned relative to the pill.
//
// PILL_POS targets the ICON inside the pill specifically, not the pill's overall box — the
// icon sits at the pill's own left edge (padding 12px + half the 20px icon), and the pill
// itself is right-aligned in the header behind the fixed-width 40px bell button (gap 8,
// screen padding 18): bell's right edge sits at 390 − 18, so working back from there to the
// icon's own left-aligned position (not the pill's right edge, and not its text) lands the
// coins ON the icon rather than generically "somewhere in the pill's box".
const PILL_POS = { left: 242, top: 80 };
// module-scope (not component state) so it survives HomeActionsS remounting when the
// child navigates away and back to Home — the "Shop" tip should still only self-open
// once per app session, not once per mount.
let shopTipShown = false;
// SOURCE_POS — the single spot the whole stream pours from, low and left-of-center so the
// climb up to the pill has room to curve. Real Clash Royale streams have a chest to pour
// out of; we don't have an on-screen "source" object, so this is just a fixed point low on
// the phone rather than tied to any visible element.
const SOURCE_POS = { left: 150, top: 660 };
// Fixed 11-coin stream, not random-per-play, so every run looks the same. Loosely widens
// outward from SOURCE_POS over time, but every coin's exact spot, delay gap, and size is
// hand-picked off any regular step — no shared spacing between left/top values, no even
// delay gaps, sizes bouncing around instead of shrinking/growing in order. A regular
// pattern reads as a diagram of a coin spray; this is meant to read as the real, messier
// thing — coins that all roughly came from the same burst but didn't line up.
// [left, top, delayMs, size]
const COIN_SHOWER = [
  [140, 640, 0,   34], [185, 650, 35,  26], [110, 690, 90,  32],
  [205, 630, 160, 30], [95,  660, 180, 36], [225, 665, 260, 24],
  [70,  645, 300, 33], [240, 695, 380, 28], [55,  675, 420, 31],
  [260, 620, 470, 27], [35,  700, 520, 29],
];

// The coin stream itself, portaled to `.screen` so it can cross the whole phone instead of
// being clipped to whatever small box the pill's own header row sits in. Each coin rides a
// gentle curve (via --mx/--my, the arc's bend point) rather than a straight line, matching
// the reference's fountain-like sweep rather than a flat glide.
// `landAt` is the icon's MEASURED position (see HomeActionsS's iconRef) — falls back to the
// PILL_POS estimate only if the ref somehow wasn't available to measure.
function PointsCoinShower({ playKey, landAt = PILL_POS }) {
  const portalNode = document.querySelector('.screen') || document.body;
  return createPortal(
    <div style={{ position: 'absolute', inset: 0, zIndex: 90, pointerEvents: 'none', overflow: 'hidden' }}>
      {COIN_SHOWER.map(([left, top, delay, size], i) => {
        // landAt is the icon's CENTER, but translate moves the coin span's top-left
        // corner — without the -size/2 offset the coin's own center lands size/2 px
        // down-right of the icon instead of on it (scale() is center-origin so it
        // doesn't shift the center once translated there).
        const bx = landAt.left - left - size / 2, by = landAt.top - top - size / 2;
        // bend the midpoint left/outward off the straight line — an arc, not a glide
        const mx = bx * 0.4 - 22, my = by * 0.55;
        return (
          <span key={`${playKey}-${i}`} className="jx-points-big-rain"
            style={{
              position: 'absolute', left, top,
              '--mx': `${mx}px`, '--my': `${my}px`,
              '--bx': `${bx}px`, '--by': `${by}px`,
              '--bd': `${delay}ms`,
            }}>
            <SafePointIcon size={size} />
          </span>
        );
      })}
    </div>,
    portalNode
  );
}

// ── duplicated helpers (suffixed _S so they never clash with the originals)
const HOME_WINS_S = [
  { icon: 'timer',      color: () => THEME.success, bg: () => THEME.successLight, t: 'Stopped in 2s near Oak St.', s: '+30 bonus points', time: '12m' },
  { icon: 'footprints', color: () => THEME.primary, bg: () => THEME.primaryLight, t: '20 min safe walking',        s: '+200 points',     time: '1h' },
  { icon: 'medal',      color: () => THEME.camping, bg: () => THEME.campingBg,    t: 'Your buddy leveled up',      s: 'New trait unlocked', time: '3h' },
];

// Points land as a coin shower: several coins pour into the pill on staggered paths while
// its number counts up from the old total to the new one, timed so the last coin arrives
// right as the count settles. `ctx.params.pointsFx` is a one-shot trigger the Tweaks panel
// writes ({ from, to, amount, key }); `key` changing is what replays it.
function HomeActionsS({ ctx, dark }) {
  const ink = dark ? '#fff' : THEME.fg1;
  const chip = dark ? 'rgba(255,255,255,.18)' : '#fff';
  const fx = ctx.params?.pointsFx;
  const [playing, setPlaying] = React.useState(null);
  const [landAt, setLandAt] = React.useState(PILL_POS);
  const [shown, setShown] = React.useState(PLAYER.points);
  const seenKey = React.useRef(null);
  const iconRef = React.useRef(null);
  // tapping the points pill used to jump straight to the Shop — now it pops a quick
  // today/total breakdown first (same idea as a game's post-match score callout), so
  // the number means something before the child commits to leaving the screen for it.
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  // bumped on every tap so the pill's key changes and jx-pop replays each time (a
  // static class alone would only ever play once, on mount) — the popover then
  // reads as popping out of that bounce rather than sliding in on its own.
  const [bounceKey, setBounceKey] = React.useState(0);
  // unlike the points pill's tap-to-reveal tip, this one explains itself ONCE — a
  // first-time visitor sees "Shop" and a market-stall icon with no idea what's inside,
  // so it self-opens on the first Home mount this session (see shopTipShown below).
  // After that first look the button is just a plain doorway again: tapping it always
  // goes straight to the Shop, same as every other eggEntry variant's button does.
  const [showShopTip, setShowShopTip] = React.useState(false);
  const [shopBounceKey, setShopBounceKey] = React.useState(0);

  React.useEffect(() => {
    if (shopTipShown) return;
    shopTipShown = true;
    setShowShopTip(true);
    const t = setTimeout(() => setShowShopTip(false), 4500);
    return () => clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!fx || fx.key === seenKey.current) return;
    seenKey.current = fx.key;
    setPlaying(fx);
    // Measure the ICON's real on-screen center rather than trust a hardcoded guess — a
    // static estimate drifts with font metrics and can miss the actual icon by enough to
    // read as "landing behind the pill" rather than "on it". `.screen` is the coin stream's
    // own coordinate space (see PointsCoinShower); getBoundingClientRect() reports the
    // VISUAL (post phone-scale) pixels, so the delta is divided back down by that scale to
    // land in the same unscaled 390×844 space the stream's own `left`/`top` coordinates use.
    const iconEl = iconRef.current, screenEl = document.querySelector('.screen');
    if (iconEl && screenEl) {
      const iconRect = iconEl.getBoundingClientRect();
      const screenRect = screenEl.getBoundingClientRect();
      const scale = screenRect.width / screenEl.offsetWidth || 1;
      setLandAt({
        left: (iconRect.left + iconRect.width / 2 - screenRect.left) / scale,
        top: (iconRect.top + iconRect.height / 2 - screenRect.top) / scale,
      });
    }
    sfx.points();
    // last coin's stagger (500ms) + its own flight (1.05s) + a little breathing room
    // before the effect is torn down
    const t = setTimeout(() => setPlaying(null), 1650);
    return () => clearTimeout(t);
  }, [fx]);

  React.useEffect(() => {
    if (!playing) { setShown(PLAYER.points); return undefined; }
    const { from, to } = playing;
    // The count holds while the stream is still en route, then climbs as coins start
    // actually arriving at the pill and settles once the last one in the stream lands.
    const start = performance.now(), holdMs = 750, dur = 800;
    let raf;
    const tick = (now) => {
      const elapsed = now - start;
      if (elapsed < holdMs) { raf = requestAnimationFrame(tick); return; }
      const p = Math.min(1, (elapsed - holdMs) / dur);
      setShown(Math.round(from + (to - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const value = playing ? shown : PLAYER.points;

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {/* Tweaks: Home · Egg shop entry → 'header'. Left of the points pill. Same pill idiom
          as the points pill — egg + count + a small plus badge — so it reads as a sibling
          action, not a new pattern. The shell art is the same EggShape the Shop/hatch flow
          uses (epic tier), not a generic icon, so it reads as THE egg, not just "an egg". */}
      {ctx.tweaks?.eggEntry === 'header' && (
        <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: chip, padding: '5px 10px 5px 8px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ display: 'inline-flex' }}><EggShape size={18} rarity="epic" /></span>
          <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: ink }}>{totalEggs()}</span>
          <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.camping, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="plus" size={13} color="#fff" stroke={3} />
          </span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'icon'. 'header' always shows a count — at 0 eggs
          owned that reads as "0 + " next to the points pill, an empty-looking counter right
          beside a real balance, not an invitation. This is the bell's own idiom instead:
          a plain icon-only circle (no number ever shown), with a small badge appearing ONLY
          once there is something to act on — so "nothing owned yet" and "go check the shop"
          both read cleanly, and the pill never has to display a bare zero. */}
      {ctx.tweaks?.eggEntry === 'icon' && (
        <button onClick={() => ctx.nav('shop')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="egg" size={19} color={ink} stroke={2} />
          {totalEggs() > 0 && (
            <span className="game-font" style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, borderRadius: 999, background: THEME.camping, color: '#fff', fontSize: 10.5, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: `2px solid ${dark ? shade(THEME.fg1, 10) : '#fff'}` }}>
              {totalEggs()}
            </span>
          )}
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'label'. Text-led instead of number-led: the pill's
          headline is always a WORD naming the action ("Buy" / "Hatch"), never a bare count —
          so unlike 'header' it can't be misread as an empty counter at 0, and unlike 'icon'
          it doesn't need a badge to explain itself; the label already says what tapping does. */}
      {ctx.tweaks?.eggEntry === 'label' && (
        <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: chip, padding: '7px 13px 7px 10px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <Icon name="egg" size={15} color={THEME.camping} stroke={2.3} />
          <span className="game-font" style={{ fontSize: 13, fontWeight: 800, color: ink }}>
            {totalEggs() > 0 ? `${L('Hatch')} ×${totalEggs()}` : L('Buy egg')}
          </span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'dot'. Even more minimal than 'icon': no number is
          ever shown, not even in a badge — just a plain presence dot (the bell's OWN dot,
          re-tinted) meaning "something's waiting", full stop. Answers "is there anything to
          do" without also answering "how many", which this entry point may not need to. */}
      {ctx.tweaks?.eggEntry === 'dot' && (
        <button onClick={() => ctx.nav('shop')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="egg" size={19} color={ink} stroke={2} />
          {totalEggs() > 0 && (
            <span style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 999, background: THEME.camping, border: `2px solid ${dark ? shade(THEME.fg1, 10) : '#fff'}` }} />
          )}
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'stack'. Illustrative rather than UI-chrome: the
          eggs themselves peek out from behind each other (real EggShape art, epic-tinted),
          reading as "here is what you actually own" rather than an abstract counter. At 0
          it falls back to one faded common shell — an outline of the thing you're missing,
          not a blank slot. */}
      {ctx.tweaks?.eggEntry === 'stack' && (
        <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, height: 40, padding: '0 12px 0 6px', background: chip, borderRadius: 999, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
          <div style={{ position: 'relative', width: totalEggs() > 1 ? 30 : 20, height: 24, flexShrink: 0 }}>
            {totalEggs() > 0
              ? <span style={{ position: 'absolute', left: 0, top: 2 }}><EggShape size={18} rarity="epic" /></span>
              : <span style={{ position: 'absolute', left: 0, top: 2, opacity: .38 }}><EggShape size={18} rarity="common" /></span>}
            {totalEggs() > 1 && <span style={{ position: 'absolute', left: 11, top: 0 }}><EggShape size={18} rarity="rare" /></span>}
          </div>
          <span className="game-font" style={{ fontSize: 13, fontWeight: 800, color: ink }}>
            {totalEggs() > 0 ? `×${totalEggs()}` : L('Get one')}
          </span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'ghost'. Same idiom as 'header' (egg + count when
          owned), but deliberately LOW visual weight — an outlined pill with no filled
          background, so it recedes next to the solid points pill instead of competing with
          it. The theory: points and notifications are things you check often; the egg shop
          is a "pop in when curious" errand, and its entry point can look like one. Count is
          still hidden at 0 (same fix as every other option here) — the lighter weight is
          the one thing this variant is testing, not a reason to bring the bare zero back. */}
      {ctx.tweaks?.eggEntry === 'ghost' && (
        <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', padding: '6px 11px', borderRadius: 999, border: `1.5px solid ${dark ? 'rgba(255,255,255,.4)' : THEME.border}`, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Icon name="egg" size={15} color={ink} stroke={2.2} />
          {totalEggs() > 0 && <span className="game-font" style={{ fontSize: 13, fontWeight: 700, color: ink, opacity: .85 }}>{totalEggs()}</span>}
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'pulse'. No badge, no number, no dot — motion IS the
          cue. A soft ring expands out of the icon on a loop (reusing .jx-ring, already used
          for "this is live" affordances elsewhere), and only runs while there's actually
          something to hatch. Motion belongs on the thing being tapped, not a passive list —
          this button is the thing being tapped, so it's fair game where a list row wouldn't be. */}
      {ctx.tweaks?.eggEntry === 'pulse' && (
        <button onClick={() => ctx.nav('shop')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {totalEggs() > 0 && <span className="jx-ring" style={{ position: 'absolute', inset: -3, borderRadius: 999, border: `1.5px solid ${THEME.camping}` }} />}
          <Icon name="egg" size={19} color={ink} stroke={2} />
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'shop'. Represents the ACTION, not the object — a
          shopping-bag icon rather than an egg, and no count anywhere, ever. This is the most
          literal read of "there's no saved-egg count to show, it's just buy and hatch": the
          entry point doesn't try to summarize inventory at all, it's just a doorway. */}
      {ctx.tweaks?.eggEntry === 'shop' && (
        <button onClick={() => ctx.nav('shop')} style={{ width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="shopping-bag" size={18} color={ink} stroke={2.1} />
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'ring'. A radial progress ring instead of a number —
          empty (just the track) at 0 owned, filled all the way round once you have one ready.
          Reads at a glance the way a fitness ring does, without printing a digit at all. */}
      {ctx.tweaks?.eggEntry === 'ring' && (
        <button onClick={() => ctx.nav('shop')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width={40} height={40} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={20} cy={20} r={17} fill="none" stroke={dark ? 'rgba(255,255,255,.18)' : THEME.border} strokeWidth={2.5} />
            {totalEggs() > 0 && (
              <circle cx={20} cy={20} r={17} fill="none" stroke={THEME.camping} strokeWidth={2.5} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 17} strokeDashoffset={0} />
            )}
          </svg>
          <Icon name="egg" size={16} color={ink} stroke={2} />
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'swatch'. Status by COLOR rather than by count — the
          button's own fill is tinted to the rarest egg you're holding (grey when you have
          none), so a glance answers "is there something good waiting" without a digit. */}
      {ctx.tweaks?.eggEntry === 'swatch' && (() => {
        const rar = PLAYER.eggs.epic > 0 ? RARITY.epic : PLAYER.eggs.rare > 0 ? RARITY.rare : PLAYER.eggs.common > 0 ? RARITY.common : null;
        return (
          <button onClick={() => ctx.nav('shop')} style={{ width: 40, height: 40, borderRadius: 999, background: rar ? rar.bg : chip, border: rar ? `1.5px solid ${rar.fg}55` : 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="egg" size={18} color={rar ? rar.fg : ink} stroke={2.2} />
          </button>
        );
      })()}
      {/* Tweaks: Home · Egg shop entry → 'wordmark'. The leanest possible footprint — plain
          text, no icon, no chip background — a quiet link rather than a button competing
          visually with the points pill and the bell. */}
      {ctx.tweaks?.eggEntry === 'wordmark' && (
        <button onClick={() => ctx.nav('shop')} style={{ background: 'none', border: 'none', padding: '6px 2px', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span className="game-font" style={{ fontSize: 13, fontWeight: 800, color: ink, opacity: .7, textDecoration: 'underline', textUnderlineOffset: 3 }}>{L('Eggs')}</span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'goal'. Aspirational instead of inventory-based: it
          shows the rarest tier still missing (grayed, as a thing to chase) rather than what's
          already owned — reframes the entry as "here's what's next", not "here's a tally". */}
      {ctx.tweaks?.eggEntry === 'goal' && (
        <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: chip, padding: '6px 12px 6px 8px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ display: 'inline-flex', filter: PLAYER.eggs.epic > 0 ? 'none' : 'grayscale(1) opacity(.55)' }}><EggShape size={16} rarity="epic" /></span>
          <span className="game-font" style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>
            {PLAYER.eggs.epic > 0 ? L('Epic ready!') : L('Chase the Epic egg')}
          </span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'sticker'. The opposite instinct from 'ghost' — bold
          and bigger rather than quiet, a solid rarity-coloured circle (grey at 0 owned)
          leaning into "fun collectible" rather than "utility icon", no text at all. */}
      {ctx.tweaks?.eggEntry === 'sticker' && (() => {
        const rar = PLAYER.eggs.epic > 0 ? RARITY.epic : PLAYER.eggs.rare > 0 ? RARITY.rare : PLAYER.eggs.common > 0 ? RARITY.common : null;
        return (
          <button onClick={() => ctx.nav('shop')} style={{ width: 46, height: 46, borderRadius: 999, background: rar ? rar.fg : (dark ? 'rgba(255,255,255,.22)' : THEME.surface2), border: 'none', boxShadow: rar ? `0 4px 12px ${rar.fg}55` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="egg" size={21} color={rar ? '#fff' : THEME.fg3} stroke={2.2} />
          </button>
        );
      })()}
      {/* Tweaks: Home · Egg shop entry → 'mini'. The opposite instinct from 'sticker' — as
          small and quiet as a tappable target can reasonably be, no badge, no text, on the
          theory the egg shop is a background errand that shouldn't visually compete with
          points/notifications at all. */}
      {ctx.tweaks?.eggEntry === 'mini' && (
        <button onClick={() => ctx.nav('shop')} style={{ width: 26, height: 26, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="egg" size={13} color={ink} stroke={2.2} />
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'badge'. Figma reference (node 219:309): the egg's
          own real art pokes out past the pill's left edge instead of sitting inside it, and a
          small solid "+" circle — rarity-tinted, matching the poking art rather than a fixed
          brand colour — closes the right end in place of a printed count-only chip. Picking
          'badge' also re-skins the points pill just to its right (below) the same way, so the
          two chips read as one matched pair the way the Figma header does, not two idioms. */}
      {ctx.tweaks?.eggEntry === 'badge' && (
        <button onClick={() => ctx.nav('shop')} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4, background: chip, padding: '6px 5px 6px 17px', borderRadius: '8px 17px 17px 8px', boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex' }}><EggShape size={22} rarity="epic" /></span>
          <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: ink }}>{totalEggs()}</span>
          <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.rEpic, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="plus" size={12} color="#fff" stroke={3} />
          </span>
        </button>
      )}
      {/* Tweaks: Home · Egg shop entry → 'market'. Figma reference (node 277:1891): the egg
          count is dropped entirely — this is a plain doorway to the Shop (the little market-
          stall art + "Shop"), not an inventory readout. Sits AFTER the points pill (order: 2)
          rather than before it like every other entry above, matching the Figma header's
          points-then-shop order — everything else here still reads left-to-right in source
          order, only this variant needs the flip. Padding/icon size are copied straight from
          the points pill just to its left — vertical padding is trimmed as the icon grows
          (2px vs the points pill's 5px) so the pill's OUTER height still matches even though
          this icon now runs bigger (26px vs the coin's 20px) to read at the same visual
          weight as the coin's own ring art. Text skips game-font — that face has no Hangul
          glyphs, so "가게" falls back to the system font, which reads heavier than Fredoka
          at the same numeric weight; 600 is the system font's closest match to how bold
          the points pill's digits actually look, not a literal weight-500 copy. */}
      {ctx.tweaks?.eggEntry === 'market' && (
        <div style={{ position: 'relative', order: 2 }}>
          {/* the tip explains itself on its own (self-opens once, see the effect above) —
              tapping the button itself always goes straight to the Shop, same as every
              other eggEntry variant's button. Same remount-to-replay bounce trick as the
              points pill just to its left (jx-pill-bounce off a key change), so tapping
              this one feels like the same interaction, not a dead plain link — the nav
              itself is held back one beat (the bounce's own duration) so the screen
              doesn't swap out from under the animation before it's had a chance to play. */}
          <button key={`shop-still-${shopBounceKey}`} className={shopBounceKey > 0 ? 'jx-pill-bounce' : undefined}
            onClick={() => { setShowShopTip(false); setShopBounceKey(k => k + 1); setTimeout(() => ctx.nav('shop'), 260); }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: chip, padding: '3px 14px 3px 10px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <ShopIcon size={23} />
            <span style={{ fontSize: 15, fontWeight: 600, color: ink }}>{L('Shop')}</span>
          </button>
          {showShopTip && (
            <React.Fragment>
              <div onClick={() => setShowShopTip(false)} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
              <button onClick={() => { setShowShopTip(false); setShopBounceKey(k => k + 1); setTimeout(() => ctx.nav('shop'), 260); }} className="jx-tip-pop"
                style={{ position: 'absolute', top: 'calc(100% + 14px)', right: 0, width: 178, textAlign: 'left', background: '#fff', border: 'none', borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowXl, zIndex: 46, cursor: 'pointer', fontFamily: 'inherit', transformOrigin: 'top right' }}>
                {/* tail centered under the market-stall icon, same corner-square trick as
                    the points tip — this pill is right-anchored too, so the offset is
                    measured in from the shared right edge: icon (23) + gap (6) + roughly
                    half the icon's own width. */}
                <div style={{ position: 'absolute', top: -6, right: 26, width: 12, height: 12, background: '#fff', borderRadius: 3, transform: 'rotate(45deg)' }} />
                {/* a little common/rare/epic cluster sits next to the copy — same fan-of-three
                    arrangement as the Shop's own hero art, so "알" isn't just a word to a kid
                    who hasn't opened the Shop yet: it's the actual shapes and tiers they're
                    about to go tap on, same painted art the Shop/hatch flow already uses
                    (EggShape), not a new asset invented just for this tooltip. Rare sits
                    centered/forward (bigger, higher z-index, no tilt) with common and epic
                    tucked behind it at an outward tilt, mirroring the reference pose. */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>
                  {/* common.png is the gold-spotted shell and rare.png is the blue one — the
                      rarity names don't match their on-screen color, so the left/center/right
                      slots below are picked by ART COLOR (blue, gold, purple) to match the
                      reference pose, not by rarity order. */}
                  <div style={{ position: 'relative', width: 36, height: 22, flexShrink: 0 }}>
                    <div style={{ position: 'absolute', left: 0, top: 4, transform: 'rotate(-14deg)', zIndex: 1 }}><EggShape size={12} rarity="rare" /></div>
                    <div style={{ position: 'absolute', left: 21, top: 4, transform: 'rotate(14deg)', zIndex: 1 }}><EggShape size={12} rarity="epic" /></div>
                    <div style={{ position: 'absolute', left: 10, top: 0, zIndex: 2 }}><EggShape size={15} rarity="common" /></div>
                  </div>
                  {/* trimmed from the original three-line "buy eggs and hatch them to meet a
                      new buddy" copy — the egg cluster now carries the "buy → hatch" idea
                      visually, so the text only needs to say what's new. */}
                  <p style={{ fontSize: 13, lineHeight: 1.4, color: THEME.fg1, fontWeight: 600, margin: 0 }}>
                    {getLang() === 'ko'
                      ? <><span style={{ color: THEME.brand, fontWeight: 800 }}>{L('Shop')}</span>에서 알을 부화해보세요!</>
                      : <>{'Hatch eggs in the '}<span style={{ color: THEME.brand, fontWeight: 800 }}>{L('Shop')}</span>!</>}
                  </p>
                </div>
              </button>
            </React.Fragment>
          )}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        {/* remounting the pill (via `key`) is what replays the bounce on every trigger, not
            just the first — a CSS animation class alone would not re-run on an unchanged
            element. Tap uses jx-pill-bounce (single overshoot, from the curve only) rather
            than jx-pop (coin-shower use, below) — jx-pop's curve AND keyframe both overshoot,
            which double-bounces at this size and reads as a stutter, not a clean spring. */}
        {/* the pill body is a div, not a button, because the "+" below needs to be its
            OWN button (a real nested <button> inside a <button> is invalid HTML). Tapping
            it now toggles the today/total breakdown below instead of jumping to the Shop —
            that's still one tap away, via "Total points" in the popover. The tap itself also
            bounces the pill, so the popover reads as popping out of that bounce, not just
            appearing beside it. */}
        <div key={playing ? playing.key : `still-${bounceKey}`} onClick={() => { setShowBreakdown(v => !v); setBounceKey(k => k + 1); }}
          className={playing ? 'jx-pop' : (bounceKey > 0 ? 'jx-pill-bounce' : undefined)}
          style={ctx.tweaks?.eggEntry === 'badge'
            ? { display: 'flex', alignItems: 'center', gap: 4, background: chip, padding: '6px 5px 6px 17px', borderRadius: '8px 17px 17px 8px', boxShadow: dark ? 'none' : THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' }
            : { display: 'flex', alignItems: 'center', gap: 5, background: chip, padding: '5px 5px 5px 12px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' }}>
          {ctx.tweaks?.eggEntry === 'badge' ? (
            <>
              <span ref={iconRef} style={{ position: 'absolute', left: -4, top: '50%', transform: 'translateY(-50%)', display: 'inline-flex' }}><SafePointIcon size={22} /></span>
              <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: ink }}>{value.toLocaleString()}</span>
              <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.brand, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="plus" size={12} color="#fff" stroke={3} />
              </span>
            </>
          ) : (
            <>
              <span ref={iconRef} style={{ display: 'inline-flex' }}><SafePointIcon size={20} /></span>
              <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: ink }}>{value.toLocaleString()}</span>
              {/* same "+" close as the drops pill just to its left, but its OWN tap target:
                  it jumps down to today's tasks (where more points are actually earned)
                  instead of opening the shop like the rest of the pill does. stopPropagation
                  keeps that tap from also firing the parent div's shop nav. */}
              <button onClick={(e) => { e.stopPropagation(); document.getElementById('today-tasks')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                aria-label={L("Today's tasks")}
                style={{ width: 20, height: 20, borderRadius: 999, background: THEME.brand, border: 'none', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
                <Icon name="plus" size={12} color="#fff" stroke={3} />
              </button>
            </>
          )}
        </div>
        {/* the coins themselves fly across the whole phone, not just next to the pill —
            see PointsCoinShower, portaled to `.screen`. landAt is the icon's MEASURED
            position (iconRef above), not a hardcoded guess. */}
        {playing && <PointsCoinShower playKey={playing.key} landAt={landAt} />}

        {/* points tip — one plain-language line (what points are FOR), not a stats
            breakdown. A two-row "today / total" ledger read as a mini dashboard bolted
            onto a header pill; games like Clash Royale just explain the currency in a
            single sentence with the currency name picked out in its own colour, so the
            popover answers "what do I do with these" instead of restating the number
            that's already sitting right there in the pill. Same tail-square trick
            AppIntro's tooltip uses, pointing up since this pill sits at the very top of
            the screen. The whole bubble is the door into the Shop now that it's a tip
            rather than a readout. */}
        {showBreakdown && (
          <React.Fragment>
            <div onClick={() => setShowBreakdown(false)} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
            {/* fades + grows from the tail corner (top right, under the pill) on a plain
                ease-out — jx-tip-pop, not another bounce, so it doesn't fight the pill's
                own overshoot right next to it. A short delay after the pill's bounce starts
                is what makes it read as one continuous motion: the pill bounces, the tip
                settles out of it right after. */}
            <button onClick={() => { setShowBreakdown(false); ctx.nav('shop'); }} className="jx-tip-pop"
              style={{ position: 'absolute', top: 'calc(100% + 14px)', right: 0, width: 206, textAlign: 'left', background: '#fff', border: 'none', borderRadius: 16, padding: '13px 15px', boxShadow: THEME.shadowXl, zIndex: 46, cursor: 'pointer', fontFamily: 'inherit', transformOrigin: 'top right', animationDelay: '60ms' }}>
              {/* tail sits under the pill's NUMBER (not the trailing "+" button) — the pill is
                  right-anchored the same as this popover, so the offset is measured in from
                  its shared right edge: "+" button (20) + gap (5) ≈ 25, then roughly centered
                  on the number itself. */}
              <div style={{ position: 'absolute', top: -6, right: 46, width: 12, height: 12, background: '#fff', borderRadius: 3, transform: 'rotate(45deg)' }} />
              <p style={{ fontSize: 13, lineHeight: 1.55, color: THEME.fg1, fontWeight: 600, margin: 0, position: 'relative' }}>
                {getLang() === 'ko'
                  ? <><span style={{ color: THEME.brand, fontWeight: 800 }}>{L('Points')}</span>로 알을 부화하고 새 버디를 모아보세요!</>
                  : <>{'Use '}<span style={{ color: THEME.brand, fontWeight: 800 }}>{L('Points')}</span>{' to hatch eggs and collect new buddies!'}</>}
              </p>
            </button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function SafetyPillS({ ctx, lite, skin }) {
  const dark = skin === 'glass';
  const demo = ctx.demo || {};

  // A child who skipped the permission screen still lands here, so the card owns
  // the consequence: it names each permission that was skipped and what stopped
  // working because of it, rather than only saying "limited". The reasons are the
  // same `warn` lines the skip sheet showed during onboarding — one source, so the
  // promise made at skip time and the state on home can't drift apart.
  const missing = missingPermissions();
  if (missing.length && !demo.offline) {
    const allow = e => {
      e.stopPropagation();
      grantAllPermissions();
      ctx.setDemo && ctx.setDemo(d => ({ ...d, permsOff: false }));
    };
    return (
      <div onClick={() => ctx.nav('safety')} style={{ background: THEME.warningLight, borderRadius: 16, padding: '12px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="shield-alert" size={20} color="#fff" stroke={2.3} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#602f0c' }}>{L('Some protection is off')}</div>
            <div style={{ fontSize: 12, color: '#602f0c', opacity: .85, lineHeight: 1.35 }}>
              {ctx.lang === 'ko' ? `켜지 않은 권한이 ${missing.length}개 있어요` : `${missing.length} permission${missing.length > 1 ? 's' : ''} still off`}
            </div>
          </div>
          <button onClick={allow} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.warning, color: '#fff', fontWeight: 800, fontSize: 12.5, padding: '8px 13px', borderRadius: 999 }}>
            <Icon name="shield-check" size={13} color="#fff" stroke={2.6} />{L('Turn on')}
          </button>
        </div>
        <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid rgba(96,47,12,.13)', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {missing.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <Icon name={p.icon} size={15} color={THEME.warning} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#602f0c' }}>{L(p.name)}</div>
                <div style={{ fontSize: 11.5, color: '#602f0c', opacity: .8, lineHeight: 1.4 }}>{L(p.warn)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Offline / limited-protection states take over the protection card — the app
  // keeps running, but this is where the child sees (and can fix) reduced cover.
  if (demo.offline || demo.limited) {
    const offline = demo.offline;   // offline wins if both are set
    const accent = offline ? THEME.danger : THEME.warning;
    const bg = offline ? THEME.dangerLight : THEME.warningLight;
    const ink = offline ? '#7a2418' : '#602f0c';
    const title = offline ? L("You're offline") : L('Limited protection');
    const sub = offline ? L('Protection paused — reconnect to stay safe.') : L('Some warnings are off right now.');
    const cta = offline ? L('Retry') : L('Turn on');
    const fix = e => { e.stopPropagation(); ctx.setDemo && ctx.setDemo(d => ({ ...d, offline: false, limited: false })); };
    return (
      <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: bg, borderRadius: 16, padding: '12px 14px', cursor: 'pointer' }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={offline ? 'wifi-off' : 'shield-alert'} size={20} color="#fff" stroke={2.3} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{title}</div>
          <div style={{ fontSize: 12, color: ink, opacity: .85, lineHeight: 1.35 }}>{sub}</div>
        </div>
        <button onClick={fix} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: accent, color: '#fff', fontWeight: 800, fontSize: 12.5, padding: '8px 13px', borderRadius: 999 }}>
          <Icon name={offline ? 'rotate-cw' : 'shield-check'} size={13} color="#fff" stroke={2.6} />{cta}
        </button>
      </div>
    );
  }

  const ok = !lite;
  // fully protected (Smart, every permission on) reads green; Lite mode keeps the
  // warm amber it always had — same green/amber split ChildHome.jsx already uses.
  const accent = ok ? THEME.success : THEME.warning;
  const bg = dark ? 'rgba(255,255,255,.16)' : (ok ? THEME.successLight : THEME.warningLight);
  const ink = dark ? '#fff' : (ok ? '#274427' : '#602f0c');
  return (
    <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: bg, borderRadius: 16, padding: '12px 14px', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={ok ? 'shield-check' : 'shield'} size={20} color="#fff" stroke={2.3} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
        <div style={{ fontSize: 12, color: ink, opacity: .85 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
      </div>
      <Icon name="chevron-right" size={18} color={ink} stroke={2.5} />
    </div>
  );
}

// Tweaks: Home · Egg shop entry → 'banner'. Same card idiom as SafetyPillS just above it
// (icon chip + title/subtitle + chevron) rather than a new visual pattern, and — unlike the
// header pill option — it doesn't compete for space with the points pill and bell.
function EggShopBannerS({ ctx }) {
  const eggs = totalEggs();
  // Same treatment as the "Your eggs" row in Shop.jsx (rarity-tinted gradient card,
  // 64×80 egg box, EggShape size 56) — this is the one place on Home that should
  // look exactly like the real card it leads to, not a smaller reference to it.
  const rar = RARITY.epic;
  return (
    <div onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}40`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
      <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EggShape size={56} rarity="epic" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{eggs > 0 ? `${eggs} ${L('eggs waiting to hatch')}` : L('Get your first egg')}</div>
        <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>{L('Tap to open the shop')}</div>
      </div>
      <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 999, background: rar.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="chevron-right" size={16} color="#fff" stroke={2.8} />
      </span>
    </div>
  );
}

function WinsListS({ ctx }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {HOME_WINS_S.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: r.bg(), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={r.icon} size={18} color={r.color()} stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(r.t)}</div>
            <div style={{ fontSize: 12, color: THEME.fg2 }}>{L(r.s)}</div>
          </div>
          <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{r.time}</span>
        </div>
      ))}
    </div>
  );
}

// Today's tasks — small daily missions that pay a bonus. Undone rows are
// tappable (kid checks one off → earns its points); done rows read as earned.
function TodayTasksS({ accent, ctx }) {
  const [tasks, setTasks] = React.useState(TODAY_TASKS);
  const done = tasks.filter(t => t.done).length;
  const earned = tasks.filter(t => t.done).reduce((s, t) => s + t.reward, 0);
  const allDone = done === tasks.length;
  // Clearing the last mission is the biggest thing that happens on this screen all day, and
  // it used to pass with a line of text. It now rains from the top of the phone.
  //
  // Fired on the *transition*, not on `allDone`: a child who already finished today would
  // otherwise get confetti every time they opened the app, which turns a reward into wallpaper.
  const [cheer, setCheer] = React.useState(false);
  const complete = (id) => {
    const target = tasks.find(t => t.id === id);
    if (!target || target.done) return;   // a no-op tick makes no sound and no state change
    // the state updater stays pure — firing the celebration from inside it would run twice
    // under StrictMode's double-invoke, and updaters are not the place for side effects
    const next = tasks.map(t => (t.id === id ? { ...t, done: true } : t));
    const wasAll = tasks.every(t => t.done);
    setTasks(next);
    // clearing the last task is a bigger moment than any single tick — a fuller
    // cheer alongside the confetti, one ding for every tick before it
    if (!wasAll && next.every(t => t.done)) { sfx.success(); setCheer(true); }
    else sfx.taskDone();
  };
  React.useEffect(() => {
    if (!cheer) return undefined;
    const t = setTimeout(() => setCheer(false), 2800);   // outlives the slowest piece's fall
    return () => clearTimeout(t);
  }, [cheer]);

  return (
    // id is the header points pill's "+" scroll target (HomeActionsS) — only one
    // instance of this card is ever mounted at a time, so the id can't collide.
    <div id="today-tasks" style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
      {/* the same celebration the egg hatch plays — one 'you did it' moment, learned once */}
      {cheer && <HatchCelebration screen color={accent} accent={THEME.gold} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
          <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(accent, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="list-checks" size={17} color={shade(accent, -28)} stroke={2.3} /></span>
          {L("Today's tasks")}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2 }}>{done}/{tasks.length} {L('done')}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.map(t => (
          // A task is a real-world action, not a checkbox — so the row doesn't "complete"
          // on tap. The seal shows status (earned = solid brand, still-to-do = muted), and
          // an explicit 'Go' pill takes the child off to actually do it (here: marks it done).
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', background: t.done ? THEME.surface2 : '#fff', border: `1.5px solid ${t.done ? 'transparent' : THEME.border}`, borderRadius: 14, padding: '10px 12px' }}>
            <SealCheck size={30} bg={t.done ? THEME.success : THEME.border} tick={t.done ? '#fff' : THEME.fg3} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: t.done ? THEME.fg3 : THEME.fg1, textDecoration: t.done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(t.title)}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: t.done ? THEME.success : '#9e7300' }}>+{t.reward}</span>
                <span style={{ fontSize: 11.5, fontWeight: 600, color: THEME.fg3 }}>{L(t.reward === 1 ? 'point' : 'points')}</span>
              </div>
            </div>
            {t.done ? (
              <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: THEME.success }}>
                <Icon name="check" size={14} color={THEME.success} stroke={2.8} />{L('Done')}
              </span>
            ) : (
              // soft-tint pill — 'Go' takes the child to the screen where they do the task
              <button onClick={() => complete(t.id)} style={{ flexShrink: 0, background: THEME.successLight, color: shade(THEME.success, -18), border: 'none', borderRadius: 999, padding: '8px 18px', fontSize: 13.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', boxShadow: 'none' }}>{L('Go')}</button>
            )}
          </div>
        ))}
      </div>

      {allDone && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: THEME.successLight, borderRadius: 12, padding: '10px 12px' }}>
          <Icon name="party-popper" size={17} color={THEME.success} stroke={2.3} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.success }}>{L('All tasks done!')}</span>
          <span className="game-font" style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 500, color: THEME.success }}>+{earned} {L('bonus earned today')}</span>
        </div>
      )}
    </div>
  );
}

// duplicated stat tile (mirrors ChildScreens' StatCard) for the Original copy
function StatCardS({ icon, color, bg, value, label, big }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Icon name={icon} size={18} color={color} stroke={2.4} />
      </div>
      <div className="game-font" style={{ fontSize: big ? 26 : 22, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · ORIGINAL  (copy of ChildHome)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleOriginal({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(THEME.brand) }}>
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        {/* character hero */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', borderRadius: 24, padding: '18px 18px 20px', marginBottom: 14, cursor: 'pointer', overflow: 'hidden', background: `linear-gradient(160deg, ${shade(THEME.brand, 78)} 0%, ${THEME.surface} 70%)`, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Badge variant={c.rarity === 'epic' ? 'epic' : c.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[c.rarity].label)}</Badge>
              <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 8 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
            </div>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 10px' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
            <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatCardS icon="award" color={THEME.gold} bg={THEME.goldLight} value={(PLAYER.safeMinutesToday * SAFE_PT_PER_MIN).toLocaleString()} label={L('Points today')} big />
          <StatCardS icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Safe days')} big />
        </div>

        {/* safe-walk points today — F-13 */}
        <div onClick={() => ctx.tabTo('rewards')} style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(c.color, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L('Safe walking today')}
            </span>
            <span className="game-font" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', padding: '5px 11px', borderRadius: 999, fontWeight: 500, fontSize: 13 }}><SafePointIcon size={16} />+{(PLAYER.safeMinutesToday * SAFE_PT_PER_MIN).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 12, color: THEME.fg2 }}>{PLAYER.safeMinutesToday} {L('min phone-free')} · {SAFE_PT_PER_MIN} {L('points per safe minute')}</div>
        </div>

        {/* today's tasks — daily missions that pay a bonus */}
        <TodayTasksS accent={c.color} ctx={ctx} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · SPOTLIGHT
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleSpotlight({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const heroBg = `linear-gradient(180deg, ${shade(c.color, 64)} 0%, ${shade(c.color, 96)} 46%, ${THEME.surface2} 100%)`;

  const GlassPill = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(6px)', borderRadius: 18, padding: '12px 14px', boxShadow: THEME.shadowSoft, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} color={color} stroke={2.4} />
      </div>
      <div>
        <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      <div style={{ background: heroBg, padding: '52px 18px 64px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ fontSize: 13, color: THEME.fg1, opacity: .7, fontWeight: 700 }}>{L('Good afternoon')}</span>
            <span className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</span>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ textAlign: 'center', cursor: 'pointer', marginTop: 2 }}>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: -2 }}>
            <span className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ fontSize: 12.5, color: THEME.fg1, opacity: .68, fontWeight: 600, marginTop: 2 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 240, margin: '12px auto 0' }}>
            <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginTop: -34, position: 'relative', zIndex: 2 }}>
        <GlassPill icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
        <GlassPill icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
      </div>

      <div style={{ background: THEME.surface2, borderRadius: '28px 28px 0 0', marginTop: 18, padding: '8px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(c.color, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · MAP  (walk-safety map leads; buddy + goal live in a bottom sheet)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleMap({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ok = !lite;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* MAP HERO */}
      <div style={{ position: 'relative', height: 430, overflow: 'hidden', background: 'linear-gradient(160deg, #eef2ee 0%, #e7edf2 100%)' }}>
        {/* roads + safe route */}
        <svg width="100%" height="430" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
          <rect x="44" y="70" width="120" height="120" rx="10" fill="#e2e7e1" />
          <rect x="232" y="120" width="150" height="140" rx="10" fill="#e2e7e1" />
          <rect x="60" y="250" width="140" height="120" rx="10" fill="#e2e7e1" />
          <path d="M0 220 H390" stroke="#fff" strokeWidth="22" />
          <path d="M210 0 V430" stroke="#fff" strokeWidth="22" />
          <path d="M0 220 H390" stroke="#dfe3df" strokeWidth="22" strokeDasharray="2 26" />
          {/* the safe walk so far */}
          <path d="M210 360 V220 H80" fill="none" stroke={c.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 16" opacity="0.9" />
        </svg>

        {/* danger zones (smart mode) */}
        {ok && [[300, 150], [120, 300]].map(([x, y], i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: 999, background: 'rgba(209,69,50,.14)', border: '2px dashed rgba(209,69,50,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert-triangle" size={16} color={THEME.danger} stroke={2.6} />
          </div>
        ))}

        {/* current location — pulsing dot */}
        <div style={{ position: 'absolute', left: 210, top: 360, marginLeft: -22, marginTop: -22, width: 44, height: 44 }}>
          <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: c.color, opacity: .35 }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: 999, background: c.color, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={26} />
          </div>
        </div>

        {/* top status chip + bell */}
        <div style={{ position: 'absolute', top: 54, left: 0, right: 0, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 999, padding: '8px 14px 8px 10px', boxShadow: THEME.shadowLg, cursor: 'pointer' }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: ok ? THEME.success : THEME.warning, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ok ? 'shield-check' : 'shield'} size={16} color="#fff" stroke={2.4} /></span>
            <span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</span>
          </div>
          <button onClick={() => ctx.nav('notifications')} style={{ position: 'relative', width: 42, height: 42, borderRadius: 999, background: '#fff', border: 'none', boxShadow: THEME.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={19} color={THEME.fg1} stroke={2} />
            <span style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 999, background: THEME.danger, border: '2px solid #fff' }} />
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div style={{ position: 'relative', marginTop: -30, borderRadius: '28px 28px 0 0', background: THEME.surface2, padding: '10px 18px 0' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />

        {/* greeting + buddy */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: shade(c.color, 86), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={48} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}, {PLAYER.name}</div>
            <div className="game-font" style={{ fontSize: 19, fontWeight: 500, color: THEME.fg1 }}>{c.name} · {L('Level')} {c.level}</div>
          </div>
          <HomeActionsS ctx={ctx} />
        </div>

        {/* today's goal */}
        <div onClick={() => ctx.nav('safety')} style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(c.color, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* points + streak */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCardS icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} big />
          <StatCardS icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Day streak')} big />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · FOCUS  (goal ring around the buddy, with a halo + minutes pill)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleFocus({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const pct = Math.min(1, c.xp / c.xpMax);   // ring tracks the buddy's XP toward the next level
  const R = 94, SW = 9, ring = 2 * (R + SW), circ = 2 * Math.PI * R;
  // Brand chrome (wash, ring, accents) is ALWAYS the JoanX green — it does not follow
  // the equipped buddy's hue. Only the Mascot illustration keeps its own species colour.
  const brand = THEME.brand;
  // mixed "aurora" wash — analogous green tones from the brand hue, fading to sand.
  const [w1, w2, w3] = [mixHue(brand, -24, 0.06, 0.78), mixHue(brand, 4, 0.10, 0.72), mixHue(brand, 26, 0.14, 0.6)];
  const bg = `linear-gradient(180deg, ${THEME.surface2}00 0%, ${THEME.surface2}00 210px, ${THEME.surface2} 540px), linear-gradient(125deg, ${w1} 0%, ${w2} 50%, ${w3} 100%), ${THEME.surface2}`;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: bg }}>
      {/* sticky so the identity + currency bar stays put while the ring/buddy/tasks
          scroll underneath it — no background, so it stays part of the same wash
          rather than becoming an opaque bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 5, padding: '10px 18px 14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {/* the buddy's face leads the greeting, and doubles as the way into the profile */}
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: shade(brand, -42) }}>{L('Next level')}</span>
      </div>

      {/* goal ring + buddy */}
      <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', width: ring, height: ring, margin: '8px auto 0', cursor: 'pointer' }}>
        <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={brand} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* the up-shift lives on this outer wrapper, not the jx-float div itself — jx-float's
              own keyframe animation drives that element's transform every frame, which would
              silently stomp a static translateY set on the same node */}
          <div style={{ transform: 'translateY(-14px)' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={160} /></div>
          </div>
        </div>
        {/* XP pill on the ring — progress toward the buddy's next level */}
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 999, padding: '6px 14px', boxShadow: THEME.shadowSoft, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <Icon name="zap" size={15} color={brand} fill={brand} stroke={2.4} />
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: shade(brand, -30) }}>{c.xp}/{c.xpMax} XP</span>
        </div>
      </div>

      {/* buddy identity */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '18px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
          <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
        </div>
        <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>

        {/* egg shop entry — the painted 3-egg badge, floating beside the level/stage line.
            Tweaks: Home · Egg badge shine picks which effect (EggShopBadgeS above) it wears.
            Hidden by default (Tweaks: Home · Egg badge) — one too many "go hatch an egg"
            entry points alongside the header pill and the Shop screen itself. */}
        {ctx.tweaks?.eggBadge === 'on' && <EggShopBadgeS ctx={ctx} />}
      </div>

      {/* safety + stats */}
      <div style={{ padding: '18px 18px 0' }}>
        {/* Tweaks: Home · Egg shop entry → 'banner' */}
        {ctx.tweaks?.eggEntry === 'banner' && <div style={{ marginBottom: 14 }}><EggShopBannerS ctx={ctx} /></div>}
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {/* 2nd card is swappable — Tweaks: Home · 2nd stat card. 'points' (the original) just
              repeats the header's points pill, which is the whole reason this is swappable. */}
          {(() => {
            const statB = HOME_STAT_B_OPTIONS.find(o => o.id === ctx.tweaks?.homeStatB) || HOME_STAT_B_OPTIONS[0];
            return [[statB.icon, statB.color(), statB.value(), L(statB.sub), statB.nav], ['flame', THEME.joy, PLAYER.streak, L('Day streak'), 'streak']];
          })().map((s, i) => (
            <button key={i} onClick={() => ctx.nav(s[4])} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '11px 14px', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </button>
          ))}
        </div>
        {/* today's tasks — daily missions that pay a bonus */}
        <TodayTasksS accent={brand} ctx={ctx} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · COVER  (home with a soft colored header band; white cards below)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleCover({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const headBg = `linear-gradient(160deg, ${shade(c.color, 58)} 0%, ${tint(c.color, .82)} 100%)`;
  const ink = shade(c.color, -52);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* COLORED HEADER BAND */}
      <div style={{ background: headBg, borderRadius: '0 0 30px 30px', padding: '52px 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: ink, opacity: .85, fontWeight: 700 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        {/* buddy row */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, cursor: 'pointer' }}>
          <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={88} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
              <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
            </div>
            <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600, marginTop: 1 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
          </div>
        </div>

        {/* today's goal lives in the header */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: ink }}>{L("Today's safe-walk goal")}</span>
            <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: ink }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color="#fff" track="rgba(255,255,255,.45)" height={12} />
        </div>
      </div>

      {/* WHITE CONTENT — overlaps the band */}
      <div style={{ padding: '0 18px', marginTop: -16, position: 'relative' }}>
        <div style={{ marginBottom: 16 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points'), 'rewards'], ['flame', THEME.joy, PLAYER.streak, L('Day streak'), 'streak']].map((s, i) => (
            <button key={i} onClick={() => ctx.nav(s[4])} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '11px 14px', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 9, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · WAVE  (friendly curved color header flowing into white content)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleWave({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ok = !lite;
  const float = { background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard };
  const ink = shade(c.color, -50);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: '#fff' }}>
      {/* curved color header */}
      <div style={{ position: 'relative', background: `linear-gradient(160deg, ${shade(c.color, 74)} 0%, ${tint(c.color, .85)} 100%)`, paddingTop: 50 }}>
        <div style={{ padding: '8px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: ink, opacity: .8, fontWeight: 700 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ textAlign: 'center', cursor: 'pointer', padding: '0 18px 30px' }}>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: -2 }}>
            <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .78, fontWeight: 600, marginTop: 1 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
        </div>

        {/* the wave */}
        <svg viewBox="0 0 390 34" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 34, display: 'block' }}>
          <path d="M0 34 V14 Q195 40 390 14 V34 Z" fill="#fff" />
        </svg>
      </div>

      {/* white content */}
      <div style={{ padding: '8px 18px 0' }}>
        {/* safety */}
        <div onClick={() => ctx.nav('safety')} style={{ ...float, padding: '13px 15px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: ok ? THEME.success : THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={ok ? 'shield-check' : 'shield'} size={20} color="#fff" stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
            <div style={{ fontSize: 12, color: THEME.fg2 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.4} />
        </div>

        {/* goal */}
        <div onClick={() => ctx.nav('safety')} style={{ ...float, padding: 16, marginBottom: 12, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(c.color, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')], ['flame', THEME.joy, PLAYER.streak, L('Day streak')]].map((s, i) => (
            <div key={i} style={{ ...float, flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · PROFILE  (light — one combined profile card: a horizontal buddy
// hero with an inline stat strip baked in, then goal + safety below. A
// different composition from the centered-buddy + stacked-cards layouts.)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleProfile({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ink = shade(c.color, -52);
  const heroBg = `linear-gradient(155deg, ${shade(c.color, 64)} 0%, ${tint(c.color, .82)} 100%)`;

  const InlineStat = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon name={icon} size={16} color={color} stroke={2.4} style={{ marginBottom: 3 }} />
      <div className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(THEME.brand) }}>
      {/* header */}
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
          <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        {/* combined profile card — horizontal buddy hero + inline stat strip */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: THEME.shadowCard, background: '#fff', marginBottom: 14 }}>
          <div style={{ background: heroBg, padding: '16px 16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={104} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
              <div className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1, marginTop: 6 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: ink, opacity: .82, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
                <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color="#fff" track="rgba(255,255,255,.45)" glow height={8} /></div>
                <span className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px' }}>
            <InlineStat icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
            <div style={{ width: 1, height: 32, background: THEME.border }} />
            <InlineStat icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
            <div style={{ width: 1, height: 32, background: THEME.border }} />
            <InlineStat icon="footprints" color={c.color} value={`${PLAYER.safeMinutesToday}`} label={L('min')} />
          </div>
        </div>

        {/* safety */}
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        {/* goal */}
        <div onClick={() => ctx.nav('safety')} style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: tint(c.color, .88), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

      </div>
    </div>
  );
}

// Simple-set registry + router (ids prefixed "simple-").
const HOME_LAYOUTS_SIMPLE = [
  { id: 'simple-original', label: 'Original' },
  { id: 'simple-spotlight', label: 'Spotlight' },
  { id: 'simple-map', label: 'Map' },
  { id: 'simple-focus', label: 'Focus' },
  { id: 'simple-cover', label: 'Cover' },
  { id: 'simple-wave', label: 'Wave' },
  { id: 'simple-profile', label: 'Profile' },
];
function HomeVariantSimple({ variant, ctx }) {
  switch (variant) {
    case 'simple-spotlight': return <HomeSimpleSpotlight ctx={ctx} />;
    case 'simple-map':       return <HomeSimpleMap ctx={ctx} />;
    case 'simple-focus':     return <HomeSimpleFocus ctx={ctx} />;
    case 'simple-cover':     return <HomeSimpleCover ctx={ctx} />;
    case 'simple-wave':      return <HomeSimpleWave ctx={ctx} />;
    case 'simple-profile':   return <HomeSimpleProfile ctx={ctx} />;
    default:                 return <HomeSimpleOriginal ctx={ctx} />;
  }
}

export { HomeVariantSimple, HOME_STAT_B_OPTIONS };
