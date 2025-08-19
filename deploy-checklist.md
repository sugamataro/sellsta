# Firebase Hosting デプロイ チェックリスト

## 🚀 デプロイ手順

### 1. 事前準備 ✅

- [x] Firebase CLI インストール済み
- [x] プロジェクト設定ファイル作成済み
- [x] Vite設定最適化済み
- [x] パッケージインストール完了
- [x] ビルドテスト成功

### 2. 今すぐ実行する手順

#### ステップ1: Firebase ログイン

```bash
firebase login
```

#### ステップ2: プロジェクト ID の設定

`.firebaserc` ファイルの `your-project-id` を実際のFirebaseプロジェクトIDに変更

#### ステップ3: Firebase プロジェクト初期化

```bash
firebase init hosting
```

- Public directory: `dist`
- Single-page app: `Yes`
- GitHub deployments: `No`
- Overwrite index.html: `No`

#### ステップ4: デプロイ実行

```bash
npm run deploy:hosting
```

## 📋 設定済みファイル

### `firebase.json`

- ✅ SPAルーティング設定
- ✅ キャッシュ最適化
- ✅ セキュリティヘッダー

### `package.json`

- ✅ デプロイスクリプト追加
- ✅ Firebase Tools 追加

### `vite.config.js`

- ✅ 本番ビルド最適化
- ✅ アセット管理設定

## 🔧 設定値

```json
// .firebaserc で更新が必要
{
  "projects": {
    "default": "あなたのFirebaseプロジェクトID"
  }
}
```

## 🌐 デプロイ後のURL

デプロイ完了後、以下のURLでアクセス可能：

- `https://[プロジェクトID].web.app`
- `https://[プロジェクトID].firebaseapp.com`

## 🚨 よくある問題と解決策

### 権限エラー

```bash
firebase login --reauth
```

### プロジェクトが見つからない

```bash
firebase projects:list
firebase use [プロジェクトID]
```

### ビルドエラー

```bash
npm run lint
npm run build
```

## 📱 テスト項目

デプロイ後に以下を確認：

- [ ] ログイン機能
- [ ] ナビゲーション
- [ ] 投稿作成/表示
- [ ] レスポンシブデザイン
- [ ] パフォーマンス

## 💡 最適化のヒント

### パフォーマンス改善

- コード分割の実装
- 画像最適化
- CDN設定

### セキュリティ

- Firebase Security Rules
- 環境変数の管理
- HTTPS強制

