// おたより(letter)の解禁判定。配信サーバーは使わず、ローカル条件でIDを固定して解禁する。
import { getLetter, LETTER_ORDER } from "../data/letters.js";
import { SPECIES_ORDER } from "../data/species.js";

function isAvailable(state, letterId) {
  switch (letterId) {
    case "welcome":
      return true;
    case "catalog-complete":
      return SPECIES_ORDER.every((id) => state.catalog[id]?.firstSeenAt != null);
    case "first-purchase":
      return state.stats.hasPurchased;
    default:
      return false;
  }
}

export function isLetterAvailable(state, letterId) {
  return isAvailable(state, letterId);
}

export function listLetterViews(state) {
  return LETTER_ORDER.filter((id) => isAvailable(state, id)).map((id) => {
    const letter = getLetter(id);
    return { ...letter, isRead: state.lettersRead.includes(id) };
  });
}
