# child — the Child app (the game)

The kid-facing game: a buddy that grows (XP/levels) as the child walks phone-free.
Palette = `THEME` (ocean/green + per-buddy accent). Standard ES module exports.

## Layout — one screen per file

Each screen lives in its own file and is re-exported from `index.jsx` (the barrel
the rest of the app imports from):

| File | Screen |
|------|--------|
| `Onboarding.jsx` | Splash → intro slides → permissions → connect-to-parent (QR). |
| `ChildHome.jsx` | The classic Home (buddy hero, XP, stats, daily goal). |
| `SafetyStatus.jsx` | The raised-shield safety tab. |
| `Notifications.jsx` | Notifications feed. |
| `Profile.jsx` | Child profile & settings. |
| `Collection.jsx` | Buddy collection grid. |
| `CharacterDetail.jsx` | Buddy detail (color / stage / evolve / items). |
| `Battle.jsx` · `Rewards.jsx` · `Shop.jsx` | Battle flow, rewards, shop. |
| `CharacterDex.jsx` · `VillainDex.jsx` | Encyclopedias (villain dex holds its road/list sub-views). |
| `Friends.jsx` · `FriendHouse.jsx` | Friends list + a friend's house. |
| `MyHouse.jsx` · `DecorateRoom.jsx` · `AddFriends.jsx` | House, room decorating, add-friends. |
| `WarningOverlay.jsx` · `LiteBlock.jsx` | Safety-moment overlays (Smart warning / Lite block). |

### Variant galleries (kept whole)

These are design explorations — each is one dispatcher over many layout variants,
not a single screen, so they stay as cohesive modules:

- `HomeVariants.jsx` — `HomeVariant` + `HOME_LAYOUTS` (spotlight / bento / focus / …)
- `HomeVariantsSimple.jsx` — `HomeVariantSimple` (the `simple-*` home layouts)
- `CharacterVariants.jsx` — `CharDetailVariant` (character-detail style variants)

## Shared — `shared.jsx`

Cross-screen helpers, imported by the screens that need them:

- **Layout**: `ScreenHeader`, `StatCard`
- **Buddy-tinted backgrounds**: `screenBgFor`, `screenBgActive`, `mixHue`
- **Game bits**: `Confetti`, `RarityPill`, `DexProgress`, `PointsChip`

See `/ARCHITECTURE.md`.
