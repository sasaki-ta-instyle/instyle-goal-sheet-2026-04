'use client';
import { DeptGoalData, DeptKpiNumRow, DeptKgiRow, DeptActionRow } from '@/lib/types';

interface Props {
  data: DeptGoalData;
  onChange: (data: DeptGoalData) => void;
  companyStrategicFocus: string;
}

const autoComma = (v: string) => {
  const normalized = v.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0));
  const stripped = normalized.replace(/,/g, '');
  if (stripped === '') return '';
  if (!/^-?\d+(\.\d*)?$/.test(stripped)) return v;
  const parts = stripped.split('.');
  parts[0] = Number(parts[0]).toLocaleString('ja-JP');
  return parts.join('.');
};

function calcGrowth(prev: string, actual: string): string {
  const p = parseFloat(prev.replace(/,/g, ''));
  const a = parseFloat(actual.replace(/,/g, ''));
  if (!prev || !actual || isNaN(p) || isNaN(a) || p === 0) return '—';
  const val = Math.round((a / p - 1) * 100);
  return `${val > 0 ? '+' : ''}${val}%`;
}

function TI({ value, onChange, placeholder, autoNumber, compact }: { value: string; onChange: (v: string) => void; placeholder?: string; autoNumber?: boolean; compact?: boolean }) {
  return (
    <input
      className="input"
      style={{ padding: '6px 8px', fontSize: compact ? '.75rem' : '.8125rem' }}
      value={value}
      onChange={e => onChange(autoNumber ? autoComma(e.target.value) : e.target.value)}
      placeholder={placeholder ?? '—'}
    />
  );
}

const KPI_COLS: { key: 'prev' | 'target' | 'actual'; label: string; sub: string; autoNumber?: boolean }[] = [
  { key: 'prev', label: '前期実績', sub: '2025.10〜2026.3', autoNumber: true },
  { key: 'target', label: '今期目標', sub: '2026.4〜9', autoNumber: true },
  { key: 'actual', label: '今期実績', sub: '2026.4〜9', autoNumber: true },
];

export default function DeptGoalForm({ data, onChange, companyStrategicFocus }: Props) {
  const set = <K extends keyof DeptGoalData>(key: K, value: DeptGoalData[K]) =>
    onChange({ ...data, [key]: value });

  const updateKpi = <F extends keyof DeptKpiNumRow>(
    kpiKey: 'kpi1' | 'kpi2' | 'kpi3' | 'kpi4' | 'kpi5',
    field: F,
    value: DeptKpiNumRow[F],
  ) => set(kpiKey, { ...data[kpiKey], [field]: value });

  const updateKgi = (kgiKey: 'kgi1' | 'kgi2', field: keyof DeptKgiRow, value: string) =>
    set(kgiKey, { ...data[kgiKey], [field]: value });

  const updateAction = (i: number, field: keyof DeptActionRow, value: string) => {
    const arr = data.actions.map((r, idx) => idx === i ? { ...r, [field]: value } : r);
    set('actions', arr);
  };

  const kgiItems = [
    { key: 'kgi1' as const, label: '主要KGI①' },
    { key: 'kgi2' as const, label: '主要KGI②' },
  ];

  const kpiItems = [
    { key: 'kpi1' as const, label: '主要KPI①' },
    { key: 'kpi2' as const, label: '主要KPI②' },
    { key: 'kpi3' as const, label: '主要KPI③' },
    { key: 'kpi4' as const, label: '主要KPI④' },
    { key: 'kpi5' as const, label: '主要KPI⑤' },
  ];

  return (
    <div>
      <p className="section-title">03｜部署目標 記入シート</p>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>① 上位目標との接続</p>
      <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        <div>
          <label className="form-label">戦略的フォーカス（会社目標から自動転記）</label>
          <div
            className="input"
            style={{
              minHeight: 72,
              padding: '8px 10px',
              fontSize: '.8125rem',
              background: 'var(--glass-tinted)',
              color: companyStrategicFocus ? 'var(--color-text-muted)' : 'var(--color-text-light)',
              whiteSpace: 'pre-wrap',
              cursor: 'default',
            }}
          >
            {companyStrategicFocus || '会社目標シートで「戦略的フォーカス」を入力すると、ここに自動で表示されます。'}
          </div>
        </div>
        <div>
          <label className="form-label">部署のミッション</label>
          <textarea
            className="input"
            style={{ minHeight: 72 }}
            value={data.mission}
            onChange={e => set('mission', e.target.value)}
            placeholder="本部署のミッションを記入"
          />
        </div>
      </div>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>② 部署KGI目標</p>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 120 }}>区分</th>
              <th>ミッション</th>
              <th>KGI</th>
            </tr>
          </thead>
          <tbody>
            {kgiItems.map(item => (
              <tr key={item.key}>
                <td style={{ color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.label}</td>
                <td>
                  <textarea
                    className="input"
                    style={{ padding: '6px 8px', fontSize: '.8125rem', minHeight: 72, resize: 'vertical' }}
                    value={data[item.key].mission}
                    onChange={e => updateKgi(item.key, 'mission', e.target.value)}
                    placeholder="ミッションを記入"
                  />
                </td>
                <td>
                  <textarea
                    className="input"
                    style={{ padding: '6px 8px', fontSize: '.8125rem', minHeight: 72, resize: 'vertical' }}
                    value={data[item.key].kgi}
                    onChange={e => updateKgi(item.key, 'kgi', e.target.value)}
                    placeholder="KGIを記入"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>③ 部署KPI目標</p>
      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
          <colgroup>
            <col style={{ width: 130 }} />
            <col />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            <tr>
              <th>KPI</th>
              <th>指標名（単位）</th>
              {KPI_COLS.map(c => (
                <th key={c.key}>
                  {c.label}
                  {c.sub && <span style={{ display: 'block', fontWeight: 400, fontSize: '.7rem', opacity: 0.7, whiteSpace: 'nowrap' }}>{c.sub}</span>}
                </th>
              ))}
              <th style={{ whiteSpace: 'nowrap' }}>成長率（％）</th>
            </tr>
          </thead>
          <tbody>
            {kpiItems.map(item => (
              <tr key={item.key}>
                  <td style={{ color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>
                    <div>{item.label}</div>
                    <select
                      className="input"
                      style={{
                        marginTop: 6,
                        padding: '3px 6px',
                        fontSize: '.6875rem',
                        fontWeight: 500,
                        width: '100%',
                        color: 'var(--color-text-muted)',
                      }}
                      value={data[item.key].relatedKgi ?? ''}
                      onChange={e => updateKpi(item.key, 'relatedKgi', e.target.value as '' | 'kgi1' | 'kgi2')}
                      title="該当するKGI"
                    >
                      <option value="">該当KGI 未選択</option>
                      <option value="kgi1">主要KGI①</option>
                      <option value="kgi2">主要KGI②</option>
                    </select>
                  </td>
                  <td>
                    <TI
                      value={data[item.key].label}
                      onChange={v => updateKpi(item.key, 'label', v)}
                      placeholder="指標名"
                    />
                  </td>
                  {KPI_COLS.map(c => (
                    <td key={c.key}>
                      <TI
                        value={data[item.key][c.key]}
                        onChange={v => updateKpi(item.key, c.key, v)}
                        placeholder="数字または自由記入"
                        autoNumber={c.autoNumber}
                        compact
                      />
                    </td>
                  ))}
                  <td style={{ textAlign: 'center', fontWeight: 600, fontSize: '.875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {calcGrowth(data[item.key].prev, data[item.key].actual)}
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 12 }}>④ 今期の重点施策（KPIを達成するための行動）</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>施策内容</th>
              <th>期待効果</th>
              <th style={{ width: 120 }}>期限</th>
            </tr>
          </thead>
          <tbody>
            {data.actions.map((row, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--color-text-muted)', fontWeight: 600, textAlign: 'center' }}>{i + 1}</td>
                <td><TI value={row.content} onChange={v => updateAction(i, 'content', v)} placeholder="施策の内容" /></td>
                <td><TI value={row.expectedEffect} onChange={v => updateAction(i, 'expectedEffect', v)} placeholder="期待する効果" /></td>
                <td><TI value={row.deadline} onChange={v => updateAction(i, 'deadline', v)} placeholder="〇〇月末" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
