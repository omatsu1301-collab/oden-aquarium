# IMPLEMENTATION_STATUS — 7画面・遊べる完成版(v2)

このファイルは`docs/07_PLAYABLE_V2_SPEC.md`(実装指示書)の進捗を記録する。
コンテキストが切り替わった場合は、まずこのファイルを読んでから再開すること。

- ブランチ: `feature/playable-ui-v2`
- 直近のベースmain SHA: `64f9797eca04d8a79f352d6766b427ac47de86d5`(PR #7、Gate D受入記録)
- 参考画像: `references/ui-v2/01-aquarium.png` 〜 `07-shop-night.png`(既存`references/`直下の
  キャラクター原画とは別物、混同しないこと)

## 状態: 実装・検証完了、PR作成待ち

7画面すべてが実データで動作し、単体テスト69件・Playwright統合テスト37件・lint/build/
verify:deriveすべて成功。次のアクションはPR作成→CI確認→通常merge→Pages公開確認。

## 完了

### 1. 調査/ブランチ/画像配置/spec保存
- `feature/playable-ui-v2`ブランチ作成、`references/ui-v2/`に7枚配置(既存原画は無変更)
- `docs/07_PLAYABLE_V2_SPEC.md`に実装指示書全文を保存

### 2. データ層(`src/data/`)
具材5種・出汁6種・鍋4種・道具4種・おたすけ4種・飾り8種(計26商品)・お願い6件・
おたより3件の固定データ。`shopCatalog.js`で横断lookup。

### 3. ゲームエンジン(`src/game/`)
- `engine.js`: `advanceGame` — ブレイクポイント方式の区分求積(効果終了/残量ゼロ/
  スロット出生の各時刻で区切る)。時計後退は経過0。長期離席でも有限回で終了。
- `actions.js`: `applyAction` — 収穫/購入/装備(出汁・鍋・道具・飾り・器)/おたすけ使用/
  補充/お気に入り/お願い受取/おたより既読/設定変更。
- `migration.js`: 旧`derive.js`を変更せずv1→v2移行。
- `validate.js`: 既知ID・範囲・重複ID等を検証し、未知フィールドを混ぜない。

### 4. 保存(`src/storage/`)
- `persistence.js`: v2読み込み/保存/移行。schema不明・JSON不正は上書きしない
  (`status:"corrupt"`)。`peekStoredRevision`で、pagehide/visibilitychange時の保存が
  破損データ・他タブのより新しいrevisionを無条件上書きしないガードを実装。
- `backup.js`: JSONバックアップの組み立て/検証(容量上限1MB・appId・formatVersion・
  未来バージョン拒否・v1生データからの復元も許可)。
- `gameLock.js`: Web Locksを優先し、非対応環境は単一アクティブタブlease方式。

### 5. UI(`src/AppShell.jsx`, `src/screens/`, `src/ui/`, `src/components/`)
- AppShell: hashルーティング(水槽/図鑑/商店、タブ切替はreplaceState) + Sheetの
  browser back連携(パネルはpushState、閉じるはhistory.back())。お世話/お願い・
  おたより/設定/具材詳細/商品詳細のすべてがこの機構に統合済み。
- 水槽: 既存の背景/浮遊/タップ反応(CSS keyframe)を再利用しつつ、スロット位置に
  動的な育成データを接続。なぞっての連続収穫、収穫の残像演出(データ確定→見た目だけ
  の残像)、未成熟タップの名前/進行表示、6枠目(深い土鍋)の追加位置。
- 図鑑: 夜の屋台背景(`NightBackdrop`、SVG/CSS製)+ 共通`Bowl`部品(一覧/詳細で共用)。
  具材詳細(生態文・染め記録6出汁・器変更・お気に入り)。
- 商店: 5タブ26商品 + 商品詳細シート(購入/装備/使用/飾る、残高不足の表示)。
- お世話・お願い/おたより(2タブ)・設定(音量/振動/動き低減/バックアップ/復元/
  遊び方/クレジット)パネル。
- 保存データ破損時の復旧画面(自動初期化しない、バックアップ復元 or 明示確認後の新規開始)。
- Web AudioによるオリジナルBGM(和音ドローン)/SE(タップ・収穫・購入)、初回操作後に開始。
- `?debug=1`は本番と別のstorageKey(`oden-aquarium/debug-save`)で動作する専用ストアを
  使用し、本番データを一切汚染しない。デバッグパネルは既定折りたたみ(BottomNav/上部
  アイコンを塞がない)。

### 6. テスト
- `vitest`: 69件(engine/actions/migration/validate/quests-letters/rng/backup/persistence)
- Playwright(ローカルpreviewサーバー、`/oden-aquarium/`サブパス): 37件
  - 初回収穫・図鑑登録・図鑑詳細・お気に入り・染め記録
  - 商店購入/装備・残高不足表示・おたすけ購入/使用
  - お願い受取(重複不可)・おたより既読化
  - 器の所有/未所有・深い土鍋6枠拡張/縮小・なぞり収穫
  - 動き低減の実効(data-motion属性 + 実アニメーション停止確認)・320/360/390/430/
    デスクトップ幅でのレイアウト
  - 設定バックアップダウンロード→データ破損→復旧画面→ファイル選択復元のE2Eフロー
  - v1→v2自動移行・壊れたlocalStorageで復旧画面(上書きしない)
  - 複数タブ同時操作でも二重収穫されない(Web Locks)
  - 全シートでブラウザ「戻る」がパネルを閉じ、アプリ外へ遷移しない
  - Enterキーでの収穫(キーボード操作)
  - console error/404なし
- 既存`npm run verify:derive`・`npm run lint`・`npm run build`すべて成功

## 開発中に発見・修正した不具合(4件)

1. `AppShell`の早期return順序により、保存データ破損時にcorrupt画面へ到達できず
   loading画面のまま止まっていた。
2. 図鑑グリッドで、詳細シートの開閉後にBowl部品が画面いっぱいの巨大な円へ崩れる
   CSSバグ(grid/flexアイテムの既定`min-width:auto`とaspect-ratioの組み合わせ)。
3. 図鑑/商店ヘッダーでNightBackdropの提灯とタイトル文字が重なる表示崩れ。
4. `pagehide`/`visibilitychange`時の保存が、破損データ・他タブのより新しい書き込みを
   無条件に上書きしてしまう複数タブ安全性の欠陥。

## 未着手・既知の制限

- 具材詳細/商品詳細シートは統合済みだが、図鑑の「まだ出会っていません」ヒントSheetは
  ローカルstateのみ(ブラウザ戻る非連動)。表示時間が短い軽量な情報表示のため許容範囲と
  判断(仕様6.1の「入れ子は内部stateで良い」の精神に近い)。
- 実機スマートフォンでの確認は本セッションでは実施できない(環境上の制約)。
- 公開URL(GitHub Pages)そのものの到達確認は、本セッションのネットワークポリシー上
  実施できない(`*.github.io`が遮断されている)。

## 次のアクション

1. PR作成(`feature/playable-ui-v2` → `main`)
2. CI確認
3. 条件を満たせば通常merge
4. Pages workflowの成功確認
5. 完了報告(実装範囲・判断した仕様・テスト/画像の場所・ブランチ/コミット/PR・
   デプロイ状態・未確認事項)
