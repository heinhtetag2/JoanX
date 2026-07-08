// JoanX — parent app · ParentOnboarding

import React from 'react';
import { Button, Icon, Input, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, brandBtn, ChoiceGroup } from './shared.jsx';

// Mock roster of already-registered user IDs — the "중복확인" (duplicate check)
// on sign-up tests a typed ID against this list. Swap for a real API later.
const TAKEN_IDS = ['user01', 'admin', 'joanx', 'test', 'guest', 'sora', 'minji', 'mom', 'dad'];

function ParentOnboarding({ ctx }) {
  const [step, setStep] = React.useState(0);           // 0 splash · 1–2 slides · 3 auth
  const [authMode, setAuthMode] = React.useState('signup');  // 'signup' | 'signin' | 'forgot'
  const [authStep, setAuthStep] = React.useState(1);         // signup is split: 1 personal · 2 login
  const [userId, setUserId] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [showPass, setShowPass] = React.useState(false);
  const [sent, setSent] = React.useState(false);   // forgot-password: reset link sent
  const [idStatus, setIdStatus] = React.useState('idle'); // user-ID check: idle | checking | available | taken | short

  // "중복확인" — check the typed user ID against the taken-IDs roster.
  const checkUserId = () => {
    const id = userId.trim().toLowerCase();
    if (id.length < 4) { setIdStatus('short'); return; }
    setIdStatus('checking');
    setTimeout(() => setIdStatus(TAKEN_IDS.includes(id) ? 'taken' : 'available'), 550);
  };

  // logo splash auto-advances into the intro slides
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(1), 1500);
    return () => clearTimeout(t);
  }, [step]);

  const SLIDES = [
    { title: 'Stay close, gently', sub: 'See how your child is doing through calm weekly reports — guidance, never surveillance.' },
    { title: 'Safety, in plain words', sub: 'JoanX turns each week into a simple summary and nudges you only when it truly matters.' },
  ];
  const introIdx = step - 1;
  const slide = step >= 1 && step <= 2 ? SLIDES[introIdx] : null;
  // onboarding is image-only: a single full-screen photo behind both intro slides
  const onbStyle = 'image';
  const slideBg = slide ? '/assets/onboarding/intro.png' : null;

  const signup = authMode === 'signup';
  const forgot = authMode === 'forgot';
  const emailOk = !email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());   // optional on signup
  const emailErr = email.trim() && !emailOk ? L('Enter a valid email address.') : undefined;
  const passErr = signup && pass && pass.length < 6 ? L('Use at least 6 characters.') : undefined;
  const confirmErr = signup && confirm && confirm !== pass ? L('Passwords do not match.') : undefined;
  const step1Valid = name.trim() && phone.trim() && dob && gender;   // signup personal step
  const canSubmit = signup
    ? userId.trim() && idStatus === 'available' && name.trim() && phone.trim() && dob && gender && pass.length >= 6 && confirm === pass && emailOk
    : userId.trim() && !!pass;
  const finish = () => ctx.finishParentOnboarding();
  const goAuth = m => { setAuthMode(m); setSent(false); setShowPass(false); setAuthStep(1); };
  const eyeBtn = (
    <button onClick={() => setShowPass(s => !s)} aria-label={L(showPass ? 'Hide password' : 'Show password')} style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
      <Icon name={showPass ? 'eye-off' : 'eye'} size={18} color={THEME.fg3} stroke={2} />
    </button>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, background: screenBgFor(BRAND.primary), display: 'flex', flexDirection: 'column', paddingTop: 50 }}>

      {/* 0 · logo splash — shared with the child app */}
      {step === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 36%, #24242c 0%, #131318 52%, #08080b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <img className="jx-pop" src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ width: 176, display: 'block' }} />
          <div className="jx-pop" style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: 2, textTransform: 'uppercase' }}>{L('Parent')}</div>
        </div>
      )}

      {/* 1–2 · value-prop intro slides with a segmented indicator */}
      {slide && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'calc(env(safe-area-inset-top) + 60px)',
          background: slideBg ? undefined : 'linear-gradient(180deg, #eef4fc 0%, #ffffff 60%)' }}>
          {/* background: 3D illustration hero, or a full-screen photo (Tweaks → Onboarding style). Soft scrims keep the copy legible. */}
          {slideBg && <img src={slideBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: onbStyle === 'image' ? '58% 36%' : 'center' }} />}
          {slideBg && (onbStyle === 'image' ? (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 330, background: 'linear-gradient(180deg, rgba(12,14,22,.74) 0%, rgba(12,14,22,0) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 280, background: 'linear-gradient(0deg, rgba(10,12,20,.92) 8%, rgba(10,12,20,0) 100%)' }} />
            </>
          ) : (
            <>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(180deg, rgba(255,255,255,.9) 0%, rgba(255,255,255,0) 100%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 210, background: 'linear-gradient(0deg, #fff 18%, rgba(255,255,255,0) 100%)' }} />
            </>
          ))}

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', gap: 7, padding: '0 28px' }}>
              {SLIDES.map((_, i) => (
                <div key={i} style={{ height: 5, flex: 1, borderRadius: 999, background: i <= introIdx ? (onbStyle === 'image' ? '#fff' : BRAND.primary) : (onbStyle === 'image' ? 'rgba(255,255,255,.4)' : THEME.border), transition: 'background .3s' }} />
              ))}
            </div>

            <div style={{ padding: '32px 30px 0' }}>
              <h1 className="game-font" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1.18, margin: 0, color: onbStyle === 'image' ? '#fff' : THEME.fg1, textShadow: onbStyle === 'image' ? '0 2px 16px rgba(0,0,0,.5)' : 'none' }}>{L(slide.title)}</h1>
              <p style={{ fontSize: 15, lineHeight: 1.45, margin: '12px 0 0', color: onbStyle === 'image' ? 'rgba(255,255,255,.92)' : THEME.fg2, textShadow: onbStyle === 'image' ? '0 1px 12px rgba(0,0,0,.5)' : 'none' }}>{L(slide.sub)}</p>
            </div>

            <div style={{ flex: 1 }} />

            <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
              <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => setStep(step + 1)}>{L(step === 2 ? 'Get started' : 'Continue')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* 3 · authentication — create account / sign in / forgot password */}
      {step === 3 && !forgot && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '26px 28px 0' }}>
            {/* signup progress: an eyebrow label above the title — quiet & premium, distinct from the intro slides' segmented bar */}
            {signup && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 32, marginBottom: 10, marginLeft: authStep === 2 ? -6 : 0 }}>
                {authStep === 2 && (
                  <button onClick={() => setAuthStep(1)} aria-label={L('Back')} className="jx-press" style={{ flexShrink: 0, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
                  </button>
                )}
                <span style={{ fontSize: 12, fontWeight: 800, color: BRAND.primary, letterSpacing: '1.5px' }}>{L('Step')} {authStep} / 2</span>
              </div>
            )}

            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L(signup ? 'Create account' : 'Welcome back')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L(signup ? (authStep === 1 ? 'Tell us a bit about you.' : 'Now set up your login details.') : 'Sign in to pick up where you left off.')}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!signup && (
                <>
                  <Input label={L('Phone number or ID')} value={userId} onChange={e => setUserId(e.target.value.replace(/\s/g, ''))} placeholder={L('ID or phone number')} icon="user" accent={BRAND.ink} />
                  <Input label={L('Password')} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} accent={BRAND.ink} />
                </>
              )}

              {signup && authStep === 1 && (
                <>
                  <Input label={L('Name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Sora Kim')} icon="user" accent={BRAND.ink} />
                  <Input label={L('Phone number')} value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9-]/g, ''))} placeholder="010-1234-5678" icon="phone" type="tel" accent={BRAND.ink} />
                  <Input label={L('Date of birth')} value={dob} onChange={e => setDob(e.target.value)} icon="cake" type="date" accent={BRAND.ink} />
                  {/* gender — mobile-native chip choice instead of a dropdown */}
                  <ChoiceGroup label={L('Gender')} value={gender} setter={setGender} opts={[['male', 'Male'], ['female', 'Female'], ['other', 'Prefer not to say']]} />
                </>
              )}

              {signup && authStep === 2 && (
                <>
                  <div>
                    <Input label={L('User ID')} value={userId}
                      onChange={e => { setUserId(e.target.value.replace(/\s/g, '')); setIdStatus('idle'); }}
                      placeholder={L('e.g. user01')} icon="at-sign" accent={BRAND.ink}
                      error={idStatus === 'taken' ? L('This ID is already taken. Try another.') : idStatus === 'short' ? L('Use at least 4 characters.') : undefined}
                      trailing={
                        <button onClick={checkUserId} disabled={!userId.trim() || idStatus === 'checking'}
                          className="jx-press"
                          style={{ flexShrink: 0, border: 'none', borderRadius: 10, padding: '7px 12px', margin: '-7px 0', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 800,
                            background: idStatus === 'available' ? THEME.successLight : THEME.surface2,
                            color: idStatus === 'available' ? THEME.success : THEME.fg1,
                            cursor: (!userId.trim() || idStatus === 'checking') ? 'default' : 'pointer',
                            opacity: !userId.trim() ? 0.5 : 1 }}>
                          {L(idStatus === 'checking' ? 'Checking…' : 'Check')}
                        </button>
                      } />
                    {idStatus === 'available' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, marginLeft: 2, fontSize: 12, fontWeight: 700, color: THEME.success }}>
                        <Icon name="check-circle" size={14} color={THEME.success} stroke={2.4} />{L('This ID is available!')}
                      </div>
                    )}
                  </div>
                  <Input label={L('Email (optional)')} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" icon="mail" type="email" error={emailErr} accent={BRAND.ink} />
                  <Input label={L('Password')} value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} error={passErr} accent={BRAND.ink} />
                  <Input label={L('Confirm password')} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" icon="lock" type={showPass ? 'text' : 'password'} trailing={eyeBtn} error={confirmErr} accent={BRAND.ink} />
                </>
              )}
            </div>

            {!signup && (
              <div style={{ textAlign: 'right', marginTop: 10 }}>
                <span onClick={() => goAuth('forgot')} style={{ fontSize: 13, fontWeight: 700, color: BRAND.primary, cursor: 'pointer' }}>{L('Forgot password?')}</span>
              </div>
            )}

            {signup && authStep === 2 && (
              <p style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.5, margin: '16px 2px 0', fontWeight: 600 }}>{L('By continuing you agree to our Terms & Privacy Policy.')}</p>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {signup && authStep === 1
              ? <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!step1Valid} onClick={step1Valid ? () => setAuthStep(2) : undefined}>{L('Continue')}</Button>
              : <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!canSubmit} onClick={canSubmit ? finish : undefined}>{L(signup ? 'Create account' : 'Sign in')}</Button>}
            <button onClick={() => goAuth(signup ? 'signin' : 'signup')} style={{ width: '100%', marginTop: 12, padding: 6, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700, color: THEME.fg2, cursor: 'pointer' }}>
              {L(signup ? 'Already have an account?' : 'New to JoanX?')} <span style={{ color: BRAND.primary, fontWeight: 800 }}>{L(signup ? 'Sign in' : 'Create account')}</span>
            </button>
          </div>
        </>
      )}

      {/* 3b · forgot password — request a reset link, then a sent confirmation */}
      {step === 3 && forgot && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '10px 28px 0' }}>
            <button onClick={() => goAuth('signin')} aria-label={L('Back')} className="jx-press" style={{ marginLeft: -6, marginBottom: 14, padding: 4, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="chevron-left" size={22} color={THEME.fg1} stroke={2.6} />
            </button>

            {!sent ? (
              <>
                <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Reset your password')}</h1>
                <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 24px' }}>{L("Enter your email and we'll send you a link to reset your password.")}</p>
                <Input label={L('Email')} value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" icon="mail" type="email" error={emailErr} accent={BRAND.ink} />
              </>
            ) : (
              <div style={{ textAlign: 'center', paddingTop: 24 }}>
                <div className="jx-pop" style={{ width: 84, height: 84, borderRadius: 999, background: BRAND.primaryLight, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, boxShadow: `0 0 0 10px ${BRAND.primary}0f` }}>
                  <Icon name="mail-check" size={38} color={BRAND.primary} stroke={2.2} />
                </div>
                <h1 className="game-font" style={{ fontSize: 25, fontWeight: 500, margin: '0 0 10px', lineHeight: 1.2 }}>{L('Check your email')}</h1>
                <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.55, margin: '0 auto', maxWidth: 280 }}>{L('We sent a reset link to')} <span style={{ fontWeight: 800, color: THEME.fg1 }}>{email || 'you@email.com'}</span>.</p>
              </div>
            )}
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {!sent ? (
              <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!emailOk} onClick={emailOk ? () => setSent(true) : undefined}>{L('Send reset link')}</Button>
            ) : (
              <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => goAuth('signin')}>{L('Back to sign in')}</Button>
            )}
            {!sent && (
              <button onClick={() => goAuth('signin')} style={{ width: '100%', marginTop: 12, padding: 6, background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, color: BRAND.primary, cursor: 'pointer' }}>{L('Back to sign in')}</button>
            )}
          </div>
        </>
      )}

    </div>
  );
}

export { ParentOnboarding };
