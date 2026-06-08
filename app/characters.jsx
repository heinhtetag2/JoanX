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
  fox:  { name: 'Foxy',  base: '#e1874a', ears: 'pointy', tail: 'bushy',  feature: 'snout' },
  cat:  { name: 'Mochi', base: '#a8c3eb', ears: 'cat',    tail: 'curl',   feature: 'whiskers' },
  bird: { name: 'Pip',   base: '#67c7ce', ears: 'tuft',   tail: 'fan',    feature: 'beak' },
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

  // tightly-clustered, low-centred face — the core Korean-cute cue
  const Eye = ({ cx }) => mood === 'sleepy'
    ? <path d={`M${cx - 5} 96 q5 5 10 0`} stroke={ink} strokeWidth="3.2" fill="none" strokeLinecap="round" />
    : (<g>
        <circle cx={cx} cy="96" r={mood === 'alert' ? 7 : 6} fill={ink} />
        <circle cx={cx + 1.9} cy="93.8" r="1.9" fill="#fff" />
      </g>);

  return (
    <div style={{ width: size, height: size, ...style }} className={float ? 'jx-float' : ''}>
      <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible' }}>
        <ellipse cx="100" cy="185" rx={44 * sc} ry="7.5" fill="#000" opacity="0.07" />
        {stage !== 2 && [[36, 70, 3.2], [166, 80, 2.8], [156, 138, 2.8]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.5" />
        ))}

        <g transform={`translate(100,104) scale(${sc}) translate(-100,-104)`}>
          {/* short tail (kept small — 'short = cuter') */}
          {species === 'fox' && <path d="M138 150 q30 6 26 -22 q-6 16 -22 12 q9 6 -4 10 Z" fill={base} />}
          {species === 'cat' && <path d="M140 150 q28 8 24 -18 q-4 14 -18 10" fill="none" stroke={base} strokeWidth="11" strokeLinecap="round" />}

          {/* little body peeking below the big head */}
          <ellipse cx="100" cy="150" rx="31" ry="24" fill={base} />
          <ellipse cx="86" cy="170" rx="9" ry="6" fill={dark} />
          <ellipse cx="114" cy="170" rx="9" ry="6" fill={dark} />
          <ellipse cx="72" cy="150" rx="7" ry="11" fill={base} transform="rotate(20 72 150)" />
          <ellipse cx="128" cy="150" rx="7" ry="11" fill={base} transform="rotate(-20 128 150)" />

          {/* ears on the big head */}
          {sp.ears === 'pointy' && (<g>
            <path d="M58 60 L46 20 L92 50 Z" fill={base} />
            <path d="M142 60 L154 20 L108 50 Z" fill={base} />
            <path d="M62 54 L55 34 L82 50 Z" fill={ear} />
            <path d="M138 54 L145 34 L118 50 Z" fill={ear} />
          </g>)}
          {sp.ears === 'cat' && (<g>
            <path d="M60 58 L50 26 L92 50 Z" fill={base} />
            <path d="M140 58 L150 26 L108 50 Z" fill={base} />
            <path d="M66 52 L61 36 L84 50 Z" fill="#F4A8C0" opacity="0.85" />
            <path d="M134 52 L139 36 L116 50 Z" fill="#F4A8C0" opacity="0.85" />
          </g>)}
          {sp.ears === 'tuft' && (<g stroke={dark} strokeWidth="5.5" strokeLinecap="round">
            <path d="M100 48 L100 22" /><path d="M100 34 L89 22" /><path d="M100 34 L111 22" />
          </g>)}

          {/* big head — the hero shape */}
          <ellipse cx="100" cy="92" rx="52" ry="48" fill={base} />
          {species === 'bird' && (<g>
            <ellipse cx="55" cy="118" rx="9" ry="14" fill={ear} transform="rotate(22 55 118)" />
            <ellipse cx="145" cy="118" rx="9" ry="14" fill={ear} transform="rotate(-22 145 118)" />
          </g>)}

          {/* cheeks + tight face cluster */}
          <ellipse cx="75" cy="104" rx="8" ry="5" fill="#FF8FA3" opacity="0.5" />
          <ellipse cx="125" cy="104" rx="8" ry="5" fill="#FF8FA3" opacity="0.5" />
          <Eye cx={88} /><Eye cx={112} />
          {species === 'bird'
            ? <path d="M94 101 L106 101 L100 110 Z" fill={THEME.gold} />
            : (<React.Fragment>
                <ellipse cx="100" cy="103" rx="4" ry="3.2" fill={ink} />
                {mood !== 'sleepy' && <path d="M93 108 q7 6 14 0" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
              </React.Fragment>)}
          {sp.feature === 'whiskers' && (<g stroke={dark} strokeWidth="1.8" strokeLinecap="round" opacity="0.45">
            <path d="M70 102 L54 99 M70 107 L54 109" /><path d="M130 102 L146 99 M130 107 L146 109" />
          </g>)}

          {/* stage gear */}
          {stage >= 2 && (<g>
            <path d="M74 142 q26 11 52 0 l0 8 q-26 10 -52 0 Z" fill={THEME.primary} />
            <path d="M118 146 l 10 16 l -8 2 l -5 -13 Z" fill={THEME.primaryDark} />
          </g>)}
          {stage === 3 && (<g transform="translate(100,150)">
            <path d="M0 -9 L8 -5.5 L8 2.5 Q8 10 0 12.5 Q-8 10 -8 2.5 L-8 -5.5 Z" fill={THEME.gold} stroke="#fff" strokeWidth="1.8" />
            <path d="M-3.5 0 l2.6 3.5 l5.4 -7" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>)}
        </g>
      </svg>
    </div>
  );
}

// Dispatcher: pick the line based on the global style flag (set from Tweaks).
function Mascot(props) {
  return (window.JX_CHAR_STYLE === 'kr') ? <MascotKR {...props} /> : <MascotClassic {...props} />;
}

// small chip/avatar version for lists
function MascotChip({ species, stage = 2, color, size = 48, bg }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: bg || THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      <Mascot species={species} stage={stage} color={color} size={size * 0.92} />
    </div>
  );
}

Object.assign(window, { Mascot, MascotClassic, MascotKR, MascotChip, SPECIES, shade });
