// JoanX — child app · Profile

import React from 'react';
import { CHARACTERS, LINK, PLAYER, guardians } from '../core/data.jsx';
import { Badge, Icon, THEME, Toggle } from '../core/primitives.jsx';
import { L, setLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Profile / settings (child) ───────────────────────────────────────
function Profile({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  // device prefs are held on PLAYER so a toggle persists across navigation, not lost on unmount
  const [prefs, setPrefs] = React.useState({ ...PLAYER.prefs });
  const setPref = (k, v) => { PLAYER.prefs[k] = v; setPrefs(p => ({ ...p, [k]: v })); };

  const Row = ({ icon, label, children, last, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: last ? 'none' : 'none', cursor: onClick ? 'pointer' : 'default' }}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{label}</div>
      {children}
    </div>
  );
  const Sep = () => <div style={{ height: 1, background: THEME.border, margin: '0 14px' }} />;
  const groupCard = { background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden', marginBottom: 18 };
  const sectionLabel = { fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Profile')} />
      <div style={{ padding: '0 16px' }}>
        {/* hero — tapping the avatar opens the public house/rooms profile (F-32) */}
        <button onClick={() => ctx.nav('myhouse')} style={{ width: '100%', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', background: `linear-gradient(165deg, ${shade(c.color, 76)}, #fff 78%)`, borderRadius: 20, padding: '14px 16px', border: `1px solid ${THEME.border}`, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={60} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{PLAYER.name}</div>
            {/* age + level on one inline row — fills the line and keeps the hero compact */}
            <div style={{ marginTop: 5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600 }}>{L('Age')} {PLAYER.age}</span>
              <Badge variant="primary"><Icon name="star" size={11} color="currentColor" stroke={2.6} />{L('Level')} {PLAYER.level}</Badge>
            </div>
          </div>
          <Icon name="chevron-right" size={20} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
        </button>

        {/* preferences */}
        <div style={sectionLabel}>{L('Preferences')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div>
            <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 999, padding: 3 }}>
              {[['en', 'EN'], ['ko', '한국어']].map(([v, l]) => (
                <button key={v} onClick={() => ctx.setLang(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 14px', borderRadius: 999, background: ctx.lang === v ? '#fff' : 'transparent', color: ctx.lang === v ? THEME.brand : THEME.fg2, boxShadow: ctx.lang === v ? THEME.shadowCard : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
          <Sep />
          {/* Sound effects is the ONLY game-feedback toggle the child gets. Haptics and push
              are deliberately absent: the safety warning is a buzz (F-08), so a switch that
              could mute it — with neither child nor parent told protection was off — would
              break the core promise. The safety buzz is always on; notification policy is the
              parent's (F-22). */}
          <Row icon="volume-2" label={L('Sound effects')}><Toggle on={prefs.sound} onChange={v => setPref('sound', v)} /></Row>
        </div>

        {/* Accessibility section hidden for now — the right set of controls is still being
            decided (font/motion/colour/audio/motor/cognitive options were all explored). The
            prefs + strings stay in place so it's a quick re-add once the direction is set. */}

        {/* A-13 — who this device is linked to. "Managed by your parent" told the child a
            rule was being enforced but never by WHOM, and there was nowhere to check. The
            link is a fact about the child's own device, so it belongs in their settings:
            who, since when, and — the part that earns trust — exactly what that person can
            and cannot see. Unlinking is deliberately NOT here: it is the parent's action,
            and a child who can quietly disconnect makes the whole product a promise the
            parent cannot rely on. */}
        {/* Two adults can be watching now, and the child is told BOTH of them by name. A
            guardian added silently is exactly the thing that breaks a kid's trust in this app,
            and the promise above says a child old enough to earn points is old enough to know
            what is being watched — which is worthless if they cannot find out by whom. */}
        <div style={sectionLabel}>{guardians().length > 1 ? L('My parents') : L('Parent')}</div>
        <div style={groupCard}>
          {guardians().map((p, i) => (
            <React.Fragment key={p.id}>
              {i > 0 && <Sep />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 800 }}>{L(p.relation)} · {p.name}</div>
                  <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>
                    {LINK.connected ? `${L('Connected since')} ${p.since}` : L('Not connected')}
                  </div>
                </div>
                {i === 0 && <Badge variant={LINK.connected ? 'success' : 'warning'}>{LINK.connected ? L('Connected') : L('Offline')}</Badge>}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* account */}
        <div style={sectionLabel}>{L('Account')}</div>
        <div style={groupCard}>
          <Row icon="circle-help" label={L('Help & support')} onClick={() => ctx.nav('help')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
          <Sep />
          <Row icon="info" label={L('About JoanX')} onClick={() => ctx.nav('about')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
        </div>

        {/* No child-side "Sign out": the child app has no separate login — the device is
            provisioned and managed by a guardian, so a child sign-out would contradict the
            model (and unlinking is the parent's action, A-13). The managed-device note carries
            the only account statement the child screen should make. */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, color: THEME.fg3 }}>
          <Icon name="shield-check" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('This device is managed by a parent or guardian.')}</span>
        </div>
      </div>
    </div>
  );
}

export { Profile };
