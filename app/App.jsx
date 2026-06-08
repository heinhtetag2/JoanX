// JoanX — app shell: iOS frame, router, app switcher, Tweaks panel.
// Tab definitions + TabBar come from nav.jsx (window globals).

function App() {
  const [role, setRole] = React.useState('child');
  const [onboarded, setOnboarded] = React.useState(true);   // start on Home; "Replay onboarding" (Tweaks) shows it
  const [screen, setScreen] = React.useState('home');
  const [params, setParams] = React.useState({});
  const [stack, setStack] = React.useState([]);
  const [pScreen, setPScreen] = React.useState('p_reports');
  const [mode, setMode] = React.useState('lite');
  const [overlay, setOverlay] = React.useState(false);
  const [tweaksOpen, setTweaksOpen] = React.useState(true);
  const [tw, setTw] = React.useState({ overlay: 'sheet', species: 'croc', color: '#e1874a', stage: 3, play: 'playful', charStyle: 'toy' });
  const [lang, setLangState] = React.useState('ko');
  const [scale, setScale] = React.useState(1);
  const [, setBump] = React.useState(0);
  setLang(lang);  // make L() reflect the active language for this render
  const changeLang = (l) => setLangState(l);

  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  React.useEffect(() => {
    const fit = () => {
      const avail = window.innerHeight - 96;       // topbar + paddings
      setScale(Math.max(0.5, Math.min(1, avail / 844)));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // apply tweak overrides to whichever buddy is currently active (keeps its name)
  React.useEffect(() => {
    const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
    c.species = tw.species; c.color = tw.color; c.stage = tw.stage;
    setBump(b => b + 1);
  }, [tw.species, tw.color, tw.stage]);

  // switch the active character line (classic / korean) for every Mascot
  React.useEffect(() => { window.JX_CHAR_STYLE = tw.charStyle; setBump(b => b + 1); }, [tw.charStyle]);

  // commit an evolved / recolored character and make it the active buddy
  const setBuddy = (id, patch) => {
    const c = CHARACTERS.find(x => x.id === id);
    if (c) Object.assign(c, patch);
    PLAYER.activeCharId = id;
    // keep the tweak panel in sync so it doesn't snap the buddy back
    if (patch) setTw(s => ({ ...s, species: c.species, color: c.color, stage: c.stage }));
    setBump(b => b + 1);
  };

  const nav = (s, p = {}) => {
    if (role === 'parent') { setPScreen(s); return; }
    setStack(st => [...st, { screen, params }]);
    setScreen(s); setParams(p);
  };
  const back = () => setStack(st => {
    const prev = st[st.length - 1];
    if (prev) { setScreen(prev.screen); setParams(prev.params); return st.slice(0, -1); }
    setScreen('home'); setParams({});   // standard "up": always land on Home
    return st;
  });
  const tabTo = (root) => { setStack([]); if (role === 'parent') setPScreen(root); else setScreen(root); };

  const ctx = {
    nav, back, params, mode, setMode,
    tweaks: { overlay: tw.overlay },
    openOverlay: () => setOverlay(true),
    closeOverlay: () => setOverlay(false),
    setBuddy, lang, setLang: changeLang,
    finishOnboarding: (m) => { setMode(m); setOnboarded(true); setScreen('home'); },
  };

  // render active child/parent screen
  let body;
  if (role === 'child') {
    if (!onboarded) body = <Onboarding ctx={ctx} />;
    else body = ({
      home: <ChildHome ctx={ctx} />, safety: <SafetyStatus ctx={ctx} />,
      collection: <Collection ctx={ctx} />, character: <CharacterDetail ctx={ctx} />,
      battle: <Battle ctx={ctx} />, rewards: <Rewards ctx={ctx} />, notifications: <Notifications ctx={ctx} />,
      profile: <Profile ctx={ctx} />,
      shop: <Shop ctx={ctx} />,
    })[screen] || <ChildHome ctx={ctx} />;
  } else {
    body = ({
      p_reports: <ParentReports ctx={ctx} />, p_children: <ParentChildren ctx={ctx} />,
      p_settings: <ParentSettings ctx={ctx} />,
    })[pScreen] || <ParentReports ctx={ctx} />;
  }

  const activeChildTab = ['character'].includes(screen) ? 'collection' : screen;
  const showChildTabs = role === 'child' && onboarded && !['battle'].includes(screen);
  const playClass = tw.play === 'calm' ? 'play-calm jx-nofun jx-still' : tw.play === 'max' ? 'play-max' : 'play-wrap';

  return (
    <div className={'stage' + (tweaksOpen ? ' with-panel' : '')}>
      {/* top control: app switch */}
      <div className="topbar">
        <div className="seg">
          {[['child', 'Child app', 'smartphone'], ['parent', 'Parent app', 'users']].map(([r, l, ic]) => (
            <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>
              <Icon name={ic} size={15} color={role === r ? '#fff' : THEME.fg3} stroke={2.2} />{l}
            </button>
          ))}
        </div>
        <button className="gear" onClick={() => setTweaksOpen(o => !o)} title="Tweaks">
          <Icon name="sliders-horizontal" size={19} color={THEME.fg1} stroke={2.2} />
        </button>
      </div>

      {/* phone */}
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: -(1 - scale) * 844 }}>
      <div className="bezel">
        <div className="island" />
        <div className="screen">
          <div className={playClass} style={{ position: 'absolute', inset: 0 }}>
            {body}
          </div>
          <StatusBar dark={role === 'child' && overlay && mode === 'lite'} />
          {showChildTabs && <TabBar tabs={CHILD_TABS} active={activeChildTab} onTab={tabTo} />}
          {role === 'parent' && <TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} />}
          {role === 'child' && overlay && (mode === 'lite' ? <LiteBlock ctx={ctx} /> : <WarningOverlay ctx={ctx} />)}
          <div className="home-ind" style={{ background: role === 'child' && overlay && mode === 'lite' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.32)' }} />
        </div>
      </div>
      </div>

      {/* tweaks panel */}
      {tweaksOpen && (
        <div className="tweaks">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4>Tweaks</h4>
            <button onClick={() => setTweaksOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><Icon name="x" size={18} color={THEME.fg2} stroke={2.4} /></button>
          </div>

          <div className="tw-label">Language</div>
          <div className="tw-row">
            {[['en', 'English'], ['ko', '한국어']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (lang === v ? ' on' : '')} onClick={() => changeLang(v)}>{l}</button>
            ))}
          </div>

          <div className="tw-label">Mode</div>
          <div className="tw-row">
            {[['smart', 'Smart'], ['lite', 'Lite']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (mode === v ? ' on' : '')} onClick={() => setMode(v)}>{l}</button>
            ))}
          </div>

          <div className="tw-label">Character style</div>
          <div className="tw-row">
            {[['classic', 'Classic'], ['kr', 'Korean'], ['toy', '3D']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.charStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, charStyle: v }))}>{l}</button>
            ))}
          </div>

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Preview the safety moment</div>
              <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px' }} onClick={() => { setOnboarded(true); setOverlay(true); }}>
                ▶ Trigger a {mode === 'lite' ? 'block' : 'warning'}
              </button>

              <div className="tw-label">Warning style</div>
              <div className="tw-row">
                {[['sheet', 'Sheet'], ['spotlight', 'Spotlight'], ['banner', 'Banner']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.overlay === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, overlay: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Buddy species</div>
              <div className="tw-row">
                {[['fox', 'Fox'], ['cat', 'Cat'], ['bird', 'Bird'], ['croc', 'Croc']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.species === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, species: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Buddy color</div>
              <div className="tw-row">
                {['#e1874a', '#9867e4', '#67c7ce', '#e278a8', '#6697c9', '#ffbc05'].map(c => (
                  <span key={c} className={'tw-sw' + (tw.color === c ? ' on' : '')} style={{ background: c }} onClick={() => setTw(s => ({ ...s, color: c }))} />
                ))}
              </div>

              <div className="tw-label">Evolution stage</div>
              <div className="tw-row">
                {[1, 2, 3].map(v => (
                  <button key={v} className={'tw-chip' + (tw.stage === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, stage: v }))}>Stage {v}</button>
                ))}
              </div>
            </React.Fragment>
          )}

          <div className="tw-label">Playfulness</div>
          <div className="tw-row">
            {[['calm', 'Calm'], ['playful', 'Playful'], ['max', 'Max']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.play === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, play: v }))}>{l}</button>
            ))}
          </div>

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => { setOnboarded(false); setScreen('home'); setStack([]); }}>Replay onboarding</button>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
