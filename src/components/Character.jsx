// UIコンポーネント: 水槽の1スロット(空き待ち/育成中)の描画とタップ反応を担当する。
// 成熟個体の収穫は、タップ・Enter/Space・なぞりのすべてが requestHarvest() という
// 同一関数を通る(コアループの手触り改善パス1、仕様4.1)。
// データ処理(dispatch)・収穫SE・連続収穫集計はAquariumScene側のonRequestHarvestが担い、
// このコンポーネントは自分の位置に出す個別の「+N pt」演出(afterimage)だけを局所stateで持つ。
// 空き待ちへ状態が変わっても、この演出はCharacterSlotの外側(早期returnより前)で
// 描画され続けるため、収穫直後に演出ごと消えることはない。
// 未成熟のタップは既存のかわいい反応(ぷるん/逃げ・タップ泡・きらめき)をそのまま使う。
import { useRef, useState } from "react";
import { getSpecies } from "../data/species.js";
import { getSoakVisualStyle } from "../presentation/soakVisual.js";
import { playSe } from "../audio/audioEngine.js";

const TAP_BUBBLE_OFFSETS = [
  { left: "-14%", size: 4, duration: 0.8 },
  { left: "8%", size: 3, duration: 0.7 },
  { left: "22%", size: 5, duration: 0.9 },
  { left: "-2%", size: 3, duration: 0.75 },
];
const MAX_TAP_BUBBLES = 24;

const SPECIES_IMAGE = {
  daikon: "daikon.png",
  chikuwa: "chikuwa.png",
  shirataki: "shirataki.png",
  konnyaku: "konnyaku.png",
  ganmo: "ganmo.png",
};

function imageUrlFor(speciesId) {
  return `${import.meta.env.BASE_URL}assets/characters/${SPECIES_IMAGE[speciesId]}`;
}

export function CharacterSlot({
  slot,
  floatClassName,
  tapClassName,
  onRequestHarvest,
  claimDragHarvest,
  isDraggingRef,
}) {
  const tapRef = useRef(null);
  const fleeDirRef = useRef(1);
  const tapBubbleIdRef = useRef(0);
  const [tapBubbles, setTapBubbles] = useState([]);
  const [hintVisible, setHintVisible] = useState(false);
  const [afterimage, setAfterimage] = useState(null);
  const afterimageIdRef = useRef(0);
  const hintTimeoutRef = useRef(null);
  // 直近でrequestHarvest()を通したinstanceId。dispatchは非同期(ゲームlock経由)のため、
  // slot propsが更新される前に同じinstanceIdへ2回目の要求が来ても、ここで同期的に弾く。
  // 新しい個体(=新しいinstanceId)が来れば自然に比較が外れ、通常どおり収穫できる。
  const claimedInstanceIdRef = useRef(null);

  const growing = slot.status === "growing";
  const species = growing ? getSpecies(slot.speciesId) : null;
  const mature = growing && slot.progress >= 100;

  function playTapReaction() {
    const el = tapRef.current;
    if (el) {
      fleeDirRef.current *= -1;
      el.style.setProperty("--flee-dir", String(fleeDirRef.current));
      el.classList.remove("is-tapped");
      void el.offsetWidth;
      el.classList.add("is-tapped");
    }
    const newBubbles = TAP_BUBBLE_OFFSETS.map((offset) => ({
      id: tapBubbleIdRef.current++,
      ...offset,
    }));
    setTapBubbles((prev) => [...prev, ...newBubbles].slice(-MAX_TAP_BUBBLES));
  }

  // 収穫の唯一の入口。タップ/Enter・Space/なぞりのすべてがここを通る。
  // 同一instanceIdへの2回目以降の要求は、dispatchがまだ反映されていなくても同期的に無視する。
  function requestHarvest() {
    if (claimedInstanceIdRef.current === slot.instanceId) return;
    claimedInstanceIdRef.current = slot.instanceId;
    const id = afterimageIdRef.current++;
    setAfterimage({ id, speciesId: slot.speciesId, points: species.harvestPoints });
    onRequestHarvest(slot.instanceId, slot.speciesId, species.harvestPoints);
  }

  function handleActivate() {
    if (mature) {
      requestHarvest();
      return;
    }
    playTapReaction();
    playSe("tap");
    setHintVisible(true);
    if (hintTimeoutRef.current) window.clearTimeout(hintTimeoutRef.current);
    hintTimeoutRef.current = window.setTimeout(() => setHintVisible(false), 1200);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate();
    }
  }

  function handlePointerEnter() {
    if (mature && isDraggingRef?.current && claimDragHarvest(slot.instanceId)) {
      requestHarvest();
    }
  }

  function handleTapBubbleEnd(id) {
    setTapBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
  }

  const afterimageNode = afterimage && (
    <div
      key={afterimage.id}
      className="aquarium-scene__afterimage"
      onAnimationEnd={() => setAfterimage(null)}
    >
      <img src={imageUrlFor(afterimage.speciesId)} alt="" draggable={false} />
      <span className="aquarium-scene__harvest-points">+{afterimage.points}pt</span>
    </div>
  );

  if (!growing) {
    // 空き待ちスロット: 個体はまだいない(小さな泡だけで表現)。
    // afterimageは個体の有無と無関係に描画し続けるため、収穫直後にここへ来ても消えない。
    return (
      <div className={floatClassName}>
        <span className="aquarium-scene__empty-hint" aria-hidden="true" />
        {afterimageNode}
      </div>
    );
  }

  return (
    <div className={floatClassName}>
      <button
        type="button"
        ref={tapRef}
        onClick={handleActivate}
        onKeyDown={handleKeyDown}
        onPointerEnter={handlePointerEnter}
        className={`aquarium-scene__tap ${tapClassName}`}
        aria-label={`${species.name}(${mature ? "すくえます" : `育成中 ${Math.round(slot.progress)}%`})`}
      >
        <img
          src={imageUrlFor(slot.speciesId)}
          alt={species.name}
          className="aquarium-scene__character"
          style={getSoakVisualStyle(slot.progress)}
          draggable={false}
        />
        {mature && <span className="aquarium-scene__mature-glow" aria-hidden="true" />}
        <span className="aquarium-scene__sparkle" aria-hidden="true" />
      </button>

      {hintVisible && !mature && (
        <span className="aquarium-scene__progress-hint" role="status">
          {species.name} {Math.round(slot.progress)}%
        </span>
      )}

      <div className="aquarium-scene__tap-bubbles" aria-hidden="true">
        {tapBubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="aquarium-scene__tap-bubble"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
            }}
            onAnimationEnd={() => handleTapBubbleEnd(bubble.id)}
          />
        ))}
      </div>

      {afterimageNode}
    </div>
  );
}
