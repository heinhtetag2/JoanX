// JoanX — child app · Profile, alternate layouts.
//
// Six distinct layout directions for the Profile / settings screen, all built on the same
// design system (THEME tokens, Mascot, Badge/Icon/Toggle, PLAYER/CHARACTERS data) and the
// SAME real controls as the original — language, sound/haptics/push, the linked-parents
// disclosure, protection mode — so the client compares working alternatives, not flat
// mockups. The original lives in Profile.jsx; App.jsx routes between them via the
// "Profile layout" tweak.

import React from 'react';
import { CHARACTERS, LINK, PARENT_SEES, PLAYER, guardianOwner, guardians } from '../core/data.jsx';
import { Badge, Icon, THEME, Toggle } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, shade, tint } from '../core/characters.jsx';
import { screenBgActive, screenBgFor, ScreenHeader, StatCard } from './shared.jsx';

// ── shared state ─────────────────────────────────────────────────────
// Device prefs live on PLAYER so a toggle persists across navigation (not lost on unmount),
// exactly as the original Profile holds them.
function useProfile(ctx) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const owned = CHARACTERS.filter(x => x.owned).length;
  const lite = ctx.mode === 'lite';
  const [prefs, setPrefs] = React.useState({ ...PLAYER.prefs });
  const setPref = (k, v) => { PLAYER.prefs[k] = v; setPrefs(p => ({ ...p, [k]: v })); };
  const [seeOpen, setSeeOpen] = React.useState(false);
  return { c, owned, lite, prefs, setPrefs, setPref, seeOpen, setSeeOpen };
}

// ── shared row primitives ────────────────────────────────────────────
const Sep = () => <div style={{ height: 1, background: THEME.border, margin: '0 14px' }} />;
function Row({ icon, label, children, onClick, sub }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', cursor: onClick ? 'pointer' : 'default' }}>
      <Icon name={icon} size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: THEME.fg1 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

// Language segmented control — identical behaviour to the original.
function LangRow({ ctx }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
      <Icon name="languages" size={18} color={THEME.fg2} stroke={2.2} />
      <div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Language')}</div>
      <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 10, padding: 3 }}>
        {[['en', 'EN'], ['ko', '한국어']].map(([v, l]) => (
          <button key={v} onClick={() => ctx.setLang(v)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 700, padding: '6px 12px', borderRadius: 8, background: ctx.lang === v ? '#fff' : 'transparent', color: ctx.lang === v ? THEME.primary : THEME.fg2, boxShadow: ctx.lang === v ? THEME.shadowCard : 'none' }}>{l}</button>
        ))}
      </div>
    </div>
  );
}

// ── shared sections (content is identical across variants; the container
//    style — white card, inset, or flat — is passed in per layout) ─────
function Preferences({ ctx, st, card, label }) {
  return (
    <>
      <div style={label}>{L('Preferences')}</div>
      <div style={card}>
        <LangRow ctx={ctx} />
        <Sep />
        <Row icon="volume-2" label={L('Sound effects')}><Toggle on={st.prefs.sound} onChange={v => st.setPref('sound', v)} /></Row>
        <Sep />
        <Row icon="vibrate" label={L('Haptics')}><Toggle on={st.prefs.haptics} onChange={v => st.setPref('haptics', v)} /></Row>
        <Sep />
        <Row icon="bell" label={L('Push notifications')}><Toggle on={st.prefs.push} onChange={v => st.setPref('push', v)} /></Row>
      </div>
    </>
  );
}

// A-13 — who this device is linked to, by name, since when, and exactly what each parent
// can and cannot see. Unlinking is deliberately absent: it is the parent's action.
function Parents({ st, card, label }) {
  const many = guardians().length > 1;
  return (
    <>
      <div style={label}>{many ? L('My parents') : L('Parent')}</div>
      <div style={card}>
        {guardians().map((p, i) => (
          <React.Fragment key={p.id}>
            {i > 0 && <Sep />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 14px' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 42, height: 42, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: THEME.primaryDark }}>{p.name[0]}</div>
                {LINK.connected && <span style={{ position: 'absolute', right: -1, bottom: -1, width: 13, height: 13, borderRadius: 999, background: THEME.success, border: '2.5px solid #fff' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>{L(p.relation)} · {p.name}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{LINK.connected ? `${L('Connected since')} ${p.since}` : L('Not connected')}</div>
              </div>
              {i === 0 && <Badge variant={LINK.connected ? 'success' : 'warning'}>{LINK.connected ? L('Connected') : L('Offline')}</Badge>}
            </div>
          </React.Fragment>
        ))}
        <Sep />
        <Row icon="eye" label={many ? L('What my parents can see') : L('What my parent can see')} onClick={() => st.setSeeOpen(o => !o)}>
          <Icon name={st.seeOpen ? 'chevron-up' : 'chevron-down'} size={17} color={THEME.fg3} stroke={2.3} />
        </Row>
        {st.seeOpen && (
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
    </>
  );
}

function Account({ ctx, st, card, label }) {
  return (
    <>
      <div style={label}>{L('Account')}</div>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
          <Icon name={st.lite ? 'shield' : 'hand-heart'} size={18} color={THEME.fg2} stroke={2.2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Protection mode')}</div>
            <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{L('Set by')} {guardianOwner().name}</div>
          </div>
          <Badge variant={st.lite ? 'warning' : 'primary'}>{st.lite ? L('Lite') : L('Smart')}</Badge>
          <Icon name="lock" size={15} color={THEME.fg3} stroke={2.3} />
        </div>
        <Sep />
        <Row icon="life-buoy" label={L('Help & support')} onClick={() => ctx.nav('help')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
        <Sep />
        <Row icon="info" label={L('About JoanX')} onClick={() => ctx.nav('about')}><Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} /></Row>
      </div>
    </>
  );
}

// The only account statement the child screen should make — the device is a managed one.
function ManagedNote({ mt = 6 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: mt, color: THEME.fg3 }}>
      <Icon name="shield-check" size={13} color={THEME.fg3} stroke={2.2} />
      <span style={{ fontSize: 11.5 }}>{L('This device is managed by a parent or guardian.')}</span>
    </div>
  );
}

// default section skins
const CARD = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden', marginBottom: 18 };
const LABEL = { fontSize: 12, fontWeight: 800, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 };

// Identity line reused by several heroes: mode badge + "My rooms" link.
function IdentityMeta({ lite }) {
  return (
    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')} {L('mode')}</Badge>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}><Icon name="home" size={12} color={THEME.fg2} stroke={2.3} />{L('My rooms')}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V1 — HERO · immersive full-bleed buddy header, glass stat pills that
//      overlap the seam, settings on a white sheet that rises up.
// ══════════════════════════════════════════════════════════════════════
function ProfileHero({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;
  const heroBg = `linear-gradient(180deg, ${shade(c.color, 62)} 0%, ${shade(c.color, 94)} 52%, ${THEME.surface2} 100%)`;

  const GlassPill = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, background: 'rgba(255,255,255,.74)', backdropFilter: 'blur(6px)', borderRadius: 18, padding: '12px 12px', boxShadow: THEME.shadowSoft, textAlign: 'center' }}>
      <Icon name={icon} size={18} color={color} stroke={2.4} />
      <div className="game-font" style={{ fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1, marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      <div style={{ background: heroBg, padding: '58px 18px 56px', textAlign: 'center' }}>
        <button onClick={() => ctx.nav('myhouse')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'block', width: '100%' }}>
          <div className="jx-float" style={{ width: 116, height: 116, borderRadius: 34, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={104} />
          </div>
          <div className="game-font" style={{ fontSize: 27, fontWeight: 500, marginTop: 12 }}>{PLAYER.name}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
          <div style={{ display: 'inline-flex' }}><IdentityMeta lite={lite} /></div>
        </button>
      </div>

      {/* glass stats overlapping the seam */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px', marginTop: -34, position: 'relative', zIndex: 2 }}>
        <GlassPill icon="award" color={THEME.gold} value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
        <GlassPill icon="flame" color={THEME.joy} value={PLAYER.streak} label={L('Best streak')} />
        <GlassPill icon="paw-print" color={THEME.camping} value={owned} label={L('Buddies')} />
      </div>

      <div style={{ background: THEME.surface2, borderRadius: '28px 28px 0 0', marginTop: 20, padding: '18px 16px 0' }}>
        <Preferences ctx={ctx} st={st} card={CARD} label={LABEL} />
        <Parents st={st} card={CARD} label={LABEL} />
        <Account ctx={ctx} st={st} card={CARD} label={LABEL} />
        <ManagedNote />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V2 — BENTO · profile + stats as an asymmetric tile grid up top, grouped
//      settings below.
// ══════════════════════════════════════════════════════════════════════
function ProfileBento({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;
  const tile = { borderRadius: 22, padding: 14, boxShadow: THEME.shadowCard, background: '#fff' };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Profile')} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {/* identity — tall, left column */}
          <button onClick={() => ctx.nav('myhouse')} style={{ ...tile, gridRow: 'span 2', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: `linear-gradient(165deg, ${shade(c.color, 76)}, #fff 78%)`, display: 'flex', flexDirection: 'column' }}>
            <div className="jx-float" style={{ width: 80, height: 80, borderRadius: 24, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard }}><Mascot species={c.species} stage={c.stage} color={c.color} size={72} /></div>
            <div className="game-font" style={{ fontSize: 22, fontWeight: 500, marginTop: 12 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
            <div style={{ marginTop: 'auto', paddingTop: 12 }}>
              <Badge variant={lite ? 'warning' : 'primary'}>{lite ? L('Lite') : L('Smart')} {L('mode')}</Badge>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginTop: 8 }}><Icon name="home" size={12} color={THEME.fg2} stroke={2.3} />{L('My rooms')}<Icon name="chevron-right" size={13} color={THEME.fg3} stroke={2.4} /></div>
            </div>
          </button>

          {[['award', THEME.gold, THEME.goldLight, PLAYER.points.toLocaleString(), L('Safe points')],
            ['flame', THEME.joy, THEME.joyBg, PLAYER.streak, L('Best streak')]].map(([ic, col, bg, val, lab]) => (
            <div key={lab} style={{ ...tile, background: `linear-gradient(150deg, ${bg}, #fff)` }}>
              <Icon name={ic} size={20} color={col} stroke={2.4} />
              <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 8, lineHeight: 1 }}>{val}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{lab}</div>
            </div>
          ))}
          {/* buddies — wide */}
          <div style={{ ...tile, gridColumn: 'span 2', background: `linear-gradient(150deg, ${THEME.campingBg}, #fff)`, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="gem" size={20} color={THEME.camping} stroke={2.4} /></div>
            <div className="game-font" style={{ fontSize: 24, fontWeight: 500 }}>{owned}</div>
            <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Buddies')}</div>
          </div>
        </div>

        <Preferences ctx={ctx} st={st} card={CARD} label={LABEL} />
        <Parents st={st} card={CARD} label={LABEL} />
        <Account ctx={ctx} st={st} card={CARD} label={LABEL} />
        <ManagedNote />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V3 — COMPACT · iOS-settings density. Small avatar row, inline stat strip,
//      inset grouped tables.
// ══════════════════════════════════════════════════════════════════════
function ProfileCompact({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;
  const card = { ...CARD, borderRadius: 14, marginBottom: 16 };
  const label = { ...LABEL, margin: '2px 4px 6px' };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Profile')} />
      <div style={{ padding: '0 16px' }}>
        {/* compact identity row */}
        <button onClick={() => ctx.nav('myhouse')} style={{ ...card, width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: shade(c.color, 82), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={c.species} stage={c.stage} color={c.color} size={48} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600, marginTop: 1 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level} · {lite ? L('Lite') : L('Smart')}</div>
          </div>
          <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.4} />
        </button>

        {/* inline stat strip */}
        <div style={{ display: 'flex', alignItems: 'center', ...card, padding: '12px 4px' }}>
          {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')],
            ['flame', THEME.joy, PLAYER.streak, L('Best streak')],
            ['paw-print', THEME.camping, owned, L('Buddies')]].map(([ic, col, val, lab], i) => (
            <React.Fragment key={lab}>
              {i > 0 && <div style={{ width: 1, height: 30, background: THEME.border }} />}
              <div style={{ flex: 1, textAlign: 'center' }}>
                <Icon name={ic} size={16} color={col} stroke={2.4} />
                <div className="game-font" style={{ fontSize: 18, fontWeight: 500, lineHeight: 1, marginTop: 2 }}>{val}</div>
                <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{lab}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <Preferences ctx={ctx} st={st} card={card} label={label} />
        <Parents st={st} card={card} label={label} />
        <Account ctx={ctx} st={st} card={card} label={label} />
        <ManagedNote />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V4 — COVER · social-style colour cover with the avatar overlapping the
//      seam, a stat strip on a card, grouped settings.
// ══════════════════════════════════════════════════════════════════════
function ProfileCover({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: THEME.surface2 }}>
      {/* cover band */}
      <div style={{ height: 168, background: `linear-gradient(150deg, ${shade(c.color, 40)}, ${shade(c.color, 84)})` }} />
      <div style={{ padding: '0 16px', marginTop: -56 }}>
        <div style={{ background: '#fff', borderRadius: 22, boxShadow: THEME.shadowCard, padding: '0 16px 16px', textAlign: 'center' }}>
          <button onClick={() => ctx.nav('myhouse')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div className="jx-float" style={{ width: 96, height: 96, borderRadius: 28, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, marginTop: -48 }}>
              <Mascot species={c.species} stage={c.stage} color={c.color} size={86} />
            </div>
            <div className="game-font" style={{ fontSize: 25, fontWeight: 500, marginTop: 8 }}>{PLAYER.name}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
            <div style={{ display: 'inline-flex' }}><IdentityMeta lite={lite} /></div>
          </button>

          {/* stat strip inside the card */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${THEME.border}` }}>
            {[['award', THEME.gold, PLAYER.points.toLocaleString(), L('Safe points')],
              ['flame', THEME.joy, PLAYER.streak, L('Best streak')],
              ['paw-print', THEME.camping, owned, L('Buddies')]].map(([ic, col, val, lab], i) => (
              <React.Fragment key={lab}>
                {i > 0 && <div style={{ width: 1, height: 32, background: THEME.border }} />}
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <Icon name={ic} size={17} color={col} stroke={2.4} />
                  <div className="game-font" style={{ fontSize: 19, fontWeight: 500, lineHeight: 1, marginTop: 3 }}>{val}</div>
                  <div style={{ fontSize: 10.5, color: THEME.fg2, fontWeight: 600, marginTop: 3 }}>{lab}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <Preferences ctx={ctx} st={st} card={CARD} label={LABEL} />
          <Parents st={st} card={CARD} label={LABEL} />
          <Account ctx={ctx} st={st} card={CARD} label={LABEL} />
          <ManagedNote />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V5 — MINIMAL · airy, flat. Centered avatar, hairline-separated rows on
//      the page — no card shadows.
// ══════════════════════════════════════════════════════════════════════
function ProfileMinimal({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;
  // flat container: transparent, hairline top border, no shadow
  const card = { background: 'transparent', borderTop: `1px solid ${THEME.border}`, borderBottom: `1px solid ${THEME.border}`, marginBottom: 20 };
  const label = { ...LABEL, margin: '0 2px 6px' };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: THEME.surface }}>
      <ScreenHeader title={L('Profile')} />
      <div style={{ padding: '8px 20px 0', textAlign: 'center' }}>
        <button onClick={() => ctx.nav('myhouse')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          <div className="jx-float"><Mascot species={c.species} stage={c.stage} color={c.color} size={110} /></div>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, marginTop: 6 }}>{PLAYER.name}</div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
          <div style={{ display: 'inline-flex' }}><IdentityMeta lite={lite} /></div>
        </button>

        {/* stat row — plain numbers, no cards */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0 4px' }}>
          {[[PLAYER.points.toLocaleString(), L('Safe points')], [PLAYER.streak, L('Best streak')], [owned, L('Buddies')]].map(([val, lab], i) => (
            <React.Fragment key={lab}>
              {i > 0 && <div style={{ width: 1, height: 30, background: THEME.border }} />}
              <div style={{ flex: 1 }}>
                <div className="game-font" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{lab}</div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: '20px 20px 0', textAlign: 'left' }}>
        <Preferences ctx={ctx} st={st} card={card} label={label} />
        <Parents st={st} card={card} label={label} />
        <Account ctx={ctx} st={st} card={card} label={label} />
        <ManagedNote />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// V6 — SPOTLIGHT · dark identity card with the buddy, light settings sheet
//      below. High-contrast, poster-like.
// ══════════════════════════════════════════════════════════════════════
function ProfileSpotlight({ ctx }) {
  const st = useProfile(ctx);
  const { c, owned, lite } = st;
  const ink = shade(c.color, 8);

  const DarkStat = ({ icon, color, value, label }) => (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <Icon name={icon} size={16} color={color} stroke={2.4} />
      <div className="game-font" style={{ fontSize: 19, fontWeight: 500, color: '#fff', lineHeight: 1, marginTop: 3 }}>{value}</div>
      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.72)', fontWeight: 600, marginTop: 3 }}>{label}</div>
    </div>
  );

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 110, background: THEME.surface2 }}>
      <div style={{ padding: '0 16px' }}>
        {/* dark hero card */}
        <button onClick={() => ctx.nav('myhouse')} style={{ width: '100%', textAlign: 'center', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 26, padding: '22px 18px 18px', background: `linear-gradient(160deg, ${shade(c.color, 4)}, ${shade(ink, -18)})`, boxShadow: THEME.shadowCard }}>
          <div className="jx-float" style={{ width: 108, height: 108, borderRadius: 30, background: 'rgba(255,255,255,.14)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mascot species={c.species} stage={c.stage} color={c.color} size={96} />
          </div>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: '#fff', marginTop: 12 }}>{PLAYER.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.78)', fontWeight: 600, marginTop: 2 }}>{L('Age')} {PLAYER.age} · {L('Level')} {PLAYER.level}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 800, color: ink, background: '#fff', borderRadius: 999, padding: '4px 10px' }}>{lite ? L('Lite') : L('Smart')} {L('mode')}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 700, color: 'rgba(255,255,255,.85)' }}><Icon name="home" size={12} color="rgba(255,255,255,.85)" stroke={2.3} />{L('My rooms')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.16)' }}>
            <DarkStat icon="award" color="#ffd76b" value={PLAYER.points.toLocaleString()} label={L('Safe points')} />
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.16)' }} />
            <DarkStat icon="flame" color="#ff9d6b" value={PLAYER.streak} label={L('Best streak')} />
            <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,.16)' }} />
            <DarkStat icon="gem" color="#a9e0ff" value={owned} label={L('Buddies')} />
          </div>
        </button>

        <div style={{ marginTop: 20 }}>
          <Preferences ctx={ctx} st={st} card={CARD} label={LABEL} />
          <Parents st={st} card={CARD} label={LABEL} />
          <Account ctx={ctx} st={st} card={CARD} label={LABEL} />
          <ManagedNote />
        </div>
      </div>
    </div>
  );
}

// router used by App.jsx — picks the layout from the "Profile layout" tweak.
const PROFILE_LAYOUTS = [
  { id: 'original', label: 'Original' },
  { id: 'hero', label: 'Hero' },
  { id: 'bento', label: 'Bento' },
  { id: 'compact', label: 'Compact' },
  { id: 'cover', label: 'Cover' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'spotlight', label: 'Spotlight' },
];
function ProfileVariant({ variant, ctx }) {
  switch (variant) {
    case 'hero':      return <ProfileHero ctx={ctx} />;
    case 'bento':     return <ProfileBento ctx={ctx} />;
    case 'compact':   return <ProfileCompact ctx={ctx} />;
    case 'cover':     return <ProfileCover ctx={ctx} />;
    case 'minimal':   return <ProfileMinimal ctx={ctx} />;
    case 'spotlight': return <ProfileSpotlight ctx={ctx} />;
    default:          return null;   // 'original' → App.jsx renders <Profile>
  }
}

export { PROFILE_LAYOUTS, ProfileVariant };
