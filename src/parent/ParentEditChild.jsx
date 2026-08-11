// JoanX — parent app · ParentEditChild
//
// Full-page edit for a child's own profile — the same fields Add child collects
// up front (ParentAddChild.jsx), now editable after setup from Rules & settings.
// A page, not a sheet, to match the sibling pattern for this kind of multi-field
// form (ParentSchedule.jsx is the same shape for a time rule).

import React from 'react';
import { CHILDREN } from '../core/data.jsx';
import { Button, DateField, Icon, Input, SelectField, THEME, formatPhone, screenBgFor } from '../core/primitives.jsx';
import { L } from '../core/i18n.jsx';
import { BRAND, ParentHead, brandBtn } from './shared.jsx';

function ParentEditChild({ ctx }) {
  const child = ctx.params?.child || CHILDREN[0];
  const ko = ctx.lang === 'ko';
  const ageFromDob = v => { if (!v) return null; const [y, m, d] = v.split('-').map(Number); const t = new Date(); let a = t.getFullYear() - y; const mo = t.getMonth() + 1; if (mo < m || (mo === m && t.getDate() < d)) a--; return a >= 0 ? a : null; };

  const [name, setName] = React.useState(child.name);
  const [dob, setDob] = React.useState(child.dob || '');
  const [relation, setRelation] = React.useState(child.relation || '');
  const [sibling, setSibling] = React.useState(child.sibling || '');
  const [phone, setPhone] = React.useState(child.phone || '');
  const age = ageFromDob(dob);

  const save = () => {
    if (!name.trim()) return;
    Object.assign(child, { name: name.trim(), dob, relation, sibling, phone, ...(age != null ? { age } : {}) });
    // savedToast is a one-shot flag Rules & settings reads on mount to show its
    // confirmation pill — same idiom as the pointsFx trigger on the child Home tab.
    ctx.nav('p_settings', { child, savedToast: true });
  };

  return (
    <div className="no-sb" style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 50, paddingBottom: 110, background: screenBgFor(BRAND.primary) }}>
      <ParentHead sub={child.name} title={L('Edit child')} onBack={() => ctx.nav('p_settings', { child })} />
      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: THEME.shadowCard, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label={L("Child's name")} value={name} onChange={e => setName(e.target.value)} placeholder={L('e.g. Mina')} icon="user" accent={BRAND.ink} />
          <div>
            <DateField label={L("Child's date of birth")} value={dob ? new Date(dob + 'T00:00') : null}
              onChange={d => setDob(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)} accent={BRAND.ink} />
            {dob && age != null && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8, padding: '4px 11px', borderRadius: 999, background: THEME.surface2, color: THEME.fg2, fontSize: 12.5, fontWeight: 800 }}>
                <Icon name="cake" size={13} color={THEME.fg3} stroke={2.3} />{ko ? `만 ${age}세` : `${age} ${age === 1 ? 'year' : 'years'} old`}
              </div>
            )}
          </div>
          <SelectField label={L('Relationship to you')} title={L('Relationship to you')} value={relation} onChange={setRelation} accent={BRAND.ink}
            options={[['son', 'Son'], ['daughter', 'Daughter'], ['grandchild', 'Grandchild'], ['other', 'Other child in my care']].map(([v, l]) => ({ value: v, label: L(l) }))} />
          <SelectField label={L('Position among siblings')} title={L('Position among siblings')} value={sibling} onChange={setSibling} accent={BRAND.ink}
            options={[['oldest', 'Oldest child'], ['middle', 'Middle child'], ['youngest', 'Youngest child'], ['only', 'Only child']].map(([v, l]) => ({ value: v, label: L(l) }))} />
          <Input label={L("Child's phone number")} value={phone} onChange={e => setPhone(formatPhone(e.target.value))} placeholder="010-1234-5678" type="tel" accent={BRAND.ink} />
        </div>

        <Button variant="primary" size="lg" fullWidth style={brandBtn} disabled={!name.trim()} onClick={name.trim() ? save : undefined}>{L('Save')}</Button>
      </div>
    </div>
  );
}

export { ParentEditChild };
