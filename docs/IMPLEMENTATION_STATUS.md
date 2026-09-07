# IMPLEMENTATION_STATUS — 7画面・遊べる完成版(v2)

このファイルは`docs/07_PLAYABLE_V2_SPEC.md`(実装指示書)の進捗を記録する。
コンテキストが切り替わった場合は、まずこのファイルを読んでから再開すること。

- ブランチ: `feature/playable-ui-v2`
- 直近のベースmain SHA: `64f9797eca04d8a79f352d6766b427ac47de86d5`(PR #7、Gate D受入記録)
- 参考画像: `references/ui-v2/01-aquarium.png` 〜 `07-shop-night.png`(既存`references/`直下の
  キャラクター原画とは別物、混同しないこと)

## 完了

### 1. 調査/ブランチ/画像配置/spec保存
- `feature/playable-ui-v2`ブランチ作成
- `references/ui-v2/`に7枚配置(既存原画は無変更)
- `docs/07_PLAYABLE_V2_SPEC.md`に実装指示書全文を保存

### 2. データ層(`src/data/`)
- `species.js`: 既存5種類の固定データ(成長分数・収穫pt・生態文)
- `broths.js`: 出汁6種+重み付き抽選(`drawSpeciesId`)
- `pots.js`: 鍋4種
- `tools.js`: 道具4種
- `assists.js`: おたすけ4種
- `decorations.js`: 飾り8種(水槽用4+器用4)
- `quests.js`: お願い6件の静的定義
- `letters.js`: おたより3件の静的定義(本文はAI執筆)
- `shopCatalog.js`: 5売り場26商品の集約・横断lookup

### 3. ゲームエンジン(`src/game/`)
- `constants.js` / `rng.js`(mulberry32、純粋・seed引き継ぎ)
- `state.js`: v2初期状態生成(初期5スロット100/75/50/25/0、300pt、昆布だし、素焼き鍋)
- `engine.js`: `advanceGame(state, nowMs)` — ブレイクポイント方式の区分求積(効果終了/残量ゼロ/
  スロット出生時刻で区切って積分)。時計後退は経過0。長期離席でも有限回(最大256、実際は
  数〜十数回)で終了。
- `actions.js`: `applyAction(state, action, nowMs)` — 収穫/購入/装備/おたすけ使用/補充/
  お気に入り/お願い受取/おたより既読/設定変更
- `quests.js` / `letters.js`: 達成判定・解禁判定(累積統計ベース、表示開始時点から数えない)
- `selectors.js`: UI用派生値
- `validate.js`: v2セーブデータの構造検証(既知ID・範囲・重複ID等)。未知フィールドを
  無制限に混ぜない
- `migration.js`: v1→v2移行(旧`deriveDashiLevel`をそのまま利用、旧経過へ新速度を
  遡及適用しない、catalogは空のまま開始)

### 4. 保存(`src/storage/`)
- `persistence.js`: v2読み込み/保存、v1検出時はバックアップ(`oden-aquarium/save-v1-backup`)
  を確認してから移行、schema不明・JSON不正は`status:"corrupt"`を返し**上書きしない**
- `backup.js`: JSONバックアップの組み立て/検証(容量上限1MB・appId・formatVersion・
  未来バージョン拒否・v1生データからの復元も許可)
- `gameLock.js`: Web Locksを優先し、非対応環境は単一アクティブタブlease方式にフォールバック

### 5. テスト
- `vitest`をテスト専用devDependencyとして追加(`npm test`)
- `src/game/__tests__/`: engine(11)/actions(16)/migration(6)/validate(7)/quests-letters(6)/rng(3)
- `src/storage/__tests__/`: backup(6)/persistence(5)
- 全61件成功、既存`npm run verify:derive`・`npm run lint`とも成功

## 未着手(次にやること)

1. 共通UIシェル(AppShell/BottomNav/Sheet/CSS変数) — hashルーティング+パネルのhistory管理
2. 画面: 水槽(収穫UI・スロット表示・お世話導線・envelope/設定ボタン)
3. 画面: 図鑑(夜の屋台・棚・詳細シート・染め記録・器変更)
4. 画面: 商店(夜の道具屋・5タブ・26商品・購入/装備/プレビュー)
5. 画面: お世話パネル
6. 画面: お願い/おたよりパネル
7. 画面: 設定パネル(音・動き低減・バックアップ/復元・遊び方・クレジット)
8. 音: Web Audio BGM/SE(初回操作後にAudioContext開始)
9. 棚・暖簾・提灯・器・小鍋等のSVG/CSS制作(既存5体PNGは再利用、参考PNGはpublicに配信しない)
10. Playwright統合テスト・7画面スクリーンショット(360/390/430px)・レスポンシブ確認
11. lint/build/verify全通し・commit/push/PR作成・CI確認・通常merge・deploy確認・最終報告

## 既知の設計判断(仕様上の明示委任に基づく)

- 個体の識別は`instanceId`(育成中のみ)。収穫後は`empty-waiting`となりinstanceIdを失う。
  UI側はスロットの配列インデックスで位置を追跡する。
- 鍋の枠数変更時、超過分は「育成中/空き待ちを問わず」末尾から`retiring`フラグを付け、
  収穫(または空き待ちの自然消化)まで残してから補充しない。フラグは変更のたびに再計算する。
- 灯り(lamp)のpity判定は「抽選時点の図鑑」を使う。収穫による図鑑更新は同一トランザクション
  内で先に適用してから次個体を抽選する。
- おたよりは配信サーバーを持たず、`game/letters.js`のローカル条件で解禁する
  (welcome/catalog-complete/first-purchaseの3種、ID固定)。
