// JoanX — safety moments: Smart warning overlay (3 variants) + Lite block.

function Confetti({ n = 14 }) {
  const colors = [THEME.primary, THEME.gold, THEME.joy, THEME.success, THEME.camping];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {Array.from({ length: n }).map((_, i) => {
        const left = Math.random() * 100, delay = Math.random() * 0.3, dur = 1 + Math.random();
        const c = colors[i % colors.length], sz = 6 + Math.random() * 6;
        return <div key={i} style={{ position: 'absolute', top: -10, left: left + '%', width: sz, height: sz, borderRadius: i % 2 ? 999 : 2, background: c, animation: `jxConfetti ${dur}s ${delay}s ease-in forwards` }} />;
      })}
    </div>
  );
}

function RewardToast({ secs = 2.1, pts = 30 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.34)', zIndex: 5 }} className="jx-fade">
      <Confetti />
      <div className="jx-pop" style={{ width: 240, background: '#fff', borderRadius: 26, padding: '24px 20px', textAlign: 'center', boxShadow: THEME.shadowXl }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: THEME.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <Icon name="check" size={34} color={THEME.success} stroke={3} />
        </div>
        <div className="game-font" style={{ fontSize: 21, fontWeight: 500 }}>{L('Nice save!')}</div>
        <div style={{ fontSize: 13, color: THEME.fg2, margin: '4px 0 14px' }}>{L('Stopped in')} {secs}s — {L("that's an immediate stop.")}</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 16 }} className="game-font">
          <Icon name="star" size={18} color={THEME.gold} stroke={2.4} fill={THEME.gold} /> +{pts} {L('points')}
        </div>
      </div>
    </div>
  );
}

function WarningOverlay({ ctx }) {
  const variant = ctx.tweaks.overlay || 'sheet';
  const [phase, setPhase] = React.useState('warn'); // warn -> reward
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const respond = () => { setPhase('reward'); setTimeout(() => ctx.closeOverlay(), 1800); };

  const Msg = () => (
    <React.Fragment>
      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25 }}>{L('Eyes up,')} {PLAYER.name}!</div>
      <div style={{ fontSize: 13.5, color: THEME.fg2, marginTop: 4, lineHeight: 1.4 }}>{L("Let's put the phone away while we're walking.")}</div>
    </React.Fragment>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
      {/* dimmed live screen behind */}
      <div className="jx-fade" style={{ position: 'absolute', inset: 0, background: variant === 'spotlight' ? 'rgba(248,247,247,.86)' : 'rgba(43,41,38,.34)', backdropFilter: variant === 'spotlight' ? 'blur(3px)' : 'none' }} />

      {phase === 'reward' ? <RewardToast /> : (
        <React.Fragment>
          {/* small vibration label */}
          {variant !== 'banner' && (
            <div className="jx-fade" style={{ position: 'absolute', top: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,.4)', color: '#fff', padding: '6px 12px', borderRadius: 999, fontSize: 11.5, fontWeight: 700 }}>
                <Icon name="vibrate" size={13} color="#fff" stroke={2.4} /> {L('One gentle buzz')}
              </div>
            </div>
          )}

          {/* ── VARIANT: bottom sheet (spec-accurate, default) ── */}
          {variant === 'sheet' && (
            <div className="jx-overlay-up" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '32px 32px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -10px 30px rgba(0,0,0,.16)' }}>
              <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div className="jx-pop"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={104} /></div>
                <div style={{ flex: 1, background: THEME.surface2, borderRadius: '18px 18px 18px 4px', padding: '12px 14px', marginBottom: 8 }}><Msg /></div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <Button variant="primary" size="md" fullWidth onClick={respond}>{L('I looked up')}</Button>
              </div>
              <div style={{ marginTop: 12 }}><Bar value={70} max={100} color={THEME.gold} height={5} /></div>
              <div style={{ fontSize: 11, color: THEME.fg3, textAlign: 'center', marginTop: 6 }}>{L('Auto-dismisses in a moment · no nagging')}</div>
            </div>
          )}

          {/* ── VARIANT: spotlight ── */}
          {variant === 'spotlight' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
              <div className="jx-pop jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={172} /></div>
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 10 }}>{L('Eyes up,')} {PLAYER.name}!</div>
              <div style={{ fontSize: 15, color: THEME.fg2, margin: '8px 0 22px', lineHeight: 1.45 }}>{L("Foxy noticed you're walking. Let's put the phone away and stay safe.")}</div>
              <Button variant="primary" size="lg" fullWidth onClick={respond} style={{ maxWidth: 280 }}>{L('I looked up')}</Button>
              <div style={{ fontSize: 12, color: THEME.fg3, marginTop: 14 }}>{L('Stop fast for bonus points')}</div>
            </div>
          )}

          {/* ── VARIANT: minimal banner ── */}
          {variant === 'banner' && (
            <div className="jx-rise" style={{ position: 'absolute', top: 58, left: 14, right: 14 }}>
              <div onClick={respond} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 20, padding: '12px 14px', boxShadow: THEME.shadowXl, cursor: 'pointer' }}>
                <Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={56} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Eyes up while walking')}</div>
                  <div style={{ fontSize: 12, color: THEME.fg2 }}>{L("Tap when you've looked up")}</div>
                </div>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={18} color={THEME.primary} stroke={2.6} />
                </div>
              </div>
            </div>
          )}

          {/* close affordance for the prototype */}
          {variant !== 'sheet' && (
            <button onClick={() => ctx.closeOverlay()} style={{ position: 'absolute', top: 58, right: 16, width: 34, height: 34, borderRadius: 999, background: 'rgba(0,0,0,.18)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}>
              <Icon name="x" size={18} color="#fff" stroke={2.4} />
            </button>
          )}
        </React.Fragment>
      )}
    </div>
  );
}

function LiteBlock({ ctx }) {
  const [secs, setSecs] = React.useState(3);
  React.useEffect(() => {
    if (secs <= 0) { ctx.closeOverlay(); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'linear-gradient(170deg,#447aaf,#2b5782)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 34px', textAlign: 'center' }}>
      <div className="jx-pop jx-float"><Mascot species="fox" stage={2} color="#FFFFFF" size={150} /></div>
      <div style={{ width: 70, height: 70, borderRadius: 999, background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '6px 0 18px' }}>
        <Icon name="shield" size={36} color="#fff" stroke={2.1} />
      </div>
      <div className="game-font" style={{ fontSize: 28, fontWeight: 500, color: '#fff' }}>{L("Let's walk first")}</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,.9)', margin: '10px 0 0', lineHeight: 1.5 }}>{L("Your phone takes a quick break while you're walking. It comes back as soon as you stop.")}</div>

      <div style={{ marginTop: 26, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.16)', borderRadius: 999, padding: '9px 16px' }}>
        <Icon name="phone" size={16} color="#fff" stroke={2.3} />
        <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{L('Calls & texts still work')}</span>
      </div>

      <div style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 34px)', left: 34, right: 34 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)', marginBottom: 10 }}>{L('Unlocks when you stop walking')}{secs > 0 ? ` · ${secs}s` : ''}</div>
        <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,.25)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(1 - secs / 3) * 100}%`, background: '#fff', borderRadius: 999, transition: 'width 1s linear' }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { WarningOverlay, LiteBlock, RewardToast, Confetti });
