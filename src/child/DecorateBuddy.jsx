// JoanX — child app · DecorateBuddy

import React from 'react';
import { buyItem, canBuyItem, CHARACTERS, moodForStage, OUTFITS, PLAYER } from '../core/data.jsx';
import { Button, Icon, SafePointIcon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade, tint } from '../core/characters.jsx';
import { ScreenHeader, outfitSlotsFor, outfitItemsFor } from './shared.jsx';

// ── Decorate a buddy (A-5) ────────────────────────────────────────────
// A dedicated page for the same outfit system the character detail screen's
// Items tab already runs (OUTFITS / canBuyItem / buyItem in core/data.jsx) —
// pulled out to its own screen because a 4-col grid squeezed under a stats
// toggle was cramped for what is, for a lot of kids, the actual point of a
// buddy. Shape follows DecorateRoom's: the thing being customised pinned on
// its own card up top, the catalogue scrolling below it.
//
// No draft/Save step — the outfit system already applies on tap (buyItem /
// the local `worn` set), so a Save button here would just be a second no-op
// button. The back arrow is the only way out, same as any other pushed page.
//
// Tweaks: Decorate tabs — fifteen treatments for the Hat/Coat category row. Kept off the
// pill-with-drop-shadow default most component libraries reach for first — every one of
// these borrows a physical, hand-made reference (a hangtag's punch hole, stitching, a
// ribbon's cut notch, a push-button's rim, a bookmark clip) instead of stacking flat chrome.
//   stack     — icon over label, no chrome at all; selected = solid dark + bold (shipped default)
//   underline — same stack, but selected gets the buddy's own accent colour + a short bar under it
//   segmented — classic iOS-style sliding-pill track, one shared rounded-rect background
//   chip      — outlined chip per tab, selected gets an accent border + a faint tint wash
//   dot       — icon+label always neutral; a small accent dot is the only selected marker
//   tag       — a clothing hangtag: a punched hole on the left, selected fills solid
//   stitch    — a dashed "sewn" outline appears around the selected tab only
//   ribbon    — a banner that drops lower and grows a V-notch at the bottom when selected
//   knob      — a round push-button per tab, like a physical panel switch
//   switch    — one sliding knob on a shared track, a real lever rather than a per-tab swap
//   peel      — the selected tab gets a folded sticker-corner in its top-right
//   pin       — a small triangle marker floats above the selected tab, pointing down at it
//   brush     — a hand-drawn wavy underline (an SVG squiggle, not a straight bar)
//   frame     — a crisp double-ring outline frames the selected tab, no blur
//   shelf     — tabs sit on a ground line; the selected icon lifts a few px off it
function DecorateTabs({ tabStyle, slots, slotFilter, setSlotFilter, accent }) {
  if (tabStyle === 'tag') {
    return (
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              <div style={{ position: 'relative', background: on ? accent : THEME.surface2, borderRadius: '4px 10px 10px 4px', padding: '9px 10px 9px 22px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', width: 6, height: 6, borderRadius: 999, background: on ? 'rgba(255,255,255,.6)' : '#fff' }} />
                <Icon name={s.icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.3} />
                <span style={{ fontSize: 12, fontWeight: 800, color: on ? '#fff' : THEME.fg2 }}>{L(s.label)}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'stitch') {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: `2px dashed ${on ? accent : 'transparent'}`, background: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '8px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name={s.icon} size={14} color={on ? accent : THEME.fg3} stroke={2.3} />
              <span style={{ fontSize: 12, fontWeight: 800, color: on ? accent : THEME.fg2 }}>{L(s.label)}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'ribbon') {
    return (
      <div style={{ display: 'flex', marginBottom: 24 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', background: on ? accent : THEME.surface2, color: on ? '#fff' : THEME.fg3, padding: on ? '9px 14px 13px' : '9px 14px 9px', borderRadius: '10px 10px 0 0', display: 'flex', alignItems: 'center', gap: 6, transition: 'padding .15s ease' }}>
                <Icon name={s.icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.3} />
                <span style={{ fontSize: 12, fontWeight: 800 }}>{L(s.label)}</span>
                {on && <span style={{ position: 'absolute', left: '50%', bottom: -6, transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `6px solid ${accent}` }} />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'knob') {
    return (
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, justifyContent: 'center' }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: 999, background: on ? accent : THEME.surface2, border: on ? `3px solid ${accent}` : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={s.icon} size={19} color={on ? '#fff' : THEME.fg3} stroke={2.3} />
              </div>
              <span style={{ fontSize: 11, fontWeight: on ? 800 : 700, color: on ? THEME.fg1 : THEME.fg3 }}>{L(s.label)}</span>
            </button>
          );
        })}
      </div>
    );
  }
  // 'switch' — one sliding knob on a shared track, a real lever
  if (tabStyle === 'switch') {
    const idx = Math.max(0, slots.findIndex(s => s.id === slotFilter));
    const n = slots.length;
    return (
      <div style={{ position: 'relative', background: THEME.surface2, borderRadius: 999, padding: 4, display: 'flex', marginBottom: 18 }}>
        <div style={{ position: 'absolute', top: 4, bottom: 4, left: `calc(${(idx / n) * 100}% + 4px)`, width: `calc(${100 / n}% - 8px)`, background: accent, borderRadius: 999, transition: 'left .18s ease' }} />
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ position: 'relative', zIndex: 1, flex: 1, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '9px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Icon name={s.icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.3} />
              <span style={{ fontSize: 12, fontWeight: 800, color: on ? '#fff' : THEME.fg2 }}>{L(s.label)}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'peel') {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              <div style={{ position: 'relative', overflow: 'hidden', background: on ? accent : THEME.surface2, borderRadius: 10, padding: '9px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name={s.icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.3} />
                <span style={{ fontSize: 12, fontWeight: 800, color: on ? '#fff' : THEME.fg2 }}>{L(s.label)}</span>
                {on && <span style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: '15px solid rgba(255,255,255,.4)', borderLeft: '15px solid transparent' }} />}
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  // 'pin' — the shipped default: icon+label bounce into the accent color on select, no
  // marker above the tab (an earlier pass floated a small triangle pointer there; it read
  // as a stray mark rather than a selection cue, so it's gone).
  if (tabStyle === 'pin') {
    return (
      <div style={{ display: 'flex', marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              {/* key remounts this on every select so jx-pop's scale-in replays as a little
                  bounce each time — a plain style/class swap on the same node wouldn't retrigger it */}
              <span key={on ? 'on' : 'off'} className={on ? 'jx-pop' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <Icon name={s.icon} size={19} color={on ? accent : THEME.fg3} stroke={on ? 2.6 : 2.1} />
                <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 700, color: on ? accent : THEME.fg3 }}>{L(s.label)}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'brush') {
    return (
      <div style={{ display: 'flex', marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <Icon name={s.icon} size={19} color={on ? THEME.fg1 : THEME.fg3} stroke={on ? 2.6 : 2.1} />
              <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 700, color: on ? THEME.fg1 : THEME.fg3 }}>{L(s.label)}</span>
              <svg width="30" height="7" viewBox="0 0 30 7" style={{ opacity: on ? 1 : 0 }}>
                <path d="M1 4 Q 7 1 14 4 T 29 3.5" stroke={accent} strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'frame') {
    return (
      <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 3, borderRadius: 12, boxShadow: on ? `0 0 0 1.5px #fff, 0 0 0 3.5px ${accent}` : 'none' }}>
              <div style={{ background: on ? THEME.surface2 : 'transparent', borderRadius: 9, padding: '7px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Icon name={s.icon} size={14} color={on ? THEME.fg1 : THEME.fg3} stroke={2.3} />
                <span style={{ fontSize: 12, fontWeight: on ? 800 : 700, color: on ? THEME.fg1 : THEME.fg3 }}>{L(s.label)}</span>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'shelf') {
    return (
      <div style={{ display: 'flex', marginBottom: 20, borderBottom: `2px solid ${THEME.border}` }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 4px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, transform: on ? 'translateY(-3px)' : 'none', transition: 'transform .15s ease' }}>
              <Icon name={s.icon} size={on ? 21 : 18} color={on ? accent : THEME.fg3} stroke={on ? 2.6 : 2.1} />
              <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 700, color: on ? accent : THEME.fg3 }}>{L(s.label)}</span>
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'segmented') {
    return (
      <div style={{ display: 'flex', background: THEME.surface2, borderRadius: 14, padding: 4, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 10, padding: '9px 8px', background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: on ? THEME.fg1 : THEME.fg3, fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={s.icon} size={14} color={on ? THEME.fg1 : THEME.fg3} stroke={2.4} />{L(s.label)}
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'underline') {
    return (
      <div style={{ display: 'flex', marginBottom: 24 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Icon name={s.icon} size={19} color={on ? accent : THEME.fg3} stroke={on ? 2.5 : 2.1} />
              <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 700, color: on ? accent : THEME.fg3 }}>{L(s.label)}</span>
              <span style={{ width: 26, height: 3, borderRadius: 999, background: on ? accent : 'transparent', marginTop: 3 }} />
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'chip') {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: `1.5px solid ${on ? accent : THEME.border}`, background: on ? `${accent}14` : 'transparent', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: on ? accent : THEME.fg2, fontWeight: 800, fontSize: 12 }}>
              <Icon name={s.icon} size={14} color={on ? accent : THEME.fg3} stroke={2.3} />{L(s.label)}
            </button>
          );
        })}
      </div>
    );
  }
  if (tabStyle === 'dot') {
    return (
      <div style={{ display: 'flex', marginBottom: 18 }}>
        {slots.map(s => {
          const on = slotFilter === s.id;
          return (
            <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <Icon name={s.icon} size={19} color={THEME.fg1} stroke={2.2} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>{L(s.label)}</span>
              <span style={{ width: 5, height: 5, borderRadius: 999, background: on ? accent : 'transparent', marginTop: 2 }} />
            </button>
          );
        })}
      </div>
    );
  }
  // 'stack' — icon over label, no chrome, selected = solid dark + bold
  return (
    <div style={{ display: 'flex', marginBottom: 18 }}>
      {slots.map(s => {
        const on = slotFilter === s.id;
        return (
          <button key={s.id} onClick={() => setSlotFilter(s.id)} style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            {/* key remounts this on every select so jx-pop's scale-in replays as a little
                bounce each time — a plain style/class swap on the same node wouldn't retrigger it */}
            <span key={on ? 'on' : 'off'} className={on ? 'jx-pop' : undefined} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <Icon name={s.icon} size={20} color={on ? THEME.fg1 : THEME.fg3} stroke={on ? 2.6 : 2.1} />
              <span style={{ fontSize: 11.5, fontWeight: on ? 800 : 700, color: on ? THEME.fg1 : THEME.fg3, whiteSpace: 'nowrap' }}>{L(s.label)}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DecorateBuddy({ ctx, tabStyle = 'pin' }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params?.id) || CHARACTERS.find(c => c.owned) || CHARACTERS[0];
  const stage = orig.stage;
  const slots = outfitSlotsFor(orig);
  const [slotFilter, setSlotFilter] = React.useState(slots[0].id);
  const [bought, setBought] = React.useState(() => new Set());
  const locked = (o) => stage < o.minStage;
  // One worn item per slot (a hat, a coat — never two hats at once), keyed by slot id.
  // Seeded from whichever free item in each slot is already unlocked, so a buddy still
  // shows up dressed the first time this sheet opens, same as before.
  const [wornBySlot, setWornBySlot] = React.useState(() => {
    const init = {};
    outfitItemsFor(orig, OUTFITS).forEach(o => {
      if (!init[o.slot] && o.price === 0 && stage >= o.minStage) init[o.slot] = o.id;
    });
    return init;
  });
  const [note, setNote] = React.useState(null);

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
    buyItem(o, PLAYER, stage);
    setBought(s => new Set(s).add(o.id));
    setWornBySlot(s => ({ ...s, [o.slot]: o.id }));
    toast(`${L(o.name)} ${L('unlocked!')}`);
  };
  // Tapping an owned item swaps it in for whatever else was worn in that slot; tapping the
  // one already worn takes it off, same as any other single-select toggle.
  const toggleWear = (o) => {
    if (!ownedOutfit(o)) return;
    setWornBySlot(s => ({ ...s, [o.slot]: s[o.slot] === o.id ? null : o.id }));
  };
  const isWorn = (o) => ownedOutfit(o) && wornBySlot[o.slot] === o.id;
  const items = outfitItemsFor(orig, OUTFITS).map(o => ({ ...o, on: isWorn(o), own: ownedOutfit(o), locked: locked(o) }));
  const tapItem = (it) => {
    const o = OUTFITS.find(x => x.id === it.id);
    if (!o || locked(o)) return;
    ownedOutfit(o) ? toggleWear(o) : buyOutfit(o);
  };
  // Every non-locked tile keeps showing its price, owned or not — the tile's own border/tint
  // already says which one is worn, so "Equipped" / "Tap to equip" was just repeating that in
  // words, but the price itself is still useful context once it's bought.
  const itemStatus = (it) => it.locked ? `${L('Stage')} ${it.minStage}` : it.price;

  const filteredItems = items.filter(it => it.slot === slotFilter);

  // Grabbing the grip and dragging down past DISMISS_AT commits to ctx.back(), the same exit
  // the back arrow already uses; short of that it snaps back up.
  const [dragY, setDragY] = React.useState(0);
  // `y` is tracked on the ref (not just in dragY state) because dragEnd is a plain function
  // called from a window listener added back at mousedown time — it would otherwise close
  // over whatever dragY was at that moment (0) instead of the live value.
  const drag = React.useRef({ active: false, startY: 0, y: 0 });
  const DISMISS_AT = 110;
  const dragStart = (y) => { drag.current = { active: true, startY: y, y: 0 }; };
  const dragMove = (y) => {
    if (!drag.current.active) return;
    drag.current.y = Math.max(0, y - drag.current.startY);
    setDragY(drag.current.y);
  };
  const dragEnd = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (drag.current.y > DISMISS_AT) ctx.back(); else setDragY(0);
  };
  const onGripMouseDown = (e) => {
    dragStart(e.clientY);
    const move = (ev) => dragMove(ev.clientY);
    const up = () => { dragEnd(); window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };
  // Entrance slide-up shares the drag's own transform/transition (rather than the CSS
  // jx-sheet-up keyframe animation every other sheet uses) — an animation with fill-mode
  // 'both' keeps pinning its own end-state transform after it finishes, which out-cascades
  // an inline style and would silently swallow every drag update once it settled.
  const [entered, setEntered] = React.useState(false);
  // Double rAF: a single frame isn't reliably enough for the browser to have painted the
  // starting translateY(100%) before the transition-triggering state flips — without the
  // second frame this occasionally skips straight to the end state instead of sliding.
  React.useEffect(() => {
    let id2;
    const id1 = requestAnimationFrame(() => { id2 = requestAnimationFrame(() => setEntered(true)); });
    return () => { cancelAnimationFrame(id1); if (id2) cancelAnimationFrame(id2); };
  }, []);
  const translateY = entered ? `${dragY}px` : '100%';
  const accent = THEME.brand;
  // Same green wash the buddy detail screen's showcase hero uses (CharacterVariants.jsx) —
  // a richer green top-of-screen fading to the flat page surface by the time it reaches
  // the catalogue, so this screen reads as part of the same buddy-focused family.
  const bg = `linear-gradient(180deg, ${shade(accent, 74)} 0%, ${tint(accent, .82)} 32%, ${THEME.surface2} 60%)`;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, background: bg, display: 'flex', flexDirection: 'column' }}>
      {/* header + buddy preview — a plain page, not part of the sheet below: never dims,
          never drags, always exactly where it is */}
      <ScreenHeader title={`${L('Decorate')} ${orig.name}`} onBack={() => ctx.back()} right={
        <Button variant="play" size="md" onClick={() => ctx.back()} style={{ flexShrink: 0, whiteSpace: 'nowrap', borderRadius: 999, padding: '10px 20px' }}>
          {L('Save')}
        </Button>
      } />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 18, marginBottom: 22 }}>
          <Mascot species={orig.species} stage={stage} color={orig.color} mood={moodForStage(stage)} size={168} />
        </div>
      </div>

      {/* catalogue — this is the sheet. flex:1 so it always reaches the screen's bottom
          edge, even when a short catalogue wouldn't otherwise fill it. Grabbable by its
          own grip; dragging it down past DISMISS_AT commits to ctx.back(), same exit the
          back arrow already uses, short of that it snaps back up. The header and buddy
          preview above never move with it. */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '28px 28px 0 0', padding: '18px 16px 134px', boxShadow: '0 -4px 14px rgba(20,18,16,0.05)', transform: `translateY(${translateY})`, transition: drag.current.active ? 'none' : 'transform .48s cubic-bezier(.32,.72,0,1)' }}>
        <div onTouchStart={e => dragStart(e.touches[0].clientY)} onTouchMove={e => dragMove(e.touches[0].clientY)} onTouchEnd={dragEnd} onMouseDown={onGripMouseDown}
          style={{ width: 40, height: 5, borderRadius: 999, background: 'rgba(46,43,41,0.22)', margin: '-8px auto 14px', cursor: 'grab', touchAction: 'none' }} />
        <DecorateTabs tabStyle={tabStyle} slots={slots.filter(s => items.some(it => it.slot === s.id))} slotFilter={slotFilter} setSlotFilter={setSlotFilter} accent={accent} />

        {/* item count for the selected category — real info (how many are here) rather
            than just repeating the tab label the selected tab already shows */}
        <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3, margin: '2px 2px 10px' }}>
          {L('%n items').replace('%n', filteredItems.length)}
        </div>

        {/* catalogue — one bigger grid, not squeezed under a stats toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 10 }}>
          {filteredItems.map(it => (
            <button key={it.id} onClick={() => tapItem(it)} disabled={it.locked} style={{ position: 'relative', minWidth: 0, borderRadius: 16, background: it.on ? `${accent}1c` : 'transparent', border: it.on ? `2px solid ${accent}` : '2px solid transparent', padding: '12px 8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: it.locked ? 'default' : 'pointer', fontFamily: 'inherit', opacity: it.locked ? .6 : 1 }}>
              {it.img && !it.locked
                ? <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><img src={it.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
                : <div style={{ width: 36, height: 36, borderRadius: 999, background: it.on ? accent : '#fff', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
                  </div>}
              <span style={{ fontSize: 11.5, fontWeight: 800, color: it.locked ? THEME.fg3 : THEME.fg1, textAlign: 'center', lineHeight: 1.2 }}>{L(it.name)}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 800, color: it.locked ? THEME.fg3 : accent }}>
                {it.locked ? itemStatus(it) : <><SafePointIcon size={12} /> {itemStatus(it)}</>}
              </span>
            </button>
          ))}
        </div>
      </div>

      {note && (
        <div className="jx-fade" style={{ position: 'fixed', left: '50%', bottom: 128, transform: 'translateX(-50%)', zIndex: 60, background: THEME.fg1, color: '#fff', borderRadius: 999, padding: '10px 18px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>{note}</div>
      )}
    </div>
  );
}

export { DecorateBuddy };
