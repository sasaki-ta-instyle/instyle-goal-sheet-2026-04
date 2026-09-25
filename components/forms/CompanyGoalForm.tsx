'use client';
import { CompanyGoalData, KpiNumRow } from '@/lib/types';

interface Props {
  data: CompanyGoalData;
  onChange: (data: CompanyGoalData) => void;
  title?: string;
  labelPrefix?: string;
}

const toNumeric = (v: string) => {
  const normalized = v
    .replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
    .replace(/[ー−–—－]/g, '-');
  const sign = normalized.trimStart().startsWith('-') ? '-' : '';
  const raw = normalized.replace(/[^0-9.]/g, '');
  if (!raw) return sign;
  const parts = raw.split('.');
  parts[0] = parts[0] ? Number(parts[0]).toLocaleString('ja-JP') : '';
  const body = parts.length > 1 ? `${parts[0]}.${parts[1]}` : parts[0];
  return sign + body;
};

// 前期→今期の変化率。分母は絶対値にして前期がマイナス（赤字）でも符号を素直に。
// 単位は円額の指標なら % (前年比成長率)、%表記の指標（利益率など）なら pt (差分ポイント)。
function calcGrowth(prev: string, actual: string, unit: '%' | 'pt' = 'pt'): string {
  const p = parseFloat(prev.replace(/,/g, ''));
  const a = parseFloat(actual.replace(/,/g, ''));
  if (!prev || !actual || isNaN(p) || isNaN(a) || p === 0) return '—';
  const val = Math.round(((a - p) / Math.abs(p)) * 100);
  return `${val > 0 ? '+' : ''}${val}${unit}`;
}

function TI({ value, onChange, placeholder, numeric, readOnly }: { value: string; onChange: (v: string) => void; placeholder?: string; numeric?: boolean; readOnly?: boolean }) {
  return (
    <input
      className="input"
      style={{
        padding: '6px 8px',
        fontSize: '.8125rem',
        ...(readOnly ? { background: 'var(--glass-tinted)', color: 'var(--color-text-muted)', cursor: 'default' } : {}),
      }}
      value={value}
      inputMode={numeric ? 'decimal' : undefined}
      readOnly={readOnly}
      tabIndex={readOnly ? -1 : undefined}
      onChange={e => {
        if (readOnly) return;
        onChange(numeric ? toNumeric(e.target.value) : e.target.value);
      }}
      placeholder={placeholder ?? '—'}
    />
  );
}

const computeMargin = (profit: string, revenue: string): string => {
  if (!profit || !revenue) return '';
  const p = parseFloat(profit.replace(/,/g, ''));
  const r = parseFloat(revenue.replace(/,/g, ''));
  if (isNaN(p) || isNaN(r) || r === 0) return '';
  return `${(p / r * 100).toFixed(1)}%`;
};

const NUM_COLS: { key: keyof KpiNumRow; label: string; sub: string; numeric?: boolean }[] = [
  { key: 'prev', label: '前期実績（円）', sub: '2025年10月-2026年3月期', numeric: true },
  { key: 'target', label: '今期目標（円）', sub: '2026年4月-9月期', numeric: true },
  { key: 'actual', label: '今期実績（円）', sub: '2026年4月-9月期', numeric: true },
];

function KpiNumTable({
  rows,
  onUpdate,
}: {
  rows: { label: string; data: KpiNumRow; readOnlyNumeric?: boolean; growthUnit?: '%' | 'pt' }[];
  onUpdate: (rowIdx: number, field: keyof KpiNumRow, value: string) => void;
}) {
  return (
    <div className="table-wrap" style={{ marginBottom: 24 }}>
      <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          <col style={{ width: 200 }} />
          <col />
          <col />
          <col />
          <col style={{ width: 90 }} />
        </colgroup>
        <thead>
          <tr>
            <th>指標</th>
            {NUM_COLS.map(c => (
              <th key={c.key}>
                {c.label}
                {c.sub && <span style={{ display: 'block', fontWeight: 400, fontSize: '.7rem', opacity: 0.7 }}>{c.sub}</span>}
              </th>
            ))}
            <th>成長率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td style={{ fontWeight: 500, whiteSpace: 'nowrap', fontSize: '.8125rem' }}>{row.label}</td>
              {NUM_COLS.map(c => (
                <td key={c.key}>
                  <TI
                    value={row.data[c.key]}
                    onChange={v => onUpdate(i, c.key, v)}
                    placeholder={row.readOnlyNumeric ? '自動計算' : c.numeric ? '0' : '自由記入'}
                    numeric={c.numeric}
                    readOnly={row.readOnlyNumeric}
                  />
                </td>
              ))}
              <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {calcGrowth(row.data.prev, row.data.actual, row.growthUnit ?? 'pt')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompanyGoalForm({
  data,
  onChange,
  title = '01｜会社目標 記入シート',
  labelPrefix = '会社',
}: Props) {
  const set = <K extends keyof CompanyGoalData>(key: K, value: CompanyGoalData[K]) =>
    onChange({ ...data, [key]: value });

  const isMarginNumericField = (field: keyof KpiNumRow): field is 'prev' | 'target' | 'actual' =>
    field === 'prev' || field === 'target' || field === 'actual';

  const updateRevenue = (field: keyof KpiNumRow, value: string) => {
    const newRevenue = { ...data.revenue, [field]: value };
    if (isMarginNumericField(field)) {
      const newMargin = {
        ...data.operatingMargin,
        [field]: computeMargin(data.operatingProfit[field], value),
      };
      onChange({ ...data, revenue: newRevenue, operatingMargin: newMargin });
    } else {
      set('revenue', newRevenue);
    }
  };

  const updateProfitRow = (rowKey: 'operatingProfit' | 'operatingMargin', field: keyof KpiNumRow, value: string) => {
    if (rowKey === 'operatingMargin' && isMarginNumericField(field)) return;
    if (rowKey === 'operatingProfit' && isMarginNumericField(field)) {
      const newProfit = { ...data.operatingProfit, [field]: value };
      const newMargin = {
        ...data.operatingMargin,
        [field]: computeMargin(value, data.revenue[field]),
      };
      onChange({ ...data, operatingProfit: newProfit, operatingMargin: newMargin });
      return;
    }
    set(rowKey, { ...data[rowKey], [field]: value });
  };

  const profitRows: {
    label: string;
    rowKey: 'operatingProfit' | 'operatingMargin';
    readOnlyNumeric: boolean;
    growthUnit: '%' | 'pt';
  }[] = [
    { label: `${labelPrefix}営業利益`, rowKey: 'operatingProfit', readOnlyNumeric: false, growthUnit: '%' },
    { label: `${labelPrefix}営業利益率`, rowKey: 'operatingMargin', readOnlyNumeric: true, growthUnit: 'pt' },
  ];

  return (
    <div>
      <p className="section-title">{title}</p>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>① 戦略的フォーカス</p>
      <textarea
        className="input"
        style={{ width: '100%', minHeight: 80, resize: 'vertical', padding: '6px 8px', fontSize: '.8125rem', marginBottom: 24 }}
        placeholder="今期の戦略的フォーカスを記入"
        value={data.strategicFocus}
        onChange={e => set('strategicFocus', e.target.value)}
      />

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>② 売上</p>
      <KpiNumTable
        rows={[{ label: `${labelPrefix}売上合計`, data: data.revenue, growthUnit: '%' }]}
        onUpdate={(_i, field, value) => updateRevenue(field, value)}
      />

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>③ 利益</p>
      <KpiNumTable
        rows={profitRows.map(r => ({
          label: r.label,
          data: data[r.rowKey],
          readOnlyNumeric: r.readOnlyNumeric,
          growthUnit: r.growthUnit,
        }))}
        onUpdate={(i, field, value) => updateProfitRow(profitRows[i].rowKey, field, value)}
      />
    </div>
  );
}
