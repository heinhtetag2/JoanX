// JoanX — child app · Profile

import React from 'react';
import { CHARACTERS, LINK, PARENT_SEES, PLAYER, guardianOwner, guardians } from '../core/data.jsx';
import { Badge, Button, Icon, THEME, Toggle } from '../core/primitives.jsx';
import { L, setLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { screenBgActive, ScreenHeader, StatCard } from './shared.jsx';

// ── Profile / settings (child) ───────────────────────────────────────
function Profile({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const owned = CHARACTERS.filter(x => x.owned).length;
  const lite = ctx.mode === 'lite';
  const [sound, setSound] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [push, setPush] = React.useState(true);
  const [seeOpen, setSeeOpen] = React.useState(false);   // A-13 — "what my parent can see" disclosure

  const Row = ({ icon, label, children, last, onClick }) => (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: last ? 'none' : 'none', cursor: onClick ? 'pointer' : 'default' }}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{label}</div>
      {children}
    </div>
  );
  const Sep = () => <div style={{ height: 1, background: THEME.border, margin: '0 14px' }} />;
  const groupCard = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 };
  const sectionLabel = { fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Profile')} />
      <div style={{ padding: '0 16px' }}>
        {/* hero — tapping the avatar opens the public house/rooms profile (F-32) */}
        <button onClick={() => ctx.nav('myhouse')} style={{ width: '100%', textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: `linear-gradient(165deg, ${shade(c.color, 76)}, #fff 78%)`, borderRadius: 22, padding: '20px 18px', boxShadow: THEME.shadowCard, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={72} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')} {L('mode')}</Badge>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}><Icon name="home" size={12} color={THEME.fg2} stroke={2.3} />{L('My rooms')}</span>
            </div>
          </div>
          <Icon name="chevron-right" size={20} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
        </button>

        {/* stat row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <StatCard icon="award" color={THEME.gold} bg={THEME.goldLight} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
          <StatCard icon="flame" color={THEME.joy} bg={THEME.joyBg} value={PLAYER.streak} label={L('Best streak')} />
          <StatCard icon="gem" color={THEME.camping} bg={THEME.campingBg} value={owned} label={L('Buddies')} />
        </div>

        {/* preferences */}
        <div style={sectionLabel}>{L('Preferences')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div>
            <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 10, padding: 3 }}>
              {[['en', 'EN'], ['ko', '한국어']].map(([v, l]) => (
                <button key={v} onClick={() => ctx.setLang(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 8, background: ctx.lang === v ? '#fff' : 'transparent', color: ctx.lang === v ? THEME.primary : THEME.fg2, boxShadow: ctx.lang === v ? THEME.shadowCard : 'none' }}>{l}</button>
              ))}
            </div>
          </div>
          <Sep />
          <Row icon="volume-2" label={L('Sound effects')}><Toggle on={sound} onChange={setSound} /></Row>
          <Sep />
          <Row icon="vibrate" label={L('Haptics')}><Toggle on={haptics} onChange={setHaptics} /></Row>
          <Sep />
          <Row icon="bell" label={L('Push notifications')}><Toggle on={push} onChange={setPush} /></Row>
        </div>

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
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: THEME.primaryDark }}>
                    {p.name[0]}
                  </div>
                  {LINK.connected && <span style={{ position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 999, background: THEME.success, border: '2.5px solid #fff' }} />}
                </div>
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
          <Sep />
          <Row icon="eye" label={guardians().length > 1 ? L('What my parents can see') : L('What my parent can see')} onClick={() => setSeeOpen(o => !o)}>
            <Icon name={seeOpen ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
          </Row>
          {seeOpen && (
            <div style={{ padding: '2px 14px 14px' }}>
              {PARENT_SEES.map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0' }}>
                  <Icon name={r.icon} size={15} color={r.shared ? THEME.fg2 : THEME.fg3} stroke={2.2} />
                  <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: r.shared ? THEME.fg1 : THEME.fg3 }}>{L(r.label)}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: r.shared ? THEME.success : THEME.fg3 }}>
                    <Icon name={r.shared ? 'check' : 'x'} size={12} color={r.shared ? THEME.success : THEME.fg3} stroke={2.8} />
                    {L(r.shared ? 'Shared' : 'Private')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* account */}
        <div style={sectionLabel}>{L('Account')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name={lite ? 'shield' : 'hand-heart'} size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Protection mode')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{L('Set by')} {guardianOwner().name}</div>
            </div>
            <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')}</Badge>
            <Icon name="lock" size={15} color={THEME.fg3} stroke={2.3} />
          </div>
          <Sep />
          <Row icon="life-buoy" label={L('Help & support')} onClick={() => ctx.nav('help')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
          <Sep />
          <Row icon="info" label={L('About JoanX')} onClick={() => ctx.nav('about')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
        </div>

        <Button variant="outline" size="lg" fullWidth icon="log-out" onClick={() => {}}>{L('Sign out')}</Button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, color: THEME.fg3 }}>
          <Icon name="shield-check" size={13} color={THEME.fg3} stroke={2.2} />
          <span style={{ fontSize: 11.5 }}>{L('This device is managed by a parent or guardian.')}</span>
        </div>
      </div>
    </div>
  );
}

export { Profile };
