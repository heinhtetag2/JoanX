// JoanX — child app · achievement unlock moment
//
// The celebration the child sees the instant a badge is earned. A badge that
// appears silently in the Collection is a reward no one noticed — so the earn
// is its own full-screen moment: the medallion drops in, points are paid, and
// the child is invited straight to the shelf it now sits on.
//
// It reuses the Badges layer for the medallion (BadgeArt + tierOf), so the badge
// shown here is the SAME object the grid and the detail sheet render — never a
// second drawing that could drift. The backdrop is brand green, not the tier
// colour: hero surfaces stay brand green, the tier reads only on the medallion
// and its pill (see the green-brand direction).

import React from 'react';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { shade } from '../core/characters.jsx';
import { Confetti } from './shared.jsx';
import { BadgeArt, tierOf } from './Badges.jsx';

// How long the moment holds before it auto-dismisses if the child does nothing.
// Long enough to read the badge and see the points land, short enough that it
// never becomes a screen you wait on.
const UNLOCK_MS = 4200;

// One earned badge, celebrated. `a` is an ACHIEVEMENTS row (the same shape the
// grid uses); `onClose` dismisses; `onView` jumps to the Badges shelf.
function AchievementUnlock({ a, onClose, onView }) {
  const t = tierOf(a);
  // auto-dismiss so a preview (or a real unlock left untouched) doesn't sit forever
  React.useEffect(() => {
    const id = setTimeout(() => onClose && onClose(), UNLOCK_MS);
    return () => clearTimeout(id);
  }, [a, onClose]);

  return (
    <div className="jx-dim-in" style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', color: '#fff',
      background: `radial-gradient(circle at 50% 38%, ${shade(THEME.brand, 20)} 0%, ${THEME.brand} 58%, ${shade(THEME.brand, -26)} 100%)` }}>
      <Confetti n={26} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
        {/* kicker — names the moment before the badge reads, so the child knows
            what just happened, not only what they got */}
        <div className="jx-content-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,.9)', marginBottom: 20 }}>
          <Icon name="award" size={16} color="#fff" stroke={2.6} />{L('New badge earned')}
        </div>

        {/* the medallion — burst glow behind, the badge dropping in on top. Keyed on
            the badge id so switching the previewed badge replays the drop. */}
        <div className="jx-char-in" style={{ position: 'relative', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: 'radial-gradient(circle, rgba(255,255,255,.34) 0%, transparent 66%)' }} />
          <div key={a.id} className="jx-pop"><BadgeArt a={a} size={150} /></div>
        </div>

        {/* name + tier — the tier pill is a white chip with the tier's own colour
            for the text, the same pairing the badge detail sheet uses */}
        {/* explicit colour — the global `h2 { color: var(--fg1) }` rule overrides the white
            this would otherwise inherit from the overlay, so set it here */}
        <h2 className="game-font" style={{ fontSize: 28, fontWeight: 500, margin: 0, color: '#fff' }}>{L(a.name)}</h2>
        <div className="jx-content-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff', borderRadius: 999, padding: '5px 12px', marginTop: 12, animationDelay: '.08s' }}>
          <Icon name="medal" size={12} color={t.ring} stroke={2.6} />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: t.ring }}>{L(t.label)}</span>
        </div>
        {a.desc && (
          <p className="jx-content-in" style={{ fontSize: 14, color: 'rgba(255,255,255,.9)', lineHeight: 1.5, margin: '12px 0 0', maxWidth: 260, animationDelay: '.12s' }}>{L(a.desc)}</p>
        )}

        {/* the points it paid — the reward is part of the moment, not a number to
            discover later on the Rewards screen */}
        <div className="jx-content-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,.16)', borderRadius: 14, padding: '10px 16px', marginTop: 18, animationDelay: '.18s' }}>
          <Icon name="star" size={16} color={THEME.gold} stroke={2.6} />
          <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>+{a.reward} {L('points')}</span>
        </div>
      </div>

      {/* two exits — collect and stay where you are, or go look at the shelf it
          joined. Collect leads as the solid action; View badges is the ghost. */}
      <div style={{ padding: '0 22px calc(env(safe-area-inset-bottom) + 22px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={onClose} style={{ width: '100%', padding: '15px 28px', borderRadius: 16, border: 'none', background: '#fff', color: THEME.brand, fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
          {L('Claim')}
        </button>
        {onView && (
          <button onClick={onView} style={{ width: '100%', padding: '15px 28px', borderRadius: 16, border: '1.5px solid rgba(255,255,255,.6)', background: 'transparent', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            {L('View badges')}
          </button>
        )}
      </div>
    </div>
  );
}

export { AchievementUnlock };
