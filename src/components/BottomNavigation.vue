<template>
  <div class="bottom-navigation">
    <div class="nav-container">
      <!-- ホーム -->
      <router-link 
        to="/home" 
        class="nav-item"
        :class="{ active: $route.path === '/home' }"
      >
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </div>
        <span class="nav-label">ホーム</span>
      </router-link>

      <!-- 接客マニュアル -->
      <router-link 
        to="/manual" 
        class="nav-item"
        :class="{ active: $route.path === '/manual' }"
      >
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <span class="nav-label">マニュアル</span>
      </router-link>

      <!-- 投稿作成 -->
      <router-link 
        to="/create-post" 
        class="nav-item create-post"
        :class="{ active: $route.path === '/create-post' }"
      >
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <span class="nav-label">投稿</span>
      </router-link>

      <!-- 通知 -->
      <router-link 
        to="/notifications" 
        class="nav-item"
        :class="{ active: $route.path === '/notifications' }"
      >
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <span class="nav-label">通知</span>
      </router-link>

      <!-- プロフィール -->
      <router-link 
        to="/profile" 
        class="nav-item"
        :class="{ active: $route.path === '/profile' }"
      >
        <div class="nav-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <span class="nav-label">プロフィール</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
  padding: 8px 16px;
  height: 60px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 48px;
}

.nav-item:hover {
  color: #3b82f6;
  transform: translateY(-1px);
}

.nav-item.active {
  color: #3b82f6;
}

.nav-item.create-post {
  background: linear-gradient(45deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  margin-top: -8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.nav-item.create-post:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.nav-item.create-post.active {
  color: white;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2px;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

.nav-item.create-post .nav-label {
  font-size: 9px;
  margin-top: 2px;
}

/* モバイル対応 */
@media (max-width: 480px) {
  .nav-container {
    padding: 6px 12px;
    height: 56px;
  }
  
  .nav-item {
    padding: 2px 4px;
    min-width: 40px;
  }
  
  .nav-item.create-post {
    width: 52px;
    height: 52px;
  }
  
  .nav-label {
    font-size: 9px;
  }
}

/* タブレット対応 */
@media (min-width: 768px) {
  .nav-container {
    max-width: 600px;
    padding: 12px 24px;
  }
}
</style>
