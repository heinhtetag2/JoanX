# Music + sound design for the 66s JoanX promo, synthesized from scratch (no samples, no licences).
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 66.0
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(7)

BPM = 104
BEAT = 60 / BPM
BAR = BEAT * 4

def t_arr(n): return np.arange(n) / SR
def midi(m): return 440 * 2 ** ((m - 69) / 12)
def lp(x, hz, order=2): return sosfilt(butter(order, hz, 'low', fs=SR, output='sos'), x)
def hp(x, hz, order=2): return sosfilt(butter(order, hz, 'high', fs=SR, output='sos'), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], 'band', fs=SR, output='sos'), x)

def add(sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    gl, gr = gain * np.sqrt((1 - pan) / 2), gain * np.sqrt((1 + pan) / 2)
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr

def env(n, a, d, s, r_, total):
    """ADSR in seconds over a note of `total` seconds."""
    e = np.ones(n) * s
    ia, id_, ir = int(a * SR), int(d * SR), int(r_ * SR)
    it = int(total * SR)
    e[:ia] = np.linspace(0, 1, max(ia, 1))[:ia]
    e[ia:ia + id_] = np.linspace(1, s, max(id_, 1))[: len(e[ia:ia + id_])]
    if it < n: e[it:] = s * np.exp(-np.arange(n - it) / max(ir, 1) * 5)
    return e

# ── arrangement ──────────────────────────────────────────────────────────────
# C – Am – F – G, warm and bright; the sections follow the edit
CHORDS = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]
ROOTS = [36, 33, 29, 31]
T_LOGO, T_S3, T_S4, T_S5, T_S6, T_S7 = 4.0, 7.6, 20.6, 35.0, 47.0, 59.0

def level(t):
    """how full the band is at time t (0 intro … 1 full)"""
    if t < T_LOGO: return .35
    if t < T_S4: return .7
    if t < T_S7: return 1.0
    return .55

# pad — detuned saws, low-passed, one chord per bar
bar_t = 0.0
k = 0
while bar_t < DUR:
    ch = CHORDS[k % 4]
    n = int((BAR + 1.2) * SR)
    tt = t_arr(n)
    s = np.zeros(n)
    for m in ch:
        f = midi(m)
        for det in (-0.12, 0.0, 0.12):
            ph = 2 * np.pi * f * 2 ** (det / 12) * tt
            s += (2 * ((ph / (2 * np.pi)) % 1) - 1) * 0.33
    s = lp(s, 1500 if bar_t < T_LOGO else 2600) * env(n, .35, .4, .85, .9, BAR)
    add(s, bar_t, .045 * (0.8 + .4 * level(bar_t)), pan=0)
    bar_t += BAR; k += 1

# pluck arpeggio — eighths through the chord, a little delay for space
def pluck(f, dur=.5):
    n = int(dur * SR); tt = t_arr(n)
    s = np.sin(2 * np.pi * f * tt) + .35 * np.sin(2 * np.pi * 2 * f * tt) + .12 * np.sin(2 * np.pi * 3 * f * tt)
    return s * np.exp(-tt * 7) * np.minimum(1, tt * 400)
step = BEAT / 2
i = 0
pattern = [0, 2, 1, 3, 2, 1, 3, 2]
while i * step < T_S7 + BAR * 1.5:
    t = i * step
    ch = CHORDS[int(t // BAR) % 4]
    m = ch[pattern[i % 8]] + 12
    g = .085 * (.6 + .5 * level(t))
    pan = -.35 if i % 2 else .35
    p = pluck(midi(m))
    add(p, t, g, pan)
    add(lp(p, 3000), t + BEAT * .75, g * .35, -pan)   # dotted echo
    i += 1

# bass — root on 1 and 3 once the story starts
t = T_S3
while t < T_S7:
    root = ROOTS[int(t // BAR) % 4]
    for b in (0, 2):
        n = int(BEAT * 1.6 * SR); tt = t_arr(n)
        f = midi(root)
        s = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * 2 * f * tt)) * np.exp(-tt * 2.2) * np.minimum(1, tt * 300)
        add(s, t + b * BEAT, .16)
    t += BAR

# drums — soft kick on 1 & 3 from the safety scene, hats from the game scene
def kick():
    n = int(.35 * SR); tt = t_arr(n)
    f = 110 * np.exp(-tt * 18) + 45
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
def hat():
    n = int(.06 * SR); tt = t_arr(n)
    return hp(rng.standard_normal(n), 7000) * np.exp(-tt * 70)
def clap():
    n = int(.18 * SR); tt = t_arr(n)
    return bp(rng.standard_normal(n), 900, 3500) * np.exp(-tt * 22)
t = T_S3 + (BAR - (T_S3 % BAR)) % BAR
while t < T_S7 - .05:
    for b in range(4):
        tb = t + b * BEAT
        if tb >= T_S7: break
        if b in (0, 2): add(kick(), tb, .5)
        if t >= T_S4 and b in (1, 3): add(clap(), tb, .09)
        if t >= T_S4: add(hat(), tb + BEAT / 2, .06, .3)
    t += BAR

# ── sound design ─────────────────────────────────────────────────────────────
def whoosh(at, dur=.7, gain=.22):
    n = int(dur * SR); tt = t_arr(n)
    noise = rng.standard_normal(n)
    sweep = np.zeros(n)
    # band sweeps upward and swells into the cut
    for j, frac in enumerate(np.linspace(0, 1, 8)):
        seg = slice(int(j * n / 8), int((j + 1) * n / 8))
        lo = 300 + 3000 * frac
        sweep[seg] = bp(noise, lo, lo * 2.2)[seg]
    e = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2
    add(sweep * e, at - dur * .75, gain, -.2)
    add(sweep[::-1] * e * .6, at - dur * .75, gain * .7, .2)

def bell(at, notes, gain=.12):
    for m in notes:
        n = int(3.5 * SR); tt = t_arr(n); f = midi(m)
        s = (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.76 * tt) * np.exp(-tt * 3) + .25 * np.sin(2 * np.pi * f * 5.4 * tt) * np.exp(-tt * 6))
        add(s * np.exp(-tt * 1.1) * np.minimum(1, tt * 500), at, gain)

def buzz(at, dur=.32, gain=.2):
    n = int(dur * SR); tt = t_arr(n)
    s = np.sign(np.sin(2 * np.pi * 150 * tt)) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * tt))
    s = lp(s, 900) * np.minimum(1, tt * 200) * np.minimum(1, (dur - tt) * 60)
    add(s, at, gain)

def tick(at, gain=.1, f=1900):
    n = int(.09 * SR); tt = t_arr(n)
    add(np.sin(2 * np.pi * f * tt) * np.exp(-tt * 60), at, gain)

def pop(at, gain=.12):
    n = int(.14 * SR); tt = t_arr(n)
    f = 500 + 900 * np.exp(-tt * 30)
    add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 28), at, gain)

def riser(at, dur=1.2, gain=.08):
    n = int(dur * SR); tt = t_arr(n)
    f = 200 * 2 ** (tt / dur * 3)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (tt / dur) ** 2
    add(lp(s, 4000), at - dur, gain)

for tr in (T_LOGO, T_S3, T_S4, T_S5, T_S6, T_S7):
    whoosh(tr + .35)
riser(T_LOGO + .45, 1.6, .07)
bell(T_LOGO + .45, [72, 79, 84], .07)                       # the wordmark lands

cu = T_S3 + .5                                               # the warning clip starts here
buzz(cu + 2.05); buzz(cu + 2.5)                              # the phone buzzes in the clip
for m in (0, 2.2, 3.4, 8.8): tick(cu + m, .09)               # each step lights up
for k_ in range(3): pop(T_S5 + 4.2 + k_ * .35, .13)          # the three promises
bell(T_S7 + .5, [60, 67, 72, 76], .06)                       # outro chord
bell(T_S7 + 1.35, [84], .05)

# tail: final C chord pad through the outro
n = int(7 * SR); tt = t_arr(n); s = np.zeros(n)
for m in (48, 60, 64, 67, 72):
    s += np.sin(2 * np.pi * midi(m) * tt) + .3 * np.sin(2 * np.pi * 2 * midi(m) * tt)
add(lp(s, 2000) * np.minimum(1, tt * 1.5) * np.exp(-tt * .35), T_S7, .035)

# ── mix: a little room, gentle fade in/out, normalise ───────────────────────
def room(x):
    y = x.copy()
    for d, g in ((.031, .28), (.047, .22), (.073, .18), (.11, .12), (.17, .08)):
        k_ = int(d * SR); y[k_:] += x[:-k_] * g
    return lp(y, 7000)
L, R = room(L), room(R)
fade_in, fade_out = int(.6 * SR), int(2.2 * SR)
ramp = np.ones(N); ramp[:fade_in] = np.linspace(0, 1, fade_in); ramp[-fade_out:] = np.linspace(1, 0, fade_out) ** 1.5
L *= ramp; R *= ramp
peak = max(np.abs(L).max(), np.abs(R).max())
L, R = L / peak * .89, R / peak * .89
wavfile.write('score.wav', SR, (np.stack([L, R], 1) * 32767).astype(np.int16))
print('ok', DUR, 's')
