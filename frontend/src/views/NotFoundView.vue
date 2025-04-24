<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
      <h1 class="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p class="text-gray-600 mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <router-link 
        to="/" 
        class="inline-block px-6 py-3 bg-white text-black font-medium rounded-lg border border-indigo-600 hover:bg-gray-100 transition duration-300"
      >
        Return to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import soundService from '../services/soundService';

onMounted(() => {
  // Play error sound when page loads
  soundService.play('incorrect');
});
</script> 