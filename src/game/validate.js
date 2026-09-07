// v2セーブデータの構造検証。localStorage読込・バックアップ復元の両方から使う。
// 「未知のフィールドをObject.assignで無制限に混ぜない」ため、許可されたフィールドのみを
// 検証しつつ正規化したオブジェクトとして返す(仕様7.4)。
import { SPECIES_ORDER } from "../data/species.js";
import { BROTH_ORDER } from "../data/broths.js";
import { POT_ORDER, getPot } from "../data/pots.js";
import { TOOL_ORDER } from "../data/tools.js";
import { ASSIST_ORDER } from "../data/assists.js";
import { BOWL_DECORATION_ORDER, TANK_DECORATION_ORDER } from "../data/decorations.js";
import { QUEST_ORDER } from "../data/quests.js";
import { LETTER_ORDER } from "../data/letters.js";
import { getShopItem } from "../data/shopCatalog.js";
import { GAME_SCHEMA_VERSION } from "./constants.js";

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonNegativeInteger(value) {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 0;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateCatalog(catalog) {
  if (!isPlainObject(catalog)) return null;
  const result = {};
  for (const speciesId of Object.keys(catalog)) {
    if (!SPECIES_ORDER.includes(speciesId)) continue;
    const entry = catalog[speciesId];
    if (!isPlainObject(entry)) continue;
    if (entry.firstSeenAt !== null && !isFiniteNumber(entry.firstSeenAt)) continue;
    if (!isNonNegativeInteger(entry.harvestCount)) continue;
    const bowlId = [...BOWL_DECORATION_ORDER].includes(entry.bowlId) ? entry.bowlId : "bowl-white";
    const brothCounts = {};
    if (isPlainObject(entry.brothCounts)) {
      for (const brothId of BROTH_ORDER) {
        const count = entry.brothCounts[brothId];
        if (isNonNegativeInteger(count)) brothCounts[brothId] = count;
      }
    }
    result[speciesId] = {
      firstSeenAt: entry.firstSeenAt ?? null,
      harvestCount: entry.harvestCount,
      favorite: Boolean(entry.favorite),
      bowlId,
      brothCounts,
    };
  }
  return result;
}

function validateSlots(slotsRaw, potId) {
  if (!Array.isArray(slotsRaw)) return null;
  const capacity = getPot(potId)?.slots ?? slotsRaw.length;
  if (slotsRaw.length === 0 || slotsRaw.length > capacity + 1) return null;

  const seenInstanceIds = new Set();
  const slots = [];
  for (const slot of slotsRaw) {
    if (!isPlainObject(slot)) return null;
    if (slot.status === "growing") {
      if (!SPECIES_ORDER.includes(slot.speciesId)) return null;
      if (!BROTH_ORDER.includes(slot.brothId)) return null;
      if (!isFiniteNumber(slot.progress) || slot.progress < 0 || slot.progress > 100) return null;
      if (!isNonNegativeInteger(slot.instanceId) || seenInstanceIds.has(slot.instanceId)) return null;
      seenInstanceIds.add(slot.instanceId);
      slots.push({
        status: "growing",
        instanceId: slot.instanceId,
        speciesId: slot.speciesId,
        brothId: slot.brothId,
        progress: slot.progress,
        spawnedAt: isFiniteNumber(slot.spawnedAt) ? slot.spawnedAt : 0,
        duplicateStreak: isNonNegativeInteger(slot.duplicateStreak) ? slot.duplicateStreak : 0,
        retiring: Boolean(slot.retiring),
      });
    } else if (slot.status === "empty-waiting") {
      if (!SPECIES_ORDER.includes(slot.pendingSpeciesId)) return null;
      if (!BROTH_ORDER.includes(slot.pendingBrothId)) return null;
      if (!isFiniteNumber(slot.spawnAt)) return null;
      slots.push({
        status: "empty-waiting",
        pendingSpeciesId: slot.pendingSpeciesId,
        pendingBrothId: slot.pendingBrothId,
        spawnAt: slot.spawnAt,
        duplicateStreak: isNonNegativeInteger(slot.duplicateStreak) ? slot.duplicateStreak : 0,
        retiring: Boolean(slot.retiring),
      });
    } else {
      return null;
    }
  }
  return slots;
}

// 保存全体(v2形式)を検証し、正規化済みオブジェクトを返す。壊れていればnull。
export function validateGameState(data) {
  if (!isPlainObject(data)) return null;
  if (data.schemaVersion !== GAME_SCHEMA_VERSION) return null;
  if (!isNonNegativeInteger(data.revision)) return null;
  if (!isFiniteNumber(data.lastSimulatedAt)) return null;
  if (!Number.isInteger(data.rngState)) return null;
  if (!isNonNegativeInteger(data.nextInstanceId)) return null;
  if (!isFiniteNumber(data.wallet) || data.wallet < 0) return null;

  if (!isPlainObject(data.tank)) return null;
  if (!BROTH_ORDER.includes(data.tank.brothId)) return null;
  if (!POT_ORDER.includes(data.tank.potId)) return null;
  if (!isFiniteNumber(data.tank.remainingRatio) || data.tank.remainingRatio < 0 || data.tank.remainingRatio > 1) {
    return null;
  }
  if (!isPlainObject(data.tank.tools)) return null;
  const lid = data.tank.tools.lid;
  if (lid !== null && !TOOL_ORDER.filter((id) => id.startsWith("lid-")).includes(lid)) return null;
  const decorationId = data.tank.decorationId;
  if (decorationId !== null && !TANK_DECORATION_ORDER.includes(decorationId)) return null;

  const slots = validateSlots(data.slots, data.tank.potId);
  if (!slots) return null;

  const catalog = validateCatalog(data.catalog);
  if (!catalog) return null;

  if (!isPlainObject(data.inventory)) return null;
  if (!Array.isArray(data.inventory.ownedIds)) return null;
  if (!isPlainObject(data.inventory.consumables)) return null;
  const consumables = {};
  for (const id of ASSIST_ORDER) {
    const count = data.inventory.consumables[id];
    if (isNonNegativeInteger(count)) consumables[id] = count;
  }

  if (!isPlainObject(data.effects)) return null;
  const growth = data.effects.growth;
  const care = data.effects.care;
  const validEffect = (effect) =>
    effect === null || (isPlainObject(effect) && isFiniteNumber(effect.expiresAt));
  if (!validEffect(growth) || !validEffect(care)) return null;

  if (!isPlainObject(data.stats)) return null;
  if (!isNonNegativeInteger(data.stats.harvestTotal)) return null;
  if (!Array.isArray(data.stats.brothsEverEquipped)) return null;

  if (!Array.isArray(data.claimedQuestIds)) return null;
  if (!Array.isArray(data.lettersRead)) return null;
  if (!isPlainObject(data.settings)) return null;

  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    revision: data.revision,
    lastSimulatedAt: data.lastSimulatedAt,
    rngState: data.rngState,
    nextInstanceId: data.nextInstanceId,
    wallet: data.wallet,
    tank: {
      brothId: data.tank.brothId,
      remainingRatio: data.tank.remainingRatio,
      potId: data.tank.potId,
      tools: {
        lid: lid ?? null,
        paddle: Boolean(data.tank.tools.paddle),
        lamp: Boolean(data.tank.tools.lamp),
      },
      decorationId,
    },
    slots,
    catalog,
    inventory: {
      ownedIds: data.inventory.ownedIds.filter(
        (id) => typeof id === "string" && Boolean(getShopItem(id)),
      ),
      consumables,
    },
    effects: { growth, care },
    stats: {
      harvestTotal: data.stats.harvestTotal,
      brothsEverEquipped: data.stats.brothsEverEquipped.filter((id) => BROTH_ORDER.includes(id)),
      customBowlApplied: Boolean(data.stats.customBowlApplied),
      hasPurchased: Boolean(data.stats.hasPurchased),
    },
    claimedQuestIds: data.claimedQuestIds.filter((id) => QUEST_ORDER.includes(id)),
    lettersRead: data.lettersRead.filter((id) => LETTER_ORDER.includes(id)),
    settings: {
      bgmVolume: isFiniteNumber(data.settings.bgmVolume)
        ? Math.min(100, Math.max(0, data.settings.bgmVolume))
        : 40,
      seVolume: isFiniteNumber(data.settings.seVolume)
        ? Math.min(100, Math.max(0, data.settings.seVolume))
        : 70,
      vibration: data.settings.vibration !== false,
      reducedMotion:
        typeof data.settings.reducedMotion === "boolean" ? data.settings.reducedMotion : null,
    },
    tutorial: {
      firstHarvestHintShown: Boolean(data.tutorial?.firstHarvestHintShown),
    },
  };
}
