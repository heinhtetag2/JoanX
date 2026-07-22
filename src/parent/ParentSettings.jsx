// JoanX — parent app · ParentSettings

import React from 'react';
import { APP_CATEGORIES, CHILDREN, PERMISSIONS } from '../core/data.jsx';
import { Badge, Icon, THEME, Toggle, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, ParentHead, RULE_TAG_COLORS } from './shared.jsx';

function ParentSettings({ ctx }) {
  const child = ctx.params?.child || CHILDREN[0];
  // each child carries its own persistent rules config; seed defaults if missing
  if (!child.cfg) child.cfg = {
    mode: child.mode || 'smart',
    cats: Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])),
    sens: 2, notif: true, gam: true, rules: [],
    grants: Object.fromEntries(PERMISSIONS.map(p => [p.id, true])),
  };
  const cfg = child.cfg;
  const [, force] = React.useReducer(x => x + 1, 0);
  const update = patch => { Object.assign(cfg, patch); force(); };

  const mode = cfg.mode, cats = cfg.cats, sens = cfg.sens, notif = cfg.notif, gam = cfg.gam;
  const setModeBoth = m => { update({ mode: m }); ctx.setMode(m); };

  // Onboarding consent: what the child actually accepted at setup. Read-only here —
  // the parent can see which required protections were granted vs declined, but the
  // grant itself lives on the child's device (OS permission), so there's no toggle.
  const grants = cfg.grants || Object.fromEntries(PERMISSIONS.map(p => [p.id, true]));
  const declinedCount = PERMISSIONS.filter(p => !grants[p.id]).length;
  const allGranted = declinedCount === 0;
  const consentTone = allGranted
    ? { bg: 'var(--color-interactives-badge-evergreen-default)', fg: 'var(--color-interactives-badge-evergreen-label)' }
    : { bg: 'var(--color-interactives-badge-ember-default)',     fg: 'var(--color-interactives-badge-ember-label)' };

  // Remove-child flow: confirm sheet → unlink device + delete this child, then
  // return to the Children list (which re-reads CHILDREN, now one shorter).
  const [confirmDel, setConfirmDel] = React.useState(false);
  const removeChild = () => {
    const i = CHILDREN.findIndex(c => c.id === child.id);
    if (i >= 0) CHILDREN.splice(i, 1);
    setConfirmDel(false);
    ctx.nav('p_children');
  };
  const delTitle = ctx.lang === 'ko' ? `${child.name} 삭제할까요?` : `Remove ${child.name}?`;

  // Device change is PARENT-INITIATED. Pairing only happens when the parent
  // scans the child's new-phone QR (via "Reconnect device" below) — the app
  // has no way to passively "detect" a new phone before it's scanned, so there
  // is no auto-alert. finishPair applies the swap once the scan succeeds.

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={`${child.name} · ${child.device}`} title={L('Rules & settings')} onBack={() => ctx.nav('p_children')} />
      <div style={{ padding: '8px 16px 0' }}>
        {/* device connection — start pairing (code / QR) from here */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Device')}</div>
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: child.online ? THEME.svcGreenBg : THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="smartphone" size={20} color={child.online ? THEME.success : THEME.fg3} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>{child.device}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: child.online ? THEME.success : THEME.fg3 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: child.online ? THEME.success : THEME.fg2 }}>{child.online ? L('Connected') : L('Not connected')}</span>
              </div>
            </div>
          </div>
          <button onClick={() => ctx.nav('p_addchild', { pair: true, pairChildId: child.id, scan: true })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 14, padding: '12px', background: child.online ? '#fff' : BRAND.primaryLight, color: BRAND.primaryDark, border: child.online ? `1.5px solid ${THEME.border}` : 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}>
            <Icon name={child.online ? 'refresh-cw' : 'link-2'} size={16} color={BRAND.primary} stroke={2.4} />{L(child.online ? 'Reconnect device' : 'Connect device')}
          </button>
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', margin: '10px 4px 0' }}>
            <Icon name="info" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L('Switched to a new phone? Reconnect and scan the new QR shown in their JoanX app.')}</span>
          </div>
        </div>

        {/* onboarding consent — what the child accepted at setup (read-only status the parent can check) */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Setup agreement')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {/* at-a-glance summary strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: consentTone.bg }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={allGranted ? 'shield-check' : 'shield-alert'} size={19} color={consentTone.fg} stroke={2.2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: consentTone.fg }}>{allGranted ? L('Accepted everything') : L('%n not accepted').replace('%n', declinedCount)}</div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{`${PERMISSIONS.length - declinedCount}/${PERMISSIONS.length} · ${L('required accepted at setup')}`}</div>
            </div>
          </div>
          {/* per-item accepted / declined status */}
          {PERMISSIONS.map(p => {
            const ok = grants[p.id];
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${THEME.border}` }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={p.icon} size={18} color={THEME.fg2} stroke={2.2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{L(p.name)}</div>
                  <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L(p.blurb)}</div>
                </div>
                <Badge variant={ok ? 'success' : 'warning'}>
                  <Icon name={ok ? 'check' : 'alert-triangle'} size={11} color="currentColor" stroke={2.6} />{L(ok ? 'Accepted' : 'Declined')}
                </Badge>
              </div>
            );
          })}
          <div style={{ display: 'flex', gap: 7, alignItems: 'flex-start', padding: '11px 14px 13px', borderTop: `1px solid ${THEME.border}` }}>
            <Icon name="info" size={13} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>{L('These are the protections your child accepted during setup. Declined items limit safety warnings.')}</span>
          </div>
        </div>

        {/* mode */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Protection mode')}</div>
        <div style={{ display: 'flex', gap: 8, background: '#fff', borderRadius: 16, padding: 6, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          {[{ id: 'smart', t: 'Smart', d: 'Warnings + game' }, { id: 'lite', t: 'Lite', d: 'Hard block' }].map(o => (
            <button key={o.id} onClick={() => setModeBoth(o.id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '12px 8px', background: mode === o.id ? BRAND.primary : 'transparent', transition: 'background .2s' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: mode === o.id ? '#fff' : THEME.fg1 }}>{L(o.t)}</div>
              <div style={{ fontSize: 11, color: mode === o.id ? 'rgba(255,255,255,.85)' : THEME.fg2, marginTop: 1 }}>{L(o.d)}</div>
            </button>
          ))}
        </div>

        {mode === 'lite' ? (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Block while walking')}</div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
              {APP_CATEGORIES.map((c, i) => {
                // each category gets a distinct system avatar palette
                const pal = { video: 'sakura', games: 'iris', social: 'ocean', browser: 'tropic', camera: 'moss', phone: 'pebble' }[c.id] || 'sand';
                return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: `var(--color-interactives-avatar-${pal}-default)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={`var(--color-interactives-avatar-${pal}-icon)`} stroke={2.2} /></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{L(c.name)}</div>
                    {c.locked && <div style={{ fontSize: 11.5, color: THEME.success, fontWeight: 600 }}>{L('Always allowed')}</div>}
                  </div>
                  {c.locked ? <Icon name="lock" size={16} color={THEME.fg3} stroke={2.3} /> : <Toggle on={cats[c.id]} onChange={v => update({ cats: { ...cats, [c.id]: v } })} />}
                </div>
              );})}
            </div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Warning sensitivity')}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['Gentle', 'Balanced', 'Strict'].map((l, i) => (
                  <button key={l} onClick={() => update({ sens: i + 1 })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? THEME.fg1 : THEME.fg3 }}>{L(l)}</button>
                ))}
              </div>
              <div style={{ position: 'relative', height: 8, background: THEME.border, borderRadius: 999 }}>
                <div style={{ width: `${(sens - 1) * 50}%`, height: '100%', background: BRAND.primary, borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${(sens - 1) * 50}%`, transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 999, background: '#fff', border: `3px solid ${BRAND.primary}`, boxShadow: THEME.shadowCard }} />
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 12 }}>{['', L('Warns only in clear risk — fewest interruptions.'), L('Recommended balance of safety and calm.'), L('Warns earlier and more often.')][sens]}</div>
            </div>
          </React.Fragment>
        )}

        {/* time rules */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Time rules')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
          {(cfg.rules || []).map((r, i) => {
            // Badges consume the system badge tokens directly: {palette}-default (20) bg + {palette}-label (70) text
            const tagCol = RULE_TAG_COLORS[r.tag] || RULE_TAG_COLORS.Relaxed;
            return (
            <div key={i} onClick={() => ctx.nav('p_schedule', { child, rule: r, index: i })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L(r.t)}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{r.s}</div>
              </div>
              <Badge style={{ background: tagCol.bg, color: tagCol.c }}>{L(r.tag)}</Badge>
              <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
            </div>
            );
          })}
          <div onClick={() => ctx.nav('p_schedule', { child, rule: null, index: -1 })} style={{ borderTop: `1px solid ${THEME.border}`, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 8, color: THEME.fg1, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            <Icon name="plus" size={17} color={THEME.fg1} stroke={2.4} /> {L('Add a schedule')}
          </div>
        </div>

        {/* prefs */}
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Preferences')}</div>
        <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
            <Icon name="bell" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Notify me of activity')}</div><Toggle on={notif} onChange={v => update({ notif: v })} />
          </div>
          {mode === 'smart' && <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: `1px solid ${THEME.border}` }}>
            <Icon name="gamepad-2" size={18} color={THEME.fg2} stroke={2.2} /><div style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>{L('Character game & rewards')}</div><Toggle on={gam} onChange={v => update({ gam: v })} />
          </div>}
        </div>

        {/* danger zone — remove this child from the account */}
        <button onClick={() => setConfirmDel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 22, padding: '14px', background: '#fff', color: THEME.danger, border: `1.5px solid ${THEME.dangerLight || 'rgba(214,69,69,.25)'}`, borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: THEME.shadowCard }}>
          <Icon name="trash-2" size={17} color={THEME.danger} stroke={2.3} />{L('Remove child')}
        </button>
      </div>

      {/* remove-child confirmation sheet */}
      {confirmDel && (
        <div onClick={() => setConfirmDel(false)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(20,18,17,.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 20px 26px' }}>
            <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 18px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.dangerLight || 'rgba(214,69,69,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="trash-2" size={26} color={THEME.danger} stroke={2.2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.fg1, textAlign: 'center', margin: '0 0 8px' }}>{delTitle}</h2>
            <p style={{ fontSize: 13.5, color: THEME.fg2, textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px' }}>
              {L('This unlinks their device and permanently deletes their reports, rules, and safety history. This can’t be undone.')}
            </p>
            <button onClick={removeChild} style={{ width: '100%', padding: '15px', background: THEME.danger, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              {L('Remove')} {child.name}
            </button>
            <button onClick={() => setConfirmDel(false)} style={{ width: '100%', marginTop: 10, padding: '15px', background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>
              {L('Cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export { ParentSettings };
