import React from 'react';
import { Badge, Bar, BottomSheet, Button, DateField, Icon, Input, Modal, RARITY, SafePointIcon, SealCheck, SectionHead, SelectField, ShopIcon, StatusBar, THEME, Toggle, mixHue, screenBgFor } from '../core/primitives.jsx';
import { BRAND, ChoiceGroup, ParentHead, RULE_TAG_COLORS, brandBtn } from '../parent/shared.jsx';
import { CHILD_TABS, PARENT_TABS, TabBar } from '../core/nav.jsx';
import { KingCubix, KingCubixChip, Mascot, MascotChip, STYLE_BUDDIES, VillainMascot } from '../core/characters.jsx';
import { Confetti, DexProgress, LevelBadge, PointsChip, RarityPill, ScreenHeader, StatCard } from '../child/shared.jsx';
import { sfx } from '../core/sound.jsx';

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
        JoanX is <b>two apps in one prototype</b> — a kid-facing game that rewards walking with the phone put
        away (child app) and a calm guardian dashboard (parent app). They share one token system and lead with
        <b> one brand green</b>; ocean stays the in-game action colour.
        <span className="ds-pill" style={{ background: THEME.brandLight, color: THEME.brandDark }}>Brand · green {THEME.brand}</span>
        <span className="ds-pill" style={{ background: THEME.primaryLight, color: THEME.primaryDark }}>Action · ocean {THEME.primary}</span>
        <span className="ds-pill" style={{ background: THEME.goldLight, color: '#9e7300' }}>Points / XP only · gold {THEME.gold}</span>
      </div>
      <SubHead>House rules</SubHead>
      <ul className="ds-p" style={{ paddingLeft: 20, lineHeight: 1.9 }}>
        <li><b>Flat.</b> No drop-shadow glow on buttons or cards — a card is a hairline ring, a button is a fill.</li>
        <li><b>Green is the brand, never the buddy.</b> Screen washes, tab bars and toggles use <code>THEME.brand</code>; they are not re-tinted by the active character's colour.</li>
        <li><b>Gold means points.</b> <code>THEME.gold</code> is for points / XP readouts, not for generic CTAs.</li>
        <li><b>Motion only on what you touched.</b> Static lists and grids don't float or bob; celebrations and taps do.</li>
        <li><b>No decoration for its own sake.</b> No sparkles, faded icon watermarks or dotted progress filler.</li>
        <li><b>Honest copy.</b> The app senses walking + screen use, not where a child looks — say "put the phone away", not "look up".</li>
      </ul>
      <SubHead>Layers</SubHead>
      <p className="ds-p">
        Tokens cascade in three CSS layers imported by <code>src/main.jsx</code> (in this order), then JS mirrors
        the useful subset as the <code>THEME</code> object so components can style inline:
      </p>
      <ol className="ds-p" style={{ paddingLeft: 20, lineHeight: 1.9 }}>
        <li><code>src/styles/tripme-tokens.css</code> — role aliases (<code>--primary</code>, <code>--fg1</code>…), spacing, radius, shadows, type scale</li>
        <li><code>src/styles/color-system.css</code> — the full base system: 10 colour ramps (+ <code>data-yellow</code> for gold) + semantic tokens (badges, chips, fields, avatars…)</li>
        <li><code>src/styles/joanx.css</code> — fonts (Pretendard + Fredoka/Jua) and the motion classes (<code>jx-*</code>)</li>
        <li><code>src/core/primitives.jsx</code> — <code>THEME</code> palette + Button, Badge, Input, fields, sheets, Bar, Toggle, Icon…</li>
        <li><code>index.html</code> — phone-frame chrome (<code>.bezel</code>, <code>.screen</code>) and the Tweaks switches <code>.jx-still</code> / <code>.jx-nofun</code></li>
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
      <CodeBlock code={`import { THEME, Icon, Button, Badge, Input, SelectField, DateField, Calendar, BottomSheet, Modal,
         Bar, Toggle, SectionHead, StatusBar, SealCheck, PointIcon, SafePointIcon, ShopIcon,
         PhotoAvatar, PairQR, RARITY, AVATAR_PAL, avatarPalFor, formatPhone,
         mixHue, screenBgFor } from '../core/primitives.jsx';                     // both apps
import { BRAND, brandBtn, ParentHead, ChoiceGroup, RULE_TAG_COLORS } from '../parent/shared.jsx';   // parent app only
import { ScreenHeader, StatCard, DexProgress, RarityPill, PointsChip, LevelBadge, Confetti,
         HatchCelebration, StageUpMoment, outfitSlotsFor, outfitItemsFor, wornSlugFor,
         screenBgActive } from '../child/shared.jsx';                             // child app only
import { TabBar, CHILD_TABS, PARENT_TABS } from '../core/nav.jsx';
import { Mascot, MascotChip, KingCubix, KingCubixChip, VillainMascot, VillainShape, DemoMascot,
         STYLE_BUDDIES, clientFormOf, styleBrand, shade, tint } from '../core/characters.jsx';
import { sfx, music, bgMusic, installUiSounds } from '../core/sound.jsx';
import { L, setLang, getLang } from '../core/i18n.jsx';`} />
    </div>
  );
}

function ColorsSection() {
  const brandSw = [
    ['brand', THEME.brand, 'product green · screen wash, tab bar, toggles, child CTAs'],
    ['brandDark', THEME.brandDark, 'pressed / text on brandLight'],
    ['brandLight', THEME.brandLight, 'tint bg'],
  ];
  const core = [
    ['primary', THEME.primary, 'ocean-50 · in-game action, links, focus'],
    ['primaryDark', THEME.primaryDark, 'ocean-60 · pressed, dark text on tint'],
    ['primaryLight', THEME.primaryLight, 'ocean-10 · tint bg, secondary button'],
    ['success', THEME.success, 'evergreen-50 · safe / positive'],
    ['successLight', THEME.successLight, 'evergreen-10'],
    ['danger', THEME.danger, 'rust-50 · destructive, alerts'],
    ['dangerLight', THEME.dangerLight, 'rust-10'],
    ['warning', THEME.warning, 'ember-50 · caution'],
    ['warningLight', THEME.warningLight, 'ember-10'],
    ['gold', THEME.gold, 'data-yellow-50 · points / XP readouts only'],
    ['goldLight', THEME.goldLight, 'points / XP tint'],
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
    ['BRAND.primary', BRAND.primary, 'same green as THEME.brand · parent CTA'],
    ['BRAND.primaryDark', BRAND.primaryDark, 'pressed'],
    ['BRAND.primaryLight', BRAND.primaryLight, 'tint · badges, chips, unread rows'],
    ['BRAND.ink', BRAND.ink, 'softened black · active/focus'],
  ];
  return (
    <div>
      <SubHead>Brand — <code>THEME.brand</code> (one green for both apps)</SubHead>
      <div className="ds-swatch-grid">{brandSw.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} />)}</div>
      <SubHead>Shared palette — <code>THEME</code> (src/core/primitives.jsx)</SubHead>
      <div className="ds-swatch-grid">{core.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} />)}</div>
      <SubHead>Ink & surfaces (sand ramp)</SubHead>
      <div className="ds-swatch-grid">{text.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} />)}</div>
      <SubHead>Parent app — <code>BRAND</code> (src/parent/shared.jsx)</SubHead>
      <div className="ds-swatch-grid">{brand.map(([n, v, c]) => <Swatch key={n} name={n} value={v} code={`${v} · ${c}`} dark />)}</div>

      <SubHead>Screen background wash — <code>screenBgFor(THEME.brand)</code></SubHead>
      <p className="ds-p">
        Every screen in <b>both apps</b> sits on the same green wash pooled at the top, fading into sand-10 by
        ~400px: the child app through <code>screenBgActive()</code>, the parent app through
        <code> screenBgFor(BRAND.primary)</code> (the same hex). It is deliberately <b>not</b> re-tinted by the active
        buddy's colour. <code>THEME.screenBg</code> (pink → lavender → periwinkle, fades by 360px) is the static
        fallback when no colour is passed.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 260px', height: 130, borderRadius: 16, border: `1px solid ${THEME.border}`, background: screenBgFor(THEME.brand), display: 'flex', alignItems: 'flex-end', padding: 10 }}><code style={{ fontSize: 11 }}>screenBgFor(THEME.brand) — live</code></div>
        <div style={{ flex: '1 1 260px', height: 130, borderRadius: 16, border: `1px solid ${THEME.border}`, background: THEME.screenBg, display: 'flex', alignItems: 'flex-end', padding: 10 }}><code style={{ fontSize: 11 }}>THEME.screenBg — fallback</code></div>
      </div>

      <SubHead>Parent avatar palette — <code>AVATAR_PAL</code> / <code>avatarPalFor(id)</code></SubHead>
      <p className="ds-p">
        Parent-side "which kid is this" tint (child switcher, Children list, add-child). Hashed off the child's
        permanent <code>id</code> — <b>not</b> their buddy colour, which the child can change — so a parent's
        "orange = Mina" never reshuffles. Cycles <code>ocean · sakura · tropic · moss · pebble · iris</code>.
      </p>

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
    ['t-h1', '24 / 700 / 1.25', '-0.3px', 'Large page titles'],
    ['t-h2', '20 / 700 / 1.3', '0', 'Section titles (SectionHead = 18/700)'],
    ['t-h3', '17 / 600 / 1.35', '0', 'Card titles'],
    ['t-h4', '15 / 600 / 1.4', '0', 'Emphasized body'],
    ['t-body', '15 / 400 / 1.45', '0', 'Body copy'],
    ['t-body-m', '15 / 500', '0', 'Medium body — list row titles'],
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
      <CodeBlock code={`--font-sans: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "SF Pro Text",
             "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", Roboto, sans-serif;
.game-font { font-family: 'Fredoka', 'Jua', var(--font-sans); font-weight: 500; line-height: 1.22; }
.jx-nofun .game-font { font-family: var(--font-sans) !important; letter-spacing: -0.3px; font-weight: 800; }  // index.html`} />
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Screen-header titles are set inline, not with a class: <code>ScreenHeader</code> (child) and
        <code> ParentHead</code> (parent) both render a centred <b>16/800</b> title; <code>ParentHead stacked</code> goes to 22/800.
      </p>
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
  const tokens = [['--r-xs', 6, 'tags'], ['--r-sm', 8, 'small chips'], ['--r-md', 12, 'buttons sm'], ['--r-lg', 16, 'inputs, buttons md'], ['--r-xl', 20, 'cards, buttons lg'], ['--r-xxl', 28, 'sheets'], ['--r-xxxl', 36, 'hero panels'], ['--r-full', '9999', 'pills, toggles, avatars']];
  return (
    <div>
      <p className="ds-p">Friendly and round: cards sit at <b>20px</b>, inputs at <b>16px</b>, anything pill-shaped uses <code>--r-full</code>. The iPhone frame itself: bezel 56 / screen 46.</p>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {tokens.map(([t, v, use]) => (
          <div key={t} style={{ textAlign: 'center' }}>
            <div style={{ width: 86, height: 86, borderRadius: Number(v), background: '#fff', border: `1.5px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: THEME.fg2 }}>{v}</div>
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
    ['shadowCard', THEME.shadowCard, 'THE card style: a 1px hairline ring, no drop shadow'],
    ['shadowSoft', THEME.shadowSoft, 'borderless floating chips over art'],
    ['shadowLg', THEME.shadowLg, 'popovers'],
    ['shadowXl', THEME.shadowXl, 'modals / sheets'],
  ];
  const retired = [
    ['shadowButton', THEME.shadowButton],
    ['shadowPrimary', THEME.shadowPrimary],
    ['shadowDanger', THEME.shadowDanger],
  ];
  return (
    <div>
      <p className="ds-p">
        JoanX is <b>flat</b>. A card is a hairline ring, a button is a plain fill — no glow under CTAs, no floaty
        blur. Real elevation is kept for things that genuinely sit above the page (popovers, sheets, modals) and is
        tinted with warm sand-80 <code>#2b2926</code>, never pure black.
      </p>
      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {tokens.map(([n, v, use]) => (
          <div key={n} style={{ textAlign: 'center', width: 150 }}>
            <div style={{ height: 82, borderRadius: 20, background: '#fff', boxShadow: v, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{n}</div>
            <div className="ds-dim" style={{ fontSize: 11, marginTop: 8, lineHeight: 1.45 }}>{use}</div>
          </div>
        ))}
      </div>
      <SubHead>Retired — don't use</SubHead>
      <p className="ds-p">
        Still defined in <code>THEME</code> for old code, but nothing in either app uses them any more —
        <code> Button</code> sets <code>boxShadow: 'none'</code> on every variant and <code>BRAND.shadowPrimary</code> is
        <code> 'none'</code>: {retired.map(([n], i) => <span key={n}><code>{n}</code>{i < retired.length - 1 ? ', ' : '.'}</span>)}
      </p>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Known leftovers still to flatten: the XP <code>Bar glow</code> (Home, CharacterDetail) and the room-decor
        selection ring (RoomStage). The CSS <code>--shadow-*</code> tokens in <code>tripme-tokens.css</code> are slightly
        different from the JS values; <code>THEME</code> is the source of truth.
      </p>
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
        ['style / className', 'object / string', null, 'passed through — animate icons by class (e.g. .jx-twinkle)'],
      ]} />
      <SubHead>Finished-art icons</SubHead>
      <p className="ds-p">
        Where a drawn lucide glyph meant a product concept, it's swapped for painted art at the same size API
        (<code>size</code>, <code>style</code>). Use them for <i>that</i> meaning only.
      </p>
      <div className="ds-tile" style={{ display: 'flex', gap: 28, padding: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}><SafePointIcon size={40} /><div className="ds-dim" style={{ fontSize: 11, marginTop: 6 }}><code>SafePointIcon</code><br />protected / safe points</div></div>
        <div style={{ textAlign: 'center' }}><ShopIcon size={40} /><div className="ds-dim" style={{ fontSize: 11, marginTop: 6 }}><code>ShopIcon</code><br />go to the shop</div></div>
        <div style={{ textAlign: 'center' }}><SealCheck size={40} /><div className="ds-dim" style={{ fontSize: 11, marginTop: 6 }}><code>SealCheck</code><br />completed / verified</div></div>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        <code>PointIcon</code> also exists but its art (<code>/assets/point/star.png</code>) is missing from
        <code> public/</code> — add the file before using it.
      </p>
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
  const variants = ['primary', 'secondary', 'outline', 'ghost', 'danger', 'play', 'gold'];
  const code = `<Button variant="${variant}" size="${size}"${withIcon ? ' icon="shield-check"' : ''}${disabled ? ' disabled' : ''}${fullWidth ? ' fullWidth' : ''} onClick={…}>\n  Keep me safe\n</Button>`;
  return (
    <div>
      <p className="ds-p">
        One <code>Button</code> primitive, 7 variants, <b>all flat</b> (every variant sets <code>boxShadow: 'none'</code>).
        <b> primary</b> is ocean — the in-game action colour; <b>play</b> is the brand green. Child CTAs that lead a
        screen use green (<code>THEME.brand</code>, e.g. CharacterDetail "Add XP"); the parent app uses
        <code> brandBtn</code>. Press feedback is a built-in <code>scale(0.97)</code>; disabled drops opacity to 0.45 and
        removes the handler.
      </p>
      <div className="ds-callout">
        <b>gold</b> is reserved for points / XP moments (claiming a reward). Don't use it as a generic "nice" CTA.
        A small standalone action should be plain icon + text (like <i>Skip</i>), not a lone filled pill.
      </div>
      <Playground
        preview={<Button variant={variant} size={size} disabled={disabled} fullWidth={fullWidth} icon={withIcon ? 'shield-check' : undefined} onClick={() => {}}>Keep me safe</Button>}
        controls={
          <div>
            <Control label="variant">{variants.map(v => <Chip key={v} on={variant === v} onClick={() => setVariant(v)}>{v}</Chip>)}</Control>
            <Control label="size">{['sm', 'md', 'lg'].map(s => <Chip key={s} on={size === s} onClick={() => setSize(s)}>{s}</Chip>)}</Control>
            <Control label="states">
              <Chip on={withIcon} onClick={() => setWithIcon(v => !v)}>icon</Chip>
              <Chip on={disabled} onClick={() => setDisabled(v => !v)}>disabled</Chip>
              <Chip on={fullWidth} onClick={() => setFullWidth(v => !v)}>fullWidth</Chip>
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
      <SubHead>Green CTAs — parent <code>brandBtn</code> · child <code>THEME.brand</code></SubHead>
      <CodeBlock code={`import { BRAND, brandBtn } from '../parent/shared.jsx';
<Button variant="primary" fullWidth style={brandBtn}>Continue</Button>        // parent: { background: BRAND.primary, boxShadow: 'none' }
<Button variant="primary" fullWidth style={{ background: THEME.brand }}>Add 100 XP</Button>   // child screen-leading CTA`} />
      <div style={{ marginTop: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Button variant="primary" style={brandBtn}>Parent CTA</Button>
        <Button variant="primary" style={{ background: THEME.brand }}>Child CTA</Button>
        <Button variant="outline">Secondary action</Button>
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
  const [accent, setAccent] = React.useState('brand');
  const [grade, setGrade] = React.useState(null);
  const [birthday, setBirthday] = React.useState(null);
  const [sheet, setSheet] = React.useState(false);
  const [modal, setModal] = React.useState(false);
  const accentColor = accent === 'brand' ? BRAND.primary : accent === 'ink' ? BRAND.ink : THEME.primary;
  return (
    <div>
      <p className="ds-p">
        One field family, one look (KakaoPay-style): a <b>60px</b> white box, radius <b>16</b>, 1.5px border, no
        shadow, with a <b>floating label inside</b> — it rests at 16/600 and floats to 11.5/700 at the top once the
        field is focused or filled; the placeholder only appears while focused. Pickers never use native
        controls — they open a <code>BottomSheet</code>. All of it lives in <code>core/primitives.jsx</code>.
      </p>
      <Playground
        preview={
          <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 430, borderRadius: 24, border: `1px solid ${THEME.border}`, background: screenBgFor(THEME.brand), overflow: 'hidden', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Child name" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. Mina"
              accent={accentColor} error={error ? 'That name is already taken' : undefined} />
            <SelectField label="Grade" value={grade} onChange={setGrade} accent={accentColor} title="Choose a grade"
              options={['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6']} />
            <DateField label="Birthday" value={birthday} onChange={setBirthday} accent={accentColor} />
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
              <Button variant="outline" size="sm" onClick={() => setSheet(true)}>Open a sheet</Button>
              <Button variant="outline" size="sm" onClick={() => setModal(true)}>Open a modal</Button>
            </div>
            {sheet && (
              <BottomSheet title="Pick a room" onClose={() => setSheet(false)}>
                <div style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.6, paddingBottom: 6 }}>
                  Drag the handle — it snaps back. Only the X closes a sheet; tapping the scrim or swiping down does not,
                  so a child can't lose a half-finished choice by accident.
                </div>
              </BottomSheet>
            )}
            {modal && (
              <Modal title="Sign out?" onClose={() => setModal(false)}>
                <div style={{ fontSize: 14, color: THEME.fg2, textAlign: 'center', marginBottom: 16 }}>A short yes / no decision sits in the middle.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" fullWidth onClick={() => setModal(false)}>Cancel</Button>
                  <Button variant="danger" fullWidth onClick={() => setModal(false)}>Sign out</Button>
                </div>
              </Modal>
            )}
          </div>
        }
        controls={
          <div>
            <Control label="states">
              <Chip on={error} onClick={() => setError(v => !v)}>error</Chip>
            </Control>
            <Control label="accent (focus colour — click into a field)">
              <Chip on={accent === 'brand'} onClick={() => setAccent('brand')}>BRAND.primary</Chip>
              <Chip on={accent === 'ink'} onClick={() => setAccent('ink')}>BRAND.ink</Chip>
              <Chip on={accent === 'ocean'} onClick={() => setAccent('ocean')}>THEME.primary</Chip>
            </Control>
            <div className="ds-dim" style={{ fontSize: 12, lineHeight: 1.5 }}>Grade and Birthday open their bottom sheets inside the preview.</div>
          </div>
        }
        code={`<Input label="Child name" value={name} onChange={e => setName(e.target.value)}${error ? `\n  error="That name is already taken"` : ''} accent={BRAND.primary} />
<SelectField label="Grade" value={grade} onChange={setGrade} options={GRADES} title="Choose a grade" />
<DateField label="Birthday" value={date} onChange={setDate} />          // value is a Date; KO/EN format via getLang()`}
      />
      <SubHead>Field props</SubHead>
      <PropsTable rows={[
        ['label', 'string', null, 'floating label inside the box'],
        ['value / onChange', 'controlled pair', null, 'Input: event · SelectField: option value · DateField: Date'],
        ['placeholder', 'string', null, 'shown only while focused / empty'],
        ['error', 'string', null, 'Input only — rust border + label + 12px message below'],
        ['trailing', 'node', null, 'Input only — right slot (e.g. visibility toggle)'],
        ['accent', 'color', 'THEME.primary', 'focus border + floated label colour; parent screens pass BRAND.primary or BRAND.ink'],
        ['options', '[{value,label}] | string[]', null, 'SelectField'],
        ['title', 'string', 'label', 'SelectField / DateField — the sheet title'],
        ['type', 'string', "'text'", 'Input — native input type'],
      ]} />
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        <code>Input</code> has <b>no</b> <code>icon</code> prop any more — some older call sites still pass one and it is ignored.
        <code> formatPhone(str)</code> formats Korean mobile numbers as you type.
      </p>
      <SubHead>BottomSheet vs Modal</SubHead>
      <PropsTable rows={[
        ['BottomSheet', 'title, onClose, minHeight, scrim, onDragProgress, pulledAway', null, 'pickers, forms, option lists — slides up, radius 26 top, max 82% tall. Closes on X only; drag snaps back. scrim={false} = no dim and taps pass through (room decorating).'],
        ['Modal', 'title, onClose', null, 'short yes / no confirmations (sign out, delete) — centred card, radius 24, max 330 wide, fades in.'],
        ['Calendar', 'value, onPick, accent', null, 'month grid used inside DateField’s sheet; KO / EN month names'],
      ]} />
    </div>
  );
}

function ControlsSection() {
  const [on, setOn] = React.useState(true);
  const [pct, setPct] = React.useState(64);
  const [striped, setStriped] = React.useState(false);
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
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>40×24 pill · 18px knob · fill animates <code>border → THEME.brand</code> (green) in .2s. Used in parent Settings, Account and Child detail, and the child Profile.</p>

      <SubHead>Bar — progress / XP</SubHead>
      <Playground
        preview={
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Bar value={pct} max={100} color={colors[barColor]} striped={striped} />
            <Bar value={pct} max={100} color={colors[barColor]} striped={striped} height={16} />
          </div>
        }
        controls={
          <div>
            <Control label={`value — ${pct}/100`}>
              <input type="range" min={0} max={100} value={pct} onChange={e => setPct(+e.target.value)} style={{ width: '100%' }} />
            </Control>
            <Control label="color">{Object.keys(colors).map(c => <Chip key={c} on={barColor === c} onClick={() => setBarColor(c)}>{c}</Chip>)}</Control>
            <Control label="fx"><Chip on={striped} onClick={() => setStriped(v => !v)}>striped</Chip></Control>
          </div>
        }
        code={`<Bar value={${pct}} max={100} color={THEME.${barColor}}${striped ? ' striped' : ''} />   // width animates .6s`}
      />
      <PropsTable rows={[
        ['value / max', 'number', '0 / 100', 'fill percentage, clamped 0–100'],
        ['color / track', 'color', 'THEME.primary / THEME.border', 'fill and track'],
        ['height', 'number', '10', 'px; always fully rounded'],
        ['striped', 'bool', null, 'diagonal candy-stripe in two tones of the same colour (rarity language)'],
        ['glow', 'bool', null, 'legacy outer glow — avoid; flat UI'],
      ]} />

      <SubHead>ChoiceGroup — parent-app radio row</SubHead>
      <div className="ds-tile" style={{ padding: 18 }}>
        <ChoiceGroup label="Who is this device for?" value={choice} setter={setChoice}
          opts={[['f', 'My child'], ['m', 'Myself'], ['o', 'Someone else']]} />
      </div>
      <CodeBlock code={`import { ChoiceGroup } from '../parent/shared.jsx';
<ChoiceGroup label="Who is this device for?" value={v} setter={setV}
  opts={[['f','My child'], ['m','Myself'], ['o','Someone else']]} />  // labels run through L(); accent defaults to BRAND.ink · 18px radio, 8px dot`} />
    </div>
  );
}

function CardsSection() {
  return (
    <div>
      <p className="ds-p">
        Cards are white, radius <b>20</b>, padding <b>16</b>, defined by <code>THEME.shadowCard</code> — a crisp
        1px hairline ring and <b>no</b> drop shadow. Use <code>shadowSoft</code> only for borderless chips floating over art.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[['shadowCard', THEME.shadowCard, 'default card'], ['shadowSoft', THEME.shadowSoft, 'floating / borderless']].map(([n, v, use]) => (
          <div key={n} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: v, width: 240 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <MascotChip species="fox" color="#d8a657" size={44} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: THEME.fg1 }}>Lumi</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{use}</div>
              </div>
            </div>
            <div style={{ marginTop: 12 }}><Bar value={62} color={THEME.brand} /></div>
            <code style={{ fontSize: 11, color: THEME.fg3, display: 'block', marginTop: 10 }}>THEME.{n}</code>
          </div>
        ))}
      </div>
      <CodeBlock code={`// canonical card — inline it (primitives.jsx has an internal Card with exactly this, not exported)
<div style={{ background: THEME.surface, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard }}>…</div>`} />
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Don't reach for card chrome by default: a list of rows on the wash, or a tactile shape from the app's own
        art, usually reads better than another white rounded box.
      </p>
      <SubHead>SectionHead — list section header</SubHead>
      <div className="ds-tile" style={{ padding: 18 }}>
        <SectionHead title="내 컬렉션" action="View all" onAction={() => {}} />
        <div className="ds-dim" style={{ fontSize: 13 }}>18/700 title · optional action link with chevron · <code>color</code> prop for the title.</div>
      </div>
    </div>
  );
}

function ChildKitSection() {
  const [confettiKey, setConfettiKey] = React.useState(0);
  return (
    <div>
      <p className="ds-p">
        The child app's shared building blocks live in <code>src/child/shared.jsx</code> (screens are one file
        each; the shared pieces sit here). Everything below is live.
      </p>

      <SubHead>screenBgActive() — the child screen wash</SubHead>
      <p className="ds-p">
        Every child screen sits on <code>screenBgActive()</code>, which is simply <code>screenBgFor(THEME.brand)</code>:
        the brand-green wash. It used to tint by the active buddy; it deliberately doesn't any more — the green
        background is the product, the buddy is a character on it. <code>screenBgFor(color)</code> (core/primitives)
        is still there for one-off washes, and the parent app uses it with <code>BRAND.primary</code>.
      </p>
      <div style={{ height: 120, borderRadius: 16, border: `1px solid ${THEME.border}`, background: screenBgFor(THEME.brand), marginBottom: 10 }} />
      <CodeBlock code={`import { screenBgActive } from './shared.jsx';           // child screens
<div style={{ background: screenBgActive() }}>…</div>    // = screenBgFor(THEME.brand)`} />

      <SubHead>ScreenHeader — sub-screen top bar</SubHead>
      <div style={{ position: 'relative', height: 118, borderRadius: 16, border: `1px solid ${THEME.border}`, background: screenBgFor(THEME.brand), overflow: 'hidden', marginBottom: 8, transform: 'translateZ(0)' }}>
        <div style={{ position: 'absolute', inset: 0, top: -20 }}>
          <ScreenHeader title="캐릭터 도감" onBack={() => {}} right={<PointsChip pts={1240} />} />
        </div>
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        <code>position: fixed</code> at top 50 (under the status bar), 48 tall, with a light frosted blur so the body
        scrolls underneath: round white 38px back button, centred 16/800 title, <code>right</code> slot.
      </p>
      <PropsTable rows={[
        ['title', 'string', null, 'centred 16/800'],
        ['onBack', 'fn', null, 'shows the 38px round white back button'],
        ['left', 'node', null, 'leading slot on tab roots with no back button (Friends shows your avatar)'],
        ['right', 'node', null, 'trailing slot — PointsChip, actions'],
        ['light', 'bool', null, 'over full-bleed art (villain map, room): no blur, white title with a soft shadow'],
        ['flush', 'bool', null, 'no blur, white title chip — for genuinely pale art'],
      ]} />

      <SubHead>LevelBadge — standing rank beside a name</SubHead>
      <div className="ds-tile" style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 18 }}>
        <span className="game-font" style={{ fontSize: 22, color: THEME.fg1 }}>Lumi</span>
        <LevelBadge level={7} />
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Iris pill (<code>THEME.rEpicBg</code> / <code>rEpic</code>) — level is a rank, not a running count, so it gets its
        own accent and sits <b>beside the name</b> in MyHouse and FriendHouse rather than in the white stat chips.
        <code> {'<LevelBadge level={7} />'}</code>
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
        ['PointsChip', 'pts', null, 'white pill with the SafePointIcon shield + game-font number; headers (Profile / Decorate)'],
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
        ['— layout', 'window.JX_DEX_HEADER', "'strip'", 'one of DEX_HEADERS (child/DexHeaders.jsx); the app sets strip, the component falls back to rows'],
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

      <SubHead>Celebrations & wardrobe helpers</SubHead>
      <PropsTable rows={[
        ['HatchCelebration', 'color, accent, screen', null, 'the egg-hatch reveal burst (gold accent = points)'],
        ['StageUpMoment', 'character, stage, color, onDone', null, 'full-screen evolution moment; plays sfx.levelUp'],
        ['outfitSlotsFor(character)', 'fn', null, 'wardrobe slots for a buddy — hides any slot with no items at its current stage'],
        ['outfitItemsFor(character, all)', 'fn', null, 'items for the buddy’s current form (stage-1 vs stage-2 wardrobe)'],
        ['wornSlugFor(worn, all, slot)', 'fn', null, 'the slug of what is worn in a slot — outfits are real photo combos, not overlays'],
      ]} />
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
        <ParentHead title="자녀 상세" onBack={() => {}}
          right={<span style={{ width: 34, height: 34, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}><Icon name="plus" size={18} color="#fff" stroke={2.6} /></span>} />
      </div>
      <div className="ds-tile" style={{ padding: '14px 4px', marginBottom: 8 }}>
        <ParentHead stacked sub="자녀 4명 · 2명 연결됨" title="자녀" />
      </div>
      <PropsTable rows={[
        ['title', 'string', null, 'default: centred 16/800, same as the child ScreenHeader · stacked: left-aligned 22/800'],
        ['sub', 'string', null, '12/700 fg3 line above the title — rendered in stacked mode only'],
        ['onBack', 'fn', null, 'shows the 34px round white back button'],
        ['right', 'node', null, 'right slot — e.g. the flat green add button'],
        ['stacked', 'bool', null, 'tab roots with no back button: two-line left-aligned header'],
      ]} />

      <SubHead>Alerts — unread & urgent rows</SubHead>
      <div className="ds-tile" style={{ padding: 0, overflow: 'hidden', maxWidth: 420 }}>
        {[
          { t: '충격이 감지됐어요', d: 'Mina · 2분 전', urgent: true, unread: true },
          { t: '경고를 무시했어요', d: 'Leo · 1시간 전', unread: true },
          { t: '주간 리포트가 도착했어요', d: '어제' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderTop: i ? `1px solid ${THEME.border}` : 'none',
            background: r.urgent ? THEME.dangerLight : r.unread ? BRAND.primaryLight + '88' : '#fff',
            boxShadow: r.urgent ? `inset 3px 0 0 ${THEME.danger}` : 'none' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: r.urgent ? THEME.danger : THEME.fg1 }}>{r.t}</div>
              <div style={{ fontSize: 12, color: THEME.fg3 }}>{r.d}</div>
            </div>
            {r.unread && <span style={{ width: 8, height: 8, borderRadius: 999, background: r.urgent ? THEME.danger : BRAND.primary }} />}
          </div>
        ))}
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Urgent (a detected impact): <code>THEME.dangerLight</code> row, 3px rust inset edge, rust title and dot.
        Unread: <code>BRAND.primaryLight</code> at ~50%. The Alerts tab shows the unread count as a red badge (see App chrome).
      </p>

      <SubHead>Guardian groups</SubHead>
      <p className="ds-p">
        Co-parents and grandparents share a child through <b>groups</b> (<code>parent/ParentGroups.jsx</code>; Korean copy
        says 그룹, not 가족). Its local pieces — <code>GroupAvatar</code>, <code>MemberAvatar</code>, <code>KidAvatar</code>,
        <code> RoleBadge</code> (admin-only pill in <code>BRAND.primaryLight</code>), <code>Toast</code> and
        <code> GroupCodeInput</code> (segmented 2-2-6 join code) — are screen-local today; promote them to
        <code> shared.jsx</code> if a second screen needs them.
      </p>

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
<ParentHead stacked sub={countLine} title={L('Children')} right={<AddButton />} />   // tab root
<ParentHead title={L('Child detail')} onBack={ctx.back} />                        // sub-screen
const { c, bg } = RULE_TAG_COLORS[rule.tag];   // Strict (rust) · Balanced (ember) · Relaxed (evergreen)`} />
    </div>
  );
}

function TabBarSection() {
  const [childTab, setChildTab] = React.useState('home');
  const [parentTab, setParentTab] = React.useState('p_reports');
  const [alerts, setAlerts] = React.useState(3);
  return (
    <div>
      <p className="ds-p">
        One <code>TabBar</code> serves both apps: 86px tall, blurred white, top radius 24, a raised 62px centre
        button that pokes 15px above the bar. Both apps pass the <b>brand green</b> as <code>accent</code>
        (child <code>THEME.brand</code>, parent <code>BRAND.primary</code>); the bare component falls back to ocean.
        Try the tabs — they're live.
      </p>
      <SubHead>Child app · 4 tabs + centre battle button</SubHead>
      <div className="ds-phone-frame">
        <TabBar tabs={CHILD_TABS} active={childTab} onTab={setChildTab} accent={THEME.brand} />
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Home · Collect · <b>⚔ centre</b> (opens the villain road) · Friends · Profile. A hairline is drawn on the
        protruding arc only (clipped ring) so the bar's top border appears to continue around the notch.
      </p>
      <SubHead>Parent app · 4 tabs + centre connect button · alert badge</SubHead>
      <div className="ds-phone-frame">
        <TabBar tabs={PARENT_TABS} active={parentTab} onTab={setParentTab} accent={BRAND.primary} badges={{ p_activity: alerts }} />
      </div>
      <Control label={`badges.p_activity — ${alerts}`}>
        {[0, 3, 12].map(n => <Chip key={n} on={alerts === n} onClick={() => setAlerts(n)}>{n}</Chip>)}
      </Control>
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Reports · Children · <b>scan centre</b> (connect a device) · Alerts · Profile. <code>badges</code> maps a tab id to an
        unread count: a red <code>THEME.danger</code> pill with a 2px white ring, "9+" above nine, hidden at 0.
      </p>
      <CodeBlock code={`<TabBar tabs={CHILD_TABS} active={activeTab} onTab={tabTo} accent={THEME.brand} />
<TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} accent={BRAND.primary}
        badges={{ p_activity: parentUnreadCount() }} />   // tab: { id, root, icon, label, center?, alt?, disabled? }`} />

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
  const STYLES = { client: 'Client (live)', comic: 'Comic', cute: '3D Cute' };
  const [style, setStyle] = React.useState('client');
  const roster = STYLE_BUDDIES[style] || [];
  const [species, setSpecies] = React.useState(roster[0][0]);
  const [stage, setStage] = React.useState(2);
  const [size, setSize] = React.useState(170);
  // The Mascot dispatcher reads window.JX_CHAR_STYLE at render time. Set it for this render
  // and restore the app's value when the section unmounts.
  React.useEffect(() => {
    const prev = window.JX_CHAR_STYLE;
    return () => { window.JX_CHAR_STYLE = prev; };
  }, []);
  window.JX_CHAR_STYLE = style;
  const row = roster.find(r => r[0] === species) || roster[0];
  const KC = ['Stop', 'Stern Glare', 'Sobbing', 'Alert', 'Halt', 'Pleading', 'Accusation', 'Battle Cry', 'Rage Burst'];
  const VILLAINS = [['v-ping', 'Ping'], ['v-temo', 'Temo'], ['v-vortex', 'Vortex'], ['v-moody', 'Moody'], ['v-chrono', 'Chrono'],
    ['v-hexa', 'Hexa'], ['v-shatter', 'Shatter'], ['v-twist', 'Twist'], ['v-puppet', 'Puppet · mid-boss'], ['v-vilord', 'Vilord · final boss']];
  return (
    <div>
      <p className="ds-p">
        Three casts share the screen: <b>the buddy</b> (the child's own character — right now that's <b>Lumi</b>),
        <b> King Cubix</b> (the narrator who speaks when the app itself has something to say) and <b>the villains</b>
        (what a phone-down walk defeats). Poses should feel lively and interactive, never stiff or symmetric.
      </p>

      <SubHead>The buddy — <code>Mascot</code></SubHead>
      <p className="ds-p">
        <code>Mascot</code> is a dispatcher: the global style flag picks the art line. The app runs the
        <b> client</b> line — real rendered photos — and Tweaks pins it there. Its roster is a single buddy,
        <b> Lumi</b> (<code>c15</code>, #d8a657); every other character shows as locked. Stage 2 swaps to a new outfit set
        (<code>clientFormOf(id, stage)</code>), and worn outfits are real photo combinations (<code>wornHat</code> /
        <code> wornClothing</code> / <code>wornGlasses</code>), not overlays. The comic and 3D-cute lines remain for
        reference.
      </p>
      <Playground
        preview={
          <div style={{ textAlign: 'center' }}>
            <Mascot species={row[0]} id={style === 'client' ? 'c15' : undefined} stage={stage} color={row[2]} size={size} />
            <div className="game-font" style={{ fontSize: 20, marginTop: 8, color: THEME.fg1 }}>{row[1]}</div>
          </div>
        }
        controls={
          <div>
            <Control label="style">
              {Object.entries(STYLES).map(([k, lab]) => (
                <Chip key={k} on={style === k} onClick={() => { setStyle(k); setSpecies(STYLE_BUDDIES[k][0][0]); }}>{lab}</Chip>
              ))}
            </Control>
            <Control label="buddy">
              {roster.map(([sp, name]) => <Chip key={sp} on={species === sp} onClick={() => setSpecies(sp)}>{name}</Chip>)}
            </Control>
            <Control label="stage">
              {[1, 2].map(n => <Chip key={n} on={stage === n} onClick={() => setStage(n)}>{n}</Chip>)}
            </Control>
            <Control label={`size — ${size}px`}>
              <input type="range" min={60} max={240} value={size} onChange={e => setSize(+e.target.value)} style={{ width: '100%' }} />
            </Control>
          </div>
        }
        code={`window.JX_CHAR_STYLE = '${style}';     // set by the shell — never per component
<Mascot id="c15" species="${row[0]}" stage={${stage}} size={${size}} wornHat={…} wornClothing={…} />`}
      />
      <PropsTable rows={[
        ['client (live)', "fox·'Lumi' #d8a657", null, 'photos · /assets/characters/client/lumi (stage 1) · lumi-s2 (stage 2) · outfits/lumi'],
        ['comic', "fox·'Rex' · cat·'Munch' · bird·'Pip' · owl·'Blaze'", null, 'flat SVG · /assets/characters/comic/{species}.svg'],
        ['cute', "fox·'Dino' · cat·'Axolotl' · bird·'Giraffe' · owl·'Pig'", null, '3D PNG · /assets/characters/cute/{species}.png'],
      ]} />
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        The buddy's colour is a label colour, not a theme: screens, tab bars and washes stay brand green whatever buddy
        is active. <code>MascotChip</code> is the list-avatar version (radius-16 tile, <code>bg</code> optional);
        <code> DemoMascot</code> swaps in fixed fighter art on the battle carousel so a buddy keeps the same look through
        the fight. The comic line has no mood states — use colour and icon for urgency, not the character's face.
      </p>

      <SubHead>The narrator — <code>KingCubix</code></SubHead>
      <p className="ds-p">
        Fixed art that speaks in the app's own voice instead of the child's pet: the walking-warning ladder and the
        onboarding permission asks. The warning picks a pose by tier — <b>gentle</b> → Stop, <b>firm</b> → Stern Glare,
        <b> urgent</b> → Sobbing; the grace beat uses Alert.
      </p>
      <div className="ds-tile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 10, padding: 16 }}>
        {KC.map(p => (
          <div key={p} style={{ textAlign: 'center' }}>
            <KingCubixChip pose={p} size={76} />
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2, marginTop: 4 }}>{p}</div>
          </div>
        ))}
      </div>
      <CodeBlock code={`import { KingCubix, KingCubixChip } from '../core/characters.jsx';
<KingCubix pose="Stern Glare" size={120} />      // /mascot-kingcubic/King Cubix – {pose}.png
<KingCubixChip pose="Stop" size={48} />          // radius-16 tile for toasts and rows`} />

      <SubHead>The villains — <code>VillainMascot</code></SubHead>
      <p className="ds-p">
        Ten villains on the villain road, each a distraction a phone-down walk beats: eight minions, a mid-boss and a
        final boss. Locked ones render as a silhouette (<code>VillainShape</code>, an alpha mask) until met.
      </p>
      <div className="ds-tile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))', gap: 10, padding: 16 }}>
        {VILLAINS.map(([id, name]) => (
          <div key={id} style={{ textAlign: 'center' }}>
            <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}><VillainMascot id={id} size={72} /></div>
            <div style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2, marginTop: 4 }}>{name}</div>
          </div>
        ))}
      </div>
      <CodeBlock code={`<VillainMascot id="v-ping" size={160} />       // /assets/villains/villain{1-10}.png
<VillainShape id="v-vilord" size={160} />       // locked silhouette`} />
    </div>
  );
}

function MotionSection() {
  const loops = [
    ['jx-float', 'idle bob — the hero buddy only', '3.2s ∞'],
    ['jx-pulse', 'attention ring — SOS / alerts', '1.6s ∞'],
    ['jx-twinkle', 'twinkle — egg hatch only', '1.9s ∞'],
    ['jx-ring', 'expanding ring — scanning / connecting', '1.4s ∞'],
    ['jx-badge-pulse', 'count badge breathing', '1.1s ∞'],
    ['jx-skeleton', 'loading shimmer', '1.3s ∞'],
  ];
  const oneshots = [
    ['jx-pop', 'element enters with overshoot', '.42s'],
    ['jx-rise', 'content slides up on mount', '.32s'],
    ['jx-content-in', 'screen body enters', '.44s'],
    ['jx-char-in', 'buddy enters with overshoot', '.55s'],
    ['jx-sheet-up', 'sheet entrance (CSS version)', '.4s'],
    ['jx-shake', 'egg / error shake', '.5s'],
    ['jx-pill-bounce', 'pill / chip lands', '.38s'],
    ['jx-tip-pop', 'tooltip appears', '.3s'],
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
        (<code>.34,1.56,.64,1</code>) for playful entrances, <code>.16,1,.3,1</code> for calm ones, plain ease for loops.
        <b>Motion goes on what the child touched or earned</b> — static lists and grids never float or bob. Every class
        has a <code>prefers-reduced-motion</code> fallback; <code>.jx-still</code> (index.html, set when play mode is calm)
        also stops the float loop.
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
      <SubHead>Battle & transitions</SubHead>
      <PropsTable rows={[
        ['.jx-cloud-part-top / -bottom', '.6s', null, 'cloud curtain parts to reveal the arena'],
        ['.jx-hit-bounce', '.5s', null, 'sideways knock + brightness flash on a hit'],
        ['.jx-hit-burst · .jx-flash-pulse', '.38s · .5s', null, 'impact burst and screen flash'],
        ['.jx-dmg-pop · .jx-dmg-float', '.85s · .7s', null, 'damage numbers; jx-dmg-pop is reused for +XP'],
        ['.jx-ko', '2.5s after 3.34s', null, 'the loser sinks and fades — transform + opacity only, no blur or spin'],
        ['.jx-confetti · .jx-burst', '1.6s · .9s', null, 'celebrations'],
        ['BottomSheet', '.4s cubic-bezier(.16,1,.3,1)', null, 'inline transform transition (not a class) so drag and entrance share one transform'],
      ]} />
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

function SoundSection() {
  const groups = [
    ['UI — both apps', ['tap', 'navigate', 'back', 'select', 'toggle']],
    ['Rewards — child', ['success', 'points', 'taskDone', 'claim', 'levelUp', 'achievement', 'purchase']],
    ['Eggs — child', ['eggTap', 'hatchShake', 'hatchCrack', 'hatchReveal']],
    ['Battle — child', ['battleStart', 'attack', 'hit', 'win', 'lose']],
    ['Safety & pairing', ['warning', 'impact', 'reassure', 'connecting', 'connected', 'parentAlert']],
  ];
  const [last, setLast] = React.useState(null);
  const play = n => { try { sfx[n] && sfx[n](); } catch (e) {} setLast(n); };
  return (
    <div>
      <p className="ds-p">
        <code>src/core/sound.jsx</code> is a <b>zero-asset</b> engine: every cue is synthesised with the Web Audio API
        at play time, so there are no sound files to ship or wait on. The one exception is the onboarding song
        (<code>bgMusic</code> + <code>/assets/audio/onboarding.mp3</code>).
      </p>
      <div className="ds-callout">
        Sound is <b>feedback, never safety</b>. Each app has its own mute (<code>PLAYER.prefs.sound</code> for the child,
        <code> PARENT_PREFS.sound</code> for the parent; both on by default). The child's buzz and the parent's urgent
        alert are never sounds, so muting can't hide them. The parent app only gets the quiet functional cues —
        no fanfares, coins or music.
      </div>
      <SubHead>Try the cues {last && <span className="ds-dim" style={{ fontWeight: 600, marginLeft: 8 }}>▶ sfx.{last}()</span>}</SubHead>
      {groups.map(([label, names]) => (
        <Control key={label} label={label}>
          {names.map(n => <Chip key={n} on={last === n} onClick={() => play(n)}>{n}</Chip>)}
        </Control>
      ))}
      <p className="ds-p ds-dim" style={{ fontSize: 13 }}>
        Browsers block audio until the first tap, so nothing plays before you've clicked somewhere on the page.
      </p>
      <CodeBlock code={`import { sfx, music, bgMusic, installUiSounds, ONBOARDING_SONG } from '../core/sound.jsx';
installUiSounds();                 // once, by the shell — creates the AudioContext on the first tap, adds the tap layer
sfx.levelUp();                     // one-shot cue
music.start('battle');             // looping synth track: 'battle' | 'calm' | 'alert' — child app only
music.stop();
bgMusic.start(ONBOARDING_SONG, { volume: 0.5 });   // the one real audio file
<button data-sfx="off">…</button>  // opt a control out of the automatic tap sound`} />
    </div>
  );
}

function I18nSection() {
  return (
    <div>
      <p className="ds-p">
        Every user-facing string in the apps goes through <code>L()</code> from <code>src/core/i18n.jsx</code>. English
        strings are the keys; one dictionary maps them to Korean. The shell calls <code>setLang(lang)</code> each render,
        so components just call <code>L('Reports')</code> and re-render on language switch. Missing keys fall back to
        the English source string. The apps ship <b>English and Korean</b>; the marketing website also has Mongolian,
        in its own dictionary.
      </p>
      <CodeBlock code={`import { L, setLang } from '../core/i18n.jsx';

setLang('ko');            // done once by the shell (Tweaks → Language)
L('Reports')              // → '리포트'
\`\${n}\${L('days safe')}\`   // L() takes one argument — compose numbers around it (no interpolation)`} />
      <PropsTable rows={[
        ['Default language', "'ko'", null, 'the prototype boots in Korean'],
        ['Adding a string', 'add EN key → KO value in i18n.jsx', null, 'then use L(key) everywhere — never hardcode KO'],
        ['getLang()', "returns 'en' | 'ko'", null, 'for locale-conditional layouts (e.g. count lines in ParentChildren)'],
        ['Fonts', 'Pretendard covers KO+EN · Jua covers KO game headers', null, 'no per-locale font switching needed'],
        ['Dates', 'DateField / Calendar read getLang()', null, "KO: 2026년 10월 02일 · EN: Oct 2, 2026"],
        ['Highlights', "story copy marks a phrase with *asterisks*", null, 'Onboarding renders it as the highlighted ink phrase — mark it in each language separately'],
        ['Wording', 'describe what the app senses', null, '"put the phone away / use it while walking", not "look up" — it detects walking + screen use, not gaze'],
      ]} />
    </div>
  );
}

function AssetsSection() {
  const folders = [
    ['characters/client/lumi · lumi-s2', 'Lumi photos — stage 1 / stage 2; outfit combos named hat+coat(+glasses).png'],
    ['characters/outfits/lumi', 'wardrobe item thumbnails'],
    ['characters/comic · cute', 'legacy buddy lines (reference only)'],
    ['villains', 'villain1–10.png — the villain road'],
    ['democharacters', 'fixed fighter art for the battle carousel'],
    ['rooms · rooms/decor/{any,dream,green,town}', 'room backgrounds (Dream Room is home) and placeable decor'],
    ['egg · egg-types', 'egg shop art and backgrounds'],
    ['onboarding', '1–17.png story cuts, intro, splashloading'],
    ['battle · backgrounds', 'arena, villain map, clouds'],
    ['book · book-popup', 'guestbook closed / open art'],
    ['badges · streak · reports', 'achievement, streak and report art'],
    ['safety · shop · point', 'finished-art icons (SafePointIcon, ShopIcon, PointIcon — point art is missing)'],
    ['avatars', 'default profile photos (PhotoAvatar)'],
    ['audio', 'onboarding.mp3 — the only real audio file'],
    ['brand', 'logo-wordmark.svg (white parts — use on dark), logo-wordmark-dark.svg, favicon.svg'],
  ];
  return (
    <div>
      <p className="ds-p">
        Everything in <code>public/</code> is served from the site root — reference by absolute URL
        (<code>/assets/…</code>). King Cubix is the one exception: his poses live at the root in
        <code> /mascot-kingcubic/</code>.
      </p>
      <SubHead>Lumi — the live buddy</SubHead>
      <div className="ds-tile" style={{ display: 'flex', gap: 14, padding: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        {['lumi.png', 'green-beret+navy-duffle-coat.png', 'gold-hat+red-button-jacket.png'].map(f => (
          <div key={f} style={{ textAlign: 'center', width: 130 }}>
            <img src={`/assets/characters/client/lumi/${f}`} alt="" style={{ height: 110, objectFit: 'contain' }} />
            <code style={{ fontSize: 10, display: 'block', color: THEME.fg3, wordBreak: 'break-all' }}>{f}</code>
          </div>
        ))}
      </div>
      <SubHead>Folder map — /assets/…</SubHead>
      <div className="ds-table-wrap">
        <table className="ds-table">
          <thead><tr><th>Folder</th><th>What's in it</th></tr></thead>
          <tbody>{folders.map(([f, d]) => <tr key={f}><td><code>{f}</code></td><td>{d}</td></tr>)}</tbody>
        </table>
      </div>
      <SubHead>Brand & imagery</SubHead>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* dark tile — parts of the wordmark are white and vanish on a light background */}
        <div className="ds-tile" style={{ padding: 16, width: 230, background: '#0f0f12', boxShadow: 'none' }}>
          <img src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ height: 34 }} />
          <code style={{ fontSize: 11, display: 'block', marginTop: 10, color: 'rgba(255,255,255,.55)' }}>/assets/brand/logo-wordmark.svg</code>
        </div>
        {['onboarding/1.png', 'rooms/dream-room.png', 'backgrounds/page-bg-green.jpg'].map(p => (
          <div key={p} className="ds-tile" style={{ padding: 12, width: 160 }}>
            <img src={`/assets/${p}`} alt="" style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 10 }} />
            <code style={{ fontSize: 10.5, display: 'block', marginTop: 8, color: THEME.fg3, wordBreak: 'break-all' }}>/assets/{p}</code>
          </div>
        ))}
      </div>
      <p className="ds-p ds-dim" style={{ fontSize: 13, marginTop: 12 }}>
        Reference art (Figma or a designer's file) is reinterpreted in the flat style — take its motifs, don't paste a
        glossy render as-is.
      </p>
    </div>
  );
}

/* ── page shell: sidebar nav + scrollspy ───────────────────────────── */

const SECTIONS = [
  { id: 'intro', label: 'Introduction', icon: 'book-open', C: IntroSection, lead: 'What this is and how the pieces fit together.' },
  { id: 'colors', label: 'Colors', icon: 'palette', C: ColorsSection, lead: 'One brand green, ocean for action, gold for points. Click any swatch or ramp cell to copy its hex.' },
  { id: 'typography', label: 'Typography', icon: 'type', C: TypographySection, lead: 'Pretendard for UI, Fredoka/Jua for the kid game layer.' },
  { id: 'spacing', label: 'Spacing', icon: 'ruler', C: SpacingSection, lead: '4-px grid, six named steps.' },
  { id: 'radius', label: 'Radius', icon: 'squircle', C: RadiusSection, lead: 'Rounded and friendly — cards 20, inputs 16, pills 999.' },
  { id: 'shadows', label: 'Shadows', icon: 'layers', C: ShadowsSection, lead: 'Flat: cards are a hairline ring, buttons have no glow.' },
  { id: 'icons', label: 'Icons', icon: 'shapes', C: IconsSection, lead: 'lucide-react behind a kebab-case string API.' },
  { id: 'buttons', label: 'Buttons', icon: 'mouse-pointer-click', C: ButtonsSection, lead: 'Seven flat variants, three sizes, built-in press feedback.' },
  { id: 'badges', label: 'Badges', icon: 'tag', C: BadgesSection, lead: 'System badge palettes + the game-layer gold and rarity chips.' },
  { id: 'inputs', label: 'Fields & sheets', icon: 'text-cursor-input', C: InputsSection, lead: 'Floating-label fields, bottom-sheet pickers, and when to use a sheet vs a modal.' },
  { id: 'controls', label: 'Controls', icon: 'sliders-horizontal', C: ControlsSection, lead: 'Toggle, progress Bar, and the parent-app ChoiceGroup radio.' },
  { id: 'cards', label: 'Cards & sections', icon: 'square-stack', C: CardsSection, lead: 'The canonical card recipe and section headers.' },
  { id: 'childkit', label: 'Child kit', icon: 'puzzle', C: ChildKitSection, lead: 'The child app\'s shared pieces — green wash, headers, level badge, stat tiles, dex progress, celebrations.' },
  { id: 'parentkit', label: 'Parent kit', icon: 'shield', C: ParentKitSection, lead: 'The parent app\'s shared pieces — header, alert rows, groups and rule tags.' },
  { id: 'tabbar', label: 'App chrome', icon: 'layout-grid', C: TabBarSection, lead: 'Tab bar, alert badges and status bar — one set of chrome, two apps.' },
  { id: 'mascots', label: 'Characters', icon: 'cat', C: MascotsSection, lead: 'The buddy (Lumi), the narrator (King Cubix) and the villains.' },
  { id: 'motion', label: 'Motion', icon: 'zap', C: MotionSection, lead: 'Springy where the child acts, still everywhere else.' },
  { id: 'sound', label: 'Sound', icon: 'volume-2', C: SoundSection, lead: 'Synthesised feedback cues — never a safety signal.' },
  { id: 'i18n', label: 'Localization', icon: 'globe', C: I18nSection, lead: 'EN ⇄ KO through one helper — and honest wording.' },
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
