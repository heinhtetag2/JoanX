// JoanX — child app · Shop

import React from 'react';
import { activeEggs, buyEgg, eggById, eggCount, PLAYER, totalEggs } from '../core/data.jsx';
import { Icon, RARITY, SafePointIcon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { EggShape, requestMotionPermission, EggHatchFlow } from './EggHatch.jsx';
import { sfx } from '../core/sound.jsx';

// ── Points & Shop ────────────────────────────────────────────────────
// Buying is only ONE of the ways an egg arrives (A-2.1) — missions, distance
// milestones, level-ups, events and achievements all grant them too, and those land
// unhatched in PLAYER.eggs. So this screen has two halves: the eggs you already own
// (hatch them now) and the shop (buy another). Both funnel into the same hatch flow.
// The tier roll and the buddy draw live in data.jsx (hatchEgg) — probability is
// business policy, not screen logic, and the missions beat hatches through it too.
// `eggShake` gates the shake-to-hatch gesture and the affordance that teaches it. Off by
// default: the tap is the whole interaction for now, and a block of copy explaining a second
// way to do the thing you just did competes with the egg it sits under.
function Shop({ ctx, eggShake = false, eggHatch = 'pop', eggShopLayout = 'merged', eggCardRadius = 20 }) {
  const gradualCrack = eggHatch === 'crack';   // Tweaks: Egg hatch → gradual crack vs quick pop
  const [pts, setPts] = React.useState(PLAYER.points);
  const [owned, setOwned] = React.useState(() => ({ ...PLAYER.eggs }));
  const [toast, setToast] = React.useState(null);

  // egg & hatch flow state — { egg, bgRarity } | null. The flow itself (egg → crack →
  // reveal) lives in EggHatchFlow (EggHatch.jsx), shared with the battle-win egg drop.
  const [hatch, setHatch] = React.useState(null);

  // The overlay opens on the EGG alone. Nothing is rolled and nothing is spent yet — the egg
  // is only consumed, and the buddy only drawn, at the reveal (hatchFromInventory). Rolling
  // here would mean an abandoned animation had already decided the character and eaten the egg.
  // `bg` is normally the same as the egg's own rarity (a real hatch's backdrop always matches
  // its shell) — it only ever differs under the Tweaks preview below, which deliberately
  // mismatches them so an egg shape and a backdrop can be judged against each other.
  const openHatch = (egg, bg = egg.rarity) => {
    if (eggShake) requestMotionPermission();   // iOS 13+: must be asked from this user gesture
    setHatch({ egg, bgRarity: bg });
  };

  // Tweaks → "Preview hatch" jumps straight here with the egg tier and the background tier
  // picked independently (previewEgg / previewBg params) — the point is comparing art, so the
  // two are not forced to match like a real hatch. The egg is granted on the spot (a dev-only
  // poke to PLAYER.eggs, not a real acquisition) so it can be checked without actually earning
  // or buying one first.
  React.useEffect(() => {
    if (ctx.params?.preview !== 'hatch') return;
    const eggRarity = ctx.params.previewEgg;
    if (!eggById(eggRarity)) return;
    PLAYER.eggs[eggRarity] = Math.max(1, PLAYER.eggs[eggRarity] || 0);
    setOwned({ ...PLAYER.eggs });
    openHatch(eggById(eggRarity), ctx.params.previewBg || eggRarity);
    // depends on the params themselves — Tweaks jumps to this SAME 'shop' screen for every
    // combination, so re-picking egg/background re-renders this component rather than
    // remounting it. Deps on just `preview` would only ever open the FIRST combo picked.
  }, [ctx.params?.preview, ctx.params?.previewEgg, ctx.params?.previewBg]);

  // A-2.3 — buying an egg puts an EGG in the bag. It does not hatch it: the rules live in
  // data.jsx (buyEgg), so no screen can take the points without handing over the egg. The
  // hatch overlay opens straight after as a convenience, but the egg is already yours — back
  // out of it and it is sitting in "Your eggs", waiting.
  const purchase = (egg) => {
    const res = buyEgg(egg, PLAYER);
    if (!res.ok) {
      const msg = res.reason === 'not-for-sale' ? L('Only from events and missions')
        : res.reason === 'level' ? `${L('Unlocks at Lv')} ${res.need}`
        : L('Not enough points yet');
      setToast({ ok: false, msg }); setTimeout(() => setToast(null), 1600);
      return;
    }
    sfx.purchase();
    setPts(PLAYER.points);
    setOwned({ ...PLAYER.eggs });
    openHatch(egg);
  };

  // A-2.3 — hatching costs nothing beyond the egg itself. No power, no energy, no second
  // currency: the egg was already paid for (or earned), and pressing Hatch is free.
  const hatchOwned = (egg) => {
    if (eggCount(egg.id) < 1) return;
    openHatch(egg);   // the egg is spent at the REVEAL, not here — see EggHatchFlow
  };

  const closeHatch = () => setHatch(null);

  // egg cards used to sit as flat white boxes on the crystal backdrop — a mismatch once
  // the art itself carries the color. This is a frosted-glass panel instead: it picks up
  // the light behind it (blur + a soft rarity-tinted rim) rather than blocking it out, so
  // the list reads as part of the shop rather than a form pasted over the art. The tint is
  // a dark scrim, not a light one — a translucent WHITE haze looked fine over the old dark
  // purple backdrop, but over the current bright-green art it washed out to near-white on
  // near-white, and the ~72%-opacity subtext all but disappeared. A dark tint keeps the card
  // legible against any backdrop brightness/hue the art ever ships in, purple or green.
  const glassCard = (rar, accent, opacity = 1) => ({
    position: 'relative',
    background: 'linear-gradient(150deg, rgba(8,10,22,0.52), rgba(8,10,22,0.38) 75%)',
    backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
    border: `1.5px solid ${rar.fg}${accent ? '99' : '3d'}`, borderRadius: eggCardRadius, padding: 16,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.14)${accent ? `, 0 0 0 1px ${rar.fg}22` : ''}`,
    opacity,
  });

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* egg shop backdrop — the ornate crystal/egg-nest frame art. It's ONE image sized to
          the phone's own aspect ratio (852×1846 ≈ 390×844), so `cover` fills it exactly with
          no crop. Pinned here as a sibling of the scroll container, NOT inside it, so the
          frame's top/bottom borders stay glued to the actual screen edges no matter how far
          the list below scrolls — a background painted into the scrolling content itself
          would drag the bottom border up into the middle of the screen after one swipe. */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/egg/eggbackgroundsop.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      {/* content sits centered in the frame's open middle — between the egg-nest crown at
          the top and the crystal pedestal at the bottom — rather than pinned under the
          header the way a long scrolling list would be. With only the egg cards left on
          this screen there's little enough content that it reads as placed IN the art,
          not laid over it. 'carousel' cards run taller than the merged/split rows, so the
          same centering leaves a bigger gap above the "Points" title than it does for
          those — nudged up with a smaller top pad rather than turning off centering. */}
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: eggShopLayout === 'carousel' ? 96 : 102, paddingBottom: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {/* No header at all — this screen has nothing "behind" it worth a back chevron; it's
          a state the child jumps INTO from Home/the point pill, not a place navigated deeper
          into. Exit is the bottom Close button below, same as the battle preview / walking
          block pattern elsewhere in the app. The "Points" title moved down into the calm
          open gradient below the crown, as a proper heading with the screen's actual point
          balance — which nothing on this screen showed before. */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ textAlign: 'center', margin: '2px 0 34px' }}>
          {/* no plate behind the title — just the text, same as any other full-bleed-art
              screen in the app (ScreenHeader's `light` mode). A single soft-but-present
              shadow (a tight dark core + a wider soft spread) is what carries it against
              the backdrop's lighter green, without reading as an outline stroke. */}
          <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, color: '#fff', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,.55), 0 4px 14px rgba(0,0,0,.45)' }}>{L('Points')}</h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px 5px 10px' }}>
            <SafePointIcon size={16} />
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{pts.toLocaleString()}</span>
          </div>
        </div>
        {/* Tweaks: "Egg shop layout" — 'merged' folds the two lists below into one
            (each tier is either "own it → Hatch" or "don't → Buy", never both at once);
            'carousel' is the same merged one-card-per-tier model, just blown up big and
            snap-scrolled sideways instead of squeezed three-abreast — one tier fills most
            of the screen at a time, swipe for the next; 'split' is the original two-section
            layout, kept for comparison. */}
        {eggShopLayout === 'carousel' ? (
          <div className="no-sb" style={{ display: 'flex', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', margin: '0 -16px', padding: '2px 16px 10px' }}>
            {activeEggs().map(egg => {
              const rar = RARITY[egg.rarity];
              const n = owned[egg.id] || 0;
              const canHatch = n > 0;
              const locked = PLAYER.level < egg.minLevel;
              const unbuyable = egg.price == null;
              const afford = !unbuyable && pts >= egg.price;
              const on = !unbuyable && !locked && afford;
              const desc = canHatch ? L('Earned — ready to hatch') : locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy');
              return (
                <div key={egg.id} style={{ ...glassCard(rar, canHatch || unbuyable, locked && !canHatch ? .78 : 1), flexShrink: 0, width: '74%', scrollSnapAlign: 'center', padding: '26px 18px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{L(egg.name)}</span>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 1.4 }}>{desc}</div>
                  <div style={{ position: 'relative', width: '100%', height: 168, margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked && !canHatch ? 'grayscale(.5)' : 'none' }}>
                    <EggShape size={140} rarity={egg.rarity} />
                    {canHatch && n > 1 && (
                      <span style={{ position: 'absolute', top: 4, right: '18%', fontSize: 12, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '2px 8px', borderRadius: 999 }}>×{n}</span>
                    )}
                  </div>

                  {canHatch ? (
                    <button onClick={() => hatchOwned(egg)} className="jx-press" style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.gold, color: '#fff', borderRadius: 999, padding: '13px 0', fontSize: 15, fontWeight: 800, boxShadow: '0 3px 10px rgba(209,153,0,.4)' }}>
                      {L('Hatch')}
                    </button>
                  ) : unbuyable ? (
                    <span style={{ width: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '13px 0', fontSize: 14, fontWeight: 800 }}>
                      <Icon name="gift" size={15} color={THEME.gold} stroke={2.3} />{L('Reward')}
                    </span>
                  ) : locked ? (
                    <span style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.85)', color: THEME.fg3, borderRadius: 999, padding: '13px 0', fontSize: 14, fontWeight: 800 }}>
                      {`${L('Lv')}.${egg.minLevel}`}
                    </span>
                  ) : (
                    <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? THEME.gold : 'rgba(255,255,255,0.85)', color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '13px 0', fontSize: 15, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: on ? '0 3px 10px rgba(209,153,0,.4)' : 'none' }}>
                      <SafePointIcon size={16} />
                      {egg.price.toLocaleString()}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : eggShopLayout === 'merged' ? (
          <React.Fragment>
            {/* three cards side by side, not stacked rows — title on top, the egg sitting in
                its own framed slot, price pill anchored at the bottom. Same "hatch what you
                have or buy what you don't" card underneath, just turned upright so all three
                tiers compare at a glance instead of scrolling past one another. */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, alignItems: 'stretch' }}>
              {activeEggs().map(egg => {
                const rar = RARITY[egg.rarity];
                const n = owned[egg.id] || 0;
                const canHatch = n > 0;
                const locked = PLAYER.level < egg.minLevel;      // level gate
                const unbuyable = egg.price == null;             // reward-only
                const afford = !unbuyable && pts >= egg.price;
                const on = !unbuyable && !locked && afford;      // fully purchasable now
                // same status copy the old row layout showed as its description line —
                // unbuyable eggs share the "hatch a random buddy" flavor text too, same
                // as before, since only the ACTION below (Reward vs Buy) tells them apart.
                const desc = canHatch ? L('Earned — ready to hatch') : locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy');
                return (
                  // was `flex: 1` on the egg slot below, which grew to soak up whatever
                  // extra height `alignItems: stretch` gave this card to match its tallest
                  // sibling — that shoved the egg toward the card's vertical center and the
                  // button down with it. Dropping the grow packs title → desc → egg → button
                  // at the TOP instead; any leftover stretch height now just falls below the
                  // button as plain empty space, not between the content and it.
                  <div key={egg.id} style={{ ...glassCard(rar, canHatch || unbuyable, locked && !canHatch ? .78 : 1), flex: 1, minWidth: 0, padding: '16px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 800, color: '#fff', textAlign: 'center' }}>{L(egg.name)}</span>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.72)', textAlign: 'center', lineHeight: 1.35, minHeight: 27 }}>{desc}</div>
                    {/* egg art sits straight on the card now — no extra bordered/glow box
                        boxing it in a second time. Fixed height (not flex:1) so it hugs the
                        description above it instead of floating to the card's center. Extra
                        margin top/bottom gives it room to breathe from both neighbors instead
                        of crowding straight into the description text and the button. */}
                    <div style={{ position: 'relative', width: '100%', height: 78, margin: '4px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked && !canHatch ? 'grayscale(.5)' : 'none' }}>
                      <EggShape size={60} rarity={egg.rarity} />
                      {canHatch && n > 1 && (
                        <span style={{ position: 'absolute', top: -4, right: -8, fontSize: 10, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '1px 6px', borderRadius: 999 }}>×{n}</span>
                      )}
                    </div>

                    {canHatch ? (
                      <button onClick={() => hatchOwned(egg)} className="jx-press" style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.gold, color: '#fff', borderRadius: 999, padding: '5px 0', fontSize: 12.5, fontWeight: 800, boxShadow: '0 3px 10px rgba(209,153,0,.4)' }}>
                        {L('Hatch')}
                      </button>
                    ) : unbuyable ? (
                      <span style={{ width: '100%', textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '5px 0', fontSize: 11.5, fontWeight: 800 }}>
                        <Icon name="gift" size={12} color={THEME.gold} stroke={2.3} />{L('Reward')}
                      </span>
                    ) : locked ? (
                      <span style={{ width: '100%', textAlign: 'center', background: 'rgba(255,255,255,0.85)', color: THEME.fg3, borderRadius: 999, padding: '5px 0', fontSize: 11.5, fontWeight: 800 }}>
                        {`${L('Lv')}.${egg.minLevel}`}
                      </span>
                    ) : (
                      <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? THEME.gold : 'rgba(255,255,255,0.85)', color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '5px 0', fontSize: 12.5, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4, boxShadow: on ? '0 3px 10px rgba(209,153,0,.4)' : 'none' }}>
                        <SafePointIcon size={13} />
                        {egg.price.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* eggs you already earned (A-2.1) — from missions, milestones, level-ups,
                events, achievements. They sit here until you hatch them, so an egg won
                by walking never gets lost in a notification the child swiped away. */}
            {totalEggs() > 0 && (
              <React.Fragment>
                <SectionHead title={L('Your eggs')} color="#fff" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
                  {activeEggs().filter(egg => (owned[egg.id] || 0) > 0).map(egg => {
                    const rar = RARITY[egg.rarity];
                    const n = owned[egg.id];
                    return (
                      <div key={egg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, ...glassCard(rar, true) }}>
                        <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                          <div style={{ position: 'absolute', width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${rar.fg}4a, transparent 72%)` }} />
                          <EggShape size={56} rarity={egg.rarity} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{L(egg.name)}</span>
                            {n > 1 && <span style={{ fontSize: 11, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '1px 7px', borderRadius: 999 }}>×{n}</span>}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 2, lineHeight: 1.35 }}>{L('Earned — ready to hatch')}</div>
                        </div>
                        <button onClick={() => hatchOwned(egg)} className="jx-press" style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: rar.fg, color: '#fff', borderRadius: 999, padding: '9px 15px', fontSize: 13, fontWeight: 800 }}>
                          {L('Hatch')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </React.Fragment>
            )}

            {/* buddy eggs — one per rarity, priced + gated by EGGS (A-2 / F-15) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
              {activeEggs().map(egg => {
                const rar = RARITY[egg.rarity];
                const locked = PLAYER.level < egg.minLevel;      // level gate
                const unbuyable = egg.price == null;             // reward-only
                const afford = !unbuyable && pts >= egg.price;
                const on = !unbuyable && !locked && afford;      // fully purchasable now
                // the epic egg is a prize, not a dead item — never dim it. Only a
                // level-locked egg should read as unavailable.
                return (
                  <div key={egg.id} style={glassCard(rar, unbuyable, locked ? .78 : 1)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* the eggs in this list sit still — the float belongs to the hatch flow, where
                          the egg is the thing you tap, not to a price list you are reading down */}
                      <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', filter: locked ? 'grayscale(.5)' : 'none' }}>
                        <div style={{ position: 'absolute', width: 56, height: 56, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${rar.fg}4a, transparent 72%)` }} />
                        <EggShape size={56} rarity={egg.rarity} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{L(egg.name)}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.72)', marginTop: 2, lineHeight: 1.35 }}>
                          {locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy')}
                        </div>
                      </div>

                      {unbuyable ? (
                        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800 }}>
                          <Icon name="gift" size={13} color={THEME.gold} stroke={2.3} />{L('Reward')}
                        </span>
                      ) : (
                        <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? rar.fg : 'rgba(255,255,255,0.85)', color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          <SafePointIcon size={15} />
                          {egg.price.toLocaleString()}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

      </div>
      </div>

      {/* Close — the one exit, pinned to the bottom like the battle preview's Close button.
          Sits above the scroll container (not inside it) so it stays put while the egg list
          scrolls underneath. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 24px calc(env(safe-area-inset-bottom) + 72px)', display: 'flex', justifyContent: 'center' }}>
        {/* raised clear of the gold leaf trim along the very bottom edge. A dark glass fill
            (rgba(0,0,0,.34)) still read as just another dark patch of the crystal/nest art
            behind it — same problem the earlier white-on-white attempt had, mirrored. Flipped
            to the same solid off-white pill the egg cards themselves use for their own
            secondary state (Shop's "not buyable" pill, THEME.fg3 on white) — it's the one
            color in this screen that never appears in the backdrop art, so it reads as a
            control rather than more scenery, in any lighting the art ships in. */}
        <button onClick={() => ctx.nav('home')} style={{ background: 'rgba(255,255,255,.92)', border: 'none', color: THEME.fg1, borderRadius: 999, padding: '12px 32px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Close')}</button>
      </div>

      {/* egg hatch overlay (A-2 / F-15) — the shared flow (EggHatchFlow, EggHatch.jsx),
          portaled to the phone screen so it covers the tab bar, matching the app's
          full-screen "moment" pattern. Also what a battle win's egg drop plays. */}
      {hatch && (
        <EggHatchFlow egg={hatch.egg} bgRarity={hatch.bgRarity} eggShake={eggShake} gradualCrack={gradualCrack}
          onReveal={() => { setOwned({ ...PLAYER.eggs }); setPts(PLAYER.points); }}
          onDone={closeHatch} />
      )}

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
