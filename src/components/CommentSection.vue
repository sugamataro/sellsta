<template>
  <div class="border-t border-gray-100 pt-4">
    <h4 class="text-sm font-semibold text-gray-900 mb-4">コメント ({{ comments.length }})</h4>

    <!-- コメント入力フォーム -->
    <div v-if="user" class="mb-6">
      <div class="flex space-x-3">
        <div
          class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-semibold"
        >
          {{ user.email?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="flex-1">
          <textarea
            v-model="newComment"
            placeholder="コメントを追加..."
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          ></textarea>
          <div class="flex justify-end mt-2">
            <button
              @click="addComment"
              :disabled="!newComment.trim() || isSubmitting"
              class="instagram-button instagram-button-primary text-sm px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? '送信中...' : '投稿' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ログインしていない場合のメッセージ -->
    <div v-else class="mb-6 p-4 bg-gray-50 rounded-lg text-center">
      <p class="text-gray-500 text-sm">コメントするにはログインが必要です</p>
    </div>

    <!-- コメント一覧 -->
    <div>
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto"></div>
      </div>

      <div v-else-if="comments.length === 0" class="text-center py-4">
        <p class="text-gray-400 text-sm">まだコメントがありません</p>
      </div>

      <div v-else class="space-y-4">
        <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
          <div
            class="w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          >
            {{ getAuthorDisplayName(comment.authorId).charAt(0).toUpperCase() }}
          </div>

          <div class="flex-1">
            <div class="bg-gray-50 rounded-2xl px-4 py-2">
              <div class="flex items-center justify-between mb-1">
                <span class="font-semibold text-sm text-gray-900">
                  {{ getAuthorDisplayName(comment.authorId) }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>

              <p class="text-sm text-gray-700 leading-relaxed">
                {{ comment.content }}
              </p>
            </div>

            <!-- 自分のコメントの場合のみ削除ボタンを表示 -->
            <div v-if="isOwnComment(comment)" class="mt-2 ml-4">
              <button
                @click="deleteComment(comment.id)"
                class="text-xs text-red-500 hover:text-red-700 font-medium"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
