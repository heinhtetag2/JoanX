// JoanX — parent app · ParentFamily + ParentInvite
//
// Two parents, one household. The family owns the children, so a second guardian joins the
// FAMILY — never the child's device. Nothing here touches the child's phone: no re-scan, no
// re-pair, and no way to knock the first parent offline.
//
// Both guardians see the same data and change the same settings. What keeps that from turning
// into a silent tug-of-war is not permissions, it is attribution: every change is stamped with
// who made it and shown to both of them (FAMILY_LOG).

import React from 'react';
import { FAMILY_INVITE, FAMILY_LOG, FAMILY_ROLES, MAX_GUARDIANS, familyFull, guardianCan, guardianMe, guardianOwner, guardians, removeGuardian } from '../core/data.jsx';
import { Button, Icon, PairQR, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, brandBtn, ParentHead } from './shared.jsx';

const card = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' };
const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;

// A guardian's avatar — initial on a brand disc, same shape the account row already uses.
function MemberAvatar({ name, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: BRAND.primaryLight, color: BRAND.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * .38, fontWeight: 800, flexShrink: 0 }}>
      {name[0]}
    </div>
  );
}

// ── The household: who can see Mina, and what each of them may do ────
function ParentFamily({ ctx }) {
  const [, bump] = React.useState(0);
  const me = guardianMe();
  const list = guardians();
  const full = familyFull();
  const mayInvite = guardianCan(me, 'invite') && !full;

  const drop = (m) => {
    if (!window.confirm(`${L('Remove')} ${m.name}? ${L('They lose access to every child in this family.')}`)) return;
    removeGuardian(m.id);
    bump(n => n + 1);
  };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Parent app')} title={L('Parents')} onBack={() => ctx.nav('p_account')} />
      <div style={{ padding: '8px 16px 0' }}>

        {/* the one sentence that explains the whole model */}
        <div style={{ ...card, padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <Icon name="users" size={18} color={BRAND.primary} stroke={2.2} />
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>
              {L('Everyone here sees the same reports and can change the same settings. Adding or removing a parent never touches your child’s phone.')}
            </div>
          </div>
        </div>

        {label(`${L('Parents')} · ${list.length}/${MAX_GUARDIANS}`)}
        <div style={card}>
          {list.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <MemberAvatar name={m.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>
                  {L(m.relation)} · {m.name}
                  {m.me && <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}> · {L('you')}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{m.phone}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 999, background: m.role === 'owner' ? BRAND.primaryLight : THEME.surface2, color: m.role === 'owner' ? BRAND.primaryDark : THEME.fg2 }}>
                {L(FAMILY_ROLES[m.role].label)}
              </span>
              {/* the owner cannot be removed — only handed over. A family with no owner has
                  nobody who can pay for it or repair it. */}
              {mayInvite && m.role !== 'owner' && (
                <button onClick={() => drop(m)} aria-label={L('Remove')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="x" size={16} color={THEME.fg3} stroke={2.4} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* full → the family is at its two-parent cap; invite → the owner may add the second
            parent; otherwise → a co-parent, who is told who can. */}
        {full
          ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12.5, color: THEME.fg3, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>
              <Icon name="check-circle" size={15} color={BRAND.primary} stroke={2.2} />
              {L('This family is full — one child can have two parents.')}
            </div>
          : mayInvite
            ? <Button variant="primary" fullWidth icon="user-plus" onClick={() => ctx.nav('p_invite')} style={{ ...brandBtn, marginBottom: 20 }}>{L('Invite a parent')}</Button>
            : <div style={{ fontSize: 12, color: THEME.fg3, textAlign: 'center', margin: '0 0 20px', lineHeight: 1.5 }}>{guardianOwner().name} {L('can add or remove parents.')}</div>}

        {/* F-attribution — nobody changes a safety setting invisibly */}
        {label(L('Recent changes'))}
        <div style={card}>
          {FAMILY_LOG.map((e, i) => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={e.icon} size={15} color={THEME.fg2} stroke={2.2} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}><span style={{ color: BRAND.primaryDark }}>{e.by}</span> · {L(e.what)}</div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 1 }}>{L(e.detail)}</div>
              </div>
              <span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, flexShrink: 0 }}>{L(e.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── The invite ───────────────────────────────────────────────────────
// The link is the primary path: the realistic case is that the other parent is at work, not
// standing next to you, and a QR would force a co-presence that buys no security — the link is
// single-use and expiring, and joining still needs the invitee's own phone verification.
// The QR and the code are the same invite, for when the two of them ARE together.
function ParentInvite({ ctx }) {
  const [sent, setSent] = React.useState(false);
  const [scanMode, setScanMode] = React.useState(false);   // link/code ▸ QR
  const code = FAMILY_INVITE.code;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 40, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Parents')} title={L('Invite a parent')} onBack={() => ctx.nav('p_family')} />

      <div style={{ padding: '8px 18px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>
          {L(scanMode
            ? 'If you are together, let them scan this from their own phone.'
            : 'Send this to the other parent. They install JoanX, open the link, and verify their own phone number.')}
        </p>

        {scanMode ? (
          /* QR — the in-person path. The SAME PairQR the child's connect screen shows, in the
             same white card, so a parent who has already seen one pairing screen recognises
             this one. (It used to be a lucide qr-code glyph on a black tile — a different
             object entirely, and it looked like a different app.) */
          <React.Fragment>
            <div style={{ ...card, alignSelf: 'center', width: 250, margin: '0 auto 0', padding: 22, display: 'flex', justifyContent: 'center' }}>
              <PairQR size={206} />
            </div>
            <div style={{ fontSize: 12.5, color: THEME.fg3, fontWeight: 700, marginTop: 14 }}>{L('Joins automatically once scanned.')}</div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            {/* the code, in the same grouped band the child pairing step uses */}
            <div style={{ ...card, padding: '22px 18px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
                <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(0, 3)}</span>
                <span className="game-font" style={{ fontSize: 36, fontWeight: 500, letterSpacing: 5, color: BRAND.primaryDark, paddingLeft: 5 }}>{code.slice(3)}</span>
              </div>
              <div style={{ fontSize: 12.5, color: THEME.fg3, fontWeight: 600 }}>{FAMILY_INVITE.link}</div>
            </div>

            <Button variant="primary" fullWidth icon={sent ? 'check' : 'share-2'} onClick={() => setSent(true)} style={{ ...brandBtn, marginBottom: 10 }}>
              {L(sent ? 'Invite sent' : 'Share the invite link')}
            </Button>
          </React.Fragment>
        )}

        <button onClick={() => setScanMode(s => !s)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '14px 0 0', padding: '9px 16px', background: '#fff', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primaryDark, fontSize: 13, fontWeight: 800 }}>
          <Icon name={scanMode ? 'link' : 'scan-line'} size={16} color={BRAND.primary} stroke={2.3} />
          {L(scanMode ? 'Send a link instead' : 'Show a QR instead')}
        </button>

        {/* the two facts that make this safe, said plainly rather than hidden in a policy */}
        <div style={{ marginTop: 22, textAlign: 'left', ...card, padding: 16, marginBottom: 18 }}>
          {[
            { ic: 'clock', t: `${L('Expires in')} ${FAMILY_INVITE.expiresHours}h · ${L('one use only')}` },
            { ic: 'smartphone', t: L('They verify their own phone number — never share your login') },
            { ic: 'eye', t: L('Your child is told when a new parent is added') },
          ].map((r, i) => (
            <div key={r.ic} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderTop: i ? `1px solid ${THEME.border}` : 'none', paddingTop: i ? 11 : 0, marginTop: i ? 4 : 0 }}>
              <Icon name={r.ic} size={15} color={THEME.fg2} stroke={2.2} />
              <span style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600, lineHeight: 1.4 }}>{r.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { ParentFamily, ParentInvite };
