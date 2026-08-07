# Guestbook book images

Finished art for the "book" guestbook style (`GUESTBOOK_STYLES` → `Storybook` in
`src/child/GuestbookPatterns.jsx`). The trigger puck swaps between closed/open on tap —
closed by default, open while the notes sheet is up — and the open cover is reused small
as the sheet's header icon.

One pair per room theme (`ROOMS` in `src/core/data.jsx`), so the book on the floor matches
whichever room it's sitting in. `bookArtFor(theme)` in `GuestbookPatterns.jsx` picks the
pair; a theme with no pair here falls back to `dream`.

Served at `/assets/book/<file>`.

| File                       | Theme | Use                                          |
| --------------------------- | ----- | --------------------------------------------- |
| `book-dream-closed.png`     | dream | Idle puck (sheet closed)                      |
| `book-dream-open.png`       | dream | Puck once tapped, and the sheet header icon   |
| `book-green-closed.png`     | green | Idle puck (sheet closed)                      |
| `book-green-open.png`       | green | Puck once tapped, and the sheet header icon   |
| `book-town-closed.png`      | town  | Idle puck (sheet closed)                      |
| `book-town-open.png`        | town  | Puck once tapped, and the sheet header icon   |
