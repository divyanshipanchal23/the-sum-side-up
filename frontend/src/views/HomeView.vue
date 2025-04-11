<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100">
    <div class="w-full max-w-4xl p-8 bg-white rounded-lg shadow-lg">
      <h1 class="text-4xl font-bold text-center text-indigo-600 mb-6">Balance Scale Addition Game</h1>
      <p class="text-lg text-gray-700 mb-8 text-center">
        Learn addition through visual intuition and interactive balance scales!
      </p>
      
      <div v-if="isAuthenticated" class="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <router-link 
          to="/game" 
          class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 text-center"
        >
          Start Playing
        </router-link>
        
        <router-link 
          to="/config" 
          class="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300 text-center"
        >
          Configure Games
        </router-link>
        
        <router-link 
          to="/progress" 
          class="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition duration-300 text-center"
        >
          View Progress
        </router-link>
      </div>
      
      <div v-else class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link 
          to="/game" 
          class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300 text-center"
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
          class="text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
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
import { computed } from 'vue';
import soundService from '../services/soundService';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

async function handleLogout() {
  soundService.play('click');
  try {
    await authStore.logout();
    router.push('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
</script> 