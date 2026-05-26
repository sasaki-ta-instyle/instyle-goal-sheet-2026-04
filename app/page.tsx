'use client';

import { useState, useEffect } from 'react';
import StepIndicator from '@/components/StepIndicator';
import GoalFunnel from '@/components/GoalFunnel';
import CoverForm from '@/components/forms/CoverForm';
import CompanyGoalForm from '@/components/forms/CompanyGoalForm';
import DeptGoalForm from '@/components/forms/DeptGoalForm';
import PersonalGoalForm from '@/components/forms/PersonalGoalForm';
import CommitmentForm from '@/components/forms/CommitmentForm';
import GradeForm from '@/components/forms/GradeForm';
import PromotionForm from '@/components/forms/PromotionForm';
import BonusForm from '@/components/forms/BonusForm';
import { createDefaultFormData, CURRENT_PERIOD, FormData, CommitmentRow, SmartGoalRow } from '@/lib/types';
import { encodeFormData, buildShortShareUrl, buildLongShareUrl, baseFromPathname } from '@/lib/share-codec';

const STORAGE_KEY = 'instyle-goal-sheet-2026-10-v1';

// 旧 SmartGoalRow（goal/targetValue/deadline/note）→ 新 SmartGoalRow（s/m/a/r/t/note）に
// 写し替える。旧 goal→s、旧 targetValue→m、旧 deadline→t、note はそのまま。
// 配列長は新デフォルト（3 件）に揃え、不足は空行で補完、超過は切り捨て。
type LegacySmartGoalRow = Partial<SmartGoalRow> & {
  goal?: string;
  targetValue?: string;
  deadline?: string;
};
function normalizeSmartGoals(input: unknown, defaults: SmartGoalRow[]): SmartGoalRow[] {
  if (!Array.isArray(input)) return defaults;
  return defaults.map((def, i) => {
    const raw = input[i] as LegacySmartGoalRow | undefined;
    if (!raw || typeof raw !== 'object') return def;
    return {
      relatedKpi: (raw as { relatedKpi?: string }).relatedKpi ?? '',
      s: raw.s ?? raw.goal ?? '',
      m: raw.m ?? raw.targetValue ?? '',
      a: raw.a ?? '',
      r: raw.r ?? '',
      t: raw.t ?? raw.deadline ?? '',
      note: raw.note ?? '',
    };
  });
}

// 旧 JSON / localStorage 取り込み時のフォールバック。
// 旧仕様（買い手×3：会社／グループ／西村さん）の label フィールドは新仕様で型から
// 削除済みで、自然に捨てられる。amount / rationale だけを引き継ぐ。
// 行数はデフォルト（3 行固定）を基準にマップし、超過分は意図的に切り捨てる。
function normalizeCommitment(input: unknown, defaults: CommitmentRow[]): CommitmentRow[] {
  if (!Array.isArray(input)) return defaults;
  return defaults.map((def, i) => {
    const raw = input[i] as Partial<CommitmentRow> | undefined;
    if (!raw || typeof raw !== 'object') return def;
    const rawAmount = raw.amount !== undefined && raw.amount !== null ? String(raw.amount) : '';
    return {
      amount: rawAmount.replace(/[^\d]/g, ''),
      rationale: typeof raw.rationale === 'string' ? raw.rationale : '',
    };
  });
}

// 旧バージョンの JSON / localStorage を読み込んだ場合に新フィールドが undefined になり
// 下流のレンダリングや PPTX 生成が落ちるのを防ぐ正規化ヘルパ。
// cover.period は常に当期に強制する（4月版エクスポートを 10月版にインポートしたケース対応）。
function mergeFormData(parsed: unknown): FormData {
  const def = createDefaultFormData();
  if (!parsed || typeof parsed !== 'object') return def;
  const p = parsed as Partial<FormData>;
  return {
    ...def,
    ...p,
    cover: { ...def.cover, ...(p.cover ?? {}), period: CURRENT_PERIOD },
    group: { ...def.group, ...(p.group ?? {}) },
    company: { ...def.company, ...(p.company ?? {}) },
    dept: {
      ...def.dept,
      ...(p.dept ?? {}),
      kgi1: { ...def.dept.kgi1, ...(p.dept?.kgi1 ?? {}) },
      kgi2: { ...def.dept.kgi2, ...(p.dept?.kgi2 ?? {}) },
    },
    personal: {
      ...def.personal,
      ...(p.personal ?? {}),
      smartGoals: normalizeSmartGoals(p.personal?.smartGoals, def.personal.smartGoals),
      commitment: normalizeCommitment(
        (() => {
          const personal = p.personal as
            | { commitment?: unknown; marketValue?: unknown }
            | undefined;
          const current = personal?.commitment;
          if (Array.isArray(current) && current.length > 0) return current;
          return personal?.marketValue;
        })(),
        def.personal.commitment,
      ),
    },
    promotion: { ...def.promotion, ...(p.promotion ?? {}) },
    bonus: { ...def.bonus, ...(p.bonus ?? {}) },
    gradeExpectations: { ...def.gradeExpectations, ...(p.gradeExpectations ?? {}) },
  };
}

// グループ〜ギャランティ までのサイドバー
function showFunnel(step: number): boolean {
  return step >= 2 && step <= 6;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window === 'undefined') return createDefaultFormData();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return mergeFormData(JSON.parse(saved));
    } catch {}
    return createDefaultFormData();
  });
  const [shareUrl, setShareUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const [sharePending, setSharePending] = useState(false);
  const [shareNotice, setShareNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleReset = () => {
    if (!confirm('入力内容をすべてリセットしますか？この操作は元に戻せません。')) return;
    localStorage.removeItem(STORAGE_KEY);
    setFormData(createDefaultFormData());
    setStep(1);
    setShareUrl('');
    setShareCopied(false);
    setShareNotice('');
  };

  const handleExport = () => {
    const json = JSON.stringify(formData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const name = formData.cover.name || '氏名未入力';
    const period = formData.cover.period || '';
    a.href = url;
    a.download = `goal-sheet_${name}_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 上長が「部署目標」だけを切り出して、配下のメンバーに渡すためのエクスポート。
  // 配下のメンバーがインポートすると、自分の入力には触れず部署目標だけが上書きされる。
  const handleExportDept = () => {
    const payload = { _kind: 'dept-only' as const, dept: formData.dept };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const period = formData.cover.period || '';
    a.href = url;
    a.download = `goal-sheet_部署目標_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        // 「部署目標だけ」の部分インポート：自分の入力は保持して dept のみ上書き
        if (parsed && typeof parsed === 'object' && parsed._kind === 'dept-only' && parsed.dept) {
          const def = createDefaultFormData();
          setFormData(prev => ({
            ...prev,
            dept: {
              ...def.dept,
              ...parsed.dept,
              kgi1: { ...def.dept.kgi1, ...(parsed.dept.kgi1 ?? {}) },
              kgi2: { ...def.dept.kgi2, ...(parsed.dept.kgi2 ?? {}) },
            },
          }));
          alert('部署目標を取り込みました（他の入力はそのままです）。');
          return;
        }
        // 通常の全体インポート
        setFormData(mergeFormData(parsed));
        setStep(1);
        setShareUrl('');
        setShareCopied(false);
        setShareNotice('');
      } catch {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const navigate = (s: number) => {
    if (s >= 1 && s <= 10) setStep(s);
  };

  const updateCover = (d: FormData['cover']) => setFormData(prev => ({ ...prev, cover: d }));
  const updateGroup = (d: FormData['group']) => setFormData(prev => ({ ...prev, group: d }));
  const updateCompany = (d: FormData['company']) => setFormData(prev => ({ ...prev, company: d }));
  const updateDept = (d: FormData['dept']) => setFormData(prev => ({ ...prev, dept: d }));
  const updatePersonal = (d: FormData['personal']) => setFormData(prev => ({ ...prev, personal: d }));
  const updatePromotion = (d: FormData['promotion']) => setFormData(prev => ({ ...prev, promotion: d }));
  const updateBonus = (d: FormData['bonus']) => setFormData(prev => ({ ...prev, bonus: d }));
  const updateGradeExpectations = (d: FormData['gradeExpectations']) => setFormData(prev => ({ ...prev, gradeExpectations: d }));

  const handleShare = async () => {
    const { cover } = formData;
    if (!cover.name || !cover.company || !cover.grade || !cover.period) {
      alert('カバー情報（所属法人・氏名・グレード・期）をすべて入力してください。');
      setStep(1);
      return;
    }
    setSharePending(true);
    setShareNotice('');
    let url = '';
    try {
      const base = baseFromPathname(window.location.pathname);
      const res = await fetch(`${base}/api/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const { token } = (await res.json()) as { token?: string };
        if (token) {
          url = buildShortShareUrl(window.location.origin, window.location.pathname, token);
        }
      }
    } catch {
      // network error → fall through to long URL
    }
    if (!url) {
      const encoded = encodeFormData(formData);
      url = buildLongShareUrl(window.location.origin, window.location.pathname, encoded);
      setShareNotice('このページでは短縮URLが発行できないため、データを埋め込んだ長いURLになっています。本番（app.instyle.group）からは短いURLが発行されます。');
    } else {
      setShareNotice('');
    }
    setShareUrl(url);
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2400);
    } catch {
      setShareCopied(false);
    } finally {
      setSharePending(false);
    }
  };

  return (
    <>
      <div className="scene-bg" />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>

        {/* Header */}
        <header className="site-header" style={{
          padding: '40px 48px 32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'var(--glass-dark)',
            backdropFilter: 'var(--glass-blur-lg)',
            WebkitBackdropFilter: 'var(--glass-blur-lg)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg,rgba(255,90,100,.04) 0%,rgba(255,210,80,.04) 25%,rgba(60,220,160,.05) 50%,rgba(80,160,255,.05) 75%,transparent 100%)',
            pointerEvents: 'none',
          }} />
          <div className="header-inner" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <img src="https://app.instyle.group/_shared/static/logo.svg" alt="INSTYLE GROUP" style={{ height: 10, marginBottom: 10, filter: 'brightness(0) invert(1)', opacity: 0.45 }} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-inv)', letterSpacing: '-.02em', marginBottom: 6 }}>
                目標設定シート <span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.6 }}>2026.10〜2027.3</span>
              </h1>
              <p style={{ fontSize: '.8125rem', color: 'rgba(243,241,238,.45)' }}>
                入力内容は自動保存されます。完成後はシェア用URLでオーナーに共有できます。<br />
                来期のシート作成に備えて、完成後は「データを書き出す」（JSON形式）しておきましょう。来期は読み込むだけで引き継げます。
              </p>
            </div>
            <div className="header-buttons" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <label style={{
                fontSize: '.75rem',
                color: 'rgba(243,241,238,.45)',
                background: 'transparent',
                border: '1px solid rgba(243,241,238,.20)',
                borderRadius: 'var(--r)',
                padding: '6px 14px',
                cursor: 'pointer',
              }}>
                データを読み込む
                <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
              </label>
              <button
                onClick={handleExport}
                style={{
                  fontSize: '.75rem',
                  color: 'rgba(243,241,238,.45)',
                  background: 'transparent',
                  border: '1px solid rgba(243,241,238,.20)',
                  borderRadius: 'var(--r)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                }}
              >
                データを書き出す
              </button>
              <button
                onClick={handleExportDept}
                title="上長が部署目標だけを切り出して、配下のメンバーに配るためのエクスポート"
                style={{
                  fontSize: '.75rem',
                  color: 'rgba(243,241,238,.45)',
                  background: 'transparent',
                  border: '1px solid rgba(243,241,238,.20)',
                  borderRadius: 'var(--r)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                }}
              >
                部署目標を書き出す
              </button>
              <button
                onClick={handleReset}
                style={{
                  fontSize: '.75rem',
                  color: 'rgba(243,241,238,.45)',
                  background: 'transparent',
                  border: '1px solid rgba(243,241,238,.20)',
                  borderRadius: 'var(--r)',
                  padding: '6px 14px',
                  cursor: 'pointer',
                }}
              >
                入力をリセット
              </button>
            </div>
          </div>
        </header>

        {/* Step nav */}
        <StepIndicator current={step} onNavigate={navigate} />

        {/* Main content */}
        <main className="site-main" style={{ maxWidth: showFunnel(step) ? 1296 : 1080, margin: '0 auto', padding: '0 24px 80px' }}>

          <div
            style={{
              display: showFunnel(step) ? 'grid' : 'block',
              gridTemplateColumns: showFunnel(step) ? '188px minmax(0, 1fr)' : undefined,
              gap: 28,
              alignItems: 'start',
            }}
          >
            {showFunnel(step) && (
              <aside style={{ position: 'sticky', top: 84, alignSelf: 'start' }}>
                <GoalFunnel formData={formData} currentStep={step} />
              </aside>
            )}

            <div style={{ minWidth: 0 }}>
              {/* Form card */}
              <div className="glass-panel" style={{ marginBottom: 24 }}>
                {step === 1 && <CoverForm data={formData.cover} onChange={updateCover} />}
                {step === 2 && <CompanyGoalForm data={formData.group} onChange={updateGroup} title="01｜グループ目標 記入シート" labelPrefix="グループ" />}
                {step === 3 && <CompanyGoalForm data={formData.company} onChange={updateCompany} title="02｜会社目標 記入シート" labelPrefix="会社" parentStrategicFocus={formData.group.strategicFocus} parentLabelPrefix="グループ" />}
                {step === 4 && <DeptGoalForm data={formData.dept} onChange={updateDept} companyStrategicFocus={formData.company.strategicFocus} />}
                {step === 5 && <PersonalGoalForm data={formData.personal} onChange={updatePersonal} />}
                {step === 6 && <CommitmentForm data={formData.personal} grade={formData.cover.grade} onChange={updatePersonal} />}
                {step === 7 && <GradeForm selectedGrade={formData.cover.grade} expectations={formData.gradeExpectations} onChange={updateGradeExpectations} />}
                {step === 8 && <PromotionForm data={formData.promotion} onChange={updatePromotion} />}
                {step === 9 && <BonusForm data={formData.bonus} onChange={updateBonus} />}
                {step === 10 && <ConfirmView data={formData} />}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(step - 1)}
                  disabled={step === 1}
                >
                  ← 前へ
                </button>

                {step < 10 ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate(step + 1)}
                  >
                    次へ →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleShare}
                    disabled={sharePending}
                  >
                    {sharePending
                      ? '生成中…'
                      : shareCopied
                        ? '✓ URLをコピーしました'
                        : shareUrl
                          ? '🔗 URLを再生成してコピー'
                          : '🔗 シェア用URLを作成してコピー'}
                  </button>
                )}
              </div>

              {shareUrl && step === 10 && (
                <div style={{
                  marginTop: 20,
                  padding: '16px 20px',
                  background: 'rgba(123,183,133,.14)',
                  border: '1px solid rgba(123,183,133,.30)',
                  borderRadius: 'var(--r)',
                  fontSize: '.875rem',
                  color: 'var(--color-text)',
                  display: 'grid',
                  gap: 10,
                }}>
                  <div style={{ fontWeight: 600 }}>
                    {shareCopied ? '✓ クリップボードにコピーしました。Slack やメールに貼り付けて共有してください。' : 'シェア用URLを生成しました。'}
                  </div>
                  {shareNotice && (
                    <div style={{ fontSize: '.75rem', color: 'var(--color-warning)' }}>
                      ⚠ {shareNotice}
                    </div>
                  )}
                  <code
                    style={{
                      fontSize: '.7rem',
                      color: 'var(--color-text-muted)',
                      wordBreak: 'break-all',
                      background: 'rgba(255,255,255,.55)',
                      padding: '8px 10px',
                      borderRadius: 'var(--r-sm)',
                      lineHeight: 1.5,
                    }}
                  >
                    {shareUrl.length > 120 ? `${shareUrl.slice(0, 120)}…（全${shareUrl.length}字）` : shareUrl}
                  </code>
                  <div style={{ display: 'flex', gap: 12, fontSize: '.75rem' }}>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--color-info)', textDecoration: 'underline' }}
                    >
                      新規タブで見え方を確認 →
                    </a>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                          setShareCopied(true);
                          setTimeout(() => setShareCopied(false), 2400);
                        } catch {}
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-info)',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline',
                        fontSize: '.75rem',
                      }}
                    >
                      もう一度コピー
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function ConfirmView({ data }: { data: FormData }) {
  const phase1Total = data.bonus.canAfford + data.bonus.hasProfit + data.bonus.futureProfit;
  const supervisorPoints = data.bonus.supervisorEval * (data.bonus.noSupervisor ? 2 : 1);
  const phase2Total =
    data.bonus.deptKpiAchieved + data.bonus.personalKpiAchieved + supervisorPoints +
    data.bonus.valueEval + data.bonus.reproducibility + data.bonus.roleAchievement +
    data.bonus.difficulty + data.bonus.mgmtEval;
  const promotionTotal =
    data.promotion.tenurePoint + data.promotion.deptGrowthPoint + data.promotion.personalKpiPoint +
    data.promotion.supervisorPoint + data.promotion.mgmtPoint + data.promotion.nurturingPoint;

  const valueNum = parseFloat(data.promotion.valueScore);
  const promotionGatePass = !isNaN(valueNum) && data.promotion.valueScore !== '' && valueNum >= 3.5;
  const isPromotionEligible = promotionGatePass && promotionTotal >= 11;

  const promotionLabel = data.promotion.valueScore === ''
    ? `${promotionTotal}pt`
    : isPromotionEligible
      ? `${promotionTotal}pt（昇格対象）`
      : !promotionGatePass
        ? `${promotionTotal}pt（VALUEゲート未通過）`
        : `${promotionTotal}pt（あと${11 - promotionTotal}pt）`;

  const rows = [
    { label: '所属法人', value: data.cover.company || '（未入力）' },
    { label: '氏名', value: data.cover.name || '（未入力）' },
    { label: 'グレード', value: data.cover.grade || '（未入力）' },
    { label: '期', value: data.cover.period || '（未入力）' },
    { label: '個人目標数', value: `${data.personal.smartGoals.filter(r => r.s || r.m || r.a || r.r || r.t).length} 件` },
    { label: '昇格評価合計', value: promotionLabel },
    { label: 'ボーナス支給額', value: phase1Total >= 3 ? `${(phase2Total * 110000).toLocaleString('ja-JP')}円` : '0円（財務ゲート未通過）' },
  ];

  return (
    <div>
      <p className="section-title">確認・出力</p>
      <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
        入力内容を確認して「シェア用URLを作成してコピー」ボタンを押してください。受け取った人はブラウザで開くと、あなたが入力したそのままの見た目で内容を確認できます。
      </p>

      <div className="table-wrap" style={{ marginBottom: 28 }}>
        <table className="data-table">
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td style={{ width: '30%', color: 'var(--color-text-muted)', fontSize: '.8125rem', fontWeight: 500 }}>
                  {row.label}
                </td>
                <td style={{ fontWeight: row.value.includes('（未入力）') ? 400 : 500 }}>
                  <span style={{ color: row.value.includes('（未入力）') ? 'var(--color-text-light)' : 'var(--color-text)' }}>
                    {row.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        padding: '16px 20px',
        background: 'rgba(230,226,215,.40)',
        borderRadius: 'var(--r)',
        fontSize: '.8125rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.8,
      }}>
        <strong style={{ color: 'var(--color-text)' }}>共有されるセクション：</strong>
        <br />
        1. カバー &nbsp; 2. グループ目標 &nbsp; 3. 会社目標 &nbsp; 4. 部署目標 &nbsp; 5. 個人目標 &nbsp; 6. ギャランティ &nbsp; 7. グレード表 &nbsp; 8. 昇格・昇給採点 &nbsp; 9. ボーナス評価採点
      </div>
    </div>
  );
}
