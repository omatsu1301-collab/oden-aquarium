import { describe, expect, it } from "vitest";
import { buildBackupPayload, parseBackupFile } from "../backup.js";
import { createInitialGameState } from "../../game/state.js";
import { createInitialCharacterState } from "../../logic/derive.js";
import { BACKUP_MAX_BYTES } from "../../game/constants.js";

const T0 = 1_700_000_000_000;

describe("backup export/import roundtrip", () => {
  it("正常にexport->importできる", () => {
    const state = createInitialGameState(T0, 1);
    const payload = buildBackupPayload(state, T0);
    const json = JSON.stringify(payload);
    const result = parseBackupFile(json, T0 + 1000);
    expect(result.valid).toBe(true);
    expect(result.state.wallet).toBe(state.wallet);
  });

  it("壊れたJSONは拒否する", () => {
    const result = parseBackupFile("{ not json", T0);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("invalid-json");
  });

  it("容量超過は拒否する", () => {
    const huge = "a".repeat(BACKUP_MAX_BYTES + 1);
    const result = parseBackupFile(JSON.stringify({ appId: "oden-aquarium", formatVersion: 2, filler: huge }), T0);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("too-large");
  });

  it("別アプリのバックアップは拒否する", () => {
    const result = parseBackupFile(JSON.stringify({ appId: "other-app", formatVersion: 1, gameState: {} }), T0);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("wrong-app");
  });

  it("未来バージョンは自動ダウングレードせず拒否する", () => {
    const result = parseBackupFile(
      JSON.stringify({ appId: "oden-aquarium", formatVersion: 99, gameState: {} }),
      T0,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("future-version");
  });

  it("v1形式の生データも移行を通してインポートできる", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    const result = parseBackupFile(JSON.stringify(v1), T0);
    expect(result.valid).toBe(true);
    expect(result.fromV1).toBe(true);
  });
});
