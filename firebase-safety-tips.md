# Firebase 課金安全対策ガイド

## 🛡️ 課金を避けるための設定

### 1. 使用量監視の設定

Firebase Console で以下を設定：

#### アラート設定

1. Firebase Console → 使用量とお支払い
2. 「アラートを設定」をクリック
3. 以下の値を設定：
   - **ストレージ**: 8GB（80%）
   - **転送量**: 300MB/日（85%）

#### 予算アラート

1. Google Cloud Console → お支払い
2. 「予算とアラート」を設定
3. 予算額: $1-5 程度

### 2. 使用量確認方法

```bash
# Firebase CLI で使用量確認
firebase projects:list
firebase use inhouseapp-for-staff
firebase hosting:clone source-site-id target-site-id
```

### 3. 安全な運用方法

#### 定期確認（月1回）

- [ ] Firebase Console で使用量確認
- [ ] 転送量のトレンド確認
- [ ] 異常なアクセスがないかチェック

#### アクセス制限

```javascript
// firebase.js で IP制限などを設定可能
// 必要に応じて認証強化
```

## 📊 現在の設定状況

### あなたのプロジェクト

- **プロジェクトID**: inhouseapp-for-staff
- **アプリサイズ**: ~0.7MB
- **想定使用量**: 無料枠の1%未満

### 安全マージン

- ストレージ: 99.993% の余裕
- 転送量: 1日500回アクセスまで安全

## 🚨 緊急時の対処法

### 使用量急増時

1. Firebase Console で使用状況確認
2. 不正アクセスの可能性をチェック
3. 一時的にサイトを無効化：
   ```bash
   firebase hosting:disable
   ```

### 課金を完全に避けたい場合

1. Sparkプラン（無料）に留まる
2. 定期的な使用量監視
3. アラート設定の活用

## 💰 実際の費用例

### 無料枠超過時の費用

- ストレージ 1GB追加: $0.026（約4円）
- 転送量 1GB追加: $0.15（約22円）

### 参考：他社比較

- Netlify: 100GB/月 無料
- Vercel: 100GB/月 無料
- GitHub Pages: 1GB/月 無料

Firebase は非常にコストパフォーマンスが良いサービスです！

