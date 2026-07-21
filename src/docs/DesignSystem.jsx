import React from 'react';
import { Badge, Bar, Button, Icon, Input, RARITY, SectionHead, StatusBar, THEME, Toggle, mixHue, screenBgFor } from '../core/primitives.jsx';
import { BRAND, ChoiceGroup, ParentHead, RULE_TAG_COLORS, brandBtn } from '../parent/shared.jsx';
import { CHILD_TABS, PARENT_TABS, TabBar } from '../core/nav.jsx';
import { Mascot, MascotChip, STYLE_BUDDIES } from '../core/characters.jsx';
import { Confetti, DexProgress, PointsChip, RarityPill, ScreenHeader, StatCard } from '../child/shared.jsx';

// JoanX — Design System documentation (developer handoff).
// A full-page, interactive reference: every token (color / type / spacing /
// radius / shadow) and every shared component with live states + usage code.
// Rendered by the shell when the "Design system" topbar segment is active.
// The written spec lives in DESIGN-SYSTEM.md at the repo root.

/* ── tiny helpers ──────────────────────────────────────────────────── */

const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace';

// resolve a CSS custom property to its literal value (ramps are plain hex)
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function useCopy() {
  const [copied, setCopied] = React.useState(null);
  const copy = (text, key) => {
    navigator.clipboard && navigator.clipboard.writeText(text);
    setCopied(key || text);
    setTimeout(() => setCopied(null), 1200);
  };
  return [copied, copy];
}

/* ── doc building blocks ───────────────────────────────────────────── */

function Section({ id, title, lead, children, innerRef }) {
  return (
    <section id={id} ref={innerRef} className="ds-section">
      <h2 className="ds-h2">{title}</h2>
      {lead && <p className="ds-lead">{lead}</p>}
      {children}
    </section>
  );
}

const SubHead = ({ children }) => <div className="ds-subhead">{children}</div>;

function CodeBlock({ code }) {
  const [copied, copy] = useCopy();
  return (
    <div className="ds-code">
      <button className="ds-code-copy" onClick={() => copy(code)}>
        <Icon name={copied ? 'check' : 'copy'} size={13} color={copied ? '#7dd87d' : '#9a9691'} stroke={2.2} />
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre>{code}</pre>
    </div>
  );
}

function PropsTable({ rows }) {
  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          {rows.map(([prop, type, def, desc]) => (
            <tr key={prop}>
              <td><code>{prop}</code></td>
              <td><code className="ds-dim">{type}</code></td>
              <td>{def ? <code className="ds-dim">{def}</code> : <span className="ds-dim">—</span>}</td>
              <td>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Playground shell: live preview on the left, controls on the right.
function Playground({ preview, controls, code }) {
  return (
    <div>
      <div className="ds-playground">
        <div className="ds-preview">{preview}</div>
        <div className="ds-controls">{controls}</div>
      </div>
      {code && <CodeBlock code={code} />}
    </div>
  );
}

function Control({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="ds-ctl-label">{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </div>
  );
}

function Chip({ on, onClick, children }) {
  return <button className={'ds-chip' + (on ? ' on' : '')} onClick={onClick}>{children}</button>;
}

/* ── color swatches ────────────────────────────────────────────────── */

function Swatch({ name, value, code, dark }) {
  const [copied, copy] = useCopy();
  return (
    <button className="ds-swatch" onClick={() => copy(value, name)} title={`Copy ${value}`}>
      <span className="ds-swatch-fill" style={{ background: value }}>
        {copied === name && <span className="ds-swatch-copied" style={{ color: dark ? '#fff' : '#2b2926' }}>Copied!</span>}
      </span>
      <span className="ds-swatch-name">{name}</span>
      <span className="ds-swatch-val">{code || value}</span>
    </button>
  );
}

function Ramp({ palette }) {
  const steps = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  const [copied, copy] = useCopy();
  const cells = steps
    .map(s => ({ step: s, hex: cssVar(`--color-base-${palette}-${s}`) }))
    .filter(c => c.hex);
  if (!cells.length) return null;
  return (
    <div className="ds-ramp">
      <div className="ds-ramp-name">{palette}</div>
      <div className="ds-ramp-cells">
        {cells.map(({ step, hex }) => (
          <button key={step} className="ds-ramp-cell" style={{ background: hex }}
            title={`--color-base-${palette}-${step} · ${hex} — click to copy`}
            onClick={() => copy(hex, palette + step)}>
            <span style={{ color: step >= 50 ? 'rgba(255,255,255,.92)' : 'rgba(43,41,38,.75)' }}>
              {copied === palette + step ? '✓' : step}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── sections ──────────────────────────────────────────────────────── */

function IntroSection() {
  return (
    <div>
      <div className="ds-callout">
        JoanX is <b>two apps in one prototype</b> — a kid-facing game (child app) and a calm guardian
        dashboard (parent app). They share one token system but lead with <b>two different accents</b>:
        <span className="ds-pill" style={{ background: THEME.primaryLight, color: THEME.primaryDark }}>Child · ocean {THEME.primary}</span>
        <span className="ds-pill" style={{ background: BRAND.primaryLight, color: BRAND.primaryDark }}>Parent · green {BRAND.primary}</span>
      </div>
      <SubHead>Layers</SubHead>
      <p className="ds-p">
        Tokens cascade in three CSS layers loaded by <code>src/main.jsx</code>, then JS mirrors the useful
        subset as the <code>THEME</code> object so components can style inline:
      </p>
      <ol className="ds-p" style={{ paddingLeft: 20, lineHeight: 1.9 }}>
        <li><code>src/styles/color-system.css</code> — the full base system: 10 color ramps + semantic tokens (badges, chips, fields, avatars…)</li>
        <li><code>src/styles/tripme-tokens.css</code> — role aliases (<code>--primary</code>, <code>--fg1</code>…), spacing, radius, shadows, type scale</li>
        <li><code>src/styles/joanx.css</code> — fonts (Pretendard + Fredoka/Jua) and the motion classes (<code>jx-*</code>)</li>
        <li><code>src/core/primitives.jsx</code> — <code>THEME</code> palette + Button, Badge, Input, Bar, Toggle, Icon…</li>
      </ol>
      <SubHead>Token tiers — the naming standard</SubHead>
      <p className="ds-p">
        Every value flows through three tiers, and a token's name tells you which one it is.
        The golden rule: <b>product code only consumes the semantic or component tier</b> — never a
        raw <code>--color-base-*</code> primitive. Primitives are the paint; semantics are what the
        paint is <i>for</i>.
      </p>
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead><tr><th>Tier</th><th>Naming pattern</th><th>Example</th><th>Lives in · consume?</th></tr></thead>
          <tbody>
            <tr>
              <td><b>Primitive</b><div className="ds-dim">raw palette step</div></td>
              <td><code>--color-base-{'{palette}'}-{'{step}'}</code></td>
              <td><code className="ds-dim">--color-base-ocean-50</code></td>
              <td><code>color-system.css</code> · <b>never</b> in product code</td>
            </tr>
            <tr>
              <td><b>Semantic</b><div className="ds-dim">role / component alias</div></td>
              <td><code>--primary</code>, <code>--fg1</code>, <code>--space-md</code>,<br /><code>--color-{'{layer}'}-{'{component}'}-{'{variant}'}-{'{state}'}</code></td>
              <td><code className="ds-dim">--color-cards-border-default</code></td>
              <td><code>tripme-tokens.css</code> · yes — in CSS</td>
            </tr>
            <tr>
              <td><b>Component</b><div className="ds-dim">JS mirror of the semantics</div></td>
              <td><code>THEME.*</code> (both apps), <code>BRAND.*</code> (parent)</td>
              <td><code className="ds-dim">THEME.primary</code></td>
              <td><code>primitives.jsx</code> / <code>shared.jsx</code> · yes — inline in JSX</td>
            </tr>
          </tbody>
        </table>
      </div>
      <SubHead>Import cheat-sheet</SubHead>
      <CodeBlock code={`import { THEME, Icon, Button, Badge, Input, Bar, Toggle, SectionHead, StatusBar,
         RARITY, mixHue, screenBgFor } from '../core/primitives.jsx';             // both apps
import { BRAND, brandBtn, ParentHead, ChoiceGroup, RULE_TAG_COLORS } from '../parent/shared.jsx';   // parent app only
import { ScreenHeader, StatCard, DexProgress, RarityPill, PointsChip, Confetti,
         screenBgActive } from '../child/shared.jsx';                             // child app only
import { TabBar, CHILD_TABS, PARENT_TABS } from '../core/nav.jsx';
import { Mascot, MascotChip, STYLE_BUDDIES, shade } from '../core/characters.jsx';
import { L, setLang, getLang } from '../core/i18n.jsx';`} />
    </div>
  );
}

function ColorsSection() {
  const core = [
    ['primary', THEME.primary, 'ocean-50 · CTA, links, active'],
    ['primaryDark', THEME.primaryDark, 'ocean-60 · pressed, dark text on tint'],
    ['primaryLight', THEME.primaryLight, 'ocean-10 · tint bg, secondary button'],
    ['success', THEME.success, 'evergreen-50 · safe / positive'],
    ['successLight', THEME.successLight, 'evergreen-10'],
    ['danger', THEME.danger, 'rust-50 · destructive, alerts'],
    ['dangerLight', THEME.dangerLight, 'rust-10'],
    ['warning', THEME.warning, 'ember-50 · caution'],
    ['warningLight', THEME.warningLight, 'ember-10'],
    ['gold', THEME.gold, 'data-yellow-50 · points / XP'],
    ['goldLight', THEME.goldLight, 'XP tint'],
    ['heart', THEME.heart, 'rust-40 · likes / hearts'],
  ];
  const text = [
    ['fg1', THEME.fg1, 'sand-80 · primary ink'],
    ['fg2', THEME.fg2, 'sand-60 · secondary'],
    ['fg3', THEME.fg3, 'sand-40 · captions, placeholders'],
    ['border', THEME.border, 'sand-20 · hairlines'],
    ['surface2', THEME.surface2, 'sand-10 · chips, wells'],
    ['surface', THEME.surface, 'sand-0 · cards'],
  ];
  const brand = [
    ['BRAND.primary', BRAND.primary, 'brand green · parent CTA'],
    ['BRAND.primaryDark', BRAND.primaryDark, 'pressed'],
    ['BRAND.primaryLight', BRAND.primaryLight, 'tint · badges, chips'],
    ['BRAND.ink', BRAND.ink, 'softened black · active/focus'],
  ];
  return (
    <div>
      <SubHead>Child app — <code>THEME</code> (src/core/primitives.jsx)</SubHead>
      <div className="ds-swatch-grid">{core.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} />)}</div>
      <SubHead>Ink & surfaces (sand ramp)</SubHead>
      <div className="ds-swatch-grid">{text.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} />)}</div>
      <SubHead>Parent app — <code>BRAND</code> (src/parent/shared.jsx)</SubHead>
      <div className="ds-swatch-grid">{brand.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} dark />)}</div>

      <SubHead>Screen background wash — <code>THEME.screenBg</code></SubHead>
      <p className="ds-p">
        The static fallback wash: warm peach → pink → lavender pooled at the top, fading into sand-10 by ~400px.
        <b> Both apps</b> now derive this wash from whatever accent is in play via
        <code> screenBgFor(color)</code> (core/primitives) — the child app tints by the active buddy, the parent
        onboarding by <code>BRAND.primary</code>. See the <b>Child kit</b> section for the live version.
      </p>
      <div style={{ height: 130, borderRadius: 16, border: `1px solid ${THEME.border}`, background: THEME.screenBg }} />

      <SubHead>Rarity (game layer) — <code>RARITY</code></SubHead>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {Object.entries(RARITY).map(([k, r]) => (
          <span key={k} className="ds-pill" style={{ background: r.bg, color: r.fg, margin: 0 }}>{r.label} · {r.fg}</span>
        ))}
      </div>

      <SubHead>Base ramps — <code>--color-base-{'{palette}'}-{'{step}'}</code> (click any cell to copy)</SubHead>
      {['sand', 'ocean', 'rust', 'evergreen', 'ember', 'iris', 'sakura', 'tropic', 'pebble', 'moss'].map(p => <Ramp key={p} palette={p} />)}
      <p className="ds-p ds-dim" style={{ marginTop: 10 }}>
        Rule of thumb: step 10 = tint background · 20 = badge bg / hairline · 40–50 = accent / fill · 60 = pressed · 70+ = label text on tint.
      </p>
    </div>
  );
}

function TypographySection() {
  const scale = [
    ['t-display', '28 / 800 / 1.15', '-0.5px', 'Hero numbers, onboarding titles'],
    ['t-h1', '24 / 700 / 1.25', '-0.3px', 'Screen titles (ParentHead)'],
    ['t-h2', '20 / 700 / 1.3', '0', 'Section titles (SectionHead ≈ 19/800)'],
    ['t-h3', '17 / 600 / 1.35', '0', 'Card titles'],
    ['t-h4', '15 / 600 / 1.4', '0', 'Emphasized body'],
    ['t-body', '15 / 400 / 1.45', '0', 'Body copy'],
    ['t-body-sm', '13 / 400 / 1.4', '0', 'Secondary copy (fg2)'],
    ['t-label', '12 / 500', '0.1px', 'Form labels, meta (fg2)'],
    ['t-label-sm', '11 / 500', '0.1px', 'Tiny meta (fg3)'],
    ['t-caption', '10 / 400', '0', 'Captions (fg3)'],
  ];
  return (
    <div>
      <p className="ds-p">
        <b>Pretendard</b> leads the stack (the de-facto Korean UI font; clean Latin too), followed by OS system
        fonts. The kid game layer swaps display text to <b>Fredoka</b> (Latin) / <b>Jua</b> (Korean) via the
        <code> .game-font</code> class.
      </p>
      <CodeBlock code={`--font-sans: "Pretendard", -apple-system, "SF Pro Text", "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
.game-font { font-family: 'Fredoka', 'Jua', var(--font-sans); }`} />
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead><tr><th>Class</th><th>Size / weight / line</th><th>Tracking</th><th>Use</th><th>Sample</th></tr></thead>
          <tbody>
            {scale.map(([cls, spec, ls, use]) => (
              <tr key={cls}>
                <td><code>.{cls}</code></td><td className="ds-dim">{spec}</td><td className="ds-dim">{ls}</td><td>{use}</td>
                <td><span className={cls} style={{ whiteSpace: 'nowrap' }}>안전한 하루 Ag 123</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SubHead>Game display font</SubHead>
      <div className="ds-tile" style={{ padding: '18px 22px' }}>
        <div className="game-font" style={{ fontSize: 26, color: THEME.fg1 }}>모험을 떠나자! Let's go on an adventure!</div>
        <div className="ds-dim" style={{ fontSize: 12, marginTop: 6 }}>.game-font — kid-app headers only; parent app always uses Pretendard.</div>
      </div>
    </div>
  );
}

function SpacingSection() {
  const tokens = [['--space-xs', 4], ['--space-sm', 8], ['--space-md', 16], ['--space-lg', 24], ['--space-xl', 32], ['--space-xxl', 40]];
  return (
    <div>
      <p className="ds-p">A 4-px base grid. Screen gutters are typically <code>18px</code>; cards pad <code>16px</code>; lists gap <code>10–12px</code>.</p>
      {tokens.map(([t, v]) => (
        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <code style={{ width: 120, fontSize: 12.5 }}>{t}</code>
          <span className="ds-dim" style={{ width: 40, fontSize: 12.5 }}>{v}px</span>
          <div style={{ width: v * 6, height: 14, borderRadius: 4, background: THEME.primaryLight, border: `1px solid ${THEME.primary}` }} />
        </div>
      ))}
    </div>
  );
}

function RadiusSection() {
  const tokens = [['--r-xs', 6, 'tags'], ['--r-sm', 8, 'small chips'], ['--r-md', 12, 'buttons sm'], ['--r-lg', 16, 'inputs, buttons md'], ['--r-xl', 20, 'cards, buttons lg'], ['--r-xxl', 28, 'sheets'], ['--r-xxxl', 36, 'hero panels'], ['--r-full', '999', 'pills, toggles, avatars']];
  return (
    <div>
      <p className="ds-p">Friendly and round: cards sit at <b>20px</b>, inputs at <b>16px</b>, anything pill-shaped uses <code>--r-full</code>. The iPhone frame itself: bezel 56 / screen 46.</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {tokens.map(([t, v, use]) => (
          <div key={t} style={{ textAlign: 'center' }}>
            <div style={{ width: 86, height: 86, borderRadius: Number(v), background: '#fff', border: `1.5px solid ${THEME.border}`, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: THEME.fg2 }}>{v}</div>
            <div style={{ fontSize: 11.5, marginTop: 6, fontWeight: 700, color: THEME.fg1 }}>{t.replace('--r-', '')}</div>
            <div className="ds-dim" style={{ fontSize: 10.5 }}>{use}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShadowsSection() {
  const tokens = [
    ['shadowCard', THEME.shadowCard, 'THE card style: 1px hairline ring + whisper of shadow'],
    ['shadowSoft', THEME.shadowSoft, 'borderless soft elevation (no ring)'],
    ['shadowButton', THEME.shadowButton, 'raised buttons'],
    ['shadowLg', THEME.shadowLg, 'popovers'],
    ['shadowXl', THEME.shadowXl, 'modals / sheets'],
    ['shadowPrimary', THEME.shadowPrimary, 'ocean glow under CTAs'],
    ['shadowDanger', THEME.shadowDanger, 'rust glow (SOS)'],
  ];
  return (
    <div>
      <p className="ds-p">All shadows are tinted with warm sand-80 <code>#2b2926</code>, never pure black. Cards are defined by a crisp hairline + tiny shadow — <b>not</b> a big floaty blur.</p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {tokens.map(([n, v, use]) => (
          <div key={n} style={{ textAlign: 'center', width: 150 }}>
            <div style={{ height: 82, borderRadius: 20, background: '#fff', boxShadow: v, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{n}</div>
            <div className="ds-dim" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.45 }}>{use}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IconsSection() {
  const [size, setSize] = React.useState(22);
  const [stroke, setStroke] = React.useState(2);
  const [copied, copy] = useCopy();
  const names = ['house', 'layout-grid', 'swords', 'shield-check', 'user', 'users', 'bar-chart-3', 'settings', 'chevron-left', 'chevron-right', 'plus', 'x', 'check', 'bell', 'heart', 'star', 'sparkles', 'trophy', 'gift', 'zap', 'map-pin', 'clock', 'calendar', 'camera', 'qr-code', 'wifi', 'wifi-off', 'battery-full', 'smartphone', 'footprints', 'coins', 'lock', 'alert-triangle', 'info', 'search', 'sliders-horizontal', 'moon', 'sun', 'flame', 'crown'];
  return (
    <div>
      <p className="ds-p">
        Icons come from <b>lucide-react</b> via the <code>Icon</code> wrapper, which keeps a kebab-case string API
        (<code>name="chevron-left"</code> → <code>ChevronLeft</code>). Unknown names render an empty spacer, never crash.
      </p>
      <PropsTable rows={[
        ['name', 'string (kebab-case)', null, 'Any lucide icon name'],
        ['size', 'number', '20', 'Square px size'],
        ['color', 'string', '#2b2926', 'Stroke color'],
        ['stroke', 'number', '1.8', 'strokeWidth — 2.2–2.5 for emphasis/active'],
        ['fill', 'string', "'none'", 'Fill (e.g. hearts, stars)'],
      ]} />
      <Playground
        preview={
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 6, width: '100%' }}>
            {names.map(n => (
              <button key={n} className="ds-icon-cell" onClick={() => copy(`<Icon name="${n}" />`, n)} title={n}>
                <Icon name={n} size={size} color={THEME.fg1} stroke={stroke} />
                <span>{copied === n ? '✓ copied' : n}</span>
              </button>
            ))}
          </div>
        }
        controls={
          <div>
            <Control label={`Size — ${size}px`}>
              <input type="range" min={14} max={40} value={size} onChange={e => setSize(+e.target.value)} style={{ width: '100%' }} />
            </Control>
            <Control label={`Stroke — ${stroke}`}>
              <input type="range" min={1.2} max={3} step={0.1} value={stroke} onChange={e => setStroke(+e.target.value)} style={{ width: '100%' }} />
            </Control>
            <div className="ds-dim" style={{ fontSize: 12 }}>Click an icon to copy its JSX.</div>
          </div>
        }
        code={`<Icon name="shield-check" size={${size}} color={THEME.fg1} stroke={${stroke}} />`}
      />
    </div>
  );
}

function ButtonsSection() {
  const [variant, setVariant] = React.useState('primary');
  const [size, setSize] = React.useState('md');
  const [disabled, setDisabled] = React.useState(false);
  const [withIcon, setWithIcon] = React.useState(true);
  const [fullWidth, setFullWidth] = React.useState(false);
  const [flat, setFlat] = React.useState(true);
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'play', 'gold'];
  const code = `<Button variant="${variant}" size="${size}"${withIcon ? ' icon="shield-check"' : ''}${disabled ? ' disabled' : ''}${fullWidth ? ' fullWidth' : ''}${flat ? ` style={{ boxShadow: 'none' }}   // child-app CTA convention: flat` : ''} onClick={…}>\n  Keep me safe\n</Button>`;
  return (
    <div>
      <p className="ds-p">
        One <code>Button</code> primitive, 7 variants. <b>primary</b> is the ocean brand CTA (parent app overrides the
        fill with <code>brandBtn</code> green). Press feedback is a built-in <code>scale(0.97)</code>; disabled drops
        opacity to 0.45 and removes the handler.
      </p>
      <div className="ds-callout">
        <b>Shadow convention (current):</b> the <b>child app renders CTAs flat</b> — pass
        <code> style={'{{ boxShadow: \'none\' }}'}</code> on filled buttons (see CharacterDetail, Onboarding). The
        primitive still ships its glow as the default, and the <b>parent app keeps it</b> via <code>brandBtn</code>.
        Toggle <b>flat</b> in the playground to compare.
      </div>
      <Playground
        preview={<Button variant={variant} size={size} disabled={disabled} fullWidth={fullWidth} icon={withIcon ? 'shield-check' : undefined} style={flat ? { boxShadow: 'none' } : undefined} onClick={() => {}}>Keep me safe</Button>}
        controls={
          <div>
            <Control label="variant">{variants.map(v => <Chip key={v} on={variant === v} onClick={() => setVariant(v)}>{v}</Chip>)}</Control>
            <Control label="size">{['sm', 'md', 'lg'].map(s => <Chip key={s} on={size === s} onClick={() => setSize(s)}>{s}</Chip>)}</Control>
            <Control label="states">
              <Chip on={withIcon} onClick={() => setWithIcon(v => !v)}>icon</Chip>
              <Chip on={disabled} onClick={() => setDisabled(v => !v)}>disabled</Chip>
              <Chip on={fullWidth} onClick={() => setFullWidth(v => !v)}>fullWidth</Chip>
              <Chip on={flat} onClick={() => setFlat(v => !v)}>flat (child)</Chip>
            </Control>
          </div>
        }
        code={code}
      />
      <SubHead>All variants at a glance</SubHead>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {variants.map(v => <Button key={v} variant={v} size="sm">{v}</Button>)}
      </div>
      <SubHead>Size spec</SubHead>
      <PropsTable rows={[
        ['sm', 'padding 9×16 · font 13 · radius 12', null, 'inline actions, chips-with-intent'],
        ['md', 'padding 13×22 · font 15 · radius 14', 'default', 'most CTAs'],
        ['lg', 'padding 17×28 · font 17 · radius 20', null, 'full-width bottom CTAs'],
      ]} />
      <SubHead>Parent-app CTA override</SubHead>
      <CodeBlock code={`import { BRAND, brandBtn } from '../parent/shared.jsx';
<Button variant="primary" fullWidth style={brandBtn}>Continue</Button>  // green fill + brand glow`} />
      <div style={{ marginTop: 10 }}>
        <Button variant="primary" style={{ background: BRAND.primary, boxShadow: `0 8px 20px ${BRAND.shadow}` }}>Parent CTA</Button>
      </div>
    </div>
  );
}

function BadgesSection() {
  const variants = ['default', 'primary', 'success', 'danger', 'warning', 'epic', 'gold'];
  return (
    <div>
      <p className="ds-p">
        <code>Badge</code> maps each variant to a system badge palette — step-20 background with step-70 label text —
        so contrast is guaranteed. <b>gold</b> is the game-layer XP accent.
      </p>
      <div className="ds-tile" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', padding: 18 }}>
        {variants.map(v => <Badge key={v} variant={v}>{v}</Badge>)}
        <Badge variant="gold"><Icon name="coins" size={12} color="#9e7300" stroke={2.4} />120 P</Badge>
        <Badge variant="success"><Icon name="shield-check" size={12} color="var(--color-interactives-badge-evergreen-label)" stroke={2.4} />5일 안전</Badge>
      </div>
      <PropsTable rows={[
        ['variant', "'default' | 'primary' | 'success' | 'danger' | 'warning' | 'epic' | 'gold'", "'default'", 'sand / ocean / evergreen / rust / ember / iris / XP-gold'],
        ['children', 'node', null, 'Text; pair with a 12px Icon for status badges'],
      ]} />
      <SubHead>Rarity chips (game layer)</SubHead>
      <div style={{ display: 'flex', gap: 8 }}>
        {Object.entries(RARITY).map(([k, r]) => (
          <span key={k} style={{ background: r.bg, color: r.fg, padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800 }}>{r.label}</span>
        ))}
      </div>
    </div>
  );
}

function InputsSection() {
  const [value, setValue] = React.useState('Mina');
  const [error, setError] = React.useState(false);
  const [withIcon, setWithIcon] = React.useState(true);
  const [accent, setAccent] = React.useState('ocean');
  const accentColor = accent === 'ocean' ? THEME.primary : BRAND.ink;
  return (
    <div>
      <p className="ds-p">
        <code>Input</code> owns its focus ring: border animates <code>border → accent</code> on focus,
        <code> danger</code> on error (with a 12px message below). The parent app passes <code>accent=BRAND.ink</code>.
      </p>
      <Playground
        preview={
          <div style={{ width: '100%', maxWidth: 340 }}>
            <Input label="Child name" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. Mina"
              icon={withIcon ? 'user' : undefined} accent={accentColor}
              error={error ? 'That name is already taken' : undefined} />
          </div>
        }
        controls={
          <div>
            <Control label="states">
              <Chip on={withIcon} onClick={() => setWithIcon(v => !v)}>icon</Chip>
              <Chip on={error} onClick={() => setError(v => !v)}>error</Chip>
            </Control>
            <Control label="accent (focus color — click into the field)">
              <Chip on={accent === 'ocean'} onClick={() => setAccent('ocean')}>THEME.primary</Chip>
              <Chip on={accent === 'ink'} onClick={() => setAccent('ink')}>BRAND.ink</Chip>
            </Control>
          </div>
        }
        code={`<Input label="Child name" icon="user" value={name} onChange={e => setName(e.target.value)}${error ? `\n  error="That name is already taken"` : ''}${accent === 'ink' ? '\n  accent={BRAND.ink}   // parent app' : ''} />`}
      />
      <PropsTable rows={[
        ['label', 'string', null, '12px/700 label above the field'],
        ['value / onChange', 'controlled pair', null, 'standard React input contract'],
        ['icon', 'string', null, 'leading 18px Icon; tints with focus/error state'],
        ['error', 'string', null, 'truthy = rust border + message below'],
        ['trailing', 'node', null, 'right slot (e.g. visibility toggle)'],
        ['accent', 'color', 'THEME.primary', 'focus border/icon color'],
        ['type', 'string', "'text'", 'native input type'],
      ]} />
    </div>
  );
}

function ControlsSection() {
  const [on, setOn] = React.useState(true);
  const [pct, setPct] = React.useState(64);
  const [glow, setGlow] = React.useState(false);
  const [barColor, setBarColor] = React.useState('primary');
  const [choice, setChoice] = React.useState('f');
  const colors = { primary: THEME.primary, gold: THEME.gold, success: THEME.success, danger: THEME.danger };
  return (
    <div>
      <SubHead>Toggle</SubHead>
      <div className="ds-tile" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18 }}>
        <Toggle on={on} onChange={setOn} />
        <code style={{ fontSize: 12.5 }}>{`<Toggle on={${on}} onChange={setOn} />`}</code>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>44×26 pill · knob 20px · fill animates border → primary in .2s. Used across parent Settings.</p>

      <SubHead>Bar — progress / XP</SubHead>
      <Playground
        preview={
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bar value={pct} max={100} color={colors[barColor]} glow={glow} />
            <Bar value={pct} max={100} color={colors[barColor]} glow={glow} height={16} />
          </div>
        }
        controls={
          <div>
            <Control label={`value — ${pct}/100`}>
              <input type="range" min={0} max={100} value={pct} onChange={e => setPct(+e.target.value)} style={{ width: '100%' }} />
            </Control>
            <Control label="color">{Object.keys(colors).map(c => <Chip key={c} on={barColor === c} onClick={() => setBarColor(c)}>{c}</Chip>)}</Control>
            <Control label="fx"><Chip on={glow} onClick={() => setGlow(v => !v)}>glow</Chip></Control>
          </div>
        }
        code={`<Bar value={${pct}} max={100} color={THEME.${barColor}}${glow ? ' glow' : ''} />   // width animates .6s`}
      />

      <SubHead>ChoiceGroup — parent-app radio row</SubHead>
      <div className="ds-tile" style={{ padding: 18 }}>
        <ChoiceGroup label="Who is this device for?" value={choice} setter={setChoice}
          opts={[['f', 'My child'], ['m', 'Myself'], ['o', 'Someone else']]} />
      </div>
      <CodeBlock code={`import { ChoiceGroup } from '../parent/shared.jsx';
<ChoiceGroup label="Who is this device for?" value={v} setter={setV}
  opts={[['f','My child'], ['m','Myself'], ['o','Someone else']]} />  // labels run through L()`} />
    </div>
  );
}

function CardsSection() {
  return (
    <div>
      <p className="ds-p">
        Cards are white, radius <b>20</b>, padding <b>16</b>, defined by <code>THEME.shadowCard</code> — a crisp
        1px hairline ring plus a whisper of shadow. Use <code>shadowSoft</code> only for borderless floating elements.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[['shadowCard', THEME.shadowCard, 'default card'], ['shadowSoft', THEME.shadowSoft, 'floating / borderless']].map(([n, v, use]) => (
          <div key={n} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: v, width: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MascotChip species="fox" color="#4b814f" size={44} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: THEME.fg1 }}>Hammy</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{use}</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}><Bar value={62} /></div>
            <code style={{ fontSize: 11, color: THEME.fg3, display: 'block', marginTop: 10 }}>THEME.{n}</code>
          </div>
        ))}
      </div>
      <CodeBlock code={`// canonical card (Card in primitives.jsx uses exactly this)
<div style={{ background: THEME.surface, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard }}>…</div>`} />
      <SubHead>SectionHead — list section header</SubHead>
      <div className="ds-tile" style={{ padding: 18 }}>
        <SectionHead title="내 컬렉션" action="View all" onAction={() => {}} />
        <div className="ds-dim" style={{ fontSize: 13 }}>19px/800 title · optional ocean action link with chevron.</div>
      </div>
    </div>
  );
}

function ChildKitSection() {
  const buddies = STYLE_BUDDIES.comic;
  const [washColor, setWashColor] = React.useState(buddies[0][2]);
  const [confettiKey, setConfettiKey] = React.useState(0);
  return (
    <div>
      <p className="ds-p">
        The child app's shared building blocks live in <code>src/child/shared.jsx</code> (screens are one file
        each; the shared pieces sit here). Everything below is live.
      </p>

      <SubHead>screenBgFor(color) — accent-tinted screen wash</SubHead>
      <p className="ds-p">
        Screens no longer use the static <code>THEME.screenBg</code> directly — <code>screenBgFor(color)</code>
        derives the top wash from whatever hue is in play (green buddy → green wash, ember buddy → warm wash) via
        <code> mixHue</code> rotations. Both live in <b>core/primitives.jsx</b> and serve <b>both apps</b>;
        the child-only <code>screenBgActive()</code> (child/shared.jsx) reads the active buddy for you. Passing no
        color falls back to the static token.
      </p>
      <div style={{ height: 120, borderRadius: 16, border: `1px solid ${THEME.border}`, background: screenBgFor(washColor), marginBottom: 10 }} />
      <Control label="buddy color">
        {buddies.map(([sp, name, c]) => (
          <button key={sp} className={'ds-sw' + (washColor === c ? ' on' : '')} style={{ background: c }} title={`${name} ${c}`} onClick={() => setWashColor(c)} />
        ))}
      </Control>
      <CodeBlock code={`import { screenBgFor } from '../core/primitives.jsx';   // both apps
import { screenBgActive } from './shared.jsx';           // child: reads the active buddy
<div style={{ background: screenBgFor('${washColor}') }}>…</div>   // or screenBgActive()`} />

      <SubHead>ScreenHeader — sub-screen top bar</SubHead>
      <div style={{ position: 'relative', height: 118, borderRadius: 16, border: `1px solid ${THEME.border}`, background: screenBgFor(washColor), overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ position: 'absolute', inset: 0, top: -20 }}>
          <ScreenHeader title="캐릭터 도감" onBack={() => {}} right={<PointsChip pts={1240} />} />
        </div>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Absolute-positioned under the status bar (top 50): round white back button (38px, <code>shadowCard</code>),
        centered 16/800 title, <code>right</code> slot. Props: <code>title, onBack, right</code>.
      </p>

      <SubHead>StatCard · PointsChip · RarityPill</SubHead>
      <div className="ds-tile" style={{ padding: 18 }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14, maxWidth: 420 }}>
          <StatCard icon="medal" color={THEME.gold} bg={THEME.goldLight} value="1,240" label="안전 포인트" />
          <StatCard icon="flame" color={THEME.danger} bg={THEME.dangerLight} value="5" label="연속 일수" />
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <PointsChip pts={1240} />
          <RarityPill rarity="common" /><RarityPill rarity="rare" /><RarityPill rarity="epic" />
        </div>
      </div>
      <PropsTable rows={[
        ['StatCard', 'icon, color, bg, value, label, big', null, 'stat tile (Home + Profile) — game-font value, 34px icon well'],
        ['PointsChip', 'pts', null, 'white pill with gold star; headers (Profile / Decorate)'],
        ['RarityPill', "rarity: 'common' | 'rare' | 'epic'", "'common'", 'tiny uppercase pill; dex screens — label runs through L()'],
      ]} />

      <SubHead>DexProgress — collection completion header</SubHead>
      <div style={{ maxWidth: 420 }}>
        <DexProgress have={8} total={12} label="Discovered" icon="book-open" accent={THEME.gold} />
      </div>
      <PropsTable rows={[
        ['have / total', 'number', null, 'drives the numeral, the progress, and the ✓ at 100%'],
        ['label', 'string (EN key)', null, 'runs through L()'],
        ['icon', 'string', "'book-open'", 'emblem / marker, per variant'],
        ['accent', 'color', 'THEME.gold', 'emblem glyph, ✓, and progress fill'],
        ['accentLight', 'color', 'THEME.goldLight', 'emblem bg + progress track — pass the accent’s paired Light token'],
        ['— layout', 'window.JX_DEX_HEADER', "'rows'", 'one of DEX_HEADERS; set from Tweaks → Dex header'],
      ]} />

      <SubHead>Confetti — celebration burst
        <button className="ds-chip" style={{ marginLeft: 8 }} onClick={() => setConfettiKey(k => k + 1)}>▶ Replay</button>
      </SubHead>
      <div style={{ position: 'relative', height: 130, borderRadius: 16, border: `1px solid ${THEME.border}`, background: '#fff', overflow: 'hidden', marginBottom: 8 }}>
        <Confetti key={confettiKey} n={18} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: THEME.fg2, fontSize: 13 }}>{'<Confetti n={18} />'}</div>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Absolutely fills its parent (needs <code>position: relative</code> + <code>overflow: hidden</code>);
        pieces fall with the <code>jxConfetti</code> keyframes. Used on rewards / evolution moments.
      </p>
    </div>
  );
}

function ParentKitSection() {
  return (
    <div>
      <p className="ds-p">
        The parent app's shared pieces live in <code>src/parent/shared.jsx</code> alongside <code>BRAND</code> and
        <code> brandBtn</code> (see Buttons) and <code>ChoiceGroup</code> (see Controls).
      </p>

      <SubHead>ParentHead — screen header</SubHead>
      <div className="ds-tile" style={{ padding: '14px 4px', marginBottom: 8 }}>
        <ParentHead sub="자녀 4명 · 2명 연결됨" title="자녀" onBack={() => {}}
          right={<span style={{ width: 40, height: 40, borderRadius: 999, background: BRAND.primary, boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></span>} />
      </div>
      <PropsTable rows={[
        ['title', 'string', null, '24/800 screen title'],
        ['sub', 'string', null, '12.5px eyebrow line above the title'],
        ['onBack', 'fn', null, 'when given, shows the 34px round white back button'],
        ['right', 'node', null, 'right slot — e.g. the green add-child button'],
      ]} />

      <SubHead>RULE_TAG_COLORS — schedule tag palette</SubHead>
      <p className="ds-p">
        Per-tag badge colors for the time-rule schedules, mapped onto system badge tokens
        (step-20 background · step-70 label):
      </p>
      <div className="ds-tile" style={{ display: 'flex', gap: 10, padding: 18, flexWrap: 'wrap' }}>
        {Object.entries(RULE_TAG_COLORS).map(([tag, t]) => (
          <span key={tag} style={{ background: t.bg, color: t.c, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>{tag}</span>
        ))}
      </div>
      <CodeBlock code={`import { ParentHead, RULE_TAG_COLORS } from './shared.jsx';
<ParentHead sub={countLine} title={L('Children')} onBack={ctx.back} right={<AddButton />} />
const { c, bg } = RULE_TAG_COLORS[rule.tag];   // Strict (rust) · Balanced (ember) · Relaxed (evergreen)`} />
    </div>
  );
}

function TabBarSection() {
  const [childTab, setChildTab] = React.useState('home');
  const [parentTab, setParentTab] = React.useState('p_reports');
  const [accent, setAccent] = React.useState('#4b814f');
  const buddies = STYLE_BUDDIES.comic;
  return (
    <div>
      <p className="ds-p">
        One <code>TabBar</code> serves both apps: 86px tall, blurred white, top radius 24. The child bar takes an
        <code> accent</code> (the active buddy's color) and a raised 62px center battle button; the parent bar
        defaults to ocean. Try the tabs below — they're live.
      </p>
      <SubHead>Child app · 5 tabs + center action</SubHead>
      <div className="ds-phone-frame">
        <TabBar tabs={CHILD_TABS} active={childTab} onTab={setChildTab} accent={accent} />
      </div>
      <Control label="accent — follows the active buddy">
        {buddies.map(([sp, name, c]) => (
          <button key={sp} className={'ds-sw' + (accent === c ? ' on' : '')} style={{ background: c }} title={`${name} ${c}`} onClick={() => setAccent(c)} />
        ))}
      </Control>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Detail: the center button pokes 15px above the bar, and a hairline is drawn on the protruding arc only
        (clipped ring) so the bar's top border appears to continue around the notch.
      </p>
      <SubHead>Parent app · 3 tabs</SubHead>
      <div className="ds-phone-frame">
        <TabBar tabs={PARENT_TABS} active={parentTab} onTab={setParentTab} />
      </div>
      <CodeBlock code={`<TabBar tabs={CHILD_TABS} active={activeTab} onTab={tabTo} accent={buddyColor} />
<TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} />   // tab: { id, root, icon, label, center?, alt? }`} />

      <SubHead>StatusBar — fake iOS status bar</SubHead>
      <div style={{ borderRadius: 16, border: `1px solid ${THEME.border}`, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ background: '#fff' }}><StatusBar /></div>
        <div style={{ background: '#17191d' }}><StatusBar dark /></div>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Rendered once by the shell at the top of every screen — 50px tall, 9:41 + signal/wifi/battery.
        <code> dark</code> flips to white for dark overlays (Lite block). <code>{'<StatusBar dark={isDarkOverlay} />'}</code>
      </p>
    </div>
  );
}

function MascotsSection() {
  const [style, setStyle] = React.useState(window.JX_CHAR_STYLE === 'cute' ? 'cute' : 'comic');
  const roster = STYLE_BUDDIES[style] || [];
  const [species, setSpecies] = React.useState(roster[0][0]);
  const [size, setSize] = React.useState(150);
  // The Mascot dispatcher reads window.JX_CHAR_STYLE at render time. The doc page
  // is the only Mascot consumer while it's mounted, so set it for this render and
  // restore the app's value when the section unmounts.
  React.useEffect(() => {
    const prev = window.JX_CHAR_STYLE;
    return () => { window.JX_CHAR_STYLE = prev; };
  }, []);
  window.JX_CHAR_STYLE = style;
  const row = roster.find(r => r[0] === species) || roster[0];
  return (
    <div>
      <p className="ds-p">
        <code>Mascot</code> is a dispatcher: the global style flag (set from Tweaks) picks the art line —
        <b> comic</b> (flat SVG files) or <b>3D cute</b> (rendered PNGs) in the current build. Each style ships its
        own buddy roster (<code>STYLE_BUDDIES</code>) pairing species → display name → brand color, so art, label and
        accent always travel together.
      </p>
      <Playground
        preview={
          <div style={{ textAlign: 'center' }}>
            <Mascot species={row[0]} color={row[2]} size={size} float />
            <div className="game-font" style={{ fontSize: 20, marginTop: 8, color: row[2] }}>{row[1]}</div>
          </div>
        }
        controls={
          <div>
            <Control label="style">
              <Chip on={style === 'comic'} onClick={() => { setStyle('comic'); setSpecies(STYLE_BUDDIES.comic[0][0]); }}>Comic</Chip>
              <Chip on={style === 'cute'} onClick={() => { setStyle('cute'); setSpecies(STYLE_BUDDIES.cute[0][0]); }}>3D Cute</Chip>
            </Control>
            <Control label="buddy">
              {roster.map(([sp, name]) => <Chip key={sp} on={species === sp} onClick={() => setSpecies(sp)}>{name}</Chip>)}
            </Control>
            <Control label={`size — ${size}px`}>
              <input type="range" min={60} max={240} value={size} onChange={e => setSize(+e.target.value)} style={{ width: '100%' }} />
            </Control>
          </div>
        }
        code={`window.JX_CHAR_STYLE = '${style}';           // set once from Tweaks — never per component
<Mascot species="${row[0]}" color="${row[2]}" size={${size}} float />`}
      />
      <SubHead>MascotChip — list avatar</SubHead>
      <div className="ds-tile" style={{ display: 'flex', gap: 12, padding: 18, alignItems: 'center' }}>
        {roster.map(([sp, name, c]) => (
          <div key={sp} style={{ textAlign: 'center' }}>
            <MascotChip species={sp} color={c} size={52} />
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2, marginTop: 4 }}>{name}</div>
          </div>
        ))}
        <code style={{ fontSize: 12, marginLeft: 8 }}>{`<MascotChip species="fox" color={c} size={52} />`}</code>
      </div>
      <SubHead>Roster — <code>STYLE_BUDDIES[style]</code></SubHead>
      <PropsTable rows={[
        ['comic', "fox·'Hammy' #4b814f · cat·'Mochi' #e1874a · bird·'Pip' #4f93c4 · owl·'Sunny' #e0554a", null, 'flat SVG · /assets/characters/comic/{species}.svg'],
        ['cute', "fox·'Dino' · cat·'Axolotl' · bird·'Giraffe' · owl·'Pig'", null, '3D PNG · /assets/characters/cute/{species}.png'],
      ]} />
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Note: the <code>fox</code> species slot renders <b>Hammy the hamster</b> — the id is legacy, the art is not a fox.
        Mascot poses should feel lively and interactive, never stiff/symmetric.
        Also exported: <code>shade(hex, amt)</code> — lighten/darken helper the mascot art uses for its own tints.
      </p>
    </div>
  );
}

function MotionSection() {
  const loops = [
    ['jx-float', 'idle bob — mascots on home', '3.2s ∞'],
    ['jx-pulse', 'attention ring — SOS / alerts', '1.6s ∞'],
    ['jx-twinkle', 'sparkle loop (stagger with delay)', '1.9s ∞'],
    ['jx-skeleton', 'loading shimmer', '1.3s ∞'],
  ];
  const oneshots = [
    ['jx-pop', 'element enters with overshoot', '.42s'],
    ['jx-rise', 'content slides up on mount', '.4s'],
    ['jx-overlay-up', 'sheet/overlay entrance', '.42s'],
    ['jx-fade', 'soft fade-in', '.3s'],
    ['jx-gift-pop', 'reward reveal scale-up', '.6s'],
    ['jx-drop-in', 'badge drops in', '.5s'],
  ];
  const [k, setK] = React.useState(0);
  return (
    <div>
      <p className="ds-p">
        Motion classes live in <code>src/styles/joanx.css</code>. Springy cubic-beziers
        (<code>.34,1.56,.64,1</code>) for playful entrances; plain ease for loops. The Tweaks "calm" play mode adds
        <code> .jx-still</code>, which kills the float loop for reduced-motion contexts.
      </p>
      <SubHead>Loops</SubHead>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {loops.map(([cls, desc, dur]) => (
          <div key={cls} className="ds-motion-tile">
            <div style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cls === 'jx-skeleton'
                ? <div className="jx-skeleton" style={{ width: 90, height: 16, borderRadius: 8 }} />
                : <div className={cls} style={{ width: 42, height: 42, borderRadius: 14, background: cls === 'jx-pulse' ? THEME.danger : THEME.primary }} />}
            </div>
            <code style={{ fontSize: 12, fontWeight: 700 }}>.{cls}</code>
            <div className="ds-dim" style={{ fontSize: 11, lineHeight: 1.4 }}>{desc}<br />{dur}</div>
          </div>
        ))}
      </div>
      <SubHead>One-shots <button className="ds-chip" style={{ marginLeft: 8 }} onClick={() => setK(x => x + 1)}>▶ Replay all</button></SubHead>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} key={k}>
        {oneshots.map(([cls, desc, dur]) => (
          <div key={cls} className="ds-motion-tile">
            <div style={{ height: 74, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div className={cls} style={{ width: 42, height: 42, borderRadius: 14, background: THEME.success }} />
            </div>
            <code style={{ fontSize: 12, fontWeight: 700 }}>.{cls}</code>
            <div className="ds-dim" style={{ fontSize: 11, lineHeight: 1.4 }}>{desc}<br />{dur}</div>
          </div>
        ))}
      </div>
      <SubHead>Component-level motion</SubHead>
      <PropsTable rows={[
        ['Button press', 'scale(0.97) · .12s', null, 'built into the primitive (pointer events)'],
        ['Bar fill', 'width .6s cubic-bezier(.4,0,.2,1)', null, 'progress animates on change'],
        ['Toggle', 'background + knob left · .2s', null, ''],
        ['.jx-press', 'hover brightness + active scale(.9)', null, 'utility for icon buttons / chips'],
      ]} />
    </div>
  );
}

function I18nSection() {
  return (
    <div>
      <p className="ds-p">
        Every user-facing string goes through <code>L()</code> from <code>src/core/i18n.jsx</code>. English strings
        are the keys; the dictionary maps them to Korean. The shell calls <code>setLang(lang)</code> each render, so
        components just call <code>L('Reports')</code> and re-render on language switch. Missing keys fall back to
        the English source string.
      </p>
      <CodeBlock code={`import { L, setLang } from '../core/i18n.jsx';

setLang('ko');            // done once by the shell (Tweaks → Language)
L('Reports')              // → '리포트'
L('{n} days safe', { n }) // params interpolate where supported`} />
      <PropsTable rows={[
        ['Default language', "'ko'", null, 'the prototype boots in Korean'],
        ['Adding a string', 'add EN key → KO value in i18n.jsx', null, 'then use L(key) everywhere — never hardcode KO'],
        ['getLang()', "returns 'en' | 'ko'", null, 'for locale-conditional layouts (e.g. count lines in ParentChildren)'],
        ['Fonts', 'Pretendard covers KO+EN · Jua covers KO game headers', null, 'no per-locale font switching needed'],
      ]} />
    </div>
  );
}

function AssetsSection() {
  const species = ['fox', 'cat', 'bird', 'owl', 'croc'];
  return (
    <div>
      <p className="ds-p">
        Everything in <code>public/</code> is served from the site root — reference by absolute URL
        (<code>/assets/…</code>). Character art ships in two styles matching the two Mascot lines.
      </p>
      <SubHead>Characters — /assets/characters/{'{style}/{species}'}</SubHead>
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead><tr><th>species</th><th>comic (.svg)</th><th>cute (.png)</th></tr></thead>
          <tbody>
            {species.map(sp => (
              <tr key={sp}>
                <td><code>{sp}</code></td>
                <td><img src={`/assets/characters/comic/${sp}.svg`} alt="" style={{ height: 54 }} /></td>
                <td><img src={`/assets/characters/cute/${sp}.png`} alt="" style={{ height: 54 }} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SubHead>Brand & imagery</SubHead>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* dark tile — parts of the wordmark are white and vanish on a light background */}
        <div className="ds-tile" style={{ padding: 16, width: 230, background: '#0f0f12', boxShadow: 'none' }}>
          <img src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ height: 34 }} />
          <code style={{ fontSize: 11, display: 'block', marginTop: 10, color: 'rgba(255,255,255,.55)' }}>/assets/brand/logo-wordmark.svg</code>
        </div>
        {['onboarding/intro.png', 'onboarding/add-child.png', 'backgrounds/page-bg-green.jpg'].map(p => (
          <div key={p} className="ds-tile" style={{ padding: 12, width: 160 }}>
            <img src={`/assets/${p}`} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 10 }} />
            <code style={{ fontSize: 10.5, display: 'block', marginTop: 8, color: THEME.fg3, wordBreak: 'break-all' }}>/assets/{p}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── page shell: sidebar nav + scrollspy ───────────────────────────── */

const SECTIONS = [
  { id: 'intro', label: 'Introduction', icon: 'book-open', C: IntroSection, lead: 'What this is and how the pieces fit together.' },
  { id: 'colors', label: 'Colors', icon: 'palette', C: ColorsSection, lead: 'Two app accents on one shared token system. Click any swatch or ramp cell to copy its hex.' },
  { id: 'typography', label: 'Typography', icon: 'type', C: TypographySection, lead: 'Pretendard for UI, Fredoka/Jua for the kid game layer.' },
  { id: 'spacing', label: 'Spacing', icon: 'ruler', C: SpacingSection, lead: '4-px grid, six named steps.' },
  { id: 'radius', label: 'Radius', icon: 'squircle', C: RadiusSection, lead: 'Rounded and friendly — cards 20, inputs 16, pills 999.' },
  { id: 'shadows', label: 'Shadows', icon: 'layers', C: ShadowsSection, lead: 'Warm-tinted elevation; cards use a hairline ring, not a blur.' },
  { id: 'icons', label: 'Icons', icon: 'shapes', C: IconsSection, lead: 'lucide-react behind a kebab-case string API.' },
  { id: 'buttons', label: 'Buttons', icon: 'mouse-pointer-click', C: ButtonsSection, lead: 'Seven variants, three sizes, built-in press feedback.' },
  { id: 'badges', label: 'Badges', icon: 'tag', C: BadgesSection, lead: 'System badge palettes + the game-layer gold and rarity chips.' },
  { id: 'inputs', label: 'Inputs', icon: 'text-cursor-input', C: InputsSection, lead: 'Focus, error and icon states — try them live.' },
  { id: 'controls', label: 'Controls', icon: 'sliders-horizontal', C: ControlsSection, lead: 'Toggle, progress Bar, and the parent-app ChoiceGroup radio.' },
  { id: 'cards', label: 'Cards & sections', icon: 'square-stack', C: CardsSection, lead: 'The canonical card recipe and section headers.' },
  { id: 'childkit', label: 'Child kit', icon: 'puzzle', C: ChildKitSection, lead: 'The child app\'s shared pieces — buddy-tinted washes, headers, stat tiles, dex progress, confetti.' },
  { id: 'parentkit', label: 'Parent kit', icon: 'shield', C: ParentKitSection, lead: 'The parent app\'s shared pieces — screen header and rule-tag palette.' },
  { id: 'tabbar', label: 'App chrome', icon: 'layout-grid', C: TabBarSection, lead: 'Tab bar and status bar — one set of chrome, two apps.' },
  { id: 'mascots', label: 'Mascots', icon: 'cat', C: MascotsSection, lead: 'The buddy system: styles, rosters, colors and the chip avatar.' },
  { id: 'motion', label: 'Motion', icon: 'zap', C: MotionSection, lead: 'Playful, springy, and easy to switch off.' },
  { id: 'i18n', label: 'Localization', icon: 'globe', C: I18nSection, lead: 'EN ⇄ KO through one helper.' },
  { id: 'assets', label: 'Assets', icon: 'image', C: AssetsSection, lead: 'Where the art lives and how to reference it.' },
];

const DS_CSS = `
  .ds-root { width: 100%; max-width: 1240px; display: flex; gap: 28px; align-items: flex-start; }
  .ds-nav { position: sticky; top: 84px; width: 212px; flex-shrink: 0; background: #fff; border-radius: 22px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 14px 10px; max-height: calc(100vh - 108px); overflow-y: auto; }
  .ds-nav-title { font-size: 11px; font-weight: 800; letter-spacing: .6px; text-transform: uppercase; color: #b0adab; padding: 4px 12px 10px; }
  .ds-nav button { display: flex; align-items: center; gap: 9px; width: 100%; border: none; background: none; font-family: inherit; font-size: 13px; font-weight: 700; color: #585450; padding: 8px 12px; border-radius: 12px; cursor: pointer; text-align: left; }
  .ds-nav button:hover { background: #f8f7f7; }
  .ds-nav button.on { background: #ecf3fe; color: #2b5782; }
  .ds-main { flex: 1; min-width: 0; background: #fff; border-radius: 26px; box-shadow: 0 24px 60px rgba(46,43,41,.18); padding: 34px 38px 60px; }
  .ds-hero { border-bottom: 1px solid #ebebea; padding-bottom: 22px; margin-bottom: 8px; }
  .ds-hero h1 { margin: 0 0 6px; font-size: 30px; font-weight: 800; letter-spacing: -0.5px; color: #2b2926; }
  .ds-hero p { margin: 0; color: #585450; font-size: 14.5px; }
  .ds-section { padding: 30px 0 6px; border-bottom: 1px solid #f0efee; scroll-margin-top: 84px; }
  .ds-section:last-child { border-bottom: none; }
  .ds-h2 { font-size: 21px; font-weight: 800; letter-spacing: -0.3px; color: #2b2926; margin: 0 0 4px; }
  .ds-lead { color: #585450; font-size: 14px; margin: 0 0 18px; }
  .ds-p { color: #3f3c39; font-size: 14px; line-height: 1.65; margin: 0 0 14px; }
  .ds-p code, .ds-table code, .ds-subhead code { background: #f8f7f7; border: 1px solid #ebebea; border-radius: 6px; padding: 1px 6px; font-size: 12.5px; }
  .ds-dim { color: #77736e; }
  .ds-subhead { font-size: 12px; font-weight: 800; letter-spacing: .5px; text-transform: uppercase; color: #77736e; margin: 24px 0 12px; }
  .ds-callout { background: #f8f7f7; border: 1px solid #ebebea; border-radius: 16px; padding: 16px 18px; font-size: 14px; line-height: 1.7; color: #3f3c39; margin-bottom: 18px; }
  .ds-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 800; margin: 0 0 0 8px; }
  .ds-tile { background: #fff; border-radius: 16px; box-shadow: 0 0 0 1px #ebebea; margin-bottom: 14px; }
  .ds-code { position: relative; background: #2b2926; border-radius: 14px; padding: 14px 16px; margin: 12px 0 16px; overflow-x: auto; }
  .ds-code pre { margin: 0; font-family: ${MONO}; font-size: 12.5px; line-height: 1.6; color: #f0ede9; white-space: pre; }
  .ds-code-copy { position: absolute; top: 8px; right: 8px; display: inline-flex; align-items: center; gap: 5px; border: none; background: rgba(255,255,255,.08); color: #b8b4af; font-family: inherit; font-size: 11px; font-weight: 700; padding: 5px 9px; border-radius: 8px; cursor: pointer; }
  .ds-code-copy:hover { background: rgba(255,255,255,.16); }
  .ds-table-wrap { overflow-x: auto; margin: 4px 0 16px; }
  .ds-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .ds-table th { text-align: left; font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #77736e; padding: 8px 12px; border-bottom: 1.5px solid #ebebea; white-space: nowrap; }
  .ds-table td { padding: 9px 12px; border-bottom: 1px solid #f3f2f1; color: #3f3c39; vertical-align: top; }
  .ds-playground { display: flex; gap: 18px; align-items: stretch; margin-bottom: 4px; flex-wrap: wrap; }
  .ds-preview { flex: 1.4; min-width: 260px; background: #f8f7f7; border: 1px solid #ebebea; border-radius: 18px; padding: 28px; display: flex; align-items: center; justify-content: center; }
  .ds-controls { flex: 1; min-width: 220px; background: #fff; border: 1px solid #ebebea; border-radius: 18px; padding: 16px 18px; }
  .ds-ctl-label { font-size: 11px; font-weight: 800; letter-spacing: .4px; text-transform: uppercase; color: #77736e; margin-bottom: 7px; }
  .ds-chip { border: 1.5px solid #ebebea; background: #fff; font-family: inherit; font-size: 12px; font-weight: 700; color: #2b2926; padding: 6px 11px; border-radius: 10px; cursor: pointer; }
  .ds-chip.on { background: #ecf3fe; border-color: #447aaf; color: #2b5782; }
  .ds-sw { width: 28px; height: 28px; border-radius: 999px; cursor: pointer; border: 3px solid #fff; box-shadow: 0 0 0 1.5px #ebebea; }
  .ds-sw.on { box-shadow: 0 0 0 2.5px #2b2926; }
  .ds-swatch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(148px, 1fr)); gap: 10px; margin-bottom: 8px; }
  .ds-swatch { border: 1px solid #ebebea; background: #fff; border-radius: 14px; padding: 0 0 10px; cursor: pointer; text-align: left; font-family: inherit; overflow: hidden; display: block; }
  .ds-swatch:hover { box-shadow: 0 4px 14px rgba(46,43,41,.10); }
  .ds-swatch-fill { display: flex; align-items: center; justify-content: center; height: 52px; }
  .ds-swatch-copied { font-size: 11px; font-weight: 800; }
  .ds-swatch-name { display: block; font-size: 12px; font-weight: 800; color: #2b2926; padding: 8px 11px 0; }
  .ds-swatch-val { display: block; font-family: ${MONO}; font-size: 10.5px; color: #77736e; padding: 2px 11px 0; }
  .ds-ramp { display: flex; align-items: center; gap: 12px; margin-bottom: 7px; }
  .ds-ramp-name { width: 82px; font-size: 12px; font-weight: 800; color: #3f3c39; text-transform: capitalize; flex-shrink: 0; }
  .ds-ramp-cells { display: flex; flex: 1; border-radius: 10px; overflow: hidden; border: 1px solid #ebebea; }
  .ds-ramp-cell { flex: 1; height: 34px; border: none; cursor: pointer; font-family: ${MONO}; font-size: 9.5px; font-weight: 700; padding: 0; }
  .ds-icon-cell { display: flex; flex-direction: column; align-items: center; gap: 5px; border: 1px solid transparent; background: #fff; border-radius: 12px; padding: 10px 4px 8px; cursor: pointer; font-family: inherit; }
  .ds-icon-cell:hover { border-color: #ebebea; box-shadow: 0 2px 8px rgba(46,43,41,.08); }
  .ds-icon-cell span { font-size: 9.5px; color: #77736e; font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ds-phone-frame { position: relative; width: 390px; max-width: 100%; height: 130px; background: linear-gradient(180deg, #eef0f4, #f8f7f7); border: 1px solid #ebebea; border-radius: 18px; overflow: hidden; margin-bottom: 12px; }
  .ds-motion-tile { width: 148px; background: #fff; border: 1px solid #ebebea; border-radius: 16px; padding: 10px 12px 12px; text-align: center; }
  @media (max-width: 900px) { .ds-root { flex-direction: column; } .ds-nav { position: static; width: 100%; max-height: none; display: flex; flex-wrap: wrap; gap: 2px; } .ds-nav button { width: auto; } .ds-nav-title { width: 100%; } }
`;

function DesignSystem() {
  const [active, setActive] = React.useState('intro');
  const refs = React.useRef({});
  React.useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id);
    }, { rootMargin: '-80px 0px -60% 0px' });
    Object.values(refs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  // honor /?view=design#section deep-links (the browser can't — sections render after load)
  React.useEffect(() => {
    const h = window.location.hash.slice(1);
    if (h && refs.current[h]) setTimeout(() => refs.current[h].scrollIntoView(), 60);
  }, []);
  const go = id => {
    setActive(id);
    refs.current[id] && refs.current[id].scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="ds-root">
      <style>{DS_CSS}</style>
      <nav className="ds-nav">
        <div className="ds-nav-title">Design system</div>
        {SECTIONS.map(s => (
          <button key={s.id} className={active === s.id ? 'on' : ''} onClick={() => go(s.id)}>
            <Icon name={s.icon} size={15} color={active === s.id ? '#2b5782' : '#b0adab'} stroke={2.2} />{s.label}
          </button>
        ))}
      </nav>
      <main className="ds-main">
        <div className="ds-hero">
          <h1>JoanX Design System</h1>
          <p>
            Developer handoff reference — every token and shared component, live and interactive.
            Written spec: <code>DESIGN-SYSTEM.md</code> · token galleries: <code>design/colors.html</code> · <code>design/components.html</code>
          </p>
        </div>
        {SECTIONS.map(({ id, label, lead, C }) => (
          <Section key={id} id={id} title={label} lead={lead} innerRef={el => { refs.current[id] = el; }}>
            <C />
          </Section>
        ))}
      </main>
    </div>
  );
}

export default DesignSystem;
