# Points icon

Finished art for the points icon (shown next to the point balance in
headers, Shop, Battle, Rewards, Profile, VillainDex, etc.). Replaces the
drawn lucide `Icon name="star"` used as the points glyph.

Served at `/assets/point/<file>`. Drop the PNG/SVG here, then wire it via
a small `<Foo>Icon` wrapper in `src/core/primitives.jsx` (see `PointIcon`)
so every call site imports one component instead of a raw `<img>` path.

For the safety-status shield, see `public/assets/safety/` instead.

| File | Used for |
| ---- | -------- |
| `star.png` | points balance icon (pill/header) — `PointIcon` |
