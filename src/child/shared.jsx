// JoanX — child app · shared

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Icon, RARITY, THEME, mixHue, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { DexHeader } from './DexHeaders.jsx';

// Page background tinted by the *active* buddy's colour — keeps every screen's
// top gradient aligned with the buddy (green for Hammy, etc.), like the home.
// Child-app-specific (reads PLAYER's active buddy); screenBgFor/mixHue
// themselves are brand-agnostic and live in core/primitives.jsx for both apps.
function screenBgActive() {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];
  return screenBgFor(c && c.color);
}

function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 4, height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'transparent', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        {onBack && (
          <button onClick={onBack} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        )}
      </div>
      <div style={{ flexShrink: 0, fontSize: 16, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap', textAlign: 'center' }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  );
}

function Confetti({ n = 14 }) {
  const colors = [THEME.primary, THEME.gold, THEME.joy, THEME.success, THEME.camping];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: n }).map((_, i) => {
        const left = Math.random() * 100, delay = Math.random() * 0.3, dur = 1 + Math.random();
        const c = colors[i % colors.length], sz = 6 + Math.random() * 6;
        return <div key={i} style={{ position: 'absolute', top: -10, left: left + '%', width: sz, height: sz, borderRadius: i % 2 ? 999 : 2, background: c, animation: `jxConfetti ${dur}s ${delay}s ease-in forwards` }} />;
      })}
    </div>
  );
}

// small rarity pill reused across the dex screens
function RarityPill({ rarity }) {
  const r = RARITY[rarity] || RARITY.common;
  return <span style={{ fontSize: 9.5, fontWeight: 800, color: r.fg, background: r.bg, padding: '2px 8px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: .3 }}>{L(r.label)}</span>;
}

// completion header used by both encyclopedias. The presentation lives in
// DexHeaders.jsx; this reads the active variant the way Mascot reads
// window.JX_CHAR_STYLE, so the four call sites don't have to thread it through.
function DexProgress(props) {
  return <DexHeader variant={window.JX_DEX_HEADER || 'rows'} {...props} />;
}

// small points chip for the profile / decoration headers
function PointsChip({ pts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 999, padding: '6px 12px', boxShadow: THEME.shadowCard }}>
      <Icon name="star" size={14} color={THEME.gold} fill={THEME.gold} stroke={2} />
      <span className="game-font" style={{ fontSize: 13, fontWeight: 500 }}>{pts.toLocaleString()}</span>
    </div>
  );
}

// stat tile — points / streak / buddies summary card (Home + Profile)
function StatCard({ icon, color, bg, value, label, big }) {
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

export { mixHue, screenBgFor, screenBgActive, ScreenHeader, Confetti, RarityPill, DexProgress, PointsChip, StatCard };
