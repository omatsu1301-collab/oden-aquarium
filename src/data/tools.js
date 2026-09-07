// 道具(tool)の固定データ。仕様5.3。lid/paddle/lampはそれぞれ独立した装備枠。
export const TOOL_ORDER = ["lid-wood", "lid-ceramic", "paddle", "lamp"];

export const TOOLS = {
  "lid-wood": {
    id: "lid-wood",
    name: "木のふた",
    price: 200,
    slotType: "lid",
    consumptionMultiplier: 0.8,
    tagline: "残量の減りをゆるやかに。",
    effectLabel: "出汁の消費×0.8",
  },
  "lid-ceramic": {
    id: "lid-ceramic",
    name: "陶器のふた",
    price: 600,
    slotType: "lid",
    consumptionMultiplier: 0.6,
    tagline: "しっかり閉じて長持ち。",
    effectLabel: "出汁の消費×0.6",
  },
  paddle: {
    id: "paddle",
    name: "出汁まわし",
    price: 350,
    slotType: "paddle",
    growthMultiplier: 1.1,
    tagline: "出汁をゆっくり回して染みやすく。",
    effectLabel: "成長速度×1.1",
  },
  lamp: {
    id: "lamp",
    name: "小さな灯り",
    price: 500,
    slotType: "lamp",
    tagline: "見つけていない子を照らす。",
    effectLabel: "各スロットで既発見種が4回連続した後、次は未発見種から選ぶ(全発見後は通常抽選)",
  },
};

export function getTool(toolId) {
  return TOOLS[toolId];
}
