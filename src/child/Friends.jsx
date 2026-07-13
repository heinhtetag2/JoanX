// JoanX — child app · Friends

import React from 'react';
import { CHARACTERS, FRIENDS, PLAYER } from '../core/data.jsx';
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
  const me = CHARACTERS.find(x => x.id === PLAYER.activeCharId) || CHARACTERS[0];   // your buddy = your avatar
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

    // 11 · Split — two-tone rows: buddy-colored mascot half + white info half
    split: () => friends.map(f => (
      <div key={f.id} style={{ display: 'flex', borderRadius: 18, overflow: 'hidden', border: `1px solid ${THEME.border}`, marginBottom: 10, background: '#fff' }}>
        <div style={{ width: 92, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${shade(f.color, 66)}, ${shade(f.color, 84)})` }}>
          <Mascot species={f.avatar} stage={2} color={f.color} size={62} />
          <Dot online={f.online} />
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{f.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <Stat icon="flame" color={THEME.gold} value={f.streak} />
              <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main }}>{L('Visit')}</Button>
        </div>
      </div>
    )),

    // 12 · Village — house cards with a colored roof (ties to visiting rooms)
    village: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ border: `1px solid ${THEME.border}`, cursor: 'pointer', fontFamily: 'inherit', borderRadius: 18, overflow: 'hidden', background: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 14, background: f.color }} />
            <div style={{ padding: '12px 10px 14px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: shade(f.color, 86), display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={52} /></div>
                <Dot online={f.online} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4 }}>{f.name}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: THEME.fg2, fontWeight: 700 }}><Icon name="home" size={12} color={PURPLE.main} stroke={2.3} />{L('Visit house')}</div>
            </div>
          </button>
        ))}
      </div>
    ),

    // 13 · Rail — clean rows color-coded by a buddy-colored left bar
    rail: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, border: `1px solid ${THEME.border}`, borderLeft: `5px solid ${f.color}`, padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={44} bg={PURPLE.light} /><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
          </div>
        </div>
        <Icon name="chevron-right" size={17} color={THEME.fg3} stroke={2.3} />
      </div>
    )),

    // 14 · Poster — tall immersive cards, buddy centered on a rich gradient
    poster: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ position: 'relative', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 20, overflow: 'hidden', aspectRatio: '0.82', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14, background: `linear-gradient(180deg, ${shade(f.color, 34)}, ${shade(f.color, -26)})` }}>
            <div style={{ position: 'absolute', top: '27%', left: '50%', transform: 'translate(-50%,-50%)' }}><Mascot species={f.avatar} stage={2} color={f.color} size={82} /></div>
            {f.online && <span style={{ position: 'absolute', top: 11, right: 11, width: 10, height: 10, borderRadius: 999, background: THEME.success, border: '2px solid rgba(255,255,255,.85)' }} />}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{f.name}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.92)' }}><Icon name="flame" size={12} color="#fff" stroke={2.3} />{f.streak}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.92)' }}><Icon name="gem" size={12} color="#fff" stroke={2.3} />{f.chars}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    ),

    // 15 · Chips — wrapping friend pills, tag-cloud style
    chips: () => (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 999, padding: '6px 14px 6px 6px', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <MascotChip species={f.avatar} color={f.color} size={30} bg={PURPLE.light} />
              <span style={{ position: 'absolute', bottom: -1, right: -1, width: 10, height: 10, borderRadius: 999, background: f.online ? THEME.success : THEME.fg3, border: '2px solid #fff' }} />
            </div>
            <span style={{ fontSize: 13.5, fontWeight: 800 }}>{f.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 12, color: THEME.fg2, fontWeight: 700 }}><Icon name="flame" size={12} color={THEME.gold} stroke={2.3} />{f.streak}</span>
          </button>
        ))}
      </div>
    ),

    // 16 · Banner — smooth horizontal buddy-color wash fading into white
    banner: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 18, overflow: 'hidden', border: `1px solid ${THEME.border}`, background: '#fff', padding: '12px 14px', marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, ${shade(f.color, 70)} 0%, ${shade(f.color, 90)} 42%, #fff 80%)` }} />
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={46} bg="rgba(255,255,255,.6)" /><Dot online={f.online} /></div>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
          </div>
        </div>
        <Icon name="arrow-right" size={18} color={PURPLE.main} stroke={2.4} style={{ position: 'relative' }} />
      </div>
    )),

    // 17 · Roster — a squad card: overlapping avatar header + member rows
    roster: () => (
      <div style={{ background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: PURPLE.light }}>
          <div style={{ display: 'flex' }}>
            {friends.slice(0, 4).map((f, i) => (
              <div key={f.id} style={{ marginLeft: i ? -12 : 0, border: '2px solid #fff', borderRadius: 999, display: 'flex' }}><MascotChip species={f.avatar} color={f.color} size={34} bg="#fff" /></div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 800, color: PURPLE.dark }}>{L('Your squad')}</div>
            <div style={{ fontSize: 12, color: PURPLE.dark, opacity: .8, fontWeight: 600 }}>{friends.length} {L('friends')}</div>
          </div>
        </div>
        {friends.map((f, i) => (
          <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderTop: `1px solid ${THEME.border}`, cursor: 'pointer' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={38} bg={PURPLE.light} /><Dot online={f.online} /></div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
          </div>
        ))}
      </div>
    ),

    // 18 · Stats — data-forward cards, big stat blocks per friend
    stats: () => friends.map(f => (
      <div key={f.id} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={44} bg={PURPLE.light} /><Dot online={f.online} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: f.online ? THEME.success : THEME.fg2, fontWeight: 600, marginTop: 1 }}>{f.online ? L('Online now') : L('Last seen recently')}</div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main }}>{L('Visit')}<Icon name="chevron-right" size={16} color={PURPLE.main} stroke={2.5} /></Button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {[['flame', THEME.gold, f.streak, L('Streak')], ['gem', PURPLE.main, f.chars, L('Gems')]].map(([ic, col, val, lbl]) => (
            <div key={lbl} style={{ flex: 1, background: THEME.surface2, borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icon name={ic} size={15} color={col} stroke={2.3} /><span className="game-font" style={{ fontSize: 19, fontWeight: 500 }}>{val}</span></div>
              <div style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>
    )),

    // 19 · Groups — split into Online / Offline sections
    groups: () => {
      const on = friends.filter(f => f.online), off = friends.filter(f => !f.online);
      const section = (title, arr) => (arr.length ? (
        <React.Fragment key={title}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg3, textTransform: 'uppercase', letterSpacing: .4, margin: '10px 4px 8px' }}>{title} · {arr.length}</div>
          <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
            {arr.map((f, i) => (
              <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={40} bg={PURPLE.light} /><Dot online={f.online} /></div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
                <Stat icon="flame" color={THEME.gold} value={f.streak} />
                <Stat icon="gem" color={PURPLE.main} value={f.chars} />
                <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
              </div>
            ))}
          </div>
        </React.Fragment>
      ) : null);
      return <div>{section(L('Online'), on)}{section(L('Offline'), off)}</div>;
    },

    // 20 · Ticket — event-ticket cards with a buddy-colored stub + perforation
    ticket: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', borderRadius: 18, overflow: 'hidden', border: `1px solid ${THEME.border}`, background: '#fff', marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ width: 86, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: shade(f.color, 84) }}>
          <Mascot species={f.avatar} stage={2} color={f.color} size={56} />
          <Dot online={f.online} />
          <span style={{ position: 'absolute', right: -1, top: 0, bottom: 0, borderRight: `2px dashed ${THEME.border}` }} />
        </div>
        <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
              <Stat icon="flame" color={THEME.gold} value={f.streak} />
              <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            </div>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: PURPLE.main, fontWeight: 800, fontSize: 13 }}>{L('Visit')}<Icon name="arrow-right" size={15} color={PURPLE.main} stroke={2.4} /></div>
        </div>
      </div>
    )),

    // 21 · Feed — social post cards: header, stats, full-width Visit action
    feed: () => friends.map(f => (
      <div key={f.id} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={42} bg={PURPLE.light} /><Dot online={f.online} /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: f.online ? THEME.success : THEME.fg2, fontWeight: 600, marginTop: 1 }}>{f.online ? L('Online now') : L('Last seen recently')}</div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
          </div>
        </div>
        <Button variant="secondary" size="sm" fullWidth onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main, marginTop: 12 }}><Icon name="home" size={16} color={PURPLE.main} stroke={2.4} />{L('Visit')}</Button>
      </div>
    )),

    // 22 · Bento — mixed-size grid: a big lead tile then square cells
    bento: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {friends.map((f, i) => {
          const big = i === 0;
          return (
            <button key={f.id} onClick={() => visit(f)} style={{ gridColumn: big ? 'span 2' : 'span 1', display: 'flex', flexDirection: big ? 'row' : 'column', alignItems: 'center', gap: big ? 16 : 6, background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 20, padding: big ? 18 : '16px 12px', cursor: 'pointer', fontFamily: 'inherit', textAlign: big ? 'left' : 'center' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={big ? 66 : 56} bg={PURPLE.light} /><Dot online={f.online} /></div>
              <div style={{ flex: big ? 1 : 'none' }}>
                <div style={{ fontSize: big ? 17 : 14.5, fontWeight: 800 }}>{f.name}</div>
                <div style={{ display: 'flex', gap: 10, marginTop: big ? 6 : 3, justifyContent: big ? 'flex-start' : 'center' }}>
                  <Stat icon="flame" color={THEME.gold} value={f.streak} />
                  <Stat icon="gem" color={PURPLE.main} value={f.chars} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    ),

    // 23 · Minimal — text-first rows, a presence dot, no avatars
    minimal: () => (
      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
        {friends.map((f, i) => (
          <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
            <span style={{ width: 9, height: 9, borderRadius: 999, background: f.online ? THEME.success : THEME.fg3, flexShrink: 0 }} />
            <span style={{ flex: 1, minWidth: 0, fontSize: 15, fontWeight: 800 }}>{f.name}</span>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
          </div>
        ))}
      </div>
    ),

    // 24 · Badge — medallion avatars with a streak ribbon, 3 across
    badge: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, padding: '8px 0' }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 74, height: 74, borderRadius: 999, background: `linear-gradient(145deg, ${shade(f.color, 60)}, ${shade(f.color, 82)})`, border: '3px solid #fff', boxShadow: `0 0 0 1px ${THEME.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={60} /></div>
              <div style={{ position: 'absolute', bottom: -6, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 3, background: PURPLE.main, color: '#fff', borderRadius: 999, padding: '2px 9px', fontSize: 11, fontWeight: 800 }}><Icon name="flame" size={11} color="#fff" stroke={2.4} />{f.streak}</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, marginTop: 8 }}>{f.name}</div>
          </button>
        ))}
      </div>
    ),

    // 25 · Magazine — editorial cards, mascot panel alternating left / right
    magazine: () => friends.map((f, i) => {
      const left = i % 2 === 0;
      const pane = (
        <div key="p" style={{ width: 110, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${shade(f.color, 66)}, ${shade(f.color, 84)})` }}>
          <Mascot species={f.avatar} stage={2} color={f.color} size={72} />
          <Dot online={f.online} />
        </div>
      );
      const info = (
        <div key="i" style={{ flex: 1, minWidth: 0, padding: '14px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 8, textAlign: left ? 'left' : 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: left ? 'flex-start' : 'flex-end' }}>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
          </div>
          <div style={{ display: 'flex', justifyContent: left ? 'flex-start' : 'flex-end' }}>
            <Button variant="secondary" size="sm" onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main }}>{L('Visit')}<Icon name="arrow-right" size={15} color={PURPLE.main} stroke={2.4} /></Button>
          </div>
        </div>
      );
      return (
        <div key={f.id} style={{ display: 'flex', borderRadius: 20, overflow: 'hidden', border: `1px solid ${THEME.border}`, background: '#fff', marginBottom: 12 }}>
          {left ? [pane, info] : [info, pane]}
        </div>
      );
    }),

    // 26 · Spotlight — a lead hero over a 2-col mini grid of the rest
    spotlight: () => {
      const top = friends[0], rest = friends.slice(1);
      return (
        <React.Fragment>
          <div style={{ borderRadius: 22, border: `1px solid ${THEME.border}`, background: `linear-gradient(160deg, ${shade(top.color, 72)}, #fff 82%)`, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 96, height: 96, borderRadius: 26, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={top.avatar} stage={2} color={top.color} size={84} /></div>
              <Dot online={top.online} />
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 10 }}>{top.name}</div>
            <div style={{ display: 'flex', gap: 12, margin: '6px 0 14px' }}>
              <Stat icon="flame" color={THEME.gold} value={top.streak} />
              <Stat icon="gem" color={PURPLE.main} value={top.chars} />
            </div>
            <Button variant="primary" size="sm" onClick={() => visit(top)} style={{ background: PURPLE.main, boxShadow: 'none' }}>{L('Visit')}<Icon name="chevron-right" size={16} color="#fff" stroke={2.5} /></Button>
          </div>
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {rest.map(f => (
                <button key={f.id} onClick={() => visit(f)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: '14px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ position: 'relative' }}><MascotChip species={f.avatar} color={f.color} size={48} bg={PURPLE.light} /><Dot online={f.online} /></div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, marginTop: 4 }}>{f.name}</div>
                  <Stat icon="flame" color={THEME.gold} value={f.streak} />
                </button>
              ))}
            </div>
          )}
        </React.Fragment>
      );
    },

    // 27 · Pill — fully-rounded full-width rows
    pill: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 999, border: `1px solid ${THEME.border}`, padding: '8px 16px 8px 8px', marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={44} bg={PURPLE.light} /><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 2 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
        </div>
        <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
      </div>
    )),

    // 28 · Frame — cards outlined by a buddy-colored border
    frame: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, border: `2px solid ${f.color}`, padding: '13px 14px', marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={46} bg={PURPLE.light} /><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 3 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
        </div>
        <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
      </div>
    )),

    // 29 · Avatar-left — big square mascot with stacked info
    avatarLeft: () => friends.map(f => (
      <div key={f.id} style={{ display: 'flex', gap: 14, background: '#fff', borderRadius: 20, border: `1px solid ${THEME.border}`, padding: 16, marginBottom: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}><div style={{ width: 72, height: 72, borderRadius: 18, background: PURPLE.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mascot species={f.avatar} stage={2} color={f.color} size={62} /></div><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16.5, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 14, marginTop: 6 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
          <div style={{ marginTop: 10 }}><Button variant="secondary" size="sm" onClick={() => visit(f)} style={{ background: PURPLE.light, color: PURPLE.main }}>{L('Visit')}<Icon name="chevron-right" size={16} color={PURPLE.main} stroke={2.5} /></Button></div>
        </div>
      </div>
    )),

    // 30 · Capsule — two-tone rounded rows with a colored avatar bump
    capsule: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 999, border: `1px solid ${THEME.border}`, marginBottom: 10, cursor: 'pointer', overflow: 'hidden' }}>
        <div style={{ width: 56, height: 56, flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(160deg, ${shade(f.color, 66)}, ${shade(f.color, 84)})` }}><Mascot species={f.avatar} stage={2} color={f.color} size={46} /><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0, padding: '0 14px' }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 2 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
        </div>
        <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} style={{ marginRight: 16, flexShrink: 0 }} />
      </div>
    )),

    // 31 · Inline — info left, avatar on the right (mirrored rows)
    inline: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 10, cursor: 'pointer' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 3 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
        </div>
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={48} bg={PURPLE.light} /><Dot online={f.online} /></div>
      </div>
    )),

    // 32 · Gradient list — each row softly tinted with the buddy colour
    gradientList: () => friends.map(f => (
      <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, marginBottom: 10, cursor: 'pointer', background: `linear-gradient(100deg, ${shade(f.color, 88)}, #fff 68%)` }}>
        <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={46} bg="rgba(255,255,255,.65)" /><Dot online={f.online} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{f.name}</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 3 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
        </div>
        <Icon name="chevron-right" size={18} color={THEME.fg3} stroke={2.3} />
      </div>
    )),

    // 33 · Numbered — a plain numbered directory
    numbered: () => (
      <div style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, overflow: 'hidden' }}>
        {friends.map((f, i) => (
          <div key={f.id} onClick={() => visit(f)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${THEME.border}` : 'none', cursor: 'pointer' }}>
            <span style={{ width: 22, textAlign: 'center', fontSize: 14, fontWeight: 800, color: THEME.fg3, flexShrink: 0 }}>{i + 1}</span>
            <div style={{ position: 'relative', flexShrink: 0 }}><MascotChip species={f.avatar} color={f.color} size={40} bg={PURPLE.light} /><Dot online={f.online} /></div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 14.5, fontWeight: 800 }}>{f.name}</div>
            <Stat icon="flame" color={THEME.gold} value={f.streak} />
            <Stat icon="gem" color={PURPLE.main} value={f.chars} />
            <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
          </div>
        ))}
      </div>
    ),

    // 34 · Card grid — 2-col info cards, avatar + chevron header
    cardGrid: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {friends.map(f => (
          <div key={f.id} onClick={() => visit(f)} style={{ background: '#fff', borderRadius: 18, border: `1px solid ${THEME.border}`, padding: 14, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative' }}><MascotChip species={f.avatar} color={f.color} size={44} bg={PURPLE.light} /><Dot online={f.online} /></div>
              <Icon name="chevron-right" size={16} color={THEME.fg3} stroke={2.3} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 10 }}>{f.name}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}><Stat icon="flame" color={THEME.gold} value={f.streak} /><Stat icon="gem" color={PURPLE.main} value={f.chars} /></div>
          </div>
        ))}
      </div>
    ),

    // 35 · Gallery — a compact 3-across avatar gallery with a gem pill
    gallery: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {friends.map(f => (
          <button key={f.id} onClick={() => visit(f)} style={{ background: '#fff', border: `1px solid ${THEME.border}`, borderRadius: 16, padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', fontFamily: 'inherit' }}>
            <div style={{ position: 'relative' }}><MascotChip species={f.avatar} color={f.color} size={52} bg={PURPLE.light} /><Dot online={f.online} /></div>
            <div style={{ fontSize: 12.5, fontWeight: 800, marginTop: 4, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: PURPLE.light, color: PURPLE.dark, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}><Icon name="gem" size={11} color={PURPLE.main} stroke={2.3} />{f.chars}</span>
          </button>
        ))}
      </div>
    ),
  };

  const renderBody = bodies[layout] || bodies.list;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      {/* your own avatar leads the header: your room is the page friends land on when they
          visit you, so it belongs on the screen you visit theirs from (F-32) */}
      <ScreenHeader title={L('Friends')}
        left={<button onClick={() => ctx.nav('myhouse')} aria-label={L('My Room')} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: '#fff', boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, padding: 0, overflow: 'hidden' }}>
          <Mascot species={me.species} stage={me.stage} color={me.color} size={34} />
        </button>}
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
