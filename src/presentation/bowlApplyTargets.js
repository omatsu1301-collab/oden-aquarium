// 器(小鍋)decorationの適用先。図鑑で発見済みの具材だけが対象。
import { SPECIES_ORDER } from "../data/species.js";

export function isBowlDecorationActive(item, state) {
  if (item.category !== "decoration" || item.slotType !== "bowl") return false;
  const catalog = state?.catalog;
  if (!catalog) return false;
  return SPECIES_ORDER.some((id) => catalog[id]?.bowlId === item.id);
}

export function getBowlApplyTargets(state) {
  const catalog = state?.catalog;
  if (!catalog) return [];
  return SPECIES_ORDER.filter((id) => catalog[id]?.firstSeenAt != null);
}
