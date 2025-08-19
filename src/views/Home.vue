<template>
  <div class="home-page">
    <!-- ヘッダー -->
    <div class="header">
      <div class="header-content">
        <h1 class="header-title">ホーム</h1>
        <div class="user-info">
          <span class="welcome-text">おかえりなさい！</span>
        </div>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <PostList />
    </div>

    <!-- ボトムナビゲーション用の余白 -->
    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import PostList from '@/components/PostList.vue'

// ESLintエラーを回避するための設定
defineOptions({
  name: 'HomePage',
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.welcome-text {
  font-size: 0.9rem;
  opacity: 0.9;
}

.main-content {
  padding: 0;
  max-width: 768px;
  margin: 0 auto;
}

.bottom-spacer {
  height: 80px; /* ボトムナビゲーションの高さ分の余白 */
}

/* モバイル対応 */
@media (max-width: 768px) {
  .header {
    padding: 0.75rem 1rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .welcome-text {
    font-size: 0.8rem;
  }
}
</style>
