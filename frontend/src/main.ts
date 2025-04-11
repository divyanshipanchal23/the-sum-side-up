import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/authStore'

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
