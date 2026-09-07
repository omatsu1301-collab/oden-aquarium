// v2セーブデータの初期状態生成。Reactに依存しない純粋関数。
import { SPECIES_ORDER } from "../data/species.js";
import { getInitiallyOwnedIds } from "../data/shopCatalog.js";
import {
  GAME_SCHEMA_VERSION,
  NEW_GAME_WALLET,
  NEW_GAME_BROTH_ID,
  NEW_GAME_POT_ID,
} from "./constants.js";
import { createFreshSeed } from "./rng.js";

// 初回5スロットの初期進行度(仕様4.1): 大根100/ちくわ75/しらたき50/こんにゃく25/がんも0。
const INITIAL_SLOT_PROGRESS = [100, 75, 50, 25, 0];

export function createInitialSlots(nowMs) {
  return SPECIES_ORDER.map((speciesId, index) => ({
    status: "growing",
    instanceId: index + 1,
    speciesId,
    brothId: NEW_GAME_BROTH_ID,
    progress: INITIAL_SLOT_PROGRESS[index],
    spawnedAt: nowMs,
    duplicateStreak: 0,
  }));
}

export function createInitialGameState(nowMs, seed = createFreshSeed()) {
  return {
    schemaVersion: GAME_SCHEMA_VERSION,
    revision: 1,
    lastSimulatedAt: nowMs,
    rngState: seed,
    nextInstanceId: SPECIES_ORDER.length + 1,
    wallet: NEW_GAME_WALLET,
    tank: {
      brothId: NEW_GAME_BROTH_ID,
      remainingRatio: 1,
      potId: NEW_GAME_POT_ID,
      tools: { lid: null, paddle: false, lamp: false },
      decorationId: null,
    },
    slots: createInitialSlots(nowMs),
    catalog: {},
    inventory: {
      ownedIds: getInitiallyOwnedIds(),
      consumables: {},
    },
    effects: { growth: null, care: null },
    stats: {
      harvestTotal: 0,
      brothsEverEquipped: [NEW_GAME_BROTH_ID],
      customBowlApplied: false,
      hasPurchased: false,
    },
    claimedQuestIds: [],
    lettersRead: [],
    settings: {
      bgmVolume: 40,
      seVolume: 70,
      vibration: true,
      reducedMotion: null, // null = 初回OS設定に従う。true/falseが入ったらユーザー設定として固定。
    },
    // 表示専用の一過性フラグ。永続化はされるが、ゲームロジックの正しさには影響しない。
    tutorial: { firstHarvestHintShown: false },
  };
}
