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

// ── Toy line ("3D") — chunky soft-3D critter: big domed eyes, lighter
// segmented belly, little teeth, dorsal scutes, gradient shading for form.
function MascotToy({ species = 'fox', stage = 2, color, size = 160, mood = 'happy', float = false, style }) {
  // A cute croc/gator creature (per reference): huge domed eyes on top, a
  // wide projecting snout with little teeth, dorsal scutes (no mammal ears),
  // lighter segmented belly, soft-3D gradient shading. Recolours per buddy.
  const base = color || '#59c08c';
  const dark = shade(base, -42);
  const ink = '#2b2826';
  const sc = stage === 1 ? 0.9 : stage === 3 ? 1.06 : 1;
  const uid = React.useId().replace(/[:]/g, '');
  const gB = 'tb' + uid, gC = 'tc' + uid;
  const er = mood === 'alert' ? 21 : 19;   // huge domed eyes

  const Eye = ({ cx, cy }) => mood === 'sleepy'
    ? <path d={`M${cx - er * 0.7} ${cy} q${er * 0.7} ${er * 0.5} ${er * 1.4} 0`} stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" />
    : (<g>
        <circle cx={cx} cy={cy} r={er} fill="#fff" stroke={shade(base, -20)} strokeWidth="1.4" />
        <circle cx={cx + (cx < 100 ? 2.5 : -2.5)} cy={cy + er * 0.28} r={er * 0.46} fill={ink} />
        <circle cx={cx + (cx < 100 ? 4.5 : -0.5)} cy={cy + er * 0.05} r={er * 0.2} fill="#fff" />
        <circle cx={cx + (cx < 100 ? -2 : 2)} cy={cy + er * 0.5} r={er * 0.1} fill="#fff" opacity="0.8" />
      </g>);

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
        </defs>

        <ellipse cx="100" cy="187" rx={48 * sc} ry="7.5" fill="#000" opacity="0.08" />
        {stage !== 2 && [[32, 70, 3.2], [170, 82, 2.8], [166, 146, 2.8]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={stage === 3 ? THEME.gold : base} opacity="0.45" />
        ))}

        <g transform={`translate(100,114) scale(${sc}) translate(-100,-114)`}>
          {/* chunky tail — base anchored deep under the body so it connects seamlessly */}
          <path d="M118 150 C156 160 184 146 198 104 C190 130 172 152 146 162 C134 167 124 162 118 150 Z" fill={`url(#${gB})`} />
          {[[156, 130], [172, 120], [184, 112]].map(([x, y], i) => (
            <path key={i} d={`M${x - 7} ${y + 6} Q${x + 1} ${y - 8} ${x + 8} ${y + 4} Z`} fill={dark} opacity="0.45" />
          ))}

          {/* feet with claws */}
          <ellipse cx="80" cy="176" rx="15" ry="9" fill={dark} />
          <ellipse cx="120" cy="176" rx="15" ry="9" fill={dark} />
          {[71, 80, 89, 111, 120, 129].map((x, i) => <line key={i} x1={x} y1="173" x2={x} y2="181" stroke={shade(base, -60)} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />)}

          {/* dorsal scute crest over the head (instead of ears) */}
          {[[80, 52], [100, 47], [120, 52]].map(([x, y], i) => (
            <path key={i} d={`M${x - 11} ${y + 9} Q${x} ${y - 9} ${x + 11} ${y + 9} Z`} fill={shade(base, -8)} />
          ))}

          {/* body — one chunky shaded form */}
          <ellipse cx="100" cy="124" rx="50" ry="54" fill={`url(#${gB})`} />
          {/* stubby arms */}
          <ellipse cx="54" cy="132" rx="12" ry="18" fill={`url(#${gB})`} transform="rotate(12 54 132)" />
          <ellipse cx="146" cy="132" rx="12" ry="18" fill={`url(#${gB})`} transform="rotate(-12 146 132)" />

          {/* lighter segmented belly */}
          <ellipse cx="100" cy="138" rx="30" ry="36" fill={`url(#${gC})`} />
          {[126, 140, 154].map((y, i) => (
            <path key={i} d={`M${80 + i} ${y} Q100 ${y + 6} ${120 - i} ${y}`} stroke={shade(base, 22)} strokeWidth="1.6" fill="none" opacity="0.4" strokeLinecap="round" />
          ))}

          {/* ── wide projecting snout ── */}
          <ellipse cx="100" cy="96" rx="44" ry="26" fill={`url(#${gB})`} />
          {/* lighter lower jaw */}
          <path d="M58 96 Q100 112 142 96 Q138 116 100 117 Q62 116 58 96 Z" fill={`url(#${gC})`} />
          {/* nostrils on top of snout */}
          <ellipse cx="90" cy="80" rx="2.4" ry="2" fill={ink} opacity="0.7" />
          <ellipse cx="110" cy="80" rx="2.4" ry="2" fill={ink} opacity="0.7" />
          {/* wide mouth */}
          {mood !== 'sleepy' && <path d="M64 98 Q100 110 136 98" stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />}
          {/* little teeth */}
          <path d="M76 100 l3.5 7 l3.5 -7 Z" fill="#fff" />
          <path d="M124 100 l-3.5 7 l-3.5 -7 Z" fill="#fff" />

          {/* cheeks + huge domed eyes on top */}
          <ellipse cx="68" cy="92" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" />
          <ellipse cx="132" cy="92" rx="8" ry="5" fill="#FF8FA3" opacity="0.45" />
          <Eye cx={80} cy={62} /><Eye cx={120} cy={62} />

          {/* stage gear — scarf collar + shield badge */}
          {stage >= 2 && (<g>
            <path d="M76 118 q24 10 48 0 l0 8 q-24 9 -48 0 Z" fill={THEME.primary} />
            <path d="M116 122 l 9 15 l -7 2 l -5 -12 Z" fill={THEME.primaryDark} />
          </g>)}
          {stage === 3 && (<g transform="translate(100,142)">
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
  const s = window.JX_CHAR_STYLE;
  if (s === 'kr') return <MascotKR {...props} />;
  if (s === 'toy') return <MascotToy {...props} />;
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

Object.assign(window, { Mascot, MascotClassic, MascotKR, MascotToy, MascotChip, SPECIES, shade });
