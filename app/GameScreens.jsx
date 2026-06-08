// JoanX — game screens part 1: Collection House + Character detail/customize/evolve.

function ScreenHeader({ title, onBack, right }) {
  return (
    <div style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 4, height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', background: 'rgba(248,247,247,.92)', backdropFilter: 'blur(8px)' }}>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <button onClick={onBack} aria-label="Back" style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
        </button>
      </div>
      <div style={{ flexShrink: 0, fontSize: 16, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap', textAlign: 'center' }}>{title}</div>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>{right}</div>
    </div>
  );
}

// ── Collection House ─────────────────────────────────────────────────
function Collection({ ctx }) {
  const owned = CHARACTERS.filter(c => c.owned);
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.surface2 }}>
      <ScreenHeader title={L('Collection House')} onBack={() => ctx.back()} right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="gem" size={15} color={THEME.gold} stroke={2.3} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{owned.length}/8</span></div>} />
      <div style={{ padding: '0 16px' }}>
        {ROOMS.map(room => {
          const placed = owned.filter(c => c.room === room.id);
          return (
            <div key={room.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{L(room.name)}</span>
                  {!room.unlocked && <Icon name="lock" size={14} color={THEME.fg3} stroke={2.3} />}
                </div>
                <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{room.unlocked ? `${placed.length}/${room.slots}` : L('Locked')}</span>
              </div>

              {room.unlocked ? (
                <div style={{ borderRadius: 22, padding: '20px 14px 14px', background: `linear-gradient(180deg, ${room.theme} 0%, #fff 100%)`, boxShadow: THEME.shadowCard, position: 'relative', overflow: 'hidden' }}>
                  {/* shelf */}
                  <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
                    {Array.from({ length: room.slots }).map((_, i) => {
                      const c = placed[i];
                      return c ? (
                        <button key={i} onClick={() => ctx.nav('character', { id: c.id })} style={{ flex: 1, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 0 }}>
                          <Mascot species={c.species} stage={c.stage} color={c.color} size={74} />
                          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
                          <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 3, fontSize: 9.5, padding: '2px 7px' }}>Lv{c.level}</Badge>
                        </button>
                      ) : (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 110 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 18, border: `2px dashed ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="plus" size={22} color={THEME.fg3} stroke={2.2} />
                          </div>
                          <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 6 }}>{L('Empty')}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* shelf line */}
                  <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.05)', marginTop: 6 }} />
                </div>
              ) : (
                <div style={{ borderRadius: 22, padding: 22, background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="lock" size={22} color={THEME.fg3} stroke={2.2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{L(room.name)}</div>
                    <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L(room.req)}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* all characters grid incl. locked */}
        <SectionHead title={L('All buddies')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {CHARACTERS.map(c => (
            <button key={c.id} disabled={!c.owned} onClick={() => c.owned && ctx.nav('character', { id: c.id })} style={{ background: '#fff', borderRadius: 18, padding: '12px 6px 10px', boxShadow: THEME.shadowCard, border: 'none', cursor: c.owned ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {!c.owned && <div style={{ position: 'absolute', top: 8, right: 8 }}><Icon name="lock" size={13} color={THEME.fg3} stroke={2.4} /></div>}
              <div style={{ filter: c.owned ? 'none' : 'grayscale(1) brightness(1.7) opacity(.5)' }}>
                <Mascot species={c.species} stage={c.owned ? c.stage : 1} color={c.color} size={62} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{c.owned ? c.name : '???'}</div>
              <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'} style={{ marginTop: 4, fontSize: 9, padding: '2px 6px' }}>{L(RARITY[c.rarity].label)}</Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Character detail / customize / evolve ────────────────────────────
function CharacterDetail({ ctx }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params.id) || CHARACTERS[0];
  const [color, setColor] = React.useState(orig.color);
  const [stage, setStage] = React.useState(orig.stage);
  const [level, setLevel] = React.useState(orig.level);
  const [evolving, setEvolving] = React.useState(false);
  const canEvolve = stage < 3 && orig.xp / orig.xpMax > 0.6;

  const swatches = ['#e1874a', '#9867e4', '#67c7ce', '#e278a8', '#6697c9', '#ffbc05', '#a8c3eb', '#e86f5f'];
  const items = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', on: stage >= 2 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', on: stage >= 3 },
    { id: 'hat', icon: 'crown', name: 'Star Crown', on: false, locked: true },
    { id: 'glasses', icon: 'glasses', name: 'Cool Shades', on: false, locked: true },
  ];

  const doEvolve = () => {
    setEvolving(true);
    setTimeout(() => { setStage(s => Math.min(3, s + 1)); setLevel(l => l + 5); }, 900);
    setTimeout(() => setEvolving(false), 2400);
  };

  const traits = [
    { k: 'guard', label: 'Guard', icon: 'shield', color: THEME.primary },
    { k: 'speed', label: 'Speed', icon: 'gauge', color: THEME.gold },
    { k: 'heart', label: 'Heart', icon: 'heart', color: THEME.joy },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.surface2 }}>
      <ScreenHeader title={orig.name} onBack={() => ctx.back()} right={<button onClick={() => ctx.nav('battle')} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="swords" size={18} color={THEME.joy} stroke={2.2} /></button>} />

      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ borderRadius: 24, padding: '18px', background: `linear-gradient(165deg, ${shade(color, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Badge variant={orig.rarity === 'special' ? 'special' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
            <Badge variant="gold">{L('Stage')} {stage}</Badge>
          </div>
          <div className={evolving ? 'jx-pop' : 'jx-float'} style={{ display: 'flex', justifyContent: 'center', filter: evolving ? `drop-shadow(0 0 24px ${color})` : 'none', transition: 'filter .4s' }}>
            <Mascot species={orig.species} stage={stage} color={color} size={172} />
          </div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, marginTop: 4 }}>{orig.name}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {level}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
            <div style={{ flex: 1 }}><Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500 }}>{orig.xp}/{orig.xpMax}</span>
          </div>
        </div>

        {/* evolve CTA */}
        <div style={{ margin: '14px 0' }}>
          {stage < 3 ? (
            <Button variant={canEvolve ? 'gold' : 'outline'} size="lg" fullWidth icon={canEvolve ? 'sprout' : 'lock'} onClick={canEvolve ? doEvolve : undefined} disabled={!canEvolve}>
              {canEvolve ? `${L('Evolve to Stage')} ${stage + 1}` : `${L('Reach')} ${orig.xpMax} XP ${L('to evolve')}`}
            </Button>
          ) : (
            <div style={{ textAlign: 'center', background: THEME.successLight, color: '#274427', borderRadius: 16, padding: '12px', fontWeight: 800, fontSize: 14 }}>{L('Fully evolved — max stage!')}</div>
          )}
        </div>

        {/* traits */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Battle traits')}</div>
          {traits.map(t => (
            <div key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Icon name={t.icon} size={16} color={t.color} stroke={2.3} />
              <span style={{ fontSize: 12.5, fontWeight: 700, width: 48 }}>{L(t.label)}</span>
              <div style={{ flex: 1 }}><Bar value={orig.traits[t.k] || 50} max={100} color={t.color} height={8} /></div>
              <span className="game-font" style={{ fontSize: 12, fontWeight: 500, width: 24, textAlign: 'right' }}>{orig.traits[t.k] || 50}</span>
            </div>
          ))}
        </div>

        {/* customize color */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Color')}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {swatches.map(s => (
              <button key={s} onClick={() => setColor(s)} style={{ width: 38, height: 38, borderRadius: 999, background: s, border: color === s ? `3px solid ${THEME.fg1}` : '3px solid #fff', boxShadow: THEME.shadowCard, cursor: 'pointer' }} />
            ))}
          </div>
        </div>

        {/* customize items */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 12 }}>{L('Items')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {items.map(it => (
              <div key={it.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: 16, background: it.on ? THEME.primaryLight : THEME.surface2, border: it.on ? `2px solid ${THEME.primary}` : `2px solid transparent`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <Icon name={it.locked ? 'lock' : it.icon} size={20} color={it.locked ? THEME.fg3 : it.on ? THEME.primary : THEME.fg2} stroke={2.2} />
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
              </div>
            ))}
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
      </div>

      {/* evolve flash */}
      {evolving && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.4)' }} className="jx-fade">
          <Confetti n={20} />
          <div style={{ textAlign: 'center' }}>
            <div className="game-font" style={{ color: '#fff', fontSize: 30, fontWeight: 500, textShadow: '0 2px 12px rgba(0,0,0,.4)' }}>{L('Evolving!')}</div>
            <div className="game-font" style={{ color: '#fff', fontSize: 15, fontWeight: 500, marginTop: 6, opacity: .92 }}>{L('Stage')} {stage} · {L('Level')} {level}</div>
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Collection, CharacterDetail, ScreenHeader });
