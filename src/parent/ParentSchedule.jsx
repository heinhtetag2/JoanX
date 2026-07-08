// JoanX — parent app · ParentSchedule

import React from 'react';
import { CHILDREN } from '../core/data.jsx';
import { Button, Input, THEME, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, brandBtn, ParentHead, RULE_TAG_COLORS } from './shared.jsx';

// ── Schedule editor (add / edit a child's time rule) ─────────────────
function ParentSchedule({ ctx }) {
  const child = ctx.params?.child || CHILDREN[0];
  const editing = ctx.params?.rule || null;
  const index = ctx.params?.index != null ? ctx.params.index : -1;
  const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const [name, setName] = React.useState(editing ? editing.t : '');
  const [tag, setTag] = React.useState(editing ? editing.tag : 'Balanced');
  const [days, setDays] = React.useState([0, 1, 2, 3, 4]);
  const [start, setStart] = React.useState('8:00 AM');
  const [end, setEnd] = React.useState('8:40 AM');

  const toggleDay = d => setDays(s => s.includes(d) ? s.filter(x => x !== d) : [...s, d].sort((a, b) => a - b));

  const composeWhen = () => {
    const s = [...days].sort((a, b) => a - b);
    let dl;
    if (s.length === 7) dl = 'Daily';
    else if (s.join() === '0,1,2,3,4') dl = 'Mon–Fri';
    else if (s.join() === '5,6') dl = 'Weekends';
    else if (!s.length) dl = '';
    else dl = s.map(i => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]).join(', ');
    const tl = (start && end) ? `${start}–${end}` : '';
    return [dl, tl].filter(Boolean).join(' · ');
  };

  const save = () => {
    const rule = { t: name.trim() || 'New schedule', s: composeWhen() || (editing ? editing.s : ''), tag };
    if (!child.cfg.rules) child.cfg.rules = [];
    if (index >= 0) child.cfg.rules[index] = rule; else child.cfg.rules.push(rule);
    ctx.nav('p_settings', { child });
  };
  const remove = () => {
    if (index >= 0 && child.cfg.rules) child.cfg.rules.splice(index, 1);
    ctx.nav('p_settings', { child });
  };

  const label = t => <div style={{ fontSize: 12, fontWeight: 700, color: THEME.fg2, margin: '4px 4px 8px', textTransform: 'uppercase', letterSpacing: .4 }}>{t}</div>;

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={child.name} title={editing ? L('Edit schedule') : L('New schedule')} onBack={() => ctx.nav('p_settings', { child })} />
      <div style={{ padding: '8px 16px 0' }}>

        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18 }}>
          <Input label={L('Schedule name')} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. School commute')} icon="clock" accent={BRAND.ink} />
        </div>

        {label(L('Protection level'))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {['Strict', 'Balanced', 'Relaxed'].map(t => {
            const active = tag === t, col = RULE_TAG_COLORS[t];
            return <button key={t} onClick={() => setTag(t)} style={{ flex: 1, border: `1.5px solid ${active ? 'transparent' : THEME.border}`, background: active ? col.bg : '#fff', color: active ? col.c : THEME.fg2, borderRadius: 14, padding: '12px 8px', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 800, cursor: 'pointer', boxShadow: active ? THEME.shadowCard : 'none' }}>{L(t)}</button>;
          })}
        </div>

        {label(L('Active days'))}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
          {DAYS.map((d, i) => {
            const on = days.includes(i);
            return <button key={i} onClick={() => toggleDay(i)} style={{ flex: 1, height: 42, border: 'none', borderRadius: 12, background: on ? THEME.fg1 : THEME.surface2, color: on ? '#fff' : THEME.fg2, fontFamily: 'inherit', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{d}</button>;
          })}
        </div>

        {label(L('Time'))}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('Start')} value={start} onChange={e => setStart(e.target.value)} placeholder="8:00 AM" icon="sunrise" accent={BRAND.ink} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><Input label={L('End')} value={end} onChange={e => setEnd(e.target.value)} placeholder="8:40 AM" icon="sunset" accent={BRAND.ink} /></div>
        </div>

        <Button variant="primary" fullWidth icon="check" onClick={save} style={{ ...brandBtn, marginBottom: 10 }}>{L('Save schedule')}</Button>
        {editing && <Button variant="outline" fullWidth icon="trash-2" onClick={remove} style={{ color: THEME.danger, boxShadow: 'none' }}>{L('Delete schedule')}</Button>}
      </div>
    </div>
  );
}

export { ParentSchedule };
