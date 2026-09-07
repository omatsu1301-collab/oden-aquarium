import { describe, expect, it } from "vitest";
import { applyAction } from "../actions.js";
import { createInitialGameState } from "../state.js";
import { SPAWN_WAIT_MS } from "../constants.js";

const T0 = 1_700_000_000_000;

describe("HARVEST", () => {
  it("成熟していない個体は収穫できない(状態が変化しない)", () => {
    const state = createInitialGameState(T0, 1); // ganmo(instanceId 5)はprogress 0
    const next = applyAction(state, { type: "HARVEST", instanceId: 5 }, T0);
    expect(next.slots.find((s) => s.instanceId === 5).status).toBe("growing");
    expect(next.wallet).toBe(state.wallet);
  });

  it("成熟個体を収穫するとpt獲得・図鑑登録・空き待ちスロットへ遷移する", () => {
    let state = createInitialGameState(T0, 1); // daikon(instanceId 1)はprogress 100
    const next = applyAction(state, { type: "HARVEST", instanceId: 1 }, T0);
    expect(next.wallet).toBe(state.wallet + 20); // daikon harvestPoints
    expect(next.catalog.daikon.firstSeenAt).toBe(T0);
    expect(next.catalog.daikon.harvestCount).toBe(1);
    expect(next.stats.harvestTotal).toBe(1);
    // 収穫後は空き待ちに遷移するため、instanceIdは失われる(位置=slots[0]で追跡する)。
    const slot = next.slots[0];
    expect(slot.status).toBe("empty-waiting");
    expect(slot.spawnAt).toBe(T0 + SPAWN_WAIT_MS);
  });

  it("同じ個体を連続で収穫しても二重加算されない", () => {
    let state = createInitialGameState(T0, 1);
    state = applyAction(state, { type: "HARVEST", instanceId: 1 }, T0);
    const walletAfterFirst = state.wallet;
    const again = applyAction(state, { type: "HARVEST", instanceId: 1 }, T0);
    expect(again.wallet).toBe(walletAfterFirst);
  });

  it("収穫後60秒でスロットに次の個体が育ち始める", () => {
    let state = createInitialGameState(T0, 1);
    state = applyAction(state, { type: "HARVEST", instanceId: 1 }, T0);
    const later = applyAction(state, { type: "SET_SETTINGS", settings: {} }, T0 + SPAWN_WAIT_MS + 1000);
    const grownSlot = later.slots.find((s) => s.status === "growing" && s.spawnedAt === T0 + SPAWN_WAIT_MS);
    expect(grownSlot).toBeTruthy();
  });
});

describe("BUY_ITEM / 装備", () => {
  it("残高不足では購入できない", () => {
    const state = createInitialGameState(T0, 1); // wallet 300
    const next = applyAction(state, { type: "BUY_ITEM", itemId: "yuzu" }, T0); // 900pt
    expect(next.wallet).toBe(300);
    expect(next.inventory.ownedIds).not.toContain("yuzu");
  });

  it("購入すると所持し、装備するまで自動適用されない", () => {
    let state = createInitialGameState(T0, 1);
    state = { ...state, wallet: 1000 };
    const bought = applyAction(state, { type: "BUY_ITEM", itemId: "katsuo" }, T0);
    expect(bought.inventory.ownedIds).toContain("katsuo");
    expect(bought.tank.brothId).toBe("kombu");
    const equipped = applyAction(bought, { type: "EQUIP_BROTH", brothId: "katsuo" }, T0);
    expect(equipped.tank.brothId).toBe("katsuo");
  });

  it("既に所持している恒久品は再購入できない(二重課金しない)", () => {
    let state = createInitialGameState(T0, 1);
    state = { ...state, wallet: 1000 };
    const first = applyAction(state, { type: "BUY_ITEM", itemId: "katsuo" }, T0);
    const second = applyAction(first, { type: "BUY_ITEM", itemId: "katsuo" }, T0);
    expect(second.wallet).toBe(first.wallet);
  });

  it("未所持の出汁/鍋/道具は装備できない", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "EQUIP_BROTH", brothId: "yuzu" }, T0);
    expect(next.tank.brothId).toBe("kombu");
  });

  it("鍋を6枠(深い土鍋)へ変更すると不足枠が60秒待機で追加される", () => {
    let state = createInitialGameState(T0, 1);
    state = { ...state, wallet: 2000, inventory: { ...state.inventory, ownedIds: [...state.inventory.ownedIds, "deep"] } };
    const next = applyAction(state, { type: "EQUIP_POT", potId: "deep" }, T0);
    expect(next.slots.length).toBe(6);
    expect(next.slots[5].status).toBe("empty-waiting");
    expect(next.slots[5].spawnAt).toBe(T0 + SPAWN_WAIT_MS);
  });

  it("5枠へ戻しても既存の6体目は収穫まで消えない", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      wallet: 2000,
      inventory: { ...state.inventory, ownedIds: [...state.inventory.ownedIds, "deep"] },
    };
    const withSix = applyAction(state, { type: "EQUIP_POT", potId: "deep" }, T0);
    const backToFive = applyAction(withSix, { type: "EQUIP_POT", potId: "clay" }, T0);
    expect(backToFive.slots.length).toBe(6);
    expect(backToFive.slots[5].retiring).toBe(true);
  });

  it("残量が満タンなら補充できない(たっぷり)", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "REFILL_BROTH" }, T0);
    expect(next.tank.remainingRatio).toBe(1);
    expect(next).toBe(state); // applyActionは無変化ならsettled(=state)をそのまま返す
  });
});

describe("おたすけ(消耗品)", () => {
  function withDrops(state, count) {
    return {
      ...state,
      inventory: { ...state.inventory, consumables: { ...state.inventory.consumables, drop: count } },
    };
  }

  it("所持していない消耗品は使用できない", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "USE_ASSIST", assistId: "drop" }, T0);
    expect(next.effects.growth).toBe(null);
  });

  it("同系統(成長)は同時に2つ使用できない(個数を消費しない)", () => {
    let state = withDrops(createInitialGameState(T0, 1), 2);
    state = applyAction(state, { type: "USE_ASSIST", assistId: "drop" }, T0);
    expect(state.inventory.consumables.drop).toBe(1);
    const second = applyAction(state, { type: "USE_ASSIST", assistId: "drop" }, T0);
    expect(second.inventory.consumables.drop).toBe(1); // 消費されない
  });

  it("残量0のときお留守番だしは使用できない", () => {
    let state = createInitialGameState(T0, 1);
    state = {
      ...state,
      tank: { ...state.tank, remainingRatio: 0 },
      inventory: { ...state.inventory, consumables: { care: 1 } },
    };
    const next = applyAction(state, { type: "USE_ASSIST", assistId: "care" }, T0);
    expect(next.effects.care).toBe(null);
    expect(next.inventory.consumables.care).toBe(1);
  });
});

describe("お願い(quest)", () => {
  it("条件未達では受け取れない", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "CLAIM_QUEST", questId: "first-harvest" }, T0);
    expect(next.wallet).toBe(state.wallet);
    expect(next.claimedQuestIds).not.toContain("first-harvest");
  });

  it("条件達成後に受け取ると報酬が入り、再受取できない", () => {
    let state = createInitialGameState(T0, 1);
    state = { ...state, stats: { ...state.stats, harvestTotal: 3 } };
    const claimed = applyAction(state, { type: "CLAIM_QUEST", questId: "first-harvest" }, T0);
    expect(claimed.wallet).toBe(state.wallet + 100);
    expect(claimed.claimedQuestIds).toContain("first-harvest");
    const again = applyAction(claimed, { type: "CLAIM_QUEST", questId: "first-harvest" }, T0);
    expect(again.wallet).toBe(claimed.wallet);
  });
});

describe("道具・飾り", () => {
  function withOwned(state, ids) {
    return { ...state, wallet: 5000, inventory: { ...state.inventory, ownedIds: [...state.inventory.ownedIds, ...ids] } };
  }

  it("ふたは1つだけ装備でき、別のふたに切り替えると前のふたは外れる", () => {
    let state = withOwned(createInitialGameState(T0, 1), ["lid-wood", "lid-ceramic"]);
    state = applyAction(state, { type: "SET_TOOL", toolId: "lid-wood", slotType: "lid" }, T0);
    expect(state.tank.tools.lid).toBe("lid-wood");
    state = applyAction(state, { type: "SET_TOOL", toolId: "lid-ceramic", slotType: "lid" }, T0);
    expect(state.tank.tools.lid).toBe("lid-ceramic");
  });

  it("未所持の道具は装備できない", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "SET_TOOL", toolId: "paddle", slotType: "paddle" }, T0);
    expect(next.tank.tools.paddle).toBe(false);
  });

  it("出汁まわし(paddle)は外すこともできる", () => {
    let state = withOwned(createInitialGameState(T0, 1), ["paddle"]);
    state = applyAction(state, { type: "SET_TOOL", toolId: "paddle", slotType: "paddle" }, T0);
    expect(state.tank.tools.paddle).toBe(true);
    state = applyAction(state, { type: "SET_TOOL", toolId: null, slotType: "paddle" }, T0);
    expect(state.tank.tools.paddle).toBe(false);
  });

  it("水槽の飾りは1点のみ、未所持は装備できない", () => {
    let state = withOwned(createInitialGameState(T0, 1), ["pebble"]);
    const deniedForUnowned = applyAction(state, { type: "APPLY_DECORATION", decorationId: "kelp" }, T0);
    expect(deniedForUnowned.tank.decorationId).toBe(null);
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: "pebble" }, T0);
    expect(state.tank.decorationId).toBe("pebble");
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: null }, T0);
    expect(state.tank.decorationId).toBe(null);
  });

  it("図鑑の器は発見済み種類にのみ適用でき、白以外を適用するとcustomBowlAppliedが立つ", () => {
    let state = withOwned(createInitialGameState(T0, 1), ["bowl-indigo"]);
    // まだ未発見なので適用できない
    const beforeDiscovery = applyAction(state, { type: "APPLY_BOWL", speciesId: "daikon", bowlId: "bowl-indigo" }, T0);
    expect(beforeDiscovery.catalog.daikon).toBeUndefined();

    state = applyAction(state, { type: "HARVEST", instanceId: 1 }, T0); // daikonを収穫して発見
    state = applyAction(state, { type: "APPLY_BOWL", speciesId: "daikon", bowlId: "bowl-indigo" }, T0);
    expect(state.catalog.daikon.bowlId).toBe("bowl-indigo");
    expect(state.stats.customBowlApplied).toBe(true);
  });
});
