// JoanX — child app · SafetyStatus

import React from 'react';
import { FEATURES } from '../core/data.jsx';
import { Badge, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Safety Status (the raised shield tab) ────────────────────────────
function SafetyStatus({ ctx }) {
  const lite = ctx.mode === 'lite';
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Safety')} onBack={() => ctx.back()} />
      <div style={{ padding: '0 18px' }}>
        <p style={{ fontSize: 13.5, color: THEME.fg2, margin: '0 0 18px' }}>{L('JoanX is watching out for you in the background.')}</p>

        {/* live status */}
        <div style={{ background: '#fff', borderRadius: 22, padding: '26px 18px', textAlign: 'center', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 22px' }}>
            <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: lite ? THEME.warning : THEME.success }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: lite ? THEME.warning : THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: lite ? '0 10px 24px rgba(177,97,32,.4)' : '0 10px 24px rgba(75,129,79,.4)' }}>
              <Icon name={lite ? 'shield' : 'shield-check'} size={52} color="#fff" stroke={2.1} />
            </div>
          </div>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{lite ? L('Lite mode active') : L('Active & protected')}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, marginTop: 4 }}>{lite ? L('Your phone pauses while you walk.') : L('Walking + phone use is being watched.')}</div>
        </div>

        {/* danger zones (smart) — F-05/F-06, excluded this revision */}
        {!lite && FEATURES.dangerZones && (
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon name="map-pin" size={18} color={THEME.danger} stroke={2.3} />
              <span style={{ fontSize: 14, fontWeight: 800 }}>{L('Danger zones nearby')}</span>
              <Badge variant="danger" style={{ marginLeft: 'auto' }}>2</Badge>
            </div>
            <div style={{ position: 'relative', height: 120, borderRadius: 14, overflow: 'hidden', background: 'linear-gradient(135deg,#f8f7f7,#ebebea)' }}>
              {/* faux map */}
              <svg width="100%" height="120" style={{ position: 'absolute', inset: 0 }}>
                <path d="M0 70 H400" stroke="#d8d6d4" strokeWidth="10" />
                <path d="M120 0 V120" stroke="#d8d6d4" strokeWidth="10" />
                <path d="M260 0 V120" stroke="#d8d6d4" strokeWidth="7" />
              </svg>
              <div style={{ position: 'absolute', left: 100, top: 50, width: 40, height: 40, borderRadius: 999, background: 'rgba(209,69,50,.18)', border: '2px solid rgba(209,69,50,.5)' }} />
              <div style={{ position: 'absolute', left: 244, top: 50, width: 40, height: 40, borderRadius: 999, background: 'rgba(209,69,50,.18)', border: '2px solid rgba(209,69,50,.5)' }} />
              <div style={{ position: 'absolute', left: 188, top: 56, width: 18, height: 18, borderRadius: 999, background: THEME.primary, border: '3px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,.2)' }} />
            </div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 10 }}>{L("You'll only get a heads-up if you walk toward a busy crossing — never just for passing by.")}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export { SafetyStatus };
