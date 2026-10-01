import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
const RATE = +(process.env.RATE || 0.36);
const BASE='http://localhost:5173', OUT='/private/tmp/claude-501/-Users-heinhtet-Documents-JoanX/a51edeff-9297-453c-96c8-d57db6a54f92/scratchpad/clips', FPS=30;
const sleep = ms => new Promise(r => setTimeout(r, ms));
let PAGE = null;
const wait = async ms => { for (let t = 0; t < ms; t += 50) { await PAGE.clock.runFor(Math.min(50, ms - t)); await sleep(12); } };
const tweak = (p, t) => p.locator('.tweaks button', { hasText: t }).first().click();
const tab = (p, i) => p.locator('.screen button').filter({ has: p.locator('svg.lucide-' + i) }).last().click();
const parent = async p => { await p.locator('.topbar button', { hasText: 'Parent app' }).click(); await wait(900); };
async function scrollScreen(p, px) {
  await p.evaluate(px => {
    const s = document.querySelector('.screen');
    const all = [...s.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 40 && getComputedStyle(e).overflowY.match(/auto|scroll/));
    const sc = all.sort((a, b) => b.clientHeight - a.clientHeight)[0]; if (sc) sc.scrollTop += px;
  }, px);
}
const CLIPS = {
  home:      { secs: 3.2 },
  warning:   { secs: 12.5, at: { 0: p => tweak(p, 'Trigger a warning') } },
  versus:    { secs: 4.2, at: { 0: p => tweak(p, 'Preview versus') } },
  result:    { secs: 3.6, at: { 0: p => tweak(p, 'Preview result') } },
  road:      { secs: 3.2, pre: async p => { await tweak(p, 'Road map'); await wait(2600); } },
  house:     { secs: 3.4, query: '&screen=myhouse', pre: () => wait(1800) },
  collection:{ secs: 3.0, query: '&screen=collection', pre: () => wait(1600) },
  reports:   { secs: 4.6, pre: async p => { await parent(p); await wait(900); }, every: p => scrollScreen(p, 3) },
  alerts:    { secs: 3.0, pre: async p => { await parent(p); await tab(p, 'bell'); await wait(1400); } },
  children:  { secs: 3.0, pre: async p => { await parent(p); await tab(p, 'puzzle'); await wait(1400); } },
};
const only = process.argv.slice(2), names = only.length ? only : Object.keys(CLIPS);
const b = await chromium.launch();
for (const name of names) {
  const c = CLIPS[name];
  const ctx = await b.newContext({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 1.6 });
  const p = await ctx.newPage(); PAGE = p;
  await p.clock.install();
  await p.addInitScript(() => { try { localStorage.removeItem('jx.buddy'); } catch (e) {} });
  await p.goto(BASE + '/?app&nodev' + (c.query || ''), { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: '.screen{border-radius:0!important} .island{display:none!important} .screen > div:nth-child(2){visibility:hidden!important}' });
  await wait(1500); await tweak(p, '한국어'); await wait(700);
  if (c.pre) await c.pre(p);
  mkdirSync(OUT + '/' + name, { recursive: true });
  const el = p.locator('.screen'), N = Math.round(c.secs * FPS), t0 = Date.now();
  // CSS animations run on real time; slow them to the capture pace so they match the virtual clock
  const cdp = await ctx.newCDPSession(p); await cdp.send('Animation.enable');
  await cdp.send('Animation.setPlaybackRate', { playbackRate: RATE });
  for (let i = 0; i < N; i++) {
    if (c.at && c.at[i]) await c.at[i](p);
    if (c.every) await c.every(p);
    await p.clock.runFor(1000 / FPS); await sleep(8);
    await el.screenshot({ path: OUT + '/' + name + '/f' + String(i).padStart(4, '0') + '.jpg', type: 'jpeg', quality: 90, animations: 'allow' });
  }
  console.log(name, N, 'frames, real', ((Date.now() - t0) / 1000).toFixed(1) + 's for', c.secs + 's');
  await ctx.close();
}
await b.close();
