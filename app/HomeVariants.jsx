// JoanX — Child Home, alternate layouts.
// Five distinct layout directions for the home screen, all built on the same
// design system (THEME tokens, Mascot, Bar/Badge/Icon, PLAYER/CHARACTERS data)
// so the client can compare real, working alternatives — not flat mockups.
// The original lives in ChildScreens.jsx (ChildHome); App.jsx routes between
// them via the "Home layout" tweak.

// shared activity used by several variants (mirrors ChildHome's "wins")
const HOME_WINS = [
  { icon: 'timer',      color: () => THEME.success, bg: () => THEME.successLight, t: 'Stopped in 2s near Oak St.', s: '+30 bonus points', time: '12m' },
  { icon: 'footprints', color: () => THEME.primary, bg: () => THEME.primaryLight, t: '20 min safe walking',        s: '+200 points',     time: '1h' },
  { icon: 'medal',      color: () => THEME.camping, bg: () => THEME.campingBg,    t: 'Your buddy leveled up',      s: 'New trait unlocked', time: '3h' },
];

// header controls reused across most variants (points + bell)
function HomeActions({ ctx, dark }) {
  const ink = dark ? '#fff' : THEME.fg1;
  const chip = dark ? 'rgba(255,255,255,.18)' : '#fff';
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: chip, padding: '7px 12px', borderRadius: 999, boxShadow: dark ? 'none' : THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
        <Icon name="star" size={16} color={dark ? '#ffe08a' : THEME.gold} fill={dark ? '#ffe08a' : THEME.gold} stroke={2} />
        <span className="game-font" style={{ fontSize: 15, fontWeight: 500, color: ink }}>{PLAYER.points.toLocaleString()}</span>
      </button>
      <button onClick={() => ctx.nav('notifications')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: chip, border: 'none', boxShadow: dark ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="bell" size={19} color={ink} stroke={2} />
        <span style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 999, background: THEME.danger, border: `2px solid ${dark ? shade(THEME.fg1, 10) : '#fff'}` }} />
      </button>
    </div>
  );
}

// small safety pill, dark or light skin
function SafetyPill({ ctx, lite, skin }) {
  const dark = skin === 'glass';
  const ok = !lite;
  const bg = dark ? 'rgba(255,255,255,.16)' : (ok ? THEME.successLight : THEME.warningLight);
  const ink = dark ? '#fff' : (ok ? '#274427' : '#602f0c');
  return (
    <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: bg, borderRadius: 16, padding: '12px 14px', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: ok ? THEME.success : THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={ok ? 'shield-check' : 'shield'} size={20} color="#fff" stroke={2.3} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: ink }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
        <div style={{ fontSize: 12, color: ink, opacity: .85 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
      </div>
      <Icon name="chevron-right" size={18} color={ink} stroke={2.5} />
    </div>
  );
}

function WinsList({ ctx }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {HOME_WINS.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: r.bg(), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={r.icon} size={18} color={r.color()} stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(r.t)}</div>
            <div style={{ fontSize: 12, color: THEME.fg2 }}>{L(r.s)}</div>
          </div>
          <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{r.time}</span>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V1 — SPOTLIGHT · immersive full-bleed buddy hero, glass stat pills,
//      white "sheet" rises up with the goal + wins.
// ══════════════════════════════════════════════════════════════════════
function HomeSpotlight({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const heroBg = `linear-gradient(180deg, ${shade(c.color, 64)} 0%, ${shade(c.color, 96)} 46%, ${THEME.surface2} 100%)`;

  const GlassPill = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(6px)', borderRadius: 18, padding: '12px 14px', boxShadow: THEME.shadowSoft, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={18} color={color} stroke={2.4} />
      </div>
      <div>
        <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{label}</div>
      </div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* full-bleed hero */}
      <div style={{ background: heroBg, padding: '52px 18px 64px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ fontSize: 13, color: THEME.fg1, opacity: .7, fontWeight: 700 }}>{L('Good afternoon')}</span>
            <span className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</span>
          </button>
          <HomeActions ctx={ctx} />
        </div>

        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ textAlign: 'center', cursor: 'pointer', marginTop: 2 }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={172} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: -2 }}>
            <span className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ fontSize: 12.5, color: THEME.fg1, opacity: .68, fontWeight: 600, marginTop: 2 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 240, margin: '12px auto 0' }}>
            <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
          </div>
        </div>
      </div>

      {/* glass stat pills, overlapping the sheet seam */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginTop: -34, position: 'relative', zIndex: 2 }}>
        <GlassPill icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
        <GlassPill icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
      </div>

      {/* white sheet */}
      <div style={{ background: THEME.surface2, borderRadius: '28px 28px 0 0', marginTop: 18, padding: '8px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPill ctx={ctx} lite={lite} /></div>

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        <SectionHead title={L("Today's wins")} />
        <WinsList ctx={ctx} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V2 — BENTO · asymmetric grid of mixed-size tiles.
// ══════════════════════════════════════════════════════════════════════
function HomeBento({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const tile = { borderRadius: 22, padding: 14, boxShadow: THEME.shadowCard, background: '#fff' };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <HomeActions ctx={ctx} />
      </div>

      <div style={{ padding: '10px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* buddy — tall, spans both rows on the left */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ ...tile, gridRow: 'span 2', cursor: 'pointer', background: `linear-gradient(165deg, ${shade(c.color, 76)}, ${THEME.surface} 78%)`, display: 'flex', flexDirection: 'column' }}>
          <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[c.rarity].label)}</Badge>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 4px' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={120} /></div>
          <div className="game-font" style={{ fontSize: 20, fontWeight: 500 }}>{c.name}</div>
          <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginBottom: 8 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
          <div style={{ marginTop: 'auto' }}>
            <Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow height={8} />
            <div className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg2, marginTop: 5 }}>{c.xp}/{c.xpMax} XP</div>
          </div>
        </div>

        {/* points */}
        <div style={{ ...tile, background: `linear-gradient(150deg, ${THEME.goldLight}, #fff)` }}>
          <Icon name="award" size={20} color={THEME.gold} stroke={2.4} />
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 8, lineHeight: 1 }}>{PLAYER.points.toLocaleString()}</div>
          <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{L('Safe points')}</div>
        </div>

        {/* streak */}
        <div style={{ ...tile, background: `linear-gradient(150deg, ${THEME.joyBg}, #fff)` }}>
          <Icon name="flame" size={20} color={THEME.joy} stroke={2.4} />
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 8, lineHeight: 1 }}>{PLAYER.streak}</div>
          <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{L('Day streak')}</div>
        </div>

        {/* safety — wide */}
        <div style={{ gridColumn: 'span 2' }}><SafetyPill ctx={ctx} lite={lite} /></div>

        {/* goal — wide */}
        <div onClick={() => ctx.nav('safety')} style={{ ...tile, gridColumn: 'span 2', cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* wins — wide list */}
        <div style={{ gridColumn: 'span 2', marginTop: 4 }}>
          <SectionHead title={L("Today's wins")} />
          <WinsList ctx={ctx} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V3 — FOCUS · calm, centered, big circular goal ring around the mascot.
// ══════════════════════════════════════════════════════════════════════
function HomeFocus({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const pct = Math.min(1, PLAYER.safeMinutesToday / PLAYER.safeWalkGoal);
  const R = 96, SW = 14, circ = 2 * Math.PI * R;

  const InlineStat = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon name={icon} size={17} color={color} stroke={2.4} style={{ marginBottom: 3 }} />
      <div className="game-font" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      <div style={{ padding: '10px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
          <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
        </button>
        <HomeActions ctx={ctx} />
      </div>

      {/* ring */}
      <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', width: 2 * (R + SW), height: 2 * (R + SW), margin: '14px auto 6px', cursor: 'pointer' }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${2 * (R + SW)} ${2 * (R + SW)}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={c.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${shade(c.color, 40)})` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '0 24px' }}>
        <div className="game-font" style={{ fontSize: 30, fontWeight: 500, color: THEME.fg1 }}>
          {PLAYER.safeMinutesToday}<span style={{ fontSize: 18, color: THEME.fg3 }}> / {PLAYER.safeWalkGoal} {L('min')}</span>
        </div>
        <div style={{ fontSize: 13, color: THEME.fg2, marginTop: 4 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
      </div>

      {/* inline stat strip */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '14px 8px', margin: '18px 16px 14px' }}>
        <InlineStat icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
        <div style={{ width: 1, height: 34, background: THEME.border }} />
        <InlineStat icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
        <div style={{ width: 1, height: 34, background: THEME.border }} />
        <InlineStat icon="trending-up" color={THEME.primary} value={`${c.xp}`} label={`XP → ${L('Stage')} ${Math.min(3, c.stage + 1)}`} />
      </div>

      <div style={{ padding: '0 16px' }}>
        <div style={{ marginBottom: 14 }}><SafetyPill ctx={ctx} lite={lite} /></div>
        <SectionHead title={L("Today's wins")} />
        <WinsList ctx={ctx} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V4 — TIMELINE · compact inline header + vertical activity feed.
// ══════════════════════════════════════════════════════════════════════
function HomeTimeline({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const feed = [
    { icon: 'sun',        color: THEME.gold,    bg: THEME.goldLight,    t: 'Daily reward ready', s: 'Claim +100 points for walking safely.', time: 'now' },
    { icon: 'timer',      color: THEME.success, bg: THEME.successLight,  t: 'Stopped in 2s near Oak St.', s: 'Quick reflex — +30 bonus points.', time: '12m' },
    { icon: 'footprints', color: THEME.primary, bg: THEME.primaryLight,  t: '20 min safe walking', s: 'Phone-free the whole way. +200 points.', time: '1h' },
    { icon: 'medal',      color: THEME.camping, bg: THEME.campingBg,     t: 'Your buddy leveled up', s: `${c.name} reached Level ${c.level}.`, time: '3h' },
    { icon: 'flame',      color: THEME.joy,     bg: THEME.joyBg,         t: '5-day safe streak!', s: '2 more days unlocks a Special buddy.', time: 'Yest.' },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      {/* compact buddy header card */}
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: `linear-gradient(110deg, ${shade(c.color, 78)}, ${THEME.surface} 88%)`, borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => ctx.nav('character', { id: c.id })} style={{ width: 56, height: 56, borderRadius: 16, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: 'none', cursor: 'pointer', boxShadow: THEME.shadowCard }}><Mascot species={c.species} stage={c.stage} color={c.color} size={50} /></button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}, {PLAYER.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="game-font" style={{ fontSize: 18, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>· {L('Level')} {c.level}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
              <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} height={7} /></div>
              <span className="game-font" style={{ fontSize: 10.5, fontWeight: 500, color: THEME.fg2 }}>{c.xp}/{c.xpMax}</span>
            </div>
          </div>
          <HomeActions ctx={ctx} />
        </div>
      </div>

      {/* stat chips */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px 2px' }}>
        {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')], ['flame', THEME.joy, PLAYER.streak, L('Day streak')], ['footprints', c.color, `${PLAYER.safeMinutesToday}${L('min')}`, L('min')]].map((s, i) => (
          <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: THEME.shadowCard, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={s[0]} size={16} color={s[1]} stroke={2.4} />
            <div className="game-font" style={{ fontSize: 15, fontWeight: 500 }}>{s[2]}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ marginBottom: 16 }}><SafetyPill ctx={ctx} lite={lite} /></div>

        <SectionHead title={L("Today")} />
        {/* the timeline rail */}
        <div style={{ position: 'relative', paddingLeft: 4 }}>
          <div style={{ position: 'absolute', left: 21, top: 14, bottom: 14, width: 2, background: THEME.border }} />
          {feed.map((f, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: i === feed.length - 1 ? 0 : 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: `0 0 0 4px ${THEME.surface2}` }}>
                <Icon name={f.icon} size={18} color={f.color} stroke={2.3} />
              </div>
              <div style={{ flex: 1, background: '#fff', borderRadius: 14, boxShadow: THEME.shadowCard, padding: '11px 13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(f.t)}</span>
                  <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, flexShrink: 0 }}>{f.time}</span>
                </div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4 }}>{L(f.s)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V5 — ARCADE · chunky, colorful, kid-game with horizontal carousels.
// ══════════════════════════════════════════════════════════════════════
function HomeArcade({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const buddies = CHARACTERS.filter(x => x.owned);

  const stats = [
    { icon: 'award',      color: THEME.gold,    bg: THEME.goldLight,  value: PLAYER.points.toLocaleString(), label: L('Safe points') },
    { icon: 'flame',      color: THEME.joy,     bg: THEME.joyBg,      value: PLAYER.streak,                  label: L('Day streak') },
    { icon: 'footprints', color: THEME.primary, bg: THEME.primaryLight, value: PLAYER.safeMinutesToday,        label: L('Min safe') },
    { icon: 'gem',        color: THEME.camping, bg: THEME.campingBg,  value: buddies.length,                 label: L('Buddies') },
  ];
  const actions = [
    { icon: 'layout-grid', color: THEME.primary, bg: THEME.primaryLight, label: L('Collection'), go: 'collection' },
    { icon: 'swords',      color: THEME.joy,     bg: THEME.joyBg,        label: L('Battle'),     go: 'battle' },
    { icon: 'trophy',      color: THEME.gold,    bg: THEME.goldLight,    label: L('Rewards'),    go: 'rewards' },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      <div style={{ padding: '8px 16px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <HomeActions ctx={ctx} />
      </div>

      {/* big playful buddy hero */}
      <div style={{ padding: '8px 16px 0' }}>
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', borderRadius: 28, padding: '16px 18px 18px', cursor: 'pointer', overflow: 'hidden', background: `linear-gradient(150deg, ${shade(c.color, 40)}, ${shade(c.color, 96)})`, boxShadow: `0 14px 30px ${shade(c.color, 60)}99` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={118} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1, marginTop: 6 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: THEME.fg1, opacity: .7, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9 }}>
                <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color="#fff" track="rgba(255,255,255,.4)" glow height={9} /></div>
                <span className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* buddy switcher carousel */}
      <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '14px 16px 4px', WebkitOverflowScrolling: 'touch' }} className="no-sb">
        {buddies.map(b => {
          const on = b.id === c.id;
          return (
            <button key={b.id} onClick={() => ctx.setBuddy(b.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0, width: 60 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: shade(b.color, 90), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: on ? `0 0 0 3px ${b.color}` : THEME.shadowCard }}><Mascot species={b.species} stage={b.stage} color={b.color} size={52} /></div>
              <span style={{ fontSize: 11, fontWeight: on ? 800 : 600, color: on ? THEME.fg1 : THEME.fg2, whiteSpace: 'nowrap' }}>{b.name}</span>
            </button>
          );
        })}
      </div>

      {/* stat carousel */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '8px 16px 4px', WebkitOverflowScrolling: 'touch' }} className="no-sb">
        {stats.map((s, i) => (
          <div key={i} style={{ flexShrink: 0, width: 116, background: `linear-gradient(150deg, ${s.bg}, #fff)`, borderRadius: 20, padding: 14, boxShadow: THEME.shadowCard }}>
            <div style={{ width: 34, height: 34, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon name={s.icon} size={18} color={s.color} stroke={2.4} /></div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPill ctx={ctx} lite={lite} /></div>

        {/* goal */}
        <div style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* chunky quick actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {actions.map((a, i) => (
            <button key={i} onClick={() => ctx.nav(a.go)} style={{ flex: 1, background: '#fff', border: 'none', borderRadius: 20, padding: '16px 8px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 16, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={a.icon} size={22} color={a.color} stroke={2.3} /></div>
              <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1 }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// router used by App.jsx — picks the layout from the "Home layout" tweak.
const HOME_LAYOUTS = [
  { id: 'original', label: 'Original' },
  { id: 'spotlight', label: 'Spotlight' },
  { id: 'bento', label: 'Bento' },
  { id: 'focus', label: 'Focus' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'arcade', label: 'Arcade' },
];
function HomeVariant({ variant, ctx }) {
  switch (variant) {
    case 'spotlight': return <HomeSpotlight ctx={ctx} />;
    case 'bento':     return <HomeBento ctx={ctx} />;
    case 'focus':     return <HomeFocus ctx={ctx} />;
    case 'timeline':  return <HomeTimeline ctx={ctx} />;
    case 'arcade':    return <HomeArcade ctx={ctx} />;
    default:          return <ChildHome ctx={ctx} />;
  }
}

Object.assign(window, { HomeSpotlight, HomeBento, HomeFocus, HomeTimeline, HomeArcade, HomeVariant, HOME_LAYOUTS });
