// presentation層: dashiLevelをユーザー向けsoakProgressへ変換し、
// 大根の見た目をCSS変数として表現するためのstyleを組み立てる。
// derive/永続化には一切影響しない純粋関数のみで構成する。
import { DASHI_LEVEL_MAX, DASHI_LEVEL_MIN } from "../constants.js";

export const SOAK_PROGRESS_MIN = DASHI_LEVEL_MIN;
export const SOAK_PROGRESS_MAX = DASHI_LEVEL_MAX;

// 現行のdashiLevel(0=入りたて/100=染み染み、時間経過で増加)は、
// soakProgressと方向・スケールが既に一致しているため恒等変換で足りる
// (DECISION_FREEZE / Step0で確認済み)。
export function deriveSoakProgress(dashiLevel) {
  return dashiLevel;
}

// soakProgress(0-100)から、大根の見た目をCSS変数(--soak-t: 0〜1)として返す。
// 実際の色変化(grayscale/saturate/brightness)はCSS側(AquariumScene.css)で定義する。
export function getSoakVisualStyle(soakProgress) {
  const t = (soakProgress - SOAK_PROGRESS_MIN) / (SOAK_PROGRESS_MAX - SOAK_PROGRESS_MIN);
  return { "--soak-t": t };
}
