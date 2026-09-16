// JoanX — parent app · Groups (list · create · detail · invite QR · join by scan)
//
// A group is a named circle of guardians watching one or more of the same children. It
// replaces the old single "family", which could only ever describe a couple: two seats, one
// link that added whoever opened it, no way to say "the aunt who does Tuesdays".
//
// Three rules shape every screen in this file, and they are the whole feature:
//   · a guardian runs or belongs to several groups (MAX_GROUPS), each with its own members,
//     its own children, and its own primary guardian per child
//   · the invite is one durable token, shown as a QR or spelled out as a typed code —
//     nothing expires on a timer
//   · scanning or entering the code files a REQUEST. An admin accepts or rejects it, and
//     either way the requester is told and the group's log records what happened
//
// Nothing here touches a child's phone: the device pairs to the account, so guardians can
// come and go without a re-scan — the one property of the old family model worth keeping.

import React from 'react';
import {
  CHILDREN, GROUP_ROLES, MAX_GROUPS,
  acceptRequest, createGroup, groupAdmin, groupById, groupByToken, groupCan, groupKids, groupMembers,
  isGroupAdmin, leaveGroup, myGroups, myRequestFor, myRole,
  pendingRequests, primaryGuardianFor, rejectRequest, removeMember, requestToJoin,
  scannableGroup, addKidToGroup, removeKidFromGroup,
} from '../core/data.jsx';
import { BottomSheet, Button, Icon, Input, PairQR, PhotoAvatar, THEME, avatarPalFor, screenBgFor } from '../core/primitives.jsx';
import { MascotChip } from '../core/characters.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { BRAND, brandBtn, ParentHead } from './shared.jsx';

const card = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 18, overflow: 'hidden' };
const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;
const rowLine = i => ({ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' });
// A group name is typed by a guardian, so it is data, not copy — L() is here only so the
// PROTOTYPE's seeded names ("Grandma Tuesdays") read in Korean too. Anything a real person
// types falls straight through unchanged, which is what L does with an unknown string.
const gname = g => L(g.name);

// A group's face: its icon on the same tinted avatar disc children and members already use,
// keyed off the group id so a group keeps its tint for life.
function GroupAvatar({ group, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: `var(--color-interactives-avatar-${avatarPalFor(group.id)}-default)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={group.icon || 'users'} size={size * .46} color={THEME.fg1} stroke={2.1} />
    </div>
  );
}

// A guardian — initial on a brand disc, the shape the account rows already use.
function MemberAvatar({ name, size = 44 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: BRAND.primaryLight, color: BRAND.primaryDark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * .38, fontWeight: 800, flexShrink: 0 }}>
      {(name || '?')[0]}
    </div>
  );
}

// A child — photo, else the default child illustration, else their buddy. Same chain the
// Children list draws, so one kid looks like the same kid on every screen.
function KidAvatar({ kid, size = 40 }) {
  const bg = `var(--color-interactives-avatar-${avatarPalFor(kid.id)}-default)`;
  return (
    <PhotoAvatar src={kid.photo} size={size} style={{ background: bg }} fallback={
      <PhotoAvatar src="/assets/avatars/avatar-child.png" size={size} style={{ background: bg }}
        fallback={<MascotChip species={kid.avatar} color={kid.color} size={size} bg={bg} />} />} />
  );
}

// Member is the default — it needs no pill. Only the exception, admin, is worth calling out.
function RoleBadge({ role }) {
  if (role !== 'admin') return null;
  return (
    <span style={{ fontSize: 11, fontWeight: 800, padding: '4px 9px', borderRadius: 999, background: BRAND.primaryLight, color: BRAND.primaryDark, flexShrink: 0 }}>
      {L(GROUP_ROLES.admin?.label || 'Admin')}
    </span>
  );
}

// A confirmation pill, pinned to the frame — the same one Rules & settings uses after a save.
function Toast({ text }) {
  if (!text) return null;
  return (
    <div className="jx-fade" style={{ position: 'fixed', bottom: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 60, pointerEvents: 'none' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(43,41,38,.92)', color: '#fff', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 999 }}>
        <Icon name="check" size={15} color="#fff" stroke={2.8} />{text}
      </div>
    </div>
  );
}

const useToast = () => {
  const [toast, setToast] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => () => clearTimeout(ref.current), []);
  return [toast, (m) => { setToast(m); clearTimeout(ref.current); ref.current = setTimeout(() => setToast(null), 1800); }];
};

// ── 1 · Group list — every circle this guardian is in ────────────────
function ParentGroups({ ctx }) {
  const ko = getLang() === 'ko';
  // `empty` is the first-run demo state, gated on the flag rather than the data, so Tweaks
  // can preview it against the seeded prototype (same as the Children list).
  const groups = ctx.demo?.empty ? [] : myGroups();
  const atCap = groups.length >= MAX_GROUPS;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Parent app')} title={L('Groups')} onBack={() => ctx.nav('p_account')}
        right={
          <button onClick={() => !atCap && ctx.nav('p_group_create')} disabled={atCap} aria-disabled={atCap} title={atCap ? L('Group limit reached') : undefined}
            style={{ height: 36, padding: '0 13px 0 10px', borderRadius: 999, background: BRAND.primary, border: 'none', boxShadow: BRAND.shadowPrimary, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: atCap ? 'default' : 'pointer', opacity: atCap ? .4 : 1, fontFamily: 'inherit' }}>
            <Icon name="plus" size={16} color="#fff" stroke={2.7} /><span style={{ color: '#fff', fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap' }}>{L('New group')}</span>
          </button>
        } />

      <div style={{ padding: '8px 16px 0' }}>
        {/* the one sentence that explains the model, in the place the family screen said its own */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <Icon name="users" size={18} color={BRAND.primary} stroke={2.2} />
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>
              {L('A group is the people who watch the same child with you. Everyone in a group sees the same reports — and nobody joins until an admin says yes.')}
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px 24px', background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, marginBottom: 16 }}>
            <div style={{ width: 76, height: 76, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name="users" size={34} color={BRAND.primary} stroke={2} />
            </div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L('No groups yet')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 6, maxWidth: 250 }}>
              {L('Start one for your own household, or scan the QR of a group someone else already runs.')}
            </div>
          </div>
        ) : (
          <>
            {label(`${L('Your groups')} · ${groups.length}/${MAX_GROUPS}`)}
            {groups.map(g => {
              const members = groupMembers(g.id);
              const kids = groupKids(g.id);
              const role = myRole(g.id);
              const waiting = role === 'admin' ? pendingRequests(g.id).length : 0;
              return (
                <div key={g.id} onClick={() => ctx.nav('p_group_detail', { groupId: g.id })} style={{ background: '#fff', borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 12, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gname(g)}</span>
                        <RoleBadge role={role} />
                      </div>
                      <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>
                        {ko ? `보호자 ${members.length}명 · 자녀 ${kids.length}명` : `${members.length} ${members.length === 1 ? 'guardian' : 'guardians'} · ${kids.length} ${kids.length === 1 ? 'child' : 'children'}`}
                      </div>
                    </div>
                    <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
                  </div>

                  {/* who is actually in it — the children's faces, the reason the group exists */}
                  {kids.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 13 }}>
                      <div style={{ display: 'flex' }}>
                        {kids.slice(0, 4).map((k, i) => (
                          <span key={k.id} style={{ marginLeft: i ? -9 : 0, borderRadius: 999, boxShadow: '0 0 0 2px #fff', display: 'inline-flex' }}><KidAvatar kid={k} size={28} /></span>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 600 }}>{kids.map(k => k.name).join(', ')}</span>
                    </div>
                  )}

                  {/* an admin with people waiting is told here, not two taps deeper */}
                  {waiting > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10, padding: '9px 12px', borderRadius: 12, background: THEME.warningLight }}>
                      <Icon name="user-plus" size={15} color={THEME.warning} stroke={2.3} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: THEME.warning }}>
                        {ko ? `가입 요청 ${waiting}건 대기 중` : `${waiting} ${waiting === 1 ? 'request is' : 'requests are'} waiting for you`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}

        {atCap && <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center', margin: '2px 0 14px' }}>
          {ko ? `한 계정당 최대 ${MAX_GROUPS}개 그룹까지 참여할 수 있어요.` : `You can be in up to ${MAX_GROUPS} groups at once.`}
        </div>}

        {/* the other way in — someone else's group, joined by scanning their QR */}
        <div style={card}>
          <div onClick={() => ctx.nav('p_group_join')} style={{ ...rowLine(0), cursor: 'pointer' }}>
            <Icon name="scan-line" size={18} color={THEME.fg2} stroke={2.2} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{L('Join a group')}</div>
              <div style={{ fontSize: 11.5, color: THEME.fg2, marginTop: 1 }}>{L('Scan the QR code from their JoanX app')}</div>
            </div>
            <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 2 · Create a group — name it, say which children it covers ───────
function ParentGroupCreate({ ctx }) {
  const ko = getLang() === 'ko';
  const [name, setName] = React.useState('');
  const [picked, setPicked] = React.useState(() => (CHILDREN[0] ? [CHILDREN[0].id] : []));
  const kids = ctx.demo?.empty ? [] : CHILDREN;
  const ready = name.trim().length > 0;
  const toggle = id => setPicked(p => (p.includes(id) ? p.filter(x => x !== id) : [...p, id]));

  // createGroup refuses past MAX_GROUPS. The list's CTA is already disabled at the cap, so
  // this only fires if the cap was reached in another tab — land them back on the list
  // rather than leaving a button that does nothing.
  const submit = () => {
    const g = createGroup({ name, kidIds: picked });
    ctx.nav(g ? 'p_group_detail' : 'p_groups', g ? { groupId: g.id, created: true } : {});
  };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: screenBgFor(BRAND.primary) }}>
      <div style={{ paddingTop: 50 }}><ParentHead sub={L('Groups')} title={L('New group')} onBack={() => ctx.nav('p_groups')} /></div>

      <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
        <div style={{ ...card, padding: 16 }}>
          <Input label={L('Group name')} value={name} onChange={e => setName(e.target.value)} placeholder={ko ? '예: 우리집, 화요일 할머니' : 'e.g. Home, Grandma Tuesdays'} accent={BRAND.ink} />
          <div style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600, margin: '10px 2px 0' }}>
            {L('Everyone who joins sees this name, so make it one they will recognise.')}
          </div>
        </div>

        {/* No children on the account yet — a group with nobody to watch is not worth
            creating, so the honest next step is pairing a child first. */}
        {kids.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '28px 24px', background: '#fff', borderRadius: 20, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
            <div style={{ width: 66, height: 66, borderRadius: 999, background: BRAND.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Icon name="user-plus" size={30} color={BRAND.primary} stroke={2} />
            </div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{L('Add a child first')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '6px 0 16px', maxWidth: 250 }}>
              {L('A group watches over a child. Connect one, then come back and build the circle around them.')}
            </div>
            <Button variant="primary" fullWidth icon="user-plus" onClick={() => ctx.nav('p_addchild', { direct: true })} style={brandBtn}>{L('Add a child')}</Button>
          </div>
        ) : (
          <>
            {label(`${L('Children in this group')} · ${picked.length}/${kids.length}`)}
            <div style={card}>
              {kids.map((k, i) => {
                const on = picked.includes(k.id);
                return (
                  <div key={k.id} onClick={() => toggle(k.id)} style={{ ...rowLine(i), cursor: 'pointer' }}>
                    <KidAvatar kid={k} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>{k.name}</div>
                      <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{ko ? `만 ${k.age}세` : `${L('Age')} ${k.age}`} · {k.device}</div>
                    </div>
                    <span style={{ width: 22, height: 22, borderRadius: 999, flexShrink: 0, border: `2px solid ${on ? BRAND.primary : THEME.border}`, background: on ? BRAND.primary : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {on && <Icon name="check" size={13} color="#fff" stroke={3} />}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* rule 4, said once, where the decision is actually being made */}
            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '0 4px 18px' }}>
              <Icon name="info" size={14} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>
                {L('You start as the group’s admin, and as the main guardian for each child you add. Both can change later.')}
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom) + 20px)' }}>
        <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!ready} onClick={ready ? submit : undefined}>{L('Create group')}</Button>
      </div>
    </div>
  );
}

// ── 3 · Group detail — members, children, requests, log ──────────────
function ParentGroupDetail({ ctx }) {
  const ko = getLang() === 'ko';
  const [, bump] = React.useReducer(x => x + 1, 0);
  const [toast, say] = useToast();
  const [confirmLeave, setConfirmLeave] = React.useState(false);
  const [removing, setRemoving] = React.useState(null);      // guardian pending a remove confirmation
  const [addingKid, setAddingKid] = React.useState(false);   // picking a child to add to this group
  const [removingKid, setRemovingKid] = React.useState(null); // child pending a remove confirmation

  const group = groupById(ctx.params?.groupId) || myGroups()[0];
  React.useEffect(() => { if (ctx.params?.created) say(L('Group created')); }, []);
  if (!group) { ctx.nav('p_groups'); return null; }

  const admin = isGroupAdmin(group.id);
  const members = groupMembers(group.id);
  const kids = groupKids(group.id);
  const requests = admin ? pendingRequests(group.id) : [];
  const addableKids = CHILDREN.filter(c => !kids.some(k => k.id === c.id));

  const decide = (req, yes) => {
    (yes ? acceptRequest : rejectRequest)(req.id);
    say(yes
      ? (ko ? `${req.guardian.name}님이 그룹에 참여했어요` : `${req.guardian.name} joined the group`)
      : (ko ? `${req.guardian.name}님에게 알렸어요` : `We let ${req.guardian.name} know`));
    bump();
  };
  const drop = (m) => { removeMember(group.id, m.id); say(ko ? `${m.name}님을 내보냈어요` : `${m.name} was removed`); bump(); };
  const addKid = (kid) => { addKidToGroup(group.id, kid.id); say(ko ? `${kid.name}님을 추가했어요` : `${kid.name} was added`); setAddingKid(false); bump(); };
  const dropKid = (kid) => { removeKidFromGroup(group.id, kid.id); say(ko ? `${kid.name}님을 그룹에서 제외했어요` : `${kid.name} was removed from the group`); setRemovingKid(null); bump(); };
  const leave = () => { leaveGroup(group.id); setConfirmLeave(false); ctx.nav('p_groups'); };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={L('Groups')} title={gname(group)} onBack={() => ctx.nav('p_groups')} />

      <div style={{ padding: '8px 16px 0' }}>
        {/* the group itself — its face, its size, and the way in */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 17, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{gname(group)}</span>
                {myRole(group.id) && <RoleBadge role={myRole(group.id)} />}
              </div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 2 }}>
                {ko ? `보호자 ${members.length}명 · 자녀 ${kids.length}명` : `${members.length} ${members.length === 1 ? 'guardian' : 'guardians'} · ${kids.length} ${kids.length === 1 ? 'child' : 'children'}`}
              </div>
            </div>
          </div>
          {groupCan(myRole(group.id), 'invite') && (
            <Button variant="primary" fullWidth icon="qr-code" onClick={() => ctx.nav('p_group_invite', { groupId: group.id })} style={{ ...brandBtn, marginTop: 14 }}>{L('Invite to group')}</Button>
          )}
        </div>

        {/* Join requests — admin only, and first on the screen: somebody is waiting on a
            decision only this person can make. A member never sees this section at all. */}
        {admin && requests.length > 0 && (
          <>
            {label(`${L('Waiting for approval')} · ${requests.length}`)}
            <div style={card}>
              {requests.map((r, i) => (
                <div key={r.id} style={{ padding: '13px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <MemberAvatar name={r.guardian.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>{r.guardian.name}</div>
                      <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{r.guardian.email} · {L(r.requestedAt)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 9, marginTop: 11 }}>
                    <button onClick={() => decide(r, true)} style={{ flex: 1, padding: '11px', background: BRAND.primary, color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}>{L('Accept')}</button>
                    <button onClick={() => decide(r, false)} style={{ flex: 1, padding: '11px', background: '#fff', color: THEME.fg2, border: `1.5px solid ${THEME.border}`, borderRadius: 12, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer' }}>{L('Reject')}</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Members. */}
        {label(`${L('Guardians')} · ${members.length}`)}
        <div style={card}>
          {members.map((m, i) => (
            <div key={m.id} style={rowLine(i)}>
              <MemberAvatar name={m.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>
                  {L(m.relation)} · {m.name}
                  {m.me && <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3 }}> · {L('you')}</span>}
                </div>
                <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{m.email}</div>
              </div>
              <RoleBadge role={m.role} />
              {admin && !m.me && (
                <button onClick={() => setRemoving(m)} aria-label={L('Remove')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                  <Icon name="x" size={16} color={THEME.fg3} stroke={2.4} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Children, each with the one guardian answerable for them HERE — the same child can
            have a different main guardian in a different group, and that is the point. An
            admin also gets the way IN: a group is worth nothing without at least one child
            in it, so the add row lives here rather than behind another screen. */}
        {(kids.length > 0 || admin) && (
          <>
            {label(`${L('Children')} · ${kids.length}`)}
            <div style={card}>
              {kids.map((k, i) => {
                const p = primaryGuardianFor(group.id, k.id);
                return (
                  <div key={k.id} style={rowLine(i)}>
                    <KidAvatar kid={k} size={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800 }}>{k.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                        <Icon name="user-check" size={12} color={BRAND.primary} stroke={2.4} />
                        <span style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600 }}>{p ? `${p.name} · ${L('main guardian')}` : L('No main guardian yet')}</span>
                      </div>
                    </div>
                    {admin && (
                      <button onClick={() => setRemovingKid(k)} aria-label={L('Remove')} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}>
                        <Icon name="x" size={16} color={THEME.fg3} stroke={2.4} />
                      </button>
                    )}
                  </div>
                );
              })}
              {admin && (
                <div onClick={() => setAddingKid(true)} style={{ ...rowLine(kids.length), cursor: 'pointer' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon name="plus" size={18} color={THEME.fg2} stroke={2.4} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14.5, fontWeight: 800, color: THEME.fg2 }}>{L('Add a child')}</div>
                </div>
              )}
            </div>
          </>
        )}

        <button onClick={() => setConfirmLeave(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', marginTop: 4, padding: '14px', background: '#fff', color: THEME.danger, border: `1.5px solid ${THEME.dangerLight || 'rgba(214,69,69,.25)'}`, borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer', boxShadow: THEME.shadowCard }}>
          <Icon name="log-out" size={17} color={THEME.danger} stroke={2.3} />{L('Leave group')}
        </button>
      </div>

      {/* Add a child — every one of the account's paired children not already in THIS
          group is eligible; adding makes the tapping admin their primary guardian here. */}
      {addingKid && (
        <BottomSheet title={L('Add a child')} onClose={() => setAddingKid(false)}>
          {addableKids.length === 0 ? (
            <div style={{ padding: '8px 4px 4px', fontSize: 13, color: THEME.fg2, lineHeight: 1.5 }}>
              {L('All your children are already in this group.')}
            </div>
          ) : addableKids.map((k, i) => (
            <div key={k.id} onClick={() => addKid(k)} style={{ ...rowLine(i), cursor: 'pointer' }}>
              <KidAvatar kid={k} size={40} />
              <div style={{ flex: 1, fontSize: 14.5, fontWeight: 800 }}>{k.name}</div>
              <Icon name="plus" size={18} color={BRAND.primary} stroke={2.4} />
            </div>
          ))}
        </BottomSheet>
      )}

      {/* removing a guardian — destructive to their access, so it asks first, same shape
          as leaving the group below */}
      {removing && (
        <div onClick={() => setRemoving(null)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(20,18,17,.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 20px 26px' }}>
            <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 18px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.dangerLight || 'rgba(214,69,69,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="user-x" size={26} color={THEME.danger} stroke={2.2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.fg1, textAlign: 'center', margin: '0 0 8px' }}>{ko ? `${removing.name}님을 내보낼까요?` : `Remove ${removing.name}?`}</h2>
            <p style={{ fontSize: 13.5, color: THEME.fg2, textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px' }}>
              {ko ? `${removing.name}님은 더 이상 이 그룹의 자녀 리포트를 볼 수 없어요. 다시 초대할 수 있어요.` : `${removing.name} will stop seeing this group’s children. You can invite them back later.`}
            </p>
            <button onClick={() => { drop(removing); setRemoving(null); }} style={{ width: '100%', padding: '15px', background: THEME.danger, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Remove')}</button>
            <button onClick={() => setRemoving(null)} style={{ width: '100%', marginTop: 10, padding: '15px', background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Cancel')}</button>
          </div>
        </div>
      )}

      {/* removing a child — the group stops covering them, but nothing on their device
          changes; the same shape as removing a guardian */}
      {removingKid && (
        <div onClick={() => setRemovingKid(null)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(20,18,17,.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 20px 26px' }}>
            <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 18px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.dangerLight || 'rgba(214,69,69,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="user-x" size={26} color={THEME.danger} stroke={2.2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.fg1, textAlign: 'center', margin: '0 0 8px' }}>{ko ? `${removingKid.name}님을 그룹에서 제외할까요?` : `Remove ${removingKid.name}?`}</h2>
            <p style={{ fontSize: 13.5, color: THEME.fg2, textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px' }}>
              {ko ? `${gname(group)} 그룹의 누구도 더 이상 ${removingKid.name}님의 리포트를 볼 수 없어요. 언제든 다시 추가할 수 있어요.` : `Nobody in ${gname(group)} will see ${removingKid.name}’s reports any more. You can add them back any time.`}
            </p>
            <button onClick={() => dropKid(removingKid)} style={{ width: '100%', padding: '15px', background: THEME.danger, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Remove')}</button>
            <button onClick={() => setRemovingKid(null)} style={{ width: '100%', marginTop: 10, padding: '15px', background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Cancel')}</button>
          </div>
        </div>
      )}

      {/* leaving — the one destructive act a member can perform on themselves */}
      {confirmLeave && (
        <div onClick={() => setConfirmLeave(false)} style={{ position: 'absolute', inset: 0, zIndex: 60, background: 'rgba(20,18,17,.42)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '24px 24px 0 0', padding: '10px 20px 26px' }}>
            <div style={{ width: 38, height: 4, borderRadius: 999, background: THEME.border, margin: '0 auto 18px' }} />
            <div style={{ width: 56, height: 56, borderRadius: 999, background: THEME.dangerLight || 'rgba(214,69,69,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Icon name="log-out" size={26} color={THEME.danger} stroke={2.2} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: THEME.fg1, textAlign: 'center', margin: '0 0 8px' }}>{ko ? `${gname(group)}에서 나갈까요?` : `Leave ${gname(group)}?`}</h2>
            <p style={{ fontSize: 13.5, color: THEME.fg2, textAlign: 'center', lineHeight: 1.5, margin: '0 0 22px' }}>
              {admin && members.length > 1
                ? L('You will stop seeing this group’s children, and another guardian here becomes its admin. You can be invited back.')
                : L('You will stop seeing this group’s children. You can be invited back with a new QR code.')}
            </p>
            <button onClick={leave} style={{ width: '100%', padding: '15px', background: THEME.danger, color: '#fff', border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Leave group')}</button>
            <button onClick={() => setConfirmLeave(false)} style={{ width: '100%', marginTop: 10, padding: '15px', background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>{L('Cancel')}</button>
          </div>
        </div>
      )}

      <Toast text={toast} />
    </div>
  );
}

// ── 4 · Invite — the group's QR ──────────────────────────────────────
// The QR IS the invite: there is no code to read out and nothing to expire. It stays
// valid because the safety is on the other end — scanning only asks, an admin answers.
function ParentGroupInvite({ ctx }) {
  const ko = getLang() === 'ko';
  const [shared, setShared] = React.useState(false);
  const [showCode, setShowCode] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const group = groupById(ctx.params?.groupId) || myGroups()[0];
  if (!group) { ctx.nav('p_groups'); return null; }

  const kids = groupKids(group.id);
  const toggleMode = () => { setShowCode(!showCode); setShared(false); setCopied(false); };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 40, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={gname(group)} title={L('Invite to group')} onBack={() => ctx.nav('p_group_detail', { groupId: group.id })} />

      <div style={{ padding: '8px 18px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 22px' }}>
          {L(showCode ? 'Have them open JoanX, tap Join a group, and enter this code.' : 'Have them open JoanX, tap Join a group, and point their camera at this.')}
        </p>

        {/* the QR, in the same grouped band the pairing step uses for its code — or the
            same durable token, spelled out, for when a picture can't be scanned (a text
            message, a note left on the fridge) */}
        {showCode ? (
          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: BRAND.primaryLight, borderRadius: 16, padding: '20px 12px' }}>
              <span className="game-font" style={{ fontSize: 22, fontWeight: 500, letterSpacing: 2.5, color: BRAND.primaryDark }}>{group.token}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, gap: 10 }}>
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{gname(group)}</div>
                {kids.length > 0 && (
                  <div style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>
                    {ko ? `${kids.map(k => k.name).join(', ')} · 자녀 ${kids.length}명` : `${kids.map(k => k.name).join(', ')} · ${kids.length} ${kids.length === 1 ? 'child' : 'children'}`}
                  </div>
                )}
              </div>
              <button onClick={() => setCopied(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 999, background: copied ? THEME.successLight : '#fff', color: copied ? THEME.success : BRAND.primaryDark, border: `1.5px solid ${copied ? 'transparent' : THEME.border}`, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}>
                <Icon name={copied ? 'check' : 'copy'} size={15} color={copied ? THEME.success : BRAND.primary} stroke={2.6} />{L(copied ? 'Copied!' : 'Copy')}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: '22px 18px' }}>
            <div style={{ display: 'inline-flex', padding: 14, borderRadius: 16, background: '#fff' }}>
              <PairQR size={186} color={BRAND.primaryDark} />
            </div>
            <div style={{ marginTop: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{gname(group)}</span>
            </div>
            {kids.length > 0 && (
              <div style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600, marginTop: 4 }}>
                {ko ? `${kids.map(k => k.name).join(', ')} · 자녀 ${kids.length}명` : `${kids.map(k => k.name).join(', ')} · ${kids.length} ${kids.length === 1 ? 'child' : 'children'}`}
              </div>
            )}
          </div>
        )}

        {!showCode && (
          <Button variant="primary" fullWidth icon={shared ? 'check' : undefined} onClick={() => setShared(true)} style={{ ...brandBtn, marginTop: 16, marginBottom: 10 }}>
            {L(shared ? 'QR code shared' : 'Share the QR code')}
          </Button>
        )}
        <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, lineHeight: 1.45, margin: showCode ? '14px 10px 0' : '0 10px' }}>
          {L(showCode ? 'Paste the code anywhere text works — a group chat, a text message, a note.' : 'Sharing sends the QR as an image — they can scan it from their own screen if you are not together.')}
        </div>

        {/* toggle between the QR and the same token spelled out as text */}
        <button onClick={toggleMode} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '14px 0 18px', padding: '9px 16px', background: '#fff', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primaryDark, fontSize: 13, fontWeight: 800 }}>
          <Icon name={showCode ? 'qr-code' : 'share-2'} size={16} color={BRAND.primary} stroke={2.3} />{L(showCode ? 'Share the QR instead' : 'Share a code instead')}
        </button>
      </div>
    </div>
  );
}

// A group code isn't a random 6-digit OTP — it's shaped like a serial key: "JX-G1-7C1F9A",
// three chunks of fixed length. So the entry field is boxed per chunk, not per digit, the
// same way a product-key field is — and it reads exactly like the code the admin's Invite
// screen already shows, not like a generic text input.
const CODE_SEGMENTS = [2, 2, 6];
function GroupCodeInput({ value, onChange, error }) {
  const refs = React.useRef([null, null, null]);
  const segs = React.useMemo(() => {
    const clean = value.toUpperCase();
    let i = 0;
    return CODE_SEGMENTS.map(len => { const s = clean.slice(i, i + len); i += len; return s; });
  }, [value]);

  const setSeg = (idx, raw) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_SEGMENTS[idx]);
    const next = [...segs]; next[idx] = clean;
    onChange(next.join(''));
    if (clean.length === CODE_SEGMENTS[idx] && idx < CODE_SEGMENTS.length - 1) refs.current[idx + 1]?.focus();
  };
  const onKeyDown = (idx, e) => { if (e.key === 'Backspace' && !segs[idx] && idx > 0) refs.current[idx - 1]?.focus(); };

  const boxStyle = w => ({
    width: w, height: 56, borderRadius: 16, border: `1.5px solid ${error ? THEME.danger : THEME.border}`,
    background: error ? THEME.dangerLight : '#fff', color: error ? THEME.danger : THEME.fg1,
    textAlign: 'center', fontFamily: 'inherit', fontSize: 20, fontWeight: 500, letterSpacing: 2,
    textTransform: 'uppercase', outline: 'none', padding: 0,
  });
  const placeholders = ['JX', 'G1', '7C1F9A'];
  const widths = [54, 54, 146];

  return (
    <div>
      <div className={error ? 'jx-shake' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {CODE_SEGMENTS.map((len, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span style={{ fontSize: 18, fontWeight: 800, color: THEME.fg3, flexShrink: 0 }}>–</span>}
            <input ref={el => { refs.current[idx] = el; }} value={segs[idx]} onChange={e => setSeg(idx, e.target.value)}
              onKeyDown={e => onKeyDown(idx, e)} inputMode="text" autoCapitalize="characters" autoComplete="off"
              placeholder={placeholders[idx]} className="game-font" style={boxStyle(widths[idx])} />
          </React.Fragment>
        ))}
      </div>
      {error && <div style={{ fontSize: 12.5, color: THEME.danger, fontWeight: 700, marginTop: 10 }}>{L('We couldn’t find a group with that code.')}</div>}
    </div>
  );
}

// ── 5 · Join a group — the other guardian's side ─────────────────────
// scan → what you are about to join → request → waiting → accepted / declined.
// The viewfinder and the waiting card are both tap-to-advance in the prototype, the same
// way the child-pairing scanner is: there is no second phone here to do it for real.
function ParentGroupJoin({ ctx }) {
  const ko = getLang() === 'ko';
  const [stage, setStage] = React.useState(ctx.params?.stage || 'scan');   // scan · code · preview · pending · accepted · rejected
  const [group, setGroup] = React.useState(() => scannableGroup());
  const [codeInput, setCodeInput] = React.useState('');
  const [codeErr, setCodeErr] = React.useState(false);
  const [toast, say] = useToast();

  const admin = group ? groupAdmin(group.id) : null;
  const kids = group ? groupKids(group.id) : [];
  const members = group ? groupMembers(group.id) : [];
  const back = () => ctx.nav('p_account');

  const onScan = () => { const g = scannableGroup(); setGroup(g); setStage(g ? 'preview' : 'scan'); };
  // looks the typed code up for real, and — same as the scanner — falls back to the next
  // joinable group so the prototype has something to show without a second phone
  const joinByCode = () => {
    if (codeInput.length < CODE_SEGMENTS.reduce((a, b) => a + b, 0)) { setCodeErr(true); return; }
    let i = 0;
    const token = CODE_SEGMENTS.map(len => { const s = codeInput.slice(i, i + len); i += len; return s; }).join('-');
    const g = groupByToken(token) || scannableGroup();
    if (g) { setGroup(g); setStage('preview'); setCodeErr(false); } else setCodeErr(true);
  };
  // A real request just needs to be filed and confirmed — the dedicated waiting screen
  // is still here for the 'pending' Tweaks chip, but the normal tap-through no longer
  // parks the requester on it.
  const send = () => { requestToJoin(group.id); say(L('Request sent!')); setTimeout(back, 900); };
  // Standing in for the admin's phone: the same acceptRequest their Accept button calls, so
  // the membership, the role and the group's log all land exactly as they would for real.
  const approve = () => { const r = myRequestFor(group.id) || requestToJoin(group.id); if (r) acceptRequest(r.id); setStage('accepted'); };
  const enter = () => ctx.nav('p_group_detail', { groupId: group.id });

  const head = { scan: 'Join a group', code: 'Enter a code', preview: 'Join a group', pending: 'Waiting for approval', accepted: 'You are in', rejected: 'Not this time' }[stage];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: screenBgFor(BRAND.primary) }}>
      <div style={{ paddingTop: 50 }}><ParentHead sub={L('Groups')} title={L(head)} onBack={back} /></div>

      {/* 1 · scan — the camera, and a way through for people who were given a typed code */}
      {stage === 'scan' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p style={{ alignSelf: 'stretch', fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>
              {L('Point at the QR code in the other guardian’s JoanX app. They will get a request to approve.')}
            </p>
            <div onClick={onScan} style={{ width: '100%', maxWidth: 300, aspectRatio: '0.92', borderRadius: 24, background: '#17191d', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 70px rgba(0,0,0,.55)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(78% 62% at 50% 44%, rgba(255,255,255,.06) 0%, rgba(255,255,255,0) 70%)' }} />
              <div style={{ position: 'absolute', top: '24%', left: '22%', right: '22%', bottom: '24%' }}>
                {[['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].map(([v, h], i) => (
                  <div key={i} style={{ position: 'absolute', [v]: 0, [h]: 0, width: 24, height: 24, [`border${v[0].toUpperCase() + v.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${h[0].toUpperCase() + h.slice(1)}`]: '3px solid rgba(255,255,255,.9)', [`border${v[0].toUpperCase() + v.slice(1)}${h[0].toUpperCase() + h.slice(1)}Radius`]: 9 }} />
                ))}
              </div>
              <span style={{ position: 'absolute', bottom: 22, left: 0, right: 0, textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,.7)' }}>{L('Point at the group’s QR code')}</span>
            </div>

            {/* the fallback: no camera lined up, but they were read or sent a typed code */}
            <button onClick={() => setStage('code')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, margin: '20px 0 0', padding: '9px 16px', background: '#fff', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: BRAND.primaryDark, fontSize: 13, fontWeight: 800 }}>
              <Icon name="keyboard" size={16} color={BRAND.primary} stroke={2.3} />{L('Enter a code instead')}
            </button>
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)', textAlign: 'center' }}>
            <span style={{ fontSize: 12.5, color: THEME.fg3, fontWeight: 700 }}>{L('Nobody is added by scanning — an admin has to accept.')}</span>
          </div>
        </>
      )}

      {/* 1b · code — typed entry for a guardian who was given the code instead of the QR */}
      {stage === 'code' && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 0' }}>
            <p style={{ fontSize: 14, color: THEME.fg2, lineHeight: 1.5, margin: '0 0 20px' }}>
              {L('Enter the code the other guardian gave you. They will get a request to approve.')}
            </p>
            {label(L('Group code'))}
            <GroupCodeInput value={codeInput} onChange={v => { setCodeInput(v); setCodeErr(false); }} error={codeErr} />
          </div>
          <div style={{ padding: '12px 24px calc(env(safe-area-inset-bottom) + 22px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={joinByCode}>{L('Continue')}</Button>
            <button onClick={() => setStage('scan')} style={{ width: '100%', marginTop: 8, padding: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="scan-line" size={16} color={THEME.fg2} stroke={2.3} />{L('Scan the QR instead')}
            </button>
          </div>
        </>
      )}

      {/* 2 · preview — what this group is, before asking to be in it */}
      {stage === 'preview' && group && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
            <div style={{ ...card, padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{gname(group)}</div>
              <div style={{ fontSize: 12.5, color: THEME.fg2, marginTop: 3 }}>
                {ko ? `${admin?.name} 관리자 · 보호자 ${members.length}명` : `${L('Admin')} · ${admin?.name} · ${members.length} ${members.length === 1 ? 'guardian' : 'guardians'}`}
              </div>
            </div>

            {kids.length > 0 && (
              <>
                {label(L('Children you would see'))}
                <div style={card}>
                  {kids.map((k, i) => {
                    const p = primaryGuardianFor(group.id, k.id);
                    return (
                      <div key={k.id} style={rowLine(i)}>
                        <KidAvatar kid={k} size={40} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14.5, fontWeight: 800 }}>{k.name}</div>
                          <div style={{ fontSize: 11.5, color: THEME.fg3, marginTop: 2 }}>{p ? `${p.name} · ${L('main guardian')}` : L('No main guardian yet')}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', margin: '0 4px 18px' }}>
              <Icon name="info" size={14} color={THEME.fg3} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11.5, color: THEME.fg3, lineHeight: 1.45, fontWeight: 600 }}>
                {ko ? `${admin?.name}님이 수락해야 이 자녀들의 리포트를 볼 수 있어요.` : `You will see these children’s reports only once ${admin?.name} accepts.`}
              </span>
            </div>
          </div>
          <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom) + 20px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={send}>{L('Request to join')}</Button>
            <button onClick={() => setStage('scan')} style={{ width: '100%', marginTop: 8, padding: '13px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="scan-line" size={16} color={THEME.fg2} stroke={2.3} />{L('Scan a different code')}
            </button>
          </div>
        </>
      )}

      {/* 3 · waiting — the request is filed and the decision is somebody else's */}
      {stage === 'pending' && group && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
            {/* tapping the card stands in for the admin's phone, which the prototype has not got */}
            <div onClick={approve} style={{ ...card, padding: 20, textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                {[0, 0.8].map((d, i) => (
                  <div key={i} className="jx-ring" style={{ position: 'absolute', top: '50%', left: '50%', width: 86, height: 86, marginTop: -43, marginLeft: -43, borderRadius: 999, border: `2px solid ${BRAND.primary}`, animationDelay: `${d}s` }} />
                ))}
                <GroupAvatar group={group} size={62} />
              </div>
              <div style={{ fontSize: 17, fontWeight: 800 }}>{ko ? `${admin?.name}님의 수락을 기다리는 중` : `Waiting for ${admin?.name} to approve`}</div>
              <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 6 }}>
                {ko ? `${gname(group)} 그룹에 참여 요청을 보냈어요. 수락되면 알려드릴게요.` : `Your request to join ${gname(group)} was sent. We will let you know as soon as they answer.`}
              </div>
            </div>

            <div style={card}>
              <div style={rowLine(0)}>
                <Icon name="clock" size={17} color={THEME.fg2} stroke={2.2} />
                <span style={{ flex: 1, fontSize: 13, color: THEME.fg2, fontWeight: 600, lineHeight: 1.4 }}>{L('Most admins answer within a day.')}</span>
              </div>
              <div style={rowLine(1)}>
                <Icon name="shield-check" size={17} color={THEME.fg2} stroke={2.2} />
                <span style={{ flex: 1, fontSize: 13, color: THEME.fg2, fontWeight: 600, lineHeight: 1.4 }}>{L('Until then you cannot see anything about their children.')}</span>
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom) + 20px)' }}>
            <Button variant="outline" size="lg" fullWidth onClick={back}>{L('Done')}</Button>
          </div>
        </>
      )}

      {/* 4 · accepted */}
      {stage === 'accepted' && group && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
            <div style={{ ...card, padding: 22, textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <GroupAvatar group={group} size={66} />
                <span style={{ position: 'absolute', right: -4, bottom: -2, width: 26, height: 26, borderRadius: 999, background: THEME.success, border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={13} color="#fff" stroke={3.2} />
                </span>
              </div>
              <div style={{ fontSize: 19, fontWeight: 800 }}>{ko ? `${gname(group)} 그룹에 참여했어요` : `You joined ${gname(group)}`}</div>
              <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 6 }}>
                {ko ? `${admin?.name}님이 요청을 수락했어요. 이제 이 그룹의 자녀 리포트를 볼 수 있어요.` : `${admin?.name} accepted your request. Their children's reports are yours to see now.`}
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom) + 20px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={enter}>{L('Open the group')}</Button>
          </div>
        </>
      )}

      {/* 5 · rejected — said kindly, and with the two things they can actually do next */}
      {stage === 'rejected' && group && (
        <>
          <div className="no-sb" style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 0' }}>
            <div style={{ ...card, padding: 22, textAlign: 'center' }}>
              <div style={{ width: 62, height: 62, borderRadius: 999, background: THEME.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Icon name="user-x" size={28} color={THEME.fg2} stroke={2.1} />
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{ko ? `${gname(group)} 그룹 참여가 수락되지 않았어요` : `${gname(group)} didn’t accept this time`}</div>
              <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, marginTop: 6 }}>
                {ko ? `${admin?.name}님이 요청을 수락하지 않았어요. 잘못 스캔했을 수도 있으니 확인해 보세요.` : `${admin?.name} didn’t accept your request. If you scanned the wrong code, try theirs again.`}
              </div>
            </div>
          </div>
          <div style={{ padding: '12px 20px calc(env(safe-area-inset-bottom) + 20px)' }}>
            <Button variant="primary" size="lg" fullWidth style={brandBtn} onClick={() => setStage('preview')}>{L('Ask again')}</Button>
            <button onClick={() => setStage('scan')} style={{ width: '100%', marginTop: 8, padding: '13px', background: 'transparent', color: THEME.fg2, border: 'none', borderRadius: 14, fontFamily: 'inherit', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>{L('Scan a different code')}</button>
          </div>
        </>
      )}

      {/* every group is already scanned or requested — only reachable in the prototype */}
      {!group && stage !== 'scan' && (
        <div style={{ flex: 1, padding: '20px 24px', textAlign: 'center', fontSize: 13, color: THEME.fg2 }}>{L('No group to join right now.')}</div>
      )}

      <Toast text={toast} />
    </div>
  );
}

export { ParentGroups, ParentGroupCreate, ParentGroupDetail, ParentGroupInvite, ParentGroupJoin, GroupAvatar, gname };
