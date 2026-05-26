import type { Metadata } from 'next';
import ShareView, { ShareError } from '@/components/ShareView';
import { readShare } from '@/lib/share-store';
import { createDefaultFormData, CURRENT_PERIOD, FormData } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  try {
    const { token } = await params;
    const raw = await readShare(token);
    const name = ((raw as { cover?: { name?: string } } | null)?.cover?.name ?? '').trim();
    if (!name) return { title: '目標設定シート | INSTYLE GROUP' };
    return { title: `${name} | 目標設定シート | INSTYLE GROUP` };
  } catch {
    return { title: '目標設定シート | INSTYLE GROUP' };
  }
}

function normalizeFormData(parsed: unknown): FormData | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const def = createDefaultFormData();
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

export default async function ShareByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = await readShare(token).catch(() => null);
  const data = normalizeFormData(raw);
  if (!data) {
    return <ShareError message="シェアリンクが見つかりませんでした。発行者に再度生成してもらってください。" />;
  }
  return <ShareView data={data} />;
}
