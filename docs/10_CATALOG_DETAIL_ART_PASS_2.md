# Claude Code Instruction 10 — 美術改善パス2「図鑑＋具材詳細」

あなたは `omatsu1301-collab/oden-aquarium` の実装担当です。
この指示は、既存のゲーム仕様を維持したまま、図鑑画面と具材詳細シートの美術品質を改善するものです。

## 0. 絶対ルール

- GitHub の最新 `main` を一次情報とする。
- 指示作成時点の `main` HEAD は `e660c61f4f792dde995ef42558de021adc1be73c`（PR #9 merge）だが、作業開始時に必ず再取得する。
- `main` が進んでいれば最新 `main` を採用し、差分を確認してから開始する。古い SHA へ戻さない。
- 作業ブランチは最新 `main` から `feature/catalog-detail-art-pass-2` を作成する。
- force push、rebase、履歴改変は禁止。
- 実装後は Draft PR を作るが、**Ready 化・main への merge・Pages deploy は行わない**。ユーザーの美術確認待ちで停止する。
- 不明点のうち、コードと既存仕様から安全に決められるものは自律的に決める。ユーザーへ確認するのは、美術上の選択が本当に分岐する場合だけ。
- 今回は新機能開発・ゲームバランス変更・文章の全面改稿ではない。
- Claude Code 側で画像生成や代替イラスト制作をしない。提供済みマスターを使用する。

## 1. 現在地

- PR #9「だし水槽＋お世話の美術改善パス1」は main へ通常 merge 済み。
- merge SHA: `e660c61f4f792dde995ef42558de021adc1be73c`
- Pages deploy: run #22 / run ID `34123570326`
- build job / deploy job: ともに `success`
- PR #9 で採用済みの水槽、お世話、出汁器、おたすけ画像、共通線画アイコン、文字コントラストを維持する。

最初に `docs/IMPLEMENTATION_STATUS.md` を読み、末尾の PR #9 クローズ結果が未記入なら、上記の merge SHA・deploy run・success を事実どおり補完する。過去記録は削除・書き換えず追記で整理する。

## 2. 今回の目的

テーマは次のとおり。

> 夜のおでん屋台。奥の木棚で、発見した具材が自分専用の小鍋に入ってくつろぐ。

現在の図鑑は機能として動くが、公開版では小鍋が実質的に大きな黄色い円として表示され、夜背景も CSS グラデーション中心の仮表現に留まっている。

今回の到達点は以下。

1. 採用済みの夜屋台背景を図鑑だけへ接続する。
2. 4種類の小鍋画像を一覧・詳細・器選択へ一貫して接続する。
3. 既存キャラクターを小鍋の出汁面へ自然に配置する。
4. 図鑑の2列一覧を、木棚に小鍋が並ぶ画面へ改善する。
5. 具材詳細を、キャラクターを眺める余白と既存情報量が両立するシートへ改善する。
6. 既存の発見・お気に入り・染め記録・器変更・戻る操作をすべて維持する。

## 3. 参照画像と役割

- `references/ui-v2/06-catalog-night.png`
  - 図鑑の構図、2列、小鍋、木棚、夜の空気、見出しカード、名札の基準。
- `references/ui-v2/03-character-detail.png`
  - 詳細シートの視線誘導、No.→名前→大きな小鍋→説明→記録の順序、余白の基準。
- `references/art-north-star.png`
  - キャラクター、黄金色の出汁、柔らかな光、手描き感の基準。
- 新規マスター5点
  - 背景・器そのものの本番基準。形や絵柄を CSS で描き直さない。

参照モックの数値や未実装コンテンツをコピーしない。現行仕様は具材5種・カウンター `/5` であり、`/12` や架空の6体目を導入しない。

## 4. 入力マスター（必須）

作業前に次の5ファイルが存在することを確認する。

| master | 仕様 | production候補 |
|---|---|---|
| `references/ui-v2/catalog-night-bg-master.png` | 852×1847、RGB、縦9:19.5の夜屋台背景 | `public/assets/backgrounds/catalog-night.webp` |
| `references/ui-v2/bowl-white-master.png` | 1254×1254、RGBA、白い小鍋 | `public/assets/bowls/bowl-white.webp` |
| `references/ui-v2/bowl-indigo-master.png` | 1254×1254、RGBA、藍もよう | `public/assets/bowls/bowl-indigo.webp` |
| `references/ui-v2/bowl-cat-master.png` | 1254×1254、RGBA、肉球柄 | `public/assets/bowls/bowl-cat.webp` |
| `references/ui-v2/bowl-black-master.png` | 1254×1254、RGBA、黒釉 | `public/assets/bowls/bowl-black.webp` |

1点でも欠けている場合は実装を開始せず、欠けたパスだけを報告して停止する。既存の画像や CSS で代用しない。

マスターは無変更で `references/` に保持する。本番用 WebP はマスターから派生させる。

### 本番変換

- 背景は元寸法を維持する。WebP の品質は見た目を優先しつつ合理的に最適化する。
- 小鍋は一覧と詳細の高DPR表示を考慮し、正方形 768×768 を基本候補とする。
- 小鍋は透明余白とアルファを必ず維持する。`cwebp` を使う場合は `-alpha_q 100 -exact` を付ける。
- 変換後に寸法・アルファ・透明余白・黒/白背景の焼き込みがないことを検査する。
- `references/*master*` が `dist/` へ混入しないことを build 後に確認する。
- 生成した production asset の合計容量を報告する。過剰圧縮で木目、釉薬、細い藍模様、肉球を潰さない。

## 5. 変更範囲

主対象：

- `src/screens/CatalogScreen.jsx`
- `src/screens/CatalogScreen.css`
- `src/screens/SpeciesDetailSheet.jsx`
- `src/screens/SpeciesDetailSheet.css`
- `src/components/Bowl.jsx`
- `src/components/Bowl.css`
- 図鑑専用背景コンポーネント／CSS（新規可）
- 小鍋画像パスの resolver とその単体テスト（新規可）
- `docs/IMPLEMENTATION_STATUS.md`
- 今回の指示書保存用ドキュメント

必要な場合のみ、後方互換な props 追加として `src/ui/Sheet.jsx/.css` を変更してよい。他画面の見た目・挙動を変えないこと。

## 6. 変更禁止・維持事項

次を変更しない。

- `src/game/` 全体
- `src/storage/` 全体
- migration / validate / economy / purchase / equip / harvest のロジック
- `src/components/AquariumScene.jsx/.css`
- `src/components/Character.jsx`
- `src/presentation/soakVisual.js`
- がんもの白色から鮮やかな色への成長変化
- soakProgress / soakVisual
- 水槽内キャラクターの既存サイズ差
- 巨大こんにゃくにつながる現在のサイズ挙動
- 浮遊、泡、タップ反応
- debug 保存と通常保存の分離
- 水槽、お世話、商店、おたより、設定の固有レイアウト
- 商品数、価格、ゲーム速度、文章データ

正式な個体差システムは今回も実装しない。図鑑での見栄え調整用に species 別の表示倍率が必要になった場合、それは `Bowl` 内だけの presentation 設定とし、ゲーム状態や個体データへ持ち込まない。

## 7. 背景実装

現在の `NightBackdrop` は図鑑と商店で共用されているため、**新背景を既存 `NightBackdrop` 全体へ無条件適用して商店まで変えないこと**。

推奨は、図鑑専用の `CatalogNightBackdrop`（名称は変更可）を新設し、`CatalogScreen` だけで使う方法。既存 `NightBackdrop` と `ShopScreen` は無変更を優先する。

要件：

- `catalog-night-bg.webp` を背景の主体とする。
- 画像比率が 9:19.5 なので、横幅基準 `background-size: 100% auto`、上中央基準を第一候補とする。
- 360×640、390×844、430×932 で安易な `cover` による左右・上下の大幅切断が起きないこと。
- スクロール時に背景が途中で途切れる場合は、末尾を背景色／木色で自然に延長する。画像の単純な縦リピートで棚が不自然に反復しないようにする。
- 背景画像は装飾扱い。読み上げ対象にしない。
- 背景の上へ過度な暗幕をかけず、木目・夜景・提灯の暖色を残す。ただし文字の可読性はカード／名札側で確保する。
- 既存 CSS 製の窓・暖簾・提灯・棚を図鑑上で二重表示しない。
- `prefers-reduced-motion` / `data-motion="reduced"` の既存方針を壊さない。

## 8. `Bowl` の画像化

4種類を固定マッピングする純粋な resolver を1か所に置く。

- `bowl-white` → `bowl-white.webp`
- `bowl-indigo` → `bowl-indigo.webp`
- `bowl-cat` → `bowl-cat.webp`
- `bowl-black` → `bowl-black.webp`

`import.meta.env.BASE_URL` を必ず含め、GitHub Pages の `/oden-aquarium/` サブパスで404にならないようにする。既知IDの対応と fallback 方針を単体テストする。fallback を置くなら `bowl-white` とし、未知IDを新しい正式商品として扱わない。

`Bowl` のレイヤーは次を基本とする。

1. コンテナ
2. 小鍋画像（装飾、空alt + `aria-hidden`）
3. キャラクター画像または未発見 `?`
4. 必要最小限の湯気／光（CSS、任意）
5. 読み上げ用の speciesName / 未発見テキスト

重要：

- 旧 `.bowl__inner`、無効な `border: 10%`、CSSだけの円形rim／handleを本番表示の主体にしない。
- キャラクターは小鍋画像の黄金色の出汁面へ収め、白い前縁や取っ手を大きく覆わない。
- 一覧と詳細で同じ `Bowl` コンポーネントを使用する。
- `size="small"` / `size="large"` の API は維持するか、既存呼び出しを壊さない互換設計にする。
- 具材の透明PNGは再生成・再加工しない。
- キャラクターの縦横比を崩さない。
- しらたき、こんにゃく、ちくわ、がんも、だいこんがそれぞれ読みやすいことを実画面で調整する。
- species別の表示倍率／位置補正が必要なら、Bowl表示専用の定数へ集約し、magic numberを JSX 各所へ散らさない。
- 一覧の小サイズでも器の模様が判別でき、詳細の大サイズでも画像が粗く見えないこと。
- 未発見状態でも白い小鍋を表示し、出汁面中央へ `?` を置く。巨大な黄色い円へ戻さない。
- 湯気アニメーションを残す／追加する場合は、器や顔を隠さず、reduced motion で停止する。
- CSSの `filter` だけで白い小鍋から他3種を疑似生成しない。提供済み4画像を使う。

## 9. 図鑑一覧

維持：

- 2列一覧
- 具材5種
- `001`〜`005`
- 発見数 `/5`
- 発見済みクリックで詳細を開く
- 未発見クリックで既存ヒントを表示
- お気に入りハート
- BottomNav
- 図鑑画面のスクロール

改善：

- 背景上の木棚へ小鍋が並んで見える構図にする。
- ヘッダーは参照画像に倣い、タイトル＋サブタイトルを温かなアイボリー系の面へ載せる。
- 発見数も独立した小さなアイボリー系カードへ載せる。
- 旧左上提灯回避用の `padding-left: max(15%, 64px)` は新背景に合わせて再評価し、不自然な狭さを残さない。
- 黒いピル状の名前表示は、木棚に置かれた小さな生成り／木札風の名札へ変更する。
- 名札には `001 だいこん` のように現行データを表示する。未発見は `001 ???`。
- タップ領域は小鍋だけに限定せず、カード全体で44px以上を維持する。
- hover が存在しないスマホでも状態が分かる。focus-visible を維持・改善する。
- お気に入りハートは背景とキャラクターを邪魔しない位置へ置き、十分なコントラストを確保する。
- 現在の6枠目の暗い円形 placeholder は廃止する。5体目の右側は自然な空き棚として残し、`No.006` や未実装具材の存在を捏造しない。
- 360pxで名前が不自然に縦割れしない。
- BottomNav と最下段の小鍋／名札が重ならない。

## 10. 具材詳細シート

参照画像の視線順序を守る。

1. `No.001` 等
2. 具材名
3. 大きな小鍋＋キャラクター
4. 生態文
5. 基本記録
6. 染め記録
7. 器変更
8. お気に入り

既存機能は削らない。参照モックにない「染め記録」「器変更」も現行正式機能なので維持する。

要件：

- 最初に開いた画面で No.、名前、主役の小鍋、説明文の主要部分が見えるようにする。
- 小鍋は一覧より明確に大きくするが、360×640で説明や閉じる操作を極端に押し出さない。
- 背景の図鑑が暗幕越しに見え、夜の屋台から具材へ寄る感覚を維持する。
- シート自体は温かな生成り色。過剰なカード分割・強い影を増やさず、罫線と余白で情報階層を作る。
- 生態文の行間と一行長を読みやすくする。
- 基本記録はラベルと値の対応が一目で分かる。
- 染め記録6種は3列を基本にしつつ、360pxでも名前・回数・未発見 `?` が潰れない。
- 器選択では4種類すべての画像差が読める。選択中の器が視覚・アクセシビリティ双方で分かるようにする。
- 所有／未所有、既存の適用ロジック、商店導線、favorite dispatch を壊さない。
- ブラウザの戻る、閉じる、フォーカス移動・復帰を維持する。
- 共通 `Sheet` を変更する場合は、任意の scoped class prop など後方互換な拡張に限定し、Care／Letters／Settings／ShopItemDetail の見た目を変えない。

## 11. テスト

最低限、次を実行する。

```bash
npm test
npm run verify:derive
npm run lint
npm run build
```

既存 Playwright 回帰37件を再実行する。既存テストを削除・skip・期待値緩和で通さない。

今回の追加確認：

1. 4つの bowlId がそれぞれ正しい WebP URLへ解決される。
2. URLが `import.meta.env.BASE_URL` を含む。
3. 未発見は白い小鍋＋ `?` になり、キャラクター画像を表示しない。
4. 発見済み5種は正しいキャラクターを表示する。
5. 4器の切替後、一覧と詳細の両方へ同じ bowlId が反映される。
6. 未所有器の既存制御を壊していない。
7. お気に入りの付与・解除が一覧へ反映される。
8. 染め記録が現行データどおり表示される。
9. 未発見ヒントが開閉できる。
10. 詳細シートが閉じるボタンとブラウザ戻るで閉じる。
11. 360×640、390×844、430×932で横スクロールがない。
12. 3幅で header / 2列 / 最下段 / BottomNav が重ならない。
13. 商店へ移動し、既存 `ShopScreen` の夜背景・レイアウトが今回の背景接続で変化していない。
14. 水槽、お世話、商店、おたより、設定の主要操作で回帰がない。
15. console error、React warning、asset 404 がない。
16. 通常URLで debug 保存キーを新規作成しない。
17. `dist/` に production WebP 5点が入り、master PNGが入らない。

テスト追加は意味のある回帰防止に限定する。画像のピクセル完全一致テストや、CSSの実装詳細だけを固定する脆いテストは作らない。

## 12. Visual evidence

ローカル preview を `/oden-aquarium/` の本番サブパス条件で起動し、debug fixture を使って確認する。本番保存を汚さない。

最低限、次を保存する。保存先はセッションの scratchpad でよく、repoへコミットしない。

- `art2-01-catalog-undiscovered-390.png`
- `art2-02-catalog-discovered-360.png`
- `art2-03-catalog-discovered-390.png`
- `art2-04-catalog-discovered-430.png`
- `art2-05-detail-top-white-390.png`
- `art2-06-detail-lower-390.png`
- `art2-07-bowl-picker-four-390.png`
- `art2-08-detail-indigo-390.png`
- `art2-09-detail-cat-390.png`
- `art2-10-detail-black-390.png`
- `art2-11-shop-unchanged-390.png`

必要なら、一覧→詳細→器変更→一覧反映→ブラウザ戻るを示す8〜12秒程度の短い動画も作る。

スクリーンショットでは次を目視確認する。

- 背景の棚と小鍋が一つの空間に見える。
- キャラクターが鍋の縁の上へ貼り付いたように見えない。
- 5種のキャラクターが小さすぎず、器からはみ出しすぎない。
- 白／藍／ねこ／黒釉が小サイズでも区別できる。
- 文字カードが背景を潰しすぎず、可読性を確保する。
- 参照画像へ近づけつつ、現行の正式機能が欠落していない。

## 13. ドキュメントとPR

1. この指示内容を `docs/10_CATALOG_DETAIL_ART_PASS_2.md` として保存する。
2. `docs/IMPLEMENTATION_STATUS.md` へ次を追記する。
   - branch / base SHA / head SHA
   - master / production asset 一覧と寸法・容量
   - 変更範囲
   - 明示的に維持した範囲
   - テスト結果
   - visual evidence の保存場所
   - 未確認事項
   - 「Draft PR、ユーザー美術確認待ち」であること
3. コミットは意味のまとまりで作る。例：assets、Bowl、catalog/detail、tests/docs。
4. push後、Draft PRを作成する。

PRタイトル：

`図鑑＋具材詳細の美術改善パス2`

PR本文に必ず含める：

- Why
- What
- Assets（master→production対応、寸法、容量）
- Scope isolation（商店やゲームロジックを変えていない根拠）
- Validation（件数込み）
- Visual evidence（PRへ添付していないなら「ローカル保存、PR未添付」と正確に記載）
- Limits / 未確認事項
- User review required

PR作成後に mergeability、base=`main`、head branch、head SHA、CI状況を確認する。

## 14. 停止条件

次の状態で停止し、完了報告する。

- Draft PRがopen
- CIが成功、または未実行なら理由が明記されている
- mergeしていない
- deployしていない
- visual evidenceが揃っている
- ユーザーが判断すべき点が限定されている

完了報告は次の順序で出す。

1. 実装した内容
2. 自律判断した内容と理由
3. 変更していない重要領域
4. asset一覧・寸法・容量
5. テスト結果（コマンド・件数）
6. スクリーンショット／動画のパス
7. branch / commits / Draft PR URL / head SHA / mergeability / CI
8. 未確認事項
9. ユーザーに判断してほしい美術項目だけ

ユーザーの確認対象は原則として次の4点に絞る。

1. 夜背景と図鑑UIの一体感
2. 5種のキャラクターと小鍋の収まり
3. 白・藍・ねこ・黒釉の4器の見分けやすさ
4. 具材詳細の情報量と「眺める余白」のバランス

それ以外の技術事項を、判断依頼としてユーザーへ投げない。
