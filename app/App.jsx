// JoanX — app shell: iOS frame, router, app switcher, Tweaks panel.
// Tab definitions + TabBar come from nav.jsx (window globals).

function App() {
  const [role, setRole] = React.useState('child');
  const [onboarded, setOnboarded] = React.useState(true);   // start on Home; "Replay onboarding" (Tweaks) shows it
  const [parentOnboarded, setParentOnboarded] = React.useState(true);   // parent app: splash → intro → auth; replay from Tweaks
  const __q = new URLSearchParams(window.location.search);
  const initialDetail = __q.get('detail');   // ?detail=char-cover opens the buddy detail screen
  const [screen, setScreen] = React.useState(initialDetail ? 'character' : 'home');
  const [params, setParams] = React.useState(initialDetail ? { id: PLAYER.activeCharId } : {});
  const [stack, setStack] = React.useState([]);
  const [pScreen, setPScreen] = React.useState('p_reports');
  const [mode, setMode] = React.useState('smart');   // Smart is the in-scope mode; Lite (F-01) is excluded this revision
  const [overlay, setOverlay] = React.useState(false);
  const [tweaksOpen, setTweaksOpen] = React.useState(true);
  const initialHome = __q.get('home') || 'simple-focus';
  const [tw, setTw] = React.useState({ overlay: 'sheet', species: 'fox', color: '#4b814f', name: 'Hammy', stage: 3, play: 'playful', charStyle: 'comic', homeLayout: initialHome, detailLayout: initialDetail || 'char-showcase', onbStyle: 'image' });
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

  // apply tweak overrides to whichever buddy is currently active, incl. its
  // name so the label matches the character/style that's actually shown
  React.useEffect(() => {
    const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
    c.species = tw.species; c.color = tw.color; c.stage = tw.stage;
    if (tw.name) c.name = tw.name;
    setBump(b => b + 1);
  }, [tw.species, tw.color, tw.stage, tw.name]);

  // switch the active character line (classic / korean) for every Mascot
  React.useEffect(() => { window.JX_CHAR_STYLE = tw.charStyle; setBump(b => b + 1); }, [tw.charStyle]);

  // Each character style has its own buddy roster (name + brand colour per
  // species). When the style or the selected buddy changes, adopt that buddy's
  // name and colour so the label, art, and accent all stay in sync.
  React.useEffect(() => {
    const roster = STYLE_BUDDIES[tw.charStyle] || [];
    // if the current species isn't offered in this style, snap to its first buddy
    const row = roster.find(r => r[0] === tw.species) || roster[0];
    if (!row) return;
    const [species, name, col] = row;
    if (species !== tw.species || col !== tw.color || name !== tw.name) {
      setTw(s => ({ ...s, species, color: col, name }));
    }
  }, [tw.charStyle, tw.species]);

  // commit an evolved / recolored character and make it the active buddy
  const setBuddy = (id, patch) => {
    const c = CHARACTERS.find(x => x.id === id);
    if (c) Object.assign(c, patch);
    PLAYER.activeCharId = id;
    // keep the tweak panel in sync so it doesn't snap the buddy back
    if (patch) setTw(s => ({ ...s, species: c.species, color: c.color, stage: c.stage, name: c.name }));
    setBump(b => b + 1);
  };

  const nav = (s, p = {}) => {
    if (role === 'parent') { setPScreen(s); setParams(p); return; }
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
    tweaks: { overlay: tw.overlay, onbStyle: tw.onbStyle },
    openOverlay: () => setOverlay(true),
    closeOverlay: () => setOverlay(false),
    setBuddy, lang, setLang: changeLang,
    finishOnboarding: (m) => { setMode(m); setOnboarded(true); setScreen('home'); },
    finishParentOnboarding: () => { setParentOnboarded(true); setParams({}); setPScreen('p_addchild'); },   // first-run: show the add-child intro
  };

  // render active child/parent screen
  let body;
  if (role === 'child') {
    if (!onboarded) body = <Onboarding ctx={ctx} />;
    else body = ({
      home: tw.homeLayout.indexOf('simple-') === 0 ? <HomeVariantSimple variant={tw.homeLayout} ctx={ctx} /> : <HomeVariant variant={tw.homeLayout} ctx={ctx} />, safety: <SafetyStatus ctx={ctx} />,
      collection: <Collection ctx={ctx} />, character: <CharDetailVariant layout={tw.detailLayout} ctx={ctx} />,
      battle: <Battle ctx={ctx} />, rewards: <Rewards ctx={ctx} />, notifications: <Notifications ctx={ctx} />,
      profile: <Profile ctx={ctx} />,
      shop: <Shop ctx={ctx} />,
      chardex: <CharacterDex ctx={ctx} />, villaindex: <VillainDex ctx={ctx} />,
      friends: <Friends ctx={ctx} />, friendhouse: <FriendHouse ctx={ctx} />,
      myhouse: <MyHouse ctx={ctx} />, decorate: <DecorateRoom ctx={ctx} />, addfriend: <AddFriends ctx={ctx} />,
    })[screen] || <ChildHome ctx={ctx} />;
  } else {
    if (!parentOnboarded) body = <ParentOnboarding ctx={ctx} />;
    else body = ({
      p_reports: <ParentReports ctx={ctx} />, p_children: <ParentChildren ctx={ctx} />,
      p_settings: <ParentSettings ctx={ctx} />, p_account: <ParentAccount ctx={ctx} />,
      p_addchild: <ParentAddChild ctx={ctx} />, p_detail: <ParentDetail ctx={ctx} />,
      p_schedule: <ParentSchedule ctx={ctx} />, p_aireport: <ParentAIReport ctx={ctx} />,
    })[pScreen] || <ParentReports ctx={ctx} />;
  }

  const activeChildTab = ['character', 'chardex', 'villaindex', 'friends', 'friendhouse', 'myhouse', 'decorate', 'addfriend'].includes(screen) ? 'collection' : screen;
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
          {showChildTabs && <TabBar tabs={CHILD_TABS} active={activeChildTab} onTab={tabTo} accent={tw.color} />}
          {role === 'parent' && parentOnboarded && pScreen !== 'p_addchild' && <TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} />}
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

          <div className="tw-label">Character style</div>
          <div className="tw-row">
            {[['comic', 'Comic'], ['toy', '3D'], ['cute', '3D Cute'], ['soft', 'Soft 3D']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.charStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, charStyle: v }))}>{l}</button>
            ))}
          </div>

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Buddy</div>
              <div className="tw-row">
                {(STYLE_BUDDIES[tw.charStyle] || []).map(([v, l, c]) => (
                  <button key={v} className={'tw-chip' + (tw.species === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, species: v, color: c }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Simple layout</div>
              <div className="tw-row">
                {HOME_LAYOUTS_SIMPLE.map(({ id, label }) => {
                  const off = id === 'simple-map';
                  return (
                    <button key={id} disabled={off} className={'tw-chip' + (tw.homeLayout === id ? ' on' : '')} style={off ? { opacity: .45, cursor: 'not-allowed', pointerEvents: 'none' } : undefined} onClick={() => { setTw(s => ({ ...s, homeLayout: id })); setScreen('home'); setStack([]); }}>{label}{off ? ' (off)' : ''}</button>
                  );
                })}
              </div>

              <div className="tw-label">Detail style (buddy screen)</div>
              <div className="tw-row">
                {CHAR_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.detailLayout === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, detailLayout: id })); setStack([]); setScreen('character'); setParams({ id: PLAYER.activeCharId }); }}>{label}</button>
                ))}
              </div>

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

            </React.Fragment>
          )}

          <div className="tw-label">Playfulness</div>
          <div className="tw-row">
            {[['calm', 'Calm'], ['playful', 'Playful'], ['max', 'Max']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.play === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, play: v }))}>{l}</button>
            ))}
          </div>

          {role === 'parent' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(false); setStack([]); }}>Replay onboarding</button>
              <div className="tw-row" style={{ marginTop: 8 }}>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_addchild'); setStack([]); }}>Pairing / Add child</button>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_children'); setStack([]); }}>Children</button>
              </div>
            </React.Fragment>
          )}

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => { setOnboarded(false); setScreen('home'); setStack([]); }}>Replay onboarding</button>

              <div className="tw-label" style={{ opacity: .5 }}>Home layout (disabled)</div>
              <div className="tw-row" style={{ opacity: .5, pointerEvents: 'none' }}>
                {HOME_LAYOUTS.map(({ id, label }) => (
                  <button key={id} disabled className={'tw-chip' + (tw.homeLayout === id ? ' on' : '')} style={{ cursor: 'not-allowed' }}>{label}</button>
                ))}
              </div>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
