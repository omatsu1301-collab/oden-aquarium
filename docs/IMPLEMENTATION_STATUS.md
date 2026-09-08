# IMPLEMENTATION_STATUS — 7画面・遊べる完成版(v2)

このファイルは実装指示書群の進捗を記録する。コンテキストが切り替わった場合は、
まずこのファイルを読んでから再開すること。

**注記(Phase 1.5時点)**: PR #11「コアループの手触り改善パス1」は公開版(GitHub Pages)で
ユーザーが手触り3項目を確認し、2026-09-08に次の値を正式採用した。**PR #11は完全完了。**

- 個別ポイント表示: 1.5秒
- 連続収穫toast: 2.0秒
- 補充待ち: 25〜95秒(期待値60秒)

詳細な実装内容・監査対応・merge記録は本ファイル内の「コアループの手触り改善パス1」
セクションおよび「PR #11 監査対応」を参照。現在の作業はさらに後続のセクション
(Vercel PR Preview環境構築など)を参照。過去の検証記録は履歴としてそのまま残す。

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

### 状態(採用前)

Draft PR、ユーザーの美術確認待ち。Ready化・mainへのmerge・Pages deployは未実施。

### ユーザー採用記録(2026-09-07)

ユーザーが2026-09-07、このチャットで「採用。」と明示した(事実どおり記録。発言内容の脚色はしない)。
共有した図鑑・具材詳細・未発見状態・白/藍/ねこ/黒釉の小鍋・360px表示・商店非波及のスクリーン
ショットを確認したうえでの採用。

採用対象:

- 夜のおでん屋台背景と図鑑UI
- 木棚に並ぶ5体と小鍋の構図
- 未発見時の白い小鍋＋`?`
- 白・藍・ねこ・黒釉の4器
- 具材詳細の情報量と眺める余白
- 360px・390pxのレイアウト(430×932のPlaywright検証成功記録と流動レイアウトも監査済み)
- 商店へ美術変更を波及させない分離設計

美術確認は完了。画像共有時に生じた重複表示は配信経路側の問題として扱い、実装上の問題とは
みなさない(追加の美術修正・再撮影・再確認は行わない)。

この採用を受け、PR #10をDraft→Ready→`main`へ通常merge(squash/rebaseは使わない)し、
Pages deployの成功を確認する工程へ移行する(結果は以下「PR #10 クローズ結果」に追記)。

### PR #10 クローズ結果

- 状態: merged、Pages deploy成功。**美術改善パス2は完了。**
- PR #10 final head: `b4164191ef6b2c923f8eb05f4fbf96eef4696080`
- merge SHA: `0c6124fda8307c1b52e7b87aa0bc741512846109`
- deploy run: #26 (id `34135761931`)、conclusion: `success`
  (https://github.com/omatsu1301-collab/oden-aquarium/actions/runs/34135761931)
- build job / deploy job: ともに `completed / success`
- 公開URL: https://omatsu1301-collab.github.io/oden-aquarium/
- 未確認事項: 実機スマートフォンでの確認(ユーザーが任意で行う項目)

## コアループの手触り改善パス1(Instruction 11: 収穫ポイントの余韻＋補充リズム)

- branch: `feature/core-loop-feel-pass-1`
- base SHA(作業開始時の最新main): `0c6124fda8307c1b52e7b87aa0bc741512846109`(PR #10 merge、指示書記載のSHAと一致を確認)
- head SHA: `de5a104f91415a125f8e9b050fdaa88d5d906b42`(本ドキュメント追記時点。以降のコミットはDraft PR側で確認)

### 原因分析(着手前に現コードで確認した内容)

- `CharacterSlot`は`slot.status !== "growing"`になると早期returnで空き表示だけを返しており、
  収穫dispatch直後に同じスロットが`empty-waiting`へ変わるため、ローカルstateに残像
  (`afterimage`)を持たせていても表示領域ごと即座に消えていた。
- なぞり収穫は`AquariumScene`の`handleDragEnterHarvest`が`onHarvest`を直接呼ぶだけで、
  タップ/Enter・Spaceが通る`CharacterSlot`内の演出(残像・収穫SE)を経由していなかった。
- `src/game/actions.js`の収穫後補充と鍋拡張時の新規スロットが、どちらも固定
  `SPAWN_WAIT_MS(60秒)`を使っており、同時刻の連続収穫が同じ`spawnAt`になっていた。

### 実装した内容

**収穫経路の統一(仕様4章)**
- `Character.jsx`: タップ・Enter/Space・なぞりのすべてが`requestHarvest()`という同一のローカル
  関数を通るようにした。個別の`+N pt`演出(afterimage)は、`growing`分岐の外側(早期returnの前)
  で描画するよう変更し、スロットが`empty-waiting`へ変わっても演出だけは1.5秒間存続する。
- `AquariumScene.jsx`: 収穫の実処理(dispatch)・収穫SEの一回性・連続収穫集計・読み上げ用
  アナウンスを`onRequestHarvest`へ集約した。なぞり操作の二重処理防止(`draggedInstanceIdsRef`)
  は維持しつつ、実際の収穫効果は`CharacterSlot`側の統一関数を経由するようにした。

**個別の`+N pt`(仕様4.2)**
- 乳白(`rgba(255,250,235,.95)`)地に濃茶(`#4a2f12`)文字のピル表示へ変更し、明るい出汁背景でも
  読めるコントラストにした。
- アニメーションをポップイン(0-15%)→静止して読める区間(25-75%)→フェード(75-100%)の
  3段構成・合計1.5秒に変更(旧実装は650ms・動き続けるだけだった)。
- `data-motion="reduced"`では上昇・縮小を止め、同程度の読取時間のフェードのみにした
  (残像画像・ptピルの両方に個別のreduced-motion keyframeを追加)。

**連続収穫の合計(仕様4.3)**
- `src/presentation/harvestBatch.js`(新規)に、直前の収穫から800ms以内なら同じバッチへ
  加算し、それを超えれば新しいバッチとしてリセットする純粋関数`nextHarvestBatch`を実装。
  Reactのstate/タイマーに依存せず、時刻を引数で受け取るため単体テストで決定的に検証できる。
- `AquariumScene`は収穫のたびにこの関数を呼び、2体以上になった場合だけ
  「N体すくった　+M pt」toastを表示する。toast自体は最後の収穫から約2秒(`BATCH_TOAST_DISPLAY_MS`)
  で消え、新しいバッチは体数・合計0から再スタートする。表示位置は水槽上部(6%)で、
  上部アイコン・下部status bar・BottomNavのいずれとも重ならない。

**アクセシビリティ(仕様4.4)**
- `aria-live="polite"`の読み上げ領域(`visually-hidden`)を追加し、収穫のたびに
  「{具材名}をすくった、{pt}pt獲得」を流す。

**補充時刻のランダム分散(仕様5章)**
- `src/game/constants.js`: 固定`SPAWN_WAIT_MS`を`SPAWN_WAIT_MIN_MS(25秒)`/
  `SPAWN_WAIT_MAX_MS(95秒)`(期待値60秒)へ置換。
- `src/game/engine.js`: 既存の`stepRng`/`rngState`を使う決定的な`drawSpawnWaitMs(seed)`を追加
  (種族抽選とは別にseedを1回進める、`Math.random()`は不使用)。
- `src/game/actions.js`: 収穫後の補充(`harvestSlot`)と、より大きい鍋を装備したときの新規スロット
  (`equipPot`)の両方に同じ抽選を適用。`retiring`スロット(収穫時にそのまま消える)は
  wait抽選をスキップし、無駄にseedを消費しない。
- 保存済み`spawnAt`は絶対時刻のまま、schema versionもmigrationも変更していない。

### 自律判断した値と理由

- 個別`+N pt`のCSSアニメーション時間は仕様の目安(1.4〜1.6秒)の中央寄りである1.5秒に決定。
  合計toastの表示時間は「個別の余韻より少し長く保つ」という仕様の意図から2.0秒とした。
- 合計toastの表示位置(水槽上部6%)は、既存の`tank-screen__tutorial-hint`(40%付近)や
  上部アイコン・下部status barと重ならない位置として選定。両者が同時に出る場面は
  実際には発生しない(初回ハーベストで`tutorial.firstHarvestHintShown`が立ち、以降の
  複数収穫ではヒントは既に非表示のため)ことをコードで確認済み。
- `.aquarium-scene__{daikon,chikuwa,shirataki,konnyaku,ganmo,slot6}-float`へ
  `aspect-ratio: 1`を追加(自律判断・技術的な修正)。個別`+N pt`をafterimage側で
  描画し続けるようにした結果、育成中のボタンが無い(`empty-waiting`)状態ではこの
  位置決めdivの子要素が10px四方の`empty-hint`だけになり、明示的な`width`を持たない
  divの横幅がその10pxへ収縮していた(高さのみ%指定だったため)。これにより残像画像・
  ptピルの土台がほぼ0幅になっていた問題を、既存の5体全キャラクター画像が
  ほぼ正方形(実測684x700〜725x750等)であることを踏まえ、`aspect-ratio:1`で明示的に
  安定させることで解消した。育成中の見た目・浮遊アニメーション・既存配置は変更していない
  (視覚的な差はスクリーンショット比較で確認済み、数値も従来のshrink-to-fit幅とほぼ一致)。

### 変更していない重要領域

- がんもの成長色(`soakVisual`)・soakProgress、水槽内キャラクターの既存サイズ差、
  巨大こんにゃくにつながるサイズ挙動、AquariumSceneの背景・既存配置・浮遊keyframe・泡・
  未成熟タップ反応(いずれも数値は無変更、`aspect-ratio`追加のみ)。
- 5枠+深い土鍋6枠のcapacity、図鑑・具材詳細の採用済み美術、商店26商品・価格・
  所有/装備/消費ロジック。
- 保存・migration・validation・複数タブlock・debug保存分離(`spawnAt`は絶対時刻のまま、
  schema versionは無変更)。
- 正式な個体差システムは実装していない。
- growthMinutes・出汁倍率・残量消費・効果時間・収穫ポイント・商品価格は無変更。

### テストと最終件数

- `npm test`: 11 test files / **87 tests** すべてpass(内訳: 既存77件+今回追加10件
  [game層5件: `drawSpawnWaitMs`の決定性/範囲/seed進行/分散4件、同時収穫の分散を確認する
  actions.test.js 1件、presentation層5件: `nextHarvestBatch`の集計ロジック])
- `npm run verify:derive`: OK
- `npm run lint`(oxlint): エラー・警告なし
- `npm run build`: 成功

### Playwright等の回帰結果

scratchpad上のアドホックスクリプト(`/oden-aquarium/`本番サブパス+debug fixtureで実行、
既存運用どおり)で以下をすべて確認、全項目PASS:
- 5体をなぞって収穫し、wallet差分・合計toast(体数・合計pt)が正しい
- 収穫済みスロットへの再なぞり/追加クリックで二重加算・二重SEが起きない
- 5種それぞれの単体タップで正しい個別`+N pt`とwallet差分
- Enter/Spaceキーでも同じ結果
- 収穫直後・約1秒後もptが読める、合計toastは約2秒後に消える
- reduced motionでも`+N pt`が表示される(`data-motion="reduced"`を確認)
- 同時収穫後のspawnAtが25〜95秒の範囲内で分散し、固定値へ揃わない
- 時間経過で全スロットが正しく育成再開する
- 360×640/390×844/430×932で水槽・図鑑・商店・お世話・おたより・設定に横スクロールなし
- 通常URLでdebug保存キーが混入しない
- console error/warning 0件、asset 404等 0件

### 視覚証跡の場所

セッションscratchpad(repoへはコミットしない):
`/tmp/claude-0/-home-user-oden-aquarium/ce690091-7eb7-5a43-9562-f434e3c790e3/scratchpad/`
- `feel1-01-single-harvest-point-390.png` — 単体収穫直後の個別`+N pt`
- `feel1-02-batch-toast-390.png` — 5体なぞり後の合計toast(体数+合計pt)と各個体の`+N pt`
- `feel1-04-reduced-motion-390.png` — reduced motionでの`+N pt`表示

### 未確認事項

- 実機スマートフォンでの確認は本セッションでは実施不可
- Playwright回帰はscratchpad上のアドホックスクリプトで実行しており、リポジトリへコミットした
  固定テストスイートではない
- 25〜95秒という範囲値は第一パスの暫定採用値であり、体感確認後にユーザーが必要なら再調整する
  (仕様5.1に明記のとおり)

### 状態(監査前)

Draft PR、ユーザーの体感確認待ち。Ready化・mainへのmerge・Pages deployは未実施。

### PR #11 監査対応(Ready化前の技術修正)

全体設計・変更範囲・RNG・保存互換・テスト結果は問題なしとの監査結果を受け、Ready化前に
次の2点を修正した(commit `57e5204`)。

1. **同一instanceIdへの収穫要求を同期的に一度だけ通す**: `dispatch`は`withGameLock`経由の
   非同期処理のため、slot propsが更新される前に同じinstanceIdへ`requestHarvest()`が
   2回呼ばれると、game reducer側のwallet二重加算防止はあってもUI側の演出(afterimage・
   収穫SE・連続収穫集計)は2回分になりうる状態だった。`CharacterSlot`に
   `claimedInstanceIdRef`(直近でrequestHarvestを通したinstanceIdを覚える同期的なref)を
   追加し、同一instanceIdへの2回目以降の要求を`requestHarvest()`の先頭で無条件に無視する
   ようにした。タップ・Enter/Space・なぞりはすべて同じ`requestHarvest()`を通るため、
   3経路すべてに共通して効く。新しいinstanceId(次に来る個体)には影響しない。
2. **同一文言でもaria-liveが毎回更新されるようにする**: `announcement`をプレーンな文字列から
   `{id, text}`へ変更し、live region内の子要素を`key={id}`付きで毎回新規マウントするように
   した。同一species・同一ptを連続収穫してもテキストが変化せず読み上げられない、という
   懸念を解消しつつ、live region内は常に子要素1個のみを保つことで二重読み上げも防いでいる。

### 監査対応の回帰確認結果

scratchpadのアドホックPlaywrightスクリプトで以下をすべて確認、全項目PASS:
1. 同一成熟個体へネイティブDOM APIで同期的に2回click(`dispatchEvent`)を発火しても、
   wallet差分は+20(1回分)、`.aquarium-scene__afterimage`は1個のみ、`+N pt`表示も1回分
2. その操作で合計toast(「N体すくった」)が誤って表示されない
3. 異なる2個体の連続収穫は従来どおりwallet差分・合計toast(「2体すくった +44 pt」)が正しい
4. 同じ位置に新しい個体(新instanceId)が来れば正常に収穫できる(ガードが古いinstanceIdだけに
   効くことを確認。位置クラス名は座標であり種族固定ではないため、補充後の種族は抽選次第)
5. 同一species・同一pt(「ganmoをすくった、40pt獲得」)の収穫を2回連続で発生させ、
   `MutationObserver`でlive region内の`childList`変化を直接検証(mutations>=2を確認)。
   live region内の子要素数は常に1個(二重読み上げの懸念なし)
- 前回までの回帰スイート(`core-loop-feel-pass1-regression.mjs`)を再実行し、全項目引き続きPASS
- `npm test`(87 tests)/ `npm run verify:derive` / `npm run lint` / `npm run build`
  すべて引き続き成功(件数・結果に変化なし)

### 状態(監査後)

Draft PR、ユーザーの体感確認待ち。Ready化・mainへのmerge・Pages deployは未実施。

### ユーザー採用記録(技術面、2026-09-08)

ユーザーがGitHub上の最終head SHA・差分・Draft状態を確認し、手元でも`npm test`(87 tests)・
`npm run lint`・`npm run build`を再実行して成功したことを確認したうえで、「技術面は採用する」
と明示した。

ただし、本セッションのpreviewサーバー(`localhost:5199`)はこのクラウド上の隔離環境の中だけで
動いており、ユーザーのブラウザから到達できないため、ユーザーからアクセス可能なPR Preview環境が
まだ存在しない。そのため、次を明示的な例外条件としてクローズ工程へ進む。

- 手触り3項目(個別`+N pt`の読みやすさ・約1.5秒の余韻/複数収穫トーストの情報量・約2秒の余韻/
  25〜95秒の補充ばらつきの自然さ)の最終確認は、Pages deploy後の公開版
  (https://omatsu1301-collab.github.io/oden-aquarium/)で行う。
- 表示時間(個別`+N pt`の1.5秒・合計toastの2.0秒)と補充範囲(25〜95秒、期待値60秒)は、
  現段階では第一パスの暫定採用値のまま据え置く。公開版での確認後、ユーザーが必要と判断すれば
  再調整する(仕様5.1に明記の方針どおり)。

この記録を受け、PR #11をDraft→Ready→`main`へ通常merge(squash/rebaseは使わない)し、
Pages deployの成功を確認する工程へ移行する(結果は以下「PR #11 クローズ結果」に追記)。

### PR #11 クローズ結果

- 状態: merged、Pages deploy成功。
- PR #11 final head: `4d7d47e8ca478d152aa6a4810fdea378f4665238`
- merge SHA: `f1c6fd7d2e3c3c522730daacce9ea3dbeb2bf51d`
- deploy run: #27 (id `34188608229`)、conclusion: `success`
  (https://github.com/omatsu1301-collab/oden-aquarium/actions/runs/34188608229)
- build job / deploy job: ともに `completed / success`
- 公開URL: https://omatsu1301-collab.github.io/oden-aquarium/

### 手触り3項目の正式採用(公開版確認、2026-09-08)

ユーザーが公開版(GitHub Pages)で実際に触り、手触り3項目すべてを正式採用した。
**PR #11「コアループの手触り改善パス1」はこれで完全完了。**

- 個別ポイント表示: 1.5秒
- 連続収穫toast: 2.0秒
- 補充待ち: 25〜95秒(期待値60秒)

いずれも第一パスの暫定値からの変更なし(そのままの値で採用)。今後この値を変更する場合は
別途指示に基づいて行う。

## Phase 1.5「Vercel PR Preview環境構築」

- branch: `phase1.5-vercel-preview`
- base SHA(作業開始時の最新main): `f1c6fd7d2e3c3c522730daacce9ea3dbeb2bf51d`(PR #11 merge)
- 原因: `vite.config.js`のGitHub Pages用`base: "/oden-aquarium/"`がVercel buildにもそのまま
  適用され、ルート`/`基準で配信されるVercel上でasset参照が壊れ、`https://oden-aquarium.vercel.app/`
  が真っ白になっていた。
- 対応: リポジトリルートへ`vercel.json`を新規追加し、`buildCommand`で
  `npm run build -- --base=/`を実行してVercel用だけViteの`base`を上書きした。
  `outputDirectory`は`dist`。redirect/rewrite/環境変数/framework固定は追加していない。
  GitHub Pages用の`npm run build`(引数なし)・`vite.config.js`・
  `.github/workflows/deploy.yml`は無変更。
- 検証: 通常`npm run build`は`/oden-aquarium/assets/...`基準を維持、
  `npm run build -- --base=/`は`/assets/...`基準で出力されることをJSバンドル内の
  実際の文字列で確認。両buildを個別実行し、出力(JSバンドルのハッシュ・中身)が
  混ざらないことを確認済み。`npm test`(87 tests)/ `verify:derive` / `lint` /
  両方の`build`、すべて成功。

### Vercel Preview確認結果

- Vercel deployment status: `success`(GitHub commit statusで確認、context `Vercel`,
  description `Deployment has completed`)
- Preview URL: https://oden-aquarium-git-phase15-vercel-preview-omatsu1301-collab.vercel.app
- 本セッションはネットワーク許可ドメインの制約(egress policy)によりVercel上のURLへ
  直接アクセスできず(`WebFetch`/`curl`いずれも`EGRESS_BLOCKED`)、画面表示・console error・
  レスポンシブの確認はユーザー側のブラウザで実施した。
- ユーザーが実際にPreview URLを開き、トップ画面・`?debug=1#tank`(debug fixture付き水槽画面)の
  表示と基本操作を確認。**PR #12を採用する**と明示。
- この採用を受け、PR #12をDraft→Ready→`main`へ通常merge(squash/rebaseは使わない)し、
  Vercel本番とGitHub Pagesの表示確認まで進める(結果は以下「PR #12 クローズ結果」に追記)。

## Phase 2 / Instruction 12「商店現状監査＋共通アイコン／看板styleboard設計」

- 状態: **read-only監査完了**。コード変更・branch・commit・PRなし。
- Visual Gate 3点: 2026-09-08にユーザーが正式採用した。これは部品規則の採用であり、
  最終商店背景・最終商品画像・黒いplaceholderシルエットの採用ではない。

採用した3項目:

- 共通ビジュアル言語: 夜の職人街、栗色の木、生成り、琥珀、濃茶を基調とする部品規則
- category icon: 出汁／鍋／道具／おたすけ／飾りの統一線画5種
- 看板・point・status: 暖簾紋、硬貨記号、使用中／所持／購入可能／残高不足の情報階層

read-only監査で確認した事実:

- 5カテゴリ26商品(出汁6／鍋4／道具4／おたすけ4／飾り8)
- 既存10画像ファイルで14商品枠をカバー可能
- assistの`category`衝突をP1として再現した。静的assistデータでは`category`が効果分類
  `growth` / `care`を表す一方、`shopCatalog.js`の`register()`が同じフィールドを商店分類
  `assist`で上書きする。game action層は元データを直接参照するため不正消費・保存破壊は
  防止しているが、商店詳細の使用中表示・同系統busy・出汁残量0時のdisabled・assistアイコンが
  誤判定する
- Instruction 13「assist効果分類と商店状態判定の分離修正」を、Phase 3 Wave 1
  (shop shell pilot)前の必須bugfix gateとした

## Instruction 13「assist効果分類と商店状態判定の分離修正」

- branch: `fix/assist-effect-category`
- base SHA: `8132beeb90ca02b17f9455799a332f843a75b7af`
- 内容: 静的assistデータの効果分類を`effectCategory`へ改名し、商店registryの
  `category: "assist"`と共存させる。商店詳細の使用可否判定は
  `src/presentation/shopAssistState.js`の純粋関数へ切り出した。
- 保存schema / migration / 価格 / 効果量 / duration は無変更。
- Phase 3の商店美術・画像・背景・鍋previewは未着手。
