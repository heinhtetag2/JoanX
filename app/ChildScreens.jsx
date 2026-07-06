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

// Decorative pairing QR — a deterministic dot matrix with the three finder
// squares, so it reads as a real QR without needing a QR library offline.
function PairQR({ size = 190 }) {
  const N = 25;
  const finder = (r, c, br, bc) => {
    const rr = r - br, cc = c - bc;
    if (rr < 0 || rr > 6 || cc < 0 || cc > 6) return null;
    const ring = rr === 0 || rr === 6 || cc === 0 || cc === 6;
    const core = rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4;
    return ring || core;
  };
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      let v = finder(r, c, 0, 0);
      if (v === null) v = finder(r, c, 0, N - 7);
      if (v === null) v = finder(r, c, N - 7, 0);
      if (v === null) {
        const nearFinder = (r <= 7 && c <= 7) || (r <= 7 && c >= N - 8) || (r >= N - 8 && c <= 7);
        if (nearFinder) v = false;
        else { const h = (r * 73856093) ^ (c * 19349663); v = ((h >>> 3) & 3) === 0 || ((h >>> 7) & 7) === 1; }
      }
      if (v) cells.push(<rect key={r + '-' + c} x={c} y={r} width="1.04" height="1.04" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${N} ${N}`} shapeRendering="crispEdges" style={{ display: 'block' }}>
      <g fill={THEME.fg1}>{cells}</g>
    </svg>
  );
}

// ── Onboarding / permissions ─────────────────────────────────────────
// Smart mode is the only mode now. The flow is:
//   splash → 2 intro slides → permission guide → connect-to-parent (QR).
function Onboarding({ ctx }) {
  const perms = PERMISSIONS;
  const [step, setStep] = React.useState(0);     // 0 splash · 1-2 slides · 3 guide · 4 connect
  const [grants, setGrants] = React.useState({});
  const [code, setCode] = React.useState('');    // parent's 6-digit code, typed on the connect screen
  const [codeErr, setCodeErr] = React.useState(false); // validation error on the connect screen
  const [showQR, setShowQR] = React.useState(false); // show the child's shareable QR on the connect screen
  const [connected, setConnected] = React.useState(false); // success screen after linking
  const codeRef = React.useRef(null);
  const submitCode = () => (code.length < 6 ? setCodeErr(true) : setConnected(true)); // any complete code is accepted
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];

  // Per-permission accent so the list has rhythm instead of one flat blue.
  const PERM_ACCENT = {
    motion:  { fg: THEME.mountain, bg: THEME.mountainBg },
    usage:   { fg: THEME.culture,  bg: THEME.cultureBg },
    overlay: { fg: THEME.camping,  bg: THEME.campingBg },
    notif:   { fg: THEME.beach,    bg: THEME.beachBg },
  };
  const accentOf = p => PERM_ACCENT[p.id] || { fg: THEME.primary, bg: THEME.primaryLight };

  const [modal, setModal] = React.useState(null); // permission id of the active request sheet
  const allGranted = perms.every(p => grants[p.id]);
  const finish = () => ctx.finishOnboarding('smart');

  const grant = id => setGrants(g => ({ ...g, [id]: true }));   // tapping a normal toggle grants it
  const openOne = id => setModal(id);                           // "special" perm → open its sheet
  const dismiss = () => setModal(null);
  const grantActive = () => { grant(modal); setModal(null); };  // "Go to settings" in the sheet

  const modalPerm = modal && perms.find(p => p.id === modal);
  const Buddy = ({ size }) => <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />;

  // logo splash auto-advances into the intro slides
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(1), 1500);
    return () => clearTimeout(t);
  }, [step]);

  // value-prop slides shown at steps 1–2 (step 3 = permission guide)
  const SLIDES = [
    { title: 'Walk safe, grow your buddy', sub: "JoanX notices when you're walking on your phone — and turns staying safe into a game." },
    { title: 'Every safe walk levels you up', sub: 'Earn points, evolve your buddy, and beat the distractions.' },
  ];
  const introIdx = step - 1;
  const slide = SLIDES[introIdx];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 50 }}>
      {/* 0 · logo splash */}
      {step === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 90% at 50% 38%, #123a86 0%, #0a1f57 46%, #05102c 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div className="jx-pop" style={{ width: 104, height: 104, borderRadius: 30, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 22px 54px rgba(0,0,0,.42)' }}>
            <Icon name="shield-check" size={56} color={THEME.primary} stroke={2.4} />
          </div>
          <div className="jx-pop game-font" style={{ fontSize: 34, fontWeight: 500, color: '#fff', letterSpacing: .5 }}>JoanX</div>
        </div>
      )}

      {/* 1–2 · value-prop intro slides with a segmented top indicator (white background) */}
      {slide && (
        <div style={{ position: 'absolute', inset: 0, background: '#fff', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 60px)' }}>
          <div style={{ display: 'flex', gap: 7, padding: '0 28px' }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{ height: 5, flex: 1, borderRadius: 999, background: i <= introIdx ? THEME.primary : THEME.border, transition: 'background .3s' }} />
            ))}
          </div>

          <div style={{ padding: '32px 30px 0' }}>
            <h1 className="game-font" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.18, margin: 0, color: THEME.fg1 }}>{L(slide.title)}</h1>
            <p style={{ fontSize: 15, lineHeight: 1.45, margin: '12px 0 0', color: THEME.fg2 }}>{L(slide.sub)}</p>
          </div>

          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {introIdx === 0 ? (
              <div style={{ position: 'relative', width: 232, height: 232 }}>
                <div className="jx-float" style={{ position: 'absolute', inset: 0, borderRadius: 42, background: shade(c.color, 90), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Buddy size={172} />
                </div>
                <div style={{ position: 'absolute', top: -6, right: -12, background: '#fff', borderRadius: 999, padding: '8px 13px', boxShadow: THEME.shadowLg, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} /><span className="game-font" style={{ fontSize: 15, fontWeight: 500 }}>1,240</span>
                </div>
                <div style={{ position: 'absolute', bottom: 6, left: -14, background: '#fff', borderRadius: 999, padding: '8px 13px', boxShadow: THEME.shadowLg, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Icon name="flame" size={16} color={THEME.beach} stroke={2.3} /><span style={{ fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>5</span>
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative', width: 264, height: 264, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="jx-float"><Buddy size={190} /></div>
                {[
                  { icon: 'star', col: THEME.gold, bg: THEME.goldLight, fill: true, pos: { top: 4, left: 2 } },
                  { icon: 'trophy', col: '#b07d10', bg: '#fef0cf', pos: { top: 22, right: 0 } },
                  { icon: 'shield-check', col: THEME.primary, bg: THEME.primaryLight, pos: { bottom: 30, left: 4 } },
                  { icon: 'sparkles', col: THEME.camping, bg: THEME.campingBg, pos: { bottom: 6, right: 10 } },
                ].map((b, i) => (
                  <div key={i} className="jx-float" style={{ position: 'absolute', ...b.pos, width: 52, height: 52, borderRadius: 16, background: b.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard }}>
                    <Icon name={b.icon} size={26} color={b.col} fill={b.fill ? b.col : 'none'} stroke={2.2} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '0 24px calc(env(safe-area-inset-bottom) + 24px)' }}>
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep(step + 1)}>{L('Continue')}</Button>
          </div>
        </div>
      )}

      {/* 4 · permission guide (last step) — full page with a toggle per permission */}
      {step === 4 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 0' }}>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '4px 0 14px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('To keep you safe,\nwe need a little help')}</h1>
            <div style={{ background: THEME.surface2, borderRadius: 15, padding: '13px 15px', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: 0 }}>{L('For JoanX to notice danger while you walk, the permissions below are needed. Turn them on together with your parents.')}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {perms.map(p => {
                const a = accentOf(p);
                const on = !!grants[p.id];
                return (
                  <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '13px 14px', background: '#fff', borderRadius: 16, boxShadow: THEME.shadowCard }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon name={p.icon} size={20} color={a.fg} stroke={2.3} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L(p.name)}</div>
                      <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 2 }}>{L(p.blurb)}</div>
                    </div>
                    {/* toggle — normal perms grant on tap; the "settings" one opens its sheet */}
                    <button onClick={on ? undefined : () => (p.settings ? openOne(p.id) : grant(p.id))} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', padding: 0, cursor: on ? 'default' : 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                      {!on && <span style={{ fontSize: 11.5, fontWeight: 800, color: THEME.fg3 }}>{L('Pending')}</span>}
                      <div style={{ width: 46, height: 27, borderRadius: 999, background: on ? THEME.success : '#d9d8d6', position: 'relative', transition: 'background .2s' }}>
                        <div style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 21, height: 21, borderRadius: 999, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.22)', transition: 'left .2s' }} />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', margin: '16px 0 4px' }}>
              <Icon name="lock" size={13} color={THEME.fg3} stroke={2.3} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}>{L('Private & secure — only used to keep you safe')}</span>
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth disabled={!allGranted} onClick={allGranted ? finish : undefined}>{L('Continue')}</Button>
            {!allGranted && (
              <button onClick={finish} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Skip for now')}</button>
            )}
          </div>
        </>
      )}

      {/* 3 · connect — child types the code shown in the parent app */}
      {step === 3 && !showQR && !connected && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '18px 28px 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
            <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '6px 0 10px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L("Enter your parent's\nconnect code")}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 30px' }}>{L('Open the JoanX Parent app and type the 6-digit code shown there.')}</p>

            {/* 6-digit code input — tap to type */}
            <div style={{ position: 'relative' }} onClick={() => codeRef.current && codeRef.current.focus()}>
              <input ref={codeRef} value={code} inputMode="numeric"
                onChange={e => { setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setCodeErr(false); }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
              <div className={codeErr ? 'jx-shake' : ''} style={{ display: 'flex', gap: 9 }}>
                {[0, 1, 2, 3, 4, 5].map(i => {
                  const ch = code[i];
                  const active = !codeErr && i === code.length && code.length < 6;
                  const border = codeErr ? THEME.danger : (active ? THEME.primary : (ch ? THEME.border : 'transparent'));
                  return (
                    <div key={i} style={{ width: 44, height: 56, borderRadius: 14, background: codeErr ? THEME.dangerLight : (ch ? '#fff' : THEME.surface2), border: `2px solid ${border}`, boxShadow: ch && !codeErr ? THEME.shadowCard : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s, background .15s' }}>
                      <span className="game-font" style={{ fontSize: 27, fontWeight: 500, color: codeErr ? THEME.danger : THEME.fg1 }}>{ch || ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {codeErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <Icon name="alert-circle" size={15} color={THEME.danger} stroke={2.3} />
                <span style={{ fontSize: 12.5, color: THEME.danger, fontWeight: 700 }}>{L('Enter all 6 digits of the code.')}</span>
              </div>
            )}

            {/* share-a-QR alternative — parent scans the child's QR */}
            <button onClick={() => setShowQR(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '20px 0 0', padding: '9px 16px', background: THEME.surface2, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: THEME.primaryDark, fontSize: 13, fontWeight: 800 }}>
              <Icon name="qr-code" size={16} color={THEME.primary} stroke={2.3} />{L('Show a QR to scan instead')}
            </button>

            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '24px 4px 0', maxWidth: 320 }}>
              <Icon name="clock" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L("The linking code is valid for 5 minutes. If time runs out, please create a new one in your parent's app.")}</span>
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth onClick={submitCode}>{L('Connect')}</Button>
          </div>
        </>
      )}

      {/* 3b · share the child's QR for a parent to scan */}
      {step === 3 && showQR && !connected && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '18px 28px 0', textAlign: 'left' }}>
            <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '6px 0 10px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('Show this to\nyour parent')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('Have a parent scan this QR in the JoanX Parent app to link your accounts.')}</p>

            {/* QR — plain, centered, no shadow (tap simulates a successful scan) */}
            <div onClick={() => setConnected(true)} style={{ alignSelf: 'center', background: '#fff', borderRadius: 24, padding: 22, marginTop: 4, cursor: 'pointer' }}>
              <PairQR size={206} />
            </div>

            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '20px 2px 0' }}>
              <Icon name="clock" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L("The linking code is valid for 5 minutes. If time runs out, please create a new one in your parent's app.")}</span>
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="outline" size="lg" fullWidth icon="keyboard" onClick={() => setShowQR(false)}>{L('Enter code instead')}</Button>
          </div>
        </>
      )}

      {/* 3c · connected — success result screen */}
      {step === 3 && connected && (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px' }}>
            {/* child ↔ parent linked visual */}
            <div className="jx-pop" style={{ display: 'flex', alignItems: 'center', marginBottom: 26 }}>
              <div style={{ width: 84, height: 84, borderRadius: 26, background: shade(c.color, 82), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Buddy size={72} />
              </div>
              <div style={{ width: 52, height: 40, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ position: 'absolute', left: 2, right: 2, height: 3, background: THEME.success, borderRadius: 999 }} />
                <div style={{ zIndex: 1, width: 34, height: 34, borderRadius: 999, background: THEME.success, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #fff', boxShadow: '0 6px 14px rgba(75,129,79,.4)' }}>
                  <Icon name="check" size={18} color="#fff" stroke={3.2} />
                </div>
              </div>
              <div style={{ width: 84, height: 84, borderRadius: 26, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="users" size={38} color={THEME.primary} stroke={2.2} />
              </div>
            </div>
            <h1 className="game-font" style={{ fontSize: 28, fontWeight: 500, margin: '0 0 10px' }}>{L('Connected!')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.5, margin: 0 }}>{L("You're linked with your parent. Let's finish setting up.")}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth onClick={() => setStep(4)}>{L('Continue')}</Button>
          </div>
        </>
      )}

      {/* per-permission request — a half-height bottom sheet over the dimmed guide */}
      {modalPerm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={dismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
          <div key={modalPerm.id} className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 24px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <Buddy size={84} />
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '0 8px 8px', lineHeight: 1.2, textAlign: 'center' }}>{L(modalPerm.name)}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 2px 15px', textAlign: 'center' }}>{L(modalPerm.detail)}</p>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', background: THEME.warningLight, border: `1px solid ${shade(THEME.warning, 78)}`, borderRadius: 14, padding: '12px 14px', marginBottom: 16 }}>
              <Icon name="alert-triangle" size={17} color={THEME.warning} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: THEME.warning, fontWeight: 600, lineHeight: 1.45 }}>{L(modalPerm.warn)}</span>
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={grantActive}>{L('Go to settings')}</Button>
            <button onClick={dismiss} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Do it later')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Child Home ───────────────────────────────────────────────────────
function ChildHome({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const lite = ctx.mode === 'lite';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(c.color) }}>
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
            <Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} />
            <span className="game-font" style={{ fontSize: 15, fontWeight: 500 }}>{PLAYER.points.toLocaleString()}</span>
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
            <div style={{ fontSize: 12, color: lite ? '#602f0c' : '#274427', opacity: .85 }}>{lite ? L('Phone pauses while you walk') : L('Active while walking · 47 min safe today')}</div>
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
              <span style={{ width: 30, height: 30, borderRadius: 10, background: shade(c.color, 124), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name="footprints" size={17} color={shade(c.color, -28)} stroke={2.3} /></span>
              {L("Today's safe-walk goal")}
            </span>
            <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: shade(c.color, -28) }}>{PLAYER.safeMinutesToday}/{PLAYER.safeWalkGoal} {L('min')}</span>
          </div>
          <Bar value={PLAYER.safeMinutesToday} max={PLAYER.safeWalkGoal} color={c.color} height={12} />
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
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{FEATURES.dangerZones && !lite ? L('Motion · GPS while walking') : L('Motion sensor')}</div>
          </div>
        </div>

        {/* danger zones (smart) — F-05/F-06, excluded this revision */}
        {!lite && FEATURES.dangerZones && (
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
    { id: 'n6', when: 'earlier', type: 'battle', icon: 'swords', color: THEME.camping, bg: THEME.campingBg, t: 'You beat Distractor', s: '+120 points earned.', time: 'Yest.', unread: false, go: 'battle' },
    { id: 'n7', when: 'earlier', type: 'parent', icon: 'shield-check', color: THEME.primary, bg: THEME.primaryLight, t: 'A grown-up updated your settings', s: 'Warning style is now set to “gentle”.', time: '2d', unread: false },
  ];
  // danger-zone alerts (F-05) are excluded this revision — hide when off
  const [items, setItems] = React.useState(init.filter(n => FEATURES.dangerZones || n.type !== 'zone'));
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
