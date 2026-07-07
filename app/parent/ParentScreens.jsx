// JoanX — parent app screens: Reports dashboard, Settings/rules, Children.
// Parent surfaces stay in TripMe's calm, trustworthy register (system font).

// Brand palette derived from the JoanX logo magenta (#E00477).
const BRAND = {
  primary:     '#E00477',            // core brand magenta
  primaryDark: '#B00360',            // pressed / deep accent
  primaryLight:'#FCE4F0',            // soft tint — badges, chips, backgrounds
  onPrimary:   '#FFFFFF',            // text/icons on the magenta
  shadow:      'rgba(224,4,119,.32)',// CTA drop shadow
  shadowPrimary: '0 8px 18px rgba(224,4,119,.30)',  // brand glow under CTAs / accents
  ink:         '#3D3D3D',            // softened logo black — active/focus states (inputs, radios, cards)
};
const brandBtn = { background: BRAND.primary, boxShadow: `0 8px 20px ${BRAND.shadow}` };

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
      <MascotChip species={k.avatar} color={k.color} size={32} bg={BRAND.primaryLight} />
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
              <Icon name="help-circle" size={18} color={BRAND.primary} stroke={2.2} style={{ flexShrink: 0 }} />
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
        <button onClick={() => ctx.nav('p_aireport')} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 20, padding: 16, marginTop: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, boxShadow: BRAND.shadowPrimary }}>
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
            <Icon name="sparkles" size={17} color={BRAND.primary} stroke={2.3} />
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

  // device-change approval (child signed in on a new phone)
  const [reviewDevice, setReviewDevice] = React.useState(false);
  const approveDevice = () => { child.device = child.pendingDevice.device; child.online = true; child.lastSeen = 'now'; child.battery = 100; delete child.pendingDevice; setReviewDevice(false); force(); };
  const dismissDevice = () => { delete child.pendingDevice; setReviewDevice(false); force(); };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={`${child.name} · ${child.device}`} title={L('Rules & settings')} onBack={() => ctx.nav('p_children')}
        right={<MascotChip species={child.avatar} color={child.color} size={40} bg={BRAND.primaryLight} />} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* device connection — start pairing (code / QR) from here */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Device')}</div>
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: child.online ? THEME.svcGreenBg : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="smartphone" size={20} color={child.online ? THEME.success : THEME.fg3} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{child.device}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: child.online ? THEME.success : THEME.fg3 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: child.online ? THEME.success : THEME.fg2 }}>{child.online ? L('Connected') : L('Not connected')}</span>
              </div>
            </div>
          </div>
          {child.pendingDevice && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: THEME.warningLight, border: `1px solid ${shade(THEME.warning, 78)}`, borderRadius: 14, padding: '12px 14px', marginTop: 14 }}>
              <Icon name="shield-alert" size={18} color={THEME.warning} stroke={2.3} style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.warning }}>{L('New device sign-in detected')}</div>
                <div style={{ fontSize: 12, color: THEME.warning, lineHeight: 1.45, marginTop: 2, opacity: .9 }}>{child.name} · {child.pendingDevice.device} · {child.pendingDevice.when}</div>
                <button onClick={() => setReviewDevice(true)} style={{ marginTop: 10, padding: '8px 16px', background: THEME.warning, color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>{L('Review')}</button>
              </div>
            </div>
          )}
          <button onClick={() => ctx.nav('p_addchild', { pair: true, pairChildId: child.id })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 14, padding: '12px', background: child.online ? '#fff' : BRAND.primaryLight, color: BRAND.primaryDark, border: child.online ? `1.5px solid ${THEME.border}` : 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}>
            <Icon name={child.online ? 'refresh-cw' : 'link-2'} size={16} color={BRAND.primary} stroke={2.4} />{L(child.online ? 'Reconnect device' : 'Connect device')}
          </button>
        </div>

        {/* mode */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Protection mode')}</div>
        <div style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 16, padding: 6, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          {[{ id: 'smart', t: 'Smart', d: 'Warnings + game' }, { id: 'lite', t: 'Lite', d: 'Hard block' }].map(o => (
            <button key={o.id} onClick={() => setModeBoth(o.id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '12px 8px', background: mode === o.id ? BRAND.primary : 'transparent', transition: 'background .2s' }}>
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
                  <button key={l} onClick={() => update({ sens: i + 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? BRAND.primary : THEME.fg3 }}>{L(l)}</button>
                ))}
              </div>
              <div style={{ position: 'relative', height: 8, background: THEME.border, borderRadius: 999 }}>
                <div style={{ width: `${(sens - 1) * 50}%`, height: '100%', background: BRAND.primary, borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${(sens - 1) * 50}%`, transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 999, background: '#fff', border: `3px solid ${BRAND.primary}`, boxShadow: THEME.shadowCard }} />
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
          <div onClick={() => ctx.nav('p_schedule', { child, rule: null, index: -1 })} style={{ borderTop: `1px solid ${THEME.border}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 8, color: BRAND.primary, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            <Icon name="plus" size={17} color={BRAND.primary} stroke={2.4} /> {L('Add a schedule')}
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

      {/* device-change approval sheet */}
      {reviewDevice && child.pendingDevice && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={dismissDevice} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
          <div className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 22px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield-alert" size={28} color={THEME.warning} stroke={2.2} />
              </div>
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, textAlign: 'center', margin: '0 0 6px' }}>{L('Approve new device?')}</h1>
            <p style={{ fontSize: 13.5, color: THEME.fg2, textAlign: 'center', lineHeight: 1.5, margin: '0 auto 16px', maxWidth: 300 }}>{child.name}{L("'s account is being used on a new phone. Only one device can be protected at a time.")}</p>

            <div style={{ background: THEME.surface2, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
                <Icon name="smartphone" size={18} color={THEME.fg3} stroke={2.2} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 700 }}>{child.device}</div><div style={{ fontSize: 11.5, color: THEME.fg3 }}>{L('Current device')}</div></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderTop: `1px solid ${THEME.border}`, background: THEME.warningLight }}>
                <Icon name="smartphone-nfc" size={18} color={THEME.warning} stroke={2.2} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 800, color: '#7a4d18' }}>{child.pendingDevice.device}</div><div style={{ fontSize: 11.5, color: THEME.warning }}>{child.pendingDevice.when} · {child.pendingDevice.where}</div></div>
                <Badge variant="warning">{L('New')}</Badge>
              </div>
            </div>

            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={approveDevice}>{L('Approve & move here')}</Button>
            <button onClick={dismissDevice} style={{ width: '100%', marginTop: 10, padding: 10, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: THEME.fg2, cursor: 'pointer' }}>{L('Keep current device')}</button>
            <button onClick={dismissDevice} style={{ width: '100%', marginTop: 2, padding: 8, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: THEME.danger, cursor: 'pointer' }}>{L('Block this device')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Children / devices ───────────────────────────────────────────────
function ParentChildren({ ctx }) {
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={getLang() === 'ko' ? `자녀 ${CHILDREN.length}명 · ${CHILDREN.filter(c => c.online).length}명 연결됨` : `${CHILDREN.length} children · ${CHILDREN.filter(c => c.online).length} connected`} title={L('Children')} right={<button onClick={() => ctx.nav('p_addchild', { direct: true })} style={{ width: 40, height: 40, borderRadius: 999, background: BRAND.primary, border: 'none', boxShadow: BRAND.shadowPrimary, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="plus" size={20} color="#fff" stroke={2.6} /></button>} />
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
                  {k.pendingDevice
                    ? <Badge variant="warning"><Icon name="shield-alert" size={11} color="var(--color-interactives-badge-ember-label)" stroke={2.4} />{L('Action needed')}</Badge>
                    : <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: THEME.goldLight, color: '#9e7300', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800 }}><Icon name="flame" size={12} color={THEME.gold} stroke={2.4} />{k.streak || 0}{getLang() === 'ko' ? '일 안전' : 'd safe'}</span>}
                </div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>{L('Age')} {k.age} · {k.device}</div>
              </div>
              <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={k.online ? 'wifi' : 'wifi-off'} size={14} color={k.online ? THEME.success : THEME.fg3} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700, color: k.online ? THEME.success : THEME.fg2 }}>{k.online ? L('Protected now') : L('Not connected')}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{k.online ? `${L('Last seen')} ${k.lastSeen}` : L('Open to connect')}</div>
              </div>
              <div style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '9px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name="battery-medium" size={14} color={k.battery < 50 ? THEME.warning : THEME.fg2} stroke={2.3} /><span style={{ fontSize: 12, fontWeight: 700 }}>{k.online ? `${k.battery}%` : '—'}</span></div>
                <div style={{ fontSize: 10.5, color: THEME.fg3, marginTop: 2 }}>{L('Battery')}</div>
              </div>
            </div>
          </div>
          );})}

        <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginTop: 4 }}>
          <Icon name="shield-check" size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{L('Privacy first')}</div>
            <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{FEATURES.dangerZones ? L("JoanX never reads messages or listens. Location is used only in Smart mode while walking, and stored separately from your child's identity.") : L("JoanX never reads messages, listens, or tracks location. It only uses on-device motion to notice walking, stored separately from your child's identity.")}</div>
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
          <div style={{ width: 52, height: 52, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 800 }}>S</div>
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
// A "choose one" selector — mobile-native chip buttons instead of a native
// <select>. `opts` are [value, label] pairs; labels run through L(). Chips wrap
// and the picked one fills with the brand ocean, matching the form's Inputs.
// Korean-style horizontal radio group: a labelled row of circle-radio + text options.
function ChoiceGroup({ label, value, setter, opts, accent = BRAND.ink }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 10 }}>{label}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 22px', alignItems: 'center' }}>
        {opts.map(([v, lbl]) => {
          const on = value === v;
          return (
            <button key={v} type="button" onClick={() => setter(v)} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '4px 2px',
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{ width: 18, height: 18, flexShrink: 0, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `2px solid ${on ? accent : THEME.border}`, background: '#fff', transition: 'border-color .15s ease' }}>
                {on && <span style={{ width: 8, height: 8, borderRadius: 999, background: accent }} />}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: on ? 700 : 600, color: on ? THEME.fg1 : THEME.fg2, transition: 'color .15s ease' }}>{L(lbl)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Multi-step add-child wizard, aligned with the child app's onboarding:
// 1 Details → 2 Pair (code) → 3 Connected celebration → 4 Configure protection.
function ParentAddChild({ ctx }) {
  // Onboarding shows intro (0); "+" opens details (1); "Connect device" opens pairing (2).
  const [wiz, setWiz] = React.useState(ctx.params?.pair ? 2 : ctx.params?.direct ? 1 : 0);   // 0 intro · 1 details · 2 pair · 3 connected
  const ko = typeof getLang === 'function' && getLang() === 'ko';
  const ageFromDob = v => { if (!v) return null; const [y, m, d] = v.split('-').map(Number); const t = new Date(); let a = t.getFullYear() - y; const mo = t.getMonth() + 1; if (mo < m || (mo === m && t.getDate() < d)) a--; return a; };
  // multiple children can be added; each is a collapsible card
  const newKid = () => ({ name: '', dob: '', phone: '', relation: '', sibling: '' });
  const [kids, setKids] = React.useState([newKid()]);
  const [openKid, setOpenKid] = React.useState(0);   // which card is expanded (-1 = all collapsed)
  const updateKid = (i, patch) => setKids(ks => ks.map((k, j) => (j === i ? { ...k, ...patch } : k)));
  const addKid = () => { setOpenKid(kids.length); setKids(ks => [...ks, newKid()]); };
  const removeKid = i => { setKids(ks => ks.filter((_, j) => j !== i)); setOpenKid(Math.max(0, i - 1)); };
  const [cats, setCats] = React.useState(() => Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])));
  const [sens, setSens] = React.useState(2);
  const [notif, setNotif] = React.useState(true);
  const [scan, setScan] = React.useState(false);   // Pair step: show code vs. scan child's QR
  const [copied, setCopied] = React.useState(false);
  const mode = 'smart';   // Smart is the only mode in scope
  const code = '482193';   // 6-digit numeric — matches the child app's connect-code input

  React.useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const CAT_PAL = { video: 'sakura', games: 'iris', social: 'ocean', browser: 'tropic', camera: 'moss', phone: 'pebble' };

  const direct = !!ctx.params?.direct;   // opened via the "+" button (no intro)
  const pairMode = !!ctx.params?.pair;   // opened via a child's "Connect device" action
  const pairChild = ctx.params?.pairChildId ? CHILDREN.find(x => x.id === ctx.params.pairChildId) : null;
  const back = () => {
    if (wiz === 2) return pairMode ? ctx.nav('p_children') : setWiz(1);
    if (wiz === 1) return direct ? ctx.nav('p_children') : setWiz(0);
    return setWiz(wiz - 1);
  };
  const skip = () => ctx.nav('p_children');   // from the intro: add a child later from the Children tab
  // pairing complete → mark that child online and return to the list
  const finishPair = () => { if (pairChild) { pairChild.online = true; pairChild.lastSeen = 'just now'; pairChild.battery = 100; } ctx.nav('p_children'); };

  const addChild = () => {
    kids.forEach(kid => {
      const i = CHILDREN.length;
      CHILDREN.push({
        id: 'k' + (i + 1), name: kid.name.trim() || 'New child', age: ageFromDob(kid.dob) || 8, dob: kid.dob, mode, phone: kid.phone.trim(), relation: kid.relation, sibling: kid.sibling,
        device: 'iPhone 15', battery: 100, online: false, lastSeen: '—',
        avatar: ['cat', 'croc', 'owl', 'fox', 'bird'][i % 5], color: ['#a8c3eb', '#59c08c', '#b9a3ef', '#e1874a', '#67c7ce'][i % 5],
        cfg: {
          mode, cats, sens, notif, gam: true,
          rules: [{ t: 'School commute', s: 'Mon–Fri · 8:00–8:40 AM', tag: 'Strict' }, { t: 'At home', s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' }],
        },
      });
    });
    ctx.nav('p_children');
  };

  const childInitial = (((pairChild ? pairChild.name : (kids[0] && kids[0].name)) || '').trim()[0] || 'C').toUpperCase();
  const allNamed = kids.every(k => k.name.trim());

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 50 }}>

      {/* back + 3-segment progress (hidden on the connected celebration) */}
      {/* back shows on pair/configure, and on details only when opened via "+" (not from the intro) */}
      {((wiz === 1 && direct) || wiz === 2 || wiz === 4) && (
        <div style={{ padding: '6px 24px 0' }}>
          <button onClick={back} aria-label={L('Back')} style={{ width: 34, height: 34, borderRadius: 999, border: `1.5px solid ${THEME.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        </div>
      )}

      {/* 0 · intro — invite the parent to add/connect a child (or skip) */}
      {wiz === 0 && (
        <>
          {/* aligned background image — same as the onboarding intro */}
          <img src="onboarding/onboarding-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 240, background: 'linear-gradient(180deg, rgba(255,255,255,.7) 0%, rgba(255,255,255,0) 100%)', zIndex: 0 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 260, background: 'linear-gradient(0deg, #fff 16%, rgba(255,255,255,0) 100%)', zIndex: 0 }} />

          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 32px' }}>
            <h1 className="game-font" style={{ fontSize: 27, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.22 }}>{L('Add your child')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, maxWidth: 300 }}>{L('Connect your child’s phone to start keeping them safe — it only takes a minute.')}</p>
          </div>
          <div style={{ position: 'relative', zIndex: 1, padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => setWiz(1)}>{L('Add a child')}</Button>
            <button onClick={skip} style={{ width: '100%', marginTop: 12, padding: 8, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: THEME.fg2, cursor: 'pointer' }}>{L('Skip for now')}</button>
          </div>
        </>
      )}

      {/* 1 · child details */}
      {wiz === 1 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Add a child')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>{L('Tell us a little about your child to set up their device. You can add more than one.')}</p>

            {/* collapsible card per child — keeps many kids compact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kids.map((kid, i) => {
                const isOpen = openKid === i;
                const kAge = ageFromDob(kid.dob);
                const relLbl = { son: 'Son', daughter: 'Daughter', grandchild: 'Grandchild', other: 'Other child in my care' }[kid.relation];
                const summary = [kid.name.trim() || `${L('Child')} ${i + 1}`, kAge != null ? (ko ? `만 ${kAge}세` : `${kAge}y`) : null, relLbl ? L(relLbl) : null].filter(Boolean).join(' · ');
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: 18, border: `1.5px solid ${isOpen ? THEME.fg3 : THEME.border}`, boxShadow: isOpen ? THEME.shadowCard : 'none', overflow: 'hidden', transition: 'border-color .2s' }}>
                    <button onClick={() => setOpenKid(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: BRAND.primaryDark }}>{i + 1}</div>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0, fontSize: 14, fontWeight: 700, color: kid.name.trim() ? THEME.fg1 : THEME.fg3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
                      {kids.length > 1 && <span role="button" onClick={e => { e.stopPropagation(); removeKid(i); }} style={{ display: 'flex', padding: 4, cursor: 'pointer' }}><Icon name="trash-2" size={16} color={THEME.fg3} stroke={2.2} /></span>}
                      <Icon name="chevron-down" size={18} color={THEME.fg3} stroke={2.3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14, borderTop: `1px solid ${THEME.border}` }}>
                        <Input label={L("Child's name")} value={kid.name} onChange={e => updateKid(i, { name: e.target.value })} placeholder={L('e.g. Mina')} icon="user" accent={BRAND.ink} />
                        <div>
                          <Input label={L("Child's date of birth")} value={kid.dob} onChange={e => updateKid(i, { dob: e.target.value })} icon="cake" type="date" accent={BRAND.ink} />
                          {kid.dob && kAge != null && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '4px 11px', borderRadius: 999, background: BRAND.primaryLight, color: BRAND.primaryDark, fontSize: 12.5, fontWeight: 800 }}>
                              <Icon name="cake" size={13} color={BRAND.primary} stroke={2.3} />{ko ? `만 ${kAge}세` : `${kAge} ${kAge === 1 ? 'year' : 'years'} old`}
                            </div>
                          )}
                        </div>
                        <ChoiceGroup label={L('Relationship to you')} value={kid.relation} setter={v => updateKid(i, { relation: v })} opts={[['son', 'Son'], ['daughter', 'Daughter'], ['grandchild', 'Grandchild'], ['other', 'Other child in my care']]} />
                        <ChoiceGroup label={L('Position among siblings')} value={kid.sibling} setter={v => updateKid(i, { sibling: v })} opts={[['oldest', 'Oldest child'], ['middle', 'Middle child'], ['youngest', 'Youngest child'], ['only', 'Only child']]} />
                        <Input label={L("Child's phone number")} value={kid.phone} onChange={e => updateKid(i, { phone: e.target.value.replace(/[^0-9-]/g, '') })} placeholder="010-1234-5678" icon="phone" type="tel" accent={BRAND.ink} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* add another child */}
            <button onClick={addKid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 12, padding: 13, background: THEME.surface2, color: THEME.fg2, border: `1px solid ${THEME.border}`, borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="plus" size={17} color={THEME.fg2} stroke={2.6} />{L('Add another child')}
            </button>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!allNamed} onClick={allNamed ? addChild : undefined}>{L(kids.length > 1 ? 'Add children' : 'Add child')}</Button>
          </div>
        </>
      )}

      {/* 2 · pairing — show a code for the child to enter, or scan the child's QR */}
      {wiz === 2 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ alignSelf: 'stretch' }}>
              <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Connect their device')}</h1>
              <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L(scan ? "Point at the QR shown in your child's JoanX app." : "Install JoanX on your child's phone, open it, and enter this code.")}</p>
            </div>

            {scan ? (
              /* camera viewfinder — restrained, real-app style; tap simulates a successful scan */
              <div onClick={() => setWiz(3)} style={{ width: '100%', maxWidth: 300, aspectRatio: '0.92', borderRadius: 24, background: '#17191d', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 70px rgba(0,0,0,.55)' }}>
                {/* faint center light — suggests a live camera without neon */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 50% 44%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 70%)' }} />
                {/* thin white framing guides + a single subtle scan line */}
                <div style={{ position: 'absolute', top: '24%', left: '22%', right: '22%', bottom: '24%' }}>
                  {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], i) => (
                    <div key={i} style={{ position: 'absolute', [v]: 0, [h]: 0, width: 24, height: 24, [`border${v[0].toUpperCase() + v.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${h[0].toUpperCase() + h.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${v[0].toUpperCase() + v.slice(1)}${h[0].toUpperCase() + h.slice(1)}Radius`]: 9 }} />
                  ))}
                  <div className="jx-scan" style={{ position: 'absolute', left: 0, right: 0, height: 2, borderRadius: 999, background: 'rgba(255,255,255,.55)', boxShadow: '0 0 10px rgba(255,255,255,.45)' }} />
                </div>
                <span style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{L('Point at your child’s QR code')}</span>
              </div>
            ) : (
              /* pairing code — grouped code band (reads as one shareable code) + footer */
              <div style={{ alignSelf: 'stretch', background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, background: BRAND.primaryLight, borderRadius: 16, padding: '20px 12px' }}>
                  <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(0, 3)}</span>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: BRAND.primary, opacity: .35, flexShrink: 0 }} />
                  <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(3)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="clock" size={13} color={THEME.fg3} stroke={2.2} />
                    <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 700 }}>{L('Valid for 5 minutes')}</span>
                  </div>
                  <button onClick={() => setCopied(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: copied ? THEME.successLight : '#fff', color: copied ? THEME.success : BRAND.primaryDark, border: `1.5px solid ${copied ? 'transparent' : THEME.border}`, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all .15s' }}>
                    <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? THEME.success : BRAND.primary} stroke={2.6} />{L(copied ? 'Copied!' : 'Copy')}
                  </button>
                </div>
              </div>
            )}

            {/* toggle between code and scanner */}
            <button onClick={() => setScan(!scan)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '20px 0 0', padding: '9px 16px', background: THEME.surface2, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primaryDark, fontSize: 13, fontWeight: 800 }}>
              <Icon name={scan ? 'keyboard' : 'scan-line'} size={16} color={BRAND.primary} stroke={2.3} />{L(scan ? 'Show a code instead' : 'Scan their QR instead')}
            </button>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {scan
              ? <div style={{ textAlign: 'center', fontSize: 12.5, color: THEME.fg3, fontWeight: 700 }}>{L('Connects automatically once scanned.')}</div>
              : <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => setWiz(3)}>{L('Continue')}</Button>}
          </div>
        </>
      )}

      {/* 3 · connected celebration — mirrors the child app's Connected screen */}
      {wiz === 3 && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '39%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(75,129,79,.16) 0%, rgba(255,255,255,0) 68%)' }} />

            {/* parent + child joined — overlapping avatars with a live pulse */}
            <div className="jx-pop" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {[0, 0.8].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring" style={{ position: 'absolute', top: '50%', left: '50%', width: 124, height: 124, marginTop: -62, marginLeft: -62, borderRadius: 999, border: `2px solid ${THEME.success}`, zIndex: 0, animationDelay: `${d}s` }} />
              ))}
              {/* child */}
              <div style={{ width: 86, height: 86, borderRadius: 999, background: THEME.beachBg, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)' }}>
                <span className="game-font" style={{ fontSize: 34, fontWeight: 500, color: THEME.beach }}>{childInitial}</span>
              </div>
              {/* parent */}
              <div style={{ width: 86, height: 86, borderRadius: 999, background: BRAND.primaryLight, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -26, position: 'relative', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(68,122,175,.10)' }}>
                <Icon name="users" size={38} color={BRAND.primary} stroke={2.2} />
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: THEME.successLight, color: shade(THEME.success, -22), borderRadius: 999, padding: '5px 14px 5px 6px', fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={12} color="#fff" stroke={3.4} />
              </span>{L('Linked with your child')}
            </div>

            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px' }}>{L('Device connected!')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, maxWidth: 280 }}>{L('You can now set up protection for your child.')}</p>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={finishPair}>{L('Done')}</Button>
          </div>
        </>
      )}

      {/* 4 · configure protection */}
      {wiz === 4 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Set up protection')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>{L('Choose what to block while walking. You can change this anytime.')}</p>

            {/* block-while-walking categories */}
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '0 2px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Block while walking')}</div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
              {APP_CATEGORIES.map((c, i) => {
                const pal = CAT_PAL[c.id] || 'sand';
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: `var(--color-interactives-avatar-${pal}-default)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={`var(--color-interactives-avatar-${pal}-icon)`} stroke={2.2} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{L(c.name)}</div>
                      {c.locked && <div style={{ fontSize: 11.5, color: THEME.success, fontWeight: 600 }}>{L('Always allowed')}</div>}
                    </div>
                    {c.locked ? <Icon name="lock" size={16} color={THEME.fg3} stroke={2.3} /> : <Toggle on={cats[c.id]} onChange={v => setCats({ ...cats, [c.id]: v })} />}
                  </div>
                );
              })}
            </div>

            {/* warning sensitivity */}
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '0 2px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Warning sensitivity')}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['Gentle', 'Balanced', 'Strict'].map((l, i) => (
                  <button key={l} onClick={() => setSens(i + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? BRAND.primary : THEME.fg3 }}>{L(l)}</button>
                ))}
              </div>
              <div style={{ position: 'relative', height: 8, background: THEME.border, borderRadius: 999 }}>
                <div style={{ width: `${(sens - 1) * 50}%`, height: '100%', background: BRAND.primary, borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${(sens - 1) * 50}%`, transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 999, background: '#fff', border: `3px solid ${BRAND.primary}`, boxShadow: THEME.shadowCard }} />
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 12 }}>{['', L('Warns only in clear risk — fewest interruptions.'), L('Recommended balance of safety and calm.'), L('Warns earlier and more often.')][sens]}</div>
            </div>

            {/* notifications */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={18} color={BRAND.primary} stroke={2.2} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Safety alerts')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 2 }}>{L('Get notified about risky moments.')}</div>
              </div>
              <Toggle on={notif} onChange={setNotif} />
            </div>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} icon="user-plus" onClick={addChild}>{L('Add child')}</Button>
          </div>
        </>
      )}
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
    <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginBottom: 18 }}>
      <Icon name={icon} size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{title && <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{title}</div>}
        <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: title ? 3 : 0, opacity: .9 }}>{text}</div></div>
    </div>
  );
  const seg = (opts, val, set) => (
    <div style={{ display: 'flex', gap: 6, background: THEME.surface2, borderRadius: 12, padding: 4 }}>
      {opts.map(o => { const v = o.v != null ? o.v : o, on = val === v; return (
        <button key={String(v)} onClick={() => set(v)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, borderRadius: 9, padding: '8px 6px', background: on ? '#fff' : 'transparent', color: on ? BRAND.primary : THEME.fg2, boxShadow: on ? THEME.shadowCard : 'none' }}>{o.l != null ? o.l : o}</button>
      ); })}
    </div>
  );

  // page → { title, sub, body }
  const PAGES = {
    account: { title: L('Account'), sub: L('Profile & security'), body: (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800 }}>S</div>
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
          <div style={{ ...rowStyle(1, true), color: BRAND.primary }}><Icon name="user-plus" size={18} color={BRAND.primary} stroke={2.3} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: BRAND.primary }}>{L('Invite a guardian')}</div></div>
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
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: on ? BRAND.primary : THEME.fg1 }}>{native}</div>
              {on && <Icon name="check" size={20} color={BRAND.primary} stroke={2.6} />}
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
        <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginTop: 2 }}>
          <Icon name="message-circle" size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{L('Still need help?')}</div>
            <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Chat with our support team or email help@joanx.app — we usually reply within a day.')}</div>
          </div>
        </div>
      </React.Fragment>
    ) },

    about: { title: L('About JoanX'), sub: 'Version 1.0.0', body: (
      <React.Fragment>
        <div style={{ textAlign: 'center', padding: '12px 0 22px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: BRAND.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: BRAND.shadowPrimary, marginBottom: 12 }}><Icon name="shield-check" size={36} color="#fff" stroke={2.2} /></div>
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
            <div style={{ width: 32, height: 32, borderRadius: 10, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="sparkles" size={17} color="#fff" stroke={2.3} /></div>
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
              <div style={{ width: 34, height: 34, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={it.icon} size={17} color={BRAND.primary} stroke={2.3} /></div>
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
          <Input label={L('Schedule name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. School commute')} icon="clock" accent={BRAND.ink} />
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
            return <button key={i} onClick={() => toggleDay(i)} style={{ flex: 1, height: 42, border: 'none', borderRadius: 12, background: on ? BRAND.primary : THEME.surface2, color: on ? '#fff' : THEME.fg2, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{d}</button>;
          })}
        </div>

        {label(L('Time'))}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('Start')} value={start} onChange={e => setStart(e.target.value)} placeholder="8:00 AM" icon="sunrise" accent={BRAND.ink} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('End')} value={end} onChange={e => setEnd(e.target.value)} placeholder="8:40 AM" icon="sunset" accent={BRAND.ink} /></div>
        </div>

        <Button variant="primary" fullWidth icon="check" onClick={save} style={{ marginBottom: 10 }}>{L('Save schedule')}</Button>
        {editing && <Button variant="outline" fullWidth icon="trash-2" onClick={remove} style={{ color: THEME.danger }}>{L('Delete schedule')}</Button>}
      </div>
    </div>
  );
}

// ── Parent onboarding + authentication ───────────────────────────────
// Mirrors the child app: logo splash → value-prop intro slides → auth.
// System-styled date picker (used for the parent's birth date). Inline calendar
// with month arrows + a fast year grid — far better than arrowing back decades.
function DateField({ label, value, onChange, initYear }) {
  const [open, setOpen] = React.useState(false);
  const [yearGrid, setYearGrid] = React.useState(false);
  const init = value ? value.split('-').map(Number) : [initYear || 1995, 1, 1];
  const [vy, setVy] = React.useState(init[0]);
  const [vm, setVm] = React.useState(init[1] - 1);
  const ko = typeof getLang === 'function' && getLang() === 'ko';
  const WD = ko ? ['일', '월', '화', '수', '목', '금', '토'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const firstDow = new Date(vy, vm, 1).getDay();
  const dim = new Date(vy, vm + 1, 0).getDate();
  const sel = value ? value.split('-').map(Number) : null;
  const isSel = d => sel && sel[0] === vy && sel[1] === vm + 1 && sel[2] === d;
  const monthLabel = ko ? `${vy}년 ${vm + 1}월` : `${MONTHS[vm]} ${vy}`;
  const fmtValue = v => { const [y, m, d] = v.split('-'); return ko ? `${y}년 ${+m}월 ${+d}일` : `${MONTHS[+m - 1]} ${+d}, ${y}`; };
  const pick = d => { onChange(`${vy}-${String(vm + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`); setOpen(false); setYearGrid(false); };
  const shift = n => { let m = vm + n, y = vy; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } setVm(m); setVy(y); };
  const years = []; for (let y = 2026; y >= 1940; y--) years.push(y);
  const roundBtn = { width: 30, height: 30, borderRadius: 999, border: 'none', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg1, marginBottom: 6 }}>{label}</div>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${open ? BRAND.primary : THEME.border}`, borderRadius: 16, padding: '13px 14px', fontFamily: 'inherit', cursor: 'pointer' }}>
        <Icon name="cake" size={18} color={open ? BRAND.primary : THEME.fg3} stroke={2} />
        <span style={{ flex: 1, textAlign: 'left', fontSize: 15, color: value ? THEME.fg1 : THEME.fg3 }}>{value ? fmtValue(value) : L('Select your birth date')}</span>
        <Icon name="chevron-down" size={18} color={THEME.fg3} stroke={2.2} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && (
        <div className="jx-rise" style={{ marginTop: 8, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 18, boxShadow: THEME.shadowLg, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button onClick={() => setYearGrid(g => !g)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, color: THEME.fg1, cursor: 'pointer', padding: 0 }}>
              {monthLabel} <Icon name="chevron-down" size={16} color={THEME.fg2} stroke={2.4} style={{ transform: yearGrid ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {!yearGrid && (
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => shift(-1)} aria-label={L('Back')} style={roundBtn}><Icon name="chevron-left" size={18} color={THEME.fg1} stroke={2.3} /></button>
                <button onClick={() => shift(1)} aria-label={L('Next')} style={roundBtn}><Icon name="chevron-right" size={18} color={THEME.fg1} stroke={2.3} /></button>
              </div>
            )}
          </div>

          {yearGrid ? (
            <div className="no-sb" style={{ maxHeight: 224, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {years.map(y => (
                <button key={y} onClick={() => { setVy(y); setYearGrid(false); }} style={{ padding: '11px 0', borderRadius: 10, border: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, background: y === vy ? BRAND.primary : THEME.surface2, color: y === vy ? '#fff' : THEME.fg1, cursor: 'pointer' }}>{y}</button>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
                {WD.map((w, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: THEME.fg3, padding: '4px 0' }}>{w}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
                {Array.from({ length: firstDow }).map((_, i) => <div key={'e' + i} />)}
                {Array.from({ length: dim }).map((_, i) => {
                  const d = i + 1, s = isSel(d);
                  return <button key={d} onClick={() => pick(d)} style={{ aspectRatio: '1', border: 'none', borderRadius: 999, background: s ? BRAND.primary : 'transparent', color: s ? '#fff' : THEME.fg1, fontFamily: 'inherit', fontSize: 13.5, fontWeight: s ? 800 : 600, cursor: 'pointer' }}>{d}</button>;
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ParentOnboarding({ ctx }) {
  const [step, setStep] = React.useState(0);           // 0 splash · 1–2 slides · 3 auth
  const [authMode, setAuthMode] = React.useState('signup');  // 'signup' | 'signin' | 'forgot'
  const [authStep, setAuthStep] = React.useState(1);         // signup is split: 1 personal · 2 login
  const [userId, setUserId] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [sent, setSent] = React.useState(false);   // forgot-password: reset link sent

  // logo splash auto-advances into the intro slides
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(1), 1500);
    return () => clearTimeout(t);
  }, [step]);

  const SLIDES = [
    { title: 'Stay close, gently', sub: 'See how your child is doing through calm weekly reports — guidance, never surveillance.',
      bg: 'onboarding/onboarding-hero.png' },
    { title: 'Safety, in plain words', sub: 'JoanX turns each week into a simple summary and nudges you only when it truly matters.',
      bg: 'onboarding/onboarding-hero-2.png' },
  ];
  const introIdx = step - 1;
  const slide = step >= 1 && step <= 2 ? SLIDES[introIdx] : null;
  // Tweaks toggle: 'illustration' (3D hero graphics) vs 'image' (full-screen photo)
  const onbStyle = (ctx.tweaks && ctx.tweaks.onbStyle) || 'illustration';
  const slideBg = slide ? (onbStyle === 'image' ? 'onboarding/onboarding-photo.png' : slide.bg) : null;

  const signup = authMode === 'signup';
  const forgot = authMode === 'forgot';
  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());   // optional on signup
  const emailErr = email.trim() && !emailOk ? L('Enter a valid email address.') : undefined;
  const passErr = signup && pass && pass.length < 6 ? L('Use at least 6 characters.') : undefined;
  const confirmErr = signup && confirm && confirm !== pass ? L('Passwords do not match.') : undefined;
  const step1Valid = name.trim() && phone.trim() && dob && gender;   // signup personal step
  const canSubmit = signup
    ? userId.trim() && name.trim() && phone.trim() && dob && gender && pass.length >= 6 && confirm === pass && emailOk
    : userId.trim() && !!pass;
  const finish = () => ctx.finishParentOnboarding();
  const goAuth = m => { setAuthMode(m); setSent(false); setShowPass(false); setAuthStep(1); };
  const eyeBtn = (
    <button onClick={() => setShowPass(s => !s)} aria-label={L(showPass ? 'Hide password' : 'Show password')} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <Icon name={showPass ? 'eye-off' : 'eye'} size={18} color={THEME.fg3} stroke={2} />
    </button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 50 }}>

      {/* 0 · logo splash — shared with the child app */}
      {step === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 36%, #24242c 0%, #131318 52%, #08080b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <img className="jx-pop" src="app/logo/logo-wordmark-light.svg" alt="JoanX" style={{ width: 176, display: 'block' }} />
          <div className="jx-pop" style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: 2, textTransform: 'uppercase' }}>{L('Parent')}</div>
        </div>
      )}

      {/* 1–2 · value-prop intro slides with a segmented indicator */}
      {slide && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
          background: slideBg ? undefined : 'linear-gradient(180deg, #eef4fc 0%, #ffffff 60%)' }}>
          {/* background: 3D illustration hero, or a full-screen photo (Tweaks → Onboarding style). Soft scrims keep the copy legible. */}
          {slideBg && <img src={slideBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: onbStyle === 'image' ? '58% 36%' : 'center' }} />}
          {slideBg && (onbStyle === 'image' ? (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 330, background: 'linear-gradient(180deg, rgba(12,14,22,.74) 0%, rgba(12,14,22,0) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(0deg, rgba(10,12,20,.92) 8%, rgba(10,12,20,0) 100%)' }} />
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(180deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 210, background: 'linear-gradient(0deg, #fff 18%, rgba(255,255,255,0) 100%)' }} />
            </>
          ))}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', gap: 7, padding: '0 28px' }}>
              {SLIDES.map((_, i) => (
                <div key={i} style={{ height: 5, flex: 1, borderRadius: 999, background: i <= introIdx ? (onbStyle === 'image' ? '#fff' : BRAND.primary) : (onbStyle === 'image' ? 'rgba(255,255,255,.4)' : THEME.border), transition: 'background .3s' }} />
              ))}
            </div>

            <div style={{ padding: '32px 30px 0' }}>
              <h1 className="game-font" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.18, margin: 0, color: onbStyle === 'image' ? '#fff' : THEME.fg1, textShadow: onbStyle === 'image' ? '0 2px 16px rgba(0,0,0,.5)' : 'none' }}>{L(slide.title)}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.45, margin: '12px 0 0', color: onbStyle === 'image' ? 'rgba(255,255,255,.92)' : THEME.fg2, textShadow: onbStyle === 'image' ? '0 1px 12px rgba(0,0,0,.5)' : 'none' }}>{L(slide.sub)}</p>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
              <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => setStep(step + 1)}>{L(step === 2 ? 'Get started' : 'Continue')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3 · authentication — create account / sign in / forgot password */}
      {step === 3 && !forgot && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '26px 28px 0' }}>
            {/* signup progress: an eyebrow label above the title — quiet & premium, distinct from the intro slides' segmented bar */}
            {signup && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, marginBottom: 10, marginLeft: authStep === 2 ? -6 : 0 }}>
                {authStep === 2 && (
                  <button onClick={() => setAuthStep(1)} aria-label={L('Back')} className="jx-press" style={{ flexShrink: 0, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
                  </button>
                )}
                <span style={{ fontSize: 12, fontWeight: 800, color: BRAND.primary, letterSpacing: '1.5px' }}>{L('Step')} {authStep} / 2</span>
              </div>
            )}

            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L(signup ? 'Create account' : 'Welcome back')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L(signup ? (authStep === 1 ? 'Tell us a bit about you.' : 'Now set up your login details.') : 'Sign in to pick up where you left off.')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!signup && (
                <>
                  <Input label={L('Phone number or ID')} value={userId} onChange={e => setUserId(e.target.value.replace(/\s/g, ''))} placeholder={L('ID or phone number')} icon="user" accent={BRAND.ink} />
                  <Input label={L('Password')} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} accent={BRAND.ink} />
                </>
              )}

              {signup && authStep === 1 && (
                <>
                  <Input label={L('Name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Sora Kim')} icon="user" accent={BRAND.ink} />
                  <Input label={L('Phone number')} value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9-]/g, ''))} placeholder="010-1234-5678" icon="phone" type="tel" accent={BRAND.ink} />
                  <Input label={L('Date of birth')} value={dob} onChange={e => setDob(e.target.value)} icon="cake" type="date" accent={BRAND.ink} />
                  {/* gender — mobile-native chip choice instead of a dropdown */}
                  <ChoiceGroup label={L('Gender')} value={gender} setter={setGender} opts={[['male', 'Male'], ['female', 'Female'], ['other', 'Prefer not to say']]} />
                </>
              )}

              {signup && authStep === 2 && (
                <>
                  <Input label={L('User ID')} value={userId} onChange={e => setUserId(e.target.value.replace(/\s/g, ''))} placeholder={L('e.g. user01')} icon="at-sign" accent={BRAND.ink} />
                  <Input label={L('Email (optional)')} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" icon="mail" type="email" error={emailErr} accent={BRAND.ink} />
                  <Input label={L('Password')} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} error={passErr} accent={BRAND.ink} />
                  <Input label={L('Confirm password')} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} error={confirmErr} accent={BRAND.ink} />
                </>
              )}
            </div>

            {!signup && (
              <div style={{ textAlign: 'right', marginTop: 10 }}>
                <span onClick={() => goAuth('forgot')} style={{ fontSize: 13, fontWeight: 700, color: BRAND.primary, cursor: 'pointer' }}>{L('Forgot password?')}</span>
              </div>
            )}

            {signup && authStep === 2 && (
              <p style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.5, margin: '16px 2px 0', fontWeight: 600 }}>{L('By continuing you agree to our Terms & Privacy Policy.')}</p>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {signup && authStep === 1
              ? <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!step1Valid} onClick={step1Valid ? () => setAuthStep(2) : undefined}>{L('Continue')}</Button>
              : <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!canSubmit} onClick={canSubmit ? finish : undefined}>{L(signup ? 'Create account' : 'Sign in')}</Button>}
            <button onClick={() => goAuth(signup ? 'signin' : 'signup')} style={{ width: '100%', marginTop: 12, padding: 6, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: THEME.fg2, cursor: 'pointer' }}>
              {L(signup ? 'Already have an account?' : 'New to JoanX?')} <span style={{ color: BRAND.primary, fontWeight: 800 }}>{L(signup ? 'Sign in' : 'Create account')}</span>
            </button>
          </div>
        </>
      )}

      {/* 3b · forgot password — request a reset link, then a sent confirmation */}
      {step === 3 && forgot && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
            <button onClick={() => goAuth('signin')} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
            </button>

            {!sent ? (
              <>
                <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Reset your password')}</h1>
                <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L("Enter your email and we'll send you a link to reset your password.")}</p>
                <Input label={L('Email')} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" icon="mail" type="email" error={emailErr} accent={BRAND.ink} />
              </>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 24 }}>
                <div className="jx-pop" style={{ width: 84, height: 84, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 10px ${BRAND.primary}0f` }}>
                  <Icon name="mail-check" size={38} color={BRAND.primary} stroke={2.2} />
                </div>
                <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.2 }}>{L('Check your email')}</h1>
                <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.55, margin: '0 auto', maxWidth: 280 }}>{L('We sent a reset link to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{email || 'you@email.com'}</span>.</p>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {!sent ? (
              <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!emailOk} onClick={emailOk ? () => setSent(true) : undefined}>{L('Send reset link')}</Button>
            ) : (
              <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => goAuth('signin')}>{L('Back to sign in')}</Button>
            )}
            {!sent && (
              <button onClick={() => goAuth('signin')} style={{ width: '100%', marginTop: 12, padding: 6, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: BRAND.primary, cursor: 'pointer' }}>{L('Back to sign in')}</button>
            )}
          </div>
        </>
      )}

    </div>
  );
}

Object.assign(window, { ParentReports, ParentSettings, ParentChildren, ParentAccount, ParentAddChild, ParentDetail, ParentSchedule, ParentAIReport, ParentOnboarding });
