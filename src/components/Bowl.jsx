// 共通の小鍋部品。図鑑一覧・詳細で同じ部品を使う(仕様2/6.3/美術改善パス2 8章)。
// レイヤー: コンテナ→小鍋画像(装飾)→キャラクター/未発見?→湯気(任意)→読み上げ用テキスト。
import { getBowlImageUrl } from "../data/bowlImages.js";
import "./Bowl.css";

const SPECIES_IMAGE = {
  daikon: "daikon.png",
  chikuwa: "chikuwa.png",
  shirataki: "shirataki.png",
  konnyaku: "konnyaku.png",
  ganmo: "ganmo.png",
};

// キャラクターは小鍋画像の出汁面(だいたい中央やや上寄り)へ収める。
// species別の見え方調整はここへ集約し、JSX/CSS各所へmagic numberを散らさない。
const DEFAULT_CHARACTER_ADJUST = { scale: 1, offsetX: 0, offsetY: 0 };
const CHARACTER_ADJUST = {
  daikon: { scale: 1, offsetX: 0, offsetY: 0 },
  chikuwa: { scale: 0.92, offsetX: 0, offsetY: 1 },
  shirataki: { scale: 0.94, offsetX: 0, offsetY: 0 },
  konnyaku: { scale: 1, offsetX: 0, offsetY: 0 },
  ganmo: { scale: 1, offsetX: 0, offsetY: 0 },
};

const UNDISCOVERED_BOWL_ID = "bowl-white";

export function Bowl({ speciesId, speciesName, bowlId = "bowl-white", size = "small", discovered = true }) {
  // 未発見は常に白い小鍋(出汁面中央に?)。所有中の器を先出ししない。
  const effectiveBowlId = discovered ? bowlId : UNDISCOVERED_BOWL_ID;
  const potUrl = getBowlImageUrl(effectiveBowlId);
  const characterFile = speciesId ? SPECIES_IMAGE[speciesId] : null;
  const characterUrl = characterFile ? `${import.meta.env.BASE_URL}assets/characters/${characterFile}` : null;
  const adjust = (speciesId && CHARACTER_ADJUST[speciesId]) || DEFAULT_CHARACTER_ADJUST;

  return (
    <div className={`bowl bowl--${size}`}>
      <img src={potUrl} alt="" aria-hidden="true" className="bowl__pot" draggable={false} />
      <div className="bowl__steam" aria-hidden="true" />
      {discovered && characterUrl ? (
        <img
          src={characterUrl}
          alt=""
          aria-hidden="true"
          className="bowl__character"
          draggable={false}
          style={{
            "--bowl-char-scale": adjust.scale,
            "--bowl-char-offset-x": `${adjust.offsetX}%`,
            "--bowl-char-offset-y": `${adjust.offsetY}%`,
          }}
        />
      ) : (
        <span className="bowl__unknown" aria-hidden="true">?</span>
      )}
      <span className="visually-hidden">{discovered ? speciesName : "未発見"}</span>
    </div>
  );
}
