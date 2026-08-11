// JoanX — child app · RoomPuckStyles
//
// RoomStage's puck — the marker a child taps to switch buddy or swap an accessory
// (shelf/furniture). Renders as an icon + label caption sitting just below the thing
// it points at.
//
// This used to be ten side-by-side alternatives to a dot-and-leader-line marker,
// switchable from Tweaks so one could be picked before committing — 'caption' won, so
// this file is what's left after deleting down to that one branch.

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

// `pucks` is RoomStage's HOTSPOTS (filtered), each `{ slot, icon, label, puck:[x,y], aim:[x,y] }`
// as percentages of the room box. `onArt` picks white vs. ink so a marker reads on both a
// painted room and a flat wallpaper fallback.
function RoomPucks({ pucks, onPuck, onArt }) {
  const ink = onArt ? '#fff' : THEME.fg1;
  const chipBg = onArt ? 'rgba(0,0,0,.4)' : '#fff';
  return pucks.map(h => (
    <button key={h.slot} onClick={() => onPuck(h.slot)} className="jx-press"
      style={{ position: 'absolute', left: `${h.aim[0]}%`, top: `${Math.min(h.aim[1] + 10, 94)}%`, transform: 'translate(-50%,0)', display: 'flex', alignItems: 'center', gap: 5, border: 'none', cursor: 'pointer', borderRadius: 999, padding: '5px 11px', background: chipBg, fontFamily: 'inherit' }}>
      <Icon name={h.icon} size={12} color={ink} stroke={2.2} />
      <span style={{ fontSize: 11, fontWeight: 700, color: ink }}>{L(h.label)}</span>
    </button>
  ));
}

export { RoomPucks };
