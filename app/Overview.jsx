// JoanX — flat overview canvas. Renders every screen at device size,
// grouped into sections, plus safety-moment variants and the mascot system.

function Phone({ children, tabs, active, dark, over, mode = 'smart' }) {
  return (
    <div style={{ width: 390, height: 844, position: 'relative', background: THEME.surface2, borderRadius: 42, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px #ebebea' }}>
      {children}
      <StatusBar dark={dark} />
      {tabs && <TabBar tabs={tabs} active={active} />}
      <div className="home-ind" style={{ background: dark ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.32)' }} />
    </div>
  );
}

const mk = (over, mode = 'smart') => ({
  nav: () => {}, back: () => {}, params: { id: 'c1' }, mode,
  tweaks: { overlay: over || 'sheet' },
  openOverlay: () => {}, closeOverlay: () => {}, finishOnboarding: () => {},
  setBuddy: () => {}, lang: 'en', setLang: () => {},
});

function Staged({ children }) {
  // gives overlay components a Home backdrop
  return <React.Fragment>{children}</React.Fragment>;
}

function MascotBoard() {
  const cell = (node, label) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ background: '#fff', borderRadius: 18, padding: 8, boxShadow: THEME.shadowCard }}>{node}</div>
      <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>{label}</span>
    </div>
  );
  return (
    <div style={{ padding: 24, width: 880 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .4 }}>Species</div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
        {cell(<Mascot species="fox" stage={2} size={92} />, 'Hammy · hamster')}
        {cell(<Mascot species="cat" stage={2} size={92} />, 'Mochi · cat')}
        {cell(<Mascot species="bird" stage={2} size={92} />, 'Pip · bird')}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .4 }}>Evolution (stage 1 → 3)</div>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24 }}>
        {cell(<Mascot species="fox" stage={1} size={92} />, 'Stage 1 · Baby')}
        {cell(<Mascot species="fox" stage={2} size={92} />, 'Stage 2 · Scarf')}
        {cell(<Mascot species="fox" stage={3} size={92} />, 'Stage 3 · Guardian')}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: THEME.fg2, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .4 }}>Color variants & rarity</div>
      <div style={{ display: 'flex', gap: 18 }}>
        {['#e1874a', '#9867e4', '#67c7ce', '#e278a8', '#6697c9', '#ffbc05'].map(c =>
          <React.Fragment key={c}>{cell(<Mascot species="cat" stage={2} color={c} size={76} />, c)}</React.Fragment>)}
      </div>
    </div>
  );
}

function Overview() {
  return (
    <DesignCanvas>
      <DCSection id="core" title="Child app · Core" subtitle="First-run, home, live safety status">
        <DCArtboard id="onb" label="Onboarding" width={390} height={844}><Onboarding ctx={mk()} /></DCArtboard>
        <DCArtboard id="home" label="Home (Smart)" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><ChildHome ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="safety" label="Safety status" width={390} height={844}><Phone tabs={CHILD_TABS} active="safety"><SafetyStatus ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="notif" label="Notifications" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><Notifications ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="profile" label="Profile & settings" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><Profile ctx={mk()} /></Phone></DCArtboard>
      </DCSection>

      <DCSection id="moments" title="Child app · The safety moment" subtitle="The core intervention — three overlay treatments + Lite block">
        <DCArtboard id="sheet" label="Warning · Sheet (default)" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><ChildHome ctx={mk()} /><WarningOverlay ctx={mk('sheet')} /></Phone></DCArtboard>
        <DCArtboard id="spot" label="Warning · Spotlight" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><ChildHome ctx={mk()} /><WarningOverlay ctx={mk('spotlight')} /></Phone></DCArtboard>
        <DCArtboard id="banner" label="Warning · Banner" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><ChildHome ctx={mk()} /><WarningOverlay ctx={mk('banner')} /></Phone></DCArtboard>
        <DCArtboard id="lite" label="Lite block" width={390} height={844}><Phone dark><LiteBlock ctx={mk('sheet', 'lite')} /></Phone></DCArtboard>
      </DCSection>

      <DCSection id="game" title="Child app · Game layer" subtitle="Collection, evolution, battle, rewards">
        <DCArtboard id="coll" label="Collection House" width={390} height={844}><Phone tabs={CHILD_TABS} active="collection"><Collection ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="char" label="Character detail" width={390} height={844}><Phone tabs={CHILD_TABS} active="collection"><CharacterDetail ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="battle" label="Battle" width={390} height={844}><Phone><Battle ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="rewards" label="Rewards" width={390} height={844}><Phone tabs={CHILD_TABS} active="rewards"><Rewards ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="shop" label="Coins & Shop" width={390} height={844}><Phone tabs={CHILD_TABS} active="home"><Shop ctx={mk()} /></Phone></DCArtboard>
      </DCSection>

      <DCSection id="parent" title="Parent app" subtitle="Trustworthy, data-rich — reports, rules, devices">
        <DCArtboard id="rep" label="Reports dashboard" width={390} height={844}><Phone tabs={PARENT_TABS} active="p_reports"><ParentReports ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="kids" label="Children & devices" width={390} height={844}><Phone tabs={PARENT_TABS} active="p_children"><ParentChildren ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="set" label="Child rules (from card)" width={390} height={844}><Phone tabs={PARENT_TABS} active="p_children"><ParentSettings ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="addkid" label="Add a child" width={390} height={844}><Phone tabs={PARENT_TABS} active="p_children"><ParentAddChild ctx={mk()} /></Phone></DCArtboard>
        <DCArtboard id="acct" label="Parent settings" width={390} height={844}><Phone tabs={PARENT_TABS} active="p_account"><ParentAccount ctx={mk()} /></Phone></DCArtboard>
      </DCSection>

      <DCSection id="mascots" title="Mascot system" subtitle="Cute animal buddies — species, evolution stages, recolors">
        <DCArtboard id="mboard" label="Buddies" width={880} height={420}><MascotBoard /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Overview />);
