// Captures the store-listing app screens, in English and Korean, straight from the prototype.
//
//   npm run dev                                   # the app must be served (default :5173)
//   node scripts/capture-store-screens.mjs        # all screens, both languages
//   node scripts/capture-store-screens.mjs stage-card parent-alerts   # just these
//   LANGS=ko BASE=http://localhost:5173 node scripts/capture-store-screens.mjs
//
// Output: public/store/screens/{en,ko}/<name>.png, each 535x1200 — the phone's screen
// only (no bezel, island, status bar, Tweaks panel or app switcher), square-cornered, the same crop as
// website/media/shots/. The app is driven through its own Tweaks panel and tab bars; every shot
// runs in a fresh browser context so no buddy/localStorage state carries between them.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE || 'http://localhost:5173';
const LANGS = (process.env.LANGS || 'en,ko').split(',');
const OUT = 'public/store/screens';
const SIZE = [535, 1200];
// .screen is 366x820 CSS px; this DPR lands it on ~535x1199 before the final exact resize
const DPR = SIZE[0] / 366;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const tweak = (page, text) => page.locator('.tweaks button', { hasText: text }).first().click();
const tab = (page, i) => page.locator('.screen button').filter({ has: page.locator(`svg.lucide-${i}`) }).last().click();

// Intervention stages are time-driven (grace 2.6s → buzz 2s → warning 5s → message, whose
// line swaps every 4.5s). Trigger, wait for the stage, then Tweaks → Hold to freeze it.
async function warning(page, until, extraMs) {
  await tweak(page, 'Trigger a warning');
  await page.waitForFunction(until, null, { timeout: 20000, polling: 100 });
  if (extraMs) await sleep(extraMs);
  await tweak(page, 'Hold this step');
  await sleep(1400);   // let entrance animations finish
}

const SHOTS = {
  'child-home': { run: async () => sleep(1500) },
  'stage-buzz': { run: (p) => warning(p, () => !!document.querySelector('.screen .jx-ring')) },
  // stage 2: the buzz ring is gone and no bottom-sheet message yet
  'stage-card': { run: (p) => warning(p, () => window.__jxPhaseSeen?.buzz && !document.querySelector('.screen .jx-ring'), 300), watchBuzz: true },
  // stage 3: the warning holds 5s before the message sheet; its second (firm) line swaps in 4.5s later
  'stage-message': { run: (p) => warning(p, () => window.__jxPhaseSeen?.buzz && !document.querySelector('.screen .jx-ring'), 5000 + 4900), watchBuzz: true },
  'child-battle-versus': { run: async (p) => { await tweak(p, 'Preview versus'); await sleep(3500); } },
  'child-battle-result': { run: async (p) => { await tweak(p, 'Preview result'); await sleep(3500); } },
  // the road opens with the current villain's card up; tap bare map ground to dismiss it
  'child-villain-road': {
    run: async (p) => {
      await tweak(p, 'Road map'); await sleep(2000);
      const box = await p.locator('.screen').boundingBox();
      await p.mouse.click(box.x + 40, box.y + 400); await sleep(1200);
    },
  },
  'child-decorate': {
    query: '&detail=char-showcase',
    run: async (p) => {
      await p.locator('.screen button').filter({ has: p.locator('svg.lucide-shirt') }).first().click();
      await sleep(900);
      await p.locator('.screen button').filter({ has: p.locator('svg.lucide-shirt') }).last().click();   // Coat tab
      await sleep(700);
      await p.locator('.screen button', { hasText: /Tan Trench|트렌치/ }).first().click();
      await sleep(1500);
    },
  },
  // the buddy's room — Dream Room, furnished the way a child does it: tap a piece's puck on the
  // right edge, then drag its tile out of the sheet onto the room (a drop closes the sheet).
  // Targets are fractions of the phone screen, matching a hand-arranged room.
  'child-room': {
    query: '&screen=myhouse',
    run: async (p) => {
      await sleep(1500);
      const screen = await p.locator('.screen').boundingBox();
      const pieces = [
        ['moon-star', /Celestial|천체|오너먼트|장식/, 0.26, 0.24],
        ['archive',   /Cabinet|캐비닛|수납장|장식장/, 0.16, 0.66],
        ['armchair',  /Armchair|안락의자|의자/,       0.80, 0.68],
        ['square',    /Flower Rug|러그/,             0.50, 0.78],
      ];
      for (const [icon, name, fx, fy] of pieces) {
        await p.locator('.screen button').filter({ has: p.locator(`svg.lucide-${icon}`) }).last().click();
        await sleep(900);
        const tile = p.locator('.screen button, .screen div', { hasText: name }).last();
        const t = await tile.boundingBox();
        const tx = screen.x + screen.width * fx, ty = screen.y + screen.height * fy;
        await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2);
        await p.mouse.down();
        for (let i = 1; i <= 20; i++) {
          await p.mouse.move(t.x + t.width / 2 + (tx - t.x - t.width / 2) * i / 20, t.y + t.height / 2 + (ty - t.y - t.height / 2) * i / 20);
          await sleep(16);
        }
        await p.mouse.up();
        await sleep(900);
        // a drop leaves a ✓ / delete bubble over the room; confirm it before the next piece
        await p.locator('button[aria-label="Done"], button[aria-label="완료"]').last().click();   // rendered outside .screen
        await sleep(900);
      }
      await sleep(1200);
    },
  },
  'parent-reports': { run: async (p) => { await p.locator('.topbar button', { hasText: 'Parent app' }).click(); await sleep(2000); } },
  'parent-alerts': { run: async (p) => { await p.locator('.topbar button', { hasText: 'Parent app' }).click(); await sleep(800); await tab(p, 'bell'); await sleep(1500); } },
};

const only = process.argv.slice(2);
const names = only.length ? only : Object.keys(SHOTS);
const browser = await chromium.launch();
for (const lang of LANGS) {
  mkdirSync(`${OUT}/${lang}`, { recursive: true });
  for (const name of names) {
    const shot = SHOTS[name];
    if (!shot) { console.error(`unknown screen: ${name}`); continue; }
    // tall enough that the phone's fit-to-window scale stays at 1
    const ctx = await browser.newContext({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: DPR });
    const page = await ctx.newPage();
    await page.addInitScript(() => { try { localStorage.removeItem('jx.buddy'); } catch (e) { /* */ } });
    await page.goto(`${BASE}/?app&nodev${shot.query || ''}`, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: '.screen{border-radius:0!important} .island{display:none!important} .screen > div:nth-child(2){visibility:hidden!important}' });
    await tweak(page, lang === 'en' ? 'English' : '한국어');
    if (shot.watchBuzz) {
      await page.evaluate(() => {
        window.__jxPhaseSeen = {};
        const iv = setInterval(() => { if (document.querySelector('.screen .jx-ring')) { window.__jxPhaseSeen.buzz = true; clearInterval(iv); } }, 50);
      });
    }
    await sleep(500);
    await shot.run(page);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    });
    const file = `${OUT}/${lang}/${name}.png`;
    await page.locator('.screen').screenshot({ path: file, animations: 'allow' });
    execFileSync('sips', ['-z', String(SIZE[1]), String(SIZE[0]), file], { stdio: 'ignore' });
    console.log(file);
    await ctx.close();
  }
}
await browser.close();
