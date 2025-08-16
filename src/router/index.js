import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '@/UserLogin.vue'
import DataForm from '@/components/DataForm.vue'
import PostForm from '@/components/PostForm.vue'
import PostList from '@/components/PostList.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'UserLogin',
      component: UserLogin,
    },
    {
      path: '/add-data',
      name: 'DataForm',
      component: DataForm,
    },
    {
      path: '/create-post',
      name: 'PostForm',
      component: PostForm,
    },
    {
      path: '/posts',
      name: 'PostList',
      component: PostList,
    },
  ],
})

export default router
