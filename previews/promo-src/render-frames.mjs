import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto('file:///private/tmp/claude-501/-Users-heinhtet-Documents-JoanX/a51edeff-9297-453c-96c8-d57db6a54f92/scratchpad/promo/index.html'); await p.waitForTimeout(1500);
const D = await p.evaluate(() => window.DURATION), N = D * 30, t0 = Date.now();
for (let i = 0; i < N; i++) {
  await p.evaluate(t => window.render(t), i / 30);
  await p.screenshot({ path: '/private/tmp/claude-501/-Users-heinhtet-Documents-JoanX/a51edeff-9297-453c-96c8-d57db6a54f92/scratchpad/promo/out/f' + String(i).padStart(5, '0') + '.jpg', type: 'jpeg', quality: 93 });
}
console.log('frames', N, 'in', ((Date.now() - t0) / 1000).toFixed(0) + 's');
await b.close();
