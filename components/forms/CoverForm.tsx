'use client';
import { CoverData, CURRENT_PERIOD, GRADE_OPTIONS } from '@/lib/types';

interface Props {
  data: CoverData;
  onChange: (data: CoverData) => void;
}

export default function CoverForm({ data, onChange }: Props) {
  const set = (key: keyof CoverData, value: string) => onChange({ ...data, [key]: value });

  return (
    <div>
      <p className="section-title">カバー</p>
      <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 28 }}>
        目標設定シートの表紙情報を入力してください。
      </p>

      <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <label className="form-label">所属法人</label>
          <input
            className="input"
            type="text"
            placeholder="例: INSTYLE GROUP"
            value={data.company}
            onChange={e => set('company', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">氏名</label>
          <input
            className="input"
            type="text"
            placeholder="例: 山田 太郎"
            value={data.name}
            onChange={e => set('name', e.target.value)}
          />
        </div>
      </div>

      <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <label className="form-label">グレード</label>
          <select
            className="input"
            value={data.grade}
            onChange={e => set('grade', e.target.value)}
          >
            <option value="">選択してください</option>
            {GRADE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="form-label">期</label>
          <div className="input" style={{ color: 'var(--color-text-muted)', userSelect: 'none' }}>
            {CURRENT_PERIOD}
          </div>
        </div>
      </div>
    </div>
  );
}
