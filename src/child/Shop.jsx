// JoanX — child app · Shop

import React from 'react';
import { CHARACTERS, PLAYER } from '../core/data.jsx';
import { Icon, SectionHead, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { screenBgActive, ScreenHeader } from './shared.jsx';

// ── Points & Shop ────────────────────────────────────────────────────
function Shop({ ctx }) {
  const c = CHARACTERS.find(x => x.id === PLAYER.activeCharId);
  const [pts, setPts] = React.useState(PLAYER.points);
  const [owned, setOwned] = React.useState({ scarf: true, cape: true });
  const [toast, setToast] = React.useState(null);

  const outfits = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', price: 0 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', price: 0 },
    { id: 'crown', icon: 'crown', name: 'Star Crown', price: 300 },
    { id: 'shades', icon: 'glasses', name: 'Cool Shades', price: 250 },
    { id: 'bow', icon: 'gift', name: 'Ribbon Bow', price: 200 },
    { id: 'cap', icon: 'graduation-cap', name: 'Explorer Cap', price: 280 },
  ];
  const rooms = [
    { id: 'studio', name: 'Star Studio', price: 600, icon: 'star' },
    { id: 'garden', name: 'Garden', price: 900, icon: 'flower-2' },
  ];

  const buy = (id, price, label) => {
    if (owned[id]) return;
    if (pts < price) { setToast({ ok: false, msg: L('Not enough points yet') }); setTimeout(() => setToast(null), 1500); return; }
    PLAYER.points -= price; setPts(PLAYER.points); setOwned(o => ({ ...o, [id]: true }));
    setToast({ ok: true, msg: `${label} ${L('unlocked!')}` }); setTimeout(() => setToast(null), 1600);
  };

  const PriceBtn = ({ id, price, label }) => owned[id]
    ? <span style={{ fontSize: 11, fontWeight: 800, color: THEME.success, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="check" size={12} color={THEME.success} stroke={3} />{L('Owned')}</span>
    : <button onClick={() => buy(id, price, label)} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pts >= price ? THEME.gold : THEME.surface2, color: pts >= price ? '#fff' : THEME.fg3, borderRadius: 999, padding: '5px 11px', fontSize: 12, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Icon name="star" size={12} color={pts >= price ? '#fff' : THEME.fg3} fill={pts >= price ? '#fff' : THEME.fg3} stroke={2} />{price}</button>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 102, paddingBottom: 110, background: screenBgActive() }}>
      <ScreenHeader title={L('Points')} onBack={() => ctx.nav('home')} />
      <div style={{ padding: '0 16px' }}>
        {/* balance */}
        <div style={{ borderRadius: 22, padding: '20px 18px', background: 'linear-gradient(160deg,#fff2d1,#fff 78%)', boxShadow: THEME.shadowCard, marginBottom: 14, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icon name="star" size={30} color={THEME.gold} fill={THEME.gold} stroke={2} />
            <span className="game-font" style={{ fontSize: 40, fontWeight: 500, lineHeight: 1 }}>{pts.toLocaleString()}</span>
          </div>
          <div style={{ fontSize: 13, color: THEME.fg2, fontWeight: 600, marginTop: 4 }}>{L('Your points')}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[['swords', L('Win battles')], ['flame', L('Keep streaks')], ['gift', L('Daily reward')]].map(([ic, t], i) => (
              <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <Icon name={ic} size={16} color={THEME.gold} stroke={2.3} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* mystery box */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: `linear-gradient(120deg, ${THEME.campingBg}, #fff 80%)`, borderRadius: 20, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: THEME.shadowCard, flexShrink: 0 }}><Icon name="package" size={32} color={THEME.camping} stroke={2.1} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{L('Mystery Buddy Box')}</div>
            <div style={{ fontSize: 12, color: THEME.fg2, marginTop: 1 }}>{L('Get a random new buddy')}</div>
          </div>
          <button onClick={() => buy('mystery', 500, L('A new buddy'))} style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: pts >= 500 && !owned.mystery ? THEME.camping : THEME.surface2, color: pts >= 500 && !owned.mystery ? '#fff' : THEME.fg3, borderRadius: 999, padding: '9px 14px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            {owned.mystery ? L('Opened') : <React.Fragment><Icon name="star" size={13} color="#fff" fill="#fff" stroke={2} />500</React.Fragment>}
          </button>
        </div>

        {/* outfits */}
        <SectionHead title={L('Outfits')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {outfits.map(o => (
            <div key={o.id} style={{ background: '#fff', borderRadius: 18, padding: '14px 8px 12px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={o.icon} size={22} color={THEME.primary} stroke={2.2} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>{L(o.name)}</span>
              <PriceBtn id={o.id} price={o.price} label={L(o.name)} />
            </div>
          ))}
        </div>

        {/* rooms — same card style as Outfits (3-col, soft blue chip) */}
        <SectionHead title={L('Unlock rooms')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {rooms.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 18, padding: '14px 8px 12px', boxShadow: THEME.shadowCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: THEME.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={r.icon} size={22} color={THEME.primary} stroke={2.2} /></div>
              <span style={{ fontSize: 11.5, fontWeight: 700, textAlign: 'center', lineHeight: 1.15 }}>{L(r.name)}</span>
              <PriceBtn id={r.id} price={r.price} label={L(r.name)} />
            </div>
          ))}
        </div>
      </div>

      {/* toast */}
      {toast && (
        <div className="jx-pop" style={{ position: 'absolute', left: 0, right: 0, bottom: 28, display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: toast.ok ? THEME.fg1 : THEME.danger, color: '#fff', padding: '11px 18px', borderRadius: 999, fontSize: 13.5, fontWeight: 700, boxShadow: THEME.shadowXl }}>
            <Icon name={toast.ok ? 'party-popper' : 'info'} size={16} color="#fff" stroke={2.3} />{toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}

export { Shop };
