<template>
  <div class="profile-page">
    <!-- ヘッダー -->
    <div class="header">
      <div class="header-content">
        <h1 class="header-title">プロフィール</h1>
        <button @click="logout" class="logout-btn">ログアウト</button>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
      <!-- プロフィール情報 -->
      <div class="profile-section">
        <div class="profile-header">
          <div class="avatar">
            <div class="avatar-circle">
              <span class="avatar-text">{{ getInitials(userProfile?.profile?.displayName) }}</span>
            </div>
            <button @click="showEditModal = true" class="edit-avatar-btn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="m3 21 1.9-1.9" />
                <path d="l3-3 8.5-8.5a1.5 1.5 0 0 1 2.1 2.1L8.5 18l-3 3" />
                <path d="l16 16 2 2" />
              </svg>
            </button>
          </div>
          <div class="profile-info">
            <h2 class="display-name">{{ userProfile?.profile?.displayName || 'ユーザー' }}</h2>
            <p class="email">{{ user?.email }}</p>
            <p class="user-id">ID: {{ user?.uid }}</p>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ userStats.postsCount }}</div>
            <div class="stat-label">投稿数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.likesReceived }}</div>
            <div class="stat-label">いいね</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ userStats.commentsCount }}</div>
            <div class="stat-label">コメント</div>
          </div>
        </div>
      </div>

      <!-- 設定メニュー -->
      <div class="settings-section">
        <h3 class="section-title">設定</h3>
        <div class="settings-list">
          <button @click="showEditModal = true" class="setting-item">
            <div class="setting-icon">👤</div>
            <div class="setting-content">
              <div class="setting-title">プロフィール編集</div>
              <div class="setting-description">表示名やプロフィール情報を変更</div>
            </div>
            <div class="setting-arrow">›</div>
          </button>

          <button @click="showNotificationSettings = true" class="setting-item">
            <div class="setting-icon">🔔</div>
            <div class="setting-content">
              <div class="setting-title">通知設定</div>
              <div class="setting-description">通知の種類と頻度を設定</div>
            </div>
            <div class="setting-arrow">›</div>
          </button>

          <button @click="showPrivacySettings = true" class="setting-item">
            <div class="setting-icon">🔒</div>
            <div class="setting-content">
              <div class="setting-title">プライバシー設定</div>
              <div class="setting-description">公開範囲とプライバシー設定</div>
            </div>
            <div class="setting-arrow">›</div>
          </button>

          <router-link to="/posts" class="setting-item">
            <div class="setting-icon">📝</div>
            <div class="setting-content">
              <div class="setting-title">投稿管理</div>
              <div class="setting-description">投稿の確認と編集</div>
            </div>
            <div class="setting-arrow">›</div>
          </router-link>
        </div>
      </div>

      <!-- アプリ情報 -->
      <div class="app-info-section">
        <h3 class="section-title">アプリ情報</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">バージョン</span>
            <span class="info-value">1.0.0</span>
          </div>
          <div class="info-item">
            <span class="info-label">最終更新</span>
            <span class="info-value">2024年1月15日</span>
          </div>
        </div>
      </div>
    </div>

    <!-- プロフィール編集モーダル -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">プロフィール編集</h3>
          <button @click="closeEditModal" class="close-btn">
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
          <form @submit.prevent="updateProfile" class="edit-form">
            <div class="form-group">
              <label for="displayName" class="form-label">表示名</label>
              <input
                id="displayName"
                v-model="editForm.displayName"
                type="text"
                required
                class="form-input"
                placeholder="表示名を入力"
              />
            </div>

            <div class="form-group">
              <label for="bio" class="form-label">自己紹介</label>
              <textarea
                id="bio"
                v-model="editForm.bio"
                rows="3"
                class="form-input"
                placeholder="自己紹介を入力（任意）"
              ></textarea>
            </div>

            <div class="form-actions">
              <button type="submit" :disabled="isUpdating" class="submit-btn">
                {{ isUpdating ? '更新中...' : '更新' }}
              </button>
              <button type="button" @click="closeEditModal" class="cancel-btn">キャンセル</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- ボトムナビゲーション用の余白 -->
    <div class="bottom-spacer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '@/firebase'
import { signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

// ESLintエラーを回避するための設定
defineOptions({
  name: 'ProfilePage',
})

const router = useRouter()

const user = ref(null)
const userProfile = ref(null)
const showEditModal = ref(false)
const showNotificationSettings = ref(false)
const showPrivacySettings = ref(false)
const isUpdating = ref(false)

const editForm = ref({
  displayName: '',
  bio: '',
})

const userStats = ref({
  postsCount: 0,
  likesReceived: 0,
  commentsCount: 0,
})

// 認証状態の監視
onMounted(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser
    if (currentUser) {
      await fetchUserProfile(currentUser.uid)
      await fetchUserStats(currentUser.uid)
    }
  })

  return unsubscribe
})

// ユーザープロフィールを取得
const fetchUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      userProfile.value = userDoc.data()
      // 編集フォームに現在の値をセット
      editForm.value.displayName = userProfile.value.profile?.displayName || ''
      editForm.value.bio = userProfile.value.profile?.bio || ''
    }
  } catch (error) {
    console.error('プロフィール取得エラー:', error)
  }
}

// ユーザー統計を取得（サンプルデータ）
const fetchUserStats = async (userId) => {
  try {
    // 実際の実装では、Firestoreから投稿数やいいね数を取得
    userStats.value = {
      postsCount: 5,
      likesReceived: 23,
      commentsCount: 12,
    }
  } catch (error) {
    console.error('統計取得エラー:', error)
  }
}

// イニシャルを取得
const getInitials = (name) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// プロフィールを更新
const updateProfile = async () => {
  if (!user.value) return

  try {
    isUpdating.value = true

    const userRef = doc(db, 'users', user.value.uid)
    await updateDoc(userRef, {
      'profile.displayName': editForm.value.displayName,
      'profile.bio': editForm.value.bio,
      updatedAt: serverTimestamp(),
    })

    // ローカルの状態も更新
    if (userProfile.value) {
      userProfile.value.profile.displayName = editForm.value.displayName
      userProfile.value.profile.bio = editForm.value.bio
    }

    closeEditModal()
    console.log('プロフィールが更新されました')
  } catch (error) {
    console.error('プロフィール更新エラー:', error)
  } finally {
    isUpdating.value = false
  }
}

// 編集モーダルを閉じる
const closeEditModal = () => {
  showEditModal.value = false
  // フォームをリセット
  if (userProfile.value) {
    editForm.value.displayName = userProfile.value.profile?.displayName || ''
    editForm.value.bio = userProfile.value.profile?.bio || ''
  }
}

// ログアウト
const logout = async () => {
  if (!confirm('ログアウトしますか？')) return

  try {
    await signOut(auth)
    router.push('/')
    console.log('ログアウトしました')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f9fafb;
}

.header {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
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

.logout-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.main-content {
  padding: 1rem;
  max-width: 768px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* プロフィールセクション */
.profile-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(45deg, #8b5cf6, #ec4899);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.edit-avatar-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.display-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.email {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 2px 0;
}

.user-id {
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 設定セクション */
.settings-section,
.app-info-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: transparent;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  width: 100%;
  text-align: left;
}

.setting-item:hover {
  background: #f9fafb;
}

.setting-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.setting-content {
  flex: 1;
}

.setting-title {
  font-size: 1rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 2px;
}

.setting-description {
  font-size: 0.875rem;
  color: #6b7280;
}

.setting-arrow {
  font-size: 1.25rem;
  color: #9ca3af;
  font-weight: 300;
}

/* アプリ情報 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.info-value {
  font-size: 0.875rem;
  color: #111827;
  font-weight: 500;
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
  max-width: 400px;
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

/* フォーム */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 1rem;
}

.submit-btn {
  flex: 1;
  background: #8b5cf6;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #7c3aed;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  flex: 1;
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background: #e5e7eb;
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
    gap: 1rem;
  }

  .profile-section,
  .settings-section,
  .app-info-section {
    padding: 1rem;
  }

  .profile-header {
    gap: 0.75rem;
  }

  .avatar-circle {
    width: 70px;
    height: 70px;
    font-size: 1.25rem;
  }

  .display-name {
    font-size: 1.25rem;
  }

  .stats-grid {
    gap: 0.75rem;
  }

  .stat-item {
    padding: 0.75rem;
  }

  .modal-content {
    margin: 0.5rem;
    max-height: 90vh;
  }

  .modal-header,
  .modal-body {
    padding: 1rem;
  }
}
</style>
