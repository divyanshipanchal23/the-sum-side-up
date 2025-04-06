<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Balance Scale Addition Game</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p class="text-yellow-700">
            Game interface is under construction. Check back soon to play!
          </p>
        </div>
        
        <!-- Placeholder for the balance scale component -->
        <div class="h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-6">
          <p class="text-gray-600 text-lg">Balance Scale Component Will Appear Here</p>
        </div>
        
        <!-- Placeholder for number inputs -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-gray-200 rounded-lg p-4 h-24 flex items-center justify-center">
            <p class="text-gray-600">Left Side Inputs</p>
          </div>
          <div class="bg-gray-200 rounded-lg p-4 h-24 flex items-center justify-center">
            <p class="text-gray-600">Right Side Inputs</p>
          </div>
        </div>
        
        <div class="flex justify-center">
          <router-link to="/" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Game component logic will go here
</script> 