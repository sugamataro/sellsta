<template>
  <div class="notifications-page">
    <!-- ヘッダー -->
    <div class="header">
      <div class="header-content">
        <h1 class="header-title">通知</h1>
        <button v-if="unreadCount > 0" @click="markAllAsRead" class="mark-all-read-btn">
          すべて既読
        </button>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- フィルター -->
      <div class="filter-section">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="selectedFilter = filter.id"
          :class="['filter-btn', { active: selectedFilter === filter.id }]"
        >
          {{ filter.label }}
          <span v-if="filter.count > 0" class="filter-count">{{ filter.count }}</span>
        </button>
      </div>

      <!-- 通知リスト -->
      <div class="notifications-list">
        <div v-if="filteredNotifications.length === 0" class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3>通知がありません</h3>
          <p>新しい通知があると、こちらに表示されます</p>
        </div>

        <div
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.isRead }]"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <span>{{ getNotificationIcon(notification.type) }}</span>
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-type">{{ getTypeLabel(notification.type) }}</span>
              <div v-if="!notification.isRead" class="unread-indicator"></div>
            </div>
          </div>

          <div class="notification-actions">
            <button
              v-if="!notification.isRead"
              @click.stop="markAsRead(notification.id)"
              class="action-btn read-btn"
            >
              既読
            </button>
            <button @click.stop="deleteNotification(notification.id)" class="action-btn delete-btn">
              削除
            </button>
          </div>
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
  name: 'NotificationsPage',
})

const selectedFilter = ref('all')

// サンプル通知データ
const notifications = ref([
  {
    id: 1,
    type: 'like',
    title: 'いいねを受け取りました',
    message: 'あなたの投稿「新商品の紹介方法について」にいいねが付きました',
    isRead: false,
    createdAt: new Date('2024-01-15T10:30:00'),
    actionUrl: '/posts',
  },
  {
    id: 2,
    type: 'comment',
    title: 'コメントを受け取りました',
    message: '田中さんがあなたの投稿にコメントしました',
    isRead: false,
    createdAt: new Date('2024-01-15T09:15:00'),
    actionUrl: '/posts',
  },
  {
    id: 3,
    type: 'system',
    title: '新しいマニュアルが追加されました',
    message: '接客マニュアルに「返品・交換対応」が追加されました',
    isRead: true,
    createdAt: new Date('2024-01-14T16:45:00'),
    actionUrl: '/manual',
  },
  {
    id: 4,
    type: 'announcement',
    title: 'システムメンテナンスのお知らせ',
    message: '明日の深夜2:00-4:00にシステムメンテナンスを実施します',
    isRead: true,
    createdAt: new Date('2024-01-14T14:20:00'),
    actionUrl: null,
  },
  {
    id: 5,
    type: 'like',
    title: 'いいねを受け取りました',
    message: 'あなたの投稿「効果的な商品陳列方法」にいいねが付きました',
    isRead: true,
    createdAt: new Date('2024-01-13T11:00:00'),
    actionUrl: '/posts',
  },
])

// 未読数
const unreadCount = computed(() => {
  return notifications.value.filter((n) => !n.isRead).length
})

// フィルター
const filters = computed(() => [
  {
    id: 'all',
    label: 'すべて',
    count: notifications.value.length,
  },
  {
    id: 'unread',
    label: '未読',
    count: unreadCount.value,
  },
  {
    id: 'like',
    label: 'いいね',
    count: notifications.value.filter((n) => n.type === 'like').length,
  },
  {
    id: 'comment',
    label: 'コメント',
    count: notifications.value.filter((n) => n.type === 'comment').length,
  },
  {
    id: 'system',
    label: 'システム',
    count: notifications.value.filter((n) => n.type === 'system' || n.type === 'announcement')
      .length,
  },
])

// フィルタリングされた通知
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  switch (selectedFilter.value) {
    case 'unread':
      filtered = filtered.filter((n) => !n.isRead)
      break
    case 'like':
      filtered = filtered.filter((n) => n.type === 'like')
      break
    case 'comment':
      filtered = filtered.filter((n) => n.type === 'comment')
      break
    case 'system':
      filtered = filtered.filter((n) => n.type === 'system' || n.type === 'announcement')
      break
  }

  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

// 通知アイコンを取得
const getNotificationIcon = (type) => {
  const icons = {
    like: '❤️',
    comment: '💬',
    system: '🔧',
    announcement: '📢',
  }
  return icons[type] || '🔔'
}

// タイプラベルを取得
const getTypeLabel = (type) => {
  const labels = {
    like: 'いいね',
    comment: 'コメント',
    system: 'システム',
    announcement: 'お知らせ',
  }
  return labels[type] || type
}

// 時間をフォーマット
const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'たった今'
  if (minutes < 60) return `${minutes}分前`
  if (hours < 24) return `${hours}時間前`
  if (days < 7) return `${days}日前`

  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 通知をクリック
const handleNotificationClick = (notification) => {
  // 未読の場合は既読にする
  if (!notification.isRead) {
    markAsRead(notification.id)
  }

  // アクション先に遷移（実装時にはrouter.pushを使用）
  if (notification.actionUrl) {
    console.log(`Navigate to: ${notification.actionUrl}`)
    // router.push(notification.actionUrl)
  }
}

// 既読にする
const markAsRead = (id) => {
  const notification = notifications.value.find((n) => n.id === id)
  if (notification) {
    notification.isRead = true
  }
}

// すべて既読にする
const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.isRead = true
  })
}

// 通知を削除
const deleteNotification = (id) => {
  const index = notifications.value.findIndex((n) => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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

.mark-all-read-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mark-all-read-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 1rem;
  max-width: 768px;
  margin: 0 auto;
}

/* フィルター */
.filter-section {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0 16px 0;
  margin-bottom: 1rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-btn:hover {
  background: #f3f4f6;
}

.filter-btn.active {
  background: #f59e0b;
  color: white;
  border-color: #f59e0b;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  color: inherit;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-btn.active .filter-count {
  background: rgba(255, 255, 255, 0.3);
}

/* 通知リスト */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notification-item {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.notification-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.unread {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  line-height: 1.4;
}

.notification-time {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.notification-message {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin: 4px 0 8px 0;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-type {
  font-size: 0.75rem;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 48px;
}

.read-btn {
  background: #e5e7eb;
  color: #374151;
}

.read-btn:hover {
  background: #d1d5db;
}

.delete-btn {
  background: #fee2e2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fecaca;
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
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #374151;
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

  .notification-item {
    padding: 0.75rem;
    gap: 8px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }

  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .notification-time {
    font-size: 0.7rem;
  }

  .notification-actions {
    flex-direction: row;
    gap: 6px;
  }

  .action-btn {
    min-width: 40px;
    padding: 3px 6px;
  }
}

/* 非常に小さい画面 */
@media (max-width: 480px) {
  .notification-item {
    flex-direction: column;
    gap: 12px;
  }

  .notification-header {
    flex-direction: row;
    justify-content: space-between;
  }

  .notification-actions {
    align-self: flex-end;
    flex-direction: row;
  }
}
</style>
