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
- ベースmain SHA(当初): `4ba8e851ca4fb064b167b3afa764c1df68389741`
  (PR #8マージSHA `c5a10fb5` + ユーザーによる5マスター画像追加コミット)
- ラウンド2で取り込んだmain: `a2f39f67cc67291b3e7c0a1fb71b9a787f16d262`
  (`references/broth-neutral-master.png`追加、通常mergeで取り込み・force push無し)
- 状態: 実装・検証完了、Draft PR #9を更新済み(**merge・deployは行わない**。ユーザーの美術採否待ち)

## 採用済み6素材と本番化

`references/broth-kombu-master.png`ほか5点(すべて1254×1254、RGBA)から、`cwebp -q 88
-alpha_q 100 -exact`で透過WebPを生成し`public/assets/items/`へ出力。原画は無変更。

| ファイル | サイズ | 容量 |
|---|---|---|
| `broth-kombu.webp` | 512×512 | 32,774 bytes |
| `broth-neutral.webp`(ラウンド2で追加) | 512×512 | 27,636 bytes |
| `assist-drop.webp` | 384×384 | 18,892 bytes |
| `assist-rich-drop.webp` | 384×384 | 21,384 bytes |
| `assist-care.webp` | 384×384 | 24,446 bytes |
| `assist-long-care.webp` | 384×384 | 25,394 bytes |
| 合計 | | 約160KB |

いずれもアルファチャンネル・透明余白を保持、黒/白背景の焼き込みなし(`identify`で確認)。
64px縮小プレビューでも輪郭・透明感が読めることを確認済み。

## 新規コンポーネント/データ

- `src/icons/Icons.jsx`: 共通線画SVGアイコン10種(海藻/封筒/歯車/きらめき/おたま/開いた本/
  丸い水の器/暖簾/時計/閉じる)。viewBox 0 0 24 24、currentColor、線幅1.8、round cap/join。
  共通`Icon`が`...svgProps`を実svg要素へ引き継ぐよう修正済み(ラウンド2、下記参照)。
- `src/data/itemImages.js`: 商品ID→画像URLの解決を一か所に集約。
  純粋関数の意味のある分岐を`src/data/__tests__/itemImages.test.js`で検証。
- `src/components/BrothVessel.jsx`: 出汁IDから表示素材を解決する器コンポーネント。
- `src/components/ItemImage.jsx`: 商品画像の装飾表示(空alt+aria-hidden、サイズはCSS側で制御)。

## 変更画面(ラウンド1)

- `src/screens/TankScreen.jsx/.css`: ブランド(🌿→海藻icon)、封筒/設定ボタン(丸→少し角丸の
  乳白色パネル、柔らかい縁・影)、状態欄(✨→きらめきicon、文字サイズをvar(--font-body)へ)、
  お世話ボタン(🥄→おたまicon)。背景/浮遊/具材配置/タップ反応は無変更。
- `src/screens/CareSheet.jsx/.css`: 出汁ゲージを`BrothVessel`に接続。おたすけ4商品を
  `ItemImage`で接続(drop系56px相当/care系64px相当)。無効理由の短い補足(未所持/
  同系統を使用中/出汁を足してから使えます)を追加。無効時もボタンだけを薄くし、行全体は
  読める状態を維持。効果時間表示を時計iconへ。カードの強い浮遊影を減らし、区切り線+余白で整理。
- `src/ui/BottomNav.jsx/.css`: 📖/🍶/🏮→共通icon。非選択色を`#5c4324`へ(視認性向上)。
- `src/ui/Sheet.jsx/.css`: 閉じるボタンを×文字→CloseIcon。`icon` propは既存通り
  ReactNode/文字列どちらも受け付ける(他画面の絵文字呼び出しは無変更のまま動作)。
- `src/styles/tokens.css`: `--color-text-muted`を`#8a6a44`→`#6b4f30`へ(コントラスト改善)。
  サイズ・余白トークンは無変更。図鑑/商店/設定のレイアウトが崩れないことをスクリーンショットで確認済み。

## ラウンド2で対応した修正(ユーザー指摘の実画面確認結果)

1. **共通無地陶器の本番化**: `broth-neutral-master.png`を`broth-neutral.webp`(512×512)へ
   変換。`getBrothImageUrl`を「kombu→専用画像、それ以外→broth-neutral.webp」という
   常にURLを返す実装へ簡素化し、今後専用画像を追加する際は`BROTH_IMAGE_FILE`へ1行
   追加するだけで済む構造を維持。
2. **簡易SVGフォールバックの完全削除**: `BrothVessel.jsx`から`<svg>`分岐・`getBroth`依存を
   削除し、常に`<img>`を返す実装へ。`aria-hidden`+`role="img"`同時指定の問題も解消(該当
   コード自体を削除)。
3. **共通Iconのprops引き継ぎ修正**: `Icon`コンポーネントが`aria-hidden`等を実svgへ
   渡していなかったバグを修正。`{children, className, size, style, ...svgProps}`を
   分解し、`style`は`{...style, pointerEvents:"none"}`でマージ(pointer-events:noneを
   必ず維持)、`svgProps`をsvg要素へ展開。
4. **おたまアイコンの再設計**: 円+斜め線(虫眼鏡)、次に円+斜め線+丸(鍵/風船に近い)と
   試行錯誤した結果を破棄し、直線の縁+丸い底のD字型受け皿+右上へ長く伸びる柄という
   構成へ変更。柄先に独立した丸(穴)は付けない。
5. **設定アイコンの再設計**: 円+8方向の細い光条(太陽/明るさに見える)だったものを、
   半径6の輪に直接接する短い歯(8方向)+中心の穴という歯車の定番構成へ変更。
6. **390pxのお世話カード修正**: 二列レイアウトへの切替を`max-width:374px`から
   `max-width:409px`へ拡大し、390pxでも360pxと同じく補充ボタンがカード下段全幅へ
   回るよう修正(430pxは従来通り横一列を維持)。「昆布だし」「かつおだし」が
   縦に分断される問題を解消。

## 明示的に維持した範囲(無編集)

`src/components/AquariumScene.jsx/.css`、`src/components/Character.jsx`、
`src/presentation/soakVisual.js`、`src/game/`、`src/storage/` — いずれも無変更。
がんもの成長色(soak visual)、キャラクター配置サイズ差、収穫/経済/保存ロジック、
既存の360px/430px基本レイアウト、BottomNavの構造は対象外のまま。

## 検証結果

- `npm test`(vitest): 74件成功(ラウンド1の73件+商品画像パス解決のBASE_URL検証1件)
- `npm run verify:derive` / `npm run lint` / `npm run build`: すべて成功
- 既存Playwright回帰スイート(37件)を再実行し全件成功
- ラウンド2追加検証(15件、Playwright)すべて成功:
  昆布→broth-kombu.webp/かつお→broth-neutral.webpの出し分け、通常経路でSVG非表示、
  Iconのaria-hidden実DOM反映とpointer-events維持、390pxで補充ボタン下段全幅・
  430pxで横一列、4商品の使用可/無効/使用中表示、水槽/図鑑/商店/設定操作での
  console error・404なし、通常URLでdebug保存キーが作られない、360px/430pxで
  横スクロールなし
- `dist/assets/items/`に`broth-neutral.webp`を含む6点すべて確認、
  `references/*master*`のdistへの混入なしを確認
- `git diff --stat origin/main...HEAD`で意図しない変更
  (ゲーム/保存/成長色/キャラクター配置)がないことを確認済み

## スクリーンショットの場所

このセッションのスクラッチパッド(`/tmp/claude-0/-home-user-oden-aquarium/
ce690091-7eb7-5a43-9562-f434e3c790e3/scratchpad/`)に保存。PRへの添付は行っていない。

ラウンド2(最新版、こちらを参照):
- `art1r2-01-tank-390.png`: 390×844 通常のだし水槽
- `art1r2-07-icons-zoom.png`: 上部バーの拡大(海藻・封筒・新しい歯車アイコンを確認可能)
- `art1r2-02-care-top-390.png`: 390×844 お世話パネル上部(補充ボタンが下段全幅、
  「昆布だし」が分断されていないことを確認可能)
- `art1r2-03-care-bottom-390.png`: 390×844 お世話パネル下部(スクロール後)
- `art1r2-04-care-360.png`: 360×640 お世話パネルの狭幅確認
- `art1r2-05-tank-care-430.png` / `art1r2-05b-care-430.png`: 430×932
  通常のだし水槽+お世話(横一列を維持していることを確認可能)
- `art1r2-06-care-katsuo-neutral-390.png`: かつおだし装備時、broth-neutral.webp
  (昆布版と同じ美術品質の無地陶器)が表示されることを示す1枚

ラウンド1(参考、`art1-*.png`)は保持済み。

## 未確認事項(採用後も残る事項)

- 実機スマートフォンでの確認(本セッションでは実施不可)
- 昆布以外の出汁の専用イラストは今後の商店美術工程で検討(現状は無地陶器で代替、採用済み)

## ユーザー採用記録

ユーザーがPR #9の内容を「採用」と明示。採用範囲は以下の通り(それ以外の機能・美術・
ゲームバランスは今回変更しない)。

- 水槽画面
- お世話画面の360px・390px・430pxレイアウト
- 昆布だし器(`broth-kombu.webp`)
- 昆布以外に使用する共通無地陶器(`broth-neutral.webp`)
- おたすけ4商品画像(`assist-drop.webp`/`assist-rich-drop.webp`/`assist-care.webp`/
  `assist-long-care.webp`)
- 再設計したおたま・歯車アイコン

維持(変更しない)ことも明示的に確認済み:

- がんもの成長色(`soakVisual`)
- キャラクターの既存サイズ差(配置枠に起因するもの)
- 正式な個体差システムは引き続き検討候補とし、今回は実装しない

この採用を受け、PR #9をDraft→Ready→`main`へ通常mergeし、Pages deployの成功を
確認する(下記参照)。

## PR #9 クローズ結果

- 状態: merged、Pages deploy成功。**美術改善パス1は完了。**
- merge SHA: `e660c61f4f792dde995ef42558de021adc1be73c`
- deploy run: #22 (id `34123570326`)、conclusion: `success`
  (https://github.com/omatsu1301-collab/oden-aquarium/actions/runs/34123570326)
- 公開URL: https://omatsu1301-collab.github.io/oden-aquarium/
  (本セッションのネットワークポリシー上、直接到達確認は不可。Actions成功のみ確認)
- 未確認事項: 実機スマートフォンでの確認(本セッションでは実施不可)

## 美術改善パス2「図鑑＋具材詳細」(`docs/10_CATALOG_DETAIL_ART_PASS_2.md`)

- branch: `feature/catalog-detail-art-pass-2`
- base SHA(作業開始時の最新main): `46b993c7febc09e80dffbf4055c4060242313bfb`
  (PR #9 merge + `docs/10_...md`・マスター5点追加を含む、fetch/merge済みの最新main)
- head SHA: 本ドキュメント更新時点のcommit(下記コミット一覧を参照。Draft PR作成後にPR側で確認)

### master → production asset 対応

| master(references/ui-v2/) | production(public/assets/) | 寸法 | 容量 |
|---|---|---|---|
| `catalog-night-bg-master.png` (852x1847, RGB) | `backgrounds/catalog-night.webp` | 852x1847 | 120K |
| `bowl-white-master.png` (1254x1254, RGBA) | `bowls/bowl-white.webp` | 768x768 | 40K |
| `bowl-indigo-master.png` (1254x1254, RGBA) | `bowls/bowl-indigo.webp` | 768x768 | 48K |
| `bowl-cat-master.png` (1254x1254, RGBA) | `bowls/bowl-cat.webp` | 768x768 | 40K |
| `bowl-black-master.png` (1254x1254, RGBA) | `bowls/bowl-black.webp` | 768x768 | 52K |

production合計: 約300K。`cwebp -alpha_q 100 -exact`で変換し、変換後に寸法・アルファ(4器とも
`alpha=True`)・四隅の透明(`srgba(0,0,0,0)`)・黒/白背景の焼き込みがないことを確認済み。
`dist/`ビルド後、上記5点のみが含まれ、`references/*master*`は含まれないことも確認済み
(`find dist -iname "*master*"` = 0件)。マスターは`references/`に無変更で保持。

### 変更範囲

- `src/components/Bowl.jsx` / `Bowl.css` — 4種の小鍋WebPを実画像として表示し、旧CSS円形rim/handleを
  本番表示の主体から外した。キャラクターは出汁面中心付近(目視計測でcx≈50%, cy≈41%)へ配置。
  species別の表示調整は`CHARACTER_ADJUST`定数へ集約(現状はchikuwa/shiratakiのみ軽微なscale調整、
  他はデフォルト)。`size="small"/"large"`APIは維持。未発見は常に`bowl-white`+出汁面中央の`?`。
- `src/data/bowlImages.js`(新規) — 4器IDの固定resolver。`import.meta.env.BASE_URL`必須、
  未知IDは`bowl-white`へfallback(新しい正式商品として扱わない)。単体テスト3件を追加。
- `src/components/CatalogNightBackdrop.jsx` / `.css`(新規) — 図鑑専用の夜背景。
  `.catalog-screen__content`(スクロールする実コンテンツ)の内側に配置し、コンテンツと同じ高さへ
  伸びることで、画像より内容が長い場合は自然に木色(`#4a2410`)で延長される設計。
  既存`NightBackdrop`/`ShopScreen`は無変更。
- `src/screens/CatalogScreen.jsx` / `.css` — タイトル/発見数をアイボリー系カードへ分離、
  黒いピル名前表示を木札風の名札(左右に鋲風ドット)へ変更、旧6枠目の暗い円形placeholderを削除
  (5体目の右は自然な空き棚)、旧`padding-left: max(15%, 64px)`(提灯回避用)を新背景に合わせて撤去、
  カードのタップ領域を44px以上に維持、お気に入りハートをアイボリー地の丸バッジへ変更。
- `src/screens/SpeciesDetailSheet.jsx` / `.css` — 器選択に選択中インジケータ(視覚:枠線+背景色、
  アクセシビリティ:`aria-pressed`+ラベルへの✓付記)を追加。染め記録・器選択グリッドを360px幅でも
  テキストが潰れないよう調整。視線順序(No.→名前→小鍋→説明→基本記録→染め記録→器変更→お気に入り)
  は既存構造のまま維持。
- `docs/IMPLEMENTATION_STATUS.md` — 本セクション追記。
- `docs/10_CATALOG_DETAIL_ART_PASS_2.md` — 既存(今回の指示書、追加変更なし)。

### 明示的に維持した範囲(無変更)

`git diff --stat main`で確認済み。変更されたのは上記「変更範囲」の6ファイル+新規4ファイルのみ。
- `src/game/`・`src/storage/`・migration/validate/economy/purchase/equip/harvestロジック: 無変更
- `src/components/AquariumScene.jsx/.css`・`src/components/Character.jsx`・
  `src/presentation/soakVisual.js`: 無変更
- `src/components/NightBackdrop.jsx/.css`・`src/screens/ShopScreen.jsx/.css`: 無変更
  (商店は`art2-11-shop-unchanged-390.png`で夜背景・レイアウトが今回の変更前と同一であることを
  スクリーンショットで確認)
- `src/ui/Sheet.jsx/.css`: 無変更(Care/Letters/Settings/ShopItemDetailの見た目に影響なし)
- がんもの成長色・soakProgress・水槽内キャラクターの既存サイズ差・浮遊/泡/タップ反応・
  debug保存と通常保存の分離・商品数/価格/ゲーム速度/文章データ: すべて無変更
- 正式な個体差システム: 今回も未実装(Bowl内のCHARACTER_ADJUSTはpresentation専用の定数であり、
  ゲーム状態・個体データへは一切持ち込んでいない)

### テスト結果

- `npm test`: 10 test files / 77 tests すべてpass(新規`src/data/__tests__/bowlImages.test.js`
  3件を含む)
- `npm run verify:derive`: OK
- `npm run lint`(oxlint): エラー・警告なし
- `npm run build`: 成功。`dist/assets/bowls/`に4点、`dist/assets/backgrounds/catalog-night.webp`
  を確認。`references/*master*`の混入なし。
- Playwright回帰(scratchpad上のアドホックスクリプト、`npx vite preview`の本番サブパス
  `/oden-aquarium/`でdebug fixtureを使用): 図鑑未発見/発見済み(360/390/430px)・6枠目placeholder
  廃止・タップ領域44px・BottomNav非重なり・お気に入り反映・詳細シートの視線順序と初期表示・
  染め記録6種・器選択4種のURL解決とdisabled状態・商店での実購入フローによる所有反映・
  一覧への器変更反映・ブラウザ戻るでのシート閉鎖・商店/水槽/お世話/おたより/設定の横スクロール
  なし・通常URLでdebug保存キーを作成しないこと、を含む一連のチェックがすべてPASS。
  console error/warning 0件、asset 404等 0件。

### Visual evidence

ローカル保存のみ、PR未添付(このセッションのスクリーンショット添付手段が制限されているため)。
保存先(セッションscratchpad、repoへはコミットしていない):
`/tmp/claude-0/-home-user-oden-aquarium/ce690091-7eb7-5a43-9562-f434e3c790e3/scratchpad/`
- `art2-01-catalog-undiscovered-390.png` 〜 `art2-11-shop-unchanged-390.png`(指示書12章の11枚)

### 未確認事項

- 実機スマートフォンでの確認(本セッションでは実施不可)
- Playwright回帰はscratchpad上のアドホックスクリプトで実行しており、リポジトリへコミットした
  固定テストスイートではない(このリポジトリにPlaywrightは依存関係として導入されていないため)
- ユーザーへのスクリーンショット共有手段(SendUserFile等)が過去のやり取りで制限される場合が
  あったため、今回はまずscratchpadの正確なパスを報告する

### 状態

Draft PR、ユーザーの美術確認待ち。Ready化・mainへのmerge・Pages deployは未実施。
