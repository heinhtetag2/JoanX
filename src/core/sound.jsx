// JoanX — sound engine (A-0 · game feedback)
//
// Zero-asset audio: every sound is SYNTHESISED with the Web Audio API at play
// time — no .mp3/.wav files to ship, load, or wait on. That keeps the prototype
// self-contained (nothing to fetch, nothing to 404) and lets each cue be tuned
// as data rather than baked into a recording.
//
// Two rules the whole engine obeys:
//   1. It is a feedback cue, never a safety guarantee. A per-app mute silences all
//      of it — the child game reads PLAYER.prefs.sound, the parent app reads
//      PARENT_PREFS.sound (different devices, different toggles). The real safety
//      signals (the child's buzz, the parent's urgent alert takeover) are never a
//      sound and are never muted, so nothing here stands in for them.
//   2. Both apps use the layer, but with different palettes: the CHILD game gets
//      the celebratory cues + BGM; the PARENT guardian app gets only the quiet,
//      functional ones (taps, a distinct alert, a pairing confirmation) — no
//      fanfares/coins/BGM. `window.JX_ROLE` picks the mute and gates the tap layer.
//
// Browser autoplay policy blocks audio until a user gesture, so the AudioContext
// is created lazily on the first tap and resumed inside that gesture (see
// installUiSounds). Before then, every call is a silent no-op.

import { PLAYER, PARENT_PREFS } from './data.jsx';

// The single shared context — created on first use, reused forever. A page only
// gets a handful of AudioContexts before browsers refuse more, so one is the rule.
let _ctx = null;
function audio() {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;                       // very old browser — stay silent
    try { _ctx = new AC(); } catch { return null; }
  }
  // A context can be born (or fall back) 'suspended'; resuming is only allowed
  // from a user gesture, which is exactly when our sounds fire.
  if (_ctx.state === 'suspended') _ctx.resume().catch(() => {});
  return _ctx;
}

// Master bus: one gain (headroom) → one compressor (so stacked notes in a fanfare
// don't clip) → speakers. Built once and cached on the context.
function bus(ac) {
  if (ac._jxBus) return ac._jxBus;
  const g = ac.createGain();
  g.gain.value = 0.9;
  let tail = g;
  if (ac.createDynamicsCompressor) {
    const comp = ac.createDynamicsCompressor();
    // gentle catch-all limiter, not an audible squash
    try {
      comp.threshold.value = -10; comp.knee.value = 24;
      comp.ratio.value = 8; comp.attack.value = 0.003; comp.release.value = 0.18;
    } catch { /* older impls expose these read-only — defaults are fine */ }
    g.connect(comp); tail = comp;
  }
  tail.connect(ac.destination);
  ac._jxBus = g;
  return g;
}

// The active app's Sound-effects toggle owns everything. Each app has its OWN
// mute (they run on different devices): the parent app reads PARENT_PREFS.sound,
// the child game reads PLAYER.prefs.sound. Default on if a flag is missing, and
// never let a read throw a play.
const on = () => {
  try {
    if (typeof window !== 'undefined' && window.JX_ROLE === 'parent') {
      return PARENT_PREFS ? PARENT_PREFS.sound !== false : true;
    }
    return PLAYER && PLAYER.prefs ? PLAYER.prefs.sound !== false : true;
  } catch { return true; }
};

// ── One synth voice ──────────────────────────────────────────────────
// A single enveloped oscillator. `glideTo` sweeps the pitch (zaps, swoops);
// gains use exponential ramps, so every level is a small non-zero number.
function tone(freq, when, dur, opt = {}) {
  const ac = audio(); if (!ac || !on()) return;
  const b = bus(ac);
  const { type = 'sine', gain = 0.18, attack = 0.006, glideTo } = opt;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(b);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

// A short burst of filtered noise — the percussive layer (crack, hit, zap, spark).
function noise(when, dur, opt = {}) {
  const ac = audio(); if (!ac || !on()) return;
  const b = bus(ac);
  const { gain = 0.14, type = 'highpass', freq = 1200, q = 0.7 } = opt;
  const t0 = ac.currentTime + when;
  const n = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);   // white noise with a linear decay
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(b);
  src.start(t0); src.stop(t0 + dur + 0.02);
}

// Play a sequence of [freq, startOffset] notes with one shared voice setting.
const seq = (notes, dur, opt) => notes.forEach(([f, t]) => tone(f, t, dur, opt));

// A major-pentatonic ladder keeps every celebratory run consonant, so nothing
// ever lands on a sour note however the pieces are stacked.
const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880,
      C6 = 1046.5, D6 = 1174.7, E6 = 1318.5, G6 = 1568, C7 = 2093, E7 = 2637;

// ── The named cues ───────────────────────────────────────────────────
// Grouped by where they play. Gains are deliberately restrained — feedback,
// not a soundtrack — with the celebration cues (achievement, win, hatch) a
// touch louder because they are the moment, not the background.
const sfx = {
  // — UI · the ambient interaction layer —
  tap()        { tone(1180, 0, 0.035, { type: 'sine', gain: 0.05, attack: 0.002 }); },      // generic button press (very quiet)
  navigate()   { tone(560, 0, 0.05, { type: 'sine', gain: 0.06, glideTo: 840 }); },          // move forward / open
  back()       { tone(600, 0, 0.06, { type: 'sine', gain: 0.055, glideTo: 420 }); },          // go back
  select()     { tone(A5, 0, 0.05, { type: 'triangle', gain: 0.06 }); tone(D6, 0.04, 0.05, { type: 'triangle', gain: 0.05 }); },
  toggle(v)    { tone(v ? 720 : 470, 0, 0.06, { type: 'triangle', gain: 0.07, glideTo: v ? 940 : 360 }); },

  // — Rewards & progress —
  success()    { seq([[E5, 0], [B(E5), 0.08]], 0.18, { type: 'triangle', gain: 0.12 }); },     // generic positive
  coin()       { tone(E6, 0, 0.06, { type: 'square', gain: 0.07 }); tone(G6, 0.055, 0.14, { type: 'square', gain: 0.08 }); },
  points()     { tone(E6, 0, 0.06, { type: 'square', gain: 0.07 }); tone(G6, 0.055, 0.14, { type: 'square', gain: 0.08 }); },   // points landed (same as coin, without a `this` dep)
  taskDone()   { seq([[G5, 0], [C6, 0.09]], 0.16, { type: 'triangle', gain: 0.12 }); tone(G6, 0.09, 0.2, { type: 'sine', gain: 0.05 }); },
  claim()      { tone(C6, 0, 0.06, { type: 'triangle', gain: 0.08 }); tone(E6, 0.06, 0.14, { type: 'square', gain: 0.09 }); tone(G6, 0.14, 0.2, { type: 'sine', gain: 0.05 }); },
  levelUp()    { seq([[C5, 0], [E5, 0.08], [G5, 0.16], [C6, 0.24]], 0.18, { type: 'triangle', gain: 0.12 }); },

  // — Achievement unlock — a rising fanfare with a shimmer tail —
  achievement() {
    seq([[C5, 0], [E5, 0.09], [G5, 0.18], [C6, 0.27], [E6, 0.36]], 0.24, { type: 'triangle', gain: 0.13 });
    tone(G6, 0.45, 0.5, { type: 'sine', gain: 0.06 });
    seq([[C7, 0.48], [E7, 0.55], [G6 * 2, 0.62]], 0.14, { type: 'sine', gain: 0.04 });
  },

  // — Egg hatch — anticipation (crack) then reveal (swell + chord + sparkle) —
  // A hollow "tok" when the shell is tapped/wobbled before it gives.
  eggTap()     { tone(280, 0, 0.06, { type: 'sine', gain: 0.06, glideTo: 190 }); noise(0, 0.03, { type: 'bandpass', freq: 520, q: 1.4, gain: 0.03 }); },
  hatchShake() { noise(0, 0.06, { type: 'bandpass', freq: 420, q: 1.2, gain: 0.06 }); tone(200, 0, 0.05, { type: 'square', gain: 0.05, glideTo: 150 }); },
  // The shell breaking. On a gradual crack the fissure spreads over ~2.4s, so the
  // audio spreads WITH it: a first snap, then crackles that climb in pitch and
  // volume over a rising tension tone — the sound of the seam opening, not one
  // pop and then silence. The quick pop is slower now too, so it gets its own
  // shorter build (a few climbing crackles over a rising tone) instead of falling
  // silent while the egg keeps trembling.
  hatchCrack(gradual = false) {
    tone(250, 0, 0.07, { type: 'square', gain: 0.07, glideTo: 165 });                          // the first give of the shell
    noise(0, 0.11, { type: 'highpass', freq: 1500, gain: 0.09 });
    if (gradual) {
      [0.45, 0.85, 1.25, 1.65, 2.05].forEach((t, i) => {                                        // crackles spreading down the seam
        noise(t, 0.05, { type: 'highpass', freq: 1350 + i * 210, gain: 0.045 + i * 0.011 });
        if (i % 2) tone(360 + i * 45, t, 0.06, { type: 'square', gain: 0.035, glideTo: 300 });
      });
      tone(300, 0.1, 2.1, { type: 'sine', gain: 0.04, glideTo: 760 });                          // tension rising toward the pop
    } else {
      [0.32, 0.66, 1.0].forEach((t, i) => {                                                     // a shorter build for the quick pop
        noise(t, 0.05, { type: 'highpass', freq: 1700 + i * 220, gain: 0.045 + i * 0.012 });
      });
      tone(320, 0.04, 1.12, { type: 'sine', gain: 0.038, glideTo: 640 });                       // rising tension under it
    }
  },
  hatchReveal() {
    noise(0, 0.18, { type: 'highpass', freq: 2400, gain: 0.06 });                               // the shell bursts open
    tone(392, 0, 0.7, { type: 'sine', gain: 0.05, glideTo: 784 });                             // longer rising swell under it
    seq([[G5, 0.3], [B(G5), 0.36], [E6, 0.46]], 0.34, { type: 'triangle', gain: 0.11 });        // the reveal chord, held a touch longer
    seq([[C7, 0.5], [E7, 0.6]], 0.18, { type: 'sine', gain: 0.045 });                           // sparkle
    tone(G6, 0.64, 0.6, { type: 'sine', gain: 0.045 });                                         // a final shimmer that rings out
  },
  purchase()   { tone(A5, 0, 0.05, { type: 'triangle', gain: 0.08 }); tone(E6, 0.05, 0.12, { type: 'triangle', gain: 0.09 }); noise(0, 0.04, { type: 'highpass', freq: 3200, gain: 0.03 }); },

  // — Battle —
  battleStart() { tone(330, 0, 0.18, { type: 'sawtooth', gain: 0.08, glideTo: 660 }); },
  attack()     { noise(0, 0.09, { type: 'highpass', freq: 900, gain: 0.13 }); tone(880, 0, 0.08, { type: 'sawtooth', gain: 0.1, glideTo: 180 }); },
  hit()        { noise(0, 0.12, { type: 'lowpass', freq: 420, gain: 0.16 }); tone(140, 0, 0.1, { type: 'square', gain: 0.09, glideTo: 80 }); },
  win()        { seq([[C5, 0], [E5, 0.1], [G5, 0.2], [C6, 0.3], [E6, 0.4]], 0.26, { type: 'triangle', gain: 0.13 }); tone(G6, 0.5, 0.5, { type: 'sine', gain: 0.06 }); },
  lose()       { seq([[A5, 0], [G5, 0.12], [E5, 0.24], [C5, 0.36]], 0.28, { type: 'triangle', gain: 0.1 }); },

  // — Pairing with a parent (onboarding) —
  // "connecting…" — a soft, hopeful handshake ping. Gentle and non-looping: the
  // wait screen plays it once when it appears, not on a timer.
  connecting() { tone(G5, 0, 0.14, { type: 'sine', gain: 0.06, glideTo: C6 }); tone(C6, 0.13, 0.16, { type: 'sine', gain: 0.05 }); },
  // "connected!" — the two buddies link up. A warm rounded arpeggio that resolves
  // onto a held major third — friendlier than the generic success ding, because
  // this is the moment the child and parent are joined.
  connected()  {
    seq([[C5, 0], [E5, 0.1], [G5, 0.2], [C6, 0.3]], 0.26, { type: 'triangle', gain: 0.11 });
    tone(E6, 0.34, 0.5, { type: 'sine', gain: 0.06 });
    tone(G5, 0.34, 0.5, { type: 'sine', gain: 0.05 });                                          // soft chord under the top note
  },

  // — Safety cues — these are AUDIO accents for the demo, still muted by the game
  //   toggle; the un-mutable safety signal is the physical buzz, not any of these. —
  warning()    { seq([[E6, 0], [E6, 0.22]], 0.16, { type: 'square', gain: 0.09 }); },            // two-tone alert
  impact()     { seq([[880, 0], [880, 0.28], [880, 0.56]], 0.14, { type: 'sawtooth', gain: 0.11, glideTo: 520 }); },   // urgent alarm sweep
  reassure()   { seq([[G5, 0], [C6, 0.12], [E6, 0.24]], 0.3, { type: 'sine', gain: 0.07 }); },   // "the parent has been told" — calm

  // — Parent app — functional, not game-y. A clear notification chime for the
  //   urgent "your child didn't respond" takeover: firm and repeated so it reads
  //   as an alert, but a clean two-note fall, not a klaxon (it's a guardian app). —
  parentAlert() {
    seq([[A5, 0], [E5, 0.14], [A5, 0.5], [E5, 0.64]], 0.2, { type: 'triangle', gain: 0.12 });
    seq([[A5, 1.0], [E5, 1.14]], 0.2, { type: 'triangle', gain: 0.1 });
  },
};

// A just-below note for two-note "ding" pairs (a perfect fifth up sounds right
// for a positive chime). Kept as a tiny helper so `success` reads musically.
function B(f) { return f * 1.5; }

// ── Global UI tap layer ──────────────────────────────────────────────
// One delegated, capture-phase listener gives every in-app button a press blip
// without touching a single screen. It is gated so it never leaks:
//   · the child game AND the parent app (window.JX_ROLE) — but NOT the dev doc
//     pages (design/checklist/docs); each app's own mute still applies via on()
//   · inside the phone screen only (.screen) — never the dev topbar / Tweaks panel
//   · opt-out per element with data-sfx="off"
// It also doubles as the audio unlock: touching ANY button resumes the context
// inside the gesture, so the first real cue is never swallowed by autoplay policy.
let _installed = false;
function installUiSounds() {
  if (_installed || typeof document === 'undefined') return;
  _installed = true;
  document.addEventListener('pointerdown', (e) => {
    audio();                                                     // unlock within the gesture, always
    if (window.JX_ROLE !== 'child' && window.JX_ROLE !== 'parent') return;
    const t = e.target;
    if (!t || !t.closest) return;
    const btn = t.closest('button, [role="button"]');
    if (!btn || btn.disabled) return;
    if (!btn.closest('.screen')) return;                         // dev chrome (topbar, Tweaks) makes no game noise
    if (btn.dataset && btn.dataset.sfx === 'off') return;
    sfx.tap();
  }, true);
}

// ── Background music ─────────────────────────────────────────────────
// A looping, synthesised backing track for the "fighting" screens (Villain
// Dex, battle). It uses a lookahead scheduler on the audio clock — so the loop
// never drifts or clicks the way a setInterval re-trigger would — and sits on
// its own quieter bus UNDER the SFX. Same two gates as everything else: muted
// live by the sound toggle (a mute schedules silence but keeps the clock, so
// unmuting resumes in time), and only ever started from a child-app screen.
function musicBus(ac) {
  if (ac._jxMusicBus) return ac._jxMusicBus;
  const g = ac.createGain();
  g.gain.value = 0.9;                 // per-note gains are already low — this is just headroom
  g.connect(bus(ac));                 // through the master compressor, with everything else
  ac._jxMusicBus = g;
  return g;
}

// One backing-track note. Kept off `tone` so it targets the music bus and isn't
// re-gated per note (the scheduler checks the mute once per step).
function mvoice(ac, dest, freq, t0, dur, type, gain, glideTo) {
  const osc = ac.createOscillator(); const g = ac.createGain();
  osc.type = type; osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.02, dur / 2));
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(dest); osc.start(t0); osc.stop(t0 + dur + 0.03);
}
function mhat(ac, dest, t0, gain) {
  const n = Math.max(1, Math.floor(ac.sampleRate * 0.03));
  const buf = ac.createBuffer(1, n, ac.sampleRate); const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 6500;
  const g = ac.createGain(); g.gain.setValueAtTime(gain, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.03);
  src.connect(f).connect(g).connect(dest); src.start(t0); src.stop(t0 + 0.05);
}

const _R = 0;   // a rest
const TRACKS = {
  // "villain chase" — A-minor, tense but light, never menacing (it's a kids' game).
  // 16 eighth-note steps (~3s) over an Am · F · G · Em loop, repeated.
  battle: {
    stepDur: 0.19, steps: 16,
    bass: [110, _R, _R, _R, 87.31, _R, _R, _R, 98, _R, _R, _R, 82.41, _R, _R, _R],       // low chord root, held per bar-quarter
    lead: [440, 523.25, 659.25, 523.25, 349.23, 440, 523.25, 440, 392, 493.88, 587.33, 493.88, 329.63, 392, 493.88, 392],  // arpeggio over the chords
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],                               // soft pulse on the downbeats
    // no hat layer: the offbeat noise-shaker read as a constant background hiss on the map
  },
  // "stay with me" — the impact / safety-check theme. The buddy is playing guitar
  // to keep the child calm through the countdown, so this is warm and reassuring,
  // NOT an alarm: a slow fingerpicked C · G · Am · F over a soft bass, with a gentle
  // descending melody on top. No drums. ~4.5s loop, so it reads as a tune, not a beep.
  calm: {
    stepDur: 0.28, steps: 16, leadType: 'triangle', leadGain: 0.05, bassGain: 0.075, bassHold: 3.6, melGain: 0.055, melHold: 3.4,
    bass: [130.81, _R, _R, _R, 98, _R, _R, _R, 110, _R, _R, _R, 87.31, _R, _R, _R],        // C · G · Am · F roots
    lead: [261.63, 392, 329.63, 392, 196, 293.66, 246.94, 293.66, 220, 329.63, 261.63, 329.63, 174.61, 261.63, 220, 261.63],  // fingerpicked arpeggio
    mel:  [523.25, _R, _R, _R, 493.88, _R, _R, _R, 440, _R, _R, _R, 349.23, _R, _R, _R],    // C5 · B4 · A4 · F4 — a soft descending motif
  },
  // "look up" — the safe-walk warning theme. It must draw the eyes up WITHOUT
  // scaring or entertaining (a fun tune would make a child linger on the phone):
  // a low tense pad that shifts A→G, a soft heartbeat pulse, offbeat ticks, and a
  // gentle descending "dong-ding" call (C5→A4) twice a loop. Insistent, not a siren.
  alert: {
    stepDur: 0.2, steps: 16, leadType: 'square', leadGain: 0.06, bassGain: 0.06, bassHold: 7,
    bass: [110, _R, _R, _R, _R, _R, _R, _R, 98, _R, _R, _R, _R, _R, _R, _R],                // low pad, A → G
    lead: [523.25, _R, 440, _R, _R, _R, _R, _R, 523.25, _R, 440, _R, _R, _R, _R, _R],        // the call, twice
    kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],                                 // heartbeat
    hat:  [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],                                 // light ticks between beats
  },
};

// Data-driven so one scheduler plays every track: a voice fires only for the
// layers a track defines (battle has kick+hat, calm has a melody and no drums).
function scheduleStep(ac, dest, def, step, t) {
  const b = def.bass && def.bass[step]; if (b) mvoice(ac, dest, b, t, def.stepDur * (def.bassHold || 3.4), 'triangle', def.bassGain || 0.09);
  const l = def.lead && def.lead[step]; if (l) mvoice(ac, dest, l, t, def.stepDur * (def.leadHold || 0.85), def.leadType || 'triangle', def.leadGain || 0.055);
  const m = def.mel && def.mel[step]; if (m) mvoice(ac, dest, m, t, def.stepDur * (def.melHold || 3.2), 'sine', def.melGain || 0.05);
  if (def.kick && def.kick[step]) mvoice(ac, dest, 64, t, 0.12, 'sine', 0.11, 40);
  if (def.hat && def.hat[step]) mhat(ac, dest, t, 0.016);
}

let _music = null;
const music = {
  // Begin (or keep) looping a track. Safe to call on every render/mount — it
  // no-ops if that track is already playing, so a screen just calls it in an
  // effect and calls stop() on unmount.
  start(track = 'battle') {
    if (typeof window !== 'undefined' && window.JX_ROLE !== 'child') return;    // child game only
    const ac = audio(); if (!ac) return;
    if (_music && _music.track === track && !_music.stopped) return;             // already looping this one
    this.stop();
    const dest = musicBus(ac);
    const def = TRACKS[track] || TRACKS.battle;
    const state = { track, step: 0, next: ac.currentTime + 0.08, stopped: false, timer: null };
    const LOOKAHEAD = 0.25;
    const tick = () => {
      // Die if stopped OR if we're no longer the current track — the second check
      // is the leak guard: any ticker orphaned by a fast screen/overlay change (so
      // its own stop() never ran) terminates itself on its next 60ms tick instead
      // of looping forever onto whatever screen the child is now looking at.
      if (state.stopped || _music !== state) return;
      const acx = audio(); if (!acx) return;
      while (state.next < acx.currentTime + LOOKAHEAD) {
        if (on()) scheduleStep(acx, dest, def, state.step, state.next);          // muted → schedule silence, keep the clock
        state.next += def.stepDur;
        state.step = (state.step + 1) % def.steps;
      }
      state.timer = setTimeout(tick, 60);
    };
    _music = state;   // become the current track BEFORE the first tick, so the guard passes
    tick();
  },
  stop() {
    if (!_music) return;
    _music.stopped = true;
    if (_music.timer) clearTimeout(_music.timer);
    _music = null;   // any notes already scheduled (≤0.25s) ring out — a natural fade, not a click
  },
};

export { sfx, installUiSounds, music };
