// JoanX — child app · shared

import React from 'react';
import { CHARACTERS, moodForStage, PLAYER, stageOf } from '../core/data.jsx';
import { Icon, RARITY, THEME, isNeon, mixHue, pastelHue, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { DexHeader } from './DexHeaders.jsx';

// Page background tinted by the *active* buddy's colour — keeps every screen's
// top gradient aligned with the buddy (green for Hammy, etc.), like the home.
// Child-app-specific (reads PLAYER's active buddy); screenBgFor/mixHue
// themselves are brand-agnostic and live in core/primitives.jsx for both apps.
function screenBgActive() {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];
  return screenBgFor(c && c.color);
}

// `left` fills the leading slot on screens with no back button — tab roots that still
// want something there (Friends puts the player's own avatar in it).
function ScreenHeader({ title, onBack, left, right, flush }) {
  return (
    // position:fixed (not absolute) so the header pins to the phone screen and the body scrolls
    // *under* it — an absolute header inside the scroll container scrolled away with the content.
    // fixed resolves against the nearest ancestor carrying a transform/filter (the .screen frame,
    // and the saturate() play wrapper), both non-scrolling and screen-sized — not the browser.
    // `flush` drops the frosted blur so a full-bleed backdrop reads through cleanly.
    <div style={{ position: 'fixed', top: 50, left: 0, right: 0, zIndex: 4, height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'transparent', backdropFilter: flush ? 'none' : 'blur(6px)', WebkitBackdropFilter: flush ? 'none' : 'blur(6px)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
        {onBack ? (
          <button onClick={onBack} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        ) : left}
      </div>
      {/* On `flush` screens the header lies straight on full-bleed artwork, so the title and the
          trailing slot take the same white chip the back button already wears — one row of
          controls floating above the scene, rather than one button plus two bits of text lying
          on it. Bare fg1 text only survives by luck of the current room: the switcher can put a
          bright window or a pale wall behind it. A scrim would fix contrast too, but it dims the
          top of the illustration and puts the document-toolbar feel back. */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', height: flush ? 38 : 'auto', padding: flush ? '0 14px' : 0, borderRadius: 999, background: flush ? '#fff' : 'transparent', boxShadow: flush ? THEME.shadowCard : 'none', fontSize: 16, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap', textAlign: 'center' }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {flush && right
          ? <div style={{ display: 'flex', alignItems: 'center', height: 38, padding: '0 13px', borderRadius: 999, background: '#fff', boxShadow: THEME.shadowCard }}>{right}</div>
          : right}
      </div>
    </div>
  );
}

// ── The hatch celebration, extracted ────────────────────────────────
// This is the confetti-and-sparkles moment from the egg reveal (Shop / Onboarding), lifted
// out so any "you did it" beat can use the same one. Worth extracting rather than
// re-inventing: a child should learn one celebration, and a second, slightly-different one
// would just read as a bug.
//
// `screen` wraps it in a full-phone overlay. position:'fixed' resolves against the phone
// frame rather than the browser window, because the frame carries a transform (the prototype
// scales it to fit) and a transformed ancestor becomes the containing block for fixed
// children — which is what keeps the confetti inside the phone.
// ── Stage-up moment (A-3.3) ──────────────────────────────────────────
// A stage is presentation, and presentation the child never sees is worth nothing — so the
// transformation gets its own beat wherever the level that earned it landed: a battle win,
// a mission, the point exchange. It used to be a button on the character screen, which
// meant a buddy could cross the threshold and only "evolve" if the child happened to visit.
// No stats change here (that was the level's doing) — this is purely the reveal.
function StageUpMoment({ character, stage, color, onDone }) {
  const c = color || character?.color || THEME.primary;
  const info = stageOf(stage);
  React.useEffect(() => {
    const t = setTimeout(() => onDone && onDone(), 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  if (!character) return null;
  return (
    <div className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: `radial-gradient(circle at 50% 42%, ${shade(c, 16)} 0%, #17130f 74%)` }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 230, height: 230, marginBottom: 20 }}>
        <div className="jx-burst" style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: `radial-gradient(circle, ${shade(c, 52)} 0%, transparent 66%)` }} />
        <div className="jx-ring" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, border: `2px solid ${shade(c, 44)}99` }} />
        <div className="jx-ring-slow" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, border: `2px solid ${shade(c, 44)}99` }} />
        {/* keyed on stage so React remounts the mascot and the pop replays on the NEW form */}
        <div key={stage} className="jx-pop" style={{ position: 'relative' }}>
          <Mascot species={character.species} stage={stage} color={c} mood={moodForStage(stage)} size={170} context="detail" />
        </div>
      </div>
      <div className="game-font" style={{ color: '#fff', fontSize: 26, fontWeight: 500 }}>
        {L('Stage')} {stage} · {L(info.name)}
      </div>
      <div style={{ color: 'rgba(255,255,255,.82)', fontSize: 13.5, marginTop: 8, maxWidth: 260, lineHeight: 1.5 }}>
        “{L(info.lines[0])}”
      </div>
    </div>
  );
}

function HatchCelebration({ color = THEME.primary, accent = THEME.gold, screen = false }) {
  const cols  = [color, accent, shade(color, 42), THEME.gold, shade(color, -16), THEME.success, color, accent];
  const lefts = ['18%', '30%', '44%', '56%', '68%', '80%', '24%', '74%'];
  const dl    = [0, .12, .04, .18, .08, .22, .3, .26];
  const stars = [{ t: '20%', l: '18%', s: 20, d: 0 }, { t: '15%', l: '77%', s: 15, d: .5 },
                 { t: '42%', l: '85%', s: 12, d: 1 }, { t: '45%', l: '11%', s: 13, d: .3 },
                 { t: '11%', l: '48%', s: 12, d: .8 }];
  const bits = (
    <React.Fragment>
      {/* confetti raining from the top — tinted to the buddy */}
      {cols.map((c, i) => (
        <div key={`cf${i}`} className="jx-confetti" style={{ position: 'absolute', top: '7%', left: lefts[i], width: i % 3 ? 7 : 9, height: i % 2 ? 8 : 11, borderRadius: i % 2 ? 999 : 2, background: c, animationDelay: `${dl[i]}s` }} />
      ))}
      {/* twinkling sparkles */}
      {stars.map((p, i) => (
        <Icon key={`sp${i}`} name="sparkles" size={p.s} color={i % 2 ? THEME.gold : color} fill={i % 2 ? THEME.gold : color} stroke={0} className="jx-twinkle" style={{ position: 'absolute', top: p.t, left: p.l, animationDelay: `${p.d}s` }} />
      ))}
    </React.Fragment>
  );
  if (!screen) return bits;
  return <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 70 }}>{bits}</div>;
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

export { isNeon, mixHue, pastelHue, screenBgFor, screenBgActive, ScreenHeader, HatchCelebration, StageUpMoment, Confetti, RarityPill, DexProgress, PointsChip, StatCard };
