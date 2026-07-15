// JoanX — core · AuthFlow (F-33)
//
// The guardian's sign-in, used by the parent app after its intro slides. The child device
// has no account of its own — its identity comes from the parent it pairs with — so this
// never appears there. Phone number + SMS verification is the primary and only credential:
// no password, hence no reset flow. Google (Android) and Apple (iOS) are offered where
// platform policy expects them; email is an MVP-disabled method in AUTH.methods, so
// enabling it later means turning the flag on and adding its form here.

import React from 'react';
import { Button, Icon, Input, THEME, mixHue } from './primitives.jsx';
import { AUTH, KNOWN_PHONES, authMethods } from './data.jsx';
import { L } from './i18n.jsx';

const digitsOf = (s) => s.replace(/\D/g, '');
const knownPhone = (p) => KNOWN_PHONES.some(k => digitsOf(k) === digitsOf(p));

// The three legal consents a guardian must give before the service can be used.
// Each carries a short document body — provided by Joan Company — that expands in place,
// so the parent can read what they are agreeing to without leaving the flow.
const CONSENTS = [
  { key: 'personal', label: 'Collection and use of personal information',
    body: 'JoanX collects your and your child’s name, date of birth and phone number to create and protect the account — used only to run the safety service, never sold.' },
  { key: 'tos', label: 'Agreement to the Terms of Service',
    body: 'By using JoanX you agree to use it as a walking-safety companion under a guardian’s supervision.' },
  { key: 'location', label: 'Consent to the use of location information',
    body: 'Location is used only in Smart mode while your child is walking, to sense risky moments — never continuous tracking.' },
];

// Provider marks are drawn, not imported, so the prototype carries no external asset.
// Swap for the official artwork before store submission — Google and Apple each mandate
// their exact button branding.
function ProviderMark({ provider }) {
  if (provider === 'apple') return (
    <svg width="16" height="19" viewBox="0 0 384 512" fill="#fff" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.5h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.6Z" />
      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z" />
      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z" />
    </svg>
  );
}

// accent  — brand colour of the host app
// btnStyle— the host's primary-button style, so the CTA matches its app
// onDone  — verification succeeded (existing account) or the new profile was completed
function AuthFlow({ accent = THEME.brand, btnStyle, onDone }) {
  const [phase, setPhase] = React.useState('phone');   // 'phone' | 'code' | 'profile' | 'consent'
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeErr, setCodeErr] = React.useState(false);
  const [resendLeft, setResendLeft] = React.useState(AUTH.smsResendSeconds);
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const codeRef = React.useRef(null);
  const socials = authMethods().filter(m => m.key === 'google' || m.key === 'apple');

  // resend cooldown — a fresh SMS can only be requested once this reaches 0
  React.useEffect(() => {
    if (phase !== 'code' || resendLeft <= 0) return undefined;
    const t = setInterval(() => setResendLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, resendLeft]);

  const phoneOk = digitsOf(phone).length >= 10;
  const profileOk = name.trim() && dob && gender;
  const resendLabel = `${Math.floor(resendLeft / 60)}:${String(resendLeft % 60).padStart(2, '0')}`;

  const sendCode = () => { setCode(''); setCodeErr(false); setResendLeft(AUTH.smsResendSeconds); setPhase('code'); };
  // Any complete code is accepted in the prototype. A number we already know signs straight
  // in; a new one goes on to create its profile — the same verification either way.
  const verifyCode = () => {
    if (code.length < AUTH.smsCodeLength) { setCodeErr(true); return; }
    if (knownPhone(phone)) onDone(); else setPhase('profile');
  };
  // Google / Apple hand back a verified identity, so they land where the SMS code does.
  const socialSignIn = () => setPhase('profile');

  return (
    <React.Fragment>
      {/* phone — the primary method */}
      {phase === 'phone' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '26px 28px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Sign in with your phone')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L("We'll text you a 6-digit code. New here? This creates your account.")}</p>

            <Input label={L('Phone number')} value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9-]/g, ''))} placeholder="010-1234-5678" icon="phone" type="tel" accent={accent} />

            {socials.length > 0 && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '26px 0 18px' }}>
                  <span style={{ flex: 1, height: 1, background: THEME.border }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg3 }}>{L('or')}</span>
                  <span style={{ flex: 1, height: 1, background: THEME.border }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {socials.map(m => {
                    const apple = m.key === 'apple';
                    return (
                      <button key={m.key} onClick={socialSignIn} className="jx-press" style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%',
                        padding: '15px 18px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 800,
                        background: apple ? '#000' : '#fff', color: apple ? '#fff' : THEME.fg1,
                        border: apple ? 'none' : `1.5px solid ${THEME.border}`,
                      }}>
                        <ProviderMark provider={m.key} />{L(m.label)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <p style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.5, margin: '20px 2px 0', fontWeight: 600 }}>{L('By continuing you agree to our Terms & Privacy Policy.')}</p>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={btnStyle} disabled={!phoneOk} onClick={phoneOk ? sendCode : undefined}>{L('Send code')}</Button>
          </div>
        </>
      )}

      {/* SMS verification */}
      {phase === 'code' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
            <button onClick={() => setPhase('phone')} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
            </button>

            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Enter the code')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 28px' }}>
              {L('We sent a 6-digit code to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{phone}</span>.
            </p>

            <div style={{ position: 'relative' }} onClick={() => codeRef.current && codeRef.current.focus()}>
              <input ref={codeRef} value={code} inputMode="numeric" autoComplete="one-time-code"
                onChange={e => { setCode(digitsOf(e.target.value).slice(0, AUTH.smsCodeLength)); setCodeErr(false); }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, border: 'none', outline: 'none', cursor: 'text', fontFamily: 'inherit' }} />
              <div className={codeErr ? 'jx-shake' : ''} style={{ display: 'flex', gap: 9 }}>
                {Array.from({ length: AUTH.smsCodeLength }, (_, i) => {
                  const ch = code[i];
                  const active = !codeErr && i === code.length && code.length < AUTH.smsCodeLength;
                  const border = codeErr ? THEME.danger : (active ? THEME.fg1 : 'transparent');
                  return (
                    <div key={i} style={{ width: 44, height: 56, borderRadius: 14, background: codeErr ? THEME.dangerLight : '#fff', border: `2px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .15s, background .15s' }}>
                      <span className="game-font" style={{ fontSize: 27, fontWeight: 500, color: codeErr ? THEME.danger : THEME.fg1 }}>{ch || ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {codeErr && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                <Icon name="alert-circle" size={15} color={THEME.danger} stroke={2.3} />
                <span style={{ fontSize: 12.5, color: THEME.danger, fontWeight: 700 }}>{L('Enter all 6 digits of the code.')}</span>
              </div>
            )}

            {/* resend is behind a cooldown so a tap-happy user can't spam the SMS gateway */}
            <div style={{ marginTop: 18 }}>
              {resendLeft > 0 ? (
                <span style={{ fontSize: 12.5, color: THEME.fg3, fontWeight: 600 }}>
                  {L('Didn’t get it? You can resend in')} <b style={{ color: THEME.fg2, fontVariantNumeric: 'tabular-nums' }}>{resendLabel}</b>
                </span>
              ) : (
                <button onClick={sendCode} style={{ padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 800, color: accent, cursor: 'pointer' }}>{L('Resend code')}</button>
              )}
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={btnStyle} onClick={verifyCode}>{L('Verify')}</Button>
          </div>
        </>
      )}

      {/* new account — the little we still need once the number is verified */}
      {phase === 'profile' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '26px 28px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Create account')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L('Tell us a bit about you.')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label={L('Name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Sora Kim')} icon="user" accent={accent} />
              <Input label={L('Date of birth')} value={dob} onChange={e => setDob(e.target.value)} icon="cake" type="date" accent={accent} />
              <ChoiceRow value={gender} setter={setGender} accent={accent} />
            </div>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={btnStyle} disabled={!profileOk} onClick={profileOk ? () => setPhase('consent') : undefined}>{L('Next')}</Button>
          </div>
        </>
      )}

      {/* guardian consent — required by law before the service can be used. New accounts
          only: a known phone signs straight in, having consented at its own registration. */}
      {phase === 'consent' && (
        <ConsentStep accent={accent} btnStyle={btnStyle} onBack={() => setPhase('profile')} onDone={onDone} />
      )}
    </React.Fragment>
  );
}

// The guardian, as the child's legal representative, gives consent here. All three legal
// consents plus the guardian affirmation are required — the CTA stays disabled until every
// box is checked, so the service cannot be entered without them. Documents expand in place.
function ConsentStep({ accent, btnStyle, onBack, onDone }) {
  const [agree, setAgree] = React.useState({ personal: false, tos: false, location: false, guardian: false });
  const [openDoc, setOpenDoc] = React.useState(null);
  const keys = ['personal', 'tos', 'location', 'guardian'];
  const allOn = keys.every(k => agree[k]);
  const set = (k) => setAgree(a => ({ ...a, [k]: !a[k] }));
  const toggleAll = () => { const v = !allOn; setAgree({ personal: v, tos: v, location: v, guardian: v }); };

  return (
    <>
      <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
        <button onClick={onBack} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
        </button>

        <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('A few quick approvals')}</h1>
        <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('As the legal guardian, please review and agree before you start.')}</p>

        {/* agree-to-all — the familiar single-tap master row */}
        <button onClick={toggleAll} className="jx-press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '15px 16px', borderRadius: 16, border: `1.5px solid ${allOn ? accent : THEME.border}`, background: allOn ? mixHue(accent, 0, 40, 0.1) : '#fff', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 14 }}>
          <CheckBox on={allOn} accent={accent} />
          <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{L('Agree to all')}</span>
        </button>

        {/* the three legal consents — each viewable in place */}
        <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${THEME.border}`, overflow: 'hidden' }}>
          {CONSENTS.map((c, i) => {
            const on = agree[c.key];
            const open = openDoc === c.key;
            return (
              <div key={c.key} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
                  <button onClick={() => set(c.key)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <CheckBox on={on} accent={accent} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: accent, flexShrink: 0 }}>[{L('Required')}]</span>
                    <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.35 }}>{L(c.label)}</span>
                  </button>
                  <button onClick={() => setOpenDoc(open ? null : c.key)} style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '4px 2px 4px 6px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, color: THEME.fg3, flexShrink: 0 }}>
                    {L('View')}<Icon name={open ? 'chevron-up' : 'chevron-down'} size={15} color={THEME.fg3} stroke={2.3} />
                  </button>
                </div>
                {open && <div style={{ fontSize: 12.5, color: THEME.fg2, lineHeight: 1.55, padding: '0 14px 14px 40px' }}>{L(c.body)} <span style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Documents provided by Joan Company.')}</span></div>}
              </div>
            );
          })}
        </div>

        {/* guardian affirmation — the legal-representative check */}
        <button onClick={() => set('guardian')} className="jx-press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 16, border: `1.5px solid ${THEME.border}`, background: '#fff', cursor: 'pointer', fontFamily: 'inherit', marginTop: 14, textAlign: 'left' }}>
          <CheckBox on={agree.guardian} accent={accent} />
          <span style={{ fontSize: 11, fontWeight: 800, color: accent, flexShrink: 0 }}>[{L('Required')}]</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.35 }}>{L("I'm the parent or legal guardian")} — {L('I have the right to consent to this service on the child’s behalf.')}</span>
        </button>

        <p style={{ fontSize: 12, color: THEME.fg3, lineHeight: 1.5, margin: '18px 2px 0', fontWeight: 600 }}>{L('We don’t collect resident registration numbers or other unnecessary ID.')}</p>
      </div>

      <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
        <Button variant="primary" size="lg" fullWidth style={btnStyle} disabled={!allOn} onClick={allOn ? onDone : undefined}>{L('Agree & continue')}</Button>
      </div>
    </>
  );
}

// A flat square check — no glow — that fills with the host accent when on.
function CheckBox({ on, accent }) {
  return (
    <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? accent : '#fff', border: on ? 'none' : `2px solid ${THEME.border}`, transition: 'background .12s' }}>
      {on && <Icon name="check" size={15} color="#fff" stroke={3} />}
    </span>
  );
}

// gender — chip choice rather than a dropdown; local so core doesn't depend on the parent app
function ChoiceRow({ value, setter, accent }) {
  const opts = [['male', 'Male'], ['female', 'Female'], ['other', 'Prefer not to say']];
  return (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: THEME.fg2, margin: '0 0 8px 2px' }}>{L('Gender')}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {opts.map(([v, l]) => {
          const on = value === v;
          return (
            <button key={v} onClick={() => setter(v)} className="jx-press" style={{
              padding: '11px 16px', borderRadius: 999, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800,
              background: on ? accent : '#fff', color: on ? '#fff' : THEME.fg2,
              border: on ? 'none' : `1.5px solid ${THEME.border}`,
            }}>{L(l)}</button>
          );
        })}
      </div>
    </div>
  );
}

export { AuthFlow };
