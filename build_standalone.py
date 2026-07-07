#!/usr/bin/env python3
"""Regenerate "JoanX Prototype (standalone).html" from index.html.

Inlines every local asset (app/*.css, app/*.jsx, the background image) AND the
CDN libraries (React, ReactDOM, Babel-standalone, lucide) into a single,
fully self-contained HTML file that runs with no network and no build step.

Run:  python3 build_standalone.py
"""
import base64
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'index.html')
OUT = os.path.join(ROOT, 'JoanX Prototype (standalone).html')


def read(path):
    with open(os.path.join(ROOT, path), 'r', encoding='utf-8') as f:
        return f.read()


def esc(js):
    # a script body must not contain a literal </script>
    return js.replace('</script', '<\\/script')


def fetch(url):
    print('  fetching', url)
    out = subprocess.run(['curl', '-sSL', url], capture_output=True, timeout=120)
    if out.returncode != 0:
        raise RuntimeError('curl failed for %s: %s' % (url, out.stderr.decode('utf-8', 'replace')))
    return out.stdout.decode('utf-8', 'replace')


html = read('index.html')

# 1) inline CDN <script src="https://…"> (drop integrity/crossorigin)
def sub_cdn(m):
    return '<script>\n' + esc(fetch(m.group(1))) + '\n</script>'
html = re.sub(r'<script\s+src="(https://[^"]+)"[^>]*>\s*</script>', sub_cdn, html)

# 2) inline local babel modules: <script type="text/babel" src="app/X.jsx?v=..">
def sub_jsx(m):
    return '<script type="text/babel">\n' + esc(read('app/' + m.group(1))) + '\n</script>'
html = re.sub(r'<script\s+type="text/babel"\s+src="app/([^"?]+)(?:\?[^"]*)?"\s*></script>', sub_jsx, html)

# 3) inline local stylesheets: <link rel="stylesheet" href="app/X.css">
def sub_css(m):
    return '<style>\n' + read('app/' + m.group(1)) + '\n</style>'
html = re.sub(r'<link\s+rel="stylesheet"\s+href="app/([^"]+)"\s*>', sub_css, html)

# 4) inline the page background image as a data URI
_bg = 'app/assets/backgrounds/page-bg.jpg'
with open(os.path.join(ROOT, _bg), 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('ascii')
html = html.replace('url("%s")' % _bg, 'url("data:image/jpeg;base64,%s")' % b64)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

print('wrote %s (%.1f MB)' % (os.path.basename(OUT), len(html) / 1e6))
# sanity: no remaining external refs to our own assets or unpkg
leftover = re.findall(r'(src|href)="(app/[^"]+|https://unpkg[^"]+)"', html)
print('remaining external refs:', len(leftover), leftover[:3])
