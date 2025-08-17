<template>
  <div class="data-form">
    <!-- ヘッダー -->
    <div class="form-header">
      <h2>データを追加</h2>
      <router-link to="/" class="instagram-button instagram-button-primary">
        マイページ
      </router-link>
    </div>
    <form @submit.prevent="addData">
      <div class="form-group">
        <label for="name">名前:</label>
        <input type="text" id="name" v-model="formData.name" placeholder="名前を入力" required />
      </div>

      <div class="form-group">
        <label for="email">メール:</label>
        <input
          type="email"
          id="email"
          v-model="formData.email"
          placeholder="メールアドレスを入力"
          required
        />
      </div>

      <div class="form-group">
        <label for="message">メッセージ:</label>
        <textarea
          id="message"
          v-model="formData.message"
          placeholder="メッセージを入力"
          rows="3"
          required
        ></textarea>
      </div>

      <button type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '送信中...' : 'データを追加' }}
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
import { db } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const formData = ref({
  name: '',
  email: '',
  message: '',
})

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const addData = async () => {
  try {
    isSubmitting.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Firestoreにデータを追加
    const docRef = await addDoc(collection(db, 'users'), {
      name: formData.value.name,
      email: formData.value.email,
      message: formData.value.message,
      createdAt: serverTimestamp(),
    })

    console.log('データが追加されました。ID:', docRef.id)

    // フォームをリセット
    formData.value = {
      name: '',
      email: '',
      message: '',
    }

    successMessage.value = 'データが正常に追加されました！'
  } catch (error) {
    console.error('データ追加エラー:', error)
    errorMessage.value = `エラーが発生しました: ${error.message}`
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.data-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e5e7eb;
}

.form-header h2 {
  margin: 0;
  color: #1f2937;
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
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

textarea {
  resize: vertical;
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
