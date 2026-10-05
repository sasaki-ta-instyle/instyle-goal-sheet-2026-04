import LZString from 'lz-string';
import { FormData, CURRENT_PERIOD, createDefaultFormData } from './types';

// 旧仕様（別 field 名・不足フィールド）の JSON を読み込んだときに新スキーマに揃える。
// PDF ルート（/pdf/[token]）側でも共通利用するため export。
export function mergeFormData(parsed: unknown): FormData {
  const def = createDefaultFormData();
  if (!parsed || typeof parsed !== 'object') return def;
  const p = parsed as Partial<FormData>;
  return {
    ...def,
    ...p,
    cover: { ...def.cover, ...(p.cover ?? {}), period: p.cover?.period ?? CURRENT_PERIOD },
    group: { ...def.group, ...(p.group ?? {}) },
    company: { ...def.company, ...(p.company ?? {}) },
    dept: {
      ...def.dept,
      ...(p.dept ?? {}),
      kgi1: { ...def.dept.kgi1, ...(p.dept?.kgi1 ?? {}) },
      kgi2: { ...def.dept.kgi2, ...(p.dept?.kgi2 ?? {}) },
    },
    personal: { ...def.personal, ...(p.personal ?? {}) },
    promotion: { ...def.promotion, ...(p.promotion ?? {}) },
    bonus: { ...def.bonus, ...(p.bonus ?? {}) },
    gradeExpectations: { ...def.gradeExpectations, ...(p.gradeExpectations ?? {}) },
  };
}

export function encodeFormData(data: FormData): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeFormData(encoded: string): FormData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    return mergeFormData(parsed);
  } catch {
    return null;
  }
}

export function baseFromPathname(pathname: string): string {
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  // basePath 剥がしの対象: /share / /s/... / /pdf(/...) / /api/share...
  // 追加ルートを作ったらここに含める。
  return trimmed.replace(/\/(share|s|pdf(\/[^/]+)?|api\/share)(\/.*)?$/, '');
}

export function buildLongShareUrl(origin: string, pathname: string, encoded: string): string {
  return `${origin}${baseFromPathname(pathname)}/share?d=${encoded}`;
}

export function buildShortShareUrl(origin: string, pathname: string, token: string): string {
  return `${origin}${baseFromPathname(pathname)}/s/${token}`;
}
