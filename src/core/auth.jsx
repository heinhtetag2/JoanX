// JoanX — core · AuthFlow (F-33)
//
// The guardian's sign-in and sign-up, used by the parent app after its intro slides. The
// child device has no account of its own — its identity comes from the parent it pairs with —
// so this never appears there.
//
// It opens on a choice: log in or create an account. Both run the SAME credential underneath
// — phone number + SMS verification (no password, hence no reset flow) — so the mode is not a
// second mechanism, only a statement of intent: it decides where a verified number lands and
// what to say when it arrives on the wrong path (an unknown number under "log in", or a known
// one under "sign up"). Google (Android) and Apple (iOS) are offered where platform policy
// expects them; email is an MVP-disabled method in AUTH.methods, so enabling it later means
// turning the flag on and adding its form here.

import React from 'react';
import { Button, DateField, Icon, Input, SelectField, THEME, formatPhone, mixHue } from './primitives.jsx';
import { AUTH, KNOWN_PHONES, authMethods } from './data.jsx';
import { L } from './i18n.jsx';

const digitsOf = (s) => s.replace(/\D/g, '');
const knownPhone = (p) => KNOWN_PHONES.some(k => digitsOf(k) === digitsOf(p));

// The three legal consents a guardian must give before the service can be used.
// Each carries a full document body — provided by Joan Company — that opens on its own page,
// so the parent can read what they are agreeing to without losing their place in the flow.
const CONSENTS = [
  { key: 'personal', label: 'Collection and use of personal information',
    body: "JoanX collects the guardian's and the child's name, date of birth and mobile number, together with the device and motion signals generated while the service is running. This information is used only to create and secure the account, to operate the walking-safety features, and to provide the guardian with safety reports. Personal information is retained only for as long as needed to provide the service and is deleted without delay once the account is closed or the retention period ends, unless a longer period is required by law. JoanX does not sell personal information and does not share it with any third party except where necessary to operate the service or where required by law. You may decline this consent; however, because this information is essential to the safety service, the service cannot be provided without it." },
  { key: 'tos', label: 'Agreement to the Terms of Service',
    body: "These Terms govern your use of JoanX as a walking-safety companion operated under a guardian's supervision. By agreeing, you accept responsibility for setting up and managing the service on the child's behalf and agree to use it only for its intended safety purpose. JoanX offers safety guidance and in-app rewards, but it does not replace adult supervision and does not guarantee that every accident or hazard can be prevented. The service may be updated, suspended or modified to protect users or to comply with the law, and your continued use after such changes take effect constitutes acceptance of the revised Terms." },
  { key: 'location', label: 'Consent to the use of location information',
    body: 'JoanX uses location information only while the child is actively walking, in order to detect nearby road risks and moments that call for a safety warning. Location is processed on a just-in-time basis for these safety features and is never used for continuous or background tracking, advertising or profiling. Location data is retained only for as long as needed to provide and improve the safety features and is then deleted. You may withdraw this consent at any time in settings; doing so will limit or disable the location-based safety features.' },
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
// hero    — full-bleed image behind the welcome screen, so the auth landing reads as the
//           closing beat of onboarding, not a bare form. Falls back to a brand gradient.
// onDone  — verification succeeded (existing account) or the new profile was completed
function AuthFlow({ accent = THEME.brand, btnStyle, hero, onDone }) {
  // The guardian first says what they are here to do — log in or create an account. Both
  // credentials are the same phone + SMS; the mode only decides where a verified number lands
  // and what to say when it knocks on the wrong door (see verifyCode).
  const [phase, setPhase] = React.useState('choose');  // 'choose' | 'phone' | 'code' | 'profile' | 'consent'
  const [mode, setMode] = React.useState('login');     // 'login' | 'signup'
  const [phone, setPhone] = React.useState('');
  const [code, setCode] = React.useState('');
  const [codeErr, setCodeErr] = React.useState(false);
  const [notice, setNotice] = React.useState(null);    // 'no-account' | 'exists' — a wrong-door hint on the code screen
  const [resendLeft, setResendLeft] = React.useState(AUTH.smsResendSeconds);
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [photo, setPhoto] = React.useState(null);   // profile picture (data URL); optional — falls back to the name initial
  const codeRef = React.useRef(null);
  const photoRef = React.useRef(null);
  const socials = authMethods().filter(m => m.key === 'google' || m.key === 'apple');
  const signup = mode === 'signup';

  // resend cooldown — a fresh SMS can only be requested once this reaches 0
  React.useEffect(() => {
    if (phase !== 'code' || resendLeft <= 0) return undefined;
    const t = setInterval(() => setResendLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [phase, resendLeft]);

  const phoneOk = digitsOf(phone).length >= 10;
  const profileOk = name.trim() && dob && gender;
  const resendLabel = `${Math.floor(resendLeft / 60)}:${String(resendLeft % 60).padStart(2, '0')}`;

  // Profile picture is optional. A chosen image previews immediately; skipping it leaves the
  // avatar as the name's initial — the same monogram the child app shows the guardian by.
  const initial = name.trim().charAt(0).toUpperCase();
  const pickPhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setPhoto(r.result);
    r.readAsDataURL(f);
  };
  // Clearing the photo drops back to the initial. Reset the input value too, so re-picking the
  // very same file still fires onChange.
  const removePhoto = () => { setPhoto(null); if (photoRef.current) photoRef.current.value = ''; };

  // Enter a mode from the landing screen and go straight to the phone step.
  const start = (m) => { setMode(m); setNotice(null); setPhase('phone'); };
  const sendCode = () => { setCode(''); setCodeErr(false); setNotice(null); setResendLeft(AUTH.smsResendSeconds); setPhase('code'); };

  // Any complete code is accepted in the prototype; the verification is the same either way.
  // Where it lands depends on the mode and whether the number already has an account:
  //   log in  + known   → straight into the app
  //   log in  + unknown → offer to create an account (they picked the wrong door)
  //   sign up + unknown → on to create the profile
  //   sign up + known   → offer to log in instead
  const verifyCode = () => {
    if (code.length < AUTH.smsCodeLength) { setCodeErr(true); return; }
    const known = knownPhone(phone);
    if (signup) { if (known) setNotice('exists'); else setPhase('profile'); }
    else { if (known) onDone(); else setNotice('no-account'); }
  };
  // Resolve a wrong-door hint: the number is already verified, so switching is frictionless.
  const switchToSignup = () => { setMode('signup'); setNotice(null); setPhase('profile'); };  // from log-in, no account found
  const switchToLogin = () => { setMode('login'); setNotice(null); onDone(); };                // from sign-up, number already exists

  // Google / Apple hand back a verified identity. Logging in lands in the app; signing up
  // still needs the profile step (name / DOB / gender) the provider doesn't supply.
  const socialSignIn = () => { if (signup) setPhase('profile'); else onDone(); };

  return (
    <React.Fragment>
      {/* choose — the closing beat of onboarding: a full-bleed hero, brand and copy read over
          it, and the two doors anchored at the foot. Same image treatment as the intro slides
          so this lands as one flow, not a bare white fork. */}
      {phase === 'choose' && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {hero
            ? <img src={hero} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: '58% 34%' }} />
            : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${accent} 0%, #0c0e16 100%)` }} />}
          {/* scrims: a light one so the wordmark reads up top, a tall dark foot for the copy + CTAs */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(180deg, rgba(12,14,22,.62) 0%, rgba(12,14,22,0) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 440, background: 'linear-gradient(0deg, rgba(9,11,18,.95) 30%, rgba(9,11,18,0) 100%)' }} />

          <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 58px)' }}>
            <img src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ height: 22, display: 'block', margin: '0 28px', opacity: .96 }} />

            <div style={{ flex: 1 }} />

            <div style={{ padding: '0 28px calc(env(safe-area-inset-bottom) + 22px)' }}>
              <h1 className="game-font" style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.16, margin: 0, color: '#fff', textShadow: '0 2px 18px rgba(0,0,0,.55)' }}>{L('Your child, safe on every walk')}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.5, margin: '12px 0 26px', color: 'rgba(255,255,255,.9)', textShadow: '0 1px 12px rgba(0,0,0,.5)', maxWidth: 320 }}>{L('Create a guardian account to get started, or log in to pick up where you left off.')}</p>

              <Button variant="primary" size="lg" fullWidth style={btnStyle} onClick={() => start('signup')}>{L('Create account')}</Button>

              <button onClick={() => start('login')} className="jx-press" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, width: '100%', marginTop: 6, padding: '15px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 800, color: '#fff', textShadow: '0 1px 10px rgba(0,0,0,.5)' }}>
                {L('I already have an account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* phone — the primary method */}
      {phase === 'phone' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
            <button onClick={() => setPhase('choose')} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
            </button>

            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{signup ? L('Create your account') : L('Log in')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{signup ? L("Enter your phone to get started — we'll text you a 6-digit code.") : L("Enter your phone and we'll text you a 6-digit code.")}</p>

            <Input label={L('Phone number')} value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="010-1234-5678" type="tel" accent={accent} />

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
                onChange={e => { setCode(digitsOf(e.target.value).slice(0, AUTH.smsCodeLength)); setCodeErr(false); setNotice(null); }}
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

            {/* wrong-door hint — verified, but this number belongs on the other path. One tap
                switches without re-verifying, since the number is already confirmed. */}
            {notice && (
              <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: mixHue(accent, 0, 40, 0.1), border: `1.5px solid ${THEME.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.fg1, lineHeight: 1.45 }}>
                  {notice === 'no-account' ? L('No account uses this number yet.') : L('This number already has an account.')}
                </div>
                <button onClick={notice === 'no-account' ? switchToSignup : switchToLogin} style={{ marginTop: 8, padding: 0, border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: accent, cursor: 'pointer' }}>
                  {notice === 'no-account' ? L('Create an account →') : L('Log in instead →')}
                </button>
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
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
            <button onClick={() => setPhase('code')} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
            </button>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Create account')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('Tell us a bit about you.')}</p>

            {/* profile picture — optional. Tap to add; skip it and the name's initial stands in. */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 22 }}>
              <button type="button" onClick={() => photoRef.current && photoRef.current.click()} className="jx-press" aria-label={L('Add a photo')}
                style={{ position: 'relative', width: 96, height: 96, borderRadius: 999, padding: 0, border: 'none', cursor: 'pointer', overflow: 'visible', background: photo ? 'transparent' : mixHue(accent, 0, 40, 0.14), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ width: '100%', height: '100%', borderRadius: 999, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photo
                    ? <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initial
                      ? <span className="game-font" style={{ fontSize: 40, fontWeight: 500, color: accent, lineHeight: 1 }}>{initial}</span>
                      : <Icon name="user" size={38} color={accent} stroke={2} />}
                </span>
                <span style={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 999, background: accent, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="camera" size={15} color="#fff" stroke={2.3} />
                </span>
              </button>
              <input ref={photoRef} type="file" accept="image/*" onChange={pickPhoto} style={{ display: 'none' }} />
              {photo ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => photoRef.current && photoRef.current.click()} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800, color: accent }}>{L('Change photo')}</button>
                  <span style={{ color: THEME.border }}>·</span>
                  <button type="button" onClick={removePhoto} style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800, color: THEME.fg3 }}>{L('Remove photo')}</button>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600, marginTop: 10 }}>{L('Optional — we’ll use your initial if you skip.')}</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label={L('Name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Sora Kim')} icon="user" accent={accent} />
              <DateField label={L('Date of birth')} value={dob ? new Date(dob + 'T00:00') : null}
                onChange={d => setDob(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)} accent={accent} />
              <SelectField label={L('Gender')} title={L('Gender')} value={gender} onChange={setGender} accent={accent}
                options={[{ value: 'male', label: L('Male') }, { value: 'female', label: L('Female') }, { value: 'other', label: L('Prefer not to say') }]} />
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
  const [detail, setDetail] = React.useState(null);   // a consent whose full document is open
  const keys = ['personal', 'tos', 'location', 'guardian'];
  const allOn = keys.every(k => agree[k]);
  const set = (k) => setAgree(a => ({ ...a, [k]: !a[k] }));
  const toggleAll = () => { const v = !allOn; setAgree({ personal: v, tos: v, location: v, guardian: v }); };

  // A tapped item opens its full document on its own page (Korean 약관 pattern: the row is a
  // link via the ›, not an inline accordion). Back returns to the list with every choice intact.
  if (detail) {
    const doc = CONSENTS.find(x => x.key === detail);
    return (
      <>
        <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
          <button onClick={() => setDetail(null)} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
          </button>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: accent, marginBottom: 6 }}>[{L('Required')}]</div>
          <h1 className="game-font" style={{ fontSize: 22, fontWeight: 500, margin: '0 0 14px', lineHeight: 1.25 }}>{L(doc.label)}</h1>
          <p style={{ fontSize: 13.5, color: THEME.fg2, lineHeight: 1.6, margin: 0 }}>{L(doc.body)} <span style={{ color: THEME.fg3, fontWeight: 700 }}>{L('Documents provided by Joan Company.')}</span></p>
        </div>
        <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
          <Button variant="primary" size="lg" fullWidth style={btnStyle} onClick={() => { if (!agree[detail]) set(detail); setDetail(null); }}>{L('Agree')}</Button>
        </div>
      </>
    );
  }

  // one row: a check mark (not a box) + [Required] tag + label + a › that opens the document
  const ConsentRow = ({ k, children, hasDoc = true }) => {
    const on = agree[k];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 15px' }}>
        <button onClick={() => set(k)} className="jx-press" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0, padding: 0, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
          <Icon name="check" size={16} color={on ? accent : THEME.border} stroke={2.8} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: accent, flexShrink: 0 }}>[{L('Required')}]</span>
          <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 700, color: THEME.fg1, lineHeight: 1.35 }}>{children}</span>
        </button>
        {hasDoc && (
          <button onClick={() => setDetail(k)} aria-label={L('View')} className="jx-press" style={{ padding: 4, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex' }}>
            <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.4} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
        <button onClick={onBack} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
        </button>

        <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('A few quick approvals')}</h1>
        <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L('As the legal guardian, please review and agree before you start.')}</p>

        {/* agree-to-all — a circle-check master, in its own card to match the design system's
            white rounded containers (same flat hairline as the permission cards) */}
        <button onClick={toggleAll} className="jx-press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '15px 16px', borderRadius: 18, background: '#fff', boxShadow: THEME.shadowCard, border: 'none', cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }}>
          <Icon name={allOn ? 'circle-check-big' : 'circle'} size={20} color={allOn ? accent : THEME.fg3} stroke={2.3} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{L('Agree to all')}</span>
        </button>

        {/* the legal consents, grouped in one card — each opens its own document page via the › */}
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          {CONSENTS.map((c, i) => (
            <div key={c.key} style={{ borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <ConsentRow k={c.key}>{L(c.label)}</ConsentRow>
            </div>
          ))}
          {/* guardian affirmation — a check with no document to open */}
          <div style={{ borderTop: `1px solid ${THEME.border}` }}>
            <ConsentRow k="guardian" hasDoc={false}>{L("I'm the child's guardian, authorised to consent.")}</ConsentRow>
          </div>
        </div>

        <p style={{ fontSize: 12, color: THEME.fg3, lineHeight: 1.5, margin: '18px 2px 0', fontWeight: 600 }}>{L('We don’t collect resident registration numbers or other unnecessary ID.')}</p>
      </div>

      <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
        <Button variant="primary" size="lg" fullWidth style={btnStyle} disabled={!allOn} onClick={allOn ? onDone : undefined}>{L('Agree & continue')}</Button>
      </div>
    </>
  );
}

export { AuthFlow };
