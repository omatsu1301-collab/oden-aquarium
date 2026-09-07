import { describe, expect, it } from "vitest";
import { migrateV1ToV2, isV1SaveData } from "../migration.js";
import { createInitialCharacterState } from "../../logic/derive.js";
import { MS_PER_HOUR } from "../constants.js";

const T0 = 1_700_000_000_000;

describe("v1 -> v2 migration", () => {
  it("isV1SaveDataはv1の形だけを認識する", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    expect(isV1SaveData(v1)).toBe(true);
    expect(isV1SaveData({ schemaVersion: 2 })).toBe(false);
    expect(isV1SaveData(null)).toBe(false);
    expect(isV1SaveData({ schemaVersion: 1, characters: {} })).toBe(false);
  });

  it("旧大根の進行度(旧速度2pt/hで6時間経過=12)を、新速度の起点として引き継ぐ", () => {
    const v1 = {
      schemaVersion: 1,
      characters: { daikon: createInitialCharacterState(T0) },
    };
    const nowMs = T0 + 6 * MS_PER_HOUR;
    const v2 = migrateV1ToV2(v1, nowMs, 42);
    const daikonSlot = v2.slots.find((s) => s.speciesId === "daikon");
    expect(daikonSlot.progress).toBeCloseTo(12, 5);
  });

  it("他4体は新規開始と同じ初期値(75/50/25/0)になる", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    const v2 = migrateV1ToV2(v1, T0, 1);
    const byId = Object.fromEntries(v2.slots.map((s) => [s.speciesId, s.progress]));
    expect(byId.chikuwa).toBe(75);
    expect(byId.shirataki).toBe(50);
    expect(byId.konnyaku).toBe(25);
    expect(byId.ganmo).toBe(0);
  });

  it("所持ポイント・出汁・鍋は新規開始と同じ", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    const v2 = migrateV1ToV2(v1, T0, 1);
    expect(v2.wallet).toBe(300);
    expect(v2.tank.brothId).toBe("kombu");
    expect(v2.tank.potId).toBe("clay");
  });

  it("旧版には収穫履歴がないため、図鑑(catalog)は空のまま", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    const v2 = migrateV1ToV2(v1, T0, 1);
    expect(Object.keys(v2.catalog).length).toBe(0);
  });

  it("旧経過へ新速度を遡及適用しない(長時間経過後は100でクランプされた値をそのまま引き継ぐ)", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    const v2 = migrateV1ToV2(v1, T0 + 1000 * MS_PER_HOUR, 1);
    const daikonSlot = v2.slots.find((s) => s.speciesId === "daikon");
    expect(daikonSlot.progress).toBe(100);
  });
});
