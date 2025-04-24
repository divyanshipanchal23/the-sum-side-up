<script setup lang="ts">
import { onMounted, ref } from 'vue';
import resourceService from './services/resourceService';

const hasError = ref(false);
const errorMessage = ref('');

// Error handler to display errors instead of blank screen
const handleErrors = (err: unknown) => {
  console.error('App error:', err);
  hasError.value = true;
  errorMessage.value = err instanceof Error ? err.message : String(err);
};

// Preload game resources when the app is mounted
onMounted(() => {
  try {
    // Preload game resources in the background
    resourceService.preloadGameResources()
      .then(() => {
        console.log('All game resources preloaded');
      })
      .catch(error => {
        console.warn('Failed to preload some resources:', error);
        // Don't fail the whole app for resource loading errors
      });
  } catch (err) {
    // Only log the error, don't fail the whole app
    console.error('Error in resource preloading:', err);
  }
});
</script>

<template>
  <!-- Error boundary -->
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <h1>Something went wrong</h1>
      <p>{{ errorMessage }}</p>
      <button @click="window.location.reload()">Reload Page</button>
    </div>
  </div>
  <router-view v-else />
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
}

/* Error boundary styling */
.error-boundary {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
}

.error-container {
  max-width: 500px;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-container h1 {
  color: #dc3545;
  margin-bottom: 20px;
}

.error-container button {
  margin-top: 20px;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-container button:hover {
  background-color: #0069d9;
}
</style>
