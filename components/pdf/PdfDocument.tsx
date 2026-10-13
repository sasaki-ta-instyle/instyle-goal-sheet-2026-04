import type { ReactNode } from 'react';
import {
  FormData,
  DeptGoalData,
  CompanyGoalData,
  PromotionData,
  BonusData,
  GradeExpectations,
  CommitmentRow,
  GRADE_TABLE,
  getAnnualSalaryByGrade,
  getMonthlySalaryByGrade,
} from '@/lib/types';

/*
 * 7 ページ PDF（1366×900 landscape）
 *   P1 表紙              cover
 *   P2 会社目標          company
 *   P3 部署目標          dept
 *   P4 個人目標①        現在地の確認 + SMART 個人目標
 *   P5 個人目標②        SL 理論 + 上長からの一言
 *   P6 グレード期待項目  grade expectations（全 13 件を全文表示）
 *   P7 ギャランティ＋昇格＋ボーナス
 * 2026 年 4-9 月期（上期）版は兼部シート（dept2）を扱わない。
 */

const ASSETS = 'https://app.instyle.group/_shared/static';

function fmtMoney(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^\d-]/g, ''), 10);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('ja-JP');
}

function textOrDash(v: string | undefined | null): string {
  const s = (v ?? '').trim();
  return s ? s : '—';
}

// P1 表紙
function CoverPage({ data, ownerUrlSlot, ownerUrlPill }: { data: FormData; ownerUrlSlot?: ReactNode; ownerUrlPill?: ReactNode }) {
  const c = data.cover;
  return (
    <section className="pdf-page pdf-cover">
      {ownerUrlPill}
      <div className="pdf-cover-scene" aria-hidden />
      <div className="pdf-cover-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="pdf-cover-logo" src={`${ASSETS}/logo.svg`} alt="INSTYLE GROUP" />
        <h1 className="pdf-cover-title">目標設定シート</h1>
        <p className="pdf-cover-period">{c.period || '2026年4月-9月期'}</p>
        <dl className="pdf-cover-meta">
          <dt>所属法人</dt>
          <dd>{textOrDash(c.company)}</dd>
          <dt>氏名</dt>
          <dd>{textOrDash(c.name)}</dd>
          <dt>グレード</dt>
          <dd>{textOrDash(c.grade)}</dd>
        </dl>
        {ownerUrlSlot}
      </div>
      <div className="pdf-page-footer">
        <span>INSTYLE GROUP</span>
        <span>P.1 / 7</span>
      </div>
    </section>
  );
}

// 会社目標カード（上期は粗利益行あり、兼部なし）
function CompanyGoalCard({ data, title }: { data: CompanyGoalData; title: string }) {
  const rows: Array<[string, { prev: string; target: string; actual: string }, string]> = [
    ['売上', data.revenue, '千円'],
    ['粗利益', data.grossProfit, '千円'],
    ['営業利益', data.operatingProfit, '千円'],
    ['営業利益率', data.operatingMargin, '%'],
  ];
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">{title}</p>
      <div className="pdf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <table className="pdf-mini-table">
          <thead>
            <tr>
              <th>項目</th>
              <th className="num">前期実績</th>
              <th className="num">今期目標</th>
              <th className="num">実績</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, r, unit]) => (
              <tr key={label}>
                <td>{label}</td>
                <td className="num">{textOrDash(r.prev)}</td>
                <td className="num">{textOrDash(r.target)}</td>
                <td className="num">{textOrDash(r.actual)}</td>
                <td style={{ color: 'var(--color-text-muted)' }}>{unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div>
          <p style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>戦略フォーカス</p>
          <p style={{ fontSize: '.8125rem', lineHeight: 1.65 }}>{textOrDash(data.strategicFocus)}</p>
        </div>
      </div>
    </div>
  );
}

// 部署目標カード
function DeptGoalCard({ data, title }: { data: DeptGoalData; title: string }) {
  const kpis = [data.kpi1, data.kpi2, data.kpi3, data.kpi4, data.kpi5].filter(k => k.label.trim() || k.target.trim());
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">{title}</p>
      <div className="pdf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <p style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>ミッション</p>
          <p style={{ fontSize: '.8125rem', lineHeight: 1.55 }}>{textOrDash(data.mission)}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { label: 'KGI 1', row: data.kgi1 },
            { label: 'KGI 2', row: data.kgi2 },
          ].map(({ label, row }) => (
            <div key={label}>
              <p style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)' }}>{label}</p>
              <p style={{ fontSize: '.75rem', lineHeight: 1.5 }}>
                <strong>{textOrDash(row.mission)}</strong>
                <br />
                <span style={{ color: 'var(--color-text-muted)' }}>{textOrDash(row.kgi)}</span>
              </p>
            </div>
          ))}
        </div>
        {kpis.length > 0 && (
          <table className="pdf-mini-table" style={{ marginTop: 2 }}>
            <thead>
              <tr>
                <th>KPI</th>
                <th className="num">目標</th>
                <th className="num">実績</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, i) => (
                <tr key={i}>
                  <td>{textOrDash(k.label)}</td>
                  <td className="num">{textOrDash(k.target)}</td>
                  <td className="num">{textOrDash(k.actual)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// P2 会社目標（単独）
function CompanyPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">01｜会社目標</h2>
      <p className="pdf-page-lede">今期の会社としての骨太と戦略フォーカス。</p>
      <div className="pdf-grid-single">
        <CompanyGoalCard data={data.company} title="会社目標" />
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.2 / 7</span>
      </div>
    </section>
  );
}

// P3 部署目標（単独）
function DeptPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">02｜部署目標</h2>
      <p className="pdf-page-lede">会社骨太にぶら下がる部署ミッション・KGI・KPI。</p>
      <div className="pdf-grid-single">
        <DeptGoalCard data={data.dept} title="部署目標" />
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.3 / 7</span>
      </div>
    </section>
  );
}

// P4 個人目標① 現在地 + SMART
function PersonalCurrentSmartPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  const p = data.personal;
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">03｜個人目標 — 現在地 &amp; SMART</h2>
      <p className="pdf-page-lede">今の自分の位置と、今期の SMART 個人目標。</p>
      <div className="pdf-grid-2" style={{ gridTemplateColumns: '1fr 1.4fr' }}>
        <div className="pdf-card">
          <p className="pdf-card-heading">現在地の確認</p>
          <div className="pdf-card-body">
            <dl>
              {p.currentStatus.map((r, i) => (
                <div key={i} style={{ display: 'contents' }}>
                  <dt>{r.label}</dt>
                  <dd>{textOrDash(r.value)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="pdf-card">
          <p className="pdf-card-heading">SMART 個人目標</p>
          <div className="pdf-card-body" style={{ flex: 1, overflow: 'hidden' }}>
            {p.smartGoals.map((g, i) => (
              <div key={i} className="pdf-smart-row">
                <p className="pdf-smart-row-title">
                  目標 {i + 1}
                  {g.relatedKpi.trim() && (
                    <span style={{ marginLeft: 8, fontWeight: 500, color: 'var(--color-text)' }}>
                      / 部署KPI: {g.relatedKpi}
                    </span>
                  )}
                </p>
                <div className="pdf-smart-fields">
                  {(['s', 'm', 'a', 'r', 't'] as const).map(k => (
                    <div key={k} style={{ display: 'contents' }}>
                      <span className="letter">{k.toUpperCase()}</span>
                      <span className="value">{textOrDash(g[k])}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.4 / 7</span>
      </div>
    </section>
  );
}

// P5 個人目標② SL 理論 + 上長からの一言
function PersonalSlSupervisorPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  const p = data.personal;
  const slLabel: Record<string, string> = {
    S1: 'S1｜指示型', S2: 'S2｜コーチ型', S3: 'S3｜支援型', S4: 'S4｜委任型', '': '（未設定）',
  };
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">03｜個人目標 — SL 理論 &amp; 上長コメント</h2>
      <p className="pdf-page-lede">期中の関わり方の握りと、上長からの一言。</p>
      <div className="pdf-grid-2">
        <div className="pdf-card">
          <p className="pdf-card-heading">SL 理論（今期の関わり方）</p>
          <div className="pdf-card-body">
            <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 8 }}>{slLabel[p.slLevel] ?? '（未設定）'}</p>
            <p style={{ fontSize: '.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {textOrDash(p.slNote)}
            </p>
          </div>
        </div>
        <div className={`pdf-card pdf-supervisor${p.supervisorComment.trim() ? '' : ' empty'}`}>
          <p className="pdf-card-heading">上長からの一言</p>
          <div className="pdf-card-body">
            <p style={{ fontSize: '.875rem', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {p.supervisorComment.trim() || '（未記入）'}
            </p>
          </div>
        </div>
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.5 / 7</span>
      </div>
    </section>
  );
}

// P5 グレード期待項目（全 tier/grade を縦 1 枚テーブルで全文表示）
const expectKey = (key: string): string => key.replace("'", '');

function GradeExpectationsPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  const selectedGrade = data.cover.grade;
  const exp = data.gradeExpectations;
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">05｜グレード期待項目</h2>
      <p className="pdf-page-lede">各クラスに求める目安・行動基準（カバーで選択したグレードはハイライト）。</p>
      <div className="pdf-grid-single">
        <div className="pdf-card pdf-card-grade">
          <div className="pdf-card-body" style={{ padding: 0 }}>
            <table className="pdf-grade-list">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>Tier</th>
                  <th style={{ width: 160 }}>Tier 名</th>
                  <th style={{ width: 70, textAlign: 'center' }}>Grade</th>
                  <th style={{ width: 110, textAlign: 'right' }}>月給</th>
                  <th>期待項目・行動基準</th>
                </tr>
              </thead>
              <tbody>
                {GRADE_TABLE.flatMap(tier =>
                  tier.grades.map((g, gIdx) => {
                    const isSelected = g.key === selectedGrade;
                    const eKey = expectKey(g.key);
                    const value = (exp[eKey] ?? '').trim();
                    return (
                      <tr key={g.key} className={isSelected ? 'selected' : undefined}>
                        {gIdx === 0 && (
                          <td className="tier" rowSpan={tier.grades.length}>{tier.tier}</td>
                        )}
                        {gIdx === 0 && (
                          <td className="tier-name" rowSpan={tier.grades.length}>{tier.tierName}</td>
                        )}
                        <td className="grade-key">{isSelected ? '● ' : ''}{g.key}</td>
                        <td className="salary">{g.salary}</td>
                        <td className="expectation">{value || '—'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.6 / 7</span>
      </div>
    </section>
  );
}

// P7 ギャランティ + 昇格 + ボーナス
function GradeCard({ grade, expectations }: { grade: string; expectations: GradeExpectations }) {
  const salary = getMonthlySalaryByGrade((grade || '') as never);
  const annual = getAnnualSalaryByGrade((grade || '') as never);
  const tier = GRADE_TABLE.find(t => t.grades.some(g => g.key === grade));
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">05｜グレード</p>
      <div className="pdf-card-body">
        <p style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>
          {grade || '—'}
        </p>
        <p style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginBottom: 10 }}>
          {tier ? `${tier.tier} ${tier.tierName}` : '（未選択）'}
        </p>
        <div className="pdf-stat">
          <span className="pdf-stat-num">{salary ? salary.toLocaleString('ja-JP') : '—'}</span>
          <span className="pdf-stat-unit">円 / 月</span>
        </div>
        <p className="pdf-stat-note">
          年収換算 {annual ? annual.toLocaleString('ja-JP') + '円' : '—'}
        </p>
        {expectations && Object.keys(expectations).length > 0 && (
          <p style={{ fontSize: '.6875rem', color: 'var(--color-text-muted)', marginTop: 8 }}>
            期待項目 {Object.values(expectations).filter(Boolean).length} 件記入済
          </p>
        )}
      </div>
    </div>
  );
}

function CommitmentCard({ commitment }: { commitment: CommitmentRow[] }) {
  const total = commitment.reduce((sum, r) => {
    const n = parseInt(r.amount || '0', 10);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);
  const filled = commitment.filter(r => (r.amount || '').trim() || (r.rationale || '').trim());
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">04｜ギャランティ（貢献の中身）</p>
      <div className="pdf-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="pdf-stat">
          <span className="pdf-stat-num">{fmtMoney(total)}</span>
          <span className="pdf-stat-unit">円 / 年</span>
        </div>
        {filled.length > 0 ? (
          <table className="pdf-mini-table" style={{ marginTop: 4 }}>
            <thead>
              <tr>
                <th className="num" style={{ width: 100 }}>金額</th>
                <th>項目・概要</th>
              </tr>
            </thead>
            <tbody>
              {filled.map((r, i) => (
                <tr key={i}>
                  <td className="num">{fmtMoney(r.amount)}</td>
                  <td>{textOrDash(r.rationale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="pdf-stat-note">明細未記入</p>
        )}
      </div>
    </div>
  );
}

function PromotionCard({ data }: { data: PromotionData }) {
  const total =
    data.tenurePoint + data.deptGrowthPoint + data.personalKpiPoint +
    data.supervisorPoint + data.mgmtPoint + data.nurturingPoint;
  const valueNum = parseFloat(data.valueScore);
  const gate = !isNaN(valueNum) && data.valueScore !== '' && valueNum >= 3.5;
  const eligible = gate && total >= 11;
  const label = data.valueScore === ''
    ? `${total}pt`
    : eligible
      ? `${total}pt（昇格対象）`
      : !gate
        ? `${total}pt（VALUE ゲート未通過）`
        : `${total}pt（あと ${11 - total}pt）`;
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">06｜昇格・昇給採点</p>
      <div className="pdf-card-body">
        <div className="pdf-stat">
          <span className="pdf-stat-num">{total}</span>
          <span className="pdf-stat-unit">pt</span>
        </div>
        <p className="pdf-stat-note">{label}</p>
        <table className="pdf-mini-table" style={{ marginTop: 8 }}>
          <tbody>
            <tr><td>在籍</td><td className="num">{data.tenurePoint}pt</td></tr>
            <tr><td>部署成長</td><td className="num">{data.deptGrowthPoint}pt</td></tr>
            <tr><td>個人KPI</td><td className="num">{data.personalKpiPoint}pt</td></tr>
            <tr><td>上長評価</td><td className="num">{data.supervisorPoint}pt</td></tr>
            <tr><td>経営評価</td><td className="num">{data.mgmtPoint}pt</td></tr>
            <tr><td>育成</td><td className="num">{data.nurturingPoint}pt</td></tr>
            <tr><td style={{ fontWeight: 600 }}>VALUE スコア</td><td className="num">{data.valueScore || '—'}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BonusCard({ data }: { data: BonusData }) {
  const phase1 = data.canAfford + data.hasProfit + data.futureProfit;
  const supervisor = data.noSupervisor ? 0 : data.supervisorEval;
  const mgmt = data.mgmtEval * (data.noSupervisor ? 2 : 1);
  const phase2 =
    data.deptKpiAchieved + data.personalKpiAchieved + supervisor +
    data.valueEval + data.reproducibility + data.roleAchievement +
    data.difficulty + mgmt;
  const payout = phase1 >= 3 ? (phase1 + phase2) * 110000 : 0;
  return (
    <div className="pdf-card">
      <p className="pdf-card-heading">07｜ボーナス評価採点</p>
      <div className="pdf-card-body">
        <div className="pdf-stat">
          <span className="pdf-stat-num">{fmtMoney(payout)}</span>
          <span className="pdf-stat-unit">円</span>
        </div>
        <p className="pdf-stat-note">
          {phase1 >= 3 ? `Phase1 ${phase1}pt / Phase2 ${phase2}pt` : `財務ゲート未通過（Phase1 ${phase1}pt < 3）`}
        </p>
        <table className="pdf-mini-table" style={{ marginTop: 8 }}>
          <tbody>
            <tr><td>財務ゲート合計</td><td className="num">{phase1}pt</td></tr>
            <tr><td>部署KPI達成</td><td className="num">{data.deptKpiAchieved}pt</td></tr>
            <tr><td>個人KPI達成</td><td className="num">{data.personalKpiAchieved}pt</td></tr>
            <tr><td>上長評価</td><td className="num">{supervisor}pt</td></tr>
            <tr><td>VALUE 評価</td><td className="num">{data.valueEval}pt</td></tr>
            <tr><td>再現性</td><td className="num">{data.reproducibility}pt</td></tr>
            <tr><td>役割達成</td><td className="num">{data.roleAchievement}pt</td></tr>
            <tr><td>難易度</td><td className="num">{data.difficulty}pt</td></tr>
            <tr><td>経営評価</td><td className="num">{mgmt}pt</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GuarantyPage({ data, ownerUrlPill }: { data: FormData; ownerUrlPill?: ReactNode }) {
  return (
    <section className="pdf-page">
      {ownerUrlPill}
      <h2 className="pdf-page-title">04｜ギャランティ / 06｜昇格 / 07｜ボーナス</h2>
      <p className="pdf-page-lede">今期の対価の全体像（グレード詳細は P5 参照）。</p>
      <div className="pdf-grid-3">
        <CommitmentCard commitment={data.personal.commitment} />
        <PromotionCard data={data.promotion} />
        <BonusCard data={data.bonus} />
      </div>
      <div className="pdf-page-footer">
        <span>{data.cover.name || '氏名未入力'} / {data.cover.company || '所属未入力'}</span>
        <span>P.7 / 7</span>
      </div>
    </section>
  );
}

export default function PdfDocument({
  data,
  ownerUrlSlot,
  ownerUrlPill,
}: {
  data: FormData;
  ownerUrlSlot?: ReactNode;
  ownerUrlPill?: ReactNode;
}) {
  return (
    <div className="pdf-doc">
      <CoverPage data={data} ownerUrlSlot={ownerUrlSlot} ownerUrlPill={ownerUrlPill} />
      <CompanyPage data={data} ownerUrlPill={ownerUrlPill} />
      <DeptPage data={data} ownerUrlPill={ownerUrlPill} />
      <PersonalCurrentSmartPage data={data} ownerUrlPill={ownerUrlPill} />
      <PersonalSlSupervisorPage data={data} ownerUrlPill={ownerUrlPill} />
      <GradeExpectationsPage data={data} ownerUrlPill={ownerUrlPill} />
      <GuarantyPage data={data} ownerUrlPill={ownerUrlPill} />
    </div>
  );
}
