// JoanX — child app · Help & support (reached from Profile › Account)

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// Answers live here rather than nav targets — a child shouldn't tap three
// levels deep to learn how points work, and it keeps the screen self-contained.
const TOPICS = [
  { q: 'How do I earn safe points?',   a: 'Walk with your phone down. Every safe minute adds points, and a full safe walk gives you a bonus.' },
  { q: 'How do I hatch an egg?',       a: 'Collect enough safe points, then open the Shop and pick an egg. Walk safely to warm it up until it hatches.' },
  { q: 'Why did my screen lock?',      a: 'JoanX locks the screen when you use your phone while walking near a road. Stop walking and it unlocks right away.' },
  { q: 'How do I add a friend?',       a: 'Open Friends, tap Add friend, and share your friend code. Your friend enters it and you are connected.' },
  { q: 'Can I change my buddy?',       a: 'Yes. Open Collection House, tap any buddy you own, and set it as your featured buddy.' },
];

function HelpSupport({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];
  const [open, setOpen] = React.useState(null);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Help & support')} onBack={() => ctx.back()} />
      <div style={{ padding: '0 16px' }}>

        {/* hero — the buddy asks the question, so the screen feels answered-by-a-friend */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={64} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: THEME.fg1 }}>{L('How can we help?')}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 3 }}>{L('Tap a question to see the answer.')}</div>
          </div>
        </div>

        {/* FAQ accordion */}
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Popular topics')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 }}>
          {TOPICS.map((t, i) => {
            const on = open === i;
            return (
              <div key={t.q} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <button onClick={() => setOpen(on ? null : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(t.q)}</span>
                  <Icon name={on ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
                </button>
                {on && <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, padding: '0 14px 13px' }}>{L(t.a)}</div>}
              </div>
            );
          })}
        </div>

        {/* the device is parent-managed, so the real escalation path is the parent */}
        <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Still stuck?')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="hand-heart" size={19} color={THEME.primary} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L('Ask a parent')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.4, marginTop: 1 }}>{L('They can change settings in the JoanX parent app.')}</div>
            </div>
          </div>
          <div style={{ height: 1, background: THEME.border, margin: '0 14px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="mail" size={19} color={THEME.fg2} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L('Contact support')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>help@joanx.app</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: THEME.fg3 }}>
          <Icon name="shield-check" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('We reply within 1–2 days.')}</span>
        </div>
      </div>
    </div>
  );
}

export { HelpSupport };
