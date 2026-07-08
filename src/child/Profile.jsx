// JoanX — child app · Profile

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
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
      <ScreenHeader title={L('Profile')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* hero */}
        <div style={{ background: `linear-gradient(165deg, ${shade(c.color, 76)}, #fff 78%)`, borderRadius: 22, padding: '20px 18px', boxShadow: THEME.shadowCard, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={72} /></div>
          <div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
            <div style={{ marginTop: 8 }}><Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')} {L('mode')}</Badge></div>
          </div>
        </div>

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

        {/* account */}
        <div style={sectionLabel}>{L('Account')}</div>
        <div style={groupCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name={lite ? 'shield' : 'hand-heart'} size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Protection mode')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{L('Managed by your parent')}</div>
            </div>
            <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')}</Badge>
            <Icon name="lock" size={15} color={THEME.fg3} stroke={2.3} />
          </div>
          <Sep />
          <Row icon="life-buoy" label={L('Help & support')} onClick={() => {}}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
          <Sep />
          <Row icon="info" label={L('About JoanX')} onClick={() => {}}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
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
