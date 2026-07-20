import React from 'react';
import { AboutJoanX, AddFriends, AppIntro, Battle, BATTLE_LAYOUTS, CharDetailVariant, CharacterDex, CharacterDexVariant, DEX_HEADERS, DEX_LAYOUTS, ChildHome, Collection, CollectionVariant, COLLECTION_LAYOUTS, DecorateRoom, FriendHouse, Friends, Guestbook, HelpSupport, Notices, LegalDetail, HOME_LAYOUTS, HomeVariant, HomeVariantSimple, LiteBlock, MSG_LAYOUTS, MyHouse, Notifications, Onboarding, Profile, PROFILE_LAYOUTS, ProfileVariant, Rewards, SafetyStatus, Shop, VillainDex, WarningOverlay } from '../child/index.jsx';
import { applyXpCurve, CHARACTERS, PLAYER, STAGES, setPermGrant, grantAllPermissions } from '../core/data.jsx';
import { CHILD_TABS, PARENT_TABS, TabBar } from '../core/nav.jsx';
import { Icon, StatusBar, THEME } from '../core/primitives.jsx';
import { HowItWorks, STORY_THEMES_LIST, ParentAIReport, ParentAccount, ParentActivity, ParentAddChild, ParentChildren, ParentDetail, ParentFamily, ParentInvite, ParentOnboarding, ParentReports, ParentSchedule, ParentSettings } from '../parent/index.jsx';
import { BRAND } from '../parent/shared.jsx';
import { STYLE_BUDDIES, styleBrand } from '../core/characters.jsx';
import { setLang } from '../core/i18n.jsx';
import DesignSystem from '../docs/DesignSystem.jsx';
import SpecChecklist from '../docs/SpecChecklist.jsx';
import ProjectDocs from '../docs/ProjectDocs.jsx';
import { HandoffBadge } from './HandoffBadge.jsx';

// The roles that replace the phone with a full-page document. One list, because four
// separate `.includes(...)` checks is how a fifth doc page gets half-added.
const DOC_ROLES = ['design', 'checklist', 'docs'];
const isDocRole = (r) => DOC_ROLES.includes(r);

// The child tab bar belongs to the tab ROOTS only (Home / Collection / Friends / Profile).
// Any screen you drill into — a buddy's detail, a friend's house, the shop — is a pushed page
// with its own back button, so it hides the bar, the way a native stack hides the tab bar on a
// detail view. Center tabs (battle) are an action, not a root, so they hide it too.
const CHILD_TAB_ROOTS = CHILD_TABS.filter(t => !t.center).map(t => t.root);
// Same rule for the parent: the tab bar belongs to the tab roots only. Detail /
// sub screens (p_detail, p_family, p_schedule, p_aireport, setup flows…) carry a
// back button instead, so the bar hides while you're one level in.
const PARENT_TAB_ROOTS = PARENT_TABS.filter(t => !t.center).map(t => t.root);

// JoanX — app shell: iOS frame, router, app switcher, Tweaks panel.
// Tab definitions + TabBar come from nav.jsx (window globals).

function App() {
  const initialView = new URLSearchParams(window.location.search).get('view');
  const [role, setRole] = React.useState(isDocRole(initialView) ? initialView : 'child');   // ?view=design / ?view=checklist / ?view=docs deep-link the doc pages
  const [onboarded, setOnboarded] = React.useState(true);   // start on Home; "Replay onboarding" (Tweaks) shows it
  const [parentOnboarded, setParentOnboarded] = React.useState(true);   // parent app: splash → intro → auth; replay from Tweaks
  const __q = new URLSearchParams(window.location.search);
  const initialDetail = __q.get('detail');   // ?detail=char-cover opens the buddy detail screen
  const initialScreen = __q.get('screen');   // ?screen=myhouse jumps straight to any child screen
  const [screen, setScreen] = React.useState(initialScreen || (initialDetail ? 'character' : 'home'));
  const [params, setParams] = React.useState(initialDetail ? { id: PLAYER.activeCharId } : {});
  const [stack, setStack] = React.useState([]);
  const [pScreen, setPScreen] = React.useState('p_reports');
  const [mode, setMode] = React.useState('smart');   // Smart is the in-scope mode; Lite (F-01) is excluded this revision
  const [overlay, setOverlay] = React.useState(false);
  // Tweaks → Hold: freeze the intervention on whatever stage is showing. Prototype-only — the
  // escalation is time-driven, so without it no stage stays up long enough to be looked at.
  const [hold, setHold] = React.useState(false);
  const [run, setRun] = React.useState(0);   // keys the overlay: bumping it replays from the grace window
  const [story, setStory] = React.useState(false);   // Tweaks → the "How JoanX works" scroll-story, over any screen
  const [appIntro, setAppIntro] = React.useState(false);   // replayable app introduction, over any child screen
  // prototype "state" toggles (Tweaks): drive the edge states screens usually skip
  //   limited  · a permission is off → running-app limited-protection state (F-26)
  //   offline  · device disconnected → protection paused
  //   empty    · brand-new user → first-run empty states
  //   loading  · data still loading → skeleton shimmer
  //   walking  · the child is walking → battles are closed (F-19), the one screen the
  //              product must not let them stare at mid-stride
  const [demo, setDemo] = React.useState({ limited: false, offline: false, empty: false, loading: false, walking: false });
  const [tweaksOpen, setTweaksOpen] = React.useState(true);
  const [devBadge, setDevBadge] = React.useState(!__q.has('nodev'));   // per-screen handoff status badge — on by default; hide with ?nodev or the Tweaks toggle
  const initialHome = __q.get('home') || 'simple-focus';
  // default buddy: Hammy in the Comic line — its green is also the product brand, so the app
  // opens with buddy and brand in agreement
  const [tw, setTw] = React.useState({ overlay: 'spotlight', msgLayout: 'sheet', species: 'fox', color: '#4b814f', name: 'Hammy', stage: 3, play: 'max', charStyle: 'comic', homeLayout: initialHome, detailLayout: initialDetail || 'char-showcase', onbStyle: 'image', villainLayout: 'list', friendsLayout: 'list', addFriendsLayout: 'list', collectionLayout: 'journey', dexLayout: 'list', dexHeader: 'rows', battleLayout: 'classic', storyTheme: 'forest', childAvatar: 'silhouette', profileLayout: 'original', roomStyle: 'hotspot', buddySwitch: 'sheet', roomDecor: 'tray', heroDecorStyle: 'shelf', decorEditor: 'grid', roomSwitch: 'sheet', eggShake: 'off' });
  const [lang, setLangState] = React.useState('ko');
  const [scale, setScale] = React.useState(1);
  const [, setBump] = React.useState(0);
  setLang(lang);  // make L() reflect the active language for this render
  const changeLang = (l) => setLangState(l);
  React.useEffect(() => {
    const fit = () => {
      const avail = window.innerHeight - 96;       // topbar + paddings
      setScale(Math.max(0.5, Math.min(1, avail / 844)));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // apply tweak overrides to whichever buddy is currently active, incl. its
  // name so the label matches the character/style that's actually shown.
  // A-3.3 — the stage tweak sets the LEVEL, not the stage: stage is derived from level,
  // so writing it directly produced illegal buddies (Stage 3 at Lv.5) whose art and
  // stats disagreed. Levelling to the stage's threshold previews the same form and
  // keeps the level, stage and stats telling one story.
  React.useEffect(() => {
    const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
    c.species = tw.species; c.color = tw.color;
    const gate = STAGES.find(s => s.stage === tw.stage);
    if (gate) { c.level = Math.max(c.level, gate.minLevel); applyXpCurve([c]); }
    if (tw.name) c.name = tw.name;
    setBump(b => b + 1);
  }, [tw.species, tw.color, tw.stage, tw.name]);

  // switch the active character line (classic / korean) for every Mascot
  React.useEffect(() => { window.JX_CHAR_STYLE = tw.charStyle; setBump(b => b + 1); }, [tw.charStyle]);

  // DexProgress reads this at render time, like Mascot reads JX_CHAR_STYLE
  React.useEffect(() => { window.JX_DEX_HEADER = tw.dexHeader; setBump(b => b + 1); }, [tw.dexHeader]);

  // Each character style has its own buddy roster (name + brand colour per species). When
  // the style or the selected buddy changes, adopt that buddy's name and colour so the
  // label, art, and accent stay in sync — EXCEPT on a brand-locked style (3D Cute), where
  // the whole line shares one colour: the buddy is art, the brand never moves.
  React.useEffect(() => {
    const locked = styleBrand(tw.charStyle);
    const roster = STYLE_BUDDIES[tw.charStyle] || [];
    const row = roster.find(r => r[0] === tw.species);
    if (locked) {
      // keep the species we were given (a hatch can bring one the roster doesn't name) and
      // only pin the colour back to the line's brand
      const name = row ? row[1] : tw.name;
      if (tw.color !== locked || name !== tw.name) setTw(s => ({ ...s, color: locked, name }));
      return;
    }
    // if the current species isn't offered in this style, snap to its first buddy
    const pick = row || roster[0];
    if (!pick) return;
    const [species, name, col] = pick;
    if (species !== tw.species || col !== tw.color || name !== tw.name) {
      setTw(s => ({ ...s, species, color: col, name }));
    }
  }, [tw.charStyle, tw.species]);

  // Commit an evolved / hatched character and make it the active buddy. On a brand-locked
  // style the new buddy brings its species, stage and name — but not its colour, so the app
  // looks the same after a hatch as it did before it.
  const setBuddy = (id, patch) => {
    const c = CHARACTERS.find(x => x.id === id);
    if (c) Object.assign(c, patch);
    PLAYER.activeCharId = id;
    // keep the tweak panel in sync so it doesn't snap the buddy back
    if (patch) setTw(s => ({ ...s, species: c.species, color: styleBrand(s.charStyle) || c.color, stage: c.stage, name: c.name }));
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
    nav, back, tabTo, params, mode, setMode,
    demo, setDemo,
    tweaks: { overlay: tw.overlay, msgLayout: tw.msgLayout, onbStyle: tw.onbStyle, hold, childAvatar: tw.childAvatar },
    openOverlay: () => setOverlay(true),
    closeOverlay: () => { setOverlay(false); setHold(false); },
    openAppIntro: () => setAppIntro(true),
    setBuddy, lang, setLang: changeLang,
    finishOnboarding: (m) => { setMode(m); setOnboarded(true); setScreen('home'); },
    finishParentOnboarding: () => { setParentOnboarded(true); setParams({}); setPScreen('p_addchild'); },   // first-run: show the add-child form
  };

  // render active child/parent screen
  let body;
  if (role === 'child') {
    if (!onboarded) body = <Onboarding ctx={ctx} eggShake={tw.eggShake === 'on'} />;
    else body = ({
      home: tw.homeLayout.indexOf('simple-') === 0 ? <HomeVariantSimple variant={tw.homeLayout} ctx={ctx} /> : <HomeVariant variant={tw.homeLayout} ctx={ctx} />, safety: <SafetyStatus ctx={ctx} />,
      collection: tw.collectionLayout === 'shelf' ? <Collection ctx={ctx} /> : <CollectionVariant variant={tw.collectionLayout} ctx={ctx} />, character: <CharDetailVariant layout={tw.detailLayout} ctx={ctx} />,
      battle: <Battle ctx={ctx} layout={tw.battleLayout} />, rewards: <Rewards ctx={ctx} />, notifications: <Notifications ctx={ctx} />,
      profile: tw.profileLayout === 'original' ? <Profile ctx={ctx} /> : <ProfileVariant variant={tw.profileLayout} ctx={ctx} />, help: <HelpSupport ctx={ctx} />, notices: <Notices ctx={ctx} />, about: <AboutJoanX ctx={ctx} />, legal: <LegalDetail ctx={ctx} />,
      shop: <Shop ctx={ctx} eggShake={tw.eggShake === 'on'} />,
      chardex: tw.dexLayout === 'list' ? <CharacterDex ctx={ctx} /> : <CharacterDexVariant variant={tw.dexLayout} ctx={ctx} />, villaindex: <VillainDex ctx={ctx} layout={tw.villainLayout} />,
      friends: <Friends ctx={ctx} layout={tw.friendsLayout} />, friendhouse: <FriendHouse ctx={ctx} />,
      myhouse: <MyHouse ctx={ctx} variant={tw.roomStyle} buddySwitch={tw.buddySwitch} roomDecor={tw.roomDecor} heroDecorStyle={tw.heroDecorStyle} roomSwitch={tw.roomSwitch} />, guestbook: <Guestbook ctx={ctx} />, decorate: <DecorateRoom ctx={ctx} editor={tw.decorEditor} />, addfriend: <AddFriends ctx={ctx} layout={tw.addFriendsLayout} />,
    })[screen] || <ChildHome ctx={ctx} />;
  } else {
    if (!parentOnboarded) body = <ParentOnboarding ctx={ctx} />;
    else body = ({
      p_reports: <ParentReports ctx={ctx} />, p_children: <ParentChildren ctx={ctx} />,
      p_activity: <ParentActivity ctx={ctx} />,
      p_settings: <ParentSettings ctx={ctx} />, p_account: <ParentAccount ctx={ctx} />,
      // the household — a second parent joins the FAMILY, never the child's device
      p_family: <ParentFamily ctx={ctx} />, p_invite: <ParentInvite ctx={ctx} />,
      p_addchild: <ParentAddChild ctx={ctx} />, p_detail: <ParentDetail ctx={ctx} />,
      // Profile tab — the parent account/profile page (identity + security), shown as a tab root
      p_profile: <ParentDetail ctx={{ ...ctx, params: { page: 'account', asTab: true } }} />,
      // center tab-bar scan button — the global connect flow (scan/code, then child picker)
      p_connect: <ParentAddChild ctx={{ ...ctx, params: { connect: true, scan: true } }} />,
      p_schedule: <ParentSchedule ctx={ctx} />, p_aireport: <ParentAIReport ctx={ctx} />,
    })[pScreen] || <ParentReports ctx={ctx} />;
  }

  const activeChildTab = ['friends', 'friendhouse', 'addfriend', 'guestbook'].includes(screen) ? 'friends'
    : ['myhouse', 'decorate'].includes(screen) ? 'profile'   // the house/rooms are now a Profile detail
    : ['character', 'chardex', 'villaindex'].includes(screen) ? 'collection' : screen;
  const showChildTabs = role === 'child' && onboarded && CHILD_TAB_ROOTS.includes(screen);
  const playClass = tw.play === 'calm' ? 'play-calm jx-nofun jx-still' : tw.play === 'max' ? 'play-max' : 'play-wrap';

  return (
    <div className={'stage' + (tweaksOpen ? ' with-panel' : '')}>
      {/* top control: app switch */}
      <div className="topbar">
        <div className="seg">
          {[['child', 'Child app', 'smartphone'], ['parent', 'Parent app', 'users'], ['design', 'Design system', 'palette'], ['checklist', 'Spec checklist', 'list-checks'], ['docs', 'Documentation', 'book-open']].map(([r, l, ic]) => (
            <button key={r} className={role === r ? 'on' : ''} onClick={() => setRole(r)}>
              <Icon name={ic} size={15} color={role === r ? '#fff' : THEME.fg3} stroke={2.2} />{l}
            </button>
          ))}
        </div>
        {!isDocRole(role) && (
          <button className="gear" onClick={() => setTweaksOpen(o => !o)} title="Tweaks">
            <Icon name="sliders-horizontal" size={19} color={THEME.fg1} stroke={2.2} />
          </button>
        )}
      </div>

      {/* doc pages (full page, replace the phone) */}
      {role === 'design' && <DesignSystem />}
      {role === 'checklist' && <SpecChecklist />}
      {role === 'docs' && <ProjectDocs />}

      {/* phone */}
      {!isDocRole(role) && (
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top center', marginBottom: -(1 - scale) * 844 }}>
      <div className="bezel">
        <div className="island" />
        <div className="screen">
          {/* The tab bars live INSIDE the play wrapper, not beside it. The wrapper carries a
              saturate() filter, and a filter creates a stacking context — so a sheet or modal
              rendered by a screen is sealed inside it and its z-index can never outrank a
              sibling drawn afterwards. Kept outside, the tab bar painted over every BottomSheet
              in the child app. Inside, sheet (90) and tab bar (40) compete in one context and
              the sheet covers the nav the way it should. The filter now also applies to the tab
              bar, which is correct: it is app chrome like everything else it sits on. */}
          <div className={playClass} style={{ position: 'absolute', inset: 0 }}>
            {body}
            {showChildTabs && <TabBar tabs={CHILD_TABS} active={activeChildTab} onTab={tabTo} accent={tw.color} />}
            {role === 'parent' && parentOnboarded && PARENT_TAB_ROOTS.includes(pScreen) && <TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} accent={BRAND.primary} />}
          </div>
          <StatusBar dark={role === 'child' && overlay && mode === 'lite'} />
          {role === 'child' && overlay && (mode === 'lite' ? <LiteBlock ctx={ctx} /> : <WarningOverlay key={run} ctx={ctx} />)}
          {story && <HowItWorks theme={tw.storyTheme} onClose={() => setStory(false)} onStart={() => setStory(false)} />}
          {role === 'child' && appIntro && <AppIntro onClose={() => setAppIntro(false)} />}
          <div className="home-ind" style={{ background: role === 'child' && overlay && mode === 'lite' ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.32)' }} />
        </div>
      </div>
      </div>
      )}

      {/* dev handoff status — fixed to the left of the phone, vertically centered, outside the mockup.
          Onboarding / login aren't router screens, so they map to their own handoff keys. */}
      {devBadge && !isDocRole(role) && (
        <div style={{ position: 'fixed', top: '50%', left: 24, transform: 'translateY(-50%)', zIndex: 200 }}>
          <HandoffBadge screenKey={role === 'child' ? (onboarded ? screen : 'onboarding') : (parentOnboarded ? pScreen : 'parent_onboarding')} />
        </div>
      )}

      {/* tweaks panel */}
      {tweaksOpen && !isDocRole(role) && (
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

          <div className="tw-label">Dev handoff status</div>
          <div className="tw-row">
            {[[true, 'Show'], [false, 'Hide']].map(([v, l]) => (
              <button key={String(v)} className={'tw-chip' + (devBadge === v ? ' on' : '')} onClick={() => setDevBadge(v)}>{l}</button>
            ))}
          </div>

          <div className="tw-label">Character style</div>
          <div className="tw-row">
            {[['comic', 'Comic'], ['cute', '3D Cute']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.charStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, charStyle: v }))}>{l}</button>
            ))}
          </div>

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => { setOnboarded(false); setScreen('home'); setStack([]); }}>Replay onboarding</button>
              <button disabled className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px', marginTop: 6, opacity: .5, pointerEvents: 'none', cursor: 'not-allowed' }}>▶ App intro (disabled)</button>

              <div className="tw-label">Buddy</div>
              <div className="tw-row">
                {(STYLE_BUDDIES[tw.charStyle] || []).map(([v, l, c]) => (
                  <button key={v} className={'tw-chip' + (tw.species === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, species: v, color: c }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Room style</div>
              <div className="tw-row">
                {[['theme', 'Theme'], ['scene', 'Photo scene'], ['hotspot', 'Tappable room']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.roomStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, roomStyle: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Room switch (profile · Tappable room)</div>
              <div className="tw-row">
                {[['arrows', 'Arrows + dots'], ['chips', 'Room tabs'], ['sheet', 'Name → sheet']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.roomSwitch === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, roomSwitch: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Buddy switch (profile)</div>
              <div className="tw-row">
                {[['sheet', 'Tap → sheet'], ['row', 'Avatar row'], ['collection', 'Collection']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.buddySwitch === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, buddySwitch: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Room accessories (profile)</div>
              <div className="tw-row">
                {[['tray', 'Item tray'], ['sheet', 'Item sheet'], ['editor', 'Decorate only']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.roomDecor === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, roomDecor: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Decorate editor</div>
              <div className="tw-row">
                {[['grid', 'Lists below'], ['hotspot', 'Tap the room']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.decorEditor === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, decorEditor: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Stage accessory look</div>
              <div className="tw-row">
                {[['shelf', 'Chip shelf'], ['grounded', 'On the ground'], ['bar', 'Shelf bar']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.heroDecorStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, heroDecorStyle: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Child avatar (before hatch)</div>
              <div className="tw-row">
                {[['silhouette', 'Silhouette'], ['emblem', 'Sprout'], ['backpack', 'Backpack'], ['sneaker', 'Sneaker'], ['star', 'Star']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.childAvatar === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, childAvatar: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Preview the safety moment</div>
              {/* Once it is running the escalation moves on its own, so the panel offers the two
                  things you actually need to look at it: hold it where it is, or end it. */}
              <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px' }} onClick={() => { setOnboarded(true); setHold(false); setRun(n => n + 1); setOverlay(true); }}>
                ▶ {overlay ? 'Replay from the start' : `Trigger a ${mode === 'lite' ? 'block' : 'warning'}`}
              </button>
              {overlay && (
                <React.Fragment>
                  <div className="tw-row" style={{ marginTop: 8 }}>
                    <button className={'tw-chip' + (hold ? ' on' : '')} style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={() => setHold(h => !h)}>
                      {hold ? '▶ Resume' : '❚❚ Hold this step'}
                    </button>
                    <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', padding: '10px' }} onClick={() => { setOverlay(false); setHold(false); }}>■ Stop</button>
                  </div>
                  <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 6, lineHeight: 1.4 }}>
                    {hold ? 'Frozen — the stage on screen stays put. Resume restarts its clock.' : 'Hold freezes the escalation where it is, so a stage can be read. Stop closes it.'}
                  </div>
                </React.Fragment>
              )}

              <div className="tw-label">Story</div>
              <div className="tw-row">
                <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px' }} onClick={() => setStory(true)}>▲ How JoanX works</button>
              </div>
              <div className="tw-row" style={{ marginTop: 8 }}>
                {STORY_THEMES_LIST.map(t => (
                  <button key={t.id} className={'tw-chip' + (tw.storyTheme === t.id ? ' on' : '')} onClick={() => setTw(s => ({ ...s, storyTheme: t.id }))}>{t.label}</button>
                ))}
              </div>

              <div className="tw-label">Warning style</div>
              <div className="tw-row">
                {[['sheet', 'Sheet'], ['spotlight', 'Spotlight'], ['banner', 'Banner']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.overlay === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, overlay: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Message style</div>
              <div className="tw-row">
                {MSG_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.msgLayout === id ? ' on' : '')} onClick={() => setTw(s => ({ ...s, msgLayout: id }))}>{label}</button>
                ))}
              </div>

              <div className="tw-label">App states</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['limited', 'Limited'], ['offline', 'Offline'], ['empty', 'First-run'], ['loading', 'Loading']].map(([k, l]) => (
                  <button key={k} className={'tw-chip' + (demo[k] ? ' on' : '')} onClick={() => { setDemo(d => ({ ...d, [k]: !d[k] })); setStack([]); }}>{l}</button>
                ))}
                {/* F-19 — walking closes the battle screen. It writes straight to PLAYER.walking,
                    which is the flag canChallenge() actually reads, so the toggle exercises the
                    real rule rather than a screen-only mock of it. */}
                <button className={'tw-chip' + (demo.walking ? ' on' : '')}
                  onClick={() => { const next = !demo.walking; PLAYER.walking = next; setDemo(d => ({ ...d, walking: next })); }}>
                  Walking
                </button>
                {/* F-26 — the child skipped the permission screen and carried on. Writes the
                    real PERM_GRANTS the home card reads, so it reproduces the skipped-onboarding
                    state rather than mocking a banner. Motion stays granted: that mirrors the
                    common case, where the first ask is allowed and the rest are skipped. */}
                <button className={'tw-chip' + (demo.permsOff ? ' on' : '')}
                  onClick={() => {
                    const next = !demo.permsOff;
                    if (next) ['usage', 'overlay', 'notif'].forEach(id => setPermGrant(id, false));
                    else grantAllPermissions();
                    setDemo(d => ({ ...d, permsOff: next }));
                  }}>
                  Perms skipped
                </button>
              </div>

              <div className="tw-label">Villain dex</div>
              <div className="tw-row">
                {[['road', 'Road map'], ['list', 'List']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.villainLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, villainLayout: v })); setStack([{ screen: 'battle', params: {} }]); setScreen('villaindex'); }}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Battle layout</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {BATTLE_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.battleLayout === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, battleLayout: id })); setStack([]); setScreen('battle'); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Collection layout</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {COLLECTION_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.collectionLayout === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, collectionLayout: id })); setStack([]); setScreen('collection'); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Dex layout</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {DEX_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.dexLayout === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, dexLayout: id })); setStack([{ screen: 'collection', params: {} }]); setScreen('chardex'); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Dex header</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {DEX_HEADERS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.dexHeader === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, dexHeader: id })); setStack([{ screen: 'collection', params: {} }]); setScreen('chardex'); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Friends style</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['list', 'List'], ['grid', 'Grid'], ['showcase', 'Showcase'], ['compact', 'Compact'], ['leaderboard', 'Leaderboard'], ['carousel', 'Carousel'], ['tiles', 'Tiles'], ['cover', 'Cover'], ['bubbles', 'Bubbles'], ['timeline', 'Timeline'], ['split', 'Split'], ['village', 'Village'], ['rail', 'Rail'], ['poster', 'Poster'], ['chips', 'Chips'], ['banner', 'Banner'], ['roster', 'Roster'], ['stats', 'Stats'], ['groups', 'Groups'], ['ticket', 'Ticket'], ['feed', 'Feed'], ['bento', 'Bento'], ['minimal', 'Minimal'], ['badge', 'Badge'], ['magazine', 'Magazine'], ['spotlight', 'Spotlight'], ['pill', 'Pill'], ['frame', 'Frame'], ['avatarLeft', 'Avatar L'], ['capsule', 'Capsule'], ['inline', 'Inline'], ['gradientList', 'Gradient'], ['numbered', 'Numbered'], ['cardGrid', 'Card grid'], ['gallery', 'Gallery']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.friendsLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, friendsLayout: v })); setStack([]); setScreen('friends'); }}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Add-friends style</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['list', 'List'], ['hero', 'Hero'], ['cards', 'Cards'], ['compact', 'Compact'], ['bold', 'Bold'], ['grid', 'Grid'], ['gradient', 'Gradient'], ['minimal', 'Minimal'], ['rounded', 'Rounded'], ['qr', 'QR'], ['tabs', 'Tabs'], ['spotlight', 'Spotlight'], ['outline', 'Outline'], ['split', 'Split'], ['panel', 'Panel'], ['bubbles', 'Bubbles'], ['carousel', 'Carousel'], ['ticket', 'Ticket'], ['dark', 'Dark'], ['chips', 'Chips'], ['numbered', 'Numbered'], ['gridMini', 'Grid mini'], ['cardStack', 'Card stack'], ['centered', 'Centered'], ['iconHeads', 'Icon heads']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.addFriendsLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, addFriendsLayout: v })); setStack([{ screen: 'friends', params: {} }]); setScreen('addfriend'); }}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Profile layout</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {PROFILE_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.profileLayout === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, profileLayout: id })); setStack([]); setScreen('profile'); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Egg hatch</div>
              <div className="tw-row">
                {[['off', 'Tap only'], ['on', 'Tap + shake']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggShake === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, eggShake: v }))}>{l}</button>
                ))}
              </div>

            </React.Fragment>
          )}

          {role === 'parent' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(false); setStack([]); }}>Replay onboarding</button>
              <div className="tw-row" style={{ marginTop: 8 }}>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_addchild'); setStack([]); }}>Pairing / Add child</button>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_children'); setStack([]); }}>Children</button>
              </div>

              <div className="tw-label">App states</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['loading', 'Loading']].map(([k, l]) => (
                  <button key={k} className={'tw-chip' + (demo[k] ? ' on' : '')} onClick={() => { setDemo(d => ({ ...d, [k]: !d[k] })); }}>{l}</button>
                ))}
                <button className="tw-chip" onClick={() => { setParentOnboarded(true); setPScreen('p_children'); setStack([]); }}>Device offline →</button>
              </div>
            </React.Fragment>
          )}

          {role === 'child' && (
            <React.Fragment>
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

export default App;
