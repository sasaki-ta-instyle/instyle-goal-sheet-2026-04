import type { Metadata } from 'next';
import { readShare } from '@/lib/share-store';
import PdfDocument from '@/components/pdf/PdfDocument';
import PrintOnLoad from '@/components/pdf/PrintOnLoad';
import PdfHint from '@/components/pdf/PdfHint';
import BudouxApply from '@/components/pdf/BudouxApply';
import OwnerUrlLink from '@/components/pdf/OwnerUrlLink';
import OwnerUrlPill from '@/components/pdf/OwnerUrlPill';
import { mergeFormData } from '@/lib/share-codec';
import './pdf.css';

export const dynamic = 'force-dynamic';

// Chrome の「PDFとして保存」はデフォルト保存ファイル名として document.title を使う。
// title を「<氏名>_目標設定シート_2026年4月-9月期」に整えて、氏名入り .pdf が
// 落ちるようにする（氏名未入力時は従来通りのタイトル）。
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const base = '目標設定シート_2026年4月-9月期';
  try {
    const { token } = await params;
    const raw = await readShare(token);
    const name = ((raw as { cover?: { name?: string } } | null)?.cover?.name ?? '').trim();
    return {
      robots: { index: false, follow: false, nocache: true },
      title: name ? `${name}_${base}` : base,
    };
  } catch {
    return {
      robots: { index: false, follow: false, nocache: true },
      title: base,
    };
  }
}

export default async function PdfByTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { token } = await params;
  const { print } = await searchParams;
  const raw = await readShare(token).catch(() => null);
  const data = raw ? mergeFormData(raw) : null;

  if (!data) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #e0ddd2' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 12 }}>シェアリンクを開けませんでした</h1>
          <p style={{ fontSize: '.875rem', color: '#82837A' }}>
            共有 token が見つかりません。発行元でもう一度 URL を発行してもらってください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <PdfHint />
      <PdfDocument
        data={data}
        ownerUrlSlot={<OwnerUrlLink token={token} name={data.cover.name} />}
        ownerUrlPill={<OwnerUrlPill token={token} name={data.cover.name} />}
      />
      <BudouxApply />
      {print === '1' && <PrintOnLoad />}
    </>
  );
}
