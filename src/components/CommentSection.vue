<template>
  <div class="comment-section">
    <h4>コメント ({{ comments.length }})</h4>

    <!-- コメント入力フォーム -->
    <div v-if="user" class="comment-form">
      <textarea
        v-model="newComment"
        placeholder="コメントを入力..."
        rows="3"
        class="comment-input"
      ></textarea>
      <button
        @click="addComment"
        :disabled="!newComment.trim() || isSubmitting"
        class="comment-submit-btn"
      >
        {{ isSubmitting ? '送信中...' : 'コメントを投稿' }}
      </button>
    </div>

    <!-- ログインしていない場合のメッセージ -->
    <div v-else class="login-message">
      <p>コメントするにはログインが必要です</p>
    </div>

    <!-- コメント一覧 -->
    <div class="comments-list">
      <div v-if="loading" class="loading">コメントを読み込み中...</div>

      <div v-else-if="comments.length === 0" class="no-comments">まだコメントがありません</div>

      <div v-else class="comments">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ getAuthorDisplayName(comment.authorId) }}</span>
            <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
          </div>

          <div class="comment-content">
            {{ comment.content }}
          </div>

          <!-- 自分のコメントの場合のみ削除ボタンを表示 -->
          <div v-if="isOwnComment(comment)" class="comment-actions">
            <button @click="deleteComment(comment.id)" class="delete-comment-btn">削除</button>
          </div>
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
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const props = defineProps({
  postId: {
    type: String,
    required: true,
  },
})

const comments = ref([])
const newComment = ref('')
const loading = ref(true)
const isSubmitting = ref(false)
const user = ref(null)

// ユーザーの認証状態を監視
onMounted(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
    user.value = currentUser
  })

  fetchComments()

  return unsubscribe
})

// コメントを取得
const fetchComments = () => {
  try {
    const q = query(collection(db, 'posts', props.postId, 'comments'), orderBy('createdAt', 'asc'))

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const commentsData = []
        querySnapshot.forEach((doc) => {
          commentsData.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        comments.value = commentsData
        loading.value = false
      },
      (error) => {
        console.error('コメント取得エラー:', error)
        loading.value = false
      },
    )

    return unsubscribe
  } catch (error) {
    console.error('コメント取得エラー:', error)
    loading.value = false
  }
}

// コメントを追加
const addComment = async () => {
  if (!newComment.value.trim() || !user.value) return

  try {
    isSubmitting.value = true

    const commentData = {
      content: newComment.value.trim(),
      authorId: user.value.uid,
      authorEmail: user.value.email,
      authorDisplayName: user.value.displayName || user.value.email.split('@')[0],
      createdAt: serverTimestamp(),
    }

    await addDoc(collection(db, 'posts', props.postId, 'comments'), commentData)

    // フォームをリセット
    newComment.value = ''
  } catch (error) {
    console.error('コメント投稿エラー:', error)
    alert('コメントの投稿に失敗しました')
  } finally {
    isSubmitting.value = false
  }
}

// コメントを削除
const deleteComment = async (commentId) => {
  if (!confirm('このコメントを削除しますか？')) return

  try {
    await deleteDoc(doc(db, 'posts', props.postId, 'comments', commentId))
  } catch (error) {
    console.error('コメント削除エラー:', error)
    alert('コメントの削除に失敗しました')
  }
}

// 自分のコメントかどうかを判定
const isOwnComment = (comment) => {
  return user.value && comment.authorId === user.value.uid
}

// 投稿者の表示名を取得
const getAuthorDisplayName = (authorId) => {
  if (user.value && authorId === user.value.uid) {
    return 'あなた'
  }
  return 'ユーザー'
}

// 日付をフォーマット
const formatDate = (timestamp) => {
  if (!timestamp) return '日付不明'

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.comment-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.comment-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.comment-form {
  margin-bottom: 20px;
}

.comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  resize: vertical;
  margin-bottom: 10px;
}

.comment-submit-btn {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.comment-submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.comment-submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-message {
  text-align: center;
  padding: 20px;
  color: #666;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 20px;
}

.comments-list {
  margin-top: 15px;
}

.loading,
.no-comments {
  text-align: center;
  padding: 20px;
  color: #666;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-item {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 3px solid #007bff;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.comment-date {
  color: #888;
  font-size: 12px;
}

.comment-content {
  color: #555;
  line-height: 1.5;
  margin-bottom: 10px;
  white-space: pre-wrap;
}

.comment-actions {
  text-align: right;
}

.delete-comment-btn {
  background: #dc3545;
  color: white;
  padding: 4px 8px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.delete-comment-btn:hover {
  background: #c82333;
}
</style>
