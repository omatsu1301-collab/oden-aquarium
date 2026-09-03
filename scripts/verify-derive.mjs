// derive.js の簡易動作確認スクリプト(依存パッケージなしで実行可能)。
// 実行: npm run verify:derive
import {
  createInitialCharacterState,
  deriveDashiLevel,
} from "../src/logic/derive.js";
import { DASHI_SOAK_RATE_PER_HOUR, MS_PER_HOUR } from "../src/constants.js";

const failures = [];

function assertClose(actual, expected, message) {
  if (Math.abs(actual - expected) > 1e-9) {
    failures.push(`${message}: expected ${expected}, got ${actual}`);
  }
}

const t0 = 1_700_000_000_000;
const character = createInitialCharacterState(t0);

// 起動直後: まだ染み込んでいない
assertClose(deriveDashiLevel(character, t0), 0, "起動直後のdashiLevel");

// 6時間経過: 染み込み速度どおりに増加している
const sixHoursLater = t0 + 6 * MS_PER_HOUR;
assertClose(
  deriveDashiLevel(character, sixHoursLater),
  6 * DASHI_SOAK_RATE_PER_HOUR,
  "6時間経過後のdashiLevel",
);

// 十分に時間が経過: 上限100でクランプされる
const farFuture = t0 + 1000 * MS_PER_HOUR;
assertClose(deriveDashiLevel(character, farFuture), 100, "長時間経過後の上限クランプ");

// 時計が過去に戻された場合: 経過時間が負にならず、増加もしない
const past = t0 - MS_PER_HOUR;
assertClose(deriveDashiLevel(character, past), 0, "時計巻き戻し時のdashiLevel");

if (failures.length > 0) {
  console.error("NG:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("OK: derive.js のすべての検証が成功しました");
