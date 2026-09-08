// ゲームの時間経過を進める純粋関数。Reactに依存しない。
// Date.now()/Math.random()を直接呼ばず、nowMsは引数として渡される。
// 乱数はrngStateから都度導出し、消費した分だけ更新して返す(隠れた副作用なし)。
import { getPot } from "../data/pots.js";
import { getTool } from "../data/tools.js";
import { getSpecies } from "../data/species.js";
import { drawSpeciesId } from "../data/broths.js";
import { SPECIES_ORDER, SPECIES_COUNT } from "../data/species.js";
import { stepRng } from "./rng.js";
import { LAMP_PITY_STREAK, SPAWN_WAIT_MIN_MS, SPAWN_WAIT_MAX_MS } from "./constants.js";

export function getPotConfig(state) {
  return getPot(state.tank.potId);
}

// 出汁残量(0-1)の1msあたりの消費率。ふたが装備されていれば減率される。
export function getDepletionRatePerMs(state) {
  const pot = getPotConfig(state);
  const baseRatePerMs = 1 / (pot.fullHours * 60 * 60 * 1000);
  const lidId = state.tank.tools.lid;
  const lidMultiplier = lidId ? getTool(lidId).consumptionMultiplier : 1;
  return baseRatePerMs * lidMultiplier;
}

// 指定時刻における成長倍率。区間内(ブレイクポイント間)では一定という前提で呼ばれる。
export function getGrowthMultiplier(state, atMs) {
  const pot = getPotConfig(state);
  let multiplier = state.tank.remainingRatio > 0 ? 1 : 0.5;
  multiplier *= pot.speedMultiplier;
  if (state.tank.tools.paddle) {
    multiplier *= getTool("paddle").growthMultiplier;
  }
  if (state.effects.growth && state.effects.growth.expiresAt > atMs) {
    multiplier *= state.effects.growth.multiplier;
  }
  return multiplier;
}

function getSpeciesGrowthRatePerMs(speciesId) {
  const species = getSpecies(speciesId);
  return 100 / (species.growthMinutes * 60 * 1000);
}

function isCareActiveAt(state, atMs) {
  return Boolean(state.effects.care && state.effects.care.expiresAt > atMs);
}

// 次のブレイクポイント(倍率や残量の状態が変わりうる最短の時刻)を求める。
function computeNextBreakpoint(state, fromMs, limitMs) {
  const candidates = [limitMs];

  if (state.effects.growth && state.effects.growth.expiresAt > fromMs) {
    candidates.push(state.effects.growth.expiresAt);
  }
  if (state.effects.care && state.effects.care.expiresAt > fromMs) {
    candidates.push(state.effects.care.expiresAt);
  }
  if (!isCareActiveAt(state, fromMs) && state.tank.remainingRatio > 0) {
    const rate = getDepletionRatePerMs(state);
    if (rate > 0) {
      candidates.push(fromMs + state.tank.remainingRatio / rate);
    }
  }
  for (const slot of state.slots) {
    if (slot.status === "empty-waiting" && slot.spawnAt > fromMs) {
      candidates.push(slot.spawnAt);
    }
  }

  return Math.min(...candidates.filter((c) => c > fromMs), limitMs);
}

function drawNextSpeciesForSlot(state, brothId, duplicateStreak) {
  const catalog = state.catalog;
  const discovered = new Set(
    SPECIES_ORDER.filter((id) => catalog[id] && catalog[id].firstSeenAt != null),
  );
  const allDiscovered = discovered.size >= SPECIES_COUNT;
  const hasLamp = state.tank.tools.lamp;

  const { value, nextSeed } = stepRng(state.rngState);
  let speciesId;
  let nextStreak;

  if (hasLamp && duplicateStreak >= LAMP_PITY_STREAK && !allDiscovered) {
    const undiscovered = SPECIES_ORDER.filter((id) => !discovered.has(id));
    const idx = Math.min(Math.floor(value * undiscovered.length), undiscovered.length - 1);
    speciesId = undiscovered[idx];
    nextStreak = 0;
  } else {
    speciesId = drawSpeciesId(brothId, value);
    nextStreak = discovered.has(speciesId) ? duplicateStreak + 1 : 0;
  }

  return { speciesId, nextStreak, nextSeed };
}

// 補充待ち時間を[SPAWN_WAIT_MIN_MS, SPAWN_WAIT_MAX_MS]の一様分布で抽選する(期待値60秒)。
// 種族抽選とは別にseedを1回進める、同じseedなら同じ待ち時間・同じ次seedになる決定的な実装。
function drawSpawnWaitMs(seed) {
  const { value, nextSeed } = stepRng(seed);
  const waitMs = Math.round(SPAWN_WAIT_MIN_MS + value * (SPAWN_WAIT_MAX_MS - SPAWN_WAIT_MIN_MS));
  return { waitMs, nextSeed };
}

// [fromMs, toMs) の区間を、倍率が一定である前提で積分する(ブレイクポイントは含まない)。
function integrateSegment(state, fromMs, toMs) {
  const dt = toMs - fromMs;
  if (dt <= 0) return state;

  const growthMultiplier = getGrowthMultiplier(state, fromMs);
  const slots = state.slots.map((slot) => {
    if (slot.status !== "growing") return slot;
    const ratePerMs = getSpeciesGrowthRatePerMs(slot.speciesId);
    const nextProgress = Math.min(100, slot.progress + ratePerMs * growthMultiplier * dt);
    return { ...slot, progress: nextProgress };
  });

  let remainingRatio = state.tank.remainingRatio;
  if (!isCareActiveAt(state, fromMs)) {
    const depletionRate = getDepletionRatePerMs(state);
    remainingRatio = Math.max(0, remainingRatio - depletionRate * dt);
  }

  return {
    ...state,
    slots,
    tank: { ...state.tank, remainingRatio },
  };
}

// ブレイクポイント時刻ちょうどに発生する状態遷移(効果終了・スロット出生)を適用する。
function applyBreakpointTransitions(state, atMs) {
  let next = state;

  if (next.effects.growth && next.effects.growth.expiresAt === atMs) {
    next = { ...next, effects: { ...next.effects, growth: null } };
  }
  if (next.effects.care && next.effects.care.expiresAt === atMs) {
    next = { ...next, effects: { ...next.effects, care: null } };
  }

  let nextInstanceId = next.nextInstanceId;
  const slots = next.slots.map((slot) => {
    if (slot.status === "empty-waiting" && slot.spawnAt === atMs) {
      const instanceId = nextInstanceId;
      nextInstanceId += 1;
      return {
        status: "growing",
        instanceId,
        speciesId: slot.pendingSpeciesId,
        brothId: slot.pendingBrothId,
        progress: 0,
        spawnedAt: atMs,
        duplicateStreak: slot.duplicateStreak,
        retiring: slot.retiring ?? false,
      };
    }
    return slot;
  });

  if (nextInstanceId !== next.nextInstanceId) {
    next = { ...next, slots, nextInstanceId };
  }

  return next;
}

const MAX_BREAKPOINT_ITERATIONS = 256;

// 時計後退時は経過0とし、基準時刻を後ろへ戻さない。
export function advanceGame(state, nowMs) {
  if (nowMs <= state.lastSimulatedAt) {
    return state;
  }

  let current = state;
  let t = state.lastSimulatedAt;
  let iterations = 0;

  while (t < nowMs && iterations < MAX_BREAKPOINT_ITERATIONS) {
    iterations += 1;
    const breakpoint = computeNextBreakpoint(current, t, nowMs);
    current = integrateSegment(current, t, breakpoint);
    current = applyBreakpointTransitions(current, breakpoint);
    t = breakpoint;
  }

  return { ...current, lastSimulatedAt: nowMs };
}

export { drawNextSpeciesForSlot, drawSpawnWaitMs, getSpeciesGrowthRatePerMs, isCareActiveAt };
