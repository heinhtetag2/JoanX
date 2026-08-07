import { chromium } from 'playwright';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 900, height: 950 } });

await page.goto('http://localhost:5173/?nodev', { waitUntil: 'load' });
await page.waitForTimeout(1200);

const clicked = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('.tweaks button'));
  const btn = btns.find(b => b.textContent.includes('Preview hatch'));
  if (!btn) return false;
  btn.click();
  return true;
});
console.log('clicked:', clicked);
await page.waitForTimeout(1000);
await page.screenshot({ path: '/private/tmp/claude-501/-Users-heinhtet-Documents-JoanX/556fdec4-dfab-4a33-b062-5dde3dad06e0/scratchpad/07-hatch-rare.png' });

await browser.close();
