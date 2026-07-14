import React from 'react';
import * as LucideIcons from 'lucide-react';

// JoanX — shared primitives. Built on the TripMe design system tokens,
// extended with a kid-facing "game" layer (XP gold, rarity, mascot palettes).

// Repointed onto the new JoanX color system (see app/color-system.css).
// Neutrals → sand · action/accent + primary CTA → ocean (brand blue) · status → rust/evergreen/ember.
const THEME = {
  // ── Core (authoritative) ─────────────────────────────────────────────
  primary: '#447aaf', primaryDark: '#2b5782', primaryLight: '#ecf3fe',   // ocean 50 / 60 / 10
  danger: '#d14532', dangerLight: '#fff1ee',                            // rust 50 / 10
  success: '#4b814f', successLight: '#ebf4eb',                          // evergreen 50 / 10
  warning: '#b16120', warningLight: '#f9f1ed',                          // ember 50 / 10
  bg: '#ffffff', surface: '#ffffff', surface2: '#f8f7f7',               // sand 0 / 0 / 10
  // Shared app-screen background: a soft full-width colour wash pooled at the
  // top — warm peach (ember) → pink (sakura) → lavender (iris) — fading into
  // sand-10 by ~360px. One token drives every screen root.
  screenBg: 'linear-gradient(180deg, rgba(248,247,247,0) 0, #f8f7f7 360px), linear-gradient(120deg, rgba(255,178,203,0.30) 0%, rgba(203,166,247,0.26) 48%, rgba(150,176,255,0.30) 100%), #f8f7f7',
  fg1: '#2b2926', fg2: '#585450', fg3: '#b0adab',                       // sand 80 / 60 / 40
  border: '#ebebea', heart: '#e86f5f',                                  // sand 20 · rust 40
  // category accents (reused for the game layer) → nearest system hues
  beach: '#ce8345', beachBg: '#f9f1ed',          // ember 40 / 10
  mountain: '#5a9ea0', mountainBg: '#ebf4f4',    // tropic 40 / 10
  camping: '#9d84dc', campingBg: '#f5f1fd',      // iris 40 / 10
  culture: '#447aaf', cultureBg: '#ecf3fe',      // ocean 50 / 10
  food: '#e86f5f', foodBg: '#fff1ee',            // rust 40 / 10
  shopping: '#da67cf', shoppingBg: '#fbf0fb',    // sakura 40 / 10
  svcPurple: '#603fab', svcPurpleBg: '#f5f1fd',  // iris 60 / 10
  svcGreen: '#4b814f', svcGreenBg: '#ebf4eb',    // evergreen 50 / 10
  svcAmber: '#b16120', svcAmberBg: '#f9f1ed',    // ember 50 / 10
  // Cards are defined by a crisp hairline border + a whisper of shadow
  // (system uses --color-cards-border-* tokens) — not a big floaty blur.
  shadowCard: '0 0 0 1px var(--color-cards-border-default), 0 1px 2px var(--color-base-alpha-shadow-2)',
  shadowSoft: '0 6px 18px rgba(46,43,41,0.09)',   // borderless soft elevation (no hairline ring)
  shadowButton: '0 4px 12px rgba(46,43,41,0.16)',
  shadowLg: '0 8px 20px rgba(46,43,41,0.12)',
  shadowXl: '0 12px 28px rgba(46,43,41,0.16)',
  shadowPrimary: '0 8px 18px rgba(68,122,175,0.34)',  // ocean glow under the CTA
  shadowDanger: '0 8px 18px rgba(209,69,50,0.34)',   // rust glow

  // ── JoanX product brand — the buddy green ────────────────────────────
  // The green behind the onboarding wash and its CTAs, and the app's accent everywhere the
  // buddy colour isn't already driving it. Distinct from THEME.primary (ocean), which stays
  // the in-game action colour.
  brand: '#4B814F', brandDark: '#365C39', brandLight: '#E9F1E9',

  // ── JoanX game layer ─────────────────────────────────────────────────
  gold: '#d19900', goldLight: '#fff2d1',     // data-yellow 50 / 10 — points / XP
  joy: '#ce8345',                            // playful warm accent (ember 40)
  joyBg: '#f9f1ed',
  // rarity
  rCommon: '#b0adab', rCommonBg: '#f8f7f7',  // sand 40 / 10
  rRare: '#447aaf',   rRareBg: '#ecf3fe',    // ocean 50 / 10
  rEpic: '#7f63c5',   rEpicBg: '#f5f1fd',   // iris 50 / 10
};

// rarity helper
const RARITY = {
  common:  { label: 'Common',  fg: THEME.rCommon,  bg: THEME.rCommonBg },
  rare:    { label: 'Rare',    fg: THEME.rRare,    bg: THEME.rRareBg },
  epic:    { label: 'Epic',    fg: THEME.rEpic,    bg: THEME.rEpicBg },
};

// ── Buddy/brand-tinted screen backgrounds — shared by BOTH apps ──────
// derive harmonious analogous colors from a hex hue (hex → HSL → rotate → rgba)
function _toHsl(hex) {
  let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
  const n = parseInt(c, 16); let r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h, s, l = (mx + mn) / 2;
  if (mx === mn) { h = s = 0; } else { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
  return [h, s, l];
}
function _hsla(h, s, l, alpha) {
  let r, g, b;
  if (s === 0) { r = g = b = l; } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const t = (x) => { if (x < 0) x += 1; if (x > 1) x -= 1; if (x < 1 / 6) return p + (q - p) * 6 * x; if (x < 1 / 2) return q; if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6; return p; };
    r = t(h + 1 / 3); g = t(h); b = t(h - 1 / 3);
  }
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${alpha == null ? 1 : alpha})`;
}
function mixHue(hex, degShift, lShift, alpha) {
  let [h, s, l] = _toHsl(hex); h = (h + degShift / 360 + 1) % 1; l = Math.max(0, Math.min(1, l + (lShift || 0))); s = Math.max(0, Math.min(1, s + 0.04));
  return _hsla(h, s, l, alpha);
}

// ── Neon-brand guard ─────────────────────────────────────────────────
// mixHue's *additive* lightness shift assumes an already-muted input: a comic
// buddy sits at s ≈ .26–.72 / l ≈ .40–.59, so a wash built off it lands soft.
// The JoanX brand magenta does not — at s ≈ .97 the same recipe returns
// fluorescent pink, and mixHue's ±30° sweep runs purple → pink → red, which
// reads as a random mix rather than a palette.
//
// For colours that hot, pastelise instead: cap the saturation, lift to an
// *absolute* (light) lightness, and sweep the hue toward blue — pink →
// lavender → periwinkle, the same family THEME.screenBg already uses. Muted
// buddy colours stay on the original path, untouched.
const NEON = 0.80;                                   // above every comic buddy (max .72)
const isNeon = hex => !!hex && _toHsl(hex)[1] > NEON;
function pastelHue(hex, degShift, l, alpha, sMax = 0.80) {
  const [h, s] = _toHsl(hex);
  return _hsla((h + degShift / 360 + 1) % 1, Math.min(s, sMax), l, alpha);
}

// Build the soft top-of-screen wash, tinted by whatever brand/buddy colour is in
// play (green buddy → green wash, magenta brand → pink wash…). Falls back to the
// static token when no color is given.
function screenBgFor(color) {
  if (!color) return THEME.screenBg;
  const [a, b, c] = isNeon(color)
    ? [pastelHue(color, 4, 0.86, 0.30), pastelHue(color, -48, 0.83, 0.26), pastelHue(color, -98, 0.81, 0.28)]
    : [mixHue(color, -30, 0.13, 0.32), mixHue(color, 2, 0.15, 0.24), mixHue(color, 32, 0.17, 0.30)];
  return `linear-gradient(180deg, rgba(248,247,247,0) 0, ${THEME.surface2} 400px), `
    + `linear-gradient(${isNeon(color) ? 120 : 115}deg, ${a} 0%, ${b} 52%, ${c} 100%), `
    + `${THEME.surface2}`;
}

// Icon — keeps the kebab-case string API (name="chevron-left") but renders via
// lucide-react. Names map to lucide's PascalCase icon components.
const _pascalIcon = n => String(n).split(/[-_]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
// `className` is passed through: callers animate icons by class (the hatch's twinkling
// sparkles are Icons with .jx-twinkle). It used to be dropped on the floor, so every
// animated icon in the app rendered static and nobody noticed.
function Icon({ name, size = 20, color = '#2b2926', stroke = 1.8, fill = 'none', style, className }) {
  const Cmp = LucideIcons[_pascalIcon(name)];
  if (!Cmp) return <span className={className} style={{ display: 'inline-flex', width: size, height: size, ...style }} />;
  return <Cmp size={size} color={color} strokeWidth={stroke} fill={fill} className={className}
    style={{ display: 'inline-flex', flexShrink: 0, ...style }} />;
}

// Pairing QR — a deterministic dot matrix with the three finder squares, so it reads as a
// real QR without a QR library. It lives here, not in a screen, because there is now more
// than one thing to pair: the child linking to a family, and a family inviting its second
// parent. Both must show the SAME object — a lucide qr-code glyph next to this one reads as
// two different products.
function PairQR({ size = 190, color = THEME.fg1 }) {
  const N = 25;
  const finder = (r, c, br, bc) => {
    const rr = r - br, cc = c - bc;
    if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return null;
    const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return ring || core;
  };
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let v = finder(r, c, 0, 0);
      if (v === null) v = finder(r, c, 0, N - 7);
      if (v === null) v = finder(r, c, N - 7, 0);
      if (v === null) {
        const nearFinder = (r <= 7 && c <= 7) || (r <= 7 && c >= N - 8) || (r >= N - 8 && c <= 7);
        if (nearFinder) v = false;
        else { const h = (r * 73856093) ^ (c * 19349663); v = ((h >>> 3) & 3) === 0 || ((h >>> 7) & 7) === 1; }
      }
      if (v) cells.push(<rect key={r + '-' + c} x={c} y={r} width="1.04" height="1.04" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <g fill={color}>{cells}</g>
    </svg>
  );
}

function Button({ children, variant = 'primary', size = 'md', onClick, fullWidth, style, icon, disabled }) {
  const variants = {
    primary:   { background: THEME.primary, color: '#fff', boxShadow: THEME.shadowPrimary, border: 'none' },          // ocean brand CTA
    secondary: { background: THEME.primaryLight, color: THEME.primaryDark, border: 'none' },                          // soft ocean
    outline:   { background: 'transparent', color: THEME.fg1, border: `1.5px solid ${THEME.border}` },
    danger:    { background: THEME.danger, color: '#fff', boxShadow: THEME.shadowDanger, border: 'none' },
    ghost:     { background: 'transparent', color: THEME.primary, border: 'none' },
    play:      { background: THEME.primary, color: '#fff', boxShadow: THEME.shadowPrimary, border: 'none' },          // brand ocean battle CTA
    gold:      { background: THEME.gold, color: '#fff', boxShadow: '0 8px 18px rgba(209,153,0,0.34)', border: 'none' },
  };
  const sizes = {
    sm: { padding: '9px 16px', fontSize: 13, borderRadius: 12 },
    md: { padding: '13px 22px', fontSize: 15, borderRadius: 14 },
    lg: { padding: '17px 28px', fontSize: 17, borderRadius: 20 },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{
      ...variants[variant], ...sizes[size],
      fontWeight: 700, fontFamily: 'inherit', cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: fullWidth ? '100%' : undefined, opacity: disabled ? 0.45 : 1,
      transition: 'transform .12s ease, opacity .12s ease', WebkitTapHighlightColor: 'transparent',
      ...style,
    }}
    onPointerDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.97)'; }}
    onPointerUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    onPointerLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18} color={variants[variant].color} stroke={2.4} />}
      {children}
    </button>
  );
}

function Badge({ children, variant = 'default', style }) {
  // Each variant maps to a system badge palette: {palette}-default (step 20) bg + {palette}-label (step 70) text.
  const bv = p => ({ bg: `var(--color-interactives-badge-${p}-default)`, fg: `var(--color-interactives-badge-${p}-label)` });
  const map = {
    default: bv('sand'),
    primary: bv('ocean'),
    success: bv('evergreen'),
    danger:  bv('rust'),
    warning: bv('ember'),
    epic:    bv('iris'),
    gold:    { bg: THEME.goldLight, fg: '#9e7300' },  // game-layer XP accent (data-yellow, no system badge palette)
  };
  const { bg, fg } = map[variant] || map.default;
  return (
    <span style={{
      background: bg, color: fg, padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 800, letterSpacing: 0.3,
      display: 'inline-flex', alignItems: 'center', gap: 4, ...style,
    }}>{children}</span>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: THEME.surface, borderRadius: 20, padding: 16,
      boxShadow: THEME.shadowCard, cursor: onClick ? 'pointer' : 'default', ...style,
    }}>{children}</div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', icon, error, trailing, accent = THEME.primary }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? THEME.danger : focused ? accent : THEME.border;
  const iconColor = error ? THEME.danger : focused ? accent : THEME.fg3;
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 6 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 16, padding: '13px 14px' }}>
        {icon && <Icon name={icon} size={18} color={iconColor} stroke={2} />}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: THEME.fg1, fontFamily: 'inherit', padding: 0 }} />
        {trailing}
      </div>
      {error && <div style={{ fontSize: 12, color: THEME.danger, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// Progress / XP bar
function Bar({ value = 0, max = 100, color = THEME.primary, track = THEME.border, height = 10, glow }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ width: '100%', height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: 999, transition: 'width .6s cubic-bezier(.4,0,.2,1)', boxShadow: glow ? `0 0 10px ${color}` : 'none' }} />
    </div>
  );
}

// Toggle switch
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? THEME.primary : THEME.border, position: 'relative', transition: 'background .2s', padding: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
    </button>
  );
}

// iOS status bar
function StatusBar({ dark }) {
  const c = dark ? '#fff' : THEME.fg1;
  return (
    <div style={{ height: 50, padding: '0 28px 0 32px', display: 'flex', alignItems: 'flex-end', paddingBottom: 6, justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: c, flexShrink: 0 }}>
      <span style={{ letterSpacing: '-0.3px' }}>9:41</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <Icon name="signal" size={16} color={c} stroke={2.5} />
        <Icon name="wifi" size={16} color={c} stroke={2.5} />
        <Icon name="battery-full" size={22} color={c} stroke={2.2} />
      </span>
    </div>
  );
}

// Section header row with optional action
function SectionHead({ title, action, onAction }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{ fontSize: 19, fontWeight: 800, color: THEME.fg1, margin: 0, letterSpacing: '-0.3px' }}>{title}</h2>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: THEME.primary, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{action}<Icon name="chevron-right" size={14} color={THEME.primary} stroke={2.5} /></button>}
    </div>
  );
}

export { Badge, Bar, Button, Icon, Input, PairQR, RARITY, SectionHead, StatusBar, THEME, Toggle, isNeon, mixHue, pastelHue, screenBgFor };
