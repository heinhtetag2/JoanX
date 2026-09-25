/* ── Phone mockups follow the page language ──────────────────────────────
   Every capture in media/shots/ has a Korean twin in media/shots/ko/. The
   Korean files are only ever referenced from here, so they have to be pulled
   through the bundler explicitly — a plain string path would work on the dev
   server but not in the build, where Vite renames every image it ships.

   The page's own language switch just sets <html lang>; this watches that
   attribute, so it works whichever script runs first.                    */

let toKo;   // absolute English URL → Korean URL
try {
  const en = import.meta.glob('./media/shots/*.png', { eager: true, query: '?url', import: 'default' });
  const ko = import.meta.glob('./media/shots/ko/*.png', { eager: true, query: '?url', import: 'default' });
  toKo = new Map();
  for (const [key, url] of Object.entries(en)) {
    const twin = ko['./media/shots/ko/' + key.split('/').pop()];
    if (twin) toKo.set(new URL(url, location.href).href, twin);
  }
} catch (e) {
  toKo = null;   // served without the bundler (the standalone copy): the paths are untouched there
}

const shots = [...document.querySelectorAll('img')].filter(img => /media\/shots\/[^/]+\.png$/.test(img.src) || (toKo && toKo.has(img.src)));
shots.forEach(img => { img.dataset.srcEn = img.src; });

function apply() {
  const ko = document.documentElement.lang === 'ko';
  shots.forEach(img => {
    const en = img.dataset.srcEn;
    const next = !ko ? en : toKo ? toKo.get(en) : en.replace(/media\/shots\/([^/]+\.png)$/, 'media/shots/ko/$1');
    if (next && img.src !== new URL(next, location.href).href) img.src = next;
  });
}

apply();
new MutationObserver(apply).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
