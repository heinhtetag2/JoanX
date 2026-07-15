// JoanX — child app · Guestbook moderation (F-32)

// ── Why this file exists ─────────────────────────────────────────────
// The guestbook used to be tap-only (GUEST_STAMPS): nothing could be typed, so nothing
// had to be moderated. The product now lets a child also type a short free message, and a
// free message between two children is exactly the channel the app has always promised to
// keep safe. This module is that promise's enforcement: every typed note is screened for
// profanity, abuse, sexual language, personal information (phone numbers, social handles,
// e-mails) and links before it can be posted.
//
// ── Server-owned, hot-updatable ──────────────────────────────────────
// The real filter list lives on the SERVER, not in the app binary. New slurs, new evasion
// spellings and new scam patterns appear constantly; shipping an app update for each one is
// far too slow. So the rules are a plain data object (`RULESET`) that the client treats as
// replaceable:
//
//   • On launch (and on a push/poll while running) the app fetches the current ruleset JSON
//     from the moderation service and calls `setRuleset(json)`.
//   • `setRuleset` swaps the live rules in place, so a term added or changed on the server
//     takes effect on the next submission — no redeploy, no app-store review.
//   • The list below is only a SEED so the prototype filters something offline; treat it as
//     illustrative, not the production wordlist.
//
// The client still screens locally (instant feedback, works offline, and never uploads a
// child's rejected text). The server should re-screen on write as the source of truth — a
// client filter can always be bypassed, so it is the fast first gate, not the only one.

// ── Ruleset shape (this is what the server sends) ────────────────────
//   version   — opaque tag, handy for logging which list caught something
//   maxLength — a guestbook note is short by design
//   terms     — [{ term, category }] matched against the normalised message
//   patterns  — [{ id, category, re }] for structured PII / links
// Categories collapse to three child-facing reasons via REASON_OF below.
const SEED_RULESET = {
  version: 'seed-2026-07',
  maxLength: 80,
  // A tiny, representative seed. The server holds the full, curated, multi-language list.
  terms: [
    // profanity / abuse (EN)
    { term: 'fuck', category: 'profanity' },
    { term: 'shit', category: 'profanity' },
    { term: 'bitch', category: 'abuse' },
    { term: 'idiot', category: 'abuse' },
    { term: 'stupid', category: 'abuse' },
    { term: 'loser', category: 'abuse' },
    { term: 'ugly', category: 'abuse' },
    { term: 'hate you', category: 'abuse' },
    { term: 'kill', category: 'abuse' },
    // sexual (EN)
    { term: 'sex', category: 'sexual' },
    { term: 'nude', category: 'sexual' },
    { term: 'porn', category: 'sexual' },
    // profanity / abuse (KO)
    { term: '씨발', category: 'profanity' },
    { term: '시발', category: 'profanity' },
    { term: '개새끼', category: 'profanity' },
    { term: '병신', category: 'abuse' },
    { term: '바보', category: 'abuse' },
    { term: '멍청이', category: 'abuse' },
    { term: '죽어', category: 'abuse' },
  ],
  patterns: [
    // e-mail — before the url rule, so an address reads as "contact info", not "a link"
    { id: 'email', category: 'contact', re: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
    // links — http(s), www., or a bare domain like "site.com/foo"
    { id: 'url', category: 'link', re: /(https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|net|org|io|co|kr|gg|xyz|link|me)\b)/i },
    // social / messenger handle or ID solicitation: "@name", "kakao id", "insta 123", "dm me"
    { id: 'social', category: 'contact', re: /(@[a-z0-9._]{2,}|\b(?:kakao|kakaotalk|카톡|카카오|insta|instagram|인스타|snap|snapchat|discord|디스코드|텔레|telegram|dm)\b)/i },
    // phone numbers — Korean 010 and generic 9+ digit runs, tolerant of spaces/dashes/dots
    { id: 'phone', category: 'contact', re: /(\b0\d{1,2}[\s.\-]?\d{3,4}[\s.\-]?\d{4}\b|\b\d[\d\s.\-]{7,}\d\b)/ },
  ],
};

// The live ruleset — module-level and mutable so a server update swaps it for everyone at
// once. Seeded so the app filters before the first fetch returns.
let RULESET = SEED_RULESET;

// Replace the live rules (call after fetching the server's ruleset JSON). Merges shallowly
// so a partial update — say, just an added term list — is valid. Patterns arriving as
// strings from JSON are compiled to RegExp here.
function setRuleset(next) {
  if (!next || typeof next !== 'object') return RULESET;
  const patterns = (next.patterns || RULESET.patterns).map(p =>
    p.re instanceof RegExp ? p : { ...p, re: new RegExp(p.re, p.flags || 'i') });
  RULESET = { ...RULESET, ...next, patterns };
  return RULESET;
}
const getRuleset = () => RULESET;
const resetRuleset = () => { RULESET = SEED_RULESET; return RULESET; };

// ── Normalisation — fold common evasions before matching ─────────────
// Children (and adults) space out or dot letters to slip a filter: "f u c k", "s.h.i.t",
// "shiiiit". We lower-case, NFKC-fold width/compatibility forms, drop the separators people
// wedge between letters, and collapse a run of the same letter to one. The collapsed form
// is only ever tested against the ban list, so over-folding here cannot corrupt what the
// child actually posts — it just widens what the ban list catches.
function normalize(s) {
  const lower = s.normalize('NFKC').toLowerCase();
  const stripped = lower.replace(/[\s.\-_*]+/g, '');       // "f.u.c.k" → "fuck"
  return stripped.replace(/(.)\1{2,}/g, '$1');             // "shiiiit" → "shit" (3+ repeats)
}

// ── The gate ─────────────────────────────────────────────────────────
// Returns { ok, category, reason }:
//   ok       — may this note be posted?
//   category — internal tag of what tripped (for logging), null when ok
//   reason   — a REASON key (see REASON_OF) the UI runs through i18n; null when ok
// Structured PII/link patterns run against the RAW text (spacing is meaningful in a phone
// number); ban terms run against both the raw and the normalised form.
function moderate(text) {
  const raw = (text || '').trim();
  if (!raw) return { ok: false, category: 'empty', reason: null };
  if (raw.length > RULESET.maxLength) return { ok: false, category: 'length', reason: 'length' };

  for (const p of RULESET.patterns) {
    if (p.re.test(raw)) return { ok: false, category: p.id, reason: REASON_OF[p.category] };
  }

  const norm = normalize(raw);
  const rawLower = raw.toLowerCase();
  for (const t of RULESET.terms) {
    const term = t.term.toLowerCase();
    if (rawLower.includes(term) || norm.includes(normalize(term))) {
      return { ok: false, category: t.category, reason: REASON_OF[t.category] };
    }
  }
  return { ok: true, category: null, reason: null };
}

// Fine internal categories collapse to a few child-facing reasons. The message never repeats
// what the child typed and never says which word tripped — that only teaches the next evasion
// — it just names the kind of thing that is not allowed. Keys are English source strings that
// i18n.jsx (L) translates.
const REASON_OF = {
  profanity: 'language',
  abuse: 'language',
  sexual: 'language',
  contact: 'contact',
  link: 'link',
};
const REASON_TEXT = {
  language: 'Let’s keep it kind — that message can’t be posted.',
  contact: 'For safety, notes can’t include phone numbers, e-mails, or social handles.',
  link: 'For safety, notes can’t include links.',
  length: 'That note is a little too long.',
};

export { moderate, setRuleset, getRuleset, resetRuleset, REASON_TEXT };
