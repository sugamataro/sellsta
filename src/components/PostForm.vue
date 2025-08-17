<template>
  <div class="post-form">
    <!-- ヘッダー -->
    <div class="form-header">
      <h2>新しい投稿を作成</h2>
      <router-link to="/" class="instagram-button instagram-button-primary">
        マイページ
      </router-link>
    </div>
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

      <!-- 画像アップロード -->
      <div class="form-group">
        <label for="image">画像:</label>
        <input
          type="file"
          id="image"
          @change="handleImageSelect"
          accept="image/*"
          class="file-input"
        />
        <div v-if="selectedImage" class="image-preview">
          <img :src="imagePreview" alt="選択された画像" />
          <button type="button" @click="removeImage" class="remove-image">削除</button>
        </div>
      </div>

      <!-- お客様情報 -->
      <div class="form-group">
        <label for="customerInfo">お客様情報 <span class="required">*</span>:</label>
        <div class="customer-info-group">
          <select id="customerGender" v-model="postData.customerGender" required>
            <option value="">性別を選択</option>
            <option value="男性">男性</option>
            <option value="女性">女性</option>
            <option value="その他">その他</option>
          </select>
          <select id="customerAge" v-model="postData.customerAge" required>
            <option value="">年代を選択</option>
            <option value="10代">10代</option>
            <option value="20代">20代</option>
            <option value="30代">30代</option>
            <option value="40代">40代</option>
            <option value="50代">50代</option>
            <option value="60代以上">60代以上</option>
          </select>
        </div>
      </div>

      <!-- 接客のポイント -->
      <div class="form-group">
        <label for="servicePoints">接客のポイント <span class="required">*</span>:</label>
        <textarea
          id="servicePoints"
          v-model="postData.servicePoints"
          placeholder="例：声かけのタイミング、試着提案、保証説明など"
          rows="3"
          required
        ></textarea>
      </div>

      <!-- 購入の決め手 -->
      <div class="form-group">
        <label for="purchaseDecision">購入の決め手 <span class="required">*</span>:</label>
        <textarea
          id="purchaseDecision"
          v-model="postData.purchaseDecision"
          placeholder="例：着心地、デザイン、価格、用途など"
          rows="3"
          required
        ></textarea>
      </div>

      <!-- 自由コメント -->
      <div class="form-group">
        <label for="freeComment">自由コメント:</label>
        <textarea
          id="freeComment"
          v-model="postData.freeComment"
          placeholder="その他のコメントがあれば記入してください"
          rows="3"
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
import { uploadImageToR2 } from '@/cloudflare'

const postData = ref({
  title: '',
  category: '',
  customerGender: '',
  customerAge: '',
  servicePoints: '',
  purchaseDecision: '',
  freeComment: '',
})

// 4つの項目から投稿内容を生成する関数
const generatePostContent = () => {
  const sections = []

  // お客様情報
  if (postData.value.customerGender && postData.value.customerAge) {
    sections.push(`👤 お客様情報: ${postData.value.customerGender} / ${postData.value.customerAge}`)
  }

  // 接客のポイント
  if (postData.value.servicePoints.trim()) {
    sections.push(`✨ 接客のポイント:\n${postData.value.servicePoints.trim()}`)
  }

  // 購入の決め手
  if (postData.value.purchaseDecision.trim()) {
    sections.push(`💡 購入の決め手:\n${postData.value.purchaseDecision.trim()}`)
  }

  // 自由コメント
  if (postData.value.freeComment.trim()) {
    sections.push(`💬 コメント:\n${postData.value.freeComment.trim()}`)
  }

  return sections.join('\n\n')
}

const selectedImage = ref(null)
const imagePreview = ref('')

const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    // ファイルサイズチェック（10MBまで）
    const maxSizeInMB = 10
    const fileSizeInMB = file.size / 1024 / 1024

    if (fileSizeInMB > maxSizeInMB) {
      errorMessage.value = `画像ファイルは${maxSizeInMB}MB以下である必要があります。現在のサイズ: ${fileSizeInMB.toFixed(2)}MB`
      event.target.value = '' // ファイル選択をクリア
      return
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = '対応している画像形式: JPEG, PNG, WebP'
      event.target.value = ''
      return
    }

    selectedImage.value = file
    errorMessage.value = '' // エラーメッセージをクリア

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
    }
    reader.readAsDataURL(file)

    console.log(`選択された画像: ${file.name}, サイズ: ${fileSizeInMB.toFixed(2)}MB`)
  }
}

const removeImage = () => {
  selectedImage.value = null
  imagePreview.value = ''
  const fileInput = document.getElementById('image')
  if (fileInput) fileInput.value = ''
}

const uploadImage = async () => {
  if (!selectedImage.value) return null

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error('ユーザーが認証されていません')
    }

    console.log('画像アップロード開始:', selectedImage.value.name)

    // まずR2へのアップロードを試行（エラー時は自動的にBase64にフォールバック）
    const uploadResult = await uploadImageToR2(selectedImage.value, currentUser.uid)
    console.log('画像アップロード完了:', uploadResult.type)

    return uploadResult
  } catch (error) {
    console.error('画像アップロードエラー:', error)
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
  }
}

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

    // 画像をアップロード
    let imageData = null
    if (selectedImage.value) {
      imageData = await uploadImage()
    }

    // 4つの項目から投稿内容を生成
    const generatedContent = generatePostContent()

    // Firestoreに投稿を追加（画像メタデータのみ保存）
    const postDoc = {
      title: postData.value.title,
      content: generatedContent, // 生成された内容を使用
      category: postData.value.category,
      // 元の項目も保存（編集時に使用）
      customerGender: postData.value.customerGender,
      customerAge: postData.value.customerAge,
      servicePoints: postData.value.servicePoints,
      purchaseDecision: postData.value.purchaseDecision,
      freeComment: postData.value.freeComment,
      authorId: currentUser.uid,
      authorEmail: currentUser.email,
      authorDisplayName: currentUser.displayName || currentUser.email.split('@')[0],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      likes: 0, // いいね数を初期化
    }

    // 画像データがある場合はメタデータを追加
    if (imageData) {
      postDoc.image = {
        type: imageData.type, // 'r2' または 'base64'
        url: imageData.url,
        size: imageData.size,
        originalName: imageData.originalName,
        uploadedAt: imageData.uploadedAt,
        ...(imageData.fileName && { fileName: imageData.fileName }), // R2の場合のみ
      }
    }

    const docRef = await addDoc(collection(db, 'posts'), postDoc)

    console.log('投稿が作成されました。ID:', docRef.id)

    // フォームをリセット
    postData.value = {
      title: '',
      category: '',
      customerGender: '',
      customerAge: '',
      servicePoints: '',
      purchaseDecision: '',
      freeComment: '',
    }
    removeImage()

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
  position: relative;
  z-index: 0;
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
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  position: relative;
  z-index: 1;
  background: white;
  box-sizing: border-box;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  z-index: 10;
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

.required {
  color: #dc3545;
  font-weight: bold;
}

.file-input {
  padding: 8px;
  border: 2px dashed #ddd;
  border-radius: 4px;
  background: #f9f9f9;
  cursor: pointer;
}

.file-input:hover {
  border-color: #007bff;
  background: #f0f8ff;
}

.image-preview {
  margin-top: 10px;
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-image:hover {
  background: #c82333;
}

.customer-info-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.customer-info-group select {
  margin: 0;
}
</style>
