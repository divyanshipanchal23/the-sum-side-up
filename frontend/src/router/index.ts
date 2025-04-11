import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Define routes with meta fields for authentication
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import(/* webpackChunkName: "game" */ '../views/GameView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import(/* webpackChunkName: "auth" */ '../views/AuthView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/config',
    name: 'Configuration',
    component: () => import(/* webpackChunkName: "config" */ '../views/ConfigView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import(/* webpackChunkName: "progress" */ '../views/ProgressView.vue'),
    meta: { requiresAuth: true }
  },
  {
    // Catch all route for 404
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import(/* webpackChunkName: "not-found" */ '../views/NotFoundView.vue')
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Scroll behavior restoration
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Check if the route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guestOnly);
  
  // Get auth store
  const authStore = useAuthStore();
  
  // Check if user is authenticated
  const isAuthenticated = authStore.isAuthenticated;
  
  if (requiresAuth && !isAuthenticated) {
    // Redirect to auth page
    next({ name: 'Auth', query: { redirect: to.fullPath } });
  } else if (guestOnly && isAuthenticated) {
    // Redirect to home if trying to access guest-only pages while logged in
    next({ name: 'Home' });
  } else {
    // Proceed normally
    next();
  }
});

export default router; 