// JoanX — the front door.
//
// The repo now holds two deliverables that look nothing alike: the interactive PROTOTYPE
// (both apps, every screen, the Tweaks panel) and the public LANDING PAGE. Dropping a
// reviewer straight into the prototype hid the second one entirely — this asks which they
// came for, once, and gets out of the way.
//
// Skipped with ?app in the URL (deep links and screenshot scripts keep working), and the
// choice is remembered for the tab session so a reload does not re-ask.

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';

const GREEN = '#4B814F', DEEP = '#2B4F30', NIGHT = '#1E3A23';

// One door. Big enough to hit, quiet until it is pointed at.
function Door({ icon, title, sub, meta, onClick, href }) {
  const [hot, setHot] = React.useState(false);
  const common = {
    onMouseEnter: () => setHot(true),
    onMouseLeave: () => setHot(false),
    onFocus: () => setHot(true),
    onBlur: () => setHot(false),
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
      width: 268, minHeight: 230, padding: '26px 24px 24px', textAlign: 'left',
      background: '#fff', border: 'none', borderRadius: 24, cursor: 'pointer',
      fontFamily: 'inherit', color: THEME.fg1, textDecoration: 'none',
      boxShadow: hot ? '0 18px 40px rgba(10,24,12,.28)' : '0 8px 20px rgba(10,24,12,.16)',
      transform: hot ? 'translateY(-4px)' : 'none',
      transition: 'transform .18s ease, box-shadow .18s ease',
    },
  };
  const body = (
    <>
      <span style={{ width: 52, height: 52, borderRadius: 16, background: '#E7F0E7', color: DEEP, display: 'grid', placeItems: 'center', marginBottom: 18 }}>
        <Icon name={icon} size={25} color={DEEP} stroke={2.1} />
      </span>
      <span className="game-font" style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.2 }}>{title}</span>
      <span style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginTop: 7, flex: 1 }}>{sub}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 16, fontSize: 13, fontWeight: 800, color: DEEP }}>
        {meta}
        <Icon name="arrow-right" size={15} color={DEEP} stroke={2.6} />
      </span>
    </>
  );
  return href
    ? <a href={href} {...common}>{body}</a>
    : <button type="button" onClick={onClick} {...common}>{body}</button>;
}

function Portal({ onEnterApp }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300, overflowY: 'auto',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', textAlign: 'center',
      background: `radial-gradient(60% 50% at 50% 0%, ${GREEN} 0%, ${NIGHT} 70%), ${NIGHT}`,
    }}>
      <img src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ height: 30, width: 'auto', marginBottom: 26 }} />

      <h1 className="game-font" style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 500, color: '#fff', margin: '0 0 8px', lineHeight: 1.2 }}>
        What would you like to see?
      </h1>
      <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,.72)', margin: '0 0 30px', maxWidth: 420, lineHeight: 1.55 }}>
        Two things live here — the working product, and the page that sells it.
      </p>

      <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Door
          icon="smartphone"
          title="The app"
          sub="Both apps in a phone frame — the child's game, the guardian's dashboard, and every screen in between."
          meta="Open the prototype"
          onClick={onEnterApp}
        />
        <Door
          icon="globe"
          title="The website"
          sub="The public landing page: what JoanX is, how the safety moment works, and what it never does."
          meta="Open the site"
          href="website/index.html"
        />
      </div>

      <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 26 }}>
        Prototype · not a released app
      </p>
    </div>
  );
}

export default Portal;
