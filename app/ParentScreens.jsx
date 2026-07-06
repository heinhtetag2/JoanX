// JoanX — parent app screens: Reports dashboard, Settings/rules, Children.
// Parent surfaces stay in TripMe's calm, trustworthy register (system font).

function ParentHead({ title, sub, right, onBack }) {
  return (
    <div style={{ padding: '8px 18px 6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {onBack && (
          <button onClick={onBack} aria-label={L('Back')} style={{ width: 34, height: 34, marginTop: 2, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        )}
        <div>
          {sub && <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{sub}</div>}
          <h1 style={{ fontSize: 24, fontWeight: 800, color: THEME.fg1, margin: 0, letterSpacing: '-0.3px' }}>{title}</h1>
        </div>
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

// Standard gridded bar chart — y-axis ticks + dashed gridlines + bars, optional line overlay.
function StdBarChart({ data, series, line, yMax, yStep, height = 168, barW = 9 }) {
  const ticks = [];
  for (let v = 0; v <= yMax; v += yStep) ticks.push(v);
  const topPad = 10;                 // headroom above the top gridline
  const plot = height - topPad;
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {/* y-axis labels */}
      <div style={{ position: 'relative', width: 16, height, flexShrink: 0 }}>
        {ticks.map(t => (
          <span key={t} style={{ position: 'absolute', right: 0, bottom: `${(t / yMax) * plot - 6}px`, fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{t}</span>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ position: 'relative', height }}>
          {ticks.map((t, i) => (
            <div key={t} style={{ position: 'absolute', left: 0, right: 0, bottom: `${(t / yMax) * plot}px`, borderTop: i === 0 ? `1.5px solid ${THEME.border}` : `1px dashed ${THEME.border}` }} />
          ))}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
            {data.map((d, i) => (
              <div key={i} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3 }}>
                {series.map(s => {
                  const fill = typeof s.color === 'function' ? s.color(d, i, data) : s.color;
                  return <div key={s.key} style={{ width: barW, height: `${(d[s.key] / yMax) * plot}px`, background: fill, borderRadius: '4px 4px 0 0' }} />;
                })}
              </div>
            ))}
          </div>
          {/* line overlay (stretched horizontally, uniform stroke) */}
          {line && (
            <svg viewBox={`0 0 ${data.length} ${plot}`} preserveAspectRatio="none" width="100%" height={plot} style={{ position: 'absolute', left: 0, bottom: 0, overflow: 'visible' }}>
              <polyline points={data.map((d, i) => `${i + 0.5},${plot - (d[line.key] / yMax) * plot}`).join(' ')} fill="none" stroke={line.color} strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          )}
          {line && data.map((d, i) => (
            <div key={'dot' + i} style={{ position: 'absolute', left: `${((i + 0.5) / data.length) * 100}%`, bottom: `${(d[line.key] / yMax) * plot}px`, transform: 'translate(-50%, 50%)', width: 7, height: 7, borderRadius: 999, background: line.color, border: '1.5px solid #fff' }} />
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 7 }}>
          {data.map((d, i) => (
            <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{d.label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const Legend = ({ items }) => (
  <div style={{ display: 'flex', gap: 18, marginTop: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
    {items.map(([l, c]) => (
      <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
        <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L(l)}</span>
      </div>
    ))}
  </div>
);

// ── FAQ — grouped Q&A used by the Help / FAQ parent pages ────────────
// Answers mirror the functional spec (Smart mode, ~10pt/safe-min, motion-only
// detection, privacy). Keep parent-facing: calm, plain language, no jargon.
const FAQ_GROUPS = [
  { label: 'Getting started', items: [
    { q: 'What’s the difference between Smart and Lite mode?',
      a: 'Smart mode gently warns your child with a friendly character and rewards safe walking with a collectible game. Lite mode simply pauses the screen while walking. Calls and texts always stay available in both.' },
    { q: 'How do I add another child?',
      a: 'Open Children, tap the + button, then install JoanX on your child’s phone and enter the pairing code shown. Their device links to your account — up to 5 children on the Family plan.' },
    { q: 'Does JoanX need any extra device or wearable?',
      a: 'No. JoanX works entirely from your child’s smartphone using its built-in motion sensors — nothing to buy, charge, or carry.' },
  ] },
  { label: 'Safety & warnings', items: [
    { q: 'How does JoanX know my child is walking on their phone?',
      a: 'It reads the phone’s built-in motion sensors to detect a walking rhythm, and only steps in when walking and screen use continue together for about 10 seconds.' },
    { q: 'Will it warn my child on the bus or in a car?',
      a: 'It’s tuned to the specific rhythm of walking, so riding in a vehicle shouldn’t trigger a warning. We keep fine-tuning detection accuracy with real-world use.' },
    { q: 'What happens when a risky moment is detected?',
      a: 'One gentle buzz, then a soft on-screen nudge and a friendly character message — never repeated buzzing. Your child looks up, and the warning clears.' },
    { q: 'Can I make warnings more or less sensitive?',
      a: 'Yes. Open a child’s Rules & settings and adjust Warning sensitivity between Gentle, Balanced, and Strict at any time.' },
  ] },
  { label: 'Points & rewards', items: [
    { q: 'How are points earned?',
      a: 'In Smart mode your child earns points for walking safely — roughly 10 points per phone-free minute of walking, plus a bonus for stopping quickly after a warning. Points grow and evolve their character.' },
    { q: 'Won’t the game just distract my child while walking?',
      a: 'No — the game only opens when your child is stopped. Nothing rewarding is tappable while they’re walking, so the fun always waits until it’s safe.' },
  ] },
  { label: 'Privacy & data', items: [
    { q: 'Is my child’s location private?',
      a: 'JoanX never reads messages or listens in. Location is used only in Smart mode while walking, and it’s stored separately from your child’s identity.' },
    { q: 'What data does JoanX store, and can I delete it?',
      a: 'Only the safety events and settings needed to protect your child. You can export or permanently delete everything anytime from Settings → Data & privacy.' },
  ] },
];

// Self-contained accordion: tap a question to reveal its answer.
function FaqAccordion({ items }) {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
            <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name="help-circle" size={18} color={THEME.primary} stroke={2.2} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L(it.q)}</span>
              <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 16px 44px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>{L(it.a)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Reports dashboard — clean analytics layout (numbers + gridded charts) ──
function ParentReports({ ctx }) {
  const m = PARENT_METRICS;
  // data-viz palette (tuned for charts / color-blindness at 40–60)
  const SERIES = { good: 'var(--color-data-green-50)', mid: 'var(--color-data-yellow-40)', bad: 'var(--color-data-red-50)', trend: 'var(--color-data-blue-40)', rate: 'var(--color-data-yellow-40)' };
  // calmer palette for the response-mix chart — teal hero, muted accents
  const RESP = { immediate: '#4f9d89', delayed: '#ecc879', ignored: '#e2a395' };
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const riskTotal = RISK_TREND.reduce((a, b) => a + b, 0);
  const stopsTotal = REACTIONS_7D.reduce((a, d) => a + d.immediate, 0);
  const actData = REACTIONS_7D.map((d, i) => ({ label: dayLabels[i], risk: RISK_TREND[i], stops: d.immediate }));

  // top KPI cards (horizontally scrollable)
  const kpis = [
    { icon: 'check-circle-2', v: m.acceptance + '%', delta: '+6%', l: 'Warning acceptance' },
    { icon: 'footprints', v: m.safeWalkMin + 'm', delta: '+12%', l: 'Safe walking' },
    { icon: 'timer', v: m.avgResponse + 's', delta: '-0.3s', l: 'Avg. response' },
    { icon: 'flame', v: PLAYER.streak + 'd', delta: '+2', l: 'Safe streak' },
  ];
  // inline stat-dots inside the activity card
  const inline = [
    { v: riskTotal, l: 'Risky moments', c: '#bdd2ee' },
    { v: stopsTotal, l: 'Safe stops', c: SERIES.trend },
    { v: m.acceptance + '%', l: 'Acceptance', c: SERIES.rate },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L("This week's progress")} title={L('Mina is improving')} right={<ChildChip />} />
      <div style={{ padding: '8px 20px 0' }}>

        {/* KPI cards — scroll horizontally */}
        <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '4px 20px 6px', margin: '0 -20px' }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ minWidth: 142, flexShrink: 0, background: '#fff', borderRadius: 18, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Icon name={k.icon} size={17} color={THEME.fg3} stroke={2} /></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{k.v}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 11, fontWeight: 700, color: THEME.success }}>{k.delta}<Icon name="trending-up" size={11} color={THEME.success} stroke={2.6} /></span>
              </div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 5 }}>{L(k.l)}</div>
            </div>
          ))}
        </div>

        {/* AI report entry (F-31) */}
        <button onClick={() => ctx.nav('p_aireport')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: 'linear-gradient(135deg,#447aaf,#2b5782)', boxShadow: THEME.shadowPrimary }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="sparkles" size={20} color="#fff" stroke={2.3} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff' }}>{L('Read the AI Safety Report')}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.82)', marginTop: 2 }}>{L('A plain-language summary of Mina’s week')}</div>
          </div>
          <Icon name="chevron-right" size={20} color="#fff" stroke={2.4} />
        </button>

        {/* response mix card */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, paddingRight: 10 }}>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{L('How Mina responds to warnings')}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 3 }}>{L('Most warnings end in an immediate stop — exactly what we want.')}</div>
            </div>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 94, borderBottom: `1.5px solid ${THEME.border}`, marginTop: 18 }}>
            {REACTIONS_7D.map((d, i) => {
              const tot = d.immediate + d.delayed + d.ignored;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', height: '100%' }}>
                  <div style={{ width: 17, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 2 }}>
                    {d.ignored > 0 && <div style={{ height: `${(d.ignored / tot) * 100}%`, background: RESP.ignored, borderRadius: 4 }} />}
                    {d.delayed > 0 && <div style={{ height: `${(d.delayed / tot) * 100}%`, background: RESP.delayed, borderRadius: 4 }} />}
                    <div style={{ height: `${(d.immediate / tot) * 100}%`, background: RESP.immediate, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            {REACTIONS_7D.map((d, i) => (
              <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: THEME.fg3, fontWeight: 600 }}>{d.day[0]}</span>
            ))}
          </div>
          <Legend items={[['Immediate', RESP.immediate], ['Delayed', RESP.delayed], ['Ignored', RESP.ignored]]} />
        </div>

        {/* activity card — inline stats + bars-and-line chart + CTA */}
        <div style={{ background: '#fff', borderRadius: 22, padding: 18, marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L('Weekly activity')}</span>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="chevron-right" size={16} color={THEME.fg2} stroke={2.4} /></div>
          </div>
          <div style={{ display: 'flex', gap: 22, marginBottom: 18 }}>
            {inline.map(s => (
              <div key={s.l}>
                <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.v}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: s.c }} />
                  <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{L(s.l)}</span>
                </div>
              </div>
            ))}
          </div>
          <StdBarChart data={actData} series={[{ key: 'risk', color: '#bdd2ee' }]} line={{ key: 'stops', color: SERIES.trend }} yMax={10} yStep={2} barW={14} />
          <button onClick={() => ctx.nav('p_children')} style={{ width: '100%', marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, background: THEME.surface2, border: 'none', borderRadius: 14, padding: '13px 16px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon name="sparkles" size={17} color={THEME.primary} stroke={2.3} />
            <span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1 }}>{L('Build safer habits with Mina')}</span>
          </button>
        </div>

        {/* insight */}
        <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16, marginTop: 14 }}>
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
// per-tag badge colors for the time-rule schedules (system badge tokens)
const RULE_TAG_COLORS = {
  Strict:   { c: 'var(--color-interactives-badge-rust-label)',      bg: 'var(--color-interactives-badge-rust-default)' },
  Balanced: { c: 'var(--color-interactives-badge-ember-label)',     bg: 'var(--color-interactives-badge-ember-default)' },
  Relaxed:  { c: 'var(--color-interactives-badge-evergreen-label)', bg: 'var(--color-interactives-badge-evergreen-default)' },
};

function ParentSettings({ ctx }) {
  const child = ctx.params?.child || CHILDREN[0];
  // each child carries its own persistent rules config; seed defaults if missing
  if (!child.cfg) child.cfg = {
    mode: child.mode || 'smart',
    cats: Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])),
    sens: 2, notif: true, gam: true, rules: [],
  };
  const cfg = child.cfg;
  const [, force] = React.useReducer(x => x + 1, 0);
  const update = patch => { Object.assign(cfg, patch); force(); };

  const mode = cfg.mode, cats = cfg.cats, sens = cfg.sens, notif = cfg.notif, gam = cfg.gam;
  const setModeBoth = m => { update({ mode: m }); ctx.setMode(m); };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={`${child.name} · ${child.device}`} title={L('Rules & settings')} onBack={() => ctx.nav('p_children')}
        right={<MascotChip species={child.avatar} color={child.color} size={40} bg={THEME.primaryLight} />} />
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
              {APP_CATEGORIES.map((c, i) => {
                // each category gets a distinct system avatar palette
                const pal = { video: 'sakura', games: 'iris', social: 'ocean', browser: 'tropic', camera: 'moss', phone: 'pebble' }[c.id] || 'sand';
                return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: `var(--color-interactives-avatar-${pal}-default)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={`var(--color-interactives-avatar-${pal}-icon)`} stroke={2.2} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{L(c.name)}</div>
                    {c.locked && <div style={{ fontSize: 11.5, color: THEME.success, fontWeight: 600 }}>{L('Always allowed')}</div>}
                  </div>
                  {c.locked ? <Icon name="lock" size={16} color={THEME.fg3} stroke={2.3} /> : <Toggle on={cats[c.id]} onChange={v => update({ cats: { ...cats, [c.id]: v } })} />}
                </div>
              );})}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Warning sensitivity')}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['Gentle', 'Balanced', 'Strict'].map((l, i) => (
                  <button key={l} onClick={() => update({ sens: i + 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? THEME.primary : THEME.fg3 }}>{L(l)}</button>
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
          {(cfg.rules || []).map((r, i) => {
            // Badges consume the system badge tokens directly: {palette}-default (20) bg + {palette}-label (70) text
            const tagCol = RULE_TAG_COLORS[r.tag] || RULE_TAG_COLORS.Relaxed;
            return (
            <div key={i} onClick={() => ctx.nav('p_schedule', { child, rule: r, index: i })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L(r.t)}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{r.s}</div>
              </div>
              <Badge style={{ background: tagCol.bg, color: tagCol.c }}>{L(r.tag)}</Badge>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
            </div>
            );
          })}
          <div onClick={() => ctx.nav('p_schedule', { child, rule: null, index: -1 })} style={{ borderTop: `1px solid ${THEME.border}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 8, color: THEME.primary, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            <Icon name="plus" size={17} color={THEME.primary} stroke={2.4} /> {L('Add a schedule')}
          </div>
        </div>

        {/* prefs */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Preferences')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="bell" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Notify me of activity')}</div><Toggle on={notif} onChange={v => update({ notif: v })} />
          </div>
          {mode === 'smart' && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${THEME.border}` }}>
            <Icon name="gamepad-2" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Character game & rewards')}</div><Toggle on={gam} onChange={v => update({ gam: v })} />
          </div>}
        </div>
      </div>
    </div>
  );
}

// ── Children / devices ───────────────────────────────────────────────
function ParentChildren({ ctx }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={getLang() === 'ko' ? `${CHILDREN.length}명 연결됨` : `${CHILDREN.length} connected`} title={L('Children')} right={<button onClick={() => ctx.nav('p_addchild')} style={{ width: 40, height: 40, borderRadius: 999, background: THEME.primary, border: 'none', boxShadow: THEME.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></button>} />
      <div style={{ padding: '8px 16px 0' }}>
        {CHILDREN.map((k, ki) => {
          const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][ki % 6];  // distinct avatar palette per child
          return (
          <div key={k.id} onClick={() => ctx.nav('p_settings', { child: k })} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ position: 'relative' }}>
                <MascotChip species={k.avatar} color={k.color} size={56} bg={`var(--color-interactives-avatar-${pal}-default)`} />
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
          );})}

        <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginTop: 4 }}>
          <Icon name="shield-check" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('Privacy first')}</div>
            <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{FEATURES.dangerZones ? L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.") : L("JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Parent / account settings (global — not tied to one child) ───────
function ParentAccount({ ctx }) {
  const [push, setPush] = React.useState(true);
  const [weekly, setWeekly] = React.useState(true);
  const chev = <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />;
  const rowStyle = i => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' });
  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const card = children => <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>{children}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L('Parent app')} title={L('Settings')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* account identity */}
        <div onClick={() => ctx.nav('p_detail', { page: 'account' })} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, cursor: 'pointer' }}>
          <div style={{ width: 52, height: 52, borderRadius: 999, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800 }}>S</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Sora Kim</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>sora.kim@email.com</div>
          </div>
          {chev}
        </div>

        {label(L('Subscription'))}
        {card(
          <div onClick={() => ctx.nav('p_detail', { page: 'plan' })} style={{ ...rowStyle(0) }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={18} color={THEME.gold} stroke={2.2} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('JoanX Family')}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{CHILDREN.length} {L('of 5 children connected')}</div>
            </div>
            <Badge variant="success">{L('Active')}</Badge>
          </div>
        )}

        {label(L('Notifications'))}
        {card(<React.Fragment>
          <div style={{ ...rowStyle(0), cursor: 'default' }}><Icon name="bell" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Push notifications')}</div><Toggle on={push} onChange={setPush} /></div>
          <div style={{ ...rowStyle(1), cursor: 'default' }}><Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Weekly summary email')}</div><Toggle on={weekly} onChange={setWeekly} /></div>
        </React.Fragment>)}

        {label(L('Privacy & data'))}
        {card(<React.Fragment>
          <div onClick={() => ctx.nav('p_detail', { page: 'privacy' })} style={rowStyle(0)}><Icon name="shield-check" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Data & privacy')}</div>{chev}</div>
          {FEATURES.dangerZones && <div onClick={() => ctx.nav('p_detail', { page: 'location' })} style={rowStyle(1)}><Icon name="map-pin" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Location history')}</div>{chev}</div>}
          <div onClick={() => ctx.nav('p_detail', { page: 'export' })} style={rowStyle(FEATURES.dangerZones ? 2 : 1)}><Icon name="download" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Export my data')}</div>{chev}</div>
        </React.Fragment>)}

        {label(L('General'))}
        {card(<React.Fragment>
          <div onClick={() => ctx.nav('p_detail', { page: 'language' })} style={rowStyle(0)}><Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div><span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginRight: 4 }}>{ctx.lang === 'ko' ? '한국어' : 'English'}</span>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'help' })} style={rowStyle(1)}><Icon name="help-circle" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Help & support')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'faq' })} style={rowStyle(2)}><Icon name="messages-square" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('FAQ')}</div>{chev}</div>
          <div onClick={() => ctx.nav('p_detail', { page: 'about' })} style={rowStyle(3)}><Icon name="info" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('About JoanX')}</div>{chev}</div>
        </React.Fragment>)}

        {card(
          <div onClick={() => ctx.nav('p_detail', { page: 'signout' })} style={{ ...rowStyle(0), justifyContent: 'center' }}><Icon name="log-out" size={18} color={THEME.danger} stroke={2.2} /><div style={{ fontSize: 14, fontWeight: 800, color: THEME.danger }}>{L('Sign out')}</div></div>
        )}

        <div style={{ textAlign: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4 }}>JoanX · v1.0.0</div>
      </div>
    </div>
  );
}

// ── Add a child / pair a device ──────────────────────────────────────
function ParentAddChild({ ctx }) {
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('');
  const [device, setDevice] = React.useState('iPhone');
  const [mode, setMode] = React.useState('smart');
  const code = 'JNX-4821';

  const pickBtn = (key, active, onClick, children) => (
    <button key={key} onClick={onClick} style={{ flex: 1, border: `1.5px solid ${active ? THEME.primary : THEME.border}`, background: active ? THEME.primaryLight : '#fff', color: active ? THEME.primaryDark : THEME.fg2, borderRadius: 14, padding: '12px 8px', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>{children}</button>
  );

  const addChild = () => {
    const i = CHILDREN.length;
    CHILDREN.push({
      id: 'k' + (i + 1), name: name.trim() || 'New child', age: parseInt(age, 10) || 8, mode,
      device: device === 'iPhone' ? 'iPhone 15' : 'Galaxy A15', battery: 100, online: false, lastSeen: 'pairing…',
      avatar: ['cat', 'croc', 'owl', 'fox', 'bird'][i % 5], color: ['#a8c3eb', '#59c08c', '#b9a3ef', '#e1874a', '#67c7ce'][i % 5],
      cfg: {
        mode, cats: Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])), sens: 2, notif: true, gam: mode === 'smart',
        rules: [{ t: 'School commute', s: 'Mon–Fri · 8:00–8:40 AM', tag: 'Strict' }, { t: 'At home', s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' }],
      },
    });
    ctx.nav('p_children');
  };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L('Connect a new device')} title={L('Add a child')} onBack={() => ctx.nav('p_children')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* how pairing works */}
        <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginBottom: 18 }}>
          <Icon name="smartphone" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('How pairing works')}</div>
            <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Install JoanX on your child’s phone, open it, and enter the pairing code below. Their device links to your account.')}</div>
          </div>
        </div>

        {/* details form */}
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label={L("Child's name")} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Mina')} icon="user" />
          <Input label={L('Age')} value={age} onChange={e => setAge(e.target.value.replace(/[^0-9]/g, ''))} placeholder="8" icon="cake" />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 6 }}>{L('Device')}</div>
            <div style={{ display: 'flex', gap: 8 }}>{['iPhone', 'Android'].map(d => pickBtn(d, device === d, () => setDevice(d), d))}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 6 }}>{L('Starting mode')}</div>
            <div style={{ display: 'flex', gap: 8 }}>{[['smart', 'Smart'], ['lite', 'Lite']].map(([id, t]) => pickBtn(id, mode === id, () => setMode(id), L(t)))}</div>
          </div>
        </div>

        {/* pairing code */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Pairing code')}</div>
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2, color: THEME.fg1 }}>{code}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: THEME.primary, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Icon name="copy" size={16} color={THEME.primary} stroke={2.3} />{L('Copy')}</div>
        </div>

        <Button variant="primary" fullWidth icon="user-plus" onClick={addChild}>{L('Add child')}</Button>
      </div>
    </div>
  );
}

// ── Settings detail pages (one screen per row) ───────────────────────
function ParentDetail({ ctx }) {
  const page = ctx.params?.page || 'account';
  const [twoFA, setTwoFA] = React.useState(true);
  const [faceId, setFaceId] = React.useState(true);
  const [analytics, setAnalytics] = React.useState(true);
  const [tips, setTips] = React.useState(true);
  const [keepLoc, setKeepLoc] = React.useState(true);
  const [retention, setRetention] = React.useState(30);
  const [format, setFormat] = React.useState('PDF');
  const [exported, setExported] = React.useState(false);

  const chev = <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />;
  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const card = (children, mb = 18) => <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: mb, overflow: 'hidden' }}>{children}</div>;
  const rowStyle = (i, click) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: click ? 'pointer' : 'default' });
  const navRow = (i, icon, title, trailing, sub, onClick) => (
    <div style={rowStyle(i, true)} onClick={onClick}>
      {icon && <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />}
      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>{sub && <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{sub}</div>}</div>
      {trailing || chev}
    </div>
  );
  const toggleRow = (i, icon, title, on, set) => (
    <div style={rowStyle(i, false)}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{title}</div>
      <Toggle on={on} onChange={set} />
    </div>
  );
  const check = (i, text) => (
    <div style={rowStyle(i, false)}><Icon name="check" size={17} color={THEME.success} stroke={2.6} /><div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{text}</div></div>
  );
  const banner = (icon, title, text) => (
    <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginBottom: 18 }}>
      <Icon name={icon} size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{title && <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{title}</div>}
        <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: title ? 3 : 0, opacity: .9 }}>{text}</div></div>
    </div>
  );
  const seg = (opts, val, set) => (
    <div style={{ display: 'flex', gap: 6, background: THEME.surface2, borderRadius: 12, padding: 4 }}>
      {opts.map(o => { const v = o.v != null ? o.v : o, on = val === v; return (
        <button key={String(v)} onClick={() => set(v)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, borderRadius: 9, padding: '8px 6px', background: on ? '#fff' : 'transparent', color: on ? THEME.primary : THEME.fg2, boxShadow: on ? THEME.shadowCard : 'none' }}>{o.l != null ? o.l : o}</button>
      ); })}
    </div>
  );

  // page → { title, sub, body }
  const PAGES = {
    account: { title: L('Account'), sub: L('Profile & security'), body: (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800 }}>S</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 800 }}>Sora Kim</div><div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>{L('Parent account')}</div></div>
        </div>
        {label(L('Account details'))}
        {card(<React.Fragment>
          {navRow(0, 'user', L('Name'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>Sora Kim</span>)}
          {navRow(1, 'mail', L('Email'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>sora.kim@email.com</span>)}
          {navRow(2, 'phone', L('Phone'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>+82 10-1234-5678</span>)}
        </React.Fragment>)}
        {label(L('Security'))}
        {card(<React.Fragment>
          {navRow(0, 'lock', L('Change password'))}
          {toggleRow(1, 'shield-check', L('Two-factor authentication'), twoFA, setTwoFA)}
          {toggleRow(2, 'scan-face', L('Face ID unlock'), faceId, setFaceId)}
        </React.Fragment>)}
        {label(L('Guardians'))}
        {card(<React.Fragment>
          {navRow(0, 'user', 'Min-jun Kim', chev, L('Co-parent'))}
          <div style={{ ...rowStyle(1, true), color: THEME.primary }}><Icon name="user-plus" size={18} color={THEME.primary} stroke={2.3} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.primary }}>{L('Invite a guardian')}</div></div>
        </React.Fragment>)}
      </React.Fragment>
    ) },

    plan: { title: L('Subscription'), sub: L('JoanX Family plan'), body: (
      <React.Fragment>
        <div style={{ borderRadius: 22, padding: 20, background: 'linear-gradient(160deg,#fff7e6,#fff 80%)', boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="sparkles" size={20} color={THEME.gold} stroke={2.2} /><span style={{ fontSize: 16, fontWeight: 800 }}>{L('JoanX Family')}</span></div>
            <Badge variant="success">{L('Active')}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>$9.99</span><span style={{ fontSize: 14, color: THEME.fg2, fontWeight: 600, marginBottom: 5 }}>{L('/ month')}</span></div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 4 }}>{L('Renews')} Jul 1, 2026</div>
        </div>
        {label(L("What's included"))}
        {card(<React.Fragment>
          {check(0, L('Up to 5 children'))}{check(1, L('Smart & Lite modes'))}{check(2, L('Live safety warnings'))}{check(3, L('Weekly progress reports'))}{check(4, L('Priority support'))}
        </React.Fragment>)}
        {card(
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg2 }}>{L('Children connected')}</span><span style={{ fontSize: 13, fontWeight: 800 }}>{CHILDREN.length} / 5</span></div>
            <Bar value={CHILDREN.length} max={5} color={THEME.gold} height={10} />
          </div>
        )}
        <Button variant="secondary" fullWidth icon="credit-card" style={{ marginBottom: 10 }}>{L('Manage billing')}</Button>
        <Button variant="primary" fullWidth icon="arrow-up-circle">{L('Change plan')}</Button>
      </React.Fragment>
    ) },

    privacy: { title: L('Data & privacy'), sub: L('Control your data'), body: (
      <React.Fragment>
        {banner('shield-check', L('Privacy first'), L('Your privacy is protected. JoanX never reads messages or sells your data.'))}
        {card(<React.Fragment>
          {toggleRow(0, 'bar-chart-3', L('Share anonymous analytics'), analytics, setAnalytics)}
          {toggleRow(1, 'lightbulb', L('Personalized safety tips'), tips, setTips)}
        </React.Fragment>)}
        {card(<React.Fragment>
          {navRow(0, 'database', L('What we collect'))}
          {navRow(1, 'share-2', L('Third-party sharing'), <span style={{ fontSize: 13, color: THEME.success, fontWeight: 700 }}>{L('None')}</span>)}
        </React.Fragment>)}
        {card(
          <div style={{ ...rowStyle(0, true) }}><Icon name="trash-2" size={18} color={THEME.danger} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.danger }}>{L('Delete all my data')}</div></div>
        )}
      </React.Fragment>
    ) },

    location: { title: L('Location history'), sub: L('Smart mode only'), body: (
      <React.Fragment>
        {banner('map-pin', null, L('Location is only used in Smart mode while your child is walking. Never tracked at rest.'))}
        {card(<React.Fragment>
          {toggleRow(0, 'history', L('Keep location history'), keepLoc, setKeepLoc)}
          <div style={{ ...rowStyle(1, false), flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Keep for')}</div>
            {seg([{ v: 7, l: '7 ' + L('days') }, { v: 30, l: '30 ' + L('days') }, { v: 90, l: '90 ' + L('days') }], retention, setRetention)}
          </div>
        </React.Fragment>)}
        {label(L('Recent locations'))}
        {card(<React.Fragment>
          {navRow(0, 'map-pin', L('Oak St. crossing'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Today')} 8:12 AM</span>)}
          {navRow(1, 'map-pin', L('School gate'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Today')} 8:30 AM</span>)}
          {navRow(2, 'map-pin', L('Home'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Yesterday')} 4:05 PM</span>)}
        </React.Fragment>)}
        <Button variant="outline" fullWidth icon="trash-2">{L('Clear history')}</Button>
      </React.Fragment>
    ) },

    export: { title: L('Export my data'), sub: L('Download a copy'), body: (
      <React.Fragment>
        {banner('download', null, L('Get a copy of everything JoanX stores about your family.'))}
        {label(L('Included in export'))}
        {card(<React.Fragment>{check(0, L('Reports & activity'))}{check(1, L('Safety events'))}{check(2, L('Settings & rules'))}</React.Fragment>)}
        {label(L('Format'))}
        {card(<div style={{ padding: 14 }}>{seg(['PDF', 'CSV', 'JSON'], format, setFormat)}</div>)}
        {card(<div style={{ ...rowStyle(0, false) }}><Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Send to')}</div><span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>sora.kim@email.com</span></div>)}
        {exported
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: THEME.successLight, borderRadius: 16, padding: 14 }}><Icon name="check-circle-2" size={20} color={THEME.success} stroke={2.3} /><span style={{ fontSize: 13.5, fontWeight: 700, color: '#274427' }}>{L("We'll email you a download link shortly.")}</span></div>
          : <Button variant="primary" fullWidth icon="download" onClick={() => setExported(true)}>{L('Request export')}</Button>}
      </React.Fragment>
    ) },

    language: { title: L('Language'), sub: L('Choose your language'), body: (
      <React.Fragment>
        {card([['en', 'English'], ['ko', '한국어']].map(([code, native], i) => {
          const on = ctx.lang === code;
          return (
            <div key={code} onClick={() => ctx.setLang(code)} style={rowStyle(i, true)}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: on ? THEME.primary : THEME.fg1 }}>{native}</div>
              {on && <Icon name="check" size={20} color={THEME.primary} stroke={2.6} />}
            </div>
          );
        }))}
        <div style={{ fontSize: 12.5, color: THEME.fg2, padding: '0 4px', lineHeight: 1.45 }}>{L('Changes the language across the whole app.')}</div>
      </React.Fragment>
    ) },

    help: { title: L('Help & support'), sub: L("We're here to help"), body: (
      <React.Fragment>
        {label(L('Popular questions'))}
        {card(<React.Fragment>
          {navRow(0, 'help-circle', L('What’s the difference between Smart and Lite mode?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(1, 'help-circle', L('Is my child’s location private?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(2, 'help-circle', L('How do I add another child?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(3, 'help-circle', L('How are points earned?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(4, 'messages-square', L('Browse all FAQs'), chev, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
        </React.Fragment>)}
        {label(L('Contact us'))}
        {card(<React.Fragment>
          {navRow(0, 'message-circle', L('Chat with support'))}
          {navRow(1, 'mail', L('Email us'), <span style={{ fontSize: 12.5, color: THEME.fg3 }}>help@joanx.app</span>)}
        </React.Fragment>)}
        {card(<React.Fragment>
          {navRow(0, 'book-open', L('User guide'))}
          {navRow(1, 'play-circle', L('Video tutorials'))}
        </React.Fragment>)}
      </React.Fragment>
    ) },

    faq: { title: L('FAQ'), sub: L('Answers to common questions'), back: 'help', body: (
      <React.Fragment>
        {FAQ_GROUPS.map((g, gi) => (
          <React.Fragment key={gi}>
            {label(L(g.label))}
            <FaqAccordion items={g.items} />
          </React.Fragment>
        ))}
        <div style={{ display: 'flex', gap: 12, background: THEME.primaryLight, borderRadius: 18, padding: 16, marginTop: 2 }}>
          <Icon name="message-circle" size={20} color={THEME.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: THEME.primaryDark }}>{L('Still need help?')}</div>
            <div style={{ fontSize: 12.5, color: THEME.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Chat with our support team or email help@joanx.app — we usually reply within a day.')}</div>
          </div>
        </div>
      </React.Fragment>
    ) },

    about: { title: L('About JoanX'), sub: 'Version 1.0.0', body: (
      <React.Fragment>
        <div style={{ textAlign: 'center', padding: '12px 0 22px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: THEME.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowPrimary, marginBottom: 12 }}><Icon name="shield-check" size={36} color="#fff" stroke={2.2} /></div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>JoanX</div>
          <div style={{ fontSize: 12.5, color: THEME.fg3, marginTop: 2 }}>Version 1.0.0</div>
          <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 12, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>{L('A calmer way to keep kids safe while they walk and grow.')}</div>
        </div>
        {card(<React.Fragment>
          {navRow(0, 'file-text', L('Terms of Service'))}
          {navRow(1, 'shield-check', L('Privacy Policy'))}
          {navRow(2, 'code', L('Open-source licenses'))}
          {navRow(3, 'star', L('Rate JoanX'))}
        </React.Fragment>)}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L('Made with care for safer walks.')}</div>
      </React.Fragment>
    ) },

    signout: { title: L('Sign out'), sub: null, body: (
      <div style={{ textAlign: 'center', padding: '24px 8px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--color-interactives-badge-rust-default)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="log-out" size={28} color={THEME.danger} stroke={2.3} /></div>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>{L('Sign out?')}</div>
        <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L('You can sign back in anytime. Your children stay protected.')}</div>
        <Button variant="danger" fullWidth icon="log-out" style={{ marginBottom: 10 }} onClick={() => ctx.nav('p_reports')}>{L('Sign out')}</Button>
        <Button variant="outline" fullWidth onClick={() => ctx.nav('p_account')}>{L('Cancel')}</Button>
      </div>
    ) },
  };

  const p = PAGES[page] || PAGES.account;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={p.sub} title={p.title} onBack={() => p.back ? ctx.nav('p_detail', { page: p.back }) : ctx.nav('p_account')} />
      <div style={{ padding: '8px 16px 0' }}>{p.body}</div>
    </div>
  );
}

// ── AI parent report (F-31) — natural-language read of the week ──────
function ParentAIReport({ ctx }) {
  const m = PARENT_METRICS;
  const first = RISK_TREND[0], last = RISK_TREND[RISK_TREND.length - 1];
  const summary = L('This week Mina is clearly building a safer walking habit. Daily risky phone-use moments fell from {a} to {b} — about {c}% fewer than her first week. She now stops for {d}% of warnings, and her average reaction time is down to {e} seconds. Mornings are her strongest window; most remaining risks show up on the after-school walk.')
    .replace('{a}', first).replace('{b}', last).replace('{c}', m.riskReduction).replace('{d}', m.acceptance).replace('{e}', m.avgResponse);

  const improving = [
    { icon: 'timer', t: 'Faster reactions', s: `${L('Now')} ${m.avgResponse}s ${L('on average — down 0.3s from last week.')}` },
    { icon: 'trending-down', t: 'Fewer risky moments', s: `${first} → ${last} ${L('per day across the week.')}` },
    { icon: 'footprints', t: 'More safe walking', s: `${m.safeWalkMin} ${L('safe minutes this week (+12%).')}` },
  ];
  const actions = [
    { icon: 'sun', t: 'Keep the morning routine', s: L('Her morning commute is nearly risk-free — whatever you’re doing, it’s working.') },
    { icon: 'map-pin', t: 'Talk about the after-school walk', s: L('Most warnings happen near Oak St. around 3pm. A gentle check-in can help.') },
    { icon: 'flame', t: 'Celebrate the streak', s: L('Mina is on a 5-day safe streak. Naming it out loud reinforces the habit.') },
  ];

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={L('This week · Mina')} title={L('AI Safety Report')} onBack={() => ctx.nav('p_reports')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* AI summary */}
        <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(160deg,#eef3fe,#fff 82%)', boxShadow: THEME.shadowCard, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: THEME.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={17} color="#fff" stroke={2.3} /></div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L('In a nutshell')}</span>
            <Badge variant="primary" style={{ marginLeft: 'auto' }}>{L('AI')}</Badge>
          </div>
          <div style={{ fontSize: 13.5, color: THEME.fg1, lineHeight: 1.55 }}>{summary}</div>
        </div>

        {/* headline metric */}
        <div style={{ display: 'flex', gap: 12, background: THEME.successLight, borderRadius: 18, padding: 16, marginBottom: 16 }}>
          <Icon name="trending-up" size={22} color={THEME.success} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#274427', lineHeight: 1 }}>{m.riskReduction}% {L('safer')}</div>
            <div style={{ fontSize: 12.5, color: '#274427', opacity: .9, marginTop: 4, lineHeight: 1.4 }}>{L('Fewer risky walking-while-using moments than her first week on JoanX.')}</div>
          </div>
        </div>

        {/* what's improving */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L("What's improving")}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {improving.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={THEME.success} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{L(it.t)}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        {/* recommended actions */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Try this at home')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 16, overflow: 'hidden' }}>
          {actions.map((it, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={THEME.primary} stroke={2.3} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{L(it.t)}</div><div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1, lineHeight: 1.4 }}>{it.s}</div></div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, justifyContent: 'center', fontSize: 11, color: THEME.fg3, marginTop: 4, lineHeight: 1.5, textAlign: 'center', padding: '0 12px' }}>
          <Icon name="sparkles" size={12} color={THEME.fg3} stroke={2.2} />
          {L('AI-generated from this week’s activity. It summarizes behavior trends — it never shares raw locations or messages.')}
        </div>
      </div>
    </div>
  );
}

// ── Schedule editor (add / edit a child's time rule) ─────────────────
function ParentSchedule({ ctx }) {
  const child = ctx.params?.child || CHILDREN[0];
  const editing = ctx.params?.rule || null;
  const index = ctx.params?.index != null ? ctx.params.index : -1;
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const [name, setName] = React.useState(editing ? editing.t : '');
  const [tag, setTag] = React.useState(editing ? editing.tag : 'Balanced');
  const [days, setDays] = React.useState([0, 1, 2, 3, 4]);
  const [start, setStart] = React.useState('8:00 AM');
  const [end, setEnd] = React.useState('8:40 AM');

  const toggleDay = d => setDays(s => s.includes(d) ? s.filter(x => x !== d) : [...s, d].sort((a, b) => a - b));

  const composeWhen = () => {
    const s = [...days].sort((a, b) => a - b);
    let dl;
    if (s.length === 7) dl = 'Daily';
    else if (s.join() === '0,1,2,3,4') dl = 'Mon–Fri';
    else if (s.join() === '5,6') dl = 'Weekends';
    else if (!s.length) dl = '';
    else dl = s.map(i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]).join(', ');
    const tl = (start && end) ? `${start}–${end}` : '';
    return [dl, tl].filter(Boolean).join(' · ');
  };

  const save = () => {
    const rule = { t: name.trim() || 'New schedule', s: composeWhen() || (editing ? editing.s : ''), tag };
    if (!child.cfg.rules) child.cfg.rules = [];
    if (index >= 0) child.cfg.rules[index] = rule; else child.cfg.rules.push(rule);
    ctx.nav('p_settings', { child });
  };
  const remove = () => {
    if (index >= 0 && child.cfg.rules) child.cfg.rules.splice(index, 1);
    ctx.nav('p_settings', { child });
  };

  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={child.name} title={editing ? L('Edit schedule') : L('New schedule')} onBack={() => ctx.nav('p_settings', { child })} />
      <div style={{ padding: '8px 16px 0' }}>

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <Input label={L('Schedule name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. School commute')} icon="clock" />
        </div>

        {label(L('Protection level'))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {['Strict', 'Balanced', 'Relaxed'].map(t => {
            const active = tag === t, col = RULE_TAG_COLORS[t];
            return <button key={t} onClick={() => setTag(t)} style={{ flex: 1, border: `1.5px solid ${active ? 'transparent' : THEME.border}`, background: active ? col.bg : '#fff', color: active ? col.c : THEME.fg2, borderRadius: 14, padding: '12px 8px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: active ? THEME.shadowCard : 'none' }}>{L(t)}</button>;
          })}
        </div>

        {label(L('Active days'))}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {DAYS.map((d, i) => {
            const on = days.includes(i);
            return <button key={i} onClick={() => toggleDay(i)} style={{ flex: 1, height: 42, border: 'none', borderRadius: 12, background: on ? THEME.primary : THEME.surface2, color: on ? '#fff' : THEME.fg2, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{d}</button>;
          })}
        </div>

        {label(L('Time'))}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('Start')} value={start} onChange={e => setStart(e.target.value)} placeholder="8:00 AM" icon="sunrise" /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('End')} value={end} onChange={e => setEnd(e.target.value)} placeholder="8:40 AM" icon="sunset" /></div>
        </div>

        <Button variant="primary" fullWidth icon="check" onClick={save} style={{ marginBottom: 10 }}>{L('Save schedule')}</Button>
        {editing && <Button variant="outline" fullWidth icon="trash-2" onClick={remove} style={{ color: THEME.danger }}>{L('Delete schedule')}</Button>}
      </div>
    </div>
  );
}

Object.assign(window, { ParentReports, ParentSettings, ParentChildren, ParentAccount, ParentAddChild, ParentDetail, ParentSchedule, ParentAIReport });
