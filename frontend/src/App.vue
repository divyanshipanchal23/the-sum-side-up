<script setup lang="ts">
import { onMounted } from 'vue';
import resourceService from './services/resourceService';

// Preload game resources when the app is mounted
onMounted(() => {
  // Preload game resources in the background
  resourceService.preloadGameResources().then(() => {
    console.log('All game resources preloaded');
  }).catch(error => {
    console.warn('Failed to preload some resources:', error);
  });
});
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles can be added here */
</style>
