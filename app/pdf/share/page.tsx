// /pdf/share?d=<lz-encoded-payload> — 長い URL 経由の PDF 出力。
// Vercel のように .share-store/ にファイルを書き出せない環境でも、encoded payload
// 直渡しで PDF を出せるようにするためのルート。ConoHa 本番では通常 /pdf/<token>
// を使う（クリップボードにコピーされる URL がそちら）。

'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { decodeFormData } from '@/lib/share-codec';
import PdfDocument from '@/components/pdf/PdfDocument';
import PrintOnLoad from '@/components/pdf/PrintOnLoad';
import PdfHint from '@/components/pdf/PdfHint';
import BudouxApply from '@/components/pdf/BudouxApply';
import OwnerUrlLink from '@/components/pdf/OwnerUrlLink';
import OwnerUrlPill from '@/components/pdf/OwnerUrlPill';
import '../[token]/pdf.css';

function PdfShareInner() {
  const params = useSearchParams();
  const encoded = params?.get('d') ?? '';
  const print = params?.get('print') === '1';
  const data = useMemo(() => (encoded ? decodeFormData(encoded) : null), [encoded]);

  // Chrome の「PDFとして保存」の既定ファイル名は document.title なので、氏名入りに揃える。
  useEffect(() => {
    if (!data) return;
    const name = (data.cover.name ?? '').trim();
    const base = '目標設定シート_2026年4月-9月期';
    const prev = document.title;
    document.title = name ? `${name}_${base}` : base;
    return () => { document.title = prev; };
  }, [data]);

  if (!data) {
    return (
      <main style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, border: '1px solid #e0ddd2' }}>
          <h1 style={{ fontSize: '1.25rem', marginBottom: 12 }}>PDF を開けませんでした</h1>
          <p style={{ fontSize: '.875rem', color: '#82837A' }}>
            URL が途中で切れている可能性があります。送信元から再度コピーし直してもらってください。
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
        ownerUrlSlot={<OwnerUrlLink encoded={encoded} name={data.cover.name} />}
        ownerUrlPill={<OwnerUrlPill encoded={encoded} name={data.cover.name} />}
      />
      <BudouxApply />
      {print && <PrintOnLoad />}
    </>
  );
}

export default function PdfSharePage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center', color: '#82837A' }}>読み込み中…</div>}>
      <PdfShareInner />
    </Suspense>
  );
}
