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
            
            <!-- Sound Control Button -->
            <button 
              @click="toggleMute" 
              class="mx-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              :title="isMuted ? 'Unmute sounds' : 'Mute sounds'"
              aria-label="Toggle sound"
            >
              <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            
            <div class="score-info">
              <span class="font-semibold text-gray-700">Score: </span>
              <span class="text-indigo-600 font-bold">{{ gameState.successes }}/{{ gameState.attempts }}</span>
            </div>
          </div>
          
          <div class="game-instructions bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <p class="text-blue-700">
              Add numbers on the left side to match the target value of <span class="font-bold">{{ targetNumber }}</span> on the right side.
            </p>
          </div>
          
          <!-- Balance Scale Component -->
          <BalanceScale 
            :leftValue="sum" 
            :rightValue="targetNumber" 
            :showFeedback="true"
            class="mb-8"
          >
            <template #right-content>
              {{ targetNumber }}
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
                <span class="text-4xl font-bold text-indigo-700">{{ targetNumber }}</span>
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
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import BalanceScale from '../components/BalanceScale.vue';
import NumberInput from '../components/NumberInput.vue';
import { useGameStore } from '../stores/gameStore';
import soundService from '../services/soundService';
import progressService, { GameAttempt } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';
import { useRoute } from 'vue-router';

const gameStore = useGameStore();
const authStore = useAuthStore();
const route = useRoute();

const { 
  config, 
  gameState, 
  sum: storeSum, 
  isBalanced, 
  startNewGame, 
  setAddend, 
  checkBalance,
  resetGame,
  setTargetNumberDirectly
} = gameStore;

// Get the configuration ID from the route params if available
const configId = computed(() => route.query.configId as string || 'default');

// Add a timer to track time spent on each problem
const startTime = ref<Date | null>(null);
const timeSpent = ref(0);

// Create a local computed property to ensure reactivity
const sum = computed(() => {
  console.log('Computing sum in GameView', gameState.addends);
  // Explicitly convert each addend to a number to avoid string concatenation
  return gameState.addends.reduce((acc, val) => Number(acc) + Number(val), 0);
});

// Create a local computed property for the target number to ensure reactivity
const targetNumber = computed(() => {
  console.log('Getting target number in GameView:', gameState.targetNumber);
  return gameState.targetNumber;
});

const gameStarted = ref(false);

// Add a reactive reference for the mute state
const isMuted = ref(soundService.getMuteState());

// Watch for changes in the game state target number
watch(() => gameState.targetNumber, (newVal, oldVal) => {
  console.log(`Target number changed in GameView: ${oldVal} -> ${newVal}`);
}, { immediate: true });

// Watch for changes in the addends array
watch(() => gameState.addends, (newVal) => {
  console.log('Addends changed in GameView', newVal);
}, { deep: true });

async function startGame() {
  console.log('Starting game, setting gameStarted to true');
  
  // Play start sound
  soundService.play('start');
  
  // First reset the game to initialize everything including target number
  console.log('Calling resetGame to initialize game state and set target number');
  resetGame();
  
  // Wait for the next tick to ensure state is updated
  await nextTick();
  
  // Then set gameStarted flag after initialization
  gameStarted.value = true;
  
  // Start the timer
  startTime.value = new Date();
  
  // Verify the target number after reset
  console.log('Game started with target number:', gameState.targetNumber);
}

function updateAddend(index: number, value: number) {
  console.log(`Updating addend ${index} from ${gameState.addends[index]} to ${value} (types: ${typeof gameState.addends[index]} -> ${typeof value})`);
  setAddend(index, value);
  
  // Log the resulting sum and check if it matches the target number
  setTimeout(() => {
    console.log(`After update - Sum: ${sum.value}, Target: ${targetNumber.value}, isBalanced: ${isBalanced.value}`);
  }, 0);
}

async function checkAnswer() {
  console.log(`Checking answer - Current sum: ${sum.value}, Target: ${targetNumber.value}`);
  
  // Calculate time spent
  const endTime = new Date();
  if (startTime.value) {
    timeSpent.value = (endTime.getTime() - startTime.value.getTime()) / 1000; // Convert to seconds
  }
  
  // Ensure target number is synchronized before checking
  // This is crucial for consistent checking
  setTargetNumberDirectly(targetNumber.value);
  
  // Wait for the next tick to ensure state synchronization
  await nextTick();
  
  // Call checkBalance and explicitly handle the return value
  const isCorrect = checkBalance();
  
  // Play sound based on result
  if (isCorrect) {
    soundService.play('correct');
  } else {
    soundService.play('incorrect');
  }
  
  // Record the attempt if user is authenticated
  if (authStore.isAuthenticated) {
    try {
      // Create attempt record
      const attempt: GameAttempt = {
        userId: authStore.userId,
        activityId: configId.value,
        timestamp: new Date(),
        target: targetNumber.value,
        inputs: [...gameState.addends], // Make a copy of the addends array
        success: isCorrect,
        timeSpent: timeSpent.value
      };
      
      // Record the attempt
      await progressService.recordAttempt(attempt);
      console.log('Game attempt recorded successfully');
    } catch (error) {
      console.error('Failed to record game attempt:', error);
    }
  }
  
  // Wait for the next tick to ensure the UI state is updated
  await nextTick();
  
  // Log the state after checking
  console.log('After check - Current game state:', {
    result: gameState.lastAttemptCorrect,
    target: targetNumber.value,
    isComplete: gameState.isComplete,
    attempts: gameState.attempts,
    successes: gameState.successes
  });
  
  // Check local values vs game state to ensure synchronization
  console.log(`Local vs Store - sum: ${sum.value}, target: ${targetNumber.value}, gameStateTarget: ${gameState.targetNumber}`);
  
  // Force a complete state refresh if needed by creating a new reference
  if (isCorrect && gameState.lastAttemptCorrect !== true) {
    console.log("Forcing complete state refresh for correct answer");
    
    // Create a new state object with all properties to force reactivity
    const updatedState = {
      ...gameState,
      lastAttemptCorrect: true,
      isComplete: true
    };
    
    // Update the state with the new object
    Object.assign(gameState, updatedState);
  }
}

async function nextProblem() {
  // Play level up sound if advancing to next level
  if ((gameState.successes / gameState.attempts) >= 0.8 && gameState.attempts >= 5) {
    soundService.play('levelUp');
  } else {
    soundService.play('click');
  }
  
  startNewGame();
  
  // Reset the timer for the next problem
  startTime.value = new Date();
  timeSpent.value = 0;
  
  // Wait for the next tick to ensure state synchronization
  await nextTick();
  
  console.log('New problem started with target number:', gameState.targetNumber);
}

// Function to toggle mute
function toggleMute() {
  const newMuteState = soundService.toggleMute();
  isMuted.value = newMuteState;
  // Play a click sound if we're unmuting
  if (!isMuted.value) {
    soundService.play('click');
  }
}

onMounted(() => {
  // Initialize the game when the component mounts to ensure a valid target number is set
  console.log('GameView mounted, initializing game state');
  
  // Generate an initial random target number
  const min = config.targetRange.min;
  const max = config.targetRange.max;
  const randomTarget = Math.floor(Math.random() * (max - min + 1)) + min;
  
  console.log(`Setting initial random target from range ${min}-${max}: ${randomTarget}`);
  
  // Set the initial target number using the synchronized method
  setTargetNumberDirectly(randomTarget);
  
  console.log('Initial target number set to:', gameState.targetNumber);
});
</script> 