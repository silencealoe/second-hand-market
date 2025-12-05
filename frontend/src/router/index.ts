import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      redirect: '/products',
      children: [
        {
          path: '/products',
          name: 'Products',
          component: () => import('@/views/Products.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: '/product/:id',
          name: 'ProductDetail',
          component: () => import('@/views/ProductDetail.vue'),
          meta: { requiresAuth: false }
        },
        {
          path: '/publish',
          name: 'Publish',
          component: () => import('@/views/Publish.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/Profile.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/my-products',
          name: 'MyProducts',
          component: () => import('@/views/MyProducts.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

export default router

