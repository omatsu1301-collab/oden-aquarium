// presentation層: 短時間の連続収穫(なぞり収穫など)を1つのバッチとして集計する純粋関数。
// Reactのstate/タイマーには依存せず、時刻を引数として受け取ることでテスト可能にする。
// ゲーム状態(wallet/stats等)には一切影響しない、表示専用の集計。
export const HARVEST_BATCH_WINDOW_MS = 800;

// prevBatch: null | { count, points, lastAt }
// harvest: { points }
// 直前の収穫からwindowMs以内なら同じバッチへ加算し、それを超えていれば新しいバッチを開始する。
export function nextHarvestBatch(prevBatch, harvest, nowMs, windowMs = HARVEST_BATCH_WINDOW_MS) {
  if (prevBatch && nowMs - prevBatch.lastAt <= windowMs) {
    return { count: prevBatch.count + 1, points: prevBatch.points + harvest.points, lastAt: nowMs };
  }
  return { count: 1, points: harvest.points, lastAt: nowMs };
}
