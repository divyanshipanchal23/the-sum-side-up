<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Game Configuration</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p class="text-yellow-700">
            Configuration interface is under construction. This page will allow educators to customize game parameters.
          </p>
        </div>
        
        <!-- Placeholder for configuration controls -->
        <div class="space-y-6">
          <div class="bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
            <p class="text-gray-600 text-lg">Difficulty Settings Will Appear Here</p>
          </div>
          
          <div class="bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
            <p class="text-gray-600 text-lg">Number Range Configuration Will Appear Here</p>
          </div>
          
          <div class="bg-gray-200 rounded-lg p-4 h-32 flex items-center justify-center">
            <p class="text-gray-600 text-lg">Game Options Will Appear Here</p>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <router-link to="/" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Configuration component logic will go here
</script> 