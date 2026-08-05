import React from 'react';
import { AboutJoanX, AchievementUnlock, AddFriends, AppIntro, Battle, CharDetailVariant, CharacterDex, CharacterDexVariant, DEX_LAYOUTS, ChildHome, Collection, CollectionVariant, COLLECTION_LAYOUTS, DecorateRoom, FriendHouse, Friends, Guestbook, HelpSupport, ImpactOverlay, Notices, LegalDetail, HomeVariant, HomeVariantSimple, LiteBlock, MyHouse, Notifications, Onboarding, Profile, ProfileVariant, Rewards, SafetyStatus, Shop, StreakDetail, VERSUS_LAYOUTS, VillainDex, WarningOverlay } from '../child/index.jsx';
import { collectionIntent } from '../child/Badges.jsx';
import { ACHIEVEMENTS, applyXpCurve, CHARACTERS, PARENT_PREFS, PLAYER, STAGES, setPermGrant, grantAllPermissions, resetAchievementClaims } from '../core/data.jsx';
import { CHILD_TABS, PARENT_TABS, TabBar } from '../core/nav.jsx';
import { Icon, StatusBar, THEME } from '../core/primitives.jsx';
import { HowItWorks, STORY_THEMES_LIST, ParentAIReport, ParentResponseDetail, ParentWeeklyDetail, ParentAccount, ParentActivity, ParentAddChild, ParentChildren, ParentDetail, ParentFamily, ParentInvite, ParentOnboarding, ParentReports, ParentReportsVariant, REPORT_LAYOUTS, ParentSchedule, ParentSettings } from '../parent/index.jsx';
import { BRAND } from '../parent/shared.jsx';
import { STYLE_BUDDIES, styleBrand } from '../core/characters.jsx';
import { L, setLang } from '../core/i18n.jsx';
import { installUiSounds, music, sfx } from '../core/sound.jsx';
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

  // Persist just the ACTIVE BUDDY across a browser refresh. This prototype otherwise keeps no
  // state across reloads (ADR-003), which is why a refresh used to snap the child back to the
  // seed default — the Tweaks buddy (Hammy) is re-stamped onto the active character on every
  // load, so whatever buddy you switched to was lost. We remember which buddy you're on (its id
  // + identity) so it sticks; points / levels / owned still reset by design. try/catch so a
  // locked-down localStorage (private mode) simply falls back to no-persist. Clear it with
  // localStorage.removeItem('jx.buddy') to return to the seed default.
  const BUDDY_KEY = 'jx.buddy';
  const savedBuddy = (() => { try { return JSON.parse(localStorage.getItem(BUDDY_KEY) || 'null'); } catch { return null; } })();
  if (savedBuddy?.activeCharId && CHARACTERS.some(x => x.id === savedBuddy.activeCharId)) PLAYER.activeCharId = savedBuddy.activeCharId;

  const [screen, setScreen] = React.useState(initialScreen || (initialDetail ? 'character' : 'home'));
  const [params, setParams] = React.useState(initialDetail ? { id: PLAYER.activeCharId } : {});
  const [stack, setStack] = React.useState([]);
  const [pScreen, setPScreen] = React.useState('p_reports');
  const [mode, setMode] = React.useState('smart');   // Smart is the in-scope mode; Lite (F-01) is excluded this revision
  const [overlay, setOverlay] = React.useState(false);
  // C7 — impact / fall. The highest-priority event: triggering it ends any warning already up
  // (impact > risk event) and takes the whole screen for both apps.
  const [impact, setImpact] = React.useState(false);
  const [impactKey, setImpactKey] = React.useState(null);   // which C7 step is on screen, for the handoff badge
  const triggerImpact = () => { setOverlay(false); setHold(false); setImpact(true); };
  // Achievement unlock moment (Tweaks preview). Holds an ACHIEVEMENTS row while the
  // celebration is up, null when closed. "View badges" routes to the Collection's
  // Badges side via collectionIntent — the same intent the Profile trophy shelf uses.
  const [unlock, setUnlock] = React.useState(null);
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
  // Sound — one dev switch over BOTH apps' mutes (the child game reads PLAYER.prefs.sound,
  // the parent app PARENT_PREFS.sound). Both ship OFF, so a review session is silent until
  // it is asked for. The value is read straight off the prefs on every render rather than
  // mirrored into state, so flipping the child's own Profile → Sound effects row can't leave
  // this panel showing the opposite; the tick just forces the re-render after our own click.
  const [, setSoundTick] = React.useState(0);
  // Same "mutate the shared object, tick to re-render" trick as sound above —
  // resetAchievementClaims() flips ACHIEVEMENTS rows in place, and any Badges
  // screen already mounted underneath the panel needs a nudge to pick it up.
  const [, setBadgeTick] = React.useState(0);
  const soundOn = PLAYER.prefs.sound !== false;
  const changeSound = (v) => {
    PLAYER.prefs.sound = v; PARENT_PREFS.sound = v;
    setSoundTick(n => n + 1);
    if (v) sfx.toggle(true);   // confirm the un-mute; muting is confirmed by the silence
  };
  const [devBadge, setDevBadge] = React.useState(!__q.has('nodev'));   // per-screen handoff status badge — on by default; hide with ?nodev or the Tweaks toggle
  const initialHome = __q.get('home') || 'simple-focus';
  // default buddy: Hammy in the Comic line — its green is also the product brand, so the app
  // opens with buddy and brand in agreement
  const [tw, setTw] = React.useState({ overlay: 'spotlight', msgLayout: 'sheet', species: 'fox', color: '#4b814f', name: 'Hammy', stage: 3, play: 'max', charStyle: 'comic', homeLayout: initialHome, detailLayout: initialDetail || 'char-showcase', onbStyle: 'image', villainLayout: 'road', friendsLayout: 'groups', addFriendsLayout: 'list', collectionLayout: 'tabs', dexLayout: 'list', dexHeader: 'strip', battleLayout: 'classic', versusLayout: 'banner', storyTheme: 'forest', childAvatar: 'silhouette', profileLayout: 'original', reportLayout: 'analytics', kpiStyle: 'cards', homeExtras: 'off', highlightStrip: 'off', inquiryStyle: 'kr', roomStyle: 'hotspot', buddySwitch: 'sheet', roomDecor: 'tray', heroDecorStyle: 'shelf', decorEditor: 'grid', roomSwitch: 'sheet', eggShake: 'off', eggHatch: 'crack', eggShopLayout: 'merged', rareEggStyle: 'painted', epicEggStyle: 'painted', commonEggArt: 'image', previewEggRarity: 'rare', previewBgRarity: 'rare', homeStatB: 'xpToMax', eggEntry: 'header', eggShineStyle: 'radial', eggBadge: 'off', loginProvider: 'email', ...(savedBuddy?.tw || {}), charStyle: 'comic' });
  const [lang, setLangState] = React.useState('ko');
  const [scale, setScale] = React.useState(1);
  const [bump, setBump] = React.useState(0);
  setLang(lang);  // make L() reflect the active language for this render
  // Dev-preview knobs that leaf components (Mascot, EggShape, DexProgress) read straight off
  // these globals during their own render, the same way `lang` feeds L() above. Assigned here,
  // synchronously in App's render body, NOT in a useEffect — an effect only runs after the
  // first paint commits, so on mount (incl. a hard refresh) children rendered this same pass
  // would still see last page-load's value (or undefined) and momentarily draw the wrong
  // line/style before the effect corrected it a frame later. Setting it inline means the very
  // first paint already reads correctly, no flash.
  window.JX_CHAR_STYLE = tw.charStyle;
  window.JX_RARE_EGG_STYLE = tw.rareEggStyle;
  window.JX_EPIC_EGG_STYLE = tw.epicEggStyle;
  window.JX_COMMON_EGG_ART = tw.commonEggArt;
  window.JX_DEX_HEADER = tw.dexHeader;
  const changeLang = (l) => setLangState(l);
  React.useEffect(() => {
    const fit = () => {
      const avail = window.innerHeight - 96;       // topbar + paddings
      setScale(Math.max(0.5, Math.min(1, avail / 844)));
    };
    fit(); window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);

  // Install the game-sound layer once, and keep the current app role on a window
  // flag the sound engine reads: game cues (incl. the global button-tap blip)
  // fire for the CHILD app only — the parent guardian app stays silent.
  React.useEffect(() => { installUiSounds(); }, []);
  React.useEffect(() => { window.JX_ROLE = role; }, [role]);

  // Central BGM guarantee: background music belongs to a small set of surfaces
  // (the Villain Dex + Battle screens, and the warning / impact overlays) and
  // NOWHERE else. Screens start/stop their own track, but if any cleanup is ever
  // missed the loop must not bleed onto Home — so this stops music the moment the
  // child is not on a music surface. Runs after child effects, so navigating INTO
  // a music screen (which just started its track) is preserved, not cut off.
  React.useEffect(() => {
    const hasBGM = role === 'child' && (overlay || impact || screen === 'villaindex' || screen === 'battle');
    if (!hasBGM) music.stop();
  }, [role, screen, overlay, impact]);

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

  // Save the active buddy (id + identity) whenever it changes, so a refresh restores it rather
  // than re-stamping the seed default. `bump` is bumped by setBuddy and the stamp effect above,
  // so it catches an in-app buddy switch as well as a Tweaks change.
  React.useEffect(() => {
    try {
      localStorage.setItem(BUDDY_KEY, JSON.stringify({
        activeCharId: PLAYER.activeCharId,
        tw: { species: tw.species, color: tw.color, name: tw.name, stage: tw.stage, charStyle: tw.charStyle },
      }));
    } catch { /* storage unavailable — a refresh will just fall back to the seed buddy */ }
  }, [tw.species, tw.color, tw.name, tw.stage, tw.charStyle, bump]);

  // JX_CHAR_STYLE / JX_RARE_EGG_STYLE / JX_EPIC_EGG_STYLE / JX_COMMON_EGG_ART / JX_DEX_HEADER
  // are now set synchronously up near `setLang(lang)`, not here — see the comment there.

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

  // Clear the saved buddy and return to the seed default (green Hammy). The escape hatch for
  // getting "stuck" on a persisted buddy you no longer want — refresh no longer resets it, so
  // this button does. Wipes jx.buddy AND the in-memory identity, so a later refresh stays clean.
  const resetBuddy = () => {
    try { localStorage.removeItem('jx.buddy'); } catch { /* storage unavailable */ }
    PLAYER.activeCharId = 'c1';
    setTw(s => ({ ...s, charStyle: 'comic', species: 'fox', color: '#4b814f', name: 'Hammy', stage: 3 }));
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
    tweaks: { overlay: tw.overlay, msgLayout: tw.msgLayout, onbStyle: tw.onbStyle, hold, childAvatar: tw.childAvatar, homeStatB: tw.homeStatB, eggEntry: tw.eggEntry, eggShineStyle: tw.eggShineStyle, eggBadge: tw.eggBadge },
    openOverlay: () => setOverlay(true),
    closeOverlay: () => { setOverlay(false); setHold(false); },
    openAppIntro: () => setAppIntro(true),
    setBuddy, lang, setLang: changeLang,
    // Any screen can trigger the same full-screen "new badge earned" celebration
    // Tweaks previews — the Badges detail sheet uses this so its Claim button
    // hands off to the real moment instead of a second, smaller animation.
    celebrateAchievement: (a) => setUnlock(a),
    finishOnboarding: (m) => { setMode(m); setOnboarded(true); setScreen('home'); },
    // first-run: show the add-child form — UNLESS this guardian just joined an existing family
    // (invite code), where a child already exists and Reports is the honest landing screen.
    finishParentOnboarding: (opts) => { setParentOnboarded(true); setParams({}); setPScreen(opts?.joined ? 'p_reports' : 'p_addchild'); },
  };

  // render active child/parent screen
  let body;
  if (role === 'child') {
    if (!onboarded) body = <Onboarding ctx={ctx} eggShake={tw.eggShake === 'on'} eggHatch={tw.eggHatch} />;
    else body = ({
      home: tw.homeLayout.indexOf('simple-') === 0 ? <HomeVariantSimple variant={tw.homeLayout} ctx={ctx} /> : <HomeVariant variant={tw.homeLayout} ctx={ctx} />, safety: <SafetyStatus ctx={ctx} />,
      collection: tw.collectionLayout === 'shelf' ? <Collection ctx={ctx} /> : <CollectionVariant variant={tw.collectionLayout} ctx={ctx} />, character: <CharDetailVariant layout={tw.detailLayout} ctx={ctx} />,
      // keyed on the preview target: Battle reads it once, as its initial phase, so
      // jumping from one preview to another has to remount rather than reconcile
      battle: <Battle key={`battle:${params.preview || ''}`} ctx={ctx} layout={tw.battleLayout} versus={tw.versusLayout} eggShake={tw.eggShake === 'on'} eggHatch={tw.eggHatch} />, rewards: <Rewards ctx={ctx} />, streak: <StreakDetail ctx={ctx} />, notifications: <Notifications ctx={ctx} />,
      profile: tw.profileLayout === 'original' ? <Profile ctx={ctx} /> : <ProfileVariant variant={tw.profileLayout} ctx={ctx} />, help: <HelpSupport ctx={ctx} />, notices: <Notices ctx={ctx} />, about: <AboutJoanX ctx={ctx} />, legal: <LegalDetail ctx={ctx} />,
      shop: <Shop ctx={ctx} eggShake={tw.eggShake === 'on'} eggHatch={tw.eggHatch} eggShopLayout={tw.eggShopLayout} />,
      chardex: tw.dexLayout === 'list' ? <CharacterDex ctx={ctx} /> : <CharacterDexVariant variant={tw.dexLayout} ctx={ctx} />, villaindex: <VillainDex ctx={ctx} layout={tw.villainLayout} />,
      friends: <Friends ctx={ctx} layout={tw.friendsLayout} />, friendhouse: <FriendHouse ctx={ctx} />,
      myhouse: <MyHouse ctx={ctx} variant={tw.roomStyle} buddySwitch={tw.buddySwitch} roomDecor={tw.roomDecor} heroDecorStyle={tw.heroDecorStyle} roomSwitch={tw.roomSwitch} />, guestbook: <Guestbook ctx={ctx} />, decorate: <DecorateRoom ctx={ctx} editor={tw.decorEditor} />, addfriend: <AddFriends ctx={ctx} layout={tw.addFriendsLayout} />,
    })[screen] || <ChildHome ctx={ctx} />;
  } else {
    if (!parentOnboarded) body = <ParentOnboarding ctx={ctx} />;
    else body = ({
      p_reports: tw.reportLayout === 'analytics' ? <ParentReports ctx={ctx} kpiStyle={tw.kpiStyle} homeExtras={tw.homeExtras} highlightStrip={tw.highlightStrip} /> : <ParentReportsVariant variant={tw.reportLayout} ctx={ctx} />, p_children: <ParentChildren ctx={ctx} />,
      p_activity: <ParentActivity ctx={ctx} />,
      p_settings: <ParentSettings ctx={ctx} />, p_account: <ParentAccount ctx={ctx} />,
      // the household — a second parent joins the FAMILY, never the child's device
      p_family: <ParentFamily ctx={ctx} />, p_invite: <ParentInvite ctx={ctx} />,
      p_addchild: <ParentAddChild ctx={ctx} />, p_detail: <ParentDetail ctx={ctx} inquiryStyle={tw.inquiryStyle} loginProvider={tw.loginProvider} />,
      // Profile tab — the parent account/profile page (identity + security), shown as a tab root
      p_profile: <ParentDetail ctx={{ ...ctx, params: { page: 'account', asTab: true } }} loginProvider={tw.loginProvider} />,
      // center tab-bar scan button — the global connect flow (scan/code, then child picker)
      p_connect: <ParentAddChild ctx={{ ...ctx, params: { connect: true, scan: true } }} />,
      p_schedule: <ParentSchedule ctx={ctx} />, p_aireport: <ParentAIReport ctx={ctx} />,
      p_response: <ParentResponseDetail ctx={ctx} />,
      p_weekactivity: <ParentWeeklyDetail ctx={ctx} />,
    })[pScreen] || <ParentReports ctx={ctx} kpiStyle={tw.kpiStyle} homeExtras={tw.homeExtras} highlightStrip={tw.highlightStrip} />;
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
            {showChildTabs && <TabBar tabs={CHILD_TABS} active={activeChildTab} onTab={tabTo} accent={THEME.brand} />}
            {role === 'parent' && parentOnboarded && PARENT_TAB_ROOTS.includes(pScreen) && <TabBar tabs={PARENT_TABS} active={pScreen} onTab={tabTo} accent={BRAND.primary} />}
          </div>
          <StatusBar dark={role === 'child' && overlay && mode === 'lite'} />
          {role === 'child' && overlay && (mode === 'lite' ? <LiteBlock ctx={ctx} /> : <WarningOverlay key={run} ctx={ctx} />)}
          {/* C7 — impact/fall takeover. Renders for whichever app is showing: child sees the safety
              check, parent sees the urgent notification. Above every other overlay (zIndex 200). */}
          {impact && <ImpactOverlay role={role} childName={PLAYER.name} onClose={() => setImpact(false)} onGoParent={() => setRole('parent')} onKey={setImpactKey} />}
          {/* Achievement unlock celebration (child). Sits above the screens but below the
              impact takeover — a safety event always outranks a reward moment. */}
          {role === 'child' && unlock && (
            <AchievementUnlock a={unlock}
              onClose={() => setUnlock(null)}
              onView={() => { setUnlock(null); collectionIntent.side = 'badges'; tabTo('collection'); }} />
          )}
          {story && <HowItWorks theme={tw.storyTheme} onClose={() => setStory(false)} onStart={() => setStory(false)} />}
          {role === 'child' && appIntro && <AppIntro onClose={() => setAppIntro(false)} />}
        </div>
      </div>
      </div>
      )}

      {/* dev handoff status — fixed to the left of the phone, vertically centered, outside the mockup.
          Onboarding / login aren't router screens, so they map to their own handoff keys. */}
      {devBadge && !isDocRole(role) && (
        <div style={{ position: 'fixed', top: '50%', left: 24, transform: 'translateY(-50%)', zIndex: 200 }}>
          <HandoffBadge screenKey={impact && impactKey ? impactKey : role === 'child' ? (onboarded ? screen : 'onboarding') : (parentOnboarded ? pScreen : 'parent_onboarding')} />
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
            {[['comic', 'Comic'], ['cute', '3D Cute'], ['revamp', 'Revamp']].map(([v, l]) => (
              <button key={v} className={'tw-chip' + (tw.charStyle === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, charStyle: v }))}>{l}</button>
            ))}
          </div>

          {role === 'child' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 7, alignItems: 'center', padding: '12px' }} onClick={() => { setOnboarded(false); setScreen('home'); setStack([]); }}><Icon name="rotate-ccw" size={15} color={THEME.fg1} stroke={2.3} />Replay onboarding</button>
              <button disabled className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px', marginTop: 6, opacity: .5, pointerEvents: 'none', cursor: 'not-allowed' }}>▶ App intro (disabled)</button>

              <div className="tw-label">Buddy</div>
              <div className="tw-row">
                {(STYLE_BUDDIES[tw.charStyle] || []).map(([v, l, c]) => (
                  <button key={v} className={'tw-chip' + (tw.species === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, species: v, color: c }))}>{l}</button>
                ))}
              </div>
              <button className="tw-chip" onClick={resetBuddy} style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex', gap: 6, marginTop: 6 }}>↺ Reset to Hammy (default)</button>

              {/* Room switch selector removed — the default 'sheet' (Name → sheet) is the chosen
                  behaviour; tw.roomSwitch stays defaulted so MyHouse keeps getting it. */}

              {/* Buddy switch selector removed — the default 'sheet' (Tap → sheet) is the chosen
                  behaviour; tw.buddySwitch stays defaulted so MyHouse keeps getting it. */}

              {/* Room accessories selector removed — the default 'tray' (Item tray) is the chosen
                  behaviour; tw.roomDecor stays defaulted so MyHouse keeps getting it. */}

              {/* Decorate editor + Stage accessory look selectors removed — the defaults 'grid'
                  (Lists below) and 'shelf' (Chip shelf) are the chosen behaviours; both stay
                  defaulted in tw so the screens keep getting them. */}

              {/* Child avatar selector removed — the default 'silhouette' is the chosen behaviour;
                  tw.childAvatar stays defaulted so ctx.tweaks keeps getting it. */}

              {/* Home's 2nd stat card selector removed — the default 'xpToMax' (XP to max level)
                  is the chosen behaviour, compared against Safe points, Eggs to hatch, Badges
                  earned, Friends, Bonus today, Battles left, Minutes protected/this week,
                  Collection XP and Battle power. tw.homeStatB stays defaulted so Home keeps
                  getting it. */}

              {/* Egg-shop entry point selector removed — the default 'header' (Header pill: egg +
                  count + plus badge) is the chosen behaviour, compared against fifteen other
                  treatments (icon+badge, text label, dot, stack, ghost, pulse, shop bag, progress
                  ring, colour swatch, word link, goal teaser, big sticker, tiny icon, banner card,
                  poking+badge). tw.eggEntry stays defaulted so HomeActionsS keeps getting it. */}

              {/* Points-gain animation style selector removed — the coin shower (with the
                  digits counting up alongside it) is the chosen behaviour, compared against a
                  count-up-only, a floating "+N", a single coin fly-in, and a flash burst before
                  landing here. This just plays it. */}
              <div className="tw-label">Points gain animation</div>
              <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px', background: THEME.successLight, borderColor: THEME.success, color: '#274427' }}
                onClick={() => {
                  const from = PLAYER.points;
                  PLAYER.points += 100;
                  setRole('child'); setStack([]); setScreen('home');
                  setParams({ pointsFx: { from, to: PLAYER.points, amount: 100, key: Date.now() } });
                }}>▶ Simulate earning points</button>

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

              <div className="tw-label">Impact / fall detection (C7)</div>
              {/* Highest-priority safety event — ends any warning in progress and takes the screen.
                  Answer "I'm okay" to dismiss, "I need help" (or wait out the 20s) to escalate. */}
              <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px', background: THEME.danger, color: '#fff', borderColor: THEME.danger }} onClick={triggerImpact}>
                ▲ Trigger impact / fall
              </button>
              {impact && (
                <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '10px', marginTop: 6 }} onClick={() => setImpact(false)}>■ Dismiss safety check</button>
              )}

              <div className="tw-label">Achievement unlock</div>
              {/* The celebration a child sees the moment a badge is earned. Pick any badge to
                  preview its unlock — each rarity (Common / Rare / Epic) reads differently. */}
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {ACHIEVEMENTS.map(a => (
                  <button key={a.id} className={'tw-chip' + (unlock?.id === a.id ? ' on' : '')}
                    onClick={() => { setRole('child'); setUnlock(a); }}>🏅 {L(a.name)}</button>
                ))}
              </div>
              {unlock && (
                <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '10px', marginTop: 6 }} onClick={() => setUnlock(null)}>■ Dismiss unlock</button>
              )}

              <div className="tw-label">Badge claim (Collection → Badges)</div>
              {/* The claim flow itself lives on the badge sheet, not here — this just
                  re-arms it. Refunds the points too, so replaying the test doesn't
                  quietly inflate the points balance every time. */}
              <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '10px' }}
                onClick={() => { resetAchievementClaims(); setBadgeTick(n => n + 1); }}>
                ↺ Reset badge claims
              </button>
              <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 6, lineHeight: 1.4 }}>
                Marks every earned badge unclaimed again — open Collection → Badges and tap one to see the Claim button.
              </div>

              <div className="tw-label">Story</div>
              <div className="tw-row">
                <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px' }} onClick={() => setStory(true)}>▲ How JoanX works</button>
              </div>
              <div className="tw-row" style={{ marginTop: 8 }}>
                {STORY_THEMES_LIST.map(t => (
                  <button key={t.id} className={'tw-chip' + (tw.storyTheme === t.id ? ' on' : '')} onClick={() => setTw(s => ({ ...s, storyTheme: t.id }))}>{t.label}</button>
                ))}
              </div>

              {/* Warning style + Message style selectors removed — the defaults 'spotlight' and
                  'sheet' are the chosen behaviours; both stay defaulted in tw so the overlay keeps
                  getting them. */}

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
                {[['road', 'Road map'], ['trail', 'Sketch trail (old)'], ['list', 'List']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.villainLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, villainLayout: v })); setStack([{ screen: 'battle', params: {} }]); setScreen('villaindex'); }}>{l}</button>
                ))}
              </div>

              {/* Battle layout selector removed — the default 'classic' is the chosen behaviour;
                  tw.battleLayout stays defaulted so Battle keeps getting it. */}

              {/* The fight staging (versus + result). Picking one drops you on the battle
                  screen with the villain road behind it, so the layout can be reached the
                  way a child reaches it — pick a fighter, start, watch. */}
              <div className="tw-label">Versus screen</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {VERSUS_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.versusLayout === id ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, versusLayout: id })); setStack([{ screen: 'villaindex', params: {} }]); setParams({}); setScreen('battle'); }}>{label}</button>
                ))}
              </div>
              {/* Playing to the versus phase means picking a fighter, starting, and catching
                  a beat that lasts 1.6 seconds — no way to actually read a layout. These jump
                  straight to it and hold it there. Nothing is rolled: no daily challenge is
                  spent and no villain record moves, so previewing costs the prototype nothing. */}
              <div className="tw-row" style={{ marginTop: 6 }}>
                {[['versus', '▶ Preview versus'], ['result', '▶ Preview result']].map(([p, label]) => (
                  <button key={p} className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }}
                    onClick={() => { setRole('child'); setStack([{ screen: 'villaindex', params: {} }]); setParams({ preview: p }); setScreen('battle'); }}>{label}</button>
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

              {/* Friends style is locked to 'groups' (the only layout in use), so its
                  Tweaks selector is removed — the default in `tw` keeps the screen on it. */}

              <div className="tw-label">Add-friends style</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['list', 'List'], ['hero', 'Hero'], ['cards', 'Cards'], ['compact', 'Compact'], ['bold', 'Bold'], ['grid', 'Grid'], ['gradient', 'Gradient'], ['minimal', 'Minimal'], ['rounded', 'Rounded'], ['tabs', 'Tabs'], ['spotlight', 'Spotlight'], ['outline', 'Outline'], ['split', 'Split'], ['panel', 'Panel'], ['bubbles', 'Bubbles'], ['carousel', 'Carousel'], ['ticket', 'Ticket'], ['dark', 'Dark'], ['chips', 'Chips'], ['numbered', 'Numbered'], ['gridMini', 'Grid mini'], ['cardStack', 'Card stack'], ['centered', 'Centered'], ['iconHeads', 'Icon heads']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.addFriendsLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, addFriendsLayout: v })); setStack([{ screen: 'friends', params: {} }]); setScreen('addfriend'); }}>{l}</button>
                ))}
              </div>

              {/* Profile layout is locked to 'original' (the only layout in use), so its
                  Tweaks selector is removed — the default in `tw` keeps the screen on it. */}

              <div className="tw-label">Egg hatch animation</div>
              <div className="tw-row">
                {[['pop', 'Quick pop'], ['crack', 'Gradual crack']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggHatch === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, eggHatch: v }))}>{l}</button>
                ))}
              </div>

              <div className="tw-label">Shake to hatch</div>
              <div className="tw-row">
                {[['off', 'Tap only'], ['on', 'Tap + shake']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggShake === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, eggShake: v }))}>{l}</button>
                ))}
              </div>

              {/* 'split' is the original Shop: an owned egg shows in "Your eggs" up top
                  AND its tier still shows in "Buddy Eggs" below — the same tier twice.
                  'merged' folds those into one list, one card per tier, that reads as
                  Hatch when you own one and Buy when you don't. */}
              <div className="tw-label">Egg shop layout</div>
              <div className="tw-row">
                {[['split', 'Two sections'], ['merged', 'One list']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggShopLayout === v ? ' on' : '')}
                    onClick={() => { setTw(s => ({ ...s, eggShopLayout: v })); setStack([{ screen: 'shop', params: {} }]); setScreen('shop'); }}>{l}</button>
                ))}
              </div>
              {/* 'original' — flat shell, two nearly-invisible dark-on-dark flecks. 'revamp'
                  gives the shell the same multi-stop-gradient treatment epic's shell already
                  gets, plus a cream ribbon band and leaf-shaped flecks. 'painted' (default)
                  swaps the CSS shell for the painted PNG in /assets/egg-types/rare.png, same
                  move as "Common egg art" / "Epic egg style" → Painted — everywhere EggShape
                  draws a rare egg (Shop, Home, Battle egg drops), not just this screen. */}
              <div className="tw-label">Rare egg style</div>
              <div className="tw-row">
                {[['original', 'Original'], ['revamp', 'Revamp'], ['painted', 'Painted']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.rareEggStyle === v ? ' on' : '')}
                    onClick={() => setTw(s => ({ ...s, rareEggStyle: v }))}>{l}</button>
                ))}
              </div>
              {/* 'original' — the specular gold sweep + glow-filtered star flecks epic has always
                  had. 'revamp' flattens it the same way rare's revamp did: a solid gold band with
                  one fold line, faceted flecks with no blur. 'painted' (default) swaps the CSS
                  shell for the painted PNG in /assets/egg-types/epic.png, same move as "Common
                  egg art" → Painted — everywhere EggShape draws an epic egg. */}
              <div className="tw-label">Epic egg style</div>
              <div className="tw-row">
                {[['original', 'Original'], ['revamp', 'Revamp'], ['painted', 'Painted']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.epicEggStyle === v ? ' on' : '')}
                    onClick={() => setTw(s => ({ ...s, epicEggStyle: v }))}>{l}</button>
                ))}
              </div>
              {/* 'drawn' — the original flat CSS shell. 'image' — the painted PNG dropped
                  into /assets/egg-types/ (EggShape, EggHatch.jsx), swapped in everywhere a
                  common egg is drawn (Shop, Home, Battle, Onboarding) so the two can be
                  compared side by side before picking one. */}
              <div className="tw-label">Common egg art</div>
              <div className="tw-row">
                {[['drawn', 'Drawn'], ['image', 'Painted']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.commonEggArt === v ? ' on' : '')}
                    onClick={() => setTw(s => ({ ...s, commonEggArt: v }))}>{l}</button>
                ))}
              </div>
              {/* The Home · Focus layout's egg-shop badge (EggShopBadgeS, HomeVariantsSimple.jsx)
                  next to the level/stage line. Landed here as a Tweaks row rather than a single
                  hand-picked answer — a rotating ray-burst, a flat gradient dot, and a bright
                  off-center highlight were each tried and rejected in turn ("too loud" / "too
                  plain" / "too glassy") before it became clear these needed to sit side by side. */}
              {/* Hidden on Home by default — a floating badge next to the buddy's level/stage
                  line read as one decoration too many once the header egg entry and the Shop's
                  own screen already cover "go hatch an egg". Kept here (not deleted) so the
                  shine-style comparison above still has something to preview against. */}
              <div className="tw-label">Egg badge</div>
              <div className="tw-row">
                {[['off', 'Hidden'], ['on', 'Shown']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggBadge === v ? ' on' : '')}
                    onClick={() => setTw(s => ({ ...s, eggBadge: v }))}>{l}</button>
                ))}
              </div>
              <div className="tw-label">Egg badge shine</div>
              <div className="tw-row">
                {[['radial', 'Radial'], ['ring', 'Ring'], ['halo', 'Halo'], ['ripple', 'Ripple'], ['iconPulse', 'Icon pulse'], ['iconFloat', 'Icon float'], ['fadeDot', 'Fade dot'], ['shimmer', 'Shimmer'], ['rays', 'Rays'], ['none', 'None']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.eggShineStyle === v ? ' on' : '')}
                    onClick={() => setTw(s => ({ ...s, eggShineStyle: v }))}>{l}</button>
                ))}
              </div>
              {/* Each tier's own painted hatch backdrop lives in /assets/egg/ (EGG_HATCH_BG in
                  Shop.jsx). Egg shape and background are picked SEPARATELY here on purpose —
                  the point of this preview is trying an egg against a backdrop that isn't
                  necessarily its own tier, to judge which pairings actually read well, before
                  a real hatch (which always matches the two) ever uses that pairing. */}
              <div className="tw-label">Preview: egg</div>
              <div className="tw-row">
                {[['common', 'Common'], ['rare', 'Rare'], ['epic', 'Epic']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.previewEggRarity === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, previewEggRarity: v }))}>{l}</button>
                ))}
              </div>
              <div className="tw-label">Preview: background</div>
              <div className="tw-row">
                {[['common', 'Common'], ['rare', 'Rare'], ['epic', 'Epic'], ['forest', 'Forest (new)'], ['forest2', 'Forest 2 (new)'], ['gold', 'Gold (new)']].map(([v, l]) => (
                  <button key={v} className={'tw-chip' + (tw.previewBgRarity === v ? ' on' : '')} onClick={() => setTw(s => ({ ...s, previewBgRarity: v }))}>{l}</button>
                ))}
              </div>
              {/* Grants that egg on the spot (dev-only poke to PLAYER.eggs, not a real
                  acquisition) and jumps to the Shop's hatch overlay with both picks above. */}
              <div className="tw-row" style={{ marginTop: 6 }}>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }}
                  onClick={() => { setRole('child'); setStack([{ screen: 'home', params: {} }]); setParams({ preview: 'hatch', previewEgg: tw.previewEggRarity, previewBg: tw.previewBgRarity }); setScreen('shop'); }}>▶ Preview hatch</button>
              </div>

            </React.Fragment>
          )}

          {role === 'parent' && (
            <React.Fragment>
              <div className="tw-label">Flow</div>
              <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 7, alignItems: 'center', padding: '12px' }} onClick={() => { setParentOnboarded(false); setStack([]); }}><Icon name="rotate-ccw" size={15} color={THEME.fg1} stroke={2.3} />Replay onboarding</button>
              <div className="tw-row" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_addchild'); setStack([]); }}>Pairing / Add child</button>
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(true); setPScreen('p_children'); setStack([]); }}>Children</button>
                {/* jumps straight to AuthFlow's 'invite' phase — the second guardian's join path
                    (Have an invite code? on the auth landing), skipping the splash/slides a real
                    first run always sees. Ends on Reports, not Add-child (finishParentOnboarding
                    routes on { joined: true }), since the family/child already exist. */}
                <button className="tw-chip" style={{ flex: 1, justifyContent: 'center', display: 'flex' }} onClick={() => { setParentOnboarded(false); setParams({ authStep: 3, authPhase: 'invite' }); setStack([]); }}>Join family (invite code)</button>
              </div>

              {/* Account → Sign-in method. 'Email' (default) is a real password account, so
                  Security → Change password shows; Google/Apple/Kakao hand back an identity
                  that already carries its own key, so those show a read-only Connected row
                  instead and no password screen — see ParentDetail.jsx. */}
              <div className="tw-label">Account sign-in method</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['email', 'Email (password)'], ['google', 'Google'], ['apple', 'Apple'], ['kakao', 'Kakao']].map(([id, label]) => (
                  <button key={id} className={'tw-chip' + (tw.loginProvider === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, loginProvider: id })); setParentOnboarded(true); setPScreen('p_detail'); setParams({ page: 'account' }); setStack([]); }}>{label}</button>
                ))}
              </div>

              <div className="tw-label">Impact / fall alert (C7)</div>
              {/* the urgent notification the parent receives when the child didn't respond */}
              <button className="tw-chip on" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: 6, alignItems: 'center', padding: '10px', background: THEME.danger, color: '#fff', borderColor: THEME.danger }} onClick={triggerImpact}>
                ▲ Show urgent alert
              </button>
              {impact && (
                <button className="tw-chip" style={{ width: '100%', justifyContent: 'center', display: 'flex', padding: '10px', marginTop: 6 }} onClick={() => setImpact(false)}>■ Dismiss alert</button>
              )}

              <div className="tw-label">Report layout</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {REPORT_LAYOUTS.map(({ id, label }) => (
                  <button key={id} className={'tw-chip' + (tw.reportLayout === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, reportLayout: id })); setParentOnboarded(true); setPScreen('p_reports'); setStack([]); }}>{label}</button>
                ))}
              </div>

              {tw.reportLayout === 'analytics' && (
                <>
                  <div className="tw-label">KPI card style</div>
                  <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                    {[['cards', 'Cards'], ['ring', 'Ring + stats']].map(([id, label]) => (
                      <button key={id} className={'tw-chip' + (tw.kpiStyle === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, kpiStyle: id })); setParentOnboarded(true); setPScreen('p_reports'); setStack([]); }}>{label}</button>
                    ))}
                  </div>

                  {/* live status card, other-kids glance row, recent-alerts preview, AI
                      button → full report — bundled behind one toggle so it's a clean
                      before/after against the shipped 'off' version, not four separate
                      diffs to compare one at a time. */}
                  <div className="tw-label">Reports home additions</div>
                  <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                    {[['off', 'Current'], ['on', 'New (status + alerts)']].map(([id, label]) => (
                      <button key={id} className={'tw-chip' + (tw.homeExtras === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, homeExtras: id })); setParentOnboarded(true); setPScreen('p_reports'); setStack([]); }}>{label}</button>
                    ))}
                  </div>

                  {/* the "이번 주, 좋은 흐름이에요" / "On a roll this week" card — tone-aware
                      one-liner + risk/stops/acceptance summary, above the live-status card */}
                  <div className="tw-label">Weekly highlight strip</div>
                  <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                    {[['on', 'Shown'], ['off', 'Hidden']].map(([id, label]) => (
                      <button key={id} className={'tw-chip' + (tw.highlightStrip === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, highlightStrip: id })); setParentOnboarded(true); setPScreen('p_reports'); setStack([]); }}>{label}</button>
                    ))}
                  </div>
                </>
              )}

              <div className="tw-label">App states</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {/* 'empty' — no children added yet: Children shows the add-first-child card,
                    Reports shows the no-data-yet card instead of its dashboard. */}
                {[['loading', 'Loading'], ['empty', 'First-run']].map(([k, l]) => (
                  <button key={k} className={'tw-chip' + (demo[k] ? ' on' : '')} onClick={() => { setDemo(d => ({ ...d, [k]: !d[k] })); setStack([]); }}>{l}</button>
                ))}
                <button className="tw-chip" onClick={() => { setParentOnboarded(true); setPScreen('p_children'); setStack([]); }}>Device offline →</button>
              </div>

              {/* 1:1 Inquiry — 'form' is the shipped static form (email/message/screenshot/
                  consent). 'kr' is a Korean-CS-style flow instead: category picker → FAQ
                  deflection (reuses the same FaqAccordion + FAQ_GROUPS data, so answers can't
                  drift from Help) → a chat-thread compose step, plus a small recent-tickets
                  peek at the top — the shape real Korean CS (Toss/Kakao/Naver-style) support
                  actually takes, rather than a Western contact-us form. */}
              <div className="tw-label">1:1 Inquiry style</div>
              <div className="tw-row" style={{ flexWrap: 'wrap' }}>
                {[['form', 'Current (form)'], ['kr', 'New (Korean CS flow)']].map(([id, label]) => (
                  <button key={id} className={'tw-chip' + (tw.inquiryStyle === id ? ' on' : '')} onClick={() => { setTw(s => ({ ...s, inquiryStyle: id })); setParentOnboarded(true); setPScreen('p_detail'); setParams({ page: 'inquiry' }); setStack([]); }}>{label}</button>
                ))}
                <button className="tw-chip" onClick={() => { setParentOnboarded(true); setPScreen('p_detail'); setParams({ page: 'inquiry' }); setStack([]); }}>Open 1:1 Inquiry →</button>
              </div>
            </React.Fragment>
          )}

          {/* Last in the panel, under both roles' sections: it isn't a variant to compare,
              it's the volume for whatever you are looking at — game cues + BGM in the child
              app, the quiet functional cues in the parent app. Off is the default. */}
          <div className="tw-label">Sound</div>
          <div className="tw-row">
            {[[true, 'On'], [false, 'Off']].map(([v, l]) => (
              <button key={String(v)} className={'tw-chip' + (soundOn === v ? ' on' : '')} onClick={() => changeSound(v)}>{l}</button>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default App;
