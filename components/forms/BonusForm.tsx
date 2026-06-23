'use client';
import { BonusData } from '@/lib/types';

interface Props {
  data: BonusData;
  onChange: (data: BonusData) => void;
}

function Toggle({ value, onChange, label, description }: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={value === 1}
      onClick={() => onChange(value === 1 ? 0 : 1)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '14px 16px',
        background: value === 1 ? 'rgba(123,183,133,.10)' : 'rgba(230,226,215,.30)',
        borderRadius: 'var(--r)',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        font: 'inherit',
        color: 'inherit',
      }}
    >
      <div style={{
        flexShrink: 0,
        width: 24,
        height: 24,
        borderRadius: 6,
        border: value === 1 ? '2px solid #2d7a3a' : '2px solid rgba(53,54,45,.25)',
        background: value === 1 ? 'rgba(123,183,133,.35)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '.875rem',
        color: '#2d7a3a',
        fontWeight: 700,
        marginTop: 1,
      }}>
        {value === 1 ? '1' : ''}
      </div>
      <div>
        <p style={{ fontSize: '.875rem', fontWeight: value === 1 ? 600 : 400 }}>{label}</p>
        {description && <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{description}</p>}
      </div>
      <div style={{ marginLeft: 'auto', fontSize: '.75rem', fontWeight: 600, color: value === 1 ? '#2d7a3a' : 'var(--color-text-muted)', flexShrink: 0 }}>
        {value === 1 ? '1pt' : '0pt'}
      </div>
    </button>
  );
}

export default function BonusForm({ data, onChange }: Props) {
  const set = <K extends keyof BonusData>(key: K, value: BonusData[K]) =>
    onChange({ ...data, [key]: value });

  const phase1Total = data.canAfford + data.hasProfit + data.futureProfit;
  const supervisorPoints = data.noSupervisor ? 0 : data.supervisorEval;
  const mgmtPoints = data.mgmtEval * (data.noSupervisor ? 2 : 1);
  const phase2Total =
    data.deptKpiAchieved +
    data.personalKpiAchieved +
    supervisorPoints +
    data.valueEval +
    data.reproducibility +
    data.roleAchievement +
    data.difficulty +
    mgmtPoints;

  const phase1Pass = phase1Total >= 3;
  const totalPoints = phase1Total + phase2Total;
  const bonusAmount = phase1Pass ? totalPoints * 110000 : 0;

  return (
    <div>
      <p className="section-title">08｜ボーナス評価 採点シート</p>
      <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 28 }}>
        評価期間において所属4ヶ月以上が対象。各項目をクリックして採点してください。
      </p>

      {/* Phase 1: 財務ゲート */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(230,226,215,.45)',
        borderRadius: 'var(--r)',
        marginBottom: 28,
      }}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, marginBottom: 4 }}>Phase 1：財務ゲート</p>
        <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
          合計3未満でボーナス0。3以上のみPhase 2へ。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Toggle
            value={data.canAfford}
            onChange={v => set('canAfford', v)}
            label="① 今支給できる金がある"
            description="支給しても事業継続・資金繰り・将来投資に支障なし"
          />
          <Toggle
            value={data.hasProfit}
            onChange={v => set('hasProfit', v)}
            label="② 今利益が出ている"
            description="実質的に利益あり（一時的・帳尻合わせ的な黒字は0）"
          />
          <Toggle
            value={data.futureProfit}
            onChange={v => set('futureProfit', v)}
            label="③ 将来も利益が出る見込みがある"
            description="受注・事業構造・契約状況から継続的利益が合理的に見込める"
          />
        </div>
        <div style={{
          marginTop: 16,
          padding: '12px 16px',
          borderRadius: 'var(--r)',
          background: phase1Pass ? 'rgba(123,183,133,.18)' : 'rgba(220,38,38,.10)',
          border: `1px solid ${phase1Pass ? 'rgba(123,183,133,.35)' : 'rgba(220,38,38,.25)'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: phase1Pass ? '#2d7a3a' : '#b91c1c' }}>
            {phase1Total}/3
          </span>
          <span style={{ fontSize: '.875rem', fontWeight: 600, color: phase1Pass ? '#2d7a3a' : '#b91c1c' }}>
            {phase1Pass ? '✓ Phase 2へ進む' : '✗ ボーナス0（3未満）'}
          </span>
        </div>
      </div>

      {/* Phase 2: 個人評価 */}
      <div style={{
        padding: '20px 24px',
        background: !phase1Pass ? 'rgba(220,38,38,.04)' : 'rgba(230,226,215,.45)',
        borderRadius: 'var(--r)',
        marginBottom: 28,
        opacity: !phase1Pass ? 0.5 : 1,
        pointerEvents: !phase1Pass ? 'none' : 'auto',
      }}>
        <p style={{ fontSize: '.875rem', fontWeight: 700, marginBottom: 4 }}>Phase 2：個人評価</p>
        <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>
          各項目 0または1。迷ったら0。
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Toggle value={data.deptKpiAchieved} onChange={v => set('deptKpiAchieved', v)} label="④ 部署KPI達成" description="期初設定・合意した主要KPIを達成している" />
          <Toggle value={data.personalKpiAchieved} onChange={v => set('personalKpiAchieved', v)} label="⑤ 個人KPI達成" description="個人KPI達成、または未達でもそれを補う明確な成果あり" />
          {data.noSupervisor ? (
            <div style={{
              padding: '14px 16px',
              background: 'rgba(230,226,215,.20)',
              borderRadius: 'var(--r)',
              border: '1px dashed rgba(53,54,45,.20)',
              fontSize: '.875rem',
              color: 'var(--color-text-muted)',
            }}>
              ⑥ 直属上司評価 ― 上司不在のためブランク（⑪に重み 2 倍として加算）
            </div>
          ) : (
            <Toggle
              value={data.supervisorEval}
              onChange={v => set('supervisorEval', v)}
              label="⑥ 直属上司評価"
              description="当期の貢献度を総合的に見て明確に評価できる"
            />
          )}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 16px', fontSize: '.8125rem', color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={data.noSupervisor}
              onChange={e => set('noSupervisor', e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            直属上司が不在（⑥はブランク、⑪を重み2倍で計算）
          </label>
          <Toggle value={data.valueEval} onChange={v => set('valueEval', v)} label="⑦ 360°評価（バリュー）" description="バリュー体現が一貫。違反や評価の大きな割れなし" />
          <Toggle value={data.reproducibility} onChange={v => set('reproducibility', v)} label="⑧ 再現性・継続性" description="プロセス・仕組みとして説明でき今後も再現可能" />
          <Toggle value={data.roleAchievement} onChange={v => set('roleAchievement', v)} label="⑨ 役割に対する達成度" description="立場・役割・等級として期待された水準を満たしている" />
          <Toggle value={data.difficulty} onChange={v => set('difficulty', v)} label="⑩ 負荷・難易度" description="人員不足・逆風など高い難易度の中で成果を出した" />
          <Toggle
            value={data.mgmtEval}
            onChange={v => set('mgmtEval', v)}
            label={`⑪ 経営評価${data.noSupervisor ? '（上司不在のため重み2倍）' : ''}`}
            description="①〜⑩踏まえ、ボーナス支給が会社・組織・将来にとって妥当。⑥（直属上司評価）が存在しない場合、本項目は重み2倍として扱う"
          />
        </div>
      </div>

      {/* 支給額 */}
      <div style={{
        padding: '24px 28px',
        background: phase1Pass && bonusAmount > 0 ? 'rgba(123,183,133,.12)' : 'rgba(230,226,215,.45)',
        border: `1px solid ${phase1Pass && bonusAmount > 0 ? 'rgba(123,183,133,.35)' : 'rgba(53,54,45,.12)'}`,
        borderRadius: 'var(--r)',
      }}>
        <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
          支給額計算（獲得ポイント × 11万円）
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text)' }}>
            {phase1Pass ? totalPoints : '—'}
            {phase1Pass && <span style={{ fontSize: '1rem', fontWeight: 400, marginLeft: 4 }}>pt</span>}
          </span>
          <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>×</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>11万円</span>
          <span style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>=</span>
          <span style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: bonusAmount > 0 ? '#2d7a3a' : 'var(--color-text-muted)',
          }}>
            {phase1Pass
              ? bonusAmount.toLocaleString('ja-JP') + '円'
              : '0円'}
          </span>
        </div>
        {!phase1Pass && (
          <p style={{ fontSize: '.8125rem', color: '#b91c1c', marginTop: 8 }}>
            Phase 1を通過していないためボーナスは0円です。
          </p>
        )}
      </div>
    </div>
  );
}
