// JoanX — parent app · ParentOnboarding

import React from 'react';
import { Icon, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { AuthFlow } from '../core/auth.jsx';
import { BRAND, brandBtn } from './shared.jsx';

function ParentOnboarding({ ctx }) {
  // authStep/authPhase are a Tweaks-preview hook only (jump straight to a given AuthFlow phase,
  // skipping the splash a real first run always sees) — ctx.params is cleared by
  // finishParentOnboarding, so they never linger past this screen.
  const [step, setStep] = React.useState(ctx.params?.authStep ?? 0);           // 0 splash · 3 auth

  // The splash had no way out — no timer, no tap target, no button — so "Replay onboarding"
  // stranded the parent on the logo. A splash is a beat, not a step: hold it, then move on.
  // Goes straight to auth (step 3) — the two value-prop intro slides that used to sit
  // between splash and sign-in were pulled; step numbering kept as 3 so the Tweaks jump
  // (App.jsx's "Join family" chip, `authStep: 3`) still lands in the same place.
  React.useEffect(() => {
    if (step !== 0) return undefined;
    const t = setTimeout(() => setStep(3), 1600);
    return () => clearTimeout(t);
  }, [step]);

  // A joined guardian lands on Reports — the family and its child(ren) already exist, so the
  // add-child wizard every OTHER first run gets would be asking them to redo work already done.
  const finish = (mode) => ctx.finishParentOnboarding({ joined: mode === 'join' });

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

      {/* 3 · sign in (F-33) — phone + SMS, Google on Android / Apple on iOS. Parent app only:
          the child device has no account, it pairs to this one. */}
      {step === 3 && <AuthFlow accent={BRAND.ink} btnStyle={brandBtn} hero="/assets/onboarding/splashloading.png" initialPhase={ctx.params?.authPhase} onDone={finish} />}

    </div>
  );
}

export { ParentOnboarding };
