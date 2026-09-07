// おたより(letter)の固定データ。仕様6.7。配信サーバーは使わず、ローカル条件で解禁する。
// 本文はAIが世界観(穏やか・急かさない)に沿って執筆した2〜4文。
export const LETTER_ORDER = ["welcome", "catalog-complete", "first-purchase"];

export const LETTERS = {
  welcome: {
    id: "welcome",
    title: "だし水槽へようこそ",
    body: [
      "だし水槽へようこそ。",
      "ここでは、出汁にゆっくり浸かる具材たちを眺めて、たまにそっと触れることができます。",
      "染み込み具合がちょうどよくなったら、おたまですくって図鑑に記録しましょう。",
      "急がなくても、出汁がなくなっても、みんなはここで待っています。",
    ].join("\n"),
  },
  "catalog-complete": {
    id: "catalog-complete",
    title: "小鍋棚がにぎやかに",
    body: [
      "小鍋棚がにぎやかになりました。",
      "5つの棚に、それぞれの子がちゃんと収まっています。",
      "出汁を変えると、同じ子でも少し違う表情を見せてくれることがあるようです。",
      "ゆっくり見比べてみてください。",
    ].join("\n"),
  },
  "first-purchase": {
    id: "first-purchase",
    title: "道具屋からのお礼",
    body: [
      "道具屋からのお礼です。",
      "はじめてのお買い物、ありがとうございました。",
      "出汁や鍋、道具はいつでも商店で選び直せます。",
      "気に入ったものが見つかるまで、気軽に試してみてください。",
    ].join("\n"),
  },
};

export function getLetter(letterId) {
  return LETTERS[letterId];
}
