# Safety-status icon

Finished art for the "you're protected" shield shown in the child app's
smart-mode safety banner and Safety screen. Replaces the drawn lucide
`Icon name="shield-check"` ONLY in that non-lite, protected state — lite
mode keeps the drawn warning shield since this art is painted for the
green/success state.

Served at `/assets/safety/<file>`. Wired via `SafePointIcon` in
`src/core/primitives.jsx`.

| File | Used for |
| ---- | -------- |
| `safepoint.svg` | "you're protected" safety-status shield (ChildHome's banner, SafetyStatus screen, home header pill) — `SafePointIcon` |
