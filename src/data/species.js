// 具材(species)の固定データ。既存5種類のみを正式コンテンツとする。
// growthMinutes: 出汁0%→100%まで基準倍率(×1)でかかる分数。
// harvestPoints: 収穫1回で得られるpt。
// description: 図鑑詳細に表示する生態文。
export const SPECIES_ORDER = ["daikon", "chikuwa", "shirataki", "konnyaku", "ganmo"];

export const SPECIES = {
  daikon: {
    id: "daikon",
    no: 1,
    name: "だいこん",
    growthMinutes: 10,
    harvestPoints: 20,
    description:
      "ぼんやりしているようで、出汁の流れにはうるさい。お気に入りの場所では、ひらひらがよく揺れる。",
  },
  chikuwa: {
    id: "chikuwa",
    no: 2,
    name: "ちくわ",
    growthMinutes: 12,
    harvestPoints: 24,
    description:
      "穴の向きを変えて、すいっと進む。急いでいる日は、たいてい行き先を忘れている。",
  },
  shirataki: {
    id: "shirataki",
    no: 3,
    name: "しらたき",
    growthMinutes: 15,
    harvestPoints: 30,
    description: "出汁の流れを髪型にしている。ほどけそうで、今日もほどけない。",
  },
  konnyaku: {
    id: "konnyaku",
    no: 4,
    name: "こんにゃく",
    growthMinutes: 18,
    harvestPoints: 36,
    description: "揺れても慌てない。水槽のすみで、泡が通るのを数えている。",
  },
  ganmo: {
    id: "ganmo",
    no: 5,
    name: "がんも",
    growthMinutes: 20,
    harvestPoints: 40,
    description: "まるい体に、小さな秘密がぎっしり。何を考えているかは、本人もよく知らない。",
  },
};

export const SPECIES_COUNT = SPECIES_ORDER.length;

export function getSpecies(speciesId) {
  return SPECIES[speciesId];
}
