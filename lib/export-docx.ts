// FormData → .docx 書き出し。PDF の固定レイアウトでは切れてしまう長文を、
// 自然に流れる Word ドキュメントとして全文出力する。
// Google Docs / Word で開ける .docx を生成し、ブラウザから直接ダウンロードさせる。
// 上期（2026.4〜9）版は兼部シート（dept2）を扱わない。

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from 'docx';
import type { FormData, DeptGoalData, CommitmentRow } from './types';
import { GRADE_TABLE, getMonthlySalaryByGrade, getAnnualSalaryByGrade } from './types';

const expectKey = (key: string): string => key.replace("'", '');

const h1 = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, bold: true, size: 32 })],
    spacing: { before: 320, after: 160 },
  });

const h2 = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, bold: true, size: 26 })],
    spacing: { before: 240, after: 120 },
  });

const h3 = (text: string): Paragraph =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    children: [new TextRun({ text, bold: true, size: 22 })],
    spacing: { before: 200, after: 80 },
  });

const p = (text: string): Paragraph =>
  new Paragraph({
    children: [new TextRun({ text: text || '—', size: 20 })],
    spacing: { after: 80 },
  });

const kv = (key: string, value: string): Paragraph =>
  new Paragraph({
    children: [
      new TextRun({ text: `${key}: `, bold: true, size: 20 }),
      new TextRun({ text: value || '—', size: 20 }),
    ],
    spacing: { after: 60 },
  });

const bullet = (text: string): Paragraph =>
  new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text: text || '—', size: 20 })],
    spacing: { after: 40 },
  });

const spacer = (): Paragraph => new Paragraph({ children: [new TextRun('')], spacing: { after: 120 } });

const cellText = (text: string, opts: { bold?: boolean; size?: number } = {}): TableCell =>
  new TableCell({
    children: [
      new Paragraph({ children: [new TextRun({ text: text || '—', bold: opts.bold, size: opts.size ?? 20 })] }),
    ],
  });

const simpleTable = (header: string[], rows: string[][]): Table =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: header.map(h => cellText(h, { bold: true })) }),
      ...rows.map(r => new TableRow({ children: r.map(c => cellText(c)) })),
    ],
  });

function companySection(data: FormData): Paragraph[] {
  const c = data.company;
  const paras: Paragraph[] = [
    h2('01｜会社目標'),
    h3('戦略フォーカス'),
    p(c.strategicFocus),
    h3('KPI'),
  ];
  const kpiTable = simpleTable(
    ['指標', '前期実績', '今期目標', '今期実績'],
    [
      ['売上', c.revenue.prev, c.revenue.target, c.revenue.actual],
      ['営業利益', c.operatingProfit.prev, c.operatingProfit.target, c.operatingProfit.actual],
      ['営業利益率', c.operatingMargin.prev, c.operatingMargin.target, c.operatingMargin.actual],
    ],
  );
  return [...paras, (kpiTable as unknown) as Paragraph, spacer()];
}

function deptSection(data: DeptGoalData, title: string): Paragraph[] {
  const paras: Paragraph[] = [h3(title), kv('ミッション', data.mission), h3('KGI'), kv('KGI 1 ミッション', data.kgi1.mission), kv('KGI 1', data.kgi1.kgi), kv('KGI 2 ミッション', data.kgi2.mission), kv('KGI 2', data.kgi2.kgi), h3('KPI')];
  const kpiRows = [data.kpi1, data.kpi2, data.kpi3, data.kpi4, data.kpi5]
    .filter(k => (k.label || '').trim() || (k.target || '').trim() || (k.actual || '').trim())
    .map((k, i) => [`KPI${i + 1}`, k.label || '—', k.prev || '—', k.target || '—', k.actual || '—']);
  if (kpiRows.length > 0) {
    paras.push((simpleTable(['#', '指標名', '前期', '目標', '実績'], kpiRows) as unknown) as Paragraph);
  } else {
    paras.push(p('（KPI 未入力）'));
  }
  paras.push(h3('今期の重点施策'));
  const actions = data.actions.filter(a => (a.content || '').trim() || (a.expectedEffect || '').trim());
  if (actions.length === 0) {
    paras.push(p('（施策未入力）'));
  } else {
    actions.forEach((a, i) => {
      paras.push(new Paragraph({
        children: [new TextRun({ text: `施策 ${i + 1}`, bold: true, size: 22 })],
        spacing: { before: 120, after: 40 },
      }));
      paras.push(kv('内容', a.content));
      paras.push(kv('期待する効果', a.expectedEffect));
      paras.push(kv('期限', a.deadline));
    });
  }
  paras.push(spacer());
  return paras;
}

function personalSection(data: FormData): Paragraph[] {
  const pr = data.personal;
  const paras: Paragraph[] = [h2('03｜個人目標'), h3('現在地の確認')];
  pr.currentStatus.forEach(r => {
    paras.push(kv(r.label, r.value));
  });

  paras.push(h3('SMART 個人目標'));
  pr.smartGoals.forEach((g, i) => {
    paras.push(new Paragraph({
      children: [new TextRun({ text: `目標 ${i + 1}`, bold: true, size: 22 })],
      spacing: { before: 160, after: 60 },
    }));
    if (g.relatedKpi.trim()) paras.push(kv('該当する部署KPI', g.relatedKpi));
    paras.push(kv('S（具体的）', g.s));
    paras.push(kv('M（測定可能）', g.m));
    paras.push(kv('A（達成可能）', g.a));
    paras.push(kv('R（関連性）', g.r));
    paras.push(kv('T（期限）', g.t));
    if (g.note.trim()) paras.push(kv('備考', g.note));
  });

  const slLabel: Record<string, string> = {
    S1: 'S1｜指示型', S2: 'S2｜コーチ型', S3: 'S3｜支援型', S4: 'S4｜委任型', '': '（未設定）',
  };
  paras.push(h3('SL 理論（今期の関わり方）'));
  paras.push(kv('レベル', slLabel[pr.slLevel] ?? '（未設定）'));
  paras.push(kv('メモ', pr.slNote));

  paras.push(h3('上長からの一言'));
  paras.push(p(pr.supervisorComment.trim() || '（未記入）'));
  paras.push(spacer());
  return paras;
}

function commitmentSection(commitment: CommitmentRow[]): Paragraph[] {
  const paras: Paragraph[] = [h2('04｜ギャランティ（貢献の中身）')];
  const total = commitment.reduce((sum, r) => sum + (parseInt(r.amount || '0', 10) || 0), 0);
  paras.push(kv('合計', `${total.toLocaleString('ja-JP')} 円 / 年`));
  const filled = commitment.filter(r => (r.amount || '').trim() || (r.rationale || '').trim());
  if (filled.length === 0) {
    paras.push(p('（明細未入力）'));
  } else {
    paras.push((simpleTable(
      ['金額（円）', '項目・概要'],
      filled.map(r => [parseInt(r.amount || '0', 10).toLocaleString('ja-JP'), r.rationale || '—']),
    ) as unknown) as Paragraph);
  }
  paras.push(spacer());
  return paras;
}

function gradeExpectationsSection(data: FormData): Paragraph[] {
  const paras: Paragraph[] = [h2('05｜グレード期待項目'), p('各グレードに求める目安・行動基準。選択中のグレードは [●] 印。')];
  const selected = data.cover.grade;
  const rows: string[][] = [];
  GRADE_TABLE.forEach(tier => {
    tier.grades.forEach(g => {
      const eKey = expectKey(g.key);
      const value = (data.gradeExpectations[eKey] ?? '').trim();
      rows.push([
        `${tier.tier}  ${tier.tierName}`,
        `${g.key === selected ? '● ' : ''}${g.key}`,
        g.salary,
        value || '—',
      ]);
    });
  });
  paras.push((simpleTable(['Tier', 'Grade', '月給', '期待項目・行動基準'], rows) as unknown) as Paragraph);
  const salary = getMonthlySalaryByGrade((selected || '') as never);
  const annual = getAnnualSalaryByGrade((selected || '') as never);
  paras.push(spacer());
  paras.push(kv('現在の月給', salary ? `${salary.toLocaleString('ja-JP')} 円 / 月` : '—'));
  paras.push(kv('現在の年収換算', annual ? `${annual.toLocaleString('ja-JP')} 円` : '—'));
  paras.push(spacer());
  return paras;
}

function promotionSection(data: FormData): Paragraph[] {
  const d = data.promotion;
  const total = d.tenurePoint + d.deptGrowthPoint + d.personalKpiPoint + d.supervisorPoint + d.mgmtPoint + d.nurturingPoint;
  return [
    h2('06｜昇格・昇給採点'),
    kv('合計', `${total} pt`),
    kv('VALUE スコア', d.valueScore || '—'),
    bullet(`在籍: ${d.tenurePoint} pt`),
    bullet(`部署成長: ${d.deptGrowthPoint} pt`),
    bullet(`個人KPI: ${d.personalKpiPoint} pt`),
    bullet(`上長評価: ${d.supervisorPoint} pt`),
    bullet(`経営評価: ${d.mgmtPoint} pt`),
    bullet(`育成: ${d.nurturingPoint} pt`),
    spacer(),
  ];
}

function bonusSection(data: FormData): Paragraph[] {
  const d = data.bonus;
  const phase1 = d.canAfford + d.hasProfit + d.futureProfit;
  const supervisor = d.noSupervisor ? 0 : d.supervisorEval;
  const mgmt = d.mgmtEval * (d.noSupervisor ? 2 : 1);
  const phase2 = d.deptKpiAchieved + d.personalKpiAchieved + supervisor + d.valueEval + d.reproducibility + d.roleAchievement + d.difficulty + mgmt;
  const payout = phase1 >= 3 ? (phase1 + phase2) * 110000 : 0;
  return [
    h2('07｜ボーナス評価採点'),
    kv('支給額', `${payout.toLocaleString('ja-JP')} 円`),
    kv('Phase1（財務ゲート）', `${phase1} pt ${phase1 >= 3 ? '✓ 通過' : '✗ 未通過'}`),
    kv('Phase2（評価合計）', `${phase2} pt`),
    bullet(`部署KPI達成: ${d.deptKpiAchieved} pt`),
    bullet(`個人KPI達成: ${d.personalKpiAchieved} pt`),
    bullet(`上長評価: ${supervisor} pt`),
    bullet(`VALUE 評価: ${d.valueEval} pt`),
    bullet(`再現性: ${d.reproducibility} pt`),
    bullet(`役割達成: ${d.roleAchievement} pt`),
    bullet(`難易度: ${d.difficulty} pt`),
    bullet(`経営評価: ${mgmt} pt`),
    spacer(),
  ];
}

export async function exportDocx(data: FormData): Promise<void> {
  const cover = data.cover;

  const children: Paragraph[] = [
    h1('目標設定シート'),
    p(cover.period || ''),
    kv('所属法人', cover.company),
    kv('氏名', cover.name),
    kv('グレード', cover.grade),
    spacer(),
    ...companySection(data),
    h2('02｜部署目標'),
    ...deptSection(data.dept, '部署目標'),
    ...personalSection(data),
    ...commitmentSection(data.personal.commitment),
    ...gradeExpectationsSection(data),
    ...promotionSection(data),
    ...bonusSection(data),
  ];

  const doc = new Document({
    creator: 'INSTYLE GROUP',
    title: '目標設定シート',
    styles: {
      default: {
        document: {
          run: { font: 'Yu Gothic', size: 20 },
        },
      },
    },
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const name = (cover.name || '氏名未入力').trim();
  const periodSlug = (cover.period || '').replace(/[^0-9A-Za-z一-龯ぁ-んァ-ヶー]/g, '-');
  const fname = `目標設定シート_${name}_${periodSlug}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
