'use client';
import { PersonalGoalData, CommitmentRow, Grade, getAnnualSalaryByGrade } from '@/lib/types';

interface Props {
  data: PersonalGoalData;
  grade: Grade | '';
  onChange: (data: PersonalGoalData) => void;
}

const ITEM_INDEX = ['①', '②', '③'];

export default function CommitmentForm({ data, grade, onChange }: Props) {
  const updateCommitment = (i: number, field: keyof CommitmentRow, value: string) => {
    const arr = data.commitment.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
    onChange({ ...data, commitment: arr });
  };
  const formatYen = (raw: string) => {
    if (!raw) return '';
    const n = Number(raw);
    if (!Number.isFinite(n)) return raw;
    return n.toLocaleString('ja-JP');
  };
  const parseYen = (v: string) =>
    v.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)).replace(/[^\d]/g, '');

  const rows = data.commitment.slice(0, 3);
  const total = rows.reduce((s, r) => s + (parseInt(r.amount || '0', 10) || 0), 0);

  const baseAnnual = getAnnualSalaryByGrade(grade);
  const hasBase = baseAnnual != null;
  const diff = hasBase ? total - baseAnnual : null;
  const diffSign = diff == null ? '' : diff > 0 ? '+' : diff < 0 ? '−' : '±';
  const diffAbs = diff == null ? 0 : Math.abs(diff);
  const diffPct = hasBase && baseAnnual > 0 && diff != null
    ? Math.round((diff / baseAnnual) * 1000) / 10
    : null;
  const diffPctAbs = diffPct == null ? 0 : Math.abs(diffPct);

  return (
    <div>
      <p className="section-title">05｜ギャランティ 記入シート</p>

      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
        経営はお金でお金を買うこと。報酬は申告するものではなく、あなたが<strong>バリューを出す約束をした分だけ保証されるもの</strong>であり、成長し、達成した結果、獲得するものです。
      </p>
      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.6 }}>
        あなたの報酬、年収で、西村さんは何を買えるのか？<br />
        あなたはあなたの報酬で、何をチームや会社、西村さんに売ろうとしているのか？<br />
        あなたはどうバリューを出すのか？ どう貢献するのか？<br />
        あなたのその<strong>約束＝保証（ギャランティ）</strong>に対して支払われるものが<strong>報酬（ギャランティ）</strong>です。
      </p>
      <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
        あなたが1年で売ろうとしているもの（貢献内容）の価値が<strong>あなたの報酬、年収を超える</strong>ようにしてください。赤字である場合は正直にそう申告して、改善してください。あまりにバリューと報酬がかけ離れていれば、その調整のために<strong>降格・降給</strong>します。あなたが今期、どれだけの貢献をするつもりかを、<strong>数字的根拠</strong>と共に書き出してください。ここで出された数字や項目の進捗状況は、適宜面談等で確認されます。
      </p>

      {/* 基準年収 vs ギャランティ合計 */}
      <div
        className="commitment-compare"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
          padding: '14px 20px',
          marginBottom: 20,
          background: '#fbfbf9',
          borderRadius: 'var(--radius-md, 12px)',
        }}
      >
        {/* 左: グレード × 基準年収 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', letterSpacing: '.04em' }}>
            グレード年収
          </span>
          {grade ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1 }}>{grade}</span>
              {hasBase ? (
                <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  ¥ {formatYen(String(baseAnnual))}{' '}
                  <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ 年</span>
                </span>
              ) : (
                <span style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>—（基準なし）</span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              カバー画面でグレードを選択してください
            </div>
          )}
        </div>

        {/* 中央: 差分 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {hasBase && total > 0 ? (
            <>
              <span style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', letterSpacing: '.04em' }}>
                差分
              </span>
              <span
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: diff! > 0 ? 'var(--color-text)' : 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {diffPct != null ? `${diffSign}${diffPctAbs}%` : `${diffSign} ¥ ${formatYen(String(diffAbs))}`}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>→</span>
          )}
        </div>

        {/* 右: ギャランティ合計 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', letterSpacing: '.04em' }}>
            ギャランティ合計
          </span>
          <span style={{ fontSize: '1.125rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
            ¥ {formatYen(String(total))}{' '}
            <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>/ 年</span>
          </span>
        </div>
      </div>

      {/* 3 項目テーブル */}
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <colgroup>
            <col style={{ width: '5%' }} />
            <col />
            <col style={{ width: '22%' }} />
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>No.</th>
              <th>項目・概要</th>
              <th style={{ textAlign: 'right' }}>金額</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '.8125rem' }}>
                  {ITEM_INDEX[i] ?? `${i + 1}.`}
                </td>
                <td>
                  <textarea
                    className="input"
                    style={{ padding: '6px 10px', fontSize: '.8125rem', minHeight: 72, width: '100%', resize: 'vertical', lineHeight: 1.6 }}
                    value={row.rationale}
                    onChange={e => updateCommitment(i, 'rationale', e.target.value)}
                    placeholder="項目と金額の根拠"
                  />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>¥</span>
                    <input
                      className="input"
                      style={{ padding: '6px 8px', fontSize: '.8125rem', textAlign: 'right', flex: 1 }}
                      inputMode="numeric"
                      value={formatYen(row.amount)}
                      onChange={e => updateCommitment(i, 'amount', parseYen(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={2}
                style={{
                  textAlign: 'right',
                  fontWeight: 600,
                  fontSize: '.8125rem',
                  background: 'var(--glass-tint-warm)',
                }}
              >
                合計
              </td>
              <td
                style={{
                  background: 'var(--glass-tint-warm)',
                  fontWeight: 700,
                  textAlign: 'right',
                  fontSize: '.875rem',
                  whiteSpace: 'nowrap',
                }}
              >
                ¥ {formatYen(String(total))} <span style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>円 / 年</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
