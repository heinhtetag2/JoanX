// JoanX — child app · LiteBlock

import React from 'react';
import { Icon } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';

function LiteBlock({ ctx }) {
  const [secs, setSecs] = React.useState(3);
  React.useEffect(() => {
    if (secs <= 0) { ctx.closeOverlay(); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'linear-gradient(170deg,#447aaf,#2b5782)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 34px', textAlign: 'center' }}>
      <div className="jx-pop jx-float"><Mascot species="croc" stage={2} color="#FFFFFF" size={150} /></div>
      <div style={{ width: 70, height: 70, borderRadius: 999, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0 18px' }}>
        <Icon name="shield" size={36} color="#fff" stroke={2.1} />
      </div>
      <div className="game-font" style={{ fontSize: 28, fontWeight: 500, color: '#fff' }}>{L("Let's walk first")}</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,.9)', margin: '10px 0 0', lineHeight: 1.5 }}>{L("Your phone takes a quick break while you're walking. It comes back as soon as you stop.")}</div>

      <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.16)', borderRadius: 999, padding: '9px 16px' }}>
        <Icon name="phone" size={16} color="#fff" stroke={2.3} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{L('Calls & texts still work')}</span>
      </div>

      <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 34px)', left: 34, right: 34 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginBottom: 10 }}>{L('Unlocks when you stop walking')}{secs > 0 ? ` · ${secs}s` : ''}</div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(1 - secs / 3) * 100}%`, background: '#fff', borderRadius: 999, transition: 'width 1s linear' }} />
        </div>
      </div>
    </div>
  );
}

export { LiteBlock };
