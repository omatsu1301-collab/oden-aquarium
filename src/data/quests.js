// お願い(quest)の固定データ。仕様6.7。条件判定はgame/quests.jsが担当する(ここは静的定義のみ)。
export const QUEST_ORDER = ["first-harvest", "catalog", "broth", "familiar", "bowl", "dyes"];

export const QUESTS = {
  "first-harvest": {
    id: "first-harvest",
    title: "はじめての収穫",
    description: "具材を3体すくう",
    target: 3,
    reward: { type: "points", amount: 100 },
  },
  catalog: {
    id: "catalog",
    title: "にぎやかな図鑑",
    description: "具材を5種類見つける",
    target: 5,
    reward: { type: "item", itemId: "drop", quantity: 2 },
  },
  broth: {
    id: "broth",
    title: "いつもと違う香り",
    description: "かつおだしを一度装備する",
    target: 1,
    reward: { type: "points", amount: 150 },
  },
  familiar: {
    id: "familiar",
    title: "顔なじみ",
    description: "合計30体すくう",
    target: 30,
    reward: { type: "points", amount: 250 },
  },
  bowl: {
    id: "bowl",
    title: "お気に入りの器",
    description: "白以外の図鑑の小鍋を初めて使う",
    target: 1,
    reward: { type: "points", amount: 150 },
  },
  dyes: {
    id: "dyes",
    title: "染め記録あつめ",
    description: "種類×出汁の記録を10通り集める",
    target: 10,
    reward: { type: "item", itemId: "long-care", quantity: 1 },
  },
};

export function getQuest(questId) {
  return QUESTS[questId];
}
