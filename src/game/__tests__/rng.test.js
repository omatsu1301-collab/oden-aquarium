import { describe, expect, it } from "vitest";
import { stepRng } from "../rng.js";

describe("stepRng", () => {
  it("同じseedからは常に同じ値が出る(純粋関数)", () => {
    const a = stepRng(12345);
    const b = stepRng(12345);
    expect(a.value).toBe(b.value);
    expect(a.nextSeed).toBe(b.nextSeed);
  });

  it("値は[0,1)の範囲に収まる", () => {
    let seed = 1;
    for (let i = 0; i < 200; i += 1) {
      const { value, nextSeed } = stepRng(seed);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      seed = nextSeed;
    }
  });

  it("連続する値は同じにならない(縮退していない)", () => {
    const values = new Set();
    let seed = 7;
    for (let i = 0; i < 50; i += 1) {
      const { value, nextSeed } = stepRng(seed);
      values.add(value);
      seed = nextSeed;
    }
    expect(values.size).toBeGreaterThan(45);
  });
});
