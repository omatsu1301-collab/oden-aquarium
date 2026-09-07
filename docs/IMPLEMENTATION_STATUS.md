# IMPLEMENTATION_STATUS — 7画面・遊べる完成版(v2)

このファイルは実装指示書群の進捗を記録する。コンテキストが切り替わった場合は、
まずこのファイルを読んでから再開すること。

**注記(Instruction 9時点)**: 以下の「7画面・遊べる完成版(v2)」セクションはPR #8として
`main`へマージ済み(merge SHA `c5a10fb5506a63c14f6b7fa8dff7baf0117d587d`、deploy run #19
成功確認済み)。このセクション内の「PR作成待ち」等の記述は過去の実施時点の記録であり、
現在の状態ではない。現在の作業は本ファイル末尾の「美術改善パス1」セクションを参照。
過去の検証記録は履歴としてそのまま残す。

- ブランチ: `feature/playable-ui-v2`(マージ済み)
- 直近のベースmain SHA(当時): `64f9797eca04d8a79f352d6766b427ac47de86d5`(PR #7、Gate D受入記録)
- 参考画像: `references/ui-v2/01-aquarium.png` 〜 `07-shop-night.png`(既存`references/`直下の
  キャラクター原画とは別物、混同しないこと)

## 状態: マージ・デプロイ完了(過去の記録)

7画面すべてが実データで動作し、単体テスト69件・Playwright統合テスト37件・lint/build/
verify:deriveすべて成功。PR #8作成→mainへ通常merge→deploy run #19成功まで完了済み。

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

---

# 美術改善パス1(Instruction 9) — だし水槽+お世話

- ブランチ: `feature/tank-care-art-pass-1`
- ベースmain SHA: `4ba8e851ca4fb064b167b3afa764c1df68389741`
  (PR #8マージSHA `c5a10fb5` + ユーザーによる5マスター画像追加コミット)
- 状態: 実装・検証完了、Draft PR作成待ち(**merge・deployは行わない**。ユーザーの美術採否待ち)

## 採用済み5素材と本番化

`references/broth-kombu-master.png`ほか4点(1254×1254、RGBA)から、`cwebp -q 88 -alpha_q 100
-exact`で透過WebPを生成し`public/assets/items/`へ出力。原画は無変更。

| ファイル | サイズ | 容量 |
|---|---|---|
| `broth-kombu.webp` | 512×512 | 32,774 bytes |
| `assist-drop.webp` | 384×384 | 18,892 bytes |
| `assist-rich-drop.webp` | 384×384 | 21,384 bytes |
| `assist-care.webp` | 384×384 | 24,446 bytes |
| `assist-long-care.webp` | 384×384 | 25,394 bytes |
| 合計 | | 約132KB |

いずれもアルファチャンネル・透明余白を保持、黒/白背景の焼き込みなし(`identify`で確認)。
64px縮小プレビューでも輪郭・透明感が読めることを確認済み。

## 新規コンポーネント/データ

- `src/icons/Icons.jsx`: 共通線画SVGアイコン10種(海藻/封筒/歯車/きらめき/おたま/開いた本/
  丸い水の器/暖簾/時計/閉じる)。viewBox 0 0 24 24、currentColor、線幅1.8、round cap/join。
- `src/data/itemImages.js`: 商品ID→画像URLの解決を一か所に集約(未登録IDはnullを返す)。
  純粋関数の意味のある分岐(登録済み/未登録)を`src/data/__tests__/itemImages.test.js`で検証。
- `src/components/BrothVessel.jsx`: 出汁IDから表示素材を解決する器コンポーネント。昆布だしは
  本番画像、それ以外は無地の陶器SVG(液面を出汁の`glow`色で着色、絵柄は捏造しない)。
- `src/components/ItemImage.jsx`: 商品画像の装飾表示(空alt+aria-hidden、サイズはCSS側で制御)。

## 変更画面

- `src/screens/TankScreen.jsx/.css`: ブランド(🌿→海藻icon)、封筒/設定ボタン(丸→少し角丸の
  乳白色パネル、柔らかい縁・影)、状態欄(✨→きらめきicon、文字サイズをvar(--font-body)へ)、
  お世話ボタン(🥄→おたまicon)。背景/浮遊/具材配置/タップ反応は無変更。
- `src/screens/CareSheet.jsx/.css`: 出汁ゲージを`BrothVessel`に接続(390px:132px相当、
  360px以下:108px相当、二列→補充ボタンは狭幅で次行へ)。おたすけ4商品を`ItemImage`で
  接続(drop系56px相当/care系64px相当)。無効理由の短い補足(未所持/同系統を使用中/
  出汁を足してから使えます)を追加。無効時もボタンだけを薄くし、行全体は読める状態を維持。
  効果時間表示を時計iconへ。カードの強い浮遊影を減らし、区切り線+余白で整理。
- `src/ui/BottomNav.jsx/.css`: 📖/🍶/🏮→共通icon。非選択色を`#5c4324`へ(視認性向上)。
- `src/ui/Sheet.jsx/.css`: 閉じるボタンを×文字→CloseIcon。`icon` propは既存通り
  ReactNode/文字列どちらも受け付ける(他画面の絵文字呼び出しは無変更のまま動作)。
- `src/styles/tokens.css`: `--color-text-muted`を`#8a6a44`→`#6b4f30`へ(コントラスト改善)。
  サイズ・余白トークンは無変更。図鑑/商店/設定のレイアウトが崩れないことをスクリーンショットで確認済み。

## 明示的に維持した範囲(無編集)

`src/components/AquariumScene.jsx/.css`、`src/components/Character.jsx`、
`src/presentation/soakVisual.js`、`src/game/`、`src/storage/` — いずれも無変更。
がんもの成長色(soak visual)、キャラクター配置サイズ差、収穫/経済/保存ロジックは対象外のまま。

## 検証結果

- `npm test`(vitest): 73件成功(既存69件+今回追加4件)
- `npm run verify:derive` / `npm run lint` / `npm run build`: すべて成功
- 既存Playwright回帰スイート(37件、v1機能検証+history連携+複数タブ+レスポンシブ)を
  再実行し全件成功(今回の変更で機能を壊していないことを確認)
- 本番base pathでpreviewし確認: console errorなし、画像404なし、WebPが実際に描画される、
  透明背景が正しい、`?debug=1`が本番保存キー(`oden-aquarium/save`)を汚染しない
  (別キー`oden-aquarium/debug-save`のみ操作)、補充操作・4商品の使用/無効/使用中状態・
  商店への導線・BottomNav・Sheetの各閉じ方(×クリック/背景タップ/Escape/ブラウザ戻る)・
  リロード後の状態維持、すべて動作確認済み
- `git diff --stat`で意図しない変更(ゲーム/保存/成長色/キャラクター配置)がないことを確認済み

## スクリーンショットの場所

このセッションのスクラッチパッド(`/tmp/claude-0/-home-user-oden-aquarium/
ce690091-7eb7-5a43-9562-f434e3c790e3/scratchpad/`)に保存。PRへの添付は行っていない。

- `art1-01-tank-390.png`: 390×844 通常のだし水槽
- `art1-02-care-top-390.png`: 390×844 お世話パネル上部(昆布だし・残量42%・4商品・
  お留守番だし使用中・残り時間表示)
- `art1-03-care-bottom-390.png`: 390×844 お世話パネル下部(スクロール後)
- `art1-04-care-360.png`: 360×640 お世話パネルの狭幅確認(二列+補充ボタン折り返し)
- `art1-05-tank-390.png`は上記01と同一、`art1-05-tank-430.png`/`art1-05b-care-430.png`:
  430×932 通常のだし水槽+お世話
- `art1-06-care-katsuo-390.png`: かつおだし装備時、昆布の絵柄が誤表示されず無地の
  陶器SVG(琥珀色)になることを示す1枚

## 未確認事項

- 実機スマートフォンでの確認(本セッションでは実施不可)
- おたまアイコンの視認性: 20px前後の小サイズでは意匠の判別がやや難しい可能性があり、
  ユーザーの美術採否で確認してほしい点(下記「ユーザーが見るべき美術判断点」参照)

## Draft PR

作成後にURLを追記する。
