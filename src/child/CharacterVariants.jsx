// JoanX — child app · CharacterVariants

import React from 'react';
import { buyItem, canBuyItem, canConvertPoints, CHARACTERS, convertPointsToXp, EXCHANGE, moodForStage, nextStageAt, OUTFITS, PLAYER, pointsForXp, STAGES, stageBand, stageOf, STATS, statsFor } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, RARITY, SafePointIcon, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade, tint } from '../core/characters.jsx';
import { isNeon, mixHue, pastelHue, outfitSlotsFor, outfitItemsFor } from './shared.jsx';
import { CharacterDetail } from './CharacterDetail.jsx';

function CharVariant({ ctx, variant }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params.id) || CHARACTERS[0];
  const color = orig.color;
  const [tab, setTab] = React.useState('stat');
  const slots = outfitSlotsFor(orig);
  const [slotFilter, setSlotFilter] = React.useState(slots[0].id);
  // A-3.3 — the stage is READ, not chosen. It follows the level (Stage 1 Lv.1–3, Stage 2
  // Lv.4–7, Stage 3 Lv.8–10, all server-tunable), so there is no "Evolve now" button any
  // more: the buddy transforms the moment the level that earns it lands, wherever that
  // happens — a battle, a mission, or the point exchange. A manual button would let a
  // Lv.8 buddy sit un-evolved because the child never opened this screen.
  const level = orig.level;
  const stage = orig.stage;
  const info = stageOf(stage);            // art · anim · expression · lines for this stage
  const nextAt = nextStageAt(level);      // level the next stage lands at, or null if grown

  // A-5: outfits are bought here, on the buddy they belong to — not in the
  // Points shop. Free ones are granted as the buddy evolves into their stage.
  const [pts, setPts] = React.useState(PLAYER.points);
  const [bought, setBought] = React.useState(() => new Set());
  const [worn, setWorn] = React.useState(() => new Set());
  const [note, setNote] = React.useState(null);

  const locked = (o) => stage < o.minStage;                      // needs a later stage
  // A-5.1 — an outfit can arrive three ways: granted at price 0, bought here, or EARNED
  // by a rule (level, achievement, event, villain), which sets `owned` on the item row.
  // Missing that last case would show a hat the child has already won as still for sale.
  const ownedOutfit = (o) => o.owned || bought.has(o.id) || (o.price === 0 && !locked(o));
  const toast = (msg) => { setNote(msg); setTimeout(() => setNote(null), 1600); };

  const buyOutfit = (o) => {
    if (ownedOutfit(o)) return;
    const verdict = canBuyItem(o, PLAYER, stage);
    if (!verdict.ok) {
      if (verdict.reason === 'stage') return toast(`${L('Unlocks at Stage')} ${verdict.need}`);
      if (verdict.reason === 'level') return toast(`${L('Unlocks at Lv')} ${verdict.need}`);
      return toast(L('Not enough points yet'));
    }
    buyItem(o, PLAYER, stage); setPts(PLAYER.points);
    setBought(s => new Set(s).add(o.id));
    setWorn(s => new Set(s).add(o.id));
    toast(`${L(o.name)} ${L('unlocked!')}`);
  };
  const toggleWear = (o) => {
    if (!ownedOutfit(o)) return;
    setWorn(s => { const n = new Set(s); n.has(o.id) ? n.delete(o.id) : n.add(o.id); return n; });
  };

  // free outfits equip themselves the moment the buddy reaches their stage
  const isWorn = (o) => ownedOutfit(o) && (o.price === 0 || worn.has(o.id));

  // The existing Items tab IS the outfit shop — no second section. A tile is
  // locked only when stage-gated; an affordable unowned tile shows its price.
  const items = outfitItemsFor(orig, OUTFITS).map(o => ({ ...o, on: isWorn(o), own: ownedOutfit(o), locked: locked(o) }));
  const tapItem = (it) => {
    const o = OUTFITS.find(x => x.id === it.id);
    if (!o || locked(o)) return;
    ownedOutfit(o) ? toggleWear(o) : buyOutfit(o);
  };
  // the line under each tile's name
  const itemStatus = (it) => it.locked
    ? `${L('Stage')} ${it.minStage}`
    : it.own
      ? (it.on ? L('Equipped') : L('Tap to equip'))
      : `★ ${it.price}`;
  // A-3.3 — the four core stats, derived from rarity + level + stage in data.jsx.
  // `stage` is component state (it changes live when the buddy evolves), so the stats
  // are read against that rather than the stale roster row — evolving must visibly
  // move the numbers, which is the whole point of a stage-up.
  const STAT_COLOR = { hp: THEME.joy, courage: THEME.gold, protection: THEME.primary, speed: '#4b9a6b' };
  const statVals = statsFor({ ...orig, level, stage });
  // HP is hidden from the buddy stat view (still drives battle math via STATS/statsFor).
  const shownStats = STATS.filter(s => s.key !== 'hp');
  // rings are relative to the biggest stat on show, so a fixed /100 dial doesn't
  // peg every ring full and tell the child nothing.
  const statMax = Math.max(...shownStats.map(s => statVals[s.key]), 1);
  const traits = shownStats.map(s => ({ k: s.key, label: s.label, icon: s.icon, color: STAT_COLOR[s.key] }));
  // Detail chrome — background, hero, tabs, accents — is ALWAYS the product green, never the
  // buddy's own colour. The buddy is art (the Mascot keeps its species colour); switching or
  // previewing a buddy never repaints the screen. Only the stat rings keep their per-stat hues.
  const brand = THEME.brand;
  const accent = brand;
  // The "Set as my buddy" CTA is an *app* action, not part of this character's card, so it
  // wears the app accent (the active buddy's colour — the same one the tab bar's fight button
  // uses). Tinting it with the character you're merely previewing made the two disagree.
  const appAccent = (CHARACTERS.find(x => x.id === PLAYER.activeCharId) || orig).color;
  // color-heavy backgrounds get frosted cards (the bg tints through); light ones stay crisp white
  const onColorBg = variant === 'vivid' || variant === 'focus' || variant === 'showcase';
  const card = onColorBg
    ? { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(46,43,41,0.12)', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: 'none' }
    : { background: '#fff', border: '1.5px solid rgba(46,43,41,0.10)', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: THEME.shadowSoft };
  const tileBg = onColorBg ? 'rgba(255,255,255,0.42)' : THEME.surface2;
  const title = { fontSize: 14, fontWeight: 800, marginBottom: 12, color: THEME.fg1 };
  const head = (icon, text) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800, color: THEME.fg1, marginBottom: 12 }}>
      <Icon name={icon} size={15} color={accent} stroke={2.5} />{text}
    </div>
  );

  // ── top bar (back · name · decorate) ──
  // The fight shortcut moved off this screen: the bottom tab bar's own battle button
  // is already global and one tap away, so a second sword icon here was redundant.
  // What's specific to a buddy's own page is dressing that buddy up — so the
  // buddy-scoped action lives here instead (F-5, DecorateBuddy.jsx).
  // The shirt button gets the same corner dot HomeVariantsSimple's egg-shop badge uses for
  // "something here is worth a look" — on whenever an unlocked outfit is still unbought, off
  // once the buddy owns everything it's currently allowed to wear.
  const hasUnbought = items.some(it => !it.own && !it.locked);
  const TopBar = ({ onColor }) => {
    const btn = onColor ? '#fff' : '#fff';
    const ink = THEME.fg1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <button onClick={() => ctx.back()} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: btn, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="chevron-left" size={20} color={ink} stroke={2.4} /></button>
        <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: ink }}>{orig.name}</span>
        <button onClick={() => ctx.nav('decoratebuddy', { id: orig.id })} style={{ position: 'relative', width: 38, height: 38, borderRadius: 999, border: 'none', background: btn, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Icon name="shirt" size={18} color={accent} stroke={2.2} />
          {hasUnbought && <span style={{ position: 'absolute', top: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: THEME.brand, border: '2px solid #fff' }} />}
        </button>
      </div>
    );
  };

  // ── shared body sections ──
  const traitsContent = (
    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
      {traits.map(t => {
        const v = statVals[t.k];
        const R = 27, SW = 6, sz = 2 * (R + SW), circ = 2 * Math.PI * R;
        return (
          <div key={t.k} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v / statMax)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div className="game-font" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, color: THEME.fg1 }}>{v}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>{L(t.label)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
  // category chips for the accessories tab — filters `items` to one OUTFITS slot at a
  // time (A-5.1's taxonomy), reused as-is across every variant's item panel below.
  const filteredItems = items.filter(it => it.slot === slotFilter);
  // Category chips float free between the top tabs and the content card — their own
  // crisp white pills with a hairline lift, rather than crammed inside the card with
  // the grid. Reads as a second-level tab, not a second section of the same box.
  const slotTabRow = (
    <div className="no-sb" style={{ display: 'flex', gap: 7, overflowX: 'auto', width: '100%' }}>
      {slots.filter(s => items.some(it => it.slot === s.id)).map(s => {
        const on = slotFilter === s.id;
        return (
          <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 'none', border: on ? 'none' : '1.5px solid rgba(46,43,41,0.08)', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '7px 14px', background: on ? accent : '#fff', boxShadow: on ? `0 4px 10px ${accent}4a` : THEME.shadowCard, display: 'inline-flex', alignItems: 'center', gap: 5, color: on ? '#fff' : THEME.fg2, fontWeight: 800, fontSize: 11.5, whiteSpace: 'nowrap', transition: 'all .12s ease' }}>
            <Icon name={s.icon} size={12} color={on ? '#fff' : THEME.fg3} stroke={2.4} />{L(s.label)}
          </button>
        );
      })}
    </div>
  );
  const itemGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 10, width: '100%' }}>
      {filteredItems.map(it => (
        <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ position: 'relative', minWidth: 0, borderRadius: 16, background: it.on ? `${accent}1c` : tileBg, border: it.on ? `2px solid ${accent}` : '2px solid transparent', padding: '12px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', opacity: it.locked ? .65 : 1 }}>
          {it.img && !it.locked
            ? <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
            : <div style={{ width: 34, height: 34, borderRadius: 999, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
                <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
              </div>}
          <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
          <span style={{ fontSize: 8.5, fontWeight: 800, color: it.on ? accent : it.own || it.locked ? THEME.fg3 : THEME.gold }}>{itemStatus(it)}</span>
        </button>
      ))}
    </div>
  );
  const Panel = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* segmented tabs */}
      <div style={{ display: 'flex', gap: 4, background: onColorBg ? 'rgba(255,255,255,0.42)' : THEME.surface2, borderRadius: 16, padding: 4, marginBottom: 12, border: '1.5px solid rgba(46,43,41,0.08)' }}>
        {[['stat', L('Stats'), 'swords'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          // on the colored variants, gray inactive icons go muddy — use a readable buddy-tint instead
          const offText = onColorBg ? shade(brand, -48) : THEME.fg2;
          const offIcon = onColorBg ? shade(brand, -34) : THEME.fg3;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 4px', background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? accent : offText, fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={icon} size={14} color={on ? accent : offIcon} stroke={2.4} />{label}
            </button>
          );
        })}
      </div>
      {/* category chips — Items tab only */}
      {tab === 'item' && <div style={{ marginBottom: 10 }}>{slotTabRow}</div>}
      {/* content */}
      <div style={{ ...card, marginBottom: 0, minHeight: 150, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? traitsContent : itemGrid}
      </div>
    </div>
  );
  // ── showcase-only content: revamped layouts inside the white card ──
  // stats as refined rings — icon + value nested inside, soft tinted track, label below
  const traitsContentShowcase = (
    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
      {traits.map(t => {
        const v = statVals[t.k];
        const R = 31, SW = 7, sz = 2 * (R + SW), circ = 2 * Math.PI * R;
        return (
          <div key={t.k} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={`${t.color}26`} strokeWidth={SW} />
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v / statMax)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
                <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{v}</span>
              </div>
            </div>
            <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginTop: 9 }}>{L(t.label)}</span>
          </div>
        );
      })}
    </div>
  );
  // Tweaks: Stat style · 'bars' — a labeled horizontal meter per stat (icon+label,
  // current/max readout, filled track), reinterpreted in this app's own flat sand +
  // per-stat colors rather than the dark sci-fi panel it was pulled from.
  const statStyle = ctx.tweaks?.statStyle || 'ring';
  const traitsContentBars = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
      {traits.map(t => {
        const v = statVals[t.k];
        const pct = Math.min(100, (v / statMax) * 100);
        return (
          <div key={t.k}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
                <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg2, letterSpacing: 0.3, textTransform: 'uppercase' }}>{L(t.label)}</span>
              </div>
              <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg1 }}>{v}/{statMax}</span>
            </div>
            <div style={{ height: 10, borderRadius: 999, background: `${t.color}1f`, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: t.color, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
  // the buddy's personality blurb — accessories now live on their own dedicated
  // screen (the shirt icon in TopBar → DecorateBuddy), so this tab isn't a second,
  // redundant copy of that shop; it's something the item grid never had room for.
  const storyContent = (
    <div style={{ width: '100%' }}>
      <Icon name="quote" size={18} color={`${accent}55`} stroke={2.4} style={{ marginBottom: 6 }} />
      <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6, margin: 0, textAlign: 'left' }}>
        {orig.bio ? L(orig.bio) : L("This buddy's story hasn't been written yet.")}
      </p>
    </div>
  );

  // showcase gets its own panel — floating frosted chip-tabs over the same
  // flat card/well chrome the rest of the app uses, to match the premium
  // pedestal hero without reaching for glow.
  const PanelShowcase = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* segmented tabs — the same well recipe as every other screen's toggle
          (Notifications/Collection/Profile): a frosted track, white active pill
          defined by shadowCard's hairline ring, never a colored glow */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.42)', borderRadius: 999, padding: 4, marginBottom: 14, border: '1.5px solid rgba(255,255,255,0.55)' }}>
        {[['stat', L('Stats'), 'swords'], ['story', L('Story'), 'book-open']].map(([id, label, icon]) => {
          const on = tab === id;
          const offText = shade(brand, -48);
          const offIcon = shade(brand, -34);
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '10px 4px', background: on ? accent : 'transparent', boxShadow: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: on ? '#fff' : offText, fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={icon} size={14} color={on ? '#fff' : offIcon} stroke={2.4} />{label}
            </button>
          );
        })}
      </div>
      {/* content — the same frosted/flat card every other panel here uses */}
      <div style={{ ...card, marginBottom: 0, minHeight: 150, display: 'flex', alignItems: tab === 'stat' ? 'center' : 'flex-start' }}>
        {tab === 'stat' ? (statStyle === 'bars' ? traitsContentBars : traitsContentShowcase) : storyContent}
      </div>
    </div>
  );
  // focus gets a single "tabbed card" — underline tabs sit inside the card,
  // with content styled as horizontal meters / preview-palette / item rail.
  const PanelFocus = (
    <div key="pn" style={{ ...card, marginBottom: 14, padding: 0, overflow: 'hidden' }}>
      {/* underline tab header */}
      <div style={{ display: 'flex', padding: '2px 6px 0', borderBottom: '1.5px solid rgba(46,43,41,0.08)' }}>
        {[['stat', L('Stats'), 'swords'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '12px 4px 13px', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? accent : shade(brand, -36), fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={icon} size={14} color={on ? accent : shade(brand, -24)} stroke={2.4} />{label}
              <span style={{ position: 'absolute', bottom: -1, left: '22%', right: '22%', height: 3, borderRadius: 3, background: on ? accent : 'transparent', transition: 'background .15s ease' }} />
            </button>
          );
        })}
      </div>
      {/* category chips — their own strip with a divider, distinct from both the tab
          header above and the item rail below, Items tab only */}
      {tab === 'item' && (
        <div style={{ padding: '10px 16px', borderBottom: '1.5px solid rgba(46,43,41,0.08)' }}>{slotTabRow}</div>
      )}
      {/* content */}
      <div style={{ padding: '18px 16px', minHeight: 132, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {traits.map(t => {
              const v = statVals[t.k];
              return (
                <div key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon name={t.icon} size={16} color={t.color} stroke={2.5} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, width: 64, flexShrink: 0 }}>{L(t.label)}</span>
                  <div style={{ flex: 1, height: 9, borderRadius: 999, background: `${t.color}26`, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round((v / statMax) * 100)}%`, height: '100%', borderRadius: 999, background: t.color, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                  <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg1, width: 26, textAlign: 'right', flexShrink: 0 }}>{v}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-sb" style={{ display: 'flex', gap: 10, width: '100%', overflowX: 'auto' }}>
            {filteredItems.map(it => (
              <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ flex: 1, minWidth: 70, borderRadius: 16, background: it.on ? `${accent}16` : tileBg, border: it.on ? `1.5px solid ${accent}` : '1.5px solid transparent', padding: '12px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', opacity: it.locked ? .65 : 1 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
                  <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, color: it.on ? accent : it.own || it.locked ? THEME.fg3 : THEME.gold }}>{itemStatus(it)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  // a function, not a plain element: xpAddStyle (declared further down, in xpAdd's own
  // block) decides whether this stays the primary action or steps down to the outline
  // secondary once Add-XP's 'cta' style takes over as primary — see the fixed footer below.
  const setBtn = () => (
    <Button key="set" variant={xpAddStyle === 'cta' ? 'outline' : 'primary'} size="lg" fullWidth style={xpAddStyle === 'cta' ? { marginTop: 2, borderColor: THEME.fg3 } : { marginTop: 2, background: appAccent, boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
  );
  // wave gets its own panel — rounded pill tabs (accent-filled active),
  // semicircle gauges for stats, and 2×2 item cards.
  const PanelWave = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* pill segmented tabs — active fills with the buddy color */}
      <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 999, padding: 4, marginBottom: 12, border: '1.5px solid rgba(46,43,41,0.07)' }}>
        {[['stat', L('Stats'), 'swords'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '9px 4px', background: on ? accent : 'transparent', boxShadow: on ? `0 4px 10px ${accent}55` : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? '#fff' : THEME.fg2, fontWeight: 800, fontSize: 12.5, transition: 'all .15s ease' }}>
              <Icon name={icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.4} />{label}
            </button>
          );
        })}
      </div>
      {/* category chips — Items tab only */}
      {tab === 'item' && <div style={{ marginBottom: 10 }}>{slotTabRow}</div>}
      {/* content card */}
      <div style={{ ...card, marginBottom: 0, minHeight: 150, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? (
          // semicircle gauges (speedometer style)
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            {traits.map(t => {
              const v = statVals[t.k];
              const R = 30, SW = 8, W = 2 * (R + SW), H = R + SW + 16, cy = R + SW, arc = Math.PI * R;
              return (
                <div key={t.k} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: W, height: H }}>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
                      <path d={`M ${SW} ${cy} A ${R} ${R} 0 0 1 ${W - SW} ${cy}`} fill="none" stroke={`${t.color}26`} strokeWidth={SW} strokeLinecap="round" />
                      <path d={`M ${SW} ${cy} A ${R} ${R} 0 0 1 ${W - SW} ${cy}`} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={arc * (1 - v / statMax)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
                    </svg>
                    <div className="game-font" style={{ position: 'absolute', left: 0, right: 0, top: cy - 19, fontSize: 18, fontWeight: 500, color: THEME.fg1, textAlign: 'center' }}>{v}</div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Icon name={t.icon} size={12} color={t.color} stroke={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>{L(t.label)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // 2×2 item cards with a corner badge
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, width: '100%' }}>
            {filteredItems.map(it => (
              <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ position: 'relative', minWidth: 0, borderRadius: 16, background: it.on ? `${accent}12` : THEME.surface2, border: it.on ? `2px solid ${accent}` : '2px solid transparent', padding: '13px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, textAlign: 'center', cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', opacity: it.locked ? .65 : 1 }}>
                {it.on && <span style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={10} color="#fff" stroke={3.5} /></span>}
                <div style={{ width: 42, height: 42, borderRadius: 13, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
                  <Icon name={it.locked ? 'lock' : it.icon} size={19} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg1, lineHeight: 1.15 }}>{L(it.name)}</span>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: it.on ? accent : it.own || it.locked ? THEME.fg3 : THEME.gold }}>{itemStatus(it)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  // A-3.3 — the growth panel. Replaces the old "Evolve now" button: there is nothing to
  // press, so this explains where the buddy IS and what the next form costs, in levels.
  const StagePanel = (
    <div key="stage" style={{ ...card }}>
      {head('sparkles', `${L('Stage')} ${stage} · ${L(info.name)}`)}
      {/* the three stages as a track — the one you're in is lit, the rest show their level gate */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {STAGES.map(s => {
          const on = s.stage === stage, done = s.stage < stage;
          return (
            <div key={s.stage} style={{ flex: 1, textAlign: 'center', background: on ? tint(accent, .14) : tileBg, border: `1.5px solid ${on ? accent : 'transparent'}`, borderRadius: 12, padding: '8px 4px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: on ? shade(accent, -34) : done ? THEME.fg2 : THEME.fg3 }}>{L(s.name)}</div>
              <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: on ? shade(accent, -20) : THEME.fg3, marginTop: 2 }}>
                {L('Lv')} {s.minLevel}{stageBand(s.stage).max ? `–${stageBand(s.stage).max}` : '+'}
              </div>
            </div>
          );
        })}
      </div>
      {/* what the buddy says at this stage — its voice grows up with it */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: tileBg, borderRadius: 12, padding: '10px 12px' }}>
        <Icon name="message-circle" size={15} color={accent} stroke={2.3} />
        <span style={{ fontSize: 12.5, color: THEME.fg1, fontWeight: 600, lineHeight: 1.4 }}>“{L(info.lines[0])}”</span>
      </div>
      <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 700, marginTop: 10, textAlign: 'center' }}>
        {nextAt
          ? `${L('Reach Lv')} ${nextAt} → ${L('Stage')} ${stage + 1}`
          : L('Fully grown — final stage')}
      </div>
    </div>
  );
  // StagePanel (the growth-stage track) is intentionally left out of the page — the buddy's
  // stage still drives its look/stats, we just don't surface the panel on the detail screen.
  const body = [variant === 'showcase' ? PanelShowcase : variant === 'focus' ? PanelFocus : variant === 'wave' ? PanelWave : Panel].filter(Boolean);

  // ── mascot (centered) ──
  // A-3.3 — form, idle animation and face all come from the stage table, so a stage-up
  // changes how the buddy looks AND how it moves, not just a number on a badge.
  // The Client reference render is otherwise still — every other style already floats via
  // its own call sites (home hero, onboarding), so bring this one screen in line with them
  // rather than turning it on for every style here and changing established behaviour.
  const Buddy = ({ size }) => (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={window.JX_CHAR_STYLE === 'client' ? 'jx-float' : ''}>
        <Mascot species={orig.species} stage={stage} color={color} mood={moodForStage(stage)} size={size} context="detail" />
      </div>
    </div>
  );
  const Badges = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      <Badge variant={orig.rarity === 'epic' ? 'epic' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
      <Badge variant="gold">{L('Stage')} {stage}</Badge>
    </div>
  );
  // A-1.2 — the points→EXP exchange, spec'd and built in data.jsx (convertPointsToXp) but
  // never wired into a screen. Lives here, on the buddy's own page, rather than the Points
  // shop — you're already looking at the one buddy you'd spend on. One fixed-size tap
  // (EXCHANGE.stepXp at a time), matching buyOutfit's own tap-to-spend idiom. Tweaks: Add-XP
  // style — 'cta' is the shipped default (see xpAdd's own 'cta' branch below); 'text'/
  // 'chip'/'row'/'sticker' etc. are real alternatives, kept in sync with
  // CharacterDetail.jsx's own xpAdd.
  const xpAddStyle = ctx.tweaks?.xpAddStyle || 'cta';
  const xpAdd = () => {
    if (!(orig.owned && !orig.maxed)) return null;
    const verdict = canConvertPoints(EXCHANGE.stepXp, orig, PLAYER);
    const cost = pointsForXp(EXCHANGE.stepXp);
    const on = verdict.ok;
    const onTap = () => {
      const res = convertPointsToXp(EXCHANGE.stepXp, orig, PLAYER);
      if (!res.ok) return toast(L('Not enough points yet'));
      setPts(PLAYER.points);
      toast(res.stageUp ? `${orig.name} ${L('Evolved!')}` : res.levels ? `${orig.name} ${L('Level up!')}` : `+${EXCHANGE.stepXp} XP`);
    };
    const ink = on ? shade(THEME.gold, -30) : THEME.fg3;

    // 'text' — bare icon + bold label, muted cost alongside, no chip fill at all — the
    // same bare-button idiom as "Skip"/"Not now" and an outfit tile's price line.
    if (xpAddStyle === 'text') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, border: 'none', background: 'none', padding: '4px 2px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 600, color: THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'chip' — the same content, given an actual flat tap-target: a gold-tinted pill (no
    // shadow, per the app's flat chrome) with a hairline divider before the cost, so it
    // reads as one control instead of text floating free under the bar.
    if (xpAddStyle === 'chip') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, border: 'none', borderRadius: 999, background: on ? tint(THEME.gold, .84) : THEME.surface2, padding: '7px 14px 7px 12px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ width: 1, height: 14, background: on ? shade(THEME.gold, -6) : THEME.border, opacity: .5 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: ink }}><SafePointIcon size={13} />{cost}</span>
        </button>
      );
    }
    // 'row' — a full-width action row (plain "Add XP" label left, a solid gold cost pill
    // right) — the same weight as the daily-task "Go" row, for when the control wants
    // more presence than a small inline chip.
    if (xpAddStyle === 'row') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 800, color: THEME.fg1 }}>
            <Icon name="zap" size={14} color={THEME.gold} fill={THEME.gold} stroke={2.4} />{L('Add')} {EXCHANGE.stepXp} XP
          </span>
          <button onClick={onTap} className={on ? 'jx-press' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', borderRadius: 999, background: on ? THEME.gold : THEME.surface2, color: on ? '#fff' : THEME.fg3, padding: '7px 13px', fontSize: 12.5, fontWeight: 800, cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
            <SafePointIcon size={13} />{cost}
          </button>
        </div>
      );
    }
    // 'sticker' — a tilted dashed-border tag, the app's own "collectible" framing (see
    // outfit price tags), with the real point icon in place of a ★ glyph.
    if (xpAddStyle === 'sticker') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, border: `1.5px dashed ${on ? shade(THEME.gold, -6) : THEME.border}`, background: on ? shade(THEME.gold, 82) : THEME.surface2, borderRadius: 10, padding: '5px 10px', transform: 'rotate(-2.5deg)', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={12} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: ink }}>+{EXCHANGE.stepXp} XP</span>
          <span style={{ width: 1, height: 11, background: on ? shade(THEME.gold, -6) : THEME.border, opacity: .6 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: ink }}><SafePointIcon size={11} />{cost}</span>
        </button>
      );
    }
    // 'badge' — not a bespoke button at all: the real Badge primitive this exact card
    // already uses for Rare/Stage 3, just wrapped in a bare tap target — nothing reads
    // less "invented" than reusing the actual design-system component in place.
    if (xpAddStyle === 'badge') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, border: 'none', background: 'none', padding: 0, cursor: on ? 'pointer' : 'default', opacity: on ? 1 : .6, fontFamily: 'inherit' }}>
          <Badge variant="gold"><Icon name="zap" size={10} color="#9e7300" stroke={2.8} />{L('Add')} {EXCHANGE.stepXp} XP</Badge>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'stack' — a compact two-line tile (label on top, cost big underneath), the same
    // icon+number+label skeleton the stat rings just below already use, instead of every
    // other style's single-line row.
    if (xpAddStyle === 'stack') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 8, border: 'none', borderRadius: 14, background: on ? tint(THEME.gold, .86) : THEME.surface2, padding: '8px 16px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: ink }}>
            <Icon name="zap" size={11} color={ink} stroke={2.4} fill={on ? ink : 'none'} />{L('Add')} {EXCHANGE.stepXp} XP
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 13, fontWeight: 800, color: ink }}><SafePointIcon size={13} />{cost}</span>
        </button>
      );
    }
    // 'outline' — a lightweight bordered button, no fill — lighter weight than 'chip'/
    // 'row', matching the outlined idiom the stepper/decorate-tab chips use elsewhere.
    if (xpAddStyle === 'outline') {
      return (
        <button onClick={onTap} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 8, border: `1.5px solid ${on ? THEME.gold : THEME.border}`, borderRadius: 999, background: '#fff', padding: '6px 13px', cursor: on ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Icon name="zap" size={13} color={ink} stroke={2.4} fill={on ? ink : 'none'} />
          <span style={{ fontSize: 12.5, fontWeight: 800, color: ink }}>{L('Add')} {EXCHANGE.stepXp} XP</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11.5, fontWeight: 700, color: on ? shade(THEME.gold, -10) : THEME.fg3 }}><SafePointIcon size={12} />{cost}</span>
        </button>
      );
    }
    // 'cta' — promoted to the PRIMARY action of the stacked footer pair: this is the
    // repeatable, stay-on-the-page action a child taps over and over while grinding a
    // buddy up, so it earns the solid weight; "Set as my buddy" (a one-off, page-ending
    // choice) drops to the outline secondary beneath it — see the fixed-footer stack below.
    // Solid fill borrows the buddy's own color (same rule "Set as my buddy" used to use),
    // not gold — gold stays reserved for the small points-cost readout only.
    return (
      <Button variant="primary" size="lg" fullWidth icon="zap" disabled={!on} onClick={onTap} style={{ background: color, boxShadow: 'none' }}>
        {L('Add')} {EXCHANGE.stepXp} XP
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><SafePointIcon size={14} />{cost}</span>
      </Button>
    );
  };

  // Tweaks: Character detail · XP bar style — 'inline' (default, untouched) is the thin
  // row every hero variant already drew; 'card' is a boxed XP readout (hexagon XP badge,
  // big current/total numbers, a thicker bar + %, a "to next level" caption) — the shape
  // requested from a reference mock, recolored to THIS app's own XP gold rather than the
  // reference's green (see gold-reserved-for-points-xp memory). It floats on its own white
  // card regardless of which hero variant is active, since a boxed readout needs to read
  // the same way over any background. The Add-XP control (whichever of the 37 styles is
  // picked) still lives inside it, reusing the same ON_BAR/BELOW placement rules.
  const xpBarStyle = ctx.tweaks?.xpBarStyle || 'inline';
  const HEX = 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)';
  const xpCard = (
    <div style={{ maxWidth: 320, margin: '14px auto 0', background: '#fff', border: `1.5px solid ${THEME.border}`, borderRadius: 20, padding: 16, textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="game-font" style={{ width: 44, height: 44, flexShrink: 0, clipPath: HEX, background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: shade(THEME.gold, -20) }}>XP</div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
          <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{orig.xp.toLocaleString()}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: THEME.fg3 }}>/ {orig.xpMax.toLocaleString()} XP</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
        <Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} track={THEME.goldLight} height={10} />
        <span className="game-font" style={{ fontSize: 12.5, fontWeight: 500, color: THEME.fg2, flexShrink: 0 }}>{Math.round(orig.xp / orig.xpMax * 100)}%</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
        <Icon name="star" size={12} color={THEME.fg3} stroke={2.2} />
        <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600 }}>{(orig.xpMax - orig.xp).toLocaleString()} {L('XP to next level')}</span>
      </div>
      {/* 'cta' rides in the fixed footer as the primary action instead — see setBtn below */}
      {xpAddStyle !== 'cta' && <div style={{ textAlign: 'center', marginTop: 8 }}>{xpAdd()}</div>}
    </div>
  );

  const xpRow = (inkSub) => xpBarStyle === 'card' ? xpCard : (
    <div style={{ maxWidth: 260, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 0' }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: inkSub || THEME.fg2 }}>XP</span>
        <div style={{ flex: 1 }}><Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} track={THEME.goldLight} height={12} /></div>
        <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: inkSub || THEME.fg1 }}>{orig.xp}/{orig.xpMax}</span>
      </div>
      {xpAddStyle !== 'cta' && xpAdd()}
    </div>
  );

  // ── per-variant background ──
  // shade() adds a flat per-channel amount, which assumes a muted input: on the
  // neon brand magenta shade(c, 74) clamps red to 255 and lands on #ff4ec1 — a
  // hotter, hue-shifted pink than the brand itself. Pastelise those instead, the
  // same pink → lavender family the home wash uses. See primitives.jsx.
  const neon = isNeon(brand);
  const ink = shade(brand, -52);
  const bg = ({
    cover: THEME.surface2,
    wave: '#fff',
    vivid: `linear-gradient(180deg, ${shade(brand, 96)} 0%, ${shade(brand, 38)} 60%, ${shade(brand, 2)} 100%)`,
    focus: neon
      ? `linear-gradient(180deg, ${THEME.surface2}00 0%, ${THEME.surface2}00 210px, ${THEME.surface2} 540px), linear-gradient(125deg, ${pastelHue(brand, 4, 0.86, 0.62)} 0%, ${pastelHue(brand, -46, 0.83, 0.54)} 50%, ${pastelHue(brand, -94, 0.81, 0.46)} 100%), ${THEME.surface2}`
      : `linear-gradient(180deg, ${THEME.surface2}00 0%, ${THEME.surface2}00 210px, ${THEME.surface2} 540px), linear-gradient(125deg, ${mixHue(brand, -24, 0.06, 0.78)} 0%, ${mixHue(brand, 4, 0.10, 0.72)} 50%, ${mixHue(brand, 26, 0.14, 0.6)} 100%), ${THEME.surface2}`,
    showcase: neon
      ? `linear-gradient(180deg, ${pastelHue(brand, 4, 0.86, 1)} 0%, ${pastelHue(brand, -34, 0.93, 1)} 32%, ${THEME.surface2} 60%)`
      : `linear-gradient(180deg, ${shade(brand, 74)} 0%, ${tint(brand, .82)} 32%, ${THEME.surface2} 60%)`,
  })[variant] || THEME.screenBg;

  // ── hero per variant ──
  let hero;
  if (variant === 'cover') {
    hero = (
      <div style={{ background: `linear-gradient(160deg, ${shade(brand, 60)}, ${tint(brand, .82)})`, borderRadius: '0 0 28px 28px', padding: '50px 18px 22px' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ textAlign: 'center', marginTop: 6 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={150} /></div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
      </div>
    );
  } else if (variant === 'wave') {
    hero = (
      <div style={{ position: 'relative', background: `linear-gradient(160deg, ${shade(brand, 70)}, ${tint(brand, .82)})`, padding: '50px 18px 0' }}>
        <TopBar />
        <div style={{ textAlign: 'center', marginTop: 6, paddingBottom: 30 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={150} /></div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
        <svg viewBox="0 0 390 34" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 34, display: 'block' }}>
          <path d="M0 34 V14 Q195 40 390 14 V34 Z" fill="#fff" />
        </svg>
      </div>
    );
  } else if (variant === 'focus') {
    const R = 96, SW = 10, ring = 2 * (R + SW), circ = 2 * Math.PI * R, pct = Math.min(1, orig.xp / orig.xpMax);
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ position: 'relative', width: ring, height: ring, margin: '12px auto 0', cursor: 'pointer' }}>
          <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
            <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={brand} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Buddy size={148} /></div>
        </div>
        <div style={{ textAlign: 'center', padding: '18px 24px 0' }}>
          {Badges}
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 6 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {level} · {orig.xp}/{orig.xpMax} XP</div>
        </div>
      </div>
    );
  } else if (variant === 'vivid') {
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ textAlign: 'center', marginTop: 8 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={158} /></div>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .82, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
      </div>
    );
  } else { // showcase — buddy on a glowing pedestal with a spotlight
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ position: 'relative', textAlign: 'center', marginTop: 8, cursor: 'pointer' }}>
          <div style={{ position: 'relative' }}><Buddy size={162} /></div>
          {/* contact shadow. shade() clamps on a neon brand colour (shade(#E00477,62)
              → #ff42b5), so the "shadow" came out hotter than the buddy — pastelise it.
              Skipped for Client: the reference render is its own finished image, and this
              pedestal glow (tuned for the app's own flat mascots) doesn't belong under it. */}
          {window.JX_CHAR_STYLE !== 'client' && (
            <div style={{ width: 168, height: 30, borderRadius: '50%', margin: '-12px auto 0', background: `radial-gradient(ellipse at 50% 40%, ${neon ? pastelHue(brand, 0, 0.80, 1) : shade(brand, 62)} 0%, ${tint(brand, .82)} 58%, ${tint(brand, .82)}00 78%)` }} />
          )}
          {/* the shadow above doubled as breathing room before the badges row — without it
              Client's feet sit right on top of "Common · Stage 2", so it needs its own gap */}
          {window.JX_CHAR_STYLE === 'client' && <div style={{ height: 14 }} />}
        </div>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          {Badges}
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1, marginTop: 6 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: shade(brand, -34), fontWeight: 700 }}>{L('Level')} {level}</div>
          {xpRow(THEME.fg2)}
        </div>
      </div>
    );
  }

  const pad = '14px 18px 0';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: bg }}>
      {hero}
      <div style={{ padding: pad }}>{body}<div style={{ height: 76 }} /></div>

      {/* pinned to the screen frame, not the scroll container — same fixed-bottom-CTA
          idiom as ParentDetail's danger actions, so the buddy action is always in reach
          regardless of scroll position. Add-XP's 'cta' style takes over as the PRIMARY
          (solid) action here — the repeatable one — with "Set as my buddy" (a one-off,
          page-ending choice) demoted to the outline secondary above it, matching the
          app's own solid-primary-at-the-bottom stacking order (ParentDetail's billing pair). */}
      <div style={{ position: 'fixed', left: 16, right: 16, bottom: 24, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {setBtn()}
        {xpAddStyle === 'cta' && xpAdd()}
      </div>

      {/* outfit purchase feedback */}
      {note && (
        <div className="jx-fade" style={{ position: 'fixed', left: '50%', bottom: 128, transform: 'translateX(-50%)', zIndex: 60, background: THEME.fg1, color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{note}</div>
      )}

      {/* The evolve moment used to live here, fired by an "Evolve now" button. It moved to
          shared.jsx (StageUpMoment) and now plays wherever the level that earns it lands —
          a battle win or a point exchange — because that is when the buddy actually grows. */}
    </div>
  );
}

function CharDetailVariant({ layout, ctx }) {
  if (!layout || layout === 'original') return <CharacterDetail ctx={ctx} />;
  return <CharVariant variant={layout.replace('char-', '')} ctx={ctx} />;
}

// Every layout CharDetailVariant can resolve, so the Tweaks panel can offer all six —
// 'original' is the plain stacked CharacterDetail.jsx; the rest pick a CharVariant.
const DETAIL_LAYOUTS = [
  { id: 'original', label: 'Original' },
  { id: 'char-cover', label: 'Cover' },
  { id: 'char-vivid', label: 'Vivid' },
  { id: 'char-focus', label: 'Focus' },
  { id: 'char-wave', label: 'Wave' },
  { id: 'char-showcase', label: 'Showcase' },
];

export { CharDetailVariant, DETAIL_LAYOUTS };
