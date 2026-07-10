// JoanX — child app · dex completion-header explorations (9 variants)
// One data model (have / total / label / accent), nine presentations.
// Switch via the Tweaks panel ("Dex header"). Shared by the character dex,
// the villain dex, and every dex layout variant.

import React from 'react';
import { Bar, Icon, THEME } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';

const DEX_HEADERS = [
  { id: 'rows', label: 'Rows' },
  { id: 'fullBar', label: 'Full bar' },
  { id: 'topRule', label: 'Top rule' },
  { id: 'spine', label: 'Spine' },
  { id: 'outline', label: 'Outline' },
  { id: 'ring', label: 'Ring' },
  { id: 'meter', label: 'Meter' },
  { id: 'fill', label: 'Fill' },
  { id: 'plate', label: 'Plate' },
  { id: 'strip', label: 'Strip' },
  { id: 'tint', label: 'Tint' },
  { id: 'underline', label: 'Underline' },
  { id: 'shelf', label: 'Shelf' },
];

const CARD = { background: '#fff', borderRadius: 18, boxShadow: THEME.shadowCard, marginBottom: 16 };
const EASE = 'cubic-bezier(.4,0,.2,1)';

function DexHeader({ variant = 'rows', have, total, label, icon = 'book-open', accent = THEME.gold, accentLight = THEME.goldLight }) {
  const frac = total > 0 ? have / total : 0;
  const pct = Math.round(frac * 100);
  const done = have >= total;

  const Check = ({ size = 12 }) => done ? <Icon name="check" size={size} color={accent} stroke={3} /> : null;
  const emblem = (s = 58, r = 20, ic = 26) => (
    <div style={{ width: s, height: s, borderRadius: r, background: accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={icon} size={ic} color={accent} stroke={2.2} />
    </div>
  );

  // 1 · ROWS — same skeleton as the dex rows: 66px art column, title, meta, bar
  if (variant === 'rows') return (
    <div style={{ ...CARD, display: 'flex', gap: 14, alignItems: 'center', padding: 14 }}>
      <div style={{ width: 66, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>{emblem()}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>{L(label)}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: accentLight, padding: '2px 8px', borderRadius: 999 }}>
            <Check size={10} /><span className="game-font" style={{ fontSize: 10, fontWeight: 500, color: THEME.fg1 }}>{pct}%</span>
          </span>
        </div>
        <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{have} {L('of')} {total}</div>
        <div style={{ marginTop: 10 }}><Bar value={have} max={total} color={accent} track={accentLight} height={5} /></div>
      </div>
    </div>
  );

  // 2 · FULL BAR — number in the trailing slot, bar spans the whole card
  if (variant === 'fullBar') return (
    <div style={{ ...CARD, padding: 14 }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ width: 66, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>{emblem()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{L(label)}</div>
          <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{have} {L('of')} {total}</div>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Check size={14} />
          <span className="game-font" style={{ fontSize: 19, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{pct}%</span>
        </div>
      </div>
      <div style={{ marginTop: 13 }}><Bar value={have} max={total} color={accent} track={accentLight} height={5} /></div>
    </div>
  );

  // 3 · TOP RULE — progress welded to the card's top edge
  if (variant === 'topRule') return (
    <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: accentLight }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, transition: `width .6s ${EASE}` }} />
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '18px 14px 14px' }}>
        <div style={{ width: 66, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>{emblem()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800 }}>{L(label)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            <Check /><span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{pct}% {L('collected')}</span>
          </div>
        </div>
        <div className="game-font" style={{ flexShrink: 0, fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>
          {have}<span style={{ color: THEME.fg3 }}>/{total}</span>
        </div>
      </div>
    </div>
  );

  // 4 · SPINE — a gilt band down the left edge, filling bottom-up
  if (variant === 'spine') return (
    <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 5, background: accentLight }}>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${pct}%`, background: accent, transition: `height .6s ${EASE}` }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, padding: '15px 16px 15px 21px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name={icon} size={15} color={accent} stroke={2.4} />
            <span style={{ fontSize: 15, fontWeight: 800 }}>{L(label)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
            <Check /><span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{pct}% {L('collected')}</span>
          </div>
        </div>
        <div className="game-font" style={{ flexShrink: 0, fontSize: 26, fontWeight: 500, color: THEME.fg1, lineHeight: .95 }}>
          {have}<span style={{ fontSize: 17, color: THEME.fg3 }}>/{total}</span>
        </div>
      </div>
    </div>
  );

  // 5 · OUTLINE — flat outlined surface, split by a rule, hairline on the bottom
  if (variant === 'outline') return (
    <div style={{ ...CARD, boxShadow: 'none', border: `1.5px solid ${THEME.border}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flexShrink: 0, padding: '15px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 96 }}>
          <div className="game-font" style={{ fontSize: 27, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{pct}%</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Check size={11} /><span style={{ fontSize: 11, color: THEME.fg3, fontWeight: 600 }}>{L('collected')}</span>
          </div>
        </div>
        <div style={{ width: 1, background: THEME.border, flexShrink: 0, margin: '14px 0' }} />
        <div style={{ flex: 1, minWidth: 0, padding: '15px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name={icon} size={15} color={accent} stroke={2.4} />
            <span style={{ fontSize: 14.5, fontWeight: 800, minWidth: 0 }}>{L(label)}</span>
          </div>
          <div className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg3, marginTop: 4 }}>{have} / {total}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 3, background: accentLight }}>
        <div style={{ width: `${pct}%`, height: '100%', background: accent, transition: `width .6s ${EASE}` }} />
      </div>
    </div>
  );

  // 6 · RING — the percentage is a dial, the icon sits inside it
  if (variant === 'ring') {
    const R = 25, C = 2 * Math.PI * R;
    return (
      <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 15, padding: 16 }}>
        <div style={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
          <svg width={62} height={62} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
            <circle cx={31} cy={31} r={R} fill="none" stroke={accentLight} strokeWidth={6} />
            <circle cx={31} cy={31} r={R} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - frac)} style={{ transition: `stroke-dashoffset .6s ${EASE}` }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name={icon} size={24} color={accent} stroke={2.2} />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span className="game-font" style={{ fontSize: 24, fontWeight: 500, color: THEME.fg1, lineHeight: 1.1 }}>{pct}%</span>
            <span style={{ fontSize: 12, color: THEME.fg3, fontWeight: 600 }}>{have} {L('of')} {total}</span>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg2, marginTop: 1 }}>{L(label)}</div>
        </div>
      </div>
    );
  }

  // 7 · METER — typographic: label and count on one line, the number carries it
  if (variant === 'meter') return (
    <div style={{ ...CARD, padding: '15px 16px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon name={icon} size={15} color={accent} stroke={2.3} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, color: THEME.fg2 }}>{L(label)}</span>
        <span className="game-font" style={{ fontSize: 12, fontWeight: 500, color: THEME.fg2, background: accentLight, borderRadius: 999, padding: '3px 9px' }}>{have} / {total}</span>
      </div>
      <div className="game-font" style={{ fontSize: 32, fontWeight: 500, color: THEME.fg1, lineHeight: 1, margin: '12px 0 11px' }}>{pct}%</div>
      <Bar value={have} max={total} color={accent} track={accentLight} height={6} />
    </div>
  );

  // 8 · FILL — the card itself is the meter, tinted to the completion point
  if (variant === 'fill') return (
    <div style={{ ...CARD, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: `${pct}%`, background: accentLight, borderRight: pct > 0 && pct < 100 ? `2px solid ${accent}` : 'none', transition: `width .6s ${EASE}` }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, padding: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name={icon} size={14} color={accent} stroke={2.4} />
            <span style={{ fontSize: 12.5, fontWeight: 700, color: THEME.fg2 }}>{L(label)}</span>
          </div>
          <div className="game-font" style={{ fontSize: 30, fontWeight: 500, color: THEME.fg1, lineHeight: 1, marginTop: 7 }}>{pct}%</div>
        </div>
        <div className="game-font" style={{ flexShrink: 0, fontSize: 15, fontWeight: 500, color: THEME.fg2, alignSelf: 'flex-end' }}>{have} / {total}</div>
      </div>
    </div>
  );

  // 9 · PLATE — centred bookplate: emblem over the numeral, rule beneath
  if (variant === 'plate') return (
    <div style={{ ...CARD, padding: '18px 16px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {emblem(52, 18, 24)}
      <div className="game-font" style={{ fontSize: 30, fontWeight: 500, color: THEME.fg1, lineHeight: 1, marginTop: 10 }}>{pct}%</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5 }}>
        <Check size={12} />
        <span style={{ fontSize: 12, color: THEME.fg2, fontWeight: 700 }}>{L(label)}</span>
        <span className="game-font" style={{ fontSize: 12, color: THEME.fg3, fontWeight: 500 }}>{have}/{total}</span>
      </div>
      <div style={{ alignSelf: 'stretch', marginTop: 13 }}>
        <Bar value={have} max={total} color={accent} track={accentLight} height={5} />
      </div>
    </div>
  );

  // 10 · STRIP — a single line: the bar runs inline between label and count,
  // so the header costs one row of height instead of three
  if (variant === 'strip') return (
    <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px' }}>
      <Icon name={icon} size={16} color={accent} stroke={2.4} />
      <span style={{ flexShrink: 0, fontSize: 13, fontWeight: 800, color: THEME.fg1 }}>{L(label)}</span>
      <div style={{ flex: 1, minWidth: 24 }}>
        <Bar value={have} max={total} color={accent} track={accentLight} height={6} />
      </div>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Check size={12} />
        <span className="game-font" style={{ fontSize: 13, fontWeight: 500, color: THEME.fg1 }}>
          {have}<span style={{ color: THEME.fg3 }}>/{total}</span>
        </span>
      </div>
    </div>
  );

  // 11 · TINT — the card is the accent's pale surface, not white. The emblem
  // and the bar's track invert to white, so the card reads as one tinted panel
  // rather than a white card carrying tinted parts.
  if (variant === 'tint') return (
    <div style={{ ...CARD, boxShadow: 'none', background: accentLight, display: 'flex', gap: 13, alignItems: 'center', padding: 14 }}>
      <div style={{ width: 52, height: 52, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={24} color={accent} stroke={2.2} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{L(label)}</span>
          <Check size={13} />
        </div>
        <div style={{ fontSize: 11.5, color: THEME.fg2, fontWeight: 600, marginTop: 2 }}>{have} {L('of')} {total}</div>
        <div style={{ marginTop: 9 }}>
          <Bar value={have} max={total} color={accent} track="#fff" height={5} />
        </div>
      </div>
      <div className="game-font" style={{ flexShrink: 0, alignSelf: 'flex-start', fontSize: 19, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>{pct}%</div>
    </div>
  );

  // 12 · UNDERLINE — the progress *is* the title's underline: an inline-block
  // wrapper shrinks the track to the width of the label text, so the rule grows
  // under the word rather than across the card.
  if (variant === 'underline') return (
    <div style={{ ...CARD, display: 'flex', gap: 13, alignItems: 'center', padding: '15px 16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'inline-block' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Icon name={icon} size={16} color={accent} stroke={2.4} />
            <span style={{ fontSize: 16, fontWeight: 800, color: THEME.fg1, whiteSpace: 'nowrap' }}>{L(label)}</span>
          </div>
          <div style={{ height: 3, borderRadius: 999, background: accentLight, marginTop: 7, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: accent, transition: `width .6s ${EASE}` }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 7 }}>
          <Check size={12} />
          <span style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600 }}>{pct}% {L('collected')}</span>
        </div>
      </div>
      <div className="game-font" style={{ flexShrink: 0, fontSize: 24, fontWeight: 500, color: THEME.fg1, lineHeight: 1 }}>
        {have}<span style={{ fontSize: 16, color: THEME.fg3 }}>/{total}</span>
      </div>
    </div>
  );

  // 13 · SHELF — reuses the Collection room-card motif: the emblem stands on a
  // shelf line, and that shelf *is* the progress. Same 8px / rgba(0,0,0,.05)
  // track as Collection.jsx, so the two screens share a visual idea.
  if (variant === 'shelf') return (
    <div style={{ ...CARD, padding: '14px 14px 12px' }}>
      <div style={{ display: 'flex', gap: 13, alignItems: 'flex-end' }}>
        <div style={{ flexShrink: 0 }}>{emblem(56, 19, 25)}</div>
        <div style={{ flex: 1, minWidth: 0, paddingBottom: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: THEME.fg1 }}>{L(label)}</span>
            <Check size={13} />
          </div>
          <div style={{ fontSize: 11.5, color: THEME.fg3, fontWeight: 600, marginTop: 2 }}>{pct}% {L('collected')}</div>
        </div>
        <div className="game-font" style={{ flexShrink: 0, fontSize: 20, fontWeight: 500, color: THEME.fg1, lineHeight: 1, paddingBottom: 2 }}>
          {have}<span style={{ fontSize: 14, color: THEME.fg3 }}>/{total}</span>
        </div>
      </div>

      {/* the shelf everything rests on, filled to the completion point */}
      <div style={{ height: 8, borderRadius: 999, background: 'rgba(0,0,0,.05)', marginTop: 6, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: accent, transition: `width .6s ${EASE}` }} />
      </div>
    </div>
  );

  return null;
}

export { DexHeader, DEX_HEADERS };
