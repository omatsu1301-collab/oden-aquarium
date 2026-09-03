# おでんアクアリウム

React + Vite製。大根キャラクターが常時浮遊し、時間経過に応じて出汁の染み込み具合(dashiLevel)が変化するアプリの初期実装。

詳細な設計・実装方針は [oden-aquarium-implementation-spec.md](./oden-aquarium-implementation-spec.md) を参照。

## セットアップ

```bash
npm install
npm run dev
```

## 主なスクリプト

- `npm run dev`: 開発サーバー起動
- `npm run build`: 本番ビルド(`dist/`に出力)
- `npm run verify:derive`: 状態計算ロジック(`src/logic/derive.js`)の簡易動作確認
- `npm run lint`: oxlintによる静的解析

## デバッグ用の時間送り

`?debug=1` を付けてアクセスすると、画面下部に時間送りボタンが表示される(本番の通常URLでは表示されない)。

## デプロイ

`main` ブランチへのpushで GitHub Actions (`.github/workflows/deploy.yml`) がGitHub Pagesへ自動デプロイする。事前にリポジトリの Settings → Pages → Source を「GitHub Actions」に設定しておく必要がある。
