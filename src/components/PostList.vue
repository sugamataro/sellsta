<template>
  <div class="min-h-screen bg-gray-50">
    <!-- ヘッダー -->
    <div class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-semibold text-gray-900">投稿一覧</h1>
        <router-link to="/" class="instagram-button instagram-button-primary">
          マイページ
        </router-link>
      </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- フィルター -->
      <div class="mb-6">
        <select
          v-model="selectedCategory"
          @change="filterPosts"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">すべてのカテゴリ</option>
          <option value="general">一般</option>
          <option value="tech">技術</option>
          <option value="news">ニュース</option>
          <option value="other">その他</option>
        </select>
      </div>

      <!-- 投稿一覧 -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-2 text-gray-500">読み込み中...</p>
      </div>

      <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
        <div class="text-gray-400 text-6xl mb-4">📝</div>
        <p class="text-gray-500 text-lg">投稿がありません</p>
      </div>

      <div v-else class="space-y-6">
        <div v-for="post in filteredPosts" :key="post.id" class="instagram-card p-6">
          <!-- 投稿ヘッダー -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold"
              >
                {{ getAuthorDisplayName(post.authorId).charAt(0) }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ getAuthorDisplayName(post.authorId) }}</p>
                <p class="text-sm text-gray-500">{{ formatDate(post.createdAt) }}</p>
              </div>
            </div>
            <span class="px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
              {{ getCategoryLabel(post.category) }}
            </span>
          </div>

          <!-- 投稿内容 -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ post.title }}</h3>

            <!-- 画像表示 -->
            <div v-if="post.image" class="mb-4">
              <img
                :src="post.image.url"
                :alt="post.image.originalName || '投稿画像'"
                class="post-image"
                @error="handleImageError"
                @load="handleImageLoad"
              />
              <div class="image-info">
                <span class="image-type-badge" :class="getImageTypeBadgeClass(post.image.type)">
                  {{ getImageTypeLabel(post.image.type) }}
                </span>
                <span class="image-size">{{ formatImageSize(post.image.size) }}</span>
              </div>
            </div>

            <div class="post-content text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ post.content }}
            </div>
          </div>

          <!-- アクションボタン -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center space-x-4">
              <!-- いいねボタン -->
              <button
                @click="toggleLike(post.id)"
                :class="[
                  'flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200',
                  isLiked(post.id)
                    ? 'text-instagram-red hover:bg-red-50'
                    : 'text-gray-500 hover:bg-gray-50',
                ]"
                :disabled="!user"
              >
                <span class="text-xl">{{ isLiked(post.id) ? '❤️' : '🤍' }}</span>
                <span class="font-medium">{{ post.likes || 0 }}</span>
              </button>

              <!-- コメント数 -->
              <div class="flex items-center space-x-2 px-3 py-2 text-gray-500">
                <span class="text-xl">💬</span>
                <span class="font-medium">0</span>
              </div>
            </div>

            <!-- 編集・削除ボタン -->
            <div v-if="isOwnPost(post)" class="flex items-center space-x-2">
              <button @click="editPost(post)" class="instagram-button instagram-button-secondary">
                編集
              </button>
              <button
                @click="deletePost(post.id)"
                class="instagram-button bg-red-500 text-white hover:bg-red-600"
              >
                削除
              </button>
            </div>
          </div>

          <!-- コメントセクション -->
          <CommentSection :post-id="post.id" />
        </div>
      </div>

      <!-- エラーメッセージ -->
      <div v-if="errorMessage" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-center">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- 編集モーダル -->
    <div
      v-if="showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">投稿を編集</h3>
          <form @submit.prevent="updatePost" class="space-y-4">
            <div>
              <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-1"
                >タイトル</label
              >
              <input
                type="text"
                id="edit-title"
                v-model="editingPost.title"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label for="edit-content" class="block text-sm font-medium text-gray-700 mb-1"
                >内容</label
              >
              <textarea
                id="edit-content"
                v-model="editingPost.content"
                rows="4"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              ></textarea>
            </div>

            <div>
              <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1"
                >カテゴリ</label
              >
              <select
                id="edit-category"
                v-model="editingPost.category"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">一般</option>
                <option value="tech">技術</option>
                <option value="news">ニュース</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="submit"
                :disabled="isUpdating"
                class="flex-1 instagram-button instagram-button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ isUpdating ? '更新中...' : '更新' }}
              </button>
              <button
                type="button"
                @click="closeEditModal"
                class="flex-1 instagram-button instagram-button-secondary"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db, auth } from '@/firebase'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  getDoc,
} from 'firebase/firestore'
import CommentSection from './CommentSection.vue'

const posts = ref([])
const loading = ref(true)
const errorMessage = ref('')
const selectedCategory = ref('')
const showEditModal = ref(false)
const editingPost = ref({})
const isUpdating = ref(false)
const user = ref(null)
const userLikes = ref(new Set())

// ユーザーの認証状態を監視
onMounted(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    user.value = currentUser
    if (currentUser) {
      // ユーザーがいいねした投稿のIDを取得
      fetchUserLikes(currentUser.uid)
    }
  })

  fetchPosts()

  return unsubscribe
})

// ユーザーがいいねした投稿を取得
const fetchUserLikes = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      const userData = userDoc.data()
      userLikes.value = new Set(userData.likedPosts || [])
    }
  } catch (error) {
    console.error('いいね情報の取得に失敗:', error)
  }
}

// 投稿を取得
const fetchPosts = () => {
  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const postsData = []
        querySnapshot.forEach((doc) => {
          postsData.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        posts.value = postsData
        loading.value = false
      },
      (error) => {
        console.error('投稿取得エラー:', error)
        errorMessage.value = '投稿の取得に失敗しました'
        loading.value = false
      },
    )

    // コンポーネントのアンマウント時にリスナーを解除
    return unsubscribe
  } catch (error) {
    console.error('投稿取得エラー:', error)
    errorMessage.value = '投稿の取得に失敗しました'
    loading.value = false
  }
}

// カテゴリでフィルタリング
const filteredPosts = computed(() => {
  if (!selectedCategory.value) {
    return posts.value
  }
  return posts.value.filter((post) => post.category === selectedCategory.value)
})

// カテゴリラベルを取得
const getCategoryLabel = (category) => {
  const labels = {
    general: '一般',
    tech: '技術',
    news: 'ニュース',
    other: 'その他',
  }
  return labels[category] || category
}

// 日付をフォーマット
const formatDate = (timestamp) => {
  if (!timestamp) return '日付不明'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// フィルターを適用
const filterPosts = () => {
  // フィルターは computed で自動的に適用される
}

// 自分の投稿かどうかを判定
const isOwnPost = (post) => {
  const currentUser = auth.currentUser
  return currentUser && post.authorId === currentUser.uid
}

// いいねされているかどうかを判定
const isLiked = (postId) => {
  return userLikes.value.has(postId)
}

// 投稿者の表示名を取得
const getAuthorDisplayName = (authorId) => {
  // 現在のユーザーの場合
  if (user.value && authorId === user.value.uid) {
    return 'あなた'
  }

  // 他のユーザーの場合、投稿データから取得を試行
  const post = posts.value.find((p) => p.authorId === authorId)
  if (post && post.authorDisplayName) {
    return post.authorDisplayName
  }

  // フォールバック: メールアドレスを表示
  const postWithEmail = posts.value.find((p) => p.authorId === authorId)
  if (postWithEmail && postWithEmail.authorEmail) {
    return postWithEmail.authorEmail.split('@')[0]
  }

  return 'ユーザー'
}

// いいねをトグル
const toggleLike = async (postId) => {
  if (!user.value) {
    errorMessage.value = 'ログインが必要です'
    return
  }

  try {
    const postRef = doc(db, 'posts', postId)
    const userRef = doc(db, 'users', user.value.uid)

    if (isLiked(postId)) {
      // いいねを削除
      await updateDoc(postRef, {
        likes: increment(-1),
      })
      await updateDoc(userRef, {
        likedPosts: arrayRemove(postId),
      })
      userLikes.value.delete(postId)
    } else {
      // いいねを追加
      await updateDoc(postRef, {
        likes: increment(1),
      })
      await updateDoc(userRef, {
        likedPosts: arrayUnion(postId),
      })
      userLikes.value.add(postId)
    }
  } catch (error) {
    console.error('いいねの更新に失敗:', error)
    errorMessage.value = 'いいねの更新に失敗しました'
  }
}

// 投稿を編集モードで開く
const editPost = (post) => {
  editingPost.value = { ...post }
  showEditModal.value = true
}

// 編集モーダルを閉じる
const closeEditModal = () => {
  showEditModal.value = false
  editingPost.value = {}
}

// 投稿を更新
const updatePost = async () => {
  try {
    isUpdating.value = true

    const postRef = doc(db, 'posts', editingPost.value.id)
    await updateDoc(postRef, {
      title: editingPost.value.title,
      content: editingPost.value.content,
      category: editingPost.value.category,
      updatedAt: serverTimestamp(),
    })

    console.log('投稿が更新されました')
    closeEditModal()
  } catch (error) {
    console.error('投稿更新エラー:', error)
    errorMessage.value = '投稿の更新に失敗しました'
  } finally {
    isUpdating.value = false
  }
}

// 投稿を削除
const deletePost = async (postId) => {
  if (!confirm('この投稿を削除しますか？')) {
    return
  }

  try {
    const postRef = doc(db, 'posts', postId)
    await deleteDoc(postRef)
    console.log('投稿が削除されました')
  } catch (error) {
    console.error('投稿削除エラー:', error)
    errorMessage.value = '投稿の削除に失敗しました'
  }
}

// 画像関連の関数
const handleImageError = (event) => {
  console.error('画像の読み込みに失敗:', event.target.src)
  event.target.style.display = 'none'
}

const handleImageLoad = (event) => {
  console.log('画像の読み込み完了:', event.target.src)
}

const getImageTypeLabel = (type) => {
  return type === 'r2' ? 'R2' : 'Base64'
}

const getImageTypeBadgeClass = (type) => {
  return type === 'r2' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
}

const formatImageSize = (size) => {
  if (!size) return ''

  if (typeof size === 'string' && size.startsWith('data:')) {
    // Base64の場合、文字列長から推定
    const sizeInBytes = size.length * 0.75
    return formatBytes(sizeInBytes)
  } else {
    // 数値の場合
    return formatBytes(size)
  }
}

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* 画像表示用のスタイル */
.post-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
}

.post-image:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.image-type-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.image-size {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* レスポンシブ対応 */
@media (max-width: 640px) {
  .post-image {
    border-radius: 8px;
  }

  .image-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}

/* 画像読み込み中のプレースホルダー */
.post-image[src=''] {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 投稿内容のスタイル */
.post-content {
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 絵文字付きセクションのスタイル */
.post-content p {
  margin-bottom: 12px;
}

/* 絵文字で始まる行の強調 */
.post-content:deep() {
  /* 各セクションの間隔 */
  white-space: pre-wrap;
}

/* モバイル対応 */
@media (max-width: 640px) {
  .post-content {
    font-size: 0.9rem;
  }
}
</style>
