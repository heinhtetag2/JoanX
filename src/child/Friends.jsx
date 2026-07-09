// JoanX — child app · Friends

import React from 'react';
import { FRIENDS } from '../core/data.jsx';
import { Button, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { Mascot, MascotChip, shade } from '../core/characters.jsx';
import { ScreenHeader, screenBgActive } from './shared.jsx';

// Friends-area brand purple (design-system iris ramp) — 50 / 60 / 10.
const PURPLE = { main: '#7f63c5', dark: '#603fab', light: '#f5f1fd' };

// small stat chip (flame streak / gem count) — shared across variants
const Stat = ({ icon, color, value, tone = 'plain' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700,
    color: tone === 'plain' ? THEME.fg2 : THEME.fg1,
    ...(tone === 'pill' ? { background: '#fff', borderRadius: 999, padding: '3px 9px' } : {}) }}>
    <Icon name={icon} size={13} color={color} stroke={2.3} />{value}
  </span>
);

// online / offline presence dot, bottom-right of an avatar
const Dot = ({ online, ring = '#fff' }) => (
  <span style={{ position: 'absolute', bottom: 0, right: 0, width: 13, height: 13, borderRadius: 999, background: online ? THEME.success : THEME.fg3, border: `2.5px solid ${ring}` }} />
);

// ── Friends list (F-32) — a primary tab (no back), five layout variants ──
function Friends({ ctx, layout = 'list' }) {
  const friends = ctx.demo?.empty ? [] : FRIENDS;   // first-run: no friends added yet
  const visit = f => ctx.nav('friendhouse', { id: f.id });

  // ── variant bodies ──────────────────────────────────────────────────
  const bodies = {
    // 1 · List — full-width rows, avatar + stats + Visit button (the default)
    list: () => friends.map(f => (
      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, padding: 14, border: `1px solid ${THEME.border}`, marginBottom: 10 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <MascotChip species={f.avatar} color={f.color} size={50} bg={PURPLE.light} />
          <Dot online={f.online} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 3 }}>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main }}>{L('Visit')}<Icon name="arrow-right" size={16} color={PURPLE.main} stroke={2.4} /></Button>
      </div>
    )),

    // 2 · Grid — two-column tap-to-visit cards, mascot forward
    grid: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 20, padding: '18px 12px 16px', border: `1px solid ${THEME.border}`, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ position: 'relative' }}>
              <MascotChip species={f.avatar} color={f.color} size={64} bg={PURPLE.light} />
              <Dot online={f.online} />
            </div>
            <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 6 }}>{f.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
              <Stat icon="flame" color={THEME.gold} value={f.streak} />
              <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            </div>
          </button>
        ))}
      </div>
    ),

    // 3 · Showcase — big feature cards with a buddy-colored header + full-width Visit
    showcase: () => friends.map(f => (
      <div key={f.id} style={{ borderRadius: 22, overflow: 'hidden', border: `1px solid ${THEME.border}`, background: '#fff', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px', background: `linear-gradient(135deg, ${shade(f.color, 72)}, ${shade(f.color, 90)})` }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={56} /></div>
            <Dot online={f.online} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{f.name}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Stat icon="flame" color={THEME.gold} value={f.streak} tone="pill" />
              <Stat icon="gem" color={PURPLE.main} value={f.chars} tone="pill" />
            </div>
          </div>
        </div>
        <div style={{ padding: 12 }}>
          <Button variant="primary" size="md" fullWidth onClick={() => visit(f)} style={{ background: PURPLE.main, boxShadow: 'none' }}><Icon name="home" size={17} color="#fff" stroke={2.4} />{L('Visit')}</Button>
        </div>
      </div>
    )),

    // 4 · Compact — dense grouped rows, tap anywhere to visit, no buttons
    compact: () => (
      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
        {friends.map((f, i) => (
          <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MascotChip species={f.avatar} color={f.color} size={38} bg={PURPLE.light} />
              <Dot online={f.online} />
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Stat icon="flame" color={THEME.gold} value={f.streak} />
              <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            </div>
            <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
          </div>
        ))}
      </div>
    ),

    // 5 · Leaderboard — ranked by gems, medals for the top three
    leaderboard: () => {
      const ranked = [...friends].sort((a, b) => b.chars - a.chars);
      const medal = ['#e0a500', '#b8b8b8', '#c08457'];   // gold / silver / bronze
      return (
        <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
          {ranked.map((f, i) => (
            <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ width: 26, textAlign: 'center', flexShrink: 0 }}>
                {i < 3
                  ? <Icon name="medal" size={20} color={medal[i]} stroke={2.2} />
                  : <span style={{ fontSize: 14, fontWeight: 800, color: THEME.fg3 }}>{i + 1}</span>}
              </div>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <MascotChip species={f.avatar} color={f.color} size={42} bg={PURPLE.light} />
                <Dot online={f.online} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
                <div style={{ marginTop: 2 }}><Stat icon="flame" color={THEME.gold} value={`${f.streak}${L('d streak')}`} /></div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: PURPLE.dark, fontWeight: 800 }}>
                <Icon name="gem" size={15} color={PURPLE.main} stroke={2.3} /><span className="game-font" style={{ fontSize: 17, fontWeight: 500 }}>{f.chars}</span>
              </div>
            </div>
          ))}
        </div>
      );
    },

    // 6 · Carousel — horizontal snap-scroll of portrait buddy cards
    carousel: () => (
      <div className="no-sb" style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '2px 0 10px', scrollSnapType: 'x mandatory', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
        {friends.map(f => (
          <div key={f.id} style={{ flex: '0 0 auto', width: 196, scrollSnapAlign: 'start', background: '#fff', borderRadius: 22, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '20px 16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: `linear-gradient(160deg, ${shade(f.color, 74)}, #fff 82%)` }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 88, height: 88, borderRadius: 24, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={78} /></div>
                <Dot online={f.online} />
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 10 }}>{f.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <Stat icon="flame" color={THEME.gold} value={f.streak} />
                <Stat icon="gem" color={PURPLE.main} value={f.chars} />
              </div>
            </div>
            <div style={{ padding: 12 }}>
              <Button variant="primary" size="sm" fullWidth onClick={() => visit(f)} style={{ background: PURPLE.main, boxShadow: 'none' }}>{L('Visit')}</Button>
            </div>
          </div>
        ))}
      </div>
    ),

    // 7 · Tiles — bold full-bleed cards tinted with each buddy's colour
    tiles: () => friends.map(f => (
      <button key={f.id} onClick={() => visit(f)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 20, padding: 16, marginBottom: 12, background: `linear-gradient(135deg, ${f.color}, ${shade(f.color, -14)})` }}>
        <div style={{ width: 58, height: 58, borderRadius: 16, background: 'rgba(255,255,255,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mascot species={f.avatar} stage={2} color={f.color} size={52} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800, color: '#fff' }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.92)' }}><Icon name="flame" size={13} color="#fff" stroke={2.3} />{f.streak}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: 'rgba(255,255,255,.92)' }}><Icon name="gem" size={13} color="#fff" stroke={2.3} />{f.chars}</span>
          </div>
        </div>
        <Icon name="arrow-right" size={20} color="#fff" stroke={2.4} />
      </button>
    )),

    // 8 · Cover — a featured hero (best streak) over a compact list of the rest
    cover: () => {
      const sorted = [...friends].sort((a, b) => b.streak - a.streak);
      const top = sorted[0], rest = sorted.slice(1);
      return (
        <React.Fragment>
          <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${THEME.border}`, marginBottom: 12 }}>
            <div style={{ padding: '22px 18px', display: 'flex', alignItems: 'center', gap: 16, background: `linear-gradient(135deg, ${shade(top.color, 60)}, ${shade(top.color, 84)})` }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: 22, background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={top.avatar} stage={2} color={top.color} size={72} /></div>
                <Dot online={top.online} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,.72)', borderRadius: 999, padding: '3px 9px', fontSize: 11, fontWeight: 800, color: PURPLE.dark }}><Icon name="flame" size={12} color={THEME.gold} stroke={2.4} />{L('Top streak')}</div>
                <div style={{ fontSize: 19, fontWeight: 800, marginTop: 6 }}>{top.name}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <Stat icon="flame" color={THEME.gold} value={top.streak} />
                  <Stat icon="gem" color={PURPLE.main} value={top.chars} />
                </div>
              </div>
            </div>
            <div style={{ padding: 12, background: '#fff' }}>
              <Button variant="primary" size="md" fullWidth onClick={() => visit(top)} style={{ background: PURPLE.main, boxShadow: 'none' }}><Icon name="home" size={17} color="#fff" stroke={2.4} />{L('Visit')}</Button>
            </div>
          </div>
          {rest.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
              {rest.map((f, i) => (
                <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={38} bg={PURPLE.light} /><Dot online={f.online} /></div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
                  <Stat icon="flame" color={THEME.gold} value={f.streak} />
                  <Stat icon="gem" color={PURPLE.main} value={f.chars} />
                  <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
                </div>
              ))}
            </div>
          )}
        </React.Fragment>
      );
    },

    // 9 · Bubbles — a playful wrap of circular avatars with an online ring
    bubbles: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px 12px', justifyContent: 'center', padding: '10px 0' }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ width: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ width: 78, height: 78, borderRadius: 999, background: PURPLE.light, border: `3px solid ${f.online ? THEME.success : '#fff'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><Mascot species={f.avatar} stage={2} color={f.color} size={66} /></div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>{f.name}</div>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
          </button>
        ))}
      </div>
    ),

    // 10 · Timeline — a vertical rail of friends with a connector line
    timeline: () => (
      <div style={{ position: 'relative' }}>
        {friends.map((f, i) => (
          <div key={f.id} onClick={() => visit(f)} style={{ position: 'relative', display: 'flex', gap: 14, paddingBottom: i === friends.length - 1 ? 0 : 14, cursor: 'pointer' }}>
            {i !== friends.length - 1 && <span style={{ position: 'absolute', left: 23, top: 50, bottom: 0, width: 2, background: THEME.border }} />}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MascotChip species={f.avatar} color={f.color} size={48} bg={PURPLE.light} />
              <Dot online={f.online} />
            </div>
            <div style={{ flex: 1, minWidth: 0, background: '#fff', borderRadius: 16, border: `1px solid ${THEME.border}`, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
                <div style={{ fontSize: 12, color: f.online ? THEME.success : THEME.fg2, fontWeight: 600, marginTop: 2 }}>{f.online ? L('Online now') : L('Last seen recently')}</div>
              </div>
              <Stat icon="gem" color={PURPLE.main} value={f.chars} />
              <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
            </div>
          </div>
        ))}
      </div>
    ),
  };

  const renderBody = bodies[layout] || bodies.list;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Friends')}
        right={<button onClick={() => ctx.nav('addfriend')} aria-label={L('Add friends')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: PURPLE.main, border: 'none', borderRadius: 999, padding: '8px 13px', boxShadow: 'none', cursor: 'pointer', fontFamily: 'inherit' }}><Icon name="user-plus" size={15} color="#fff" stroke={2.5} /><span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{L('Add')}</span></button>} />
      <div style={{ padding: '0 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 10px', textTransform: 'uppercase', letterSpacing: .4 }}>{L(layout === 'leaderboard' ? 'Friend ranking' : 'Your friends')}</div>
        {friends.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '26px 24px', background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}` }}>
            <div style={{ width: 76, height: 76, borderRadius: 999, background: PURPLE.light, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Icon name="users" size={34} color={PURPLE.main} stroke={2} /></div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>{L('No friends yet')}</div>
            <div style={{ fontSize: 13, color: THEME.fg2, lineHeight: 1.5, margin: '6px 0 16px', maxWidth: 230 }}>{L('Add a friend to visit their room, leave likes, and cheer each other on.')}</div>
            <button onClick={() => ctx.nav('addfriend')} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: PURPLE.main, color: '#fff', border: 'none', borderRadius: 999, padding: '12px 22px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>
              <Icon name="user-plus" size={16} color="#fff" stroke={2.4} />{L('Add friends')}
            </button>
          </div>
        ) : renderBody()}
        {friends.length > 0 && <div style={{ fontSize: 11.5, color: THEME.fg3, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>{L('JoanX has no chat — just friendly visits, likes, and guestbook notes.')}</div>}
      </div>
    </div>
  );
}

export { Friends };
