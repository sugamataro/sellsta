<template>
  <div class="manual-page">
    <!-- ヘッダー -->
    <div class="header">
      <div class="header-content">
        <h1 class="header-title">接客マニュアル</h1>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <div class="manual-container">
        <!-- 検索バー -->
        <div class="search-section">
          <div class="search-box">
            <svg
              class="search-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="マニュアルを検索..."
              class="search-input"
            />
          </div>
        </div>

        <!-- カテゴリー -->
        <div class="categories">
          <button
            v-for="category in categories"
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="['category-btn', { active: selectedCategory === category.id }]"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>

        <!-- マニュアル項目 -->
        <div class="manual-items">
          <div
            v-for="item in filteredItems"
            :key="item.id"
            class="manual-item"
            @click="openItem(item)"
          >
            <div class="item-header">
              <h3 class="item-title">{{ item.title }}</h3>
              <span class="item-badge" :class="item.priority">{{ item.priorityLabel }}</span>
            </div>
            <p class="item-description">{{ item.description }}</p>
            <div class="item-meta">
              <span class="item-category">{{ getCategoryName(item.categoryId) }}</span>
              <span class="item-updated">{{ formatDate(item.updatedAt) }}</span>
            </div>
          </div>
        </div>

        <!-- 空の状態 -->
        <div v-if="filteredItems.length === 0" class="empty-state">
          <div class="empty-icon">📖</div>
          <h3>マニュアルが見つかりません</h3>
          <p>検索条件を変更してお試しください</p>
        </div>
      </div>
    </div>

    <!-- マニュアル詳細モーダル -->
    <div v-if="selectedItem" class="modal-overlay" @click="closeItem">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedItem.title }}</h2>
          <button @click="closeItem" class="close-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="modal-content-text" v-html="selectedItem.content"></div>
        </div>
      </div>
    </div>

    <!-- ボトムナビゲーション用の余白 -->
    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// ESLintエラーを回避するための設定
defineOptions({
  name: 'ManualPage',
})

const searchQuery = ref('')
const selectedCategory = ref('all')
const selectedItem = ref(null)

// カテゴリー
const categories = ref([
  { id: 'all', name: 'すべて', icon: '📋' },
  { id: 'greeting', name: '挨拶・接客', icon: '👋' },
  { id: 'product', name: '商品説明', icon: '🛍️' },
  { id: 'payment', name: '会計・決済', icon: '💳' },
  { id: 'complaint', name: '苦情対応', icon: '🤝' },
  { id: 'emergency', name: '緊急時対応', icon: '🚨' },
])

// マニュアル項目（サンプルデータ）
const manualItems = ref([
  {
    id: 1,
    title: '基本的な接客挨拶',
    description: 'お客様への基本的な挨拶とお迎えの仕方について',
    categoryId: 'greeting',
    priority: 'high',
    priorityLabel: '重要',
    content: `
      <h3>基本的な接客挨拶</h3>
      <h4>🌅 朝の挨拶（9:00-12:00）</h4>
      <p>「おはようございます。いらっしゃいませ。」</p>
      
      <h4>🌞 昼の挨拶（12:00-18:00）</h4>
      <p>「こんにちは。いらっしゃいませ。」</p>
      
      <h4>🌙 夜の挨拶（18:00-閉店）</h4>
      <p>「こんばんは。いらっしゃいませ。」</p>
      
      <h4>📝 ポイント</h4>
      <ul>
        <li>笑顔で明るく</li>
        <li>相手の目を見て</li>
        <li>適度な声の大きさで</li>
        <li>お辞儀は15度程度</li>
      </ul>
    `,
    updatedAt: '2024-01-15',
  },
  {
    id: 2,
    title: '商品の説明方法',
    description: 'お客様に商品の特徴や価格を分かりやすく説明する方法',
    categoryId: 'product',
    priority: 'high',
    priorityLabel: '重要',
    content: `
      <h3>商品説明の基本</h3>
      <h4>🎯 説明の順序</h4>
      <ol>
        <li>商品名と価格</li>
        <li>主な特徴・メリット</li>
        <li>使用方法・注意点</li>
        <li>関連商品の提案</li>
      </ol>
      
      <h4>💡 効果的な説明のコツ</h4>
      <ul>
        <li>お客様のニーズを聞く</li>
        <li>専門用語は使わない</li>
        <li>実物を見せながら説明</li>
        <li>メリットを具体的に</li>
      </ul>
    `,
    updatedAt: '2024-01-14',
  },
  {
    id: 3,
    title: '苦情対応の基本',
    description: 'お客様からの苦情やクレームに適切に対応する方法',
    categoryId: 'complaint',
    priority: 'urgent',
    priorityLabel: '緊急',
    content: `
      <h3>苦情対応の流れ</h3>
      <h4>1️⃣ 傾聴</h4>
      <p>まずはお客様のお話を最後まで聞く</p>
      
      <h4>2️⃣ 謝罪</h4>
      <p>「ご迷惑をおかけして申し訳ございません」</p>
      
      <h4>3️⃣ 確認</h4>
      <p>状況を正確に把握し、復唱して確認</p>
      
      <h4>4️⃣ 解決策の提示</h4>
      <p>可能な解決策を提示し、お客様の意向を確認</p>
      
      <h4>5️⃣ 再発防止</h4>
      <p>同じことが起こらないよう改善策を伝える</p>
      
      <h4>⚠️ 注意点</h4>
      <ul>
        <li>感情的にならない</li>
        <li>責任転嫁しない</li>
        <li>必要に応じて責任者を呼ぶ</li>
      </ul>
    `,
    updatedAt: '2024-01-13',
  },
  {
    id: 4,
    title: '会計・決済手順',
    description: 'レジでの会計処理と各種決済方法の取り扱い',
    categoryId: 'payment',
    priority: 'medium',
    priorityLabel: '普通',
    content: `
      <h3>会計の基本手順</h3>
      <h4>💰 現金決済</h4>
      <ol>
        <li>商品をレジに通す</li>
        <li>合計金額を告知</li>
        <li>お預かり金額を確認</li>
        <li>お釣りを計算し、返却</li>
        <li>レシートをお渡し</li>
      </ol>
      
      <h4>💳 カード決済</h4>
      <ol>
        <li>カードの種類を確認</li>
        <li>決済端末にカードを挿入</li>
        <li>暗証番号の入力をご案内</li>
        <li>決済完了を確認</li>
        <li>レシートとカードを返却</li>
      </ol>
      
      <h4>📱 電子マネー・QRコード決済</h4>
      <ol>
        <li>決済方法を確認</li>
        <li>専用端末で読み取り</li>
        <li>決済音を確認</li>
        <li>画面で決済完了を確認</li>
        <li>レシートをお渡し</li>
      </ol>
    `,
    updatedAt: '2024-01-12',
  },
])

// フィルタリングされた項目
const filteredItems = computed(() => {
  let items = manualItems.value

  // カテゴリーフィルター
  if (selectedCategory.value !== 'all') {
    items = items.filter((item) => item.categoryId === selectedCategory.value)
  }

  // 検索フィルター
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(query) || item.description.toLowerCase().includes(query),
    )
  }

  return items
})

// カテゴリー名を取得
const getCategoryName = (categoryId) => {
  const category = categories.value.find((cat) => cat.id === categoryId)
  return category ? category.name : categoryId
}

// 日付のフォーマット
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// アイテムを開く
const openItem = (item) => {
  selectedItem.value = item
}

// アイテムを閉じる
const closeItem = () => {
  selectedItem.value = null
}
</script>

<style scoped>
.manual-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 768px;
  margin: 0 auto;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.main-content {
  padding: 1rem;
  max-width: 768px;
  margin: 0 auto;
}

.manual-container > * + * {
  margin-top: 1.5rem;
}

/* 検索セクション */
.search-section {
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #6b7280;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 44px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* カテゴリー */
.categories {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0;
  margin-bottom: 1.5rem;
}

.category-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  white-space: nowrap;
}

.category-btn:hover {
  background: #f3f4f6;
}

.category-btn.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.category-icon {
  font-size: 1.5rem;
}

.category-name {
  font-size: 0.75rem;
  font-weight: 500;
}

/* マニュアル項目 */
.manual-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.manual-item {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.manual-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  flex: 1;
}

.item-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  margin-left: 12px;
}

.item-badge.high {
  background: #fee2e2;
  color: #dc2626;
}

.item-badge.urgent {
  background: #fef2f2;
  color: #b91c1c;
}

.item-badge.medium {
  background: #fef3c7;
  color: #d97706;
}

.item-description {
  color: #6b7280;
  margin: 8px 0;
  line-height: 1.5;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 12px;
}

.item-category {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

/* 空の状態 */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
}

/* モーダル */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-content-text {
  line-height: 1.6;
}

.modal-content-text h3 {
  color: #111827;
  margin-bottom: 1rem;
}

.modal-content-text h4 {
  color: #374151;
  margin: 1.5rem 0 0.5rem 0;
  font-size: 1rem;
}

.modal-content-text ul,
.modal-content-text ol {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.modal-content-text li {
  margin: 0.25rem 0;
}

.bottom-spacer {
  height: 80px;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .header {
    padding: 0.75rem 1rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .main-content {
    padding: 0.75rem;
  }

  .categories {
    padding: 4px 0;
  }

  .category-btn {
    padding: 8px 12px;
    min-width: 70px;
  }

  .category-icon {
    font-size: 1.25rem;
  }

  .manual-item {
    padding: 1rem;
  }

  .item-header {
    flex-direction: column;
    gap: 8px;
  }

  .item-badge {
    margin-left: 0;
    align-self: flex-start;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: 90vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-body {
    padding: 1rem;
  }
}
</style>
