'use client';

import { useEffect } from 'react';
import { loadDefaultJapaneseParser } from 'budoux';

// BudouX を PDF ページに適用。npm 経由で bundle 済みの budoux を使い、CDN 依存を排除。
// PDF ページは実質静的なので MutationObserver は張らない（0.9 系で getComputedStyle
// を非 Element node に呼んで throw する既知の問題があり、observer で連鎖発火すると
// ページ全体が unresponsive になる。0.7 に pin してもガードとして try/catch で
// 個別要素の失敗が全体を落とさないようにする）。
const SELECTOR = '.pdf-doc h1, .pdf-doc h2, .pdf-doc h3, .pdf-doc p, .pdf-doc li, .pdf-doc dd, .pdf-doc td';

export default function BudouxApply() {
  useEffect(() => {
    let parser: ReturnType<typeof loadDefaultJapaneseParser>;
    try {
      parser = loadDefaultJapaneseParser();
    } catch {
      return;
    }
    document.querySelectorAll<HTMLElement>(SELECTOR).forEach(el => {
      if (el.dataset.budoux === '1') return;
      if (!el.textContent || !el.textContent.trim()) return;
      try {
        el.innerHTML = parser.translateHTMLString(el.innerHTML);
        el.dataset.budoux = '1';
      } catch {
        // 単一要素の変換失敗は握り潰す（他の要素の変換とページ全体は残す）
      }
    });
  }, []);
  return null;
}
