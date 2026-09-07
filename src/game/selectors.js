// UI表示用の派生値を計算する純粋関数群。状態を変更しない。
import { SPECIES_ORDER } from "../data/species.js";
import { REMAINING_LOW_THRESHOLD } from "./constants.js";

export function getRemainingRatio(state) {
  return state.tank.remainingRatio;
}

export function getRemainingStatusLabel(state) {
  const ratio = state.tank.remainingRatio;
  if (ratio <= 0) return "出汁を足すと、よく染みるよ";
  if (ratio <= REMAINING_LOW_THRESHOLD) return "少なくなってきたよ";
  return null;
}

export function getDiscoveredSpeciesCount(catalog) {
  return SPECIES_ORDER.filter((id) => catalog[id]?.firstSeenAt != null).length;
}

export function getEffectRemainingMs(effect, nowMs) {
  if (!effect) return 0;
  return Math.max(0, effect.expiresAt - nowMs);
}

export function formatDurationShort(ms) {
  const totalMinutes = Math.ceil(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `あと${hours}時間${minutes}分`;
  return `あと${minutes}分`;
}

export function isSlotMature(slot) {
  return slot.status === "growing" && slot.progress >= 100;
}

export function getBowlIdForSpecies(state, speciesId) {
  return state.catalog[speciesId]?.bowlId ?? "bowl-white";
}
