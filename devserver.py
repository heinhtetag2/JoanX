#!/usr/bin/env python3
"""Tiny dev server for the JoanX static prototype.

- Sends no-cache headers so a normal reload always fetches fresh files.
- Injects a live-reload poller into HTML responses, so the page auto-reloads
  whenever any watched source file changes (no manual refresh needed).

Run:  python3 devserver.py
"""
import http.server
import socketserver
import os
import glob

PORT = 8000
ROOT = os.path.dirname(os.path.abspath(__file__))
WATCH_GLOBS = ['app/**/*.jsx', 'app/**/*.css', '*.html', '*.js', '*.json']

LIVERELOAD = """
<script>
(function () {
  var last = null;
  function poll() {
    fetch('/__mtime', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        if (last === null) last = t;
        else if (t !== last) location.reload();
      })
      .catch(function () {})
      .then(function () { setTimeout(poll, 700); });
  }
  poll();
  // dev-only: ?auto=parent[&bottom] drives the parent Reports view for screenshots
  if (location.search.indexOf('auto=parent') >= 0) {
    setTimeout(function () {
      var b = document.querySelectorAll('button');
      for (var i = 0; i < b.length; i++) { if (b[i].textContent.indexOf('Parent app') >= 0) { b[i].click(); break; } }
      var tw = document.querySelector('.tweaks'); if (tw) tw.style.display = 'none';
      var tb = document.querySelector('.topbar'); if (tb) tb.style.display = 'none';
      setTimeout(function () {
        var sc = document.querySelector('.screen .no-sb');
        if (sc) sc.scrollTop = (location.search.indexOf('bottom') >= 0) ? sc.scrollHeight : 0;
      }, 700);
    }, 900);
  }
})();
</script>
"""


def latest_mtime():
    m = 0.0
    for g in WATCH_GLOBS:
        for f in glob.glob(os.path.join(ROOT, g), recursive=True):
            try:
                m = max(m, os.path.getmtime(f))
            except OSError:
                pass
    return m


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path.startswith('/__mtime'):
            body = ('%.3f' % latest_mtime()).encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        path = self.path.split('?', 1)[0]
        if path == '/' or path.endswith('.html'):
            fp = self.translate_path(self.path)
            if os.path.isdir(fp):
                fp = os.path.join(fp, 'index.html')
            if os.path.isfile(fp):
                with open(fp, 'rb') as f:
                    html = f.read().decode('utf-8', errors='replace')
                if '</body>' in html:
                    html = html.replace('</body>', LIVERELOAD + '</body>', 1)
                else:
                    html += LIVERELOAD
                data = html.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        return super().do_GET()

    def log_message(self, *args):
        pass  # quiet


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


os.chdir(ROOT)
with Server(('127.0.0.1', PORT), Handler) as httpd:
    print('JoanX dev server (no-cache + live-reload) on http://127.0.0.1:%d' % PORT)
    httpd.serve_forever()
