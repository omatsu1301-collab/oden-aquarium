import { describe, expect, it } from "vitest";
import { nextHarvestBatch, HARVEST_BATCH_WINDOW_MS } from "../harvestBatch.js";

describe("nextHarvestBatch", () => {
  it("最初の収穫は体数1・合計ptのバッチを作る", () => {
    const batch = nextHarvestBatch(null, { points: 20 }, 1000);
    expect(batch).toEqual({ count: 1, points: 20, lastAt: 1000 });
  });

  it("窓内(800ms以内)の収穫は同じバッチへ加算する", () => {
    let batch = nextHarvestBatch(null, { points: 20 }, 1000);
    batch = nextHarvestBatch(batch, { points: 24 }, 1000 + HARVEST_BATCH_WINDOW_MS);
    expect(batch).toEqual({ count: 2, points: 44, lastAt: 1000 + HARVEST_BATCH_WINDOW_MS });
  });

  it("窓を超えた収穫は新しいバッチとしてリセットする(体数1から)", () => {
    let batch = nextHarvestBatch(null, { points: 20 }, 1000);
    batch = nextHarvestBatch(batch, { points: 24 }, 1000 + HARVEST_BATCH_WINDOW_MS + 1);
    expect(batch).toEqual({ count: 1, points: 24, lastAt: 1000 + HARVEST_BATCH_WINDOW_MS + 1 });
  });

  it("5体を短時間で連続収穫すると、体数5・合計は各harvestPointsの和になる", () => {
    const points = [20, 24, 30, 36, 40];
    let batch = null;
    let t = 0;
    for (const p of points) {
      batch = nextHarvestBatch(batch, { points: p }, t);
      t += 100; // 800ms窓の内側
    }
    expect(batch.count).toBe(5);
    expect(batch.points).toBe(points.reduce((a, b) => a + b, 0));
  });

  it("固定値を仮置きせず、harvestの値をそのまま合算する", () => {
    const batch = nextHarvestBatch({ count: 3, points: 999, lastAt: 0 }, { points: 1 }, 100);
    expect(batch.points).toBe(1000);
  });
});
