<template>
  <div class="post-list">
    <div class="header-section">
      <h2>投稿一覧</h2>
      <router-link to="/" class="mypage-btn">マイページ</router-link>
    </div>

    <!-- フィルター -->
    <div class="filter-section">
      <select v-model="selectedCategory" @change="filterPosts">
        <option value="">すべてのカテゴリ</option>
        <option value="general">一般</option>
        <option value="tech">技術</option>
        <option value="news">ニュース</option>
        <option value="other">その他</option>
      </select>
    </div>

    <!-- 投稿一覧 -->
    <div v-if="loading" class="loading">読み込み中...</div>

    <div v-else-if="filteredPosts.length === 0" class="no-posts">投稿がありません</div>

    <div v-else class="posts">
      <div v-for="post in filteredPosts" :key="post.id" class="post-card">
        <div class="post-header">
          <h3 class="post-title">{{ post.title }}</h3>
          <span class="post-category">{{ getCategoryLabel(post.category) }}</span>
        </div>

        <div class="post-content">
          {{ post.content }}
        </div>

        <div class="post-footer">
          <span class="post-author">{{ getAuthorDisplayName(post.authorId) }}</span>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>

        <!-- いいねボタン -->
        <div class="post-actions">
          <div class="like-section">
            <button
              @click="toggleLike(post.id)"
              :class="['like-btn', { liked: isLiked(post.id) }]"
              :disabled="!user"
            >
              <span class="like-icon">❤️</span>
              <span class="like-count">{{ post.likes || 0 }}</span>
            </button>
          </div>

          <!-- 自分の投稿の場合のみ編集・削除ボタンを表示 -->
          <div v-if="isOwnPost(post)" class="edit-delete-section">
            <button @click="editPost(post)" class="edit-btn">編集</button>
            <button @click="deletePost(post.id)" class="delete-btn">削除</button>
          </div>
        </div>

        <!-- コメントセクション -->
        <CommentSection :post-id="post.id" />
      </div>
    </div>

    <!-- エラーメッセージ -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 編集モーダル -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <h3>投稿を編集</h3>
        <form @submit.prevent="updatePost">
          <div class="form-group">
            <label for="edit-title">タイトル:</label>
            <input type="text" id="edit-title" v-model="editingPost.title" required />
          </div>

          <div class="form-group">
            <label for="edit-content">内容:</label>
            <textarea id="edit-content" v-model="editingPost.content" rows="6" required></textarea>
          </div>

          <div class="form-group">
            <label for="edit-category">カテゴリ:</label>
            <select id="edit-category" v-model="editingPost.category" required>
              <option value="general">一般</option>
              <option value="tech">技術</option>
              <option value="news">ニュース</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="submit" :disabled="isUpdating" class="save-btn">
              {{ isUpdating ? '更新中...' : '更新' }}
            </button>
            <button type="button" @click="closeEditModal" class="cancel-btn">キャンセル</button>
          </div>
        </form>
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
</script>

<style scoped>
.post-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-section h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.mypage-btn {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-size: 16px;
  transition: background 0.3s;
}

.mypage-btn:hover {
  background: #0056b3;
}

.filter-section {
  margin-bottom: 20px;
  text-align: center;
}

.filter-section select {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  background: white;
}

.loading,
.no-posts {
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-title {
  margin: 0;
  color: #333;
  font-size: 20px;
}

.post-category {
  background: #007bff;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.post-content {
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
  white-space: pre-wrap;
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #888;
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.post-author {
  font-weight: bold;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.like-section {
  display: flex;
  align-items: center;
}

.like-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.like-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #007bff;
}

.like-btn.liked {
  background: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.like-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.like-icon {
  font-size: 16px;
}

.like-count {
  font-weight: bold;
}

.edit-delete-section {
  display: flex;
  gap: 10px;
}

.edit-btn,
.delete-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.edit-btn {
  background: #ffc107;
  color: #333;
}

.edit-btn:hover {
  background: #e0a800;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

/* モーダルスタイル */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.save-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.save-btn {
  background: #28a745;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #218838;
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  margin-top: 20px;
}
</style>
