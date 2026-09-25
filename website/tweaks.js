/* ── Website tweaks ─────────────────────────────────────────────────────
   A small review panel for comparing landing-page versions, the website's
   counterpart to the app's own Tweaks panel. It only appears inside the
   prototype build (served under /website/); the published page has no
   sibling versions to switch to, so there it never renders.

   Adding a version: create website/<id>/index.html (media paths "../media/")
   and list it in VERSIONS and in vite.config.js.                          */

const VERSIONS = [
  { id: 'v1', label: 'AI generated', note: 'The AI-generated page', href: '/website/' },
  { id: 'v2', label: 'Human + AI', note: 'Made by a human, with AI', href: '/website/v2/' },
];

const path = location.pathname;
if (/^\/website(\/|$)/.test(path)) {
  const current = VERSIONS.find(v => v.id !== 'v1' && path.startsWith(v.href)) || VERSIONS[0];
  const KEY = 'joanx.site.tweaks.open';
  let open = true;
  try { open = localStorage.getItem(KEY) !== '0'; } catch (e) { /* private window */ }

  const css = `
  .sitetw { position: fixed; right: 16px; bottom: 16px; z-index: 90; font-family: "Noto Sans KR", -apple-system, sans-serif; }
  .sitetw-panel { width: 236px; background: var(--surface, #fff); color: var(--ink, #1A201C); border: 1px solid var(--line-2, #CFD8CA); border-radius: 16px; padding: 12px; }
  .sitetw-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .sitetw-head b { font-size: 13px; font-weight: 700; }
  .sitetw-x { border: 0; background: none; cursor: pointer; color: var(--ink-soft, #868D82); font-size: 18px; line-height: 1; padding: 2px 4px; }
  .sitetw-label { font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft, #868D82); margin-bottom: 6px; }
  .sitetw-seg { display: flex; gap: 2px; padding: 3px; border-radius: 999px; background: var(--switch-track, rgba(26,32,28,.11)); }
  .sitetw-seg a { flex: 1; text-align: center; text-decoration: none; font-size: 13px; font-weight: 700; padding: 8px 0; border-radius: 999px; color: var(--ink-2, #52594F); }
  .sitetw-seg a[aria-current="page"] { background: var(--ink, #1A201C); color: var(--ground, #fff); }
  .sitetw-note { font-size: 12px; color: var(--ink-2, #52594F); margin-top: 8px; }
  .sitetw-open { border: 1px solid var(--line-2, #CFD8CA); background: var(--surface, #fff); color: var(--ink, #1A201C); border-radius: 999px; padding: 9px 14px; font: 700 13px/1 inherit; cursor: pointer; }
  @media (max-width: 520px) { .sitetw { right: 10px; bottom: 10px; } .sitetw-panel { width: 210px; } }
  @media print { .sitetw { display: none; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.className = 'sitetw';
  document.body.appendChild(root);

  const render = () => {
    if (!open) {
      root.innerHTML = '<button type="button" class="sitetw-open">Tweaks</button>';
      root.firstChild.onclick = () => set(true);
      return;
    }
    // the hash rides along, so switching versions lands on the same section
    const links = VERSIONS.map(v =>
      `<a href="${v.href}${location.hash}"${v.id === current.id ? ' aria-current="page"' : ''}>${v.label}</a>`).join('');
    root.innerHTML = `
      <div class="sitetw-panel" role="region" aria-label="Tweaks">
        <div class="sitetw-head"><b>Tweaks</b><button type="button" class="sitetw-x" aria-label="Close">×</button></div>
        <div class="sitetw-label">Website version</div>
        <div class="sitetw-seg">${links}</div>
        <div class="sitetw-note">${current.note}</div>
      </div>`;
    root.querySelector('.sitetw-x').onclick = () => set(false);
  };
  const set = v => {
    open = v;
    try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) { /* ignore */ }
    render();
  };
  render();
  addEventListener('hashchange', render);
}
