// JoanX — child app · CharacterVariants

import React from 'react';
import { CHARACTERS } from '../core/data.jsx';
import { Badge, Bar, Button, Icon, RARITY, THEME } from '../core/primitives.jsx';
import { L, getLang } from '../core/i18n.jsx';
import { Mascot, shade } from '../core/characters.jsx';
import { mixHue } from './shared.jsx';
import { CharacterDetail } from './CharacterDetail.jsx';

function CharVariant({ ctx, variant }) {
  const orig = CHARACTERS.find(x => x.id === ctx.params.id) || CHARACTERS[0];
  const [color, setColor] = React.useState(orig.color);
  const [tab, setTab] = React.useState('stat');
  // Evolution (F-16): a buddy that's filled its XP can evolve to the next stage.
  // `stage` is state so the evolve moment re-skins the buddy + unlocks stage items live.
  const [stage, setStage] = React.useState(orig.stage);
  const level = orig.level;
  const [evolving, setEvolving] = React.useState(false);
  const [evolvedStage, setEvolvedStage] = React.useState(null);
  const ready = orig.xp >= orig.xpMax;             // XP full → ready to evolve
  const canEvolve = stage < 3 && ready;
  const evolve = () => {
    if (evolving || stage >= 3) return;
    setEvolving(true); setEvolvedStage(null);
    setTimeout(() => { const ns = Math.min(3, stage + 1); setStage(ns); setEvolvedStage(ns); if (ctx.setBuddy) ctx.setBuddy(orig.id, { stage: ns }); }, 1500);
    setTimeout(() => setEvolving(false), 3200);
  };

  const swatches = ['#e0554a', '#e1874a', '#4b814f', '#9867e4', '#67c7ce', '#e278a8', '#6697c9', '#ffbc05', '#a8c3eb'];
  const items = [
    { id: 'scarf', icon: 'shirt', name: 'Hero Scarf', on: stage >= 2 },
    { id: 'cape', icon: 'wind', name: 'Guardian Cape', on: stage >= 3 },
    { id: 'hat', icon: 'crown', name: 'Star Crown', on: false, locked: true },
    { id: 'glasses', icon: 'glasses', name: 'Cool Shades', on: false, locked: true },
  ];
  const traits = [
    { k: 'guard', label: 'Guard', icon: 'shield', color: THEME.primary },
    { k: 'speed', label: 'Speed', icon: 'gauge', color: THEME.gold },
    { k: 'heart', label: 'Heart', icon: 'heart', color: THEME.joy },
  ];
  const accent = color;
  // color-heavy backgrounds get frosted cards (the bg tints through); light ones stay crisp white
  const onColorBg = variant === 'vivid' || variant === 'focus' || variant === 'showcase';
  const card = onColorBg
    ? { background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1.5px solid rgba(46,43,41,0.12)', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: '0 10px 26px rgba(46,43,41,0.10)' }
    : { background: '#fff', border: '1.5px solid rgba(46,43,41,0.10)', borderRadius: 20, padding: 16, marginBottom: 14, boxShadow: THEME.shadowSoft };
  const tileBg = onColorBg ? 'rgba(255,255,255,0.42)' : THEME.surface2;
  const title = { fontSize: 14, fontWeight: 800, marginBottom: 12, color: THEME.fg1 };
  const head = (icon, text) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, fontWeight: 800, color: THEME.fg1, marginBottom: 12 }}>
      <Icon name={icon} size={15} color={accent} stroke={2.5} />{text}
    </div>
  );

  // ── top bar (back · name · battle) ──
  const TopBar = ({ onColor }) => {
    const btn = onColor ? '#fff' : '#fff';
    const ink = THEME.fg1;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <button onClick={() => ctx.back()} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: btn, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="chevron-left" size={20} color={ink} stroke={2.4} /></button>
        <span className="game-font" style={{ fontSize: 18, fontWeight: 500, color: ink }}>{orig.name}</span>
        <button onClick={() => ctx.nav('battle')} style={{ width: 38, height: 38, borderRadius: 999, border: 'none', background: btn, boxShadow: THEME.shadowCard, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Icon name="swords" size={18} color={THEME.joy} stroke={2.2} /></button>
      </div>
    );
  };

  // ── shared body sections ──
  const traitsContent = (
    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
      {traits.map(t => {
        const v = orig.traits[t.k] || 50;
        const R = 27, SW = 6, sz = 2 * (R + SW), circ = 2 * Math.PI * R;
        return (
          <div key={t.k} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div className="game-font" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 500, color: THEME.fg1 }}>{v}</div>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: THEME.fg2 }}>{L(t.label)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
  const colorContent = (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      {swatches.map(s => {
        const sel = color === s;
        return (
          <button key={s} onClick={() => setColor(s)} style={{ width: 42, height: 42, borderRadius: 13, background: s, border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: sel ? `0 0 0 3px #fff, 0 0 0 5px ${s}` : 'inset 0 0 0 1px rgba(46,43,41,0.10)', transform: sel ? 'scale(1.05)' : 'none', transition: 'transform .12s ease' }}>
            {sel && <Icon name="check" size={20} color="#fff" stroke={3} />}
          </button>
        );
      })}
    </div>
  );
  const itemContent = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, width: '100%' }}>
      {items.map(it => (
        <div key={it.id} style={{ position: 'relative', borderRadius: 16, background: it.on ? `${accent}1c` : tileBg, border: it.on ? `2px solid ${accent}` : '2px solid transparent', padding: '12px 4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}><Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} /></div>
          <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
        </div>
      ))}
    </div>
  );
  const Panel = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* segmented tabs */}
      <div style={{ display: 'flex', gap: 4, background: onColorBg ? 'rgba(255,255,255,0.42)' : THEME.surface2, borderRadius: 16, padding: 4, marginBottom: 12, border: '1.5px solid rgba(46,43,41,0.08)' }}>
        {[['stat', L('Stats'), 'swords'], ['color', L('Color'), 'palette'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          // on the colored variants, gray inactive icons go muddy — use a readable buddy-tint instead
          const offText = onColorBg ? shade(color, -48) : THEME.fg2;
          const offIcon = onColorBg ? shade(color, -34) : THEME.fg3;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 12, padding: '9px 4px', background: on ? '#fff' : 'transparent', boxShadow: on ? THEME.shadowCard : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? accent : offText, fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={icon} size={14} color={on ? accent : offIcon} stroke={2.4} />{label}
            </button>
          );
        })}
      </div>
      {/* content */}
      <div style={{ ...card, marginBottom: 0, minHeight: 150, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? traitsContent : tab === 'color' ? colorContent : itemContent}
      </div>
    </div>
  );
  // ── showcase-only content: revamped layouts inside the white card ──
  // stats as refined rings — icon + value nested inside, soft tinted track, label below
  const traitsContentShowcase = (
    <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
      {traits.map(t => {
        const v = orig.traits[t.k] || 50;
        const R = 31, SW = 7, sz = 2 * (R + SW), circ = 2 * Math.PI * R;
        return (
          <div key={t.k} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative', width: sz, height: sz, margin: '0 auto' }}>
              <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={`${t.color}26`} strokeWidth={SW} />
                <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Icon name={t.icon} size={13} color={t.color} stroke={2.5} />
                <span className="game-font" style={{ fontSize: 16, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{v}</span>
              </div>
            </div>
            <span style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: THEME.fg2, marginTop: 9 }}>{L(t.label)}</span>
          </div>
        );
      })}
    </div>
  );
  // colors as a centered row of round swatches
  const colorContentShowcase = (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
      {swatches.map(s => {
        const sel = color === s;
        return (
          <button key={s} onClick={() => setColor(s)} style={{ width: 40, height: 40, borderRadius: 999, background: s, border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: sel ? `0 0 0 3px #fff, 0 0 0 5px ${s}, 0 4px 10px ${s}55` : `0 2px 6px ${s}40`, transform: sel ? 'scale(1.08)' : 'none', transition: 'transform .12s ease' }}>
            {sel && <Icon name="check" size={19} color="#fff" stroke={3} />}
          </button>
        );
      })}
    </div>
  );
  // items as 2-col rows with name + equip status
  const itemContentShowcase = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, width: '100%' }}>
      {items.map(it => (
        <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 16, background: it.on ? `${accent}14` : THEME.surface2, border: it.on ? `1.5px solid ${accent}` : '1.5px solid transparent', padding: '10px 12px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
            <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: it.locked ? THEME.fg3 : THEME.fg1, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{L(it.name)}</div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: it.on ? accent : THEME.fg3, marginTop: 1 }}>{it.locked ? L('Locked') : it.on ? L('Equipped') : L('Tap to equip')}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // showcase gets its own panel — floating frosted chip-tabs + a clean white
  // content card ringed with an accent glow, to match the premium pedestal hero.
  const PanelShowcase = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* chip tabs — each its own frosted pill; active fills with the buddy color */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['stat', L('Stats'), 'swords'], ['color', L('Color'), 'palette'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '10px 4px', background: on ? accent : 'rgba(255,255,255,0.55)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', boxShadow: on ? `0 8px 18px ${accent}55` : 'inset 0 0 0 1.5px rgba(255,255,255,0.75)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: on ? '#fff' : shade(color, -44), fontWeight: 800, fontSize: 12.5, transition: 'all .15s ease' }}>
              <Icon name={icon} size={14} color={on ? '#fff' : shade(color, -30)} stroke={2.5} />{label}
            </button>
          );
        })}
      </div>
      {/* content — solid white card with an accent ring */}
      <div style={{ background: '#fff', borderRadius: 24, padding: '22px 18px', minHeight: 150, display: 'flex', alignItems: 'center', border: `1.5px solid ${accent}24` }}>
        {tab === 'stat' ? traitsContentShowcase : tab === 'color' ? colorContentShowcase : itemContentShowcase}
      </div>
    </div>
  );
  // focus gets a single "tabbed card" — underline tabs sit inside the card,
  // with content styled as horizontal meters / preview-palette / item rail.
  const PanelFocus = (
    <div key="pn" style={{ ...card, marginBottom: 14, padding: 0, overflow: 'hidden' }}>
      {/* underline tab header */}
      <div style={{ display: 'flex', padding: '2px 6px 0', borderBottom: '1.5px solid rgba(46,43,41,0.08)' }}>
        {[['stat', L('Stats'), 'swords'], ['color', L('Color'), 'palette'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '12px 4px 13px', position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? accent : shade(color, -36), fontWeight: 800, fontSize: 12.5 }}>
              <Icon name={icon} size={14} color={on ? accent : shade(color, -24)} stroke={2.4} />{label}
              <span style={{ position: 'absolute', bottom: -1, left: '22%', right: '22%', height: 3, borderRadius: 3, background: on ? accent : 'transparent', transition: 'background .15s ease' }} />
            </button>
          );
        })}
      </div>
      {/* content */}
      <div style={{ padding: '18px 16px', minHeight: 132, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {traits.map(t => {
              const v = orig.traits[t.k] || 50;
              return (
                <div key={t.k} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                  <Icon name={t.icon} size={16} color={t.color} stroke={2.5} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, width: 46, flexShrink: 0 }}>{L(t.label)}</span>
                  <div style={{ flex: 1, height: 9, borderRadius: 999, background: `${t.color}26`, overflow: 'hidden' }}>
                    <div style={{ width: `${v}%`, height: '100%', borderRadius: 999, background: t.color, transition: 'width .7s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                  <span className="game-font" style={{ fontSize: 14, fontWeight: 500, color: THEME.fg1, width: 26, textAlign: 'right', flexShrink: 0 }}>{v}</span>
                </div>
              );
            })}
          </div>
        ) : tab === 'color' ? (
          // standard color picker — round swatches, selected gets a ring
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {swatches.map(s => {
              const sel = color === s;
              return (
                <button key={s} onClick={() => setColor(s)} style={{ width: 34, height: 34, borderRadius: 999, background: s, border: 'none', padding: 0, cursor: 'pointer', boxShadow: sel ? `0 0 0 2px #fff, 0 0 0 4px ${s}` : 'inset 0 0 0 1px rgba(46,43,41,0.10)', transition: 'box-shadow .12s ease' }} />
              );
            })}
          </div>
        ) : (
          <div className="no-sb" style={{ display: 'flex', gap: 10, width: '100%', overflowX: 'auto' }}>
            {items.map(it => (
              <div key={it.id} style={{ flex: 1, minWidth: 70, borderRadius: 16, background: it.on ? `${accent}16` : tileBg, border: it.on ? `1.5px solid ${accent}` : '1.5px solid transparent', padding: '12px 6px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
                  <Icon name={it.locked ? 'lock' : it.icon} size={16} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg2, textAlign: 'center', lineHeight: 1.1 }}>{L(it.name)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  const SetBtn = (
    <Button key="set" variant="primary" size="lg" fullWidth style={{ marginTop: 2, background: accent, boxShadow: 'none' }} onClick={() => { ctx.setBuddy(orig.id, { color, stage, level, species: orig.species, name: orig.name }); ctx.nav('home'); }}>{L('Set as my buddy')}</Button>
  );
  // wave gets its own panel — rounded pill tabs (accent-filled active),
  // a vertical bar chart for stats, square swatches, and 2×2 item cards.
  const PanelWave = (
    <div key="pn" style={{ marginBottom: 14 }}>
      {/* pill segmented tabs — active fills with the buddy color */}
      <div style={{ display: 'flex', gap: 4, background: THEME.surface2, borderRadius: 999, padding: 4, marginBottom: 12, border: '1.5px solid rgba(46,43,41,0.07)' }}>
        {[['stat', L('Stats'), 'swords'], ['color', L('Color'), 'palette'], ['item', L('Items'), 'shirt']].map(([id, label, icon]) => {
          const on = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 999, padding: '9px 4px', background: on ? accent : 'transparent', boxShadow: on ? `0 4px 10px ${accent}55` : 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? '#fff' : THEME.fg2, fontWeight: 800, fontSize: 12.5, transition: 'all .15s ease' }}>
              <Icon name={icon} size={14} color={on ? '#fff' : THEME.fg3} stroke={2.4} />{label}
            </button>
          );
        })}
      </div>
      {/* content card */}
      <div style={{ ...card, marginBottom: 0, minHeight: 150, display: 'flex', alignItems: 'center' }}>
        {tab === 'stat' ? (
          // semicircle gauges (speedometer style)
          <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            {traits.map(t => {
              const v = orig.traits[t.k] || 50;
              const R = 30, SW = 8, W = 2 * (R + SW), H = R + SW + 16, cy = R + SW, arc = Math.PI * R;
              return (
                <div key={t.k} style={{ textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: W, height: H }}>
                    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
                      <path d={`M ${SW} ${cy} A ${R} ${R} 0 0 1 ${W - SW} ${cy}`} fill="none" stroke={`${t.color}26`} strokeWidth={SW} strokeLinecap="round" />
                      <path d={`M ${SW} ${cy} A ${R} ${R} 0 0 1 ${W - SW} ${cy}`} fill="none" stroke={t.color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={arc} strokeDashoffset={arc * (1 - v / 100)} style={{ transition: 'stroke-dashoffset .7s cubic-bezier(.4,0,.2,1)' }} />
                    </svg>
                    <div className="game-font" style={{ position: 'absolute', left: 0, right: 0, top: cy - 19, fontSize: 18, fontWeight: 500, color: THEME.fg1, textAlign: 'center' }}>{v}</div>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Icon name={t.icon} size={12} color={t.color} stroke={2.5} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: THEME.fg2 }}>{L(t.label)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === 'color' ? (
          // square swatches, selected gets a ring + check
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
            {swatches.map(s => {
              const sel = color === s;
              return (
                <button key={s} onClick={() => setColor(s)} style={{ width: 36, height: 36, borderRadius: 11, background: s, border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: sel ? `0 0 0 2px #fff, 0 0 0 4px ${s}` : 'inset 0 0 0 1px rgba(46,43,41,0.10)' }}>
                  {sel && <Icon name="check" size={18} color="#fff" stroke={3} />}
                </button>
              );
            })}
          </div>
        ) : (
          // 2×2 item cards with a corner badge
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, width: '100%' }}>
            {items.map(it => (
              <div key={it.id} style={{ position: 'relative', borderRadius: 16, background: it.on ? `${accent}12` : THEME.surface2, border: it.on ? `2px solid ${accent}` : '2px solid transparent', padding: '13px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
                {it.on && <span style={{ position: 'absolute', top: 8, right: 8, width: 16, height: 16, borderRadius: 999, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={10} color="#fff" stroke={3.5} /></span>}
                <div style={{ width: 42, height: 42, borderRadius: 13, background: it.on ? accent : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: it.on ? 'none' : 'inset 0 0 0 1px rgba(46,43,41,0.06)' }}>
                  <Icon name={it.locked ? 'lock' : it.icon} size={19} color={it.locked ? THEME.fg3 : it.on ? '#fff' : THEME.fg2} stroke={2.3} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: it.locked ? THEME.fg3 : THEME.fg1, lineHeight: 1.15 }}>{L(it.name)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
  // Evolve CTA — shown in-flow when the buddy has maxed XP and isn't stage 3 yet
  const EvolveCTA = canEvolve ? (
    <button key="evolve" onClick={evolve} className="jx-press" style={{ width: '100%', marginBottom: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: accent, color: '#fff', borderRadius: 16, padding: '15px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, boxShadow: 'none' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9 }}>
          <span className="jx-pulse-soft" style={{ position: 'absolute', inset: 0, borderRadius: 999, background: '#fff' }} />
        </span>
        <span style={{ fontSize: 15.5, fontWeight: 800 }}>{L('Evolve now')}</span>
      </span>
      <span className="game-font" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,.9)' }}>
        {L('Stage')} {stage} <Icon name="arrow-right" size={13} color="rgba(255,255,255,.9)" stroke={2.8} /> {stage + 1}
      </span>
    </button>
  ) : null;
  const body = [variant === 'showcase' ? PanelShowcase : variant === 'focus' ? PanelFocus : variant === 'wave' ? PanelWave : Panel, EvolveCTA, SetBtn].filter(Boolean);

  // ── mascot (centered) ──
  const Buddy = ({ size }) => (
    <div className="jx-float" style={{ display: 'flex', justifyContent: 'center' }}>
      <Mascot species={orig.species} stage={stage} color={color} size={size} context="detail" />
    </div>
  );
  const Badges = (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
      <Badge variant={orig.rarity === 'special' ? 'special' : orig.rarity === 'rare' ? 'primary' : 'default'}>{L(RARITY[orig.rarity].label)}</Badge>
      <Badge variant="gold">{L('Stage')} {stage}</Badge>
    </div>
  );
  const xpRow = (inkSub) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 260, margin: '12px auto 0' }}>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: inkSub || THEME.fg2 }}>XP</span>
      <div style={{ flex: 1 }}><Bar value={orig.xp} max={orig.xpMax} color={THEME.gold} glow /></div>
      <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: inkSub || THEME.fg1 }}>{orig.xp}/{orig.xpMax}</span>
    </div>
  );

  // ── per-variant background ──
  const ink = shade(color, -52);
  const bg = ({
    cover: THEME.surface2,
    wave: '#fff',
    vivid: `linear-gradient(180deg, ${shade(color, 96)} 0%, ${shade(color, 38)} 60%, ${shade(color, 2)} 100%)`,
    focus: `linear-gradient(180deg, ${THEME.surface2}00 0%, ${THEME.surface2}00 210px, ${THEME.surface2} 540px), linear-gradient(125deg, ${mixHue(color, -24, 0.06, 0.78)} 0%, ${mixHue(color, 4, 0.10, 0.72)} 50%, ${mixHue(color, 26, 0.14, 0.6)} 100%), ${THEME.surface2}`,
    showcase: `linear-gradient(180deg, ${shade(color, 74)} 0%, ${shade(color, 102)} 32%, ${THEME.surface2} 60%)`,
  })[variant] || THEME.screenBg;

  // ── hero per variant ──
  let hero;
  if (variant === 'cover') {
    hero = (
      <div style={{ background: `linear-gradient(160deg, ${shade(color, 60)}, ${shade(color, 104)})`, borderRadius: '0 0 28px 28px', padding: '50px 18px 22px' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ textAlign: 'center', marginTop: 6 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={150} /></div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
      </div>
    );
  } else if (variant === 'wave') {
    hero = (
      <div style={{ position: 'relative', background: `linear-gradient(160deg, ${shade(color, 70)}, ${shade(color, 104)})`, padding: '50px 18px 0' }}>
        <TopBar />
        <div style={{ textAlign: 'center', marginTop: 6, paddingBottom: 30 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={150} /></div>
          <div className="game-font" style={{ fontSize: 25, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .8, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
        <svg viewBox="0 0 390 34" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, right: 0, bottom: -1, width: '100%', height: 34, display: 'block' }}>
          <path d="M0 34 V14 Q195 40 390 14 V34 Z" fill="#fff" />
        </svg>
      </div>
    );
  } else if (variant === 'focus') {
    const R = 96, SW = 10, ring = 2 * (R + SW), circ = 2 * Math.PI * R, pct = Math.min(1, orig.xp / orig.xpMax);
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ position: 'relative', width: ring, height: ring, margin: '12px auto 0', cursor: 'pointer' }}>
          <div style={{ position: 'absolute', inset: 18, borderRadius: 999, background: `radial-gradient(circle at 50% 45%, ${color}30 0%, ${color}00 72%)` }} />
          <svg width={ring} height={ring} viewBox={`0 0 ${ring} ${ring}`} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
            <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={THEME.border} strokeWidth={SW} />
            <circle cx={R + SW} cy={R + SW} r={R} fill="none" stroke={color} strokeWidth={SW} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} style={{ filter: `drop-shadow(0 0 6px ${shade(color, 40)})` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Buddy size={148} /></div>
        </div>
        <div style={{ textAlign: 'center', padding: '18px 24px 0' }}>
          {Badges}
          <div className="game-font" style={{ fontSize: 24, fontWeight: 500, marginTop: 6 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: THEME.fg2, fontWeight: 600 }}>{L('Level')} {level} · {orig.xp}/{orig.xpMax} XP</div>
        </div>
      </div>
    );
  } else if (variant === 'vivid') {
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ textAlign: 'center', marginTop: 8 }}>
          {Badges}
          <div style={{ marginTop: 6 }}><Buddy size={158} /></div>
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: ink, opacity: .82, fontWeight: 600 }}>{L('Level')} {level}</div>
          {xpRow(ink)}
        </div>
      </div>
    );
  } else { // showcase — buddy on a glowing pedestal with a spotlight
    hero = (
      <div style={{ padding: '50px 18px 0' }}>
        <TopBar />
        <div onClick={() => ctx.nav('character', { id: orig.id })} style={{ position: 'relative', textAlign: 'center', marginTop: 8, cursor: 'pointer' }}>
          <div style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', width: 250, height: 210, background: `radial-gradient(circle at 50% 28%, ${color}2e 0%, ${color}00 64%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}><Buddy size={162} /></div>
          <div style={{ width: 168, height: 30, borderRadius: '50%', margin: '-12px auto 0', background: `radial-gradient(ellipse at 50% 40%, ${shade(color, 62)} 0%, ${shade(color, 104)} 58%, ${shade(color, 104)}00 78%)` }} />
        </div>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          {Badges}
          <div className="game-font" style={{ fontSize: 26, fontWeight: 500, color: THEME.fg1, marginTop: 6 }}>{orig.name}</div>
          <div style={{ fontSize: 12.5, color: shade(color, -34), fontWeight: 700 }}>{L('Level')} {level}</div>
          {xpRow(THEME.fg2)}
        </div>
      </div>
    );
  }

  const pad = '14px 18px 0';

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingBottom: 110, background: bg }}>
      {hero}
      <div style={{ padding: pad }}>{body}</div>

      {/* evolve moment (F-16) — burst + the buddy re-skinning to its next stage */}
      {evolving && (
        <div className="jx-fade" style={{ position: 'absolute', inset: 0, zIndex: 70, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: `radial-gradient(circle at 50% 42%, ${shade(color, 16)} 0%, #17130f 74%)` }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 230, height: 230, marginBottom: 20 }}>
            <div className="jx-burst" style={{ position: 'absolute', width: 240, height: 240, borderRadius: 999, background: `radial-gradient(circle, ${shade(color, 52)} 0%, transparent 66%)` }} />
            <div className="jx-ring" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, border: `2px solid ${shade(color, 44)}99` }} />
            <div className="jx-ring-slow" style={{ position: 'absolute', width: 210, height: 210, borderRadius: 999, border: `2px solid ${shade(color, 44)}99` }} />
            <div key={stage} className="jx-pop" style={{ position: 'relative' }}><Mascot species={orig.species} stage={stage} color={color} size={170} context="detail" /></div>
          </div>
          <div className="game-font" style={{ color: '#fff', fontSize: 26, fontWeight: 500 }}>
            {evolvedStage
              ? (getLang() === 'ko' ? `스테이지 ${evolvedStage} 도달!` : `Reached Stage ${evolvedStage}!`)
              : L('Evolving…')}
          </div>
          {evolvedStage && <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13.5, marginTop: 6 }}>{orig.name} · {L('grew stronger')}</div>}
        </div>
      )}
    </div>
  );
}

function CharDetailVariant({ layout, ctx }) {
  if (!layout || layout === 'original') return <CharacterDetail ctx={ctx} />;
  return <CharVariant variant={layout.replace('char-', '')} ctx={ctx} />;
}

export { CharDetailVariant };
