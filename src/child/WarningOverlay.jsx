// JoanX — child app · WarningOverlay

import React from 'react';
import { CHARACTERS, FEATURES, INTERVENTION, PLAYER, evaluateSafeStop, interventionMessages, interventionTier, logRiskEvent } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip } from '../core/characters.jsx';
import { Confetti } from './shared.jsx';

// Timings. Everything the spec pins down (the 2s hold, the message dwell, the gap between
// lines, the 5s cooldown) runs at full length and comes straight from INTERVENTION, which is
// where the pilot will retune them. Only the 10s grace window is demo-compressed, to keep the
// flow watchable.
const BUZZ_HOLD_MS = INTERVENTION.buzzHoldSeconds * 1000;   // F-08.1 — risk must persist 2s past the buzz
const MESSAGE_MS = INTERVENTION.messageSeconds * 1000;      // F-09 — how long one line stays up
const MESSAGE_GAP_MS = INTERVENTION.messageGapSeconds * 1000; // F-09 — minimum gap between lines
const SWAP_MS = Math.max(220, MESSAGE_GAP_MS - MESSAGE_MS);   // the beat it takes to swap one line for the next
const RECHECK_MS = INTERVENTION.recheckSeconds * 1000; // F-08.2 — 5s quiet cooldown, then re-assess
const SAFE_CONFIRM_MS = INTERVENTION.safeConfirmSeconds * 1000; // F-08.4 — safe must hold this long to remove the overlay
const REWARD_MS = 2800;   // the "Nice save!" payoff, before the overlay hands the screen back
const GRACE_MS = 2600;    // spec: INTERVENTION.graceSeconds (10s)
const IGNORE_MS = MESSAGE_GAP_MS * 2 + MESSAGE_MS;  // two unanswered messages = ignored

// F-12 — the bonus is not a tap, it is a verified sequence. These are the four conditions
// evaluateSafeStop() gates on, checked off in turn as detection confirms each (the prototype
// steps them on a timer; the shipped app fills them from real signals). Only when all four are
// green does the bonus land — so acknowledging the warning without actually stopping pays nothing.
const SAFE_CONDITIONS = ['Warning shown', 'Phone put away', 'Screen off', 'Walking safely'];
const VERIFY_STEP_MS = 560;   // each condition confirms in turn — the stand-in for detection

// The payoff. The child just looked up — so the buddy leads, not a system checkmark: this is
// the one beat in the whole intervention that belongs to the character. The check becomes a
// small badge on the buddy's shoulder, the stop time is stated as the thing it earned
// ("immediate stop"), and the points land as the headline number rather than a footnote pill.
// `result` comes from evaluateSafeStop(): { ok, reason, points }. A paid stop shows the buddy
// and the points; a farm-blocked stop (reason 'cooldown') still praises the safe behaviour but
// says plainly it was already counted — so the anti-farm guard is visible, not a silent nothing.
function RewardToast({ c, secs = 2.1, result }) {
  const paid = !!(result && result.ok);
  const pts = result ? result.points : 0;
  // spec #4 — a stop made BEFORE any warning ('immediate') is the behaviour we most want, so the
  // payoff names it as such and leads with a warmer headline than a stop that came after a warning.
  const early = result && result.outcome === 'immediate';
  const capped = result && result.reason === 'capped';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(43,41,38,.34)', zIndex: 5 }} className="jx-fade">
      {paid && <Confetti />}
      <div className="jx-pop" style={{ width: 268, background: '#fff', borderRadius: 26, padding: '22px 20px 20px', textAlign: 'center', boxShadow: THEME.shadowXl }}>

        {/* the buddy, with the check riding on it */}
        <div style={{ position: 'relative', width: 108, height: 108, margin: '0 auto 10px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: THEME.brandLight }} />
          <div className="jx-float" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {c && <Mascot species={c.species} stage={c.stage} color={c.color} size={98} />}
          </div>
          <span className="jx-pop" style={{ position: 'absolute', right: -2, bottom: 2, width: 34, height: 34, borderRadius: 999, background: THEME.success, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={17} color="#fff" stroke={3.2} />
          </span>
        </div>

        <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{early ? L('Looked up in time!') : L('Nice save!')}</div>

        {/* what the stop was worth, in the app's own words (F-12) — named by how early it came (spec #4) */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '5px 11px', borderRadius: 999, background: THEME.successLight, color: THEME.success, fontSize: 11.5, fontWeight: 800 }}>
          <Icon name="hand" size={13} color={THEME.success} stroke={2.4} />
          {secs}s · {early ? L('No warning needed') : L('Stopped after a warning')}
        </div>

        {paid ? (
          /* the points are the headline, not a footnote */
          <div style={{ marginTop: 14, borderRadius: 18, background: THEME.goldLight, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="star" size={22} color={THEME.gold} stroke={2.2} fill={THEME.gold} />
            <span className="game-font" style={{ fontSize: 26, fontWeight: 500, color: '#8a6600', lineHeight: 1 }}>+{pts}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#9e7300' }}>{L('points')}</span>
          </div>
        ) : (
          /* not paid: the stop is real and welcome, but either it's too soon after the last paid
             one (cooldown) or the day's reward is maxed (capped). Either way it still counts. */
          <div style={{ marginTop: 14, borderRadius: 18, background: THEME.surface2, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="check-circle" size={18} color={THEME.fg2} stroke={2.3} />
            <span style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg2, lineHeight: 1.3 }}>{capped ? L('Daily reward maxed — still counts!') : L('Already counted — keep it up!')}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// A compact stage stepper (F-08): vibration ▸ warning ▸ character-message.
// Adapts contrast to the backdrop (light for spotlight, else on-dim white).
function StageSteps({ stage, onLight }) {
  const steps = [{ ic: 'vibrate', l: 'Buzz' }, { ic: 'triangle-alert', l: 'Warning' }, { ic: 'message-circle', l: 'Message' }];
  const idleBg = onLight ? 'rgba(43,41,38,.10)' : 'rgba(255,255,255,.24)';
  const idleFg = onLight ? THEME.fg3 : 'rgba(255,255,255,.9)';
  const barOff = onLight ? 'rgba(43,41,38,.14)' : 'rgba(255,255,255,.3)';
  return (
    <div style={{ position: 'absolute', top: 58, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, zIndex: 4 }}>
      {steps.map((s, i) => {
        const on = i === stage, done = i < stage;
        return (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ width: 16, height: 2, borderRadius: 2, background: i <= stage ? THEME.brand : barOff, transition: 'background .3s' }} />}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, height: 24, padding: on ? '0 11px 0 8px' : '0', width: on ? 'auto' : 24, justifyContent: 'center', borderRadius: 999, background: on ? THEME.brand : (done ? THEME.brandLight : idleBg), transition: 'all .3s' }}>
              <Icon name={s.ic} size={12.5} color={on ? '#fff' : (done ? THEME.brand : idleFg)} stroke={2.4} />
              {on && <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{L(s.l)}</span>}
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// F-08.3 — round marker: an ignored warning returns firmer, and the child is told plainly
// that the repeat is being recorded (it feeds the reward system and the parent report).
function RoundBadge({ round, tier, inline }) {
  const urgent = tier.key === 'urgent';
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: inline ? 0 : 10 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: urgent ? THEME.dangerLight : THEME.warningLight, color: urgent ? THEME.danger : THEME.warning }}>
        <Icon name="triangle-alert" size={12} color={urgent ? THEME.danger : THEME.warning} stroke={2.4} />
        {L('Reminder')} {round} · {L('recorded in your report')}
      </span>
    </div>
  );
}

// F-09 — timed character message: a bottom toast (~20% height). The toast itself HOLDS for as
// long as the risk does — it is the surface carrying "I looked up", and a safety CTA that blinks
// out from under a child's thumb is worse than no CTA. What is timed is the *copy*: each line
// reads for MESSAGE_MS, then cross-fades to the next, with MESSAGE_GAP_MS between one line and
// the next so the same line can never return inside the minimum interval.
// (Fading the whole card on that cycle — mascot, copy and both buttons — is what made the step
// unreadable: a line was gone before it could be finished, and the buttons went with it.)
// Lines rotate through the tier's pool (never twice in a row) to blunt message fatigue,
// and each round starts at a different point in the pool so a repeat offender doesn't hear
// the same opening nudge every time.
// Tone tier → the toast's visual weight. The message step is the *last* thing the child
// sees before the round is logged, so it must not read lighter than the buzz and the
// warning that preceded it. Gentle stays calm; urgent gets the danger rail, the firmer
// copy, and the "this is being recorded" line (F-08.3) — which the sheet and spotlight
// variants already showed but the toast did not.
// The speech bubble is a warm off-white at every tier — neutral like a grey, but with warmth
// in it so it doesn't read as a system panel. The tone lives in the headline, the rail, and the
// round badge; tinting the bubble as well coloured the whole block and made the copy fight its
// own background instead of just being read.
const BUBBLE = '#F7F3EE';
const TOAST_TONE = {
  gentle: { rail: THEME.brand,   chip: THEME.brandLight,   ink: THEME.brandDark, bubble: BUBBLE },
  firm:   { rail: THEME.warning, chip: THEME.warningLight, ink: THEME.warning,  bubble: BUBBLE },
  urgent: { rail: THEME.danger,  chip: THEME.dangerLight,  ink: THEME.danger,   bubble: BUBBLE },
};

// Four message layouts, all built on the design-system tokens (DESIGN-SYSTEM.md §4/§5):
// card radius 20 · padding 16 · screen gutter 18 · shadowCard (hairline ring + whisper,
// "not a big floaty blur") · child-app CTAs render flat. Flip between them in Tweaks →
// Message style, the same way the home/collection/battle layout sets work.
const MSG_LAYOUTS = [
  { id: 'sheet',  label: 'Sheet' },
  { id: 'card',   label: 'Card' },
  { id: 'bubble', label: 'Bubble' },
  { id: 'hero',   label: 'Hero' },
  { id: 'row',    label: 'Row' },
];

// system card recipe + the tone rail, shared by every layout
const MSG_CARD = { background: THEME.surface, borderRadius: 20, boxShadow: THEME.shadowCard, width: '100%' };
const RAIL_H = 5;   // tone rail — clipped by the card, never drawn past its corners
const FLAT = { boxShadow: 'none' };   // child app renders filled CTAs flat (§5 Button)

// Every buddy in the 3D-cute line carries CUTE_BRAND (= THEME.brand, the JoanX magenta),
// so when that line is worn the ocean CTA is the only thing on screen not in the brand.
// Derive it from the buddy actually in play rather than a style flag: a buddy that carries
// the brand gets a brand-coloured action, anything else keeps ocean (the in-game action
// colour) — so the comic line is untouched.
// The safety CTA wears the brand green in every variant: this overlay is the product's own
// voice, not an in-game action, so the ocean primary would read as a stranger here.
const ctaStyle = () => ({ ...FLAT, background: THEME.brand });

function CharMessageToast({ c, round, tier, layout = 'sheet', hold, onRespond }) {
  const pool = interventionMessages(round);
  const [i, setI] = React.useState((round - 1) % pool.length);
  const [show, setShow] = React.useState(true);   // the LINE's opacity — the card behind it never leaves
  React.useEffect(() => {
    if (hold) return;              // Tweaks → Hold: the line on screen is the one being inspected
    if (pool.length < 2) return;   // nothing to rotate to: the one line simply stays
    const swaps = [];
    const iv = setInterval(() => {
      setShow(false);              // the line has had its read; fade it out...
      swaps.push(setTimeout(() => {
        setI(x => (x + 1) % pool.length);   // ...advance — never the line just shown...
        setShow(true);                      // ...and fade the next one in
      }, SWAP_MS));
    }, MESSAGE_GAP_MS);
    return () => { swaps.forEach(clearTimeout); clearInterval(iv); };
  }, [pool.length, hold]);

  const tone = TOAST_TONE[tier.key] || TOAST_TONE.gentle;
  const urgent = tier.key === 'urgent';
  const sub = urgent ? L(tier.body) : `${c.name} · ${L('still walking')}`;
  const ink = urgent ? THEME.danger : THEME.fg1;

  // The one thing that changes between lines. It carries the fade, so the card, the buddy and
  // the buttons under it stay put while the copy swaps — the child never loses the CTA mid-read.
  // Called, not mounted as <Line/>: a component declared in here is a new type on every render,
  // so React would remount the node and the opacity would jump instead of easing.
  const line = (size, subSize, gap) => (
    <div style={{ opacity: show ? 1 : 0, transform: show ? 'none' : 'translateY(3px)', transition: `opacity ${SWAP_MS}ms ease, transform ${SWAP_MS}ms ease` }}>
      <div className="game-font" style={{ fontSize: size, fontWeight: 500, lineHeight: 1.25, color: ink }}>{L(pool[i])}</div>
      <div style={{ fontSize: subSize, color: THEME.fg2, marginTop: gap, lineHeight: 1.4 }}>{sub}</div>
    </div>
  );

  const Rail = () => <div style={{ height: RAIL_H, background: tone.rail }} />;
  const Badge_ = () => round > 1 ? (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: tone.chip, color: tone.ink }}>
      <Icon name="triangle-alert" size={12} color={tone.ink} stroke={2.4} />
      {L('Reminder')} {round} · {L('recorded in your report')}
    </span>
  ) : null;
  // One button only: looking up is the child's single option, so the safe action stands
  // alone as the primary brand CTA — no competing dismiss.
  const Actions = () => (
    <div style={{ marginTop: 16 }}>
      <Button variant="primary" size="md" icon="check" fullWidth onClick={onRespond} style={ctaStyle()}>{L('I looked up')}</Button>
    </div>
  );

  const bodies = {
    // 0 · SHEET — the warning sheet's pattern, reused for the message stage: a bottom sheet
    // that rises over the dim, buddy on the left speaking into a bubble on the right, the lone
    // stop CTA, and a countdown of the window before the next
    // nudge. The child already learned this shape at the warning step, so the message step
    // costs them no new reading — only the copy changes.
    sheet: (
      <React.Fragment>
        <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 14px' }} />
        {round > 1 && <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Badge_ /></div>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={104} /></div>
          <div style={{ flex: 1, minWidth: 0, background: tone.bubble, borderRadius: '18px 18px 18px 4px', padding: '12px 14px', marginBottom: 8 }}>
            {line(19, 13, 4)}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant="primary" size="md" icon="check" fullWidth onClick={onRespond} style={ctaStyle()}>{L('I looked up')}</Button>
        </div>
        <div style={{ fontSize: 11, color: THEME.fg3, textAlign: 'center', marginTop: 10 }}>{L('Look up soon, or I’ll keep reminding you')}</div>
      </React.Fragment>
    ),
    // 1 · CARD — buddy left, message right, actions below. The straight system card.
    // The buddy sits on a tone-tinted stage rather than floating in white: it grounds the
    // character, and it puts the tier colour *with* the speaker instead of only in a hairline
    // at the card's top edge, where it was easy to miss.
    card: (
      <div style={{ padding: 16 }}>
        {round > 1 && <div style={{ marginBottom: 12 }}><Badge_ /></div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flexShrink: 0, width: 84, height: 84, borderRadius: 22, background: tone.chip, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={74} /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {line(22, 12.5, 5)}
          </div>
        </div>
        <Actions />
      </div>
    ),

    // 2 · BUBBLE — the buddy *says* it: tinted speech bubble with a tail, like the warning sheet.
    bubble: (
      <div style={{ padding: 16 }}>
        {round > 1 && <div style={{ marginBottom: 12 }}><Badge_ /></div>}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
          <div className="jx-float" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={84} /></div>
          <div style={{ flex: 1, minWidth: 0, background: tone.bubble, borderRadius: '16px 16px 16px 4px', padding: '12px 14px', marginBottom: 6 }}>
            {line(19, 12.5, 3)}
          </div>
        </div>
        <Actions />
      </div>
    ),

    // 3 · HERO — buddy breaks the card's top edge and the copy centres under it. The most
    // "character-first" of the four; the message reads as the buddy addressing the child.
    hero: (
      <div style={{ padding: '0 16px 16px', textAlign: 'center' }}>
        <div className="jx-float" style={{ marginTop: -42, marginBottom: 2 }}>
          <Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={92} />
        </div>
        {round > 1 && <div style={{ marginBottom: 8 }}><Badge_ /></div>}
        {line(21, 13, 4)}
        <Actions stacked />
      </div>
    ),

    // 4 · ROW — the tightest: an avatar chip, the line, and the CTA on one axis. Closest to
    // the home screen's safety banner, so it costs the child the least attention.
    row: (
      <div style={{ padding: 16 }}>
        {round > 1 && <div style={{ marginBottom: 12 }}><Badge_ /></div>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MascotChip species={c.species} stage={c.stage} color={c.color} size={56} bg={tone.chip} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {line(18, 12.5, 2)}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <Button variant="primary" size="md" icon="check" fullWidth onClick={onRespond} style={ctaStyle()}>{L('I looked up')}</Button>
        </div>
      </div>
    ),
  };

  const hero = layout === 'hero';
  const sheet = layout === 'sheet';

  // SHEET — anchored to the bottom edge, no gutter, rounded on top only. It rises once with the
  // same jx-overlay-up motion the warning sheet uses, so the two stages feel like one surface —
  // and then it stays: it only leaves when the risk does (a stop, or the ignore timeout).
  if (sheet) {
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        <div className="jx-overlay-up" style={{ pointerEvents: 'auto', background: THEME.surface, borderRadius: '32px 32px 0 0', padding: '20px 20px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -10px 30px rgba(0,0,0,.16)' }}>
          {bodies.sheet}
        </div>
      </div>
    );
  }

  return (
    // F-09: bottom-centre, ~20% of screen height. Gutter is the system's 18px, and the card
    // spans it — no arbitrary max-width pinching it in.
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, minHeight: '20%', display: 'flex', alignItems: 'flex-end', padding: `0 18px calc(env(safe-area-inset-bottom) + 18px)`, pointerEvents: 'none' }}>
      {/* overflow is hidden so the rail is cut to the card's radius — except on hero, where the
          buddy is *meant* to break the top edge, so there the rail gets its own clipping sleeve. */}
      <div className="jx-overlay-in" style={{ ...MSG_CARD, pointerEvents: 'auto', minHeight: hero ? 150 : 168, marginTop: hero ? 42 : 0, overflow: hero ? 'visible' : 'hidden' }}>
        {/* tone rail — reads before any copy is parsed (gentle → firm → urgent) */}
        {hero
          ? <div style={{ borderRadius: '20px 20px 0 0', overflow: 'hidden' }}><Rail /></div>
          : <Rail />}
        {bodies[layout] || bodies.card}
      </div>
    </div>
  );
}

function WarningOverlay({ ctx }) {
  const variant = ctx.tweaks.overlay || 'spotlight';
  // Tweaks → Hold. A prototype-only freeze: the escalation is time-driven, so every stage is
  // gone in a few seconds and none of them can be looked at properly. Hold stops the clock on
  // whatever is on screen — phase timers, the line rotation, the countdown bars, the reward's
  // self-close — without changing any of the timings the pilot will tune.
  const hold = !!ctx.tweaks.hold;
  const [phase, setPhase] = React.useState('grace'); // grace -> buzz -> warn -> message -> (cooldown ->) buzz... -> reward
  const [round, setRound] = React.useState(1);       // intervention rounds run so far for this one risk event
  const [confirming, setConfirming] = React.useState(false); // F-08.4 — safe state seen; verifying it
  const [verified, setVerified] = React.useState(0);         // F-12 — how many of the 4 safe conditions have confirmed
  const [rewardResult, setRewardResult] = React.useState(null); // evaluateSafeStop() outcome for the toast
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const tier = interventionTier(round);              // F-08.3 — tone firms up with every ignored round
  const stoppedAt = React.useRef(null);              // phase the risk ended in → immediate vs delayed stop

  // F-08.4 / F-12 — detection reports the risk may have ended (phone put away, or walking finished).
  // We do NOT reward on that first signal, and we do NOT reward the tap itself: a single button
  // press is not a safe stop, and paying for it let a child dismiss the warning and keep scrolling.
  // Instead the response starts a VERIFICATION — the four safe conditions must each confirm (below)
  // before the bonus is even considered. Sensors also flutter, so this doubles as the hold that
  // stops a stray sample flickering the overlay off and back on. (In the prototype the buttons and
  // the step timer stand in for real detection; the shipped app fills the conditions from signals.)
  const respond = () => {
    if (confirming) return;
    stoppedAt.current = phase;
    setVerified(1);        // condition 1 — the intervention overlay was shown — is already true
    setConfirming(true);
  };

  // Step the four conditions in turn; when all are green, run the reward policy. The bonus is
  // paid ONLY if every condition held (never for a bare acknowledgement) AND the anti-farm
  // cooldown allows it — evaluateSafeStop() owns both rules, so the screen cannot fake a reward.
  React.useEffect(() => {
    if (!confirming || hold) return;
    if (verified < SAFE_CONDITIONS.length) {
      const t = setTimeout(() => setVerified(v => v + 1), VERIFY_STEP_MS);
      return () => clearTimeout(t);
    }
    const from = stoppedAt.current;
    const outcome = from === 'grace' || from === 'buzz' ? 'immediate' : 'delayed';
    // all four conditions verified → the phone is away, the screen is off, and walking continued
    const res = evaluateSafeStop({ warned: true, phoneStopped: true, screenOff: true, stillWalking: true }, outcome, { rounds: round, tier: tier.key });
    setRewardResult(res);
    setConfirming(false);
    setVerified(0);
    // Show the toast when there's something to say (a payout, or the farm-blocked note). With the
    // toast feature off, a genuine payout is banked silently; a blocked one just hands back the screen.
    if (FEATURES.rewardToast && (res.ok || res.reason === 'cooldown' || res.reason === 'capped')) setPhase('reward');
    else ctx.closeOverlay();
  }, [confirming, verified, hold]);

  // The payoff dismisses itself — long enough to actually land: the child should read the stop
  // time and see the points before the screen is taken back. (1.8s closed on top of the confetti.)
  React.useEffect(() => {
    if (phase !== 'reward' || hold) return;
    const t = setTimeout(() => ctx.closeOverlay(), REWARD_MS);
    return () => clearTimeout(t);
  }, [phase, hold]);
  // F-08.2 — the child's only button is "I looked up"; there is no dismiss. If they simply ignore
  // the message, IGNORE_MS lapses and this fires with outcome 'ignored' — clearing the UI, not the
  // risk. The overlay leaves the screen and RECHECK_MS of quiet follows: no warning of any kind for
  // this same hazardous situation. Only when the cooldown lapses is the risk re-assessed — and only
  // if walking + phone use are still going do we buzz again and re-show the warning, one tone
  // firmer. No screen block, ever.
  const standDown = (outcome) => {
    logRiskEvent({ outcome, rounds: round, tier: tier.key });
    setPhase('cooldown');
  };

  // F-07 grace period + F-08 staged escalation — auto-advance:
  // grace (subtle self-correct window) → gentle buzz → on-screen warning → repeating message.
  // The buzz→warn hop is conditional: the warning is only drawn if walking + phone use are
  // still going BUZZ_HOLD_MS later. Stopping inside that window ends the escalation here.
  React.useEffect(() => {
    if (confirming) return;   // the risk looks over — hold everything until the safe state is confirmed
    if (hold) return;         // Tweaks → Hold: freeze on this stage. Resuming restarts its clock.
    if (phase === 'grace') { const t = setTimeout(() => setPhase('buzz'), GRACE_MS); return () => clearTimeout(t); }
    if (phase === 'buzz') { const t = setTimeout(() => setPhase('warn'), BUZZ_HOLD_MS); return () => clearTimeout(t); }
    if (phase === 'warn') { const t = setTimeout(() => setPhase('message'), 5000); return () => clearTimeout(t); }
    if (phase === 'message') { const t = setTimeout(() => standDown('ignored'), IGNORE_MS); return () => clearTimeout(t); }
    if (phase === 'cooldown') { const t = setTimeout(() => { setRound(n => n + 1); setPhase('buzz'); }, RECHECK_MS); return () => clearTimeout(t); }
  }, [phase, confirming, hold]);

  // the depleting bars are CSS animations, so the freeze has to reach them too
  const paused = { animationPlayState: hold ? 'paused' : 'running' };
  const stage = { buzz: 0, warn: 1, message: 2 }[phase];
  const grace = phase === 'grace';
  const lightBg = variant === 'spotlight' && phase === 'warn';

  // ── COOLDOWN: reached when the message is ignored. The app is usable again — no dim, no block (F-10 is out of
  // MVP scope) — while the system re-assesses the risk. A quiet, non-interactive pill is all that's left.
  if (phase === 'cooldown') {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 60, pointerEvents: 'none' }}>
        <div className="jx-rise" style={{ position: 'absolute', top: 96, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(43,41,38,.86)', color: '#fff', padding: '9px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
            <Icon name="vibrate" size={13} color="#fff" stroke={2.4} />
            {L('Still walking — I’ll check again in a moment')}
          </span>
        </div>
      </div>
    );
  }

  const Msg = () => (
    <React.Fragment>
      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.25 }}>{L(tier.title)} {PLAYER.name}!</div>
      <div style={{ fontSize: 13.5, color: THEME.fg2, marginTop: 4, lineHeight: 1.4 }}>{L(tier.body)}</div>
    </React.Fragment>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 60 }}>
      {/* dim — grows in from transparent (spec #6), barely-there during grace, then deepens as the escalation advances */}
      <div className="jx-dim-in" style={{ position: 'absolute', inset: 0, background: grace ? 'rgba(43,41,38,.16)' : lightBg ? 'rgba(248,247,247,.86)' : phase === 'message' ? 'rgba(43,41,38,.52)' : 'rgba(43,41,38,.34)', backdropFilter: lightBg ? 'blur(3px)' : 'none', transition: 'background .4s ease' }} />

      {/* F-08.4 / F-12 — safe state seen: the escalation freezes and the four conditions are
          verified one by one. The bonus is what's on the far side of a full green column — so the
          child can see the points are earned by putting the phone away and walking on, not by the
          tap that opened this card. A sensor blip can't flicker the overlay away mid-check either. */}
      {confirming && (
        <div className="jx-fade" style={{ position: 'absolute', top: 92, left: 20, right: 20, display: 'flex', justifyContent: 'center', zIndex: 6 }}>
          <div style={{ width: '100%', maxWidth: 300, background: '#fff', borderRadius: 18, padding: '14px 16px 12px', boxShadow: THEME.shadowCard }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg2, textAlign: 'center', marginBottom: 10 }}>{L('Checking you’re really safe…')}</div>
            {SAFE_CONDITIONS.map((cond, i) => {
              const done = verified > i;
              return (
                <div key={cond} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                  <span style={{ width: 20, height: 20, borderRadius: 999, flexShrink: 0, background: done ? THEME.success : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s ease' }}>
                    {done ? <Icon name="check" size={12} color="#fff" stroke={3.2} /> : <span style={{ width: 6, height: 6, borderRadius: 999, background: THEME.fg3 }} />}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: done ? THEME.fg1 : THEME.fg3, transition: 'color .2s ease' }}>{L(cond)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STAGE 0: grace period — a calm, self-correct window before any warning (F-07).
          Tapping "I've got it" here means you caught yourself → no warning, straight to the save. */}
      {grace && (
        <div className="jx-overlay-in" style={{ position: 'absolute', top: 92, left: 16, right: 16 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '13px 15px', boxShadow: THEME.shadowXl }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="jx-char-in" style={{ flexShrink: 0 }}><div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={46} /></div></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: THEME.fg1 }}>{L('Walking — heads up in a sec')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Look up now and no warning is needed.')}</div>
              </div>
              <button onClick={respond} style={{ flexShrink: 0, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: THEME.brandLight, color: THEME.brandDark, fontWeight: 800, fontSize: 12.5, padding: '9px 13px', borderRadius: 999 }}>{L("I've got it")}</button>
            </div>
            {/* depleting bar = the remaining grace before the gentle buzz */}
            <div style={{ marginTop: 11, height: 4, borderRadius: 999, background: THEME.surface2, overflow: 'hidden' }}>
              <div className="jx-countdown" style={{ height: '100%', borderRadius: 999, background: THEME.warning, animationDuration: `${GRACE_MS}ms`, ...paused }} />
            </div>
          </div>
        </div>
      )}

      {phase === 'reward' ? <RewardToast c={c} result={rewardResult} /> : (
        <React.Fragment>
          {/* escalation stepper — only once the grace window has passed */}
          {!grace && <StageSteps stage={stage} onLight={lightBg} />}

          {/* ── STAGE 1: gentle buzz + the 2s hold window (F-08).
              The warning only lands if the risk keeps going for BUZZ_HOLD_MS after the buzz;
              stopping in here (button, or the phone simply going down) skips it entirely. */}
          {/* No "I stopped" button here: in the real product the buzz stage has no UI to press —
              the child stops by looking up or putting the phone down, and detection reports it.
              A button would be inventing an interaction the shipped app doesn't have. The layer
              itself stands in for that detection signal so the demo can still reach the save. */}
          {phase === 'buzz' && (
            <div className="jx-dim-in" onClick={respond} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, cursor: 'pointer' }}>
              <div className="jx-char-in" style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="jx-ring" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-ring-slow" style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '2px solid rgba(255,255,255,.55)' }} />
                <div className="jx-pulse" style={{ width: 78, height: 78, borderRadius: 999, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="vibrate" size={34} color={THEME.fg1} stroke={2.2} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div className="game-font" style={{ color: '#fff', fontSize: 20, fontWeight: 500 }}>{round === 1 ? L('One gentle buzz') : L('Buzzing again — still walking')}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.82)', marginTop: 4 }}>{L('Stop within 2s and no warning appears.')}</div>
              </div>
              <div style={{ width: 200 }}>
                <div style={{ height: 4, borderRadius: 999, background: 'rgba(255,255,255,.28)', overflow: 'hidden' }}>
                  <div className="jx-countdown" style={{ height: '100%', borderRadius: 999, background: '#fff', animationDuration: `${BUZZ_HOLD_MS}ms`, ...paused }} />
                </div>
              </div>
            </div>
          )}

          {/* ── STAGE 3: repeating character message — ignoring it for IGNORE_MS logs
              an "ignored" event and starts the next, firmer round ── */}
          {phase === 'message' && <CharMessageToast c={c} round={round} tier={tier} layout={ctx.tweaks.msgLayout} hold={hold} onRespond={respond} />}

          {/* ── STAGE 2: the on-screen warning (chosen variant) ── */}
          {phase === 'warn' && (<React.Fragment>

          {/* ── VARIANT: bottom sheet ── */}
          {variant === 'sheet' && (
            // A floating modal, not a docked sheet: inset from the phone's edges on all four
            // sides so it reads as a card the app is holding up, not a drawer welded to the
            // bottom bezel. Radius is even now that no edge is flush.
            <div className="jx-overlay-in" style={{ position: 'absolute', left: 16, right: 16, bottom: 'calc(env(safe-area-inset-bottom) + 18px)', background: '#fff', borderRadius: 28, padding: '18px 18px 20px', boxShadow: THEME.shadowXl }}>
              {round > 1 && <RoundBadge round={round} tier={tier} />}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                <div className="jx-char-in"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={104} /></div>
                <div style={{ flex: 1, background: THEME.surface2, borderRadius: '18px 18px 18px 4px', padding: '12px 14px', marginBottom: 8 }}><Msg /></div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Button variant="primary" size="md" icon="check" fullWidth onClick={respond} style={ctaStyle()}>{L('I looked up')}</Button>
              </div>
              <div style={{ fontSize: 11, color: THEME.fg3, textAlign: 'center', marginTop: 10 }}>{L('Look up soon, or I’ll keep reminding you')}</div>
            </div>
          )}

          {/* ── VARIANT: spotlight ── */}
          {variant === 'spotlight' && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
              {/* spec #6 — the character scales in first, then the copy and CTA cascade in behind it */}
              <div className="jx-char-in"><div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={172} /></div></div>
              {round > 1 && <div className="jx-content-in" style={{ marginTop: 10, animationDelay: '.14s' }}><RoundBadge round={round} tier={tier} inline /></div>}
              <div className="game-font jx-content-in" style={{ fontSize: 26, fontWeight: 500, marginTop: 10, animationDelay: '.18s' }}>{L(tier.title)} {PLAYER.name}!</div>
              <div className="jx-content-in" style={{ fontSize: 15, color: THEME.fg2, margin: '8px 0 22px', lineHeight: 1.45, animationDelay: '.26s' }}>{L(tier.body)}</div>
              {/* One thing on this screen, and it is the safe action: looking up is the child's
                  only option, so the brand CTA stands alone with no competing dismiss. */}
              <div className="jx-content-in" style={{ width: '100%', display: 'flex', justifyContent: 'center', animationDelay: '.34s' }}>
                <Button variant="primary" size="lg" fullWidth onClick={respond} style={{ maxWidth: 280, ...ctaStyle() }}>{L('I looked up')}</Button>
              </div>
            </div>
          )}

          {/* ── VARIANT: minimal banner ── */}
          {variant === 'banner' && (
            <div className="jx-overlay-in" style={{ position: 'absolute', top: 94, left: 14, right: 14 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: '12px 14px', boxShadow: THEME.shadowXl }}>
                <div onClick={respond} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <div className="jx-char-in" style={{ flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} mood="alert" size={56} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{round === 1 ? L('Eyes up while walking') : L(tier.title) + ' ' + PLAYER.name + '!'}</div>
                    <div style={{ fontSize: 12, color: THEME.fg2 }}>{round === 1 ? L("Tap when you've looked up") : L(tier.body)}</div>
                  </div>
                  <div style={{ width: 34, height: 34, borderRadius: 999, background: THEME.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="check" size={18} color={THEME.brand} stroke={2.6} />
                  </div>
                </div>
              </div>
            </div>
          )}
          </React.Fragment>)}
        </React.Fragment>
      )}
    </div>
  );
}

export { MSG_LAYOUTS, WarningOverlay };
