// JoanX — Child Home, "Simple Layout" set.
// A standalone DUPLICATE of the 6 home layouts (Original + the 5 in
// HomeVariants.jsx). Kept fully independent — its own helper copies and
// components — so we can simplify/modify this set without touching the
// originals. Routed via App.jsx ("Home layout" → Simple row, ids "simple-*").

// ── duplicated helpers (suffixed _S so they never clash with the originals)
const HOME_WINS_S = [
  { icon: 'timer',      color: () => THEME.success, bg: () => THEME.successLight, t: 'Stopped in 2s near Oak St.', s: '+30 bonus points', time: '12m' },
  { icon: 'footprints', color: () => THEME.primary, bg: () => THEME.primaryLight, t: '20 min safe walking',        s: '+200 points',     time: '1h' },
  { icon: 'medal',      color: () => THEME.camping, bg: () => THEME.campingBg,    t: 'Your buddy leveled up',      s: 'New trait unlocked', time: '3h' },
];

function HomeActionsS({ ctx, dark }) {
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

function SafetyPillS({ ctx, lite, skin }) {
  const dark = skin === 'glass';
  const ok = !lite;
  // warm amber palette for the protected state (matches the old Lite look)
  const bg = dark ? 'rgba(255,255,255,.16)' : THEME.warningLight;
  const ink = dark ? '#fff' : '#602f0c';
  return (
    <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: bg, borderRadius: 16, padding: '12px 14px', cursor: 'pointer' }}>
      <div style={{ width: 36, height: 36, borderRadius: 11, background: THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

function WinsListS({ ctx }) {
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
      {HOME_WINS_S.map((r, i) => (
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

// duplicated stat tile (mirrors ChildScreens' StatCard) for the Original copy
function StatCardS({ icon, color, bg, value, label, big }) {
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard }}>
      <div style={{ width: 34, height: 34, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
        <Icon name={icon} size={18} color={color} stroke={2.4} />
      </div>
      <div className="game-font" style={{ fontSize: big ? 26 : 22, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · ORIGINAL  (copy of ChildHome)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleOriginal({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        {/* character hero */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', borderRadius: 24, padding: '18px 18px 20px', marginBottom: 14, cursor: 'pointer', overflow: 'hidden', background: `linear-gradient(160deg, ${shade(c.color, 78)} 0%, ${THEME.surface} 70%)`, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Badge variant={c.rarity === 'special' ? 'special' : c.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[c.rarity].label)}</Badge>
              <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 8 }}>{c.name}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
            </div>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0 10px' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>XP</span>
            <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color={THEME.gold} glow /></div>
            <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatCardS icon="award" color={THEME.gold} bg={THEME.goldLight} value={(PLAYER.safeMinutesToday * SAFE_PT_PER_MIN).toLocaleString()} label={L('Points today')} big />
          <StatCardS icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Safe days')} big />
        </div>

        {/* safe-walk points today — F-13 */}
        <div onClick={() => ctx.tabTo('rewards')} style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L('Safe walking today')}
            </span>
            <span className="game-font" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', padding: '5px 11px', borderRadius: 999, fontWeight: 500, fontSize: 13 }}><Icon name="star" size={13} color={THEME.gold} fill={THEME.gold} stroke={2} />+{(PLAYER.safeMinutesToday * SAFE_PT_PER_MIN).toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 12, color: THEME.fg2 }}>{PLAYER.safeMinutesToday} {L('min phone-free')} · {SAFE_PT_PER_MIN} {L('points per safe minute')}</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · SPOTLIGHT
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleSpotlight({ ctx }) {
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
      <div style={{ background: heroBg, padding: '52px 18px 64px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <span style={{ fontSize: 13, color: THEME.fg1, opacity: .7, fontWeight: 700 }}>{L('Good afternoon')}</span>
            <span className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</span>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ textAlign: 'center', cursor: 'pointer', marginTop: 2 }}>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
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

      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginTop: -34, position: 'relative', zIndex: 2 }}>
        <GlassPill icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
        <GlassPill icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
      </div>

      <div style={{ background: THEME.surface2, borderRadius: '28px 28px 0 0', marginTop: 18, padding: '8px 16px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

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
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · MAP  (walk-safety map leads; buddy + goal live in a bottom sheet)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleMap({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ok = !lite;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* MAP HERO */}
      <div style={{ position: 'relative', height: 430, overflow: 'hidden', background: 'linear-gradient(160deg, #eef2ee 0%, #e7edf2 100%)' }}>
        {/* roads + safe route */}
        <svg width="100%" height="430" style={{ position: 'absolute', inset: 0 }} preserveAspectRatio="xMidYMid slice">
          <rect x="44" y="70" width="120" height="120" rx="10" fill="#e2e7e1" />
          <rect x="232" y="120" width="150" height="140" rx="10" fill="#e2e7e1" />
          <rect x="60" y="250" width="140" height="120" rx="10" fill="#e2e7e1" />
          <path d="M0 220 H390" stroke="#fff" strokeWidth="22" />
          <path d="M210 0 V430" stroke="#fff" strokeWidth="22" />
          <path d="M0 220 H390" stroke="#dfe3df" strokeWidth="22" strokeDasharray="2 26" />
          {/* the safe walk so far */}
          <path d="M210 360 V220 H80" fill="none" stroke={c.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 16" opacity="0.9" />
        </svg>

        {/* danger zones (smart mode) */}
        {ok && [[300, 150], [120, 300]].map(([x, y], i) => (
          <div key={i} style={{ position: 'absolute', left: x, top: y, width: 56, height: 56, marginLeft: -28, marginTop: -28, borderRadius: 999, background: 'rgba(209,69,50,.14)', border: '2px dashed rgba(209,69,50,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="alert-triangle" size={16} color={THEME.danger} stroke={2.6} />
          </div>
        ))}

        {/* current location — pulsing dot */}
        <div style={{ position: 'absolute', left: 210, top: 360, marginLeft: -22, marginTop: -22, width: 44, height: 44 }}>
          <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: c.color, opacity: .35 }} />
          <div style={{ position: 'absolute', inset: 8, borderRadius: 999, background: c.color, border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={26} />
          </div>
        </div>

        {/* top status chip + bell */}
        <div style={{ position: 'absolute', top: 54, left: 0, right: 0, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', borderRadius: 999, padding: '8px 14px 8px 10px', boxShadow: THEME.shadowLg, cursor: 'pointer' }}>
            <span style={{ width: 28, height: 28, borderRadius: 999, background: ok ? THEME.success : THEME.warning, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={ok ? 'shield-check' : 'shield'} size={16} color="#fff" stroke={2.4} /></span>
            <span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</span>
          </div>
          <button onClick={() => ctx.nav('notifications')} style={{ position: 'relative', width: 42, height: 42, borderRadius: 999, background: '#fff', border: 'none', boxShadow: THEME.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={19} color={THEME.fg1} stroke={2} />
            <span style={{ position: 'absolute', top: 10, right: 11, width: 9, height: 9, borderRadius: 999, background: THEME.danger, border: '2px solid #fff' }} />
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div style={{ position: 'relative', marginTop: -30, borderRadius: '28px 28px 0 0', background: THEME.surface2, padding: '10px 18px 0' }}>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />

        {/* greeting + buddy */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}>
          <div style={{ width: 48, height: 48, borderRadius: 999, background: shade(c.color, 86), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={48} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}, {PLAYER.name}</div>
            <div className="game-font" style={{ fontSize: 19, fontWeight: 500, color: THEME.fg1 }}>{c.name} · {L('Level')} {c.level}</div>
          </div>
          <HomeActionsS ctx={ctx} />
        </div>

        {/* today's goal */}
        <div onClick={() => ctx.nav('safety')} style={{ background: '#fff', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* points + streak */}
        <div style={{ display: 'flex', gap: 12 }}>
          <StatCardS icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} big />
          <StatCardS icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Day streak')} big />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · FOCUS  (goal ring around the buddy, with a halo + minutes pill)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleFocus({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const pct = Math.min(1, PLAYER.safeMinutesToday / PLAYER.safeWalkGoal);
  const R = 94, SW = 9, ring = 2 * (R + SW), circ = 2 * Math.PI * R;
  // mixed "aurora" wash — analogous tones derived from the buddy hue, fading to sand
  const bg = `linear-gradient(180deg, ${THEME.surface2}00 0%, ${THEME.surface2}00 210px, ${THEME.surface2} 540px), linear-gradient(125deg, ${mixHue(c.color, -24, 0.06, 0.78)} 0%, ${mixHue(c.color, 4, 0.10, 0.72)} 50%, ${mixHue(c.color, 26, 0.14, 0.6)} 100%), ${THEME.surface2}`;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: bg }}>
      <div style={{ padding: '10px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
          <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ textAlign: 'center', marginTop: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: shade(c.color, -42) }}>{L('Daily goal')}</span>
      </div>

      {/* goal ring + buddy */}
      <div onClick={() => ctx.nav('character', { id: c.id })} style={{ position: 'relative', width: ring, height: ring, margin: '8px auto 0', cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: 18, borderRadius: 999, background: `radial-gradient(circle at 50% 45%, ${c.color}33 0%, ${c.color}1c 52%, ${c.color}00 74%)` }} />
        <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
          <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={c.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${shade(c.color, 40)})` }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
        </div>
        {/* minutes pill on the ring */}
        <div style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)', background: '#fff', borderRadius: 999, padding: '6px 14px', boxShadow: THEME.shadowSoft, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
          <Icon name="footprints" size={15} color={c.color} stroke={2.4} />
          <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: shade(c.color, -30) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
        </div>
      </div>

      {/* buddy identity */}
      <div style={{ textAlign: 'center', padding: '18px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
          <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
        </div>
        <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
      </div>

      {/* safety + stats */}
      <div style={{ padding: '18px 18px 0' }}>
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')], ['flame', THEME.joy, PLAYER.streak, L('Day streak')]].map((s, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '11px 14px', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · COVER  (home with a soft colored header band; white cards below)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleCover({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const headBg = `linear-gradient(160deg, ${shade(c.color, 58)} 0%, ${shade(c.color, 104)} 100%)`;
  const ink = shade(c.color, -52);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* COLORED HEADER BAND */}
      <div style={{ background: headBg, borderRadius: '0 0 30px 30px', padding: '52px 20px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: ink, opacity: .85, fontWeight: 700 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        {/* buddy row */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, cursor: 'pointer' }}>
          <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={88} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
              <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
            </div>
            <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600, marginTop: 1 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
          </div>
        </div>

        {/* today's goal lives in the header */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: ink }}>{L("Today's safe-walk goal")}</span>
            <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: ink }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color="#fff" track="rgba(255,255,255,.45)" height={12} />
        </div>
      </div>

      {/* WHITE CONTENT — overlaps the band */}
      <div style={{ padding: '0 18px', marginTop: -16, position: 'relative' }}>
        <div style={{ marginBottom: 16 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')], ['flame', THEME.joy, PLAYER.streak, L('Day streak')]].map((s, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 16, padding: '11px 14px', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · WAVE  (friendly curved color header flowing into white content)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleWave({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ok = !lite;
  const float = { background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard };
  const ink = shade(c.color, -50);

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: '#fff' }}>
      {/* curved color header */}
      <div style={{ position: 'relative', background: `linear-gradient(160deg, ${shade(c.color, 74)} 0%, ${shade(c.color, 106)} 100%)`, paddingTop: 50 }}>
        <div style={{ padding: '8px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: ink, opacity: .8, fontWeight: 700 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </button>
          <HomeActionsS ctx={ctx} />
        </div>

        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ textAlign: 'center', cursor: 'pointer', padding: '0 18px 30px' }}>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={150} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: -2 }}>
            <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1 }}>{c.name}</span>
            <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
          </div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .78, fontWeight: 600, marginTop: 1 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
        </div>

        {/* the wave */}
        <svg viewBox="0 0 390 34" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 34, display: 'block' }}>
          <path d="M0 34 V14 Q195 40 390 14 V34 Z" fill="#fff" />
        </svg>
      </div>

      {/* white content */}
      <div style={{ padding: '8px 18px 0' }}>
        {/* safety */}
        <div onClick={() => ctx.nav('safety')} style={{ ...float, padding: '13px 15px', marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 999, background: ok ? THEME.success : THEME.warning, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name={ok ? 'shield-check' : 'shield'} size={20} color="#fff" stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
            <div style={{ fontSize: 12, color: THEME.fg2 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.4} />
        </div>

        {/* goal */}
        <div onClick={() => ctx.nav('safety')} style={{ ...float, padding: 16, marginBottom: 12, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* stats */}
        <div style={{ display: 'flex', gap: 12 }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')], ['flame', THEME.joy, PLAYER.streak, L('Day streak')]].map((s, i) => (
            <div key={i} style={{ ...float, flex: 1, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 9 }}>
              <Icon name={s[0]} size={18} color={s[1]} stroke={2.4} />
              <div>
                <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{s[2]}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{s[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// SIMPLE · PROFILE  (light — one combined profile card: a horizontal buddy
// hero with an inline stat strip baked in, then goal + safety below. A
// different composition from the centered-buddy + stacked-cards layouts.)
// ══════════════════════════════════════════════════════════════════════
function HomeSimpleProfile({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';
  const ink = shade(c.color, -52);
  const heroBg = `linear-gradient(155deg, ${shade(c.color, 64)} 0%, ${shade(c.color, 104)} 100%)`;

  const InlineStat = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon name={icon} size={16} color={color} stroke={2.4} style={{ marginBottom: 3 }} />
      <div className="game-font" style={{ fontSize: 17, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
      {/* header */}
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
          <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
        </button>
        <HomeActionsS ctx={ctx} />
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        {/* combined profile card — horizontal buddy hero + inline stat strip */}
        <div onClick={() => ctx.nav('character', { id: c.id })} style={{ borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: THEME.shadowCard, background: '#fff', marginBottom: 14 }}>
          <div style={{ background: heroBg, padding: '16px 16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={104} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Badge variant="gold"><Icon name="trending-up" size={11} color="#9e7300" stroke={2.6} />{L('Evolving')}</Badge>
              <div className="game-font" style={{ fontSize: 23, fontWeight: 500, color: THEME.fg1, marginTop: 6 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: ink, opacity: .82, fontWeight: 600 }}>{L('Level')} {c.level} · {L('Stage')} {c.stage}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
                <div style={{ flex: 1 }}><Bar value={c.xp} max={c.xpMax} color="#fff" track="rgba(255,255,255,.45)" glow height={8} /></div>
                <span className="game-font" style={{ fontSize: 11, fontWeight: 500, color: THEME.fg1 }}>{c.xp}/{c.xpMax}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 8px' }}>
            <InlineStat icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
            <div style={{ width: 1, height: 32, background: THEME.border }} />
            <InlineStat icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Day streak')} />
            <div style={{ width: 1, height: 32, background: THEME.border }} />
            <InlineStat icon="footprints" color={c.color} value={`${PLAYER.safeMinutesToday}`} label={L('min')} />
          </div>
        </div>

        {/* safety */}
        <div style={{ marginBottom: 14 }}><SafetyPillS ctx={ctx} lite={lite} /></div>

        {/* goal */}
        <div onClick={() => ctx.nav('safety')} style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

      </div>
    </div>
  );
}

// Simple-set registry + router (ids prefixed "simple-").
const HOME_LAYOUTS_SIMPLE = [
  { id: 'simple-original', label: 'Original' },
  { id: 'simple-spotlight', label: 'Spotlight' },
  { id: 'simple-map', label: 'Map' },
  { id: 'simple-focus', label: 'Focus' },
  { id: 'simple-cover', label: 'Cover' },
  { id: 'simple-wave', label: 'Wave' },
  { id: 'simple-profile', label: 'Profile' },
];
function HomeVariantSimple({ variant, ctx }) {
  switch (variant) {
    case 'simple-spotlight': return <HomeSimpleSpotlight ctx={ctx} />;
    case 'simple-map':       return <HomeSimpleMap ctx={ctx} />;
    case 'simple-focus':     return <HomeSimpleFocus ctx={ctx} />;
    case 'simple-cover':     return <HomeSimpleCover ctx={ctx} />;
    case 'simple-wave':      return <HomeSimpleWave ctx={ctx} />;
    case 'simple-profile':   return <HomeSimpleProfile ctx={ctx} />;
    default:                 return <HomeSimpleOriginal ctx={ctx} />;
  }
}

Object.assign(window, {
  HomeSimpleOriginal, HomeSimpleSpotlight, HomeSimpleMap, HomeSimpleFocus,
  HomeSimpleCover, HomeSimpleWave, HomeSimpleProfile, HomeVariantSimple, HOME_LAYOUTS_SIMPLE,
});
