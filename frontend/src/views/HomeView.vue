<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
      <h1 class="text-4xl font-bold text-center text-indigo-600 mb-6">Balance Scale Addition Game</h1>
      <p class="text-lg text-gray-700 mb-4 text-center">
        Learn addition through visual intuition and interactive balance scales!
      </p>
      
      <!-- Debug information -->
      <div class="mb-6 p-4 bg-gray-100 rounded">
        <h3 class="font-semibold">App Status:</h3>
        <div class="mt-2">
          <p :class="firebaseStatus.includes('failed') ? 'text-red-500' : 'text-green-500'">
            <strong>Firebase:</strong> {{ firebaseStatus }}
          </p>
          <p class="mt-1">
            <strong>Auth:</strong> {{ isAuthenticated ? 'Logged in' : 'Not logged in' }}
          </p>
          <div v-if="errorMessage" class="mt-2 p-2 bg-red-100 text-red-800 rounded">
            <strong>Error:</strong> {{ errorMessage }}
          </div>
        </div>
      </div>
      
      <div v-if="isAuthenticated" class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <router-link 
          to="/game" 
          class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-indigo-600 hover:bg-gray-100 transition duration-300 text-center"
        >
          Start Playing
        </router-link>
        
        <router-link 
          to="/config" 
          class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-green-600 hover:bg-gray-100 transition duration-300 text-center"
        >
          Configure Games
        </router-link>
        
        <router-link 
          to="/progress" 
          class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-purple-600 hover:bg-gray-100 transition duration-300 text-center"
        >
          View Progress
        </router-link>
      </div>
      
      <div v-else class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/game" 
          class="px-6 py-3 bg-white text-black font-medium rounded-lg border border-indigo-600 hover:bg-gray-100 transition duration-300 text-center"
        >
          Start Playing
        </router-link>
        
        <router-link 
          to="/auth" 
          class="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition duration-300 text-center"
        >
          Sign In / Register
        </router-link>
      </div>
      
      <div v-if="isAuthenticated" class="mt-6 text-center">
        <button 
          @click="handleLogout" 
          class="px-4 py-2 bg-white text-black font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition duration-300"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import soundService from '../services/soundService';
import { auth } from '../services/firebase';

const authStore = useAuthStore();
const router = useRouter();
const firebaseStatus = ref('Checking Firebase status...');
const errorMessage = ref('');

const isAuthenticated = computed(() => authStore.isAuthenticated);

async function handleLogout() {
  try {
    soundService.play('click');
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
    errorMessage.value = error instanceof Error ? error.message : 'Unknown error during logout';
  }
}

onMounted(() => {
  try {
    // Check if Firebase is initialized
    if (auth) {
      firebaseStatus.value = 'Firebase initialized successfully';
      
      // Verify we can access auth methods
      if (typeof auth.onAuthStateChanged === 'function') {
        console.log('Firebase auth methods are available');
      } else {
        firebaseStatus.value = 'Firebase auth API is not available';
      }
    } else {
      firebaseStatus.value = 'Firebase initialization failed';
    }
  } catch (err) {
    console.error('Error checking Firebase status:', err);
    firebaseStatus.value = 'Error checking Firebase status';
    errorMessage.value = err instanceof Error ? err.message : 'Unknown error';
  }
});
</script> 