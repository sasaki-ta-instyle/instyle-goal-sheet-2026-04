export type Grade = 'I' | "N'" | 'N' | "n'" | 'n' | "S'" | 'S' | "s'" | 's' | "T'" | 'T' | "t'" | 't' | "Y'" | 'Y' | "y'" | 'y' | "L'" | 'L' | "l'" | 'l' | "E'" | 'E' | "e'" | 'e';

export interface CoverData {
  company: string;
  name: string;
  grade: Grade | '';
  period: string;
}

export interface KpiNumRow {
  prev: string;
  target: string;
  actual: string;
}

export interface CompanyGoalData {
  revenue: KpiNumRow;
  operatingProfit: KpiNumRow;
  operatingMargin: KpiNumRow;
  grossProfit: KpiNumRow;
  strategicFocus: string;
}

export interface DeptActionRow {
  content: string;
  expectedEffect: string;
  deadline: string;
}

export interface DeptKpiNumRow {
  label: string;
  prev: string;
  target: string;
  actual: string;
  relatedKgi?: '' | 'kgi1' | 'kgi2';
}

export interface DeptKgiRow {
  mission: string;
  kgi: string;
}

export interface DeptGoalData {
  mission: string;
  kgi1: DeptKgiRow;
  kgi2: DeptKgiRow;
  kpi1: DeptKpiNumRow;
  kpi2: DeptKpiNumRow;
  kpi3: DeptKpiNumRow;
  kpi4: DeptKpiNumRow;
  kpi5: DeptKpiNumRow;
  actions: DeptActionRow[];
}

export interface CurrentStatusRow {
  label: string;
  value: string;
}

export interface SmartGoalRow {
  relatedKpi: string;
  s: string;
  m: string;
  a: string;
  r: string;
  t: string;
  note: string;
}

export interface KpiContribRow {
  deptKpi: string;
  myPart: string;
}

export type SlLevel = '' | 'S1' | 'S2' | 'S3' | 'S4';

export interface CommitmentRow {
  amount: string;    // 明細金額（半角数字のみを保持、表示時にカンマ整形）
  rationale: string; // 項目・概要（その金額の根拠：顧客・貢献・需要の中身）
}

export interface PersonalGoalData {
  currentStatus: CurrentStatusRow[];
  smartGoals: SmartGoalRow[];
  kpiContribs: KpiContribRow[];
  slLevel: SlLevel;
  slNote: string;
  commitment: CommitmentRow[];
  supervisorComment: string;
}

export interface PromotionData {
  valueScore: string;
  tenurePoint: number;
  deptGrowthPoint: number;
  personalKpiPoint: number;
  supervisorPoint: number;
  mgmtPoint: number;
  nurturingPoint: number;
}

export interface BonusData {
  canAfford: number;
  hasProfit: number;
  futureProfit: number;
  deptKpiAchieved: number;
  personalKpiAchieved: number;
  supervisorEval: number;
  noSupervisor: boolean;
  valueEval: number;
  reproducibility: number;
  roleAchievement: number;
  difficulty: number;
  mgmtEval: number;
}

export type GradeExpectations = Partial<Record<string, string>>;

export interface FormData {
  cover: CoverData;
  group: CompanyGoalData;
  company: CompanyGoalData;
  dept: DeptGoalData;
  personal: PersonalGoalData;
  promotion: PromotionData;
  bonus: BonusData;
  gradeExpectations: GradeExpectations;
  /** 上長がコメント付き新URLを発行した時点で true。
   * 共有URL先で上長コメント編集パネルを隠す判定に使う。 */
  finalized?: boolean;
}

export interface GradeEntry {
  key: Grade;
  salary: string;
}

export interface GradeTier {
  tier: string;
  tierName: string;
  grades: GradeEntry[];
}

export const GRADE_TABLE: GradeTier[] = [
  { tier: 'I', tierName: 'INDEPENDENT and IDEAL', grades: [
    { key: 'I', salary: '—' },
  ]},
  { tier: 'N', tierName: 'NO RULES and NEVER SAY NEVER', grades: [
    { key: 'N',  salary: '1,170,000' },
    { key: "N'", salary: '1,110,000' },
    { key: 'n',  salary: '1,055,000' },
    { key: "n'", salary: '1,000,000' },
  ]},
  { tier: 'S', tierName: 'STRATEGIC', grades: [
    { key: 'S',  salary: '950,000' },
    { key: "S'", salary: '900,000' },
    { key: 's',  salary: '845,000' },
    { key: "s'", salary: '800,000' },
  ]},
  { tier: 'T', tierName: 'TACTICAL', grades: [
    { key: 'T',  salary: '740,000' },
    { key: "T'", salary: '700,000' },
    { key: 't',  salary: '650,000' },
    { key: "t'", salary: '600,000' },
  ]},
  { tier: 'Y', tierName: 'YEARNING', grades: [
    { key: 'Y',  salary: '580,000' },
    { key: "Y'", salary: '550,000' },
    { key: 'y',  salary: '525,000' },
    { key: "y'", salary: '500,000' },
  ]},
  { tier: 'L', tierName: 'LOYALTY', grades: [
    { key: 'L',  salary: '475,000' },
    { key: "L'", salary: '450,000' },
    { key: 'l',  salary: '420,000' },
    { key: "l'", salary: '400,000' },
  ]},
  { tier: 'E', tierName: 'ENTRY', grades: [
    { key: 'E',  salary: '385,000' },
    { key: "E'", salary: '370,000' },
    { key: 'e',  salary: '350,000' },
    { key: "e'", salary: '330,000' },
  ]},
];

export function getMonthlySalaryByGrade(grade: Grade | '' | null | undefined): number | null {
  if (!grade) return null;
  for (const tier of GRADE_TABLE) {
    const hit = tier.grades.find(g => g.key === grade);
    if (hit) {
      const n = parseInt(hit.salary.replace(/[^\d]/g, ''), 10);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
  }
  return null;
}

export function getAnnualSalaryByGrade(grade: Grade | '' | null | undefined): number | null {
  const monthly = getMonthlySalaryByGrade(grade);
  return monthly == null ? null : monthly * 12;
}

export const GRADE_OPTIONS: { value: Grade; label: string }[] = GRADE_TABLE.flatMap(tier =>
  tier.grades
    .filter(g => g.key !== 'I')
    .map(g => ({
      value: g.key,
      label: `${g.key}  (${g.salary}円/月)`,
    }))
);

const emptyKpiNum = (): KpiNumRow => ({ prev: '', target: '', actual: '' });
const emptyDeptKpiNum = (): DeptKpiNumRow => ({ label: '', prev: '', target: '', actual: '', relatedKgi: '' });
const emptyDeptKgi = (): DeptKgiRow => ({ mission: '', kgi: '' });

export const CURRENT_PERIOD = '2026.4〜9';

export function createDefaultFormData(): FormData {
  return {
    cover: { company: '', name: '', grade: '', period: CURRENT_PERIOD },
    group: {
      revenue: emptyKpiNum(),
      operatingProfit: emptyKpiNum(),
      operatingMargin: emptyKpiNum(),
      grossProfit: emptyKpiNum(),
      strategicFocus: '',
    },
    company: {
      revenue: emptyKpiNum(),
      operatingProfit: emptyKpiNum(),
      operatingMargin: emptyKpiNum(),
      grossProfit: emptyKpiNum(),
      strategicFocus: '',
    },
    dept: {
      mission: '',
      kgi1: emptyDeptKgi(),
      kgi2: emptyDeptKgi(),
      kpi1: emptyDeptKpiNum(),
      kpi2: emptyDeptKpiNum(),
      kpi3: emptyDeptKpiNum(),
      kpi4: emptyDeptKpiNum(),
      kpi5: emptyDeptKpiNum(),
      actions: Array(4).fill(null).map(() => ({ content: '', expectedEffect: '', deadline: '' })),
    },
    personal: {
      currentStatus: [
        { label: '前回面談で指摘された課題', value: '' },
        { label: 'それを受けてどう行動したか', value: '' },
        { label: '今期の役割・期待（自己認識）', value: '' },
      ],
      smartGoals: Array(3).fill(null).map(() => ({ relatedKpi: '', s: '', m: '', a: '', r: '', t: '', note: '' })),
      kpiContribs: Array(3).fill(null).map(() => ({ deptKpi: '', myPart: '' })),
      slLevel: '',
      slNote: '',
      commitment: [
        { amount: '', rationale: '' },
        { amount: '', rationale: '' },
        { amount: '', rationale: '' },
      ],
      supervisorComment: '',
    },
    promotion: {
      valueScore: '',
      tenurePoint: 0,
      deptGrowthPoint: 1,
      personalKpiPoint: 1,
      supervisorPoint: 1,
      mgmtPoint: 1,
      nurturingPoint: 1,
    },
    bonus: {
      canAfford: 0,
      hasProfit: 0,
      futureProfit: 0,
      deptKpiAchieved: 0,
      personalKpiAchieved: 0,
      supervisorEval: 0,
      noSupervisor: false,
      valueEval: 0,
      reproducibility: 0,
      roleAchievement: 0,
      difficulty: 0,
      mgmtEval: 0,
    },
    gradeExpectations: {},
  };
}
