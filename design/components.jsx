import React from 'react';
import ReactDOM from 'react-dom/client';
import { Bar, Button, Icon, Toggle } from '../src/core/primitives.jsx';
import '../src/styles/tripme-tokens.css';
import '../src/styles/color-system.css';
import '../src/styles/joanx.css';

const BADGE_PALETTES = ['sand','ocean','evergreen','ember','rust','tropic','pebble','sakura','iris','moss'];
const AVATAR_PALETTES = ['sand','ocean','evergreen','ember','rust','tropic','pebble','sakura','iris','moss'];
const v = n => `var(${n})`;

function Section({ title, desc, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {desc && <div className="desc">{desc}</div>}
      {children}
    </section>
  );
}
const Sub = ({ children }) => <div className="subh">{children}</div>;

function TokenBadge({ p }) {
  return (
    <span className="pill" style={{ background: v(`--color-interactives-badge-${p}-default`), color: v(`--color-interactives-badge-${p}-label`) }}>
      <span className="dot" style={{ background: v(`--color-interactives-badge-${p}-dot`) }} />{p}
    </span>
  );
}
function TokenAvatar({ p }) {
  return (
    <div className="tile">
      <div className="av" style={{ background: v(`--color-interactives-avatar-${p}-default`), color: v(`--color-interactives-avatar-${p}-icon`) }}>
        <Icon name="user" size={20} color={v(`--color-interactives-avatar-${p}-icon`)} stroke={2.4} />
      </div>
      <small>{p}</small>
    </div>
  );
}

function Gallery() {
  const [on, setOn] = React.useState(true);
  const [field] = React.useState('Mina');
  return (
    <div>
      <Section title="Buttons" desc="Button primitive variants. Primary = ocean brand CTA + white label; action accents use ocean too.">
        <div className="row">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="play">Play</Button>
          <Button variant="gold">Gold</Button>
        </div>
        <div className="subh" style={{ marginTop: 18 }}>AI buttons (iris)</div>
        <div className="row">
          <button className="aibtn"><Icon name="sparkles" size={16} color={v('--color-interactives-button-ai-primary-icon')} stroke={2.4} />AI primary</button>
          <button className="aibtn sec"><Icon name="sparkles" size={16} color={v('--color-interactives-button-ai-secondary-icon')} stroke={2.4} />AI secondary</button>
        </div>
      </Section>

      <Section title="Badges" desc="badge-{palette}-default (step 20) background · -label (70) text · -dot (50/60) accent.">
        <div className="row">{BADGE_PALETTES.map(p => <TokenBadge key={p} p={p} />)}</div>
        <Sub>sand-inverse</Sub>
        <div className="row">
          <span className="pill" style={{ background: v('--color-interactives-badge-sand-inverse-default'), color: v('--color-interactives-badge-sand-inverse-label') }}>
            <span className="dot" style={{ background: v('--color-interactives-badge-sand-inverse-dot') }} />sand-inverse
          </span>
        </div>
      </Section>

      <Section title="Avatars" desc="avatar-{palette}-default background + -icon foreground.">
        <div className="grid">{AVATAR_PALETTES.map(p => <TokenAvatar key={p} p={p} />)}</div>
      </Section>

      <Section title="Chips" desc="chip-* tokens: default / selected (sand-80) / active (pebble).">
        <div className="row">
          <span className="chip" style={{ background: v('--color-interactives-chip-background-default'), border: `1.5px solid ${v('--color-interactives-chip-border-default')}`, color: v('--color-interactives-chip-text-default') }}>Default</span>
          <span className="chip" style={{ background: v('--color-interactives-chip-background-selected'), color: v('--color-interactives-chip-text-inverse') }}>Selected</span>
          <span className="chip" style={{ background: v('--color-interactives-chip-background-active'), border: `1.5px solid ${v('--color-interactives-chip-border-active')}`, color: v('--color-interactives-chip-text-active') }}>Active</span>
          <span className="chip" style={{ background: v('--color-interactives-chip-background-default'), border: `1.5px solid ${v('--color-interactives-chip-border-error')}`, color: v('--color-interactives-chip-icon-error') }}>Error</span>
        </div>
      </Section>

      <Section title="Toggle, Slider, Pagination" desc="toggle / slider / pagination semantic tokens (sand ramp).">
        <div className="row" style={{ gap: 28 }}>
          <div className="tile"><Toggle on={on} onChange={setOn} /><small>toggle</small></div>
          <div className="tile"><div className="slider"><div className="fill" /><div className="knob" /></div><small>slider</small></div>
          <div className="tile"><div className="pageDots"><i className="cur" /><i /><i /><i /></div><small>pagination</small></div>
        </div>
      </Section>

      <Section title="Fields" desc="field-* tokens: default / focus (ocean) / error (rust) / disabled.">
        <div className="row">
          <div className="field"><Icon name="user" size={16} color={v('--color-base-sand-50')} stroke={2} /><span>{field}</span></div>
          <div className="field focus"><Icon name="search" size={16} color={v('--color-base-ocean-50')} stroke={2} /><span style={{ color: v('--color-base-sand-50') }}>Focused…</span></div>
          <div className="field error"><Icon name="alert-circle" size={16} color={v('--color-base-rust-50')} stroke={2} /><span>Invalid</span></div>
          <div className="field disabled"><span>Disabled</span></div>
        </div>
      </Section>

      <Section title="Feedback & misc" desc="progress bar, tooltip, hyperlink, status text.">
        <Sub>progress bar</Sub>
        <div className="row"><div style={{ flex: 1, maxWidth: 360 }}><Bar value={62} max={100} color={v('--color-data-viz-progress-indicators-complete')} track={v('--color-data-viz-progress-indicators-remainder')} /></div></div>
        <Sub>tooltip</Sub>
        <div className="row"><span className="tooltip">Tooltip — sand-80</span></div>
        <Sub>links & status text</Sub>
        <div className="row" style={{ gap: 20 }}>
          <a style={{ color: v('--color-interactives-links-hyperlink-text-default'), textDecorationColor: v('--color-interactives-links-hyperlink-underline-default') }} href="#">Hyperlink</a>
          <span style={{ color: v('--color-ui-text-feedback-positive-dark'), fontWeight: 700, fontSize: 13 }}>Positive</span>
          <span style={{ color: v('--color-ui-text-feedback-caution-dark'), fontWeight: 700, fontSize: 13 }}>Caution</span>
          <span style={{ color: v('--color-ui-text-feedback-negative-dark'), fontWeight: 700, fontSize: 13 }}>Negative</span>
          <span style={{ color: v('--color-ui-text-feedback-ai-dark'), fontWeight: 700, fontSize: 13 }}>AI</span>
        </div>
      </Section>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<Gallery />);
