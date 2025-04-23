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
            :key="`scale-${targetNumber}-${Date.now()}`"
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

// Instead of destructuring the computed properties from the store
// Access them directly from the store instance to ensure reactivity
const config = computed(() => gameStore.config);
const gameState = computed(() => gameStore.gameState);
const targetNumber = computed(() => gameStore.targetNumber);
const storeSum = computed(() => gameStore.sum);
const isBalanced = computed(() => gameStore.isBalanced);

// Get the configuration ID from the route params if available
const configId = computed(() => route.query.configId as string || 'default');

// Add a timer to track time spent on each problem
const startTime = ref<Date | null>(null);
const timeSpent = ref(0);

// Create a local computed property to ensure reactivity
const sum = computed(() => {
  // Explicitly convert each addend to a number to avoid string concatenation
  return gameState.value.addends.reduce((acc, val) => Number(acc) + Number(val), 0);
});

// Watch for changes in the addends array
watch(() => gameState.value.addends, (newVal) => {
  console.log('Addends changed in GameView', newVal);
}, { deep: true });

// Watch the target number for debugging purposes
watch(() => targetNumber.value, (newVal, oldVal) => {
  console.log(`Target number changed: ${oldVal} -> ${newVal}`);
}, { immediate: true });

const gameStarted = ref(false);

// Add a reactive reference for the mute state
const isMuted = ref(soundService.getMuteState());

async function startGame() {
  console.log('Starting game, setting gameStarted to true');
  
  // Play start sound
  soundService.play('start');
  
  // First reset the game to initialize everything including target number
  console.log('Calling resetGame to initialize game state and set target number');
  await gameStore.resetGame();
  
  // Explicitly ensure the level is set to 1
  if (gameState.value.currentLevel !== 1) {
    console.log(`Resetting level from ${gameState.value.currentLevel} to 1`);
    gameState.value.currentLevel = 1;
  }
  
  // Log initial game state
  console.log('Initial game state:', {
    level: gameState.value.currentLevel,
    targetNumber: targetNumber.value,
    addends: gameState.value.addends,
    attempts: gameState.value.attempts,
    successes: gameState.value.successes
  });
  
  // Wait for the next tick to ensure state is updated
  await nextTick();
  
  // Then set gameStarted flag after initialization
  gameStarted.value = true;
  
  // Start the timer
  startTime.value = new Date();
  
  // Verify the target number after reset
  console.log('Game started with target number:', targetNumber.value);
}

function updateAddend(index: number, value: number) {
  console.log(`Updating addend ${index} from ${gameState.value.addends[index]} to ${value}`);
  gameStore.setAddend(index, value);
  
  // Log the resulting sum
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
  
  // Add explicit sum vs target comparison for extra reliability
  const sumValue = Number(sum.value);
  const targetValue = Number(targetNumber.value);
  const tolerance = 0.0001;
  const isManuallyCorrect = Math.abs(sumValue - targetValue) <= tolerance;
  
  console.log(`Manual balance check: sum=${sumValue}, target=${targetValue}, isEqual=${isManuallyCorrect}`);
  
  // Call checkBalance and explicitly handle the return value
  const isCorrect = await gameStore.checkBalance();
  
  // Use either method to determine correctness - prioritize the direct comparison
  const finalResult = isManuallyCorrect || isCorrect;
  
  console.log(`Balance check results - direct: ${isManuallyCorrect}, store: ${isCorrect}, final: ${finalResult}`);
  
  // Play sound based on result
  if (finalResult) {
    soundService.play('correct');
  } else {
    soundService.play('incorrect');
    // Ensure the lastAttemptCorrect is set to false for incorrect answers
    gameState.value.lastAttemptCorrect = false;
  }
  
  // If we need to force the game state to reflect the correct result
  if (finalResult && !isCorrect) {
    console.log("Manual override: Setting game state to correct answer");
    gameState.value.lastAttemptCorrect = true;
    gameState.value.isComplete = true;
  }
  
  // Record the attempt if user is authenticated
  if (authStore.isAuthenticated) {
    try {
      const userId = authStore.user?.uid;
      
      // Only record if we have a valid user ID
      if (userId) {
        const attempt: GameAttempt = {
          userId,
          activityId: configId.value,
          timestamp: new Date(),
          target: targetNumber.value,
          inputs: [...gameState.value.addends],
          success: finalResult,
          timeSpent: timeSpent.value,
          level: gameState.value.currentLevel
        };
        
        console.log(`Sending attempt with data:`, attempt);
        await progressService.recordAttempt(attempt);
        console.log('Game attempt recorded successfully');
      }
    } catch (error) {
      console.error('Failed to record attempt:', error);
    }
  }
  
  // Update the game state with a fresh reference to ensure reactivity
  console.log('After check - Current game state:', {
    result: gameState.value.lastAttemptCorrect,
    isComplete: gameState.value.isComplete,
    attempts: gameState.value.attempts,
    successes: gameState.value.successes,
    target: targetNumber.value
  });
}

async function nextProblem() {
  // Explicitly check level-up conditions and call levelUp if needed
  // This ensures the level-up happens even if the checkBalance function didn't trigger it
  const successRateValue = (gameState.value.successes / gameState.value.attempts) * 100;
  console.log(`Level-up check - Attempts: ${gameState.value.attempts}, Successes: ${gameState.value.successes}, Rate: ${successRateValue}%`);
  if (successRateValue >= 80 && gameState.value.attempts >= 5) {
    console.log(`Level-up conditions met! Calling levelUp() explicitly`);
    // Call levelUp from gameStore directly with await to ensure it completes
    await gameStore.levelUp();
    soundService.play('levelUp');
  } else {
    soundService.play('click');
  }
  
  // Important: Reset isComplete and lastAttemptCorrect before starting a new game
  gameState.value.isComplete = false;
  gameState.value.lastAttemptCorrect = null;
  
  console.log('Starting new game...');
  
  // Start a new game with fresh state and get the new target
  // Use await to ensure it completes
  await gameStore.startNewGame();
  
  // Reset the timer for the next problem
  startTime.value = new Date();
  timeSpent.value = 0;
  
  // Explicit reset of addends to ensure they're all 0
  // Create a completely fresh addends array
  const maxAddends = config.value.maxAddends;
  const freshAddends = Array(maxAddends).fill(0);
  
  // Update the game state with these fresh addends
  gameState.value.addends = freshAddends;
  
  console.log('Explicitly reset addends to:', gameState.value.addends);
  console.log('New problem started with target:', targetNumber.value);
  
  // Print the current level after potentially leveling up
  console.log(`Current level after nextProblem: ${gameState.value.currentLevel}`);
  
  // Wait for the next tick to ensure state is refreshed before continuing
  await nextTick();
  
  // Reset the BalanceScale component if we have a ref to it
  const balanceScaleRef = ref<InstanceType<typeof BalanceScale> | null>(null);
  if (balanceScaleRef.value) {
    balanceScaleRef.value.resetScale();
  }
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

onMounted(async () => {
  // Initialize the game when the component mounts to ensure a valid target number is set
  console.log('GameView mounted, initializing game state');
  
  // Reset the game to get a fresh start
  await gameStore.resetGame();
  
  console.log('Initial target number set to:', targetNumber.value);
});
</script> 