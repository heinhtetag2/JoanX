# Badge images

Finished medallion art for achievements. Each PNG already includes the plate,
ring, ribbon and central icon — the app renders the whole image (see `BadgeArt`
in `src/child/Badges.jsx`) and skips the drawn rosette.

Served at `/assets/badges/<file>`. Wired via the `img` field on each row of
`ACHIEVEMENTS` in `src/core/data.jsx`.

| File                      | Achievement            |
| ------------------------- | ---------------------- |
| `badge-first-steps.png`   | First Steps (a1)       |
| `badge-quick-reflex.png`  | Quick Reflex (a3)      |
| `badge-zone-dodger.png`   | Zone Dodger (a4)       |
| `badge-collector.png`     | Collector (a5)         |
| `badge-early-walker.png`  | Early Walker (a6)      |
| `badge-crossing-pro.png`  | Crossing Pro (a7)      |
| `badge-helmet-hero.png`   | Helmet Hero (a9)       |
| `badge-safe-route.png`    | Safe Route (a11)       |

Naming: `badge-<achievement-slug>.png`. Every achievement now has art. To add a
badge, drop the PNG here and set `img` on its achievement row; a row without
`img` falls back to the drawn medallion + lucide `icon`.
