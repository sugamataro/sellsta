<template>
  <div class="post-form">
    <h2>新しい投稿を作成</h2>
    <form @submit.prevent="createPost">
      <div class="form-group">
        <label for="title">タイトル:</label>
        <input
          type="text"
          id="title"
          v-model="postData.title"
          placeholder="投稿のタイトルを入力"
          required
        />
      </div>

      <div class="form-group">
        <label for="content">内容:</label>
        <textarea
          id="content"
          v-model="postData.content"
          placeholder="投稿の内容を入力"
          rows="6"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="category">カテゴリ:</label>
        <select id="category" v-model="postData.category" required>
          <option value="">カテゴリを選択</option>
          <option value="general">一般</option>
          <option value="tech">技術</option>
          <option value="news">ニュース</option>
          <option value="other">その他</option>
        </select>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '投稿中...' : '投稿を作成' }}
      </button>
    </form>

    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const postData = ref({
  title: '',
  content: '',
  category: '',
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const createPost = async () => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // 現在のユーザー情報を取得
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('ログインが必要です')
    }

    // Firestoreに投稿を追加
    const docRef = await addDoc(collection(db, 'posts'), {
      title: postData.value.title,
      content: postData.value.content,
      category: postData.value.category,
      authorId: currentUser.uid,
      authorEmail: currentUser.email,
      authorDisplayName: currentUser.displayName || currentUser.email.split('@')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0, // いいね数を初期化
    })

    console.log('投稿が作成されました。ID:', docRef.id)

    // フォームをリセット
    postData.value = {
      title: '',
      content: '',
      category: '',
    }

    successMessage.value = '投稿が正常に作成されました！'
  } catch (error) {
    console.error('投稿作成エラー:', error)
    errorMessage.value = `エラーが発生しました: ${error.message}`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.post-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
}

select {
  background: white;
}

button {
  background: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
}

button:hover:not(:disabled) {
  background: #0056b3;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.success-message {
  color: #28a745;
  background: #d4edda;
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
}

.error-message {
  color: #dc3545;
  background: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin-top: 20px;
  text-align: center;
}
</style>
