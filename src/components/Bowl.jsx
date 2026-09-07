// 共通の小鍋部品。図鑑一覧・詳細で同じ部品を使う(仕様2/6.3)。
// 背面(内側/出汁)→キャラクター→前面の縁、の順でレイヤー合成する。
import "./Bowl.css";

const SPECIES_IMAGE = {
  daikon: "daikon.png",
  chikuwa: "chikuwa.png",
  shirataki: "shirataki.png",
  konnyaku: "konnyaku.png",
  ganmo: "ganmo.png",
};

export function Bowl({ speciesId, speciesName, bowlId = "bowl-white", size = "small", discovered = true }) {
  const image = speciesId ? `${import.meta.env.BASE_URL}assets/characters/${SPECIES_IMAGE[speciesId]}` : null;
  return (
    <div className={`bowl bowl--${size} bowl--${bowlId}`}>
      <div className="bowl__steam" aria-hidden="true" />
      <div className="bowl__inner" aria-hidden="true" />
      {discovered && image ? (
        <img src={image} alt="" className="bowl__character" draggable={false} />
      ) : (
        <span className="bowl__unknown" aria-hidden="true">?</span>
      )}
      <div className="bowl__rim" aria-hidden="true">
        <span className="bowl__handle bowl__handle--left" />
        <span className="bowl__handle bowl__handle--right" />
      </div>
      <span className="visually-hidden">{discovered ? speciesName : "未発見"}</span>
    </div>
  );
}
