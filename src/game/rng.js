// 保存seedを更新する純粋な乱数関数(mulberry32)。Date.now()/Math.randomへは依存しない。
export function stepRng(seed) {
  let a = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), a | 1);
  t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, nextSeed: a };
}

// 起動時など、新しいseedが必要な場合にのみ使う非純粋な生成(ゲーム進行のロジックには使わない)。
export function createFreshSeed() {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) | 0;
}
