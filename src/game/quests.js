// お願い(quest)の達成判定。累積統計から判定し、表示開始時点から数え始めない(仕様6.7)。
import { getQuest, QUEST_ORDER } from "../data/quests.js";
import { SPECIES_ORDER } from "../data/species.js";

function countDiscoveredSpecies(catalog) {
  return SPECIES_ORDER.filter((id) => catalog[id]?.firstSeenAt != null).length;
}

function countDyeCombinations(catalog) {
  let count = 0;
  for (const speciesId of SPECIES_ORDER) {
    const entry = catalog[speciesId];
    if (!entry) continue;
    for (const brothId of Object.keys(entry.brothCounts)) {
      if (entry.brothCounts[brothId] > 0) count += 1;
    }
  }
  return count;
}

function currentValue(state, questId) {
  switch (questId) {
    case "first-harvest":
      return state.stats.harvestTotal;
    case "catalog":
      return countDiscoveredSpecies(state.catalog);
    case "broth":
      return state.stats.brothsEverEquipped.includes("katsuo") ? 1 : 0;
    case "familiar":
      return state.stats.harvestTotal;
    case "bowl":
      return state.stats.customBowlApplied ? 1 : 0;
    case "dyes":
      return countDyeCombinations(state.catalog);
    default:
      return 0;
  }
}

export function evaluateQuest(state, questId) {
  const quest = getQuest(questId);
  const value = currentValue(state, questId);
  const progress = Math.min(value, quest.target);
  return { progress, target: quest.target, complete: value >= quest.target };
}

export function listQuestViews(state) {
  return QUEST_ORDER.map((questId) => {
    const quest = getQuest(questId);
    const evaluation = evaluateQuest(state, questId);
    return {
      ...quest,
      ...evaluation,
      claimed: state.claimedQuestIds.includes(questId),
    };
  });
}
