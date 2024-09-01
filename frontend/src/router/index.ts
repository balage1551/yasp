import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useTokenStore } from '@/stores/tokenStore'
import { isNotDevMode } from '@/directives/is-dev'
import { Optional } from '@/utils/typeScriptUtils'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: {
      requiresAuth: false
    },
  },
  {
    path: '/editor',
    name: 'Editor',
    component: () => import('../views/EditorView.vue'),
    meta: {
      requiresAuth: false
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const tokenStore = useTokenStore()
  const token = tokenStore.token
  if (!isNotDevMode() && to.fullPath.includes('?vitepreload=true')) {
    console.log('Vite preload')
    next()
  }

  // console.log('ROUTER', to)

  console.log('Router: ', token, to.path)

  if (token && to.path === '/login') {
    next({
      name: 'Dashboard'
    })
  }

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (token === undefined || token == null || token.length === 0) {
      next({
        name: 'Login',
        params: { nextUrl: to.fullPath }
      })
    } else if (!tokenStore.hasPermission(to.meta.permission as unknown as Optional<string>)) {
      next({
        name: 'Login',
        params: { nextUrl: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
