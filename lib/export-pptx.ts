// FormData → .pptx 書き出し。PDF の固定レイアウトでは切れてしまう長文を、
// 1 セクション 1 スライドの PowerPoint に流し込む。長文は PPT 内でスライドを編集して調整可能。
// pptxgenjs を使ってブラウザから直接ダウンロード。
// 上期（2026.4〜9）版は兼部シート（dept2）を扱わない。

import PptxGenJS from 'pptxgenjs';
import type { FormData, DeptGoalData } from './types';
import { GRADE_TABLE } from './types';

const expectKey = (key: string): string => key.replace("'", '');

const FONT = 'Yu Gothic';
const COLOR_TEXT = '20211A';
const COLOR_MUTED = '82837A';
const COLOR_ACCENT = '24837B';
const COLOR_HEADER_BG = 'F3F1EE';

type Slide = PptxGenJS.Slide;

function addSlideTitle(slide: Slide, title: string, lede?: string) {
  slide.addText(title, {
    x: 0.5, y: 0.3, w: 12.3, h: 0.5,
    fontFace: FONT, fontSize: 20, bold: true, color: COLOR_TEXT,
  });
  if (lede) {
    slide.addText(lede, {
      x: 0.5, y: 0.85, w: 12.3, h: 0.3,
      fontFace: FONT, fontSize: 11, color: COLOR_MUTED,
    });
  }
}

function addCoverSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const c = data.cover;
  s.background = { color: COLOR_HEADER_BG };
  s.addText('目標設定シート', {
    x: 0.8, y: 2.2, w: 11.7, h: 1.2,
    fontFace: FONT, fontSize: 48, bold: true, color: COLOR_TEXT,
  });
  s.addText(c.period || '', {
    x: 0.8, y: 3.5, w: 11.7, h: 0.5,
    fontFace: FONT, fontSize: 20, color: COLOR_ACCENT, bold: true,
  });
  s.addText([
    { text: '所属法人 ', options: { bold: true, color: COLOR_MUTED, fontSize: 14 } },
    { text: (c.company || '—') + '\n', options: { color: COLOR_TEXT, fontSize: 16 } },
    { text: '氏名 ', options: { bold: true, color: COLOR_MUTED, fontSize: 14 } },
    { text: (c.name || '—') + '\n', options: { color: COLOR_TEXT, fontSize: 16 } },
    { text: 'グレード ', options: { bold: true, color: COLOR_MUTED, fontSize: 14 } },
    { text: c.grade || '—', options: { color: COLOR_TEXT, fontSize: 16 } },
  ], {
    x: 0.8, y: 4.5, w: 11.7, h: 2.0,
    fontFace: FONT, lineSpacingMultiple: 1.4,
  });
}

function addCompanySlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  addSlideTitle(s, '01｜会社目標', '今期の会社としての骨太と戦略フォーカス。');
  s.addText('戦略フォーカス', {
    x: 0.5, y: 1.3, w: 12.3, h: 0.3,
    fontFace: FONT, fontSize: 12, bold: true, color: COLOR_ACCENT,
  });
  s.addText(data.company.strategicFocus || '—', {
    x: 0.5, y: 1.65, w: 12.3, h: 1.6,
    fontFace: FONT, fontSize: 13, color: COLOR_TEXT, valign: 'top',
    autoFit: true,
  });
  const c = data.company;
  s.addTable([
    [
      { text: '指標', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
      { text: '前期実績', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
      { text: '今期目標', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
      { text: '今期実績', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
    ],
    [{ text: '売上' }, { text: c.revenue.prev || '—' }, { text: c.revenue.target || '—' }, { text: c.revenue.actual || '—' }],
    [{ text: '営業利益' }, { text: c.operatingProfit.prev || '—' }, { text: c.operatingProfit.target || '—' }, { text: c.operatingProfit.actual || '—' }],
    [{ text: '営業利益率' }, { text: c.operatingMargin.prev || '—' }, { text: c.operatingMargin.target || '—' }, { text: c.operatingMargin.actual || '—' }],
  ], {
    x: 0.5, y: 3.5, w: 12.3, h: 2.5,
    fontFace: FONT, fontSize: 12, color: COLOR_TEXT,
    border: { type: 'solid', pt: 0.5, color: 'D5D2C8' },
  });
}

function addDeptCoreSlide(pres: PptxGenJS, data: DeptGoalData, title: string) {
  const s = pres.addSlide();
  addSlideTitle(s, title, '部署ミッション・KGI・KPI。');

  s.addText([
    { text: 'ミッション\n', options: { bold: true, fontSize: 11, color: COLOR_ACCENT } },
    { text: (data.mission || '—') + '\n\n', options: { fontSize: 12, color: COLOR_TEXT } },
    { text: 'KGI 1 ミッション: ', options: { bold: true, fontSize: 11, color: COLOR_ACCENT } },
    { text: (data.kgi1.mission || '—') + '\n', options: { fontSize: 11, color: COLOR_TEXT } },
    { text: 'KGI 1 バリュー: ', options: { bold: true, fontSize: 11, color: COLOR_ACCENT } },
    { text: (data.kgi1.kgi || '—') + '\n\n', options: { fontSize: 11, color: COLOR_TEXT } },
    { text: 'KGI 2 ミッション: ', options: { bold: true, fontSize: 11, color: COLOR_ACCENT } },
    { text: (data.kgi2.mission || '—') + '\n', options: { fontSize: 11, color: COLOR_TEXT } },
    { text: 'KGI 2 バリュー: ', options: { bold: true, fontSize: 11, color: COLOR_ACCENT } },
    { text: data.kgi2.kgi || '—', options: { fontSize: 11, color: COLOR_TEXT } },
  ], {
    x: 0.5, y: 1.3, w: 6.0, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.3,
  });

  const kpiRows = [data.kpi1, data.kpi2, data.kpi3, data.kpi4, data.kpi5]
    .filter(k => (k.label || '').trim() || (k.target || '').trim() || (k.actual || '').trim())
    .map((k, i) => [
      { text: `KPI${i + 1}` },
      { text: k.label || '—' },
      { text: k.target || '—' },
      { text: k.actual || '—' },
    ]);
  const kpiTableRows: PptxGenJS.TableRow[] = [
    [
      { text: '#', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: '指標名', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: '目標', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: '実績', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
    ],
    ...(kpiRows.length > 0 ? kpiRows : [[{ text: '（KPI 未入力）', options: { colspan: 4, color: COLOR_MUTED } }]]),
  ];
  s.addText('KPI', {
    x: 6.7, y: 1.3, w: 6.1, h: 0.3,
    fontFace: FONT, fontSize: 12, bold: true, color: COLOR_MUTED,
  });
  s.addTable(kpiTableRows, {
    x: 6.7, y: 1.6, w: 6.1,
    fontFace: FONT, fontSize: 10, color: COLOR_TEXT,
    border: { type: 'solid', pt: 0.5, color: 'D5D2C8' },
  });
}

function addDeptActionsSlide(pres: PptxGenJS, data: DeptGoalData, title: string) {
  const s = pres.addSlide();
  addSlideTitle(s, title, '今期の重点施策（KPI を達成するための行動）。');

  const actions = data.actions.filter(a => (a.content || '').trim() || (a.expectedEffect || '').trim());
  const actionText: PptxGenJS.TextProps[] = [];
  if (actions.length === 0) {
    actionText.push({ text: '（未入力）', options: { fontSize: 14, color: COLOR_MUTED } });
  } else {
    actions.forEach((a, i) => {
      actionText.push({ text: `${i + 1}. `, options: { bold: true, fontSize: 13, color: COLOR_ACCENT } });
      actionText.push({ text: `${a.content || '—'}\n`, options: { fontSize: 13, color: COLOR_TEXT } });
      actionText.push({ text: `   期待効果: ${a.expectedEffect || '—'}\n`, options: { fontSize: 11, color: COLOR_MUTED } });
      actionText.push({ text: `   期限: ${a.deadline || '—'}\n\n`, options: { fontSize: 11, color: COLOR_MUTED } });
    });
  }
  s.addText(actionText, {
    x: 0.5, y: 1.3, w: 12.3, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.4,
  });
}

function addPersonalCurrentSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const p = data.personal;
  addSlideTitle(s, '03｜個人目標 — 現在地の確認', '今の自分の位置の棚卸し。');

  const items: PptxGenJS.TextProps[] = [];
  p.currentStatus.forEach(r => {
    items.push({ text: `${r.label}\n`, options: { bold: true, fontSize: 13, color: COLOR_ACCENT } });
    items.push({ text: `${r.value || '—'}\n\n`, options: { fontSize: 13, color: COLOR_TEXT } });
  });
  s.addText(items, {
    x: 0.5, y: 1.3, w: 12.3, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.5,
  });
}

function addPersonalSmartSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const p = data.personal;
  addSlideTitle(s, '03｜個人目標 — SMART 個人目標', '今期の SMART 目標。');

  const items: PptxGenJS.TextProps[] = [];
  p.smartGoals.forEach((g, i) => {
    items.push({ text: `目標 ${i + 1}`, options: { bold: true, fontSize: 13, color: COLOR_ACCENT } });
    if (g.relatedKpi.trim()) {
      items.push({ text: `  (${g.relatedKpi})`, options: { fontSize: 11, color: COLOR_MUTED } });
    }
    items.push({ text: '\n', options: {} });
    (['s', 'm', 'a', 'r', 't'] as const).forEach(k => {
      items.push({ text: `${k.toUpperCase()}: `, options: { bold: true, fontSize: 11, color: COLOR_MUTED } });
      items.push({ text: `${g[k] || '—'}\n`, options: { fontSize: 11, color: COLOR_TEXT } });
    });
    if (g.note.trim()) {
      items.push({ text: `備考: `, options: { bold: true, fontSize: 11, color: COLOR_MUTED } });
      items.push({ text: `${g.note}\n`, options: { fontSize: 11, color: COLOR_TEXT } });
    }
    items.push({ text: '\n', options: {} });
  });
  s.addText(items, {
    x: 0.5, y: 1.3, w: 12.3, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.3,
  });
}

function addPersonalSlSupervisorSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const p = data.personal;
  const slLabel: Record<string, string> = {
    S1: 'S1｜指示型', S2: 'S2｜コーチ型', S3: 'S3｜支援型', S4: 'S4｜委任型', '': '（未設定）',
  };
  addSlideTitle(s, '03｜個人目標 — SL 理論 & 上長コメント', '期中の関わり方の握りと、上長からの一言。');

  s.addText([
    { text: 'SL 理論（今期の関わり方）\n\n', options: { bold: true, fontSize: 12, color: COLOR_ACCENT } },
    { text: (slLabel[p.slLevel] ?? '（未設定）') + '\n\n', options: { bold: true, fontSize: 18, color: COLOR_TEXT } },
    { text: p.slNote || '（メモ未記入）', options: { fontSize: 12, color: COLOR_MUTED } },
  ], {
    x: 0.5, y: 1.3, w: 6.0, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.4,
  });

  s.addText([
    { text: '上長からの一言\n\n', options: { bold: true, fontSize: 12, color: COLOR_MUTED } },
    { text: p.supervisorComment.trim() || '（未記入）', options: { fontSize: 14, color: COLOR_TEXT } },
  ], {
    x: 6.7, y: 1.3, w: 6.1, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.5,
  });
}

function addCommitmentSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const commitment = data.personal.commitment;
  const total = commitment.reduce((sum, r) => sum + (parseInt(r.amount || '0', 10) || 0), 0);
  const filled = commitment.filter(r => (r.amount || '').trim() || (r.rationale || '').trim());

  addSlideTitle(s, '04｜ギャランティ（貢献の中身）', '今期の対価の明細。');

  s.addText(`合計 ${total.toLocaleString('ja-JP')} 円 / 年`, {
    x: 0.5, y: 1.3, w: 12.3, h: 0.6,
    fontFace: FONT, fontSize: 22, bold: true, color: COLOR_ACCENT,
  });

  if (filled.length === 0) {
    s.addText('（明細未入力）', {
      x: 0.5, y: 2.3, w: 12.3, h: 0.5,
      fontFace: FONT, fontSize: 14, color: COLOR_MUTED,
    });
  } else {
    const rows: PptxGenJS.TableRow[] = [
      [
        { text: '金額（円）', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
        { text: '項目・概要', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 11 } },
      ],
      ...filled.map(r => [
        { text: (parseInt(r.amount || '0', 10) || 0).toLocaleString('ja-JP') },
        { text: r.rationale || '—' },
      ]),
    ];
    s.addTable(rows, {
      x: 0.5, y: 2.2, w: 12.3,
      colW: [2.5, 9.8],
      fontFace: FONT, fontSize: 11, color: COLOR_TEXT,
      border: { type: 'solid', pt: 0.5, color: 'D5D2C8' },
    });
  }
}

function addGradeExpectationsSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const selected = data.cover.grade;
  const exp = data.gradeExpectations;
  addSlideTitle(s, '05｜グレード期待項目', '各クラスに求める目安・行動基準。');

  const rows: PptxGenJS.TableRow[] = [
    [
      { text: 'Tier', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: 'Tier 名', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: 'Grade', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
      { text: '期待項目・行動基準', options: { bold: true, fill: { color: COLOR_HEADER_BG }, fontSize: 10 } },
    ],
  ];
  // ダッシュ (') 付きのサブグレードは除外、大文字・小文字キーのみ表示。月給列は非表示。
  GRADE_TABLE.forEach(tier => {
    const grades = tier.grades.filter(g => !g.key.includes("'"));
    grades.forEach((g, gIdx) => {
      const eKey = expectKey(g.key);
      const value = (exp[eKey] ?? '').trim();
      const sel = g.key === selected;
      const row: PptxGenJS.TableRow = [];
      if (gIdx === 0) {
        row.push({ text: tier.tier, options: { bold: true, rowspan: grades.length, fill: { color: 'F3F1EE' }, valign: 'middle', align: 'center' } });
        row.push({ text: tier.tierName, options: { rowspan: grades.length, color: COLOR_MUTED, valign: 'middle' } });
      }
      row.push({ text: g.key, options: { bold: sel, fill: sel ? { color: 'E8E6DF' } : undefined, align: 'center' } });
      row.push({ text: value || '—', options: { bold: sel, fill: sel ? { color: 'E8E6DF' } : undefined } });
      rows.push(row);
    });
  });
  s.addTable(rows, {
    x: 0.3, y: 1.3, w: 12.7,
    colW: [0.5, 2.2, 0.9, 9.1],
    rowH: 0.42,
    fontFace: FONT, fontSize: 10, color: COLOR_TEXT, valign: 'middle',
    margin: 0.04,
    border: { type: 'solid', pt: 0.3, color: 'D5D2C8' },
  });
}

function addPromotionBonusSlide(pres: PptxGenJS, data: FormData) {
  const s = pres.addSlide();
  const prm = data.promotion;
  const bns = data.bonus;
  const promoTotal = prm.tenurePoint + prm.deptGrowthPoint + prm.personalKpiPoint + prm.supervisorPoint + prm.mgmtPoint + prm.nurturingPoint;
  const phase1 = bns.canAfford + bns.hasProfit + bns.futureProfit;
  const supervisor = bns.noSupervisor ? 0 : bns.supervisorEval;
  const mgmt = bns.mgmtEval * (bns.noSupervisor ? 2 : 1);
  const phase2 = bns.deptKpiAchieved + bns.personalKpiAchieved + supervisor + bns.valueEval + bns.reproducibility + bns.roleAchievement + bns.difficulty + mgmt;
  const payout = phase1 >= 3 ? (phase1 + phase2) * 110000 : 0;

  addSlideTitle(s, '06｜昇格採点 / 07｜ボーナス採点', '今期の評価サマリ。');

  s.addText([
    { text: '06｜昇格・昇給採点\n\n', options: { bold: true, fontSize: 14, color: COLOR_MUTED } },
    { text: `${promoTotal} pt\n`, options: { bold: true, fontSize: 36, color: COLOR_ACCENT } },
    { text: `VALUE スコア: ${prm.valueScore || '—'}\n\n`, options: { fontSize: 11, color: COLOR_MUTED } },
    { text: `在籍: ${prm.tenurePoint} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `部署成長: ${prm.deptGrowthPoint} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `個人KPI: ${prm.personalKpiPoint} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `上長評価: ${prm.supervisorPoint} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `経営評価: ${prm.mgmtPoint} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `育成: ${prm.nurturingPoint} pt`, options: { fontSize: 11, color: COLOR_TEXT } },
  ], {
    x: 0.5, y: 1.3, w: 6.0, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.3,
  });

  s.addText([
    { text: '07｜ボーナス評価採点\n\n', options: { bold: true, fontSize: 14, color: COLOR_MUTED } },
    { text: `${payout.toLocaleString('ja-JP')} 円\n`, options: { bold: true, fontSize: 28, color: COLOR_ACCENT } },
    { text: `Phase1（財務ゲート）${phase1} pt ${phase1 >= 3 ? '✓ 通過' : '✗ 未通過'}\n`, options: { fontSize: 11, color: COLOR_MUTED } },
    { text: `Phase2（評価合計）${phase2} pt\n\n`, options: { fontSize: 11, color: COLOR_MUTED } },
    { text: `部署KPI達成: ${bns.deptKpiAchieved} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `個人KPI達成: ${bns.personalKpiAchieved} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `上長評価: ${supervisor} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `VALUE 評価: ${bns.valueEval} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `再現性: ${bns.reproducibility} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `役割達成: ${bns.roleAchievement} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `難易度: ${bns.difficulty} pt\n`, options: { fontSize: 11, color: COLOR_TEXT } },
    { text: `経営評価: ${mgmt} pt`, options: { fontSize: 11, color: COLOR_TEXT } },
  ], {
    x: 6.7, y: 1.3, w: 6.1, h: 5.8,
    fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.3,
  });
}

export async function exportPptx(data: FormData): Promise<void> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = '目標設定シート';
  pres.company = 'INSTYLE GROUP';

  addCoverSlide(pres, data);
  addCompanySlide(pres, data);
  addDeptCoreSlide(pres, data.dept, '02｜部署目標 — ミッション & KGI & KPI');
  addDeptActionsSlide(pres, data.dept, '02｜部署目標 — 施策');
  addPersonalCurrentSlide(pres, data);
  addPersonalSmartSlide(pres, data);
  addPersonalSlSupervisorSlide(pres, data);
  addCommitmentSlide(pres, data);
  addGradeExpectationsSlide(pres, data);
  addPromotionBonusSlide(pres, data);

  const cover = data.cover;
  const name = (cover.name || '氏名未入力').trim();
  const periodSlug = (cover.period || '').replace(/[^0-9A-Za-z一-龯ぁ-んァ-ヶー]/g, '-');
  await pres.writeFile({ fileName: `目標設定シート_${name}_${periodSlug}.pptx` });
}
