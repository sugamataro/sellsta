<template>
  <div class="main-layout">
    <!-- メインコンテンツ -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- ボトムナビゲーション（認証済みユーザーのみ） -->
    <BottomNavigation v-if="isAuthenticated" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import BottomNavigation from '@/components/BottomNavigation.vue'

const isAuthenticated = ref(false)
let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthStateChanged(auth, (user) => {
    isAuthenticated.value = !!user
  })
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
}

/* ボトムナビゲーションがある場合のマージン調整 */
.main-content {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
