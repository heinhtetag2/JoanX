import React from 'react';
import * as LucideIcons from 'lucide-react';
import { getLang } from './i18n.jsx';

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
  shadowCard: '0 0 0 1px var(--color-cards-border-default)',   // flat: hairline ring only, no drop shadow
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

// A profile photo with a graceful fallback. `src` is a static image (e.g. a default placeholder
// dropped in public/assets/avatars/); if it's absent or fails to load, `fallback` is rendered
// instead — the colored initial for a parent, the buddy mascot for a child — so a screen looks
// intentional before (or without) a real photo. Same img+onError idea as the avatar picker's thumb.
function PhotoAvatar({ src, size = 52, radius = 999, fallback = null, style }) {
  const [broken, setBroken] = React.useState(false);
  if (!src || broken) return fallback;
  return (
    <img src={src} alt="" onError={() => setBroken(true)}
      style={{ width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block', flexShrink: 0, ...style }} />
  );
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
    // Flat UI — no drop-shadow/glow on any button (reads as "AI design").
    primary:   { background: THEME.primary, color: '#fff', boxShadow: 'none', border: 'none' },          // ocean brand CTA
    secondary: { background: THEME.primaryLight, color: THEME.primaryDark, border: 'none' },              // soft ocean
    outline:   { background: 'transparent', color: THEME.fg1, border: `1.5px solid ${THEME.border}` },
    danger:    { background: THEME.danger, color: '#fff', boxShadow: 'none', border: 'none' },
    ghost:     { background: 'transparent', color: THEME.primary, border: 'none' },
    play:      { background: THEME.brand, color: '#fff', boxShadow: 'none', border: 'none' },             // brand green battle CTA
    gold:      { background: THEME.gold, color: '#fff', boxShadow: 'none', border: 'none' },
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

// Korean mobile formatter — chunks digits as they're typed: 010-1234-5678 (3-4-4).
// e.g. "12134" → "121-34". Feed an <input onChange> value straight through it.
function formatPhone(v) {
  const d = (v || '').replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

// ── Field family ─────────────────────────────────────────────────────
// KakaoPay-style bordered field with a FLOATING label: the label rests in the middle
// like a placeholder, then rises to a small caption at the top once the field is focused
// or filled. Flat (border only — no shadow). Shared by Input, SelectField and DateField
// so a typed field, a picker and a date all read — and animate — as one family.
function FieldShell({ label, floated, focused, error, accent = THEME.primary, onClick, trailing, children }) {
  const borderColor = error ? THEME.danger : focused ? accent : THEME.border;
  const floatColor = error ? THEME.danger : focused ? accent : THEME.fg3;
  const up = floated || !label;
  const box = { position: 'relative', width: '100%', height: 60, background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 16, transition: 'border-color .15s', padding: 0 };
  const inner = (
    <>
      {label && (
        <span aria-hidden="true" style={{
          position: 'absolute', left: 16, pointerEvents: 'none', zIndex: 1,
          transition: 'top .16s ease, font-size .16s ease, color .16s ease, transform .16s ease',
          ...(up
            ? { top: 11, fontSize: 11.5, fontWeight: 700, color: floatColor, transform: 'none' }
            : { top: '50%', fontSize: 16, fontWeight: 600, color: THEME.fg3, transform: 'translateY(-50%)' }),
        }}>{label}</span>
      )}
      <div style={{ position: 'absolute', left: 16, right: trailing ? 42 : 16, top: 0, bottom: 0 }}>{children}</div>
      {trailing && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>{trailing}</div>}
    </>
  );
  return onClick
    ? <button type="button" onClick={onClick} style={{ ...box, textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', display: 'block' }}>{inner}</button>
    : <div style={box}>{inner}</div>;
}

function Input({ label, value, onChange, placeholder, type = 'text', error, trailing, accent = THEME.primary }) {
  const [focused, setFocused] = React.useState(false);
  const up = focused || (value != null && value !== '');
  return (
    <div style={{ width: '100%' }}>
      <FieldShell label={label} floated={up} focused={focused} error={error} accent={accent} trailing={trailing}>
        <input type={type} value={value} onChange={onChange} placeholder={focused ? placeholder : ''}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: '100%', height: '100%', border: 'none', outline: 'none', background: 'transparent', fontSize: 16, fontWeight: 600, color: THEME.fg1, fontFamily: 'inherit', padding: 0, paddingTop: up && label ? 15 : 0, transition: 'padding-top .16s ease' }} />
      </FieldShell>
      {error && <div style={{ fontSize: 12, color: THEME.danger, marginTop: 5, marginLeft: 4 }}>{error}</div>}
    </div>
  );
}

// Centered modal dialog — for short yes/no confirmations (sign out, delete). A
// dialog is a decision, so it sits in the middle of the screen; BottomSheet is
// for pickers/forms/options that slide up from the edge.
function Modal({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(20,18,16,0.42)' }}>
      <div className="jx-fade" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 330, background: '#fff', borderRadius: 24, padding: '24px 20px 18px', maxHeight: '82%', display: 'flex', flexDirection: 'column' }}>
        {title && <div style={{ fontSize: 18, fontWeight: 800, color: THEME.fg1, textAlign: 'center', marginBottom: 10 }}>{title}</div>}
        <div className="no-sb" style={{ overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// Bottom sheet — the same slide-up + rounded-top surface used across the app, packaged
// so pickers (select, calendar) all present the same way: dim scrim, drag handle, title, X.
function BottomSheet({ title, onClose, children }) {
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(20,18,16,0.42)' }}>
      <div className="jx-sheet-up" onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: '26px 26px 0 0', padding: '10px 20px calc(env(safe-area-inset-bottom) + 20px)', maxHeight: '82%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 12px' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 800, color: THEME.fg1, lineHeight: 1.3 }}>{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ width: 30, height: 30, borderRadius: 999, border: 'none', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
            <Icon name="x" size={17} color={THEME.fg2} stroke={2.4} />
          </button>
        </div>
        <div className="no-sb" style={{ overflowY: 'auto' }}>{children}</div>
      </div>
    </div>
  );
}

// Select — a field that opens a bottom sheet of options. Options: [{value,label}] or plain strings.
function SelectField({ label, value, placeholder, options = [], onChange, accent = THEME.primary, title }) {
  const [open, setOpen] = React.useState(false);
  const norm = options.map(o => (typeof o === 'object' ? o : { value: o, label: o }));
  const selected = norm.find(o => o.value === value);
  const up = open || !!selected;
  return (
    <div style={{ width: '100%' }}>
      <FieldShell label={label} floated={up} focused={open} accent={accent} onClick={() => setOpen(true)}
        trailing={<Icon name="chevron-down" size={18} color={THEME.fg3} stroke={2.3} />}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingTop: up && label ? 15 : 0, transition: 'padding-top .16s ease' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: selected ? THEME.fg1 : THEME.fg3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected ? selected.label : (label ? '' : placeholder)}</span>
        </div>
      </FieldShell>
      {open && (
        <BottomSheet title={title || label} onClose={() => setOpen(false)}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {norm.map((o, i) => {
              const on = o.value === value;
              return (
                <button type="button" key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px 4px', background: 'none', border: 'none', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ flex: 1, fontSize: 15.5, fontWeight: on ? 800 : 600, color: on ? accent : THEME.fg1 }}>{o.label}</span>
                  {on && <Icon name="check" size={19} color={accent} stroke={2.6} />}
                </button>
              );
            })}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

const _MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const _sameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

// Calendar — a single-month grid; brand-accent fill on the picked day, faint ring on today.
function Calendar({ value, onPick, accent = THEME.primary }) {
  const ko = getLang() === 'ko';
  const today = new Date();
  const base = value || today;
  const [view, setView] = React.useState({ y: base.getFullYear(), m: base.getMonth() });
  const step = (d) => setView(v => { const t = v.y * 12 + v.m + d; return { y: Math.floor(t / 12), m: ((t % 12) + 12) % 12 }; });
  const startDow = new Date(view.y, view.m, 1).getDay();
  const daysIn = new Date(view.y, view.m + 1, 0).getDate();
  const weekdays = ko ? ['일', '월', '화', '수', '목', '금', '토'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const monthLabel = ko ? `${view.y}년 ${String(view.m + 1).padStart(2, '0')}월` : `${_MONTHS_EN[view.m]} ${view.y}`;
  const cells = [...Array(startDow).fill(null), ...Array.from({ length: daysIn }, (_, i) => i + 1)];
  const nav = (name, onClick) => (
    <button type="button" onClick={onClick} style={{ width: 30, height: 30, borderRadius: 10, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
      <Icon name={name} size={18} color={THEME.fg2} stroke={2.3} />
    </button>
  );
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px 14px' }}>
        <div style={{ display: 'flex', gap: 2 }}>{nav('chevrons-left', () => step(-12))}{nav('chevron-left', () => step(-1))}</div>
        <div className="game-font" style={{ fontSize: 15.5, fontWeight: 500, color: THEME.fg1 }}>{monthLabel}</div>
        <div style={{ display: 'flex', gap: 2 }}>{nav('chevron-right', () => step(1))}{nav('chevrons-right', () => step(12))}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
        {weekdays.map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: 12, fontWeight: 700, color: THEME.fg3, padding: '2px 0' }}>{w}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', rowGap: 2 }}>
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />;
          const day = new Date(view.y, view.m, d);
          const sel = _sameDay(day, value), isToday = _sameDay(day, today);
          return (
            <button type="button" key={i} onClick={() => onPick(day)}
              style={{ aspectRatio: '1', maxHeight: 42, border: 'none', borderRadius: 999, background: sel ? accent : 'transparent', color: sel ? '#fff' : THEME.fg1, fontFamily: 'inherit', fontSize: 14.5, fontWeight: sel ? 800 : 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: !sel && isToday ? `inset 0 0 0 1.5px ${accent}` : 'none' }}>{d}</button>
          );
        })}
      </div>
    </div>
  );
}

// Date field — a field that opens the calendar in a bottom sheet. `value` is a Date (or null).
function DateField({ label, value, placeholder, onChange, accent = THEME.primary, title }) {
  const [open, setOpen] = React.useState(false);
  const ko = getLang() === 'ko';
  const display = value ? (ko
    ? `${value.getFullYear()}년 ${String(value.getMonth() + 1).padStart(2, '0')}월 ${String(value.getDate()).padStart(2, '0')}일`
    : `${_MONTHS_EN[value.getMonth()].slice(0, 3)} ${value.getDate()}, ${value.getFullYear()}`) : null;
  const up = open || !!display;
  return (
    <div style={{ width: '100%' }}>
      <FieldShell label={label} floated={up} focused={open} accent={accent} onClick={() => setOpen(true)}
        trailing={<Icon name="chevron-down" size={18} color={THEME.fg3} stroke={2.3} />}>
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', paddingTop: up && label ? 15 : 0, transition: 'padding-top .16s ease' }}>
          <span style={{ flex: 1, minWidth: 0, fontSize: 16, fontWeight: 600, color: display ? THEME.fg1 : THEME.fg3 }}>{display || (label ? '' : placeholder)}</span>
        </div>
      </FieldShell>
      {open && (
        <BottomSheet title={title || label} onClose={() => setOpen(false)}>
          <Calendar value={value} accent={accent} onPick={(d) => { onChange(d); setOpen(false); }} />
        </BottomSheet>
      )}
    </div>
  );
}

// Progress / XP bar
function Bar({ value = 0, max = 100, color = THEME.primary, track = THEME.border, height = 10, glow, striped }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  // `striped` lays a diagonal hatch over the fill — two tones of the same colour, so
  // the bar reads as a candy-stripe without a second hue. Same hatch language as the
  // rarity backdrops.
  const fill = striped
    ? { backgroundColor: color, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.30) 0 7px, transparent 7px 15px)' }
    : { background: color };
  return (
    <div style={{ width: '100%', height, background: track, borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: pct + '%', height: '100%', ...fill, borderRadius: 999, transition: 'width .6s cubic-bezier(.4,0,.2,1)', boxShadow: glow ? `0 0 10px ${color}` : 'none' }} />
    </div>
  );
}

// Toggle switch
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width: 40, height: 24, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? THEME.brand : THEME.border, position: 'relative', transition: 'background .2s', padding: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 19 : 3, width: 18, height: 18, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
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
      <h2 style={{ fontSize: 18, fontWeight: 700, color: THEME.fg1, margin: 0, lineHeight: 1.3, letterSpacing: '-0.2px' }}>{title}</h2>
      {action && <button onClick={onAction} style={{ background: 'none', border: 'none', color: THEME.primary, fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{action}<Icon name="chevron-right" size={14} color={THEME.primary} stroke={2.5} /></button>}
    </div>
  );
}

// Scalloped "seal" check — a 12-lobed rounded burst with a hand-drawn tick, from the
// Joanx Figma (node 157:1392). For completed / verified moments where a plain circle-check
// reads too flat. Recolored to the brand: soft-green seal + brand-green tick by default.
function SealCheck({ size = 24, bg = THEME.success, tick = '#fff', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 351 352" fill="none" style={{ display: 'block', flexShrink: 0, ...style }} aria-hidden="true">
      <path d="M151.243 19.2685C165.446 7.986 185.554 7.986 199.757 19.2685L221.53 36.5632C227.221 41.0835 234.061 43.9238 241.28 44.7637L268.913 47.979C286.891 50.0708 301.067 64.2563 303.147 82.2354L306.372 110.107C307.204 117.299 310.021 124.117 314.509 129.798L331.908 151.827C343.101 165.999 343.101 186.001 331.908 200.173L314.509 222.202C310.021 227.883 307.204 234.701 306.372 241.893L303.147 269.765C301.067 287.744 286.891 301.929 268.913 304.021L241.28 307.236C234.061 308.076 227.221 310.917 221.53 315.437L199.757 332.732C185.554 344.014 165.446 344.014 151.243 332.732L129.47 315.437C123.779 310.917 116.939 308.076 109.72 307.236L82.0867 304.021C64.1089 301.929 49.9326 287.744 47.8525 269.765L44.6279 241.893C43.7959 234.701 40.9786 227.883 36.4915 222.202L19.0922 200.173C7.89917 186.001 7.89918 165.999 19.0923 151.827L36.4915 129.798C40.9786 124.117 43.7959 117.299 44.6279 110.107L47.8525 82.2354C49.9326 64.2563 64.1089 50.0708 82.0867 47.979L109.72 44.7637C116.939 43.9238 123.779 41.0835 129.47 36.5632L151.243 19.2685Z" fill={bg} />
      <path d="M130 178L165.121 218.486C165.559 218.992 166.361 218.932 166.72 218.368L221 133" stroke={tick} strokeWidth="21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export { Badge, Bar, BottomSheet, Button, Calendar, DateField, Icon, Input, Modal, PairQR, PhotoAvatar, RARITY, SealCheck, SectionHead, SelectField, StatusBar, THEME, Toggle, formatPhone, isNeon, mixHue, pastelHue, screenBgFor };
