'use client';

// 印刷用ヒント（画面のみ表示、@media print で消える）
export default function PdfHint() {
  return (
    <div className="pdf-hint">
      <span>
        🖨 Chrome の印刷ダイアログで <strong>「詳細設定 → 背景のグラフィック」を ON</strong> にすると
        背景色が正しく PDF に載ります。用紙は <strong>1366×900 横向き</strong>、余白は「なし」を選んでください。
      </span>
      <button type="button" onClick={() => window.print()}>
        印刷ダイアログを開く
      </button>
    </div>
  );
}
