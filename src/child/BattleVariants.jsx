// JoanX — child app · Battle select-screen layout explorations (10 variants)
// One data model (next villain on the ladder + your owned buddies), ten ways to
// stage the moment before a fight. Switch via the Tweaks panel ("Battle layout").
// Baseline 'classic' lives in Battle.jsx; the fight phases (matching / versus /
// result) are shared by every layout and stay there too.

import React from 'react';
import { activeVillains, BATTLE_ODDS, battlesPerDay, PLAYER, STATS, statsFor, statMax, winPercent } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, mixHue, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, StatCard, PointsChip, DexProgress, RarityPill } from './shared.jsx';

const BATTLE_LAYOUTS = [
  { id: 'classic', label: 'Classic' },
  { id: 'arena', label: 'Arena' },
  { id: 'hero', label: 'Hero' },
  { id: 'ladder', label: 'Ladder' },
  { id: 'stats', label: 'Stats' },
  { id: 'roster', label: 'Roster' },
  { id: 'compact', label: 'Compact' },
  { id: 'card', label: 'Card' },
  { id: 'duel', label: 'Duel' },
  { id: 'focus', label: 'Focus' },
  { id: 'tactics', label: 'Tactics' },
  { id: 'podium', label: 'Podium' },
  { id: 'split', label: 'Split' },
  { id: 'banner', label: 'Banner' },
  { id: 'wheel', label: 'Wheel' },
  { id: 'dossier', label: 'Dossier' },
  { id: 'bars', label: 'Trait bars' },
  { id: 'stack', label: 'Stack' },
  { id: 'ring', label: 'Ring' },
  { id: 'ticket', label: 'Ticket' },
  { id: 'road', label: 'Road' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'chips', label: 'Chips' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'tug', label: 'Tug of war' },
  { id: 'pair', label: 'Pair grid' },
  { id: 'mini', label: 'Mini' },
  { id: 'poster', label: 'Poster' },
  { id: 'stage', label: 'Stage' },
  { id: 'scout', label: 'Scouting' },
  { id: 'orbit', label: 'Orbit' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'scoreboard', label: 'Scoreboard' },
  { id: 'hexes', label: 'Hexes' },
  { id: 'filmstrip', label: 'Filmstrip' },
  { id: 'radar', label: 'Radar' },
  { id: 'coin', label: 'Coin' },
  { id: 'duo', label: 'Duo' },
  { id: 'deck', label: 'Deck' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'notebook', label: 'Notebook' },
  { id: 'gauge', label: 'Gauge' },
  { id: 'frame', label: 'Frame' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'lanes', label: 'Lanes' },
  { id: 'crest', label: 'Crest' },
  { id: 'panorama', label: 'Panorama' },
  { id: 'bignum', label: 'Big number' },
  { id: 'briefing', label: 'Briefing' },
  { id: 'flip', label: 'Flip card' },
  { id: 'league', label: 'League' },
  { id: 'stamp', label: 'Stamp' },
  { id: 'console', label: 'Console' },
  { id: 'bracket', label: 'Bracket' },
  { id: 'slots', label: 'Slots' },
  { id: 'book', label: 'Book' },
  { id: 'neon', label: 'Neon' },
  { id: 'cassette', label: 'Cassette' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'pixel', label: 'Pixel' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'metro', label: 'Metro' },
  { id: 'capsule', label: 'Capsule' },
  { id: 'chatlog', label: 'Chat' },
  { id: 'dial', label: 'Dial' },
  { id: 'mosaic', label: 'Mosaic' },
  { id: 'runway', label: 'Runway' },
  { id: 'vault', label: 'Vault' },
  { id: 'campfire', label: 'Campfire' },
  { id: 'locker', label: 'Locker' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'boardgame', label: 'Board game' },
  { id: 'newspaper', label: 'Newspaper' },
  { id: 'vinyl', label: 'Vinyl' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'passport', label: 'Passport' },
  { id: 'vending', label: 'Vending' },
  { id: 'puzzle', label: 'Puzzle' },
  { id: 'forecast', label: 'Forecast' },
  { id: 'trophycase', label: 'Trophy case' },
  // ── system-aligned set: THEME tokens, the 20px card recipe, shadowCard
  //    hairlines, flat CTAs, and the shared primitives — no bespoke chrome.
  { id: 'syscard', label: 'Sys · Card' },
  { id: 'sysstat', label: 'Sys · Stat cards' },
  { id: 'sysbadge', label: 'Sys · Badges' },
  { id: 'sysbar', label: 'Sys · Bars' },
  { id: 'sysprogress', label: 'Sys · Progress' },
  { id: 'syslist', label: 'Sys · List' },
  { id: 'systile', label: 'Sys · Tiles' },
  { id: 'syshero', label: 'Sys · Hero' },
  { id: 'syssegment', label: 'Sys · Segmented' },
  { id: 'syswell', label: 'Sys · Wells' },
  { id: 'sysrarity', label: 'Sys · Rarity' },
  { id: 'syspoints', label: 'Sys · Points' },
  { id: 'syscallout', label: 'Sys · Callout' },
  { id: 'sysavatar', label: 'Sys · Avatars' },
  { id: 'sysmetric', label: 'Sys · Metrics' },
  { id: 'syssheet', label: 'Sys · Sheet' },
  { id: 'sysempty', label: 'Sys · Spent' },
  { id: 'sysgrid', label: 'Sys · Grid' },
  { id: 'sysbanner', label: 'Sys · Banner' },
  { id: 'sysreview', label: 'Sys · Review' },
];

// the same bonus the result screen shows in "Battle math" — read from BATTLE_ODDS so a
// server retune moves it here too, instead of this file quietly promising an old number
const SAFE_WALK_BONUS = BATTLE_ODDS.safeWalkBonus;

// A-8.2 — how a matchup reads before it's fought. Bands off the WIN CHANCE, not a power
// gap: the odds are the thing the battle is actually decided by, so a layout that judged
// the matchup on raw subtraction would tell the child a different story from the roll.
function verdictOf(odds) {
  if (odds >= 65) return { label: 'Likely win', color: THEME.success, bg: THEME.successLight };
  if (odds >= 35) return { label: 'Close call', color: THEME.warning, bg: THEME.warningLight };
  return { label: 'Tough fight', color: THEME.danger, bg: THEME.dangerLight };
}

// A-3.3 — every layout reads the four core stats through here, so a stat added to the
// STATS registry shows up in all of them and none of them can drift to its own numbers.
// Each row is [icon, value, barMax] — the ceiling travels with the value so a layout
// drawing a bar cannot pair a 300-point HP with a 0–100 axis.
const traitsOf = (c) => { const s = statsFor(c); return STATS.map(t => [t.icon, s[t.key], statMax(t.key)]); };

// one tint per stat, cycled — keyed by position so a fifth stat still gets a colour
const STAT_TINT = [
  [THEME.danger, THEME.dangerLight],    // HP
  [THEME.joy, THEME.joyBg],             // Courage
  [THEME.primary, THEME.primaryLight],  // Protection
  [THEME.success, THEME.successLight],  // Speed
];

// map a verdict onto the Badge primitive's semantic variants
const badgeOf = (v) => v.color === THEME.success ? 'success' : v.color === THEME.warning ? 'warning' : 'danger';

// the Card recipe straight out of DESIGN-SYSTEM.md §5 — surface, radius 20,
// padding 16, hairline + whisper. The system-aligned variants build on this.
function SysCard({ children, style }) {
  return <div style={{ background: THEME.surface, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, ...style }}>{children}</div>;
}

// ── shared pieces every variant composes from ────────────────────────────

function TraitRow({ c, color = THEME.fg2, gap = 14 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap, marginTop: 8 }}>
      {traitsOf(c).map(([ic, v], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Icon name={ic} size={14} color={color} stroke={2.3} />
          <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

// the horizontal buddy picker — the one control every layout needs
function BuddyStrip({ owned, sel, setSel, size = 62 }) {
  return (
    <div className="no-sb" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 2px 8px', margin: '0 -2px' }}>
      {owned.map(c => (
        <button key={c.id} onClick={() => setSel(c)} style={{ flexShrink: 0, width: size + 42, background: '#fff', borderRadius: 18, padding: '12px 6px', border: sel.id === c.id ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent', boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit' }}>
          <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />
          <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
          <div style={{ fontSize: 10, color: THEME.fg2 }}>Lv {c.level}</div>
        </button>
      ))}
    </div>
  );
}

// avatar-only picker — for layouts where the mascot is already the hero
function BuddyDots({ owned, sel, setSel, size = 52 }) {
  return (
    <div className="no-sb" style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 2px 6px', margin: '0 -2px' }}>
      {owned.map(c => (
        <button key={c.id} onClick={() => setSel(c)} aria-label={c.name} style={{ flexShrink: 0, width: size, height: size, borderRadius: 999, background: shade(c.color, 78), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', cursor: 'pointer', padding: 0, border: sel.id === c.id ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent' }}>
          <Mascot species={c.species} stage={c.stage} color={c.color} size={size - 6} />
        </button>
      ))}
    </div>
  );
}

// a card that turns over to show its numbers — the only variant with its own state
function FlipCard({ c, total }) {
  const [back, setBack] = React.useState(false);
  return (
    <button onClick={() => setBack(b => !b)} style={{ width: '100%', minHeight: 300, borderRadius: 24, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: THEME.shadowCard, padding: '20px 18px', background: back ? '#fff' : `linear-gradient(170deg, ${shade(c.color, 74)}, #fff 76%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {back ? (
        <div style={{ width: '100%' }}>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500, textAlign: 'center', marginBottom: 14 }}>{c.name}</div>
          {traitsOf(c).map(([ic, val, top], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon name={ic} size={16} color={THEME.fg2} stroke={2.3} />
              <div style={{ flex: 1 }}><Bar value={val} max={top} color={c.color} height={9} /></div>
              <span className="game-font" style={{ width: 28, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${THEME.border}`, paddingTop: 10, marginTop: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Total power')}</span>
            <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: THEME.gold }}>{total}</span>
          </div>
        </div>
      ) : (
        <React.Fragment>
          <Mascot species={c.species} stage={c.stage} color={c.color} size={168} />
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{c.name}</div>
          <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>Lv {c.level}</div>
        </React.Fragment>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 12, color: THEME.fg3 }}>
        <Icon name="repeat" size={13} color={THEME.fg3} stroke={2.3} />
        <span style={{ fontSize: 11.5, fontWeight: 700 }}>{L('Tap the card for stats')}</span>
      </div>
    </button>
  );
}

// remaining-challenges quota — full explainer, or a bare pip counter
function Quota({ left, usedToday }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.primaryLight, borderRadius: 14, padding: '11px 14px', marginBottom: 16 }}>
      <Icon name="info" size={18} color={THEME.primary} stroke={2.3} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: THEME.primaryDark, fontWeight: 600 }}>{usedToday ? L('Come back tomorrow for your next challenge.') : L("Five villain challenges a day. Battles pause while you're walking.")}</span>
      <span className="game-font" style={{ flexShrink: 0, fontSize: 12, fontWeight: 500, color: THEME.primaryDark, background: '#fff', borderRadius: 999, padding: '3px 9px' }}>{left}/{battlesPerDay()}</span>
    </div>
  );
}

function QuotaPips({ left }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
      {Array.from({ length: battlesPerDay() }, (_, i) => (
        <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i < left ? THEME.primary : THEME.border }} />
      ))}
      <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginLeft: 4 }}>{L('Battles left')} {left}</span>
    </div>
  );
}

// the next foe on the ladder, at three densities
function VillainCard({ villain }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16, border: `1.5px solid ${THEME.dangerLight}` }}>
      <div style={{ flexShrink: 0 }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={56} /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Next villain')} · Lv{villain.lv}</div>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{L(villain.name)}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Power')} {villain.power}</div>
      </div>
    </div>
  );
}

function VillainRibbon({ villain }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.dangerLight, borderRadius: 999, padding: '7px 14px 7px 8px', marginBottom: 14 }}>
      <div style={{ width: 32, height: 32, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
        <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={30} />
      </div>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{L('Next villain')} · {L(villain.name)}</span>
      <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.danger, flexShrink: 0 }}>Lv{villain.lv} · {villain.power}</span>
    </div>
  );
}

// ── the variants ─────────────────────────────────────────────────────────

function BattleSelect({ variant = 'arena', ctx, owned, sel, setSel, villain, left, usedToday, start, power }) {
  const myPower = power(sel);
  const myTotal = myPower + SAFE_WALK_BONUS;
  // A-8.2 — every layout judges the matchup by the same win chance the fight is rolled against
  const odds = winPercent(sel, villain);
  const v = verdictOf(odds);

  const cta = usedToday
    ? <Button variant="play" size="lg" fullWidth icon="calendar-check" disabled>{L('Come back tomorrow')}</Button>
    : <Button variant="play" size="lg" fullWidth icon="swords" onClick={start}>{L('Find a match')} · {left}/{battlesPerDay()}</Button>;

  let body;

  // 1 · ARENA — the fight staged before it starts: you, VS, them
  if (variant === 'arena') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <div style={{ borderRadius: 24, padding: '18px 12px 16px', background: `linear-gradient(165deg, ${shade(sel.color, 76)}, #fff 70%)`, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 6 }}>
          <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={104} />
            <div className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {L('Power')} {myPower}</div>
          </div>
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.gold, flexShrink: 0 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={104} /></div>
            <div className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
        </div>
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 2 · HERO — the buddy fills the screen; the villain is a slim threat ribbon
  else if (variant === 'hero') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ borderRadius: 28, padding: '20px 18px 22px', background: `linear-gradient(165deg, ${shade(sel.color, 70)}, #fff 78%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
        <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={190} /></div>
        <div className="game-font" style={{ fontSize: 26, fontWeight: 500 }}>{sel.name}</div>
        <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
        <TraitRow c={sel} />
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 3 · LADDER — the whole villain climb, with the next rung lit up
  else if (variant === 'ladder') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <SectionHead title={L('Villain ladder')} />
      <div className="no-sb" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '2px 2px 10px', margin: '0 -2px' }}>
        {activeVillains().map(vl => {
          const now = vl.lv === villain.lv;
          return (
            <div key={vl.lv} style={{ flexShrink: 0, width: 74, borderRadius: 16, padding: '10px 4px 8px', textAlign: 'center', background: now ? THEME.dangerLight : '#fff', border: now ? `2px solid ${THEME.danger}` : '2px solid transparent', boxShadow: THEME.shadowCard, opacity: vl.defeated ? .55 : 1 }}>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <div style={{ filter: vl.defeated ? 'grayscale(1)' : 'none' }}><Mascot species={vl.species} stage={2} color={vl.color} mood="alert" size={44} /></div>
                {vl.defeated && <div style={{ position: 'absolute', top: -2, right: 2 }}><Icon name="check" size={14} color={THEME.success} stroke={3} /></div>}
              </div>
              <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: now ? THEME.danger : THEME.fg2, marginTop: 2 }}>Lv{vl.lv}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, margin: '4px 0 16px' }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={64} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Your fighter')}</div>
          <div className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ fontSize: 12, color: THEME.fg2 }}>Lv {sel.level} · {L('Power')} {myPower}</div>
        </div>
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 4 · STATS — a numbers-first read: two power bars on one scale
  else if (variant === 'stats') {
    const max = Math.max(myTotal, villain.power);
    const row = (name, val, color, mascot) => (
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 30, height: 30, flexShrink: 0 }}>{mascot}</div>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800 }}>{name}</span>
          <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color }}>{val}</span>
        </div>
        <Bar value={val} max={max} color={color} height={9} />
      </div>
    );
    body = (
      <React.Fragment>
        <Quota left={left} usedToday={usedToday} />
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12 }}>{L('Matchup')}</div>
          {row(sel.name, myTotal, THEME.primary, <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={30} />)}
          {row(L(villain.name), villain.power, THEME.danger, <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={30} />)}
          <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: `1px solid ${THEME.border}`, paddingTop: 12, marginTop: 2 }}>
            {traitsOf(sel).map(([ic, val], i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <Icon name={ic} size={16} color={THEME.fg2} stroke={2.3} />
                <div className="game-font" style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{val}</div>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <Icon name="sparkles" size={16} color={THEME.gold} stroke={2.3} />
              <div className="game-font" style={{ fontSize: 15, fontWeight: 500, marginTop: 2, color: THEME.gold }}>+{SAFE_WALK_BONUS}</div>
            </div>
          </div>
        </div>
        <SectionHead title={L('Choose a buddy')} />
        <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 5 · ROSTER — picking the fighter is the screen; the villain waits up top
  else if (variant === 'roster') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <SectionHead title={L('Your fighter')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ position: 'relative', background: on ? `linear-gradient(170deg, ${shade(c.color, 78)}, #fff 76%)` : '#fff', borderRadius: 18, padding: '14px 6px 10px', border: on ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent', boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit' }}>
              {on && <div style={{ position: 'absolute', top: 6, right: 6 }}><Icon name="crown" size={15} color={THEME.gold} fill={THEME.gold} stroke={2} /></div>}
              <Mascot species={c.species} stage={c.stage} color={c.color} size={64} />
              <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{c.name}</div>
              <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg2 }}>{L('Power')} {power(c)}</div>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 6 · COMPACT — the whole decision above the fold, nothing scrolls
  else if (variant === 'compact') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 14 }}>
        {[[sel, sel.name, `Lv ${sel.level} · ${L('Power')} ${myPower}`, L('Your fighter'), THEME.primary, false],
          [villain, L(villain.name), `Lv ${villain.lv} · ${L('Power')} ${villain.power}`, L('Opponent'), THEME.danger, true]].map(([c, name, meta, tag, color, foe], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
            <div style={{ flexShrink: 0 }}>{foe
              ? <Mascot species={c.species} stage={2} color={c.color} mood="alert" size={46} />
              : <Mascot species={c.species} stage={c.stage} color={c.color} size={46} />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: .4 }}>{tag}</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{name}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{meta}</div>
            </div>
          </div>
        ))}
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} size={46} />
    </React.Fragment>
  );

  // 7 · CARD — the fighter as a collectible battle card, power stamped large
  else if (variant === 'card') {
    const r = RARITY[sel.rarity] || RARITY.common;
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ borderRadius: 24, padding: 5, background: r.bg, border: `2px solid ${r.fg}`, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ borderRadius: 20, background: `linear-gradient(170deg, ${shade(sel.color, 74)}, #fff 72%)`, padding: '14px 16px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: r.fg, textTransform: 'uppercase', letterSpacing: .5 }}>{L(r.label)}</span>
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg2 }}>Lv {sel.level}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={158} /></div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, textAlign: 'center' }}>{sel.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginTop: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Total power')}</span>
              <span className="game-font" style={{ fontSize: 30, fontWeight: 500, color: THEME.gold }}>{myTotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', background: 'rgba(255,255,255,.7)', borderRadius: 14, padding: '9px 0', marginTop: 12 }}>
              {traitsOf(sel).map(([ic, val], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Icon name={ic} size={14} color={THEME.fg2} stroke={2.3} />
                  <span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 8 · DUEL — a dark pre-fight panel; the versus screen previewed in miniature
  else if (variant === 'duel') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 24, padding: '22px 14px 18px', background: 'linear-gradient(170deg,#2b2926,#2b5782)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 6 }}>
          <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={100} />
            <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginTop: 2 }}>{sel.name}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>Lv {sel.level} · {myPower}</div>
          </div>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.gold, flexShrink: 0 }}>VS</div>
          <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={100} /></div>
            <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: '#fff', marginTop: 2 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>Lv {villain.lv} · {villain.power}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 999, padding: '7px 14px', marginTop: 18 }}>
          <Icon name="sparkles" size={14} color={THEME.gold} stroke={2.3} />
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{L('Safe-walk bonus')} +{SAFE_WALK_BONUS}</span>
        </div>
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 9 · FOCUS — one buddy, one number, one button; everything else recedes
  else if (variant === 'focus') body = (
    <React.Fragment>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Next villain')}</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 1 }}>{L(villain.name)} · Lv{villain.lv}</div>
      </div>
      <div className="jx-float" style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={210} />
      </div>
      <div style={{ textAlign: 'center', marginTop: -4, marginBottom: 18 }}>
        <div className="game-font" style={{ fontSize: 28, fontWeight: 500 }}>{sel.name}</div>
        <div className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg2, marginTop: 2 }}>{L('Total power')} {myTotal}</div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} size={48} />
      <div style={{ marginBottom: 12 }}><QuotaPips left={left} /></div>
    </React.Fragment>
  );

  // 10 · TACTICS — the battle math shown *before* the fight, with a verdict
  else if (variant === 'tactics') {
    const diff = myTotal - villain.power;
    const mathRow = (lbl, val, color, i) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
        <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{lbl}</span>
        <span className="game-font" style={{ fontSize: 15.5, fontWeight: 500, color: color || THEME.fg1 }}>{val}</span>
      </div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <VillainCard villain={villain} />
        <div style={{ background: '#fff', borderRadius: 20, padding: '14px 16px 16px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={44} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="game-font" style={{ fontSize: 17, fontWeight: 500 }}>{sel.name}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
          </div>
          {mathRow(`${sel.name} · ${L('Power')}`, myPower, THEME.fg1, 0)}
          {mathRow(L('Safe-walk bonus'), `+${SAFE_WALK_BONUS}`, THEME.gold, 1)}
          {mathRow(L('Your total'), myTotal, THEME.primary, 1)}
          {mathRow(`${L(villain.name)} · ${L('Power')}`, villain.power, THEME.danger, 1)}
          <div style={{ marginTop: 10 }}><Bar value={Math.max(0, Math.min(100, 50 + diff / 4))} max={100} color={v.color} height={9} /></div>
        </div>
        <SectionHead title={L('Choose a buddy')} />
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 11 · PODIUM — the fighter presented on a lit stage disc, villain announced below
  else if (variant === 'podium') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', borderRadius: 24, padding: '10px 16px 20px', background: '#fff', boxShadow: THEME.shadowCard, marginBottom: 14, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: '50%', top: 20, transform: 'translateX(-50%)', width: 200, height: 200, borderRadius: 999, background: shade(sel.color, 84) }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={176} /></div>
        <div style={{ position: 'relative', width: 168, height: 22, borderRadius: 999, background: shade(sel.color, 70), margin: '-6px auto 10px' }} />
        <div className="game-font" style={{ position: 'relative', fontSize: 24, fontWeight: 500, textAlign: 'center' }}>{sel.name}</div>
        <TraitRow c={sel} />
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 12 · SPLIT — one panel cut in two: their dark half, your bright half
  else if (variant === 'split') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 20px', background: 'linear-gradient(160deg,#2b2926,#49566f)' }}>
          <div style={{ flexShrink: 0, transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={78} /></div>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: .5 }}>{L('Opponent')}</div>
            <div className="game-font" style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{L(villain.name)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '20px 16px 16px', background: `linear-gradient(20deg, ${shade(sel.color, 76)}, #fff 80%)` }}>
          <div className="game-font" style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontSize: 15, fontWeight: 500, color: THEME.gold, background: '#fff', borderRadius: 999, padding: '4px 12px', boxShadow: THEME.shadowCard }}>VS</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Your fighter')}</div>
            <div className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
          </div>
          <div style={{ flexShrink: 0 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={78} /></div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 13 · BANNER — the villain as a wide poster header, mascot bleeding off-frame
  else if (variant === 'banner') body = (
    <React.Fragment>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: '18px 16px 16px', minHeight: 116, background: 'linear-gradient(120deg,#2b2926,#49566f)', marginBottom: 14 }}>
        <div style={{ position: 'absolute', right: -14, bottom: -12, opacity: .95 }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={124} /></div>
        <div style={{ position: 'relative', fontSize: 10.5, fontWeight: 800, color: THEME.gold, textTransform: 'uppercase', letterSpacing: .6 }}>{L('Next villain')}</div>
        <div className="game-font" style={{ position: 'relative', fontSize: 22, fontWeight: 500, color: '#fff', marginTop: 2, maxWidth: 190 }}>{L(villain.name)}</div>
        <div style={{ position: 'relative', display: 'inline-flex', gap: 8, marginTop: 8, background: 'rgba(255,255,255,.12)', borderRadius: 999, padding: '4px 12px' }}>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>Lv {villain.lv}</span>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.gold }}>{villain.power}</span>
        </div>
      </div>
      <Quota left={left} usedToday={usedToday} />
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 14 · WHEEL — the buddies as a snap carousel; whichever you land on fights
  else if (variant === 'wheel') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollSnapType: 'x mandatory', padding: '2px 2px 10px', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ scrollSnapAlign: 'center', flexShrink: 0, width: 200, borderRadius: 24, border: 'none', fontFamily: 'inherit', cursor: 'pointer', padding: '18px 12px 16px', boxShadow: THEME.shadowCard, background: `linear-gradient(170deg, ${shade(c.color, on ? 72 : 84)}, #fff 76%)`, transform: on ? 'none' : 'scale(.92)', opacity: on ? 1 : .6, transition: 'transform .25s, opacity .25s' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={on ? 140 : 118} />
              <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>Lv {c.level} · {L('Power')} {power(c)}</div>
              {on && <TraitRow c={c} />}
            </button>
          );
        })}
      </div>
      <div style={{ height: 6 }} />
    </React.Fragment>
  );

  // 15 · DOSSIER — the villain as a wanted poster, with its case file read out
  else if (variant === 'dossier') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, border: `1.5px solid ${THEME.dangerLight}`, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: THEME.dangerLight, padding: '8px 14px' }}>
          <Icon name="skull" size={14} color={THEME.danger} stroke={2.4} />
          <span style={{ fontSize: 11, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .6 }}>{L('Next villain')}</span>
          <span className="game-font" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 500, color: THEME.danger }}>Lv {villain.lv}</span>
        </div>
        <div style={{ display: 'flex', gap: 14, padding: 16 }}>
          <div style={{ flexShrink: 0, width: 92, height: 92, borderRadius: 16, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={86} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{L(villain.name)}</div>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.danger, marginTop: 1 }}>{L('Power')} {villain.power}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 6 }}>{L(villain.desc)}</div>
          </div>
        </div>
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 16 · TRAIT BARS — guard / speed / heart mirrored against the villain's share
  else if (variant === 'bars') {
    const foe = Math.round(villain.power / 3);   // the villain has one number; split it evenly to compare
    body = (
      <React.Fragment>
        <Quota left={left} usedToday={usedToday} />
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={40} />
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{sel.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13.5, fontWeight: 800 }}>{L(villain.name)}</span>
              <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={40} />
            </div>
          </div>
          {traitsOf(sel).map(([ic, val], i) => {
            const max = Math.max(val, foe);
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span className="game-font" style={{ width: 30, fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{val}</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: `${(val / max) * 100}%` }}><Bar value={1} max={1} color={THEME.primary} height={9} /></div>
                </div>
                <Icon name={ic} size={15} color={THEME.fg2} stroke={2.3} />
                <div style={{ flex: 1 }}>
                  <div style={{ width: `${(foe / max) * 100}%` }}><Bar value={1} max={1} color={THEME.danger} height={9} /></div>
                </div>
                <span className="game-font" style={{ width: 30, fontSize: 13, fontWeight: 500, color: THEME.fg2 }}>{foe}</span>
              </div>
            );
          })}
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 17 · STACK — two full cards, one above the other, VS wedged between
  else if (variant === 'stack') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 22, padding: 16, background: `linear-gradient(150deg, ${shade(sel.color, 76)}, #fff 78%)`, boxShadow: THEME.shadowCard }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={90} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Your fighter')}</div>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <TraitRow c={sel} gap={10} />
          </div>
        </div>
        <div className="game-font" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', zIndex: 2, fontSize: 16, fontWeight: 500, color: THEME.gold, background: '#fff', borderRadius: 999, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard }}>VS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderRadius: 22, padding: 16, marginTop: 10, background: 'linear-gradient(150deg,#2b2926,#49566f)', boxShadow: THEME.shadowCard }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={90} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: .5 }}>{L('Opponent')}</div>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: '#fff' }}>{L(villain.name)}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.72)', fontWeight: 600, marginTop: 4 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 18 · RING — power drawn as an arc around the fighter, the villain's mark on it
  else if (variant === 'ring') {
    const pct = Math.max(6, Math.min(100, (myTotal / (myTotal + villain.power)) * 100));
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ background: '#fff', borderRadius: 24, padding: '22px 16px 18px', boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 210, height: 210, margin: '0 auto', borderRadius: 999, background: `conic-gradient(${THEME.primary} ${pct}%, ${THEME.dangerLight} ${pct}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 186, height: 186, borderRadius: 999, background: shade(sel.color, 88), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={168} />
            </div>
          </div>
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 10 }}>{sel.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.primary }}>{L('Total power')} {myTotal}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: THEME.danger }}>{L('Opponent')} {villain.power}</span>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 19 · TICKET — a battle pass with a torn stub; the quota reads as punches
  else if (variant === 'ticket') body = (
    <React.Fragment>
      <div style={{ background: '#fff', borderRadius: 22, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '18px 18px 14px', background: `linear-gradient(160deg, ${shade(sel.color, 78)}, #fff 82%)`, textAlign: 'center' }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .8 }}>{L('Battle')} · {L('Matchup')}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={82} />
            <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: THEME.gold }}>VS</span>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={82} /></div>
          </div>
          <div className="game-font" style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>{sel.name} · {L(villain.name)}</div>
        </div>
        <div style={{ position: 'relative', borderTop: `2px dashed ${THEME.border}` }}>
          <div style={{ position: 'absolute', left: -9, top: -9, width: 18, height: 18, borderRadius: 999, background: THEME.surface2 }} />
          <div style={{ position: 'absolute', right: -9, top: -9, width: 18, height: 18, borderRadius: 999, background: THEME.surface2 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px' }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Battles left')}</div>
            <div style={{ display: 'flex', gap: 5, marginTop: 5 }}>
              {Array.from({ length: battlesPerDay() }, (_, i) => (
                <span key={i} style={{ width: 12, height: 12, borderRadius: 999, border: `2px solid ${i < left ? THEME.primary : THEME.border}`, background: i < left ? THEME.primary : 'transparent' }} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Total power')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.gold }}>{myTotal}</div>
          </div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 20 · ROAD — the ladder climbed vertically, a path you can see yourself on
  else if (variant === 'road') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '6px 14px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        {activeVillains().slice(0, 6).map((vl, i) => {
          const now = vl.lv === villain.lv;
          return (
            <div key={vl.lv} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none', opacity: vl.defeated ? .5 : 1 }}>
              <div style={{ position: 'relative', width: 30, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: vl.defeated ? THEME.success : now ? THEME.danger : THEME.border }} />
              </div>
              <div style={{ width: 40, height: 40, flexShrink: 0, filter: vl.defeated ? 'grayscale(1)' : 'none' }}><Mascot species={vl.species} stage={2} color={vl.color} mood="alert" size={40} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: now ? THEME.danger : THEME.fg1 }}>{L(vl.name)}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {vl.lv} · {L('Power')} {vl.power}</div>
              </div>
              {vl.defeated && <Icon name="check" size={16} color={THEME.success} stroke={3} />}
              {now && <span style={{ fontSize: 10.5, fontWeight: 800, color: '#fff', background: THEME.danger, borderRadius: 999, padding: '3px 8px' }}>{L('Next villain')}</span>}
            </div>
          );
        })}
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 21 · SPOTLIGHT — a dark room, one light, one buddy in it
  else if (variant === 'spotlight') body = (
    <React.Fragment>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 26, background: 'linear-gradient(180deg,#1e1d1c,#2b2926)', padding: '18px 16px 20px', marginBottom: 16, textAlign: 'center' }}>
        <div style={{ position: 'absolute', left: '50%', top: -40, transform: 'translateX(-50%)', width: 260, height: 260, borderRadius: 999, background: `radial-gradient(circle, ${mixHue(sel.color, 0, .2, .38)} 0%, rgba(0,0,0,0) 70%)` }} />
        <div style={{ position: 'relative', fontSize: 10.5, fontWeight: 800, color: 'rgba(255,255,255,.55)', textTransform: 'uppercase', letterSpacing: .8 }}>{L('Your fighter')}</div>
        <div className="jx-float" style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginTop: 4 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={182} /></div>
        <div className="game-font" style={{ position: 'relative', fontSize: 26, fontWeight: 500, color: '#fff' }}>{sel.name}</div>
        <div style={{ position: 'relative', fontSize: 12.5, color: 'rgba(255,255,255,.72)', fontWeight: 600, marginTop: 2 }}>{L('Total power')} {myTotal} · {L('Opponent')} {villain.power}</div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      <div style={{ marginBottom: 12 }}><QuotaPips left={left} /></div>
    </React.Fragment>
  );

  // 22 · CHIPS — the roster as a list of pills; power is the whole story
  else if (variant === 'chips') body = (
    <React.Fragment>
      <VillainCard villain={villain} />
      <SectionHead title={L('Choose a buddy')} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          const beats = power(c) + SAFE_WALK_BONUS >= villain.power;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '6px 14px 6px 6px', background: on ? THEME.primaryLight : '#fff', border: on ? `2px solid ${THEME.primary}` : '2px solid transparent', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={32} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{c.name}</span>
              <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: beats ? THEME.success : THEME.fg2 }}>{power(c) + SAFE_WALK_BONUS}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={132} />
      </div>
    </React.Fragment>
  );

  // 23 · SHEET — villain owns the canvas; the picker rides up as a bottom sheet
  else if (variant === 'sheet') body = (
    <React.Fragment>
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .6 }}>{L('Next villain')} · Lv{villain.lv}</div>
        <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 2 }}>{L(villain.name)}</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={166} /></div>
        <div className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.danger }}>{L('Power')} {villain.power}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: '24px 24px 18px 18px', padding: '10px 14px 14px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800 }}>{L('Your fighter')}</span>
          <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: v.color }}>{L(v.label)}</span>
        </div>
        <BuddyStrip owned={owned} sel={sel} setSel={setSel} size={54} />
      </div>
    </React.Fragment>
  );

  // 24 · TUG OF WAR — a single bar both sides pull on; the marker is the forecast
  else if (variant === 'tug') {
    const pct = Math.max(8, Math.min(92, (myTotal / (myTotal + villain.power)) * 100));
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ background: '#fff', borderRadius: 22, padding: '18px 16px 16px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={82} />
              <div className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{sel.name}</div>
              <div className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.primary }}>{myTotal}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px', marginBottom: 24 }}>{L(v.label)}</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={82} /></div>
              <div className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{L(villain.name)}</div>
              <div className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.danger }}>{villain.power}</div>
            </div>
          </div>
          <div style={{ position: 'relative', height: 14, borderRadius: 999, background: THEME.danger, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${pct}%`, background: THEME.primary, borderRadius: 999 }} />
          </div>
          <div style={{ position: 'relative', height: 14, marginTop: -14 }}>
            <div style={{ position: 'absolute', left: `${pct}%`, top: -3, transform: 'translateX(-50%)', width: 6, height: 20, borderRadius: 3, background: '#fff', boxShadow: THEME.shadowCard }} />
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 25 · PAIR GRID — two big buddies per row; the choice is the main event
  else if (variant === 'pair') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ borderRadius: 22, border: on ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent', padding: '16px 10px 12px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', background: `linear-gradient(175deg, ${shade(c.color, on ? 74 : 86)}, #fff 78%)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={96} />
              <div className="game-font" style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>Lv {c.level}</div>
              <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: on ? THEME.primary : THEME.fg2, marginTop: 2 }}>{power(c)}</div>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 26 · MINI — the smallest possible read: one row, one giant button
  else if (variant === 'mini') body = (
    <React.Fragment>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, background: '#fff', borderRadius: 999, padding: '10px 18px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={44} />
          <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: THEME.primary }}>{myTotal}</span>
        </div>
        <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.gold }}>VS</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
          <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={44} /></div>
        </div>
      </div>
      <QuotaPips left={left} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} size={44} />
    </React.Fragment>
  );

  // 27 · POSTER — the fight billed like a title card, type doing the work
  else if (variant === 'poster') body = (
    <React.Fragment>
      <div style={{ borderRadius: 26, padding: '22px 18px 20px', background: `linear-gradient(160deg, ${shade(sel.color, 72)} 0%, #fff 55%, ${THEME.dangerLight} 100%)`, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={130} /></div>
        <div className="game-font" style={{ fontSize: 30, fontWeight: 500, textAlign: 'center', lineHeight: 1.05 }}>{sel.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '10px 0' }}>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
          <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: THEME.gold }}>VS</span>
          <div style={{ flex: 1, height: 1, background: THEME.border }} />
        </div>
        <div className="game-font" style={{ fontSize: 26, fontWeight: 500, textAlign: 'center', lineHeight: 1.05, color: THEME.danger }}>{L(villain.name)}</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}><div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={116} /></div></div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: THEME.fg2, marginTop: 4 }}>{myTotal} · {villain.power}</div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 28 · STAGE — a rounded proscenium; the villain lurks behind, you step forward
  else if (variant === 'stage') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '26px 26px 20px 20px', minHeight: 268, background: `linear-gradient(180deg, ${shade(sel.color, 80)} 0%, #fff 70%)`, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ position: 'absolute', right: 12, top: 16, opacity: .22, filter: 'grayscale(1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={128} /></div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, background: `linear-gradient(180deg, rgba(255,255,255,0), ${shade(sel.color, 88)})`, borderRadius: '50% 50% 0 0 / 26px 26px 0 0' }} />
        <div style={{ position: 'relative', paddingTop: 18, textAlign: 'center' }}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: THEME.danger, background: '#fff', borderRadius: 999, padding: '4px 11px', boxShadow: THEME.shadowCard }}>{L(villain.name)} · Lv{villain.lv}</span>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={162} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ paddingBottom: 14 }}><TraitRow c={sel} /></div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 29 · SCOUTING — a pre-fight briefing: who they are, how you match up
  else if (variant === 'scout') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={62} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Opponent')}</div>
            <div style={{ fontSize: 16.5, fontWeight: 800 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
        </div>
        <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${THEME.border}` }}>{L(villain.desc)}</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={62} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.primary, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Your fighter')}</div>
            <div className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
          </div>
        </div>
        <Bar value={Math.max(0, Math.min(100, 50 + (myTotal - villain.power) / 4))} max={100} color={v.color} height={9} />
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 30 · ORBIT — the chosen buddy at the centre, the bench circling around it
  else if (variant === 'orbit') {
    const bench = owned.filter(c => c.id !== sel.id);
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ position: 'relative', height: 300, background: '#fff', borderRadius: 24, boxShadow: THEME.shadowCard, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 220, height: 220, borderRadius: 999, border: `2px dashed ${THEME.border}` }} />
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={130} />
            <div className="game-font" style={{ fontSize: 18, fontWeight: 500, marginTop: -4 }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.primary }}>{myTotal}</div>
          </div>
          {bench.map((c, i) => {
            const a = (i / Math.max(1, bench.length)) * 2 * Math.PI - Math.PI / 2;
            return (
              <button key={c.id} onClick={() => setSel(c)} aria-label={c.name}
                style={{ position: 'absolute', left: `calc(50% + ${Math.cos(a) * 110}px)`, top: `calc(50% + ${Math.sin(a) * 110}px)`, transform: 'translate(-50%,-50%)', width: 58, height: 58, borderRadius: 999, background: shade(c.color, 80), border: `2px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, cursor: 'pointer' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={52} />
              </button>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  // 31 · ARCADE — a cabinet screen: black surround, LED score, insert-coin energy
  else if (variant === 'arcade') body = (
    <React.Fragment>
      <div style={{ borderRadius: 22, padding: 10, background: '#1e1d1c', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 6px 8px' }}>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.gold, letterSpacing: 1 }}>P1 {myTotal}</span>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.danger, letterSpacing: 1 }}>CPU {villain.power}</span>
        </div>
        <div style={{ borderRadius: 16, background: 'linear-gradient(180deg,#2b5782,#122536)', padding: '16px 10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={92} />
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{sel.name}</div>
          </div>
          <span className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.gold }}>VS</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={92} /></div>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{L(villain.name)}</div>
          </div>
        </div>
        <div className="game-font" style={{ textAlign: 'center', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.6)', letterSpacing: 1.4, paddingTop: 9 }}>
          {L('Battles left')} {left} / {battlesPerDay()}
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 32 · SCOREBOARD — the matchup as stadium signage, numbers doing the shouting
  else if (variant === 'scoreboard') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 22, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '18px 8px', background: THEME.primaryLight }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={76} />
            <div className="game-font" style={{ fontSize: 40, fontWeight: 500, color: THEME.primaryDark, lineHeight: 1 }}>{myTotal}</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{sel.name}</div>
          </div>
          <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.fg3, padding: '0 6px' }}>VS</div>
          <div style={{ textAlign: 'center', padding: '18px 8px', background: THEME.dangerLight }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={76} /></div>
            <div className="game-font" style={{ fontSize: 40, fontWeight: 500, color: THEME.danger, lineHeight: 1 }}>{villain.power}</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{L(villain.name)}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: v.color, padding: '10px 0', borderTop: `1px solid ${THEME.border}` }}>{L(v.label)}</div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 33 · HEXES — the roster tiled as a honeycomb
  else if (variant === 'hexes') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <SectionHead title={L('Choose a buddy')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', background: on ? THEME.primary : THEME.border, padding: 2.5 }}>
                <div style={{ clipPath: 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)', background: `linear-gradient(175deg, ${shade(c.color, on ? 74 : 86)}, #fff 80%)`, paddingTop: 14, paddingBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={58} />
                  <div style={{ fontSize: 11.5, fontWeight: 800 }}>{c.name}</div>
                  <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 34 · FILMSTRIP — buddies as frames on a reel, sprockets and all
  else if (variant === 'filmstrip') body = (
    <React.Fragment>
      <VillainCard villain={villain} />
      <div style={{ background: '#1e1d1c', borderRadius: 16, padding: '8px 0', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 7, padding: '0 10px 6px' }}>
          {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: 'rgba(255,255,255,.22)' }} />)}
        </div>
        <div className="no-sb" style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '0 8px' }}>
          {owned.map(c => {
            const on = c.id === sel.id;
            return (
              <button key={c.id} onClick={() => setSel(c)} style={{ flexShrink: 0, width: 96, border: on ? `2.5px solid ${THEME.gold}` : '2.5px solid transparent', borderRadius: 6, background: '#fff', padding: '10px 4px 6px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: on ? 1 : .62 }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={64} />
                <div style={{ fontSize: 11.5, fontWeight: 800 }}>{c.name}</div>
                <div className="game-font" style={{ fontSize: 10.5, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</div>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 7, padding: '6px 10px 0' }}>
          {Array.from({ length: 12 }, (_, i) => <span key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: 'rgba(255,255,255,.22)' }} />)}
        </div>
      </div>
    </React.Fragment>
  );

  // 35 · RADAR — the core stats plotted as a shape you can compare at a glance. The
  // polygon takes its point count from the stat registry (a triangle at 3, a diamond at
  // 4), and the axes are scaled to the biggest stat rather than a fixed 100 — HP runs
  // several times higher than the others and would otherwise peg every axis to the rim.
  else if (variant === 'radar') {
    const R = 74, cx = 100, cy = 92;
    const vals = traitsOf(sel).map(([, v]) => v);
    const n = Math.max(3, vals.length);
    const top = Math.max(100, ...vals);
    const ang = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
    const pt = (val, i) => {
      const a = ang(i), r = (val / top) * R;
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    };
    const axis = (i) => { const a = ang(i); return [cx + Math.cos(a) * R, cy + Math.sin(a) * R]; };
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ background: '#fff', borderRadius: 22, padding: '16px 16px 14px', boxShadow: THEME.shadowCard, marginBottom: 16, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={54} />
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div className="game-font" style={{ fontSize: 19, fontWeight: 500 }}>{sel.name}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
            </div>
          </div>
          <svg viewBox="0 0 200 176" style={{ width: '100%', maxWidth: 240 }}>
            {[1, .66, .33].map((k, i) => (
              <polygon key={i} points={[0, 1, 2].map(j => { const [x, y] = axis(j); return `${cx + (x - cx) * k},${cy + (y - cy) * k}`; }).join(' ')} fill="none" stroke={THEME.border} strokeWidth="1.5" />
            ))}
            <polygon points={vals.map((val, i) => pt(val, i)).join(' ')} fill={mixHue(sel.color, 0, .1, .34)} stroke={sel.color} strokeWidth="2.5" />
            {traitsOf(sel).map(([, val], i) => { const [x, y] = axis(i); return <circle key={i} cx={x} cy={y} r="3" fill={THEME.fg3} />; })}
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 2 }}>
            {traitsOf(sel).map(([ic, val], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Icon name={ic} size={14} color={THEME.fg2} stroke={2.3} />
                <span className="game-font" style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 36 · COIN — the fighter struck onto a medal, power minted around the rim
  else if (variant === 'coin') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 24, padding: '20px 16px 16px', boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 14 }}>
        <div style={{ width: 218, height: 218, margin: '0 auto', borderRadius: 999, background: THEME.goldLight, border: `7px solid ${THEME.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: 178, height: 178, borderRadius: 999, background: shade(sel.color, 86), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={162} />
          </div>
        </div>
        <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 10 }}>{sel.name}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, borderRadius: 999, padding: '5px 13px', marginTop: 6 }}>
          <Icon name="star" size={14} color={THEME.gold} fill={THEME.gold} stroke={2} />
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: '#9e7300' }}>{myTotal}</span>
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 37 · DUO — two portrait discs overlapping, the way a fight poster crops faces
  else if (variant === 'duo') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 16px 18px', boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: 128, height: 128, borderRadius: 999, background: shade(sel.color, 80), border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginRight: -22, zIndex: 2 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={116} />
          </div>
          <div style={{ width: 128, height: 128, borderRadius: 999, background: THEME.surface2, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginLeft: -22 }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={116} /></div>
          </div>
        </div>
        <div className="game-font" style={{ fontSize: 20, fontWeight: 500, marginTop: 12 }}>{sel.name} <span style={{ color: THEME.gold }}>vs</span> {L(villain.name)}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 4 }}>
          <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.primary }}>{myTotal}</span>
          <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 38 · DECK — the roster fanned like a hand of cards, the pick lifted out
  else if (variant === 'deck') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ position: 'relative', height: 250, marginBottom: 12 }}>
        {owned.map((c, i) => {
          const on = c.id === sel.id;
          const n = owned.length, spread = 15, rot = (i - (n - 1) / 2) * spread;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ position: 'absolute', left: '50%', bottom: 0, transformOrigin: '50% 130%', transform: `translateX(-50%) rotate(${rot}deg) translateY(${on ? -24 : 0}px)`, zIndex: on ? 9 : i, width: 124, borderRadius: 18, border: on ? `2.5px solid ${THEME.primary}` : `1.5px solid ${THEME.border}`, background: `linear-gradient(175deg, ${shade(c.color, on ? 74 : 88)}, #fff 78%)`, boxShadow: THEME.shadowCard, padding: '14px 6px 10px', cursor: 'pointer', fontFamily: 'inherit', transition: 'transform .22s' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={72} />
              <div style={{ fontSize: 12.5, fontWeight: 800 }}>{c.name}</div>
              <div className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</div>
            </button>
          );
        })}
      </div>
      <QuotaPips left={left} />
    </React.Fragment>
  );

  // 39 · TIMELINE — today's five challenges as slots; the next one is open
  else if (variant === 'timeline') {
    const used = battlesPerDay() - left;
    body = (
      <React.Fragment>
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 12 }}>{L("Today's battles")}</div>
          {Array.from({ length: battlesPerDay() }, (_, i) => {
            const done = i < used, next = i === used;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i === battlesPerDay() - 1 ? 0 : 12 }}>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                  <span style={{ width: 14, height: 14, borderRadius: 999, flexShrink: 0, background: done ? THEME.success : next ? THEME.danger : THEME.border }} />
                  {i < battlesPerDay() - 1 && <span style={{ flex: 1, width: 2, background: THEME.border, minHeight: 16 }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: next ? THEME.danger : done ? THEME.fg2 : THEME.fg3 }}>
                    {done ? L('Defeated') : next ? L(villain.name) : `${L('Battle')} ${i + 1}`}
                  </div>
                  {next && <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>}
                </div>
                {next && <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={42} />}
              </div>
            );
          })}
        </div>
        <SectionHead title={L('Choose a buddy')} />
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 40 · NOTEBOOK — the matchup jotted on ruled paper, like a kid's own plan
  else if (variant === 'notebook') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 18, padding: '16px 16px 16px 26px', marginBottom: 16, boxShadow: THEME.shadowCard, background: `repeating-linear-gradient(180deg, #fff 0 30px, ${THEME.border} 30px 31px)`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1.5, background: THEME.dangerLight }} />
        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: '31px' }}>{L('Matchup')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 62 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={58} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{sel.name}</span>
          <span className="game-font" style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 500, color: THEME.primary }}>{myTotal}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 62 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={58} />
          <span style={{ fontSize: 14, fontWeight: 700 }}>{L(villain.name)}</span>
          <span className="game-font" style={{ marginLeft: 'auto', fontSize: 16, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
        </div>
        <div style={{ lineHeight: '31px', fontSize: 13.5, fontWeight: 800, color: v.color }}>→ {L(v.label)}</div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 41 · GAUGE — a half-dial forecast; the needle is the whole message
  else if (variant === 'gauge') {
    const pct = Math.max(2, Math.min(98, (myTotal / (myTotal + villain.power)) * 100));
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ background: '#fff', borderRadius: 22, padding: '18px 16px 16px', boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ position: 'relative', width: 232, height: 116, margin: '0 auto', overflow: 'hidden' }}>
            {/* from 270deg the visible top half spans 0–50% of the sweep: red → amber → green */}
            <div style={{ width: 232, height: 232, borderRadius: 999, background: `conic-gradient(from 270deg, ${THEME.danger} 0 16.7%, ${THEME.warning} 16.7% 33.3%, ${THEME.success} 33.3% 50%, ${THEME.surface2} 50% 100%)` }} />
            <div style={{ position: 'absolute', left: 26, top: 26, width: 180, height: 180, borderRadius: 999, background: '#fff' }} />
            <div style={{ position: 'absolute', left: '50%', bottom: 0, width: 3, height: 96, background: THEME.fg1, borderRadius: 2, transformOrigin: '50% 100%', transform: `translateX(-50%) rotate(${-90 + (pct / 100) * 180}deg)` }} />
            <div style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: 18, height: 18, borderRadius: 999, background: THEME.fg1 }} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .6, marginTop: 10 }}>{L('Win chance')}</div>
          <div className="game-font" style={{ fontSize: 30, fontWeight: 500, color: v.color }}>{Math.round(pct)}%</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 6 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={48} />
            <span style={{ fontSize: 13.5, fontWeight: 800 }}>{sel.name}</span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg2 }}>{myTotal}</span>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 42 · FRAME — the fighter as a photo taped into an album, caption underneath
  else if (variant === 'frame') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 8, padding: '14px 14px 18px', boxShadow: THEME.shadowCard, marginBottom: 16, transform: 'rotate(-1.2deg)' }}>
        <div style={{ borderRadius: 4, background: `linear-gradient(170deg, ${shade(sel.color, 74)}, ${shade(sel.color, 88)})`, padding: '18px 0', display: 'flex', justifyContent: 'center' }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={172} />
        </div>
        <div className="game-font" style={{ fontSize: 22, fontWeight: 500, textAlign: 'center', marginTop: 12 }}>{sel.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600, textAlign: 'center', marginTop: 1 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 43 · BUBBLE — the buddy talks; the villain is what it's talking about
  else if (variant === 'bubble') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 20, padding: '14px 16px', boxShadow: THEME.shadowCard, margin: '0 0 14px' }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.5 }}>
          {L('Ready when you are!')} <span style={{ color: THEME.danger, fontWeight: 800 }}>{L(villain.name)}</span> · {L('Power')} {villain.power}
        </div>
        <div style={{ position: 'absolute', left: 40, bottom: -9, width: 18, height: 18, background: '#fff', transform: 'rotate(45deg)' }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginBottom: 14 }}>
        <div className="jx-float"><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={168} /></div>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 18 }}>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {myTotal}</div>
          <TraitRow c={sel} gap={9} />
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 44 · LANES — each trait is a track, the buddy runs as far as its stat
  else if (variant === 'lanes') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '16px 14px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        {traitsOf(sel).map(([ic, val], i) => (
          <div key={i} style={{ marginBottom: i === 2 ? 0 : 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Icon name={ic} size={14} color={THEME.fg2} stroke={2.3} />
              <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: THEME.fg2 }}>{val}</span>
            </div>
            <div style={{ position: 'relative', height: 26, borderRadius: 999, background: THEME.surface2 }}>
              <div style={{ position: 'absolute', left: `calc(${Math.min(96, val)}% - 20px)`, top: -9, width: 42, height: 42 }}>
                <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={42} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 45 · CREST — the fighter blazoned on a shield, like a team badge
  else if (variant === 'crest') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ width: 236, clipPath: 'polygon(0 0,100% 0,100% 62%,50% 100%,0 62%)', background: THEME.gold, padding: 5 }}>
          <div style={{ clipPath: 'polygon(0 0,100% 0,100% 62%,50% 100%,0 62%)', background: `linear-gradient(175deg, ${shade(sel.color, 72)}, #fff 74%)`, paddingTop: 18, paddingBottom: 58, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={128} />
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg2 }}>{myTotal}</div>
          </div>
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 46 · PANORAMA — a scene with depth: the villain far off, your buddy near
  else if (variant === 'panorama') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', overflow: 'hidden', height: 262, borderRadius: 24, boxShadow: THEME.shadowCard, marginBottom: 16, background: `linear-gradient(180deg, ${shade(sel.color, 84)} 0%, ${shade(sel.color, 92)} 52%, ${THEME.surface2} 52%, ${THEME.surface2} 100%)` }}>
        <div style={{ position: 'absolute', right: 26, top: 42, opacity: .78, transform: 'scale(.72)' }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={96} />
        </div>
        <div style={{ position: 'absolute', right: 20, top: 24, fontSize: 10.5, fontWeight: 800, color: THEME.danger, background: '#fff', borderRadius: 999, padding: '3px 9px' }}>{L(villain.name)}</div>
        <div style={{ position: 'absolute', left: 14, bottom: 6 }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={168} /></div>
        <div style={{ position: 'absolute', right: 16, bottom: 16, textAlign: 'right' }}>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{sel.name}</div>
          <div className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.primary }}>{myTotal}</div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 47 · BIG NUMBER — power is the headline; everything else is a footnote
  else if (variant === 'bignum') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 18px 18px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .7 }}>{L('Total power')}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span className="game-font" style={{ fontSize: 78, fontWeight: 500, lineHeight: 1, color: v.color }}>{myTotal}</span>
          <div style={{ marginLeft: 'auto' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={104} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{sel.name}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '4px 10px', marginLeft: 'auto' }}>{L(v.label)}</span>
        </div>
        <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: 12, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, color: THEME.fg2 }}>
          <span>{L(villain.name)}</span>
          <span className="game-font" style={{ fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 48 · BRIEFING — a dark mission readout; every line is a fact you can check
  else if (variant === 'briefing') {
    const line = (k, val, color) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', letterSpacing: .3 }}>{k}</span>
        <span className="game-font" style={{ fontSize: 13.5, fontWeight: 500, color: color || '#fff' }}>{val}</span>
      </div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ borderRadius: 20, padding: '16px 16px 12px', background: 'linear-gradient(170deg,#2b2926,#122536)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={56} />
            <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.gold }}>VS</span>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={56} /></div>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 800, color: v.color, background: 'rgba(255,255,255,.1)', borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
          </div>
          {line(L('Your fighter'), `${sel.name} · Lv${sel.level}`)}
          {line(L('Power'), myPower)}
          {line(L('Safe-walk bonus'), `+${SAFE_WALK_BONUS}`, THEME.gold)}
          {line(L('Your total'), myTotal, THEME.gold)}
          {line(L('Opponent'), `${L(villain.name)} · ${villain.power}`, '#ff9d8e')}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.62)', lineHeight: 1.5, paddingTop: 10 }}>{L(villain.desc)}</div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 49 · FLIP CARD — portrait on the front, stats on the back; tap to turn it
  else if (variant === 'flip') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ marginBottom: 16 }}><FlipCard c={sel} total={myTotal} /></div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 50 · LEAGUE — your bench ranked by power, so the best pick is obvious
  else if (variant === 'league') {
    const ranked = [...owned].sort((a, b) => power(b) - power(a));
    body = (
      <React.Fragment>
        <VillainCard villain={villain} />
        <SectionHead title={L('Choose a buddy')} />
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
          {ranked.map((c, i) => {
            const on = c.id === sel.id;
            const beats = power(c) + SAFE_WALK_BONUS >= villain.power;
            return (
              <button key={c.id} onClick={() => setSel(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: on ? THEME.primaryLight : 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <span className="game-font" style={{ width: 20, fontSize: 13, fontWeight: 500, color: THEME.fg3 }}>{i + 1}</span>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>Lv {c.level}</div>
                </div>
                {beats && <Icon name="check" size={15} color={THEME.success} stroke={3} />}
                <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: on ? THEME.primary : THEME.fg2 }}>{power(c) + SAFE_WALK_BONUS}</span>
              </button>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  // 51 · STAMP — the fighter issued as a postage stamp, perforated and franked
  else if (variant === 'stamp') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
        {/* perforation: bite a row of transparent circles out of every edge */}
        <div style={{ width: 250, background: '#fff', padding: 12, WebkitMaskImage: 'radial-gradient(circle 5px at 0 0, transparent 5px, #000 5.5px)', WebkitMaskSize: '14px 14px', maskImage: 'radial-gradient(circle 5px at 0 0, transparent 5px, #000 5.5px)', maskSize: '14px 14px' }}>
          <div style={{ border: `1.5px dashed ${THEME.border}`, padding: '14px 10px 12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .6 }}>
              <span>JoanX</span><span>Lv {sel.level}</span>
            </div>
            <div style={{ background: shade(sel.color, 84), borderRadius: 4, padding: '10px 0', margin: '8px 0' }}>
              <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={148} />
            </div>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.gold }}>{myTotal}</div>
          </div>
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 52 · CONSOLE — a handheld with the fight on its screen and a d-pad below
  else if (variant === 'console') body = (
    <React.Fragment>
      <div style={{ borderRadius: 26, background: THEME.surface2, border: `1.5px solid ${THEME.border}`, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ borderRadius: 14, background: 'linear-gradient(170deg,#2b5782,#122536)', padding: '14px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={84} />
            <div className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#fff' }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.gold }}>{myTotal}</div>
          </div>
          <span className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.gold }}>VS</span>
          <div style={{ textAlign: 'center' }}>
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={84} /></div>
            <div className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#fff' }}>{L(villain.name)}</div>
            <div className="game-font" style={{ fontSize: 12, fontWeight: 500, color: '#ff9d8e' }}>{villain.power}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,16px)', gridTemplateRows: 'repeat(3,16px)', gap: 2 }}>
            {[1, 3, 4, 5, 7].map(i => <span key={i} style={{ gridArea: `${Math.floor(i / 3) + 1} / ${(i % 3) + 1}`, background: THEME.fg3, borderRadius: 3 }} />)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: battlesPerDay() }, (_, i) => (
              <span key={i} style={{ width: 9, height: 9, borderRadius: 999, background: i < left ? THEME.success : THEME.border }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: 999, background: THEME.danger }} />
            <span style={{ width: 26, height: 26, borderRadius: 999, background: THEME.primary }} />
          </div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 53 · BRACKET — the ladder drawn as a tournament tree closing on the final
  else if (variant === 'bracket') {
    const upcoming = activeVillains().filter(vl => !vl.defeated).slice(0, 4);
    const seat = (label, meta, foe, c) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 12, padding: '8px 10px', boxShadow: THEME.shadowCard, minWidth: 0 }}>
        <div style={{ flexShrink: 0 }}>{foe
          ? <Mascot species={c.species} stage={2} color={c.color} mood="alert" size={32} />
          : <Mascot species={c.species} stage={c.stage} color={c.color} size={32} />}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
          <div className="game-font" style={{ fontSize: 10.5, fontWeight: 500, color: THEME.fg2 }}>{meta}</div>
        </div>
      </div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              {seat(sel.name, `${L('Power')} ${myTotal}`, false, sel)}
              {seat(L(villain.name), `${L('Power')} ${villain.power}`, true, villain)}
            </div>
            <div style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '58%', borderTop: `2px solid ${THEME.border}`, borderRight: `2px solid ${THEME.border}`, borderBottom: `2px solid ${THEME.border}`, borderRadius: '0 6px 6px 0' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderRadius: 12, border: `1.5px dashed ${THEME.border}`, padding: '12px 8px', textAlign: 'center' }}>
                <Icon name="trophy" size={20} color={THEME.gold} stroke={2.2} />
                <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2, marginTop: 2 }}>{L('Next villain')}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${THEME.border}` }}>
            {upcoming.map(vl => (
              <div key={vl.lv} style={{ flex: 1, textAlign: 'center', opacity: vl.lv === villain.lv ? 1 : .45 }}>
                <Mascot species={vl.species} stage={2} color={vl.color} mood="alert" size={34} />
                <div className="game-font" style={{ fontSize: 10.5, fontWeight: 500, color: THEME.fg2 }}>Lv{vl.lv}</div>
              </div>
            ))}
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 54 · SLOTS — three reels landing on the fight; the pull is the CTA
  else if (variant === 'slots') {
    const reel = (inner, tint) => (
      <div style={{ flex: 1, borderRadius: 12, background: tint, border: `2px solid ${THEME.border}`, height: 118, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>{inner}</div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ borderRadius: 22, background: THEME.goldLight, border: `3px solid ${THEME.gold}`, padding: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {reel(<React.Fragment>
              <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={72} />
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500 }}>{myTotal}</span>
            </React.Fragment>, '#fff')}
            {reel(<span className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.gold }}>VS</span>, '#fff')}
            {reel(<React.Fragment>
              <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={72} /></div>
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
            </React.Fragment>, '#fff')}
          </div>
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: '#9e7300', paddingTop: 10 }}>{sel.name} · {L(villain.name)}</div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 55 · BOOK — an open spread: your page on the left, theirs on the right
  else if (variant === 'book') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ display: 'flex', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 0, background: '#fff', padding: '18px 12px 16px', textAlign: 'center', borderRight: `2px solid ${THEME.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Your fighter')}</div>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={96} />
          <div className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{sel.name}</div>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.primary }}>{myTotal}</div>
          <TraitRow c={sel} gap={8} />
        </div>
        <div style={{ flex: 1, minWidth: 0, background: THEME.surface2, padding: '18px 12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Opponent')}</div>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={96} />
          <div className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{L(villain.name)}</div>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.danger }}>{villain.power}</div>
          <div style={{ fontSize: 11, color: THEME.fg2, lineHeight: 1.4, marginTop: 8 }}>{L(villain.desc)}</div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 56 · NEON — a night-time sign; the names glow, the numbers hum
  else if (variant === 'neon') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 24, background: '#12131a', border: `2px solid ${mixHue(sel.color, 0, .1, .5)}`, padding: '20px 16px 18px', marginBottom: 16, textAlign: 'center' }}>
        <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: '#fff', textShadow: `0 0 10px ${mixHue(sel.color, 0, .2, .9)}` }}>{sel.name}</div>
        <div className="game-font" style={{ fontSize: 15, fontWeight: 500, color: THEME.gold, margin: '2px 0' }}>VS</div>
        <div className="game-font" style={{ fontSize: 22, fontWeight: 500, color: '#ff9d8e', textShadow: '0 0 10px rgba(255,110,90,.75)' }}>{L(villain.name)}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={104} />
          <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={104} /></div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 22, marginTop: 4 }}>
          <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: '#fff' }}>{myTotal}</span>
          <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: '#ff9d8e' }}>{villain.power}</span>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 57 · CASSETTE — the matchup labelled like a mixtape, side A vs side B
  else if (variant === 'cassette') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 12, background: THEME.fg1, padding: 12, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ background: THEME.goldLight, borderRadius: 6, padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontWeight: 800, color: '#9e7300', textTransform: 'uppercase', letterSpacing: .6, borderBottom: `1px solid ${THEME.gold}`, paddingBottom: 5 }}>
            <span>{L('Battle')}</span><span>{left}/{battlesPerDay()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0 4px' }}>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: '#9e7300', width: 16 }}>A</span>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={40} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{sel.name}</span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.primary }}>{myTotal}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 4 }}>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: '#9e7300', width: 16 }}>B</span>
            <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={40} />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 800 }}>{L(villain.name)}</span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 34, background: '#3a3733', borderRadius: 6, padding: '14px 0', marginTop: 10 }}>
          {[0, 1].map(i => (
            <div key={i} style={{ width: 46, height: 46, borderRadius: 999, background: THEME.surface2, border: `6px solid ${THEME.fg2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ width: 12, height: 12, borderRadius: 999, background: THEME.fg2 }} />
            </div>
          ))}
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 58 · RECEIPT — the battle math itemised, totalled and signed
  else if (variant === 'receipt') {
    const item = (k, val, bold) => (
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 13, fontWeight: bold ? 800 : 600, color: bold ? THEME.fg1 : THEME.fg2 }}>
        <span>{k}</span><span className="game-font" style={{ fontWeight: 500 }}>{val}</span>
      </div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ background: '#fff', borderRadius: 6, padding: '18px 18px 16px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ textAlign: 'center', paddingBottom: 12, borderBottom: `1.5px dashed ${THEME.border}` }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={92} />
            <div className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 11, color: THEME.fg3, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{L('Matchup')}</div>
          </div>
          <div style={{ padding: '8px 0' }}>
            {item(`${sel.name} · ${L('Power')}`, myPower)}
            {item(L('Safe-walk bonus'), `+${SAFE_WALK_BONUS}`)}
          </div>
          <div style={{ borderTop: `1.5px dashed ${THEME.border}`, paddingTop: 8 }}>
            {item(L('Your total'), myTotal, true)}
            {item(`${L(villain.name)} · ${L('Power')}`, villain.power)}
          </div>
          <div style={{ borderTop: `1.5px dashed ${THEME.border}`, marginTop: 8, paddingTop: 10, textAlign: 'center' }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 14px' }}>{L(v.label)}</span>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 59 · PIXEL — a checkerboard field, sprites squared off across it
  else if (variant === 'pixel') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 18, overflow: 'hidden', boxShadow: THEME.shadowCard, marginBottom: 16, background: `repeating-conic-gradient(${shade(sel.color, 90)} 0 25%, #fff 0 50%) 0 0 / 32px 32px` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '20px 10px 8px' }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={104} />
          <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={104} /></div>
        </div>
        <div style={{ display: 'flex', background: THEME.fg1 }}>
          <div style={{ flex: 1, padding: '9px 12px' }}>
            <div className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#fff' }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.gold }}>{myTotal}</div>
          </div>
          <div style={{ flex: 1, padding: '9px 12px', textAlign: 'right' }}>
            <div className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: '#fff' }}>{L(villain.name)}</div>
            <div className="game-font" style={{ fontSize: 14, fontWeight: 500, color: '#ff9d8e' }}>{villain.power}</div>
          </div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 60 · STICKERS — the bench scattered on a sticker sheet, the pick peeled up
  else if (variant === 'stickers') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '18px 12px', boxShadow: THEME.shadowCard, marginBottom: 16, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
        {owned.map((c, i) => {
          const on = c.id === sel.id;
          const tilt = [(-6), 5, (-3), 7, (-8), 4][i % 6];
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ border: 'none', padding: 0, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', transform: `rotate(${on ? 0 : tilt}deg) scale(${on ? 1.08 : 1})`, transition: 'transform .2s' }}>
              <div style={{ width: 104, borderRadius: 18, background: shade(c.color, on ? 76 : 88), border: `4px solid #fff`, boxShadow: THEME.shadowCard, padding: '10px 4px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={68} />
                <div style={{ fontSize: 12, fontWeight: 800 }}>{c.name}</div>
                <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</div>
              </div>
            </button>
          );
        })}
      </div>
      <QuotaPips left={left} />
    </React.Fragment>
  );

  // 61 · BLUEPRINT — the fighter drafted on graph paper, stats called out
  else if (variant === 'blueprint') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 20, padding: '18px 16px 16px', marginBottom: 16, boxShadow: THEME.shadowCard, background: `repeating-linear-gradient(0deg, rgba(68,122,175,.16) 0 1px, transparent 1px 22px), repeating-linear-gradient(90deg, rgba(68,122,175,.16) 0 1px, transparent 1px 22px), ${THEME.primaryLight}` }}>
        <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.primaryDark, textTransform: 'uppercase', letterSpacing: .8 }}>{L('Your fighter')} · Lv {sel.level}</div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={150} /></div>
        <div className="game-font" style={{ fontSize: 22, fontWeight: 500, textAlign: 'center', color: THEME.primaryDark }}>{sel.name}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginTop: 12 }}>
          {[...traitsOf(sel), ['sparkles', `+${SAFE_WALK_BONUS}`]].map(([ic, val], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, border: `1.5px dashed ${THEME.primary}`, borderRadius: 10, padding: '7px 10px', background: 'rgba(255,255,255,.66)' }}>
              <Icon name={ic} size={14} color={THEME.primaryDark} stroke={2.3} />
              <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.primaryDark }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 62 · METRO — the villain ladder as a transit line; you're between stations
  else if (variant === 'metro') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '18px 14px 14px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ position: 'relative', height: 58, marginBottom: 6 }}>
          <div style={{ position: 'absolute', left: 10, right: 10, top: 20, height: 6, borderRadius: 999, background: THEME.border }} />
          <div style={{ position: 'absolute', left: 10, top: 20, height: 6, borderRadius: 999, background: THEME.success, width: `${(activeVillains().filter(x => x.defeated).length / (activeVillains().length - 1)) * 100}%` }} />
          {activeVillains().map((vl, i) => {
            const now = vl.lv === villain.lv;
            return (
              <div key={vl.lv} style={{ position: 'absolute', left: `calc(10px + ${(i / (activeVillains().length - 1)) * 100}% - ${(i / (activeVillains().length - 1)) * 20}px)`, top: now ? 12 : 16, transform: 'translateX(-50%)', textAlign: 'center' }}>
                <span style={{ display: 'block', width: now ? 22 : 14, height: now ? 22 : 14, borderRadius: 999, background: '#fff', border: `3px solid ${vl.defeated ? THEME.success : now ? THEME.danger : THEME.border}` }} />
                <span className="game-font" style={{ fontSize: 9.5, fontWeight: 500, color: now ? THEME.danger : THEME.fg3 }}>{vl.lv}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${THEME.border}`, paddingTop: 12 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={54} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10.5, fontWeight: 800, color: THEME.danger, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Next villain')}</div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{L(villain.name)}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={54} />
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 63 · CAPSULE — the bench sits in a gacha dome; your pick drops out the chute
  else if (variant === 'capsule') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ borderRadius: '999px 999px 18px 18px', background: `linear-gradient(180deg, ${shade(sel.color, 88)}, ${THEME.surface2})`, border: `3px solid ${THEME.border}`, padding: '22px 14px 16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {owned.map(c => {
            const on = c.id === sel.id;
            return (
              <button key={c.id} onClick={() => setSel(c)} aria-label={c.name} style={{ width: 62, height: 62, borderRadius: 999, background: shade(c.color, 78), border: on ? `3px solid ${THEME.primary}` : '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, cursor: 'pointer' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={56} />
              </button>
            );
          })}
        </div>
        <div style={{ width: 90, height: 14, borderRadius: '0 0 8px 8px', background: THEME.border, margin: '0 auto' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ width: 74, height: 74, borderRadius: 999, background: shade(sel.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={68} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );

  // 64 · CHAT — the fight arranged as a thread; the villain gets the last word
  else if (variant === 'chatlog') {
    const them = (txt) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
        <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={40} />
        <div style={{ maxWidth: '76%', background: THEME.fg1, color: '#fff', borderRadius: '16px 16px 16px 4px', padding: '9px 13px', fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>{txt}</div>
      </div>
    );
    const me = (txt) => (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10, justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '76%', background: THEME.primary, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '9px 13px', fontSize: 13, fontWeight: 600, lineHeight: 1.45 }}>{txt}</div>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={40} />
      </div>
    );
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          {them(`${L(villain.name)} · ${L('Power')} ${villain.power}`)}
          {them(L(villain.desc))}
          {me(L('Ready when you are!'))}
          {me(`${sel.name} · ${L('Total power')} ${myTotal}`)}
          <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '6px 0', marginTop: 4 }}>{L(v.label)}</div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 65 · DIAL — the bench swung along an arc, the chosen one crowning it
  else if (variant === 'dial') {
    const n = owned.length;
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ position: 'relative', height: 250, background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ position: 'absolute', left: '50%', bottom: -150, transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: 999, border: `2px dashed ${THEME.border}` }} />
          <div style={{ position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)', textAlign: 'center' }}>
            <div className="game-font" style={{ fontSize: 17, fontWeight: 500 }}>{sel.name}</div>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.primary }}>{myTotal}</div>
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 14, transform: 'translateX(-50%)' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={108} />
          </div>
          {owned.map((c, i) => {
            if (c.id === sel.id) return null;
            const a = Math.PI - (i + 1) / (n + 1) * Math.PI;   // sweep the bench across the lower arc
            return (
              <button key={c.id} onClick={() => setSel(c)} aria-label={c.name}
                style={{ position: 'absolute', left: `calc(50% + ${Math.cos(a) * 132}px)`, bottom: `calc(-150px + ${Math.sin(a) * 132 + 150}px)`, transform: 'translate(-50%,50%)', width: 54, height: 54, borderRadius: 999, background: shade(c.color, 82), border: `2px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 0, cursor: 'pointer' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={48} />
              </button>
            );
          })}
        </div>
      </React.Fragment>
    );
  }

  // 66 · MOSAIC — an irregular tile wall; the fighter takes the double square
  else if (variant === 'mosaic') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridAutoRows: 104, gap: 8, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ gridColumn: on ? 'span 2' : 'span 1', gridRow: on ? 'span 2' : 'span 1', borderRadius: 18, border: on ? `2.5px solid ${THEME.primary}` : '2.5px solid transparent', background: `linear-gradient(170deg, ${shade(c.color, on ? 74 : 88)}, #fff 80%)`, boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, padding: 4 }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={on ? 118 : 56} />
              <div style={{ fontSize: on ? 15 : 11, fontWeight: 800 }}>{c.name}</div>
              <div className="game-font" style={{ fontSize: on ? 13 : 10.5, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</div>
            </button>
          );
        })}
      </div>
      <QuotaPips left={left} />
    </React.Fragment>
  );

  // 67 · RUNWAY — the bench lined up down a receding stage, your pick out front
  else if (variant === 'runway') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, height: 276, boxShadow: THEME.shadowCard, marginBottom: 16, background: `linear-gradient(180deg, ${THEME.surface2} 0 42%, ${shade(sel.color, 86)} 42% 100%)` }}>
        <div style={{ position: 'absolute', left: '50%', top: '42%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '110px solid transparent', borderRight: '110px solid transparent', borderBottom: `160px solid ${shade(sel.color, 78)}` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 12, display: 'flex', justifyContent: 'center', gap: 4 }}>
          {owned.filter(c => c.id !== sel.id).slice(0, 4).map((c, i) => (
            <button key={c.id} onClick={() => setSel(c)} aria-label={c.name} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', opacity: .55, transform: `scale(${0.78 - i * 0.04})` }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={66} />
            </button>
          ))}
        </div>
        <div className="jx-float" style={{ position: 'absolute', left: '50%', bottom: 46, transform: 'translateX(-50%)' }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={150} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, textAlign: 'center' }}>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
          <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg2 }}>{myTotal} · {L(villain.name)} {villain.power}</div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} size={44} />
    </React.Fragment>
  );

  // 68 · VAULT — a steel door with the fighter behind it; stats read as dials
  else if (variant === 'vault') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 24, background: THEME.surface2, border: `6px solid ${THEME.border}`, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ width: 214, height: 214, margin: '0 auto', borderRadius: 999, border: `8px solid ${THEME.fg3}`, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={168} />
        </div>
        <div className="game-font" style={{ fontSize: 22, fontWeight: 500, textAlign: 'center', marginTop: 10 }}>{sel.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 12 }}>
          {traitsOf(sel).map(([ic, val], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 54, height: 54, borderRadius: 999, background: `conic-gradient(${THEME.primary} ${val}%, ${THEME.border} ${val}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={ic} size={16} color={THEME.fg2} stroke={2.3} />
                </div>
              </div>
              <div className="game-font" style={{ fontSize: 12, fontWeight: 500, marginTop: 3 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 69 · CAMPFIRE — a warm night scene; the bench gathers, the villain waits out in the dark
  else if (variant === 'campfire') body = (
    <React.Fragment>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, height: 288, marginBottom: 16, background: 'radial-gradient(ellipse 200px 130px at 50% 74%, rgba(224,135,74,.5) 0%, rgba(43,41,38,0) 72%), linear-gradient(180deg,#1e1d1c,#2b2926)' }}>
        <div style={{ position: 'absolute', right: 14, top: 16, textAlign: 'center', opacity: .5 }}>
          <div style={{ filter: 'brightness(.55)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={70} /></div>
          <div style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,.6)' }}>{L(villain.name)}</div>
        </div>
        <div className="jx-float" style={{ position: 'absolute', left: '50%', top: 66, transform: 'translateX(-50%)', textAlign: 'center' }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={132} />
          <div className="game-font" style={{ fontSize: 19, fontWeight: 500, color: '#fff' }}>{sel.name}</div>
          <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.gold }}>{myTotal}</div>
        </div>
        <div style={{ position: 'absolute', left: '50%', bottom: 54, transform: 'translateX(-50%)', width: 46, height: 30, borderRadius: '50% 50% 40% 40%', background: `linear-gradient(180deg, ${THEME.gold}, ${THEME.danger})` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
          {owned.filter(c => c.id !== sel.id).map(c => (
            <button key={c.id} onClick={() => setSel(c)} aria-label={c.name} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', opacity: .8 }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={52} />
            </button>
          ))}
        </div>
      </div>
      <QuotaPips left={left} />
    </React.Fragment>
  );

  // 70 · LOCKER — a team room: name plates, kit numbers, the villain pinned up
  else if (variant === 'locker') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.dangerLight, padding: '10px 14px' }}>
          <Icon name="pin" size={14} color={THEME.danger} stroke={2.4} />
          <span style={{ flex: 1, fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{L(villain.name)}</span>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.danger }}>Lv{villain.lv} · {villain.power}</span>
        </div>
        {owned.map((c, i) => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: on ? THEME.primaryLight : 'none', border: 'none', borderLeft: on ? `4px solid ${THEME.primary}` : '4px solid transparent', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ width: 46, height: 46, borderRadius: 10, background: shade(c.color, 84), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={42} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>Lv {c.level} · {L('Total power')} {power(c) + SAFE_WALK_BONUS}</div>
              </div>
              <span className="game-font" style={{ fontSize: 22, fontWeight: 500, color: on ? THEME.primary : THEME.border }}>{String(i + 1).padStart(2, '0')}</span>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 71 · CONSTELLATION — the bench as stars; the chosen one burns brightest
  else if (variant === 'constellation') {
    const n = owned.length;
    const star = (i) => ({ x: 18 + ((i * 37) % 64), y: 14 + ((i * 53) % 62) });   // scatter, deterministically
    body = (
      <React.Fragment>
        <VillainRibbon villain={villain} />
        <div style={{ position: 'relative', height: 292, borderRadius: 24, overflow: 'hidden', marginBottom: 16, background: 'radial-gradient(ellipse at 50% 30%, #2b5782 0%, #12131a 78%)' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {owned.slice(0, n - 1).map((c, i) => {
              const a = star(i), b = star(i + 1);
              return <line key={c.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,.24)" strokeWidth=".5" />;
            })}
          </svg>
          {owned.map((c, i) => {
            const on = c.id === sel.id, p = star(i);
            return (
              <button key={c.id} onClick={() => setSel(c)} aria-label={c.name}
                style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%,-50%)', border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', opacity: on ? 1 : .5 }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} size={on ? 88 : 44} />
                {on && <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{c.name}</div>}
              </button>
            );
          })}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 12, textAlign: 'center' }}>
            <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.gold }}>{myTotal}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)' }}> · {villain.power}</span>
          </div>
        </div>
      </React.Fragment>
    );
  }

  // 72 · BOARD GAME — the ladder as squares on a board, your token mid-track
  else if (variant === 'boardgame') {
    const done = activeVillains().filter(x => x.defeated).length;
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
            {activeVillains().map((vl, i) => {
              const now = i === done;
              return (
                <div key={vl.lv} style={{ position: 'relative', aspectRatio: '1', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: vl.defeated ? THEME.successLight : now ? THEME.dangerLight : THEME.surface2, border: now ? `2px solid ${THEME.danger}` : `1px solid ${THEME.border}` }}>
                  {vl.defeated
                    ? <Icon name="check" size={17} color={THEME.success} stroke={3} />
                    : <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: now ? THEME.danger : THEME.fg3 }}>{vl.lv}</span>}
                  {now && <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={40} /></div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 12, borderTop: `1px solid ${THEME.border}` }}>
            <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={52} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{L(villain.name)}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L('Power')} {villain.power} · {L('Total power')} {myTotal}</div>
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 73 · NEWSPAPER — the fight reported in newsprint, headline and column rule
  else if (variant === 'newspaper') body = (
    <React.Fragment>
      <div style={{ background: '#fff', borderRadius: 6, padding: '16px 16px 14px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: 1.2, borderBottom: `2px solid ${THEME.fg1}`, paddingBottom: 5 }}>
          <span>JoanX Daily</span><span>{L('Battles left')} {left}</span>
        </div>
        <div style={{ fontSize: 27, fontWeight: 800, lineHeight: 1.12, letterSpacing: -.4, marginTop: 10 }}>
          {sel.name} {L('Battle')}: {L(villain.name)}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
          <div style={{ flexShrink: 0, background: THEME.surface2, borderRadius: 4, padding: 6 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={104} />
            <div style={{ fontSize: 9.5, color: THEME.fg3, fontWeight: 700, textAlign: 'center' }}>{sel.name} · {myTotal}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0, borderLeft: `1px solid ${THEME.border}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.5 }}>{L(villain.desc)}</div>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: v.color, marginTop: 8 }}>{L(v.label)}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{L('Power')} {villain.power} · Lv {villain.lv}</div>
          </div>
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 74 · VINYL — the fighter pressed onto a record, spinning on the deck
  else if (variant === 'vinyl') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, padding: '20px 16px 16px', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
        <div style={{ width: 226, height: 226, margin: '0 auto', borderRadius: 999, background: `repeating-radial-gradient(#2b2926 0 3px, #3a3733 3px 4px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="jx-float" style={{ width: 124, height: 124, borderRadius: 999, background: shade(sel.color, 76), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={112} />
          </div>
        </div>
        <div className="game-font" style={{ fontSize: 21, fontWeight: 500, textAlign: 'center', marginTop: 12 }}>{sel.name}</div>
        <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600, textAlign: 'center' }}>{L('Total power')} {myTotal} · Lv {sel.level}</div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 75 · TERMINAL — the matchup printed as a console session, monospace and all
  else if (variant === 'terminal') {
    const mono = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, lineHeight: 1.85 };
    body = (
      <React.Fragment>
        <QuotaPips left={left} />
        <div style={{ borderRadius: 14, background: '#12131a', padding: '12px 14px 14px', marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 6, paddingBottom: 10 }}>
            {[THEME.danger, THEME.warning, THEME.success].map((c, i) => <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: c }} />)}
          </div>
          <div style={{ ...mono, color: '#8fe39a' }}>$ battle --scan</div>
          <div style={{ ...mono, color: 'rgba(255,255,255,.72)' }}>&gt; {L('Opponent')}: {L(villain.name)}</div>
          <div style={{ ...mono, color: 'rgba(255,255,255,.72)' }}>&gt; {L('Power')}: {villain.power} (Lv{villain.lv})</div>
          <div style={{ ...mono, color: '#8fe39a', paddingTop: 6 }}>$ fighter --stats</div>
          <div style={{ ...mono, color: 'rgba(255,255,255,.72)' }}>&gt; {sel.name}: {myPower} +{SAFE_WALK_BONUS} = <span style={{ color: THEME.gold }}>{myTotal}</span></div>
          <div style={{ ...mono, color: v.color, paddingTop: 6 }}>&gt; {L(v.label)}<span style={{ background: v.color, marginLeft: 4 }}>&nbsp;</span></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 12 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={72} />
            <div style={{ transform: 'scaleX(-1)' }}><Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={72} /></div>
          </div>
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 76 · PASSPORT — every villain beaten leaves a stamp on the page
  else if (variant === 'passport') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 10, padding: 16, boxShadow: THEME.shadowCard, border: `2px solid ${THEME.border}`, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottom: `1.5px solid ${THEME.border}` }}>
          <div style={{ width: 72, height: 88, borderRadius: 4, background: shade(sel.color, 84), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
            <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={80} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: 1 }}>{L('Your fighter')}</div>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>Lv {sel.level} · {myTotal}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 12 }}>
          {activeVillains().slice(0, 6).map((vl, i) => {
            const now = vl.lv === villain.lv;
            return (
              <div key={vl.lv} style={{ width: 74, height: 74, borderRadius: 999, border: `2.5px ${vl.defeated ? 'solid' : 'dashed'} ${vl.defeated ? THEME.success : now ? THEME.danger : THEME.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `rotate(${[-8, 6, -4, 9, -6, 3][i]}deg)`, opacity: vl.defeated || now ? 1 : .5 }}>
                <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: vl.defeated ? THEME.success : now ? THEME.danger : THEME.fg3 }}>Lv{vl.lv}</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase' }}>{vl.defeated ? L('Defeated') : now ? L('Next villain') : '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 77 · VENDING — pick your fighter off the shelf, coins in the slot
  else if (variant === 'vending') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <div style={{ borderRadius: 18, background: THEME.fg1, padding: 12, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ borderRadius: 10, background: 'rgba(255,255,255,.9)', padding: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {owned.map((c, i) => {
              const on = c.id === sel.id;
              return (
                <button key={c.id} onClick={() => setSel(c)} style={{ borderRadius: 8, border: on ? `2.5px solid ${THEME.primary}` : `1.5px solid ${THEME.border}`, background: '#fff', padding: '8px 4px 6px', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={54} />
                  <div style={{ fontSize: 11, fontWeight: 800 }}>{c.name}</div>
                  <div className="game-font" style={{ fontSize: 10, fontWeight: 500, color: THEME.fg3 }}>{String.fromCharCode(65 + i)}{i + 1} · {power(c)}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 4px 4px' }}>
          <div style={{ flex: 1, borderRadius: 6, background: '#12131a', padding: '8px 10px' }}>
            <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: '#8fe39a' }}>{sel.name} · {myTotal}</div>
          </div>
          <div style={{ width: 44, height: 8, borderRadius: 999, background: THEME.fg3 }} />
        </div>
        <div style={{ borderRadius: 6, background: 'rgba(255,255,255,.14)', height: 34, marginTop: 6 }} />
      </div>
    </React.Fragment>
  );

  // 78 · PUZZLE — the traits as interlocking pieces that only fit when strong enough
  else if (variant === 'puzzle') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{sel.name}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L('Total power')} {myTotal}</div>
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
          {[...traitsOf(sel), ['sparkles', SAFE_WALK_BONUS]].map(([ic, val], i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 12, background: i === 3 ? THEME.goldLight : shade(sel.color, 88), padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ position: 'absolute', right: -9, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, borderRadius: 999, background: '#fff', display: i % 2 ? 'none' : 'block' }} />
              <Icon name={ic} size={16} color={i === 3 ? THEME.gold : THEME.fg2} stroke={2.3} />
              <span className="game-font" style={{ fontSize: 16, fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 79 · FORECAST — today's outlook, read like a weather widget
  else if (variant === 'forecast') {
    const pct = Math.round((myTotal / (myTotal + villain.power)) * 100);
    body = (
      <React.Fragment>
        <div style={{ borderRadius: 24, padding: '20px 18px 18px', background: `linear-gradient(165deg, ${mixHue(v.color, 0, .28, .55)}, #fff 78%)`, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .8 }}>{L('Win chance')}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="game-font" style={{ fontSize: 62, fontWeight: 500, lineHeight: 1.05, color: v.color }}>{pct}%</span>
            <div style={{ marginLeft: 'auto' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={112} /></div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: v.color }}>{L(v.label)}</div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, marginTop: 1 }}>{sel.name} {myTotal} · {L(villain.name)} {villain.power}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {activeVillains().filter(vl => !vl.defeated).slice(0, 4).map(vl => {
            const w = verdictOf(winPercent(sel, vl));
            return (
              <div key={vl.lv} style={{ flex: 1, background: '#fff', borderRadius: 14, padding: '10px 4px', boxShadow: THEME.shadowCard, textAlign: 'center' }}>
                <div className="game-font" style={{ fontSize: 10.5, fontWeight: 500, color: THEME.fg3 }}>Lv{vl.lv}</div>
                <Mascot species={vl.species} stage={2} color={vl.color} mood="alert" size={40} />
                <div style={{ width: 8, height: 8, borderRadius: 999, background: w.color, margin: '2px auto 0' }} />
              </div>
            );
          })}
        </div>
        <BuddyDots owned={owned} sel={sel} setSel={setSel} />
      </React.Fragment>
    );
  }

  // 80 · TROPHY CASE — beaten villains behind glass; the next one is the empty shelf
  else if (variant === 'trophycase') body = (
    <React.Fragment>
      <QuotaPips left={left} />
      <div style={{ borderRadius: 18, background: '#3a3733', padding: 10, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
        {[0, 1].map(row => (
          <div key={row} style={{ display: 'flex', gap: 8, background: 'linear-gradient(180deg, rgba(255,255,255,.1), rgba(255,255,255,0))', borderBottom: `4px solid ${THEME.fg2}`, borderRadius: 6, padding: '10px 8px', marginBottom: row ? 0 : 8 }}>
            {activeVillains().slice(row * 3, row * 3 + 3).map(vl => {
              const now = vl.lv === villain.lv;
              return (
                <div key={vl.lv} style={{ flex: 1, textAlign: 'center' }}>
                  {vl.defeated
                    ? <React.Fragment>
                        <Mascot species={vl.species} stage={2} color={vl.color} mood="alert" size={52} />
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                          <Icon name="trophy" size={11} color={THEME.gold} stroke={2.4} />
                          <span className="game-font" style={{ fontSize: 10, fontWeight: 500, color: THEME.gold }}>Lv{vl.lv}</span>
                        </div>
                      </React.Fragment>
                    : <div style={{ height: 68, borderRadius: 8, border: `1.5px dashed ${now ? THEME.danger : 'rgba(255,255,255,.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="game-font" style={{ fontSize: 11, fontWeight: 500, color: now ? '#ff9d8e' : 'rgba(255,255,255,.35)' }}>Lv{vl.lv}</span>
                      </div>}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={58} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L('Total power')} {myTotal} · {L(villain.name)} {villain.power}</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 800, color: v.color, background: v.bg, borderRadius: 999, padding: '5px 11px' }}>{L(v.label)}</span>
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // ── system-aligned set (81–100) ─────────────────────────────────────────
  // These stay inside DESIGN-SYSTEM.md: THEME tokens only, the Card recipe
  // (surface / radius 20 / padding 16 / shadowCard), the .t-* type scale, and
  // the shared primitives. No bespoke gradients, glows or one-off hexes.

  // 81 · SYS CARD — the canonical Card recipe, three times over
  else if (variant === 'syscard') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h3">{L(villain.name)}</div>
            <div className="t-body-sm" style={{ color: THEME.fg2 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
          </div>
          <Badge variant="danger">{L('Opponent')}</Badge>
        </div>
      </SysCard>
      <SysCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h3">{sel.name}</div>
            <div className="t-body-sm" style={{ color: THEME.fg2 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
          </div>
          <Badge variant="primary">{L('Your fighter')}</Badge>
        </div>
      </SysCard>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 82 · SYS STAT CARDS — the StatCard tile, the same one Home and Profile use
  else if (variant === 'sysstat') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        {STATS.map((s, i) => (
          <StatCard key={s.key} icon={s.icon} color={STAT_TINT[i % STAT_TINT.length][0]} bg={STAT_TINT[i % STAT_TINT.length][1]}
            value={statsFor(sel)[s.key]} label={L(s.label)} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard icon="sparkles" color={THEME.gold} bg={THEME.goldLight} value={myTotal} label={L('Total power')} big />
        <StatCard icon="skull" color={THEME.fg2} bg={THEME.surface2} value={villain.power} label={L(villain.name)} big />
      </div>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 83 · SYS BADGES — every state said with the Badge primitive, nothing custom
  else if (variant === 'sysbadge') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 16, textAlign: 'center' }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={140} />
        <div className="t-h2" style={{ marginTop: 2 }}>{sel.name}</div>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          <Badge variant="primary">Lv {sel.level}</Badge>
          <Badge variant={sel.rarity === 'epic' ? 'epic' : sel.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[sel.rarity].label)}</Badge>
          <Badge variant="gold">{L('Total power')} {myTotal}</Badge>
          <Badge variant={badgeOf(v)}>{L(v.label)}</Badge>
        </div>
        <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: 14, paddingTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={40} />
          <span className="t-h4" style={{ flex: 1, textAlign: 'left' }}>{L(villain.name)}</span>
          <Badge variant="danger">{villain.power}</Badge>
        </div>
      </SysCard>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 84 · SYS BARS — the Bar primitive carrying the whole comparison
  else if (variant === 'sysbar') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 16 }}>
        <div className="t-h3" style={{ marginBottom: 12 }}>{L('Matchup')}</div>
        {[[sel.name, myTotal, THEME.primary], [L(villain.name), villain.power, THEME.danger]].map(([n, val, color], i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="t-h4">{n}</span>
              <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color }}>{val}</span>
            </div>
            <Bar value={val} max={Math.max(myTotal, villain.power)} color={color} height={10} />
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 12, marginTop: 2 }}>
          {traitsOf(sel).map(([ic, val, top], i, all) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i === all.length - 1 ? 0 : 8 }}>
              <Icon name={ic} size={15} color={THEME.fg2} stroke={2.3} />
              <div style={{ flex: 1 }}><Bar value={val} max={top} color={THEME.fg3} height={7} /></div>
              <span className="game-font" style={{ width: 28, fontSize: 12.5, fontWeight: 500, textAlign: 'right' }}>{val}</span>
            </div>
          ))}
        </div>
      </SysCard>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 85 · SYS PROGRESS — the DexProgress header, reused for the villain ladder
  else if (variant === 'sysprogress') body = (
    <React.Fragment>
      <DexProgress have={activeVillains().filter(x => x.defeated).length} total={activeVillains().length} label="Villains defeated" icon="skull" accent={THEME.danger} />
      <SysCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h3">{sel.name}</div>
            <div className="t-body-sm" style={{ color: THEME.fg2, marginBottom: 6 }}>{L('Total power')} {myTotal} · {L(villain.name)} {villain.power}</div>
            <Bar value={Math.max(0, Math.min(100, 50 + (myTotal - villain.power) / 4))} max={100} color={v.color} height={8} />
          </div>
        </div>
      </SysCard>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 86 · SYS LIST — one card, hairline-separated rows; the pattern the dex uses
  else if (variant === 'syslist') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <VillainCard villain={villain} />
      <SectionHead title={L('Choose a buddy')} />
      <div style={{ background: THEME.surface, borderRadius: 20, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 16 }}>
        {owned.map((c, i) => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: on ? THEME.primaryLight : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="t-h4">{c.name}</div>
                <div className="t-label-sm" style={{ color: THEME.fg3 }}>Lv {c.level}</div>
              </div>
              <RarityPill rarity={c.rarity} />
              <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: on ? THEME.primary : THEME.fg2 }}>{power(c)}</span>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 87 · SYS TILES — 2-up cards on the 4px grid, 12px gaps, radius 20
  else if (variant === 'systile') body = (
    <React.Fragment>
      <VillainCard villain={villain} />
      <SectionHead title={L('Choose a buddy')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ background: THEME.surface, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, border: on ? `1.5px solid ${THEME.primary}` : '1.5px solid transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={80} />
              <div className="t-h4">{c.name}</div>
              <RarityPill rarity={c.rarity} />
              <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</span>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 88 · SYS HERO — the buddy-tinted wash the system already defines, flat CTA
  else if (variant === 'syshero') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <div style={{ borderRadius: 28, padding: 24, background: mixHue(sel.color, 0, .3, .3), marginBottom: 16, textAlign: 'center' }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={168} />
        <div className="t-display" style={{ marginTop: 2 }}>{sel.name}</div>
        <div className="t-body-sm" style={{ color: THEME.fg2 }}>Lv {sel.level} · {L('Total power')} {myTotal}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          <Badge variant="primary">{L('Your fighter')}</Badge>
          <Badge variant={badgeOf(v)}>{L(v.label)}</Badge>
        </div>
      </div>
      <VillainRibbon villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 89 · SYS SEGMENTED — a surface2 well with a sliding ocean selection
  else if (variant === 'syssegment') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <div style={{ display: 'flex', background: THEME.surface2, borderRadius: 16, padding: 4, gap: 4, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ flex: 1, minWidth: 0, borderRadius: 12, padding: '8px 4px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: on ? THEME.surface : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={40} />
              <span className="t-label-sm" style={{ color: on ? THEME.primary : THEME.fg2, fontWeight: 700 }}>{c.name}</span>
            </button>
          );
        })}
      </div>
      <SysCard style={{ marginBottom: 16, textAlign: 'center' }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={148} />
        <div className="t-h1">{sel.name}</div>
        <TraitRow c={sel} />
        <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span className="t-body-sm" style={{ color: THEME.fg2 }}>{L(villain.name)}</span>
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.danger }}>{villain.power}</span>
        </div>
      </SysCard>
    </React.Fragment>
  );

  // 90 · SYS WELLS — surface2 wells inside a white card, the settings idiom
  else if (variant === 'syswell') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 16 }}>
        <div className="t-h3" style={{ marginBottom: 12 }}>{L('Matchup')}</div>
        {[[sel, sel.name, myTotal, L('Your fighter'), false], [villain, L(villain.name), villain.power, L('Opponent'), true]].map(([c, n, val, tag, foe], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: THEME.surface2, borderRadius: 16, padding: 12, marginBottom: i ? 0 : 10 }}>
            {foe
              ? <Mascot species={c.species} stage={2} color={c.color} mood="alert" size={46} />
              : <Mascot species={c.species} stage={c.stage} color={c.color} size={46} />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="t-label-sm" style={{ color: THEME.fg3, fontWeight: 700 }}>{tag}</div>
              <div className="t-h4">{n}</div>
            </div>
            <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: foe ? THEME.danger : THEME.primary }}>{val}</span>
          </div>
        ))}
      </SysCard>
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 91 · SYS RARITY — the roster read through RARITY, the game layer's own scale
  else if (variant === 'sysrarity') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      {['epic', 'rare', 'common'].map(rar => {
        const group = owned.filter(c => c.rarity === rar);
        if (!group.length) return null;
        return (
          <div key={rar}>
            <SectionHead title={`${L(RARITY[rar].label)} · ${group.length}`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
              {group.map(c => {
                const on = c.id === sel.id;
                return (
                  <button key={c.id} onClick={() => setSel(c)} style={{ background: THEME.surface, borderRadius: 16, padding: '12px 6px', border: `1.5px solid ${on ? THEME.primary : RARITY[rar].bg}`, boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Mascot species={c.species} stage={c.stage} color={c.color} size={58} />
                    <div className="t-label" style={{ fontWeight: 700 }}>{c.name}</div>
                    <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg2 }}>{power(c)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </React.Fragment>
  );

  // 92 · SYS POINTS — the reward at stake, framed with PointsChip and gold tokens
  else if (variant === 'syspoints') body = (
    <React.Fragment>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}><PointsChip pts={PLAYER.points} /></div>
      <SysCard style={{ marginBottom: 12, textAlign: 'center' }}>
        <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={150} />
        <div className="t-h1">{sel.name}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, borderRadius: 999, padding: '7px 14px', marginTop: 8 }}>
          <Icon name="star" size={15} color={THEME.gold} fill={THEME.gold} stroke={2} />
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg1 }}>+120 {L('points')}</span>
        </div>
      </SysCard>
      <SysCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={44} />
          <span className="t-h4" style={{ flex: 1 }}>{L(villain.name)}</span>
          <Badge variant={badgeOf(v)}>{L(v.label)}</Badge>
        </div>
      </SysCard>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 93 · SYS CALLOUT — primaryLight / dangerLight tint blocks, the info idiom
  else if (variant === 'syscallout') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      {[[THEME.dangerLight, THEME.danger, 'skull', L(villain.name), `Lv ${villain.lv} · ${L('Power')} ${villain.power}`],
        [THEME.primaryLight, THEME.primaryDark, 'shield', sel.name, `Lv ${sel.level} · ${L('Total power')} ${myTotal}`],
        [THEME.goldLight, THEME.gold, 'sparkles', L('Safe-walk bonus'), `+${SAFE_WALK_BONUS}`]].map(([bg, fg, ic, title, meta], i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: bg, borderRadius: 16, padding: 14, marginBottom: 10 }}>
          <Icon name={ic} size={20} color={fg} stroke={2.3} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h4" style={{ color: THEME.fg1 }}>{title}</div>
            <div className="t-body-sm" style={{ color: THEME.fg2 }}>{meta}</div>
          </div>
        </div>
      ))}
      <div style={{ height: 6 }} />
      <SectionHead title={L('Choose a buddy')} />
      <BuddyStrip owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 94 · SYS AVATARS — the avatar token: full-radius disc on a step-10 tint
  else if (variant === 'sysavatar') body = (
    <React.Fragment>
      <VillainRibbon villain={villain} />
      <SysCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {owned.map(c => {
            const on = c.id === sel.id;
            return (
              <button key={c.id} onClick={() => setSel(c)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', fontFamily: 'inherit', width: 76, textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: 999, background: THEME.surface2, border: on ? `2.5px solid ${THEME.primary}` : `1.5px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', margin: '0 auto' }}>
                  <Mascot species={c.species} stage={c.stage} color={c.color} size={64} />
                </div>
                <div className="t-label" style={{ fontWeight: 700, marginTop: 4 }}>{c.name}</div>
                <div className="t-caption" style={{ color: THEME.fg3 }}>Lv {c.level}</div>
              </button>
            );
          })}
        </div>
        <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: 14, paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="t-h4">{sel.name}</span>
          <Badge variant="gold">{myTotal}</Badge>
        </div>
      </SysCard>
    </React.Fragment>
  );

  // 95 · SYS METRICS — display numerals on the type scale, labels beneath
  else if (variant === 'sysmetric') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={72} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-label-sm" style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Total power')}</div>
            <div className="game-font" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.05, color: THEME.primary }}>{myTotal}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="t-label-sm" style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Opponent')}</div>
            <div className="game-font" style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.05, color: THEME.danger }}>{villain.power}</div>
          </div>
        </div>
      </SysCard>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <StatCard icon="swords" color={THEME.primary} bg={THEME.primaryLight} value={`${left}/${battlesPerDay()}`} label={L('Battles left')} />
        <StatCard icon="trending-up" color={v.color} bg={v.bg} value={L(v.label)} label={L('Matchup')} />
      </div>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 96 · SYS SHEET — a bottom-sheet card: 28px top radius, grabber, hairline rows
  else if (variant === 'syssheet') body = (
    <React.Fragment>
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={150} />
        <div className="t-h1">{L(villain.name)}</div>
        <div className="t-body-sm" style={{ color: THEME.fg2 }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
      </div>
      <div style={{ background: THEME.surface, borderRadius: '28px 28px 20px 20px', padding: '12px 16px 16px', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
        <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span className="t-h3">{L('Your fighter')}</span>
          <Badge variant={badgeOf(v)}>{L(v.label)}</Badge>
        </div>
        <BuddyStrip owned={owned} sel={sel} setSel={setSel} size={54} />
      </div>
    </React.Fragment>
  );

  // 97 · SYS SPENT — the daily cap as a first-class state, not an afterthought
  else if (variant === 'sysempty') body = (
    <React.Fragment>
      <SysCard style={{ marginBottom: 16, textAlign: 'center', padding: '28px 16px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: usedToday ? THEME.surface2 : THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <Icon name={usedToday ? 'calendar-check' : 'swords'} size={30} color={usedToday ? THEME.fg3 : THEME.primary} stroke={2.2} />
        </div>
        <div className="t-h2">{usedToday ? L("That's your battle for today") : `${L('Battles left')} ${left}`}</div>
        <div className="t-body-sm" style={{ color: THEME.fg2, marginTop: 4, maxWidth: 250, marginLeft: 'auto', marginRight: 'auto' }}>
          {usedToday ? L('Come back tomorrow for your next challenge.') : L("Five villain challenges a day. Battles pause while you're walking.")}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: battlesPerDay() }, (_, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: i < left ? THEME.primary : THEME.border }} />
          ))}
        </div>
      </SysCard>
      <VillainCard villain={villain} />
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 98 · SYS GRID — the dex's 3-up grid, verbatim, with the villain as a header card
  else if (variant === 'sysgrid') body = (
    <React.Fragment>
      <VillainCard villain={villain} />
      <SectionHead title={L('Choose a buddy')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        {owned.map(c => {
          const on = c.id === sel.id;
          return (
            <button key={c.id} onClick={() => setSel(c)} style={{ background: THEME.surface, borderRadius: 18, padding: '12px 6px 10px', boxShadow: THEME.shadowCard, border: on ? `1.5px solid ${THEME.primary}` : '1.5px solid transparent', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={62} />
              <div className="t-label" style={{ fontWeight: 700, marginTop: 4 }}>{c.name}</div>
              <Badge variant={c.rarity === 'epic' ? 'epic' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 4, fontSize: 9, padding: '2px 6px' }}>{L(RARITY[c.rarity].label)}</Badge>
            </button>
          );
        })}
      </div>
    </React.Fragment>
  );

  // 99 · SYS BANNER — a step-10 tint banner card, ink at step-70, no gradient
  else if (variant === 'sysbanner') body = (
    <React.Fragment>
      <div style={{ background: THEME.primaryLight, borderRadius: 20, padding: 20, marginBottom: 12 }}>
        <div className="t-label-sm" style={{ color: THEME.primaryDark, fontWeight: 800, textTransform: 'uppercase', letterSpacing: .5 }}>{L('Next villain')}</div>
        <div className="t-display" style={{ color: THEME.primaryDark }}>{L(villain.name)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <Mascot species={villain.species} stage={2} color={villain.color} mood="alert" size={64} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-body-sm" style={{ color: THEME.primaryDark }}>Lv {villain.lv} · {L('Power')} {villain.power}</div>
            <div style={{ marginTop: 6 }}><Bar value={villain.power} max={myTotal + villain.power} color={THEME.primary} track={THEME.surface} height={8} /></div>
          </div>
        </div>
      </div>
      <SysCard style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Mascot species={sel.species} stage={sel.stage} color={sel.color} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="t-h3">{sel.name}</div>
            <div className="t-body-sm" style={{ color: THEME.fg2 }}>{L('Total power')} {myTotal}</div>
          </div>
          <Badge variant={badgeOf(v)}>{L(v.label)}</Badge>
        </div>
      </SysCard>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  // 100 · SYS REVIEW — a confirm step: everything restated before you commit
  else if (variant === 'sysreview') body = (
    <React.Fragment>
      <Quota left={left} usedToday={usedToday} />
      <SysCard style={{ marginBottom: 16 }}>
        <div className="t-h3" style={{ marginBottom: 12 }}>{L('Matchup')}</div>
        {[[L('Your fighter'), `${sel.name} · Lv${sel.level}`], [L('Power'), myPower], [L('Safe-walk bonus'), `+${SAFE_WALK_BONUS}`],
          [L('Your total'), myTotal], [L('Opponent'), `${L(villain.name)} · ${villain.power}`], [L('Battles left'), `${left}/${battlesPerDay()}`]].map(([k, val], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
            <span className="t-body-sm" style={{ color: THEME.fg2 }}>{k}</span>
            <span className="t-h4">{val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: v.bg, borderRadius: 16, padding: 12, marginTop: 12 }}>
          <Icon name="trending-up" size={18} color={v.color} stroke={2.3} />
          <span className="t-h4" style={{ color: v.color }}>{L(v.label)}</span>
        </div>
      </SysCard>
      <BuddyDots owned={owned} sel={sel} setSel={setSel} />
    </React.Fragment>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Battle')} onBack={() => ctx.nav('home')}
        right={<button onClick={() => ctx.nav('villaindex')} aria-label={L('Villain Dex')} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', border: 'none', borderRadius: 999, padding: '7px 12px', boxShadow: THEME.shadowCard, cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="skull" size={15} color={THEME.danger} stroke={2.3} /><span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg1 }}>{L('Dex')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        {body}
        {cta}
      </div>
    </div>
  );
}

export { BattleSelect, BATTLE_LAYOUTS };
