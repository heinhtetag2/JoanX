// JoanX — child app · RoomPuckStyles
//
// Ten alternatives to RoomStage's dot-and-leader-line "puck" — the marker a child taps to
// switch buddy or swap an accessory (shelf/furniture). Same idea as GuestbookPatterns.jsx:
// switchable from Tweaks so they sit side by side before one is picked. `dot` (the current,
// shipped behaviour) stays as the baseline option in the picker; RoomStage renders it
// itself and only reaches into this file for everything else, so nothing here touches the
// pointer-and-line rendering that already works.

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

const PUCK_STYLES = [
  ['dot', 'Point + line'],
  ['dock', 'Bottom dock'],
  ['tabs', 'Edge tabs'],
  ['direct', 'Tap the object'],
  ['fab', 'Edit FAB'],
  ['brackets', 'Focus brackets'],
  ['sidebar', 'Side rail'],
  ['labels', 'Label tabs'],
  ['badges', 'Numbered badges'],
  ['ring', 'Soft ring'],
  ['caption', 'Object caption'],
];

const BRACKET_CORNERS = [
  { top: 0, left: 0 }, { top: 0, right: 0 }, { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
];

// `pucks` is RoomStage's HOTSPOTS (filtered), each `{ slot, icon, label, puck:[x,y], aim:[x,y] }`
// as percentages of the room box. `onArt` picks white vs. ink so a marker reads on both a
// painted room and a flat wallpaper fallback, same as the dot style already does.
function RoomPucks({ style, pucks, onPuck, onArt }) {
  const ink = onArt ? '#fff' : THEME.fg1;
  const chipBg = onArt ? 'rgba(0,0,0,.4)' : '#fff';

  if (style === 'dock') {
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, display: 'flex', justifyContent: 'center', gap: 10 }}>
        {pucks.map(h => (
          <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
            style={{ width: 44, height: 44, borderRadius: 999, border: 'none', background: chipBg, boxShadow: onArt ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
            <Icon name={h.icon} size={18} color={ink} stroke={2.2} />
          </button>
        ))}
      </div>
    );
  }

  if (style === 'tabs') {
    return (
      <div style={{ position: 'absolute', top: 12, left: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pucks.map(h => (
          <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
            style={{ border: 'none', cursor: 'pointer', background: chipBg, color: ink, borderRadius: '0 999px 999px 0', padding: '8px 14px 8px 10px', fontFamily: 'inherit' }}>
            <Icon name={h.icon} size={16} color={ink} stroke={2.2} />
          </button>
        ))}
      </div>
    );
  }

  if (style === 'direct') {
    return pucks.map(h => (
      <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
        style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${h.aim[1]}%`, transform: 'translate(-50%,-50%)', width: 64, height: 64, borderRadius: 999, border: `2px dashed ${onArt ? 'rgba(255,255,255,.55)' : THEME.border}`, background: 'transparent', cursor: 'pointer', padding: 0 }} />
    ));
  }

  if (style === 'fab') {
    return <FabPucks pucks={pucks} onPuck={onPuck} ink="#fff" />;
  }

  if (style === 'brackets') {
    return pucks.map(h => (
      <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
        style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${h.aim[1]}%`, transform: 'translate(-50%,-50%)', width: 48, height: 48, border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}>
        {BRACKET_CORNERS.map((cs, i) => (
          <span key={i} style={{ position: 'absolute', width: 14, height: 14, borderTop: 'top' in cs ? `2px solid ${ink}` : 'none', borderBottom: 'bottom' in cs ? `2px solid ${ink}` : 'none', borderLeft: 'left' in cs ? `2px solid ${ink}` : 'none', borderRight: 'right' in cs ? `2px solid ${ink}` : 'none', ...cs }} />
        ))}
      </button>
    ));
  }

  if (style === 'sidebar') {
    return (
      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pucks.map(h => (
          <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
            style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '7px 12px', background: chipBg, fontFamily: 'inherit' }}>
            <Icon name={h.icon} size={14} color={ink} stroke={2.2} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: ink }}>{L(h.label)}</span>
          </button>
        ))}
      </div>
    );
  }

  if (style === 'labels') {
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 10, display: 'flex', justifyContent: 'center', gap: 8 }}>
        {pucks.map(h => (
          <button key={h.slot} onClick={() => onPuck(h.slot)} className="jx-press"
            style={{ border: 'none', cursor: 'pointer', borderRadius: 999, padding: '7px 13px', background: chipBg, fontFamily: 'inherit', fontSize: 12, fontWeight: 800, color: ink }}>
            {L(h.label)}
          </button>
        ))}
      </div>
    );
  }

  if (style === 'badges') {
    return pucks.map((h, i) => (
      <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
        style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${h.aim[1]}%`, transform: 'translate(-50%,-50%)', width: 26, height: 26, borderRadius: 999, border: 'none', background: THEME.brand, color: '#fff', fontWeight: 800, fontSize: 12.5, cursor: 'pointer', padding: 0 }}>
        {i + 1}
      </button>
    ));
  }

  if (style === 'ring') {
    const ringColor = onArt ? 'rgba(255,255,255,.85)' : THEME.brand;
    return pucks.map(h => (
      <button key={h.slot} onClick={() => onPuck(h.slot)} aria-label={L(h.label)} className="jx-press"
        style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${h.aim[1]}%`, transform: 'translate(-50%,-50%)', width: 56, height: 56, borderRadius: 999, border: `2.5px solid ${ringColor}`, background: 'transparent', cursor: 'pointer', padding: 0 }} />
    ));
  }

  if (style === 'caption') {
    return pucks.map(h => (
      <button key={h.slot} onClick={() => onPuck(h.slot)} className="jx-press"
        style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${Math.min(h.aim[1] + 10, 94)}%`, transform: 'translate(-50%,0)', display: 'flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 11px', background: chipBg, fontFamily: 'inherit' }}>
        <Icon name={h.icon} size={12} color={ink} stroke={2.2} />
        <span style={{ fontSize: 11, fontWeight: 700, color: ink }}>{L(h.label)}</span>
      </button>
    ));
  }

  return null;
}

// FAB gets its own component — it owns whether the chooser is open, which the other
// styles don't need.
function FabPucks({ pucks, onPuck }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'absolute', right: 12, bottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {open && pucks.map(h => (
        <button key={h.slot} onClick={() => { onPuck(h.slot); setOpen(false); }} aria-label={L(h.label)} className="jx-pop"
          style={{ width: 44, height: 44, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
          <Icon name={h.icon} size={18} color={THEME.fg1} stroke={2.2} />
        </button>
      ))}
      <button onClick={() => setOpen(o => !o)} aria-label={L('Edit room')} className="jx-press"
        style={{ width: 52, height: 52, borderRadius: 999, border: 'none', background: THEME.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}>
        <Icon name={open ? 'x' : 'pencil'} size={20} color="#fff" stroke={2.4} />
      </button>
    </div>
  );
}

export { PUCK_STYLES, RoomPucks };
