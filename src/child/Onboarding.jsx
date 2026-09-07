// JoanX — child app · Onboarding

import React from 'react';
import { CHARACTERS, PARENT_PROFILE, PERMISSIONS, PLAYER, guardianOwner, setPermGrant } from '../core/data.jsx';
import { Badge, Button, Icon, PairQR, PhotoAvatar, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgFor } from './shared.jsx';
import { EggShape, EggHalf, CrackingEgg, eggColorFor, EGG_HATCH_BG, requestMotionPermission, useShakeToHatch, HATCH_MS, HATCH_CRACK_MS } from './EggHatch.jsx';
import { sfx } from '../core/sound.jsx';

// The first buddy every new child is given (for now): Rex, the green one. Onboarding and
// the hatch wear his colour, so the flow that hands you a green buddy is itself green —
// the child app tints to the buddy it is about, and here that buddy is the starter.
// (This was the product magenta, which left a green buddy sitting inside a pink flow.)
const STARTER_ID = 'c1';
const STARTER_GREEN = THEME.success;      // evergreen 50 — the same #4b814f Rex carries
const P_BRAND = {
  primary: STARTER_GREEN,
  primaryDark: shade(STARTER_GREEN, -28),
  primaryLight: THEME.successLight,
};

const pBrandBtn = { background: P_BRAND.primary, boxShadow: 'none' };

// The first buddy arrives as a common starter egg, so the hatch screen wears the COMMON
// egg's colour — not the app's brand green. The wash, rings and shake cue all derive from
// this, the same way the Shop tints its hatch from the egg being opened (eggColorFor).
const STARTER_EGG_C = eggColorFor('common');

// PairQR lives in the design system (core/primitives) rather than here, so any future
// screen that needs a QR (this pairing step is the only one today) reuses the same object
// instead of a hand-rolled one that could drift.

// Intro slides, one per step from 1. The first is cut 1 of the onboarding storyline
// (design/onboarding-image-prompts.md) — the hook, told from the buddies' side, before
// the two value-prop slides explain the product. Each slide carries its own hero image;
// `sub` is optional, since a story beat is a single line.
// Story cuts are drawn 9:16 and named by their cut number (1.png = cut 1), with the bottom
// third left deliberately empty for copy. They are shown in a stage that is WIDER than 9:16
// (full width, ~60% of the screen), so `cover` scales by width and crops top and bottom —
// which trims that empty third away by itself. `objectPosition` biases the crop upward so
// the trim comes off the empty pavement rather than the sky.
// `zoom` therefore exists only for a cut whose subject still needs pushing; cut 1 carried
// one for the old full-bleed layout and no longer needs it.
// A story beat is one long sentence, and a 7-year-old skims it. Each title marks its own
// key words with *asterisks* — the phrase that carries the beat — and `renderCopy` colours
// what falls between them. The marks live INSIDE the i18n key, so the Korean line chooses
// its own words to stress rather than inheriting an English word order that does not apply.
// `tone` decides both the highlight colour and the icon chip: 'bad' while the villains are
// winning, 'good' from the moment the child can do something about it. That flip lands on
// cut 7, where the buddies stop being victims and start fighting back.
// `kick` is the comic sound effect over the sentence. It does the job a still picture
// cannot: a frame of Pings swarming a phone is silent, and "삐빅! 삐빅!" makes it noisy in
// the child's head. It is also the one line here that is not the approved storyline copy —
// the sentences stay faithful to design/onboarding-image-prompts.md, and the noise sits
// above them, so the client's script is intact and the page still reads like a comic.
const SLIDES = [
  { title: 'Psst… something *strange* is happening lately.', kick: 'Psst…', img: '/assets/onboarding/1.png', icon: 'sparkles', tone: 'bad' },
  { title: 'These pests keep us from *looking away*!', kick: 'Bzzt! Bzzt!', img: '/assets/onboarding/2.png', icon: 'bell-ring', tone: 'bad' },
  { title: 'Keep staring *while you walk*… and *we start to hurt* too.', kick: 'Ouch…', img: '/assets/onboarding/3.png', icon: 'heart-crack', tone: 'bad' },
  { title: 'The *weaker* we get, the *bigger* they grow!', kick: 'Bigger… bigger…', img: '/assets/onboarding/4.png', icon: 'trending-up', tone: 'bad' },
  { title: '*Ping* is just the baby one. Much worse ones are waiting…', kick: 'Dun dun…', img: '/assets/onboarding/5.png', icon: 'skull', tone: 'boss' },
  { title: 'And their *leader*… is after our *hearts* too.', kick: 'Rumble…', img: '/assets/onboarding/6.png', icon: 'crown', tone: 'boss' },
  { title: "So that's who *we're fighting*! Easy? …Nope.", kick: 'Here we go!', img: '/assets/onboarding/7.png', icon: 'users', tone: 'good' },
  // Cut 8 is the only story cut with app UI baked into the artwork, and that UI is Korean.
  // It ships as-is for the Korean launch; Japan/Hong Kong need this one frame re-rendered.
  { title: 'When we *signal* while you walk — *look up* for a second!', kick: 'Tap tap!', img: '/assets/onboarding/8.png', icon: 'hand', tone: 'good' },
  { title: 'See? They get weaker, and *we get our power back*!', kick: 'Woo-hoo!', img: '/assets/onboarding/9.png', icon: 'heart', tone: 'good' },
  // The thesis of the whole story, and the only cut that shows both outcomes in one frame —
  // so it closes the story rather than opening it. Stated last, it lands as the point the
  // previous nine cuts were making; stated first, it would be an abstract claim about a
  // world the child has not seen yet.
  { title: "The phone isn't the bad guy — *staring while you walk* is.", kick: 'Look!', img: '/assets/onboarding/10.png', icon: 'smartphone', tone: 'good' },
  // The reward loop, and the last story beat before the product slides. Pairs 11.png with
  // the storyline's CUT 10 line, not its cut 11 one: cut 11 is about evolving a single buddy
  // and this frame is about earning — coins rising off a safe walk. The doc's own cut 11
  // copy belongs with a before/after picture, which this is not.
  { title: 'Every time you do it right, you *collect Points*!', kick: 'Cha-ching!', img: '/assets/onboarding/11.png', icon: 'coins', tone: 'gold' },
  // 12.png is the before/after pair the storyline's CUT 11 copy was written for — one buddy
  // shown small and plain, then grown and decked out, with a gold arrow between them. So the
  // numbers are offset by one from here on: picture 11 carries cut-10 copy, picture 12
  // carries cut-11 copy. The pairing follows what each frame actually shows.
  { title: 'Spend them to *grow your buddy* into something way cooler.', kick: 'Level up!', img: '/assets/onboarding/12.png', icon: 'trending-up', tone: 'warm' },
  { title: 'Dress them up and *decorate your room*, however you like!', kick: 'Ooooh!', img: '/assets/onboarding/13.png', icon: 'shirt', tone: 'warm' },
  // Villains are back in frame, but this beat belongs to the child, not to them — the buddy
  // is standing up to one, not being drained by it. So it keeps the `good` tone: the page
  // stays green and the story does not fall back into the losing half.
  { title: 'A strong buddy can *take on the big ones*!', kick: 'Face-off!', img: '/assets/onboarding/14.png', icon: 'swords', tone: 'duel' },
  // The egg trio closes the flow and hands straight off to the real hatch UI, so nothing is
  // allowed between the last cracking shell and the tap that opens it. The two product
  // slides used to sit here and broke that: "who will your first friend be?" answered by
  // "every safe walk levels you up" throws the cliffhanger away. They now run before the
  // egg, where they summarise the story rather than interrupt its ending.
  { title: 'But you know what… *every buddy starts out like this*.', kick: 'Huh?', img: '/assets/onboarding/15.png', icon: 'egg', tone: 'egg' },
  { title: "Nobody knows *who's inside* — not even us.", kick: 'Thump thump', img: '/assets/onboarding/16.png', icon: 'help-circle', tone: 'egg' },
  { title: 'So… *who will your first friend be?*', kick: 'Crrrack!', img: '/assets/onboarding/17.png', icon: 'party-popper', tone: 'egg' },
];

// The page around a cut is sampled FROM that cut, not invented. Averaging the artwork
// splits it into two families, and they are nothing alike:
//   · the street cuts (1-4, 7-9) run sky blue #79BFFA at the top down to warm pavement
//     #AD988D at the bottom — daylight, warm, not purple at all
//   · the boss cuts (5-6) run #3D1C61 to #270E41 — a purple NIGHT
// So `day` mirrors that sky-to-sand fall, and `night` goes dark for the two boss frames.
// A pale lilac page behind a near-black photograph was the mismatch: the page has to be on
// the same side of light as the picture it frames, or the picture reads as a hole.
//
// Ink follows the story rather than the light. The artwork teaches one colour code —
// everything the villains touch glows purple — so words about them are stressed in that
// purple, and words about winning in the brand green. A child who cannot read the sentence
// still reads the colour, and the flip at cut 7 is the story turning.
const TONE = {
  // cuts 1-4 · daylight street, villains winning
  bad: {
    ink: '#6f4bc4', chipBg: '#f0ebfb', fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: '#6f4bc4',
    bg: 'linear-gradient(175deg, #eef4fb 0%, #f7f3ee 54%, #f2e9dd 100%)',
    blob: ['rgba(121,163,222,.30)', 'rgba(206,168,128,.28)'],
  },
  // cuts 5-6 · the boss reveal, shot at night — the only two dark frames in the set
  boss: {
    ink: '#c9a4ff', chipBg: 'rgba(255,255,255,.13)', fg: '#ffffff', sub: 'rgba(255,255,255,.80)',
    track: 'rgba(255,255,255,.20)', fill: '#c9a4ff',
    bg: 'linear-gradient(175deg, #2b1449 0%, #1d0e33 56%, #140922 100%)',
    blob: ['rgba(146,63,214,.42)', 'rgba(78,38,148,.40)'],
  },
  // cuts 7-10 · daylight again, and now the child is winning
  good: {
    ink: P_BRAND.primary, chipBg: P_BRAND.primaryLight, fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: P_BRAND.primary,
    bg: 'linear-gradient(175deg, #eef6f7 0%, #f5f6ef 52%, #e8f0e2 100%)',
    blob: ['rgba(75,129,79,.26)', 'rgba(209,153,0,.22)'],
  },
  // cut 11 · the Points frame is a screenful of gold coins, so the page is gold. Points are
  // already gold everywhere else in the product (THEME.gold), which makes this the one
  // tone that teaches a real UI colour rather than just a mood.
  gold: {
    ink: '#9e7300', chipBg: '#fff2d1', fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: '#c79300',
    bg: 'linear-gradient(175deg, #fdf7ea 0%, #faf0d8 52%, #f3e3bf 100%)',
    blob: ['rgba(209,153,0,.30)', 'rgba(120,150,200,.20)'],
  },
  // cuts 12-13 · the buddy's own frames — a cream studio and a sunlit room, both warm and
  // domestic. Green ink: these are still buddy beats, not reward beats.
  warm: {
    ink: P_BRAND.primary, chipBg: P_BRAND.primaryLight, fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: P_BRAND.primary,
    bg: 'linear-gradient(175deg, #fdfaf4 0%, #f8f1e6 54%, #f0e4d4 100%)',
    blob: ['rgba(190,149,114,.26)', 'rgba(75,129,79,.20)'],
  },
  // cut 14 · the face-off. The frame is split green-versus-purple, so the page takes the
  // villain's side of that split for its wash and keeps the buddy's green for the ink —
  // tension in the background, the child still winning in the words.
  duel: {
    ink: P_BRAND.primary, chipBg: P_BRAND.primaryLight, fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: P_BRAND.primary,
    bg: 'linear-gradient(175deg, #eeeef8 0%, #eaeaf6 50%, #e3e6f2 100%)',
    blob: ['rgba(106,106,158,.28)', 'rgba(75,129,79,.22)'],
  },
  // cuts 15-17 · the egg. Its own art is cream and gold and nothing else is in frame, so
  // the page becomes the egg's glow and the flow ends warm.
  egg: {
    ink: '#9e6b18', chipBg: '#fdf0d9', fg: THEME.fg1, sub: THEME.fg2,
    track: 'rgba(43,41,38,.13)', fill: '#d69e4a',
    bg: 'linear-gradient(175deg, #fefaf2 0%, #fbf1de 50%, #f6e4c4 100%)',
    blob: ['rgba(214,158,74,.30)', 'rgba(241,200,122,.28)'],
  },
};

// Split a marked title into plain and highlighted runs. Odd indexes are what sat between
// the asterisks. A title with no marks renders as one plain run, so marking is optional.
function renderCopy(text, ink) {
  return text.split('*').map((part, i) => (
    i % 2 ? <strong key={i} style={{ color: ink, fontWeight: 700 }}>{part}</strong> : <React.Fragment key={i}>{part}</React.Fragment>
  ));
}
// The steps after the slides are derived, not hard-coded — adding or removing a story
// slide must not silently strand the connect and hatch screens on stale numbers.
// Letterbox behind a story cut, for the moment before its image decodes and for any frame
// whose aspect leaves a sliver. The logo green (#4B814F) pulled down toward black, so it
// reads as part of the product rather than as a generic black photo well.
const STAGE_BG = '#1a301d';
const CONNECT_STEP = SLIDES.length + 1;
const HATCH_STEP = CONNECT_STEP + 1;

// ── Onboarding / permissions ─────────────────────────────────────────
// Smart mode is the only mode now. The flow is:
//   3 intro slides (1 story cut + 2 value props) → connect-to-parent (code / QR) → permissions.
// The logo-splash beat that used to open this now lives in BootSplash (shell/App.jsx always
// plays it right before Onboarding mounts), so this starts straight at the intro slides.
// The child device carries no account of its own: identity comes from the parent it pairs
// with, so there is no sign-in here (F-33 is the parent app only).
// `eggShake` matches the Shop's: it gates the gesture and the copy that teaches it, and is off
// by default. The first egg is the worst place to offer a second way to hatch — the child has
// not done it once yet.
function Onboarding({ ctx, eggShake = false, eggHatch = 'pop' }) {
  const gradualCrack = eggHatch === 'crack';   // Tweaks: Egg hatch → gradual crack vs quick pop
  const perms = PERMISSIONS;
  const [step, setStep] = React.useState(1);     // 1..SLIDES.length slides · CONNECT_STEP · HATCH_STEP
  const [grants, setGrants] = React.useState({});
  const [code, setCode] = React.useState('');    // parent's 6-digit code, typed on the connect screen
  const [codeErr, setCodeErr] = React.useState(false); // validation error on the connect screen
  const [showQR, setShowQR] = React.useState(false); // show the child's shareable QR on the connect screen
  const [pairing, setPairing] = React.useState(false); // "connecting…" wait screen after the QR is scanned / code submitted
  const [connected, setConnected] = React.useState(false); // "connected" success screen after linking
  const [charReveal, setCharReveal] = React.useState(false); // egg → hatch → congrats screen
  const [permsPhase, setPermsPhase] = React.useState(false);  // congrats → permission guide (asked after the hatch, not before)
  // A-2: the first buddy arrives as an egg, not a handout. Tap or shake it and
  // a random starter hatches out — same motif as the Shop's buddy egg.
  const [eggPhase, setEggPhase] = React.useState('egg');     // egg | cracking | reveal
  const [prize, setPrize] = React.useState(null);            // the starter that hatches
  const codeRef = React.useRef(null);
  const submitCode = () => (code.length < 6 ? setCodeErr(true) : setPairing(true)); // any complete code is accepted
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];
  // The parent has no photo yet at pairing, so their side of the linked pair shows a
  // monogram of the guardian's name with a guardian shield — gender-neutral, drawn from
  // data we already have, never a generic stock silhouette.
  const parentInitial = (guardianOwner().name || '').trim().charAt(0).toUpperCase() || '♥';
  const b = prize || c;                                      // buddy shown on the reveal

  // hand the egg over. The first buddy is fixed, not rolled: a brand-new child should meet
  // the same buddy the whole onboarding is themed around. (Random starters come later, from
  // the Shop's eggs, where the odds are the point.)
  const openEgg = () => {
    const starters = CHARACTERS.filter(x => x.owned);
    setPrize(CHARACTERS.find(x => x.id === STARTER_ID) || starters[0] || CHARACTERS[0]);
    setEggPhase('egg');
    if (eggShake) requestMotionPermission();   // iOS 13+: must be asked from a user gesture
    setCharReveal(true);
  };
  const crackEgg = () => {
    if (eggPhase !== 'egg') return;   // already cracking — a tap and a shake can both land
    sfx.hatchCrack(gradualCrack);
    setEggPhase('cracking');
    setTimeout(() => {
      sfx.hatchReveal();
      setEggPhase('reveal');
      setPrize(p => { if (p) ctx.setBuddy(p.id, {}); return p; });   // adopt the hatched buddy app-wide
    }, gradualCrack ? HATCH_CRACK_MS : HATCH_MS);
  };
  useShakeToHatch(eggShake && charReveal && eggPhase === 'egg', crackEgg);

  const [modal, setModal] = React.useState(null); // permission id of the active request sheet
  const [denied, setDenied] = React.useState({}); // permissions the user skipped → fallback / limited state
  const [showFallback, setShowFallback] = React.useState(false); // "limited protection" confirm before continuing
  const allGranted = perms.every(p => grants[p.id]);
  // F-26 staged requests: we ask for exactly one permission at a time. The live one is the
  // first that isn't granted yet; everything after it waits its turn. A denied permission
  // stays live (it's still the blocker), so the sequence can't be walked around.
  const stepIdx = perms.findIndex(p => !grants[p.id]);
  const finish = () => ctx.finishOnboarding('smart');

  // Both write PERM_GRANTS as well as local state: what the child skipped here is
  // what home reports as switched off later, so the two read from one source.
  const grant = id => { setPermGrant(id, true); setGrants(g => ({ ...g, [id]: true })); setDenied(d => { const n = { ...d }; delete n[id]; return n; }); }; // granting clears any "denied" fallback
  const deny = id => { setPermGrant(id, false); setDenied(d => ({ ...d, [id]: true })); };   // user skips a permission → its card drops to the limited state
  const openOne = id => setModal(id);                           // "special" perm → open its sheet
  const dismiss = () => setModal(null);
  const grantActive = () => { grant(modal); setModal(null); };  // "Go to settings" in the sheet
  const denyActive = () => { deny(modal); setModal(null); };    // "Not now" in the sheet → limited fallback

  const modalPerm = modal && perms.find(p => p.id === modal);
  const Buddy = ({ size }) => <Mascot species={c.species} stage={c.stage} color={c.color} size={size} />;

  // live 5-minute validity countdown — shared by the code and QR connect screens
  const [codeLeft, setCodeLeft] = React.useState(300);
  const codeExpired = codeLeft <= 0;
  const regenCode = () => setCodeLeft(300);   // "get a new code/QR" — restarts the timer
  React.useEffect(() => {
    if (step !== CONNECT_STEP || pairing || connected) return undefined;
    const t = setInterval(() => setCodeLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step, pairing, connected]);

  // pairing handshake — brief "connecting…" wait, then the success screen.
  // A hopeful ping as the wait begins, a warm "connected" resolve when it lands.
  React.useEffect(() => {
    if (!pairing) return undefined;
    sfx.connecting();
    const t = setTimeout(() => { setPairing(false); setConnected(true); sfx.connected(); }, 2800);
    return () => clearTimeout(t);
  }, [pairing]);
  const codeLeftLabel = `${Math.floor(codeLeft / 60)}:${String(codeLeft % 60).padStart(2, '0')}`;

  const introIdx = step - 1;
  const slide = SLIDES[introIdx];
  const tone = TONE[slide?.tone] || TONE.good;

  return (
    <div style={{ position: 'absolute', inset: 0, background: slide ? tone.bg : screenBgFor(P_BRAND.primary), transition: 'background .5s ease', display: 'flex', flexDirection: 'column', paddingTop: 50 }}>
      {/* Story slides. The artwork and the copy do NOT overlap: every earlier attempt put
          text on top of the image (white subtitles, then a speech bubble) and both of them
          covered the part of the frame the cut was actually about. The image gets the top
          of the screen as its own stage, the copy sits under it on the app background, and
          nothing occludes anything. */}
      {slide && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 60px)' }}>
          {/* Two soft out-of-focus blobs behind everything — the depth that keeps a flat
              wash from reading as printer paper. They are heavily blurred and low-alpha, so
              they never compete with the artwork or push the ink below contrast; `jx-float`
              drifts them a few pixels so the page is quietly alive while the child reads. */}
          <div aria-hidden className="jx-float" style={{ position: 'absolute', top: -70, right: -60, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${tone.blob[0]}, transparent 68%)`, filter: 'blur(12px)', zIndex: 0, pointerEvents: 'none' }} />
          <div aria-hidden className="jx-float" style={{ position: 'absolute', bottom: 90, left: -80, width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle at 60% 40%, ${tone.blob[1]}, transparent 70%)`, filter: 'blur(14px)', animationDelay: '-1.6s', zIndex: 0, pointerEvents: 'none' }} />

          {/* Progress sits ABOVE the picture, on the app background — never on top of it.
              One continuous line rather than one segment per slide: at eleven story cuts the
              segmented version read as a row of dashes stamped across the artwork, and it
              only gets worse as cuts are added. A single fill scales to any number. */}
          <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', padding: '0 26px 14px' }}>
            <div style={{ height: 5, borderRadius: 999, background: tone.track, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((introIdx + 1) / SLIDES.length) * 100}%`, borderRadius: 999, background: tone.fill, transition: 'width .32s, background .5s cubic-bezier(.2,.8,.3,1)' }} />
            </div>
          </div>

          {/* Stage. Rounded off at the bottom so the illustration reads as a picture in the
              app rather than a background the UI is floating on. Nothing is drawn over it. */}
          <div style={{ position: 'relative', zIndex: 1, flex: '1 1 auto', minHeight: 0, margin: '0 14px', overflow: 'hidden', borderRadius: 26, background: STAGE_BG, boxShadow: '0 6px 22px rgba(43,41,38,.14)' }}>
            <img key={slide.img} src={slide.img} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: slide.objectPosition || '50% 42%', transform: slide.zoom ? `scale(${slide.zoom})` : undefined, transformOrigin: slide.origin || '50% 50%' }} />
          </div>

          {/* Copy + CTA, on the app's own background. `flex: 0 0 auto` — the text block keeps
              exactly the height it needs and the stage above absorbs the rest, so a one-line
              cut gets a taller picture instead of a taller gap.
              Keyed by slide so the rise animation replays on every advance. */}
          <div key={introIdx} style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', padding: '20px 26px 0', animation: 'jxRise .34s cubic-bezier(.2,.8,.3,1) both' }}>
            {/* The chip names the beat before the sentence does — a bell for the alerts, a
                cracked heart for the buddies being drained, a crown for the boss. It also
                carries the tone colour, so the switch from purple to green at cut 7 reads
                as the story turning even to a child who skips the words entirely. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 11 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 11, background: tone.chipBg, flexShrink: 0 }}>
                <Icon name={slide.icon} size={19} color={tone.ink} stroke={2.1} />
              </div>
              {/* Tilted, because a sound effect that sits perfectly level is not a sound
                  effect. Small and in the tone colour, so it reads as noise coming off the
                  picture rather than as a second headline competing with the sentence. */}
              {slide.kick && (
                <span className="game-font" style={{ fontSize: 13, fontWeight: 800, letterSpacing: .3, color: tone.ink, opacity: .92, transform: 'rotate(-3deg)', transformOrigin: 'left center', whiteSpace: 'nowrap' }}>{L(slide.kick)}</span>
              )}
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1.36, margin: 0, color: tone.fg, wordBreak: 'keep-all' }}>{renderCopy(L(slide.title), tone.ink)}</h1>
            {slide.sub && <p style={{ fontSize: 14.5, lineHeight: 1.5, margin: '9px 0 0', color: tone.sub, wordBreak: 'keep-all' }}>{L(slide.sub)}</p>}
          </div>

          <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', padding: '18px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => setStep(step + 1)}>{L('Continue')}</Button>
          </div>
        </div>
      )}

      {/* 4 · permission guide — asked right after the buddy hatches, not before, so the ask
          lands with a buddy the child already has a stake in protecting. Full page with a
          toggle per permission. */}
      {step === HATCH_STEP && charReveal && eggPhase === 'reveal' && permsPhase && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '6px 22px 0' }}>
            {/* Skip rides the title's first line rather than sitting in a band of its own —
                permissions are never hard-blocked (F-26), and it lands in the same
                limited-protection sheet Continue does when something is still off. */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '4px 0 12px' }}>
              <h1 className="game-font" style={{ flex: 1, fontSize: 22, fontWeight: 500, margin: 0, lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('To keep you safe,\nwe need a little help')}</h1>
              <button onClick={() => setShowFallback(true)} style={{ flexShrink: 0, marginTop: 3, padding: '4px 2px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: P_BRAND.primary, cursor: 'pointer' }}>{L('Skip')}</button>
            </div>
            {/* the buddy does the asking — keeps the request in the game's voice */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', margin: '0 0 18px' }}>
              <div style={{ flexShrink: 0 }}><Buddy size={58} /></div>
              <p style={{ flex: 1, background: '#fff', borderRadius: '16px 16px 16px 4px', padding: '11px 13px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: 0 }}>{L('For JoanX to notice danger while you walk, the permissions below are needed. Turn them on together with your parents.')}</p>
            </div>

            {/* One flat card per permission — copy + Allow pill; a quiet "Allowed" label once granted.
                A pill, not a toggle: granting is one-way, so it shouldn't look reversible.
                Staged, per F-26: only one permission is live at a time. The next unlocks when the
                current one is granted, so the child faces a single decision instead of a wall of
                four — and the system prompts arrive one at a time, the way the OS expects. */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {perms.map((p, i) => {
                const on = !!grants[p.id];
                const off = !on && !!denied[p.id];      // skipped → limited fallback state
                const live = i === stepIdx;             // the one permission we're asking for now
                const locked = !on && !live;            // waiting its turn — shown, but not yet askable
                return (
                  <div key={p.id} style={{ display: 'flex', gap: 13, alignItems: 'center', padding: '15px 16px', background: off ? THEME.warningLight : '#fff', borderRadius: 18, border: off ? `1px solid ${shade(THEME.warning, 78)}` : '1px solid transparent', opacity: locked ? 0.45 : 1, transition: 'opacity .25s ease' }}>
                    {/* bare ink icon — no chip background, per design direction */}
                    <Icon name={p.icon} size={21} color={off ? THEME.warning : THEME.fg1} stroke={2.1} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L(p.name)}</div>
                      {/* when skipped, the card owns up to the consequence instead of the sell */}
                      <div style={{ fontSize: 12, color: off ? THEME.warning : THEME.fg2, lineHeight: 1.4, marginTop: 2, fontWeight: off ? 600 : 400 }}>{L(off ? p.warn : p.blurb)}</div>
                    </div>
                    {on ? (
                      <span className="jx-pop" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0, color: THEME.success, fontWeight: 800, fontSize: 12.5 }}>
                        <Icon name="check" size={15} color={THEME.success} stroke={2.8} />{L('Allowed')}
                      </span>
                    ) : locked ? (
                      <Icon name="lock" size={17} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginRight: 6 }} />
                    ) : off ? (
                      <button onClick={() => (p.settings ? openOne(p.id) : grant(p.id))} style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px solid ${THEME.warning}`, cursor: 'pointer', fontFamily: 'inherit', background: 'transparent', color: shade(THEME.warning, -18), fontWeight: 800, fontSize: 12.5, padding: '8px 13px', borderRadius: 999 }}>
                        <Icon name="rotate-cw" size={13} color={shade(THEME.warning, -18)} stroke={2.6} />{L('Turn on')}
                      </button>
                    ) : (
                      <button onClick={() => (p.settings ? openOne(p.id) : grant(p.id))} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.fg1, color: '#fff', fontWeight: 800, fontSize: 12.5, padding: '9px 15px', borderRadius: 999 }}>{L('Allow')}</button>
                    )}
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
            {/* Continue unlocks only once every permission is granted. Nobody is trapped:
                Skip (top right) is the way past, and it owns the consequence in the
                limited-protection sheet rather than pretending nothing was lost (F-26). */}
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} disabled={!allGranted} onClick={allGranted ? finish : undefined}>{L('Continue')}</Button>
          </div>
        </>
      )}

      {/* 3 · connect — child types the code shown in the parent app */}
      {step === CONNECT_STEP && !showQR && !pairing && !connected && (
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
                  const border = codeErr ? THEME.danger : (active ? THEME.fg1 : 'transparent');
                  return (
                    <div key={i} style={{ width: 44, height: 56, borderRadius: 14, background: codeErr ? THEME.dangerLight : '#fff', border: `2px solid ${border}`, boxShadow: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s, background .15s' }}>
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

            {/* validity — live countdown; flips to an expired notice at 0:00 */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '14px 4px 0', maxWidth: 320 }}>
              <Icon name="clock" size={13} color={codeExpired ? THEME.danger : THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              {codeExpired ? (
                <span style={{ fontSize: 11.5, color: THEME.danger, lineHeight: 1.45, fontWeight: 700 }}>{L('The code expired — create a new one in the Parent app.')}</span>
              ) : (
                <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>
                  <b style={{ color: THEME.fg2, fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{L('Time left')} {codeLeftLabel}</b>
                  {' · '}{L('If it expires, create a new code in the Parent app.')}
                </span>
              )}
            </div>

            {/* ── or ── typing the code and showing a QR are alternative ways to pair */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, alignSelf: 'stretch', margin: '26px 0 14px' }}>
              <div style={{ flex: 1, height: 1.5, background: THEME.border }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: THEME.fg3 }}>{L('or')}</span>
              <div style={{ flex: 1, height: 1.5, background: THEME.border }} />
            </div>

            {/* option 2 — show the child's QR and let the parent scan it */}
            <button onClick={() => setShowQR(true)} style={{ alignSelf: 'stretch', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', background: '#fff', borderRadius: 16, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name="qr-code" size={21} color={THEME.fg1} stroke={2.2} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Show a QR to scan instead')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 2 }}>{L('Connects automatically once scanned.')}</div>
              </div>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
            </button>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={submitCode}>{L('Connect')}</Button>
          </div>
        </>
      )}

      {/* 3b · share the child's QR for a parent to scan */}
      {step === CONNECT_STEP && showQR && !pairing && !connected && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'stretch', padding: '18px 28px 0', textAlign: 'left' }}>
            <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '6px 0 10px', lineHeight: 1.22, whiteSpace: 'pre-line' }}>{L('Show this to\nyour parent')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('Have a parent scan this QR in the JoanX Parent app to link your accounts.')}</p>

            {/* connect card — QR while valid; at 0:00 it's replaced by a clean,
                self-contained expired state (same footprint), not an overlay. */}
            {codeExpired ? (
              <div style={{ alignSelf: 'center', width: 250, minHeight: 250, marginTop: 4, background: '#fff', borderRadius: 24, padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ width: 58, height: 58, borderRadius: 999, background: THEME.dangerLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="timer-off" size={28} color={THEME.danger} stroke={2.3} /></div>
                <div style={{ fontSize: 16, fontWeight: 800, color: THEME.fg1, marginTop: 14, wordBreak: 'keep-all' }}>{L('This QR expired')}</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, marginTop: 6, maxWidth: 200, wordBreak: 'keep-all' }}>{L('The 5-minute code ran out. Get a new one to try again.')}</div>
                <button onClick={regenCode} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: P_BRAND.primary, color: '#fff', border: 'none', borderRadius: 999, padding: '11px 20px', marginTop: 18, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                  <Icon name="refresh-cw" size={16} color="#fff" stroke={2.5} />{L('Get a new QR')}
                </button>
              </div>
            ) : (
              <div onClick={() => setPairing(true)} style={{ alignSelf: 'center', width: 250, marginTop: 4, background: '#fff', borderRadius: 24, padding: 22, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
                <PairQR size={206} />
              </div>
            )}

            {/* live countdown chip — only while valid.
                Prototype shortcut: tap it to jump straight to the expired state. */}
            {!codeExpired && (
              <button onClick={() => setCodeLeft(0)} title={L('Tap to preview the expired state')} style={{ alignSelf: 'center', display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 18, padding: '7px 15px', borderRadius: 999, background: P_BRAND.primaryLight, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Icon name="clock" size={14} color={P_BRAND.primary} stroke={2.4} />
                <span style={{ fontSize: 13, fontWeight: 700, color: P_BRAND.primaryDark }}>{L('Expires in')} <b style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{codeLeftLabel}</b></span>
              </button>
            )}

            {/* validity note — only while valid; the expired card is self-explanatory */}
            {!codeExpired && (
              <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '16px 2px 0' }}>
                <Icon name="info" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L("The linking code is valid for 5 minutes. If time runs out, please create a new one in your parent's app.")}</span>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="outline" size="lg" fullWidth icon="keyboard" onClick={() => setShowQR(false)}>{L('Enter code instead')}</Button>
          </div>
        </>
      )}

      {/* 3b2 · pairing — the parent scanned the QR (or the code was sent);
          the two apps are shaking hands. Radar pattern: the buddy floats at the
          center while calm signal rings ripple outward, reaching for the parent
          app. No QR or checkmark imagery — just the handshake in progress. */}
      {step === CONNECT_STEP && pairing && !connected && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* radar — staggered rings ripple out from the buddy */}
            <div className="jx-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 240, height: 240, marginBottom: 14 }}>
              {[0, 0.8, 1.6].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring-slow" style={{ position: 'absolute', top: '50%', left: '50%', width: 170, height: 170, marginTop: -85, marginLeft: -85, borderRadius: 999, border: `2px solid ${shade(c.color, 20)}`, animationDelay: `${d}s` }} />
              ))}
              <div style={{ width: 124, height: 124, borderRadius: 999, background: shade(c.color, 82), border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)', overflow: 'hidden' }}>
                <PhotoAvatar src={PLAYER.avatar} size={118} fallback={<div className="jx-float"><Buddy size={98} /></div>} />
              </div>
            </div>

            {/* title with its own live ellipsis — the dots breathe in sequence */}
            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px', display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
              {L('Connecting')}
              {[0, 1, 2].map(i => (
                <span key={i} className="jx-link-dot" style={{ width: 6, height: 6, borderRadius: 999, background: THEME.fg1, animationDelay: `${i * 0.18}s` }} />
              ))}
            </h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, maxWidth: 280 }}>{L("Linking with your parent's app — this only takes a moment.")}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <div style={{ textAlign: 'center', fontSize: 12.5, color: THEME.fg3, fontWeight: 700 }}>{L('Keep both apps open.')}</div>
          </div>
        </>
      )}

      {/* 3c · connected — success result screen */}
      {step === CONNECT_STEP && connected && !charReveal && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* soft success glow */}
            <div style={{ position: 'absolute', top: '39%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(75,129,79,.16) 0%, rgba(255,255,255,0) 68%)' }} />

            {/* child + parent joined — overlapping avatar pair, verified check on the corner */}
            <div className="jx-pop" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {/* gentle "live connection" pulse rings behind the pair (margin-centered so scale keeps its origin) */}
              {[0, 0.8].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring" style={{ position: 'absolute', top: '50%', left: '50%', width: 152, height: 152, marginTop: -76, marginLeft: -76, borderRadius: 999, border: `2px solid ${THEME.success}`, zIndex: 0, animationDelay: `${d}s` }} />
              ))}
              {/* child — their profile photo (the buddy hasn't hatched yet), falling back to the
                  buddy placeholder when no photo is set */}
              <div style={{ width: 104, height: 104, borderRadius: 999, background: shade(c.color, 82), border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)', overflow: 'hidden' }}>
                <PhotoAvatar src={PLAYER.avatar} size={98} fallback={<Buddy size={86} />} />
              </div>
              {/* parent — tucked behind, overlapping · their photo + guardian shield, falling back
                  to a name monogram when no photo is set */}
              <div style={{ width: 104, height: 104, borderRadius: 999, background: P_BRAND.primaryLight, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -30, position: 'relative', zIndex: 1, boxShadow: `inset 0 0 0 1px ${shade(P_BRAND.primary, 60)}` }}>
                <PhotoAvatar src={PARENT_PROFILE.avatar} size={98}
                  fallback={<span className="game-font" style={{ fontSize: 42, fontWeight: 500, color: P_BRAND.primary, lineHeight: 1 }}>{parentInitial}</span>} />
                {/* shield sits on the edge, overhanging the circle — its own zIndex so it clears the ring */}
                <span style={{ position: 'absolute', right: -3, bottom: -1, zIndex: 3, width: 32, height: 32, borderRadius: 999, background: P_BRAND.primary, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="shield-check" size={15} color="#fff" stroke={2.4} />
                </span>
              </div>
            </div>

            {/* linked-with-parent pill reinforces the connection */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: THEME.successLight, color: shade(THEME.success, -22), borderRadius: 999, padding: '5px 14px 5px 6px', fontSize: 13, fontWeight: 700, position: 'relative', marginBottom: 18 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={12} color="#fff" stroke={3.4} />
              </span>{L('Linked with parent')}
            </div>

            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px', position: 'relative' }}>{L('Connected!')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, position: 'relative', maxWidth: 280 }}>{L("You're now linked with your parent and protected together.")}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => { setStep(HATCH_STEP); openEgg(); }}>{L('Continue')}</Button>
          </div>
        </>
      )}

      {/* 3d · the buddy egg — tap or shake to hatch (A-2, same motif as the Shop) */}
      {/* absolute inset:0 like the splash — an abspos child fills the parent's
          padding box, so the wash reaches under the status bar with no pink gap */}
      {step === HATCH_STEP && charReveal && eggPhase !== 'reveal' && (
        <>
          {/* the starter egg is always common, so the painted common backdrop applies
              unconditionally here — no tier/preview branching like the Shop needs. */}
          <div className={EGG_HATCH_BG.common ? 'jx-fade' : 'jx-egg-bg'} style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '50px 30px 0', overflow: 'hidden',
            ...(EGG_HATCH_BG.common
              ? { backgroundImage: `url(${EGG_HATCH_BG.common})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { '--egg-a': shade(STARTER_EGG_C, 38), '--egg-b': shade(STARTER_EGG_C, 66), '--egg-base': shade(STARTER_EGG_C, 92) }) }}>
            {/* rings + the tappable egg */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 34 }}>
              <div className="jx-ring-slow" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${STARTER_EGG_C}55` }} />
              <div className="jx-ring" style={{ position: 'absolute', width: 190, height: 190, borderRadius: 999, border: `2px solid ${STARTER_EGG_C}55` }} />
              {eggPhase === 'cracking' && !gradualCrack && <div className="jx-burst" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, background: `radial-gradient(circle, ${shade(STARTER_EGG_C, 60)} 0%, transparent 68%)` }} />}
              <button data-sfx="off" onClick={eggPhase === 'cracking' ? undefined : crackEgg} disabled={eggPhase === 'cracking'} className={`jx-press ${eggPhase === 'cracking' ? (gradualCrack ? '' : 'jx-egg-hatch') : 'jx-egg-idle'}`} aria-label={L('Tap the egg to hatch')} style={{ background: 'none', border: 'none', cursor: eggPhase === 'cracking' ? 'default' : 'pointer', padding: 0 }}>
                {/* the common starter egg — its own sand shell, not the buddy's colour (that
                    would give the surprise away), and matching the wash behind it. No `color`
                    prop here (rarity="common" already resolves it via eggColorFor) — passing
                    one anyway used to trip EggShape's painted-image guard and drop the
                    cracking egg back to the flat CSS shell mid-hatch. */}
                {eggPhase === 'cracking' && gradualCrack
                  ? <CrackingEgg size={132} rarity="common" />
                  : <EggShape size={132} rarity="common" />}
              </button>
            </div>

            <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: 0, color: THEME.fg1 }}>{L('Your first buddy!')}</h2>
            <p style={{ fontSize: 14.5, color: THEME.fg2, lineHeight: 1.5, margin: '8px 0 0', maxWidth: 260 }}>{L('Someone is waiting inside. Hatch the egg to meet them.')}</p>

            <button data-sfx="off" onClick={eggPhase === 'cracking' ? undefined : crackEgg} disabled={eggPhase === 'cracking'} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, background: '#fff', boxShadow: THEME.shadowCard, borderRadius: 999, padding: '8px 15px', fontSize: 13, fontWeight: 800, color: THEME.fg2, opacity: eggPhase === 'cracking' ? .85 : 1, border: 'none', fontFamily: 'inherit', cursor: eggPhase === 'cracking' ? 'default' : 'pointer' }}>
              <Icon name={eggPhase === 'cracking' ? 'hourglass' : 'pointer'} size={15} color={shade(STARTER_EGG_C, -18)} stroke={2.3} className={eggPhase === 'cracking' ? 'jx-pulse-soft' : undefined} />{L(eggPhase === 'cracking' ? 'Hatching…' : 'Tap the egg to hatch')}
            </button>

            {/* shake affordance — parked at the bottom, same as the Shop's */}
            {eggShake && eggPhase !== 'cracking' && (
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <span className="jx-wiggle" style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: shade(STARTER_EGG_C, 74), alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="vibrate" size={28} color={shade(STARTER_EGG_C, -18)} stroke={2.3} />
                </span>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Shake to hatch too')}</div>
                <div style={{ fontSize: 12.5, color: THEME.fg2 }}>{L('Give your phone a little shake')}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 3e · hatched — congrats reveal */}
      {step === HATCH_STEP && charReveal && eggPhase === 'reveal' && !permsPhase && (
        <>
          {/* reveal carries the same painted backdrop as the waiting egg screen — the scene
              shouldn't swap out from under the buddy the moment it appears. Falls back to the
              starter egg's own sand wash if that tier has no painted art. */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, ...(EGG_HATCH_BG.common
            ? { backgroundImage: `url(${EGG_HATCH_BG.common})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: `radial-gradient(120% 80% at 50% 34%, ${shade(STARTER_EGG_C, 76)} 0%, ${shade(STARTER_EGG_C, 90)} 58%, #fff 100%)` }) }} />
          <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            {/* confetti burst raining from the top on reveal */}
            {[{ l: '18%', c: THEME.gold, d: 0, w: 7, h: 11 }, { l: '30%', c: THEME.primary, d: .12, w: 8, h: 8 }, { l: '44%', c: THEME.heart, d: .04, w: 6, h: 12 }, { l: '56%', c: THEME.camping, d: .18, w: 9, h: 9 }, { l: '68%', c: THEME.gold, d: .08, w: 7, h: 11 }, { l: '80%', c: THEME.success, d: .22, w: 6, h: 10 }, { l: '24%', c: THEME.primary, d: .3, w: 6, h: 6 }, { l: '74%', c: THEME.heart, d: .26, w: 7, h: 7 }].map((p, i) => (
              <div key={`cf${i}`} className="jx-confetti" style={{ position: 'absolute', top: '8%', left: p.l, width: p.w, height: p.h, borderRadius: i % 2 ? 999 : 2, background: p.c, animationDelay: `${p.d}s` }} />
            ))}

            {/* twinkling sparkles, staggered */}
            {[{ t: '20%', l: '20%', s: 20, d: 0 }, { t: '16%', l: '76%', s: 15, d: .5 }, { t: '44%', l: '84%', s: 12, d: 1 }, { t: '46%', l: '12%', s: 13, d: .3 }, { t: '12%', l: '48%', s: 12, d: .8 }].map((p, i) => (
              <Icon key={i} name="sparkles" size={p.s} color={i % 2 ? THEME.gold : THEME.primary} fill={i % 2 ? THEME.gold : THEME.primary} stroke={0} className="jx-twinkle" style={{ position: 'absolute', top: p.t, left: p.l, animationDelay: `${p.d}s` }} />
            ))}

            {/* The pill announcing the hatch. It wears the starter egg's own sand tone so the
                whole reveal stays one colour — the buddy's own hue could be anything (green,
                blue, …) and would fight the sand wash. */}
            <div className="jx-drop-in" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: shade(STARTER_EGG_C, 78), color: shade(STARTER_EGG_C, -40), borderRadius: 999, padding: '6px 13px', fontSize: 12.5, fontWeight: 800, letterSpacing: .3, position: 'relative', marginBottom: 12 }}>
              {/* paw-print, not an egg — the egg just cracked open on screen, so it would repeat
                  itself; the paw is the product's "buddy" glyph, tinted to the sand wash */}
              <Icon name="paw-print" size={14} color={shade(STARTER_EGG_C, -40)} stroke={2.4} />
              {L('New buddy!')}
            </div>
            <div className="jx-gift-pop" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* soft standing glow — sand, matching the wash, not the buddy's own colour */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: `radial-gradient(circle, ${shade(STARTER_EGG_C, 74)} 0%, rgba(255,255,255,0) 68%)`, zIndex: 0 }} />
              {/* one-shot burst ring — flares out from the character's center */}
              <div className="jx-burst" style={{ position: 'absolute', top: '50%', left: '50%', width: 210, height: 210, borderRadius: 999, border: `3px solid ${STARTER_EGG_C}`, opacity: 0, zIndex: 0 }} />
              {/* cracked shell halves under the buddy's feet — it just came out, wearing the
                  starter egg's own sand shell */}
              <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 14, zIndex: 1 }}>
                <EggHalf color={STARTER_EGG_C} />
                <EggHalf color={STARTER_EGG_C} flip />
              </div>
              <div className="jx-float" style={{ position: 'relative', zIndex: 2 }}><Mascot species={b.species} stage={b.stage} color={b.color} size={188} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, position: 'relative', marginTop: 8 }}>
              {/* dark ink even over the painted backdrop, same call as EggHatch.jsx's
                  reveal — a soft white halo instead of a dark drop-shadow keeps it legible
                  without going white-on-white against the paler scenes */}
              <h1 className="game-font" style={{ fontSize: 30, fontWeight: 500, margin: 0, color: THEME.fg1, textShadow: EGG_HATCH_BG.common ? '0 1px 3px rgba(255,255,255,.8), 0 0 14px rgba(255,255,255,.6)' : 'none' }}>{b.name}</h1>
              <Badge variant={b.rarity === 'epic' ? 'epic' : b.rarity === 'rare' ? 'primary' : 'default'}>{L(b.rarity === 'epic' ? 'Epic' : b.rarity === 'rare' ? 'Rare' : 'Common')}</Badge>
            </div>
            <p style={{ fontSize: 15, color: THEME.fg2, textShadow: EGG_HATCH_BG.common ? '0 1px 3px rgba(255,255,255,.8), 0 0 12px rgba(255,255,255,.6)' : 'none', lineHeight: 1.5, margin: '10px 0 0', position: 'relative' }}>{L('Walk safely with your parent to grow your buddy together.')}</p>

            {/* CTA — a round close button sitting right under the content, exactly the
                Shop/EggHatch reveal's system pattern (EggHatch.jsx) — not a full-width bar
                pinned to the screen edge. aria-label carries the real action since the icon
                alone doesn't say it. */}
            <button onClick={() => setPermsPhase(true)} className="jx-press" aria-label={L("Let's go")} style={{ marginTop: 22, width: 40, height: 40, flexShrink: 0, border: 'none', cursor: 'pointer', background: `${shade(STARTER_EGG_C, -22)}b3`, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none', position: 'relative' }}>
              <Icon name="x" size={18} color="#fff" stroke={2.6} />
            </button>
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
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={grantActive}>{L('Go to settings')}</Button>
            {/* declining is a real choice — it drops the card to the limited state (F-26) */}
            <button onClick={denyActive} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Not now')}</button>
          </div>
        </div>
      )}

      {/* permission-denied fallback (F-26) — instead of hard-blocking, spell out
          exactly which protections drop and let the child continue in limited mode.
          Warnings, vibration and notifications still work for the granted ones. */}
      {showFallback && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div onClick={() => setShowFallback(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
          <div className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 24px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
            <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <div style={{ width: 62, height: 62, borderRadius: 999, background: THEME.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="shield-alert" size={30} color={THEME.warning} stroke={2.2} />
              </div>
            </div>
            <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '0 8px 8px', lineHeight: 1.2, textAlign: 'center' }}>{L('Protection will be limited')}</h1>
            <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, margin: '0 2px 15px', textAlign: 'center' }}>{L('Without these, JoanX keeps running — but some warnings won’t work. You can turn them on anytime in Settings.')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, textAlign: 'left' }}>
              {perms.filter(p => !grants[p.id]).map(p => (
                <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: THEME.warningLight, borderRadius: 12, padding: '11px 13px' }}>
                  <Icon name={p.icon} size={17} color={THEME.warning} stroke={2.1} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg1 }}>{L(p.name)}</div>
                    <div style={{ fontSize: 12, color: THEME.warning, fontWeight: 600, lineHeight: 1.4, marginTop: 1 }}>{L(p.warn)}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" fullWidth style={pBrandBtn} onClick={() => setShowFallback(false)}>{L('Go back & allow')}</Button>
            <button onClick={() => { perms.forEach(p => { if (!grants[p.id]) deny(p.id); }); setShowFallback(false); finish(); }} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Continue with limited protection')}</button>
          </div>
        </div>
      )}
    </div>
  );
}

export { Onboarding };
