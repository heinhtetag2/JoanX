// JoanX — shared primitives. Built on the TripMe design system tokens,
// extended with a kid-facing "game" layer (XP gold, rarity, mascot palettes).
// Exposes globals on window for other Babel scripts.

const THEME = {
  // ── TripMe core (authoritative) ──────────────────────────────────────
  primary: '#5B9EE1', primaryDark: '#3B7DD8', primaryLight: '#EBF3FD',
  danger: '#EF4444', dangerLight: '#FEE2E2',
  success: '#10B981', successLight: '#D1FAE5',
  warning: '#F59E0B', warningLight: '#FEF3C7',
  bg: '#FFFFFF', surface: '#FFFFFF', surface2: '#F7F8FA',
  fg1: '#1E1E2D', fg2: '#7D848D', fg3: '#B8B8C7',
  border: '#F1F1F5', heart: '#FF5A5F',
  // category accents (reused for the game layer)
  beach: '#FF8C66', beachBg: '#FFF0EB',
  mountain: '#5CC9A7', mountainBg: '#E8F8F2',
  camping: '#9D8AEE', campingBg: '#F1EDF9',
  culture: '#5B9EE1', cultureBg: '#EBF3FD',
  food: '#FF6B6B', foodBg: '#FFE8E8',
  shopping: '#F49CBA', shoppingBg: '#FDEEF4',
  svcPurple: '#7C3AED', svcPurpleBg: '#EDE9FE',
  svcGreen: '#059669', svcGreenBg: '#D1FAE5',
  svcAmber: '#D97706', svcAmberBg: '#FEF3C7',
  shadowCard: '0 4px 16px rgba(133,141,173,0.08)',
  shadowButton: '0 4px 12px rgba(133,141,173,0.15)',
  shadowLg: '0 8px 20px rgba(133,141,173,0.10)',
  shadowXl: '0 12px 28px rgba(133,141,173,0.14)',
  shadowPrimary: '0 8px 18px rgba(91,158,225,0.34)',
  shadowDanger: '0 8px 18px rgba(239,68,68,0.34)',

  // ── JoanX game layer ─────────────────────────────────────────────────
  gold: '#F5A623', goldLight: '#FFF3DC',     // points / XP
  joy: '#FF8C66',                            // playful warm accent
  joyBg: '#FFF0EB',
  // rarity
  rCommon: '#94A3B8', rCommonBg: '#F1F5F9',
  rRare: '#5B9EE1',   rRareBg: '#EBF3FD',
  rSpecial: '#9D8AEE', rSpecialBg: '#F1EDF9',
};

// rarity helper
const RARITY = {
  common:  { label: 'Common',  fg: THEME.rCommon,  bg: THEME.rCommonBg },
  rare:    { label: 'Rare',    fg: THEME.rRare,    bg: THEME.rRareBg },
  special: { label: 'Special', fg: THEME.rSpecial, bg: THEME.rSpecialBg },
};

// Lucide icon as React component
function Icon({ name, size = 20, color = '#1E1E2D', stroke = 1.8, fill = 'none', style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', name);
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { 'stroke-width': stroke, fill } });
      const svg = ref.current.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.color = color;
        svg.style.stroke = color;
        svg.style.strokeWidth = stroke;
        svg.style.fill = fill;
      }
    }
  }, [name, size, color, stroke, fill]);
  return <span ref={ref} style={{ display: 'inline-flex', width: size, height: size, alignItems: 'center', justifyContent: 'center', ...style }} />;
}

function Button({ children, variant = 'primary', size = 'md', onClick, fullWidth, style, icon, disabled }) {
  const variants = {
    primary:   { background: THEME.primary, color: '#fff', boxShadow: THEME.shadowPrimary, border: 'none' },
    secondary: { background: THEME.primaryLight, color: THEME.primary, border: 'none' },
    outline:   { background: 'transparent', color: THEME.fg1, border: `1.5px solid ${THEME.border}` },
    danger:    { background: THEME.danger, color: '#fff', boxShadow: THEME.shadowDanger, border: 'none' },
    ghost:     { background: 'transparent', color: THEME.primary, border: 'none' },
    play:      { background: THEME.joy, color: '#fff', boxShadow: '0 8px 18px rgba(255,140,102,0.36)', border: 'none' },
    gold:      { background: THEME.gold, color: '#fff', boxShadow: '0 8px 18px rgba(245,166,35,0.34)', border: 'none' },
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
  const map = {
    default: { bg: THEME.border, fg: THEME.fg2 },
    primary: { bg: THEME.primaryLight, fg: THEME.primary },
    success: { bg: THEME.successLight, fg: THEME.success },
    danger:  { bg: THEME.dangerLight, fg: THEME.danger },
    warning: { bg: THEME.warningLight, fg: '#B45309' },
    gold:    { bg: THEME.goldLight, fg: '#B26A00' },
    special: { bg: THEME.rSpecialBg, fg: THEME.rSpecial },
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

function Input({ label, value, onChange, placeholder, type = 'text', icon, error, trailing }) {
  const [focused, setFocused] = React.useState(false);
  const borderColor = error ? THEME.danger : focused ? THEME.primary : THEME.border;
  const iconColor = error ? THEME.danger : focused ? THEME.primary : THEME.fg3;
  return (
    <div style={{ width: '100%' }}>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 6 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${borderColor}`, borderRadius: 16, padding: '13px 14px' }}>
        {icon && <Icon name={icon} size={18} color={iconColor} stroke={2} />}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: THEME.fg1, fontFamily: 'inherit', padding: 0 }} />
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
      width: 50, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: on ? THEME.primary : THEME.border, position: 'relative', transition: 'background .2s', padding: 0,
    }}>
      <span style={{ position: 'absolute', top: 3, left: on ? 23 : 3, width: 24, height: 24, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
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

Object.assign(window, { THEME, RARITY, Icon, Button, Badge, Card, Input, Bar, Toggle, StatusBar, SectionHead });
