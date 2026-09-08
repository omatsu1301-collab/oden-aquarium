import { describe, expect, it } from "vitest";
import { advanceGame, drawSpawnWaitMs } from "../engine.js";
import { createInitialGameState } from "../state.js";
import { MS_PER_HOUR, MS_PER_MINUTE, SPAWN_WAIT_MIN_MS, SPAWN_WAIT_MAX_MS } from "../constants.js";

const T0 = 1_700_000_000_000;

describe("advanceGame", () => {
  it("時計が進んでいなければ何も変化しない", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0);
    expect(next).toBe(state);
  });

  it("時計が後退した場合は経過0とし、基準時刻を戻さない", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0 - MS_PER_HOUR);
    expect(next).toBe(state);
    expect(next.lastSimulatedAt).toBe(T0);
  });

  it("がんも(20分で0→100)は10分でちょうど半分成長する", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0 + 10 * MS_PER_MINUTE);
    const ganmo = next.slots.find((s) => s.speciesId === "ganmo");
    expect(ganmo.progress).toBeCloseTo(50, 5);
  });

  it("成熟後は100で止まり、それ以上増えない", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0 + 100 * MS_PER_HOUR);
    for (const slot of next.slots) {
      expect(slot.progress).toBeLessThanOrEqual(100);
      expect(slot.progress).toBe(100);
    }
  });

  it("出汁残量は満タンから基準鍋(8時間)でちょうど0になる", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0 + 8 * MS_PER_HOUR);
    expect(next.tank.remainingRatio).toBeCloseTo(0, 5);
  });

  it("残量が0の間は成長速度が半分になる", () => {
    let state = createInitialGameState(T0, 1);
    // 既に出汁切れの状態で、新しく生まれたばかりの個体(進行度0)を用意する。
    state = {
      ...state,
      tank: { ...state.tank, remainingRatio: 0 },
      slots: [
        {
          status: "growing",
          instanceId: 1,
          speciesId: "ganmo",
          brothId: "kombu",
          progress: 0,
          spawnedAt: T0,
          duplicateStreak: 0,
        },
      ],
    };
    const next = advanceGame(state, T0 + 20 * MS_PER_MINUTE);
    // 残量0なので半速。20分はganmoの基準成長時間そのものなので、半速なら50%分しか進まない。
    expect(next.slots[0].progress).toBeCloseTo(50, 3);
  });

  it("残量0でも景観は維持される(景観自体はUI側の責務だが、状態は壊れない)", () => {
    const state = createInitialGameState(T0, 1);
    const next = advanceGame(state, T0 + 1000 * MS_PER_HOUR);
    expect(next.tank.remainingRatio).toBe(0);
    expect(Number.isFinite(next.tank.remainingRatio)).toBe(true);
  });

  it("お留守番だし(care効果)発動中は残量が減らない", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      effects: { ...state.effects, care: { itemId: "care", expiresAt: T0 + 4 * MS_PER_HOUR } },
    };
    const next = advanceGame(state, T0 + 4 * MS_PER_HOUR);
    expect(next.tank.remainingRatio).toBe(1);
  });

  it("care効果終了後は残量の消費が再開する", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      effects: { ...state.effects, care: { itemId: "care", expiresAt: T0 + 4 * MS_PER_HOUR } },
    };
    const next = advanceGame(state, T0 + 4 * MS_PER_HOUR + 4 * MS_PER_HOUR);
    // careで4h停止 → 残り4h分(8h基準の半分)消費 → 残量0.5
    expect(next.tank.remainingRatio).toBeCloseTo(0.5, 5);
    expect(next.effects.care).toBe(null);
  });

  it("成長効果(染みこみの一滴)は期限内のみ適用され、期限後は元に戻る", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      effects: {
        ...state.effects,
        growth: { itemId: "drop", multiplier: 1.5, expiresAt: T0 + 10 * MS_PER_MINUTE },
      },
    };
    // ganmo基準20分。前半10分は1.5倍(=15%相当?) -> 10分×1.5/20分基準=75%分進むはず
    const mid = advanceGame(state, T0 + 10 * MS_PER_MINUTE);
    const ganmoMid = mid.slots.find((s) => s.speciesId === "ganmo");
    expect(ganmoMid.progress).toBeCloseTo(75, 3);
    expect(mid.effects.growth).toBe(null);
  });

  it("収穫後の空きスロットは60秒後に次の個体が生える(spawnAt到達で遷移)", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      slots: [
        {
          status: "empty-waiting",
          pendingSpeciesId: "daikon",
          pendingBrothId: "kombu",
          spawnAt: T0 + 60_000,
          duplicateStreak: 0,
          retiring: false,
        },
      ],
    };
    const before = advanceGame(state, T0 + 59_000);
    expect(before.slots[0].status).toBe("empty-waiting");
    const after = advanceGame(state, T0 + 61_000);
    expect(after.slots[0].status).toBe("growing");
    expect(after.slots[0].speciesId).toBe("daikon");
    expect(after.slots[0].progress).toBeGreaterThan(0);
  });

  it("長期離席でも有限回のブレイクポイントで終了する(巨大ループにならない)", () => {
    const state = createInitialGameState(T0, 1);
    const start = Date.now();
    const next = advanceGame(state, T0 + 365 * 24 * MS_PER_HOUR);
    const elapsed = Date.now() - start;
    expect(next.lastSimulatedAt).toBe(T0 + 365 * 24 * MS_PER_HOUR);
    expect(elapsed).toBeLessThan(200);
  });

  it("小分け精算と一括精算の結果が一致する", () => {
    const state = createInitialGameState(T0, 1);
    const oneShot = advanceGame(state, T0 + 3 * MS_PER_HOUR);

    let stepwise = state;
    for (let i = 1; i <= 180; i += 1) {
      stepwise = advanceGame(stepwise, T0 + i * MS_PER_MINUTE);
    }

    for (let i = 0; i < oneShot.slots.length; i += 1) {
      expect(stepwise.slots[i].progress).toBeCloseTo(oneShot.slots[i].progress, 5);
    }
    expect(stepwise.tank.remainingRatio).toBeCloseTo(oneShot.tank.remainingRatio, 5);
  });
});

describe("drawSpawnWaitMs", () => {
  it("同じseedから同じ待ち時間と次seedが得られる(決定的)", () => {
    const a = drawSpawnWaitMs(12345);
    const b = drawSpawnWaitMs(12345);
    expect(a).toEqual(b);
  });

  it("待ち時間は常に25秒〜95秒の範囲内(多数のseedで境界近くも含めて検証)", () => {
    for (let seed = -1000; seed < 1000; seed += 1) {
      const { waitMs } = drawSpawnWaitMs(seed);
      expect(waitMs).toBeGreaterThanOrEqual(SPAWN_WAIT_MIN_MS);
      expect(waitMs).toBeLessThanOrEqual(SPAWN_WAIT_MAX_MS);
    }
  });

  it("抽選後のnextSeedは元のseedから進む(RNG状態を消費する)", () => {
    const { nextSeed } = drawSpawnWaitMs(42);
    expect(nextSeed).not.toBe(42);
    expect(Number.isInteger(nextSeed)).toBe(true);
  });

  it("異なるseedからは(ほぼ)異なる待ち時間が得られ、固定60秒へ収束しない", () => {
    const waits = new Set();
    for (let seed = 0; seed < 20; seed += 1) {
      waits.add(drawSpawnWaitMs(seed).waitMs);
    }
    expect(waits.size).toBeGreaterThan(1);
  });
});
