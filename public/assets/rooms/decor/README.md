# Room decor items

Finished art for the placeable items in `DECOR` (`src/core/data.jsx`) —
plants, lamps, furniture, seasonal pieces. Same relationship as
`characters/outfits/<char>/` has to `OUTFITS`: one subfolder per scope,
one file per item `id`, dropped in as art gets finished. Until a file
lands here, the item renders as the drawn lucide `Icon name={d.icon}`
(see `RoomStage.jsx` / `DecorateRoom.jsx`).

Raw candidate renders (multiple style options per item, before one's
picked and redrawn flat) go in `/room-references/<room>/<item>/` at the
repo root instead — that tree is gitignored, this one is what ships.
See its `README.md` for the pipeline.

Subfolder = the `rooms` a `DECOR` row lists itself under:

- `green/` — Green Room only (`rooms: ['green']`)
- `town/` — Town Room only (`rooms: ['town']`)
- `dream/` — Dream Room only (`rooms: ['dream']`), seasonal pieces included
- `any/` — fits every room (`rooms: ['*']`)

File name = the `DECOR` row's `id`, unprefixed (ids are already unique
across the whole table, so no room prefix is needed), sitting directly
in its room folder:

| Folder | Files (id.png) |
| ------ | --------------- |
| `green/` | `plant`, `sapling`, `canteen`, `feeder`, `flowerbed`, `tent` |
| `town/`  | `lamp`, `mailbox`, `bench`, `signpost`, `busstop`, `shelf` |
| `dream/` | `moonlamp`, `cloud`, `rocket`, `crystal`, `rainbow`, `telescope`, `lantern`, `wreath2` |
| `any/`   | `rug`, `poster`, `balloon`, `trophy` |

Served at `/assets/rooms/decor/<room>/<id>.png`.

**Items that went through a moodboard first** get a category subfolder
instead — same name as its `/room-references/<room>/<category>/`
counterpart, so the shipped side and the raw side always line up. The
one flat file that gets picked and redrawn lands inside that subfolder,
still named after the `DECOR` id it'll wire to. Four such items are in
progress for the Dream Room, folders already waiting:

| `dream/` subfolder | Raw variants staged at | Suggested `DECOR` id |
| ------------------- | ----------------------- | --------------------- |
| `flower-rug/` | `/room-references/dream/flower-rug/` | `flowerrug` |
| `cozy-armchair/` | `/room-references/dream/cozy-armchair/` | `armchair` |
| `celestial-hanging-ornament/` | `/room-references/dream/celestial-hanging-ornament/` | `ornament` |
| `enchanted-shelf-cabinet/` | `/room-references/dream/enchanted-shelf-cabinet/` | `cabinet` |

Once one's picked: `/assets/rooms/decor/dream/flower-rug/flowerrug.png`, etc.

**Wiring a piece once its art lands:** `DECOR` rows don't read an `img`
field yet — only `icon`. Add `img: '/assets/rooms/decor/<room>/<id>.png'`
to the row (same as an `OUTFITS` row switching from `icon` to `img`,
e.g. `lumi-gold-hat`), then make `RoomStage.jsx` / `DecorateRoom.jsx`
render `d.img` in place of `Icon name={d.icon}` when it's set.
