// JoanX — parent app · ParentDetail

import React from 'react';
import { CHILDREN } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, THEME, Toggle } from '../core/primitives.jsx';
import { L, setLang } from '../core/i18n.jsx';
import { BRAND, ParentHead } from './shared.jsx';

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

  // page → { title, sub, body }
  const PAGES = {
    account: { title: L('Account'), sub: L('Profile & security'), body: (
      <React.Fragment>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: BRAND.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 800 }}>S</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: 17, fontWeight: 800 }}>Sora Kim</div><div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 1 }}>{L('Parent account')}</div></div>
        </div>
        {label(L('Account details'))}
        {card(<React.Fragment>
          {navRow(0, 'user', L('Name'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>Sora Kim</span>)}
          {navRow(1, 'mail', L('Email'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>sora.kim@email.com</span>)}
          {navRow(2, 'phone', L('Phone'), <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>+82 10-1234-5678</span>)}
        </React.Fragment>)}
        {label(L('Security'))}
        {card(<React.Fragment>
          {navRow(0, 'lock', L('Change password'))}
          {toggleRow(1, 'shield-check', L('Two-factor authentication'), twoFA, setTwoFA)}
          {toggleRow(2, 'scan-face', L('Face ID unlock'), faceId, setFaceId)}
        </React.Fragment>)}
        {label(L('Guardians'))}
        {card(<React.Fragment>
          {navRow(0, 'user', 'Min-jun Kim', chev, L('Co-parent'))}
          <div style={{ ...rowStyle(1, true), color: BRAND.primary }}><Icon name="user-plus" size={18} color={BRAND.primary} stroke={2.3} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: BRAND.primary }}>{L('Invite a guardian')}</div></div>
        </React.Fragment>)}
      </React.Fragment>
    ) },

    plan: { title: L('Subscription'), sub: L('JoanX Family plan'), body: (
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
        <Button variant="primary" fullWidth icon="arrow-up-circle">{L('Change plan')}</Button>
      </React.Fragment>
    ) },

    privacy: { title: L('Data & privacy'), sub: L('Control your data'), body: (
      <React.Fragment>
        {banner('shield-check', L('Privacy first'), L('Your privacy is protected. JoanX never reads messages or sells your data.'))}
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
          : <Button variant="primary" fullWidth icon="download" onClick={() => setExported(true)}>{L('Request export')}</Button>}
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
        {card(<React.Fragment>
          {navRow(0, 'help-circle', L('What’s the difference between Smart and Lite mode?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(1, 'help-circle', L('Is my child’s location private?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(2, 'help-circle', L('How do I add another child?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(3, 'help-circle', L('How are points earned?'), undefined, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
          {navRow(4, 'messages-square', L('Browse all FAQs'), chev, undefined, () => ctx.nav('p_detail', { page: 'faq' }))}
        </React.Fragment>)}
        {label(L('Contact us'))}
        {card(<React.Fragment>
          {navRow(0, 'message-circle', L('Chat with support'))}
          {navRow(1, 'mail', L('Email us'), <span style={{ fontSize: 12.5, color: THEME.fg3 }}>help@joanx.app</span>)}
        </React.Fragment>)}
        {card(<React.Fragment>
          {navRow(0, 'book-open', L('User guide'))}
          {navRow(1, 'play-circle', L('Video tutorials'))}
        </React.Fragment>)}
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

    about: { title: L('About JoanX'), sub: 'Version 1.0.0', body: (
      <React.Fragment>
        <div style={{ textAlign: 'center', padding: '12px 0 22px' }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: BRAND.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: BRAND.shadowPrimary, marginBottom: 12 }}><Icon name="shield-check" size={36} color="#fff" stroke={2.2} /></div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>JoanX</div>
          <div style={{ fontSize: 12.5, color: THEME.fg3, marginTop: 2 }}>Version 1.0.0</div>
          <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 12, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>{L('A calmer way to keep kids safe while they walk and grow.')}</div>
        </div>
        {card(<React.Fragment>
          {navRow(0, 'file-text', L('Terms of Service'))}
          {navRow(1, 'shield-check', L('Privacy Policy'))}
          {navRow(2, 'code', L('Open-source licenses'))}
          {navRow(3, 'star', L('Rate JoanX'))}
        </React.Fragment>)}
        <div style={{ textAlign: 'center', fontSize: 11.5, color: THEME.fg3, marginTop: 4 }}>{L('Made with care for safer walks.')}</div>
      </React.Fragment>
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
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: THEME.screenBg }}>
      <ParentHead sub={p.sub} title={p.title} onBack={() => p.back ? ctx.nav('p_detail', { page: p.back }) : ctx.nav('p_account')} />
      <div style={{ padding: '8px 16px 0' }}>{p.body}</div>
    </div>
  );
}

export { ParentDetail };
