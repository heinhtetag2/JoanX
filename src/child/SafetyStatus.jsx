// JoanX — child app · SafetyStatus

import React from 'react';
import { FEATURES } from '../core/data.jsx';
import { Badge, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive } from './shared.jsx';

// ── Safety Status (the raised shield tab) ────────────────────────────
function SafetyStatus({ ctx }) {
  const lite = ctx.mode === 'lite';
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 56, paddingBottom: 110, background: screenBgActive() }}>
      <div style={{ padding: '0 18px' }}>
        <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '0 0 4px' }}>{L('Safety')}</h1>
        <p style={{ fontSize: 13.5, color: THEME.fg2, margin: '0 0 18px' }}>{L('JoanX is watching out for you in the background.')}</p>

        {/* live status */}
        <div style={{ background: '#fff', borderRadius: 22, padding: '26px 18px', textAlign: 'center', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 14px' }}>
            <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: lite ? THEME.warning : THEME.success }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: lite ? THEME.warning : THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: lite ? '0 10px 24px rgba(177,97,32,.4)' : '0 10px 24px rgba(75,129,79,.4)' }}>
              <Icon name={lite ? 'shield' : 'shield-check'} size={52} color="#fff" stroke={2.1} />
            </div>
          </div>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{lite ? L('Lite mode active') : L('Active & protected')}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, marginTop: 4 }}>{lite ? L('Your phone pauses while you walk.') : L('Walking + phone use is being watched.')}</div>
          <button onClick={() => ctx.openOverlay()} style={{ marginTop: 16, background: THEME.surface2, border: `1.5px solid ${THEME.border}`, borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: THEME.fg1, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <Icon name="play" size={15} color={THEME.primary} stroke={2.4} /> {L('Preview a safety moment')}
          </button>
        </div>

        {/* mode + sensors */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard }}>
            <Icon name={lite ? 'shield' : 'hand-heart'} size={20} color={THEME.primary} stroke={2.3} />
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>{lite ? L('Lite') : L('Smart')} {L('mode')}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{L('Set by your parent')}</div>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard }}>
            <Icon name="activity" size={20} color={THEME.success} stroke={2.3} />
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>{L('Sensors OK')}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{FEATURES.dangerZones && !lite ? L('Motion · GPS while walking') : L('Motion sensor')}</div>
          </div>
        </div>

        {/* walk detection (F-03) — the motion read that decides when to step in */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="footprints" size={18} color={THEME.primary} stroke={2.3} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>{L('Walking detection')}</span>
            <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.successLight, color: THEME.success, borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 800 }}>
              <span style={{ width: 7, height: 7, borderRadius: 999, background: THEME.success }} />{L('Still right now')}
            </span>
          </div>
          {/* cadence waveform — the walking-rhythm band JoanX listens for */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30, margin: '10px 0 6px' }}>
            {[6, 11, 18, 9, 22, 14, 26, 12, 20, 8, 16, 24, 10, 19, 7].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h, borderRadius: 3, background: i % 2 ? THEME.primaryLight : THEME.border }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.45 }}>{L('JoanX only steps in after ~10 seconds of walking + phone use — not on the bus or in a car.')}</div>
        </div>

        {/* risk score (F-25) — the live value that drives warnings + the parent charts */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Icon name="gauge" size={18} color={THEME.success} stroke={2.3} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>{L('Risk right now')}</span>
            <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: THEME.success }}>{L('Low')}</span>
          </div>
          {/* low → high meter with a marker near the safe end */}
          <div style={{ position: 'relative', height: 10, borderRadius: 999, background: 'linear-gradient(90deg, #4b814f 0%, #d19900 60%, #d14532 100%)' }}>
            <div style={{ position: 'absolute', left: '14%', top: '50%', transform: 'translate(-50%,-50%)', width: 18, height: 18, borderRadius: 999, background: '#fff', border: `3px solid ${THEME.success}`, boxShadow: '0 2px 6px rgba(0,0,0,.18)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7, fontSize: 11, color: THEME.fg3, fontWeight: 700 }}>
            <span>{L('Safe')}</span><span>{L('Risky')}</span>
          </div>
          <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.45, marginTop: 8 }}>{L('This rises if you look at your phone while walking, and drops as you walk safely.')}</div>
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
