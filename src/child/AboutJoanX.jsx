// JoanX — child app · About (reached from Profile › Account)

import React from 'react';
import { LEGAL_DOCS } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

const APP_VERSION = '1.0.0';

function AboutJoanX({ ctx }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('About JoanX')} onBack={() => ctx.back()} />
      <div style={{ padding: '0 16px' }}>

        {/* identity block */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '22px 16px 18px', boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* the onboarding wordmark — the real JoanX logo, not the bare "J" favicon; it already
              carries the name, so no separate text wordmark below it */}
          <img src="/assets/brand/logo-wordmark-dark.svg" alt="JoanX" style={{ width: 150, height: 'auto', display: 'block' }} />
          <div className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg3, marginTop: 12 }}>{L('Version')} {APP_VERSION}</div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, marginTop: 10, textAlign: 'center', maxWidth: 250 }}>{L('Made for safer walks — points, buddies and streaks for keeping your head up near the road.')}</div>
        </div>

        {/* legal — each row opens its own page */}
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Legal')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 }}>
          {LEGAL_DOCS.map((r, i) => (
            <button key={r.id} onClick={() => ctx.nav('legal', { id: r.id })} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name={r.icon} size={18} color={THEME.fg2} stroke={2.2} />
              <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L(r.label)}</span>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: THEME.fg3 }}>
          <Icon name="heart" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('Walk safe, have fun.')}</span>
        </div>
      </div>
    </div>
  );
}

// One legal document, opened from the About screen.
function LegalDetail({ ctx }) {
  const doc = LEGAL_DOCS.find(d => d.id === ctx.params?.id) || LEGAL_DOCS[0];
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L(doc.label)} onBack={() => ctx.back()} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '18px 16px', marginTop: 12 }}>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6 }}>{L(doc.body)}</div>
        </div>
      </div>
    </div>
  );
}

export { AboutJoanX, LegalDetail };
