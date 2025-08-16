import { createRouter, createWebHistory } from 'vue-router'
import UserLogin from '@/UserLogin.vue'
import DataForm from '@/components/DataForm.vue'

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
  ],
})

export default router
