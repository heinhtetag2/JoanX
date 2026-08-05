// JoanX — parent app · ParentDetail

import React from 'react';
import { AUTH, CHILDREN, NOTICES, LEGAL_DOCS, PARENT_PROFILE } from '../core/data.jsx';
import { Badge, Bar, BottomSheet, Button, DateField, Icon, Input, Modal, PhotoAvatar, SelectField, THEME, Toggle, screenBgFor } from '../core/primitives.jsx';
import { L, getLang, setLang } from '../core/i18n.jsx';
import { ProviderMark } from '../core/auth.jsx';
import { BRAND, brandBtn, ParentHead } from './shared.jsx';

// ── FAQ — grouped Q&A used by the Help / FAQ parent pages ────────────
// Answers mirror the functional spec (Smart mode, ~10pt/safe-min, motion-only
// detection, privacy). Keep parent-facing: calm, plain language, no jargon.
const FAQ_GROUPS = [
  { label: 'Getting started', items: [
    { q: 'What’s the difference between Smart and Lite mode?',
      a: 'Smart mode gently warns your child with a friendly character and rewards safe walking with a collectible game. Lite mode simply pauses the screen while walking. Calls and texts always stay available in both.' },
    { q: 'How do I add another child?',
      a: 'Open Children, tap the + button, then install JoanX on your child’s phone and enter the pairing code shown. Their device links to your account — up to 5 children on the Family plan.' },
    { q: 'Does JoanX need any extra device or wearable?',
      a: 'No. JoanX works entirely from your child’s smartphone using its built-in motion sensors — nothing to buy, charge, or carry.' },
  ] },
  { label: 'Safety & warnings', items: [
    { q: 'How does JoanX know my child is walking on their phone?',
      a: 'It reads the phone’s built-in motion sensors to detect a walking rhythm, and only steps in when walking and screen use continue together for about 10 seconds.' },
    { q: 'Will it warn my child on the bus or in a car?',
      a: 'It’s tuned to the specific rhythm of walking, so riding in a vehicle shouldn’t trigger a warning. We keep fine-tuning detection accuracy with real-world use.' },
    { q: 'What happens when a risky moment is detected?',
      a: 'One gentle buzz, then a soft on-screen nudge and a friendly character message — never repeated buzzing. Your child looks up, and the warning clears.' },
    { q: 'Can I make warnings more or less sensitive?',
      a: 'Yes. Open a child’s Rules & settings and adjust Warning sensitivity between Gentle, Balanced, and Strict at any time.' },
  ] },
  { label: 'Points & rewards', items: [
    { q: 'How are points earned?',
      a: 'In Smart mode your child earns points for walking safely — roughly 10 points per phone-free minute of walking, plus a bonus for stopping quickly after a warning. Points grow and evolve their character.' },
    { q: 'Won’t the game just distract my child while walking?',
      a: 'No — the game only opens when your child is stopped. Nothing rewarding is tappable while they’re walking, so the fun always waits until it’s safe.' },
  ] },
  { label: 'Privacy & data', items: [
    { q: 'Is my child’s location private?',
      a: 'JoanX never reads messages or listens in. Location is used only in Smart mode while walking, and it’s stored separately from your child’s identity.' },
    { q: 'What data does JoanX store, and can I delete it?',
      a: 'Only the safety events and settings needed to protect your child. You can export or permanently delete everything anytime from Settings → Data & privacy.' },
  ] },
];

// ── The privacy consent gating the 1:1 inquiry form ──────────────────
// Scope is deliberately narrower than the sign-up consents (core/auth.jsx CONSENTS):
// an inquiry sends only the reply address, the message and any screenshots — not the
// child's profile or motion data — so reusing that document here would over-disclose.
// PIPA requires the three rows below (what · why · how long) plus the right to decline.
// Retention follows 전자상거래법, which holds consumer complaint and dispute records
// for three years. Document text provided by Joan Company.
const INQUIRY_CONSENT = {
  label: 'Consent to collection & use of personal information',
  rows: [
    ['Items collected', 'Your email address, the content of your inquiry, and any images you attach.'],
    ['Purpose of use', 'To receive your inquiry, reply to it by email, and keep a record of how it was handled.'],
    ['Retention period', 'Three years after your inquiry is answered, as required by the Act on Consumer Protection in Electronic Commerce for records of consumer complaints and disputes.'],
  ],
  note: 'You may decline this consent, but we cannot receive or reply to your inquiry without it.',
};

// The four questions surfaced on the Help landing — pulled straight from the
// groups above so the answers never drift out of sync.
const POPULAR_FAQS = [FAQ_GROUPS[0].items[0], FAQ_GROUPS[3].items[0], FAQ_GROUPS[0].items[1], FAQ_GROUPS[2].items[0]];

// [inquiryStyle="kr"] — categories a Korean CS flow routes an inquiry by (Toss/Kakao/Naver
// support all lead with this, not a free-text box) and which FAQ_GROUPS entries most likely
// answer each one, so the deflection step never invents a question that isn't already
// covered elsewhere in Help. 'billing' has no matching FAQ topic yet — its items list is
// empty on purpose, and the FAQ step handles that gracefully rather than showing nothing.
// Labels are English canonical strings run through L() at render time (same convention
// as every other string in this file) — NOT translated here at module-load time, since
// that would freeze them to whatever language was active on first import instead of
// tracking the live language toggle.
const INQUIRY_CATEGORIES = [
  { id: 'account', icon: 'user',          label: 'Account & security',       items: FAQ_GROUPS[0].items },
  { id: 'billing', icon: 'credit-card',   label: 'Billing & subscription',   items: [] },
  { id: 'bug',      icon: 'bug',          label: 'Report a bug',             items: FAQ_GROUPS[1].items },
  { id: 'feature',  icon: 'lightbulb',    label: 'Feature suggestion',       items: FAQ_GROUPS[2].items },
  { id: 'safety',   icon: 'shield-check', label: 'Child safety',             items: FAQ_GROUPS[1].items },
  { id: 'etc',      icon: 'more-horizontal', label: 'Other',                 items: POPULAR_FAQS },
];

// Mock ticket history — the "recent inquiries" peek real Korean CS support always leads
// with, so a returning parent sees their open tickets before starting a new one. Static/
// display-only in this prototype, same as other non-interactive rows elsewhere in this
// file (e.g. the read-only sign-in "Connected" badge). Titles/status run through L().
// Each ticket's `thread` is the full back-and-forth, not just one Q&A — Korean 1:1-inquiry
// flows (Toss, Kakao) keep a ticket open for follow-up replies rather than locking it after
// a single answer, and sendKrReply() below appends to this same array.
const RECENT_TICKETS = [
  { title: 'Warnings arrive too late', status: 'answered', time: '3d ago', thread: [
    { from: 'parent', text: "My son already looked back down by the time the warning went off — feels like it's a beat behind.", time: '3d ago' },
    { from: 'support', text: "That's expected — JoanX waits about 10 seconds of continuous walking + screen use before warning, so it doesn't false-alarm on a quick glance. If it still feels late for your son, try Strict sensitivity in his Rules & settings — it shortens that window.", time: '2d ago' },
  ] },
  { title: "My child's device won't connect", status: 'pending', time: 'Just now', thread: [
    { from: 'parent', text: "Paired the app but my daughter's phone still shows 'Not connected' after restarting both devices.", time: 'Just now' },
  ] },
  // demo ticket with a screenshot already attached — shows the paperclip hint in the
  // list row and the file chip inside the bubble without needing to send a new inquiry
  { title: 'App keeps crashing after update', status: 'pending', time: '1h ago', thread: [
    { from: 'parent', text: 'It crashes every time I open the Reports tab since the last update.', time: '1h ago', files: ['Screenshot_2026-08-04.png'] },
  ] },
];

// Small round bot avatar for the KR compose thread — brand-gradient circle, same visual
// language as ParentReports' own ChatAvatar (that one's module-private to that file, so
// this is a small deliberate duplicate rather than a cross-file import for one component).
function KrAvatar() {
  return (
    <div style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, background: `linear-gradient(135deg,${BRAND.primary},${BRAND.primaryDark})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="headphones" size={13} color="#fff" stroke={2.3} />
    </div>
  );
}

// Self-contained accordion: tap a question to reveal its answer.
function FaqAccordion({ items }) {
  const [open, setOpen] = React.useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
            <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name="help-circle" size={18} color={BRAND.primary} stroke={2.2} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{L(it.q)}</span>
              <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
            </button>
            {isOpen && (
              <div style={{ padding: '0 16px 16px 44px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>{L(it.a)}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// [loginProvider] — Tweaks-only: which sign-in method the mock account STARTS with, so both
// shapes of the Account screen (email/password vs. social) can be previewed. 'email' is the
// shipped default — a guardian who signed up with email/password owns a real password, so
// Security → Change password shows. Google/Apple/Kakao hand back an identity that already
// carries its own key (see auth.jsx), so those accounts see a "Connected" row instead and
// never a password screen. From here on it's just the starting value, not a live control —
// `provider` state below is what actually drives which branch renders, and the guardian can
// move it with Change sign-in method. PARENT_PROFILE.provider is left as static mock data.
const PROVIDER_LABELS = { google: 'Google', apple: 'Apple', kakao: 'Kakao' };
const PROVIDER_LINK_LABEL = { google: 'Linked to your Google account', apple: 'Linked to your Apple account', kakao: 'Linked to your Kakao account' };
const PROVIDER_BADGE_BG = { google: '#fff', apple: '#000', kakao: '#FEE500' };
const METHOD_CHANGED_MSG = { google: 'You’ll now sign in with Google', apple: 'You’ll now sign in with Apple', kakao: 'You’ll now sign in with Kakao', email: 'You’ll now sign in with email & password' };

// Resend-code cooldown — mirrors auth.jsx's sign-up/login timer so every 6-digit code
// screen in the app (email/password edit, change password, change sign-in method) waits
// out the same window before "Resend code" becomes tappable, instead of being available
// immediately.
function useResendCooldown(active) {
  const [left, setLeft] = React.useState(AUTH.codeResendSeconds);
  React.useEffect(() => {
    if (!active || left <= 0) return undefined;
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [active, left]);
  const label = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  return { left, reset: () => setLeft(AUTH.codeResendSeconds), label };
}

// ── Settings detail pages (one screen per row) ───────────────────────
function ParentDetail({ ctx, inquiryStyle = 'form', loginProvider = 'email' }) {
  const page = ctx.params?.page || 'account';
  // The real, guardian-changeable sign-in method — Tweaks only sets where it starts.
  const [provider, setProvider] = React.useState(loginProvider);
  const socialProvider = provider !== 'email' ? provider : null;
  const ko = getLang() === 'ko';   // [inquiryStyle="kr"] — the sentences with an interpolated
  // category name (L() can't template) branch on this directly, matching ParentReports' own
  // ko-ternary convention for dynamic strings.
  const [analytics, setAnalytics] = React.useState(true);
  const [tips, setTips] = React.useState(true);
  const [keepLoc, setKeepLoc] = React.useState(true);
  const [retention, setRetention] = React.useState(30);
  const [format, setFormat] = React.useState('PDF');
  const [exported, setExported] = React.useState(false);
  const [logCleared, setLogCleared] = React.useState(false);   // Data & privacy → diagnostic log (F-29)
  const [inqMsg, setInqMsg] = React.useState('');              // 1:1 inquiry — message body
  const [inqAgree, setInqAgree] = React.useState(false);       // 1:1 inquiry — privacy consent
  const [inqDoc, setInqDoc] = React.useState(false);           // 1:1 inquiry — consent document sheet
  const [inqSent, setInqSent] = React.useState(false);         // 1:1 inquiry — submitted state
  // [inquiryStyle="kr"] Korean-CS-style 1:1 inquiry — category picker → FAQ deflection →
  // chat-thread compose, kept as its own state block (not reused with the inq* fields
  // above) so switching the Tweaks toggle mid-session can't leave one style's half-typed
  // draft bleeding into the other's.
  const [krStep, setKrStep] = React.useState('category');      // 'category' | 'faq' | 'compose'
  const [krCategory, setKrCategory] = React.useState(null);
  const [krMsg, setKrMsg] = React.useState('');
  const [krAgree, setKrAgree] = React.useState(false);
  const [krDoc, setKrDoc] = React.useState(false);
  const [krSent, setKrSent] = React.useState(false);
  const [krTicket, setKrTicket] = React.useState(null);         // 1:1 inquiry (kr) — recent ticket opened for its reply thread
  const [krReplyMsg, setKrReplyMsg] = React.useState('');       // 1:1 inquiry (kr) — follow-up message being typed in an open ticket
  const [krFiles, setKrFiles] = React.useState([]);             // 1:1 inquiry (kr) — demo screenshot filenames attached to the compose message
  // Mutates the ticket's own thread array in place (same PARENT_PROFILE-style local mutation
  // used elsewhere in this file) and reopens the ticket, mirroring how replying to a resolved
  // Toss/Kakao-style inquiry puts it back into "awaiting reply" rather than starting a new one.
  const sendKrReply = () => {
    if (!krReplyMsg.trim() || !krTicket) return;
    krTicket.thread = [...krTicket.thread, { from: 'parent', text: krReplyMsg.trim(), time: 'Just now' }];
    krTicket.status = 'pending';
    krTicket.time = 'Just now';
    setKrReplyMsg('');
    setKrTicket({ ...krTicket });
  };
  const addKrFile = () => setKrFiles(f => f.length < 5 ? [...f, `Screenshot_${f.length + 1}.png`] : f);
  const removeKrFile = i => setKrFiles(f => f.filter((_, j) => j !== i));
  // Submitting turns the draft into a real ticket at the front of RECENT_TICKETS (same
  // shared-array mutation as sendKrReply above) so it actually shows up in "Recent
  // inquiries" instead of vanishing once the confirmation screen is dismissed.
  const submitKrInquiry = () => {
    RECENT_TICKETS.unshift({ title: krMsg.trim(), status: 'pending', time: 'Just now', thread: [
      { from: 'parent', text: krMsg.trim(), time: 'Just now', files: krFiles },
    ] });
    setKrSent(true);
  };
  const activeNotice = NOTICES.find(n => n.id === ctx.params?.noticeId) || NOTICES[0];
  const activeLegal = LEGAL_DOCS.find(d => d.id === ctx.params?.legalId) || LEGAL_DOCS[0];
  // Account editing — one field at a time via a bottom sheet; `rev` bumps to
  // re-render after we mutate the shared PARENT_PROFILE object.
  const [editField, setEditField] = React.useState(null);   // 'name' | 'email' | 'dob' | 'gender' | null
  const [editVal, setEditVal] = React.useState('');
  const [photoSheet, setPhotoSheet] = React.useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);   // delete-account confirmation
  const [, setRev] = React.useState(0);
  const [toast, setToast] = React.useState(null);           // brief confirmation pill
  const say = m => { setToast(m); setTimeout(() => setToast(null), 1800); };
  // Email is the account's contact point (and its identity), so a change is confirmed by a
  // 6-digit code (mirrors sign-up). Name/DOB/gender need no verification and save in one
  // step — the same three fields Create account asks for up front (auth.jsx), now editable
  // here instead of being asked once and never shown again.
  const GENDER_OPTIONS = [{ value: 'male', label: L('Male') }, { value: 'female', label: L('Female') }, { value: 'other', label: L('Prefer not to say') }];
  const EDIT_FIELDS = {
    name: { label: 'Name', type: 'text', verify: false },
    email: { label: 'Email', type: 'email', verify: true },
    dob: { label: 'Date of birth', type: 'date', verify: false },
    gender: { label: 'Gender', type: 'select', verify: false },
  };
  const formatDob = v => { if (!v) return ''; const [y, m, d] = v.split('-').map(Number); return ko ? `${y}년 ${String(m).padStart(2, '0')}월 ${String(d).padStart(2, '0')}일` : new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  const genderLabel = v => (GENDER_OPTIONS.find(o => o.value === v) || {}).label || '';
  const [editStep, setEditStep] = React.useState('input');  // 'input' | 'code'
  const [editCode, setEditCode] = React.useState('');
  const editCodeRef = React.useRef(null);
  const openEdit = f => { setEditVal(PARENT_PROFILE[f]); setEditCode(''); setEditStep('input'); setEditField(f); };
  const applyEdit = () => { if (String(editVal).trim()) PARENT_PROFILE[editField] = String(editVal).trim(); setEditField(null); setRev(r => r + 1); say(L('Changes saved')); };
  const editResend = useResendCooldown(editStep === 'code');
  const proceedEdit = () => { if (EDIT_FIELDS[editField].verify) { setEditCode(''); editResend.reset(); setEditStep('code'); } else applyEdit(); };
  // Change password — local-only in the prototype (nothing is persisted). A password change
  // is a credential change like email/phone, so it earns the same code confirmation before
  // it takes effect (see EDIT_FIELDS.verify below) rather than the current-password field alone.
  const [curPw, setCurPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confPw, setConfPw] = React.useState('');
  const [pwStep, setPwStep] = React.useState(null);  // null (closed) | 'form' | 'code' | 'saved'
  const [pwCode, setPwCode] = React.useState('');
  const pwCodeRef = React.useRef(null);
  const pwMismatch = confPw.length > 0 && newPw !== confPw;
  const pwReady = curPw.length > 0 && newPw.length >= 8 && newPw === confPw;
  const resetPwFlow = () => { setCurPw(''); setNewPw(''); setConfPw(''); setPwCode(''); setPwStep(null); };
  const pwResend = useResendCooldown(pwStep === 'code');

  // Change sign-in method — re-auth (current password, or a fresh tap through the current
  // provider) proves this session still owns the account before it's allowed to swap in a
  // different one. Never an email-matching auto-link: the picker only ever offers providers
  // OTHER than the current one, and picking one just re-points this already-authenticated
  // account — no separate identity to merge, so no collision to resolve. Switching TO email
  // is the one path that still needs a code, since no provider is left to vouch for that inbox
  // — JoanX has to verify it directly, same as any other email edit.
  const [methodStep, setMethodStep] = React.useState(null);   // null | 'reauth' | 'pick' | 'password' | 'code'
  const [reauthPw, setReauthPw] = React.useState('');
  const [reauthCode, setReauthCode] = React.useState('');
  const reauthCodeRef = React.useRef(null);
  const reauthResend = useResendCooldown(methodStep === 'reauth');
  const [methodPw, setMethodPw] = React.useState('');
  const [methodPw2, setMethodPw2] = React.useState('');
  const [methodCode, setMethodCode] = React.useState('');
  const methodCodeRef = React.useRef(null);
  const methodPwMismatch = methodPw2.length > 0 && methodPw !== methodPw2;
  const methodPwReady = methodPw.length >= 8 && methodPw === methodPw2;
  const methodResend = useResendCooldown(methodStep === 'code');
  const closeMethodSheet = () => { setMethodStep(null); setReauthPw(''); setReauthCode(''); setMethodPw(''); setMethodPw2(''); setMethodCode(''); };
  // Picking a social provider finalizes immediately — its OAuth handshake (mocked here) IS
  // the proof, so there's nothing left to confirm. Picking email instead needs a password and
  // a code first, so it detours to those steps rather than finalizing on the spot.
  const pickMethod = (key) => {
    if (key === 'email') { setMethodStep('password'); return; }
    setProvider(key);
    closeMethodSheet();
    say(L(METHOD_CHANGED_MSG[key]));
  };
  const finalizeEmailMethod = () => { setProvider('email'); closeMethodSheet(); say(L(METHOD_CHANGED_MSG.email)); };

  // resend row — same cooldown as sign-up/login (auth.jsx): a countdown while it's on,
  // then "Didn't get it? Resend code" becomes tappable once it reaches 0.
  const resendRow = (resend, onResend) => resend.left > 0 ? (
    <div style={{ marginTop: 14, fontSize: 12.5, fontWeight: 700, color: THEME.fg2 }}>
      {L('Didn’t get it? You can resend in')} <span style={{ color: THEME.fg1, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{resend.label}</span>
    </div>
  ) : (
    <button onClick={onResend} style={{ marginTop: 14, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: THEME.fg2, cursor: 'pointer' }}>{L('Didn’t get it?')} <span style={{ color: BRAND.primary, fontWeight: 800 }}>{L('Resend code')}</span></button>
  );

  const chev = <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />;
  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
  const card = (children, mb = 18) => <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: mb, overflow: 'hidden' }}>{children}</div>;
  const rowStyle = (i, click) => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: click ? 'pointer' : 'default' });
  const navRow = (i, icon, title, trailing, sub, onClick) => (
    <div style={rowStyle(i, true)} onClick={onClick}>
      {icon && <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />}
      <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700 }}>{title}</div>{sub && <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{sub}</div>}</div>
      {trailing || chev}
    </div>
  );
  const toggleRow = (i, icon, title, on, set) => (
    <div style={rowStyle(i, false)}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{title}</div>
      <Toggle on={on} onChange={set} />
    </div>
  );
  const check = (i, text) => (
    <div style={rowStyle(i, false)}><Icon name="check" size={17} color={THEME.success} stroke={2.6} /><div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{text}</div></div>
  );
  const banner = (icon, title, text) => (
    <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginBottom: 18 }}>
      <Icon name={icon} size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
      <div>{title && <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{title}</div>}
        <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: title ? 3 : 0, opacity: .9 }}>{text}</div></div>
    </div>
  );
  const seg = (opts, val, set) => (
    <div style={{ display: 'flex', gap: 6, background: THEME.surface2, borderRadius: 12, padding: 4 }}>
      {opts.map(o => { const v = o.v != null ? o.v : o, on = val === v; return (
        <button key={String(v)} onClick={() => set(v)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, borderRadius: 9, padding: '8px 6px', background: on ? '#fff' : 'transparent', color: on ? BRAND.primary : THEME.fg2, boxShadow: on ? THEME.shadowCard : 'none' }}>{o.l != null ? o.l : o}</button>
      ); })}
    </div>
  );
  // notice category pill — brand tint for updates, neutral for policy/notice
  const NOTICE_TAGS = { update: { l: 'Update', bg: BRAND.primaryLight, fg: BRAND.primaryDark }, policy: { l: 'Policy', bg: THEME.surface2, fg: THEME.fg2 }, notice: { l: 'Announcement', bg: THEME.surface2, fg: THEME.fg2 } };
  const noticePill = tag => { const t = NOTICE_TAGS[tag] || NOTICE_TAGS.notice; return (
    <span style={{ fontSize: 10.5, fontWeight: 800, color: t.fg, background: t.bg, padding: '3px 9px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: .3 }}>{L(t.l)}</span>
  ); };

  // page → { title, sub, body }
  const PAGES = {
    account: { title: L('Account'), sub: L('Profile & security'), body: (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          {/* tap the avatar to change the photo */}
          <button onClick={() => setPhotoSheet(true)} style={{ position: 'relative', border: 'none', background: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }} aria-label={L('Change photo')}>
            <PhotoAvatar src={PARENT_PROFILE.avatar} size={56}
              fallback={<div style={{ width: 56, height: 56, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800 }}>{PARENT_PROFILE.name[0]}</div>} />
            <div style={{ position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: 999, background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="camera" size={12} color={THEME.fg1} stroke={2.3} /></div>
          </button>
          <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 800 }}>{PARENT_PROFILE.name}</div><div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>{L('Parent account')}</div></div>
        </div>
        {label(L('Account details'))}
        {card(<React.Fragment>
          {navRow(0, 'user', L('Name'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{PARENT_PROFILE.name}</span>, undefined, () => openEdit('name'))}
          {/* Date of birth + gender — asked at sign-up (auth.jsx's Create account step) but
              had nowhere to live afterward until now; editable here the same way Name is. */}
          {navRow(1, 'calendar', L('Date of birth'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{formatDob(PARENT_PROFILE.dob)}</span>, undefined, () => openEdit('dob'))}
          {navRow(2, 'user-round', L('Gender'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{genderLabel(PARENT_PROFILE.gender)}</span>, undefined, () => openEdit('gender'))}
          {/* Email is read-only when signed in through Google/Apple/Kakao — it's changed
              there, not with a code here. An email/password account has no such link, so
              its email edits in place with the verify-code pattern instead. */}
          {socialProvider ? (
            <div style={rowStyle(3, false)}>
              <Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Email')}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="link" size={11} color={THEME.fg3} stroke={2.4} />{L(PROVIDER_LINK_LABEL[socialProvider])}</div>
              </div>
              <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, textAlign: 'right' }}>{PARENT_PROFILE.email}</span>
            </div>
          ) : navRow(3, 'mail', L('Email'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{PARENT_PROFILE.email}</span>, undefined, () => openEdit('email'))}
        </React.Fragment>)}
        {/* Sign-in (social) and Change password are mutually exclusive — a Google/Apple/Kakao
            identity carries its own key and never sets a JoanX password, so there's nothing
            to change; only an email/password account gets the Security section. Both still
            get Change sign-in method — re-auth first, then the picker (see methodStep below). */}
        {socialProvider ? (
          <React.Fragment>
            {label(L('Sign-in'))}
            {card(<React.Fragment>
              <div style={rowStyle(0, false)}>
                <span style={{ width: 30, height: 30, borderRadius: 999, background: PROVIDER_BADGE_BG[socialProvider], border: socialProvider === 'google' ? `1px solid ${THEME.border}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ProviderMark provider={socialProvider} />
                </span>
                <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{PROVIDER_LABELS[socialProvider]}</div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.primaryDark, background: BRAND.primaryLight, padding: '3px 9px', borderRadius: 999 }}>{L('Connected')}</span>
              </div>
              {navRow(1, 'repeat', L('Change sign-in method'), chev, undefined, () => { reauthResend.reset(); setMethodStep('reauth'); })}
            </React.Fragment>)}
          </React.Fragment>
        ) : (
          <React.Fragment>
            {label(L('Security'))}
            {card(<React.Fragment>
              {navRow(0, 'lock', L('Change password'), chev, undefined, () => setPwStep('form'))}
              {navRow(1, 'repeat', L('Change sign-in method'), chev, undefined, () => { reauthResend.reset(); setMethodStep('reauth'); })}
            </React.Fragment>)}
          </React.Fragment>
        )}
        {card(
          <div onClick={() => setConfirmDelete(true)} style={{ ...rowStyle(0, true), justifyContent: 'center' }}><Icon name="trash-2" size={18} color={THEME.danger} stroke={2.2} /><div style={{ fontSize: 14, fontWeight: 800, color: THEME.danger }}>{L('Delete account')}</div></div>
        )}
      </React.Fragment>
    ) },

    plan: { title: L('Subscription'), sub: L('JoanX Family plan'), back: 'account', body: (
      <React.Fragment>
        <div style={{ borderRadius: 22, padding: 20, background: 'linear-gradient(160deg,#fff7e6,#fff 80%)', boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Icon name="sparkles" size={20} color={THEME.gold} stroke={2.2} /><span style={{ fontSize: 16, fontWeight: 800 }}>{L('JoanX Family')}</span></div>
            <Badge variant="success">{L('Active')}</Badge>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}><span style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.5px' }}>$9.99</span><span style={{ fontSize: 14, color: THEME.fg2, fontWeight: 600, marginBottom: 5 }}>{L('/ month')}</span></div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 4 }}>{L('Renews')} Jul 1, 2026</div>
        </div>
        {label(L("What's included"))}
        {card(<React.Fragment>
          {check(0, L('Up to 5 children'))}{check(1, L('Smart & Lite modes'))}{check(2, L('Live safety warnings'))}{check(3, L('Weekly progress reports'))}{check(4, L('Priority support'))}
        </React.Fragment>)}
        {card(
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 13, fontWeight: 700, color: THEME.fg2 }}>{L('Children connected')}</span><span style={{ fontSize: 13, fontWeight: 800 }}>{CHILDREN.length} / 5</span></div>
            <Bar value={CHILDREN.length} max={5} color={THEME.gold} height={10} />
          </div>
        )}
        <Button variant="secondary" fullWidth icon="credit-card" style={{ marginBottom: 10 }}>{L('Manage billing')}</Button>
        <Button variant="primary" fullWidth icon="arrow-up-circle" style={brandBtn}>{L('Change plan')}</Button>
      </React.Fragment>
    ) },

    privacy: { title: L('Data & privacy'), sub: L('Control your data'), body: (
      <React.Fragment>
        {banner('shield-check', L('Privacy first'), L('Your privacy is protected. JoanX never reads messages or sells your data.'))}

        {/* on-device event storage — capped at 100, oldest auto-purged (F-23) */}
        {label(L('On this device'))}
        {card(
          <div style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Icon name="database" size={18} color={THEME.fg2} stroke={2.2} />
              <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Safety events stored')}</div>
              <span style={{ fontSize: 13, fontWeight: 800 }}>42 / 100</span>
            </div>
            <Bar value={42} max={100} color={BRAND.primary} height={8} />
            <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.45, marginTop: 10 }}>{L('Only the latest 100 events are kept on the phone — older ones are removed automatically.')}</div>
          </div>
        )}

        {/* sync / transmission — safety events only, never content (F-24) */}
        {card(<React.Fragment>
          {navRow(0, 'refresh-cw', L('Auto-sync'), <span style={{ fontSize: 12.5, color: THEME.success, fontWeight: 700 }}>{L('On')}</span>, L('Last synced 2 min ago'))}
          {navRow(1, 'upload-cloud', L('What gets sent'), <span style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 700 }}>{L('Events only')}</span>, L('Safety events — never messages, photos or content'))}
        </React.Fragment>)}

        {/* always-on foreground service + restart-on-reboot (F-27 / F-28) */}
        {label(L('Always-on protection'))}
        {card(<React.Fragment>
          {navRow(0, 'smartphone', L('Secure background service'), <Badge variant="success">{L('Running')}</Badge>, L('Runs quietly on Android while your child walks'))}
          {navRow(1, 'power', L('Restarts after reboot'), <Icon name="check" size={17} color={THEME.success} stroke={2.6} />, L('Protection resumes automatically if the phone restarts'))}
        </React.Fragment>)}

        {/* 7-day local diagnostic log (F-29) */}
        {label(L('Diagnostic log'))}
        {card(
          <div style={{ padding: 14 }}>
            {logCleared ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}><Icon name="check-circle-2" size={18} color={THEME.success} stroke={2.3} /><span style={{ fontSize: 13, fontWeight: 700, color: '#274427' }}>{L('Log cleared')}</span></div>
            ) : (
              <React.Fragment>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11.5, color: THEME.fg2 }}>
                  {[['08:12', 'Walk detected'], ['08:12', 'Warning shown · eyes up in 2s'], ['08:31', 'Safe walk complete · +200'], ['09:01', 'Synced to cloud']].map(([t, e], i) => (
                    <div key={i} style={{ display: 'flex', gap: 8 }}><span style={{ color: THEME.fg3 }}>{t}</span><span>{L(e)}</span></div>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 10 }}>{L('Kept 7 days on this device for troubleshooting, then deleted.')}</div>
                <button onClick={() => setLogCleared(true)} style={{ marginTop: 10, background: THEME.surface2, border: 'none', borderRadius: 10, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: THEME.fg1, fontFamily: 'inherit', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="trash-2" size={14} color={THEME.fg2} stroke={2.3} />{L('Clear log')}</button>
              </React.Fragment>
            )}
          </div>
        )}

        {label(L('Preferences'))}
        {card(<React.Fragment>
          {toggleRow(0, 'bar-chart-3', L('Share anonymous analytics'), analytics, setAnalytics)}
          {toggleRow(1, 'lightbulb', L('Personalized safety tips'), tips, setTips)}
        </React.Fragment>)}
        {card(<React.Fragment>
          {navRow(0, 'database', L('What we collect'))}
          {navRow(1, 'share-2', L('Third-party sharing'), <span style={{ fontSize: 13, color: THEME.success, fontWeight: 700 }}>{L('None')}</span>)}
        </React.Fragment>)}
        {card(
          <div style={{ ...rowStyle(0, true) }}><Icon name="trash-2" size={18} color={THEME.danger} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.danger }}>{L('Delete all my data')}</div></div>
        )}
      </React.Fragment>
    ) },

    location: { title: L('Location history'), sub: L('Smart mode only'), body: (
      <React.Fragment>
        {banner('map-pin', null, L('Location is only used in Smart mode while your child is walking. Never tracked at rest.'))}
        {card(<React.Fragment>
          {toggleRow(0, 'history', L('Keep location history'), keepLoc, setKeepLoc)}
          <div style={{ ...rowStyle(1, false), flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Keep for')}</div>
            {seg([{ v: 7, l: '7 ' + L('days') }, { v: 30, l: '30 ' + L('days') }, { v: 90, l: '90 ' + L('days') }], retention, setRetention)}
          </div>
        </React.Fragment>)}
        {label(L('Recent locations'))}
        {card(<React.Fragment>
          {navRow(0, 'map-pin', L('Oak St. crossing'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Today')} 8:12 AM</span>)}
          {navRow(1, 'map-pin', L('School gate'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Today')} 8:30 AM</span>)}
          {navRow(2, 'map-pin', L('Home'), <span style={{ fontSize: 12, color: THEME.fg3 }}>{L('Yesterday')} 4:05 PM</span>)}
        </React.Fragment>)}
        <Button variant="outline" fullWidth icon="trash-2">{L('Clear history')}</Button>
      </React.Fragment>
    ) },

    export: { title: L('Export my data'), sub: L('Download a copy'), body: (
      <React.Fragment>
        {banner('download', null, L('Get a copy of everything JoanX stores about your family.'))}
        {label(L('Included in export'))}
        {card(<React.Fragment>{check(0, L('Reports & activity'))}{check(1, L('Safety events'))}{check(2, L('Settings & rules'))}</React.Fragment>)}
        {label(L('Format'))}
        {card(<div style={{ padding: 14 }}>{seg(['PDF', 'CSV', 'JSON'], format, setFormat)}</div>)}
        {card(<div style={{ ...rowStyle(0, false) }}><Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Send to')}</div><span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>sora.kim@email.com</span></div>)}
        {exported
          ? <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: THEME.successLight, borderRadius: 16, padding: 14 }}><Icon name="check-circle-2" size={20} color={THEME.success} stroke={2.3} /><span style={{ fontSize: 13.5, fontWeight: 700, color: '#274427' }}>{L("We'll email you a download link shortly.")}</span></div>
          : <Button variant="primary" fullWidth icon="download" style={brandBtn} onClick={() => setExported(true)}>{L('Request export')}</Button>}
      </React.Fragment>
    ) },

    language: { title: L('Language'), sub: L('Choose your language'), body: (
      <React.Fragment>
        {card([['en', 'English'], ['ko', '한국어']].map(([code, native], i) => {
          const on = ctx.lang === code;
          return (
            <div key={code} onClick={() => ctx.setLang(code)} style={rowStyle(i, true)}>
              <div style={{ flex: 1, fontSize: 15, fontWeight: 700, color: on ? BRAND.primary : THEME.fg1 }}>{native}</div>
              {on && <Icon name="check" size={20} color={BRAND.primary} stroke={2.6} />}
            </div>
          );
        }))}
        <div style={{ fontSize: 12.5, color: THEME.fg2, padding: '0 4px', lineHeight: 1.45 }}>{L('Changes the language across the whole app.')}</div>
      </React.Fragment>
    ) },

    help: { title: L('Help & support'), sub: L("We're here to help"), body: (
      <React.Fragment>
        {label(L('Popular questions'))}
        <FaqAccordion items={POPULAR_FAQS} />
      </React.Fragment>
    ) },

    faq: { title: L('FAQ'), sub: L('Answers to common questions'), back: 'help', body: (
      <React.Fragment>
        {FAQ_GROUPS.map((g, gi) => (
          <React.Fragment key={gi}>
            {label(L(g.label))}
            <FaqAccordion items={g.items} />
          </React.Fragment>
        ))}
        <div style={{ display: 'flex', gap: 12, background: BRAND.primaryLight, borderRadius: 18, padding: 16, marginTop: 2 }}>
          <Icon name="message-circle" size={20} color={BRAND.primary} stroke={2.3} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 800, color: BRAND.primaryDark }}>{L('Still need help?')}</div>
            <div style={{ fontSize: 12.5, color: BRAND.primaryDark, lineHeight: 1.45, marginTop: 3, opacity: .9 }}>{L('Chat with our support team or email help@joanx.app — we usually reply within a day.')}</div>
          </div>
        </div>
      </React.Fragment>
    ) },

    notices: { title: L('Notices'), sub: L("What's new"), body: (
      <React.Fragment>
        {card(NOTICES.map((n, i) => (
          <div key={n.id} style={rowStyle(i, true)} onClick={() => ctx.nav('p_detail', { page: 'notice', noticeId: n.id })}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>{noticePill(n.tag)}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: THEME.fg1, lineHeight: 1.35 }}>{L(n.title)}</div>
              <div style={{ fontSize: 12, color: THEME.fg3, marginTop: 3 }}>{n.date}</div>
            </div>
            {chev}
          </div>
        )))}
      </React.Fragment>
    ) },

    notice: { title: L('Notice'), sub: null, back: 'notices', body: (
      <React.Fragment>
        {card(
          <div style={{ padding: '16px 16px 20px' }}>
            <div style={{ marginBottom: 8 }}>{noticePill(activeNotice.tag)}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: THEME.fg1, lineHeight: 1.35 }}>{L(activeNotice.title)}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg3, marginTop: 6 }}>{activeNotice.date}</div>
            <div style={{ height: 1, background: THEME.border, margin: '16px 0' }} />
            {activeNotice.body.map((p, i) => (
              <div key={i} style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6, marginTop: i ? 12 : 0 }}>{L(p)}</div>
            ))}
          </div>
        )}
      </React.Fragment>
    ) },

    inquiry: { title: L('1:1 Inquiry'), sub: L('Ask us anything'), body: (
      inqSent ? (
        <div style={{ textAlign: 'center', padding: '28px 12px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={30} color={BRAND.primary} stroke={2.6} /></div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{L('Thanks — we’ve got your message')}</div>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L('We’ll reply to your email as soon as we can.')}</div>
          <Button variant="primary" fullWidth style={brandBtn} onClick={() => { setInqSent(false); setInqMsg(''); setInqAgree(false); ctx.nav('p_account'); }}>{L('Done')}</Button>
        </div>
      ) : (
      <React.Fragment>
        {banner('message-circle', null, L('Send us a question and we’ll reply by email, usually within a day.'))}
        {label(L('Reply email'))}
        {card(
          <div style={{ padding: '13px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>sora.kim@email.com</span>
            </div>
          </div>
        , 8)}
        <div style={{ fontSize: 12, color: THEME.fg3, padding: '0 4px', marginBottom: 18 }}>{L('You can change this in Settings → Account.')}</div>
        {label(L('Your message'))}
        {card(
          <textarea value={inqMsg} onChange={e => setInqMsg(e.target.value)} placeholder={L('Write your question here')} rows={6}
            style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: THEME.fg1, lineHeight: 1.55, padding: '14px', boxSizing: 'border-box' }} />
        )}
        {label(L('Screenshots'))}
        {card(
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: 'pointer' }}>
            <Icon name="plus" size={18} color={THEME.fg2} stroke={2.4} />
            <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Add file')}</span>
            <Icon name="paperclip" size={18} color={THEME.fg3} stroke={2.2} />
          </div>
        , 8)}
        <div style={{ fontSize: 12, color: THEME.fg3, padding: '0 4px', lineHeight: 1.45, marginBottom: 18 }}>{L('Attach a screenshot of the screen where the problem happened — up to 5 images.')}</div>
        {/* consent — the box agrees, the › opens the document (Korean 약관 pattern, same as
            the sign-up consents): a parent can read what they're agreeing to before ticking it */}
        {card(
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <button onClick={() => setInqAgree(!inqAgree)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${inqAgree ? BRAND.primary : THEME.border}`, background: inqAgree ? BRAND.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{inqAgree && <Icon name="check" size={14} color="#fff" stroke={3} />}</div>
              <span style={{ fontSize: 11, fontWeight: 800, color: BRAND.primary, flexShrink: 0 }}>[{L('Required')}]</span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, lineHeight: 1.35 }}>{L(INQUIRY_CONSENT.label)}</span>
            </button>
            <button onClick={() => setInqDoc(true)} aria-label={L('View')} className="jx-press" style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
              <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.4} />
            </button>
          </div>
        )}
        <Button variant="primary" fullWidth style={brandBtn} disabled={!inqMsg.trim() || !inqAgree} onClick={inqMsg.trim() && inqAgree ? () => setInqSent(true) : undefined}>{L('Submit inquiry')}</Button>
      </React.Fragment>
      )
    ) },

    about: { title: L('About JoanX'), sub: null, body: (
      <React.Fragment>
        {/* identity block — same as the child app */}
        <div style={{ background: '#fff', borderRadius: 20, padding: '22px 16px 18px', boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/assets/brand/logo-wordmark-dark.svg" alt="JoanX" style={{ width: 150, height: 'auto', display: 'block' }} />
          <div style={{ fontSize: 12, fontWeight: 600, color: THEME.fg3, marginTop: 12 }}>{L('Version')} 1.0.0</div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.5, marginTop: 10, textAlign: 'center', maxWidth: 250 }}>{L('Made for safer walks — points, buddies and streaks for keeping your head up near the road.')}</div>
        </div>
        {label(L('Legal'))}
        {card(LEGAL_DOCS.map((d, i) => (
          <div key={d.id} style={rowStyle(i, true)} onClick={() => ctx.nav('p_detail', { page: 'legal', legalId: d.id })}>
            <Icon name={d.icon} size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L(d.label)}</div>
            {chev}
          </div>
        )))}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: THEME.fg3, marginTop: 4 }}>
          <Icon name="heart" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('Walk safe, have fun.')}</span>
        </div>
      </React.Fragment>
    ) },

    legal: { title: L(activeLegal.label), sub: null, back: 'about', body: (
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, padding: '18px 16px' }}>
        <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6 }}>{L(activeLegal.body)}</div>
      </div>
    ) },

    signout: { title: L('Sign out'), sub: null, body: (
      <div style={{ textAlign: 'center', padding: '24px 8px' }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: 'var(--color-interactives-badge-rust-default)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="log-out" size={28} color={THEME.danger} stroke={2.3} /></div>
        <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>{L('Sign out?')}</div>
        <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L('You can sign back in anytime. Your children stay protected.')}</div>
        <Button variant="danger" fullWidth icon="log-out" style={{ marginBottom: 10 }} onClick={() => ctx.nav('p_reports')}>{L('Sign out')}</Button>
        <Button variant="outline" fullWidth onClick={() => ctx.nav('p_account')}>{L('Cancel')}</Button>
      </div>
    ) },
  };

  // [inquiryStyle="kr"] Korean-CS-style 1:1 inquiry — category picker → FAQ deflection →
  // chat-thread compose → sent. Overrides PAGES.inquiry entirely rather than branching
  // inside it, since title/back/body all vary by krStep in a way the static PAGES map
  // (one fixed shape per page) doesn't model. Every other page is untouched.
  let krPage = null;
  if (page === 'inquiry' && inquiryStyle === 'kr') {
    if (krSent) {
      krPage = { title: L('1:1 Inquiry'), sub: null, body: (
        <div style={{ textAlign: 'center', padding: '28px 12px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={30} color={BRAND.primary} stroke={2.6} /></div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{L('Your inquiry has been received')}</div>
          <Badge variant="warning" style={{ marginBottom: 14 }}>{L('Awaiting reply')}</Badge>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L("We'll reply by email within a day. You can check its progress from your inquiry history.")}</div>
          <Button variant="primary" fullWidth style={brandBtn} onClick={() => { setKrSent(false); setKrMsg(''); setKrAgree(false); setKrFiles([]); setKrStep('category'); setKrCategory(null); ctx.nav('p_account'); }}>{L('Done')}</Button>
        </div>
      ) };
    } else if (krStep === 'compose' && krCategory) {
      krPage = { title: L('1:1 Inquiry'), sub: L(krCategory.label), onBack: () => setKrStep('faq'), body: (
        <React.Fragment>
          {/* thread — a greeting bubble, chat-style, rather than a cold form heading */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 18 }}>
            <KrAvatar />
            <div style={{ maxWidth: '86%', background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.5, fontWeight: 500 }}>
              {ko ? `안녕하세요! '${L(krCategory.label)}' 관련해서 궁금하신 점을 편하게 남겨주세요.` : `Hi! Feel free to share your question about ${L(krCategory.label).toLowerCase()}.`}
            </div>
          </div>

          {label(L('Your message'))}
          {card(
            <textarea value={krMsg} onChange={e => setKrMsg(e.target.value)} placeholder={L('Write your question here')} rows={5}
              style={{ width: '100%', border: 'none', outline: 'none', resize: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: THEME.fg1, lineHeight: 1.55, padding: '14px', boxSizing: 'border-box' }} />
          )}
          {label(L('Screenshots'))}
          {card(
            <button onClick={addKrFile} disabled={krFiles.length >= 5} className="jx-press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', border: 'none', background: 'none', cursor: krFiles.length >= 5 ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
              <Icon name="plus" size={18} color={THEME.fg2} stroke={2.4} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Add file')}</span>
              <Icon name="paperclip" size={18} color={THEME.fg3} stroke={2.2} />
            </button>
          , krFiles.length ? 10 : 8)}
          {krFiles.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {krFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '6px 6px 6px 10px' }}>
                  <Icon name="image" size={13} color={THEME.fg2} stroke={2.2} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: THEME.fg1 }}>{f}</span>
                  <button onClick={() => removeKrFile(i)} aria-label={L('Remove')} className="jx-press" style={{ width: 18, height: 18, borderRadius: 999, border: 'none', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Icon name="x" size={11} color={THEME.fg2} stroke={2.6} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {card(
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
              <button onClick={() => setKrAgree(!krAgree)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${krAgree ? BRAND.primary : THEME.border}`, background: krAgree ? BRAND.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{krAgree && <Icon name="check" size={14} color="#fff" stroke={3} />}</div>
                <span style={{ fontSize: 11, fontWeight: 800, color: BRAND.primary, flexShrink: 0 }}>[{L('Required')}]</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, lineHeight: 1.35 }}>{L(INQUIRY_CONSENT.label)}</span>
              </button>
              <button onClick={() => setKrDoc(true)} aria-label={L('View')} className="jx-press" style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
                <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.4} />
              </button>
            </div>
          )}
          <Button variant="primary" fullWidth icon="send" style={brandBtn} disabled={!krMsg.trim() || !krAgree} onClick={krMsg.trim() && krAgree ? submitKrInquiry : undefined}>{L('Send')}</Button>
        </React.Fragment>
      ) };
    } else if (krTicket) {
      const t = krTicket;
      const waitingOnSupport = t.thread[t.thread.length - 1].from === 'parent';
      krPage = { title: L('1:1 Inquiry'), sub: L(t.title), onBack: () => setKrTicket(null), body: (
        <React.Fragment>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <Badge variant={t.status === 'answered' ? 'success' : 'warning'}>{t.status === 'answered' ? L('Answered') : L('In progress')}</Badge>
          </div>
          {/* the full thread, not just one Q&A — a Korean-style 1:1 inquiry stays open for
              follow-ups, so replying below reopens it rather than starting a new ticket */}
          {t.thread.map((m, i) => m.from === 'parent' ? (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
              <div style={{ maxWidth: '86%' }}>
                <div style={{ background: BRAND.primaryLight, borderRadius: '16px 4px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: BRAND.primaryDark, lineHeight: 1.5, fontWeight: 500 }}>{L(m.text)}</div>
                {m.files?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6, justifyContent: 'flex-end' }}>
                    {m.files.map((f, j) => (
                      <div key={j} style={{ width: 96, borderRadius: 12, overflow: 'hidden', background: '#fff', border: `1px solid ${THEME.border}` }}>
                        <div style={{ width: '100%', aspectRatio: '9/16', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="image" size={22} color={THEME.fg3} stroke={1.8} />
                        </div>
                        <div style={{ padding: '5px 7px', fontSize: 10, fontWeight: 600, color: THEME.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 4, textAlign: 'right' }}>{L(m.time)}</div>
              </div>
            </div>
          ) : (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 18 }}>
              <KrAvatar />
              <div style={{ maxWidth: '86%' }}>
                <div style={{ background: THEME.surface2, borderRadius: '4px 16px 16px 16px', padding: '10px 13px', fontSize: 13.5, color: THEME.fg1, lineHeight: 1.5, fontWeight: 500 }}>{L(m.text)}</div>
                {m.files?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                    {m.files.map((f, j) => (
                      <div key={j} style={{ width: 96, borderRadius: 12, overflow: 'hidden', background: '#fff', border: `1px solid ${THEME.border}` }}>
                        <div style={{ width: '100%', aspectRatio: '9/16', background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name="image" size={22} color={THEME.fg3} stroke={1.8} />
                        </div>
                        <div style={{ padding: '5px 7px', fontSize: 10, fontWeight: 600, color: THEME.fg2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, color: THEME.fg3, marginTop: 4, marginLeft: 4 }}>{L(m.time)}</div>
              </div>
            </div>
          ))}
          {waitingOnSupport && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: THEME.fg3, fontSize: 12.5, padding: '2px 4px', marginBottom: 18 }}>
              <Icon name="clock" size={15} color={THEME.fg3} stroke={2.2} />
              {L("We'll reply by email within a day.")}
            </div>
          )}
          {/* spacer so the last bubble can scroll clear of the fixed reply bar below */}
          <div style={{ height: 64 }} />
          <div style={{ position: 'fixed', left: 16, right: 16, bottom: 24, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 999, boxShadow: THEME.shadowCard, padding: '6px 6px 6px 16px', zIndex: 40 }}>
            <input value={krReplyMsg} onChange={e => setKrReplyMsg(e.target.value)} placeholder={L('Write a follow-up message')}
              onKeyDown={e => { if (e.key === 'Enter') sendKrReply(); }}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13.5, color: THEME.fg1 }} />
            <button onClick={sendKrReply} disabled={!krReplyMsg.trim()} aria-label={L('Send')} className="jx-press"
              style={{ width: 34, height: 34, borderRadius: 999, border: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit', background: krReplyMsg.trim() ? BRAND.primary : THEME.surface2, cursor: krReplyMsg.trim() ? 'pointer' : 'default' }}>
              <Icon name="send" size={15} color={krReplyMsg.trim() ? '#fff' : THEME.fg3} stroke={2.3} />
            </button>
          </div>
        </React.Fragment>
      ) };
    } else if (krStep === 'faq' && krCategory) {
      krPage = { title: L('1:1 Inquiry'), sub: L(krCategory.label), onBack: () => setKrStep('category'), body: (
        <React.Fragment>
          {banner('help-circle', null, ko
            ? `'${L(krCategory.label)}' 관련해서 자주 묻는 질문이에요. 원하는 답을 여기서 먼저 확인해보세요.`
            : `Frequently asked questions about ${L(krCategory.label).toLowerCase()}. Check if your answer is already here.`)}
          {krCategory.items.length > 0 ? <FaqAccordion items={krCategory.items} /> : (
            <div style={{ textAlign: 'center', padding: '20px 12px', color: THEME.fg3, fontSize: 13 }}>{L("There aren't any FAQs for this topic yet.")}</div>
          )}
          <Button variant="outline" fullWidth onClick={() => setKrStep('compose')}>{L("Didn't find what you needed")}</Button>
        </React.Fragment>
      ) };
    } else {
      krPage = { title: L('1:1 Inquiry'), sub: L('Ask us anything'), body: (
        <React.Fragment>
          {label(L('Recent inquiries'))}
          {card(RECENT_TICKETS.map((t, i) => {
            const hasFiles = t.thread.some(m => m.files?.length > 0);
            return (
              <button key={i} onClick={() => { setKrTicket(t); setKrReplyMsg(''); }} style={{ ...rowStyle(i, true), width: '100%', border: 'none', background: 'none', fontFamily: 'inherit', textAlign: 'left' }}>
                <Icon name="message-square" size={18} color={THEME.fg2} stroke={2.2} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(t.title)}</div>
                  <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {L(t.time)}
                    {hasFiles && <Icon name="paperclip" size={11} color={THEME.fg3} stroke={2.4} />}
                  </div>
                </div>
                <Badge variant={t.status === 'answered' ? 'success' : 'warning'}>{t.status === 'answered' ? L('Answered') : L('In progress')}</Badge>
                {chev}
              </button>
            );
          }))}
          {label(L('What can we help with?'))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {INQUIRY_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setKrCategory(c); setKrStep('faq'); }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, background: '#fff', borderRadius: 16, boxShadow: THEME.shadowCard, padding: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                <div style={{ width: 34, height: 34, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={c.icon} size={16} color={BRAND.primary} stroke={2.2} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>{L(c.label)}</span>
              </button>
            ))}
          </div>
        </React.Fragment>
      ) };
    }
  }

  const p = krPage || PAGES[page] || PAGES.account;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={p.sub} title={p.title} onBack={ctx.params?.asTab ? undefined : (p.onBack || (() => p.back ? ctx.nav('p_detail', { page: p.back }) : ctx.nav('p_account')))} />
      <div style={{ padding: '8px 16px 0' }}>{p.body}</div>

      {/* the inquiry consent document — a sheet, not a page, so the message already typed
          survives reading it. Agreeing from here ticks the box and closes. */}
      {inqDoc && (
        <BottomSheet title={L(INQUIRY_CONSENT.label)} onClose={() => setInqDoc(false)}>
          <div style={{ background: THEME.surface2, borderRadius: 14, padding: '4px 14px', marginBottom: 14 }}>
            {INQUIRY_CONSENT.rows.map(([k, v], i) => (
              <div key={k} style={{ padding: '12px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.primary, marginBottom: 4 }}>{L(k)}</div>
                <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.55 }}>{L(v)}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: THEME.fg3, lineHeight: 1.55, fontWeight: 600 }}>{L(INQUIRY_CONSENT.note)} <span style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Documents provided by Joan Company.')}</span></div>
          <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 18 }} onClick={() => { setInqAgree(true); setInqDoc(false); }}>{L('Agree')}</Button>
        </BottomSheet>
      )}

      {/* [inquiryStyle="kr"] same consent document, same content — the KR compose step has
          its own agree/doc state (krAgree/krDoc) so switching styles mid-session can't leave
          one flow's consent silently ticked on the other. */}
      {krDoc && (
        <BottomSheet title={L(INQUIRY_CONSENT.label)} onClose={() => setKrDoc(false)}>
          <div style={{ background: THEME.surface2, borderRadius: 14, padding: '4px 14px', marginBottom: 14 }}>
            {INQUIRY_CONSENT.rows.map(([k, v], i) => (
              <div key={k} style={{ padding: '12px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.primary, marginBottom: 4 }}>{L(k)}</div>
                <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.55 }}>{L(v)}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: THEME.fg3, lineHeight: 1.55, fontWeight: 600 }}>{L(INQUIRY_CONSENT.note)} <span style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Documents provided by Joan Company.')}</span></div>
          <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 18 }} onClick={() => { setKrAgree(true); setKrDoc(false); }}>{L('Agree')}</Button>
        </BottomSheet>
      )}

      {/* edit one account field — email/phone confirm with a 6-digit code */}
      {editField && (
        <BottomSheet title={editStep === 'code' ? L('Enter the code') : `${L('Edit')} ${L(EDIT_FIELDS[editField].label)}`} onClose={() => setEditField(null)}>
          {editStep === 'input' ? (
            <React.Fragment>
              {EDIT_FIELDS[editField].type === 'date' ? (
                <DateField label={L('Date of birth')} value={editVal ? new Date(editVal + 'T00:00') : null} accent={BRAND.primary}
                  onChange={d => setEditVal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)} />
              ) : EDIT_FIELDS[editField].type === 'select' ? (
                <SelectField label={L('Gender')} title={L('Gender')} value={editVal} onChange={setEditVal} accent={BRAND.primary} options={GENDER_OPTIONS} />
              ) : (
                <Input label={L(EDIT_FIELDS[editField].label)} value={editVal} onChange={e => setEditVal(e.target.value)} type={EDIT_FIELDS[editField].type} accent={BRAND.primary} />
              )}
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={!String(editVal).trim()} onClick={String(editVal).trim() ? proceedEdit : undefined}>{EDIT_FIELDS[editField].verify ? L('Send code') : L('Save')}</Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18 }}>{L('We sent a 6-digit code to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{editVal}</span>.</div>
              <div style={{ position: 'relative' }} onClick={() => editCodeRef.current && editCodeRef.current.focus()}>
                <input ref={editCodeRef} value={editCode} inputMode="numeric" autoComplete="one-time-code" autoFocus
                  onChange={e => setEditCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const active = i === editCode.length;
                    return (
                      <div key={i} style={{ flex: 1, height: 54, borderRadius: 12, background: '#fff', border: `2px solid ${active ? BRAND.primary : 'transparent'}`, boxShadow: active ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: THEME.fg1 }}>{editCode[i] || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {resendRow(editResend, () => { setEditCode(''); editResend.reset(); })}
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={editCode.length < 6} onClick={editCode.length < 6 ? undefined : applyEdit}>{L('Verify')}</Button>
            </React.Fragment>
          )}
        </BottomSheet>
      )}

      {/* change sign-in method — re-auth first (current password, or a 6-digit code sent to
          the account email when signed in through a social provider), then a picker of every
          OTHER method. Switching to a social provider finalizes on the spot (its OAuth already
          proved it); switching to email detours through setting a password and verifying the
          inbox with a code, since nothing else is left to vouch for it. */}
      {methodStep && (
        <BottomSheet title={
          methodStep === 'pick' ? L('Choose how you’d like to sign in')
          : methodStep === 'password' ? L('Set a password')
          : methodStep === 'code' ? L('Enter the code')
          : L('Confirm it’s you')
        } onClose={closeMethodSheet}>
          {methodStep === 'reauth' && (
            socialProvider ? (
              <React.Fragment>
                <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18 }}>{L('We sent a 6-digit code to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{PARENT_PROFILE.email}</span> {L('to confirm it’s you before changing how you sign in.')}</div>
                <div style={{ position: 'relative' }} onClick={() => reauthCodeRef.current && reauthCodeRef.current.focus()}>
                  <input ref={reauthCodeRef} value={reauthCode} inputMode="numeric" autoComplete="one-time-code" autoFocus
                    onChange={e => setReauthCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    {Array.from({ length: 6 }, (_, i) => {
                      const active = i === reauthCode.length;
                      return (
                        <div key={i} style={{ flex: 1, height: 54, borderRadius: 12, background: '#fff', border: `2px solid ${active ? BRAND.primary : 'transparent'}`, boxShadow: active ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
                          <span style={{ fontSize: 22, fontWeight: 800, color: THEME.fg1 }}>{reauthCode[i] || ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {resendRow(reauthResend, () => { setReauthCode(''); reauthResend.reset(); })}
                <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={reauthCode.length < 6} onClick={reauthCode.length < 6 ? undefined : () => setMethodStep('pick')}>{L('Verify')}</Button>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Input label={L('Current password')} value={reauthPw} onChange={e => setReauthPw(e.target.value)} type="password" accent={BRAND.primary} />
                <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={!reauthPw.trim()} onClick={!reauthPw.trim() ? undefined : () => setMethodStep('pick')}>{L('Continue')}</Button>
              </React.Fragment>
            )
          )}
          {methodStep === 'pick' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['google', 'apple', 'kakao'].filter(k => k !== socialProvider).map(k => (
                <button key={k} onClick={() => pickMethod(k)} className="jx-press" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '15px 18px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 800, background: PROVIDER_BADGE_BG[k], color: k === 'apple' ? '#fff' : THEME.fg1, border: k === 'google' ? `1.5px solid ${THEME.border}` : 'none' }}>
                  <ProviderMark provider={k} />{PROVIDER_LABELS[k]}
                </button>
              ))}
              {socialProvider && (
                <button onClick={() => pickMethod('email')} className="jx-press" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '15px 18px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', background: '#fff', border: `1.5px solid ${THEME.border}` }}>
                  <Icon name="mail" size={18} color={THEME.fg1} stroke={2.2} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{L('Email')}</span>
                </button>
              )}
            </div>
          )}
          {methodStep === 'password' && (
            <React.Fragment>
              <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18 }}>{L('No provider is left to vouch for your email, so set a password JoanX can check directly.')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label={L('New password')} value={methodPw} onChange={e => setMethodPw(e.target.value)} type="password" accent={BRAND.primary} />
                <Input label={L('Confirm new password')} value={methodPw2} onChange={e => setMethodPw2(e.target.value)} type="password" accent={BRAND.primary} error={methodPwMismatch ? L('Passwords don’t match') : undefined} />
              </div>
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={!methodPwReady} onClick={methodPwReady ? () => { methodResend.reset(); setMethodStep('code'); } : undefined}>{L('Continue')}</Button>
            </React.Fragment>
          )}
          {methodStep === 'code' && (
            <React.Fragment>
              <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18 }}>{L('We sent a 6-digit code to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{PARENT_PROFILE.email}</span>.</div>
              <div style={{ position: 'relative' }} onClick={() => methodCodeRef.current && methodCodeRef.current.focus()}>
                <input ref={methodCodeRef} value={methodCode} inputMode="numeric" autoComplete="one-time-code" autoFocus
                  onChange={e => setMethodCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const active = i === methodCode.length;
                    return (
                      <div key={i} style={{ flex: 1, height: 54, borderRadius: 12, background: '#fff', border: `2px solid ${active ? BRAND.primary : 'transparent'}`, boxShadow: active ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: THEME.fg1 }}>{methodCode[i] || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {resendRow(methodResend, () => { setMethodCode(''); methodResend.reset(); })}
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={methodCode.length < 6} onClick={methodCode.length < 6 ? undefined : finalizeEmailMethod}>{L('Verify')}</Button>
            </React.Fragment>
          )}
        </BottomSheet>
      )}

      {/* change password — same sheet-over-the-current-screen pattern as reauth/email-edit,
          rather than a dedicated full page, since it's just another credential confirmation. */}
      {pwStep && (
        <BottomSheet title={pwStep === 'code' ? L('Enter the code') : pwStep === 'saved' ? L('Password updated') : L('Change password')} onClose={resetPwFlow}>
          {pwStep === 'saved' ? (
            <div style={{ textAlign: 'center', padding: '8px 4px 4px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={30} color={BRAND.primary} stroke={2.6} /></div>
              <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L('Your password has been changed.')}</div>
              <Button variant="primary" fullWidth style={brandBtn} onClick={resetPwFlow}>{L('Done')}</Button>
            </div>
          ) : pwStep === 'code' ? (
            // same 6-digit verify pattern as the email/phone edit sheet — one code UI for every
            // credential change in the app, rather than a one-off just for password.
            <React.Fragment>
              <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18 }}>{L('We sent a 6-digit code to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{PARENT_PROFILE.email}</span>.</div>
              <div style={{ position: 'relative' }} onClick={() => pwCodeRef.current && pwCodeRef.current.focus()}>
                <input ref={pwCodeRef} value={pwCode} inputMode="numeric" autoComplete="one-time-code" autoFocus
                  onChange={e => setPwCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: 6 }, (_, i) => {
                    const active = i === pwCode.length;
                    return (
                      <div key={i} style={{ flex: 1, height: 54, borderRadius: 12, background: '#fff', border: `2px solid ${active ? BRAND.primary : 'transparent'}`, boxShadow: active ? 'none' : THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s' }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: THEME.fg1 }}>{pwCode[i] || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {resendRow(pwResend, () => { setPwCode(''); pwResend.reset(); })}
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={pwCode.length < 6} onClick={pwCode.length < 6 ? undefined : () => setPwStep('saved')}>{L('Verify')}</Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {banner('lock', null, L('Use at least 8 characters with a mix of letters and numbers.'))}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Input label={L('Current password')} value={curPw} onChange={e => setCurPw(e.target.value)} type="password" accent={BRAND.primary} />
                <Input label={L('New password')} value={newPw} onChange={e => setNewPw(e.target.value)} type="password" accent={BRAND.primary} />
                <Input label={L('Confirm new password')} value={confPw} onChange={e => setConfPw(e.target.value)} type="password" accent={BRAND.primary} error={pwMismatch ? L('Passwords don’t match') : undefined} />
              </div>
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 18 }} disabled={!pwReady} onClick={pwReady ? () => { pwResend.reset(); setPwStep('code'); } : undefined}>{L('Update password')}</Button>
            </React.Fragment>
          )}
        </BottomSheet>
      )}

      {/* change profile photo — options are mocked in the prototype */}
      {photoSheet && (
        <BottomSheet title={L('Profile photo')} onClose={() => setPhotoSheet(false)}>
          {[['camera', L('Take photo')], ['image', L('Choose from library')], ['trash-2', L('Remove photo')]].map(([icon, lbl], i) => (
            <div key={icon} onClick={() => { setPhotoSheet(false); if (icon === 'trash-2') setConfirmRemovePhoto(true); else say(L('Profile photo updated')); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 4px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
              <Icon name={icon} size={19} color={icon === 'trash-2' ? THEME.danger : THEME.fg1} stroke={2.2} />
              <span style={{ fontSize: 14.5, fontWeight: 700, color: icon === 'trash-2' ? THEME.danger : THEME.fg1 }}>{lbl}</span>
            </div>
          ))}
        </BottomSheet>
      )}

      {/* delete account — permanent, so it double-confirms */}
      {confirmDelete && (
        <Modal title={L('Delete your account?')} onClose={() => setConfirmDelete(false)}>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18, textAlign: 'center' }}>{L('This permanently deletes your account and unlinks every child device. This can’t be undone.')}</div>
          <Button variant="danger" fullWidth icon="trash-2" style={{ marginBottom: 10 }} onClick={() => { setConfirmDelete(false); ctx.nav('p_reports'); }}>{L('Delete account')}</Button>
          <Button variant="outline" fullWidth onClick={() => setConfirmDelete(false)}>{L('Cancel')}</Button>
        </Modal>
      )}

      {/* confirm before the one destructive action */}
      {confirmRemovePhoto && (
        <Modal title={L('Remove profile photo?')} onClose={() => setConfirmRemovePhoto(false)}>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, marginBottom: 18, textAlign: 'center' }}>{L('This removes your current photo. You can add a new one anytime.')}</div>
          <Button variant="danger" fullWidth icon="trash-2" style={{ marginBottom: 10 }} onClick={() => { setConfirmRemovePhoto(false); say(L('Profile photo removed')); }}>{L('Remove')}</Button>
          <Button variant="outline" fullWidth onClick={() => setConfirmRemovePhoto(false)}>{L('Cancel')}</Button>
        </Modal>
      )}

      {/* confirmation toast — pinned to the phone frame, auto-dismisses */}
      {toast && (
        <div className="jx-fade" style={{ position: 'fixed', bottom: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(43,41,38,.92)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>
            <Icon name="check" size={15} color="#fff" stroke={2.8} />{toast}
          </div>
        </div>
      )}
    </div>
  );
}

export { ParentDetail };
