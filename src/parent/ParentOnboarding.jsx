// JoanX — parent app · ParentOnboarding

import React from 'react';
import { Button, Icon, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { AuthFlow } from '../core/auth.jsx';
import { BRAND, brandBtn } from './shared.jsx';

function ParentOnboarding({ ctx }) {
  const [step, setStep] = React.useState(0);           // 0 splash · 1–2 slides · 3 auth

  // The splash had no way out — no timer, no tap target, no button — so "Replay onboarding"
  // stranded the parent on the logo. A splash is a beat, not a step: hold it, then move on.
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(1), 1600);
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

  const finish = () => ctx.finishParentOnboarding();

  return (
    <div style={{ position: 'absolute', inset: 0, background: screenBgFor(BRAND.primary), display: 'flex', flexDirection: 'column', paddingTop: 50 }}>

      {/* 0 · logo splash — shared with the child app */}
      {step === 0 && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(130% 100% at 50% 36%, #24242c 0%, #131318 52%, #08080b 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <img className="jx-pop" src="/assets/brand/logo-wordmark.svg" alt="JoanX" style={{ width: 176, display: 'block' }} />
          <div className="jx-pop" style={{ fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.5)', letterSpacing: 2, textTransform: 'uppercase' }}>{L('Parent')}</div>
          {/* company credit — "powered by" lockup with a shield, pinned above the home indicator */}
          <div className="jx-fade" style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom) + 34px)', left: 0, right: 0, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.38)', letterSpacing: .4 }}>
              <Icon name="shield-check" size={12} color="rgba(255,255,255,.38)" stroke={2.2} />Powered by
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', letterSpacing: .6, marginTop: 3 }}>Joan Technology</div>
          </div>
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

      {/* 3 · sign in (F-33) — phone + SMS, Google on Android / Apple on iOS. Parent app only:
          the child device has no account, it pairs to this one. */}
      {step === 3 && <AuthFlow accent={BRAND.ink} btnStyle={brandBtn} hero="/assets/onboarding/intro.png" onDone={finish} />}

    </div>
  );
}

export { ParentOnboarding };
