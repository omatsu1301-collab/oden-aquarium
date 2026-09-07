// 離散的なユーザー操作(購入・装備・収穫・使用等)を適用する純粋関数。
// 呼び出し前に必ずadvanceGameで時刻を精算してから使う(applyActionが両方行う)。
import { getSpecies } from "../data/species.js";
import { getPot } from "../data/pots.js";
import { getTool } from "../data/tools.js";
import { getAssist } from "../data/assists.js";
import { getDecoration } from "../data/decorations.js";
import { getShopItem } from "../data/shopCatalog.js";
import { getQuest } from "../data/quests.js";
import { advanceGame, drawNextSpeciesForSlot } from "./engine.js";
import { evaluateQuest } from "./quests.js";
import { isLetterAvailable } from "./letters.js";
import { SPAWN_WAIT_MS } from "./constants.js";

function isOwned(state, itemId) {
  return state.inventory.ownedIds.includes(itemId);
}

function emptyCatalogEntry() {
  return { firstSeenAt: null, harvestCount: 0, favorite: false, bowlId: "bowl-white", brothCounts: {} };
}

function harvestSlot(state, action) {
  const index = state.slots.findIndex((slot) => slot.instanceId === action.instanceId);
  if (index === -1) return state;
  const slot = state.slots[index];
  if (slot.status !== "growing" || slot.progress < 100) return state;

  const species = getSpecies(slot.speciesId);
  const prevEntry = state.catalog[slot.speciesId] ?? emptyCatalogEntry();
  const nextEntry = {
    ...prevEntry,
    firstSeenAt: prevEntry.firstSeenAt ?? action.nowMs,
    harvestCount: prevEntry.harvestCount + 1,
    brothCounts: {
      ...prevEntry.brothCounts,
      [slot.brothId]: (prevEntry.brothCounts[slot.brothId] ?? 0) + 1,
    },
  };
  const catalog = { ...state.catalog, [slot.speciesId]: nextEntry };
  const stateWithCatalog = { ...state, catalog };

  const { speciesId: nextSpeciesId, nextStreak, nextSeed } = drawNextSpeciesForSlot(
    stateWithCatalog,
    state.tank.brothId,
    slot.duplicateStreak,
  );

  const slots = state.slots.slice();
  if (slot.retiring) {
    slots.splice(index, 1);
  } else {
    slots[index] = {
      status: "empty-waiting",
      pendingSpeciesId: nextSpeciesId,
      pendingBrothId: state.tank.brothId,
      spawnAt: action.nowMs + SPAWN_WAIT_MS,
      duplicateStreak: nextStreak,
      retiring: false,
    };
  }

  return {
    ...stateWithCatalog,
    slots,
    rngState: nextSeed,
    wallet: state.wallet + species.harvestPoints,
    stats: { ...state.stats, harvestTotal: state.stats.harvestTotal + 1 },
    tutorial: { ...state.tutorial, firstHarvestHintShown: true },
  };
}

function buyItem(state, action) {
  const item = getShopItem(action.itemId);
  if (!item) return state;
  if (item.kind === "permanent" && isOwned(state, item.id)) return state;
  if (state.wallet < item.price) return state;

  const wallet = state.wallet - item.price;
  const inventory =
    item.kind === "permanent"
      ? { ...state.inventory, ownedIds: [...state.inventory.ownedIds, item.id] }
      : {
          ...state.inventory,
          consumables: {
            ...state.inventory.consumables,
            [item.id]: (state.inventory.consumables[item.id] ?? 0) + 1,
          },
        };

  return {
    ...state,
    wallet,
    inventory,
    stats: { ...state.stats, hasPurchased: true },
  };
}

function equipBroth(state, action) {
  if (!isOwned(state, action.brothId)) return state;
  const brothsEverEquipped = state.stats.brothsEverEquipped.includes(action.brothId)
    ? state.stats.brothsEverEquipped
    : [...state.stats.brothsEverEquipped, action.brothId];
  return {
    ...state,
    tank: { ...state.tank, brothId: action.brothId },
    stats: { ...state.stats, brothsEverEquipped },
  };
}

function equipPot(state, action) {
  if (!isOwned(state, action.potId)) return state;
  const newCapacity = getPot(action.potId).slots;
  let slots = state.slots.slice();
  let rngState = state.rngState;

  if (slots.length < newCapacity) {
    const toAdd = newCapacity - slots.length;
    for (let i = 0; i < toAdd; i += 1) {
      const draw = drawNextSpeciesForSlot({ ...state, rngState }, state.tank.brothId, 0);
      rngState = draw.nextSeed;
      slots.push({
        status: "empty-waiting",
        pendingSpeciesId: draw.speciesId,
        pendingBrothId: state.tank.brothId,
        spawnAt: action.nowMs + SPAWN_WAIT_MS,
        duplicateStreak: 0,
        retiring: false,
      });
    }
  }

  // 現在の枠数と鍋の枠数を比べ、超過分(末尾)だけを「収穫後は補充しない」印にする。
  // 育成中・空き待ちいずれの個体も、途中で消さず収穫まで残す(仕様5.2)。
  // 印は毎回引き直すので、鍋を再度大きくすれば超過扱いは自然に解除される。
  const excess = Math.max(0, slots.length - newCapacity);
  const retireFromIndex = slots.length - excess;
  slots = slots.map((slot, index) => ({ ...slot, retiring: index >= retireFromIndex }));

  return {
    ...state,
    rngState,
    slots,
    tank: { ...state.tank, potId: action.potId },
  };
}

function setTool(state, action) {
  if (action.toolId !== null && !isOwned(state, action.toolId)) return state;
  const slotType = action.toolId ? getTool(action.toolId).slotType : action.slotType;
  const tools = { ...state.tank.tools };
  if (slotType === "lid") tools.lid = action.toolId;
  else if (slotType === "paddle") tools.paddle = Boolean(action.toolId);
  else if (slotType === "lamp") tools.lamp = Boolean(action.toolId);
  else return state;
  return { ...state, tank: { ...state.tank, tools } };
}

function applyDecoration(state, action) {
  if (action.decorationId !== null) {
    if (!isOwned(state, action.decorationId)) return state;
    if (getDecoration(action.decorationId).slotType !== "tank") return state;
  }
  return { ...state, tank: { ...state.tank, decorationId: action.decorationId } };
}

function applyBowl(state, action) {
  if (!isOwned(state, action.bowlId)) return state;
  if (getDecoration(action.bowlId).slotType !== "bowl") return state;
  const entry = state.catalog[action.speciesId];
  if (!entry || entry.firstSeenAt == null) return state;
  const catalog = { ...state.catalog, [action.speciesId]: { ...entry, bowlId: action.bowlId } };
  const customBowlApplied = state.stats.customBowlApplied || action.bowlId !== "bowl-white";
  return { ...state, catalog, stats: { ...state.stats, customBowlApplied } };
}

function consumeAssist(state, action) {
  const assist = getAssist(action.assistId);
  if (!assist) return state;
  const owned = state.inventory.consumables[assist.id] ?? 0;
  if (owned <= 0) return state;

  if (assist.category === "growth") {
    if (state.effects.growth) return state;
    return {
      ...state,
      inventory: {
        ...state.inventory,
        consumables: { ...state.inventory.consumables, [assist.id]: owned - 1 },
      },
      effects: {
        ...state.effects,
        growth: {
          itemId: assist.id,
          multiplier: assist.growthMultiplier,
          expiresAt: action.nowMs + assist.durationMs,
        },
      },
    };
  }

  if (assist.category === "care") {
    if (state.tank.remainingRatio <= 0) return state;
    if (state.effects.care) return state;
    return {
      ...state,
      inventory: {
        ...state.inventory,
        consumables: { ...state.inventory.consumables, [assist.id]: owned - 1 },
      },
      effects: {
        ...state.effects,
        care: { itemId: assist.id, expiresAt: action.nowMs + assist.durationMs },
      },
    };
  }

  return state;
}

function refillBroth(state) {
  if (state.tank.remainingRatio >= 1) return state;
  return { ...state, tank: { ...state.tank, remainingRatio: 1 } };
}

function setFavorite(state, action) {
  const entry = state.catalog[action.speciesId];
  if (!entry || entry.firstSeenAt == null) return state;
  return {
    ...state,
    catalog: {
      ...state.catalog,
      [action.speciesId]: { ...entry, favorite: action.favorite },
    },
  };
}

function claimQuest(state, action) {
  if (state.claimedQuestIds.includes(action.questId)) return state;
  const quest = getQuest(action.questId);
  if (!quest) return state;
  const progress = evaluateQuest(state, action.questId);
  if (!progress.complete) return state;

  let wallet = state.wallet;
  let inventory = state.inventory;
  if (quest.reward.type === "points") {
    wallet += quest.reward.amount;
  } else if (quest.reward.type === "item") {
    inventory = {
      ...inventory,
      consumables: {
        ...inventory.consumables,
        [quest.reward.itemId]: (inventory.consumables[quest.reward.itemId] ?? 0) + quest.reward.quantity,
      },
    };
  }

  return {
    ...state,
    wallet,
    inventory,
    claimedQuestIds: [...state.claimedQuestIds, action.questId],
  };
}

function markLetterRead(state, action) {
  if (state.lettersRead.includes(action.letterId)) return state;
  if (!isLetterAvailable(state, action.letterId)) return state;
  return { ...state, lettersRead: [...state.lettersRead, action.letterId] };
}

function setSettings(state, action) {
  return { ...state, settings: { ...state.settings, ...action.settings } };
}

function reduce(state, action) {
  switch (action.type) {
    case "HARVEST":
      return harvestSlot(state, action);
    case "BUY_ITEM":
      return buyItem(state, action);
    case "EQUIP_BROTH":
      return equipBroth(state, action);
    case "EQUIP_POT":
      return equipPot(state, action);
    case "SET_TOOL":
      return setTool(state, action);
    case "APPLY_DECORATION":
      return applyDecoration(state, action);
    case "APPLY_BOWL":
      return applyBowl(state, action);
    case "USE_ASSIST":
      return consumeAssist(state, action);
    case "REFILL_BROTH":
      return refillBroth(state);
    case "SET_FAVORITE":
      return setFavorite(state, action);
    case "CLAIM_QUEST":
      return claimQuest(state, action);
    case "MARK_LETTER_READ":
      return markLetterRead(state, action);
    case "SET_SETTINGS":
      return setSettings(state, action);
    default:
      return state;
  }
}

// 時刻を精算してから、離散アクションを1つ適用する。
export function applyAction(state, action, nowMs) {
  const settled = advanceGame(state, nowMs);
  const result = reduce(settled, { ...action, nowMs });
  if (result === settled) return settled;
  return { ...result, revision: settled.revision + 1 };
}
