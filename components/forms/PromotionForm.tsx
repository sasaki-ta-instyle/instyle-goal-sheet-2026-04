'use client';
import { PromotionData } from '@/lib/types';

interface Props {
  data: PromotionData;
  onChange: (data: PromotionData) => void;
}

const scoreStyle = (selected: boolean): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 14px',
  borderRadius: 'var(--r-pill)',
  fontSize: '.8125rem',
  fontWeight: selected ? 700 : 400,
  cursor: 'pointer',
  border: selected ? '2px solid var(--color-text)' : '1.5px solid rgba(53,54,45,.18)',
  background: selected ? 'rgba(53,54,45,.12)' : 'transparent',
  color: 'var(--color-text)',
  transition: 'all 200ms ease',
  userSelect: 'none',
});

function PointSelector({
  value,
  options,
  onChange,
}: {
  value: number;
  options: { pt: number; label: string }[];
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(o => (
        <button
          key={o.pt}
          type="button"
          style={scoreStyle(value === o.pt)}
          onClick={() => onChange(o.pt)}
        >
          <span style={{ color: 'var(--color-text-muted)', marginRight: 6, fontSize: '.75rem' }}>{o.pt}pt</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const DEPT_GROWTH_OPTIONS = [
  { pt: 1, label: '成長なし' },
  { pt: 2, label: '〜+11%未満' },
  { pt: 3, label: '〜+22%未満' },
  { pt: 4, label: '〜+33%未満' },
  { pt: 5, label: '+33%以上' },
];
const PERSONAL_KPI_OPTIONS = [
  { pt: 1, label: '未達成' },
  { pt: 2, label: '〜+11%未満' },
  { pt: 3, label: '〜+22%未満' },
  { pt: 4, label: '〜+33%未満' },
  { pt: 5, label: '+33%以上' },
];
const SUPERVISOR_OPTIONS = [
  { pt: 1, label: '時期尚早' },
  { pt: 2, label: '概ね達成' },
  { pt: 3, label: '昇格水準' },
  { pt: 4, label: '明確' },
  { pt: 5, label: '2段階以上' },
];
const MGMT_OPTIONS = [
  { pt: 1, label: '低い' },
  { pt: 2, label: 'やや低い' },
  { pt: 3, label: '標準' },
  { pt: 4, label: '高い' },
  { pt: 5, label: '非常に高い' },
];
const NURTURING_OPTIONS = MGMT_OPTIONS;

export default function PromotionForm({ data, onChange }: Props) {
  const set = <K extends keyof PromotionData>(key: K, value: PromotionData[K]) =>
    onChange({ ...data, [key]: value });

  const totalPoints =
    data.tenurePoint +
    data.deptGrowthPoint +
    data.personalKpiPoint +
    data.supervisorPoint +
    data.mgmtPoint +
    data.nurturingPoint;

  const valueNum = parseFloat(data.valueScore);
  const gatePass = !isNaN(valueNum) && data.valueScore !== '' && valueNum >= 3.5;
  const gateKnown = data.valueScore !== '';

  return (
    <div>
      <p className="section-title">06｜昇格・昇給 採点シート</p>
      <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 28 }}>
        評価期間ごとに実施。合計11ポイント以上で昇格・昇給対象。
      </p>

      {/* ① VALUE評価（ゲート条件） */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(230,226,215,.45)',
        borderRadius: 'var(--r)',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: '.8125rem', fontWeight: 700, marginBottom: 4 }}>① VALUE評価（ゲート条件）</p>
        <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 16 }}>
          360度スコアが3.50以上のみ昇格可。3.50未満は昇格不可で終了。
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <label className="form-label">360度スコア（0.00〜5.00）</label>
            <input
              className="input"
              type="number"
              min="0"
              max="5"
              step="0.01"
              style={{ width: 140 }}
              value={data.valueScore}
              onChange={e => set('valueScore', e.target.value)}
              placeholder="例: 4.20"
            />
          </div>
          {gateKnown && (
            <div style={{
              padding: '10px 18px',
              borderRadius: 'var(--r)',
              background: gatePass ? 'rgba(123,183,133,.18)' : 'rgba(220,38,38,.10)',
              border: `1px solid ${gatePass ? 'rgba(123,183,133,.40)' : 'rgba(220,38,38,.25)'}`,
              fontSize: '.875rem',
              fontWeight: 700,
              color: gatePass ? '#2d7a3a' : '#b91c1c',
            }}>
              {gatePass ? '✓ ゲート通過' : '✗ 昇格不可（3.50未満）'}
            </div>
          )}
        </div>
      </div>

      {/* ②〜⑦ 評価項目 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ② 在籍期間 */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ② 在籍期間
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>0〜1pt</span>
          </p>
          <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            1年経過→1pt　未経過→0pt
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[{ pt: 0, label: '1年未経過' }, { pt: 1, label: '1年以上' }].map(o => (
              <button
                key={o.pt}
                type="button"
                style={scoreStyle(data.tenurePoint === o.pt)}
                onClick={() => set('tenurePoint', o.pt)}
              >
                <span style={{ color: 'var(--color-text-muted)', marginRight: 6, fontSize: '.75rem' }}>{o.pt}pt</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* ③ 所属部署の成長度 */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ③ 所属部署の成長度
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>1〜5pt</span>
          </p>
          <PointSelector value={data.deptGrowthPoint} options={DEPT_GROWTH_OPTIONS} onChange={v => set('deptGrowthPoint', v)} />
        </div>

        {/* ④ 個人KPI達成度 */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ④ 個人KPI達成度
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>1〜5pt</span>
          </p>
          <PointSelector value={data.personalKpiPoint} options={PERSONAL_KPI_OPTIONS} onChange={v => set('personalKpiPoint', v)} />
        </div>

        {/* ⑤ 直属上司評価 */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ⑤ 直属上司評価
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>1〜5pt</span>
          </p>
          <PointSelector value={data.supervisorPoint} options={SUPERVISOR_OPTIONS} onChange={v => set('supervisorPoint', v)} />
        </div>

        {/* ⑥ 経営評価（代表） */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ⑥ 経営評価（代表）
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>1〜5pt（代表面談の際に入力）</span>
          </p>
          <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            ハッピーエンドへの近づき・SMART達成・ユートピア行動
          </p>
          <PointSelector value={data.mgmtPoint} options={MGMT_OPTIONS} onChange={v => set('mgmtPoint', v)} />
        </div>

        {/* ⑦ 育成・昇進循環 */}
        <div style={{ padding: '16px 20px', background: 'rgba(230,226,215,.30)', borderRadius: 'var(--r)' }}>
          <p style={{ fontSize: '.8125rem', fontWeight: 600, marginBottom: 8 }}>
            ⑦ 育成・昇進循環
            <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>1〜5pt</span>
          </p>
          <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 12 }}>
            人を育て組織を前に進めたか
          </p>
          <PointSelector value={data.nurturingPoint} options={NURTURING_OPTIONS} onChange={v => set('nurturingPoint', v)} />
        </div>
      </div>

      {/* 合計 */}
      <div style={{
        marginTop: 28,
        padding: '20px 24px',
        background: gateKnown && !gatePass
          ? 'rgba(220,38,38,.06)'
          : gatePass && totalPoints >= 11
            ? 'rgba(123,183,133,.14)'
            : 'rgba(230,226,215,.45)',
        border: `1px solid ${gatePass && totalPoints >= 11 ? 'rgba(123,183,133,.35)' : 'rgba(53,54,45,.12)'}`,
        borderRadius: 'var(--r)',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div>
          <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>合計ポイント（②〜⑦）</p>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
            {totalPoints}
            <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: 4 }}>pt</span>
          </p>
        </div>
        {gatePass && totalPoints >= 11 && (
          <div style={{
            padding: '10px 18px',
            background: 'rgba(123,183,133,.25)',
            borderRadius: 'var(--r-pill)',
            fontSize: '.875rem',
            fontWeight: 700,
            color: '#2d7a3a',
          }}>
            ✓ 昇格・昇給対象（11pt以上 ＋ ゲート通過）
          </div>
        )}
        {gateKnown && !gatePass && (
          <p style={{ fontSize: '.8125rem', color: '#b91c1c', fontWeight: 600 }}>
            ✗ 昇格不可（VALUEスコアが3.50未満）
          </p>
        )}
        {(!gateKnown || gatePass) && totalPoints < 11 && (
          <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)' }}>
            昇格・昇給には合計11pt以上が必要です（あと{11 - totalPoints}pt）
          </p>
        )}
      </div>
    </div>
  );
}
