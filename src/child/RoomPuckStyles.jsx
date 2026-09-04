// JoanX — child app · RoomPuckStyles
//
// RoomStage's puck — the marker a child taps to switch buddy or swap an accessory
// (shelf/furniture/moodboard pieces). Used to sit right next to the thing it edited,
// a tag pointing at the painted shelf/seat. Now a fixed column of plain icon circles
// down the room's right edge instead — same buttons, same taps, just not pinned to
// a spot in the art. A bare icon carries less than icon+label did, so each one keeps
// its name as an aria-label for anyone who needs it read aloud rather than guessed at.

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

// `pucks` is RoomStage's HOTSPOTS (filtered) — { slot, icon, label } is all this reads
// now that position no longer depends on `puck`/`aim`. Always a plain white circle: the
// reference this replaced stays legible over any room art without an onArt light/dark
// switch, so that prop is gone along with the per-hotspot positioning.
// `activeSlot` — whichever button's own sheet is open right now (or the buddy picker,
// which the host maps to 'buddy' even though it's a separate piece of state). Without
// this every button looks identical regardless of what's currently open, so nothing in
// the column shows which sheet you're actually looking at.
// `opacity` — fades the whole column out in step with the open sheet being dragged
// toward dismissal, so the column doesn't sit there frozen while the sheet beside it
// is visibly sliding away. Taps are dropped below full opacity too, so a still-fading
// column can't eat the tap that was meant to grab the sheet handle again.
function RoomPucks({ pucks, onPuck, activeSlot, opacity = 1 }) {
  return (
    <div style={{ position: 'absolute', right: 14, bottom: 60, display: 'flex', flexDirection: 'column', gap: 10, opacity, pointerEvents: opacity < 1 ? 'none' : 'auto', transition: 'opacity .15s ease' }}>
      {pucks.map(h => {
        const on = h.slot === activeSlot;
        return (
          <button key={h.slot} onClick={() => onPuck(h.slot)} className="jx-press" aria-label={L(h.label)}
            style={{ width: 38, height: 38, borderRadius: 999, border: 'none', cursor: 'pointer', background: on ? THEME.brand : '#fff', boxShadow: '0 3px 10px rgba(0,0,0,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={h.icon} size={17} color={on ? '#fff' : '#2b2926'} stroke={2.2} />
          </button>
        );
      })}
    </div>
  );
}

export { RoomPucks };
