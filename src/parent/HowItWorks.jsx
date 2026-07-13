// JoanX — parent app · HowItWorks (scroll-story)

import React from 'react';
import { CHARACTERS, INTERVENTION, PARENT_METRICS, REACTIONS_7D, RISK_TREND, interventionMessages, visibleCharacters } from '../core/data.jsx';
import { Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot } from '../core/characters.jsx';

// ── "How JoanX works" — the parent's decision screen ─────────────────
// A full-screen scroll-story that rises over whatever is on screen: scroll the argument,
// with a CTA that never leaves, and the decision at the end.
//
// Why it exists: the parent has to agree to put this on their child's phone, and that
// decision used to rest on two sentences in ParentOnboarding. This screen earns it, and
// argues in the order a parent actually doubts:
//   does it work → why does my child accept it → what happens on their phone →
//   what do I see → what does it never do → what is coming.
//
// A note on the skin: this is a dark, violet, glowing surface — deliberately unlike the
// rest of the app, because it is a pitch, not a tool. It stays inside JoanX's iris ramp
// (rEpic #7f63c5 / svcPurple #603fab) so it is a different *mood*, not a different brand.
//
// A note on the proof: every number here comes from the app's own data — PARENT_METRICS,
// RISK_TREND, REACTIONS_7D, INTERVENTION. The reference this is modelled on leans on
// market statistics and five-star testimonials; there are none here, because JoanX has no
// pilot results yet and inventing parent reviews for a child-safety product is the one
// thing that would make this screen worse than the two sentences it replaces. The
// "reviews" section is instead the buddy's real message lines (INTERVENTION.messages) —
// same visual beat, nothing made up.

// ── palette ──
// Two skins, both dark: `iris` (the original violet mood) and `forest`, which carries the
// product's brand green onto the pitch surface so the story and the app read as one thing.
// Everything violet in here is a token, not a literal, so a third skin is one more entry.
const STORY_THEMES = {
  iris: {
    ink: '#0f0b22',
    bg: 'radial-gradient(120% 80% at 50% 0%, #2c2358 0%, #1a1338 46%, #0f0b22 100%)',
    planBg: 'radial-gradient(120% 70% at 50% 0%, #3a2a6e 0%, #241a4a 42%, #0f0b22 100%)',
    accent: '#a78bf5',        // lifted rEpic — readable on the dark
    accentDeep: '#7f63c5',    // THEME.rEpic
    soft: 'rgba(167,139,245,.18)',
    line: 'rgba(167,139,245,.35)',
    glow: 'rgba(167,139,245,.55)',
    grad: 'linear-gradient(180deg,#c4a9ff,#7f63c5)',
    cta: 'linear-gradient(90deg, #8f6fe0 0%, #b06fd6 25%, #d06fc0 50%, #b06fd6 75%, #8f6fe0 100%)',
    ctaGlow: 'rgba(167,139,245,.62)', ctaGlowSoft: 'rgba(167,139,245,.38)',
  },
  // brand green (THEME.brand #4B814F), lifted so it reads on a dark surface
  forest: {
    ink: '#08160d',
    bg: 'radial-gradient(120% 80% at 50% 0%, #1d4029 0%, #12291a 46%, #08160d 100%)',
    planBg: 'radial-gradient(120% 70% at 50% 0%, #275735 0%, #163521 42%, #08160d 100%)',
    accent: '#86cf92',
    accentDeep: '#4b814f',
    soft: 'rgba(134,207,146,.18)',
    line: 'rgba(134,207,146,.35)',
    glow: 'rgba(134,207,146,.55)',
    grad: 'linear-gradient(180deg,#b6e8bf,#4b814f)',
    cta: 'linear-gradient(90deg, #3c7448 0%, #4f9a5f 25%, #86cf92 50%, #4f9a5f 75%, #3c7448 100%)',
    ctaGlow: 'rgba(134,207,146,.55)', ctaGlowSoft: 'rgba(134,207,146,.32)',
  },
};
const STORY_THEMES_LIST = [{ id: 'iris', label: 'Iris' }, { id: 'forest', label: 'Forest' }];

// The live palette. Sub-components read it at render, and HowItWorks stamps the active skin
// into it before rendering — the same trick Mascot uses with the character style.
const V = {
  ...STORY_THEMES.iris,
  card: 'rgba(255,255,255,.055)',
  cardLine: 'rgba(255,255,255,.09)',
  fg: '#ffffff',
  fg2: 'rgba(255,255,255,.62)',
  fg3: 'rgba(255,255,255,.38)',
};
const GUTTER = 22;

const Card = ({ children, style }) => (
  <div style={{ background: V.card, border: `1px solid ${V.cardLine}`, borderRadius: 20, padding: 16, ...style }}>{children}</div>
);

// the reference's signature: a small violet pill posing the question the section answers
const Chip = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'center' }}>
    <span style={{ display: 'inline-flex', alignItems: 'center', background: V.soft, border: `1px solid ${V.line}`, color: V.accent, fontSize: 12, fontWeight: 800, padding: '7px 13px', borderRadius: 999 }}>
      {children}
    </span>
  </div>
);

const Title = ({ children }) => (
  // textWrap:'balance' — otherwise a long Korean headline fills line 1 and drops one orphan
  // word ("…내려놓습니다. / 다.") onto line 2. Balance evens the lines out instead.
  <h2 className="game-font" style={{ fontSize: 25, fontWeight: 500, lineHeight: 1.34, color: V.fg, textAlign: 'center', margin: '14px 0 0', textWrap: 'balance' }}>{children}</h2>
);

const Sub = ({ children }) => (
  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: V.fg2, textAlign: 'center', margin: '10px 0 0' }}>{children}</p>
);

function Section({ chip, title, sub, children }) {
  return (
    <div className="jx-reveal" style={{ padding: `36px ${GUTTER}px 8px` }}>
      {chip && <Chip>{chip}</Chip>}
      {title && <Title>{title}</Title>}
      {sub && <Sub>{sub}</Sub>}
      {children && <div style={{ marginTop: 20 }}>{children}</div>}
    </div>
  );
}

// ── the reference's hero: mascot with graphic props floating around it ──
function HeroArt({ buddy }) {
  const props = [
    { icon: 'shield-check', top: '4%', left: '6%', d: '0s' },
    { icon: 'footprints', top: '0%', right: '8%', d: '.5s' },
    { icon: 'sparkles', bottom: '18%', left: '0%', d: '1s' },
    { icon: 'heart', bottom: '10%', right: '2%', d: '1.4s' },
  ];
  return (
    <div style={{ position: 'relative', width: 240, height: 190, margin: '0 auto' }}>
      {/* the glow the buddy stands in */}
      <div style={{ position: 'absolute', inset: '12% 14%', borderRadius: 999, background: `radial-gradient(circle, ${V.glow} 0%, transparent 68%)`, filter: 'blur(10px)' }} />
      {props.map((p, i) => (
        <div key={i} className="jx-float" style={{ position: 'absolute', top: p.top, left: p.left, right: p.right, bottom: p.bottom, animationDelay: p.d, width: 38, height: 38, borderRadius: 12, background: V.soft, border: `1px solid ${V.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <Icon name={p.icon} size={18} color={V.accent} stroke={2.2} />
        </div>
      ))}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Mascot species={buddy.species} stage={buddy.stage} color={buddy.color} size={140} />
      </div>
    </div>
  );
}

// ── the reference's comparison bars: first week vs now ──
function CompareBars() {
  const first = RISK_TREND[0];
  const now = RISK_TREND[RISK_TREND.length - 1];
  const bars = [
    { v: first, l: L('First week'), on: false },
    { v: now, l: L('Now'), on: true },
  ];
  return (
    <Card style={{ padding: '22px 18px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 34, height: 168 }}>
        {bars.map((b, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 84 }}>
            <span className="game-font" style={{ fontSize: 20, fontWeight: 500, color: b.on ? V.fg : V.fg3 }}>{b.v}{L('x')}</span>
            <div style={{ width: '100%', height: `${(b.v / first) * 108}px`, borderRadius: 12,
              background: b.on ? V.grad : 'rgba(255,255,255,.12)',
              boxShadow: b.on ? `0 0 26px ${V.glow}` : 'none', transition: 'height .6s' }} />
            <span style={{ fontSize: 11.5, fontWeight: 700, color: b.on ? V.accent : V.fg3 }}>{b.l}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: V.fg3, textAlign: 'center', marginTop: 12 }}>
        {L('Risky moments per week, since setup.')}
      </div>
    </Card>
  );
}

// ── the reference's "7 out of 10 people" row — here it is 10 warnings, not 10 people ──
function OutOfTen() {
  const n = Math.round(PARENT_METRICS.acceptance / 10);   // 88% → 9 of 10
  return (
    <Card style={{ padding: '20px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 14 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <Icon key={i} name="hand" size={22} color={i < n ? V.accent : 'rgba(255,255,255,.16)'} stroke={2.2}
                fill={i < n ? V.accent : 'transparent'} />
        ))}
      </div>
      <div style={{ fontSize: 12.5, color: V.fg2, textAlign: 'center', lineHeight: 1.6 }}>
        {L('Out of every 10 warnings, this many end with the child stopping.')}
      </div>
    </Card>
  );
}

// ── the reference's review bubbles — the buddy's real lines, not invented testimonials ──
function BuddyLines() {
  const rows = [
    { tier: 1, tone: THEME.success, label: L('Gentle') },
    { tier: 2, tone: THEME.warning, label: L('Firm') },
    { tier: 3, tone: THEME.danger, label: L('Urgent') },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {rows.map((r, i) => {
        const line = interventionMessages(r.tier)[0];
        return (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: i * 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: r.tone, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="game-font" style={{ fontSize: 16, fontWeight: 500, color: V.fg }}>{L(line)}</div>
              <div style={{ fontSize: 11, color: V.fg3, marginTop: 2, fontWeight: 700 }}>{L('Round')} {r.tier} · {r.label}</div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ── the reference's year timeline ──
const ROADMAP = [
  { y: '2026', t: 'Safe-walk detection, staged warnings, weekly reports' },
  { y: '2026', t: 'Buddy collection, eggs, battles' },
  { y: '2027', t: 'Friends, room visits, guestbook' },
  { y: '2027', t: 'AI weekly summary for parents' },
];

// ── monthly update notes (the reference's patch-note wall) ──
// Prototype content: these stand in for a real release feed. Wire to the changelog when
// there is one — the shape is No. + title + a thumbnail tile.
const UPDATES = [
  { n: 86, t: 'Guestbook moved to the Friends tab', icon: 'book-heart', from: '#8f6fe0', to: '#c4a9ff' },
  { n: 85, t: 'Two new buddies joined the dex', icon: 'egg', from: '#d06fc0', to: '#f0a8dd' },
  { n: 84, t: 'Warnings got a calmer, clearer look', icon: 'shield-check', from: '#6f8fe0', to: '#a9c4ff' },
  { n: 83, t: 'Weekly report loads twice as fast', icon: 'zap', from: '#7f63c5', to: '#b09ae8' },
  { n: 82, t: 'Battle rewards rebalanced', icon: 'swords', from: '#c58f63', to: '#e8c49a' },
];

// ── PLANS · PLACEHOLDER — NOT A DECIDED PRICE ────────────────────────────────
// Nothing in the functional spec defines tiers, prices, or what is free vs paid. These
// numbers exist so the paywall *layout* can be reviewed; they are not a business model and
// must not be shipped or quoted as one. Replace every value here once pricing is decided.
const TRIAL_DAYS = 7;
const PLANS = [
  { id: 'y1', months: 12, off: 58, was: '119,880', now: '49,900', per: '4,158', popular: true, note: 'Best value' },
  { id: 'y2', months: 12, off: 42, was: '119,880', now: '69,900', per: '5,825' },
  { id: 'm1', months: 1, off: 0, was: null, now: '9,900', per: '9,900' },
];

const NEVER = [
  { icon: 'lock-open', t: 'It never locks the phone', s: 'The screen is never blocked. JoanX can only get more insistent.' },
  { icon: 'message-square-off', t: 'There is no chat', s: 'No messaging between children — visits, likes, and guestbook notes.' },
  { icon: 'eye-off', t: 'You do not watch them live', s: 'No live feed, no location trail. A calm weekly summary.' },
];

function HowItWorks({ onClose, onStart, theme = 'iris' }) {
  Object.assign(V, STORY_THEMES[theme] || STORY_THEMES.iris);   // stamp the active skin
  const buddy = CHARACTERS.find(c => c.owned) || CHARACTERS[0];
  const roster = (visibleCharacters ? visibleCharacters() : CHARACTERS).length;
  const scroller = React.useRef(null);
  const endRef = React.useRef(null);          // sentinel at the foot of the story
  const [scrolled, setScrolled] = React.useState(false);
  const [plan, setPlan] = React.useState(PLANS[0].id);
  // The subscription is a *popup*, not more scroll. The story ends at the update wall; when
  // the reader reaches the foot of it, the plans rise over the story as their own page. Once
  // it has been dismissed it does not ambush them again — the footer CTA reopens it.
  const [showPlans, setShowPlans] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);

  // Reveal each section as it arrives. Observed against the scroller, not the window —
  // this modal owns its overflow, so the viewport is the wrong root. Unobserve after the
  // first hit: content that re-animates every time it scrolls back is a fidget, not a reveal.
  React.useEffect(() => {
    const root = scroller.current;
    if (!root) return undefined;
    const targets = root.querySelectorAll('.jx-reveal');
    if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('in')); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { root, rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(el => io.observe(el));

    return () => io.disconnect();
  }, []);

  // The plans popup is earned, not sprung. Reaching the end of the story is not enough — the
  // reader gets to sit there and finish reading the last section. Only if they then *keep*
  // scrolling (an overscroll pull past the bottom) does the subscription page rise. That is
  // the "one more page down" gesture they already have in their thumb, and it means the popup
  // is always something they asked for.
  const atBottom = React.useRef(false);
  const pull = React.useRef(0);
  const PULL_TO_OPEN = 90;   // px of scrolling *at* the bottom before the plans open

  const onScroll = (e) => {
    const el = e.currentTarget;
    setScrolled(el.scrollTop > 40);
    const bottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 24;
    if (!bottom) pull.current = 0;    // wandered back up — the pull has to be earned again
    atBottom.current = bottom;
  };

  // wheel (desktop) and touch drag (device) both count as "still scrolling down"
  const addPull = (dy) => {
    if (!atBottom.current || dismissed || showPlans || dy <= 0) return;
    pull.current += dy;
    if (pull.current >= PULL_TO_OPEN) { pull.current = 0; setShowPlans(true); }
  };
  const touchY = React.useRef(0);
  const onWheel = (e) => addPull(e.deltaY);
  const onTouchStart = (e) => { touchY.current = e.touches[0].clientY; };
  const onTouchMove = (e) => {
    const y = e.touches[0].clientY;
    addPull(touchY.current - y);   // finger moving up = scrolling down
    touchY.current = y;
  };

  const openPlans = () => setShowPlans(true);
  const closePlans = () => { setShowPlans(false); setDismissed(true); };

  return (
    <div className="jx-sheet-up" style={{ position: 'absolute', inset: 0, zIndex: 95, background: V.ink, display: 'flex', flexDirection: 'column' }}>
      <button onClick={onClose} aria-label={L('Close')} style={{ position: 'absolute', top: 56, right: 16, zIndex: 3, width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.09)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        <Icon name="x" size={18} color="#fff" stroke={2.4} />
      </button>

      <div ref={scroller} className="no-sb jx-story" onScroll={onScroll} onWheel={onWheel} onTouchStart={onTouchStart} onTouchMove={onTouchMove}
           style={{ flex: 1, overflowY: 'auto', background: V.bg, paddingTop: 54 }}>

        {/* ── HERO ── */}
        <div style={{ padding: `18px ${GUTTER}px 0`, textAlign: 'center' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: V.accent, letterSpacing: .4 }}>{L('How JoanX works')}</div>
          <h1 className="game-font" style={{ fontSize: 27, fontWeight: 500, lineHeight: 1.3, color: V.fg, margin: '10px 0 18px', textWrap: 'balance' }}>
            {L('Your child puts the phone down — because they want to.')}
          </h1>
          <HeroArt buddy={buddy} />
          <Sub>{L('No lock screens, no nagging. A buddy that grows every minute they walk safely.')}</Sub>
          <div className="jx-nudge" style={{ display: 'flex', justifyContent: 'center', marginTop: 16, opacity: scrolled ? 0 : 1, transition: 'opacity .3s' }}>
            <Icon name="chevrons-down" size={24} color={V.accent} stroke={2.4} />
          </div>

          {/* the reference's stacked feature cards under the hero */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20, textAlign: 'left' }}>
            {[
              { t: L('Every safe minute earns points'), s: L('Phone down while walking → points, XP, a growing buddy.') },
              { t: `${roster}${L(' buddies to hatch and collect')}`, s: L('Points buy eggs. The rarest buddies take real streaks.') },
              { t: L('Friends, without a chat app'), s: L('Room visits, likes, guestbook notes. That is the whole social layer.') },
            ].map((r, i) => (
              <Card key={i}>
                <div style={{ fontSize: 14.5, fontWeight: 800, color: V.fg }}>{r.t}</div>
                <div style={{ fontSize: 12.5, color: V.fg2, marginTop: 4, lineHeight: 1.5 }}>{r.s}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* ── 1 · DOES IT WORK ── */}
        <Section chip={L('Does it actually work?')} title={`${L('Risky moments drop by')} ${PARENT_METRICS.riskReduction}%`}
                 sub={L('Compared with the first week after setup.')}>
          <CompareBars />
        </Section>

        {/* ── 2 · DOES THE CHILD ACTUALLY STOP ── */}
        <Section chip={L('Do they actually stop?')} title={`${Math.round(PARENT_METRICS.acceptance / 10)}${L(' out of 10 warnings end with a stop')}`}
                 sub={`${L('And on average it takes')} ${PARENT_METRICS.avgResponse}${L('s from the first buzz.')}`}>
          <OutOfTen />
        </Section>

        {/* ── 3 · WHAT HAPPENS ON THEIR PHONE ── */}
        <Section chip={L('What happens on their phone?')} title={L('One buzz. Then a word from the buddy. Never a locked screen.')}>
          <Card>
            {[
              { n: '1', t: L('A gentle buzz'), s: `${INTERVENTION.graceSeconds}${L('s to catch yourself first — then one vibration.')}` },
              { n: '2', t: L('A short warning'), s: L('Only if they are still walking and still on the phone.') },
              { n: '3', t: L('The buddy speaks up'), s: L('A firmer nudge each round — tone only, never a block.') },
            ].map((r, i, a) => (
              <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < a.length - 1 ? 14 : 0, marginBottom: i < a.length - 1 ? 14 : 0, borderBottom: i < a.length - 1 ? `1px solid ${V.cardLine}` : 'none' }}>
                <div className="game-font" style={{ width: 26, height: 26, borderRadius: 999, background: V.grad, color: '#fff', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: V.fg }}>{r.t}</div>
                  <div style={{ fontSize: 12.5, color: V.fg2, marginTop: 2, lineHeight: 1.5 }}>{r.s}</div>
                </div>
              </div>
            ))}
          </Card>
        </Section>

        {/* ── 4 · WHAT THE BUDDY ACTUALLY SAYS (the reference's review wall) ── */}
        <Section chip={L('What does it actually say?')} title={L('It gets firmer. It never gets mean.')}>
          <BuddyLines />
        </Section>

        {/* ── 5 · WHAT IT NEVER DOES ── */}
        <Section chip={L('And what it never does')} title={L('Guidance, not surveillance.')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {NEVER.map((r, i) => (
              <Card key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: V.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={r.icon} size={18} color={V.accent} stroke={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: V.fg }}>{L(r.t)}</div>
                  <div style={{ fontSize: 12.5, color: V.fg2, marginTop: 3, lineHeight: 1.5 }}>{L(r.s)}</div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── 6 · ROADMAP (the reference's year timeline) ── */}
        <Section chip={L('What is coming')} title={L('JoanX keeps growing with your child.')}>
          {/* Centred on the page, year gutter → glowing node → label, like the reference.
              Each row is its own reveal target with a stagger, so the timeline draws itself
              as you scroll instead of arriving all at once. */}
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            {ROADMAP.map((r, i) => (
              <div key={i} className="jx-reveal" style={{ transitionDelay: `${i * 150}ms`, display: 'grid', gridTemplateColumns: '54px 18px 1fr', columnGap: 12, alignItems: 'start' }}>
                <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: V.fg3, textAlign: 'right', paddingTop: 1 }}>{r.y}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', alignSelf: 'stretch' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: V.accent, boxShadow: `0 0 12px ${V.glow}`, flexShrink: 0, marginTop: 5 }} />
                  {i < ROADMAP.length - 1 && <span style={{ flex: 1, width: 2, background: `linear-gradient(180deg, ${V.glow}, transparent)` }} />}
                </div>
                <div style={{ paddingBottom: 22 }}>
                  <div style={{ fontSize: 13.5, color: V.fg, lineHeight: 1.5 }}>{L(r.t)}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 7 · MONTHLY UPDATES (the reference's patch-note wall) ── */}
        <Section chip={L('Every month')} title={L('JoanX keeps getting better.')}
                 sub={L('A steady stream of small improvements — here are the latest.')}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {UPDATES.map((u, i) => (
              <div key={u.n} className="jx-reveal" style={{ transitionDelay: `${i * 90}ms`, display: 'flex', alignItems: 'center', gap: 12, background: V.card, border: `1px solid ${V.cardLine}`, borderRadius: 16, padding: '10px 12px' }}>
                <span className="game-font" style={{ fontSize: 11.5, fontWeight: 500, color: V.fg3, flexShrink: 0 }}>No.{u.n}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: V.fg, lineHeight: 1.4 }}>{L(u.t)}</span>
                {/* the reference's thumbnail tile — a graphic chip, not a photo */}
                <span style={{ width: 46, height: 34, borderRadius: 9, flexShrink: 0, background: `linear-gradient(135deg, ${u.from}, ${u.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={u.icon} size={17} color="#fff" stroke={2.2} />
                </span>
              </div>
            ))}
          </div>
          {/* "더 알아보기" + the arrow — rises in from below as it is reached (.jx-reveal),
              then keeps nudging downward to say the page is still going. */}
          {/* This says "see more" and points down, so it must *be* the way through. The pull
              gesture still works, but it is a gesture nobody announced — a reader who does not
              overscroll would otherwise never find the plans at all. */}
          <button onClick={openPlans} className="jx-reveal" style={{ transitionDelay: '480ms', display: 'block', width: '100%', marginTop: 22, padding: '6px 0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: V.accent }}>{L('See more')}</div>
            <div className="jx-nudge" style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
              <Icon name="chevrons-down" size={24} color={V.accent} stroke={2.4} />
            </div>
          </button>
        </Section>

        {/* the tail of the story — enough room to clear the sticky CTA and to make reaching
            the bottom (where the plans popup waits) a deliberate scroll, not a nudge */}
        <div ref={endRef} style={{ height: 132 }} />

      </div>


      {/* ── SUBSCRIPTION — its own popup over the story (prices are placeholders; see PLANS).
          It rises when the reader reaches the foot of the story, carries its own surface and
          close button, and does not reopen itself once dismissed. ── */}
      {showPlans && (
        <div className="jx-sheet-up" style={{ position: 'absolute', inset: 0, zIndex: 96, display: 'flex', flexDirection: 'column', background: V.planBg }}>
          <button onClick={closePlans} aria-label={L('Close')} style={{ position: 'absolute', top: 56, right: 16, zIndex: 3, width: 34, height: 34, borderRadius: 999, border: '1px solid rgba(255,255,255,.16)', background: 'rgba(255,255,255,.09)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Icon name="x" size={18} color="#fff" stroke={2.4} />
          </button>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', paddingTop: 54 }}>
          <div style={{ padding: `28px ${GUTTER}px 132px`, textAlign: 'center' }}>
          <HeroArt buddy={buddy} />
          <h2 className="game-font" style={{ fontSize: 26, fontWeight: 500, lineHeight: 1.3, color: V.fg, margin: '10px 0 0', textWrap: 'balance' }}>
            {TRIAL_DAYS}{L('-day free trial, no strings.')}
          </h2>
          <Sub>{L('Try it, then decide. Cancel any time before it ends.')}</Sub>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: V.accent, margin: '14px 0 4px' }}>
            {L('Cancel before the trial ends and you are never charged.')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, textAlign: 'left' }}>
            {PLANS.map((pl) => {
              const on = plan === pl.id;
              return (
                <button key={pl.id} onClick={() => setPlan(pl.id)} style={{
                  position: 'relative', width: '100%', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 15px', borderRadius: 18,
                  background: on ? 'rgba(167,139,245,.14)' : V.card,
                  border: `1.5px solid ${on ? V.accent : V.cardLine}`,
                  transition: 'background .2s, border-color .2s',
                }}>
                  <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, border: `2px solid ${on ? V.accent : 'rgba(255,255,255,.28)'}`, background: on ? V.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {on && <Icon name="check" size={13} color="#fff" stroke={3} />}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: V.fg }}>{pl.months}{L('mo')}</span>
                      {pl.off > 0 && (
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', background: V.accentDeep, padding: '2px 7px', borderRadius: 6 }}>{pl.off}%</span>
                      )}
                    </span>
                    {pl.was && (
                      <span style={{ display: 'block', fontSize: 11.5, color: V.fg3, marginTop: 3 }}>
                        <s>₩{pl.was}</s> → ₩{pl.now}
                      </span>
                    )}
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className="game-font" style={{ display: 'block', fontSize: 16, fontWeight: 500, color: V.fg }}>₩{pl.per}</span>
                    <span style={{ fontSize: 11, color: V.fg3 }}>/{L('mo')}</span>
                  </span>
                  {pl.popular && (
                    <span style={{ position: 'absolute', top: -9, right: 12, fontSize: 10.5, fontWeight: 800, color: '#fff', background: V.grad, padding: '3px 9px', borderRadius: 999 }}>{L('Popular')}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 11.5, color: V.fg3, marginTop: 14 }}>
            <Icon name="info" size={13} color={V.fg3} stroke={2.2} />
            {L('Cancel any time in the App Store.')}
          </div>
          <div style={{ fontSize: 12, color: V.fg3, marginTop: 10 }}>{L('Takes about 3 minutes to set up.')}</div>
        </div>
          </div>
        </div>
      )}

      {/* sticky CTA — the reference's one constant. The glow is the point here: this is the
          pitch surface, not a tool surface, so the CTA is allowed to shine. */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 97, padding: `16px ${GUTTER}px calc(env(safe-area-inset-bottom) + 18px)`, background: `linear-gradient(180deg, rgba(15,11,34,0), ${V.ink} 34%)` }}>
        {/* the gradient drifts, a highlight sweeps across it, and it presses — see .jx-cta */}
        <button onClick={!showPlans && dismissed ? openPlans : onStart} className="jx-cta" style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '17px 22px', borderRadius: 20, color: '#fff', fontSize: 16, fontWeight: 800, backgroundImage: V.cta, '--jx-cta-glow': V.ctaGlow, '--jx-cta-glow-soft': V.ctaGlowSoft }}>
          <span>{showPlans ? `${TRIAL_DAYS}${L('-day free trial — start now')}` : dismissed ? L('See plans') : L('Set up on my child\'s phone')}</span>
          <Icon name="chevron-right" size={19} color="#fff" stroke={2.6} />
        </button>
      </div>
    </div>
  );
}

export { HowItWorks, STORY_THEMES_LIST };
