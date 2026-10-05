'use client';

// 各ページ右上にドッキングさせる小さなリンクピル。表紙の OwnerUrlLink と同じ URL
// を派生させるが、見た目はコンパクトに。印刷時は実リンクを損なわずに点線だけ落とす。

import { useEffect, useState } from 'react';
import { buildShortShareUrl, buildLongShareUrl } from '@/lib/share-codec';

export default function OwnerUrlPill({
  token,
  encoded,
  name,
  finalized,
}: {
  token?: string;
  encoded?: string;
  /** URL 末尾に ?n=<name> として載せる人名ヒント（任意）。 */
  name?: string;
  finalized?: boolean;
}) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) setUrl(buildShortShareUrl(origin, pathname, token, name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (encoded) setUrl(buildLongShareUrl(origin, pathname, encoded, name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setUrl('');
  }, [token, encoded, name]);

  if (!url) return null;

  void finalized;
  const label = 'ブラウザで見る';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="pdf-page-url-pill"
      title={url}
    >
      <span aria-hidden style={{ marginRight: 4 }}>📎</span>
      {label}
    </a>
  );
}
