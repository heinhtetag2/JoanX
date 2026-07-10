// JoanX — child app · Encyclopedia (도감) layout explorations (10 variants)
// One data model (every buddy, owned or locked), ten different presentations.
// Switch via the Tweaks panel ("Dex layout"). Baseline 'list' lives in
// CharacterDex.jsx; everything below is an alternative reading of the same set.

import React from 'react';
import { CHARACTERS, SPECIES_INFO } from '../core/data.jsx';
import { Bar, Badge, Icon, RARITY, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, RarityPill, DexProgress, screenBgActive } from './shared.jsx';

const DEX_LAYOUTS = [
  { id: 'list', label: 'List' },
  { id: 'grid', label: 'Grid' },
  { id: 'cards', label: 'Cards' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'compact', label: 'Compact' },
  { id: 'stats', label: 'Stats' },
  { id: 'rarity', label: 'By rarity' },
  { id: 'species', label: 'By species' },
  { id: 'carousel', label: 'Carousel' },
  { id: 'tiles', label: 'Tiles' },
  { id: 'codex', label: 'Codex' },
];

// locked buddies read as a greyed silhouette everywhere
const lockedFilter = (owned) => owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.45)';
const nameOf = (c) => c.owned ? c.name : '???';
const infoOf = (c) => SPECIES_INFO[c.species] || {};

function LockedNote({ c }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.fg3 }}>
      <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
      <span style={{ fontSize: 12, fontWeight: 600 }}>{L(c.locked || 'Not yet discovered')}</span>
    </div>
  );
}

// the sub-line every variant reuses: species · stage · level
function MetaLine({ c, style }) {
  const info = infoOf(c);
  return <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, ...style }}>{L(info.label)} · {L('Stage')} {c.stage} · Lv {c.level}</div>;
}

function CharacterDexVariant({ variant = 'grid', ctx }) {
  const all = CHARACTERS;
  const owned = all.filter(c => c.owned).length;
  const open = (c) => c.owned && ctx.nav('character', { id: c.id });

  let body;

  // 1 · GRID — 3-up tiles, the classic pokédex sheet
  if (variant === 'grid') body = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
      {all.map(c => (
        <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ background: '#fff', borderRadius: 18, padding: '12px 6px 10px', boxShadow: THEME.shadowCard, border: 'none', cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', fontFamily: 'inherit' }}>
          {!c.owned && <div style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="lock" size={13} color={THEME.fg3} stroke={2.4} /></div>}
          <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={62} /></div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{nameOf(c)}</div>
          <Badge variant={c.rarity === 'epic' ? 'epic' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 4, fontSize: 9, padding: '2px 6px' }}>{L(RARITY[c.rarity].label)}</Badge>
        </button>
      ))}
    </div>
  );

  // 2 · CARDS — one tall card each, mascot on a colour-washed disc
  else if (variant === 'cards') body = all.map(c => (
    <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ width: '100%', textAlign: 'left', fontFamily: 'inherit', border: 'none', cursor: c.owned ? 'pointer' : 'default', background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 78, height: 78, borderRadius: 999, background: c.owned ? shade(c.color, 76) : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={70} /></div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 17, fontWeight: 800 }}>{nameOf(c)}</span>
            <RarityPill rarity={c.rarity} />
          </div>
          {c.owned ? <MetaLine c={c} style={{ marginTop: 3 }} /> : <div style={{ marginTop: 5 }}><LockedNote c={c} /></div>}
        </div>
      </div>
      {c.owned && <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 12 }}>{L(infoOf(c).blurb)}</div>}
    </button>
  ));

  // 3 · GALLERY — 2-up posters, each washed in the buddy's own colour
  else if (variant === 'gallery') body = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
      {all.map(c => (
        <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ border: 'none', fontFamily: 'inherit', cursor: c.owned ? 'pointer' : 'default', borderRadius: 20, padding: '18px 12px 14px', boxShadow: THEME.shadowCard, background: c.owned ? `linear-gradient(180deg, ${shade(c.color, 74)} 0%, #fff 78%)` : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={88} /></div>
          <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 6 }}>{nameOf(c)}</div>
          {c.owned
            ? <div style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{L(infoOf(c).label)} · Lv {c.level}</div>
            : <div style={{ marginTop: 4 }}><LockedNote c={c} /></div>}
          <RarityPill rarity={c.rarity} />
        </button>
      ))}
    </div>
  );

  // 4 · COMPACT — dense one-line rows, whole set visible at a glance
  else if (variant === 'compact') body = (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {all.map((c, i) => (
        <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: 'none', border: 'none', cursor: c.owned ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 38, height: 38, flexShrink: 0, filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={38} /></div>
          <span style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 800 }}>{nameOf(c)}</span>
          {c.owned
            ? <React.Fragment>
                <RarityPill rarity={c.rarity} />
                <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg2, width: 34, textAlign: 'right' }}>Lv{c.level}</span>
              </React.Fragment>
            : <Icon name="lock" size={14} color={THEME.fg3} stroke={2.3} />}
        </button>
      ))}
    </div>
  );

  // 5 · STATS — every row carries its XP progress toward the next stage
  else if (variant === 'stats') body = all.map(c => (
    <div key={c.id} onClick={() => open(c)} style={{ background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 10, cursor: c.owned ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, flexShrink: 0, filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={48} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14.5, fontWeight: 800 }}>{nameOf(c)}</span>
            <RarityPill rarity={c.rarity} />
          </div>
          {c.owned ? <MetaLine c={c} style={{ marginTop: 2 }} /> : <div style={{ marginTop: 4 }}><LockedNote c={c} /></div>}
        </div>
        {c.owned && <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg3 }}>{c.xp}/{c.xpMax}</span>}
      </div>
      {c.owned && <div style={{ marginTop: 10 }}><Bar value={c.xp} max={c.xpMax} color={c.color} height={7} /></div>}
    </div>
  ));

  // 6 · BY RARITY — grouped into Common / Rare / Special shelves
  else if (variant === 'rarity') body = ['epic', 'rare', 'common'].map(rar => {
    const group = all.filter(c => c.rarity === rar);
    if (!group.length) return null;
    return (
      <div key={rar} style={{ marginBottom: 6 }}>
        <SectionHead title={`${L(RARITY[rar].label)} · ${group.length}`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
          {group.map(c => (
            <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ background: '#fff', borderRadius: 16, padding: '10px 6px', border: `1.5px solid ${RARITY[rar].bg}`, boxShadow: THEME.shadowCard, cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit' }}>
              <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={56} /></div>
              <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 3 }}>{nameOf(c)}</div>
            </button>
          ))}
        </div>
      </div>
    );
  });

  // 7 · BY SPECIES — the dex read as a family tree, one shelf per species
  else if (variant === 'species') body = Object.keys(SPECIES_INFO).map(sp => {
    const group = all.filter(c => c.species === sp);
    if (!group.length) return null;
    const info = SPECIES_INFO[sp];
    return (
      <div key={sp} style={{ background: '#fff', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{L(info.label)}</span>
          <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{group.filter(c => c.owned).length}/{group.length}</span>
        </div>
        <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 4 }}>{L(info.blurb)}</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
          {group.map(c => (
            <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ border: 'none', background: 'transparent', padding: 0, cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'inherit', width: 62 }}>
              <div style={{ width: 54, height: 54, borderRadius: 999, background: c.owned ? shade(c.color, 76) : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={50} /></div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 4 }}>{nameOf(c)}</div>
            </button>
          ))}
        </div>
      </div>
    );
  });

  // 8 · CAROUSEL — a featured buddy up top, the rest as a swipeable strip
  else if (variant === 'carousel') {
    const [lead, ...rest] = all;
    body = (
      <React.Fragment>
        <button disabled={!lead.owned} onClick={() => open(lead)} style={{ width: '100%', border: 'none', fontFamily: 'inherit', cursor: lead.owned ? 'pointer' : 'default', borderRadius: 24, padding: '22px 16px 18px', marginBottom: 16, boxShadow: THEME.shadowCard, background: lead.owned ? `linear-gradient(180deg, ${shade(lead.color, 72)} 0%, #fff 82%)` : '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ filter: lockedFilter(lead.owned) }}><Mascot species={lead.species} stage={lead.owned ? lead.stage : 1} color={lead.color} size={124} /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 19, fontWeight: 800 }}>{nameOf(lead)}</span>
            <RarityPill rarity={lead.rarity} />
          </div>
          {lead.owned && <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.45, marginTop: 6, textAlign: 'center', maxWidth: 260 }}>{L(infoOf(lead).blurb)}</div>}
        </button>
        <SectionHead title={L('All buddies')} />
        <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 2px 8px', margin: '0 -2px' }}>
          {rest.map(c => (
            <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ flexShrink: 0, width: 116, borderRadius: 18, border: 'none', fontFamily: 'inherit', cursor: c.owned ? 'pointer' : 'default', background: '#fff', boxShadow: THEME.shadowCard, padding: '14px 8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={68} /></div>
              <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 5 }}>{nameOf(c)}</div>
              <RarityPill rarity={c.rarity} />
            </button>
          ))}
        </div>
      </React.Fragment>
    );
  }

  // 9 · TILES — 2-up solid colour tiles, mascot bleeding off the corner
  else if (variant === 'tiles') body = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
      {all.map(c => (
        <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ position: 'relative', overflow: 'hidden', minHeight: 128, border: 'none', fontFamily: 'inherit', textAlign: 'left', cursor: c.owned ? 'pointer' : 'default', borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, background: c.owned ? shade(c.color, 80) : THEME.surface2 }}>
          <div style={{ position: 'absolute', right: -12, bottom: -10, filter: lockedFilter(c.owned) }}>
            <Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={86} />
          </div>
          <div style={{ position: 'relative', fontSize: 14.5, fontWeight: 800 }}>{nameOf(c)}</div>
          {c.owned
            ? <div style={{ position: 'relative', fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>Lv {c.level}</div>
            : <div style={{ position: 'relative', marginTop: 3 }}><Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} /></div>}
          <div style={{ position: 'relative', marginTop: 6 }}><RarityPill rarity={c.rarity} /></div>
        </button>
      ))}
    </div>
  );

  // 10 · CODEX — numbered catalogue entries, the most "encyclopedia" reading
  else if (variant === 'codex') body = (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {all.map((c, i) => (
        <button key={c.id} disabled={!c.owned} onClick={() => open(c)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', background: 'none', border: 'none', cursor: c.owned ? 'pointer' : 'default', fontFamily: 'inherit', textAlign: 'left' }}>
          <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg3, width: 32, flexShrink: 0 }}>
            {'No.' + String(i + 1).padStart(2, '0')}
          </span>
          <div style={{ width: 44, height: 44, flexShrink: 0, filter: lockedFilter(c.owned) }}><Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={44} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{nameOf(c)}</div>
            {c.owned
              ? <div style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, marginTop: 1 }}>{L(infoOf(c).label)} · Lv {c.level}</div>
              : <div style={{ marginTop: 2 }}><LockedNote c={c} /></div>}
          </div>
          {c.owned && <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />}
        </button>
      ))}
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Encyclopedia')} onBack={() => ctx.nav('collection')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="book-open" size={15} color={THEME.primary} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned}/{all.length}</span></div>} />
      <div style={{ padding: '0 16px' }}>
        <DexProgress have={owned} total={all.length} label="Characters collected" />
        {body}
      </div>
    </div>
  );
}

export { CharacterDexVariant, DEX_LAYOUTS };
