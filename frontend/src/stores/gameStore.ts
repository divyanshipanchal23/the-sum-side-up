import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

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

  // Internal target tracking to ensure consistency
  const _internalTarget = ref<number>(0);

  // Generate a random target number within the configured range
  function generateTargetNumber(): number {
    const min = config.value.targetRange.min;
    const max = config.value.targetRange.max;
    const randomTarget = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Generated new target number: ${randomTarget} (range: ${min}-${max})`);
    
    // Update the internal target
    _internalTarget.value = randomTarget;
    
    return randomTarget;
  }

  // Game state - initialize with a valid target number from the start
  const initialTarget = generateTargetNumber();
  const gameState = ref<GameState>({
    targetNumber: initialTarget,
    addends: [0, 0],
    attempts: 0,
    successes: 0,
    currentLevel: 1,
    isComplete: false,
    lastAttemptCorrect: null
  });

  // Watch for external changes to the target number and synchronize
  watch(() => gameState.value.targetNumber, (newTarget) => {
    console.log(`Target number was externally changed to: ${newTarget}, syncing internal state`);
    _internalTarget.value = newTarget;
  });

  // Computed properties
  const sum = computed(() => {
    console.log('Calculating sum in store:', gameState.value.addends);
    // Explicitly convert all addends to numbers
    const result = gameState.value.addends.reduce((acc, val) => Number(acc) + Number(val), 0);
    console.log(`Store sum calculation result: ${result} (type: ${typeof result})`);
    return result;
  });

  const isBalanced = computed(() => {
    // Ensure both values are converted to numbers explicitly
    const sumValue = Number(sum.value);
    
    // IMPORTANT: Use the internal target for consistency
    const targetValue = Number(_internalTarget.value);
    
    // Double check that the values are in sync
    if (targetValue !== Number(gameState.value.targetNumber)) {
      console.warn(`Target mismatch detected! UI: ${gameState.value.targetNumber}, Internal: ${_internalTarget.value}`);
      // Synchronize the values
      gameState.value.targetNumber = _internalTarget.value;
    }
    
    // Log the types and values for debugging
    console.log(`Checking balance - sum: ${sumValue} (${typeof sumValue}), target: ${targetValue} (${typeof targetValue})`);
    console.log(`Target number in gameState: ${gameState.value.targetNumber}, internal target: ${_internalTarget.value}`);
    
    // Use a small tolerance for potential floating-point precision issues
    const tolerance = 0.0001;
    const isEqual = Math.abs(sumValue - targetValue) <= tolerance;
    
    console.log(`Balance check result: ${isEqual} (with tolerance: ${tolerance})`);
    return isEqual;
  });

  const difference = computed(() => {
    return sum.value - gameState.value.targetNumber;
  });

  const successRate = computed(() => {
    if (gameState.value.attempts === 0) return 0;
    return (gameState.value.successes / gameState.value.attempts) * 100;
  });

  // Actions
  function startNewGame() {
    // Generate a new target number based on the current config
    const newTarget = generateTargetNumber();
    console.log(`Starting new game with target number: ${newTarget}`);
    
    // Create a new state object to ensure full reactivity
    gameState.value = {
      ...gameState.value,
      targetNumber: newTarget,
      addends: Array(config.value.maxAddends).fill(0),
      isComplete: false,
      lastAttemptCorrect: null
    };
    
    console.log('Started new game with target:', gameState.value.targetNumber, 'internal:', _internalTarget.value);
  }

  function setAddend(index: number, value: number) {
    if (index >= 0 && index < gameState.value.addends.length) {
      console.log(`Store: setting addend ${index} from ${gameState.value.addends[index]} to ${value}`);
      
      // Ensure the value is stored as a number
      const numericValue = Number(value);
      
      // Create a new array to ensure reactivity
      const newAddends = [...gameState.value.addends];
      newAddends[index] = numericValue;
      
      // Important: Replace the entire array with the new one
      gameState.value.addends = newAddends;
      
      console.log('Store: new addends array:', gameState.value.addends);
      console.log('Store: new sum:', sum.value);
    }
  }

  function checkBalance() {
    // Verify target number consistency before checking
    if (_internalTarget.value !== gameState.value.targetNumber) {
      console.warn(`Target number inconsistency detected during checkBalance!`);
      console.warn(`Internal: ${_internalTarget.value}, GameState: ${gameState.value.targetNumber}`);
      // Force synchronization
      gameState.value.targetNumber = _internalTarget.value;
    }
    
    // Get current target and sum values before checking
    const currentTarget = gameState.value.targetNumber;
    const currentSum = sum.value;
    
    console.log(`Checking balance with target=${currentTarget}, sum=${currentSum}, internal=${_internalTarget.value}`);
    
    // Calculate the balance result upfront to ensure consistency
    const isBalanceCorrect = isBalanced.value;
    console.log(`Is balanced check result (before state update): ${isBalanceCorrect}`);
    
    // Create a completely new state object to ensure reactivity
    const newAttempts = gameState.value.attempts + 1;
    const newSuccesses = isBalanceCorrect ? gameState.value.successes + 1 : gameState.value.successes;
    const newIsComplete = isBalanceCorrect ? true : gameState.value.isComplete;
    
    // Create a completely new state object to ensure reactivity
    gameState.value = {
      ...gameState.value,
      attempts: newAttempts,
      successes: newSuccesses,
      lastAttemptCorrect: isBalanceCorrect,
      isComplete: newIsComplete
    };
    
    // For debugging - log what was checked
    console.log(`Balance check result: ${gameState.value.lastAttemptCorrect} (target: ${gameState.value.targetNumber})`);
    console.log(`Updated state - attempts: ${gameState.value.attempts}, successes: ${gameState.value.successes}, isComplete: ${gameState.value.isComplete}`);
    
    // Handle successful balancing
    if (isBalanceCorrect) {
      console.log('Balance is correct! Game state updated with new object.');
      
      // Check for level up conditions
      if (successRate.value >= 80 && gameState.value.attempts >= 5) {
        levelUp();
      }
    }
    
    return isBalanceCorrect;
  }

  function levelUp() {
    gameState.value.currentLevel++;
    
    // Adjust difficulty based on level
    if (gameState.value.currentLevel % 3 === 0) {
      // Every third level, increase the maximum value
      config.value.maxValue += 5;
    }
    
    if (gameState.value.currentLevel % 5 === 0) {
      // Every fifth level, increase the target range
      config.value.targetRange.max += 10;
    }
    
    if (gameState.value.currentLevel % 10 === 0 && config.value.maxAddends < 5) {
      // Every tenth level, add another addend (up to 5)
      config.value.maxAddends++;
      gameState.value.addends.push(0);
    }
  }

  function updateConfig(newConfig: Partial<GameConfig>) {
    config.value = { ...config.value, ...newConfig };
  }

  function resetGame() {
    // Generate a random target number
    const newTarget = generateTargetNumber();
    
    console.log(`Store: Resetting game with new target number: ${newTarget}`);
    
    // Create a completely new state object to ensure reactivity
    gameState.value = {
      targetNumber: newTarget,
      addends: Array(config.value.maxAddends).fill(0),
      attempts: 0,
      successes: 0,
      currentLevel: 1,
      isComplete: false,
      lastAttemptCorrect: null
    };
    
    // Log state after reset
    console.log('Store: Game state after reset:', {
      targetNumber: gameState.value.targetNumber,
      internalTarget: _internalTarget.value,
      addends: gameState.value.addends,
      sum: sum.value
    });
  }

  function setTargetNumberDirectly(newTarget: number) {
    console.log(`Explicitly setting target number to: ${newTarget}`);
    _internalTarget.value = newTarget;
    gameState.value.targetNumber = newTarget;
  }

  return {
    config,
    gameState,
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
    generateTargetNumber,
    setTargetNumberDirectly
  };
}); 