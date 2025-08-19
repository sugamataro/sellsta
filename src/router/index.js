import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '@/firebase'
import UserLogin from '@/UserLogin.vue'
import DataForm from '@/components/DataForm.vue'
import PostForm from '@/components/PostForm.vue'
import PostList from '@/components/PostList.vue'
import Home from '@/views/Home.vue'
import Manual from '@/views/Manual.vue'
import Notifications from '@/views/Notifications.vue'
import Profile from '@/views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'UserLogin',
      component: UserLogin,
      meta: { requiresGuest: true },
    },
    {
      path: '/home',
      name: 'Home',
      component: Home,
      meta: { requiresAuth: true },
    },
    {
      path: '/manual',
      name: 'Manual',
      component: Manual,
      meta: { requiresAuth: true },
    },
    {
      path: '/create-post',
      name: 'PostForm',
      component: PostForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'Notifications',
      component: Notifications,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/add-data',
      name: 'DataForm',
      component: DataForm,
      meta: { requiresAuth: true },
    },
    {
      path: '/posts',
      name: 'PostList',
      component: PostList,
      meta: { requiresAuth: true },
    },
  ],
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const currentUser = auth.currentUser
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  if (requiresAuth && !currentUser) {
    // 認証が必要なページでログインしていない場合
    next('/')
  } else if (requiresGuest && currentUser) {
    // ゲスト専用ページでログインしている場合
    next('/home')
  } else {
    next()
  }
})

export default router
