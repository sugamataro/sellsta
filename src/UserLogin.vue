<template>
  <div class="login">
    <!-- 未ログイン状態 -->
    <div v-if="!user" class="login-form">
      <h1>ログインしてみて</h1>
      <form @submit.prevent="login">
        <input type="email" v-model="email" placeholder="メールアドレス" />
        <input type="password" v-model="password" placeholder="パスワード" />
        <button type="submit">ログイン</button>
      </form>
      <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    </div>

    <!-- ログイン済み状態 -->
    <div v-else class="user-info">
      <h1>ようこそ！</h1>
      <div class="user-details">
        <p><strong>メールアドレス:</strong> {{ user.email }}</p>
        <p><strong>ユーザーID:</strong> {{ user.uid }}</p>
      </div>
      <button @click="logout" class="logout-btn">ログアウト</button>
    </div>

    <div class="navigation">
      <router-link to="/add-data" class="nav-link"> データを追加する </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '@/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const user = ref(null)
let unsubscribe = null

// ログイン処理
const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    console.log('ログイン成功:', userCredential.user)
    errorMessage.value = ''
    email.value = ''
    password.value = ''
  } catch (error) {
    console.error('ログインエラー:', error)
    errorMessage.value = error.message
  }
}

// ログアウト処理
const logout = async () => {
  try {
    await signOut(auth)
    console.log('ログアウト成功')
  } catch (error) {
    console.error('ログアウトエラー:', error)
  }
}

// 認証状態の監視
onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    console.log('認証状態変更:', currentUser ? 'ログイン済み' : '未ログイン')
  })
})

// コンポーネントのアンマウント時にリスナーを解除
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.login {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
}

.login-form,
.user-info {
  text-align: center;
}

input {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

button {
  background-color: #007bff;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 5px;
}

button:hover {
  background-color: #0056b3;
}

.logout-btn {
  background-color: #dc3545;
}

.logout-btn:hover {
  background-color: #c82333;
}

.user-details {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  text-align: left;
}

.user-details p {
  margin: 10px 0;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.navigation {
  margin-top: 20px;
  text-align: center;
}

.nav-link {
  display: inline-block;
  padding: 10px 20px;
  background: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.nav-link:hover {
  background: #218838;
}
</style>
