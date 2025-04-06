<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
    <div class="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="flex">
        <button 
          class="flex-1 py-3 text-center font-medium transition-colors"
          :class="isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
          @click="isLogin = true"
        >
          Login
        </button>
        <button 
          class="flex-1 py-3 text-center font-medium transition-colors"
          :class="!isLogin ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'"
          @click="isLogin = false"
        >
          Register
        </button>
      </div>
      
      <div class="p-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ isLogin ? 'Sign In' : 'Create Account' }}</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-1">Email</label>
            <input 
              type="email" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              v-model="email"
              required
            />
          </div>
          
          <div>
            <label class="block text-gray-700 text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              v-model="password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            class="w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition duration-300"
          >
            {{ isLogin ? 'Sign In' : 'Create Account' }}
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-800">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const isLogin = ref(true);
const email = ref('');
const password = ref('');

const handleSubmit = () => {
  // This will be implemented when we integrate Firebase authentication
  console.log('Form submitted:', { 
    type: isLogin.value ? 'login' : 'register',
    email: email.value,
    password: password.value 
  });
};
</script> 