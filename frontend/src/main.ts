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

// Mount the app immediately
app.mount('#app')

// Initialize auth state in the background
const authStore = useAuthStore()
authStore.init().then(() => {
  console.log('Auth initialized')
}).catch(error => {
  console.error('Error initializing auth:', error)
})
