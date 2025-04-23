import { defineStore } from 'pinia';
import { ref, computed, watch, nextTick } from 'vue';

export interface GameConfig {
  minValue: number;
  maxValue: number;
  maxAddends: number;
  targetRange: {
    min: number;
    max: number;
  };
  timeLimit: number | null;
  hintsEnabled: boolean;
}

export interface GameState {
  targetNumber: number;
  addends: number[];
  attempts: number;
  successes: number;
  currentLevel: number;
  isComplete: boolean;
  lastAttemptCorrect: boolean | null;
}

export const useGameStore = defineStore('game', () => {
  // Default game configuration
  const config = ref<GameConfig>({
    minValue: 1,
    maxValue: 10,
    maxAddends: 2,
    targetRange: {
      min: 5,
      max: 15
    },
    timeLimit: null,
    hintsEnabled: true
  });

  // **TRUE SINGLE SOURCE OF TRUTH**
  // Use a single ref for the target number - nothing else should store this value
  const _targetNumber = ref<number>(0);
  
  // Generate a random target number within the configured range
  function generateTargetNumber(): number {
    const min = config.value.targetRange.min;
    const max = config.value.targetRange.max;
    const randomTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated new target number: ${randomTarget} (range: ${min}-${max})`);
    
    // Update our single source of truth
    _targetNumber.value = randomTarget;
    
    return randomTarget;
  }

  // Initialize with a valid target number
  const initialTarget = generateTargetNumber();
  
  // Game state - now the targetNumber is a COMPUTED property based on _targetNumber
  const gameState = ref<Omit<GameState, 'targetNumber'> & { _targetNumberPlaceholder?: number }>({
    _targetNumberPlaceholder: initialTarget, // Only here for initialization compatibility
    addends: Array(config.value.maxAddends).fill(0),
    attempts: 0,
    successes: 0,
    currentLevel: 1,
    isComplete: false,
    lastAttemptCorrect: null
  });

  // Create targetNumber as a computed property that reads from _targetNumber
  // This creates a one-way dependency, ensuring state.targetNumber always reflects _targetNumber
  const targetNumber = computed({
    get: () => _targetNumber.value,
    // No setter - must use setTargetNumber function instead
  });

  // Computed properties
  const sum = computed(() => {
    // Explicitly convert all addends to numbers
    const result = gameState.value.addends.reduce((acc, val) => Number(acc) + Number(val), 0);
    return result;
  });

  const isBalanced = computed(() => {
    // Ensure both values are converted to numbers explicitly
    const sumValue = Number(sum.value);
    const targetValue = Number(_targetNumber.value);
    
    // Use a small tolerance for potential floating-point precision issues
    const tolerance = 0.0001;
    const isEqual = Math.abs(sumValue - targetValue) <= tolerance;
    
    return isEqual;
  });

  const difference = computed(() => {
    return sum.value - _targetNumber.value;
  });

  const successRate = computed(() => {
    if (gameState.value.attempts === 0) return 0;
    return (gameState.value.successes / gameState.value.attempts) * 100;
  });

  // Action to set the target number (the ONLY way to update it)
  async function setTargetNumber(newTarget: number) {
    console.log(`Setting target number to: ${newTarget}`);
    _targetNumber.value = Number(newTarget);
    
    // Wait for the next tick to ensure Vue has processed the state change
    await nextTick();
    
    // Return the target for confirmation
    return _targetNumber.value;
  }

  // Actions
  async function startNewGame() {
    // Generate a new target number based on the current config
    const newTarget = generateTargetNumber();
    console.log(`Starting new game with target number: ${newTarget}`);
    
    // Reset the addends array based on the current config
    const newAddends = Array(config.value.maxAddends).fill(0);
    
    // Create a completely fresh state object for maximum reactivity
    // Note: We don't include targetNumber in this object since it's a computed property
    gameState.value = {
      addends: newAddends,
      attempts: gameState.value.attempts, // keep the attempts count
      successes: gameState.value.successes, // keep the successes count
      currentLevel: gameState.value.currentLevel, // keep the current level
      isComplete: false,
      lastAttemptCorrect: null
    };
    
    // Wait for the next tick to ensure synchronization
    await nextTick();
    
    // Log the start of a new game
    console.log(`Started new game with target: ${_targetNumber.value}`);
    
    // Return the target number for confirmation
    return _targetNumber.value;
  }

  function setAddend(index: number, value: number) {
    if (index >= 0 && index < gameState.value.addends.length) {
      // Ensure the value is stored as a number
      const numericValue = Number(value);
      
      // Create a new array to ensure reactivity
      const newAddends = [...gameState.value.addends];
      newAddends[index] = numericValue;
      
      // Important: Replace the entire array with the new one
      gameState.value.addends = newAddends;
    }
  }

  async function checkBalance() {
    // Get current values
    const currentTarget = _targetNumber.value;
    const currentSum = sum.value;
    
    // Calculate the balance result
    const isBalanceCorrect = isBalanced.value;
    
    // Update state atomically
    const newAttempts = gameState.value.attempts + 1;
    const newSuccesses = isBalanceCorrect ? gameState.value.successes + 1 : gameState.value.successes;
    const newIsComplete = isBalanceCorrect ? true : gameState.value.isComplete;
    const newLastAttemptCorrect = isBalanceCorrect;
    
    // Create a completely new state object to ensure reactivity
    gameState.value = {
      ...gameState.value,
      attempts: newAttempts,
      successes: newSuccesses,
      lastAttemptCorrect: newLastAttemptCorrect,
      isComplete: newIsComplete
    };
    
    // Wait for the next tick to ensure Vue has processed the state change
    await nextTick();
    
    // Handle successful balancing
    if (isBalanceCorrect) {
      // Calculate success rate explicitly
      const currentSuccessRate = (gameState.value.successes / gameState.value.attempts) * 100;
      
      // Check for level up conditions
      if (currentSuccessRate >= 80 && gameState.value.attempts >= 5) {
        await levelUp();
      }
    }
    
    return isBalanceCorrect;
  }

  async function levelUp() {
    console.log(`Leveling up from level ${gameState.value.currentLevel}...`);
    
    // Increment the level
    const newLevel = gameState.value.currentLevel + 1;
    
    // Adjust difficulty based on level
    let newMaxValue = config.value.maxValue;
    let newTargetRangeMax = config.value.targetRange.max;
    let newMaxAddends = config.value.maxAddends;
    
    if (newLevel % 3 === 0) {
      // Every third level, increase the maximum value
      newMaxValue += 5;
    }
    
    if (newLevel % 5 === 0) {
      // Every fifth level, increase the target range
      newTargetRangeMax += 10;
    }
    
    // Update config first
    config.value = {
      ...config.value,
      maxValue: newMaxValue,
      targetRange: {
        ...config.value.targetRange,
        max: newTargetRangeMax
      }
    };
    
    // Then update game state
    const newAddends = [...gameState.value.addends];
    
    if (newLevel % 10 === 0 && newMaxAddends < 5) {
      // Every tenth level, add another addend (up to 5)
      newMaxAddends++;
      config.value.maxAddends = newMaxAddends;
      newAddends.push(0);
    }
    
    // Update game state with new level and reset counters
    gameState.value = {
      ...gameState.value,
      addends: newAddends,
      currentLevel: newLevel,
      attempts: 0,
      successes: 0
    };
    
    // Wait for the next tick to ensure Vue has processed the state change
    await nextTick();
    
    // Return the new level
    return newLevel;
  }

  function updateConfig(newConfig: Partial<GameConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  async function resetGame() {
    // Generate a random target number
    const newTarget = generateTargetNumber();
    
    // Create a completely new state object to ensure reactivity
    gameState.value = {
      addends: Array(config.value.maxAddends).fill(0),
      attempts: 0,
      successes: 0,
      currentLevel: 1,
      isComplete: false,
      lastAttemptCorrect: null
    };
    
    // Wait for the next tick to ensure synchronization
    await nextTick();
    
    // Return the new target
    return newTarget;
  }

  return {
    config,
    gameState,
    targetNumber, // Expose the computed property, not the internal ref
    sum,
    isBalanced,
    difference,
    successRate,
    startNewGame,
    setAddend,
    checkBalance,
    levelUp,
    updateConfig,
    resetGame,
    setTargetNumber, // Expose the explicit setter function
    generateTargetNumber
  };
}); 