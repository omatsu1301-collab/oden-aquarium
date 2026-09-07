// UIコンポーネント: 水槽の背景・常時泡・スロット配置を担当する。
// スロットの中身(どの具材が育っているか)は都度state.slotsから渡され、
// 位置(浮遊keyframe)自体は既存の5配置(+6枠目)を再利用する。
// 水槽領域をなぞっての連続収穫(仕様4.4)にも対応する。
import { useRef, useState } from "react";
import { CharacterSlot } from "./Character.jsx";
import { getDecoration } from "../data/decorations.js";
import "./AquariumScene.css";

const backgroundImage = `${import.meta.env.BASE_URL}assets/backgrounds/aquarium-background.webp`;

const BUBBLES = [
  { left: "8%", size: 5, duration: 7.2, delay: -1.4, rise: "-88vh", opacity: 0.35 },
  { left: "18%", size: 3, duration: 6.1, delay: -4.8, rise: "-92vh", opacity: 0.25 },
  { left: "30%", size: 6, duration: 8.4, delay: -2.9, rise: "-85vh", opacity: 0.4 },
  { left: "42%", size: 4, duration: 6.8, delay: -0.6, rise: "-90vh", opacity: 0.3 },
  { left: "58%", size: 3, duration: 7.9, delay: -5.6, rise: "-93vh", opacity: 0.28 },
  { left: "68%", size: 5, duration: 6.5, delay: -3.3, rise: "-87vh", opacity: 0.38 },
  { left: "78%", size: 4, duration: 8.9, delay: -1.9, rise: "-91vh", opacity: 0.32 },
  { left: "88%", size: 6, duration: 7.5, delay: -4.1, rise: "-86vh", opacity: 0.42 },
  { left: "50%", size: 3, duration: 9.3, delay: -6.4, rise: "-94vh", opacity: 0.22 },
];

// 位置(浮遊keyframe)は既存5配置をそのまま再利用し、6枠目(深い土鍋)だけ新規追加する。
const POSITION_CLASSES = [
  { float: "aquarium-scene__daikon-float", tap: "aquarium-scene__daikon-tap" },
  { float: "aquarium-scene__chikuwa-float", tap: "aquarium-scene__chikuwa-tap" },
  { float: "aquarium-scene__shirataki-float", tap: "aquarium-scene__shirataki-tap" },
  { float: "aquarium-scene__konnyaku-float", tap: "aquarium-scene__konnyaku-tap" },
  { float: "aquarium-scene__ganmo-float", tap: "aquarium-scene__ganmo-tap" },
  { float: "aquarium-scene__slot6-float", tap: "aquarium-scene__slot6-tap" },
];

export function AquariumScene({ slots, onHarvest, decorationId }) {
  const isDraggingRef = useRef(false);
  const draggedInstanceIdsRef = useRef(new Set());
  const [, forceRender] = useState(0);

  function handlePointerDown() {
    isDraggingRef.current = true;
    draggedInstanceIdsRef.current = new Set();
  }
  function endDrag() {
    isDraggingRef.current = false;
  }
  function handleDragEnterHarvest(instanceId) {
    if (draggedInstanceIdsRef.current.has(instanceId)) return;
    draggedInstanceIdsRef.current.add(instanceId);
    onHarvest(instanceId);
    forceRender((n) => n + 1);
  }

  const decoration = decorationId ? getDecoration(decorationId) : null;

  return (
    <div
      className="aquarium-scene"
      onPointerDown={handlePointerDown}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <img
        src={backgroundImage}
        alt=""
        className="aquarium-scene__background"
        draggable={false}
      />

      <div className="aquarium-scene__bubbles" aria-hidden="true">
        {BUBBLES.map((bubble, index) => (
          <span
            key={index}
            className="aquarium-scene__bubble"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              "--bubble-rise": bubble.rise,
              "--bubble-opacity": bubble.opacity,
            }}
          />
        ))}
      </div>

      {decoration && (
        <div className={`aquarium-scene__decoration aquarium-scene__decoration--${decoration.id}`} aria-hidden="true" />
      )}

      {slots.map((slot, index) => {
        const position = POSITION_CLASSES[index] ?? POSITION_CLASSES[POSITION_CLASSES.length - 1];
        return (
          <CharacterSlot
            key={index}
            slot={slot}
            floatClassName={position.float}
            tapClassName={position.tap}
            onHarvest={onHarvest}
            onDragEnterHarvest={handleDragEnterHarvest}
            isDraggingRef={isDraggingRef}
          />
        );
      })}
    </div>
  );
}
