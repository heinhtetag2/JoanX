// JoanX — child app · CharacterDex

import React from 'react';
import { SPECIES_INFO, unlockHints, visibleCharacters } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';
import { ScreenHeader, RarityPill, DexProgress, screenBgActive } from './shared.jsx';

// ── Character Encyclopedia (A-4) ─────────────────────────────────────
function CharacterDex({ ctx }) {
  // F-15.2 — hidden Epics are absent from the dex entirely: not a slot, not a silhouette,
  // and not part of the denominator, which would otherwise give their existence away.
  const roster = visibleCharacters();
  const owned = roster.filter(c => c.owned).length;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Encyclopedia')} onBack={() => ctx.nav('collection')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="book-open" size={15} color={THEME.primary} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned}/{roster.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        <DexProgress have={owned} total={roster.length} label="Characters collected" />
        {roster.map(c => {
          const info = SPECIES_INFO[c.species] || {};
          return (
            <div key={c.id} onClick={() => c.owned && ctx.nav('character', { id: c.id })} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10, cursor: c.owned ? 'pointer' : 'default', alignItems: 'center' }}>
              <div style={{ width: 66, flexShrink: 0, display: 'flex', justifyContent: 'center', filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.45)' }}>
                <Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={60} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{c.owned ? c.name : '???'}</span>
                  <RarityPill rarity={c.rarity} />
                </div>
                {c.owned ? (
                  <React.Fragment>
                    <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{L(info.label)} · {L('Stage')} {c.stage} · Lv {c.level}</div>
                    <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 5 }}>{L(info.blurb)}</div>
                  </React.Fragment>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, color: THEME.fg3 }}>
                    <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
                    {/* A-4.1 — the routes are DERIVED from the grant tables (unlockHints), not
                        authored per character, so a locked slot can never promise a way in
                        that the odds or the unlock rules no longer actually offer. */}
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{unlockHints(c).map(L).join(" · ")}</span>
                  </div>
                )}
              </div>
              {c.owned && <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { CharacterDex };
