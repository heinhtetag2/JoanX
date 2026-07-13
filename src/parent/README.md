# parent — the Parent app (guardian dashboard)

The calm guardian experience: onboarding/auth, add-child wizard, device pairing,
reports, and rules/settings.

## Layout — one screen per file

Each parent screen lives in its own file and is re-exported from `index.jsx`
(the barrel the rest of the app imports from):

| File | Screen |
|------|--------|
| `ParentOnboarding.jsx` | Splash → intro slides → auth (sign up / in / reset). Holds the `TAKEN_IDS` user-ID duplicate check. |
| `ParentAddChild.jsx` | Add-child wizard: details → pair (code / scan QR) → connected → configure. |
| `ParentReports.jsx` | Reports dashboard (metrics + charts). Owns `ChildChip`, `StdBarChart`, `Legend`. |
| `ParentAIReport.jsx` | Natural-language AI safety report. |
| `ParentChildren.jsx` | Children / devices list. |
| `ParentSettings.jsx` | A child's rules & settings (device, mode, sensitivity, time rules). |
| `ParentSchedule.jsx` | Time-rule schedule editor. |
| `ParentDetail.jsx` | Account settings detail pages + Help / FAQ (`FAQ_GROUPS`, `FaqAccordion`). |
| `ParentAccount.jsx` | Parent/account settings hub. |

## Shared — `shared.jsx`

Cross-screen primitives live here, imported by the screens that need them:

- **`BRAND`** — the brand palette (buddy green `#4B814F`, with `ink` for active states)
- **`brandBtn`** — the branded CTA style
- **`ParentHead`** — the standard screen header
- **`ChoiceGroup`** — the Korean-style radio group (add-child + onboarding)
- **`RULE_TAG_COLORS`** — time-rule tag badge colors (settings + schedule)

See `/ARCHITECTURE.md`.
