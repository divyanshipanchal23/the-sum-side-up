<template>
  <div class="min-h-screen bg-gray-100 p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-indigo-600 mb-6">Balance Scale Addition Game</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div v-if="!gameStarted" class="text-center py-8">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Ready to Play?</h2>
          <p class="text-gray-600 mb-6">
            Add numbers on the left side to balance the target number on the right side!
          </p>
          <button 
            @click="startGame" 
            class="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Start Game
          </button>
        </div>
        
        <div v-else>
          <div class="game-header flex justify-between items-center mb-6">
            <div class="level-info">
              <span class="font-semibold text-gray-700">Level: </span>
              <span class="text-indigo-600 font-bold">{{ gameState.currentLevel }}</span>
            </div>
            <div class="score-info">
              <span class="font-semibold text-gray-700">Score: </span>
              <span class="text-indigo-600 font-bold">{{ gameState.successes }}/{{ gameState.attempts }}</span>
            </div>
          </div>
          
          <div class="game-instructions bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-blue-700">
              Add numbers on the left side to match the target value of <span class="font-bold">{{ gameState.targetNumber }}</span> on the right side.
            </p>
          </div>
          
          <!-- Balance Scale Component -->
          <BalanceScale 
            :leftValue="sum" 
            :rightValue="gameState.targetNumber" 
            :showFeedback="true"
            class="mb-8"
          >
            <template #right-content>
              {{ gameState.targetNumber }}
            </template>
            <template #left-content>
              {{ sum }}
            </template>
          </BalanceScale>
          
          <!-- Number Input Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="left-side">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Your Numbers:</h3>
              <div class="space-y-4">
                <div v-for="(addend, index) in gameState.addends" :key="index" class="flex items-center">
                  <NumberInput 
                    v-model="gameState.addends[index]"
                    :label="`Number ${index + 1}`"
                    :min="config.minValue"
                    :max="config.maxValue"
                    :showNumberButtons="true"
                    @update:modelValue="updateAddend(index, $event)"
                  />
                </div>
              </div>
              <div class="mt-6 py-3 border-t border-gray-200">
                <div class="flex justify-between items-center">
                  <span class="text-lg font-bold">Sum:</span>
                  <span class="text-xl font-bold" :class="{ 'text-green-500': isBalanced, 'text-red-500': !isBalanced }">
                    {{ sum }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="right-side">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Target:</h3>
              <div class="bg-indigo-100 rounded-lg p-6 flex items-center justify-center">
                <span class="text-4xl font-bold text-indigo-700">{{ gameState.targetNumber }}</span>
              </div>
              
              <div class="mt-6">
                <button 
                  @click="checkAnswer" 
                  class="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition duration-300"
                  :disabled="gameState.isComplete"
                >
                  {{ gameState.isComplete ? 'Correct! Click Next' : 'Check Answer' }}
                </button>
              </div>
              
              <div v-if="gameState.lastAttemptCorrect !== null" class="mt-4">
                <div v-if="gameState.lastAttemptCorrect" class="bg-green-100 border-l-4 border-green-500 p-4">
                  <p class="text-green-700">
                    Great job! The scale is balanced.
                  </p>
                </div>
                <div v-else class="bg-red-100 border-l-4 border-red-500 p-4">
                  <p class="text-red-700">
                    Not quite right. Try again!
                  </p>
                </div>
              </div>
              
              <div v-if="gameState.isComplete" class="mt-4">
                <button 
                  @click="nextProblem" 
                  class="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-300"
                >
                  Next Problem
                </button>
              </div>
            </div>
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
import { ref, computed, onMounted, watch } from 'vue';
import BalanceScale from '../components/BalanceScale.vue';
import NumberInput from '../components/NumberInput.vue';
import { useGameStore } from '../stores/gameStore';

const gameStore = useGameStore();
const { 
  config, 
  gameState, 
  sum: storeSum, 
  isBalanced, 
  startNewGame, 
  setAddend, 
  checkBalance,
  resetGame
} = gameStore;

// Create a local computed property to ensure reactivity
const sum = computed(() => {
  console.log('Computing sum in GameView', gameState.addends);
  return gameState.addends.reduce((a, b) => a + b, 0);
});

const gameStarted = ref(false);

// Watch for changes in the addends array
watch(() => gameState.addends, (newVal) => {
  console.log('Addends changed in GameView', newVal);
}, { deep: true });

function startGame() {
  gameStarted.value = true;
  resetGame();
}

function updateAddend(index: number, value: number) {
  console.log(`Updating addend ${index} to ${value}`);
  setAddend(index, value);
}

function checkAnswer() {
  checkBalance();
}

function nextProblem() {
  startNewGame();
}

onMounted(() => {
  // Initialize the game when the component mounts
  console.log('GameView mounted, initializing game');
  resetGame();
});
</script> 