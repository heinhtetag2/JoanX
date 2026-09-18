// Renders website/store.html frames to PNG with headless Chromium.
// Needs the dev server running (npm run dev). Output: public/store/{play,ios,tab7}/{en,ko}/NN-slug.png
// (public/ so the docs screen in the app build can show them).
// Screens inside the phones come from scripts/capture-store-screens.mjs.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE || 'http://localhost:5173/website/store.html';
// Every listing size: the authored frame is 1080 wide, so the scale is out-width / 1080.
// Play's tablet listings take 2–8 images each; the same 1200×1920 file serves both the 7"
// and 10" categories, so the tablet shape is exported once. Both stores want 24-bit PNG with no alpha, which `flatten` guarantees.
const SIZES = {
  play:  { dpr: 1,             out: [1080, 1920] },   // Play, phone
  ios:   { dpr: 1320 / 1080,   out: [1320, 2868] },   // App Store, iPhone 6.9"
  tab7:  { dpr: 1200 / 1080,   out: [1200, 1920] },   // Play tablets — one file for 7" and 10"
  // Play's other two listing assets. The icon keeps its alpha (Play wants 32-bit and masks
  // the corners itself); the feature graphic must not have one. Both are drawn at 2× and
  // scaled down, so their type and art stay crisp at these small fixed sizes.
  icon:    { dpr: 2, out: [512, 512], alpha: true },
  feature: { dpr: 2, out: [1024, 500] },
};

// sips resizes; Pillow drops the alpha channel Chromium writes, so the file is a plain
// 24-bit PNG (a screenshot with transparency is rejected by both stores).
const setMode = (file, mode) => execFileSync('python3', ['-c',
  'import sys\nfrom PIL import Image\nim = Image.open(sys.argv[1])\nif im.mode != sys.argv[2]:\n    im = im.convert(sys.argv[2])\nim.save(sys.argv[1])', file, mode], { stdio: 'ignore' });
const flatten = (file) => setMode(file, 'RGB');     // 24-bit, no alpha — screenshots + feature graphic
const withAlpha = (file) => setMode(file, 'RGBA');  // 32-bit — the app icon

// SIZES=icon,feature re-renders just those; default is every size.
const only = (process.env.SIZES || '').split(',').map(x => x.trim()).filter(Boolean);

const browser = await chromium.launch();
for (const lang of ['en', 'ko']) for (const [size, cfg] of Object.entries(SIZES)) {
  if (only.length && !only.includes(size)) continue;
  const dir = `public/store/${size}/${lang}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1200 }, deviceScaleFactor: cfg.dpr });
  await page.goto(`${BASE}?export&size=${size}&lang=${lang}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  for (const cell of await page.$$('.cell')) {
    if (await cell.evaluate(el => el.hidden)) continue;   // a size only renders its own cells
    const slug = await cell.getAttribute('data-slug');
    const file = `${dir}/${slug}.png`;
    await (await cell.$('.frame')).screenshot({ path: file });
    // pin exact store dimensions (fractional DPR can land a pixel off)
    execFileSync('sips', ['-z', String(cfg.out[1]), String(cfg.out[0]), file], { stdio: 'ignore' });
    cfg.alpha ? withAlpha(file) : flatten(file);
    console.log(file);
  }
  await page.close();
}
await browser.close();
