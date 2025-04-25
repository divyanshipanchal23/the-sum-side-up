<template>
  <div class="game-container-bg">
    <!-- Animated background elements -->
    <div class="floating-elements">
      <div v-for="n in 12" :key="`element-${n}`" 
           class="floating-element" 
           :class="`element-${n}`"
           :style="getRandomStyle()">
        {{ getRandomMathSymbol() }}
      </div>
    </div>
    
    <div class="max-w-6xl mx-auto w-full p-4">
      <h1 class="game-title">The Sum Side Up</h1>
      
      <div class="content-card">
        <div v-if="!gameStarted" class="welcome-screen">
          <!-- Add mascot to welcome screen with proper spacing -->
          <div class="mascot-container">
            <EnhancedMascot
              message="Welcome! Ready to balance some equations?" 
              state="celebrating"
              animation="bounce"
              position="top-center-right"
              @messageDismissed="handleMessageDismissed"
            />
          </div>
          
          <h2 class="welcome-heading">Ready to Play?</h2>
          <p class="welcome-text">
            Add numbers on the left side to balance the target number on the right side!
          </p>
          <button 
            @click="startGame" 
            class="start-button"
          >
            Start Game
          </button>
          
          <div class="back-link-container">
            <router-link to="/" class="back-link">
              Back to Home
            </router-link>
          </div>
        </div>
        
        <div v-else class="game-interface">
          <!-- Level and sound control - Updated with more attractive styles -->
          <div class="header-controls flex justify-between items-center mb-2">
            <div class="level-badge">
              <span class="level-label">Level</span>
              <span class="level-number">{{ gameState.currentLevel }}</span>
            </div>
            
            <div class="controls-right flex items-center space-x-2">
              <button 
                @click="toggleMute"
                class="sound-button"
                :title="isMuted ? 'Unmute sounds' : 'Mute sounds'"
                aria-label="Toggle sound"
              >
                <span v-if="isMuted" class="sound-icon">🔇</span>
                <span v-else class="sound-icon">🔊</span>
              </button>
              
              <!-- Time Remaining (new) -->
              <div v-if="remainingTime !== null" class="time-badge">
                <span class="time-label">Time</span>
                <span class="time-number" :class="{ 'hurry-up': remainingTime < 5 }">
                  {{ remainingTime }}s
                </span>
              </div>
            </div>
            
            <div class="score-badge">
              <span class="score-label">Score</span>
              <span class="score-number">{{ gameState.successes }}/{{ gameState.attempts }}</span>
            </div>
          </div>
          
          <div class="game-instructions bg-accent-purple/20 border-l-4 border-accent-purple p-1 mb-3 rounded-r text-sm">
            <p class="text-gray-700">
              Add numbers on the left side to match the magic number <span class="font-bold text-primary">{{ targetNumber }}</span> on the right side!
            </p>
          </div>
          
          <!-- Compact Balance Scale Container -->
          <div class="balance-scale-wrapper">
            <!-- Enhanced Balance Scale Component -->
            <EnhancedBalanceScale
              :leftValue="sum"
              :rightValue="targetNumber"
              :showFeedback="true"
              :key="`enhanced-scale-${targetNumber}-${Date.now()}`"
              class="compact-scale"
              ref="enhancedBalanceScaleRef"
            />
          </div>
          
          <!-- Number Input and Target Section - More compact -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <!-- Enhanced Number Input -->
            <div class="left-side">
              <EnhancedNumberInput
                :initialNumbers="gameState.addends"
                :minValue="config.minValue"
                :maxValue="config.maxValue"
                :maxNumbers="config.maxAddends"
                :targetValue="targetNumber"
                @update:numbers="updateAddends"
                @check-answer="checkAnswer"
              />
            </div>
            
            <div class="right-side p-2 rounded-lg bg-background-secondary">
              <h3 class="text-sm font-semibold text-gray-800 mb-1">Target:</h3>
              <div class="bg-primary/10 rounded-lg p-3 flex items-center justify-center">
                <span class="text-2xl font-bold text-primary">{{ targetNumber }}</span>
              </div>
              
              <div class="mt-2 relative">
                <!-- Removing the mascot that appears on target match to avoid duplication -->
                
                <button 
                  @click="checkAnswer" 
                  class="w-full py-1.5 font-medium rounded-lg transition duration-300 text-xs"
                  :class="{ 
                    'bg-primary text-white hover:bg-primary/90': !(sum === targetNumber && !gameState.isComplete), 
                    'bg-secondary text-white hover:bg-secondary/90 animate-pulse': sum === targetNumber && !gameState.isComplete,
                    'cursor-not-allowed opacity-70': gameState.isComplete
                  }"
                  :disabled="gameState.isComplete"
                >
                  {{ gameState.isComplete ? 'Hooray! Click Next' : 'Check Answer' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Next Problem Button at the Bottom for Space Efficiency -->
          <div v-if="gameState.isComplete" class="text-center">
            <button 
              @click="nextProblem" 
              class="next-button"
            >
              Next
            </button>
          </div>

          <!-- Update the feedback mascot to show hint about matching sum -->
          <div class="feedback-mascot-container">
            <EnhancedMascot
              :message="sum === targetNumber && !gameState.isComplete && !timeRanOut && gameState.lastAttemptCorrect === null ? 'Click Check Answer!' : mascotFeedback.message"
              :state="sum === targetNumber && !gameState.isComplete && !timeRanOut && gameState.lastAttemptCorrect === null ? 'hint' : mascotFeedback.state"
              :animation="sum === targetNumber && !gameState.isComplete && !timeRanOut && gameState.lastAttemptCorrect === null ? 'bounce' : mascotFeedback.animation"
              position="bottom-right"
              @messageDismissed="handleMessageDismissed"
            />
          </div>

          <!-- Star Reward Overlay -->
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
        
        <div v-if="gameStarted" class="flex justify-center mt-3">
          <router-link to="/" class="back-link">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
// Keep both simple and enhanced component imports for backward compatibility
// though we now only render the enhanced versions in the UI
import BalanceScale from '../components/BalanceScale.vue';
import EnhancedBalanceScale from '../components/EnhancedBalanceScale.vue';
import NumberInput from '../components/NumberInput.vue';
import EnhancedNumberInput from '../components/EnhancedNumberInput.vue';
import EnhancedMascot from '../components/EnhancedMascot.vue';
import StarReward from '../components/StarReward.vue';
import { useGameStore } from '../stores/gameStore';
import soundService from '../services/soundService';
import progressService, { GameAttempt, UserProgress } from '../services/progressService';
import { useAuthStore } from '../stores/authStore';
import { useRoute } from 'vue-router';
import configService from '../services/configService';

// Define constants
const FEEDBACK_DELAY = 1500; // 1.5 seconds delay for feedback

// Random style generator for floating elements
const getRandomStyle = () => {
  const size = Math.floor(Math.random() * 30) + 20; // 20-50px
  const top = Math.floor(Math.random() * 80) + 10; // 10-90%
  const left = Math.floor(Math.random() * 80) + 10; // 10-90%
  const animationDuration = Math.floor(Math.random() * 20) + 10; // 10-30s
  const delay = Math.floor(Math.random() * 10); // 0-10s
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    top: `${top}%`,
    left: `${left}%`,
    animationDuration: `${animationDuration}s`,
    animationDelay: `${delay}s`
  };
};

// Random math symbol generator
const getRandomMathSymbol = () => {
  const symbols = ['+', '=', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  return symbols[Math.floor(Math.random() * symbols.length)];
};

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
const useEnhancedScale = ref(true);

// Add a new variable to control which input style to use
const useEnhancedInput = ref(true);

// Refs for the balance scale components
const balanceScaleRef = ref<InstanceType<typeof BalanceScale> | null>(null);
const enhancedBalanceScaleRef = ref<InstanceType<typeof EnhancedBalanceScale> | null>(null);

// Add reactive data for mascot feedback
const mascotFeedback = ref({
  message: '',
  state: 'idle',
  animation: ''
});

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
  
  // Create a state with the user's progress - explicitly use 0s for addends
  gameState.value = {
    addends: Array(config.value.maxAddends).fill(0), // Always explicitly fill with 0
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

// Function to update a single addend - kept for backward compatibility
function updateAddend(index: number, value: number) {
  console.log(`Using simplified updateAddend that calls updateAddends`);
  // Create a new array with the updated value
  const updatedAddends = [...gameState.value.addends];
  updatedAddends[index] = value;
  // Call the more general updateAddends function
  updateAddends(updatedAddends);
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
      
      // Show success mascot feedback
      mascotFeedback.value = {
        message: getRandomSuccessMessage(),
        state: 'happy',
        animation: 'bounce'
      };
    }
  } else {
    // Only play incorrect sound if not a timeout scenario
    if (!timeRanOut.value) {
      playSound('incorrect');
      
      // Show incorrect mascot feedback
      mascotFeedback.value = {
        message: getRandomIncorrectMessage(sumValue, targetValue),
        state: 'thinking',
        animation: ''
      };
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
    // Delay star reward to allow mascot to show feedback first
    setTimeout(() => {
      calculateStarReward(timeSpent.value);
    }, 1500); // 1.5 seconds delay
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
  const freshAddends = Array(maxAddends).fill(0); // Ensure we use 0, not default values
  
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
  
  // Reset the balance scale component
  if (enhancedBalanceScaleRef.value) {
    enhancedBalanceScaleRef.value.resetScale();
  }

  // Clear mascot feedback
  mascotFeedback.value = {
    message: '',
    state: 'idle',
    animation: ''
  };
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
  
  // Clear mascot feedback when star reward is closed
  mascotFeedback.value = {
    message: '',
    state: 'idle',
    animation: ''
  };
  
  // Play a click sound for feedback
  playSound('click');
  console.log('Star reward overlay closed, waiting for Next Problem button click');
}

function handleMessageDismissed() {
  // Implementation of handleMessageDismissed function
  console.log('Message dismissed event handled');
}

// Add function to toggle the enhanced scale - kept for backward compatibility
function toggleEnhancedScale() {
  // No longer toggles, always uses enhanced scale
  console.log('Enhanced scale toggle requested, but now we always use the enhanced scale');
  playSound('click');
}

// Add function to toggle the enhanced input - kept for backward compatibility
function toggleEnhancedInput() {
  // No longer toggles, always uses enhanced input
  console.log('Enhanced input toggle requested, but now we always use the enhanced input');
  playSound('click');
}

// Add a function to update all addends at once (for EnhancedNumberInput)
function updateAddends(newAddends: number[]) {
  console.log('Updating addends with:', newAddends);
  
  // Make sure we don't exceed the maximum number of addends
  if (newAddends.length <= config.value.maxAddends) {
    try {
      // Create a new array with the correct size to match newAddends
      const updatedAddends = [...newAddends];
      
      // Update the gameState.addends directly with the new array
      gameState.value.addends = updatedAddends;
      
      // Explicitly update gameStore to ensure everything is in sync
      updatedAddends.forEach((value, index) => {
        gameStore.setAddend(index, value);
      });
      
      console.log('Updated gameState.addends:', gameState.value.addends);
    } catch (error) {
      console.error('Error updating addends:', error);
    }
  } else {
    console.warn('Tried to add too many addends. Max allowed:', config.value.maxAddends);
  }
}

// Helper functions to generate random feedback messages
function getRandomSuccessMessage() {
  const messages = [
    "Woohoo! That's right!",
    "Amazing job! Perfect balance!",
    "You're a math wizard!",
    "Super duper job! The numbers match!",
    "Fantastic! You found the right numbers!",
    "Awesome! Let's see your stars!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomIncorrectMessage(actual: number, target: number) {
  const diff = actual - target;
  
  if (diff > 0) {
    const messages = [
      `Oops! Your number ${actual} is bigger than ${target}.`,
      `Try again! Your answer is a bit too big.`,
      `The left side is too heavy! Try smaller numbers.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  } else {
    const messages = [
      `Almost there! Your number ${actual} is smaller than ${target}.`,
      `Try again! Your answer is a bit too small.`,
      `The right side is heavier! Try bigger numbers.`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }
}
</script>

<style scoped>
/* Game container with background */
.game-container-bg {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg, #F0EBFF 0%, #E6F7FF 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Floating background elements */
.floating-elements {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-weight: bold;
  color: white;
  animation: float linear infinite;
  opacity: 0.6;
}

.element-1, .element-5, .element-9 { background-color: #4A90E2; }
.element-2, .element-6, .element-10 { background-color: #FFD166; }
.element-3, .element-7, .element-11 { background-color: #06D6A0; }
.element-4, .element-8, .element-12 { background-color: #EF476F; }

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
  }
}

/* Game title */
.game-title {
  font-size: 2rem;
  font-weight: bold;
  color: #4A90E2;
  margin: 0 0 1rem 0;
  text-align: center;
  background: linear-gradient(90deg, #4A90E2, #9370DB);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: title-bounce 2s ease-in-out infinite alternate;
}

@keyframes title-bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-5px); }
}

/* Main content card */
.content-card {
  background-color: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 8px rgba(0, 0, 0, 0.05);
  padding: 30px;
  position: relative;
  z-index: 2;
}

/* Welcome screen styles */
.welcome-screen {
  text-align: center;
  position: relative;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mascot-container {
  position: relative;
  margin: 0 auto 40px;
  height: 180px;
  width: 400px;
}

.welcome-heading {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.welcome-text {
  color: #666;
  margin-bottom: 24px;
  max-width: 600px;
  line-height: 1.5;
}

.start-button {
  padding: 12px 30px;
  background-color: #FFD166;
  color: #333;
  font-weight: bold;
  border-radius: 12px;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.start-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 0 rgba(0, 0, 0, 0.1);
  background-color: #FFBE33;
}

.start-button:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.1);
}

.start-button::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  20% { left: 100%; }
  100% { left: 100%; }
}

.back-link-container {
  margin-top: 30px;
}

.back-link {
  display: inline-block;
  padding: 10px 20px;
  background-color: #4A90E2;
  color: white;
  border: 1px solid #4A90E2;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s;
  text-decoration: none;
}

.back-link:hover {
  background-color: #3A80D2;
  color: white;
}

/* Game interface styles - keep original styles with some adjustments */
.game-interface {
  /* Keep your existing game container styles */
}

.game-container {
  max-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Center the card in the viewport */
.min-h-screen {
  min-height: 100vh;
}

.balance-scale-wrapper {
  flex-shrink: 1;
  overflow: visible; /* Changed from hidden to ensure visibility */
  margin-bottom: 0.5rem; /* Reduced from 1.5rem to close the gap */
  margin-top: 1rem; /* Added to create more space above */
  padding: 1.5rem 0; /* Added vertical padding to ensure space for tilt */
  min-height: 200px; /* Added minimum height to reserve space */
  position: relative; /* Ensure proper stacking context */
}

/* Scale the balance scales to fit the viewport */
:deep(.compact-scale) {
  transform-origin: center center;
  transform: scale(1); /* Changed from 0.85 to 1 since we've made components smaller */
  margin-top: 0; /* Adjusted from -10px */
  margin-bottom: 0; /* Adjusted from -10px */
}

:deep(.scale-base) {
  height: 180px !important; /* Matching new height in BalanceScale.vue */
}

:deep(.balance-scale-container) {
  height: 180px !important; /* Matching new height in EnhancedBalanceScale.vue */
}

/* Make the enhanced number input more compact */
:deep(.number-controls) {
  padding: 0.75rem !important;
}

:deep(.controls-title) {
  margin-bottom: 0.5rem !important;
}

:deep(.number-item) {
  gap: 0.25rem !important;
}

:deep(.number-input-container) {
  margin-bottom: 0.5rem !important;
}

/* For smaller screens - further optimize space */
@media (max-width: 768px) {
  :deep(.compact-scale) {
    transform: scale(0.9); /* Adjusted from 0.75 */
    margin-top: -15px;
    margin-bottom: -15px;
  }
  
  :deep(.number-controls) {
    padding: 0.75rem !important;
  }
  
  :deep(.balance-scale-container) {
    height: 180px !important; /* Keeping consistent */
  }
  
  :deep(.scale-base) {
    height: 180px !important; /* Keeping consistent */
  }
  
  .mascot-container {
    height: 150px;
  }
  
  .game-title {
    font-size: 1.75rem;
  }
  
  .welcome-heading {
    font-size: 1.5rem;
  }
}

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

/* Feedback mascot positioning */
.feedback-mascot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 60; /* Increase z-index to be above other elements but below the star overlay */
  transition: all 0.3s ease;
}

/* When mascot has a message, make it more prominent */
.feedback-mascot-container:has(.speech-bubble) {
  transform: scale(1.1);
  filter: drop-shadow(0 0 10px rgba(74, 144, 226, 0.3));
}

@media (max-width: 768px) {
  .feedback-mascot-container {
    bottom: 10px;
    right: 10px;
    transform: scale(0.8);
    transform-origin: bottom right;
  }
  
  /* Adjust scale for mobile when message is showing */
  .feedback-mascot-container:has(.speech-bubble) {
    transform: scale(0.9);
  }
}

/* Next button styling to match Back to Home */
.next-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #9370DB;
  color: white;
  border: 1px solid #9370DB;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: medium;
  transition: all 0.2s;
  cursor: pointer;
}

.next-button:hover {
  background-color: #7A5DC7;
}

/* Add these new styles for the badges */
.level-badge, .score-badge, .time-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 4px 12px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  border: 2px solid;
  min-width: 80px;
}

.level-badge {
  border-color: #4A90E2;
  animation: float-gentle 3s ease-in-out infinite alternate;
}

.score-badge {
  border-color: #9370DB;
  animation: float-gentle 3s ease-in-out infinite alternate;
}

.time-badge {
  border-color: #06D6A0;
  animation: float-gentle 3s ease-in-out infinite alternate;
}

.level-label, .score-label, .time-label {
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 2px;
}

.level-number, .score-number, .time-number {
  font-size: 1.1rem;
  font-weight: bold;
}

.level-number {
  color: #4A90E2;
}

.score-number {
  color: #9370DB;
}

.time-number {
  color: #06D6A0;
}

.time-number.hurry-up {
  color: #EF476F;
  animation: pulse 1s infinite;
}

.sound-button {
  background-color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #FFD166;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sound-icon {
  font-size: 20px;
  line-height: 1;
}

.sound-button:hover {
  transform: scale(1.1);
  background-color: #FFD166;
}

@keyframes float-gentle {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
</style> 