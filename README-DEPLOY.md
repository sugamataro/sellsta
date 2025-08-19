# Firebase Hosting デプロイガイド

## 前提条件

1. **Firebase CLI のインストール**

   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase へのログイン**
   ```bash
   firebase login
   ```

## 初回セットアップ

### 1. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択
3. Hosting を有効にする

### 2. プロジェクト ID の設定

`.firebaserc` ファイルの `your-project-id` を実際のプロジェクト ID に変更：

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 3. Firebase 初期化（初回のみ）

```bash
firebase init hosting
```

以下の質問に答える：

- "What do you want to use as your public directory?" → `dist`
- "Configure as a single-page app?" → `Yes`
- "Set up automatic builds and deploys with GitHub?" → `No`
- "File dist/index.html already exists. Overwrite?" → `No`

## デプロイ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 本番ビルド

```bash
npm run build
```

### 3. Firebase にデプロイ

```bash
# Hosting のみデプロイ
npm run deploy:hosting

# または全体をデプロイ
npm run deploy
```

### ワンコマンドデプロイ

```bash
# ビルドとデプロイを同時実行
npm run deploy:hosting
```

## 設定ファイルの説明

### firebase.json

```json
{
  "hosting": {
    "public": "dist",                    // 公開ディレクトリ（Vite のビルド出力先）
    "ignore": [...],                     // デプロイ時に無視するファイル
    "rewrites": [                        // SPA のためのリライトルール
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [...]                     // キャッシュ設定
  }
}
```

### 重要なポイント

1. **SPA対応**: すべてのルートが `index.html` にリダイレクトされる
2. **キャッシュ最適化**: 静的アセットは1年、HTMLは無キャッシュ
3. **セキュリティ**: 設定ファイルは公開されない

## 環境変数の設定

Firebase の環境変数が必要な場合：

1. Firebase Console で Web アプリの設定を確認
2. `src/firebase.js` の設定が正しいことを確認
3. 必要に応じて `.env.production` ファイルを作成

## トラブルシューティング

### デプロイに失敗する場合

1. **権限エラー**

   ```bash
   firebase login --reauth
   ```

2. **ビルドエラー**

   ```bash
   npm run lint
   npm run build
   ```

3. **プロジェクト ID エラー**
   ```bash
   firebase use --add
   ```

### よくある問題

- **404エラー**: リライトルールが正しく設定されているか確認
- **CSS/JS読み込みエラー**: ビルドが正常に完了しているか確認
- **Firebase接続エラー**: 環境変数とFirebase設定を確認

## 本番環境での確認事項

- [ ] 認証機能の動作確認
- [ ] ルーティングの動作確認
- [ ] レスポンシブデザインの確認
- [ ] パフォーマンスの確認

## URL

デプロイ完了後、以下のURLでアクセス可能：

- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

## カスタムドメインの設定

Firebase Console → Hosting → ドメインを追加 から設定可能
