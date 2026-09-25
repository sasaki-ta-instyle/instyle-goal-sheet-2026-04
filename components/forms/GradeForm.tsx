'use client';
import { GRADE_TABLE, Grade, GradeExpectations } from '@/lib/types';

interface Props {
  selectedGrade: Grade | '';
  expectations: GradeExpectations;
  onChange: (expectations: GradeExpectations) => void;
}

const expectKey = (key: string): string => key.replace("'", '');

export default function GradeForm({ selectedGrade, expectations, onChange }: Props) {
  const update = (key: string, value: string) =>
    onChange({ ...expectations, [key]: value });

  return (
    <div>
      <p className="section-title">05｜グレード表</p>
      <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
        各グレードに求める目安を入力してください。カバーで選択したグレードをハイライト表示します。
      </p>

      {selectedGrade && (
        <div style={{
          background: 'rgba(32,33,26,.08)',
          border: '1px solid rgba(32,33,26,.16)',
          borderRadius: 'var(--r)',
          padding: '12px 20px',
          marginBottom: 24,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>選択中のグレード:</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedGrade}</span>
        </div>
      )}

      <div className="table-wrap">
        <table className="data-table" style={{ fontSize: '.875rem', tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: 48 }} />
            <col style={{ width: 110 }} />
            <col style={{ width: 80 }} />
            <col style={{ width: 130 }} />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th style={{ textAlign: 'center' }}>グレード</th>
              <th style={{ textAlign: 'center' }}>月給合計（円/月）</th>
              <th>各人が各クラスに求める目安</th>
            </tr>
          </thead>
          <tbody>
            {GRADE_TABLE.flatMap(tier => {
              const grades = tier.grades;

              if (grades.length === 1) {
                const entry = grades[0];
                const isSelected = entry.key === selectedGrade;
                return [(
                  <tr key={entry.key} style={isSelected ? { background: 'rgba(32,33,26,.12)' } : {}}>
                    <td style={{ fontWeight: 700, fontSize: '1.125rem', textAlign: 'center', background: 'rgba(32,33,26,.08)', verticalAlign: 'middle' }}>
                      {tier.tier}
                    </td>
                    <td style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', verticalAlign: 'middle' }}>
                      {tier.tierName}
                    </td>
                    <td style={{ fontWeight: 500, whiteSpace: 'nowrap', textAlign: 'center', fontSize: '.75rem' }}>社長</td>
                    <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{entry.salary}</td>
                    <td>
                      <textarea
                        className="input"
                        style={{ padding: '6px 10px', fontSize: '.8125rem', minHeight: 52, resize: 'vertical' }}
                        value={expectations[expectKey(entry.key)] ?? ''}
                        onChange={e => update(expectKey(entry.key), e.target.value)}
                        placeholder={`${tier.tier}に求める目安・行動基準`}
                      />
                    </td>
                  </tr>
                )];
              }

              return grades.map((entry, gIdx) => {
                const isSelected = entry.key === selectedGrade;
                const eKey = expectKey(entry.key);
                const showTierCells = gIdx === 0;
                const showTextarea = gIdx === 0 || gIdx === 2;

                return (
                  <tr key={entry.key} style={isSelected ? { background: 'rgba(32,33,26,.12)' } : {}}>
                    {showTierCells && (
                      <td
                        rowSpan={grades.length}
                        style={{ fontWeight: 700, fontSize: '1.125rem', textAlign: 'center', background: 'rgba(32,33,26,.08)', verticalAlign: 'middle' }}
                      >
                        {tier.tier}
                      </td>
                    )}
                    {showTierCells && (
                      <td
                        rowSpan={grades.length}
                        style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', verticalAlign: 'middle' }}
                      >
                        {tier.tierName}
                      </td>
                    )}
                    <td style={{ fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        {isSelected && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 18, height: 18, borderRadius: '50%',
                            border: '2px solid var(--color-text)',
                            fontSize: '.55rem', fontWeight: 700,
                          }}>○</span>
                        )}
                        {entry.key}
                      </span>
                    </td>
                    <td style={{ fontWeight: isSelected ? 700 : 400, whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {entry.salary}
                    </td>
                    {showTextarea && (
                      <td rowSpan={2}>
                        <textarea
                          className="input"
                          style={{ padding: '6px 10px', fontSize: '.8125rem', minHeight: 52, resize: 'vertical' }}
                          value={expectations[eKey] ?? ''}
                          onChange={e => update(eKey, e.target.value)}
                          placeholder={`${eKey}に求める目安・行動基準`}
                        />
                      </td>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: 12 }}>※ 2026年10月時点</p>
    </div>
  );
}
