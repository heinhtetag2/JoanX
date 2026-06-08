// JoanX — game screens part 2: Battle (auto-match) + Rewards/achievements.

function Battle({ ctx }) {
  const owned = CHARACTERS.filter(c => c.owned);
  const [sel, setSel] = React.useState(owned[0]);
  const [phase, setPhase] = React.useState('select'); // select|matching|versus|result
  const [won, setWon] = React.useState(true);
  const battlesUsed = 3, battlesMax = 5;
  const opp = { species: 'cat', name: 'Bolt', color: '#9867e4', level: sel.level + 1, rarity: 'rare' };

  const power = c => (c.traits ? (c.traits.guard + c.traits.speed + c.traits.heart) : 180) + c.level * 4;

  const start = () => {
    setPhase('matching');
    setTimeout(() => setPhase('versus'), 1600);
    setTimeout(() => { setWon(power(sel) + 10 >= power({ ...opp, traits: { guard: 70, speed: 75, heart: 65 } })); setPhase('result'); }, 3200);
  };

  if (phase === 'matching') {
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#2b5782)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
        <div style={{ position: 'relative', width: 90, height: 90, marginBottom: 20 }}>
          <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#fff', opacity: .3 }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="swords" size={40} color="#fff" stroke={2} /></div>
        </div>
        <div className="game-font" style={{ color: '#fff', fontSize: 21, fontWeight: 500 }}>{L('Finding opponent…')}</div>
        <div style={{ color: 'rgba(255,255,255,.75)', fontSize: 13, marginTop: 6 }}>{L('Matching within ±3 levels')}</div>
      </div>
    );
  }

  if (phase === 'versus' || phase === 'result') {
    const result = phase === 'result';
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(170deg,#2b2926,#122536)', display: 'flex', flexDirection: 'column', zIndex: 50, paddingTop: 60 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', position: 'relative' }}>
          {result && won && <Confetti n={24} />}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center', opacity: result && !won ? .4 : 1, transition: 'opacity .4s' }}>
              <div className={result && won ? 'jx-pop' : ''}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={120} /></div>
              <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{sel.name}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {sel.level} · PWR {power(sel)}</div>
            </div>
            <div className="game-font" style={{ color: THEME.gold, fontSize: 26, fontWeight: 500 }}>VS</div>
            <div style={{ textAlign: 'center', opacity: result && won ? .4 : 1, transition: 'opacity .4s' }}>
              <div style={{ transform: 'scaleX(-1)' }}><Mascot species={opp.species} stage={2} color={opp.color} size={120} /></div>
              <div className="game-font" style={{ color: '#fff', fontSize: 16, fontWeight: 500, marginTop: 4 }}>{opp.name}</div>
              <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 12 }}>Lv {opp.level} · PWR 214</div>
            </div>
          </div>

          {result && (
            <div className="jx-pop" style={{ marginTop: 30, textAlign: 'center' }}>
              <div className="game-font" style={{ fontSize: 36, fontWeight: 500, color: won ? THEME.gold : '#fff' }}>{won ? L('Victory!') : L('So close!')}</div>
              {won && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: THEME.goldLight, color: '#9e7300', padding: '8px 16px', borderRadius: 999, fontWeight: 600, fontSize: 15, marginTop: 12 }} className="game-font"><Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} /> +120 points · +2 coins</div>}
              {!won && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 14, marginTop: 8 }}>{L('Still earned +40 points for trying!')}</div>}
            </div>
          )}
        </div>
        {result && (
          <div style={{ padding: '0 24px calc(env(safe-area-inset-bottom) + 24px)' }}>
            <Button variant="play" size="lg" fullWidth onClick={() => setPhase('select')}>{L('Battle again')}</Button>
            <button onClick={() => ctx.nav('home')} style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Back home')}</button>
          </div>
        )}
      </div>
    );
  }

  // select
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Battle')} onBack={() => ctx.nav('home')} right={<Badge variant="primary">{battlesUsed}/{battlesMax}</Badge>} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: THEME.primaryLight, borderRadius: 14, padding: '11px 14px', marginBottom: 16 }}>
          <Icon name="info" size={18} color={THEME.primary} stroke={2.3} />
          <span style={{ fontSize: 12.5, color: THEME.primaryDark, fontWeight: 600 }}>{battlesMax - battlesUsed} {L("battles left today. Battles pause while you're walking.")}</span>
        </div>

        {/* chosen */}
        <div style={{ borderRadius: 24, padding: 18, background: `linear-gradient(165deg, ${shade(sel.color, 74)}, #fff 75%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Your fighter')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={sel.species} stage={sel.stage} color={sel.color} size={150} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{sel.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
            {[['shield', sel.traits.guard], ['gauge', sel.traits.speed], ['heart', sel.traits.heart]].map(([ic, v], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name={ic} size={14} color={THEME.fg2} stroke={2.3} />
                <span className="game-font" style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <SectionHead title={L('Choose a buddy')} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8, marginBottom: 14 }} className="no-sb">
          {owned.map(c => (
            <button key={c.id} onClick={() => setSel(c)} style={{ flexShrink: 0, width: 86, background: '#fff', borderRadius: 18, padding: '10px 4px', border: sel.id === c.id ? `2.5px solid ${THEME.joy}` : `2.5px solid transparent`, boxShadow: THEME.shadowCard, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={56} />
              <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 2 }}>{c.name}</div>
              <div style={{ fontSize: 10, color: THEME.fg2 }}>Lv {c.level}</div>
            </button>
          ))}
        </div>

        <Button variant="play" size="lg" fullWidth icon="swords" onClick={start}>{L('Find a match')}</Button>
      </div>
    </div>
  );
}

function Rewards({ ctx }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const streakDone = [true, true, true, true, true, false, false];
  const [claimed, setClaimed] = React.useState(false);
  const [pop, setPop] = React.useState(false);
  const claim = () => { if (claimed) return; setClaimed(true); setPop(true); PLAYER.points += 100; PLAYER.coins += 5; setTimeout(() => setPop(false), 1900); };
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 56, paddingBottom: 110, background: THEME.screenBg }}>
      <div style={{ padding: '0 18px' }}>
        <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '0 0 16px' }}>{L('Rewards')}</h1>

        {/* streak */}
        <div style={{ borderRadius: 22, padding: 18, background: 'linear-gradient(160deg,#fff2d1,#fff 80%)', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: THEME.joyBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="flame" size={26} color={THEME.joy} stroke={2.3} /></div>
            <div>
              <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{PLAYER.streak}{L('-day streak')}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('2 more days for a Special buddy!')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {days.map((d, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: streakDone[i] ? THEME.joy : '#fff', border: streakDone[i] ? 'none' : `2px solid ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: streakDone[i] ? '0 3px 8px rgba(255,140,102,.35)' : 'none' }}>
                  {streakDone[i] ? <Icon name="check" size={16} color="#fff" stroke={3} /> : <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 700 }}>{d}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* daily claim */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: claimed ? THEME.successLight : '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, marginBottom: 18, transition: 'background .3s' }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: claimed ? '#fff' : THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={claimed ? 'calendar-check' : 'gift'} size={22} color={claimed ? THEME.success : THEME.gold} stroke={2.3} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{L('Daily safe-walk reward')}</div>
            <div style={{ fontSize: 12, color: claimed ? '#274427' : THEME.fg2 }}>{claimed ? L('Claimed — see you tomorrow!') : L('Ready to claim · +100 points')}</div>
          </div>
          {claimed
            ? <Badge variant="success">{L('Claimed')}</Badge>
            : <Button variant="gold" size="sm" onClick={claim}>{L('Claim')}</Button>}
        </div>

        {pop && (
          <div className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.34)' }}>
            <Confetti n={22} />
            <div className="jx-pop" style={{ width: 244, background: '#fff', borderRadius: 26, padding: '24px 20px', textAlign: 'center', boxShadow: THEME.shadowXl }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: THEME.goldLight, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><Icon name="gift" size={32} color={THEME.gold} stroke={2.3} /></div>
              <div className="game-font" style={{ fontSize: 21, fontWeight: 500 }}>{L('Daily reward claimed!')}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', padding: '8px 14px', borderRadius: 999, fontWeight: 600, fontSize: 15 }} className="game-font"><Icon name="star" size={16} color={THEME.gold} fill={THEME.gold} stroke={2} />+100</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: THEME.goldLight, color: '#9e7300', padding: '8px 14px', borderRadius: 999, fontWeight: 600, fontSize: 15 }} className="game-font"><Icon name="coins" size={16} color={THEME.gold} stroke={2.2} />+5</span>
              </div>
            </div>
          </div>
        )}

        {/* achievements */}
        <SectionHead title={L('Achievements')} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ACHIEVEMENTS.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, boxShadow: THEME.shadowCard, opacity: a.done ? 1 : 1 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: a.done ? THEME.successLight : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={a.icon} size={22} color={a.done ? THEME.success : THEME.fg3} stroke={2.3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 800 }}>{L(a.name)}</span>
                  {a.done && <Icon name="check-circle-2" size={15} color={THEME.success} stroke={2.4} />}
                </div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L(a.desc)}</div>
                {!a.done && a.progress != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <div style={{ flex: 1 }}><Bar value={a.progress} max={a.total} color={THEME.primary} height={6} /></div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>{a.progress}/{a.total}</span>
                  </div>
                )}
              </div>
              <Badge variant="gold" style={{ flexShrink: 0 }}><Icon name="star" size={11} color="#9e7300" stroke={2.4} fill={THEME.gold} />{a.reward}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Battle, Rewards, Shop });

// ── Coins & Shop ─────────────────────────────────────────────────────
function Shop({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [coins, setCoins] = React.useState(PLAYER.coins);
  const [owned, setOwned] = React.useState({ scarf: true, cape: true });
  const [toast, setToast] = React.useState(null);

  const outfits = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', price: 0 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', price: 0 },
    { id: 'crown', icon: 'crown', name: 'Star Crown', price: 20 },
    { id: 'shades', icon: 'glasses', name: 'Cool Shades', price: 15 },
    { id: 'bow', icon: 'gift', name: 'Ribbon Bow', price: 12 },
    { id: 'cap', icon: 'graduation-cap', name: 'Explorer Cap', price: 18 },
  ];
  const rooms = [
    { id: 'studio', name: 'Star Studio', price: 30, icon: 'sparkles' },
    { id: 'garden', name: 'Garden', price: 50, icon: 'flower-2' },
  ];

  const buy = (id, price, label) => {
    if (owned[id]) return;
    if (coins < price) { setToast({ ok: false, msg: L('Not enough coins yet') }); setTimeout(() => setToast(null), 1500); return; }
    setCoins(coins - price); setOwned(o => ({ ...o, [id]: true }));
    setToast({ ok: true, msg: `${label} ${L('unlocked!')}` }); setTimeout(() => setToast(null), 1600);
  };

  const PriceBtn = ({ id, price, label }) => owned[id]
    ? <span style={{ fontSize: 11, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={12} color={THEME.success} stroke={3} />{L('Owned')}</span>
    : <button onClick={() => buy(id, price, label)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: coins >= price ? THEME.gold : THEME.surface2, color: coins >= price ? '#fff' : THEME.fg3, borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="coins" size={12} color={coins >= price ? '#fff' : THEME.fg3} stroke={2.4} />{price}</button>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.screenBg }}>
      <ScreenHeader title={L('Coins')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* balance */}
        <div style={{ borderRadius: 22, padding: '20px 18px', background: 'linear-gradient(160deg,#fff2d1,#fff 78%)', boxShadow: THEME.shadowCard, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="coins" size={30} color={THEME.gold} stroke={2.2} />
            <span className="game-font" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{coins}</span>
          </div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L('Your coins')}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['swords', L('Win battles')], ['flame', L('Keep streaks')], ['gift', L('Daily reward')]].map(([ic, t], i) => (
              <div key={i} style={{ flex: 1, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Icon name={ic} size={16} color={THEME.gold} stroke={2.3} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* mystery box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${THEME.campingBg}, #fff 80%)`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, flexShrink: 0 }}><Icon name="package" size={32} color={THEME.camping} stroke={2.1} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{L('Mystery Buddy Box')}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Get a random new buddy')}</div>
          </div>
          <button onClick={() => buy('mystery', 25, L('A new buddy'))} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: coins >= 25 && !owned.mystery ? THEME.camping : THEME.surface2, color: coins >= 25 && !owned.mystery ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {owned.mystery ? L('Opened') : <React.Fragment><Icon name="coins" size={13} color="#fff" stroke={2.4} />25</React.Fragment>}
          </button>
        </div>

        {/* outfits */}
        <SectionHead title={L('Outfits')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {outfits.map(o => (
            <div key={o.id} style={{ background: '#fff', borderRadius: 18, padding: '14px 8px 12px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={o.icon} size={22} color={THEME.primary} stroke={2.2} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>{L(o.name)}</span>
              <PriceBtn id={o.id} price={o.price} label={L(o.name)} />
            </div>
          ))}
        </div>

        {/* rooms — same card style as Outfits (3-col, soft blue chip) */}
        <SectionHead title={L('Unlock rooms')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {rooms.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 18, padding: '14px 8px 12px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.icon} size={22} color={THEME.primary} stroke={2.2} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>{L(r.name)}</span>
              <PriceBtn id={r.id} price={r.price} label={L(r.name)} />
            </div>
          ))}
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="jx-pop" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: toast.ok ? THEME.fg1 : THEME.danger, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, boxShadow: THEME.shadowXl }}>
            <Icon name={toast.ok ? 'party-popper' : 'info'} size={16} color="#fff" stroke={2.3} />{toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Battle, Rewards, Shop });
