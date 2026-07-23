// JoanX — parent app · ParentAddChild

import React from 'react';
import { APP_CATEGORIES, CHILDREN, MAX_CHILDREN, PARENT_PROFILE } from '../core/data.jsx';
import { Button, DateField, Icon, Input, PhotoAvatar, SelectField, THEME, Toggle, formatPhone, screenBgFor } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { MascotChip, shade } from '../core/characters.jsx';
import { BRAND, brandBtn } from './shared.jsx';
import { sfx } from '../core/sound.jsx';

// Multi-step add-child wizard, aligned with the child app's onboarding:
// 1 Details → 2 Pair (code) → 3 Connected celebration → 4 Configure protection.
function ParentAddChild({ ctx }) {
  // Onboarding shows intro (0); "+" opens details (1); "Connect device" opens pairing (2);
  // the Children tab's global "Connect a device" entry reuses the pair screen (2),
  // then asks whose device it was on the child picker (5) before celebrating.
  // First-run and the "+" both open straight on the details form — the old intro page is gone.
  const [wiz, setWiz] = React.useState(ctx.params?.connect ? 2 : ctx.params?.pair ? 2 : 1);   // 1 details · 2 pair · 3 connected · 5 pick child
  const ko = typeof getLang === 'function' && getLang() === 'ko';
  const ageFromDob = v => { if (!v) return null; const [y, m, d] = v.split('-').map(Number); const t = new Date(); let a = t.getFullYear() - y; const mo = t.getMonth() + 1; if (mo < m || (mo === m && t.getDate() < d)) a--; return a >= 0 ? a : null; };
  // multiple children can be added; each is a collapsible card
  const newKid = () => ({ name: '', dob: '', phone: '', relation: '', sibling: '' });
  const [kids, setKids] = React.useState([newKid()]);
  const [openKid, setOpenKid] = React.useState(0);   // which card is expanded (-1 = all collapsed)
  const updateKid = (i, patch) => setKids(ks => ks.map((k, j) => (j === i ? { ...k, ...patch } : k)));
  // capacity left on this guardian account (A-13) — you can't stage or register past MAX_CHILDREN
  const spaceLeft = () => MAX_CHILDREN - CHILDREN.length - kids.length;
  const addKid = () => { if (spaceLeft() <= 0) return; setOpenKid(kids.length); setKids(ks => [...ks, newKid()]); };
  const removeKid = i => { setKids(ks => ks.filter((_, j) => j !== i)); setOpenKid(Math.max(0, i - 1)); };
  const [cats, setCats] = React.useState(() => Object.fromEntries(APP_CATEGORIES.map(c => [c.id, c.blocked])));
  const [sens, setSens] = React.useState(2);
  const [notif, setNotif] = React.useState(true);
  const [scan, setScan] = React.useState(!!ctx.params?.scan);   // Pair step: show code vs. scan child's QR (device-change opens straight to scan)
  const [copied, setCopied] = React.useState(false);
  const mode = 'smart';   // Smart is the only mode in scope
  const code = '482193';   // 6-digit numeric — matches the child app's connect-code input

  React.useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const CAT_PAL = { video: 'sakura', games: 'iris', social: 'ocean', browser: 'tropic', camera: 'moss', phone: 'pebble' };

  const direct = !!ctx.params?.direct;   // opened via the "+" button (no intro)
  const pairMode = !!ctx.params?.pair;   // opened via a child's "Connect device" action
  const connectMode = !!ctx.params?.connect;   // opened via the Children tab's global connect entry
  const firstRun = !direct && !pairMode && !connectMode;   // reached from onboarding — the skippable entry
  const [pickedId, setPickedId] = React.useState(null);   // child chosen on the picker step
  const [swapId, setSwapId] = React.useState(null);   // connected child tapped on the picker → confirm device change
  const swapChild = swapId ? CHILDREN.find(x => x.id === swapId) : null;
  const pairChild = (pickedId && CHILDREN.find(x => x.id === pickedId)) || (ctx.params?.pairChildId ? CHILDREN.find(x => x.id === ctx.params.pairChildId) : null);
  // in connect mode the pair step happens first, then the picker
  const afterPair = () => setWiz(connectMode ? 5 : 3);
  // the "connected!" celebration (wiz 3) plays a warm confirmation — the parent-app
  // counterpart of the child's connected chime. Muted by the parent sound toggle.
  React.useEffect(() => { if (wiz === 3) sfx.connected(); }, [wiz]);
  const back = () => {
    if (wiz === 5) return setWiz(2);
    if (wiz === 2) return (connectMode || pairMode) ? ctx.nav('p_children') : setWiz(1);
    if (wiz === 1) return connectMode ? setWiz(5) : ctx.nav('p_children');
    return setWiz(wiz - 1);
  };
  const skip = () => ctx.nav('p_children');   // from the intro: add a child later from the Children tab
  // pairing complete → mark that child online and return to the list. If a
  // new-device request was pending (device-change), adopt it: protection moves
  // to the scanned phone and the old device is unlinked.
  const finishPair = () => {
    if (pairChild) {
      if (pairChild.pendingDevice) { pairChild.device = pairChild.pendingDevice.device; delete pairChild.pendingDevice; }
      pairChild.online = true; pairChild.lastSeen = 'just now'; pairChild.battery = 100;
    }
    ctx.nav('p_children');
  };

  const addChild = () => {
    // never register past the cap, even if more forms were somehow staged (A-13)
    kids.slice(0, Math.max(0, MAX_CHILDREN - CHILDREN.length)).forEach(kid => {
      const i = CHILDREN.length;
      CHILDREN.push({
        id: 'k' + (i + 1), name: kid.name.trim() || 'New child', age: ageFromDob(kid.dob) || 8, dob: kid.dob, mode, phone: kid.phone.trim(), relation: kid.relation, sibling: kid.sibling,
        device: 'iPhone 15', battery: 100, online: false, lastSeen: '—',
        avatar: ['cat', 'croc', 'owl', 'fox', 'bird'][i % 5], color: ['#a8c3eb', '#59c08c', '#b9a3ef', '#e1874a', '#67c7ce'][i % 5],
        cfg: {
          mode, cats, sens, notif, gam: true,
          rules: [{ t: 'School commute', s: 'Mon–Fri · 8:00–8:40 AM', tag: 'Strict' }, { t: 'At home', s: 'Geofenced · home Wi-Fi', tag: 'Relaxed' }],
        },
      });
    });
    // when adding from the connect picker, return there so the parent can
    // connect the child they just added — not back out to the Children home
    if (connectMode) { setKids([newKid()]); setOpenKid(0); setWiz(5); return; }
    ctx.nav('p_children');
  };

  const childInitial = (((pairChild ? pairChild.name : (kids[0] && kids[0].name)) || '').trim()[0] || 'C').toUpperCase();
  // the child shown on the connected screen: the one just paired, else the first kid.
  // Its photo drives the child avatar; mascot / initial fall back when there's no photo.
  const connChild = pairChild || kids[0] || null;
  const allNamed = kids.every(k => k.name.trim());

  return (
    <div style={{ position: 'absolute', inset: 0, background: screenBgFor(BRAND.primary), display: 'flex', flexDirection: 'column', paddingTop: 50 }}>

      {/* back + 3-segment progress (hidden on the connected celebration) */}
      {/* back shows on pair/configure, and on details only when opened via "+" (not from the intro) */}
      {((wiz === 1 && (direct || connectMode)) || wiz === 2 || wiz === 4 || wiz === 5) && (
        <div style={{ padding: '6px 24px 0' }}>
          <button onClick={back} aria-label={L('Back')} style={{ width: 34, height: 34, borderRadius: 999, border: `1.5px solid ${THEME.border}`, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevron-left" size={20} color={THEME.fg1} stroke={2.4} />
          </button>
        </div>
      )}

      {/* 5 · pick child — connect mode, after the scan/code: whose device was that? */}
      {wiz === 5 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Who are we connecting?')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>{L('Choose the child whose phone is in your hand.')}</p>

            {/* every child, waiting ones first — connected kids stay tappable for a
                device change (new phone), gated behind a confirm sheet */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...CHILDREN.filter(k => !k.online), ...CHILDREN.filter(k => k.online)].map(k => {
                const pal = ['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][CHILDREN.indexOf(k) % 6];
                const linked = k.online;
                return (
                  <button key={k.id} onClick={() => (linked ? setSwapId(k.id) : (setPickedId(k.id), setWiz(3)))} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 13, background: '#fff', borderRadius: 18, border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                    <MascotChip species={k.avatar} color={k.color} size={48} bg={`var(--color-interactives-avatar-${pal}-default)`} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{k.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: THEME.fg2, marginTop: 3 }}>
                        <Icon name={linked ? 'link-2' : 'link-2-off'} size={13} color={linked ? THEME.success : THEME.fg3} stroke={2.3} />{L(linked ? 'Connected' : 'Not connected')} · {k.device}
                      </span>
                    </span>
                    {linked && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: THEME.successLight, color: shade(THEME.success, -22), borderRadius: 999, padding: '4px 10px', fontSize: 11.5, fontWeight: 800, flexShrink: 0 }}>
                        <Icon name="check" size={12} color={shade(THEME.success, -22)} stroke={3} />{L('Connected')}
                      </span>
                    )}
                    <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.4} style={{ flexShrink: 0 }} />
                  </button>
                );
              })}
            </div>

            {/* add another child — same dashed pattern as the details form */}
            <button onClick={() => setWiz(1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 12, padding: 13, background: 'transparent', color: THEME.fg2, border: '1.5px dashed rgba(43,41,38,.28)', borderRadius: 16, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="plus" size={17} color={THEME.fg2} stroke={2.6} />{L('Add another child')}
            </button>

            {/* nobody waiting — one quiet caption, no boxed empty state */}
            {!CHILDREN.some(k => !k.online) && (
              <div style={{ textAlign: 'center', fontSize: 12.5, color: THEME.fg3, fontWeight: 700, marginTop: 14 }}>{L('All children are connected!')}</div>
            )}
          </div>

          {/* device change confirm — the picked child is already linked; moving to
              the just-scanned phone unlinks their old device */}
          {swapChild && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div onClick={() => setSwapId(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(24,20,17,0.44)', backdropFilter: 'blur(1.5px)', WebkitBackdropFilter: 'blur(1.5px)' }} />
              <div className="jx-sheet-up" style={{ position: 'relative', background: '#fff', borderRadius: '30px 30px 0 0', padding: '10px 24px calc(env(safe-area-inset-bottom) + 22px)', boxShadow: '0 -16px 44px rgba(20,18,16,0.28)' }}>
                <div style={{ width: 40, height: 5, borderRadius: 999, background: THEME.border, margin: '0 auto 16px' }} />
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <MascotChip species={swapChild.avatar} color={swapChild.color} size={64} bg={`var(--color-interactives-avatar-${['ocean', 'sakura', 'tropic', 'moss', 'pebble', 'iris'][CHILDREN.indexOf(swapChild) % 6]}-default)`} />
                </div>
                <h1 className="game-font" style={{ fontSize: 21, fontWeight: 500, margin: '0 8px 8px', lineHeight: 1.25, textAlign: 'center' }}>{L('Connect a new device?')}</h1>
                <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 2px 16px', textAlign: 'center' }}>
                  {ko
                    ? `${swapChild.name}은(는) 이미 ${swapChild.device}에 연결되어 있어요. 이 기기로 연결하면 기존 기기의 보호는 자동으로 해제돼요.`
                    : `${swapChild.name} is already connected on ${swapChild.device}. Linking this phone will move protection over and unlink the old device.`}
                </p>
                <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => { swapChild.pendingDevice = { device: 'iPhone 16' }; setPickedId(swapChild.id); setSwapId(null); setWiz(3); }}>{L('Connect new device')}</Button>
                <button onClick={() => setSwapId(null)} style={{ width: '100%', marginTop: 10, padding: 6, background: 'none', border: 'none', color: THEME.fg2, fontSize: 15, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer' }}>{L('Cancel')}</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 1 · child details */}
      {wiz === 1 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 0' }}>
            {/* skip rides the title's top-right, matching the child onboarding's 건너뛰기 —
                first-run only (adding via "+" or the connect flow isn't skippable) */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <h1 className="game-font" style={{ flex: 1, fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Add a child')}</h1>
              {firstRun && (
                <button onClick={skip} style={{ flexShrink: 0, marginTop: 4, padding: '4px 2px', border: 'none', background: 'none', fontFamily: 'inherit', fontSize: 14, fontWeight: 800, color: BRAND.primary, cursor: 'pointer' }}>{L('Skip')}</button>
              )}
            </div>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>{L('Tell us a little about your child to set up their device. You can add more than one.')}</p>

            {/* collapsible card per child — keeps many kids compact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {kids.map((kid, i) => {
                const isOpen = openKid === i;
                const kAge = ageFromDob(kid.dob);
                const relLbl = { son: 'Son', daughter: 'Daughter', grandchild: 'Grandchild', other: 'Other child in my care' }[kid.relation];
                const summary = [kid.name.trim() || `${L('Child')} ${i + 1}`, kAge != null ? (ko ? `만 ${kAge}세` : `${kAge}y`) : null, relLbl ? L(relLbl) : null].filter(Boolean).join(' · ');
                return (
                  <div key={i} style={{ background: '#fff', borderRadius: 18, border: `1.5px solid ${isOpen ? THEME.border : 'transparent'}`, overflow: 'hidden', transition: 'border-color .2s' }}>
                    <button onClick={() => setOpenKid(isOpen ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: 14, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <div style={{ width: 30, height: 30, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: BRAND.primaryDark }}>{i + 1}</div>
                      <div style={{ flex: 1, textAlign: 'left', minWidth: 0, fontSize: 14, fontWeight: 700, color: kid.name.trim() ? THEME.fg1 : THEME.fg3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{summary}</div>
                      {kids.length > 1 && <span role="button" onClick={e => { e.stopPropagation(); removeKid(i); }} style={{ display: 'flex', padding: 4, cursor: 'pointer' }}><Icon name="trash-2" size={16} color={THEME.fg3} stroke={2.2} /></span>}
                      <Icon name="chevron-down" size={18} color={THEME.fg3} stroke={2.3} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                    {isOpen && (
                      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 14, borderTop: `1px solid ${THEME.border}` }}>
                        <Input label={L("Child's name")} value={kid.name} onChange={e => updateKid(i, { name: e.target.value })} placeholder={L('e.g. Mina')} icon="user" accent={BRAND.ink} />
                        <div>
                          <DateField label={L("Child's date of birth")} value={kid.dob ? new Date(kid.dob + 'T00:00') : null}
                            onChange={d => updateKid(i, { dob: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` })} accent={BRAND.ink} />
                          {kid.dob && kAge != null && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '4px 11px', borderRadius: 999, background: THEME.surface2, color: THEME.fg2, fontSize: 12.5, fontWeight: 800 }}>
                              <Icon name="cake" size={13} color={THEME.fg3} stroke={2.3} />{ko ? `만 ${kAge}세` : `${kAge} ${kAge === 1 ? 'year' : 'years'} old`}
                            </div>
                          )}
                        </div>
                        <SelectField label={L('Relationship to you')} title={L('Relationship to you')} value={kid.relation} onChange={v => updateKid(i, { relation: v })} accent={BRAND.ink}
                          options={[['son', 'Son'], ['daughter', 'Daughter'], ['grandchild', 'Grandchild'], ['other', 'Other child in my care']].map(([v, l]) => ({ value: v, label: L(l) }))} />
                        <SelectField label={L('Position among siblings')} title={L('Position among siblings')} value={kid.sibling} onChange={v => updateKid(i, { sibling: v })} accent={BRAND.ink}
                          options={[['oldest', 'Oldest child'], ['middle', 'Middle child'], ['youngest', 'Youngest child'], ['only', 'Only child']].map(([v, l]) => ({ value: v, label: L(l) }))} />
                        <Input label={L("Child's phone number")} value={kid.phone} onChange={e => updateKid(i, { phone: formatPhone(e.target.value) })} placeholder="010-1234-5678" type="tel" accent={BRAND.ink} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* add another child — hidden once the account is at its child cap (A-13) */}
            {spaceLeft() > 0 ? (
            <button onClick={addKid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', marginTop: 12, padding: 13, background: 'transparent', color: THEME.fg2, border: '1.5px dashed rgba(43,41,38,.28)', borderRadius: 16, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="plus" size={17} color={THEME.fg2} stroke={2.6} />{L('Add another child')}
            </button>
            ) : (
            <div style={{ marginTop: 12, padding: '11px 13px', fontSize: 12.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center' }}>{L('You can manage up to')} {MAX_CHILDREN} {L('children.')}</div>
            )}
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!allNamed} onClick={allNamed ? addChild : undefined}>{L(kids.length > 1 ? 'Add children' : 'Add child')}</Button>
          </div>
        </>
      )}

      {/* 2 · pairing — show a code for the child to enter, or scan the child's QR */}
      {wiz === 2 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 26px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ alignSelf: 'stretch' }}>
              <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{pairChild ? (ko ? `${pairChild.name} 기기 연결` : `Connect ${pairChild.name}'s device`) : L('Connect their device')}</h1>
              <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>{L(scan ? "Point at the QR shown in your child's JoanX app." : "Install JoanX on your child's phone, open it, and enter this code.")}</p>
            </div>

            {scan ? (
              /* camera viewfinder — restrained, real-app style; tap simulates a successful scan */
              <div onClick={afterPair} style={{ width: '100%', maxWidth: 300, aspectRatio: '0.92', borderRadius: 24, background: '#17191d', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 70px rgba(0,0,0,.55)' }}>
                {/* faint center light — suggests a live camera without neon */}
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 50% 44%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 70%)' }} />
                {/* thin white corner framing guides — no moving scan line: this is a QR
                    viewfinder, not a barcode sweep */}
                <div style={{ position: 'absolute', top: '24%', left: '22%', right: '22%', bottom: '24%' }}>
                  {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], i) => (
                    <div key={i} style={{ position: 'absolute', [v]: 0, [h]: 0, width: 24, height: 24, [`border${v[0].toUpperCase() + v.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${h[0].toUpperCase() + h.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${v[0].toUpperCase() + v.slice(1)}${h[0].toUpperCase() + h.slice(1)}Radius`]: 9 }} />
                  ))}
                </div>
                <span style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{L('Point at your child’s QR code')}</span>
              </div>
            ) : (
              /* pairing code — grouped code band (reads as one shareable code) + footer */
              <div style={{ alignSelf: 'stretch', background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, background: BRAND.primaryLight, borderRadius: 16, padding: '20px 12px' }}>
                  <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(0, 3)}</span>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: BRAND.primary, opacity: .35, flexShrink: 0 }} />
                  <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(3)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="clock" size={13} color={THEME.fg3} stroke={2.2} />
                    <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 700 }}>{L('Valid for 5 minutes')}</span>
                  </div>
                  <button onClick={() => setCopied(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: copied ? THEME.successLight : '#fff', color: copied ? THEME.success : BRAND.primaryDark, border: `1.5px solid ${copied ? 'transparent' : THEME.border}`, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all .15s' }}>
                    <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? THEME.success : BRAND.primary} stroke={2.6} />{L(copied ? 'Copied!' : 'Copy')}
                  </button>
                </div>
              </div>
            )}

            {/* toggle between code and scanner */}
            <button onClick={() => setScan(!scan)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '20px 0 0', padding: '9px 16px', background: '#fff', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primaryDark, fontSize: 13, fontWeight: 800 }}>
              <Icon name={scan ? 'keyboard' : 'scan-line'} size={16} color={BRAND.primary} stroke={2.3} />{L(scan ? 'Show a code instead' : 'Scan their QR instead')}
            </button>
          </div>

          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            {scan
              ? <div style={{ textAlign: 'center', fontSize: 12.5, color: THEME.fg3, fontWeight: 700 }}>{L('Connects automatically once scanned.')}</div>
              : <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={afterPair}>{L('Continue')}</Button>}
          </div>
        </>
      )}

      {/* 3 · connected celebration — mirrors the child app's Connected screen */}
      {wiz === 3 && (
        <>
          <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '39%', left: '50%', transform: 'translate(-50%,-50%)', width: 300, height: 300, borderRadius: 999, background: 'radial-gradient(circle, rgba(75,129,79,.16) 0%, rgba(255,255,255,0) 68%)' }} />

            {/* parent + child joined — overlapping avatars with a live pulse */}
            <div className="jx-pop" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {[0, 0.8].map((d, i) => (
                <div key={`ring${i}`} className="jx-ring" style={{ position: 'absolute', top: '50%', left: '50%', width: 124, height: 124, marginTop: -62, marginLeft: -62, borderRadius: 999, border: `2px solid ${THEME.success}`, zIndex: 0, animationDelay: `${d}s` }} />
              ))}
              {/* child — this child's photo, then the standard child avatar, and only
                  then the mascot / initial. This connect moment always shows a child
                  face (never the buddy character) even before a per-child photo exists. */}
              <div style={{ width: 86, height: 86, borderRadius: 999, background: THEME.beachBg, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, boxShadow: 'inset 0 0 0 1px rgba(46,43,41,.05)', overflow: 'hidden' }}>
                <PhotoAvatar src={connChild?.photo} size={78} fallback={
                  <PhotoAvatar src="/assets/avatars/avatar-child.png" size={78} fallback={connChild
                    ? <MascotChip species={connChild.avatar} color={connChild.color} size={78} bg={THEME.beachBg} />
                    : <span className="game-font" style={{ fontSize: 34, fontWeight: 500, color: THEME.beach }}>{childInitial}</span>} />} />
              </div>
              {/* parent — real photo, the people glyph as fallback */}
              <div style={{ width: 86, height: 86, borderRadius: 999, background: BRAND.primaryLight, border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: -26, position: 'relative', zIndex: 1, boxShadow: 'inset 0 0 0 1px rgba(68,122,175,.10)', overflow: 'hidden' }}>
                <PhotoAvatar src={PARENT_PROFILE.avatar} size={78} fallback={<Icon name="users" size={38} color={BRAND.primary} stroke={2.2} />} />
              </div>
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: THEME.successLight, color: shade(THEME.success, -22), borderRadius: 999, padding: '5px 14px 5px 6px', fontSize: 13, fontWeight: 700, marginBottom: 18 }}>
              <span style={{ width: 20, height: 20, borderRadius: 999, background: THEME.success, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={12} color="#fff" stroke={3.4} />
              </span>{L('Linked with your child')}
            </div>

            <h1 className="game-font" style={{ fontSize: 29, fontWeight: 500, margin: '0 0 12px' }}>{L('Device connected!')}</h1>
            <p style={{ fontSize: 15, color: THEME.fg2, lineHeight: 1.55, margin: 0, maxWidth: 280 }}>{L('You can now set up protection for your child.')}</p>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={finishPair}>{L('Done')}</Button>
          </div>
        </>
      )}

      {/* 4 · configure protection */}
      {wiz === 4 && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 0' }}>
            <h1 className="game-font" style={{ fontSize: 26, fontWeight: 500, margin: '0 0 8px', lineHeight: 1.2 }}>{L('Set up protection')}</h1>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>{L('Choose what to block while walking. You can change this anytime.')}</p>

            {/* block-while-walking categories */}
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '0 2px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Block while walking')}</div>
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' }}>
              {APP_CATEGORIES.map((c, i) => {
                const pal = CAT_PAL[c.id] || 'sand';
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: `var(--color-interactives-avatar-${pal}-default)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={c.icon} size={18} color={`var(--color-interactives-avatar-${pal}-icon)`} stroke={2.2} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{L(c.name)}</div>
                      {c.locked && <div style={{ fontSize: 11.5, color: THEME.success, fontWeight: 600 }}>{L('Always allowed')}</div>}
                    </div>
                    {c.locked ? <Icon name="lock" size={16} color={THEME.fg3} stroke={2.3} /> : <Toggle on={cats[c.id]} onChange={v => setCats({ ...cats, [c.id]: v })} />}
                  </div>
                );
              })}
            </div>

            {/* warning sensitivity */}
            <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '0 2px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{L('Warning sensitivity')}</div>
            <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {['Gentle', 'Balanced', 'Strict'].map((l, i) => (
                  <button key={l} onClick={() => setSens(i + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: sens === i + 1 ? 800 : 600, color: sens === i + 1 ? BRAND.primary : THEME.fg3 }}>{L(l)}</button>
                ))}
              </div>
              <div style={{ position: 'relative', height: 8, background: THEME.border, borderRadius: 999 }}>
                <div style={{ width: `${(sens - 1) * 50}%`, height: '100%', background: BRAND.primary, borderRadius: 999 }} />
                <div style={{ position: 'absolute', top: '50%', left: `${(sens - 1) * 50}%`, transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 999, background: '#fff', border: `3px solid ${BRAND.primary}`, boxShadow: THEME.shadowCard }} />
              </div>
              <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 12 }}>{['', L('Warns only in clear risk — fewest interruptions.'), L('Recommended balance of safety and calm.'), L('Warns earlier and more often.')][sens]}</div>
            </div>

            {/* notifications */}
            <div style={{ background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, padding: '14px' }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="bell" size={18} color={BRAND.primary} stroke={2.2} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Safety alerts')}</div>
                <div style={{ fontSize: 12, color: THEME.fg2, lineHeight: 1.4, marginTop: 2 }}>{L('Get notified about risky moments.')}</div>
              </div>
              <Toggle on={notif} onChange={setNotif} />
            </div>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} icon="user-plus" onClick={addChild}>{L('Add child')}</Button>
          </div>
        </>
      )}
    </div>
  );
}

export { ParentAddChild };
