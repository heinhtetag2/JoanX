// JoanX — child app · FriendHouse

import React from 'react';
import { floorOf, FRIENDS, GUEST_STAMPS, PLAYER, react, REACTIONS, reactionOf, reactionTotal, themeOf } from '../core/data.jsx';
import { Icon, SectionHead, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { moderate, REASON_TEXT } from '../core/moderation.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { ScreenHeader, RarityPill } from './shared.jsx';

// ── Friend's Collection House (A-10) — featured buddy, rooms, likes,
//    one-line guestbook. Visit-only, no chat/real-time. ──────────────
function FriendHouse({ ctx }) {
  const f = FRIENDS.find(x => x.id === ctx.params?.id) || FRIENDS[0];
  // A-10 — which reaction I left (or none), and the running tally per reaction. Both come
  // straight off the friend row, which react() keeps in step, so leaving one here shows up
  // on the friends list too rather than only inside this screen.
  const [mine, setMine] = React.useState(f.myReaction);
  const [counts, setCounts] = React.useState(() => ({ ...f.reactions }));
  const likes = reactionTotal(f);
  // Copy, don't alias: f.guest is mutated below to persist the note across visits, and a shared
  // reference would make the state prepend and that mutation both show up — the note twice.
  const [entries, setEntries] = React.useState(() => [...f.guest]);
  const [picked, setPicked] = React.useState(null);   // the stamp mid-tap, held briefly so the press reads as "sent"
  const [signed, setSigned] = React.useState(false);
  const [draft, setDraft] = React.useState('');       // the typed note, before it's sent
  const [blocked, setBlocked] = React.useState(null); // moderation reason to show, or null

  // react() owns the switch/take-back rules and the counting — this only mirrors the result
  // into state so the row repaints.
  const leaveReaction = (key) => {
    setMine(react(f, key));
    setCounts({ ...f.reactions });
  };
  // Both paths — a tapped stamp and a typed message — end here. `mine` drives the one-shot pop
  // and lives only in this render's copy, so the stored note stays clean and re-opening the
  // house doesn't re-animate a note that's just sitting there. One note per visit either way.
  const post = (e) => {
    setEntries(list => [{ ...e, mine: true }, ...list]); f.guest.unshift(e);
    setSigned(true);
  };
  // One tap leaves the stamp. It stays lit for a beat before the picker swaps to the
  // confirmation, so the child sees which one they sent rather than the row just vanishing.
  const timer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(timer.current), []);
  const leave = (s) => {
    if (signed || picked) return;
    setPicked(s);
    timer.current = setTimeout(() => post({ by: PLAYER.name, emoji: s.emoji, text: s.text }), 320);
  };
  // A typed note is screened before it can be posted (see moderation.jsx): profanity, abuse,
  // sexual language, phone numbers, e-mails, social handles and links are turned away with a
  // reason, never posted. The server re-screens on write — this is the fast first gate.
  const leaveText = () => {
    if (signed || picked) return;
    const verdict = moderate(draft);
    if (!verdict.ok) { setBlocked(verdict.reason || 'language'); return; }
    post({ by: PLAYER.name, emoji: '', text: draft.trim() });
    setDraft('');
  };
  const onDraft = (v) => { setDraft(v); if (blocked) setBlocked(null); };   // clear the warning as they edit
  const fc = f.featured;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgFor(f.color) }}>
      <ScreenHeader title={`${f.name}${L("’s house")}`} onBack={() => ctx.nav('friends')}
        right={<div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon name="heart" size={15} color={THEME.joy} fill={THEME.joy} stroke={2} /><span className="game-font" style={{ fontSize: 14, fontWeight: 500 }}>{likes}</span></div>} />
      <div style={{ padding: '0 16px' }}>

        {/* featured buddy */}
        <div style={{ borderRadius: 24, padding: '18px 16px', background: `linear-gradient(165deg, ${shade(fc.color, 74)}, #fff 78%)`, boxShadow: THEME.shadowCard, textAlign: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, textTransform: 'uppercase', letterSpacing: .4 }}>{L('Featured buddy')}</div>
          <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={140} /></div>
          <div className="game-font" style={{ fontSize: 22, fontWeight: 500 }}>{fc.name}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}><RarityPill rarity={fc.rarity} /></div>
        </div>

        {/* A-10 — reactions, not just a like. One per visitor: picking another moves your
            reaction rather than stacking a second one, and tapping the one you left takes
            it back. Every reaction is a kind one — see REACTIONS in data.jsx for why. */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '12px 10px 11px', boxShadow: THEME.shadowCard, marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {REACTIONS.map(r => {
              const on = mine === r.key;
              const n = counts[r.key] || 0;
              return (
                <button key={r.key} onClick={() => leaveReaction(r.key)} aria-label={L(r.label)}
                  className="jx-press"
                  style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    background: on ? `${r.color}1c` : THEME.surface2,
                    border: on ? `1.5px solid ${r.color}` : '1.5px solid transparent',
                    borderRadius: 13, padding: '8px 2px 6px', cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'none' }}>
                  <span style={{ fontSize: 19, lineHeight: 1 }}>{r.emoji}</span>
                  <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: on ? r.color : THEME.fg2 }}>{n}</span>
                </button>
              );
            })}
          </div>
          <div style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: mine ? reactionOf(mine).color : THEME.fg3, marginTop: 8 }}>
            {mine ? `${L('You said')} ${reactionOf(mine).emoji} ${L(reactionOf(mine).label)}` : L('Leave a reaction')}
          </div>
        </div>

        {/* rooms */}
        <SectionHead title={L('Rooms')} />
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 10 }} className="no-sb">
          {f.rooms.map((r, i) => {
            const t = themeOf(r);
            return (
              <div key={i} style={{ flexShrink: 0, width: 132, borderRadius: 18, overflow: 'hidden', boxShadow: THEME.shadowCard, textAlign: 'center' }}>
                <div style={{ padding: '14px 12px 8px', background: t.wall(r.wallpaper) }}>
                  <div style={{ display: 'flex', justifyContent: 'center' }}><Mascot species={fc.species} stage={fc.stage} color={fc.color} size={54} /></div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, marginTop: 6 }}>
                    <Icon name={t.icon} size={12} color={THEME.fg2} stroke={2.3} />{L(r.name)}
                  </div>
                </div>
                <div style={{ height: 10, background: floorOf(r), borderTop: `2px solid ${t.accent}` }} />
              </div>
            );
          })}
        </div>

        {/* guestbook — a stamp is picked, never typed (see GUEST_STAMPS) */}
        <SectionHead title={L('Guestbook')} />
        {signed ? (
          <div className="jx-pop" style={{ display: 'flex', alignItems: 'center', gap: 9, background: THEME.joyBg, border: `1.5px solid ${THEME.joy}`, borderRadius: 16, padding: '13px 14px', marginBottom: 12 }}>
            <Icon name="check" size={17} color={THEME.joy} stroke={2.6} />
            <span style={{ fontSize: 13.5, fontWeight: 800, color: THEME.joy }}>{L('Note left!')}</span>
            <span style={{ fontSize: 12.5, color: THEME.fg2, marginLeft: 'auto' }}>{L('One note per visit')}</span>
          </div>
        ) : (
          <>
            {/* free-text note (F-32) — screened by moderation.jsx before it can be posted */}
            <div style={{ fontSize: 12.5, color: THEME.fg2, margin: '0 2px 10px' }}>{L('Write a short note, or tap one below.')}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1.5px solid ${blocked ? THEME.danger : THEME.border}`, borderRadius: 16, padding: '8px 8px 8px 14px', marginBottom: blocked ? 8 : 12 }}>
              <input
                value={draft}
                onChange={(e) => onDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) leaveText(); }}
                maxLength={80}
                placeholder={L('Say something kind…')}
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: THEME.fg1, fontFamily: 'inherit', padding: 0 }} />
              <span style={{ fontSize: 11, color: THEME.fg3, flexShrink: 0 }}>{draft.length}/80</span>
              <button onClick={leaveText} disabled={!draft.trim()} aria-label={L('Leave note')}
                style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', background: draft.trim() ? THEME.primary : THEME.surface2 }}>
                <Icon name="send" size={16} color={draft.trim() ? '#fff' : THEME.fg3} stroke={2.4} />
              </button>
            </div>
            {blocked && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: THEME.dangerLight, borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
                <Icon name="shield-alert" size={16} color={THEME.danger} stroke={2.2} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 12.5, color: THEME.danger, lineHeight: 1.45 }}>{L(REASON_TEXT[blocked])}</span>
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {GUEST_STAMPS.map((s, i) => (
                <button key={i} className="jx-press" onClick={() => leave(s)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: picked === s ? THEME.primaryLight : '#fff', border: `1.5px solid ${picked === s ? THEME.primary : THEME.border}`, borderRadius: 999, padding: '9px 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: picked === s ? THEME.primaryDark : THEME.fg1, cursor: 'pointer' }}>
                  <span style={{ fontSize: 15 }}>{s.emoji}</span>{L(s.text)}
                </button>
              ))}
            </div>
          </>
        )}
        {entries.map((e, i) => (
          <div key={i} className={e.mine ? 'jx-pop' : undefined} style={{ display: 'flex', gap: 10, background: '#fff', borderRadius: 16, padding: '12px 14px', boxShadow: THEME.shadowCard, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 800, color: THEME.primaryDark }}>{e.by[0]}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: THEME.fg2 }}>{e.by}</div>
              <div style={{ fontSize: 13.5, color: THEME.fg1, marginTop: 1, lineHeight: 1.4 }}>{e.emoji ? `${e.emoji} ` : ''}{L(e.text)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { FriendHouse };
