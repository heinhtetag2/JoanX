// JoanX — child app · Shop

import React from 'react';
import { activeEggs, buyEgg, eggById, eggCount, eggSources, PLAYER, totalEggs } from '../core/data.jsx';
import { Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { ScreenHeader } from './shared.jsx';
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
function Shop({ ctx, eggShake = false, eggHatch = 'pop', eggShopLayout = 'merged' }) {
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


  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {/* egg shop backdrop — the ornate crystal/egg-nest frame art. It's ONE image sized to
          the phone's own aspect ratio (852×1846 ≈ 390×844), so `cover` fills it exactly with
          no crop. Pinned here as a sibling of the scroll container, NOT inside it, so the
          frame's top/bottom borders stay glued to the actual screen edges no matter how far
          the list below scrolls — a background painted into the scrolling content itself
          would drag the bottom border up into the middle of the screen after one swipe. */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/assets/egg/egg-bg-shop.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      {/* content sits centered in the frame's open middle — between the egg-nest crown at
          the top and the crystal pedestal at the bottom — rather than pinned under the
          header the way a long scrolling list would be. With only the egg cards left on
          this screen there's little enough content that it reads as placed IN the art,
          not laid over it. */}
      <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <ScreenHeader light title={L('Points')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* Tweaks: "Egg shop layout" — 'merged' folds the two lists below into one
            (each tier is either "own it → Hatch" or "don't → Buy", never both at once);
            'split' is the original two-section layout, kept for comparison. */}
        {eggShopLayout === 'merged' ? (
          <React.Fragment>
            {/* one card per tier — the SAME card reads as "hatch what you have" or "buy
                what you don't", so a tier never shows up twice on this screen. */}
            <SectionHead title={L('Buddy Eggs')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {activeEggs().map(egg => {
                const rar = RARITY[egg.rarity];
                const n = owned[egg.id] || 0;
                const canHatch = n > 0;
                const locked = PLAYER.level < egg.minLevel;      // level gate
                const unbuyable = egg.price == null;             // reward-only
                const afford = !unbuyable && pts >= egg.price;
                const on = !unbuyable && !locked && afford;      // fully purchasable now
                // A-2.1 — every way this egg can be earned, read off the grant table.
                const earnable = eggSources(egg.id).filter(s => s.key !== 'purchase');
                return (
                  <div key={egg.id} style={{ background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}${canHatch || unbuyable ? '55' : '22'}`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, opacity: locked && !canHatch ? .78 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked && !canHatch ? 'grayscale(.5)' : 'none' }}>
                        <EggShape size={56} rarity={egg.rarity} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                          {canHatch
                            ? (n > 1 && <span style={{ fontSize: 11, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '1px 7px', borderRadius: 999 }}>×{n}</span>)
                            : <span style={{ fontSize: 10, fontWeight: 800, color: rar.fg, background: rar.bg, padding: '2px 7px', borderRadius: 999 }}>{L(rar.label)}</span>}
                        </div>
                        <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>
                          {canHatch ? L('Earned — ready to hatch') : locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy')}
                        </div>
                      </div>

                      {canHatch ? (
                        <button onClick={() => hatchOwned(egg)} className="jx-press" style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: rar.fg, color: '#fff', borderRadius: 999, padding: '9px 15px', fontSize: 13, fontWeight: 800 }}>
                          {L('Hatch')}
                        </button>
                      ) : unbuyable ? (
                        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800 }}>
                          <Icon name="gift" size={13} color={THEME.gold} stroke={2.3} />{L('Reward')}
                        </span>
                      ) : (
                        <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? rar.fg : THEME.surface2, color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name={locked ? 'lock' : 'star'} size={13} color={on ? '#fff' : THEME.fg3} fill={locked ? 'none' : (on ? '#fff' : THEME.fg3)} stroke={2} />
                          {egg.price.toLocaleString()}
                        </button>
                      )}
                    </div>

                    {/* how else to get one — only relevant while there's none to hatch yet */}
                    {!canHatch && earnable.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${rar.fg}1f` }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, alignSelf: 'center', marginRight: 2 }}>{L('Also earn from')}</span>
                        {earnable.map(s => (
                          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5, background: '#fff', border: `1px solid ${rar.fg}2e`, color: THEME.fg2, borderRadius: 999, padding: '3.5px 9px', fontSize: 10.5, fontWeight: 800 }}>
                            <Icon name={s.icon} size={11} color={rar.fg} stroke={2.4} />{L(s.label)}
                          </span>
                        ))}
                      </div>
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
                <SectionHead title={L('Your eggs')} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                  {activeEggs().filter(egg => (owned[egg.id] || 0) > 0).map(egg => {
                    const rar = RARITY[egg.rarity];
                    const n = owned[egg.id];
                    return (
                      <div key={egg.id} style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}40`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard }}>
                        <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EggShape size={56} rarity={egg.rarity} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                            {n > 1 && <span style={{ fontSize: 11, fontWeight: 800, color: rar.fg, background: '#fff', border: `1.5px solid ${rar.fg}40`, padding: '1px 7px', borderRadius: 999 }}>×{n}</span>}
                          </div>
                          <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>{L('Earned — ready to hatch')}</div>
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
            <SectionHead title={L('Buddy Eggs')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {activeEggs().map(egg => {
                const rar = RARITY[egg.rarity];
                const locked = PLAYER.level < egg.minLevel;      // level gate
                const unbuyable = egg.price == null;             // reward-only
                const afford = !unbuyable && pts >= egg.price;
                const on = !unbuyable && !locked && afford;      // fully purchasable now
                // A-2.1 — every way this egg can be earned, read off the grant table.
                // Nothing is hand-listed here, so adding a grant rule surfaces it.
                const earnable = eggSources(egg.id).filter(s => s.key !== 'purchase');
                // the epic egg is a prize, not a dead item — never dim it. Only a
                // level-locked egg should read as unavailable.
                return (
                  <div key={egg.id} style={{ background: `linear-gradient(120deg, ${rar.bg}, #fff 80%)`, border: `1.5px solid ${rar.fg}${unbuyable ? '55' : '22'}`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, opacity: locked ? .78 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      {/* the eggs in this list sit still — the float belongs to the hatch flow, where
                          the egg is the thing you tap, not to a price list you are reading down */}
                      <div style={{ width: 64, height: 80, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', filter: locked ? 'grayscale(.5)' : 'none' }}>
                        <EggShape size={56} rarity={egg.rarity} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ fontSize: 15, fontWeight: 800 }}>{L(egg.name)}</span>
                          <span style={{ fontSize: 10, fontWeight: 800, color: rar.fg, background: rar.bg, padding: '2px 7px', borderRadius: 999 }}>{L(rar.label)}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 2, lineHeight: 1.35 }}>
                          {locked ? `${L('Unlocks at Lv')} ${egg.minLevel}` : L('Hatch a random new buddy')}
                        </div>
                      </div>

                      {unbuyable ? (
                        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '8px 12px', fontSize: 12, fontWeight: 800 }}>
                          <Icon name="gift" size={13} color={THEME.gold} stroke={2.3} />{L('Reward')}
                        </span>
                      ) : (
                        <button onClick={() => purchase(egg)} className={on ? 'jx-press' : undefined} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? rar.fg : THEME.surface2, color: on ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Icon name={locked ? 'lock' : 'star'} size={13} color={on ? '#fff' : THEME.fg3} fill={locked ? 'none' : (on ? '#fff' : THEME.fg3)} stroke={2} />
                          {egg.price.toLocaleString()}
                        </button>
                      )}
                    </div>

                    {/* how else to get one — the earn routes, so a reward-only egg reads as
                        a goal with a path rather than a locked item with a shrug */}
                    {earnable.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12, paddingTop: 11, borderTop: `1px solid ${rar.fg}1f` }}>
                        <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, alignSelf: 'center', marginRight: 2 }}>{L('Also earn from')}</span>
                        {earnable.map(s => (
                          <span key={s.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3.5, background: '#fff', border: `1px solid ${rar.fg}2e`, color: THEME.fg2, borderRadius: 999, padding: '3.5px 9px', fontSize: 10.5, fontWeight: 800 }}>
                            <Icon name={s.icon} size={11} color={rar.fg} stroke={2.4} />{L(s.label)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

      </div>
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
