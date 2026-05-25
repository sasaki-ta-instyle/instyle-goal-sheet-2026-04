'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ShareView, { ShareError } from '@/components/ShareView';
import { decodeFormData } from '@/lib/share-codec';
import { FormData } from '@/lib/types';

function ShareInner() {
  const params = useSearchParams();
  const [data, setData] = useState<FormData | null | 'pending'>('pending');

  const encoded = useMemo(() => params.get('d') ?? '', [params]);

  useEffect(() => {
    if (!encoded) {
      setData(null);
      return;
    }
    setData(decodeFormData(encoded));
  }, [encoded]);

  if (data === 'pending') {
    return <div style={{ padding: 80, textAlign: 'center', color: 'var(--color-text-muted)' }}>読み込み中…</div>;
  }
  if (!data) {
    return <ShareError message="URL が途中で切れている可能性があります。送信元から再度コピーし直してもらってください。" />;
  }
  return <ShareView data={data} />;
}

export default function SharePage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center' }}>読み込み中…</div>}>
      <ShareInner />
    </Suspense>
  );
}
