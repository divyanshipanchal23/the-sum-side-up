<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ authMode === 'login' ? 'Sign in to your account' : authMode === 'register' ? 'Create your account' : 'Reset your password' }}
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          {{ 
            authMode === 'login' ? 'Or ' : 
            authMode === 'register' ? 'Already have an account? ' : 
            'Remember your password? ' 
          }}
          <button 
            @click="toggleAuthMode" 
            class="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline transition ease-in-out duration-150"
          >
            {{ 
              authMode === 'login' ? 'create a new account' : 
              authMode === 'register' ? 'sign in instead' : 
              'sign in instead' 
            }}
          </button>
        </p>
      </div>
      
      <!-- Alert for errors -->
      <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4" role="alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>
      
      <!-- Success message -->
      <div v-if="successMessage" class="bg-green-50 border-l-4 border-green-400 p-4 mb-4" role="alert">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              :disabled="isLoading"
              aria-label="Email address"
            />
          </div>
          <div v-if="authMode !== 'reset'">
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              :class="{ 'rounded-b-md': authMode === 'login', 'rounded-b-none': authMode === 'register' }"
              :disabled="isLoading"
              aria-label="Password"
            />
          </div>
          <div v-if="authMode === 'register'">
            <label for="confirm-password" class="sr-only">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              v-model="confirmPassword"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Confirm Password"
              :disabled="isLoading"
              aria-label="Confirm Password"
            />
          </div>
        </div>

        <div v-if="authMode === 'login'" class="flex items-center justify-end">
          <div class="text-sm">
            <button 
              type="button" 
              @click="authMode = 'reset'" 
              class="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
              :disabled="isLoading"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isLoading"
            aria-live="polite"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3" aria-hidden="true">
              <svg v-if="!isLoading" class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
              <svg v-else class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Processing...' : buttonText }}
          </button>
        </div>
      </form>
      
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>
        
        <div class="mt-6">
          <button
            type="button"
            @click="handleGoogleSignIn"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="isLoading"
          >
            <span class="sr-only">Sign in with Google</span>
            <svg class="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Back to home link -->
      <div class="text-center mt-4">
        <router-link to="/" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
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
      
      // Show success message
      successMessage.value = 'Password reset email sent. Please check your inbox.';
      
      // Clear form
      email.value = '';
    }
  } catch (e: any) {
    error.value = e.message || 'Authentication failed';
    soundService.play('incorrect');
  }
}

// Handle Google sign-in
async function handleGoogleSignIn() {
  error.value = null;
  successMessage.value = null;
  
  try {
    await authStore.loginWithGoogle();
    soundService.play('correct');
    
    // Redirect to the originally requested page or home
    const redirectPath = route.query.redirect as string || '/';
    router.push(redirectPath);
  } catch (e: any) {
    error.value = e.message || 'Google sign-in failed';
    soundService.play('incorrect');
  }
}

// Check for redirect param
onMounted(() => {
  if (route.query.redirect) {
    // Default to login if redirected due to authentication requirement
    authMode.value = 'login';
  }
});
</script> 