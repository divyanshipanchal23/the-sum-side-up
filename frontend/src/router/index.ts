import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// Define routes with meta fields for authentication
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/GameView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/AuthView.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/config',
    name: 'Configuration',
    component: () => import('../views/ConfigView.vue'),
    meta: { requiresAuth: true }
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
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