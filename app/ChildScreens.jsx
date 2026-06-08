// JoanX — child core screens: Onboarding/permissions, Home, Safety Status.

// ── shared little parts ──────────────────────────────────────────────
function StatCard({ icon, color, bg, value, label, big }) {
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

function QuickTile({ icon, color, bg, label, onClick }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1, padding: 0 }}>
      <div style={{ width: 58, height: 58, borderRadius: 18, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard }}>
        <Icon name={icon} size={24} color={color} stroke={2.2} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg1 }}>{label}</span>
    </button>
  );
}

// ── Onboarding / permissions ─────────────────────────────────────────
function Onboarding({ ctx }) {
  const [step, setStep] = React.useState(0);
  const [mode, setMode] = React.useState('smart');
  const [grants, setGrants] = React.useState({});
  const total = 3;

  const Hero = ({ children }) => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 28px' }}>{children}</div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 50 }}>
      {/* progress dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', padding: '8px 0 4px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ height: 6, width: i === step ? 22 : 6, borderRadius: 999, background: i <= step ? THEME.primary : THEME.border, transition: 'all .3s' }} />
        ))}
      </div>

      {step === 0 && (
        <Hero>
          <div className="jx-float"><Mascot species="fox" stage={2} size={184} /></div>
          <h1 className="game-font" style={{ fontSize: 27, fontWeight: 500, margin: '10px 0 8px' }}>{L('Walk safe, grow your buddy')}</h1>
          <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.5, margin: 0 }}>{L("JoanX gently notices when you're walking and looking at your phone — and turns staying safe into a game you win.")}</p>
        </Hero>
      )}

      {step === 1 && (
        <Hero>
          <h1 className="game-font" style={{ fontSize: 24, fontWeight: 500, margin: '4px 0 6px', whiteSpace: 'nowrap' }}>{L('Pick a mode')}</h1>
          <p style={{ fontSize: 14, color: THEME.fg2, margin: '0 0 20px' }}>{L('You can change this anytime in the parent app.')}</p>
          {[
            { id: 'smart', t: 'Smart', d: 'Gentle warnings + character game. For kids who can self-correct.', icon: 'hand-heart' },
            { id: 'lite', t: 'Lite', d: 'Simple full-screen block while walking. For younger kids.', icon: 'shield' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} style={{ width: '100%', textAlign: 'left', marginBottom: 12, padding: 16, borderRadius: 18, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 13, alignItems: 'center', background: mode === m.id ? THEME.primaryLight : '#fff', border: `2px solid ${mode === m.id ? THEME.primary : THEME.border}` }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: mode === m.id ? THEME.primary : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={m.icon} size={22} color={mode === m.id ? '#fff' : THEME.fg3} stroke={2.2} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: THEME.fg1 }}>{L(m.t)} {L('mode')}</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.4, marginTop: 2 }}>{L(m.d)}</div>
              </div>
            </button>
          ))}
        </Hero>
      )}

      {step === 2 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 0' }} className="no-sb">
          <h1 className="game-font" style={{ fontSize: 24, fontWeight: 500, margin: '4px 0 6px', whiteSpace: 'nowrap' }}>{L('Allow access')}</h1>
          <p style={{ fontSize: 14, color: THEME.fg2, margin: '0 0 18px' }}>{L("JoanX still works if you skip one — that feature just turns off. We never read your messages.")}</p>
          {PERMISSIONS.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, borderRadius: 16, border: `1.5px solid ${THEME.border}`, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={p.icon} size={20} color={THEME.primary} stroke={2.2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 700 }}>{L(p.name)}</span>
                  {!p.required && <Badge>{L('Optional')}</Badge>}
                </div>
                <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 2 }}>{L(p.why)}</div>
              </div>
              <Toggle on={grants[p.id] ?? true} onChange={v => setGrants(g => ({ ...g, [p.id]: v }))} />
            </div>
          ))}
        </div>
      )}

      {/* footer */}
      <div style={{ padding: '14px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
        <Button variant="primary" size="lg" fullWidth onClick={() => step < total - 1 ? setStep(step + 1) : ctx.finishOnboarding(mode)}>
          {step === 0 ? L('Get started') : step === 1 ? L('Continue') : L('Finish setup')}
        </Button>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: THEME.fg2, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Back')}</button>
        )}
      </div>
    </div>
  );
}

// ── Child Home ───────────────────────────────────────────────────────
function ChildHome({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      {/* header */}
      <div style={{ padding: '8px 18px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => ctx.nav('profile')} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <div style={{ width: 42, height: 42, borderRadius: 999, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={42} /></div>
          <div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Good afternoon')}</div>
            <div className="game-font" style={{ fontSize: 21, fontWeight: 500, color: THEME.fg1 }}>{PLAYER.name}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => ctx.nav('shop')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#fff', padding: '7px 12px', borderRadius: 999, boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="coins" size={16} color={THEME.gold} stroke={2.2} />
            <span className="game-font" style={{ fontSize: 15, fontWeight: 500 }}>{PLAYER.coins}</span>
          </button>
          <button onClick={() => ctx.nav('notifications')} style={{ position: 'relative', width: 40, height: 40, borderRadius: 999, background: '#fff', border: 'none', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="bell" size={19} color={THEME.fg1} stroke={2} />
            <span style={{ position: 'absolute', top: 9, right: 10, width: 9, height: 9, borderRadius: 999, background: THEME.danger, border: '2px solid #fff' }} />
          </button>
        </div>
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        {/* safety status banner */}
        <div onClick={() => ctx.nav('safety')} style={{ display: 'flex', alignItems: 'center', gap: 11, background: lite ? THEME.warningLight : THEME.successLight, borderRadius: 16, padding: '12px 14px', marginBottom: 14, cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: lite ? THEME.warning : THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={lite ? 'shield' : 'shield-check'} size={20} color="#fff" stroke={2.3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: lite ? '#602f0c' : '#274427' }}>{lite ? L('Lite mode · Protected') : L("You're protected")}</div>
            <div style={{ fontSize: 12, color: lite ? '#602f0c' : '#274427', opacity: .85 }}>{lite ? L('Phone pauses while you walk') : L('Safely tracking · 47 min safe today')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={lite ? '#602f0c' : '#274427'} stroke={2.5} />
        </div>

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
          <div style={{ fontSize: 12, color: THEME.fg2, textAlign: 'center' }}>{c.stage < 3 ? `${c.xpMax - c.xp} XP → ${L('Stage')} ${c.stage + 1}` : L('Fully evolved — max stage!')}</div>
        </div>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <StatCard icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} big />
          <StatCard icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Day streak')} big />
        </div>

        {/* daily goal */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, marginBottom: 16, boxShadow: THEME.shadowCard }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, fontWeight: 800 }}>
              <span style={{ width: 30, height: 30, borderRadius: 10, background: THEME.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={THEME.primary} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.primary }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={THEME.primary} height={12} />
          <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 8 }}>{L('13 more minutes phone-free while walking earns a +100 bonus.')}</div>
        </div>

        {/* quick tiles — hidden (kept for easy restore)
        <SectionHead title={L('Play')} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          <QuickTile icon="layout-grid" color={THEME.primary} bg={THEME.primaryLight} label={L('Collection')} onClick={() => ctx.nav('collection')} />
          <QuickTile icon="swords" color={THEME.joy} bg={THEME.joyBg} label={L('Battle')} onClick={() => ctx.nav('battle')} />
          <QuickTile icon="trophy" color={THEME.gold} bg={THEME.goldLight} label={L('Rewards')} onClick={() => ctx.nav('rewards')} />
          <QuickTile icon="wand-2" color={THEME.camping} bg={THEME.campingBg} label={L('Customize')} onClick={() => ctx.nav('character', { id: c.id })} />
        </div>
        */}

        {/* recent wins */}
        <SectionHead title={L("Today's wins")} />
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          {[
            { icon: 'timer', color: THEME.success, bg: THEME.successLight, t: 'Stopped in 2s near Oak St.', s: '+30 bonus points', time: '12m' },
            { icon: 'footprints', color: THEME.primary, bg: THEME.primaryLight, t: '20 min safe walking', s: '+200 points', time: '1h' },
            { icon: 'medal', color: THEME.camping, bg: THEME.campingBg, t: 'Your buddy leveled up', s: 'New trait unlocked', time: '3h' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={r.icon} size={18} color={r.color} stroke={2.3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1 }}>{L(r.t)}</div>
                <div style={{ fontSize: 12, color: THEME.fg2 }}>{L(r.s)}</div>
              </div>
              <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Safety Status (the raised shield tab) ────────────────────────────
function SafetyStatus({ ctx }) {
  const lite = ctx.mode === 'lite';
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 56, paddingBottom: 110, background: THEME.screenBg }}>
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
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{lite ? L('Motion · no GPS') : L('Motion · GPS while walking')}</div>
          </div>
        </div>

        {/* danger zones (smart) */}
        {!lite && (
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

// ── Notifications ────────────────────────────────────────────────────
function Notifications({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const init = [
    { id: 'n1', when: 'today', type: 'reward', icon: 'gift', color: THEME.gold, bg: THEME.goldLight, t: 'Daily reward is ready', s: 'Claim +100 points for walking safely.', time: 'now', unread: true, cta: 'Claim', go: 'rewards' },
    { id: 'n2', when: 'today', type: 'char', mascot: true, t: `${c.name} is almost ready to evolve`, s: '180 XP to Stage 3 — keep walking phone-free.', time: '20m', unread: true, go: 'character' },
    { id: 'n3', when: 'today', type: 'safety', icon: 'timer', color: THEME.success, bg: THEME.successLight, t: 'Nice save near Oak St.', s: 'You looked up in 2s — +30 bonus points.', time: '1h', unread: true },
    { id: 'n4', when: 'today', type: 'zone', icon: 'map-pin', color: THEME.danger, bg: THEME.dangerLight, t: 'New danger zone near school', s: 'A busy crossing was added to your route.', time: '3h', unread: false },
    { id: 'n5', when: 'earlier', type: 'streak', icon: 'flame', color: THEME.joy, bg: THEME.joyBg, t: '5-day safe streak!', s: '2 more days unlocks a Special buddy.', time: 'Yest.', unread: false },
    { id: 'n6', when: 'earlier', type: 'battle', icon: 'swords', color: THEME.camping, bg: THEME.campingBg, t: 'You won a battle vs. Bolt', s: '+120 points and +2 coins earned.', time: 'Yest.', unread: false, go: 'battle' },
    { id: 'n7', when: 'earlier', type: 'parent', icon: 'shield-check', color: THEME.primary, bg: THEME.primaryLight, t: 'A grown-up updated your settings', s: 'Warning style is now set to “gentle”.', time: '2d', unread: false },
  ];
  const [items, setItems] = React.useState(init);
  const unread = items.filter(i => i.unread).length;
  const read = (id) => setItems(s => s.map(i => i.id === id ? { ...i, unread: false } : i));
  const allRead = () => setItems(s => s.map(i => ({ ...i, unread: false })));

  const Group = ({ label, list }) => list.length ? (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .5, margin: '0 4px 8px' }}>{label}</div>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
        {list.map((n, i) => (
          <div key={n.id} onClick={() => { read(n.id); if (n.go) ctx.nav(n.go, { id: c.id }); }} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer', background: n.unread ? THEME.primaryLight + '55' : '#fff' }}>
            {n.mascot
              ? <div style={{ width: 40, height: 40, borderRadius: 12, background: shade(c.color, 80), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}><Mascot species={c.species} stage={c.stage} color={c.color} size={40} /></div>
              : <div style={{ width: 40, height: 40, borderRadius: 12, background: n.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={n.icon} size={20} color={n.color} stroke={2.3} /></div>}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.3 }}>{L(n.t)}</span>
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2, lineHeight: 1.4 }}>{L(n.s)}</div>
              {n.cta && <button onClick={(e) => { e.stopPropagation(); read(n.id); ctx.nav(n.go); }} style={{ marginTop: 8, background: THEME.gold, color: '#fff', border: 'none', borderRadius: 10, padding: '7px 14px', fontSize: 12.5, fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer' }}>{L(n.cta)}</button>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600 }}>{n.time}</span>
              {n.unread && <span style={{ width: 9, height: 9, borderRadius: 999, background: THEME.primary }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Notifications')} onBack={() => ctx.nav('home')} right={unread ? <button onClick={allRead} style={{ border: 'none', background: 'none', color: THEME.primary, fontSize: 12, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}>{L('Mark read')}</button> : null} />
      <div style={{ padding: '0 16px' }}>
        {unread === 0 && (
          <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.successLight, color: '#274427', padding: '7px 14px', borderRadius: 999, fontSize: 12.5, fontWeight: 700 }}><Icon name="check" size={14} color={THEME.success} stroke={2.6} /> {L('All caught up')}</div>
          </div>
        )}
        <Group label={L('Today')} list={items.filter(i => i.when === 'today')} />
        <Group label={L('Earlier')} list={items.filter(i => i.when === 'earlier')} />
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L('JoanX only pings you for safety, rewards, and your buddy.')}</div>
      </div>
    </div>
  );
}

// ── Profile / settings (child) ───────────────────────────────────────
function Profile({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const owned = CHARACTERS.filter(x => x.owned).length;
  const lite = ctx.mode === 'lite';
  const [sound, setSound] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [push, setPush] = React.useState(true);

  const Row = ({ icon, label, children, last, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: last ? 'none' : 'none', cursor: onClick ? 'pointer' : 'default' }}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{label}</div>
      {children}
    </div>
  );
  const Sep = () => <div style={{ height: 1, background: THEME.border, margin: '0 14px' }} />;
  const groupCard = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 };
  const sectionLabel = { fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Profile')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ background: `linear-gradient(165deg, ${shade(c.color, 76)}, #fff 78%)`, borderRadius: 22, padding: '20px 18px', boxShadow: THEME.shadowCard, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={72} /></div>
          <div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
            <div style={{ marginTop: 8 }}><Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')} {L('mode')}</Badge></div>
          </div>
        </div>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <StatCard icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
          <StatCard icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Best streak')} />
          <StatCard icon="gem" color={THEME.camping} bg={THEME.campingBg} value={owned} label={L('Buddies')} />
        </div>

        {/* preferences */}
        <div style={sectionLabel}>{L('Preferences')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div>
            <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 10, padding: 3 }}>
              {[['en', 'EN'], ['ko', '한국어']].map(([v, l]) => (
                <button key={v} onClick={() => ctx.setLang(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 8, background: ctx.lang === v ? '#fff' : 'transparent', color: ctx.lang === v ? THEME.primary : THEME.fg2, boxShadow: ctx.lang === v ? THEME.shadowCard : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
          <Sep />
          <Row icon="volume-2" label={L('Sound effects')}><Toggle on={sound} onChange={setSound} /></Row>
          <Sep />
          <Row icon="vibrate" label={L('Haptics')}><Toggle on={haptics} onChange={setHaptics} /></Row>
          <Sep />
          <Row icon="bell" label={L('Push notifications')}><Toggle on={push} onChange={setPush} /></Row>
        </div>

        {/* account */}
        <div style={sectionLabel}>{L('Account')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name={lite ? 'shield' : 'hand-heart'} size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Protection mode')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{L('Managed by your parent')}</div>
            </div>
            <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')}</Badge>
            <Icon name="lock" size={15} color={THEME.fg3} stroke={2.3} />
          </div>
          <Sep />
          <Row icon="life-buoy" label={L('Help & support')} onClick={() => {}}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
          <Sep />
          <Row icon="info" label={L('About JoanX')} onClick={() => {}}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
        </div>

        <Button variant="outline" size="lg" fullWidth icon="log-out" onClick={() => {}}>{L('Sign out')}</Button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: THEME.fg3 }}>
          <Icon name="shield-check" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('This device is managed by a parent or guardian.')}</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Onboarding, ChildHome, SafetyStatus, Notifications, Profile, StatCard, QuickTile });
