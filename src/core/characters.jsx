import React from 'react';
import { THEME } from './primitives.jsx';

// JoanX — Mascot system. Parametric kawaii creatures (fox / cat / bird),
// 3 evolution stages, color variants, and moods (happy / alert / sleepy).
// Drawn as inline SVG so it scales crisply and recolors freely.

function shade(hex, amt) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.round(Math.min(255, Math.max(0, r + amt)));
  g = Math.round(Math.min(255, Math.max(0, g + amt)));
  b = Math.round(Math.min(255, Math.max(0, b + amt)));
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

const SPECIES = {
  fox:  { name: 'Hammy', base: '#d99c5a', ears: 'pointy', tail: 'bushy',  feature: 'snout' },   // hamster in the Toy style
  cat:  { name: 'Mochi', base: '#a8c3eb', ears: 'cat',    tail: 'curl',   feature: 'whiskers' },
  bird: { name: 'Pip',   base: '#67c7ce', ears: 'tuft',   tail: 'fan',    feature: 'beak' },
  croc: { name: 'Croc',  base: '#59c08c', ears: 'pointy', tail: 'bushy',  feature: 'snout' },
  owl:  { name: 'Owl',   base: '#b9a3ef', ears: 'tuft',   tail: 'fan',    feature: 'beak' },
};

function Eyes({ mood, cx1, cx2, cy, r }) {
  if (mood === 'sleepy') {
    return (
      <g stroke="#2b2826" strokeWidth="3.5" strokeLinecap="round" fill="none">
        <path d={`M ${cx1 - r} ${cy} q ${r} ${r} ${2 * r} 0`} />
        <path d={`M ${cx2 - r} ${cy} q ${r} ${r} ${2 * r} 0`} />
      </g>
    );
  }
  const er = mood === 'alert' ? r * 1.18 : r;
  return (
    <g>
      {[cx1, cx2].map((cx, i) => (
        <g key={i}>
          <ellipse cx={cx} cy={cy} rx={er} ry={er * 1.15} fill="#2b2826" />
          <circle cx={cx + er * 0.32} cy={cy - er * 0.4} r={er * 0.34} fill="#fff" />
          <circle cx={cx - er * 0.3} cy={cy + er * 0.35} r={er * 0.16} fill="#fff" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function MascotClassic({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
  const sp = SPECIES[species] || SPECIES.fox;
  const base = color || sp.base;
  const dark = shade(base, -45);
  const belly = shade(base, 70);
  const sc = stage === 1 ? 0.82 : stage === 3 ? 1.06 : 1;      // body scale per stage
  const headBig = stage === 1 ? 1.12 : 1;                       // baby = bigger head ratio

  return (
    <div style={{ width: size, height: size, ...style }} className={float ? 'jx-float' : ''}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        {/* ground shadow */}
        <ellipse cx="100" cy="182" rx={44 * sc} ry="9" fill="#000" opacity="0.07" />

        {/* soft dot flecks (stage 1 & 3 flair) */}
        {stage !== 2 && [[30, 50, 4], [170, 64, 3], [158, 130, 3.5], [40, 120, 2.6]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.55" />
        ))}

        <g transform={`translate(100,108) scale(${sc}) translate(-100,-108)`}>
          {/* ── TAIL ── */}
          {sp.tail === 'bushy' && (
            <path d="M150 140 q 44 -6 40 -46 q -2 28 -30 30 q 10 8 -10 16 Z" fill={base} stroke={dark} strokeWidth="0" />
          )}
          {sp.tail === 'bushy' && <path d="M178 100 q 12 16 -2 30 q 6 -16 -10 -18 Z" fill={belly} />}
          {sp.tail === 'curl' && (
            <path d="M152 138 q 40 4 34 -28 q -4 20 -24 16" fill="none" stroke={base} strokeWidth="13" strokeLinecap="round" />
          )}
          {sp.tail === 'fan' && (
            <g>
              <path d="M150 138 L188 120 L186 150 Z" fill={shade(base, 30)} />
              <path d="M150 144 L190 140 L182 166 Z" fill={base} />
            </g>
          )}

          {/* ── WINGS (bird) ── */}
          {species === 'bird' && (
            <g>
              <ellipse cx="56" cy="120" rx="16" ry="26" fill={shade(base, 28)} transform="rotate(18 56 120)" />
              <ellipse cx="144" cy="120" rx="16" ry="26" fill={shade(base, 28)} transform="rotate(-18 144 120)" />
            </g>
          )}

          {/* ── BODY ── */}
          <ellipse cx="100" cy="122" rx="50" ry="48" fill={base} />
          <ellipse cx="100" cy="134" rx="34" ry="32" fill={belly} />

          {/* feet */}
          <ellipse cx="80" cy="168" rx="13" ry="9" fill={dark} />
          <ellipse cx="120" cy="168" rx="13" ry="9" fill={dark} />

          {/* ── EARS ── */}
          <g transform={`translate(100,${82 - (headBig - 1) * 30}) scale(${headBig}) translate(-100,-82)`}>
            {sp.ears === 'pointy' && (
              <g>
                <path d="M62 70 L52 24 L88 56 Z" fill={base} />
                <path d="M138 70 L148 24 L112 56 Z" fill={base} />
                <path d="M64 64 L58 38 L80 56 Z" fill={dark} />
                <path d="M136 64 L142 38 L120 56 Z" fill={dark} />
              </g>
            )}
            {sp.ears === 'cat' && (
              <g>
                <path d="M64 66 L54 30 L92 54 Z" fill={base} />
                <path d="M136 66 L146 30 L108 54 Z" fill={base} />
                <path d="M68 60 L62 40 L84 54 Z" fill="#F4A8C0" />
                <path d="M132 60 L138 40 L116 54 Z" fill="#F4A8C0" />
              </g>
            )}
            {sp.ears === 'tuft' && (
              <g stroke={dark} strokeWidth="6" strokeLinecap="round">
                <path d="M100 58 L100 26" />
                <path d="M100 40 L86 22" />
                <path d="M100 40 L114 22" />
              </g>
            )}

            {/* ── HEAD ── */}
            <ellipse cx="100" cy="92" rx="46" ry="42" fill={base} />
            {/* cheeks / muzzle */}
            <ellipse cx="100" cy="104" rx="30" ry="24" fill={belly} />
            {species === 'fox' && <path d="M70 96 q -8 -24 16 -30 q -10 16 -16 30 Z" fill={belly} opacity="0.9" />}

            {/* blush */}
            <ellipse cx="70" cy="104" rx="9" ry="6" fill="#FF8FA3" opacity="0.55" />
            <ellipse cx="130" cy="104" rx="9" ry="6" fill="#FF8FA3" opacity="0.55" />

            {/* eyes */}
            <Eyes mood={mood} cx1={84} cx2={116} cy={90} r={mood === 'alert' ? 9 : 8} />

            {/* nose / beak / mouth */}
            {sp.feature === 'beak'
              ? <path d="M92 102 L108 102 L100 116 Z" fill={THEME.gold} />
              : <ellipse cx="100" cy="104" rx="5.5" ry="4" fill="#2b2826" />}
            {mood !== 'sleepy' && sp.feature !== 'beak' && (
              mood === 'alert'
                ? <ellipse cx="100" cy="116" rx="5" ry="6" fill="#2b2826" />
                : <path d="M92 110 q 8 9 16 0" stroke="#2b2826" strokeWidth="3" fill="none" strokeLinecap="round" />
            )}

            {/* whiskers (cat) */}
            {sp.feature === 'whiskers' && (
              <g stroke={dark} strokeWidth="2" strokeLinecap="round" opacity="0.6">
                <path d="M64 104 L44 100 M64 110 L44 112" />
                <path d="M136 104 L156 100 M136 110 L156 112" />
              </g>
            )}
          </g>

          {/* ── STAGE ACCESSORIES ── */}
          {stage >= 2 && (
            /* safety scarf */
            <g>
              <path d="M70 150 q 30 14 60 0 l 0 10 q -30 12 -60 0 Z" fill={THEME.primary} />
              <path d="M124 154 l 14 22 l -12 2 l -8 -18 Z" fill={THEME.primaryDark} />
            </g>
          )}
          {stage === 3 && (
            /* hero cape + shield badge */
            <g>
              <path d="M58 116 q -22 30 -6 58 q 24 -8 40 -6 l 0 -44 Z" fill={THEME.primaryDark} opacity="0.92" />
              <g transform="translate(100,150)">
                <path d="M0 -11 L10 -7 L10 3 Q10 11 0 15 Q-10 11 -10 3 L-10 -7 Z" fill={THEME.gold} stroke="#fff" strokeWidth="2" />
                <path d="M-4 0 l3 4 l6 -8" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

// ── Korean line ("KR") — Kakao-Friends-style single-bean characters.
// One merged head+body bean, tiny dot eyes, minimal nose, flat fills,
// stubby arms/feet — a cleaner, more iconic Korean-IP silhouette.
function MascotKR({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
  const sp = SPECIES[species] || SPECIES.fox;
  const base = color || sp.base;
  const dark = shade(base, -46);
  const ear = shade(base, -14);
  const ink = '#2b2826';
  const sc = stage === 1 ? 0.88 : stage === 3 ? 1.06 : 1;

  const belly = shade(base, 72);
  // Big round sparkly eyes — the main "cute for kids" cue.
  const er = mood === 'alert' ? 11.5 : 10;
  const Eye = ({ cx }) => mood === 'sleepy'
    ? <path d={`M${cx - 8} 90 q8 7 16 0`} stroke={ink} strokeWidth="3.4" fill="none" strokeLinecap="round" />
    : (<g>
        <ellipse cx={cx} cy="91" rx={er} ry={er * 1.14} fill={ink} />
        <circle cx={cx + er * 0.34} cy={91 - er * 0.44} r={er * 0.38} fill="#fff" />
        <circle cx={cx - er * 0.32} cy={91 + er * 0.34} r={er * 0.18} fill="#fff" opacity="0.85" />
      </g>);

  return (
    <div style={{ width: size, height: size, ...style }} className={float ? 'jx-float' : ''}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        <ellipse cx="100" cy="186" rx={42 * sc} ry="7" fill="#000" opacity="0.07" />
        {stage !== 2 && [[36, 64, 3.2], [167, 76, 2.8], [160, 140, 2.8]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.45" />
        ))}

        {/* subtle gestural lean so it reads hand-drawn, not generated */}
        <g transform={`translate(100,108) scale(${sc}) rotate(-2.5) translate(-100,-108)`}>
          {/* short tail behind the unified body */}
          {species === 'fox' && <path d="M150 158 q30 4 28 -24 q-7 17 -24 13 q10 7 -4 11 Z" fill={base} />}
          {species === 'cat' && <path d="M150 158 q30 6 26 -22 q-5 16 -22 12" fill="none" stroke={base} strokeWidth="11" strokeLinecap="round" />}

          {/* feet poking from the bottom */}
          <ellipse cx="83" cy="167" rx="11" ry="6.5" fill={dark} />
          <ellipse cx="117" cy="167" rx="11" ry="6.5" fill={dark} />

          {/* ears / top feature — sit on the rounded top */}
          {sp.ears === 'pointy' && (<g>
            <path d="M60 56 L47 18 L94 48 Z" fill={base} />
            <path d="M140 56 L153 18 L106 48 Z" fill={base} />
            <path d="M64 51 L57 31 L84 48 Z" fill={ear} />
            <path d="M136 51 L143 31 L116 48 Z" fill={ear} />
          </g>)}
          {sp.ears === 'cat' && (<g>
            <path d="M62 54 L51 24 L94 48 Z" fill={base} />
            <path d="M138 54 L149 24 L106 48 Z" fill={base} />
            <path d="M67 49 L62 34 L85 48 Z" fill="#F4A8C0" opacity="0.85" />
            <path d="M133 49 L138 34 L115 48 Z" fill="#F4A8C0" opacity="0.85" />
          </g>)}
          {sp.ears === 'tuft' && (<g stroke={dark} strokeWidth="5.5" strokeLinecap="round">
            <path d="M100 44 L100 18" /><path d="M100 31 L89 19" /><path d="M100 31 L111 19" />
          </g>)}

          {/* ── ONE unified head+body silhouette (no seam) ── */}
          <path d="M100 44 C141 44 156 70 156 104 C156 142 141 172 100 172 C59 172 44 142 44 104 C44 70 59 44 100 44 Z" fill={base} />
          {/* belly patch gives soft form */}
          <ellipse cx="100" cy="132" rx="30" ry="32" fill={belly} />

          {/* arms as part of the body — left raised in a little wave */}
          <ellipse cx="50" cy="104" rx="8.5" ry="14" fill={base} transform="rotate(34 50 104)" />
          <ellipse cx="150" cy="130" rx="8.5" ry="14" fill={base} transform="rotate(-16 150 130)" />
          {/* bird wings instead of arms */}
          {species === 'bird' && (<g>
            <ellipse cx="52" cy="122" rx="10" ry="15" fill={ear} transform="rotate(24 52 122)" />
            <ellipse cx="148" cy="122" rx="10" ry="15" fill={ear} transform="rotate(-24 148 122)" />
          </g>)}

          {/* cheeks + big-eyed face cluster (tight, upper-centre) */}
          <ellipse cx="73" cy="99" rx="8.5" ry="5" fill="#FF8FA3" opacity="0.5" />
          <ellipse cx="127" cy="99" rx="8.5" ry="5" fill="#FF8FA3" opacity="0.5" />
          <Eye cx={85} /><Eye cx={115} />
          {species === 'bird'
            ? <path d="M94 100 L106 100 L100 109 Z" fill={THEME.gold} />
            : (<React.Fragment>
                <ellipse cx="100" cy="101" rx="3.4" ry="2.8" fill={ink} />
                {mood !== 'sleepy' && <path d="M94 106 q6 5 12 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
              </React.Fragment>)}
          {sp.feature === 'whiskers' && (<g stroke={dark} strokeWidth="1.8" strokeLinecap="round" opacity="0.4">
            <path d="M69 100 L53 97 M69 105 L53 107" /><path d="M131 100 L147 97 M131 105 L147 107" />
          </g>)}

          {/* stage gear — little collar scarf + shield badge */}
          {stage >= 2 && (<g>
            <path d="M76 120 q24 10 48 0 l0 8 q-24 9 -48 0 Z" fill={THEME.primary} />
            <path d="M116 124 l 9 15 l -7 2 l -5 -12 Z" fill={THEME.primaryDark} />
          </g>)}
          {stage === 3 && (<g transform="translate(100,140)">
            <path d="M0 -9 L8 -5.5 L8 2.5 Q8 10 0 12.5 Q-8 10 -8 2.5 L-8 -5.5 Z" fill={THEME.gold} stroke="#fff" strokeWidth="1.8" />
            <path d="M-3.5 0 l2.6 3.5 l5.4 -7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>)}
        </g>
      </svg>
    </div>
  );
}

// ── Toy line ("3D") — genuine rendered 3D designer-toy art (knit/plush,
// soft studio lighting). Assets live in character-references/3d/ as
// transparent PNGs. Recolor/stage/mood don't apply (fixed renders); add
// more files to TOY_SRC per species as they're produced.
const TOY_DEFAULT = '3d oe.png';
const TOY_SRC = {
  // species: 'file.png'  — falls back to TOY_DEFAULT until a render exists
  cat: 'real3dmedi-clean.png',   // Mochi — real 3D music buddy (halo matted out)
};
// per-character optical tweaks (fraction of size), mirroring the comic line.
// TOY_BASE lifts the whole 3D line — the renders carry whitespace (raised
// arm, music note) so object-fit reads small; bump everyone up a touch.
const TOY_BASE = 1.22;
const TOY_SCALE = {};
const TOY_SHIFT = { _all: { x: -0.04, y: 0.07 } };  // nudge the whole 3D line down + slightly left
function MascotToy({ species = 'fox', size = 160, style, float, context }) {
  const file = TOY_SRC[species] || TOY_DEFAULT;
  // the detail (buddy) screen frames the mascot tight against the top chips —
  // ease the tall raised-arm cat pose there while keeping it big on Home
  const detailShrink = context === 'detail' && species === 'cat' ? 0.85 : 1;
  const k = (TOY_SCALE[species] || 1) * TOY_BASE * detailShrink;
  const { x: dx = 0, y: dy = 0 } = TOY_SHIFT[species] || TOY_SHIFT._all || {};
  const tf = [
    dx ? `translateX(${dx * 100}%)` : '',
    dy ? `translateY(${dy * 100}%)` : '',
    k !== 1 ? `scale(${k})` : '',
  ].filter(Boolean).join(' ');
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', ...style }}
         className={float ? 'jx-float' : ''}>
      <img src={`/assets/characters/3d/${encodeURIComponent(file)}`} alt="" draggable="false"
           style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', pointerEvents: 'none',
                    transform: tf || undefined, transformOrigin: 'center bottom' }} />
    </div>
  );
}

// ── 3D-Cute line ("cute") — a second, cuter 3D set from
// character-references/3d-cute/ (koala, giraffe, axolotl, pig, chick, dino).
// Fixed renders, so stage/mood don't apply. Each species carries its own
// signature colour (CUTE_COLOR) which the app adopts as the accent/brand
// colour while this style is active — see the effect in App.jsx.
const CUTE_DEFAULT = 'default.png';   // chick — any unmapped species
const CUTE_SRC = {
  fox:  'fox.png',   // Dino    → Hammy slot
  cat:  'cat.png',   // Axolotl → Mochi
  bird: 'bird.png',   // Giraffe → Pip
  owl:  'owl.png',   // Pig     → Sunny
  croc: 'croc.png',   // Koala   → Ember
};
// signature brand colour per character — becomes the app accent in cute mode.
// Punchier than the pale render bodies so it reads on buttons / progress bars.
const CUTE_COLOR = {
  fox:  '#34a853',   // dino green (deeper / richer)
  cat:  '#ee8aa2',   // axolotl pink
  bird: '#efb022',   // giraffe amber
  owl:  '#f0936b',   // pig coral
  croc: '#9a8f83',   // koala taupe
  _def: '#e6ae3c',   // chick gold
};
const cuteColor = (species) => CUTE_COLOR[species] || CUTE_COLOR._def;
// per-character optical tweaks (fraction of size). Renders differ in framing:
// giraffe is tall (reads small), axolotl is wide (fills sideways), pig/chick
// carry a baked ground-glow at the bottom. scale multiplies CUTE_BASE.
const CUTE_BASE = 1.12;
const CUTE_SCALE = { bird: 0.96, cat: 0.94, croc: 1.06, owl: 1.04, fox: 1.02 };
const CUTE_SHIFT = {
  _all: { y: 0.04 },
  bird: { y: 0.02 },   // giraffe — top-heavy, ease the down-shift
};
function MascotToyCute({ species = 'fox', size = 160, style, float }) {
  const file = CUTE_SRC[species] || CUTE_DEFAULT;
  const k = (CUTE_SCALE[species] || 1) * CUTE_BASE;
  const { x: dx = 0, y: dy = 0 } = CUTE_SHIFT[species] || CUTE_SHIFT._all || {};
  const tf = [
    dx ? `translateX(${dx * 100}%)` : '',
    dy ? `translateY(${dy * 100}%)` : '',
    k !== 1 ? `scale(${k})` : '',
  ].filter(Boolean).join(' ');
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', ...style }}
         className={float ? 'jx-float' : ''}>
      <img src={`/assets/characters/cute/${encodeURIComponent(file)}`} alt="" draggable="false"
           style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', pointerEvents: 'none',
                    transform: tf || undefined, transformOrigin: 'center bottom' }} />
    </div>
  );
}

// Per-style buddy roster: [species, displayName, brandColor]. Drives the
// Tweaks "Buddy" selector — options change with the chosen Character Style —
// and the accent/brand colour the app adopts when a buddy is picked.
const STYLE_BUDDIES = {
  comic: [
    ['fox',  'Hammy', '#4b814f'],
    ['cat',  'Mochi', '#e1874a'],
    ['bird', 'Pip',   '#4f93c4'],
    ['owl',  'Sunny', '#e0554a'],
  ],
  toy: [
    ['cat',  'Mochi', '#e79a52'],   // only Mochi has a real 3D render for now
  ],
  cute: [
    ['fox',  'Dino',    CUTE_COLOR.fox],
    ['cat',  'Axolotl', CUTE_COLOR.cat],
    ['bird', 'Giraffe', CUTE_COLOR.bird],
    ['owl',  'Pig',     CUTE_COLOR.owl],
  ],
  // Soft 3D — restored SVG critters (0da9b64), with their 06-29 colours
  soft: [
    ['fox',  'Hammy', '#d99c5a'],
    ['cat',  'Mochi', '#a8c3eb'],
    ['bird', 'Pip',   '#e278a8'],
    ['owl',  'Sunny', '#ffbc05'],
    ['croc', 'Ember', '#9867e4'],
  ],
};
const styleColor = (style, species) => {
  const row = (STYLE_BUDDIES[style] || []).find(r => r[0] === species);
  return row ? row[2] : null;
};

// ── K-Toon line ("toon") — Korean kids'-animation register (think Pororo /
// LINE Friends): one dominant big head, a small readable body with stubby
// arms & legs, clean white-sclera eyes, restrained features, and a calm
// medium outline. Each species gets its own silhouette — not a shared blob.
function MascotToon({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
  const sp = SPECIES[species] || SPECIES.fox;
  const base = color || sp.base;
  const ol = '#43392f';                 // calm warm outline (not harsh black)
  const ear = shade(base, -14);
  const dark = shade(base, -40);
  const paw = shade(base, -24);
  const belly = shade(base, 40);          // gentle tint, not blown-out white
  const ink = '#33302e';
  const beak = '#f0a83a';
  const sc = stage === 1 ? 0.9 : stage === 3 ? 1.06 : 1;

  const big = species === 'owl';
  // clean animation eyes: white sclera + pupil + single highlight
  const ew = (mood === 'alert' ? 9.5 : 8.5) * (big ? 1.18 : 1);
  const Eye = ({ cx, cy }) => mood === 'sleepy'
    ? <path d={`M${cx - ew} ${cy} q${ew} ${ew * 0.8} ${2 * ew} 0`} stroke={ol} strokeWidth="3" fill="none" strokeLinecap="round" />
    : (<g>
        <ellipse cx={cx} cy={cy} rx={ew} ry={ew * 1.12} fill="#fff" stroke={ol} strokeWidth="2.2" />
        <circle cx={cx + (cx < 100 ? 0.5 : -0.5)} cy={cy + ew * (mood === 'alert' ? -0.05 : 0.2)} r={ew * 0.52} fill={ink} />
        <circle cx={cx + (cx < 100 ? 1.6 : -1.6)} cy={cy - ew * 0.28} r={ew * 0.2} fill="#fff" />
      </g>);

  const wings = species === 'bird' || species === 'owl';

  return (
    <div style={{ width: size, height: size, ...style }} className={float ? 'jx-float' : ''}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        <ellipse cx="100" cy="190" rx={40 * sc} ry="6.5" fill="#000" opacity="0.07" />
        {stage !== 2 && [[34, 58, 3.2], [168, 72, 2.6], [164, 132, 2.8]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.5" />
        ))}

        <g transform={`translate(100,108) scale(${sc}) translate(-100,-108)`}
           stroke={ol} strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round">

          {/* ── tail (mammals, behind body) ── */}
          {species === 'fox' && <ellipse cx="142" cy="150" rx="8" ry="7" fill={base} />}
          {species === 'cat' && <path d="M138 152 q26 4 24 -20 q-4 15 -20 11" fill="none" strokeWidth="7" />}

          {/* ── legs / feet ── */}
          {wings
            ? (<g stroke={beak} strokeWidth="3.4" fill="none">
                <path d="M90 158 L90 170 M90 170 L84 175 M90 170 L96 175" />
                <path d="M110 158 L110 170 M110 170 L104 175 M110 170 L116 175" />
              </g>)
            : (<g fill={paw}>
                <ellipse cx="86" cy="166" rx="11" ry="7.5" />
                <ellipse cx="114" cy="166" rx="11" ry="7.5" />
              </g>)}

          {/* ── arms / wings (behind body) ── */}
          {wings
            ? (<g fill={ear}>
                <path d="M70 130 q-16 4 -16 24 q11 -2 22 -9 Z" />
                <path d="M130 130 q16 4 16 24 q-11 -2 -22 -9 Z" />
              </g>)
            : (<g fill={base}>
                <ellipse cx="69" cy="134" rx="8" ry="13" transform="rotate(24 69 134)" />
                <ellipse cx="131" cy="134" rx="8" ry="13" transform="rotate(-24 131 134)" />
                <ellipse cx="65" cy="143" rx="6.5" ry="6" fill={paw} />
                <ellipse cx="135" cy="143" rx="6.5" ry="6" fill={paw} />
              </g>)}

          {/* ── body: tucked up under the head so they read as ONE figure ── */}
          <path d="M72 132 Q72 102 100 102 Q128 102 128 132 Q128 162 100 162 Q72 162 72 132 Z" fill={base} />
          <ellipse cx="100" cy="140" rx="18" ry="19" fill={belly} stroke="none" />
          {(species === 'bird' || species === 'owl') && [138, 148].map((y, i) => (
            <path key={i} d={`M92 ${y} L100 ${y + 4} L108 ${y}`} stroke={ear} strokeWidth="1.8" fill="none" opacity="0.55" />
          ))}

          {/* ════════ HEADS — distinct silhouette per species ════════ */}

          {/* ── HAMSTER (fox slot): round head, chubby cheek-pouches, little ears ── */}
          {species === 'fox' && (<g>
            <circle cx="70" cy="44" r="11" fill={base} /><circle cx="130" cy="44" r="11" fill={base} />
            <circle cx="70" cy="45" r="5.5" fill={ear} stroke="none" /><circle cx="130" cy="45" r="5.5" fill={ear} stroke="none" />
            {/* cheek pouches widen the silhouette */}
            <ellipse cx="58" cy="84" rx="15" ry="16" fill={base} />
            <ellipse cx="142" cy="84" rx="15" ry="16" fill={base} />
            <ellipse cx="100" cy="74" rx="44" ry="41" fill={base} />
            <ellipse cx="100" cy="86" rx="15" ry="11" fill={belly} stroke="none" />
            <ellipse cx="70" cy="88" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <ellipse cx="130" cy="88" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <Eye cx={84} cy={72} /><Eye cx={116} cy={72} />
            <ellipse cx="100" cy="82" rx="3" ry="2.3" fill={ink} stroke="none" />
            {mood !== 'sleepy' && <path d="M100 84 q-4 4 -7 1.5 M100 84 q4 4 7 1.5" strokeWidth="2.2" fill="none" />}
            {mood !== 'sleepy' && <g fill="#fff" strokeWidth="0.7"><rect x="97.7" y="89" width="2.3" height="3.4" rx="0.8" /><rect x="100" y="89" width="2.3" height="3.4" rx="0.8" /></g>}
          </g>)}

          {/* ── MOUSE (cat slot): big round ears, tiny pink nose ── */}
          {species === 'cat' && (<g>
            <circle cx="64" cy="40" r="17" fill={base} /><circle cx="136" cy="40" r="17" fill={base} />
            <circle cx="64" cy="42" r="9.5" fill="#F4A8C0" stroke="none" /><circle cx="136" cy="42" r="9.5" fill="#F4A8C0" stroke="none" />
            <ellipse cx="100" cy="76" rx="42" ry="40" fill={base} />
            <ellipse cx="100" cy="88" rx="13" ry="9" fill={belly} stroke="none" />
            <ellipse cx="73" cy="90" rx="6.5" ry="4" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <ellipse cx="127" cy="90" rx="6.5" ry="4" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <Eye cx={86} cy={74} /><Eye cx={114} cy={74} />
            <ellipse cx="100" cy="86" rx="3" ry="2.4" fill="#e8769a" stroke="none" />
            {mood !== 'sleepy' && <path d="M100 88 q-4 3.5 -7 1.5 M100 88 q4 3.5 7 1.5" strokeWidth="2" fill="none" />}
            <g stroke={dark} strokeWidth="1.4" opacity="0.4"><path d="M88 87 L70 84 M88 91 L70 93" /><path d="M112 87 L130 84 M112 91 L130 93" /></g>
          </g>)}

          {/* ── CHICK (bird): crest + beak, no ears ── */}
          {species === 'bird' && (<g>
            {(stage === 3 ? [-26, -9, 9, 26] : [-16, 0, 16]).map((deg, i) => (
              <path key={i} d="M0 6 C-4 -5 -3 -16 0 -22 C3 -16 4 -5 0 6 Z" fill={ear}
                transform={`translate(100,40) rotate(${deg}) scale(${stage === 3 ? 1.15 : 0.95})`} />
            ))}
            <ellipse cx="100" cy="78" rx="42" ry="40" fill={base} />
            <ellipse cx="72" cy="92" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <ellipse cx="128" cy="92" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.5" stroke="none" />
            <Eye cx={86} cy={76} /><Eye cx={114} cy={76} />
            <path d="M100 86 L109 93 L100 101 L91 93 Z" fill={beak} strokeWidth="2.4" />
          </g>)}

          {/* ── CROC: low rounded head, eyes raised on top, long snout, scutes ── */}
          {species === 'croc' && (<g>
            {(stage === 3 ? [-22, -7, 7, 22] : [-13, 0, 13]).map((dx, i) => (
              <path key={i} d="M-7 6 Q0 -9 7 6 Z" transform={`translate(${100 + dx},38)`} fill={dark} strokeWidth="2.4" />
            ))}
            <ellipse cx="100" cy="66" rx="44" ry="34" fill={base} />
            {/* eye domes raised on top */}
            <circle cx="82" cy="50" r="13" fill={base} /><circle cx="118" cy="50" r="13" fill={base} />
            {/* snout */}
            <path d="M62 86 Q62 74 100 74 Q138 74 138 86 Q138 104 100 104 Q62 104 62 86 Z" fill={base} />
            <ellipse cx="100" cy="92" rx="22" ry="10" fill={belly} stroke="none" />
            <ellipse cx="90" cy="80" rx="2.2" ry="1.7" fill={ink} stroke="none" />
            <ellipse cx="110" cy="80" rx="2.2" ry="1.7" fill={ink} stroke="none" />
            {mood !== 'sleepy' && <path d="M86 90 q14 7 28 0" strokeWidth="2.4" fill="none" />}
            <Eye cx={82} cy={48} /><Eye cx={118} cy={48} />
          </g>)}

          {/* ── OWL: wide head, ear tufts, facial disc, beak ── */}
          {species === 'owl' && (<g>
            <path d="M68 50 L60 24 L86 46 Z" fill={base} /><path d="M132 50 L140 24 L114 46 Z" fill={base} />
            <ellipse cx="100" cy="74" rx="47" ry="42" fill={base} />
            <ellipse cx="100" cy="78" rx="34" ry="32" fill={belly} strokeWidth="2.2" />
            <Eye cx={84} cy={74} /><Eye cx={116} cy={74} />
            <path d="M100 84 L107 91 L100 99 L93 91 Z" fill={beak} strokeWidth="2.4" />
          </g>)}

          {/* ════════ stage gear ════════ */}
          {stage >= 2 && (<g>
            <path d="M78 110 q22 9 44 0 l0 8 q-22 9 -44 0 Z" fill={THEME.primary} strokeWidth="2.8" />
            <path d="M116 113 l 9 14 l -7 2 l -5 -11 Z" fill={THEME.primaryDark} strokeWidth="2.8" />
            <circle cx="100" cy="114" r="4" fill={THEME.gold} strokeWidth="2.2" />
          </g>)}
          {stage === 3 && (<g transform="translate(100,28)">
            <path d="M-14 7 L-14 -3 L-7 3 L0 -8 L7 3 L14 -3 L14 7 Z" fill={THEME.gold} strokeWidth="2.8" />
            <rect x="-14" y="6" width="28" height="4" rx="2" fill={shade('#d19900', -6)} strokeWidth="2.8" />
            <g stroke="none" fill="#fff"><circle cx="0" cy="-8" r="2" /><circle cx="-14" cy="-3" r="1.6" /><circle cx="14" cy="-3" r="1.6" /></g>
          </g>)}
        </g>
      </svg>
    </div>
  );
}

// ── Comic line ("comic") — renders the user-supplied character art from
// character-references/ per species: Hammy(fox)=somg, Mochi(cat)=ghost,
// Ember(croc)=withcape (king). Fixed assets, so recolor/stage don't apply.
const COMIC_SRC = {
  fox:  'fox.svg',    // Hammy
  cat:  'cat.svg', // Mochi
  croc: 'croc.svg',  // Ember (king)
  bird: 'bird.svg', // Pip
  owl:  'owl.svg',  // Sunny
};
// per-character optical-size tweak — some assets sit/have whitespace and
// render small under object-fit; nudge them up to match the others.
const COMIC_SCALE = {
  owl: 1.1,    // RedPanda sits, with thought bubbles → gentle bump
  fox: 1.12,   // Carort (chameleon on a rug) reads small → gentle bump
  // bird (daddydragon) is a full-frame composition → no bump needed
};
// per-character nudge (fraction of size; x: negative = left, y: positive = down)
// for assets whose visual mass is off-centre or have internal whitespace.
const COMIC_SHIFT = {
  cat: { x: -0.05 },           // explorecat is right-heavy → nudge left
  fox: { y: 0.07 },            // Carort has whitespace below the rug → push down to ground it
  bird: { y: 0.04 },           // daddydragon → small downward nudge (avoid crowding the label)
};
function MascotComic({ species = 'fox', size = 160, style, float }) {
  const file = COMIC_SRC[species] || 'default.svg';
  const k = COMIC_SCALE[species] || 1;
  const { x: dx = 0, y: dy = 0 } = COMIC_SHIFT[species] || {};
  const tf = [
    dx ? `translateX(${dx * 100}%)` : '',
    dy ? `translateY(${dy * 100}%)` : '',
    k !== 1 ? `scale(${k})` : '',
  ].filter(Boolean).join(' ');
  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', ...style }}
         className={float ? 'jx-float' : ''}>
      <img src={`character-references/${file}`} alt="" draggable="false"
           style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', pointerEvents: 'none',
                    transform: tf || undefined, transformOrigin: 'center bottom' }} />
    </div>
  );
}

// ── Soft line ("soft") — restored SVG critters from 0da9b64 — chunky soft-3D critter: big domed eyes, lighter
// segmented belly, little teeth, dorsal scutes, gradient shading for form.
function MascotSoft({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
  // A cute croc/gator creature (per reference): huge domed eyes on top, a
  // wide projecting snout with little teeth, dorsal scutes (no mammal ears),
  // lighter segmented belly, soft-3D gradient shading. Recolours per buddy.
  const base = color || '#59c08c';
  const dark = shade(base, -42);
  const ink = '#2b2826';
  const sc = stage === 1 ? 0.9 : stage === 3 ? 1.06 : 1;
  const uid = React.useId().replace(/[:]/g, '');
  const gB = 'tb' + uid, gC = 'tc' + uid, gEL = 'tl' + uid, gER = 'tr' + uid, soft = 'ts' + uid;
  const er = mood === 'alert' ? 21 : 19;   // croc's huge domed eyes
  const Eye = ({ cx, cy, r = er }) => mood === 'sleepy'
    ? <path d={`M${cx - r * 0.7} ${cy} q${r * 0.7} ${r * 0.5} ${r * 1.4} 0`} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
    : (<g>
        <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={shade(base, -20)} strokeWidth="1.4" />
        <circle cx={cx + (cx < 100 ? r * 0.13 : -r * 0.13)} cy={cy + r * 0.28} r={r * 0.46} fill={ink} />
        <circle cx={cx + (cx < 100 ? r * 0.24 : -r * 0.03)} cy={cy + r * 0.05} r={r * 0.2} fill="#fff" />
        <circle cx={cx + (cx < 100 ? -r * 0.1 : r * 0.1)} cy={cy + r * 0.5} r={r * 0.09} fill="#fff" opacity="0.8" />
      </g>);

  // scarf-collar / crown placement varies per creature
  const neckY = species === 'fox' ? 116 : species === 'bird' ? 122 : species === 'owl' ? 120 : 118;
  const crownY = species === 'cat' ? 58 : species === 'bird' ? 26 : species === 'fox' ? 44 : species === 'owl' ? 30 : 27;

  return (
    <div style={{ width: size, height: size, ...style }} className={float ? 'jx-float' : ''}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={gB} cx="38%" cy="26%" r="84%">
            <stop offset="0%" stopColor={shade(base, 34)} />
            <stop offset="58%" stopColor={base} />
            <stop offset="100%" stopColor={shade(base, -26)} />
          </radialGradient>
          <radialGradient id={gC} cx="42%" cy="24%" r="86%">
            <stop offset="0%" stopColor={shade(base, 92)} />
            <stop offset="100%" stopColor={shade(base, 44)} />
          </radialGradient>
          <linearGradient id={gEL} x1="2%" y1="6%" x2="80%" y2="86%">
            <stop offset="0%" stopColor={shade(base, -58)} />
            <stop offset="42%" stopColor={shade(base, -10)} />
            <stop offset="100%" stopColor={base} />
          </linearGradient>
          <linearGradient id={gER} x1="98%" y1="6%" x2="20%" y2="86%">
            <stop offset="0%" stopColor={shade(base, -58)} />
            <stop offset="42%" stopColor={shade(base, -10)} />
            <stop offset="100%" stopColor={base} />
          </linearGradient>
          <filter id={soft} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>

        <ellipse cx="100" cy="187" rx={46 * sc} ry="7.5" fill="#000" opacity="0.08" />
        {stage !== 2 && [[32, 70, 3.2], [170, 82, 2.8], [166, 146, 2.8]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.45" />
        ))}

        <g transform={`translate(100,114) scale(${sc}) translate(-100,-114)`}>

          {/* ══ HAMSTER (fox slot) — chubby-cheeked plush hamster, croc-clean style ══ */}
          {species === 'fox' && (() => {
            const paw      = shade(base, -22);     // soft little paws / feet
            const innerEar = shade(base, 36);      // inner ear
            const cream    = `url(#${gC})`;
            const er2 = mood === 'alert' ? 17 : 15.5;   // big shared domed eyes (croc-style)
            return (<React.Fragment>
              {/* little stub tail peeking out behind the body */}
              <ellipse cx="150" cy="151" rx="8.5" ry="7.5" fill={cream} />

              {/* feet */}
              <ellipse cx="84" cy="177" rx="14" ry="8.5" fill={paw} />
              <ellipse cx="116" cy="177" rx="14" ry="8.5" fill={paw} />

              {/* body */}
              <ellipse cx="100" cy="128" rx="49" ry="50" fill={`url(#${gB})`} />

              {/* cream belly */}
              <ellipse cx="100" cy="140" rx="31" ry="33" fill={cream} />

              {/* little arms folded onto the tummy (paws meet at the centre) */}
              <path d="M70 129 Q82 142 93 147" stroke={`url(#${gB})`} strokeWidth="15" fill="none" strokeLinecap="round" />
              <path d="M130 129 Q118 142 107 147" stroke={`url(#${gB})`} strokeWidth="15" fill="none" strokeLinecap="round" />
              <ellipse cx="94" cy="148" rx="8.5" ry="7.5" fill={paw} />
              <ellipse cx="106" cy="148" rx="8.5" ry="7.5" fill={paw} />

              {/* ── HEAD + chubby cheek pouches ── */}
              <ellipse cx="100" cy="86" rx="45" ry="39" fill={`url(#${gB})`} />
              <ellipse cx="64" cy="98" rx="14" ry="14" fill={`url(#${gB})`} />
              <ellipse cx="136" cy="98" rx="14" ry="14" fill={`url(#${gB})`} />
              <ellipse cx="84" cy="64" rx="20" ry="12" fill="#fff" opacity="0.12" filter={`url(#${soft})`} />
              <ellipse cx="100" cy="118" rx="26" ry="9" fill="#000" opacity="0.08" filter={`url(#${soft})`} />

              {/* ── round ears on top (bigger) ── */}
              <circle cx="74" cy="50" r="15" fill={`url(#${gB})`} />
              <circle cx="126" cy="50" r="15" fill={`url(#${gB})`} />
              <circle cx="74" cy="51" r="9" fill={innerEar} />
              <circle cx="126" cy="51" r="9" fill={innerEar} />

              {/* ── cream muzzle ── */}
              <ellipse cx="100" cy="101" rx="19" ry="13.5" fill={cream} />

              {/* blush */}
              <ellipse cx="70" cy="101" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" />
              <ellipse cx="130" cy="101" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" />

              {/* ── big domed eyes (shared croc-style) ── */}
              <Eye cx={80} cy={78} r={er2} /><Eye cx={120} cy={78} r={er2} />

              {/* whiskers */}
              <g stroke={shade(base, -24)} strokeWidth="1.5" strokeLinecap="round" opacity="0.4">
                <path d="M74 99 L52 96 M74 104 L52 107" />
                <path d="M126 99 L148 96 M126 104 L148 107" />
              </g>

              {/* ── nose + tiny mouth + front teeth ── */}
              <ellipse cx="100" cy="96" rx="4.6" ry="3.6" fill={shade(base, -58)} />
              <circle cx="98.4" cy="95" r="1.2" fill="#fff" opacity="0.6" />
              {mood !== 'sleepy' && <g stroke={shade(base, -58)} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M100 100 L100 103" />
                <path d="M100 103 q-5 4.5 -10 2 M100 103 q5 4.5 10 2" />
              </g>}
              {mood !== 'sleepy' && <g fill="#fff" stroke={shade(base, -30)} strokeWidth="0.5">
                <rect x="97.5" y="104" width="2.5" height="4.4" rx="1" />
                <rect x="100" y="104" width="2.5" height="4.4" rx="1" />
              </g>}
              {mood === 'sleepy' && <path d="M93 102 q7 5 14 0" stroke={shade(base, -58)} strokeWidth="2.2" fill="none" strokeLinecap="round" />}
            </React.Fragment>);
          })()}

          {/* ══ CROC (croc) ══ */}
          {species === 'croc' && (<React.Fragment>
            <path d="M118 150 C156 160 184 146 198 104 C190 130 172 152 146 162 C134 167 124 162 118 150 Z" fill={`url(#${gB})`} />
            {[[156, 130], [172, 120], [184, 112]].map(([x, y], i) => <path key={i} d={`M${x - 7} ${y + 6} Q${x + 1} ${y - 8} ${x + 8} ${y + 4} Z`} fill={dark} opacity="0.45" />)}
            <ellipse cx="80" cy="176" rx="15" ry="9" fill={dark} /><ellipse cx="120" cy="176" rx="15" ry="9" fill={dark} />
            {[71, 80, 89, 111, 120, 129].map((x, i) => <line key={i} x1={x} y1="173" x2={x} y2="181" stroke={shade(base, -60)} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />)}
            {(stage === 3 ? [[74, 54], [88, 50], [100, 47], [112, 50], [126, 54]] : [[80, 52], [100, 48], [120, 52]]).map(([x, y], i) => {
              const h = stage === 3 ? 20 : stage === 2 ? 11 : 8;
              return <path key={i} d={`M${x - 10} ${y + 8} Q${x} ${y - h} ${x + 10} ${y + 8} Z`} fill={shade(base, -8)} />;
            })}
            <ellipse cx="100" cy="124" rx="50" ry="54" fill={`url(#${gB})`} />
            <ellipse cx="54" cy="132" rx="12" ry="18" fill={`url(#${gB})`} transform="rotate(12 54 132)" />
            <ellipse cx="146" cy="132" rx="12" ry="18" fill={`url(#${gB})`} transform="rotate(-12 146 132)" />
            <ellipse cx="100" cy="138" rx="30" ry="36" fill={`url(#${gC})`} />
            {[126, 140, 154].map((y, i) => <path key={i} d={`M${80 + i} ${y} Q100 ${y + 6} ${120 - i} ${y}`} stroke={shade(base, 22)} strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round" />)}
            <ellipse cx="100" cy="96" rx="44" ry="26" fill={`url(#${gB})`} />
            <path d="M58 96 Q100 112 142 96 Q138 116 100 117 Q62 116 58 96 Z" fill={`url(#${gC})`} />
            <ellipse cx="90" cy="80" rx="2.4" ry="2" fill={ink} opacity="0.7" /><ellipse cx="110" cy="80" rx="2.4" ry="2" fill={ink} opacity="0.7" />
            {mood !== 'sleepy' && <path d="M64 98 Q100 110 136 98" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />}
            <path d="M76 100 l3.5 7 l3.5 -7 Z" fill="#fff" /><path d="M124 100 l-3.5 7 l-3.5 -7 Z" fill="#fff" />
            <ellipse cx="68" cy="92" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" /><ellipse cx="132" cy="92" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" />
            <Eye cx={80} cy={62} /><Eye cx={120} cy={62} />
          </React.Fragment>)}

          {/* ══ MOUSE (cat slot) ══ */}
          {species === 'cat' && (<React.Fragment>
            {/* thin minimalist curly tail */}
            <path d="M128 158 q30 6 34 -12 q-5 12 -22 9" fill="none" stroke={shade(base, -2)} strokeWidth="3.4" strokeLinecap="round" />
            {/* big round mouse ears — sit down on the head */}
            <circle cx="68" cy="72" r="17" fill={`url(#${gB})`} /><circle cx="132" cy="72" r="17" fill={`url(#${gB})`} />
            <circle cx="68" cy="74" r="10" fill="#F4A8C0" opacity="0.85" /><circle cx="132" cy="74" r="10" fill="#F4A8C0" opacity="0.85" />
            {/* feet + body */}
            <ellipse cx="82" cy="174" rx="12" ry="8" fill={shade(base, -18)} /><ellipse cx="118" cy="174" rx="12" ry="8" fill={shade(base, -18)} />
            <ellipse cx="100" cy="128" rx="46" ry="50" fill={`url(#${gB})`} />
            <ellipse cx="56" cy="136" rx="10" ry="15" fill={`url(#${gB})`} transform="rotate(13 56 136)" />
            <ellipse cx="144" cy="136" rx="10" ry="15" fill={`url(#${gB})`} transform="rotate(-13 144 136)" />
            <ellipse cx="100" cy="143" rx="26" ry="29" fill={`url(#${gC})`} />
            {/* small light muzzle */}
            <ellipse cx="100" cy="105" rx="14" ry="10" fill={`url(#${gC})`} />
            {/* face — bigger, closer eyes for extra cute */}
            <ellipse cx="75" cy="99" rx="6.5" ry="4" fill="#FF8FA3" opacity="0.55" /><ellipse cx="125" cy="99" rx="6.5" ry="4" fill="#FF8FA3" opacity="0.55" />
            <Eye cx={86} cy={92} r={15} /><Eye cx={114} cy={92} r={15} />
            {/* tiny pink nose + little buck teeth + whiskers */}
            <ellipse cx="100" cy="104" rx="3.2" ry="2.6" fill="#e8769a" />
            {mood !== 'sleepy' && <path d="M100 106 q-4 3.5 -8 1.5 M100 106 q4 3.5 8 1.5" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />}
            <rect x="97.7" y="108" width="2.3" height="4.2" rx="1" fill="#fff" stroke={shade(base, -28)} strokeWidth="0.5" />
            <rect x="100" y="108" width="2.3" height="4.2" rx="1" fill="#fff" stroke={shade(base, -28)} strokeWidth="0.5" />
            <g stroke={shade(base, -20)} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"><path d="M85 103 L67 100 M85 107 L67 109" /><path d="M115 103 L133 100 M115 107 L133 109" /></g>
          </React.Fragment>)}

          {/* ══ CHICK (bird) — evolves chick → crested rooster ══ */}
          {species === 'bird' && (<React.Fragment>
            {/* stage-3 tail feathers — base anchored deep under the body so they connect */}
            {stage === 3 && (<g>
              {[-18, -2, 14].map((deg, i) => (
                <g key={i} transform={`translate(122,150) rotate(${deg})`}>
                  <path d="M0 9 C26 3 46 -5 60 -20 C50 -2 36 10 9 16 Z" fill={shade(base, -10 - i * 4)} />
                </g>
              ))}
            </g>)}
            {/* head crest — a feather fan that grows fuller each stage */}
            {(stage === 3 ? [-36, -18, 0, 18, 36] : stage === 2 ? [-22, 0, 22] : [-18, 0, 18]).map((deg, i) => (
              <g key={i} transform={`translate(100,80) rotate(${deg}) scale(${stage === 3 ? 1.3 : stage === 2 ? 1.05 : 0.85})`}>
                <path d="M0 4 C-4 -6 -3 -17 0 -25 C3 -17 4 -6 0 4 Z" fill={shade(base, -8)} />
              </g>
            ))}
            {/* legs */}
            <g stroke="#e8a23a" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M89 176 L87 185 M87 185 L81 190 M87 185 L87 191 M87 185 L93 190" />
              <path d="M111 176 L113 185 M113 185 L107 190 M113 185 L113 191 M113 185 L119 190" />
            </g>
            {/* wings + body */}
            <ellipse cx="58" cy="134" rx="12" ry="18" fill={shade(base, -12)} transform="rotate(20 58 134)" />
            <ellipse cx="142" cy="134" rx="12" ry="18" fill={shade(base, -12)} transform="rotate(-20 142 134)" />
            <ellipse cx="100" cy="130" rx="45" ry="50" fill={`url(#${gB})`} />
            <ellipse cx="100" cy="144" rx="28" ry="30" fill={`url(#${gC})`} />
            {/* face */}
            <ellipse cx="71" cy="106" rx="8" ry="5" fill="#FF8FA3" opacity="0.5" /><ellipse cx="129" cy="106" rx="8" ry="5" fill="#FF8FA3" opacity="0.5" />
            <Eye cx={83} cy={96} r={15} /><Eye cx={117} cy={96} r={15} />
            <path d="M100 104 L110 110 L100 117 L90 110 Z" fill="#e8a23a" />
          </React.Fragment>)}

          {/* ══ OWL (owl) ══ */}
          {species === 'owl' && (<React.Fragment>
            {/* soft ear tufts on the head corners (behind body, so they grow from the head) */}
            <path d="M70 82 C63 60 70 48 78 45 C83 55 85 70 87 80 Z" fill={shade(base, -8)} />
            <path d="M130 82 C137 60 130 48 122 45 C117 55 115 70 113 80 Z" fill={shade(base, -8)} />
            {/* talon feet */}
            <g stroke="#e8a23a" strokeWidth="3.2" strokeLinecap="round" fill="none">
              <path d="M88 176 L88 185 M88 185 L82 190 M88 185 L88 191 M88 185 L94 190" />
              <path d="M112 176 L112 185 M112 185 L106 190 M112 185 L112 191 M112 185 L118 190" />
            </g>
            {/* body */}
            <ellipse cx="100" cy="128" rx="47" ry="50" fill={`url(#${gB})`} />
            {/* long wings down the sides */}
            <ellipse cx="59" cy="134" rx="13" ry="26" fill={shade(base, -14)} transform="rotate(8 59 134)" />
            <ellipse cx="141" cy="134" rx="13" ry="26" fill={shade(base, -14)} transform="rotate(-8 141 134)" />
            {/* belly */}
            <ellipse cx="100" cy="150" rx="27" ry="26" fill={`url(#${gC})`} />
            {/* one soft facial disc */}
            <ellipse cx="100" cy="101" rx="33" ry="22" fill={`url(#${gC})`} />
            {/* big owl eyes (slight gap) */}
            <Eye cx={84} cy={99} r={14.5} /><Eye cx={116} cy={99} r={14.5} />
            {/* beak between the eyes */}
            <path d="M100 105 L105 111 L100 118 L95 111 Z" fill="#e8a23a" />
            {/* belly chevrons */}
            {[143, 153].map((y, i) => <path key={i} d={`M91 ${y} L100 ${y + 5} L109 ${y}`} stroke={shade(base, 20)} strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round" />)}
          </React.Fragment>)}

          {/* ══ shared stage gear ══ */}
          {stage >= 2 && (<g>
            <path d={`M74 ${neckY} q26 11 52 0 l0 9 q-26 10 -52 0 Z`} fill={THEME.primary} />
            <path d={`M118 ${neckY + 4} l 10 16 l -8 2 l -6 -13 Z`} fill={THEME.primaryDark} />
            <circle cx="100" cy={neckY + 4} r="5" fill={THEME.gold} stroke="#fff" strokeWidth="1.4" />
          </g>)}
          {stage === 3 && (<g transform={`translate(100,${crownY})`}>
            <path d="M-15 7 L-15 -3 L-7.5 3 L0 -9 L7.5 3 L15 -3 L15 7 Z" fill={THEME.gold} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            <rect x="-15" y="6" width="30" height="4.5" rx="2.2" fill={shade('#d19900', -6)} />
            <circle cx="0" cy="-9" r="2.4" fill="#fff" /><circle cx="-15" cy="-3" r="1.8" fill="#fff" /><circle cx="15" cy="-3" r="1.8" fill="#fff" />
          </g>)}
        </g>
      </svg>
    </div>
  );
}

// Dispatcher: pick the line based on the global style flag (set from Tweaks).
function Mascot(props) {
  const s = window.JX_CHAR_STYLE;
  if (s === 'kr') return <MascotKR {...props} />;
  if (s === 'toon') return <MascotToon {...props} />;
  if (s === 'comic') return <MascotComic {...props} />;
  if (s === 'toy') return <MascotToy {...props} />;
  if (s === 'cute') return <MascotToyCute {...props} />;
  if (s === 'soft') return <MascotSoft {...props} />;
  return <MascotClassic {...props} />;
}

// small chip/avatar version for lists
function MascotChip({ species, stage = 2, color, size = 48, bg }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: bg || THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      <Mascot species={species} stage={stage} color={color} size={size * 0.92} />
    </div>
  );
}

export { Mascot, MascotChip, STYLE_BUDDIES, shade };
