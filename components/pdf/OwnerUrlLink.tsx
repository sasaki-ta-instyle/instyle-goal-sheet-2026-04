'use client';

// PDF 表紙に差し込む「最新のオンライン版（＝上長→オーナーに展開された共有URL）」
// リンクパネル。クライアントサイドで window.location から URL を組み立てる。
// 画面上はクリック可、印刷時も URL テキストが残るように黒文字で可視化する。

import { useEffect, useState } from 'react';
import { buildShortShareUrl, buildLongShareUrl } from '@/lib/share-codec';

export default function OwnerUrlLink({
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
  const [copied, setCopied] = useState(false);

  // SSR 時点では window が無く URL を組めないので client マウント後に 1 度だけ埋める。
  // React 19 は set-state-in-effect を警告するが、クライアント専用の派生値なので許容する。
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    // buildShortShareUrl / buildLongShareUrl 側で baseFromPathname が /pdf も剥がす。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (token) setUrl(buildShortShareUrl(origin, pathname, token, name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else if (encoded) setUrl(buildLongShareUrl(origin, pathname, encoded, name));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    else setUrl('');
  }, [token, encoded, name]);

  if (!url) return null;

  // finalized の有無に関わらず「ブラウザで見る」の一本化（オーナー・上長・本人すべて共通）。
  void finalized;
  const label = 'ブラウザで見る';

  return (
    <div className="pdf-owner-url">
      <p className="pdf-owner-url-label">{label}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="pdf-owner-url-cta"
      >
        <span aria-hidden style={{ marginRight: 6 }}>📎</span>
        オンライン版を開く
        <span aria-hidden style={{ marginLeft: 6 }}>→</span>
      </a>
      <code className="pdf-owner-url-text">{url}</code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
          } catch {
            /* clipboard 権限なしのときは無視 */
          }
        }}
        className="pdf-owner-url-copy"
      >
        {copied ? '✓ コピーしました' : 'URL をコピー'}
      </button>
    </div>
  );
}
