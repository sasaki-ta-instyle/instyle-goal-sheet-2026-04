import type { Metadata } from 'next';
import ShareView, { ShareError } from '@/components/ShareView';
import { readShare } from '@/lib/share-store';
import { mergeFormData } from '@/lib/share-codec';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  try {
    const { token } = await params;
    const raw = await readShare(token);
    const name = ((raw as { cover?: { name?: string } } | null)?.cover?.name ?? '').trim();
    if (!name) return { title: '目標設定シート 2026年4月-9月期 | INSTYLE GROUP' };
    return { title: `${name} | 目標設定シート 2026年4月-9月期 | INSTYLE GROUP` };
  } catch {
    return { title: '目標設定シート 2026年4月-9月期 | INSTYLE GROUP' };
  }
}

export default async function ShareByTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const raw = await readShare(token).catch(() => null);
  const data = raw ? mergeFormData(raw) : null;
  if (!data) {
    return <ShareError message="シェアリンクが見つかりませんでした。発行者に再度生成してもらってください。" />;
  }
  return <ShareView data={data} token={token} />;
}
