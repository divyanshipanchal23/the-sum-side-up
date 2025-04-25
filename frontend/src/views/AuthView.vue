<template>
  <div class="game-auth-container">
    <!-- Animated background elements -->
    <div class="floating-elements">
      <div v-for="n in 12" :key="`element-${n}`" 
           class="floating-element" 
           :class="`element-${n}`"
           :style="getRandomStyle()">
        {{ getRandomMathSymbol() }}
      </div>
    </div>
    
    <div class="auth-card">
      <div class="title-container">
        <h1 class="game-title">The Sum Side Up</h1>
      </div>
      
      <h2 class="auth-heading">
        {{ authMode === 'login' ? 'Sign in to your account' : authMode === 'register' ? 'Create a new account' : 'Reset your password' }}
      </h2>
      
      <p class="toggle-text">
        {{ 
          authMode === 'login' ? 'Or ' : 
          authMode === 'register' ? 'Already have an account? ' : 
          'Remember your password? ' 
        }}
        <button 
          @click="toggleAuthMode" 
          class="toggle-button"
        >
          {{ 
            authMode === 'login' ? 'Create a new account' : 
            authMode === 'register' ? 'Sign in instead' : 
            'Sign in instead' 
          }}
        </button>
      </p>
      
      <!-- Alert for errors -->
      <div v-if="error" class="alert error-alert" role="alert">
        <div class="alert-icon">✕</div>
        <p class="alert-text">{{ error }}</p>
      </div>
      
      <!-- Success message -->
      <div v-if="successMessage" class="alert success-alert" role="alert">
        <div class="alert-icon">✓</div>
        <p class="alert-text">{{ successMessage }}</p>
      </div>
      
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="input-group">
          <div class="input-container">
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="auth-input"
              placeholder="Email address"
              :disabled="isLoading"
              aria-label="Email address"
            />
          </div>
          
          <div class="input-container" v-if="authMode !== 'reset'">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="auth-input"
              placeholder="Password"
              :disabled="isLoading"
              aria-label="Password"
            />
          </div>
          
          <div class="input-container" v-if="authMode === 'register'">
            <label for="confirm-password" class="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              v-model="confirmPassword"
              class="auth-input"
              placeholder="Confirm Password"
              :disabled="isLoading"
              aria-label="Confirm Password"
            />
          </div>
        </div>

        <div v-if="authMode === 'login'" class="forgot-password">
          <button 
            type="button" 
            @click="authMode = 'reset'" 
            class="forgot-button"
            :disabled="isLoading"
          >
            Forgot your password?
          </button>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isLoading"
          aria-live="polite"
        >
          <span class="button-icon" aria-hidden="true">
            <svg v-if="!isLoading" class="lock-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
          {{ isLoading ? 'Processing...' : buttonText }}
        </button>
      </form>
      
      <!-- Back to home link -->
      <div class="back-home">
        <router-link to="/" class="home-button">
          Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRoute, useRouter } from 'vue-router';
import soundService from '../services/soundService';

// Get the route and router
const route = useRoute();
const router = useRouter();

// Get the auth store
const authStore = useAuthStore();

// Form data
const authMode = ref<'login' | 'register' | 'reset'>('login');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

// Random style generator for floating elements
const getRandomStyle = () => {
  const size = Math.floor(Math.random() * 30) + 20; // 20-50px
  const top = Math.floor(Math.random() * 80) + 10; // 10-90%
  const left = Math.floor(Math.random() * 80) + 10; // 10-90%
  const animationDuration = Math.floor(Math.random() * 20) + 10; // 10-30s
  const delay = Math.floor(Math.random() * 10); // 0-10s
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${delay}s`
  };
};

// Random math symbol generator
const getRandomMathSymbol = () => {
  const symbols = ['+', '=', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return symbols[Math.floor(Math.random() * symbols.length)];
};

// Computed properties
const isLoading = computed(() => authStore.isLoading);
const buttonText = computed(() => {
  switch (authMode.value) {
    case 'login': return 'Sign in';
    case 'register': return 'Register';
    case 'reset': return 'Reset Password';
    default: return 'Submit';
  }
});

// Toggle between login and register modes
function toggleAuthMode() {
  // Clear form data and errors
  error.value = null;
  successMessage.value = null;
  
  // Play sound
  soundService.play('click');
  
  if (authMode.value === 'login') {
    authMode.value = 'register';
  } else {
    authMode.value = 'login';
  }
}

// Handle form submission
async function handleSubmit() {
  error.value = null;
  successMessage.value = null;
  
  try {
    if (authMode.value === 'login') {
      await authStore.login(email.value, password.value);
      soundService.play('correct');
      
      // Redirect to the originally requested page or home
      const redirectPath = route.query.redirect as string || '/';
      router.push(redirectPath);
    } else if (authMode.value === 'register') {
      // Validate password confirmation
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match.';
        return;
      }
      
      await authStore.register(email.value, password.value);
      soundService.play('correct');
      
      // Redirect to home
      router.push('/');
    } else if (authMode.value === 'reset') {
      await authStore.resetPassword(email.value);
      soundService.play('correct');
      successMessage.value = 'Password reset email sent. Please check your inbox.';
      
      // Clear email field
      email.value = '';
    }
  } catch (err) {
    soundService.play('incorrect');
    error.value = err instanceof Error ? err.message : 'An unknown error occurred';
    console.error('Auth error:', err);
  }
}

// Handle Google Sign In - removed

// Check for redirect query parameter
onMounted(() => {
  // Check if there's a mode parameter in the URL
  const mode = route.query.mode as string;
  if (mode === 'register') {
    authMode.value = 'register';
  } else if (mode === 'reset') {
    authMode.value = 'reset';
  }
});
</script>

<style scoped>
.game-auth-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #F0EBFF 0%, #E6F7FF 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Floating background elements */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  animation: float linear infinite;
  opacity: 0.6;
}

.element-1, .element-5, .element-9 { background-color: #4A90E2; }
.element-2, .element-6, .element-10 { background-color: #FFD166; }
.element-3, .element-7, .element-11 { background-color: #06D6A0; }
.element-4, .element-8, .element-12 { background-color: #EF476F; }

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
  }
}

.auth-card {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  padding: 30px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title-container {
  margin-bottom: 20px;
  text-align: center;
}

.game-title {
  font-size: 2rem;
  margin: 0;
  background: linear-gradient(90deg, #4A90E2, #9370DB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-bounce 2s ease-in-out infinite alternate;
}

.auth-heading {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.toggle-text {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-bottom: 20px;
}

.toggle-button {
  background-color: transparent;
  color: #4A90E2;
  border: none;
  font-weight: medium;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0;
  margin: 0;
  text-decoration: underline;
}

.toggle-button:hover {
  color: #9370DB;
}

.alert {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.error-alert {
  background-color: #FFF5F5;
  border-left: 4px solid #EF476F;
}

.success-alert {
  background-color: #F0FFF4;
  border-left: 4px solid #06D6A0;
}

.alert-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  font-weight: bold;
}

.error-alert .alert-icon {
  background-color: #EF476F;
  color: white;
}

.success-alert .alert-icon {
  background-color: #06D6A0;
  color: white;
}

.alert-text {
  margin: 0;
  color: #333;
  font-size: 0.9rem;
}

.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-container {
  width: 100%;
}

.auth-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.auth-input:focus {
  outline: none;
  border-color: #4A90E2;
}

.forgot-password {
  text-align: right;
  margin-top: -10px;
}

.forgot-button {
  background-color: transparent;
  color: #4A90E2;
  border: none;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 5px;
  transition: color 0.2s;
}

.forgot-button:hover {
  color: #9370DB;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  background-color: #4A90E2;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
}

.submit-button:hover {
  background-color: #3A80D2;
}

.submit-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
}

.button-icon {
  position: absolute;
  left: 15px;
  display: flex;
  align-items: center;
}

.lock-icon, .spinner-icon {
  width: 20px;
  height: 20px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

.back-home {
  margin-top: 30px;
  text-align: center;
}

.home-button {
  padding: 10px 20px;
  background-color: transparent;
  color: #718096;
  border: 1px solid #CBD5E0;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
}

.home-button:hover {
  background-color: #F7FAFC;
  color: #4A5568;
}

@keyframes title-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 20px;
  }
  
  .game-title {
    font-size: 1.8rem;
  }
  
  .auth-heading {
    font-size: 1.3rem;
  }
}
</style> 