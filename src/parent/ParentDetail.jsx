// JoanX — parent app · ParentDetail

import React from 'react';
import { CHILDREN, NOTICES, LEGAL_DOCS, PARENT_PROFILE } from '../core/data.jsx';
import { Badge, Bar, BottomSheet, Button, Icon, Input, Modal, PhotoAvatar, THEME, Toggle, screenBgFor } from '../core/primitives.jsx';
import { L, setLang } from '../core/i18n.jsx';
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

// ── Settings detail pages (one screen per row) ───────────────────────
function ParentDetail({ ctx }) {
  const page = ctx.params?.page || 'account';
  const [twoFA, setTwoFA] = React.useState(true);
  const [faceId, setFaceId] = React.useState(true);
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
  const activeNotice = NOTICES.find(n => n.id === ctx.params?.noticeId) || NOTICES[0];
  const activeLegal = LEGAL_DOCS.find(d => d.id === ctx.params?.legalId) || LEGAL_DOCS[0];
  // Account editing — one field at a time via a bottom sheet; `rev` bumps to
  // re-render after we mutate the shared PARENT_PROFILE object.
  const [editField, setEditField] = React.useState(null);   // 'name' | 'email' | 'phone' | null
  const [editVal, setEditVal] = React.useState('');
  const [photoSheet, setPhotoSheet] = React.useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);   // delete-account confirmation
  const [, setRev] = React.useState(0);
  const [toast, setToast] = React.useState(null);           // brief confirmation pill
  const say = m => { setToast(m); setTimeout(() => setToast(null), 1800); };
  // Email & phone are contact points, so a change is confirmed by a 6-digit code
  // (mirrors sign-up). Name needs no verification and saves in one step.
  const EDIT_FIELDS = { name: { label: 'Name', type: 'text', verify: false }, email: { label: 'Email', type: 'email', verify: true }, phone: { label: 'Phone', type: 'tel', verify: true } };
  const [editStep, setEditStep] = React.useState('input');  // 'input' | 'code'
  const [editCode, setEditCode] = React.useState('');
  const editCodeRef = React.useRef(null);
  const openEdit = f => { setEditVal(PARENT_PROFILE[f]); setEditCode(''); setEditStep('input'); setEditField(f); };
  const applyEdit = () => { if (editVal.trim()) PARENT_PROFILE[editField] = editVal.trim(); setEditField(null); setRev(r => r + 1); say(L('Changes saved')); };
  const proceedEdit = () => { if (EDIT_FIELDS[editField].verify) { setEditCode(''); setEditStep('code'); } else applyEdit(); };
  // Change password — local-only in the prototype (nothing is persisted).
  const [curPw, setCurPw] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confPw, setConfPw] = React.useState('');
  const [pwSaved, setPwSaved] = React.useState(false);
  const pwMismatch = confPw.length > 0 && newPw !== confPw;
  const pwReady = curPw.length > 0 && newPw.length >= 8 && newPw === confPw;

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
          {/* Email is read-only — it comes from the linked Google/Apple account, so it's changed
              there, not with an SMS code here. */}
          <div style={rowStyle(1, false)}>
            <Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Email')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="link" size={11} color={THEME.fg3} stroke={2.4} />{L('Linked to your Google account')}</div>
            </div>
            <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, textAlign: 'right' }}>{PARENT_PROFILE.email}</span>
          </div>
          {navRow(2, 'phone', L('Phone'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{PARENT_PROFILE.phone}</span>, undefined, () => openEdit('phone'))}
        </React.Fragment>)}
        {label(L('Sign-in'))}
        {card(
          <div style={rowStyle(0, false)}>
            <Icon name="mail" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{PARENT_PROFILE.provider}</div>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: BRAND.primaryDark, background: BRAND.primaryLight, padding: '3px 9px', borderRadius: 999 }}>{L('Connected')}</span>
          </div>
        )}
        {label(L('Security'))}
        {card(<React.Fragment>
          {navRow(0, 'lock', L('Change password'), chev, undefined, () => ctx.nav('p_detail', { page: 'password' }))}
          {toggleRow(1, 'shield-check', L('Two-factor authentication'), twoFA, setTwoFA)}
          {toggleRow(2, 'scan-face', L('Face ID unlock'), faceId, setFaceId)}
        </React.Fragment>)}
        {card(
          <div onClick={() => setConfirmDelete(true)} style={{ ...rowStyle(0, true), justifyContent: 'center' }}><Icon name="trash-2" size={18} color={THEME.danger} stroke={2.2} /><div style={{ fontSize: 14, fontWeight: 800, color: THEME.danger }}>{L('Delete account')}</div></div>
        )}
      </React.Fragment>
    ) },

    password: { title: L('Change password'), sub: null, back: 'account', body: (
      pwSaved ? (
        <div style={{ textAlign: 'center', padding: '28px 12px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><Icon name="check" size={30} color={BRAND.primary} stroke={2.6} /></div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{L('Password updated')}</div>
          <div style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>{L('Your password has been changed.')}</div>
          <Button variant="primary" fullWidth style={brandBtn} onClick={() => { setCurPw(''); setNewPw(''); setConfPw(''); setPwSaved(false); ctx.nav('p_detail', { page: 'account' }); }}>{L('Done')}</Button>
        </div>
      ) : (
      <React.Fragment>
        {banner('lock', null, L('Use at least 8 characters with a mix of letters and numbers.'))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input label={L('Current password')} value={curPw} onChange={e => setCurPw(e.target.value)} type="password" accent={BRAND.primary} />
          <Input label={L('New password')} value={newPw} onChange={e => setNewPw(e.target.value)} type="password" accent={BRAND.primary} />
          <Input label={L('Confirm new password')} value={confPw} onChange={e => setConfPw(e.target.value)} type="password" accent={BRAND.primary} error={pwMismatch ? L('Passwords don’t match') : undefined} />
        </div>
        <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 18 }} disabled={!pwReady} onClick={pwReady ? () => setPwSaved(true) : undefined}>{L('Update password')}</Button>
      </React.Fragment>
      )
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
                  {[['08:12', 'Walk detected'], ['08:12', 'Warning shown · looked up in 2s'], ['08:31', 'Safe walk complete · +200'], ['09:01', 'Synced to cloud']].map(([t, e], i) => (
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

  const p = PAGES[page] || PAGES.account;
  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={p.sub} title={p.title} onBack={ctx.params?.asTab ? undefined : () => p.back ? ctx.nav('p_detail', { page: p.back }) : ctx.nav('p_account')} />
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

      {/* edit one account field — email/phone confirm with a 6-digit code */}
      {editField && (
        <BottomSheet title={editStep === 'code' ? L('Enter the code') : `${L('Edit')} ${L(EDIT_FIELDS[editField].label)}`} onClose={() => setEditField(null)}>
          {editStep === 'input' ? (
            <React.Fragment>
              <Input label={L(EDIT_FIELDS[editField].label)} value={editVal} onChange={e => setEditVal(e.target.value)} type={EDIT_FIELDS[editField].type} accent={BRAND.primary} />
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={!editVal.trim()} onClick={editVal.trim() ? proceedEdit : undefined}>{EDIT_FIELDS[editField].verify ? L('Send code') : L('Save')}</Button>
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
              <button onClick={() => setEditCode('')} style={{ marginTop: 14, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, color: THEME.fg2, cursor: 'pointer' }}>{L('Didn’t get it?')} <span style={{ color: BRAND.primary, fontWeight: 800 }}>{L('Resend code')}</span></button>
              <Button variant="primary" fullWidth style={{ ...brandBtn, marginTop: 16 }} disabled={editCode.length < 6} onClick={editCode.length < 6 ? undefined : applyEdit}>{L('Verify')}</Button>
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
