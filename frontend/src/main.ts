import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/authStore'

// Performance metrics in development mode
if (import.meta.env.DEV) {
  // Record the start time
  const startTime = performance.now();
  
  // Listen for when the app is mounted
  window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`App loaded in ${loadTime.toFixed(2)}ms`);
  });
}

// Create Pinia instance
const pinia = createPinia()

// Create app instance
const app = createApp(App)

// Use Pinia and router
app.use(pinia)
app.use(router)

// Initialize auth and wait for it before mounting the app
const authStore = useAuthStore()

// Initialize the auth state
authStore.init().then(() => {
  // Mount the app once auth is initialized
  app.mount('#app')
})
