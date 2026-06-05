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
  fox:  { name: 'Foxy',  base: '#FF8C66', ears: 'pointy', tail: 'bushy',  feature: 'snout' },
  cat:  { name: 'Mochi', base: '#9AA7D6', ears: 'cat',    tail: 'curl',   feature: 'whiskers' },
  bird: { name: 'Pip',   base: '#5CC9A7', ears: 'tuft',   tail: 'fan',    feature: 'beak' },
};

function Eyes({ mood, cx1, cx2, cy, r }) {
  if (mood === 'sleepy') {
    return (
      <g stroke="#2B2B3A" strokeWidth="3.5" strokeLinecap="round" fill="none">
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
          <ellipse cx={cx} cy={cy} rx={er} ry={er * 1.15} fill="#2B2B3A" />
          <circle cx={cx + er * 0.32} cy={cy - er * 0.4} r={er * 0.34} fill="#fff" />
          <circle cx={cx - er * 0.3} cy={cy + er * 0.35} r={er * 0.16} fill="#fff" opacity="0.7" />
        </g>
      ))}
    </g>
  );
}

function Mascot({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
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
              : <ellipse cx="100" cy="104" rx="5.5" ry="4" fill="#2B2B3A" />}
            {mood !== 'sleepy' && sp.feature !== 'beak' && (
              mood === 'alert'
                ? <ellipse cx="100" cy="116" rx="5" ry="6" fill="#2B2B3A" />
                : <path d="M92 110 q 8 9 16 0" stroke="#2B2B3A" strokeWidth="3" fill="none" strokeLinecap="round" />
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

// small chip/avatar version for lists
function MascotChip({ species, stage = 2, color, size = 48, bg }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 16, background: bg || THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
      <Mascot species={species} stage={stage} color={color} size={size * 0.92} />
    </div>
  );
}

Object.assign(window, { Mascot, MascotChip, SPECIES, shade });
