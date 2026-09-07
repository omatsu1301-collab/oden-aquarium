// UIコンポーネント: 水槽の1スロット(空き待ち/育成中)の描画とタップ反応を担当する。
// 成熟個体のタップ/Enter/Spaceは即座に収穫を確定させ(データ処理を先に一度だけ確定)、
// 「すくわれた」演出はこのコンポーネント内のローカルstateだけで作る残像として表現する
// (収穫処理自体はアニメ終了を待たない)。
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
  onHarvest,
  onDragEnterHarvest,
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

  if (slot.status !== "growing") {
    // 空き待ちスロット: 個体はまだいない(小さな泡だけで表現)。
    return (
      <div className={floatClassName}>
        <span className="aquarium-scene__empty-hint" aria-hidden="true" />
      </div>
    );
  }

  const species = getSpecies(slot.speciesId);
  const mature = slot.progress >= 100;

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

  function handleActivate() {
    if (mature) {
      // データ処理を先に一度だけ確定し、演出はローカルの残像だけで見せる。
      const id = afterimageIdRef.current++;
      setAfterimage({ id, speciesId: slot.speciesId, points: species.harvestPoints });
      onHarvest(slot.instanceId);
      playSe("harvest");
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
    if (mature && isDraggingRef?.current) {
      onDragEnterHarvest?.(slot.instanceId);
    }
  }

  function handleTapBubbleEnd(id) {
    setTapBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
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

      {afterimage && (
        <div
          key={afterimage.id}
          className="aquarium-scene__afterimage"
          onAnimationEnd={() => setAfterimage(null)}
        >
          <img src={imageUrlFor(afterimage.speciesId)} alt="" draggable={false} />
          <span className="aquarium-scene__afterimage-points">+{afterimage.points}pt</span>
        </div>
      )}
    </div>
  );
}
