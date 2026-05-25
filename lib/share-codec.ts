import LZString from 'lz-string';
import { FormData, CURRENT_PERIOD, createDefaultFormData } from './types';

export function encodeFormData(data: FormData): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data));
}

export function decodeFormData(encoded: string): FormData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object') return null;
    const def = createDefaultFormData();
    return {
      ...def,
      ...parsed,
      cover: { ...def.cover, ...(parsed.cover ?? {}), period: parsed.cover?.period ?? CURRENT_PERIOD },
      group: { ...def.group, ...(parsed.group ?? {}) },
      company: { ...def.company, ...(parsed.company ?? {}) },
      dept: {
        ...def.dept,
        ...(parsed.dept ?? {}),
        kgi1: { ...def.dept.kgi1, ...(parsed.dept?.kgi1 ?? {}) },
        kgi2: { ...def.dept.kgi2, ...(parsed.dept?.kgi2 ?? {}) },
      },
      personal: { ...def.personal, ...(parsed.personal ?? {}) },
      promotion: { ...def.promotion, ...(parsed.promotion ?? {}) },
      bonus: { ...def.bonus, ...(parsed.bonus ?? {}) },
      gradeExpectations: { ...def.gradeExpectations, ...(parsed.gradeExpectations ?? {}) },
    } as FormData;
  } catch {
    return null;
  }
}

export function baseFromPathname(pathname: string): string {
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return trimmed.replace(/\/(share|s)(\/.*)?$/, '');
}

export function buildLongShareUrl(origin: string, pathname: string, encoded: string): string {
  return `${origin}${baseFromPathname(pathname)}/share?d=${encoded}`;
}

export function buildShortShareUrl(origin: string, pathname: string, token: string): string {
  return `${origin}${baseFromPathname(pathname)}/s/${token}`;
}
