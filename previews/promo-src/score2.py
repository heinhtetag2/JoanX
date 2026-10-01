# JoanX promo v2 score — synthesized from scratch (no samples, no licences), locked to the edit.
# 112 bpm, D major, I–V–vi–IV. Sections follow v2.html's bar grid (bar = 4 beats).
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
BPM = 112
B = 60 / BPM
BAR = 4 * B
BARS = 32
DUR = BARS * BAR + 1.0
N = int(SR * DUR)
rng = np.random.default_rng(11)

# buses (stereo)
bus = {k: np.zeros((N, 2)) for k in ('drums', 'bass', 'music', 'lead', 'fx', 'pad')}

def T(n): return np.arange(n) / SR
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def filt(x, kind, f, order=2):
    return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x, axis=0)
def add(name, sig, at, gain=1.0, pan=0.0):
    i = int(round(at * SR))
    if i >= N or i < 0: return
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        sig = np.stack([sig * l, sig * r], 1)
    bus[name][i:i + len(sig)] += sig * gain
def bar(n): return n * BAR

# ── harmony ─────────────────────────────────────────────────────────────────
PROG = [  # (bass root, chord tones) — D, A, Bm, G
    (38, [62, 66, 69, 74]), (33, [61, 64, 69, 73]), (35, [62, 66, 71, 74]), (31, [62, 67, 71, 74])]
def chord_at(t): return PROG[int(t // BAR) % 4]

# section map (bars)
HOOK, LOGO, SAFE, GAME, PARENT, STATS, WEB, OUTRO = 0, 2, 4, 10, 16, 20, 23, 28

# ── instruments ─────────────────────────────────────────────────────────────
def ep_note(f, dur, vel=1.0):
    """FM electric piano: 1:1 modulator with a fast-decaying index, plus a bell partial"""
    n = int((dur + 1.2) * SR); t = T(n)
    idx = 2.2 * np.exp(-t * 6) + .35
    s = np.sin(2 * np.pi * f * t + idx * np.sin(2 * np.pi * f * t))
    s += .18 * np.sin(2 * np.pi * f * 4.01 * t) * np.exp(-t * 9)
    env = np.minimum(1, t * 250) * np.exp(-t * 1.6)
    rel = np.clip((dur + .25 - t) / .25, 0, 1)
    return s * env * rel * vel

def saw(f, t, det_cents=0):
    ph = f * 2 ** (det_cents / 1200) * t + rng.random()
    return 2 * (ph % 1) - 1

def supersaw(notes, dur):
    n = int((dur + .6) * SR); t = T(n)
    L = np.zeros(n); R = np.zeros(n)
    for m in notes:
        f = hz(m)
        for k, d in enumerate((-18, -11, -5, 0, 5, 11, 18)):
            s = saw(f, t, d)
            p = (k - 3) / 3
            L += s * (1 - p) / 2; R += s * (1 + p) / 2
    env = np.minimum(1, t / .08) * np.clip((dur + .5 - t) / .5, 0, 1)
    out = np.stack([L * env, R * env], 1) / (len(notes) * 7)
    return filt(out, 'low', 3200, 2)

def pluck(f, dur=.45):
    n = int(dur * SR); t = T(n)
    s = np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * 2 * f * t) + .2 * np.sin(2 * np.pi * 3 * f * t)
    return s * np.exp(-t * 9) * np.minimum(1, t * 600)

def bell(f, dur=2.4):
    n = int(dur * SR); t = T(n)
    s = (np.sin(2 * np.pi * f * t) + .55 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 2)
         + .35 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 4) + .2 * np.sin(2 * np.pi * f * 4.2 * t) * np.exp(-t * 7))
    return s * np.exp(-t * 2.2) * np.minimum(1, t * 900)

def sub(f, dur):
    n = int((dur + .05) * SR); t = T(n)
    s = np.sin(2 * np.pi * f * t) + .25 * np.tanh(3 * np.sin(2 * np.pi * 2 * f * t))
    return s * np.minimum(1, t * 300) * np.clip((dur - t) / .04, 0, 1)

def kick():
    n = int(.42 * SR); t = T(n)
    f = 52 + 140 * np.exp(-t * 26)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7.5)
    click = filt(rng.standard_normal(n), 'high', 2500) * np.exp(-t * 400) * .5
    return np.tanh((body + click) * 1.6)

def snap():
    n = int(.25 * SR); t = T(n)
    noise = filt(rng.standard_normal(n), 'band', [1200, 6000]) * np.exp(-t * 20)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * .6
    return noise + tone

def clap():
    n = int(.3 * SR); t = T(n)
    nz = filt(rng.standard_normal(n), 'band', [900, 3800])
    env = np.zeros(n)
    for o in (0, .011, .022): env += np.exp(-np.clip(t - o, 0, None) * 45) * (t >= o)
    env += .6 * np.exp(-np.clip(t - .03, 0, None) * 12) * (t >= .03)
    return nz * env * .5

def hat(open_=False):
    n = int((.22 if open_ else .05) * SR); t = T(n)
    return filt(rng.standard_normal(n), 'high', 8000) * np.exp(-t * (14 if open_ else 80))

def shaker():
    n = int(.09 * SR); t = T(n)
    return filt(rng.standard_normal(n), 'band', [4500, 11000]) * np.sin(np.pi * np.clip(t / .09, 0, 1)) ** 2

def boom(dur=2.2):
    n = int(dur * SR); t = T(n)
    f = 30 + 70 * np.exp(-t * 6)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    s += filt(rng.standard_normal(n), 'low', 900) * np.exp(-t * 9) * .6
    return np.tanh(s * 1.4)

def rev_cymbal(dur):
    n = int(dur * SR); t = T(n)
    s = filt(rng.standard_normal(n), 'high', 3500) * (t / dur) ** 3
    return s

def riser(dur):
    n = int(dur * SR); t = T(n)
    f = 180 * 2 ** (t / dur * 3.5)
    s = saw(1, t) * 0  # placeholder shape
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + .5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    s = s * (t / dur) ** 2 + filt(rng.standard_normal(n), 'band', [1500, 7000]) * (t / dur) ** 2.5 * .5
    return s

def whoosh(dur=.8):
    n = int(dur * SR); t = T(n); nz = rng.standard_normal(n)
    out = np.zeros(n)
    for j in range(10):
        a, b = int(j * n / 10), int((j + 1) * n / 10)
        lo = 250 * 2 ** (j * .45)
        out[a:b] = filt(nz, 'band', [lo, min(lo * 2.5, 20000)])[a:b]
    return out * np.sin(np.pi * t / dur) ** 2

def buzz(dur=.34):
    n = int(dur * SR); t = T(n)
    s = np.tanh(4 * np.sin(2 * np.pi * 165 * t)) * (0.55 + 0.45 * np.sin(2 * np.pi * 24 * t))
    return filt(s, 'low', 1100) * np.minimum(1, t * 250) * np.clip((dur - t) * 70, 0, 1)

def tick(f=2100):
    n = int(.07 * SR); t = T(n)
    return np.sin(2 * np.pi * f * t) * np.exp(-t * 70)

def popfx():
    n = int(.16 * SR); t = T(n)
    f = 420 + 1100 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26)

# ── arrangement ─────────────────────────────────────────────────────────────
kick_times = []

def in_(b0, b1, t): return bar(b0) <= t < bar(b1)

for bi in range(BARS):
    t0 = bar(bi); root, tones = PROG[bi % 4]
    full = GAME <= bi < PARENT or WEB <= bi < OUTRO
    groove = SAFE <= bi < GAME or full or STATS <= bi < WEB
    # pads: supersaw in the choruses, soft EP-pad elsewhere
    if full:
        add('pad', supersaw([m for m in tones], BAR), t0, .62)
    elif LOGO <= bi < OUTRO:
        add('pad', supersaw([tones[0], tones[2]], BAR) * .7, t0, .35)
    elif bi < LOGO:
        s = supersaw([tones[0], tones[1]], BAR)
        cutoff = 500 + 1400 * (t0 / bar(LOGO))
        add('pad', filt(s, 'low', cutoff, 2), t0, .45)
    # electric piano comping: on 1 and the "and" of 2 (and 4 in the choruses)
    if LOGO <= bi < OUTRO:
        hits = [0, 1.5] + ([3.5] if full or PARENT <= bi < STATS else [])
        for h in hits:
            for j, m in enumerate(tones[:3]):
                add('music', ep_note(hz(m), B * (1.3 if h == 0 else .8), .8 if h else 1), t0 + h * B + j * .006, .11, pan=(j - 1) * .25)
    # pluck arpeggio (16ths feel as 8ths)
    if SAFE <= bi < OUTRO and not (PARENT <= bi < STATS):
        pat = [0, 2, 1, 3, 2, 1, 3, 2]
        for s_ in range(8):
            m = tones[pat[s_]] + 12
            add('music', pluck(hz(m)), t0 + s_ * B / 2, .07, pan=-.4 if s_ % 2 else .4)
    # sub bass
    if SAFE <= bi < OUTRO:
        if full:
            for s_ in range(8):
                oct_ = 12 if s_ % 2 else 0
                add('bass', sub(hz(root + oct_), B / 2 * .9), t0 + s_ * B / 2, .32 if not oct_ else .2)
        elif PARENT <= bi < STATS:
            add('bass', sub(hz(root), BAR * .95), t0, .28)
        else:
            for h in (0, 2):
                add('bass', sub(hz(root), B * 1.8), t0 + h * B, .32)
    # drums
    if groove and not (PARENT <= bi < STATS):
        for q in range(4):
            tq = t0 + q * B
            if full or q in (0, 2) or STATS <= bi < WEB:
                add('drums', kick(), tq, .9); kick_times.append(tq)
            if q in (1, 3):
                add('drums', clap() if full else snap(), tq, .55 if full else .4)
            if full or STATS <= bi < WEB:
                for e in range(4):
                    add('drums', hat(), tq + e * B / 4, (.16 if e == 2 else .08) * (1.2 if full else .9), pan=.25)
                if full and q == 3: add('drums', hat(True), tq + B / 2, .12, pan=.3)
            else:
                add('drums', hat(), tq + B / 2, .12, pan=.25)
        if full:
            for e in range(8): add('drums', shaker(), t0 + e * B / 2 + B / 4, .1, pan=-.3)
    if PARENT <= bi < STATS:   # breakdown: just a soft heartbeat kick
        for q in (0,): add('drums', kick(), t0 + q * B, .55); kick_times.append(t0)
    # snare roll building through the numbers
    if STATS <= bi < WEB:
        prog_ = (bi - STATS) / (WEB - STATS)
        div = 4 if prog_ < .34 else 8 if prog_ < .67 else 16
        for e in range(div):
            add('drums', snap(), t0 + e * BAR / div, .12 + .25 * (prog_ + e / div / 3), pan=0)

# lead melody (bell) over the choruses: two-bar phrases in 8ths, None = rest
MEL = [[74, None, 78, None, 81, 78, 76, None], [76, None, 73, None, 76, 78, 81, None],
       [83, None, 81, 78, None, 76, 78, None], [79, None, 78, 76, 74, None, None, None]]
for bi in list(range(GAME, PARENT)) + list(range(WEB, OUTRO)):
    for s_, m in enumerate(MEL[bi % 4]):
        if m: add('lead', bell(hz(m), 1.6), bar(bi) + s_ * B / 2, .1, pan=.15)
# a gentler melody on the EP in the breakdown
for bi in range(PARENT, STATS):
    for s_, m in enumerate(MEL[bi % 4]):
        if m and s_ % 2 == 0: add('lead', ep_note(hz(m), B * .9), bar(bi) + s_ * B / 2, .1, pan=-.1)

# hook: three thuds on the hard cuts, the pad opening underneath, then a reverse swell into the logo
for q in range(3):
    add('fx', boom(1.0), q * B, .45)
    add('fx', tick(900), q * B, .25)
add('fx', rev_cymbal(bar(LOGO) - 3 * B), 3 * B, .35)
add('fx', riser(bar(LOGO) - 3 * B), 3 * B, .06)

# every scene change: a whoosh leading in and a boom on the downbeat
MARKS = [LOGO, SAFE, GAME, PARENT, STATS, WEB, OUTRO]
for mb in MARKS:
    tm = bar(mb)
    add('fx', whoosh(.8), tm - .55, .35, pan=-.2)
    add('fx', boom(), tm, .55 if mb in (LOGO, GAME, WEB, OUTRO) else .35)
    if mb in (GAME, WEB):
        add('fx', rev_cymbal(BAR), tm - BAR, .22)
# logo: bell chord + shimmer
for m in (74, 81, 86, 90): add('lead', bell(hz(m), 3.2), bar(LOGO) + .3, .07)
# safety: the phone buzz in the clip (clip starts .45s into the scene, buzz 2.05s in) and the step ticks
cu = bar(SAFE) + .45
add('fx', buzz(), cu + 2.05, .42); add('fx', buzz(), cu + 2.48, .42)
for m in (0, 2.05, 3.3, 8.8): add('fx', tick(), cu + m, .16)
# parents: the three promises pop on the beat
for k in range(3): add('fx', popfx(), bar(PARENT) + 3.2 + k * B, .28)
# numbers: a quick tick train while each card counts
for k in range(3):
    t0 = bar(STATS) + 1.1 + k * B + .1
    for j in range(14):
        tt = t0 + 1.5 * (1 - (1 - j / 14) ** 2)
        add('fx', tick(1500 + j * 60), tt, .06)
# outro: last chord rings, a final bell
for m in (50, 62, 66, 69, 74, 78): add('lead', bell(hz(m), 5), bar(OUTRO) + .05, .06)
add('pad', supersaw([62, 66, 69, 74], BAR * 3.6), bar(OUTRO), .5)
for j, m in enumerate((62, 66, 69, 74)): add('music', ep_note(hz(m), BAR * 1.8), bar(OUTRO + 2) + j * .008, .1, pan=(j - 1.5) * .2)
add('bass', sub(hz(38), BAR * 3.2), bar(OUTRO), .22)
add('lead', bell(hz(86), 3), bar(OUTRO) + 3.2, .06)

# ── mix ─────────────────────────────────────────────────────────────────────
# sidechain: pad and bass duck under each kick, the pumping feel of a modern pop track
duck = np.ones(N)
dn = int(.32 * SR); shape = 1 - .55 * np.exp(-T(dn) * 9)
for kt in kick_times:
    i = int(kt * SR); j = min(N, i + dn); duck[i:j] = np.minimum(duck[i:j], shape[: j - i])
bus['pad'] *= duck[:, None]; bus['bass'] *= (0.5 + 0.5 * duck)[:, None]

# a synthetic stereo room: decaying filtered noise impulse response
irn = int(2.4 * SR); it = T(irn)
ir = np.stack([filt(rng.standard_normal(irn), 'low', 6000) * np.exp(-it * 2.6) for _ in range(2)], 1)
ir[: int(.012 * SR)] = 0; ir /= np.abs(ir).sum(0) * .02
def reverb(x, wet):
    y = np.stack([fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1)
    return x + y * wet

mix = (reverb(bus['pad'], .25) * .9 + reverb(bus['music'], .22) + reverb(bus['lead'], .35) * 1.1
       + bus['bass'] * 1.0 + reverb(bus['drums'], .08) * .95 + reverb(bus['fx'], .2) * .9)
mix = filt(mix, 'high', 28, 2)

# master: slow RMS compression, then a soft clip, then normalise
win = int(.05 * SR)
rms = np.sqrt(np.convolve((mix ** 2).mean(1), np.ones(win) / win, 'same') + 1e-9)
thr = np.percentile(rms, 80)
gain = np.where(rms > thr, (thr / rms) ** .28, 1.0)
gain = np.convolve(gain, np.ones(win) / win, 'same')
mix *= gain[:, None]
mix = np.tanh(mix / np.abs(mix).max() * 1.6) / np.tanh(1.6)
fade = int(1.8 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.6
mix[: int(.05 * SR)] *= np.linspace(0, 1, int(.05 * SR))[:, None]
mix = mix / np.abs(mix).max() * .9
wavfile.write('score2.wav', SR, (mix * 32767).astype(np.int16))
print('score2.wav', round(DUR, 2), 's')
