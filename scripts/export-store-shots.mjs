// Renders website/store.html frames to PNG with headless Chromium.
// Needs the dev server running (npm run dev). Output: public/store/{play,ios}/{en,ko}/NN-slug.png
// (public/ so the docs screen in the app build can show them).
// Screens inside the phones come from scripts/capture-store-screens.mjs.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { execFileSync } from 'child_process';

const BASE = process.env.BASE || 'http://localhost:5173/website/store.html';
const SIZES = { play: { dpr: 1, out: [1080, 1920] }, ios: { dpr: 1320 / 1080, out: [1320, 2868] } };

const browser = await chromium.launch();
for (const lang of ['en', 'ko']) for (const [size, cfg] of Object.entries(SIZES)) {
  const dir = `public/store/${size}/${lang}`;
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1200 }, deviceScaleFactor: cfg.dpr });
  await page.goto(`${BASE}?export&size=${size}&lang=${lang}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  });
  for (const cell of await page.$$('.cell')) {
    const slug = await cell.getAttribute('data-slug');
    const file = `${dir}/${slug}.png`;
    await (await cell.$('.frame')).screenshot({ path: file });
    // pin exact store dimensions (fractional DPR can land a pixel off)
    execFileSync('sips', ['-z', String(cfg.out[1]), String(cfg.out[0]), file], { stdio: 'ignore' });
    console.log(file);
  }
  await page.close();
}
await browser.close();
