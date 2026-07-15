// JoanX — child app · About (reached from Profile › Account)

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

const APP_VERSION = '1.0.0';

// Legal text expands in place. Navigating out to three more stub screens would
// just move the dead end somewhere the user can't see it.
const LEGAL = [
  { icon: 'file-text', label: 'Terms of service',      body: 'JoanX is a walking-safety companion. Use it with a parent or guardian who manages your device. Play fair, be kind to friends, and never use the app while crossing a road.' },
  { icon: 'lock',      label: 'Privacy policy',        body: 'JoanX records how safely you walk — not where you walk. Raw locations and messages are never shared with friends, and never leave your device.' },
  { icon: 'code',      label: 'Open-source licenses',  body: 'Built with React and lucide-react, both under the ISC and MIT licenses. Mascot art is original to JoanX.' },
];

function AboutJoanX({ ctx }) {
  const [open, setOpen] = React.useState(null);

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

        {/* legal — expands in place */}
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Legal')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 }}>
          {LEGAL.map((r, i) => {
            const on = open === i;
            return (
              <div key={r.label} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <button onClick={() => setOpen(on ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <Icon name={r.icon} size={18} color={THEME.fg2} stroke={2.2} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L(r.label)}</span>
                  <Icon name={on ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
                </button>
                {on && <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, padding: '0 14px 13px 44px' }}>{L(r.body)}</div>}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: THEME.fg3 }}>
          <Icon name="heart" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('Walk safe, have fun.')}</span>
        </div>
      </div>
    </div>
  );
}

export { AboutJoanX };
