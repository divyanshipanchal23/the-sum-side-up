<template>
  <div class="min-h-screen bg-background-soft p-4">
    <div class="max-w-6xl mx-auto">
      <h1 class="text-3xl font-bold text-primary mb-6">Balance Scale Addition Game</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div v-if="!gameStarted" class="text-center py-8">
          <!-- Add mascot to welcome screen -->
          <div class="flex justify-center mb-4">
            <BalancerBuddy 
              message="Welcome! Ready to balance some equations?" 
              expression="happy"
              @messageDismissed="handleMessageDismissed"
            />
          </div>
          
          <h2 class="text-2xl font-bold text-gray-800 mb-4">Ready to Play?</h2>
          <p class="text-gray-600 mb-6">
            Add numbers on the left side to balance the target number on the right side!
          </p>
          <button 
            @click="startGame" 
            class="px-6 py-3 bg-accent-yellow text-black font-medium rounded-lg border border-accent-yellow hover:bg-accent-yellow/80 transition duration-300"
          >
            Start Game
          </button>
        </div>
        
        <div v-else>
          <div class="game-header flex justify-between items-center mb-6">
            <div class="level-info">
              <span class="font-semibold text-gray-700">Level: </span>
              <span class="text-primary font-bold">{{ gameState.currentLevel }}</span>
            </div>
            
            <!-- Time Remaining (new) -->
            <div v-if="remainingTime !== null" class="time-info">
              <span class="font-semibold text-gray-700">Time: </span>
              <span class="text-primary font-bold" :class="{ 'text-accent-red': remainingTime < 5 }">
                {{ remainingTime }}s
              </span>
            </div>
            
            <!-- Sound Control Button -->
            <button 
              @click="toggleMute" 
              class="mx-4 p-2 rounded-full bg-background-secondary hover:bg-background-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              :title="isMuted ? 'Unmute sounds' : 'Mute sounds'"
              aria-label="Toggle sound"
            >
              <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
            
            <!-- Enhanced Scale Toggle -->
            <button 
              @click="toggleEnhancedScale" 
              class="mx-4 p-2 rounded-full bg-background-secondary hover:bg-background-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary"
              :title="useEnhancedScale ? 'Use Simple Scale' : 'Use Enhanced Scale'"
              aria-label="Toggle scale style"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" :class="useEnhancedScale ? 'text-primary' : 'text-gray-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </button>
            
            <div class="score-info">
              <span class="font-semibold text-gray-700">Score: </span>
              <span class="text-primary font-bold">{{ gameState.successes }}/{{ gameState.attempts }}</span>
            </div>
          </div>
          
          <div class="game-instructions bg-accent-purple/20 border-l-4 border-accent-purple p-4 mb-6 rounded-r">
            <p class="text-gray-700">
              Add numbers on the left side to match the target value of <span class="font-bold text-primary">{{ targetNumber }}</span> on the right side.
            </p>
          </div>
          
          <!-- Display game instructions based on game state -->
          <div class="instruction-text" v-if="gameState.status === 'playing'">
            <template v-if="!balanceWeightChecked">
              <div v-if="timeRanOut">
                <strong class="text-accent-red">Time's up! Enter the correct answer to move on to the next question.</strong>
              </div>
              <div v-else class="text-gray-700">
                What number needs to be added to the right side to make it equal to the left side?
              </div>
            </template>
            <template v-else>
              <div v-if="answerCorrect" class="text-secondary font-medium">
                Correct! Great job!
              </div>
              <div v-else class="text-accent-red font-medium">
                Not quite right. Try again!
              </div>
            </template>
          </div>
          
          <!-- Add a toggle button to switch between original and enhanced balance scale -->
          <div class="scale-toggle-container" style="margin-bottom: 10px; text-align: center;">
            <v-btn
              variant="outlined"
              color="primary"
              @click="toggleEnhancedScale"
              size="small"
              :prepend-icon="useEnhancedScale ? 'mdi-toggle-switch' : 'mdi-toggle-switch-off'"
            >
              {{ useEnhancedScale ? 'Using Enhanced Scale' : 'Using Basic Scale' }}
            </v-btn>
          </div>
          
          <!-- Balance Scale Component -->
          <BalanceScale 
            v-if="!useEnhancedScale"
            :leftValue="sum" 
            :rightValue="targetNumber" 
            :showFeedback="true"
            :key="`scale-${targetNumber}-${Date.now()}`"
            class="mb-8"
            ref="balanceScaleRef"
          >
            <template #right-content>
              {{ targetNumber }}
            </template>
            <template #left-content>
              {{ sum }}
            </template>
          </BalanceScale>
          
          <!-- Enhanced Balance Scale Component -->
          <EnhancedBalanceScale
            v-else
            :leftValue="sum"
            :rightValue="targetNumber"
            :showFeedback="true"
            :key="`enhanced-scale-${targetNumber}-${Date.now()}`"
            class="mb-8"
            ref="enhancedBalanceScaleRef"
          />
          
          <!-- Number Input Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="left-side p-4 rounded-lg bg-background-secondary">
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
                  <span class="text-xl font-bold" :class="{ 'text-secondary': isBalanced, 'text-accent-red': !isBalanced }">
                    {{ sum }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="right-side p-4 rounded-lg bg-background-secondary">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Target:</h3>
              <div class="bg-primary/10 rounded-lg p-6 flex items-center justify-center">
                <span class="text-4xl font-bold text-primary">{{ targetNumber }}</span>
              </div>
              
              <div class="mt-6">
                <button 
                  @click="checkAnswer" 
                  class="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition duration-300"
                  :disabled="gameState.isComplete"
                >
                  {{ gameState.isComplete ? 'Correct! Click Next' : 'Check Answer' }}
                </button>
              </div>
              
              <!-- Time-out specific message with mascot -->
              <div v-if="timeRanOut" class="mt-4 bg-accent-yellow/20 border-l-4 border-accent-yellow p-4 rounded-r relative">
                <div class="absolute -top-12 -left-8">
                  <BalancerBuddy 
                    message="Oh no! Time's up, but you can still solve this!" 
                    expression="surprised"
                    @messageDismissed="handleMessageDismissed"
                  />
                </div>
                <p class="text-gray-700 ml-16">
                  <strong>Time's up!</strong> Enter the correct answer to move on to the next question.
                </p>
              </div>
              
              <!-- Regular feedback messages with mascot (only show if not timed out) -->
              <div v-else-if="gameState.lastAttemptCorrect !== null" class="mt-4">
                <div v-if="gameState.lastAttemptCorrect" class="bg-secondary/20 border-l-4 border-secondary p-4 rounded-r relative">
                  <div class="absolute -top-12 -left-8">
                    <BalancerBuddy 
                      message="Amazing work! That's perfectly balanced!" 
                      expression="happy"
                      @messageDismissed="handleMessageDismissed"
                    />
                  </div>
                  <p class="text-gray-700 ml-16">
                    Great job! The scale is balanced.
                  </p>
                </div>
                <div v-else class="bg-accent-red/20 border-l-4 border-accent-red p-4 rounded-r relative">
                  <div class="absolute -top-12 -left-8">
                    <BalancerBuddy 
                      message="Almost there! Try a different combination." 
                      expression="thinking"
                      @messageDismissed="handleMessageDismissed"
                    />
                  </div>
                  <p class="text-gray-700 ml-16">
                    Not quite right. Try again!
                  </p>
                </div>
              </div>
              
              <div v-if="gameState.isComplete" class="mt-4">
                <button 
                  @click="nextProblem" 
                  class="w-full py-3 bg-secondary text-white font-medium rounded-lg hover:bg-secondary/90 transition duration-300"
                >
                  Next Problem
                </button>
              </div>
            </div>
          </div>
          
          <!-- Star Reward Overlay - show when problem is completed correctly -->
          <div 
            v-if="showStarReward && gameState.isComplete" 
            class="star-reward-overlay"
            @click="closeStarReward"
          >
            <div class="star-reward-content animate-scale-in">
              <StarReward 
                :stars="earnedStars" 
                :title="starRewardTitle" 
                :timeSpent="timeSpent"
                :showConfetti="earnedStars === 3"
              />
              <p class="text-sm text-center text-gray-500 mt-3 cursor-pointer">Click anywhere to close</p>
            </div>
          </div>
        </div>
        
        <div class="flex justify-center mt-6">
          <router-link to="/" class="px-4 py-2 bg-background-secondary text-primary rounded-lg border border-background-secondary hover:bg-background-secondary/80">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
import BalanceScale from '../components/BalanceScale.vue';
import EnhancedBalanceScale from '../components/EnhancedBalanceScale.vue';
import NumberInput from '../components/NumberInput.vue';
import BalancerBuddy from '../components/BalancerBuddy.vue';
import StarReward from '../components/StarReward.vue';
import { useGameStore } from '../stores/gameStore';
import soundService from '../services/soundService';
import progressService, { GameAttempt, UserProgress } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';
import { useRoute } from 'vue-router';
import configService from '../services/configService';

// Define constants
const FEEDBACK_DELAY = 1500; // 1.5 seconds delay for feedback

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

// Add variables for time limit functionality
const remainingTime = ref<number | null>(null);
const timerInterval = ref<number | null>(null);
const timeRanOut = ref(false);

// Create a local computed property to ensure reactivity
const sum = computed(() => {
  // Explicitly convert each addend to a number to avoid string concatenation
  return gameState.value.addends.reduce((acc, val) => Number(acc) + Number(val), 0);
});

// Flag to prevent watch reactions during initial component setup
let initializing = true;

// Watch for changes in the addends array
watch(() => gameState.value.addends, (newVal) => {
  // Skip if initializing
  if (initializing) return;
  
  console.log('Addends changed in GameView', newVal);
}, { deep: true });

// Watch the target number for debugging purposes
watch(() => targetNumber.value, (newVal, oldVal) => {
  // Skip if initializing
  if (initializing) return;
  
  console.log(`Target number changed: ${oldVal} -> ${newVal}`);
}, { immediate: true });

const gameStarted = ref(false);

// Add a reactive reference for the mute state
const isMuted = ref(soundService.getMuteState());

// Add variables for UI state regarding balance checking
const balanceWeightChecked = ref(false);
const answerCorrect = ref(false);

// Variables for star rewards
const showStarReward = ref(false);
const earnedStars = ref(0);
const starRewardTitle = ref('Great job!');

// Add a new variable to control which scale to use
const useEnhancedScale = ref(false);

// Refs for the balance scale components
const balanceScaleRef = ref<InstanceType<typeof BalanceScale> | null>(null);
const enhancedBalanceScaleRef = ref<InstanceType<typeof EnhancedBalanceScale> | null>(null);

onMounted(async () => {
  // Initialize the game when the component mounts to ensure a valid target number is set
  console.log('GameView mounted, initializing game state');
  
  // Variable to track if we're continuing a previous activity
  let userProgress: UserProgress | null = null;
  
  // Check if we have a specific configId
  if (configId.value && configId.value !== 'default') {
    try {
      console.log(`Loading configuration with ID: ${configId.value}`);
      // Load the configuration from Firestore
      const loadedConfig = await configService.getConfiguration(configId.value);
      
      // Apply the loaded configuration to the game store
      // Need to convert to the gameStore's config format
      gameStore.updateConfig({
        minValue: loadedConfig.minValue,
        maxValue: loadedConfig.maxValue,
        maxAddends: loadedConfig.numberOfAddends,
        targetRange: {
          min: loadedConfig.targetRange.min,
          max: loadedConfig.targetRange.max
        },
        timeLimit: loadedConfig.timeLimit || null,
        hintsEnabled: loadedConfig.hintsEnabled
      });
      
      console.log('Applied configuration:', loadedConfig);
      
      // Additionally, try to load user progress for this activity
      if (authStore.isAuthenticated) {
        try {
          console.log(`Attempting to load user progress for activity ${configId.value}...`);
          userProgress = await progressService.getUserProgressForActivity(configId.value);
          
          if (userProgress) {
            console.log('Found existing user progress:', userProgress);
            // We'll use this data when starting the game
          } else {
            console.log('No existing progress found, starting fresh');
          }
        } catch (progressError) {
          console.warn(`Could not load progress, will start fresh: ${progressError}`);
        }
      }
    } catch (error) {
      console.error(`Failed to load configuration with ID ${configId.value}:`, error);
      // Fall back to default configuration if loading fails
    }
  }
  
  // Initialize game
  if (userProgress) {
    // If we have progress data, start game with that data
    startGameWithProgress(userProgress);
  } else {
    // Otherwise just reset to a fresh game
    await gameStore.resetGame();
  }
  
  console.log('Initial target number set to:', targetNumber.value);
  
  // Make sure to clean up interval when component is unmounted
  onUnmounted(() => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
  });
  
  // Mark initialization as complete
  initializing = false;
});

// Function to start a game using existing progress data
async function startGameWithProgress(progress: UserProgress) {
  console.log('Starting game with existing progress:', progress);
  
  // Generate a new target but keep progress data
  const newTarget = gameStore.generateTargetNumber();
  
  // Create a state with the user's progress
  gameState.value = {
    addends: Array(config.value.maxAddends).fill(0),
    attempts: progress.attempts,
    successes: progress.successes,
    currentLevel: progress.currentLevel,
    isComplete: false,
    lastAttemptCorrect: null
  };
  
  // Wait for the next tick to ensure state is updated
  await nextTick();
  
  console.log(`Game initialized with user's progress - Level: ${gameState.value.currentLevel}, Attempts: ${gameState.value.attempts}, Successes: ${gameState.value.successes}`);
}

async function startGame() {
  console.log('Starting game, setting gameStarted to true');
  
  // Set gameStarted to true
  gameStarted.value = true;
  
  // Play start sound
  soundService.play('start');
  
  // Only reset level to 1 if this is a new game (without configId)
  // For continued games, we want to keep the level from the progress
  if (configId.value === 'default') {
    // First reset the game to initialize everything including target number
    console.log('Calling resetGame to initialize fresh game state');
    await gameStore.resetGame();
    
    // Explicitly ensure the level is set to 1 for new games
    if (gameState.value.currentLevel !== 1) {
      console.log(`Resetting level from ${gameState.value.currentLevel} to 1`);
      gameState.value.currentLevel = 1;
    }
  } else {
    // For continued games, just make sure we have a new target
    // but keep the current level, attempts, and successes
    if (!gameState.value.isComplete) {
      console.log('Generating new target for continued game');
      gameStore.generateTargetNumber();
    }
  }
  
  // Reset timeRanOut flag
  timeRanOut.value = false;
  
  // Start the countdown timer
  startCountdownTimer();
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
  // Stop the countdown timer when checking answer
  stopCountdownTimer();
  
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
  
  // Play sound based on result, but don't play if we already played a sound for timeout
  if (finalResult) {
    // Only play success sound if not recovering from a timeout
    if (!timeRanOut.value) {
      playSound('correct');
    }
  } else {
    // Only play incorrect sound if not a timeout scenario
    if (!timeRanOut.value) {
      playSound('incorrect');
    }
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
  
  // If the answer is correct, and we were in a timeout, move to the next problem
  if (finalResult && timeRanOut.value) {
    // Reset timeout flag before going to next problem
    timeRanOut.value = false;
    // Wait a short delay to show the success
    setTimeout(() => {
      nextProblem();
    }, 1000);
  }

  // If the answer is correct, calculate stars earned based on time and accuracy
  if (finalResult) {
    calculateStarReward(timeSpent.value);
  }
}

// Function to calculate star rewards based on performance
function calculateStarReward(time: number) {
  let stars = 0;
  
  // Base star for getting the correct answer
  stars = 1;
  
  // Add stars based on time spent (faster = more stars)
  // Time thresholds depend on the level
  const levelFactor = Math.min(gameState.value.currentLevel, 5); // Cap at level 5 for calculation
  const fastTime = 10 - (levelFactor * 0.5); // Faster time expected at higher levels
  const mediumTime = 20 - (levelFactor * 0.5);
  
  if (time <= fastTime) {
    stars += 2; // Very fast
  } else if (time <= mediumTime) {
    stars += 1; // Reasonably fast
  }
  
  // Cap at 3 stars maximum
  stars = Math.min(stars, 3);
  
  // Set the star reward data
  earnedStars.value = stars;
  
  // Set reward title based on stars
  if (stars === 3) {
    starRewardTitle.value = "Outstanding!";
  } else if (stars === 2) {
    starRewardTitle.value = "Well done!";
  } else {
    starRewardTitle.value = "Good job!";
  }
  
  // Show the star reward
  showStarReward.value = true;
  
  console.log(`Awarded ${stars} stars for completing in ${time.toFixed(1)} seconds`);
}

async function nextProblem() {
  // Hide star reward before moving to next problem
  showStarReward.value = false;
  
  // Reset timeout flag
  timeRanOut.value = false;
  
  // Explicitly check level-up conditions and call levelUp if needed
  // This ensures the level-up happens even if the checkBalance function didn't trigger it
  const successRateValue = (gameState.value.successes / gameState.value.attempts) * 100;
  console.log(`Level-up check - Attempts: ${gameState.value.attempts}, Successes: ${gameState.value.successes}, Rate: ${successRateValue}%`);
  if (successRateValue >= 80 && gameState.value.attempts >= 5) {
    console.log(`Level-up conditions met! Calling levelUp() explicitly`);
    // Call levelUp from gameStore directly with await to ensure it completes
    await gameStore.levelUp();
    playSound('levelUp');
  } else {
    playSound('click');
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
  
  // Start the countdown timer for the next problem
  startCountdownTimer();
  
  // Reset the appropriate balance scale component
  if (!useEnhancedScale.value && balanceScaleRef.value) {
    balanceScaleRef.value.resetScale();
  } else if (useEnhancedScale.value && enhancedBalanceScaleRef.value) {
    enhancedBalanceScaleRef.value.resetScale();
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

// Add function to start the countdown timer
function startCountdownTimer() {
  // Clear any existing timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  
  // Reset timer-related state
  timeRanOut.value = false;
  
  // Check if time limit is set
  if (config.value.timeLimit) {
    console.log(`Starting countdown timer with ${config.value.timeLimit} seconds`);
    remainingTime.value = config.value.timeLimit;
    
    // Create interval to update the timer every second
    timerInterval.value = window.setInterval(() => {
      if (remainingTime.value !== null && remainingTime.value > 0) {
        remainingTime.value--;
        
        // Play a tick sound when time is getting low (last 3 seconds)
        if (remainingTime.value <= 3 && remainingTime.value > 0) {
          playSound('tick');
        }
        
        // When time runs out, indicate timeout
        if (remainingTime.value === 0) {
          console.log('Time limit reached!');
          // Set the timeRanOut flag
          timeRanOut.value = true;
          // Play timeout sound
          playSound('incorrect');
          // Stop the timer
          clearInterval(timerInterval.value!);
          timerInterval.value = null;
        }
      }
    }, 1000);
  } else {
    // No time limit
    remainingTime.value = null;
  }
}

// Add function to stop the timer
function stopCountdownTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
}

// Add a more robust sound playing function
function playSound(sound: SoundType) {
  try {
    // Add retry logic for sound playing
    const maxRetries = 2;
    let retryCount = 0;
    
    const attemptPlay = () => {
      try {
        soundService.play(sound);
      } catch (error) {
        console.warn(`Error playing sound (attempt ${retryCount + 1}):`, error);
        if (retryCount < maxRetries) {
          retryCount++;
          // Try again after a short delay
          setTimeout(attemptPlay, 100);
        }
      }
    };
    
    // Start the first attempt
    attemptPlay();
  } catch (error) {
    // Fail silently, never break the game for sound issues
    console.error('Failed to play sound:', error);
  }
}

// Function to close the star reward overlay without moving to next problem
function closeStarReward() {
  // Hide star reward overlay
  showStarReward.value = false;
  // Play a click sound for feedback
  playSound('click');
  console.log('Star reward overlay closed, waiting for Next Problem button click');
}

function handleMessageDismissed() {
  // Implementation of handleMessageDismissed function
  console.log('Message dismissed event handled');
}

// Add function to toggle the enhanced scale
function toggleEnhancedScale() {
  useEnhancedScale.value = !useEnhancedScale.value;
  // Reset the appropriate balance scale component if we have a ref to it
  if (!useEnhancedScale.value && balanceScaleRef.value) {
    balanceScaleRef.value.resetScale();
  } else if (useEnhancedScale.value && enhancedBalanceScaleRef.value) {
    enhancedBalanceScaleRef.value.resetScale();
  }
  playSound('click');
}
</script>

<style scoped>
.star-reward-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  cursor: pointer;
}

.star-reward-content {
  max-width: 500px;
  width: 90%;
}

.animate-scale-in {
  animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}

@keyframes scale-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style> 