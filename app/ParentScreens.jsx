// JoanX — parent app screens: Reports dashboard, Settings/rules, Children.
// Parent surfaces stay in TripMe's calm, trustworthy register (system font).

function ParentHead({ title, sub, right }) {
  return (
    <div style={{ padding: '8px 18px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        {sub && <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{sub}</div>}
        <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.fg1, margin: 0, letterSpacing: '-0.3px' }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

function ChildChip({ active }) {
  const k = CHILDREN[0];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', padding: '6px 12px 6px 6px', borderRadius: 999, boxShadow: THEME.shadowCard }}>
      <MascotChip species={k.avatar} color={k.color} size={32} bg={THEME.primaryLight} />
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{k.name}</span>
      <Icon name="chevron-down" size={15} color={THEME.fg2} stroke={2.4} />
    </div>
  );
}

// ── Reports dashboard ────────────────────────────────────────────────
function ParentReports({ ctx }) {
  const m = PARENT_METRICS;
  const maxRisk = Math.max(...RISK_TREND);
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.surface2 }}>
      <ParentHead sub={L("This week's progress")} title={L('Mina is improving')} right={<ChildChip />} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* hero metric */}
        <div style={{ borderRadius: 22, padding: 20, background: 'linear-gradient(160deg,#ecf3fe,#fff 75%)', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Icon name="trending-down" size={18} color={THEME.success} stroke={2.4} />
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg2 }}>{L('Risky-walking moments')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <div style={{ fontSize: 44, fontWeight: 800, color: THEME.fg1, letterSpacing: '-1px', lineHeight: 1 }}>{m.riskReduction}%</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: THEME.success, marginBottom: 6 }}>{L('fewer this week')}</div>
          </div>
          {/* sparkline trend */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56, marginTop: 14 }}>
            {RISK_TREND.map((v, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: '100%', height: (v / maxRisk) * 44, background: i === RISK_TREND.length - 1 ? THEME.success : THEME.primary, opacity: i === RISK_TREND.length - 1 ? 1 : 0.4 - i * 0.02 + 0.3, borderRadius: 6 }} />
                <span style={{ fontSize: 9, color: THEME.fg3, fontWeight: 600 }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* metric grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[
            { icon: 'check-circle-2', c: THEME.success, bg: THEME.successLight, v: m.acceptance + '%', l: 'Warning acceptance' },
            { icon: 'footprints', c: THEME.primary, bg: THEME.primaryLight, v: m.safeWalkMin + 'm', l: 'Safe walking' },
            { icon: 'timer', c: THEME.gold, bg: THEME.goldLight, v: m.avgResponse + 's', l: 'Avg. response' },
            { icon: 'flame', c: THEME.joy, bg: THEME.joyBg, v: PLAYER.streak + 'd', l: 'Safe streak' },          ].map((x, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: x.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Icon name={x.icon} size={18} color={x.c} stroke={2.3} /></div>
              <div style={{ fontSize: 23, fontWeight: 800, lineHeight: 1 }}>{x.v}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{L(x.l)}</div>
            </div>
          ))}
        </div>

        {/* reaction breakdown */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{L('How Mina responds to warnings')}</div>
          <div style={{ fontSize: 12, color: THEME.fg2, marginBottom: 14 }}>{L('Most warnings end in an immediate stop — exactly what we want.')}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90 }}>
            {REACTIONS_7D.map((d, i) => {
              const tot = d.immediate + d.delayed + d.ignored;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 18, height: 70, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: THEME.surface2 }}>
                    {d.ignored > 0 && <div style={{ height: (d.ignored / tot) * 70, background: THEME.danger }} />}
                    {d.delayed > 0 && <div style={{ height: (d.delayed / tot) * 70, background: THEME.warning }} />}
                    <div style={{ height: (d.immediate / tot) * 70, background: THEME.success }} />
                  </div>
                  <span style={{ fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{d.day[0]}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 12, justifyContent: 'center' }}>
            {[['Immediate', THEME.success], ['Delayed', THEME.warning], ['Ignored', THEME.danger]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} /><span style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600 }}>{L(l)}</span></div>
            ))}
          </div>
        </div>

        {/* insight */}
        <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16 }}>
          <Icon name="lightbulb" size={20} color={THEME.success} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: '#274427' }}>{L('What this means')}</div>
            <div style={{ fontSize: 12.5, color: '#274427', lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Mina is reacting faster and ignoring fewer warnings than two weeks ago. The habit is forming — keep it up.')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Settings / rules ─────────────────────────────────────────────────
function ParentSettings({ ctx }) {
  const [mode, setMode] = React.useState(ctx.mode);
  const [cats, setCats] = React.useState(Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])));
  const [sens, setSens] = React.useState(2);
  const [notif, setNotif] = React.useState(true);
  const [gam, setGam] = React.useState(true);

  const setModeBoth = m => { setMode(m); ctx.setMode(m); };

  const Row = ({ children, last }) => <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: last ? 'none' : 'none' }}>{children}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.surface2 }}>
      <ParentHead sub="Mina · iPhone 13" title={L('Rules & settings')} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* mode */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Protection mode')}</div>
        <div style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 16, padding: 6, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          {[{ id: 'smart', t: 'Smart', d: 'Warnings + game' }, { id: 'lite', t: 'Lite', d: 'Hard block' }].map(o => (
            <button key={o.id} onClick={() => setModeBoth(o.id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '12px 8px', background: mode === o.id ? THEME.primary : 'transparent', transition: 'background .2s' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: mode === o.id ? '#fff' : THEME.fg1 }}>{L(o.t)}</div>
              <div style={{ fontSize: 11, color: mode === o.id ? 'rgba(255,255,255,.85)' : THEME.fg2, marginTop: 1 }}>{L(o.d)}</div>
            </button>
          ))}
        </div>

        {mode === 'lite' ? (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Block while walking')}</div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
              {APP_CATEGORIES.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={THEME.fg2} stroke={2.2} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{L(c.name)}</div>
                    {c.locked && <div style={{ fontSize: 11.5, color: THEME.success, fontWeight: 600 }}>{L('Always allowed')}</div>}
                  </div>
                  {c.locked ? <Icon name="lock" size={16} color={THEME.fg3} stroke={2.3} /> : <Toggle on={cats[c.id]} onChange={v => setCats(s => ({ ...s, [c.id]: v }))} />}
                </div>
              ))}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Warning sensitivity')}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['Gentle', 'Balanced', 'Strict'].map((l, i) => (
                  <button key={l} onClick={() => setSens(i + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? THEME.primary : THEME.fg3 }}>{L(l)}</button>
                ))}
              </div>
              <div style={{ position: 'relative', height: 8, background: THEME.border, borderRadius: 999 }}>
                <div style={{ width: `${(sens - 1) * 50}%`, height: '100%', background: THEME.primary, borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${(sens - 1) * 50}%`, transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 999, background: '#fff', border: `3px solid ${THEME.primary}`, boxShadow: THEME.shadowCard }} />
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 12 }}>{['', L('Warns only in clear risk — fewest interruptions.'), L('Recommended balance of safety and calm.'), L('Warns earlier and more often.')][sens]}</div>
            </div>
          </React.Fragment>
        )}

        {/* time rules */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Time rules')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {[
            // Badges consume the system badge tokens directly: {palette}-default (20) bg + {palette}-label (70) text
            { t: 'School commute', s: 'Mon–Fri · 7:30–8:30 AM', tag: 'Strict', c: 'var(--color-interactives-badge-rust-label)', bg: 'var(--color-interactives-badge-rust-default)' },
            { t: 'After school', s: 'Mon–Fri · 3:00–5:00 PM', tag: 'Balanced', c: 'var(--color-interactives-badge-ember-label)', bg: 'var(--color-interactives-badge-ember-default)' },
            { t: 'At home', s: 'Geofenced · home Wi-Fi', tag: 'Relaxed', c: 'var(--color-interactives-badge-evergreen-label)', bg: 'var(--color-interactives-badge-evergreen-default)' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L(r.t)}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{r.s}</div>
              </div>
              <Badge style={{ background: r.bg, color: r.c }}>{L(r.tag)}</Badge>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${THEME.border}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 8, color: THEME.primary, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            <Icon name="plus" size={17} color={THEME.primary} stroke={2.4} /> {L('Add a schedule')}
          </div>
        </div>

        {/* prefs */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Preferences')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="bell" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Notify me of activity')}</div><Toggle on={notif} onChange={setNotif} />
          </div>
          {mode === 'smart' && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${THEME.border}` }}>
            <Icon name="gamepad-2" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Character game & rewards')}</div><Toggle on={gam} onChange={setGam} />
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── Children / devices ───────────────────────────────────────────────
function ParentChildren({ ctx }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.surface2 }}>
      <ParentHead sub={L('2 connected')} title={L('Children')} right={<button style={{ width: 40, height: 40, borderRadius: 999, background: THEME.primary, border: 'none', boxShadow: THEME.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></button>} />
      <div style={{ padding: '8px 16px 0' }}>
        {CHILDREN.map(k => (
          <div key={k.id} onClick={() => ctx.nav('p_settings')} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <MascotChip species={k.avatar} color={k.color} size={56} bg={shade(k.color, 78)} />
                <span style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 999, background: k.online ? THEME.success : THEME.fg3, border: '2.5px solid #fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 800 }}>{k.name}</span>
                  <Badge variant={k.mode === 'smart' ? 'primary' : 'warning'}>{k.mode === 'smart' ? L('Smart') : L('Lite')}</Badge>
                </div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L('Age')} {k.age} · {k.device}</div>
              </div>
              <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={k.online ? 'wifi' : 'wifi-off'} size={14} color={k.online ? THEME.success : THEME.fg3} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700, color: k.online ? THEME.success : THEME.fg2 }}>{k.online ? L('Protected now') : L('Offline')}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{L('Last seen')} {k.lastSeen}</div>
              </div>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="battery-medium" size={14} color={k.battery < 50 ? THEME.warning : THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700 }}>{k.battery}%</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{L('Battery')}</div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginTop: 4 }}>
          <Icon name="shield-check" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('Privacy first')}</div>
            <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ParentReports, ParentSettings, ParentChildren });
